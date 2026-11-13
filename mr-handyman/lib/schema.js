// The structured repair report Claude must return. Enforced via structured outputs.
const { z } = require("zod");

const CostItem = z.object({
  item: z.string().describe("Specific product/part name, e.g. 'Moen 1222 replacement cartridge'"),
  quantity: z.string().describe("e.g. '1', '2 tubes', '1 quart'"),
  cost_low: z.number().describe("Low end US dollar estimate for the full quantity"),
  cost_high: z.number().describe("High end US dollar estimate for the full quantity"),
  where_to_buy: z.string().describe("Store type or aisle, e.g. 'Home Depot / Lowe's plumbing aisle'"),
  already_own_likely: z.boolean().describe("True if most homeowners already have this (e.g. screwdriver)"),
});

const Step = z.object({
  title: z.string(),
  instructions: z.string().describe("Plain-English instructions for this one step"),
  tip: z.string().describe("Pro tip or common mistake to avoid; empty string if none"),
  safety: z.string().describe("Safety note for this step; empty string if none"),
});

const Alternative = z.object({
  option: z.string().describe("e.g. 'Hire a handyman', 'Licensed plumber', 'Home warranty claim', 'Replace instead of repair'"),
  description: z.string(),
  cost_low: z.number(),
  cost_high: z.number(),
});

const RepairReport = z.object({
  title: z.string().describe("Short name of the problem, e.g. 'Dripping kitchen faucet'"),
  category: z.enum([
    "plumbing", "electrical", "hvac", "appliance", "drywall_paint", "carpentry_doors_windows",
    "flooring", "roofing_gutters", "exterior", "water_damage_mold", "pests", "other",
  ]),
  diagnosis: z.string().describe("What is most likely going on and why, 2-4 sentences, plain English"),
  other_possible_causes: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]),
  verdict: z.enum(["diy_easy", "diy_moderate", "diy_advanced", "call_pro", "emergency"]),
  verdict_reason: z.string(),
  urgency: z.enum(["can_wait", "fix_soon", "fix_today", "emergency_now"]),
  time_estimate: z.string().describe("e.g. '30-45 minutes'"),
  safety_warnings: z.array(z.string()),
  stop_and_call_a_pro_if: z.array(z.string()).describe("Specific signs mid-repair that mean stop"),
  materials: z.array(CostItem),
  tools: z.array(CostItem),
  steps: z.array(Step),
  diy_total_low: z.number().describe("Total DIY cost low, excluding tools likely already owned"),
  diy_total_high: z.number(),
  pro_type: z.string().describe("Who to hire if not DIY, e.g. 'Licensed plumber'"),
  pro_cost_low: z.number().describe("Typical total price to have a pro do it, incl. labor"),
  pro_cost_high: z.number(),
  alternatives: z.array(Alternative),
  what_to_tell_the_pro: z.string().describe("A ready-to-send message describing the problem to a contractor"),
  questions_to_ask_the_pro: z.array(z.string()),
  follow_up_questions: z.array(z.string()).describe("Questions that would sharpen the diagnosis; empty if confident"),
  video_search_query: z.string().describe("A good YouTube search query for a tutorial on this exact repair"),
});

module.exports = { RepairReport };
