// Renders the made-up posts, text cards, verdict card, end card, and cover for
// "Is This About Me?" case 01: The 2:14 a.m. sunset. All 1080 x 1920 (9:16).
// Output: marketing/youtube/case01-the-2-14-am-sunset/assets/
// Usage: node marketing/youtube/render-case01.cjs   (needs Playwright and mobile/node_modules for fonts)
const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(__dirname, "case01-the-2-14-am-sunset", "assets");
const FONTS = path.join(ROOT, "mobile", "node_modules", "@expo-google-fonts");
const f = (p) => "file://" + path.join(FONTS, p);

const CSS = `
@font-face { font-family: Jakarta; font-weight: 800; src: url("${f("plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf")}"); }
@font-face { font-family: Jakarta; font-weight: 700; src: url("${f("plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf")}"); }
@font-face { font-family: Inter; font-weight: 500; src: url("${f("inter/500Medium/Inter_500Medium.ttf")}"); }
@font-face { font-family: Inter; font-weight: 600; src: url("${f("inter/600SemiBold/Inter_600SemiBold.ttf")}"); }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1920px; overflow: hidden; }
body { font-family: Inter, sans-serif; position: relative; }
.abs { position: absolute; }
.circle { position: absolute; border: 12px solid #ff3b30; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,.35); }
.mark { width: 120px; height: 120px; border-radius: 34px; background: #fff; position: relative; display: inline-block; }
.mark::before, .mark::after { content: ""; position: absolute; left: 26px; height: 15px; border-radius: 8px; }
.mark::before { top: 37px; width: 68px; background: #7a3ed6; }
.mark::after { top: 68px; width: 44px; background: #ffb48a; }
`;

// The umbrella: striped yellow canopy on a pole. (x, y) is the canopy's top-left; w is its width.
function umbrella(x, y, w, tilt = -8) {
  const h = w * 0.5;
  return `<div class="abs" style="left:${x}px; top:${y}px; width:${w}px; height:${w * 1.15}px; transform: rotate(${tilt}deg); transform-origin: 50% 100%;">
    <div class="abs" style="left:${w / 2 - 7}px; top:${h - 10}px; width:14px; height:${w * 0.68}px; background:#e8dccb; border-radius:7px;"></div>
    <div class="abs canopy" style="left:0; top:0; width:${w}px; height:${h}px; border-radius:${w}px ${w}px 0 0; overflow:hidden;
      background: repeating-conic-gradient(from 270deg at 50% 100%, #ffd23f 0deg 22.5deg, #fff4c2 22.5deg 45deg);"></div>
    <div class="abs" style="left:${w / 2 - 10}px; top:-14px; width:20px; height:20px; border-radius:50%; background:#e8dccb;"></div>
  </div>`;
}

// Leo's story, posted at 2:14 a.m.: the AI sunset photo (assets/ref_sunset.png) laid out the way people post
// a landscape photo to a story, centered on a blurred copy of itself. The yellow umbrella sits in the bottom left.
const SUNSET = "file://" + path.join(OUT, "ref_sunset.png");
function storyScene({ highlightCaption = false, hideSong = false } = {}) {
  return `<div class="abs" style="left:0; top:0; width:1080px; height:1920px; overflow:hidden; background:#000;">
    <div class="abs" style="left:-80px; top:-80px; right:-80px; bottom:-80px; background: url('${SUNSET}') center/cover; filter: blur(48px) brightness(.8);"></div>
    <div class="abs" style="left:0; top:656px; width:1080px; height:608px; background: url('${SUNSET}') center/cover;"></div>
    <div class="abs canopy" style="left:0; top:1050px; width:258px; height:214px;"></div>
    <div class="abs" style="left:64px; top:110px; display:flex; align-items:center; gap:22px;">
      <div style="width:84px; height:84px; border-radius:50%; background:#ffd3b8; color:#7a3ed6; font: 800 40px Jakarta; display:flex; align-items:center; justify-content:center; border:4px solid #fff;">L</div>
      <div style="font: 600 40px Inter; color:#fff; text-shadow: 0 2px 10px rgba(0,0,0,.4);">leo.m_</div>
      <div id="time" style="font: 600 36px Inter; color:#fff; background: rgba(0,0,0,.3); padding: 8px 20px; border-radius: 999px;">2:14 AM</div>
    </div>
    <div class="abs" style="left:110px; right:110px; top:400px; text-align:center;">
      <span style="font: 700 64px/1.25 Jakarta; color:#fff; letter-spacing:-1px; text-shadow: 0 4px 24px rgba(0,0,0,.5);
        ${highlightCaption ? "background: linear-gradient(transparent 58%, rgba(255,214,63,.75) 58%); box-decoration-break: clone; -webkit-box-decoration-break: clone; padding: 0 8px;" : ""}">some things look better from far away</span>
    </div>
    <div class="abs" style="left:0; right:0; top:1340px; display:${hideSong ? "none" : "flex"}; justify-content:center;">
      <div id="song" style="display:flex; align-items:center; gap:18px; background:#fff; border-radius:999px; padding:18px 34px 18px 20px; box-shadow: 0 12px 40px rgba(0,0,0,.35);">
        <div style="width:56px; height:56px; border-radius:50%; background:#7a3ed6; display:flex; align-items:center; justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="#fff"/><circle cx="17" cy="16" r="3" fill="#fff"/></svg>
        </div>
        <div style="font: 600 36px Inter; color:#1b1320;">Last Light <span style="color:#6a5f6f; font-weight:500;">· Lowtide Lanterns</span></div>
      </div>
    </div>
  </div>`;
}

