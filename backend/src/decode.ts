// The decode call: one multimodal request that returns the fixed result-card structure.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = process.env.MODEL || "claude-opus-5-5";

export const ResultSchema = z.object({
  refused: z.boolean().describe("True only when the screenshot must not be read (minor, sexual content, private medical info)."),
  refusal_reason: z.string().describe("One plain sentence when refused, otherwise an empty string."),
  legibility: z.enum(["clear", "partial", "poor"]).describe("How readable the screenshot was."),
  platform: z.string().describe("What the screenshot shows, e.g. 'Instagram story', 'Threads reply'. Empty string if unclear."),
  literal: z.string().describe("What it says: the words, the image, the song, the emoji, who is tagged. One or two sentences."),
  meaning: z.string().describe("What it means: the subtext in plain language. Two or three sentences."),
  aimed_at_you: z.object({
    verdict: z.enum(["Likely", "Possibly", "Unlikely", "Not enough to tell"]),
    reason: z.string().describe("One sentence on why."),
  }),
  evidence: z
    .array(z.object({ cue: z.string(), why: z.string() }))
    .describe("Two to five items. Each points at something visible in the screenshot or stated in the user's context."),
  other_readings: z.array(z.string()).describe("One or two alternative meanings, each one sentence."),
});
export type DecodeResult = z.infer<typeof ResultSchema>;

export const SYSTEM_PROMPT = `You are Subtext, an app that decodes screenshots of social media posts. Tagline: read between the lines.

The user shares a screenshot of a post, story, caption, comment, or reply. They may add one line of context about their relationship to the poster. You return a fixed result card.

Rules you always follow:

1. Evidence or nothing. Every claim in "meaning" and "aimed_at_you" must trace to something visible in the screenshot or stated in the user's context. If you cannot point at it, do not say it.
2. Calibrated by default. Without user context you cannot know the relationship, so "aimed_at_you.verdict" can be at most "Possibly". With context, use "Likely" only when the timing, wording, or targets line up clearly. Use "Not enough to tell" freely. Saying "probably not about you" is a good answer when that is the honest read.
3. Behavior and words only. Read what was posted, not who the poster is. Never infer race, religion, sexuality, health, or similar traits. Never label the poster as a type of person.
4. Refusals. If the screenshot appears to show a minor as the subject, sexual content, or someone's private medical information, set "refused" to true, write one plain sentence in "refusal_reason", and leave every other text field empty with empty arrays and verdict "Not enough to tell".
5. Plain language. Short sentences. No jargon. No moralizing. No advice about what the user should do.
6. Legibility. If the screenshot is blurry, cropped, or missing the caption, say so in "literal" and set "legibility" accordingly.
7. Timing is the strongest signal. If the post's time and the user's context line up, say so in evidence. If there is no time shown, do not invent one.
8. Lyrics, memes, and emoji carry meaning. When you recognize one, say what it usually signals and treat that as one piece of evidence, not proof.`;

const REFUSED: DecodeResult = {
  refused: true,
  refusal_reason: "Subtext doesn't read this kind of screenshot.",
  legibility: "clear",
  platform: "",
  literal: "",
  meaning: "",
  aimed_at_you: { verdict: "Not enough to tell", reason: "" },
  evidence: [],
  other_readings: [],
};

export type DecodeInput = { image: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; context: string };

export async function decodeScreenshot(client: Anthropic, input: DecodeInput): Promise<DecodeResult> {
  return (await decodeDetailed(client, input, MODEL)).result;
}

/** The same decode with a chosen model, plus token usage. Used by the model comparison test. */
export async function decodeDetailed(client: Anthropic, input: DecodeInput, model: string): Promise<{ result: DecodeResult; usage: Anthropic.Usage }> {
  const userText = [
    `Current date and time: ${new Date().toISOString()}.`,
    input.context ? `User's context: "${input.context}"` : "User's context: none given.",
    "Decode this screenshot and return the result card.",
  ].join("\n");

  const response = await client.messages.parse({
    model,
    max_tokens: 4000,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: input.mediaType, data: input.image } },
          { type: "text", text: userText },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(ResultSchema), effort: "medium" },
  });

  if (response.stop_reason === "refusal") return { result: REFUSED, usage: response.usage };
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("The model returned a result that did not match the expected structure.");
  if (!input.context && parsed.aimed_at_you.verdict === "Likely") parsed.aimed_at_you.verdict = "Possibly";
  return { result: parsed, usage: response.usage };
}

export const SAMPLE_RESULT: DecodeResult = {
  refused: false,
  refusal_reason: "",
  legibility: "clear",
  platform: "Story post (sample)",
  literal: 'A story on a sunset background with the text "some people only miss you when they need something" and the song "thank u, next" playing.',
  meaning: "This reads as a pointed post about one person, not a general mood. The poster is signaling they're done with someone, without naming them.",
  aimed_at_you: { verdict: "Possibly", reason: "It's clearly aimed at someone, but there's no way to tell from the screenshot alone whether that someone is you." },
  evidence: [
    { cue: "“only miss you when they need something”", why: "Second-person, accusing phrasing usually targets one person." },
    { cue: "Song: thank u, next", why: "A breakup anthem on a story usually signals closure or a falling out." },
  ],
  other_readings: ["It could be a general venting post reposted from a quote account."],
};
