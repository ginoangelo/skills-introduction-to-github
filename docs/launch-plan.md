# Subtext launch plan

Everything in one place: what's built, what's next and who does it, plus marketing and email ideas. Updated 2026-11-19.

## Pricing and look

| Plan | Price | Decodes a day | Trial |
| --- | --- | --- | --- |
| Free | $0 | 2 | None |
| Pro | $9.99 a month or $34.99 a year | 30 | 3 days free on yearly |

The look is sunset, light touch: warm white background, violet as the lead color, peach and butter-yellow cards, black buttons. The example story is a generic story with no platform branding.

## Where things live

| Folder | What it is |
| --- | --- |
| `mobile/` | The iPhone and Android app (Expo). Same design as the approved artifact |
| `backend/` | The AWS decode service: Lambda, DynamoDB, Secrets Manager, deployed with AWS CDK |
| `subtext/` | The earlier web prototype. Keep it for reference or a web demo |
| `docs/` | This plan |

## What's built and tested

- **Phone app.** Home, decode with context chips, the result card, history with search, About, and the Plans screen with one Pro plan and a 3-day trial.
- **Share sheet.** Screenshots can be shared to Subtext from Instagram, Threads, or Photos on iPhone and Android. The native projects generate correctly. It needs a real device build to try.
- **First-decode consent and "Flag this read."** Both stores expect these for AI features.
- **AWS backend.** It enforces the free daily cap per install and per network, and logs no content.
- **Checks run.** The backend passes 6 tests and builds a clean CloudFormation template. The app typechecks and was driven end to end in a phone-sized browser against the backend.

## Next steps, in order

| # | Step | Who | Time |
| --- | --- | --- | --- |
| 1 | Decide: individual or company developer account, final prices, model, domain name | You | This week |
| 2 | Create accounts: Apple Developer ($99/yr), Google Play Console ($25 once), AWS, Anthropic API, Expo, domain, Google Workspace email | You | 1 to 14 days (company accounts need a D-U-N-S number from Apple) |
| 3 | Deploy the backend to your AWS account and add the Anthropic key | Me, with your AWS sign-in | 1 hour |
| 4 | Put the backend URL in the app and make the first device builds | Me | 1 day |
| 5 | Accuracy check on about 200 real screenshots, rated by people. Gate: 70% rated accurate | Both | 1 week |
| 6 | Billing is built: the Plans screen buys through RevenueCat, the paywall shows after the first read and at the free limit, and the backend gives Pro 30 a day. Left: create the subscriptions in both stores (3-day trial on yearly), set up RevenueCat and add its keys, app attestation, AWS Budgets alert | You in the store and RevenueCat consoles, me for the rest | 1 week |
| 7 | Privacy policy, terms, support page on your domain. Lawyer reviews terms and read wording | Me drafting, lawyer reviewing | Alongside 5 and 6 |
| 8 | Testing: iPhone through TestFlight. Android closed test with at least 12 testers for 14 days in a row (new personal Play accounts) | You recruit, I set up | 2 weeks |
| 9 | Store listings: screenshots, descriptions, privacy forms, age rating, review notes about safeguards | Me | 2 to 3 days |
| 10 | Submit to both stores, answer review questions, launch | Both | 1 to 2 weeks |

Start recruiting Android testers now. The 14-day closed test is the step most likely to slow launch.

## Marketing ideas

**The hook.** "Is this post about you?" Everyone has asked it, and the answer arrives in seconds.

**Rule for every piece of marketing.** Only use posts you made yourself, or posts from creators who agreed to it in writing. Never decode a real person's post in public without their permission. That protects you legally and keeps the brand on the right side of "posts, not people."

1. **Short videos on TikTok, Reels, and Shorts.** Screen-record a decode of a made-up cryptic story: "My friend posted this two hours after our fight." Show the read land. Run one series called "Decode the group chat."
2. **Creator partnerships.** Dating, friendship, and relationship-advice creators decode posts their followers send in, with permission. Pay per video or give a revenue share code.
3. **Campus ambassadors.** One ambassador per campus with a discount code for Pro. Both stores support offer codes, so students get a deal without a separate plan.
4. **Waitlist with referrals.** A landing page where sharing your link moves you up the list. Early members get a month of Pro free.
5. **App Store search.** Store name "Subtext: Read Between the Lines." Words to target: caption meaning, is this about me, subtweet, story meaning, shade, sneak diss.
6. **Launch day.** Product Hunt and Reddit communities about dating and social media, plus a short founder story video.
7. **Privacy as a selling point.** "We don't keep your screenshots." Most AI apps can't say that, and it's true here.
8. **Creators and social media managers.** LinkedIn posts that pitch Pro's whole-thread decodes: "Read the comment section before it reads you."
9. **The built-in loop, after launch.** The blurred share card carries a "Decoded with Subtext" tag that spreads the app every time someone shares a read.

## Email setup

- **Inboxes.** Google Workspace on your domain: hello@ for partnerships and press, support@ for help. App Store and Google Play both need a support contact.
- **Sending on AWS.** Amazon SES for transactional mail. It's very low cost at this size.
- **Newsletter and waitlist.** A list tool you can edit without code, such as Loops or beehiiv. They're easier for campaigns than SES alone. Keep the waitlist and newsletter there.
- **Before sending anything.** Set up SPF, DKIM, and DMARC on the domain so mail doesn't land in spam.

## Email drafts

**1. Waitlist welcome (sent right away)**
Subject: You're on the list for Subtext
> Thanks for joining. Subtext reads a screenshot of any post and tells you what it means, whether it's aimed at you, and why. We're opening spots in small groups. Share your link to move up the list: {referral_link}

**2. Beta invite**
Subject: Your Subtext beta is ready
> You're in. Install the test build here: {testflight_or_play_link}. Try it on a post that's been on your mind, then tap "Flag this read" if anything looks off. We read every report.

**3. Launch announcement**
Subject: Subtext is live
> Read between the lines. Subtext is now on the App Store and Google Play. Your first 2 decodes every day are free. Pro gives you 30 a day, whole-thread decodes, and blurred share cards. Try yearly free for 3 days.

**4. Pro nudge, after someone hits the free limit twice**
Subject: Out of free decodes again?
> Pro gives you 30 decodes a day, whole-thread reads, and blurred share cards. Try yearly free for 3 days, then $34.99 a year, or go monthly for $9.99. Cancel any time.

**5. Monthly newsletter, "Decoded"**
Subject: 3 posts, decoded
> Three made-up posts, each with its read and the evidence. One tip on what timing tells you. Every example is fictional.

## Running costs at launch

| Item | Cost |
| --- | --- |
| Apple Developer Program | $99 per year |
| Google Play Console | $25 once |
| AWS (Lambda, DynamoDB, Secrets Manager, CloudWatch) | A few dollars a month at launch volumes |
| Anthropic API | About 2 to 5 cents per decode |
| Domain | $10 to $20 per year |
| Google Workspace | About $7 to $8 per user per month |
| Expo builds, RevenueCat, list tool | Free tiers to start |

Check each price when you sign up. They change.
