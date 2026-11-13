// Mr. Handyman web app — vanilla JS, no build step.
(() => {
  const $ = (id) => document.getElementById(id);
  const MAX_PHOTOS = 4;
  const MAX_DIM = 1568; // Claude's sweet spot for image size; keeps uploads small
  const HISTORY_KEY = "mrh.history.v1";
  let photos = []; // { blob, url }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(Number(n) || 0).toLocaleString();
  const range = (lo, hi) => (Math.round(lo) === Math.round(hi) ? money(lo) : `${money(lo)}–${money(hi).slice(1)}`);

  // ---------- views ----------
  function show(view) {
    for (const v of ["inputView", "loadingView", "reportView", "historyView"]) $(v).classList.toggle("hidden", v !== view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- photos ----------
  async function downscale(file) {
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) return file; // unsupported (e.g. HEIC on some browsers) — send as-is
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise((res) => canvas.toBlob((b) => res(b || file), "image/jpeg", 0.85));
  }

  async function addFiles(fileList) {
    for (const f of [...fileList]) {
      if (photos.length >= MAX_PHOTOS) break;
      if (!f.type.startsWith("image/")) continue;
      const blob = await downscale(f);
      photos.push({ blob, url: URL.createObjectURL(blob) });
    }
    renderThumbs();
  }

  function renderThumbs() {
    $("thumbs").innerHTML = photos
      .map((p, i) => `<div class="thumb"><img src="${p.url}" alt="Photo ${i + 1}"><button type="button" data-i="${i}" aria-label="Remove photo">✕</button></div>`)
      .join("");
    $("dropzone").classList.toggle("hidden", photos.length >= MAX_PHOTOS);
  }

  $("thumbs").addEventListener("click", (e) => {
    const i = e.target.dataset?.i;
    if (i === undefined) return;
    URL.revokeObjectURL(photos[i].url);
    photos.splice(Number(i), 1);
    renderThumbs();
  });
  $("photoInput").addEventListener("change", (e) => { addFiles(e.target.files); e.target.value = ""; });
  const dz = $("dropzone");
  ["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
  dz.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

  $("examples").addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) { $("description").value = e.target.textContent; $("description").focus(); }
  });

  // ---------- submit ----------
  const loadingMsgs = ["Looking at your photos…", "Figuring out what's wrong…", "Pricing parts and tools…", "Writing your step-by-step plan…", "Comparing DIY vs. pro costs…"];

  $("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = $("description").value.trim();
    const err = $("formError");
    err.classList.add("hidden");
    if (!description && photos.length === 0) {
      err.textContent = "Add at least one photo or a description.";
      err.classList.remove("hidden");
      return;
    }
    const fd = new FormData();
    photos.forEach((p, i) => fd.append("photos", p.blob, `photo${i + 1}.jpg`));
    fd.append("description", description);
    fd.append("skill", $("skill").value);
    fd.append("zip", $("zip").value.trim());

    show("loadingView");
    let m = 0;
    $("loadingMsg").textContent = loadingMsgs[0];
    const timer = setInterval(() => { m = (m + 1) % loadingMsgs.length; $("loadingMsg").textContent = loadingMsgs[m]; }, 5000);
    try {
      const res = await fetch("/api/diagnose", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      const thumb = photos[0] ? await thumbDataUrl(photos[0].blob) : null;
      const entry = { id: Date.now(), date: new Date().toISOString(), description, thumb, report: data.report, demo: data.demo, done: [] };
      saveHistory(entry);
      renderReport(entry);
      show("reportView");
    } catch (ex) {
      show("inputView");
      err.textContent = ex.message || "Something went wrong. Please try again.";
      err.classList.remove("hidden");
    } finally {
      clearInterval(timer);
    }
  });

  async function thumbDataUrl(blob) {
    const bmp = await createImageBitmap(blob).catch(() => null);
    if (!bmp) return null;
    const c = document.createElement("canvas");
    const s = 160 / Math.max(bmp.width, bmp.height);
    c.width = bmp.width * s; c.height = bmp.height * s;
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  }

  // ---------- report ----------
  const VERDICT = {
    diy_easy: ["ok", "✅ Easy DIY"],
    diy_moderate: ["warn", "🛠 Moderate DIY"],
    diy_advanced: ["warn", "⚠️ Advanced DIY"],
    call_pro: ["bad", "👷 Call a pro"],
    emergency: ["bad", "🚨 Emergency"],
  };
  const URGENCY = { can_wait: "Can wait", fix_soon: "Fix soon", fix_today: "Fix today", emergency_now: "Act now" };
  const CONF = { low: "Low confidence", medium: "Medium confidence", high: "High confidence" };

  function budgetTable(title, rows) {
    if (!rows?.length) return "";
    const body = rows.map((r) => `
      <tr class="${r.already_own_likely ? "owned" : ""}">
        <td>${esc(r.item)}<div class="sub">${esc(r.quantity)} · ${esc(r.where_to_buy)}${r.already_own_likely ? " · <em>you probably own this</em>" : ""}</div></td>
        <td>${range(r.cost_low, r.cost_high)}</td>
      </tr>`).join("");
    return `<h4 style="margin:14px 0 4px">${title}</h4><div class="table-scroll"><table class="budget"><tbody>${body}</tbody></table></div>`;
  }

  function list(items) { return items?.length ? `<ul class="plain">${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""; }

  function renderReport(entry) {
    const r = entry.report;
    const [cls, label] = VERDICT[r.verdict] || ["neutral", r.verdict];
    const isPro = r.verdict === "call_pro" || r.verdict === "emergency";
    const saving = Math.max(0, r.pro_cost_high - r.diy_total_low);
    const ytUrl = "https://www.youtube.com/results?search_query=" + encodeURIComponent(r.video_search_query || r.title);

    const steps = (r.steps || []).map((s, i) => `
      <li data-step="${i}" class="${entry.done?.includes(i) ? "done" : ""}">
        <h4 title="Tap to mark done">${esc(s.title)}</h4>
        <p>${esc(s.instructions)}</p>
        ${s.safety ? `<p class="safety">⚠️ ${esc(s.safety)}</p>` : ""}
        ${s.tip ? `<p class="tip">💡 ${esc(s.tip)}</p>` : ""}
      </li>`).join("");

    const alts = (r.alternatives || []).map((a) => `
      <tr><td><strong>${esc(a.option)}</strong><div class="sub">${esc(a.description)}</div></td><td>${a.cost_high > 0 ? range(a.cost_low, a.cost_high) : "Free"}</td></tr>`).join("");

    $("report").innerHTML = `
      ${entry.demo ? `<div class="notice">Sample report (demo mode). Add an API key on the server for real diagnoses.</div>` : ""}
      ${r.verdict === "emergency" ? `<div class="emergency">🚨 ${esc(r.verdict_reason)}</div>` : ""}
      <div class="card report-head">
        <div class="meta">
          <span class="badge ${cls}">${label}</span>
          <span class="badge neutral">⏱ ${esc(r.time_estimate)}</span>
          <span class="badge neutral">${esc(URGENCY[r.urgency] || r.urgency)}</span>
          <span class="badge neutral">${esc(CONF[r.confidence] || r.confidence)}</span>
        </div>
        <h2>${esc(r.title)}</h2>
        <p>${esc(r.diagnosis)}</p>
        ${r.other_possible_causes?.length ? `<p class="hint"><strong>Could also be:</strong> ${r.other_possible_causes.map(esc).join("; ")}</p>` : ""}
        <p class="hint"><strong>Why ${label.replace(/^\S+\s/, "").toLowerCase()}:</strong> ${esc(r.verdict_reason)}</p>
      </div>

      <div class="card">
        <h3>💵 Your budget</h3>
        <div class="compare">
          <div class="box diy"><div class="lbl">${isPro ? "Interim / supplies" : "Do it yourself"}</div><div class="amt">${range(r.diy_total_low, r.diy_total_high)}</div></div>
          <div class="box pro"><div class="lbl">${esc(r.pro_type)}</div><div class="amt">${range(r.pro_cost_low, r.pro_cost_high)}</div></div>
        </div>
        ${!isPro && saving > 0 ? `<div class="savings">DIY could save you up to ${money(saving)}</div>` : ""}
        ${budgetTable("Materials & parts", r.materials)}
        ${budgetTable("Tools", r.tools)}
        <p class="disclaimer" style="margin-top:10px">Estimates based on typical US big-box prices${$("zip").value ? " and your area" : ""}. Confirm prices in store.</p>
      </div>

      ${r.safety_warnings?.length ? `<div class="card"><h3>🛑 Safety first</h3>${list(r.safety_warnings)}</div>` : ""}

      ${steps ? `<div class="card">
        <h3>${isPro ? "🧯 What to do right now" : "🪜 Step-by-step"}</h3>
        <p class="hint">Tap a step to check it off.</p>
        <ol class="steps" id="stepsList">${steps}</ol>
        <a class="btn secondary" target="_blank" rel="noopener" href="${ytUrl}">▶️ Watch a video of this repair</a>
      </div>` : ""}

      ${r.stop_and_call_a_pro_if?.length ? `<div class="card"><h3>✋ Stop and call a pro if…</h3>${list(r.stop_and_call_a_pro_if)}</div>` : ""}

      ${alts ? `<div class="card"><h3>🔀 Your options</h3><div class="table-scroll"><table class="budget"><tbody>${alts}</tbody></table></div></div>` : ""}

      <div class="card">
        <h3>📨 Message for a contractor</h3>
        <div class="copybox" id="proMsg">${esc(r.what_to_tell_the_pro)}</div>
        <div class="actions" style="margin-top:10px"><button class="btn secondary" type="button" id="copyBtn">📋 Copy message</button></div>
        ${r.questions_to_ask_the_pro?.length ? `<h4 style="margin:16px 0 6px">Questions to ask before hiring</h4>${list(r.questions_to_ask_the_pro)}` : ""}
      </div>

      ${r.follow_up_questions?.length ? `<div class="card"><h3>🔍 Help us be more accurate</h3><p class="hint">If you can answer these, start a new request with the details:</p>${list(r.follow_up_questions)}</div>` : ""}

      <p class="disclaimer">AI-generated guidance. Not a substitute for an in-person inspection by a licensed professional. Follow local codes and permit requirements.</p>
    `;

    $("copyBtn").onclick = async () => {
      try { await navigator.clipboard.writeText(r.what_to_tell_the_pro); $("copyBtn").textContent = "✅ Copied"; }
      catch { $("copyBtn").textContent = "Select the text to copy"; }
    };
    const sl = $("stepsList");
    if (sl) sl.onclick = (e) => {
      const li = e.target.closest("li[data-step]");
      if (!li) return;
      li.classList.toggle("done");
      const i = Number(li.dataset.step);
      entry.done = li.classList.contains("done") ? [...new Set([...(entry.done || []), i])] : (entry.done || []).filter((x) => x !== i);
      updateHistory(entry);
    };
  }

  // ---------- history (on-device only) ----------
  function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function writeHistory(h) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 30))); } catch { /* storage full or blocked */ } }
  function saveHistory(entry) { writeHistory([entry, ...loadHistory()]); }
  function updateHistory(entry) { writeHistory(loadHistory().map((e) => (e.id === entry.id ? entry : e))); }

  function renderHistory() {
    const h = loadHistory();
    $("historyList").innerHTML = h.length ? h.map((e) => {
      const [cls, label] = VERDICT[e.report.verdict] || ["neutral", ""];
      return `<div class="history-item" data-id="${e.id}">
        <div style="display:flex;gap:12px;align-items:center;min-width:0">
          ${e.thumb ? `<img src="${e.thumb}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover">` : `<div style="width:48px;height:48px;border-radius:8px;background:var(--surface-2);display:grid;place-items:center">🔧</div>`}
          <div style="min-width:0"><strong>${esc(e.report.title)}</strong><div class="hint">${new Date(e.date).toLocaleDateString()}</div></div>
        </div>
        <span class="badge ${cls}">${label}</span>
      </div>`;
    }).join("") : `<p class="hint" style="margin:0">No repairs yet. Your diagnoses will show up here (saved only on this device).</p>`;
  }
  $("historyList").addEventListener("click", (e) => {
    const item = e.target.closest(".history-item");
    if (!item) return;
    const entry = loadHistory().find((x) => String(x.id) === item.dataset.id);
    if (entry) { renderReport(entry); show("reportView"); }
  });

  function resetForm() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    photos = []; renderThumbs();
    $("description").value = "";
    $("formError").classList.add("hidden");
    show("inputView");
  }
  $("historyBtn").onclick = () => { renderHistory(); show("historyView"); };
  $("newBtn").onclick = resetForm;
  $("backBtn").onclick = resetForm;

  // ---------- boot ----------
  fetch("/api/health").then((r) => r.json()).then((h) => { if (h.demo) $("demoNotice").classList.remove("hidden"); }).catch(() => {});
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
})();