// Maya's camera roll, June 14: the same umbrella on the beach in daylight.
const JUNE = path.join(OUT, "ref_june.png");
const HAS_JUNE = fs.existsSync(JUNE);
function juneScene() {
  if (HAS_JUNE) return `<div class="abs" style="left:0; top:0; width:1080px; height:1080px; background: url('file://${JUNE}') center/cover;"></div>`;
  return `<div class="abs" style="left:0; top:0; width:1080px; height:1080px; overflow:hidden;">
    <div class="abs" style="left:0; top:0; width:1080px; height:520px; background: linear-gradient(180deg, #ffe6c9 0%, #ffd2b0 100%);"></div>
    <div class="abs" style="left:0; top:520px; width:1080px; height:180px; background: linear-gradient(180deg, #c9a6e6 0%, #a77fd0 100%);"></div>
    <div class="abs" style="left:0; top:690px; width:1080px; height:390px; background: linear-gradient(180deg, #f3d3a8 0%, #e8bf8f 100%);"></div>
    <div class="abs" style="left:380px; top:930px; width:420px; height:110px; border-radius:16px; background: repeating-linear-gradient(90deg, #ff9fb4 0 50px, #fff 50px 100px); transform: rotate(-4deg);"></div>
    ${umbrella(150, 560, 440, -6)}
  </div>`;
}

// A window onto a scene: shows the region starting at (x, y) of size w x h, scaled to fit the window size.
function crop(scene, { x, y, w, h, winW, winH }) {
  const s = winW / w;
  return `<div style="position:relative; width:${winW}px; height:${winH}px; overflow:hidden;">
    <div style="position:absolute; left:0; top:0; width:1080px; height:1920px; transform-origin:0 0; transform: translate(${-x * s}px, ${-y * s}px) scale(${s});">${scene}</div>
  </div>`;
}

