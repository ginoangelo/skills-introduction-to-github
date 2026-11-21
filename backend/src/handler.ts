// Aimed decode service. Runs as an AWS Lambda behind a function URL.
// Nothing about a post is stored: the screenshot goes to the model once and the result goes back to the phone.
import Anthropic from "@anthropic-ai/sdk";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { decodeScreenshot, SAMPLE_RESULT } from "./decode.js";
import { revenueCatProCheck, type ProCheck } from "./entitlements.js";
import { DynamoLimiter, MemoryLimiter, recordFlag, type Limiter } from "./limits.js";

const FREE_DAILY_CAP = Number(process.env.FREE_DAILY_CAP || 2);
const PRO_DAILY_CAP = Number(process.env.PRO_DAILY_CAP || 30);
// Backstop for free decodes from one network. Kept generous because campuses and phone carriers share addresses.
const IP_DAILY_CAP = Number(process.env.IP_DAILY_CAP || 100);
const MAX_IMAGE_CHARS = 6_000_000; // about 4.5 MB of image after base64
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const FLAG_REASONS = ["wrong", "offensive", "biased", "other"] as const;
const VERDICTS = ["Likely", "Possibly", "Unlikely", "Not enough to tell", "Not read"] as const;
const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let limiter: Limiter = process.env.TABLE_NAME ? new DynamoLimiter(process.env.TABLE_NAME) : new MemoryLimiter();
let client: Anthropic | null = null;
let sampleOverride: boolean | null = null;
let proCheck: ProCheck = revenueCatProCheck;

/** Test hook: swap the limiter, the Pro check, or force sample mode. */
export function __setForTests(opts: { limiter?: Limiter; sample?: boolean; proCheck?: ProCheck }) {
  if (opts.limiter) limiter = opts.limiter;
  if (opts.proCheck) proCheck = opts.proCheck;
  if (opts.sample !== undefined) sampleOverride = opts.sample;
}

function sampleMode(): boolean {
  if (sampleOverride !== null) return sampleOverride;
  return process.env.SAMPLE_MODE === "1" || (!process.env.ANTHROPIC_API_KEY && !process.env.SECRET_ID);
}

async function getClient(): Promise<Anthropic> {
  if (client) return client;
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && process.env.SECRET_ID) {
    const out = await new SecretsManagerClient({}).send(new GetSecretValueCommand({ SecretId: process.env.SECRET_ID }));
    apiKey = out.SecretString?.trim();
  }
  if (!apiKey || apiKey === "REPLACE_ME") throw new Error("missing_key");
  client = new Anthropic({ apiKey, timeout: 80_000, maxRetries: 1 });
  return client;
}

export interface HttpResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function json(statusCode: number, body: unknown): HttpResult {
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}

export async function handler(event: LambdaFunctionURLEvent): Promise<HttpResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath.replace(/\/+$/, "") || "/";

  if (method === "GET" && path === "/health") return json(200, { ok: true, mode: sampleMode() ? "sample" : "live" });
  if (method !== "POST" || (path !== "/decode" && path !== "/flag")) return json(404, { error: "Not found." });

  const device = event.headers?.["x-aimed-device"] ?? "";
  if (!DEVICE_RE.test(device)) return json(400, { error: "Update Aimed to the latest version and try again." });

  if (path === "/flag") return flag(event);

  let body: { image?: unknown; mediaType?: unknown; context?: unknown };
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body ?? "";
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "The request couldn't be read. Try again." });
  }
  const { image, mediaType } = body;
  if (typeof image !== "string" || image.length < 100) return json(400, { error: "Missing screenshot." });
  if (image.length > MAX_IMAGE_CHARS) return json(413, { error: "That screenshot is too large. Try a smaller one." });
  if (!MEDIA_TYPES.includes(mediaType as (typeof MEDIA_TYPES)[number])) return json(400, { error: "Screenshot must be a JPEG, PNG, WebP, or GIF." });
  const context = typeof body.context === "string" ? body.context.trim().slice(0, 280) : "";

  const ip = event.requestContext.http.sourceIp || "unknown";
  const pro = await proCheck(device);
  if (!pro && !(await limiter.take(`ip#${ip}`, IP_DAILY_CAP))) {
    return json(429, { error: "Too many decodes from this network today. Try again tomorrow.", code: "network_limit" });
  }
  if (!(await limiter.take(`device#${device}`, pro ? PRO_DAILY_CAP : FREE_DAILY_CAP))) {
    return pro
      ? json(429, { error: `You've used all ${PRO_DAILY_CAP} of today's Pro decodes. They reset tomorrow.`, code: "pro_limit" })
      : json(429, { error: `You've used your ${FREE_DAILY_CAP} free decodes for today. Come back tomorrow or go Pro for more.`, code: "free_limit" });
  }

  if (sampleMode()) return json(200, { mode: "sample", result: SAMPLE_RESULT });

  const started = Date.now();
  try {
    const result = await decodeScreenshot(await getClient(), { image, mediaType: mediaType as (typeof MEDIA_TYPES)[number], context });
    // Log only what's needed to run the service. Never the screenshot, context, or read.
    console.log(JSON.stringify({ event: "decode", ok: true, ms: Date.now() - started, refused: result.refused, legibility: result.legibility }));
    return json(200, { mode: "live", result });
  } catch (err) {
    const name = err instanceof Error ? err.message : "unknown";
    console.error(JSON.stringify({ event: "decode", ok: false, ms: Date.now() - started, error: err instanceof Anthropic.APIError ? `api_${err.status}` : name }));
    if (name === "missing_key") return json(503, { error: "Aimed isn't fully set up yet. Try again later." });
    if (err instanceof Anthropic.RateLimitError) return json(503, { error: "Aimed is busy right now. Try again in a minute." });
    if (err instanceof Anthropic.APIError) return json(502, { error: "Aimed couldn't read that one. Try again." });
    return json(500, { error: "Something went wrong decoding that screenshot. Try again." });
  }
}

/** A person flags a read as wrong, offensive, or biased. Only the reason and verdict are counted. */
async function flag(event: LambdaFunctionURLEvent): Promise<HttpResult> {
  let body: { reason?: unknown; verdict?: unknown };
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body ?? "");
  } catch {
    return json(400, { error: "The request couldn't be read." });
  }
  const reason = FLAG_REASONS.find((r) => r === body.reason);
  const verdict = VERDICTS.find((v) => v === body.verdict) ?? "Not read";
  if (!reason) return json(400, { error: "Pick a reason." });
  const ip = event.requestContext.http.sourceIp || "unknown";
  if (!(await limiter.take(`flagip#${ip}`, 100))) return json(429, { error: "Too many reports today." });
  try {
    await recordFlag(process.env.TABLE_NAME, reason, verdict.replace(/ /g, "_"));
  } catch (err) {
    console.error(JSON.stringify({ event: "flag", ok: false, error: err instanceof Error ? err.name : "unknown" }));
    return json(500, { error: "Couldn't send that report. Try again." });
  }
  console.log(JSON.stringify({ event: "flag", ok: true, reason }));
  return json(200, { ok: true });
}
