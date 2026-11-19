# Fieldwork

## Overview
Fieldwork is a paid browser extension and web app for students and professionals. It turns any web page into something you can read at a glance (the **Lens**), then uses AI to pull the page's information into sourced datasets and finished deliverables (the **Extractor**): study guides, competitor briefs, slide decks, spreadsheets. Every extracted fact carries the exact quote from the page that proves it, and everything a user captures lives in a **Scrapbook** they can view as a table, board, notebook or pin board.

## Goals & Success Criteria
- **Faster answers:** a user finds the key facts on a messy page (price, terms, main points) without scrolling. Proposed target: under 30 seconds on a typical marketing page, versus several minutes today.
- **Finished work, not notes:** a user goes from "pages I'm looking at" to a downloadable PDF, PowerPoint or Excel file in one session, with no copy-paste or reformatting.
- **Trust:** every extracted object links to a verbatim quote from its source page. Proposed target: at least 95% of extracted quotes match the page word for word; anything that doesn't is flagged "Check", never hidden.
- **Paid from day one:** no free tier. A 3-day free trial converts to a Student or Professional subscription, monthly or yearly.
- **Easy install:** installs from the Chrome Web Store in about a minute and works on the current page with one click, without the "read all your data on all websites" permission warning.
- **Retention:** users come back to their Scrapbook and projects; the Lens becomes their default way to read cluttered pages.

## Target Users
**Primary personas**
- **Student (high school, college, grad school):** researches topics across several web pages and needs study guides, flashcards, essay outlines and correct citations (APA, MLA, Chicago).
- **Professional (consultants, marketers, analysts, founders, researchers, real estate and other small-business operators):** compares competitors, products and pricing across sites and needs business-intelligence datasets, competitor briefs and client-ready decks and spreadsheets.

**Edge cases raised**
- **Readers who need larger text or calmer layouts** (for example older users): the Lens must support large-text and high-contrast reading.
- **Phone and tablet users:** Chrome on Android doesn't run extensions; iPhone and iPad need a Safari extension built through the App Store. V1 is desktop-first.
- **Pages the Lens can't improve:** web apps, maps, dashboards, logins, checkouts and banking pages. Fieldwork should step aside on these, not force a redesign.
- **Pages behind a login:** the extension sees what the user sees in their own browser. Nothing should be fetched server-side with the user's credentials.
- **Messy marketing pages** where key facts (pricing, fees, cancellation terms) are scattered across many screens, hidden in collapsed FAQs or in footer fine print.

## User Stories
**Lens (viewing)**
- As a professional, I want to click the Fieldwork button on a cluttered pricing page and see the plans, fees and fine print gathered in the center of one screen, so that I don't scroll through pop-ups and images to find them.
- As any user, I want to switch view styles (Chunks, One screen, Q&A, Table, Original), so that the page is presented the way that suits my task.
- As any user, I want to tap any chunk and see where it came from on the original page, so that I can trust the condensed view.
- As a user who needs larger text, I want a large, high-contrast reading mode, so that I can read any page comfortably.

**Extractor (AI does the work)**
- As a professional, I want to say "compare pricing, features and positioning across these competitor pages and build a deck and spreadsheet", so that I get a finished deliverable without manual research.
- As a student, I want to turn my sources into a study guide with key facts, terms, practice questions and flashcards, so that I can study from my own research.
- As a student, I want citations generated in APA, MLA or Chicago from each source, so that my paper is properly referenced.
- As any user, I want every extracted fact to show its source and exact quote, with mismatches flagged, so that I never submit or present something the page didn't say.

**Scrapbook (capturing)**
- As any user, I want to select text on a page and snip it into my project, so that I collect evidence while I browse.
- As a professional, I want my snips shown as a board with one column per company, so that I can compare competitors at a glance.
- As a student, I want my snips shown as a notebook grouped by topic with numbered source notes, so that I can turn them into a paper.
- As any user, I want to switch the same snips between Table, Board, Notebook and Pin board without retyping, so that I can organize them however it makes sense to me.

