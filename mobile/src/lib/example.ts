import type { DecodeResult } from "./types";

// Shown for "See an example" and whenever no decode API is configured. Always labeled as an example.
export const EXAMPLE_RESULT: DecodeResult = {
  refused: false,
  refusal_reason: "",
  legibility: "clear",
  platform: "Instagram story",
  literal:
    'A black story with the text "some people only miss you when they need something" and the song "thank u, next" playing. Close friends ring is on.',
  meaning:
    "This reads as a pointed post about one person, not a general mood. The lyric plus the close friends setting suggests it's meant for a small audience to see and talk about. The poster is signaling they're done with someone, without naming them.",
  aimed_at_you: {
    verdict: "Possibly",
    reason:
      "It's clearly aimed at someone, but without context on your recent interactions there's no way to tell if that someone is you.",
  },
  evidence: [
    { cue: "“only miss you when they need something”", why: "Second-person, accusing phrasing usually targets one person the poster has in mind." },
    { cue: "Song: thank u, next", why: "A breakup anthem on a story usually signals closure or a recent falling out." },
    { cue: "Close friends ring", why: "A limited audience makes it likelier the target is someone the inner circle knows." },
    { cue: "No name, no tag", why: "Deliberate vagueness is the mark of a sneak diss rather than a direct callout." },
  ],
  other_readings: [
    "It could be a general venting post after a bad week, reposted from a quote account.",
    "It might be about a family member or coworker rather than anyone they follow.",
  ],
};
