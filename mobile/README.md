# Aimed mobile app (iPhone and Android)

Built with Expo (React Native) and Expo Router, using the Aimed design: big title, color-block cards, pill buttons, and a tab bar docked to the bottom.

## Screens

| Screen | File |
| --- | --- |
| Home ("For you") | `src/app/(tabs)/index.tsx` |
| History with search | `src/app/(tabs)/history.tsx` |
| About: principles, privacy, mode | `src/app/(tabs)/about.tsx` |
| Add context, then decoding | `src/app/decode.tsx` |
| Your read (result card) | `src/app/read/[id].tsx` |
| Plans: one Pro plan, 3-day trial (draft pricing) | `src/app/plans.tsx` |
| Tab bar | `src/app/(tabs)/_layout.tsx` |

Design tokens (colors, fonts) live in `src/lib/theme.ts`.

## How a decode works

1. You pick a screenshot, or share one to Aimed from Instagram, Threads, or Photos.
2. The app shrinks it on the phone, then you add optional context.
3. It sends the image to the AWS decode service (`EXPO_PUBLIC_API_URL`) with a random install ID for the daily limit.
4. The read is shown and saved to history on the phone only.

Before the first live decode, the app asks for a clear yes to send the screenshot to Claude. Apple and Google both expect this when personal data goes to an outside AI. Each live read has a "Flag this read" link that sends only a reason.

Without `EXPO_PUBLIC_API_URL` the app runs in example mode and labels every read as an example.

## Run it

```bash
npm install
npx expo start              # scan the QR code with Expo Go for most screens
```

The share-sheet extension needs a development build, not Expo Go:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --profile development --platform ios      # or android
```

## Build for the stores

1. Deploy the backend (see `backend/README.md`) and put its URL in `eas.json` under `preview` and `production`.
2. Replace the placeholder bundle ID `app.aimed.mobile` in `app.json` if you want a different one. It must match your Apple and Google listings and can't change after launch.
3. Build and submit:

```bash
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --platform ios
npx eas-cli@latest submit --platform android
```

EAS creates the Apple signing certificates and the App Group the share extension needs. Sign in with your Apple Developer account when it asks.

## Checks

```bash
npm run typecheck
npx expo export --platform web     # quick compile check of every screen
```

## Subscriptions and the paywall

The Plans screen sells one Pro plan, monthly or yearly, through RevenueCat (`src/lib/billing.native.tsx`). Without RevenueCat keys, the app shows draft prices and explains that checkout comes later, so it stays safe to build and test.

**When the plans appear**

1. Once, when someone leaves their first real read. They've seen the value first.
2. When the decode service says the free daily limit is used up. The plans open with "You've used today's free decodes."
3. Any time from Home ("Aimed Pro") or About ("See plans and pricing").

**Set up billing once your store accounts exist**

1. In App Store Connect and Google Play Console, create two subscriptions in one group: monthly at $9.99 and yearly at $34.99. Add a 3-day free trial to the yearly one only (an introductory offer on Apple, a free-trial offer on Google).
2. In RevenueCat, create a project, connect both stores, and add those products.
3. Create an entitlement named exactly `pro` and attach both products.
4. Create an offering (the default one) with the monthly product as the Monthly package and the yearly product as the Annual package.
5. Copy RevenueCat's public Apple and Google SDK keys into `eas.json` as `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY`.
6. Put RevenueCat's secret API key in AWS so the decode service can give Pro users 30 decodes a day (see `backend/README.md`).
7. Make a development build and test a purchase with a sandbox tester (Apple) or license tester (Google).

The app uses the install ID as the RevenueCat user, so the decode service checks Pro for the same ID without accounts or logins.

Apple's Small Business Program lowers Apple's cut to 15%. Enroll before launch.

## Not built yet
- The paid-plan features: follow-up questions, blurred share cards, whole-thread decodes, exports.
