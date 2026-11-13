# Rehab Flipper (MVP)

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
- `public/app.js` is the whole interface: estimate, my rates, deal sheet.
- `public/rooms.js` draws the recolorable concept sketch used as the "after".

## Known limits

- The price book and the ZIP labor index are starter values that have not been
  checked against contractor bids or a wage dataset.
- The "after" image is a concept sketch, not a photo-realistic render. No image
  model is connected yet.
- Photo analysis has not been run against the live API in this build.
- There are no user accounts; rate adjustments are saved in the browser only.
