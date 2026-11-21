import type { DecodeResult, Tone, Verdict, WhatNowResult } from "./types";

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

const EXAMPLE_MESSAGES: Record<Tone, [string, string]> = {
  warm: ["Hey, saw your story. Everything good with us? No pressure, just checking in.", "Hey, can we talk sometime this week? Things have felt a little off and I'd rather ask than guess."],
  direct: ["Saw your story. Is something up between us? I'd rather hear it from you.", "I'd like to talk about how things have been between us. Free this week?"],
  light: ["Saw your story \u{1F440} we good?", "Coffee this week? Feels like we're overdue for a catch-up."],
};

// "What now?" for example reads and builds without the decode API. Always labeled as an example.
export function exampleWhatNow(verdict: Verdict, tone: Tone): WhatNowResult {
  const unlikely = verdict === "Unlikely";
  return {
    refused: false,
    refusal_reason: "",
    headline: unlikely ? "Probably not about you. No reply needed." : "If it's still bugging you, a short private check-in beats guessing.",
    recommended: unlikely ? "let_it_go" : "check_in",
    options: [
      { kind: "let_it_go", title: "Let it go", why: "Vague posts are often about a mood, not a person. Not reacting keeps things calm.", message: "" },
      { kind: "check_in", title: "Check in privately", why: "A low-key message clears it up without assuming the post was about you.", message: EXAMPLE_MESSAGES[tone][0] },
      { kind: "talk_it_through", title: "Talk it through", why: "If something real happened between you, talking beats reading posts.", message: EXAMPLE_MESSAGES[tone][1] },
    ],
  };
}
