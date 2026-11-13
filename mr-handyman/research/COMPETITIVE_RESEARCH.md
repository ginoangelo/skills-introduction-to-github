# Mr. Handyman: Market & Competitor Research

*Compiled November 13, 2026. Sources are listed at the bottom. Competitor claims come from their own App Store listings and websites. I haven't tested their apps.*

## TL;DR

1. **The idea is validated, and the market is early.** At least 8 small AI "photo → home repair diagnosis" apps exist. Every one I could check has **0–3 App Store ratings**, so nobody owns this category yet.
2. **Demand is real and moving our way.** In Q1 2026, **62% of homeowners chose to repair rather than replace** (up from 51% the previous quarter). **29% plan to spend less** (up from 19%). Repair projects held steady at 68% of completed projects while discretionary spending dropped. This is a "save money by fixing it yourself" market.
3. **Price benchmark: $4.99/month or $29.99/year** (FixMynd), with a free tier of about 3 diagnoses a month.
4. **Our gap: the money side.** Competitors list "rough costs." None of them leads with a **line-by-line budget next to a pro quote and the dollar amount you save**. Mr. Handyman is built around that, plus honest DIY-or-pro advice.
5. **⚠️ Name risk (important):** "Mr. Handyman" is a **registered trademark of Mr. Handyman LLC**, a national handyman franchise owned by **Neighborly**. Using it for a home-repair app is very likely infringement. **Talk to a trademark attorney before launching publicly.** The code keeps the name in a few easy-to-change places so a rebrand is quick (see the README).

---

## Competitor landscape

### A. AI photo-diagnosis apps (direct competitors)

| App | What it does | Pricing | Traction | Notable |
|---|---|---|---|---|
| **FixMynd** (iOS) | Photo + note → fix report with difficulty badge (Easy / Intermediate / Advanced / Call a Pro), materials with rough costs, steps, YouTube link | Free 3/mo; Pro **$4.99/mo or $29.99/yr** | No rating count shown | "What to tell the contractor" verbatim paragraph; 10 categories; on-device history; uses Google Gemini |
| **SpotFix AI** (iOS) | Photo/video diagnosis, safety check, steps, voice and AR guidance, **book local pros** | Freemium, price not listed | **3 ratings, 5.0★** | Marketplace angle; 111 MB app |
| **AI Home Repair – DIY Fix Guide** (iOS) | Photo → suggestions, confidence score, chat assistant, repair log export | Freemium | Not enough ratings to show | Generic; tracks users across apps (privacy label) |
| **KanDu** (web) | Diagnosis from photo, **video or sound**; parts lists; live expert backup | Free diagnosis advertised | Unknown | Also covers automotive |
| **homemd.ai** (web) | Photo → diagnosis + **exact Home Depot part with live price** | Unknown | Product Hunt launch | Strong retail/affiliate angle |
| **FinderlyFix** (web) | Diagnosis + **local pricing + contractor routing** | Unknown | Unknown | Says clearly that estimates aren't guarantees |
| **Fixel** (web) | Free browser tool: safe to DIY / DIY with caution / call a pro | Free | Unknown | Always routes electrical, gas and structural work to a pro |
| **FixItHome** (web) | AI DIY diagnosis | **2 free diagnoses per day** | Unknown | |
| **HomeZada** | Home management app that recently added AI photo troubleshooting | Subscription | Established brand | Incumbent adding the feature |

### B. Hire-a-pro marketplaces (indirect: where users go when DIY fails)

**Angi, Thumbtack, TaskRabbit, Handy, Porch, Frontdoor.** They don't help you fix anything yourself; they sell leads to contractors. Common complaints in 1–3★ reviews (early 2026 analysis):
- **The in-app quote doesn't match the final invoice**
- Contractors **cancel shortly before the appointment**
- Property damage during jobs, and damage claims that don't get resolved

👉 **Opportunity:** Mr. Handyman tells users **what a fair price is before they call anyone**, and gives them a message and questions to send the contractor. That protects them from the quote-vs-invoice problem. Later, this is also a path to revenue through referral fees.

### C. Free substitutes (the real competition)
YouTube, Google, Reddit (r/HomeImprovement, r/DIY), ChatGPT/Gemini/Claude used directly, Home Depot/Lowe's how-to guides, and asking a handy relative. Our edge over a general chatbot: an organized report (budget table, checklist, safety gates, contractor script), saved history, and a camera-first flow.

---

## What competitors' screenshots tell us

Screenshots of the App Store listings are in [`screenshots/`](screenshots/). The other competitor websites were blocked by this environment's network, so only the App Store pages were captured.