**Deliverables and exports**
- As any user, I want to download my deliverable as PDF, PowerPoint, Excel or CSV, so that I can submit, present or analyze it in tools I already use.

**Account and billing**
- As a new user, I want a 3-day free trial before I'm charged, so that I can try Fieldwork on my own pages.
- As a subscriber, I want to choose Student or Professional, monthly or yearly (yearly with about 2 months free), and see my AI usage for the month, so that I know what I'm paying for.

## Features (MVP Scope)
1. **Chrome extension: capture the current page.** A toolbar button that reads the page the user is viewing (using `activeTab`, only on click) and sends its cleaned content to the user's Fieldwork project. **P0**
2. **Content extraction and page-type detection.** Pull the real content (text, headings, prices, dates, lists) and structured data from the page, drop menus, ads and pop-ups, and classify the page type (product, pricing, article, about, contact and others). **P0**
3. **Lens: Chunks view and Original view.** Group scattered facts into labeled chunks centered on one screen, with fine print always kept as its own chunk and a one-tap return to the original. Show a clean view instantly, then improve it with AI. **P0**
4. **Projects and sources.** Create projects, add captured pages (or pasted text), and see per-page counts of extracted objects. **P0**
5. **AI Extractor with templates.** A free-text request plus starter templates. Professional: Competitor comparison, Company snapshot, Pricing table. Student: Study guide + flashcards, Essay outline, Annotated bibliography. **P0**
6. **Evidence check.** Every extracted object stores its source and a verbatim quote; the app checks each quote against the captured page text and marks it "✓ Matched" or "⚠ Check". **P0**
7. **Datasets.** One table per object type with its evidence. Professional: Companies, Products, Prices, Features, Claims & proof. Student: Sources, Key facts, Terms, Questions. Clicking a row highlights the quote on the page. **P0**
8. **Deliverable builder.** Report or study guide with sections, a price comparison table (Professional) or flashcards (Student), slide previews and a sources list. **P0**
9. **Exports.** PDF report, PowerPoint deck, Excel workbook (one sheet per object type, plus pages captured), CSV for single tables, snips and flashcards. **P0**
10. **Scrapbook with four layouts.** Table, Board, Notebook and Pin board views of the same snips; group by company, page, topic or type; recommended default per package; manual snipping from the Lens; CSV download. **P0**
11. **Accounts, subscriptions and 3-day trial.** Sign up, Student or Professional plan, monthly or yearly billing, 3-day trial, account page with plan, renewal date and usage. **P0**
12. **AI usage allowance.** Monthly extraction allowance per plan (proposed: 100 Student, 300 Professional), metered and shown in the account page. **P0**
13. **More view styles.** One screen summary, Q&A and Table views in the Lens. **P1**
14. **Large-text, high-contrast reading mode and dark mode.** **P1**
15. **Multi-tab extraction.** Run one request across several open tabs at once. **P1**
16. **Change tracking.** Re-capture a page later and show what changed (for example a competitor's price increase). **P1**
17. **Branded decks.** Professional users add their logo and colors to exported slides. **P1**
18. **Site and tech map template.** Diagram a company's visible site structure, customer journey and publicly visible tech stack (public information only). **P1**
19. **Board export to PowerPoint**, one slide per column, and drag-and-drop snips between columns. **P2**
20. **Image snips** from the page (with source credit) on the Pin board. **P2**

## Out of Scope (V1)
- **Kids and family package**, lesson mode, guessing games and "field trip" gamification. Explored in the prototype; the business decision was students and professionals first.
- **The 3D Moodspace Lens** (mood worlds, 3D card spaces, narrated tours). Keep as a marketing showcase, not a V1 feature.
- **A free tier.** Paid only, with a 3-day trial.
- **Mobile apps and other browsers:** Safari (iPhone, iPad, Mac), Firefox, Edge and an Android "Share to Fieldwork" app come after the Chrome launch.
- **Team plans,** shared workspaces and admin billing.
- **Integrations** (Google Sheets, Notion, CRMs). Excel and CSV exports cover V1.
- **Autonomous web crawling.** The Extractor works only on pages the user chose. No bulk scraping, no sites that forbid it.
- **Personal contact data.** No harvesting of personal emails or phone numbers (GDPR and CCPA risk). Company-level information only.
- **Automating logged-in pages** server-side or acting on the user's behalf (clicking, submitting forms, purchasing).
- **Snipping images in V1.** Text and numbers only until copyright handling is designed.

## Tech Stack Recommendation
- **Web app:** Next.js + TypeScript + Tailwind + Supabase (auth, Postgres, storage). Fits a subscription SaaS with projects, datasets and file exports, and ships fast.
- **Extension:** Chrome Manifest V3 in TypeScript (built with a framework such as WXT or Vite), using `activeTab` and a content script plus side panel. Needed to read the user's current page with a light permission prompt.
- **Content extraction:** Mozilla Readability plus page structured data (schema.org / JSON-LD, Open Graph), run in the browser. Proven, fast, and keeps raw browsing on the device.
- **AI:** the Claude API from Next.js server routes, using Claude Sonnet 5.5 for extraction and deliverables and Claude Haiku 5.5 for fast Lens chunking. JSON output, plus a server-side check of every quote against the source text.
- **Billing:** Stripe Checkout and Billing (subscriptions, 3-day trials, monthly and yearly prices, customer portal). The standard for SaaS trials and plan changes.
- **Exports:** PptxGenJS (PowerPoint), SheetJS (Excel), and a PDF renderer (server-side HTML to PDF, or jsPDF). All are already proven in the prototype.

## Data Model
| Entity | Key fields |
|---|---|
| **users** | id, email, name, package (`student` \| `pro`), created_at |
| **subscriptions** | user_id, stripe_customer_id, stripe_subscription_id, plan (`student` \| `pro`), interval (`month` \| `year`), status (`trialing` \| `active` \| `past_due` \| `canceled`), trial_ends_at, current_period_end |
| **projects** | id, user_id, name, package, created_at, updated_at |
| **sources** (captured pages) | id, project_id, url, title, page_type, captured_at, clean_text, content_hash, byline / author / publisher / date (if found) |
| **lens_views** | source_id, view_style, chunks (jsonb: label, text, source spans), coverage (facts placed / total), model, created_at |
| **extraction_runs** | id, project_id, template, request_text, source_ids[], status, model, input_tokens, output_tokens, started_at, finished_at |
| **objects** | id, run_id, project_id, source_id, type (`company`, `product`, `price`, `feature`, `claim` \| `source`, `fact`, `term`, `question`), fields (jsonb), quote, verified (bool), confidence |
| **snips** | id, project_id, source_id, text, quote, group_label, created_at |
| **deliverables** | id, run_id, project_id, kind (`report` \| `study_guide`), title, summary, sections (jsonb), created_at |
| **exports** | id, deliverable_id or project_id, format (`pdf` \| `pptx` \| `xlsx` \| `csv`), file_path, created_at |
| **usage_events** | id, user_id, kind (`extraction` \| `lens_ai`), units, created_at (used to meter the monthly allowance) |

Object field sets (from the prototype):
- **Professional:** company (name, website, industry, tagline, headquarters); product (company, name, category, description); price (company, plan, price, period, unit price, includes); feature (feature, company, plan); claim (company, claim, proof).
- **Student:** source (title, author, publisher, year, citation); fact (statement, topic); term (term, definition); question (question, answer).

## Open Questions
1. **Final pricing:** are Student $9/month or $90/year and Professional $24/month or $240/year right? These are placeholders.
2. **Trial terms:** does the 3-day trial require a card up front, and what happens to projects if a user doesn't convert?
3. **Monthly AI allowances:** are 100 (Student) and 300 (Professional) extractions right, and can users buy more?
4. **Privacy and data retention:** page text is sent to an AI provider for extraction. How long are captured pages and results kept, and is there a "don't store" mode for sensitive pages?
5. **Launch browsers:** Chrome only for V1, or Chrome plus Edge (same codebase)? When should Safari follow?
6. **Legal review:** confirm copyright guidance for capturing and quoting pages and for exporting quotes into client deliverables, plus Chrome Web Store policy compliance.
7. **Name:** run a trademark, domain and store-listing check for "Fieldwork" before launch.
8. **Sample projects:** which example projects ship in onboarding? Candidates: property management companies, project-management software, coworking spaces or event venues (Professional); sleep and the brain, renewable energy, Mars or ancient Rome (Student).
9. **Page types to support at launch:** which page types get custom Lens layouts in V1 beyond product, pricing, article and about?
10. **Accessibility commitment:** is the large-text, high-contrast mode required for launch or a fast follow?
11. **Exports:** is Word (.docx) needed for students in V1, or are PDF and PowerPoint enough?
12. **Branding on exports:** should free-trial exports carry a Fieldwork watermark?
13. **Languages:** English only at launch?

## Build Plan (suggested)
1. **Project setup:** Next.js + TypeScript + Tailwind app, Supabase project (auth, Postgres, storage), environment config, and the visual system from the prototype (black sidebar, outlined components, one soft-blue accent, light and dark themes).
2. **Database schema:** create the tables in the Data Model with row-level security so users only see their own projects, sources, objects, snips and exports.
3. **Auth and onboarding:** email sign-up and sign-in, choose Student or Professional, create a first project from a sample.
4. **Stripe billing:** products and prices for both plans (monthly and yearly), 3-day trial via Stripe Checkout, webhooks to keep `subscriptions` in sync, a customer portal link, and server-side gating of paid features by subscription status.
5. **Projects and sources UI:** home with project and template cards, project page with sources column and tabs (Lens, Extract, Datasets, Scrapbook, Deliverable), "Add a page" by pasting text.
6. **Chrome extension (MV3):** toolbar button using `activeTab`, a content script that runs Readability plus structured-data parsing, page-type detection, and "send to project" through an authenticated API route. Include a side panel showing the current project.
7. **Lens:** instant rule-based Chunks and Original views, then an AI pass (Haiku) that groups scattered facts into labeled chunks with source spans and a coverage count; fine print always kept; tap a chunk to highlight its origin.
8. **Extraction API:** server route that takes a request, template and source ids, calls Claude (Sonnet) for JSON objects plus a deliverable, verifies every quote against `clean_text`, stores `extraction_runs`, `objects` and `deliverables`, and records `usage_events`.
9. **Usage metering:** enforce the monthly allowance per plan, show usage on the account page, and return a clear message when the limit is reached.
10. **Datasets view:** object-type tabs, tables with evidence and "✓ Matched / ⚠ Check" status, and row click through to the highlighted quote in the Lens.
11. **Deliverable view and exports:** report or study guide preview, price comparison table, flashcards, slide previews, and PDF, PowerPoint, Excel and CSV generation, stored in `exports`.
12. **Scrapbook:** manual snipping from the Lens (selection to snip), and Table, Board, Notebook and Pin board layouts over one shared snip list, with group-by options, recommended defaults per package and CSV download.
13. **Account and plans pages:** profile, plan, renewal date, usage meter, preferences (lens mode, citation style), recent exports, and plan or billing changes.
14. **Quality pass:** a fixed test library of real pages (one per page type, messy and clean), automated extension and app tests, quote-match-rate checks, accessibility checks, and performance targets (clean view under 1 second).
15. **Launch prep (see [STORE-CHECKLIST.md](STORE-CHECKLIST.md) for each store):** privacy policy and terms, Chrome Web Store listing and review, analytics for time-to-answer, trial-to-paid conversion and "back to original" rate, and a private beta with 5–10 students and professionals.

## Store Submission
The full pre-submission checklist for the Chrome Web Store, Microsoft Edge, Apple App Store (Safari), Firefox and Google Play is in [STORE-CHECKLIST.md](STORE-CHECKLIST.md). The items most likely to cause a rejection are:
- **Apple:** subscription payment setup per region, Sign in with Apple, account deletion in the app, accurate privacy labels, and a container app that does real work on its own.
- **Chrome:** narrow permissions, a one-sentence single purpose, consent inside the extension before page text is sent to AI, and no remotely loaded code.
- **Google Play (optional):** billing fees, the Data safety form and the closed-testing requirement for new accounts.

