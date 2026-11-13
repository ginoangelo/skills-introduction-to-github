import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeRoom, AnalysisError } from "./lib/analyze.mjs";
import { interpret } from "./lib/command.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(here, "public")));

const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

app.get("/api/health", (_req, res) => res.json({ ok: true, ai: hasKey() }));

app.post("/api/estimate", async (req, res) => {
  const { image, roomType, look } = req.body || {};
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image || "");
  if (!m) return res.status(400).json({ error: "Send a JPEG, PNG or WebP photo." });
  if (roomType !== "kitchen" && roomType !== "bathroom") return res.status(400).json({ error: "Choose kitchen or bathroom." });
  if (!hasKey()) return res.status(503).json({ error: "No AI key is set on the server, so photos are not analyzed yet. Showing sample numbers." });
  try {
    const analysis = await analyzeRoom({ imageBase64: m[2], mediaType: m[1], roomType, look: typeof look === "string" ? look : "" });
    res.json({ analysis });
  } catch (err) {
    if (err instanceof AnalysisError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.post("/api/command", async (req, res) => {
  const { text, context } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > 500) return res.status(400).json({ error: "Say or type a short request." });
  if (!hasKey()) return res.status(503).json({ error: "No AI key is set on the server." });
  try {
    res.json(await interpret({ text, context: context || {} }));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The request could not be understood by the AI service." });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Rehab Flipper running at http://localhost:${port} (AI ${hasKey() ? "on" : "off, sample data"})`));