- **FixMynd** ([screenshot](screenshots/appstore-fixmynd.png)): four-panel story: *"Snap Any Home Repair Problem" → "DIY or Call a Pro — You'll Know" → "What to tell your plumber or electrician" → category coverage*. Clean report screen with a difficulty badge, cost and materials.
- **SpotFix AI** ([screenshot](screenshots/appstore-spotfix.png)): marketing headline *"Know if it's a quick DIY fix or a pro job — before you spend a dime."*
- **AI Home Repair** ([screenshot](screenshots/appstore-ai-home-repair.png)): generic "scan → AI result" positioning.

**Pattern:** everyone sells the *DIY-vs-pro verdict*. Nobody leads with *the money*. Our positioning is: **"See exactly what it costs to fix it yourself vs. what a pro charges, line by line."**

---

## What users want (based on reviews and complaints)

| User need | Evidence | How the MVP covers it |
|---|---|---|
| Know if I can do this myself | Every competitor's headline | Verdict badge: Easy / Moderate / Advanced DIY / Call a pro / Emergency |
| Not get ripped off by contractors | Marketplace reviews: quote ≠ invoice | Pro price range, alternatives, "questions to ask before hiring" |
| Know what to buy | FixMynd, homemd | Itemized materials and tools, price range, where to buy, "you probably own this" |
| Stay safe | Fixel and SpotFix disclaimers | Hard safety rules in the AI prompt, emergency banner, "stop and call a pro if…" |
| Explain the problem to a pro | FixMynd's standout feature | Copy-paste contractor message |
| Privacy | FixMynd discloses where photos go | No server-side storage; history stays on the device |
| Content I'm paying for actually loads | Subscription complaints on repair apps | MVP has no paywall yet. Keep billing simple when it's added |

---

## Differentiators to build next (roadmap)

1. **Follow-up chat on a report** ("I took the handle off and see a clip, now what?"). Turns one-off answers into a guided repair.
2. **Shopping links** to Home Depot / Lowe's / Amazon with affiliate revenue (homemd.ai's angle).
3. **"Find a pro" handoff** that sends the contractor message to vetted local pros. Lead-gen revenue (SpotFix / FinderlyFix angle).
4. **Video / sound diagnosis** (KanDu): a running toilet, a squeaky furnace.
5. **Home profile**: save house age, fixture brands and past repairs for better answers (HomeZada angle).
6. **Native iOS/Android wrapper** (Capacitor) to get into the app stores. The PWA already installs on phones today.
7. **Accounts + billing** (Stripe) to enforce the Free (3/mo) and Pro ($4.99/mo) tiers.

## Market numbers

- U.S. DIY home-improvement products market: **about $313.6B in 2025** (HIRI).
- Global estimates vary a lot by definition: **about $0.87–1.0T** (various research firms). Treat them as directional.
- Homeowner activity in Q1 2026: 40% did a project (down from 44%), but **repair work held** and **repair-over-replace jumped to 62%**.

---

## Sources

- FixMynd, App Store: https://apps.apple.com/us/app/fixmynd-diy-home-repair-ai/id6766394491
- SpotFix AI, App Store: https://apps.apple.com/us/app/spotfix-ai-diy-home-repair/id6775034761
- AI Home Repair – DIY Fix Guide, App Store: https://apps.apple.com/us/app/ai-home-repair-diy-fix-guide/id6749599820
- Best AI Home Repair Tools in 2026 (homemd.ai guide): https://homemd.ai/guides/best-ai-home-repair-tools
- 7 Best Home Repair Apps in 2026 (Toolbox): https://toolbox.repair/best-home-repair-apps
- Fixel: https://fixel-ai.vercel.app/
- KanDu: https://www.getkandu.com/
- FinderlyFix: https://www.finderlyfix.com/
- FixItHome: https://fixityourselfonline.com/
- homemd.ai on Product Hunt: https://www.producthunt.com/products/homemd-ai
- Marketplace complaints analysis (Unstar): https://unstar.app/blog/taskrabbit-thumbtack-angi-handy-porch-home-service-apps-ranked-2026
- Thumbtack vs Angi (Housecall Pro): https://www.housecallpro.com/resources/thumbtack-vs-angi/
- HIRI homeowner trends, Q1 2026: https://www.hiri.org/blog/homeowner-project-activity-q1-2026
- HIRI market size: https://www.hiri.org/research/u.s.-size-of-the-home-improvement-products-market-2026-q1-hiri
- Mr. Handyman trademark footer: https://www.mrhandyman.com/rockwall/config-files/_footer-config
- Neighborly, Mr. Handyman brand page: https://www.neighborlybrands.com/our-brands/mr-handyman/
- Mr. Handyman on Wikipedia: https://en.wikipedia.org/wiki/Mr._Handyman
