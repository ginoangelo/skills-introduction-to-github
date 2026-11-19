// Run the decode service on your computer: npm run local
// Without ANTHROPIC_API_KEY it answers with a labeled sample read, so the app can be tried end to end.
import { createServer } from "node:http";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { handler } from "./handler.js";

const PORT = Number(process.env.PORT || 8787);

createServer(async (req, res) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-subtext-device", "Access-Control-Allow-Methods": "GET, POST" };
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors).end();
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
}).listen(PORT, () => console.log(`Subtext decode service on http://localhost:${PORT}`));
