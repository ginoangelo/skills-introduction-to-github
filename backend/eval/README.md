# Model comparison test

Runs the same screenshots through each Claude model so you can compare read quality, speed, and cost before choosing one.

1. Put 50 to 200 screenshots of made-up or permission-given posts in `eval/screenshots/` (PNG or JPEG).
2. Optional: add `eval/screenshots/contexts.csv` with one line per screenshot, like `story1.png,we argued last night`.
3. Run it:

```bash
cd backend
ANTHROPIC_API_KEY=your-key npm run compare
```

4. Open the `eval/results-….csv` file it writes in Google Sheets or Excel, and mark each read accurate or not.
5. Pick the cheapest model whose reads are rated accurate at least 70% of the time, the bar from the PDR.
6. Switch the live service to it with no app update: `npm run deploy -- -c model=claude-haiku-5-5`.

Each run costs real API usage: the number of screenshots times each model's cost per decode. 100 screenshots across all three models is roughly $5 at current prices.

Screenshots and results in this folder are kept out of git.
