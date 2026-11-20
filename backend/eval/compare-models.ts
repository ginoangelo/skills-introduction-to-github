// Model comparison test: runs every screenshot in a folder through each model and writes a
// spreadsheet (CSV) with each read, its speed, and its cost, plus empty columns for people to rate.
//
//   ANTHROPIC_API_KEY=... npm run compare -- eval/screenshots
//
// Optional: eval/screenshots/contexts.csv with lines like  story1.png,we argued last night
// Optional: MODELS=claude-haiku-5-5,claude-sonnet-5-5 to choose models (default: all three).
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { decodeDetailed, type DecodeInput } from "../src/decode.js";

// Dollars per million tokens: [input, output]. Check current prices before relying on the totals.
const PRICES: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};
const MODELS = (process.env.MODELS || Object.keys(PRICES).join(","))
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const TYPES: Record<string, DecodeInput["mediaType"]> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

function costOf(model: string, u: Anthropic.Usage): number {
  const [inP, outP] = PRICES[model] ?? [0, 0];
  const cachedRead = u.cache_read_input_tokens ?? 0;
  const cachedWrite = u.cache_creation_input_tokens ?? 0;
  return (u.input_tokens * inP + cachedRead * inP * 0.1 + cachedWrite * inP * 1.25 + u.output_tokens * outP) / 1_000_000;
}
const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const dir = process.argv[2] || "eval/screenshots";
const files = existsSync(dir) ? readdirSync(dir).filter((f) => TYPES[extname(f).toLowerCase()]).sort() : [];
if (!files.length) {
  console.error(`No screenshots found in ${dir}. Add PNG or JPEG files and run again.`);
  process.exit(1);
}
const contexts = new Map<string, string>();
const ctxFile = join(dir, "contexts.csv");
if (existsSync(ctxFile)) {
  for (const line of readFileSync(ctxFile, "utf8").split("\n")) {
    const i = line.indexOf(",");
    if (i > 0) contexts.set(line.slice(0, i).trim(), line.slice(i + 1).trim());
  }
}

const client = new Anthropic();
const header = ["screenshot", "context", "model", "verdict", "reason", "meaning", "evidence", "seconds", "cost_usd", "accurate_yes_no", "notes"];
const rows = [header.join(",")];
const totals = new Map<string, { cost: number; secs: number; n: number; errors: number }>();

for (const file of files) {
  const input: DecodeInput = {
    image: readFileSync(join(dir, file)).toString("base64"),
    mediaType: TYPES[extname(file).toLowerCase()],
    context: contexts.get(file) ?? "",
  };
  for (const model of MODELS) {
    const t = totals.get(model) ?? { cost: 0, secs: 0, n: 0, errors: 0 };
    const started = Date.now();
    try {
      const { result, usage } = await decodeDetailed(client, input, model);
      const secs = (Date.now() - started) / 1000;
      const cost = costOf(model, usage);
      t.cost += cost;
      t.secs += secs;
      t.n += 1;
      const verdict = result.refused ? "Not read" : result.aimed_at_you.verdict;
      const evidence = result.evidence.map((e) => `${e.cue}: ${e.why}`).join(" | ");
      rows.push([file, input.context, model, verdict, result.aimed_at_you.reason, result.meaning, evidence, secs.toFixed(1), cost.toFixed(4), "", ""].map(csv).join(","));
      console.log(`${file}  ${model}  ${verdict}  ${secs.toFixed(1)}s  $${cost.toFixed(4)}`);
    } catch (e) {
      t.errors += 1;
      console.error(`${file}  ${model}  failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    totals.set(model, t);
  }
}

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const out = join("eval", `results-${stamp}.csv`);
writeFileSync(out, rows.join("\n") + "\n");
console.log(`\nWrote ${out}. Rate each read in the accurate_yes_no column.\n`);
console.log("model                 avg cost    avg secs   per 1,000 decodes   failures");
for (const [model, t] of totals) {
  const avg = t.n ? t.cost / t.n : 0;
  const secs = t.n ? t.secs / t.n : 0;
  console.log(`${model.padEnd(21)} $${avg.toFixed(4)}    ${secs.toFixed(1).padStart(5)}s     $${(avg * 1000).toFixed(2).padStart(8)}          ${t.errors}`);
}
