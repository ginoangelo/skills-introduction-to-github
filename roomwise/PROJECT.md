# Roomwise AI: project brief

Read this first when picking the project back up. Last updated 2026-11-13.

## The idea

A phone app for house flippers and wholesalers. Photograph a room or the
outside of a house, enter the ZIP code, pick a look, and get three rehab packages
(cosmetic, mid-grade, full), each with a picture of the finished look, an
itemized list of materials and work, a labor range for the area, and a total
with a buffer for surprises.

**Who it is for:** new and part-time flippers and wholesalers doing their first
one to ten deals, who make offers without a contractor on call.

**Why it is different:** design apps give pictures and estimator apps give a
repair number. Roomwise AI puts the look, the itemized cost, the
do-it-yourself plan and the offer math in one place.

## Where things live

- Code: this folder (`roomwise/`). Run with `npm install` then `npm start`.
  See `README.md` for how the code is organized.
- Clickable mock-up: https://claude.ai/artifact/15D5w6SbaaQuqwvsgT4DVY
- Currently stored on branch `ccr-f4ce9f41-6bn4z5` of the
  `skills-introduction-to-github` repository, waiting to move to its own
  repository.

## What is built and tested

- Guided start: Look, Room, Plan.
- Five looks that restyle every room in the project.
- Multi-room projects with a combined total.
- Five room types: kitchen, bathroom, bedroom, living room and exterior.
- Three packages per room, with editable quantities and prices.
- Before-and-after slider (the "after" is a recolored sketch).
- Talk or type commands, with spoken replies.
- Do-it-yourself mode: jobs rated easy to hire-a-pro, step-by-step guides, a
  sequenced DIY plan with one tool list and shopping list.
- Store search links to Home Depot and Lowe's on each item.
- Deal sheet with a 70% rule maximum-offer check, and a scope of work for
  contractor bids.
- Bid check: enter contractor bids and compare each with the estimate range.
- Sample "before" photos loaded from an untracked `private/` folder.
- Saving on one device, copy-as-text and PDF export.

## What is written but never run

- Photo analysis by Claude (`lib/analyze.mjs`). Needs an Anthropic API key.
- Free-form voice understanding by Claude (`lib/command.mjs`). Same key.
- Labor index from government wage data (`scripts/build_labor_index.py`).
  Needs a free BLS key in the `BLS_API_KEY` variable.

## What is not built

- A photo-realistic "after" image of the actual room. Needs an image service
  (candidates: Google Gemini image models, FLUX) and a key.
- Accounts and share links. Needs hosting with a database.
- Installing to a phone home screen, and hosting.

## Known weak points

- The price book and DIY hour estimates are starter numbers written by Claude,
  not checked against real contractor bids. Checking them against three to
  five real jobs is the most valuable next step.
- Competitors already show realistic redesigned photos: Renovate AI, Remodel
  AI, HomeZada. Estimara does flipper estimates from photos. Renovio uses the
  same government wage data for labor.
- No trademark or web address check has been done on the name "Roomwise".
  A contractor app called "SimplyWise: Cost Estimator" has a similar name.

## Decisions waiting on the owner

1. Get the Anthropic API key and the free BLS key.
2. Choose an image service for realistic renders.
3. Choose where to host the app.
4. Supply real job costs to check the prices.

## Ideas considered and set aside

- Antique and collectible valuation from a photo: crowded, and sold-price
  data from eBay is restricted.
- An AI agent store for small businesses: dominated by large platforms.
- Prospecting tool that turns PDFs and lists into property cards: dropped by
  the owner. Automated scanning of Google Street View raised terms-of-service
  concerns.

## How to resume

Start a session on this code and say: "Read PROJECT.md and continue Roomwise
AI." The four decisions above are the natural next steps.
