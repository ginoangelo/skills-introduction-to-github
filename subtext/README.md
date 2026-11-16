# Subtext

Read between the lines. Share a screenshot of a post, story, caption, or reply and get a decoded result card: what it says, what it means, whether it is aimed at you, the evidence, and other readings.

This is the MVP from the Subtext PDR, built as an installable web app. One flow, no accounts, nothing about the post stored on a server.

## MVP checklist

| PDR item | Status |
| --- | --- |
| Share-sheet and camera-roll import | Done. Install the app, then share a screenshot to Subtext from Instagram, Threads, or Photos (Android and desktop Chrome; iOS Safari has no share target, so use the photo picker there). |
| Optional one-line context | Done. Shared text comes through as context too. |
| Decode with the five-part result card | Done. One model call with a fixed output schema. |
| Recent decodes, stored on the phone | Done. `localStorage` only, delete or clear in one tap. |
| Free tier with a daily cap | Done. `DECODE_DAILY_CAP` per client per day. |
| Refusals for minors and sexual content | Done. The prompt refuses and the card says why. |

## Install it on a phone

1. Open the app's URL in Chrome (Android) or Safari (iOS) over HTTPS, or on localhost.
2. Choose Add to Home Screen.
3. On Android, the share sheet now lists Subtext under any screenshot. On iOS, open Subtext and pick the screenshot from Photos.

## Run it

```bash
cd subtext
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # without it the app runs in sample mode
npm run build
npm start
```

Open http://localhost:3000.

For live-reload development run `npm run dev` instead and open http://localhost:5173 (the Vite dev server proxies `/api` to the backend on port 3000).

## Settings

| Variable | Default | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | none | Enables real decodes. Without it every decode returns a labeled sample card. |
| `SUBTEXT_MODEL` | `claude-opus-5-5` | Model used for decoding. |
| `DECODE_DAILY_CAP` | `30` | Decodes per client per day. |
| `PORT` | `3000` | Server port. |

## How it works

1. The browser downscales the screenshot to 1600px and sends it with the optional context line to `POST /api/decode`.
2. The server makes one multimodal call with a fixed output schema (`server/decode.js`) and returns the result card.
3. The browser shows the card and keeps a thumbnail plus the card in `localStorage` under Recent decodes. Nothing is written server-side.

## Layout

- `server/index.js` Express app: decode endpoint, daily cap, static hosting of the build.
- `server/decode.js` The prompt, the result schema, and the model call.
- `web/` Vite + React front end.
