// One "everything about Aimed" image for a pinned Instagram post: 1080 x 1350 (4:5).
// Three steps with app screens, plus pricing and privacy. Output: marketing/social/instagram/aimed-instagram-00-overview.png
// Usage: node marketing/render-overview.cjs   (needs Playwright and mobile/node_modules for fonts)
const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "docs", "screenshots", "app");
const FONTS = path.join(ROOT, "mobile", "node_modules", "@expo-google-fonts");
const f = (p) => "file://" + path.join(FONTS, p);

const STEPS = [
  { n: 1, title: "Screenshot it", text: "Share any post or story.", src: "light-02-add-context.png" },
  { n: 2, title: "Get the read", text: "What it means. If it's you.", src: "light-04-your-read.png" },
  { n: 3, title: "Decide what's next", text: "Three calm options to copy.", src: "light-13-what-now.png" },
];

const PHONE_W = 286;
const PHONE_H = Math.round((PHONE_W - 20) * (1688 / 780)) + 20;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Jakarta; font-weight: 800; src: url("${f("plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf")}"); }
@font-face { font-family: Inter; font-weight: 500; src: url("${f("inter/500Medium/Inter_500Medium.ttf")}"); }
@font-face { font-family: Inter; font-weight: 600; src: url("${f("inter/600SemiBold/Inter_600SemiBold.ttf")}"); }
* { box-sizing: border-box; margin: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; color: #1b1320; font-family: Inter, sans-serif;
  background: linear-gradient(180deg, #fff0bf 0%, #ffe3d3 55%, #f2eaff 100%); padding: 56px 60px 24px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 14px; font-family: Jakarta; font-weight: 800; font-size: 34px; letter-spacing: -1px; }
.mark { width: 50px; height: 50px; border-radius: 14px; background: #7a3ed6; position: relative; }
.mark::before, .mark::after { content: ""; position: absolute; left: 11px; height: 6px; border-radius: 3px; }
.mark::before { top: 16px; width: 28px; background: #fff; }
.mark::after { top: 28px; width: 18px; background: #ffb48a; }
h1 { margin-top: 30px; font-family: Jakarta; font-weight: 800; font-size: 76px; line-height: 1.02; letter-spacing: -0.04em; }
.sub { margin-top: 14px; font-size: 32px; font-weight: 500; color: #4a3f50; }
.steps { margin-top: 40px; display: flex; justify-content: space-between; }
.step { width: ${PHONE_W}px; display: flex; flex-direction: column; gap: 12px; }
.label { display: flex; align-items: center; gap: 10px; }
.num { width: 38px; height: 38px; border-radius: 50%; background: #7a3ed6; color: #fff; font-family: Jakarta; font-weight: 800; font-size: 20px; display: flex; align-items: center; justify-content: center; flex: none; }
.title { font-family: Jakarta; font-weight: 800; font-size: 25px; letter-spacing: -0.5px; line-height: 1.1; }
.text { font-size: 19px; line-height: 1.3; color: #4a3f50; white-space: nowrap; }
.phone { width: ${PHONE_W}px; height: ${PHONE_H}px; border-radius: 38px; border: 10px solid #1b1320; overflow: hidden; background: #fff; box-shadow: 0 24px 60px rgba(40, 10, 50, .28); }
.phone img { width: 100%; display: block; }
.footer { margin-top: 40px; display: flex; gap: 14px; }
.cta { margin-top: auto; margin-bottom: auto; align-self: center; border-radius: 999px; background: #7a3ed6; color: #fff; font-family: Jakarta; font-weight: 800; font-size: 30px; letter-spacing: -0.5px; padding: 20px 46px; box-shadow: 0 16px 40px rgba(122, 62, 214, .3); }
.pill { flex: 1; border-radius: 22px; padding: 16px 20px; background: #fff; }
.pill.dark { background: #1b1320; color: #fff; }
.pill b { display: block; font-family: Jakarta; font-weight: 800; font-size: 21px; letter-spacing: -0.3px; }
.pill span { display: block; margin-top: 4px; font-size: 17px; line-height: 1.3; opacity: .85; }
</style></head><body>
<div class="brand"><span class="mark"></span>Aimed</div>
<h1>Is this post about you?</h1>
<p class="sub">Aimed reads between the lines.</p>
<div class="steps">
${STEPS.map((s) => `<div class="step"><div class="label"><span class="num">${s.n}</span><span class="title">${s.title}</span></div><p class="text">${s.text}</p><div class="phone"><img src="file://${path.join(SRC, s.src)}"></div></div>`).join("\n")}
</div>
<div class="footer">
  <div class="pill"><b>Free</b><span>2 decodes a day</span></div>
  <div class="pill"><b>Pro</b><span>$9.99 a month or $34.99 a year</span></div>
  <div class="pill dark"><b>Private</b><span>Nothing kept. Reads posts, not people.</span></div>
</div>
<div class="cta">Try it free. Link in bio.</div>
</body></html>`;

(async () => {
  const out = path.join(ROOT, "marketing", "social", "instagram", "aimed-instagram-00-overview.png");
  const file = path.join(os.tmpdir(), "aimed-overview.html");
  fs.writeFileSync(file, html);
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await tab.goto("file://" + file, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(150);
  const bottom = await tab.evaluate(() => {
    const phone = document.querySelector(".phone").getBoundingClientRect().bottom;
    const footer = document.querySelector(".footer").getBoundingClientRect().top;
    return { phone, footer };
  });
  if (bottom.phone > bottom.footer - 20) console.warn("Warning: phones run into the footer", bottom);
  await tab.screenshot({ path: out });
  await browser.close();
  fs.unlinkSync(file);
  console.log("Wrote", path.relative(ROOT, out));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
