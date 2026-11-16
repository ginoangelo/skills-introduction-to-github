// Subtext backend: one decode endpoint, usage limits, static hosting of the web build.
// Nothing about a post is stored on this server. A screenshot goes to the model once
// and the result card goes straight back to the phone.

import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { decodeScreenshot, SAMPLE_RESULT } from "./decode.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DAILY_CAP = Number(process.env.DECODE_DAILY_CAP || 30);
const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY);

const app = express();
app.use(express.json({ limit: "20mb" }));

// Free-tier style daily cap, keyed by client IP. In-memory on purpose: nothing persists.
const usage = new Map();
function dayKey() {
  return new Date().toISOString().slice(0, 10);
}
function takeDecode(ip) {
  const key = `${dayKey()}:${ip}`;
  const used = usage.get(key) || 0;
  if (used >= DAILY_CAP) return false;
  usage.set(key, used + 1);
  return true;
}

const client = HAS_KEY ? new Anthropic() : null;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: HAS_KEY ? "live" : "sample", dailyCap: DAILY_CAP });
});

app.post("/api/decode", async (req, res) => {
  const { image, mediaType, context } = req.body || {};
  if (typeof image !== "string" || !image) {
    return res.status(400).json({ error: "Missing screenshot." });
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(mediaType)) {
    return res.status(400).json({ error: "Screenshot must be a JPEG, PNG, WebP, or GIF." });
  }
  const userContext = typeof context === "string" ? context.trim().slice(0, 280) : "";

  if (!takeDecode(req.ip)) {
    return res.status(429).json({ error: `Daily limit of ${DAILY_CAP} decodes reached. Try again tomorrow.` });
  }

  if (!client) {
    // No API key configured: return a clearly labeled sample so the UI can be previewed.
    return res.json({ mode: "sample", result: SAMPLE_RESULT });
  }

  try {
    const result = await decodeScreenshot(client, { image, mediaType, context: userContext });
    return res.json({ mode: "live", result });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(502).json({ error: "The API key was rejected. Check ANTHROPIC_API_KEY." });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(503).json({ error: "The model is busy right now. Try again in a moment." });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `Model error ${err.status}: ${err.message}` });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong decoding that screenshot." });
  }
});

// Share target fallback: the service worker normally intercepts this POST before it reaches
// the network. If it ever gets here, send the user to the app without parsing the upload.
app.post("/share", (req, res) => {
  req.resume();
  res.redirect(303, "/?shared=0");
});

// Serve the built web app when it exists (npm run build).
const dist = path.join(here, "..", "web", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Subtext listening on http://localhost:${PORT} (${HAS_KEY ? "live" : "sample"} mode)`);
});
