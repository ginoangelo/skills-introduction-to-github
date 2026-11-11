# Deeper News: design review

## Round 2 (after the cinematic player and Class mode)

Reviewed on 11 November 2026, from a new web build (commit `fc9d59d`). I checked phone (390 x 844) and desktop (1280 x 820), in light and dark mode, plus a run with the device's "reduce motion" setting on.

Round 2 screenshots are in `/tmp/claude-0/-home-user-skills-introduction-to-github/09bff0e7-c0af-5cef-946c-8b44371ae4b9/scratchpad/review/r2/`. Below they are named by file only. That folder is temporary.

**In one line:** the player now feels like a real product. Each layer looks different, and the hand-off and Class mode do what they promise. But one new bug matters a lot: **the progress bars at the top of the player have disappeared.**

### R2.1 Did the round 1 fixes work?

| Fix | Works? | Notes | Screenshot |
|---|---|---|---|
| Answer hidden in the side panel during the guess | Yes | Ripples now reads "Guess first, then watch". It comes back after you answer. Clear and friendly. | `desk-dark-04-clip5.png` |
| "Stay here" button on the hand-off | Yes | Tapping it stops the countdown and the hint changes to "Pick a path when you're ready." It is the brightest button on the screen, which is right. | `phone-light-07-handoff.png`, `phone-light-07b-handoff-stayed.png` |
| No countdown with reduce motion on | Yes | With reduce motion on, the hand-off waited more than 8 seconds and did not move on. | `phone-light-26-handoff-reduced-motion.png` |
| Darker light-mode teal and orange | Yes | I re-measured: white on teal 5.80 to 1, teal on the page 5.18 to 1, orange label 5.23 to 1. All now pass the 4.5 to 1 minimum ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). | `phone-light-01-home.png` |
| Home top buttons wrap on phones | Yes, nothing is cut off | "Set location" now sits alone on a second line, which looks a little loose. See Next upgrade 4. | `phone-light-01-home.png` |
| (Not claimed) desktop player hugging the top edge | Not fixed | The player still starts at the very top of the window, 24 px higher than the side panel. | `desk-light-04-clip3.png` |
| (Not claimed) "Boat schools" with no photo | Not fixed | It is still a flat green circle. | `desk-light-02-home-located.png` |
| (Not claimed) "Hear it live from Marlow Creek" playing a Louisville station | Not fixed | | `phone-light-08-radio.png` |

### R2.2 The new player

**What works well**
- **The five layers finally feel different.**
  - Footage zooms in slowly (`phone-light-04-clip2.png`).
  - Voices has a large, warm quote in a serif font (`phone-light-04-clip3.png`).
  - Roots has a sepia wash and "FROM THE ARCHIVE 2019" in big type. It is the most striking screen in the app (`phone-dark-04-clip4.png`).
  - Ripples has a "WHAT FOLLOWED · Day 9" calendar tab (`phone-light-06-ripples.png`).
- **"Deeper ↓ Footage" is now a single clear button** at the bottom. It shows the next layer's name, so people know what they will get. Map / Hear it live / Leads to sit above it as smaller buttons, all 36 px tall (I measured them).
- **Press and hold to pause works.** While I held, the pause button switched to "Play".
- **Hand-off path cards** are taller, the photos are bigger, and the three paths are easy to tell apart (`phone-light-07-handoff.png`, `desk-dark-07-handoff.png`).
- **Dark and light** look the same inside the player, as they should, since video stays dark.

**What needs work**
1. **The progress bars are gone (new bug, high priority).**
   - The layer names (SURFACE FOOTAGE VOICES ROOTS RIPPLES) show at the top, but the thin bars that fill up as a clip plays are invisible. See the zoomed-in view in `phone-zoom-top.png`. So people can no longer see how long a clip has left, or that it will move on by itself.
   - Plain cause: each bar was told to "stretch to fill" inside a column that has no spare height, so it shrinks to zero height. In `src/app/story/[id].tsx`, the `seg` style needs `flex: 1` replaced with `alignSelf: 'stretch'` (keeping `height: 3`).
   - Effort S.
