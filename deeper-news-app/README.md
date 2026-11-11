# Deeper News app

One codebase for the iPhone app, the Android app and the website, built with Expo.

Every story plays as five full-screen clips, from the headline down to its roots. When a story ends, it asks a question and offers up to three paths (follow the money, the people or the place) into the next connected story.

People choose their city, and the home screen puts stories **near them** first, then **elsewhere in their country**, then **around the world**. Hand-offs can cross borders, for example from a flooded school in the US to a village in Bangladesh that runs school on boats.

> All stories in `src/data/stories.ts` are **fictional samples**, including the towns set in real countries. Clips show a placeholder until you add a YouTube video.

## Run it on your computer

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
cd deeper-news-app
npm install
npx expo start
```

- Press `w` to open the website in your browser.
- To see it on your phone, install **Expo Go** from the App Store or Google Play, then scan the QR code in the terminal.

## Listen mode

Tap **Listen** at the top of any story. A narrator reads each clip's title and why it matters, the "What happens next?" question, and the question and paths at the end. The story waits while it reads. It uses the voice built into the phone or browser, so it's free and needs no account. The setting is remembered.

## Daily Thread

A daily puzzle at the top of Home: connect today's start story to today's target story by following the money, people and place paths, in as few steps as you can. Everyone gets the same pair on the same day. You can undo a step, ask to see the shortest route, and share your result without giving the route away. Progress for the day is saved on the device.

## Hear it live from there

Stories with a station nearby show **Hear it live**. It pauses the story and plays a local public, news or talk station from where the story happened, with **Next station** and a link to the station's site. Stations are a short, hand-checked list in `src/data/stations.ts`, picked from the free Radio Browser directory. Music stations are left out on purpose, since playing them can need music licences in some countries. All streams are https.

## Add stories with the editor

Open the app and choose **Open the story editor** at the bottom of Home (or go to `/editor`).

- **New story**, or **Copy and edit** one of the samples.
- Paste a YouTube link for each clip. Copy the link at the moment the clip should start, and the editor reads the start time from it.
- Or use a podcast or audio clip instead: paste the episode's audio file link (.mp3 or .m4a, from the show's public feed), the start time (like 12:40) and the show's name. It plays over the story photo with a moving sound wave.
- Pick where it happened, add a photo link, write the question it ends on, and connect up to three paths to other stories.
- **Save** shows it in the app straight away. **Save and watch** plays it.

Editor stories are saved on the device you made them on. On the website, **Download my stories (.json)** keeps a copy. Publishing them for everyone comes with the online database (Phase 2).

## Add real clips by hand

Open `src/data/stories.ts`. On any clip, add:

```ts
youtubeId: 'dQw4w9WgXcQ',   // the part after watch?v= in the YouTube link
startSeconds: 74,            // where the clip starts
seconds: 25,                 // how long it plays before moving on
```

Only use videos that the outlet, agency or council published publicly on YouTube themselves. The app embeds them through YouTube's player. It never downloads or re-uploads them.

## Put the website on AWS Amplify

1. Sign in to the AWS console and open **AWS Amplify**.
2. Choose **Create new app**, then **GitHub**, and pick the repository `skills-introduction-to-github`.
3. Pick the branch to deploy. Amplify finds `amplify.yml` at the top of the repository and builds the `deeper-news-app` folder on its own.
4. After the first deploy, open **Hosting → Rewrites and redirects** and add this rule so links like `/story/marlow` work when opened directly:
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`
5. Every push to that branch now redeploys the site.

## Where things are

| Path | What it is |
|---|---|
| `src/app/index.tsx` | Home: story circles, Today list, threads |
| `src/app/story/[id].tsx` | The full-screen story player and the hand-off |
| `src/app/location.tsx` | The "Where are you?" picker. The choice is saved on the device |
| `src/data/stories.ts` | Stories, clips, places, hand-off questions and threads |
| `src/app/editor/` | The story editor: list of your stories, and the form |
| `src/state/content.tsx` | Where every screen gets its stories (samples plus editor stories) |
| `src/data/places.ts` | Cities to pick from, distances, and the near / country / world split |
| `src/components/clip-player*.tsx` | YouTube player for phones (`.tsx`) and the web (`.web.tsx`) |
| `src/theme/tokens.ts` | Colors for light and dark mode |

## Checks

```bash
npm run typecheck
npx expo lint
npm run build:web
```

## What's next

- **Phase 2:** logins, saved follows and an editor page for adding stories, on AWS Amplify (Cognito, DynamoDB).
- **Phase 3:** automatic story suggestions from YouTube and GDELT, with AI drafts you approve.
- **Phase 4:** App Store and Google Play releases with EAS Build.
