# Aimed backend (AWS)

One small service: the app sends a screenshot, the service asks Claude for the read, and the read goes straight back. Nothing about the post is stored. The same stack also hosts the landing page in [`../landing/`](../landing/) and stores its waitlist signups.

## What it creates in your AWS account

| Piece | AWS service | Job |
| --- | --- | --- |
| Decode function | Lambda (Node 22, arm64) | Checks the request, applies daily limits, calls Claude, returns the result card |
| Public link | Lambda function URL (HTTPS) | The address the app calls. No 30-second gateway limit, so slow reads still finish |
| Daily limits | DynamoDB | Counts decodes per install and per network per day. Counters delete themselves after two days |
| API keys | Secrets Manager | Holds your Anthropic API key and RevenueCat secret key. Never in the app, never in the code |
| Landing page | S3 + CloudFront | Hosts `landing/` over HTTPS. `/api/*` on the same site goes to the function, so the signup form needs no extra setup |
| Waitlist | DynamoDB | One row per email: the address, when it was added, and where it came from. Kept even if the stack is deleted |
| Logs and alarm | CloudWatch | Keeps one month of logs (status and timing only, never content). Alarm on repeated failures |

## Deploy it

You need an AWS account, the AWS CLI signed in to it (`aws configure` or `aws sso login`), and Node 22.

```bash
cd backend
npm install
npx cdk bootstrap          # once per AWS account and region
npm run deploy             # prints DecodeUrl and LandingUrl when done
```

Open the `LandingUrl` to see the landing page. Signups start working right away.

Then put your Anthropic API key in the secret it created:

```bash
aws secretsmanager put-secret-value \
  --secret-id aimed/anthropic-api-key \
  --secret-string 'YOUR_ANTHROPIC_API_KEY'
```

Check it:

```bash
curl https://YOUR-DECODE-URL/health     # {"ok":true,"mode":"live"}
```

Copy the `DecodeUrl` (without the trailing slash) into `mobile/eas.json` as `EXPO_PUBLIC_API_URL`.

Once RevenueCat is set up, add its secret API key so Pro subscribers get the Pro daily limit:

```bash
aws secretsmanager put-secret-value \
  --secret-id aimed/revenuecat-secret-key \
  --secret-string 'YOUR_REVENUECAT_SECRET_KEY'
```

Without it, everyone gets the free limit. The service checks RevenueCat for an active `pro` entitlement on the install ID and remembers the answer for 10 minutes.

## Settings

Pass any of these to deploy with `-c`, for example `npm run deploy -- -c freeDailyCap=5`.

| Setting | Default | What it does |
| --- | --- | --- |
| `freeDailyCap` | 2 | Free decodes per install per day |
| `proDailyCap` | 30 | Pro decodes per install per day |
| `ipDailyCap` | 100 | Free decodes per network per day, a backstop against reinstalling to reset the free cap. Pro users skip it |
| `model` | `claude-opus-5-5` | Claude model used for reads |
| `domainName` | unset | Your landing page domain, like `getaimed.com`. Needs `certificateArn` |
| `certificateArn` | unset | An ACM certificate for the domain and `www.`, created in us-east-1 |
| `reservedConcurrency` | unset | Hard ceiling on decodes running at once. Leave unset on a new AWS account |

## Your domain

1. In AWS Certificate Manager, switch to **us-east-1** and request a certificate for `yourdomain.com` and `www.yourdomain.com`. Add the DNS records it shows you at your domain registrar.
2. Once it says "Issued," deploy with `npm run deploy -- -c domainName=yourdomain.com -c certificateArn=arn:aws:acm:us-east-1:...`.
3. At your registrar, point both names at the `LandingUrl` host (a CNAME for `www`, and an ALIAS, ANAME, or forwarding for the bare domain). With Route 53 as your DNS, use alias records.

## Waitlist

```bash
npm run waitlist:export > waitlist.csv    # email, signed_up, source
```

Import the CSV into Loops, beehiiv, or any email tool to send the launch email. Share links like `yourdomain.com/?ref=instagram` or `?utm_source=tiktok`, and the `source` column shows where each signup came from.

## Work on it locally

```bash
npm test                        # handler tests
npm run local                   # http://localhost:8787: the landing page, plus sample reads without a key
ANTHROPIC_API_KEY=... npm run local   # real reads on your machine
```

## Costs

At launch volumes, the AWS side is a few dollars a month: Secrets Manager is about $0.40 a month, and Lambda, DynamoDB, S3, and CloudFront are pay per use (pennies for a landing page at early traffic). The main cost is Claude, roughly 2 to 5 cents per decode on the default model. Set an AWS Budgets alert before launch.

## Before public launch

- **App attestation.** Add Apple App Attest and Google Play Integrity checks so only the real app can call the service.
- **Edge protection.** If abuse shows up, put CloudFront and AWS WAF rate rules in front of the function URL.
