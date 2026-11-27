# Case 01: The 2:14 a.m. sunset

**Series:** Is This About Me? · **Length:** 60 seconds plus a 2-second end card · **Case type:** exes · **Verdict:** Likely

Made with the master prompt in [`../../youtube-master-prompt.md`](../../youtube-master-prompt.md). The rendered posts, cards, and cover are in [`assets/`](assets/). Regenerate them with `node marketing/youtube/render-case01.cjs`. Once `assets/ref_june.png` exists, re-run it and the June card and side-by-side switch to the real photo.

## The case

Two hours after their breakup call, Maya's ex posts a sunset, at 2:14 a.m. The caption and the song are about distance. Then she spots the yellow umbrella from their June beach trip in the corner. Timing, photo, and caption line up: Likely. The hardest next step: let it go tonight.

## Script

Read at a natural pace, about 153 words a minute.

> Two fourteen a.m. Maya's ex posts a sunset. Two hours after the breakup call. Nobody watches a sunset at two in the morning, so this photo was chosen. Her phone glows on the pillow. She has watched the story six times. The caption says, some things look better from far away. A song sticker sits underneath: Last Light, by Lowtide Lanterns. Is it about her, or just a night he can't sleep? She screenshots it and types one line of context. We broke up tonight. Then she zooms in. Bottom left corner, half hidden, a yellow umbrella. The same umbrella from their beach trip in June. Her umbrella. The timing lines up. The photo is theirs. The caption is about distance. Aimed's read: Likely. And the next step is the hardest one. Let it go tonight. No reply at two a.m. Put the phone face down. Nobody posts a sunset at two a.m. by accident.

WORD COUNT: 155 (target 153 for 60 s at 153 wpm)

## Block A: Fair-read check

```
✓ "Two fourteen a.m. Maya's ex posts a sunset."            → SHOT 01 shows the post and its 2:14 AM time
✓ "Two hours after the breakup call."                       → SHOT 02 shows "Call ended 12:14 AM"
✓ "Nobody watches a sunset at two... this photo was chosen." → SHOTS 03-04: a sunset, posted at 2:14 AM
✓ "She has watched the story six times."                    → SHOT 06 (Maya's own action, not a claim about Leo)
✓ "The caption says, some things look better from far away." → SHOT 07 highlights the caption
✓ "A song sticker... Last Light, by Lowtide Lanterns."      → SHOT 08 circles the sticker (made-up song and artist)
✓ "We broke up tonight."                                     → SHOT 10 shows the context line typed into Aimed
✓ "Bottom left corner, half hidden, a yellow umbrella."     → SHOT 12 circles it
✓ "The same umbrella from their beach trip in June."        → SHOTS 13-14: Maya's June 14 photo, side by side
✓ "The timing lines up. The photo is theirs. The caption is about distance." → SHOT 15 recaps SHOTS 01-02, 13-14, 07
✓ "Aimed's read: Likely."                                    → SHOT 16. Allowed: Maya gave context (rule 5)
✓ "Let it go tonight. No reply at two a.m."                 → SHOT 17. A calm option, no comeback
✓ "Nobody posts a sunset at two a.m. by accident."          → SHOT 19. Restates SHOTS 03-04
```

Checked: no labels on Leo, no real people, handles, brands, platforms, or lyrics, and no statistics.

**On screen:**
- "Made-up case. Any resemblance is coincidence." Bottom third, first 3 seconds (`case01_text_disclaimer.png` is a transparent overlay).
- SHOTS 05, 09, and 18 are AI clips, so turn on the AI label when you post.

**Before posting:** the app shots must show what Aimed really returns. Once the live app is running, decode `case01_post_sunset_story.png` with the context "We broke up tonight." If the verdict isn't Likely, use the real result: change "Likely" in the script, and in `render-case01.cjs` for the verdict card, then re-render.

## Block B: Assets

### Rendered (in `assets/`)

| File | What it is | Shots |
| --- | --- | --- |
| `case01_post_sunset_story_marked.png` | Leo's story with the 2:14 AM time circled | 01 |
| `case01_post_sunset_story.png` | The same story, clean | 03, 11 |
| `case01_text_call_ended.png` | "Call ended 12:14 AM" | 02 |
| `case01_text_sunset_time.png` | "A sunset, posted at 2:14 AM" | 04 |
| `case01_text_viewed.png` | "Maya has viewed it 6 times" | 06 |
| `case01_post_caption_zoom.png` | Caption, highlighted | 07 |
| `case01_post_song_zoom.png` | Song sticker, circled | 08 |
| `case01_post_umbrella_zoom.png` | The umbrella in the corner, circled | 12 |
| `case01_post_june_photo.png` | Maya's camera roll, June 14, umbrella circled | 13 |
| `case01_post_match.png` | "Same umbrella." side by side | 14 |
| `case01_text_evidence.png` | The three checks | 15 |
| `case01_verdict.png` | Verdict card: Likely, plus the thumbnail quote | 19 |
| `case01_end.png` | "Screenshot yours. Aimed." | 20 |
| `case01_text_disclaimer.png` | Transparent "Made-up case" overlay | 01 |
| `case01_cover.png` | Cover frame for Shorts and Reels | Cover |

### AI images and clips (Google AI Studio)

Maya is option B (`assets/ref_maya.png`), and Leo's sunset is `assets/ref_sunset.png`, laid out as a story. The paste-ready prompts for the rest are in [`ai-studio-prompts.md`](ai-studio-prompts.md):

