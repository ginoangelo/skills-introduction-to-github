# Deeper News: design review

Reviewed on 11 November 2026, from a fresh web build of `deeper-news-app` on phone (390 x 844, plus a 320-wide check) and desktop (1280 x 820), in light and dark mode.

Screenshots are in `/tmp/claude-0/-home-user-skills-introduction-to-github/09bff0e7-c0af-5cef-946c-8b44371ae4b9/scratchpad/review/`. Below they are named by file only (for example `phone-light-04-story.png`). That folder is temporary, so copy anything you want to keep.

Note: another agent was adding a "Daily Thread" puzzle card to Home while I worked. My build was made before it showed up, so this review does not cover it.

---

## 1. Overall verdict

The app already feels calm, clean and trustworthy. The teal-and-ink colors, the clear type and the honest "Sample stories · fictional" label suit a news product for schools. The big gap is that every clip in a story shows the **same photo** with the words "VIDEO SLOT", so the five layers look and feel identical. The core ideas (the guessing game, the chains, the map) are strong but sit behind small, quiet controls. The next step is to make each layer look different, make the chain feel like a journey, and fix a handful of accessibility problems that a school buyer will check.

---

## 2. Top 10 upgrades (ranked by impact)

### 1. Stop the desktop side panel from giving away the "What happens next?" answer
- **What to change:** While the guess is on screen, hide the title of the last clip (Ripples) in the "In this story" panel. Show "?" or "Guess first" instead. Do the same in the phone "Story map" sheet.
- **Why:** On desktop the panel shows "RIPPLES · State hearing on emergency flood funds" right next to the three choices, and that is the correct answer. The game is pointless on desktop, which is where classrooms use the app. See `desk-light-06-predict.png`.
- **Touches:** the story player, `src/components/story-map.tsx` (pass in whether the guess is still open) and `src/app/story/[id].tsx`.
- **Effort:** S. **Cost:** free.

### 2. Give students and teachers a way to stop the 6-second auto-advance (and switch it off by default for schools)
- **What to change:** On the hand-off screen, add a visible "Stay here" / pause button next to the countdown. Add a setting, "Play the next story automatically", that is **off** by default. Turn it on only for adults who choose it. When it is off, show the three paths with no timer.
- **Why:** Right now the timer always runs. The only way to stop it is the space bar on a computer, and phones have no way at all. In my test, the next story started on its own after 6 seconds, even with "reduce motion" turned on (`phone-light-15-after-countdown.png`, `phone-light-07b-handoff-later.png`). Your own idea log says "off by default for minors". The accessibility rules also say a time limit must be possible to turn off, extend or adjust ([WCAG 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)).
- **Touches:** the hand-off screen in `src/app/story/[id].tsx` and app settings in `src/state/app-state`.
- **Effort:** S–M. **Cost:** free.

### 3. Make each of the five layers look different, even without video
- **What to change:** Until real clips exist, give each layer its own look. For example:
  - **Surface:** a full photo with a big headline.
  - **Footage:** the photo, tightly cropped, with a slow zoom (no zoom when reduce motion is on).
  - **Voices:** a large quote card with the speaker's role.
  - **Roots:** a sepia "archive" card with the year in huge type (this is half done already).
  - **Ripples:** a dated timeline card.

  Remove the "VIDEO SLOT · Illustrative photo until a clip is added" text for viewers. Keep it in the editor only.
- **Why:** Every clip shows the same flood photo, so going "deeper" looks like nothing changed (`phone-light-04-story.png`, `phone-dark-05-clip3.png`, `phone-light-05-clip4.png`). "Video slot" is a note from the builder, not something a reader needs.
- **Touches:** `src/components/video-placeholder.tsx`, plus an optional `quote` field on clips in `src/data/types.ts`.
- **Effort:** M. **Cost:** free.

### 4. Fix the light-mode contrast on teal buttons, teal links and the orange "sample" label
- **What to change:** Darken the light-mode teal `accent` from `#0A8A81` to roughly `#087269`, and the orange `warm` from `#B4621A` to roughly `#9A5212`. Then check them again with a contrast checker.
- **Why:** I measured the colors in `tokens.ts`. White text on teal is 4.23 to 1. Teal text on the page background is 3.78 to 1 ("Open the story editor →", "Follow", "Copy and edit"). The orange label is 3.99 to 1. Small text needs at least 4.5 to 1 ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). School districts often ask for proof of accessibility before they buy. See `phone-light-01-home.png`.
- **Touches:** `src/theme/tokens.ts` only.
- **Effort:** S. **Cost:** free.

