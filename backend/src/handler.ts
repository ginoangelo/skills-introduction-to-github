// Aimed decode service. Runs as an AWS Lambda behind a function URL.
// Nothing about a post is stored: the screenshot goes to the model once and the result goes back to the phone.
import Anthropic from "@anthropic-ai/sdk";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { decodeScreenshot, SAMPLE_RESULT } from "./decode.js";
import { revenueCatProCheck, type ProCheck } from "./entitlements.js";
import { DynamoLimiter, MemoryLimiter, recordFlag, type Limiter } from "./limits.js";
import { cleanEmail, DynamoWaitlist, MemoryWaitlist, type WaitlistStore } from "./waitlist.js";
import { sampleWhatNow, TONES, whatNow, type Tone, type WhatNowInput } from "./whatnow.js";

const FREE_DAILY_CAP = Number(process.env.FREE_DAILY_CAP || 2);
const PRO_DAILY_CAP = Number(process.env.PRO_DAILY_CAP || 30);
// Backstop for free decodes from one network. Kept generous because campuses and phone carriers share addresses.
const IP_DAILY_CAP = Number(process.env.IP_DAILY_CAP || 100);
// "What now?" suggestions. Free gets one a day; Pro's cap is a fair-use backstop, shown in the app as unlimited.
const WHATNOW_FREE_CAP = Number(process.env.WHATNOW_FREE_CAP || 1);
const WHATNOW_PRO_CAP = Number(process.env.WHATNOW_PRO_CAP || 100);
const MAX_IMAGE_CHARS = 6_000_000; // about 4.5 MB of image after base64
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const FLAG_REASONS = ["wrong", "offensive", "biased", "other"] as const;
const VERDICTS = ["Likely", "Possibly", "Unlikely", "Not enough to tell", "Not read"] as const;
const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let limiter: Limiter = process.env.TABLE_NAME ? new DynamoLimiter(process.env.TABLE_NAME) : new MemoryLimiter();
let waitlist: WaitlistStore = process.env.WAITLIST_TABLE ? new DynamoWaitlist(process.env.WAITLIST_TABLE) : new MemoryWaitlist();
let client: Anthropic | null = null;
let sampleOverride: boolean | null = null;
let proCheck: ProCheck = revenueCatProCheck;

/** Test hook: swap the limiter, the Pro check, or force sample mode. */
export function __setForTests(opts: { limiter?: Limiter; sample?: boolean; proCheck?: ProCheck; waitlist?: WaitlistStore }) {
  if (opts.limiter) limiter = opts.limiter;
  if (opts.waitlist) waitlist = opts.waitlist;
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
  // The landing page reaches this function through CloudFront at /api/..., the app calls it directly.
  const path = event.rawPath.replace(/\/+$/, "").replace(/^\/api(?=\/)/, "") || "/";

  if (method === "GET" && path === "/health") return json(200, { ok: true, mode: sampleMode() ? "sample" : "live" });
  if (method === "POST" && path === "/waitlist") return joinWaitlist(event);
  if (method !== "POST" || (path !== "/decode" && path !== "/flag" && path !== "/whatnow")) return json(404, { error: "Not found." });

  const device = event.headers?.["x-aimed-device"] ?? "";
  if (!DEVICE_RE.test(device)) return json(400, { error: "Update Aimed to the latest version and try again." });

  if (path === "/flag") return flag(event);
  if (path === "/whatnow") return whatNowRoute(event, device);

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

/** The visitor's address. Behind CloudFront, sourceIp is CloudFront's, so use the header CloudFront sets. */
function viewerIp(event: LambdaFunctionURLEvent): string {
  const viewer = event.headers?.["cloudfront-viewer-address"];
  if (viewer) return viewer.slice(0, viewer.lastIndexOf(":")) || viewer;
  return event.requestContext.http.sourceIp || "unknown";
}

/** Landing page signup. Answers the same way whether or not the email was already on the list. */
async function joinWaitlist(event: LambdaFunctionURLEvent): Promise<HttpResult> {
  let body: { email?: unknown; source?: unknown; website?: unknown };
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body ?? "");
  } catch {
    return json(400, { error: "Something went wrong. Try again." });
  }
  // Hidden field that people never see. Bots fill it in; pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) return json(200, { ok: true });
  const email = cleanEmail(body.email);
  if (!email) return json(400, { error: "That email doesn't look right. Check it and try again." });
  const source = typeof body.source === "string" ? body.source.replace(/[^\w.-]/g, "").slice(0, 40) : "";
  if (!(await limiter.take(`wlip#${viewerIp(event)}`, 20))) return json(429, { error: "Too many signups from this network today. Try again tomorrow." });
  try {
    const added = await waitlist.add(email, source);
    console.log(JSON.stringify({ event: "waitlist", ok: true, added }));
    return json(200, { ok: true });
  } catch (err) {
    console.error(JSON.stringify({ event: "waitlist", ok: false, error: err instanceof Error ? err.name : "unknown" }));
    return json(500, { error: "Couldn't add you just now. Try again in a minute." });
  }
}

