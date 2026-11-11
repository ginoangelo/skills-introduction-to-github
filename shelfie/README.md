# Shelfie

Snap your fridge, freezer or cabinets. Shelfie reads the shelves and the labels, keeps a pantry for you, suggests dishes you can cook right now, and tells you which few ingredients would unlock the most new dishes.

## What it does

- **Scan**: take up to 4 photos per scan. A vision model lists every food item, reading brands and best-by dates off labels. You review and correct the list before anything is saved. Photos are never stored.
- **Pantry**: items grouped by fridge, freezer and cabinet, with search, manual add/edit and "use soon" badges.
- **Cook**: dishes marked *Ready now* or *Need N more*, filtered by meal, time and mood, respecting each user's diet and allergies. Save favourites.
- **Smart buys**: ingredients you don't have that would unlock the most dishes given what you do have.
- **Shopping list**: add missing ingredients in one tap, tick them off, then move bought items straight into the pantry.
- **Accounts**: each user has their own login and their own data.

## Run it

Requires Node 22.13 or newer.

```bash
cd shelfie
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm run dev                 # web on http://localhost:5173, API on :8787
```

Production: `npm run build && npm start` serves the API and the built web app from one process on `PORT` (default 8787). Load the variables from `.env` into the environment yourself, for example `node --env-file=.env server/index.js`.

Without `ANTHROPIC_API_KEY` the app runs in **demo mode**: scans return a sample kitchen and dish ideas come from a small built-in recipe book, so the whole flow can be tried first.

Tests: `npm test`.

## How it is put together

| Part | Where | Notes |
|---|---|---|
| Web client | `web/` | React + Vite, mobile-first, installable to a phone home screen |
| API | `server/index.js` | Express, JSON only, validated with zod |
| AI | `server/ai.js` | Anthropic SDK, structured outputs for scans and dish ideas |
| Data | `server/db.js` | SQLite file at `SHELFIE_DB` |
| Auth | `server/auth.js` | scrypt password hashes, 30-day sessions |

The API accepts the session either as an httpOnly cookie (web) or as `Authorization: Bearer <token>` (returned by signup and login), so a native iOS/Android client can use the same endpoints unchanged.

## Not built yet

- Native mobile app (the web app is installable and uses the phone camera in the meantime)
- Shared household pantries
- Password reset and email verification
- Barcode scanning