### 5. Fix the cut-off buttons at the top of Home on phones
- **What to change:** On phones, put the logo on one line. Put a row of three equal buttons under it: Explore · Location · (later) Listen. The "Sample · fictional" label can sit above the story circles or in the footer.
- **Why:** On a 390-wide phone, the location button is cut off at the right edge. On a 320-wide phone, "Explore the map" is cut off too. That means a phone user can't see or tap "Set location" from the top bar (`phone-light-01-home.png`, `phone320-home.png`).
- **Touches:** `src/app/index.tsx` (the `topbar` / `topRight` styles).
- **Effort:** S. **Cost:** free.

### 6. Show the chain as a visible trail
- **What to change:** At the top of the hand-off screen, and in the player header, show the stories already in this chain as small linked circles: Marlow Creek → Flood budget → … Tapping one jumps back to it. At the end of a chain (or on "Back to Today"), show a short summary card, such as "You followed the money across 3 stories".
- **Why:** Chains are your main difference from other news apps, but today a chain only shows up as small grey text ("story 2 in your chain"). A visible trail rewards curiosity without a streak or outrage hook. Ground News makes its unique idea visible on every story with a "bias bar" ([Ground News help](https://help.ground.news/en/articles/245249)). Your chain could play the same role.
- **Touches:** `src/app/story/[id].tsx` (header and hand-off), with data from `chain` in app state.
- **Effort:** M. **Cost:** free.

### 7. Move Threads up on phones and make the Follow buttons easier to tap
- **What to change:** On phones, put a "Threads you follow" strip (sideways scrolling) right under the story circles. Leave the full list at the bottom. Make the Follow buttons at least 36–44 points tall. Make the small story tags inside a thread real buttons that can be reached with the keyboard.
- **Why:** On a phone, Threads only appears after "You're caught up" and the editor link, about four screens down (`phone-light-scroll-home-4.png`). Follow buttons are 26 pixels tall (I measured them). That meets the legal minimum of 24 pixels ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)), but it is below the 44-point size Apple recommends ([summary](https://frontendchecklist.io/rules/accessibility/touch-targets)). The story tags inside threads have no button role, so keyboard and screen-reader users can't use them.
- **Touches:** `src/app/index.tsx` and `src/components/home-parts.tsx`.
- **Effort:** S–M. **Cost:** free.

### 8. Make the guessing game feel like a game
- **What to change:**
  - Keep a small progress bar and a close (✕) button on the guess screen.
  - Show the story photo faintly behind it.
  - After a guess, show a one-line "why" for the real answer.
  - Keep a gentle running score on Home ("You called 3 of 5 this week").
  - Make sure all three choices are written in the same style. Today the real answer reads like a clip title ("State hearing on emergency flood funds"), while the decoys read like full sentences, so it is easy to spot.
- **Why:** The guess screen is plain black with no way out and no context (`phone-light-06-predict.png`, `phone-light-13-guess-answered.png`). A small weekly score gives people a reason to come back without a punishing streak. Duolingo found it needed "streak freezes" to soften streaks ([Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)), so a weekly count is the gentler choice for teens.
- **Touches:** `PredictOverlay` in `src/app/story/[id].tsx`, the decoy text in `src/data/stories.ts`, and the counter in `src/app/index.tsx`.
- **Effort:** S–M. **Cost:** free.

### 9. Add a "Class mode" switch that teachers can see
- **What to change:** A simple toggle on Home or in settings, "Class mode", that does four things:
  - turns off auto-advance;
  - always shows the guessing game, even on repeat views;
  - adds a "Discuss" prompt card after Ripples (the hand-off question, written as a class question);
  - hides the editor link.
- **Why:** Schools are your first paying customer. A visible mode tells a teacher in the first minute that the app was made for them. It also bundles fixes 2 and 8 into a single thing you can sell.
- **Touches:** `src/state/app-state`, `src/app/index.tsx`, `src/app/story/[id].tsx`.
- **Effort:** M. **Cost:** free.

### 10. Explore: color the lines by path type and give the empty side panel a job
- **What to change:**
  - Color each link line by its path type (money, people or place), with a small legend.
  - Before anyone picks a story, have the side panel suggest one: "Start here: Marlow Creek, 4 min".
  - On phones, cut the empty space above the first row and keep the "Near / Elsewhere / Around the world" labels clear of lines.
- **Why:** Every line is the same grey, so the map shows *that* stories connect but not *how* (`desk-light-09-explore.png`). The desktop panel is mostly empty until you click. On phones, lines cross the section labels and there is a large blank area at the top (`phone-light-09-explore.png`, `phone-light-16-explore-selected.png`).
- **Touches:** `src/app/explore.tsx`, `src/data/explore-layout.ts`.
- **Effort:** M. **Cost:** free.

---

## 3. Redesign ideas (bolder)

### A. "Front page" Home: one lead story, then your rings
- **Layout:**
  - **Top:** one large lead card, about 60% of the phone screen. It shows the photo, the headline, the five layer names as a row of dots, and a big "Start · 4 min" button. On desktop it sits beside the Threads column.
  - **Under it:** the story circles, as today.
  - **Next:** a "Your chain so far" strip, if you have one.
  - **Then:** the Near / Country / World sections, as more compact cards (photo, headline, place, minutes). Drop the five layer chips from every card, since every story has the same five.
- **Interaction:**
  - The lead story is the nearest story you haven't seen.
  - Long-press (or hover on desktop) a card to see "Connects to…" with small photos.
  - Seen stories get a check mark as well as grey text, so the "seen" state doesn't rely on color alone.
- **What stays the same:** the location sections, story circles, Threads, the colors and the fictional-samples label.

### B. Cinematic player: the layer *is* the design
- **Layout:**
  - Use the whole phone screen.
  - The five progress bars become five labelled segments: S F V R R, with the current one filled.
  - Text sits in the lower third over a soft fade, not a flat grey box.
  - Each layer gets its own treatment:
    - **Roots:** grain and sepia, with the year in large serif type.
    - **Voices:** a quote card.
    - **Ripples:** a "Day 9" calendar tab.
  - Swap the moving "Go deeper ↓" button for one large, steady "Deeper ↓" button bottom-center. Put "Map", "Live" and "Leads to" as icon buttons with text labels in a row above it.
- **Interaction:**
  - Swipe up = go deeper (it matches "down the layers").
  - Press and hold anywhere = pause, like most story apps.
  - On the hand-off, the three paths fly in as three tall cards, side by side on desktop and stacked on phones. In class mode there is no countdown.
- **What stays the same:** five clips, edge tap zones, Listen, Hear it live, the desktop side panel (with fix 1), and the keyboard shortcuts.

### C. Playful Explore: "the web of the day"
- **Layout:**
  - **Desktop:** keep the rings, but draw a real, simple world outline (or a river valley sketch for local stories) faintly behind them, so "near", "country" and "world" read as places.
  - **Phone:** a vertical "subway map". Each story is a station, and money, people and place are three colored lines.
- **Interaction:**
  - Tap a story to light up its lines.
  - Tap a line to "ride" it: the app plays that chain in order.
  - Watched stations fill in, plus a tiny check, so color isn't the only signal.
  - Show a progress line: "You've visited 4 of 10 stations today."
  - For classes, add a "Print this map" button that makes a worksheet with blank stations.
- **What stays the same:** the ring and row layout data in `explore-layout.ts`, the side preview panel and "Watch this story".

---

## 4. Bugs and rough edges

| # | What I saw | Where | Screenshot |
|---|---|---|---|
| 1 | Desktop side panel shows the correct answer during "What happens next?" | Player, desktop | `desk-light-06-predict.png` |
| 2 | Hand-off countdown can't be paused on a phone, and runs even with reduce motion on | Hand-off | `phone-light-07-handoff.png`, `phone-light-15-after-countdown.png` |
| 3 | Location button cut off at the top right of Home (also "Explore the map" at 320 wide) | Home, phone | `phone-light-01-home.png`, `phone320-home.png` |
| 4 | The desktop player hugs the very top of the window, while the side panel is centered (they don't line up) | Player, desktop | `desk-light-04-story.png` |
| 5 | Same photo on all five clips, plus builder text "VIDEO SLOT · Illustrative photo until a clip is added" shown to readers. The no-photo fallback even says "Add a YouTube clip in src/data/stories.ts" | Player | `phone-light-05-clip4.png`; code in `src/components/video-placeholder.tsx` |
| 6 | "Boat schools" has no photo: a flat green circle on Home and Explore | Home, Explore | `desk-light-01-home.png`, `desk-light-09-explore.png` |
| 7 | Light-mode contrast below 4.5 to 1: white on teal (4.23), teal links (3.78), orange "sample" label (3.99) | Whole app, light | `phone-light-01-home.png` |
| 8 | Guess screen has no close button, no pause and no progress bar, so you're stuck until you answer | Guess | `phone-light-06-predict.png` |
| 9 | Real answer is worded differently from the decoys, so it's easy to spot | Guess | `phone-light-06-predict.png` |
| 10 | "Hear it live from Marlow Creek" plays WFPL Louisville. Mixing a made-up town with a real station may confuse people; say "from near Louisville, Kentucky" | Radio sheet | `phone-light-08-radio.png` |
| 11 | Radio sheet covers the clip title and the buttons on desktop ("…gives way" is cut) | Radio sheet | `desk-dark-08-radio.png` |
| 12 | In my test, no station played ("This station isn't answering right now"). That is probably my locked-down network, but please check on a real phone | Radio sheet | `phone-light-08-radio.png` |
| 13 | Header title is cut to "The Marlow Creek l…" on phones; the topic and place line is also cut | Player, phone | `phone-light-04-story.png`, `phone320-story.png` |
| 14 | "Where it leads →" appears twice on the last clip area, and the buttons wrap to two rows on phones | Player | `phone-light-04-story.png` |
| 15 | Follow buttons are 26 px tall; "Open the story editor →" is only 17 px tall | Home | measured; `phone-light-scroll-home-4.png` |
| 16 | Small story tags inside Threads are not marked as buttons, so they're hard to reach by keyboard or screen reader | Home | `phone-light-scroll-home-5.png` |
| 17 | "Harlan River flooding" already shows "Following" on a brand-new visit. If that's on purpose, say why ("Suggested for you") | Home | `desk-light-01-home.png` |
| 18 | Phone location picker has no close or "Not now" before a city is chosen | Location | `phone-light-02-location-picker.png` |
| 19 | "Copy and edit" from Marlow: no nearest city is selected and the photo comes up blank, so the copy loses its photo | Editor | `desk-dark-11-editor-new.png` |
| 20 | Editor page title says "New story" even when copying; "Copy of Marlow Creek" would be clearer | Editor | `phone-light-11-editor-new.png` |
| 21 | Editor: long placeholder text is cut off ("copy the link at the mo…"), and the "Why it's here" box clips its last line | Editor, phone | `phone-light-scroll-editor-new-4.png`, `phone-light-scroll-editor-new-2.png` |
| 22 | Phone editor footer: "Save" sits under "Save and watch", not beside it, and looks unbalanced | Editor, phone | `phone-light-11-editor-new.png` |
| 23 | Explore on phone: link lines run through the "Around the world" and "Elsewhere in the US" labels | Explore, phone | `phone-light-09-explore.png` |
| 24 | Explore desktop says "Hover a story", which means nothing on a touch laptop or to keyboard users | Explore | `desk-light-09-explore.png` |
| 25 | Watched stories are shown only by an orange ring on Explore and grey text on Home (color only) | Explore, Home | `desk-light-16-explore-selected.png`, `phone320-home.png` |
| 26 | Behind the guess and hand-off screens, the player buttons (like "Hear it live") are still reachable by screen readers | Guess, hand-off | found in the page structure during testing |
| 27 | Small: the web page's head has `httpEquiv` instead of `http-equiv` (comes from the Expo template, harmless) | `dist/index.html` | — |

Good things I checked: the keyboard focus ring shows on player buttons (`desk-light-17-player-focus.png`), the guess result uses words as well as color ("Your guess", "What happened"), the audio wave respects reduce motion, and dark mode reads well everywhere.

---

## 5. Quick wins (each under 30 minutes)

1. Darken `accent` and `warm` in light mode in `src/theme/tokens.ts` (bug 7).
2. Hide the Ripples title in the side panel and story map while guessing (bug 1).
3. Add a "Stay here" button to the hand-off that pauses the countdown (bug 2, first step).
4. Skip the auto-advance when the device has reduce motion turned on. React Native's `AccessibilityInfo.isReduceMotionEnabled` is already used in `audio-clip.tsx`. ([MDN on reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion))
5. Hide "VIDEO SLOT" and "Add a YouTube clip in src/data/stories.ts" from readers. Keep only the photo credit.
6. Add a photo for Boat schools, or use its story color with an icon, not a flat circle.
7. Let the Home top bar wrap under the logo on phones so nothing is cut off.
8. Set `alignSelf: 'center'` on the desktop player so it lines up with the side panel.
9. Make Follow buttons and the editor link taller (`paddingVertical: 10`) and give thread tags `accessibilityRole="button"`.
10. Change "Hover a story" to "Click or tap a story" on Explore.
11. Add a ✕ to the guess screen, and a "Not now" to the location picker.
12. Retitle the copied-story editor to "Copy of …", and keep the photo and nearest city when copying.
13. Rename "Hear it live from Marlow Creek" to name the station's real city.
14. Add a check mark next to watched story circles, not just a grey ring.

---

### Sources
- W3C, Understanding SC 2.2.1 Timing Adjustable: https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html
- W3C, Understanding SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- W3C, Understanding SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Touch target sizes (Apple 44 pt, Android 48 dp summary): https://frontendchecklist.io/rules/accessibility/touch-targets
- MDN, prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Ground News, how to read the Bias Bar: https://help.ground.news/en/articles/245249
- Duolingo, how the streak builds habit: https://blog.duolingo.com/how-duolingo-streak-builds-habit
