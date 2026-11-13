// Turns something the user said into app actions, using Claude. The app applies
// the actions and reads the reply aloud.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import "../public/catalog.js";
import "../public/looks.js";

const RF = globalThis.RF;
export const ACTION_TYPES = ["look", "tier", "room", "view", "tab", "exclude", "include", "qty", "price", "diy", "pro", "labor", "contingency", "zip", "arv", "purchase", "total", "reset"];

export const Command = z.object({
  reply: z.string(),
  actions: z.array(z.object({ type: z.enum(ACTION_TYPES), target: z.string(), number: z.number() })),
});

const SYSTEM = `You are the voice assistant inside Roomwise AI, an app that prices kitchen and bathroom rehabs for house flippers. The user speaks or types a request; you turn it into actions the app applies, plus a one-sentence spoken reply.

Actions (use "" for an unused target and 0 for an unused number):
- look: target is a look id. Choose the closest look to what they describe.
- tier: target is cosmetic, mid or full.
- room: target is kitchen or bathroom. Switches to that room in the project.
- view: target is before or after.
- tab: target is estimate, diy (the do-it-yourself plan), rates, sheet (the deal sheet) or scope (the scope of work for contractor bids).
- exclude / include: target is an item id from the current scope. "Keep the existing counters" means exclude the counter item.
- diy / pro: target is an item id. diy means the user will do that job themselves; pro means hire it out again. Only items marked canDiy can be diy.
- qty: target is an item id, number is the new quantity in that item's unit.
- price: target is an item id, number is the new material price per unit in dollars.
- labor: number is the user's contractor cost as a percent of the area average (100 is average).
- contingency: number is the percent for the current package.
- zip: target is a 5-digit ZIP code.
- arv / purchase: number is dollars.
- total: the user only wants to hear the current total.
- reset: clear all edits.

Use only ids you are given. If the request needs something the app cannot do, such as moving a wall or adding an item that is not in the scope, return no actions and say so briefly. The reply is read aloud: plain words, no lists, no dollar totals (the app adds the new total itself).`;

export async function interpret({ text, context }) {
  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: zodOutputFormat(Command) },
    system: SYSTEM,
    messages: [{
      role: "user",
      content: `Looks: ${RF.LOOKS.map((l) => `${l.id} (${l.name}: ${l.brief})`).join("; ")}\n\nCurrent state: ${JSON.stringify(context)}\n\nThe user said: ${JSON.stringify(text)}`,
    }],
  });
  if (res.stop_reason === "refusal" || res.stop_reason === "max_tokens") throw new Error("command not completed: " + res.stop_reason);
  const out = Command.parse(JSON.parse(res.content.filter((b) => b.type === "text").map((b) => b.text).join("")));
  return out;
}
