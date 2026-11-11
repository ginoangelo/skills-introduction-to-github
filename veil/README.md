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
| Accounts / login (Amazon Cognito) | ⏳ next |
| Services Hub, incognito calls, burner numbers, VPN locations | ⏳ designed, not built |
| Payments (in-app subscriptions + credits) | ⏳ planned |

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

3. Point the app at it — create `veil/mobile/.env.local`:

   ```
   EXPO_PUBLIC_API_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
   ```

   Restart `npx expo start`. Scans are now real.

### What gets created in AWS

| Resource | Purpose | Cost at low traffic |
|---|---|---|
| API Gateway HTTP API | `POST /scan`, throttled to 10 req/s | free tier, then ~$1 per million requests |
| Lambda (Node 22, arm64) | runs the scan | free tier covers 1M requests/month |
| DynamoDB table | 24-hour scan cache, keyed by a hash of the email | free tier covers 25 GB |
| SSM Parameter (you create it) | holds the breach-API key | free (standard parameter) |

Privacy: email addresses are never logged or stored in plain text; cache rows use a SHA-256
hash and expire after 24 hours.

## Checks

```bash
cd veil/backend && npm test && npm run typecheck
cd veil/mobile && npm run typecheck && npx expo lint
```
