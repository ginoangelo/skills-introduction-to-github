import { test } from "node:test";
import assert from "node:assert/strict";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { handler, __setForTests } from "../src/handler.js";
import { MemoryLimiter } from "../src/limits.js";

const DEVICE = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";
const IMAGE = "A".repeat(200);

function event(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): LambdaFunctionURLEvent {
  return {
    rawPath: path,
    headers: { "x-subtext-device": DEVICE, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    isBase64Encoded: false,
    requestContext: { http: { method, sourceIp: "203.0.113.7" } },
  } as unknown as LambdaFunctionURLEvent;
}

test("health reports sample mode", async () => {
  __setForTests({ sample: true, limiter: new MemoryLimiter() });
  const out = await handler(event("GET", "/health"));
  assert.equal(out.statusCode, 200);
  assert.equal(JSON.parse(out.body).mode, "sample");
});

test("rejects a missing device id", async () => {
  const out = await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/jpeg" }, { "x-subtext-device": "nope" }));
  assert.equal(out.statusCode, 400);
});

test("rejects a bad media type and a missing image", async () => {
  assert.equal((await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/bmp" }))).statusCode, 400);
  assert.equal((await handler(event("POST", "/decode", { mediaType: "image/jpeg" }))).statusCode, 400);
});

test("returns a result card and enforces the free daily cap", async () => {
  __setForTests({ sample: true, limiter: new MemoryLimiter() });
  for (let i = 0; i < 2; i++) {
    const out = await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/jpeg", context: "we argued" }));
    assert.equal(out.statusCode, 200);
    const body = JSON.parse(out.body);
    assert.equal(typeof body.result.meaning, "string");
    assert.ok(["Likely", "Possibly", "Unlikely", "Not enough to tell"].includes(body.result.aimed_at_you.verdict));
  }
  const fourth = await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/jpeg" }));
  assert.equal(fourth.statusCode, 429);
  assert.match(JSON.parse(fourth.body).error, /free decodes/);
});

test("unknown routes are 404", async () => {
  assert.equal((await handler(event("GET", "/nope"))).statusCode, 404);
});

test("flags a read with a reason and rejects an unknown reason", async () => {
  __setForTests({ limiter: new MemoryLimiter() });
  assert.equal((await handler(event("POST", "/flag", { reason: "biased", verdict: "Likely" }))).statusCode, 200);
  assert.equal((await handler(event("POST", "/flag", { reason: "spam" }))).statusCode, 400);
});