2. **The layer names are 9 px.** That is too small to read on a phone, especially the grey ones (`phone-zoom-top.png`). Use 10–11 px, or show only the current layer's name, larger.
3. **Every layer still uses the same flood photo.** The new looks hide this well on Voices and Roots. Surface, Footage and Ripples still look nearly the same. A second photo per story (or the Explore photos of linked stories for Ripples) would help.
4. **The last clip's hint is wrong.** On Ripples it still says "Swipe up to go deeper", but there is nothing deeper (`phone-light-06-ripples.png`). Say "Swipe up to see where it leads".
5. **"Leads to →" is vague and lets people skip the middle.** It jumps straight to the end, past Roots and the guess. Rename it "Skip to the end" and hide it in Class mode (see R2.3).
6. **Holding to pause has no clear feedback.** Only the small icon in the corner changes (`phone-light-27-holding.png`). Show a short "Paused" label in the middle while the finger is down, and dim the text a little.
7. **The guess screen is unchanged.** It is still plain black, with no ✕ and no progress bar (`phone-light-05-guessed.png`). It now looks plain next to the new layer screens. Put the Roots sepia photo faintly behind it.
8. **The desktop hand-off shows the same three paths twice:** big cards on the left and "Where it leads" in the side panel (`desk-dark-07-handoff.png`). While the hand-off is open, use the side panel for something else, such as "Your chain so far" or the Discuss questions.

### R2.3 Class mode, from a teacher's point of view

I turned it on and played Marlow Creek twice.
- **It does what it says.** The guess appeared both times. There was no countdown (the page stayed put for 7+ seconds). The editor link was gone. A "Discuss" card with three questions appeared above the paths (`phone-light-21-class-handoff.png`). The note under the switch changes to "On: …", which is clear (`phone-light-20-class-on-home.png`).

**What a teacher would ask next**
1. **"Can my students just switch it off?"** Yes. It is one tap on Home, with no lock. Add a simple 4-digit teacher code, or a link that turns it on and hides the switch (for example a "class link" to share in Google Classroom). Effort S–M, free.
2. **"Do I have to set this on 30 devices?"** Yes. It is saved per device. A class link (same idea as above) solves this too.
3. **"Why can students still open live radio?"** "Hear it live" is still there in Class mode. Live talk radio is unscreened, so many schools will not allow it. Hide it in Class mode, or make it something the teacher turns on.
4. **"Can students skip the thinking part?"** Yes. "Leads to →", swiping left and the arrow keys all jump ahead. In Class mode, hide "Leads to →" and turn off swipe-to-next-story, so a story is always watched layer by layer.
5. **The Discuss questions are the same for every story.** They are good general questions. One story-specific question (for Marlow: "Who should pay for levee repairs: the town, the state or the people who live there?") would make it feel prepared. Add an optional `discuss` field per story, and fall back to the general questions.
6. **The Discuss card sits on a dark screen.** That works on a projector, but teachers will want to print or paste it. Add a "Copy questions" button. Later, a printable one-page "lesson sheet" per story would help (free to build).
7. **Placement:** Class mode is the first card on Home for everyone. On a phone, three cards (Class mode, Daily Thread, "Choose your location") push the stories below the fold (`phone-light-01-home.png`). For general users, move the switch to a small "For teachers" link, and show the full card only when Class mode is on.

### R2.4 Daily Thread

- **What works:**
  - The start → reach card is clear.
  - The trail of steps (River freight › Insurance › Marlow Creek › Ostend Mills) shows your route.
  - Stories you've already visited are greyed out and marked "ALREADY VISITED" in words, not color alone.
  - "Show me the route" gives a gentle way out, with "Watch" links on every step (`phone-dark-24-daily-mid.png`, `desk-light-25-daily-gaveup.png`).
  - It is a good, low-pressure daily habit: one puzzle a day, no streak.
