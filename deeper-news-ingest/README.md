# Deeper News ingest

Finds story candidates for a location from [GDELT](https://www.gdeltproject.org/), a free database of world news in more than 100 languages:

- **Near** the city (articles that name it, from outlets in that country)
- **Elsewhere in the country**
- **Around the world** (two countries a day, rotating, never the home country)

Each candidate has a headline, link, outlet, language, country, date and image. The app never republishes articles: candidates are leads for the editor, who pairs a story with video and writes the summary in our own words.

## Run it

Needs Node.js 22 or newer. No packages to install.

```bash
cd deeper-news-ingest
npm run ingest -- "Louisville" "Kentucky" "United States" out.json
```

```bash
npm test
```

GDELT asks for at most one request every 5 seconds, so one location takes about 25 seconds. The client waits and retries on its own.

If your network needs a proxy, run with `NODE_USE_ENV_PROXY=1` so Node's built-in `fetch` uses it.

## Next (Phase 2)

- Wrap `ingestForLocation` in an AWS Lambda function, run it hourly with an EventBridge schedule, and save candidates to DynamoDB.
- Group candidates that cover the same event, and search YouTube for matching footage from official channels.
- Show them in the editor page for approval.
