# Fieldwork: App Store Pre-Submission Checklist

What to have ready before submitting Fieldwork to each store. Store rules, fees and asset sizes change often. Re-check every item against the store's official policy pages in the week before submitting.

**Launch order:** Chrome → Edge → website checkout and beta → Safari (iPhone, iPad, Mac) → Firefox → Google Play (optional).

---

## 0. Shared: do these once, before any store

### Business and legal
- [ ] Trademark and name check for "Fieldwork" (trademark search plus a search of each store). Pick a backup name.
- [ ] Domain and support email (for example a support@ address on your domain).
- [ ] **Privacy policy** on your website. It must say what page content is read, that it is sent to an AI provider, how long it is kept, and how to delete it.
- [ ] **Terms of service:** acceptable use (no bypassing paywalls or logins, no collecting personal contact data), AI accuracy disclaimer, subscription and trial terms, refund policy.
- [ ] **AI provider agreement** confirming user data is not used for training. Name the provider in the privacy policy.
- [ ] Minimum age set to **18+** for V1, stated in the terms and in each store's age rating.
- [ ] One-time legal review of the terms, privacy policy and store wording.

### Product requirements every store checks
- [ ] **Account deletion from inside the product,** plus a web page where people can request deletion without the app.
- [ ] **Data export:** users can download their projects and snips.
- [ ] **Consent screen inside the extension** before any page text is sent to the AI ("Fieldwork will send this page's text to our AI service to build your results").
- [ ] **No remotely loaded code:** all extension code ships in the package. Calling your own API for AI results is fine; downloading and running scripts is not.
- [ ] **Narrowest permissions:** act only on the page the user clicks (`activeTab`), with no "read and change all your data on all websites" by default.
- [ ] Extraction blocked or disabled on banking, payment and checkout pages, and on sites whose terms forbid automated collection (for example LinkedIn).
- [ ] Clear message when the monthly AI allowance runs out.
- [ ] Support page with an FAQ and a contact form.

