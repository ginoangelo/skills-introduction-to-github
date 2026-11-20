# Subtext backend (AWS)

One small service: the app sends a screenshot, the service asks Claude for the read, and the read goes straight back. Nothing about the post is stored.

## What it creates in your AWS account

| Piece | AWS service | Job |
| --- | --- | --- |
| Decode function | Lambda (Node 22, arm64) | Checks the request, applies daily limits, calls Claude, returns the result card |
| Public link | Lambda function URL (HTTPS) | The address the app calls. No 30-second gateway limit, so slow reads still finish |
| Daily limits | DynamoDB | Counts decodes per install and per network per day. Counters delete themselves after two days |
| API key | Secrets Manager | Holds your Anthropic API key. Never in the app, never in the code |
| Logs and alarm | CloudWatch | Keeps one month of logs (status and timing only, never content). Alarm on repeated failures |

## Deploy it

You need an AWS account, the AWS CLI signed in to it (`aws configure` or `aws sso login`), and Node 22.

```bash
cd backend
npm install
npx cdk bootstrap          # once per AWS account and region
npm run deploy             # prints DecodeUrl when done
```

Then put your Anthropic API key in the secret it created:

```bash
aws secretsmanager put-secret-value \
  --secret-id subtext/anthropic-api-key \
  --secret-string 'YOUR_ANTHROPIC_API_KEY'
```

Check it:

```bash
curl https://YOUR-DECODE-URL/health     # {"ok":true,"mode":"live"}
```

Copy the `DecodeUrl` (without the trailing slash) into `mobile/eas.json` as `EXPO_PUBLIC_API_URL`.

## Settings

Pass any of these to deploy with `-c`, for example `npm run deploy -- -c freeDailyCap=5`.

| Setting | Default | What it does |
| --- | --- | --- |
| `freeDailyCap` | 2 | Free decodes per install per day |
| `ipDailyCap` | 40 | Decodes per network per day, a backstop against reinstalling to reset the free cap |
| `model` | `claude-opus-5-5` | Claude model used for reads |
| `reservedConcurrency` | unset | Hard ceiling on decodes running at once. Leave unset on a new AWS account |

## Work on it locally

```bash
npm test                        # handler tests
npm run local                   # http://localhost:8787, sample reads without a key
ANTHROPIC_API_KEY=... npm run local   # real reads on your machine
```

## Costs

At launch volumes, the AWS side is a few dollars a month: Secrets Manager is about $0.40 a month, and Lambda and DynamoDB are pay per use. The main cost is Claude, roughly 2 to 5 cents per decode on the default model. Set an AWS Budgets alert before launch.

## Before public launch

- **App attestation.** Add Apple App Attest and Google Play Integrity checks so only the real app can call the service.
- **Paid plans.** Connect RevenueCat's webhook to a DynamoDB entitlements record and raise the daily cap to 30 for Pro.
- **Edge protection.** If abuse shows up, put CloudFront and AWS WAF rate rules in front of the function URL.