function clip(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** "What now?": three calm next steps for a read. Gets the read's text only, never the screenshot. */
async function whatNowRoute(event: LambdaFunctionURLEvent, device: string): Promise<HttpResult> {
  let body: { literal?: unknown; meaning?: unknown; verdict?: unknown; reason?: unknown; context?: unknown; tone?: unknown };
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body ?? "");
  } catch {
    return json(400, { error: "The request couldn't be read. Try again." });
  }
  const verdict = VERDICTS.find((v) => v === body.verdict && v !== "Not read");
  if (!verdict) return json(400, { error: "This read can't get suggestions." });
  const input: WhatNowInput = {
    literal: clip(body.literal, 1200),
    meaning: clip(body.meaning, 1200),
    verdict: verdict as WhatNowInput["verdict"],
    reason: clip(body.reason, 600),
    context: clip(body.context, 280),
    tone: (TONES.find((t) => t === body.tone) ?? "warm") as Tone,
  };
  if (!input.literal && !input.meaning) return json(400, { error: "This read can't get suggestions." });

  const ip = event.requestContext.http.sourceIp || "unknown";
  const pro = await proCheck(device);
  if (!pro && !(await limiter.take(`wnip#${ip}`, IP_DAILY_CAP))) {
    return json(429, { error: "Too many requests from this network today. Try again tomorrow.", code: "network_limit" });
  }
  if (!(await limiter.take(`whatnow#${device}`, pro ? WHATNOW_PRO_CAP : WHATNOW_FREE_CAP))) {
    return pro
      ? json(429, { error: "You've hit today's fair-use limit for suggestions. It resets tomorrow.", code: "whatnow_pro_limit" })
      : json(429, { error: `You've used today's free \u201cWhat now?\u201d Go Pro for unlimited next steps.`, code: "whatnow_free_limit" });
  }

  if (sampleMode()) return json(200, { mode: "sample", result: sampleWhatNow(input.verdict, input.tone) });

  const started = Date.now();
  try {
    const result = await whatNow(await getClient(), input);
    console.log(JSON.stringify({ event: "whatnow", ok: true, ms: Date.now() - started, refused: result.refused }));
    return json(200, { mode: "live", result });
  } catch (err) {
    const name = err instanceof Error ? err.message : "unknown";
    console.error(JSON.stringify({ event: "whatnow", ok: false, ms: Date.now() - started, error: err instanceof Anthropic.APIError ? `api_${err.status}` : name }));
    if (name === "missing_key") return json(503, { error: "Aimed isn't fully set up yet. Try again later." });
    if (err instanceof Anthropic.RateLimitError) return json(503, { error: "Aimed is busy right now. Try again in a minute." });
    return json(502, { error: "Couldn't get suggestions. Try again." });
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
