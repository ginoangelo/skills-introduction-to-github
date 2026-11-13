// Builds dist/mockup.html: the real UI with sample data, inlined into one file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (f) => fs.readFileSync(path.join(root, "public", f), "utf8");
const fonts = pub("index.html").match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const scripts = ["catalog.js", "pricing.js", "rooms.js", "looks.js", "demo.js", "app.js"].map((f) => `<script>\n${pub(f)}\n</script>`).join("\n");

const html = `<title>Rehab Flipper Mock-up</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${pub("styles.css")}
</style>
<p class="frame-note">Clickable mock-up with sample numbers. Pick a look, switch packages, edit a line, open My rates and Deal sheet.</p>
<div class="device"><div id="app"></div></div>
<script>window.RF_MOCKUP = true;</script>
${scripts}
`;
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "mockup.html"), html);
console.log("wrote dist/mockup.html", html.length, "bytes");
