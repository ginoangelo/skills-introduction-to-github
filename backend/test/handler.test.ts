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
    headers: { "x-aimed-device": DEVICE, ...headers },
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
  const out = await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/jpeg" }, { "x-aimed-device": "nope" }));
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
  assert.equal(JSON.parse(fourth.body).code, "free_limit");
});

test("unknown routes are 404", async () => {
  assert.equal((await handler(event("GET", "/nope"))).statusCode, 404);
});

test("flags a read with a reason and rejects an unknown reason", async () => {
  __setForTests({ limiter: new MemoryLimiter() });
  assert.equal((await handler(event("POST", "/flag", { reason: "biased", verdict: "Likely" }))).statusCode, 200);
  assert.equal((await handler(event("POST", "/flag", { reason: "spam" }))).statusCode, 400);
});

test("Pro installs get the Pro daily cap", async () => {
  __setForTests({ sample: true, limiter: new MemoryLimiter(), proCheck: async () => true });
  for (let i = 0; i < 30; i++) {
    assert.equal((await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/jpeg" }))).statusCode, 200);
  }
  const over = await handler(event("POST", "/decode", { image: IMAGE, mediaType: "image/jpeg" }));
  assert.equal(over.statusCode, 429);
  assert.equal(JSON.parse(over.body).code, "pro_limit");
  __setForTests({ proCheck: async () => false });
});

const READ = { literal: "A story that says 'some people only miss you when they need something'.", meaning: "A pointed post about one person.", verdict: "Possibly", reason: "Aimed at someone, unclear who.", context: "we argued", tone: "warm" };

test("What now returns three options in order and allows one free a day", async () => {
  __setForTests({ sample: true, limiter: new MemoryLimiter(), proCheck: async () => false });
  const out = await handler(event("POST", "/whatnow", READ));
  assert.equal(out.statusCode, 200);
  const { result } = JSON.parse(out.body);
  assert.deepEqual(result.options.map((o: { kind: string }) => o.kind), ["let_it_go", "check_in", "talk_it_through"]);
  assert.equal(result.options[0].message, "");
  assert.ok(result.options[1].message.length > 0);
  const second = await handler(event("POST", "/whatnow", READ));
  assert.equal(second.statusCode, 429);
  assert.equal(JSON.parse(second.body).code, "whatnow_free_limit");
});

test("What now leads with let it go when the read is Unlikely, and Pro gets more", async () => {
  __setForTests({ sample: true, limiter: new MemoryLimiter(), proCheck: async () => true });
  for (let i = 0; i < 3; i++) {
    const out = await handler(event("POST", "/whatnow", { ...READ, verdict: "Unlikely", tone: "light" }));
    assert.equal(out.statusCode, 200);
    assert.equal(JSON.parse(out.body).result.recommended, "let_it_go");
  }
  __setForTests({ proCheck: async () => false });
});

test("What now rejects refused reads and empty reads", async () => {
  __setForTests({ sample: true, limiter: new MemoryLimiter() });
  assert.equal((await handler(event("POST", "/whatnow", { ...READ, verdict: "Not read" }))).statusCode, 400);
  assert.equal((await handler(event("POST", "/whatnow", { ...READ, literal: "", meaning: "" }))).statusCode, 400);
});

test("What now keeps exactly one option of each kind", async () => {
  const { normalizeWhatNow } = await import("../src/whatnow.js");
  const r = normalizeWhatNow({
    refused: false, refusal_reason: "", headline: "h", recommended: "check_in",
    options: [{ kind: "check_in", title: "", why: "w", message: "m" }, { kind: "let_it_go", title: "Go", why: "", message: "should be dropped" }],
  });
  assert.deepEqual(r.options.map((o) => o.kind), ["let_it_go", "check_in", "talk_it_through"]);
  assert.equal(r.options[0].message, "");
  assert.equal(r.options[1].title, "Check in privately");
});
