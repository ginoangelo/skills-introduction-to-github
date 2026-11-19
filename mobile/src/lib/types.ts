export type Verdict = "Likely" | "Possibly" | "Unlikely" | "Not enough to tell";

export interface Evidence {
  cue: string;
  why: string;
}

export interface DecodeResult {
  refused: boolean;
  refusal_reason: string;
  legibility: "clear" | "partial" | "poor";
  platform: string;
  literal: string;
  meaning: string;
  aimed_at_you: { verdict: Verdict; reason: string };
  evidence: Evidence[];
  other_readings: string[];
}

export interface Entry {
  id: string;
  when: string;
  /** Small JPEG thumbnail as a data URI. */
  thumb: string;
  context: string;
  mode: "live" | "example";
  result: DecodeResult;
}

export interface PreparedImage {
  /** Local file URI of the downscaled screenshot, for previews. */
  uri: string;
  /** Base64 JPEG of the downscaled screenshot, sent to the decode API. */
  base64: string;
  /** Small JPEG thumbnail as a data URI, stored with the decode. */
  thumb: string;
}

export const VERDICTS: Verdict[] = ["Likely", "Possibly", "Unlikely", "Not enough to tell"];
export const SCALE: Verdict[] = ["Unlikely", "Possibly", "Likely"];
