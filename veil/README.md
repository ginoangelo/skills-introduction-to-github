# Veil — privacy advisor app

Veil checks what a person's phone and the internet expose about them, then gives them a
prioritized fix list, privacy Modes (Surface → Ninja) and, later, a hub of privacy services.

Design mockups (all screens): the "Veil Privacy App Mockups" canvas on claude.ai.

```
veil/
├── mobile/    Expo (React Native) app — iPhone, Android and web
└── backend/   AWS SAM app — API Gateway + Lambda + DynamoDB
```

## What works today (v0.1)

| Feature | Status |
|---|---|
| Welcome → email scan → privacy score | ✅ |
| Breach check (Have I Been Pwned) via AWS Lambda | ✅ backend built, needs deploying |
| Fix list with score that rises as fixes are done | ✅ |
| Privacy Modes (Surface / Low Profile / Submerged / Ninja) | ✅ guided (no automatic switching yet) |
| Breach report | ✅ |
| Demo mode with sample data when no backend is connected | ✅ |
| Accounts (Amazon Cognito): sign up, email code, sign in/out, delete account | ✅ |
| Fix progress + privacy mode synced to the account across devices | ✅ |
| Payments (Veil Pro subscription + burner credits) | ⏳ next |
| Services Hub, incognito calls, burner numbers, VPN locations | ⏳ designed, not built |

## Roadmap

1. **Launch (v1):** scan, score, fix list, Modes, accounts ✅ · Veil Pro subscription via Apple/Google
   in-app purchase (RevenueCat) · privacy policy + terms · App Store / Play listings using the ad panels.
2. **Services Hub:** affiliate sign-ups for password managers, VPNs, credit freezes, data removal.
3. **Algorithm Mirror (v2 headline feature):** "see who the apps think you are."
   - Import the user's own data download (Meta, Instagram, TikTok, X, Google Takeout) and read it
     **on the device** to show inferred interests, advertisers holding their info, and off-app tracking.
   - Import the iPhone App Privacy Report to show which tracking domains each app contacts.
   - Guided "reset the algorithm" fixes (personalized ads off, ad interests cleared, feed resets).
   - Not possible: reading ranking code or watching other apps' feeds (blocked by iOS; restricted on Google Play).
4. **Burner numbers + virtual locations (VPN):** Pro / credits, telecom partner, carrier registration, legal review.
5. **Incognito calls:** pick the safest installed messenger and hand off by deep link; Android call redirection.

## Run the app (demo mode, no AWS needed)

```bash
cd veil/mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `w` to open it in a browser.

## Deploy the backend to your AWS account

You need: an AWS account, the [AWS CLI](https://docs.aws.amazon.com/cli/) signed in
(`aws configure`), the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html),
and a [Have I Been Pwned API key](https://haveibeenpwned.com/API/Key) (paid, small monthly fee).

1. Store the breach-API key in AWS (encrypted, never in code):

   ```bash
   aws ssm put-parameter --name /veil/hibp-api-key --type SecureString --value "YOUR_HIBP_KEY"
   ```

2. Build and deploy:

   ```bash
   cd veil/backend
   npm install
   sam build
   sam deploy --guided
   ```

   Accept the defaults. When it finishes it prints `ApiUrl`.

3. Point the app at it — create `veil/mobile/.env.local` from the deploy outputs:

   ```
   EXPO_PUBLIC_API_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
   EXPO_PUBLIC_COGNITO_REGION=us-east-1
   EXPO_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   Restart `npx expo start`. Scans are now real and the Account tab works.

   Cognito sends verification emails itself (about 50 a day). Before launch, connect Amazon SES so
   it can send more and from your own address.

### What gets created in AWS

| Resource | Purpose | Cost at low traffic |
|---|---|---|
| API Gateway HTTP API | `POST /scan`, throttled to 10 req/s | free tier, then ~$1 per million requests |
| Lambda (Node 22, arm64) | runs the scan | free tier covers 1M requests/month |
| DynamoDB table | 24-hour scan cache, keyed by a hash of the email | free tier covers 25 GB |
| SSM Parameter (you create it) | holds the breach-API key | free (standard parameter) |
| Cognito user pool | accounts and sign-in | free for the first 10,000 monthly users on the Lite/Essentials tiers (check current pricing) |
| DynamoDB user table | each user's fix progress + mode, with point-in-time backups | free tier, then pennies |

API routes: `POST /scan` is public (throttled). `GET/PUT /me/progress` and `DELETE /me` require a
signed-in user; API Gateway checks the Cognito token before the Lambda runs.

Privacy: scan emails are never logged or stored in plain text; cache rows use a SHA-256 hash and
expire after 24 hours. Scan results stay on the phone; only fix progress and mode sync to the
account. Login tokens live in the iOS Keychain / Android Keystore. Deleting the account removes
the stored data and the Cognito user.

## Checks

```bash
cd veil/backend && npm test && npm run typecheck
cd veil/mobile && npm run typecheck && npx expo lint
```
