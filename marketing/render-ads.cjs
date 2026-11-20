const { chromium } = require("playwright");
const path = require("path");
(async () => {
  // Usage: node marketing/render-ads.cjs   (from the repo root; needs Playwright and mobile/node_modules for fonts)
  const ROOT = path.resolve(__dirname, "..");
  const SRC = path.join(ROOT, "marketing", "source");
  const OUT = path.join(ROOT, "marketing", "ads");
  const FONTS = path.join(ROOT, "mobile", "node_modules", "@expo-google-fonts");
  const S = require("os").tmpdir();
  const shot = (n) => "file://" + path.join(SRC, n);
  const f = (p) => "file://" + path.join(FONTS, p);
  const css = `
  @font-face { font-family: Jakarta; font-weight: 800; src: url("${f("plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf")}"); }
  @font-face { font-family: Jakarta; font-weight: 700; src: url("${f("plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf")}"); }
  @font-face { font-family: Inter; font-weight: 500; src: url("${f("inter/500Medium/Inter_500Medium.ttf")}"); }
  @font-face { font-family: Inter; font-weight: 600; src: url("${f("inter/600SemiBold/Inter_600SemiBold.ttf")}"); }
  * { box-sizing: border-box; margin: 0; }
  body { width: 1080px; height: 1920px; overflow: hidden; }
  .ad { width: 1080px; height: 1920px; position: relative; overflow: hidden; padding: 120px 96px 0; font-family: Inter, sans-serif; }
  .brand { display: flex; align-items: center; gap: 18px; font-family: Jakarta; font-weight: 800; font-size: 40px; letter-spacing: -1px; }
  .mark { width: 60px; height: 60px; border-radius: 17px; background: #7a3ed6; position: relative; }
  .mark::before, .mark::after { content: ""; position: absolute; left: 13px; height: 7px; border-radius: 4px; }
  .mark::before { top: 19px; width: 34px; background: #fff; } .mark::after { top: 34px; width: 22px; background: #ffb48a; }
  .on-violet .mark { background: #fff; } .on-violet .mark::before { background: #7a3ed6; }
  h1 { max-width: 880px; font-family: Jakarta; font-weight: 800; font-size: 118px; line-height: 1.02; letter-spacing: -4.5px; margin-top: 70px; }
  .sub { font-size: 44px; line-height: 1.32; font-weight: 500; margin-top: 34px; max-width: 840px; opacity: .88; }
  .cta { position: absolute; left: 96px; top: 1330px; display: inline-flex; align-items: center; height: 108px; padding: 0 56px; border-radius: 999px; font-family: Jakarta; font-weight: 700; font-size: 44px; }
  .cta.dark { background: #1b1320; color: #fff; } .cta.light { background: #fff; color: #1b1320; }
  .phone { position: absolute; width: 520px; height: 1080px; border-radius: 72px; border: 16px solid #1b1320; overflow: hidden; background: #fff; box-shadow: 0 40px 100px rgba(60,20,60,.28); }
  .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
  .tag { position: absolute; left: 96px; top: 1468px; font-size: 30px; font-weight: 600; opacity: .7; }
  `;
  const brand = `<div class="brand"><span class="mark"></span>Subtext</div>`;
  const ads = {
    "01-hook": `<div class="ad on-violet" style="background:#7a3ed6;color:#fff">${brand}
      <h1>Is this post<br>about you?</h1>
      <p class="sub">Screenshot it. Subtext reads between the lines and tells you.</p>
      <div class="phone" style="left:500px;top:700px;transform:rotate(6deg)"><img src="${shot("r-clean.png")}"></div>
      <div class="cta light">Try it free</div><div class="tag">Read between the lines.</div></div>`,
    "02-verdict": `<div class="ad" style="background:#fffaf6;color:#1b1320">${brand}
      <h1>Likely.<br>Possibly.<br>Unlikely.</h1>
      <p class="sub">A straight answer on whether it's aimed at you, and why.</p>
      <div style="position:absolute;left:96px;right:96px;top:810px;background:#7a3ed6;color:#fff;border-radius:48px;padding:56px">
        <div style="font-size:30px;font-weight:600;letter-spacing:3px;opacity:.85">STORY POST</div>
        <div style="font-size:42px;font-weight:600;margin-top:22px;opacity:.92">Aimed at you?</div>
        <div style="font-family:Jakarta;font-weight:800;font-size:120px;letter-spacing:-4px;line-height:1.05">Possibly</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:34px"><span style="height:14px;border-radius:7px;background:#fff"></span><span style="height:14px;border-radius:7px;background:#fff"></span><span style="height:14px;border-radius:7px;background:rgba(255,255,255,.3)"></span></div>
        <div style="display:flex;justify-content:space-between;margin-top:16px;font-size:30px;font-weight:600"><span style="opacity:.7">Unlikely</span><span>Possibly</span><span style="opacity:.7">Likely</span></div>
      </div>
      <div class="cta dark">Try it free</div><div class="tag">Read between the lines.</div></div>`,
    "03-evidence": `<div class="ad" style="background:#ffe3d3;color:#1b1320">${brand}
      <h1>Not vibes.<br>Evidence.</h1>
      <p class="sub">Every read shows exactly what it's based on.</p>
      <div style="position:absolute;left:96px;right:96px;top:660px;background:#fff;border-radius:44px;box-shadow:0 30px 80px rgba(120,60,40,.16);overflow:hidden">
        ${[["“only miss you when they need something”", "Second-person, accusing phrasing usually targets one person."], ["Song: thank u, next", "A breakup anthem on a story usually signals a falling out."], ["Posted 2 hours ago", "Timing matters most when it lines up with something that just happened."]]
          .map(([c, w], i) => `<div style="padding:28px 44px;${i ? "border-top:2px solid #f1e6dc" : ""}"><div style="font-family:Jakarta;font-weight:700;font-size:36px;line-height:1.2">${c}</div><div style="font-size:29px;color:#6a5f6f;margin-top:6px;line-height:1.35">${w}</div></div>`).join("")}
      </div>
      <div class="cta dark">Try it free</div><div class="tag">Read between the lines.</div></div>`,
    "04-context": `<div class="ad" style="background:#fff0bf;color:#1b1320">${brand}
      <h1>Tell it what<br>happened.</h1>
      <p class="sub">Add one line of context and get a sharper read.</p>
      <div class="phone" style="left:470px;top:690px;transform:rotate(-5deg)"><img src="${shot("m-context.png")}" style="object-position:0 34%"></div>
      <div style="position:absolute;left:96px;top:760px;display:grid;gap:22px;width:520px">
        ${["We argued recently", "We stopped talking", "They're my ex"].map((c, i) => `<span style="justify-self:start;padding:24px 36px;border-radius:999px;font-family:Jakarta;font-weight:700;font-size:38px;${i === 1 ? "background:#1b1320;color:#fff" : "background:#fff;box-shadow:0 10px 30px rgba(80,60,0,.12)"}">${c}</span>`).join("")}
      </div>
      <div class="cta dark">Try it free</div><div class="tag">Read between the lines.</div></div>`,
    "05-share": `<div class="ad" style="background:#f2eaff;color:#1b1320">${brand}
      <h1>Screenshot.<br>Share.<br>Decoded.</h1>
      <div style="position:absolute;left:96px;top:720px;display:grid;gap:40px;width:460px">
        ${["Screenshot the post", "Share it to Subtext", "Get the read"].map((t, i) => `<div style="display:flex;align-items:center;gap:28px"><span style="width:84px;height:84px;border-radius:50%;background:#7a3ed6;color:#fff;font-family:Jakarta;font-weight:800;font-size:42px;display:grid;place-items:center;flex:none">${i + 1}</span><span style="font-family:Jakarta;font-weight:700;font-size:44px;line-height:1.15">${t}</span></div>`).join("")}
      </div>
      <div class="phone" style="left:580px;top:700px;width:440px;height:920px;transform:rotate(5deg)"><img src="${shot("r-clean.png")}"></div>
      <div class="cta dark">Try it free</div><div class="tag">Read between the lines.</div></div>`,
    "06-privacy": `<div class="ad on-violet" style="background:#1b1320;color:#fff">${brand}
      <h1>We don't keep<br>your screenshots.</h1>
      <div style="position:absolute;left:96px;right:96px;top:720px;display:grid;gap:26px">
        ${["Used once for your read, then gone", "Your history stays on your phone", "Reads posts, never labels people"].map((t) => `<div style="display:flex;gap:28px;align-items:center;background:rgba(255,255,255,.07);border-radius:36px;padding:38px 44px"><span style="width:64px;height:64px;border-radius:20px;background:#ffb48a;color:#1b1320;display:grid;place-items:center;flex:none"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1b1320" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span style="font-family:Jakarta;font-weight:700;font-size:42px;line-height:1.2">${t}</span></div>`).join("")}
      </div>
      <div class="cta light">Try it free</div><div class="tag">Read between the lines.</div></div>`,
    "07-pro": `<div class="ad on-violet" style="background:#7a3ed6;color:#fff">${brand}
      <h1>Decode the<br>whole thread.</h1>
      <p class="sub">Pro: 30 decodes a day, full comment threads, follow-up questions, and blurred sharing.</p>
      <div class="phone" style="left:520px;top:840px;transform:rotate(6deg)"><img src="${shot("plans.png")}"></div>
      <div style="position:absolute;left:96px;top:880px;background:#ffe9a3;color:#1b1320;border-radius:36px;padding:34px 40px;width:400px">
        <div style="font-family:Jakarta;font-weight:800;font-size:76px;letter-spacing:-2px;line-height:1">3 days</div>
        <div style="font-family:Jakarta;font-weight:700;font-size:38px">free</div>
        <div style="font-size:28px;font-weight:600;margin-top:12px;opacity:.8">then $34.99 a year<br>or $9.99 a month</div>
      </div>
      <div class="cta light">Start free trial</div><div class="tag">Read between the lines.</div></div>`,
  };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const [name, html] of Object.entries(ads)) {
    const file = path.join(S, `ad-${name}.html`);
    require("fs").writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
    await page.goto("file://" + file, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `subtext-ad-${name}.png`) });
  }
  await browser.close();
  console.log("rendered", Object.keys(ads).length);
})().catch((e) => { console.error(e); process.exit(1); });
