// Mr. Handyman — MVP server
// Serves the marketing website (/), the web app (/app) and the AI diagnosis API (/api/diagnose).
const path = require("path");
const express = require("express");
const multer = require("multer");
const Anthropic = require("@anthropic-ai/sdk").default;
const { betaZodOutputFormat } = require("@anthropic-ai/sdk/helpers/beta/zod");
const { RepairReport } = require("./lib/schema");
const { SYSTEM_PROMPT, buildUserText } = require("./lib/prompt");
const { DEMO_REPORT } = require("./lib/demo");

const PORT = process.env.PORT || 3000;
const MODEL = process.env.MRH_MODEL || "claude-opus-5-5";
const DEMO_MODE =
  process.env.DEMO_MODE === "1" ||
  (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN);

const client = DEMO_MODE ? null : new Anthropic();
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // Claude accepts images up to 5 MB each
});

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.get("/api/health", (_req, res) => res.json({ ok: true, demo: DEMO_MODE, model: MODEL }));

app.post("/api/diagnose", upload.array("photos", 4), async (req, res) => {
  const body = req.body || {};
  const description = String(body.description || "").trim();
  const files = req.files || [];

  if (!description && files.length === 0) {
    return res.status(400).json({ error: "Add a photo or describe the problem." });
  }
  if (description.length > 4000) {
    return res.status(400).json({ error: "Please keep the description under 4,000 characters." });
  }
  const badFile = files.find((f) => !ALLOWED_TYPES.has(f.mimetype));
  if (badFile) {
    return res.status(400).json({ error: `Unsupported image type: ${badFile.mimetype}` });
  }

  if (DEMO_MODE) {
    return res.json({ demo: true, report: DEMO_REPORT });
  }

  const content = [
    ...files.map((f) => ({
      type: "image",
      source: { type: "base64", media_type: f.mimetype, data: f.buffer.toString("base64") },
    })),
    {
      type: "text",
      text: buildUserText({
        description,
        zip: String(body.zip || "").slice(0, 20),
        skill: body.skill,
        photoCount: files.length,
      }),
    },
  ];

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if the model declines, the API retries on a fallback model
      output_config: { effort: "medium", format: betaZodOutputFormat(RepairReport) },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal") {
      return res.status(422).json({
        error:
          "Mr. Handyman couldn't help with this request. If this is a safety emergency (gas smell, sparking, flooding), leave the area and call 911 or your utility.",
      });
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return res.status(502).json({ error: "The answer came back incomplete. Please try again." });
    }
    return res.json({ demo: false, report: response.parsed_output });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "We're busy right now. Try again in a minute." });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth failed — check ANTHROPIC_API_KEY");
      return res.status(500).json({ error: "Server is not configured correctly." });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return res.status(502).json({ error: "The AI service had a problem. Please try again." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// Multer errors (file too big / too many files)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === "LIMIT_FILE_SIZE" ? "Each photo must be under 5 MB." :
      err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE" ? "Up to 4 photos per request." :
      err.message;
    return res.status(400).json({ error: msg });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mr. Handyman running on http://localhost:${PORT}${DEMO_MODE ? "  (DEMO MODE — no API key set)" : ""}`);
  });
}

module.exports = app;
