// Photo -> structured room analysis. The model reports what it sees and picks
// scope items; it never produces dollar figures. Pricing happens in pricing.js.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import "../public/catalog.js";
import "../public/pricing.js";
import "../public/looks.js";

const RF = globalThis.RF;

const Palette = z.object({
  wall: z.string(), cabinet: z.string(), counter: z.string(),
  backsplash: z.string(), floor: z.string(), hardware: z.string(),
});
const Tier = z.object({
  concept_name: z.string(),
  design_notes: z.string(),
  palette: Palette,
  item_ids: z.array(z.string()),
});
export const Analysis = z.object({
  room_type: z.enum(["kitchen", "bathroom", "bedroom", "living", "exterior"]),
  confidence: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  observations: z.array(z.string()),
  unseen_risks: z.array(z.string()),
  measurements: z.object({
    floor_sf: z.number(), wall_sf: z.number(), cabinet_lf: z.number(),
    counter_sf: z.number(), backsplash_sf: z.number(), light_count: z.number(),
    door_count: z.number(), window_count: z.number(), trim_lf: z.number(), yard_sf: z.number(),
  }),
  current_palette: Palette,
  tiers: z.object({ cosmetic: Tier, mid: Tier, full: Tier }),
});

function catalogText(room) {
  return RF.CATALOG.filter((it) => it.room === RF.kind(room))
    .map((it) => `${it.id} | ${it.cat} | ${it.name} | usual packages: ${it.tiers.join(", ")}`)
    .join("\n");
}

const SYSTEM = `You are the eyes of a rehab estimator working for house flippers. You look at one photo of a kitchen, bathroom, bedroom, living room or house exterior and report what a careful investor would note on a walkthrough.

Your output feeds a pricing engine that owns all dollar figures, so you give measurements, observations and scope choices, never prices.

Measurements: estimate from visual cues such as standard cabinet widths (base cabinets are usually 24 inches deep, doors 12 to 36 inches wide), appliance sizes, door heights and tile sizes. When the photo shows only part of the room, estimate the whole room and lower your confidence. For a bathroom, cabinet_lf is the vanity width in feet and backsplash_sf is the tub or shower surround tile area. For a bedroom or living room, trim_lf is the baseboard length. For an exterior, wall_sf is the siding area of the whole house, trim_lf is the trim to paint, door_count is entry doors and yard_sf is the front yard. Use 0 for any measurement that does not apply to this kind of room.

Palette slots are reused across room kinds. Bedroom or living room: cabinet is the trim and door color, backsplash is an accent wall (same as wall if none). Exterior: wall is the siding, cabinet is the front door, counter is the trim, backsplash is the roof and floor is the lawn.

Three packages, all keeping the existing layout:
- cosmetic: the cheapest work that makes the room clean and rentable or listable. Keep anything that is sound.
- mid: what a typical resale buyer in a median-priced neighborhood expects.
- full: everything new, aimed at the top of the neighborhood.

For each package choose item_ids only from the catalog you are given, using what you see: if cabinet boxes look damaged, do not choose painting them; if a floor already looks new, leave flooring out. Give each package a short concept name, two sentences of design notes a flipper can hand to a painter or designer, and a palette of six hex colors (#rrggbb) for the finished room. current_palette is the six colors of the room as it is now.

observations: up to six condition notes visible in the photo. unseen_risks: three or four things this kind of room often hides that a photo cannot show. Write plainly, no sales language.`;

export class AnalysisError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

export async function analyzeRoom({ imageBase64, mediaType, roomType, look }) {
  const L = RF.look(look);
  const client = new Anthropic();
  let res;
  try {
    res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "high", format: zodOutputFormat(Analysis) },
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: `The user says this is a ${roomType}. If the photo clearly shows a different one of the five room types, use that instead.\n\nThe look they are going for: ${L.name}. ${L.brief} Design all three packages toward this look, adapting it to what the room already has.\n\nKitchen catalog:\n${catalogText("kitchen")}\n\nBathroom catalog:\n${catalogText("bathroom")}\n\nBedroom and living room catalog:\n${catalogText("bedroom")}\n\nExterior catalog:\n${catalogText("exterior")}` },
        ],
      }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new AnalysisError("The server's AI key was rejected.", 500);
    if (err instanceof Anthropic.RateLimitError) throw new AnalysisError("Too many estimates right now. Try again in a minute.", 429);
    if (err instanceof Anthropic.BadRequestError) throw new AnalysisError("That photo could not be processed. Try a different one.", 400);
    if (err instanceof Anthropic.APIConnectionError) throw new AnalysisError("Could not reach the AI service. Try again.", 503);
    if (err instanceof Anthropic.APIError) throw new AnalysisError("The AI service had a problem. Try again.", 502);
    throw err;
  }
  if (res.stop_reason === "refusal") throw new AnalysisError("That photo could not be analyzed. Try a photo that shows only the room.", 422);
  if (res.stop_reason === "max_tokens") throw new AnalysisError("The analysis was cut off. Try again.", 502);

  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  let parsed;
  try { parsed = Analysis.parse(JSON.parse(text)); }
  catch { throw new AnalysisError("The analysis came back in an unexpected shape. Try again.", 502); }
  return { ...sanitize(parsed), look: L.id };
}

// Keep only catalog items that exist for the room; fall back to the default package if none survive.
export function sanitize(a) {
  const valid = new Set(RF.CATALOG.filter((it) => it.room === RF.kind(a.room_type)).map((it) => it.id));
  for (const tier of ["cosmetic", "mid", "full"]) {
    const ids = [...new Set(a.tiers[tier].item_ids.filter((id) => valid.has(id)))];
    a.tiers[tier].item_ids = ids.length ? ids : RF.defaultItems(a.room_type, tier);
  }
  for (const k of Object.keys(a.measurements)) a.measurements[k] = Math.max(0, Math.round(a.measurements[k] * 10) / 10);
  return a;
}