- **What to improve:**
  1. **You can solve it without reading anything.** You just tap titles. Add one free "peek" per step that shows the story's Surface clip or its "why" line. Or give a bonus for routes where you watched at least one story. This ties the game to the news, which matters for teachers.
  2. **"Undo step" is easy to miss.** It sits below the path cards, under the bottom of a phone screen once there are three paths (`phone-dark-24-daily-mid.png`). Move it next to the trail of steps at the top, as "← Back one step".
  3. **The Home card's "Play →" is a small text link** (`phone-light-01-home.png`). Make the whole card look tappable with a filled button. The card already opens on tap, but nothing shows that.
  4. **"Share my result" appears even after you give up.** That is fine, but make sure the shared text says "I peeked" honestly. A share card like Wordle's (small colored squares for money, people and place) would spread nicely and costs nothing.
  5. **Daily Thread in Class mode:** a "class race" (everyone gets the same puzzle and compares steps) would be a fun warm-up. Not needed yet.

### R2.5 Next 5 upgrades (ranked)

1. **Bring back the progress bars, and make the layer names readable.** Without them the player feels out of control. Effort S, free. `src/app/story/[id].tsx` (`seg`, `segLabel` styles). Screenshot `phone-zoom-top.png`.
2. **Make Class mode safe and easy to roll out.** Hide live radio and "Leads to", turn off swipe-to-next, and add a teacher code or class link. This is what turns Class mode from a demo into something a school can use. Effort M, free. `src/app/story/[id].tsx`, `src/state/app-state.tsx`, `src/app/index.tsx`. Screenshot `phone-light-21-class-handoff.png`.
3. **Story-specific Discuss questions, plus "Copy questions".** This makes each story feel like a ready-made lesson. Effort S (add a `discuss` field in `src/data/types.ts` and `stories.ts`, and a field in the editor), free.
4. **Tidy Home on phones.** Order: story circles first, then Daily Thread, then location. Move the Class mode switch to a small "For teachers" link (full card only when on). Put "Set location" in the same row as "Explore the map". Effort S, free. `src/app/index.tsx`. Screenshot `phone-light-01-home.png`.
5. **Finish the player polish.** Fix the Ripples hint, rename "Leads to →" to "Skip to the end", add a "Paused" label while holding, give the guess screen a ✕ and a faint background, and center the desktop player. Effort S each, free. Screenshots `phone-light-06-ripples.png`, `phone-light-27-holding.png`, `phone-light-05-guessed.png`, `desk-light-04-clip3.png`.

### R2.6 New bugs and rough edges

| # | What I saw | Where | Screenshot |
|---|---|---|---|
| N1 | Progress bars invisible; only the layer names show (bars have zero height) | Player, all sizes and themes | `phone-zoom-top.png`, `phone-light-03-surface.png` |
| N2 | Layer names at the top are 9 px, and the grey ones are hard to read | Player | `phone-zoom-top.png` |
| N3 | Ripples (the last clip) still says "Swipe up to go deeper" | Player, phone | `phone-light-06-ripples.png` |
| N4 | In Class mode, students can still skip ahead ("Leads to →", swipe left) and open live radio | Player, Class mode | `phone-light-20-class-on-home.png` |
| N5 | Class mode can be switched off by anyone with one tap, and is per device | Home | `phone-light-20-class-on-home.png` |
| N6 | Three cards stacked at the top of phone Home push the stories below the first screen | Home, phone | `phone-light-01-home.png` |
| N7 | Desktop hand-off shows the three paths twice (cards and side panel) | Hand-off, desktop | `desk-dark-07-handoff.png` |
| N8 | The photo credit ("Photo: U.S. Army Corps of Engineers…") can be reached with the Tab key, as if it were a button | Player, keyboard | found by tabbing through the player |
| N9 | Holding to pause gives almost no visible feedback | Player | `phone-light-27-holding.png` |
| N10 | Daily Thread: the Home card's "Play →" link is small; "Undo step" is below the bottom of the phone screen | Home, Daily | `phone-light-01-home.png`, `phone-dark-24-daily-mid.png` |

Housekeeping note: in round 1, my helper scripts were written straight into the shared `scratchpad/` folder, and one of them overwrote the builder's `scratchpad/serve.js`. Sorry about that. In round 2, everything I made is inside `scratchpad/review/` only.

---

*Round 1 (the original review) follows, unchanged.*

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
