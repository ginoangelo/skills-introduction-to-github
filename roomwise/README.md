# Roomwise AI (MVP)

Photograph a kitchen or bathroom, enter the ZIP code, and get three rehab
packages (cosmetic, mid-grade, full), each with an itemized scope, a materials
total, a labor range for the area, a contingency and a deal sheet.

## Run it

```bash
npm install
npm start          # http://localhost:3000
```

Without an AI key the app runs on sample rooms. To analyze real photos, set
`ANTHROPIC_API_KEY` in the environment before `npm start` (see `.env.example`).

```bash
npm test           # pricing engine tests
npm run mockup     # builds dist/mockup.html, the single-file clickable mock-up
```

## How it works

- `lib/analyze.mjs` sends the photo to Claude and gets back measurements,
  condition notes, and a scope and color palette for each package. The model
  never produces prices.
- `public/pricing.js` turns that into dollars using the price book in
  `public/catalog.js`, the ZIP labor index and the user's own adjustments.
- `public/app.js` is the whole interface: a three-step start (look, room,
  plan), multi-room projects, the before-and-after slider, the DIY plan, rates,
  and the deal sheet and scope of work.
- `public/rooms.js` draws the recolorable concept sketch used as the "after".
- `public/looks.js` holds the five looks; `public/voice.js` and `lib/command.mjs`
  turn spoken or typed requests into changes.
- `public/diy.js` holds the do-it-yourself guides, the hire-a-pro reasons and
  the store search links for each price book item.

## Known limits

- The price book and the ZIP labor index are starter values that have not been
  checked against contractor bids or a wage dataset.
- The "after" image is a concept sketch, not a photo-realistic render. No image
  model is connected yet.
- Photo analysis has not been run against the live API in this build.
- Store links open a search at the retailer. No live store prices are pulled,
  because the big retailers offer no free product-price API.
- DIY guides are general guidance, not a substitute for local code or the
  product's instructions.
- The ZIP labor index is still the starter table. `scripts/build_labor_index.py`
  rebuilds it from free BLS wage data and Census ZIP files, but needs a free
  BLS key (`BLS_API_KEY`) because the keyless daily cap was already used up.
- There are no user accounts or share links. A project is saved in the browser
  on one device; sharing is by PDF or copied text.