### Reviewer access
- [ ] **Demo account** with an active subscription and a sample project for reviewers (Fieldwork is paid-only, so reviewers can't test it without one).
- [ ] Short **reviewer notes:** what the product does, how to test the Lens, Snip and Extract in under 2 minutes, and the demo login.
- [ ] A 60–90 second **screen recording** of the main flow (some stores ask for one; it speeds up review).

### Store assets (prepare once, resize per store)
- [ ] App icon master at 1024×1024, simple enough to read at 16×16.
- [ ] Short name, a one-line description (under ~130 characters) and a full description.
- [ ] Screenshots: the "4 steps" story (messy page → one click → Extract → download) works well as the first 4.
- [ ] Category: Productivity (Chrome, Edge), Productivity or Education (Apple, Google).

---

## 1. Chrome Web Store (Chrome, Brave, Opera, Arc)

**Cost:** $5 one-time developer fee. **Payments:** on your website (Stripe); the store takes no cut. **Review:** days to a couple of weeks; first submissions and broad permissions take longer.

- [ ] Developer account registered, with 2-step verification turned on.
- [ ] Manifest V3 extension, version number set, all code bundled in the package.
- [ ] **Single purpose** written in one sentence, for example "Turns the web page you're viewing into a clear summary and saves its facts to your Fieldwork projects."
- [ ] **Permission justification** written for every permission (for example, `activeTab` to read the page you clicked on, `sidePanel` to show your workspace, `contextMenus` for "Snip to Fieldwork," `storage` for settings).
- [ ] **Privacy practices tab** completed: data types collected (website content, account info), purpose, and the "limited use" certification.
- [ ] Data collection limited to what the single purpose needs (required since the August 2026 policy update).
- [ ] In-extension consent before any page text leaves the browser.
- [ ] Listing assets: 128×128 icon, 1–5 screenshots at 1280×800 (or 640×400), small promo tile 440×280.
- [ ] Privacy policy link and support link on the listing.
- [ ] Description that matches exactly what the extension does, with no exaggerated claims.
- [ ] Publish first to **unlisted** or **trusted testers** for the beta, then make it public.

## 2. Microsoft Edge Add-ons

**Cost:** free. **Payments:** your website. **Review:** usually up to about a week.

- [ ] Microsoft Partner Center account.
- [ ] Same package as Chrome (Edge accepts Chrome extensions with little or no change). Test the side panel in Edge.
- [ ] Listing text, screenshots, privacy policy link and support link.
- [ ] Testing notes and the demo account.

## 3. Apple App Store (Safari on iPhone, iPad and Mac)

**Cost:** $99/year Apple Developer Program, plus a Mac with Xcode. **Review:** often 1–3 days per submission; plan for 1–2 rounds of feedback.

### Build
- [ ] Safari Web Extension created from the Chrome code with Apple's converter, then built in Xcode for iOS, iPadOS and macOS.
- [ ] **A real container app**, not an empty shell: onboarding showing how to turn the extension on in Safari, plus your projects, Scrapbook and downloads. (Apple rejects apps that do too little on their own.)
- [ ] Extension works with Safari's per-site permission prompts, and the Lens works as a bottom sheet on iPhone.
- [ ] Tested on a real iPhone and iPad, not just the simulator.

### Payments (the most common reason for rejection)
- [ ] Decide the payment setup per region:
  - **US:** linking to your website checkout is currently allowed, with Apple taking 0% (still being decided in court).
  - **Other regions:** Apple's in-app purchase is generally required for digital subscriptions (about 15% with the Small Business Program). The EU has its own options and fees.
- [ ] If using in-app purchase: subscriptions set up in App Store Connect (Student and Professional, monthly and yearly, 3-day trial), with **Restore Purchases** working.
- [ ] Subscription screen shows the price, billing period, trial length and auto-renewal terms, with links to the terms and privacy policy.
- [ ] Accounts created on the website work when signing in on iPhone, and vice versa.

### Accounts and privacy
- [ ] **Sign in with Apple** offered if you offer Google or other social sign-in.
- [ ] **Account deletion inside the app.**
- [ ] **App Privacy labels** filled in accurately (website content, user content, contact info, usage data), matching the privacy policy.
- [ ] Privacy manifest included, listing data use and any required APIs.
- [ ] AI disclosure in the app and the description: page text is sent to an AI service.
- [ ] Age rating questionnaire completed (set for 17+ or 18+ to match the 18+ policy).

### Listing
- [ ] App icon 1024×1024, name, subtitle (30 characters), keywords, description, promotional text.
- [ ] Screenshots for the current largest iPhone size and the 13-inch iPad (check App Store Connect for exact sizes), plus Mac screenshots for the Mac version.
- [ ] Support URL, marketing URL and privacy policy URL.
- [ ] **App Review notes** with the demo login and how to turn on the Safari extension.
- [ ] TestFlight beta completed before submitting for review.

## 4. Firefox Add-ons (desktop and Android)

**Cost:** free. **Review:** automated checks, then a human review that can take days to weeks.

- [ ] Mozilla add-ons developer account.
- [ ] Firefox build of the extension (Firefox's sidebar works differently from Chrome's side panel; test it).
- [ ] **Source code submitted** along with build instructions, since the extension is bundled and minified.
- [ ] Data collection declared, with consent inside the add-on.
- [ ] Tested on Firefox for Android (where full extensions work).

## 5. Google Play (optional: the installable web app)

On Android, Fieldwork works without the store: people install the website to their home screen and use "Share to Fieldwork." List on Play only if store discovery is worth the fees.

**Cost:** $25 one-time. **Payments:** about 10% service fee plus 5% billing fee on subscriptions with Google Play billing (from June 30, 2026, in the US, UK and EEA); alternative billing options exist in some regions. **Review:** hours to several days.

- [ ] Developer account with identity verification.
- [ ] **New personal accounts:** a closed test with real testers for about two weeks before going public (check the current tester count and duration in Play Console).
- [ ] Web app packaged for Play (Trusted Web Activity), with Digital Asset Links set up on the website.
- [ ] Feels like a real app: offline screen, fast loading, Android Share target working, no browser address bar.
- [ ] Meets Google Play's current target Android version requirement.
- [ ] **Data safety form** completed, matching the privacy policy.
- [ ] **Account deletion** in the app and on a web page.
- [ ] Subscriptions set up in Play Billing (or an approved alternative), with clear trial and renewal terms.
- [ ] Content rating questionnaire, target audience set to adults.
- [ ] Listing: 512×512 icon, 1024×500 feature graphic, at least 2 phone screenshots, short description (80 characters), full description, privacy policy link.

---

## 6. After approval
- [ ] Watch reviews and crash reports daily for the first two weeks.
- [ ] Respond to every review in the first month.
- [ ] Keep the privacy policy, store privacy forms and actual data use in sync; a mismatch after an update can get a listing pulled.
- [ ] Re-check policies before each major update, especially new permissions or new data uses.
