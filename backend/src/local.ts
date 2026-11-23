// Run the decode service on your computer: npm run local
// Without ANTHROPIC_API_KEY it answers with a labeled sample read, so the app can be tried end to end.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { handler } from "./handler.js";

const PORT = Number(process.env.PORT || 8787);
// The landing page is served at / so you can try the signup form locally.
const LANDING = join(process.cwd(), "..", "landing");
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-aimed-device", "Access-Control-Allow-Methods": "GET, POST" };
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors).end();
    return;
  }
  const reqPath = new URL(req.url ?? "/", "http://localhost").pathname;
  if (req.method === "GET" && reqPath !== "/health" && !reqPath.startsWith("/api/")) {
    const file = normalize(join(LANDING, reqPath === "/" ? "index.html" : reqPath));
    if (!file.startsWith(LANDING)) return void res.writeHead(404).end();
    try {
      const data = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" }).end(data);
    } catch {
      res.writeHead(404).end("Not found");
    }
    return;
  }
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const url = new URL(req.url ?? "/", "http://localhost");
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers[k.toLowerCase()] = v;
  const event = {
    rawPath: url.pathname,
    headers,
    body: Buffer.concat(chunks).toString("utf8"),
    isBase64Encoded: false,
    requestContext: { http: { method: req.method ?? "GET", sourceIp: req.socket.remoteAddress ?? "local" } },
  } as unknown as LambdaFunctionURLEvent;
  const out = await handler(event);
  res.writeHead(out.statusCode, { ...cors, ...out.headers }).end(out.body);
}).listen(PORT, () => console.log(`Aimed decode service and landing page on http://localhost:${PORT}`));
