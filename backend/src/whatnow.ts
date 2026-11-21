// "What now?": after a read, three calm options for what to do next.
// Text only. The screenshot is never sent again, and nothing is stored.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

export const WHATNOW_MODEL = process.env.WHATNOW_MODEL || process.env.MODEL || "claude-opus-5-5";

export const KINDS = ["let_it_go", "check_in", "talk_it_through"] as const;
export type Kind = (typeof KINDS)[number];
export const TONES = ["warm", "direct", "light"] as const;
export type Tone = (typeof TONES)[number];

export const WhatNowSchema = z.object({
  refused: z.boolean().describe("True only when no safe suggestion can be given."),
  refusal_reason: z.string().describe("One plain sentence when refused, otherwise an empty string."),
  headline: z.string().describe("One short sentence that sums up the best next step."),
  recommended: z.enum(KINDS).describe("The option that fits this read best."),
  options: z
    .array(
      z.object({
        kind: z.enum(KINDS),
        title: z.string().describe("Two to five words."),
        why: z.string().describe("One sentence on when this option fits, tied to the read."),
        message: z.string().describe("For check_in and talk_it_through: what the user could send or say, under 40 words, in the chosen tone. Empty for let_it_go."),
      }),
    )
    .describe("Exactly three options, one of each kind, in the order let_it_go, check_in, talk_it_through."),
});
export type WhatNowResult = z.infer<typeof WhatNowSchema>;

export const WHATNOW_PROMPT = `You are Aimed, an app that reads social media posts. The user already has a read of a post. Now they want to know what to do next. You give three calm options: let it go, check in privately, or talk it through.

Rules you always follow:

1. Fit the verdict. If the read says "Unlikely", recommend let_it_go and say plainly that it's probably not about them and no reply is needed. If it says "Not enough to tell", lean toward let_it_go or a low-key check-in, never a confrontation. Only recommend talk_it_through when the read says "Likely" and the user's context shows a real relationship worth talking to.
2. De-escalate. Never write comebacks, insults, sarcasm, threats, guilt trips, or anything meant to win, hurt, or make someone jealous. Never suggest replying in public, posting back, subposting, or getting others involved.
3. Private and respectful. Messages go to the person directly. Never suggest checking their other accounts, asking mutual friends to spy, or contacting someone who has blocked the user or asked for no contact.
4. Write messages as the user, in their voice: casual, short, first person, under 40 words, no emoji unless the tone is light, no therapy words. Don't assume the post is about them in the message itself. Ask, don't accuse.
5. Tone. "warm" is kind and open. "direct" is clear and calm, no hedging. "light" is relaxed and easygoing. The tone changes the wording, never the safety rules.
6. Safety first. If the read or context suggests threats, stalking, harassment, or someone at risk of harm, do not draft a reply to the poster. Recommend let_it_go, and use the other options to suggest talking to someone they trust or using the app's block and report tools. If someone may be in danger, say to contact local emergency services.
7. If the read can't support any suggestion (for example, it was refused), set refused to true with one plain sentence.
8. Plain language, short sentences, no moralizing.`;

export type WhatNowInput = {
  literal: string;
  meaning: string;
  verdict: "Likely" | "Possibly" | "Unlikely" | "Not enough to tell";
  reason: string;
  context: string;
  tone: Tone;
};

const TITLES: Record<Kind, string> = { let_it_go: "Let it go", check_in: "Check in privately", talk_it_through: "Talk it through" };

/** Keep exactly one option of each kind, in order, so the app can lay them out the same way every time. */
export function normalizeWhatNow(r: WhatNowResult): WhatNowResult {
  const options = KINDS.map((kind) => {
    const o = r.options.find((x) => x.kind === kind);
    return {
      kind,
      title: o?.title || TITLES[kind],
      why: o?.why ?? "",
      message: kind === "let_it_go" ? "" : o?.message ?? "",
    };
  });
  return { ...r, options };
}

export async function whatNow(client: Anthropic, input: WhatNowInput, model = WHATNOW_MODEL): Promise<WhatNowResult> {
  const userText = [
    `The post, as read: ${input.literal || "(not described)"}`,
    `What it means: ${input.meaning || "(not described)"}`,
    `Aimed at the user? ${input.verdict}. ${input.reason}`,
    input.context ? `User's context: "${input.context}"` : "User's context: none given.",
    `Tone for messages: ${input.tone}.`,
    "Give the three options.",
  ].join("\n");

  const response = await client.beta.messages.parse({
    model,
    max_tokens: 2000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: WHATNOW_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userText }],
    output_config: { format: betaZodOutputFormat(WhatNowSchema), effort: "low" },
  });

  if (response.stop_reason === "refusal") return WHATNOW_REFUSED;
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("The model returned a result that did not match the expected structure.");
  if (input.verdict === "Unlikely" && !parsed.refused) parsed.recommended = "let_it_go";
  return normalizeWhatNow(parsed);
}

export const WHATNOW_REFUSED: WhatNowResult = {
  refused: true,
  refusal_reason: "Aimed can't suggest a next step for this one.",
  headline: "",
  recommended: "let_it_go",
  options: [],
};

/** Used in sample mode, so the app can be tried before an API key is added. */
export function sampleWhatNow(verdict: WhatNowInput["verdict"], tone: Tone): WhatNowResult {
  const unlikely = verdict === "Unlikely";
  const msg: Record<Tone, [string, string]> = {
    warm: ["Hey, saw your story. Everything good with us? No pressure, just checking in.", "Hey, can we talk sometime this week? I've felt a little off between us and I'd rather ask than guess."],
    direct: ["Saw your story. Is something up between us? I'd rather hear it from you.", "I'd like to talk about how things have been between us. Free this week?"],
    light: ["Saw your story 👀 we good?", "Coffee this week? Feels like we're overdue for a catch-up."],
  };
  return {
    refused: false,
    refusal_reason: "",
    headline: unlikely ? "Probably not about you. No reply needed." : "If it's still bugging you, a short private check-in beats guessing.",
    recommended: unlikely ? "let_it_go" : "check_in",
    options: [
      { kind: "let_it_go", title: "Let it go", why: "Vague posts are often about a mood, not a person. Not reacting keeps things calm.", message: "" },
      { kind: "check_in", title: "Check in privately", why: "A low-key message clears it up without assuming the post was about you.", message: msg[tone][0] },
      { kind: "talk_it_through", title: "Talk it through", why: "If something real happened between you, talking beats reading posts.", message: msg[tone][1] },
    ],
  };
}
