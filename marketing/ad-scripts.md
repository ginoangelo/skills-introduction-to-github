# Aimed ads: one per feature

Seven still ads in `marketing/ads/` (1080 × 1920, for TikTok, Reels, and Stories), each with a matching 15-second video version below.

## Specs and rules for every ad

- **Size.** 1080 × 1920 (9:16). Key text and buttons sit above the bottom 450 px, where TikTok shows the caption and its own button.
- **Captions on.** Most people watch muted. Burn captions in with CapCut.
- **Only made-up posts.** Every post shown is fictional. Never show a real person's post, name, or face without written permission.
- **No platform logos.** No Instagram, TikTok, or Threads logos or screen designs. Say "a story" or "a post".
- **Honest claims.** Don't promise accuracy ("always right") or speed you haven't measured. Aimed gives a read with evidence, not a fact.
- **Label AI.** Turn on TikTok's AI-generated content label if a video uses an AI voice or avatar.
- **Only advertise what ships.** Ad 7 names Pro features (whole threads, follow-ups, blurred sharing) that aren't built yet. Run it only after they ship.

## 1. Hook: "Is this post about you?"

Still: `aimed-ad-01-hook.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 2 s | A made-up cryptic story fills the screen | "They posted this two hours after your fight." |
| 2 to 5 s | Screenshot, share to Aimed | "So you screenshot it." |
| 5 to 11 s | The read appears: "Aimed at you? Possibly" | "And Aimed tells you what it means, and whether it's about you." |
| 11 to 15 s | Logo and "Try it free" | "Aimed. Read between the lines." |

Caption: Is it about you or not? #overthinking #isthisaboutme #vaguepost

## 2. The verdict scale

Still: `aimed-ad-02-verdict.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 2 s | Big text: "Likely. Possibly. Unlikely." | "No more guessing." |
| 2 to 9 s | The scale bar fills to "Possibly" | "Aimed gives you a straight answer on whether a post is aimed at you." |
| 9 to 13 s | The reason line under the verdict | "And tells you why." |
| 13 to 15 s | "Try it free" | "Aimed." |

Caption: The group chat can stop guessing now. #subliminals #sneakdiss

## 3. Evidence

Still: `aimed-ad-03-evidence.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 2 s | "Not vibes. Evidence." | "Your friends say it's about you. Based on what?" |
| 2 to 11 s | Evidence rows appear one by one: the quote, the song, the timing | "Aimed shows you exactly what the read is based on. The words. The song. The timing." |
| 11 to 15 s | "Try it free" | "Aimed. Read between the lines." |

Caption: Receipts, not vibes. #overthinker #readbetweenthelines

## 4. Context

Still: `aimed-ad-04-context.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 2 s | A made-up story, then the context screen | "Context changes everything." |
| 2 to 9 s | Tap "We stopped talking", then the read | "Tell Aimed what happened, and the read gets sharper." |
| 9 to 15 s | Verdict and evidence, then "Try it free" | "Timing is the strongest signal there is." |

Caption: Add one line. Get the real read. #situationship #exposting

## 5. Screenshot, share, decoded

Still: `aimed-ad-05-share.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 2 s | Phone screenshot sound and flash | "Screenshot." |
| 2 to 5 s | Share sheet, tap Aimed | "Share." |
| 5 to 12 s | The read appears | "Decoded." |
| 12 to 15 s | "Try it free" | "No copying, no pasting. Just share it to Aimed." |

Caption: Three taps to the truth. #isthisaboutme

## 6. Privacy

Still: `aimed-ad-06-privacy.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 3 s | "We don't keep your screenshots." | "Most AI apps keep what you send them. We don't." |
| 3 to 12 s | The three promises appear one by one | "Your screenshot is used once for your read, then it's gone. Your history stays on your phone. And Aimed reads posts. It never labels people." |
| 12 to 15 s | "Try it free" | "Aimed." |

Caption: Your screenshots stay yours. #privacy #ai

## 7. Pro (run after the Pro features ship)

Still: `aimed-ad-07-pro.png`

| Time | On screen | Voice or caption |
| --- | --- | --- |
| 0 to 2 s | A long comment thread scrolls by | "One post is easy. A whole comment section?" |
| 2 to 10 s | Multiple screenshots go in, one read comes out | "Aimed Pro reads the whole thread, answers follow-up questions, and lets you share a read with names blurred." |
| 10 to 15 s | "3 days free, then $34.99 a year, or $9.99 a month" | "Try yearly free for three days." |

Caption: For the comment section detectives. #commentsection #pro

## How to test them

1. Start with ads 1, 2, and 3. Spend the same small budget on each for 3 to 5 days.
2. Judge by cost per install and by saves and shares, not views.
3. Put more budget into the winner, and make 2 new versions of it with different first lines.
4. Re-render a still after changing its wording: `node marketing/render-ads.cjs` (needs Playwright).
