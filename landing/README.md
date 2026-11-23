# Aimed landing page

A single page with a waitlist signup: [`index.html`](index.html), plus the app screens and link preview image in [`img/`](img/).

- **Try it locally:** `cd backend && npm run local`, then open http://localhost:8787. Signups go to a temporary list in memory.
- **Put it online:** deploying the backend (`cd backend && npm run deploy`) uploads this folder and prints `LandingUrl`. See [`backend/README.md`](../backend/README.md) for your domain and for exporting the list.
- **Edit it:** change the text in `index.html` and deploy again. Prices, the FAQ, and the "month of Pro free" offer for early members are all in that file.
- **Track where signups come from:** link to `?ref=instagram`, `?ref=tiktok`, and so on. The value is saved with each email.
