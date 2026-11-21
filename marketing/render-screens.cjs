// Single-screen social images of the Aimed app, in two sizes:
//   TikTok, Reels, and Stories: 1080 x 1920 (9:16)  -> marketing/social/tiktok/
//   Instagram feed:              1080 x 1350 (4:5)   -> marketing/social/instagram/
// Source screens come from docs/screenshots/app/.
// Usage: node marketing/render-screens.cjs   (needs Playwright and mobile/node_modules for fonts)
const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "docs", "screenshots", "app");
const FONTS = path.join(ROOT, "mobile", "node_modules", "@expo-google-fonts");

// One entry per image: source screen, headline, short line under it, background, text color.
const SCREENS = [
  { id: "01-home", src: "light-01-home.png", head: "Is this post about you?", sub: "Screenshot it. Aimed reads between the lines.", bg: "#7a3ed6", ink: "#ffffff" },
  { id: "02-add-context", src: "light-02-add-context.png", head: "Tell it what happened.", sub: "One line of context makes the read sharper.", bg: "#fff0bf", ink: "#1b1320" },
  { id: "03-your-read", src: "light-04-your-read.png", head: "Likely. Possibly. Unlikely.", sub: "A straight answer on whether it's aimed at you.", bg: "#ffe3d3", ink: "#1b1320" },
  { id: "04-evidence", src: "light-05-your-read-evidence.png", head: "Not vibes. Evidence.", sub: "Every read shows what it's based on.", bg: "#f2eaff", ink: "#1b1320" },
  { id: "05-recent", src: "light-08-home-recent-decodes.png", head: "Your reads stay on your phone.", sub: "Nothing about the post is stored on a server.", bg: "#fffaf6", ink: "#1b1320" },
  { id: "06-history", src: "light-09-history.png", head: "Every read, one tap away.", sub: "Search your history any time.", bg: "#7a3ed6", ink: "#ffffff" },
  { id: "07-about", src: "light-10-about.png", head: "Reads posts, not people.", sub: "No labels. Honest when there's not enough to tell.", bg: "#1b1320", ink: "#ffffff" },
  { id: "08-pro", src: "light-07-paywall-after-first-read.png", head: "2 free decodes a day.", sub: "Go Pro for 30 a day. Yearly starts with 3 days free.", bg: "#fff0bf", ink: "#1b1320" },
  { id: "09-dark-mode", src: "dark-03-your-read.png", head: "Easy on the eyes at 3 a.m.", sub: "Dark mode, built in.", bg: "#120d16", ink: "#ffffff" },
];

const SIZES = {
  tiktok: { w: 1080, h: 1920, pad: 96, top: 130, headSize: 96, subSize: 40, phoneW: 600, bottom: 90, out: "tiktok" },
  instagram: { w: 1080, h: 1350, pad: 80, top: 84, headSize: 74, subSize: 34, phoneW: 500, bottom: 64, out: "instagram" },
};

function page(screen, size) {
  const f = (p) => "file://" + path.join(FONTS, p);
  const phoneH = Math.round(size.phoneW * (1688 / 780)) + 36;
  const markBg = screen.ink === "#ffffff" ? "#ffffff" : "#7a3ed6";
  const markLine = screen.ink === "#ffffff" ? "#7a3ed6" : "#ffffff";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Jakarta; font-weight: 800; src: url("${f("plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf")}"); }
  @font-face { font-family: Inter; font-weight: 500; src: url("${f("inter/500Medium/Inter_500Medium.ttf")}"); }
  * { box-sizing: border-box; margin: 0; }
  body { width: ${size.w}px; height: ${size.h}px; overflow: hidden; background: ${screen.bg}; color: ${screen.ink}; font-family: Inter, sans-serif; display: flex; flex-direction: column; padding: ${size.top - 60}px ${size.pad}px 0; }
  .brand { display: flex; align-items: center; gap: 14px; font-family: Jakarta; font-weight: 800; font-size: 34px; letter-spacing: -1px; flex: none; }
  .mark { width: 50px; height: 50px; border-radius: 14px; background: ${markBg}; position: relative; }
  .mark::before, .mark::after { content: ""; position: absolute; left: 11px; height: 6px; border-radius: 3px; }
  .mark::before { top: 16px; width: 28px; background: ${markLine}; }
  .mark::after { top: 28px; width: 18px; background: #ffb48a; }
  h1 { margin-top: ${Math.round(size.headSize * 0.62)}px; flex: none; font-family: Jakarta; font-weight: 800; font-size: ${size.headSize}px; line-height: 1.04; letter-spacing: -0.04em; text-wrap: balance; }
  p { margin-top: ${Math.round(size.subSize * 0.55)}px; flex: none; max-width: 860px; font-size: ${size.subSize}px; line-height: 1.3; font-weight: 500; opacity: .85; }
  .phone { flex: none; align-self: center; margin-top: ${Math.round(size.headSize * 0.75)}px; width: ${size.phoneW}px; height: ${phoneH}px; border-radius: ${Math.round(size.phoneW * 0.13)}px; border: 18px solid #1b1320; overflow: hidden; background: #fff; box-shadow: 0 40px 110px rgba(40, 10, 50, .35); }
  .phone img { width: 100%; display: block; }
  </style></head><body>
  <div class="brand"><span class="mark"></span>Aimed</div>
  <h1>${screen.head}</h1>
  <p>${screen.sub}</p>
  <div class="phone"><img src="file://${path.join(SRC, screen.src)}"></div>
  </body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  for (const size of Object.values(SIZES)) {
    const outDir = path.join(ROOT, "marketing", "social", size.out);
    fs.mkdirSync(outDir, { recursive: true });
    const tab = await browser.newPage({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1 });
    for (const screen of SCREENS) {
      const file = path.join(os.tmpdir(), `aimed-screen-${size.out}-${screen.id}.html`);
      fs.writeFileSync(file, page(screen, size));
      await tab.goto("file://" + file, { waitUntil: "load" });
      await tab.evaluate(() => document.fonts.ready);
      // Shrink the phone, if needed, so the whole phone fits above the bottom margin.
      await tab.evaluate((bottom) => {
        const phone = document.querySelector(".phone");
        const border = 36;
        const room = window.innerHeight - bottom - phone.getBoundingClientRect().top;
        const h = Math.min(phone.offsetHeight, room);
        const w = Math.round((h - border) * (780 / 1688)) + border;
        phone.style.height = h + "px";
        phone.style.width = w + "px";
        phone.style.borderRadius = Math.round(w * 0.13) + "px";
      }, size.bottom);
      await tab.waitForTimeout(100);
      await tab.screenshot({ path: path.join(outDir, `aimed-${size.out}-${screen.id}.png`) });
      fs.unlinkSync(file);
    }
    await tab.close();
  }
  await browser.close();
  console.log(`Rendered ${SCREENS.length} screens in ${Object.keys(SIZES).length} sizes.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
