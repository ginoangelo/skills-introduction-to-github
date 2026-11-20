// Render a scene in marketing/video/ to a 1080x1920 MP4.
//   node marketing/render-video.cjs                  (renders overthinking.html)
//   node marketing/render-video.cjs overthinking 15  (scene name, seconds)
// Needs Playwright, ffmpeg, and mobile/node_modules (for the brand fonts).
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

(async () => {
  const scene = process.argv[2] || "overthinking";
  const seconds = Number(process.argv[3] || 15);
  const fps = 30;
  const root = path.resolve(__dirname);
  const html = path.join(root, "video", `${scene}.html`);
  const out = path.join(root, "video", `subtext-${scene}-${seconds}s.mp4`);
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), `subtext-${scene}-`));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto("file://" + html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const total = Math.round(seconds * fps);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.render(t), i / fps);
    await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
  await browser.close();

  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(frames, "f%04d.jpg"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-movflags", "+faststart", out]);
  for (const f of fs.readdirSync(frames)) fs.unlinkSync(path.join(frames, f));
  fs.rmdirSync(frames);
  console.log(`Wrote ${out} (${total} frames at ${fps} fps)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