| File | Made with | Shots |
| --- | --- | --- |
| `ref_june.png` | Nano Banana, attach `ref_sunset.png` | 13, 14 (send it back so the camera-roll card and side-by-side use it) |
| `ref_maya_sitting.png` | Nano Banana, attach `ref_maya.png` | Start frame for 09 and 18 |
| `case01_clip_maya_pillow.mp4` | Veo, start from `ref_maya.png` | 05 |
| `case01_clip_maya_sits_up.mp4` | Veo, start from `ref_maya_sitting.png` | 09 |
| `case01_clip_maya_phone_down.mp4` | Veo, start from `ref_maya_sitting.png` | 18 |

### App screens (screen-record Aimed)

| File | Screen | What to do |
| --- | --- | --- |
| `case01_app_context.mp4` | Add context | Share `case01_post_sunset_story.png` to Aimed, type "We broke up tonight." Keep the line in frame |
| `case01_app_read.mp4` | Your read | Show the verdict and the first line of evidence |
| `case01_app_whatnow.mp4` | What now? | Tap "What now?", tone Warm, show "Let it go" |

## Block C: Shot plan

```
SHOT 01  [0:00-0:03]  📱 POST    "Two fourteen a.m. Maya's ex posts a sunset."
         case01_post_sunset_story_marked.png + case01_text_disclaimer.png · slide up, slow push in
SHOT 02  [0:03-0:05.5] 🔤 TEXT   "Two hours after the breakup call."
         case01_text_call_ended.png · hard cut, time pops in
SHOT 03  [0:05.5-0:08] 📱 POST   "Nobody watches a sunset at two in the morning,"
         case01_post_sunset_story.png · slow push toward the sun
SHOT 04  [0:08-0:11]  🔤 TEXT    "so this photo was chosen."
         case01_text_sunset_time.png · underline "2:14 AM" in red
SHOT 05  [0:11-0:13]  🎬 CLIP    "Her phone glows on the pillow."
         case01_clip_maya_pillow.mp4
SHOT 06  [0:13-0:16]  🔤 TEXT    "She has watched the story six times."
         case01_text_viewed.png · the 6 ticks up from 1
SHOT 07  [0:16-0:20]  📱 POST    "The caption says, some things look better from far away."
         case01_post_caption_zoom.png · highlight swipes left to right
SHOT 08  [0:20-0:24]  📱 POST    "A song sticker sits underneath: Last Light, by Lowtide Lanterns."
         case01_post_song_zoom.png · red circle draws on
SHOT 09  [0:24-0:28]  🎬 CLIP    "Is it about her, or just a night he can't sleep?"
         case01_clip_maya_sits_up.mp4
SHOT 10  [0:28-0:33]  ✨ APP     "She screenshots it and types one line of context. We broke up tonight."
         case01_app_context.mp4
SHOT 11  [0:33-0:35]  📱 POST    "Then she zooms in."
         case01_post_sunset_story.png · fast push toward bottom left
SHOT 12  [0:35-0:38]  📱 POST    "Bottom left corner, half hidden, a yellow umbrella."
         case01_post_umbrella_zoom.png · red circle draws on
SHOT 13  [0:38-0:40.5] 📱 POST   "The same umbrella from their beach trip in June."
         case01_post_june_photo.png · photo drops in, slight rotate
SHOT 14  [0:40.5-0:43] 📱 POST   "Her umbrella."
         case01_post_match.png · red dotted line draws between them
SHOT 15  [0:43-0:47.5] 🔤 TEXT   "The timing lines up. The photo is theirs. The caption is about distance."
         case01_text_evidence.png · checks appear at 0:43, 0:44.5, 0:46
SHOT 16  [0:47.5-0:51.5] ✨ APP  "Aimed's read: Likely. And the next step is the hardest one."
         case01_app_read.mp4
SHOT 17  [0:51.5-0:55] ✨ APP    "Let it go tonight. No reply at two a.m."
         case01_app_whatnow.mp4
SHOT 18  [0:55-0:57]  🎬 CLIP    "Put the phone face down."
         case01_clip_maya_phone_down.mp4
SHOT 19  [0:57-1:01]  ⚖️ VERDICT "Nobody posts a sunset at two a.m. by accident."
         case01_verdict.png · card pops up, quote fades in
SHOT 20  [1:01-1:03]  END        (no voiceover)
         case01_end.png
```

TOTAL: 8 post shots + 4 text cards + 3 clips + 3 app shots + verdict + end. Average hold: 3.2 s. Longest: 5.0 s.

The plan is ready to edit in CapCut. Add a soft, slow beat under the voiceover, from the app's own music library.

## Posting

**YouTube Shorts title** (under 100 characters):

```
He posted a sunset at 2 a.m. Was it about her? | Is This About Me? Case 01
```

**YouTube description:**

```
Two hours after the breakup, he posted a sunset. At 2:14 a.m. 🌅

Made-up case. Any resemblance is coincidence.
Got your own "is this about me?" Screenshot it. Aimed reads between the lines.
Link in bio.

#Shorts #isthisaboutme #overthinking #situationship #aimedapp
```

**Instagram and TikTok caption:**

```
two hours after the breakup. 2:14 a.m. a sunset. 🌅

is it about her, or just a night he can't sleep? 🤔
the timing. the song. the umbrella in the corner. ☂️

aimed's read: likely. the hardest part? letting it go tonight. 📵

made-up case. any resemblance is coincidence.
free to try. link in bio ↓

#isthisaboutme #overthinking #exposts #situationship #aimedapp
```

**Pinned comment:** `Likely or Unlikely? Be honest, what would you have guessed before the umbrella? 👀`

## Checklist

- [ ] Search the handle `leo.m_` on each platform and change it in `render-case01.cjs` if it's a real account
- [ ] Record the three app shots from the live app, and match the verdict to what Aimed returns
- [ ] "Made-up case" overlay in the first 3 seconds
- [ ] AI label on, for the three Maya clips
- [ ] Music from the platform's library