function page(body, bg = "transparent") {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS} body { background:${bg}; }</style></head><body>${body}</body></html>`;
}

const textCard = (small, big, note, bg = "#120d16") =>
  page(`<div class="abs" style="left:90px; right:180px; top:620px;">
    <div style="font: 600 44px Inter; color:#b3a8b7; letter-spacing: 1px;">${small}</div>
    <div style="font: 800 190px/1 Jakarta; color:#fff; letter-spacing:-8px; margin-top:22px;">${big}</div>
    ${note ? `<div style="font: 500 46px/1.3 Inter; color:#ffb48a; margin-top:34px;">${note}</div>` : ""}
  </div>`, bg);

const check = `<svg style="flex:none" width="64" height="64" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#7a3ed6"/><path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const ASSETS = {
  "case01_post_sunset_story.png": () => page(storyScene()),
  "case01_post_sunset_story_marked.png": () => page(storyScene()),
  "case01_post_caption_zoom.png": () =>
    page(`<div class="abs" style="left:0; top:0;">${crop(storyScene({ highlightCaption: true }), { x: 60, y: 200, w: 960, h: 1706, winW: 1080, winH: 1920 })}</div>`),
  "case01_post_song_zoom.png": () =>
    page(`<div class="abs" style="left:0; top:0;">${crop(storyScene(), { x: 190, y: 676, w: 700, h: 1244, winW: 1080, winH: 1920 })}</div>`),
  "case01_post_umbrella_zoom.png": () =>
    page(`<div class="abs" style="left:0; top:0;">${crop(storyScene({ hideSong: true }), { x: 0, y: 820, w: 440, h: 782, winW: 1080, winH: 1920 })}</div>`),
  "case01_post_june_photo.png": () =>
    page(`<div class="abs" style="left:0; right:0; top:300px; text-align:center; font: 600 44px Inter; color:#b3a8b7;">Maya's camera roll</div>
      <div class="abs" style="left:110px; top:420px; width:860px; background:#fffaf6; padding:36px 36px 120px; border-radius:12px; transform: rotate(-2deg); box-shadow: 0 30px 80px rgba(0,0,0,.45);">
        ${crop(juneScene(), { x: 0, y: 0, w: 1080, h: 1080, winW: 788, winH: 788 })}
        <div style="position:absolute; left:36px; bottom:36px; font: 700 52px Jakarta; color:#1b1320;">june 14 · beach day</div>
      </div>`, "#120d16"),
  "case01_post_match.png": () =>
    page(`<div class="abs" style="left:90px; right:180px; top:300px; font: 800 110px/1 Jakarta; color:#fff; letter-spacing:-4px;">Same umbrella.</div>
      <div class="abs" style="left:60px; top:560px; width:460px; background:#fffaf6; padding:20px 20px 90px; border-radius:10px; transform: rotate(-3deg); box-shadow: 0 24px 60px rgba(0,0,0,.45);">
        ${crop(storyScene(), { x: 0, y: 980, w: 300, h: 300, winW: 420, winH: 420 })}
        <div style="position:absolute; left:20px; bottom:22px; font: 700 38px Jakarta; color:#1b1320;">2:14 AM story</div>
      </div>
      <div class="abs" style="left:520px; top:640px; width:460px; background:#fffaf6; padding:20px 20px 90px; border-radius:10px; transform: rotate(3deg); box-shadow: 0 24px 60px rgba(0,0,0,.45);">
        ${crop(juneScene(), { x: 100, y: 500, w: 560, h: 560, winW: 420, winH: 420 })}
        <div style="position:absolute; left:20px; bottom:22px; font: 700 38px Jakarta; color:#1b1320;">june 14</div>
      </div>
      <svg class="abs" style="left:300px; top:1180px;" width="480" height="160" viewBox="0 0 480 160"><path d="M20 120 C 160 20, 320 20, 460 110" stroke="#ff3b30" stroke-width="10" fill="none" stroke-dasharray="4 22" stroke-linecap="round"/></svg>`, "#120d16"),
  "case01_text_call_ended.png": () => textCard("CALL ENDED", "12:14 AM", "Two hours before the post."),
  "case01_text_sunset_time.png": () => textCard("A SUNSET, POSTED AT", "2:14 AM", "Not live. This photo was chosen."),
  "case01_text_viewed.png": () => textCard("MAYA HAS VIEWED IT", "6 times", ""),
  "case01_text_evidence.png": () =>
    page(`<div class="abs" style="left:90px; right:180px; top:520px;">
      <div style="font: 600 44px Inter; color:#b3a8b7; letter-spacing:1px;">THE EVIDENCE</div>
      ${["The timing lines up", "The photo is theirs", "The caption is about distance"].map((t) => `<div style="display:flex; align-items:center; gap:30px; margin-top:54px;">${check}<div style="font: 800 72px/1.05 Jakarta; color:#fff; letter-spacing:-2px;">${t}</div></div>`).join("")}
    </div>`, "#120d16"),
  "case01_text_disclaimer.png": () =>
    page(`<div class="abs" style="left:0; right:0; top:1290px; display:flex; justify-content:center;">
      <div style="font: 600 36px Inter; color:#fff; background: rgba(18,13,22,.78); padding: 18px 32px; border-radius: 22px;">Made-up case. Any resemblance is coincidence.</div>
    </div>`),
  "case01_verdict.png": () =>
    page(`<div class="abs" style="left:70px; right:70px; top:420px; background:#7a3ed6; color:#fff; border-radius:56px; padding:64px 60px;">
        <div style="font: 600 32px Inter; letter-spacing:4px; opacity:.85;">STORY POST</div>
        <div style="font: 600 46px Inter; margin-top:18px; opacity:.92;">Aimed at Maya?</div>
        <div style="font: 800 170px/1.05 Jakarta; letter-spacing:-6px; margin-top:6px;">Likely</div>
        <div style="display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-top:34px;"><span style="height:16px; border-radius:8px; background:#fff;"></span><span style="height:16px; border-radius:8px; background:#fff;"></span><span style="height:16px; border-radius:8px; background:#fff;"></span></div>
        <div style="display:flex; justify-content:space-between; margin-top:16px; font: 600 32px Inter;"><span style="opacity:.7">Unlikely</span><span style="opacity:.7">Possibly</span><span>Likely</span></div>
        <div style="font: 500 44px/1.4 Inter; margin-top:36px;">Timing, photo, and caption line up.</div>
      </div>
      <div class="abs" style="left:90px; right:180px; top:1230px; font: 800 66px/1.12 Jakarta; color:#1b1320; letter-spacing:-2px;">"Nobody posts a sunset at 2 a.m. by accident."</div>`, "#fff0bf"),
  "case01_end.png": () =>
    page(`<div class="abs" style="left:0; right:0; top:560px; display:flex; flex-direction:column; align-items:center; gap:36px; color:#fff;">
        <span class="mark"></span>
        <div style="font: 800 150px/1 Jakarta; letter-spacing:-6px;">Aimed</div>
        <div style="font: 700 64px Jakarta; letter-spacing:-1px;">Screenshot yours.</div>
        <div style="margin-top:20px; background:#fff; color:#1b1320; font: 700 52px Jakarta; padding: 32px 70px; border-radius: 999px;">Link in bio</div>
      </div>`, "#7a3ed6"),
  "case01_cover.png": () =>
    page(`<div class="abs" style="left:0; top:0; opacity:.5; filter: blur(16px);">${crop(storyScene(), { x: 0, y: 0, w: 1080, h: 1920, winW: 1080, winH: 1920 })}</div>
      <div class="abs" style="left:0; top:0; width:1080px; height:1920px; background: linear-gradient(180deg, rgba(18,13,22,.2), rgba(18,13,22,.85));"></div>
      <div class="abs" style="left:80px; right:170px; top:330px;">
        <div style="display:inline-block; font: 700 40px Inter; color:#1b1320; background:#ffe9a3; padding: 12px 26px; border-radius: 999px;">IS THIS ABOUT ME? · CASE 01</div>
        <div style="font: 800 132px/1.02 Jakarta; color:#fff; letter-spacing:-5px; margin-top:40px;">Nobody posts a sunset at 2 a.m. by accident.</div>
      </div>`, "#120d16"),
};

// Red evidence circles, drawn around the element's real position after layout: [selector, padding].
const CIRCLES = {
  "case01_post_sunset_story_marked.png": ["#time", 26],
  "case01_post_song_zoom.png": ["#song", 34],
  "case01_post_umbrella_zoom.png": [".canopy", 40],
  ...(HAS_JUNE ? {} : { "case01_post_june_photo.png": [".canopy", 30] }),
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const [name, build] of Object.entries(ASSETS)) {
    const file = path.join(os.tmpdir(), "aimed-case01.html");
    fs.writeFileSync(file, build());
    await tab.goto("file://" + file, { waitUntil: "load" });
    await tab.evaluate(() => document.fonts.ready);
    if (CIRCLES[name]) {
      await tab.evaluate(([sel, pad]) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        const c = document.createElement("div");
        c.className = "circle";
        Object.assign(c.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
        document.body.appendChild(c);
      }, CIRCLES[name]);
    }
    await tab.waitForTimeout(100);
    await tab.screenshot({ path: path.join(OUT, name), omitBackground: name === "case01_text_disclaimer.png" });
    fs.unlinkSync(file);
  }
  await browser.close();
  console.log(`Rendered ${Object.keys(ASSETS).length} assets to ${path.relative(ROOT, OUT)}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
