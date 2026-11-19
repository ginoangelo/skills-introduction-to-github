import type { DecodeResult } from "./types";

// Shown for "See an example" and whenever no decode API is configured. Always labeled as an example.
export const EXAMPLE_RESULT: DecodeResult = {
  refused: false,
  refusal_reason: "",
  legibility: "clear",
  platform: "Story post",
  literal:
    'A story on a sunset background with the text "some people only miss you when they need something" and the song "thank u, next" playing. It was posted 2 hours ago.',
  meaning:
    "This reads as a pointed post about one person, not a general mood. The lyric backs up the words and makes it feel like a goodbye. The poster is signaling they're done with someone, without naming them.",
  aimed_at_you: {
    verdict: "Possibly",
    reason:
      "It's clearly aimed at someone, but without context on your recent interactions there's no way to tell if that someone is you.",
  },
  evidence: [
    { cue: "“only miss you when they need something”", why: "Second-person, accusing phrasing usually targets one person the poster has in mind." },
    { cue: "Song: thank u, next", why: "A breakup anthem on a story usually signals closure or a recent falling out." },
    { cue: "Posted 2 hours ago", why: "Timing matters most when it lines up with something that just happened between you." },
    { cue: "No name, no tag", why: "Deliberate vagueness is the mark of a sneak diss rather than a direct callout." },
  ],
  other_readings: [
    "It could be a general venting post after a bad week, reposted from a quote account.",
    "It might be about a family member or coworker rather than anyone they follow.",
  ],
};
