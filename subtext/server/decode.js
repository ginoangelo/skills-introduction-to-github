// The decode call: one multimodal request that returns the fixed result-card structure.

import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

export const MODEL = process.env.SUBTEXT_MODEL || "claude-opus-5-5";

export const ResultSchema = z.object({
  refused: z.boolean().describe("True only when the screenshot must not be read (minor, sexual content, private medical info)."),
  refusal_reason: z.string().describe("One plain sentence when refused, otherwise an empty string."),
  legibility: z.enum(["clear", "partial", "poor"]).describe("How readable the screenshot was."),
  platform: z.string().describe("What the screenshot shows, e.g. 'Instagram story', 'Threads reply', 'TikTok comment'. Empty string if unclear."),
  literal: z.string().describe("What it says: the words, the image, the song, the emoji, who is tagged. One or two sentences."),
  meaning: z.string().describe("What it means: the subtext in plain language. Two or three sentences."),
  aimed_at_you: z.object({
    verdict: z.enum(["Likely", "Possibly", "Unlikely", "Not enough to tell"]),
    reason: z.string().describe("One sentence on why."),
  }),
  evidence: z
    .array(
      z.object({
        cue: z.string().describe("The specific thing noticed: quoted words, a lyric, an emoji, timing, who is tagged, the close friends ring."),
        why: z.string().describe("What that cue usually signals, in one short sentence."),
      }),
    )
    .describe("Two to five items. Every item must point at something visible in the screenshot or stated in the user's context."),
  other_readings: z.array(z.string()).describe("One or two alternative meanings, each one sentence."),
});

const SYSTEM_PROMPT = `You are Subtext, an app that decodes screenshots of social media posts. Tagline: read between the lines.

The user shares a screenshot of a post, story, caption, comment, or reply. They may add one line of context about their relationship to the poster. You return a fixed result card.

Rules you always follow:

1. Evidence or nothing. Every claim in "meaning" and "aimed_at_you" must trace to something visible in the screenshot or stated in the user's context. If you cannot point at it, do not say it.
2. Calibrated by default. Without user context you cannot know the relationship, so "aimed_at_you.verdict" can be at most "Possibly". With context, use "Likely" only when the timing, wording, or targets line up clearly. Use "Not enough to tell" freely. Saying "probably not about you" is a good answer when that is the honest read.
3. Behavior and words only. Read what was posted, not who the poster is. Never infer race, religion, sexuality, health, or similar traits. Never label the poster as a type of person. Describe the post, not their character.
4. Refusals. If the screenshot appears to show a minor as the subject, sexual content, or someone's private medical information, set "refused" to true, write one plain sentence in "refusal_reason", and leave every other text field as an empty string with empty arrays and verdict "Not enough to tell".
5. Plain language. Short sentences. No jargon. No moralizing. No advice about what the user should do.
6. Legibility. If the screenshot is blurry, cropped, or missing the caption, say so in "literal" and set "legibility" accordingly. A poor screenshot gets a weaker read and says so.
7. Timing is the strongest signal. If the post's time and the user's context line up (for example a cryptic story two hours after an argument), say so in evidence. If there is no time shown, do not invent one.
8. Lyrics, memes, and emoji carry meaning. When you recognize one, say what it usually signals and treat that as one piece of evidence, not proof.

Field guide:
- "literal": what it says. One or two sentences.
- "meaning": the subtext. Two or three sentences.
- "aimed_at_you": verdict plus one sentence why.
- "evidence": two to five items, each with the cue and what it usually signals.
- "other_readings": one or two alternatives, so the user sees this is a judgment, not a fact.`;

/**
 * Decode one screenshot. Returns the parsed result card.
 * @param {import("@anthropic-ai/sdk").default} client
 * @param {{image: string, mediaType: string, context: string}} input  image is base64 without the data: prefix
 */
export async function decodeScreenshot(client, { image, mediaType, context }) {
  const now = new Date();
  const userText = [
    `Current date and time: ${now.toISOString()}.`,
    context ? `User's context: "${context}"` : "User's context: none given.",
    "Decode this screenshot and return the result card.",
  ].join("\n");

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          { type: "text", text: userText },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(ResultSchema), effort: "medium" },
  });

  if (response.stop_reason === "refusal") {
    return {
      refused: true,
      refusal_reason: "This screenshot can't be read by Subtext.",
      legibility: "clear",
      platform: "",
      literal: "",
      meaning: "",
      aimed_at_you: { verdict: "Not enough to tell", reason: "" },
      evidence: [],
      other_readings: [],
    };
  }

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("The model returned a result card that did not match the expected structure.");
  }
  return parsed;
}

// Returned only when no API key is configured, and always labeled as a sample in the UI.
export const SAMPLE_RESULT = {
  refused: false,
  refusal_reason: "",
  legibility: "clear",
  platform: "Instagram story (sample)",
  literal:
    "A black-and-white photo of a window at night with the text \"some people only miss you when they need something\" and the song \"Thank U, Next\" playing. Close friends ring is on.",
  meaning:
    "This reads as a pointed post about a specific person, not a general mood. The lyric choice plus the close friends setting suggests it is meant for a small audience to see and talk about. It signals the poster is done with someone and wants that known without naming them.",
  aimed_at_you: {
    verdict: "Possibly",
    reason: "The post is clearly aimed at someone, but without context on your recent interactions there is no way to tell if that someone is you.",
  },
  evidence: [
    { cue: "\"only miss you when they need something\"", why: "Second-person accusatory phrasing usually targets one person the poster has in mind." },
    { cue: "Song: Thank U, Next", why: "A breakup anthem used on stories typically signals closure or a recent falling out." },
    { cue: "Close friends ring", why: "Limiting the audience makes it more likely the target is someone the inner circle knows about." },
    { cue: "No name, no tag", why: "Deliberate vagueness is the hallmark of a sneak diss rather than a direct callout." },
  ],
  other_readings: [
    "It could be a general venting post after a bad week, reposted from a quote account.",
    "It might be about a family member or coworker rather than anyone they follow.",
  ],
};
