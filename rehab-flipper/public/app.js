/* Rehab Flipper UI. One state object, one render function. */
(function () {
  var RF = window.RF;
  var MOCKUP = !!window.RF_MOCKUP;
  var root = document.getElementById('app');

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var saved = store.get('rf.settings', {});
  var state = {
    tab: 'estimate', room: 'kitchen', tier: 'mid', view: 'after',
    zip: saved.zip || '43215', label: '',
    look: saved.look || 'clean', photo: null, analysis: RF.applyLook(RF.DEMO.kitchen, saved.look || 'clean'), live: false, busy: false, notice: '', openLine: null,
    arv: saved.arv || '', purchase: saved.purchase || '',
    settings: { laborMult: saved.laborMult || 1, contingency: saved.contingency || {}, overrides: {} }
  };
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var canListen = !!SR && !MOCKUP;
  state.chat = null; state.listening = false; state.ai = false;

  function persist() {
    store.set('rf.settings', { zip: state.zip, look: state.look, laborMult: state.settings.laborMult, contingency: state.settings.contingency, arv: state.arv, purchase: state.purchase });
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function short(n) { return n >= 10000 ? '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : usd(n); }
  function range(a, b) { return a === b ? usd(a) : usd(a) + ' – ' + usd(b); }
  function hex(c, d) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : d; }
  function palette(p) {
    p = p || {};
    return { wall: hex(p.wall, '#e9ecec'), cabinet: hex(p.cabinet, '#fbfaf5'), counter: hex(p.counter, '#eceae4'), backsplash: hex(p.backsplash, '#f7f7f4'), floor: hex(p.floor, '#9c8263'), hardware: hex(p.hardware, '#8a8f94') };
  }
  function priced(tier) { return RF.price(state.analysis, tier, Object.assign({ zip: state.zip }, state.settings)); }
  function tierDef(id) { return RF.TIERS.filter(function (t) { return t.id === id; })[0]; }

  // ---------- views ----------
  function viewer() {
    var a = state.analysis, t = a.tiers[state.tier];
    var before = state.photo
      ? '<img src="' + state.photo + '" alt="Your photo of the room">'
      : RF.sketch(a.room_type, palette(a.current_palette), 'before', 'Sketch of the room as it is now');
    var after = RF.sketch(a.room_type, palette(t.palette), state.tier, 'Concept sketch of the ' + tierDef(state.tier).name + ' package');
    var isAfter = state.view === 'after';
    return '<div class="viewer">' + (isAfter ? after : before) +
      '<span class="tag">' + (isAfter ? 'Concept sketch · ' + esc(t.concept_name) : (state.photo ? 'Your photo' : 'Sample room · before')) + '</span>' +
      '<div class="seg viewer-seg" role="group" aria-label="Before or after">' +
      '<button data-act="view" data-v="before" aria-pressed="' + !isAfter + '">Before</button>' +
      '<button data-act="view" data-v="after" aria-pressed="' + isAfter + '">After</button></div></div>';
  }

  function ask() {
    var tips = ['Make it modern farmhouse', 'Leave out the appliances', "I'll paint it myself", "What's the total?"];
    return '<section class="card ask-card"><form id="askform" class="askrow">' +
      (canListen ? '<button type="button" class="mic' + (state.listening ? ' on' : '') + '" data-act="mic" aria-pressed="' + state.listening + '" aria-label="' + (state.listening ? 'Stop listening' : 'Talk to Rehab Flipper') + '">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' : '') +
      '<input id="say" type="text" autocomplete="off" placeholder="' + (state.listening ? 'Listening…' : canListen ? 'Talk or type a change' : 'Type a change') + '" aria-label="Tell Rehab Flipper what to change">' +
      '<button class="btn send" type="submit">Go</button></form>' +
      (state.chat
        ? '<p class="you">“' + esc(state.chat.you) + '”</p><p class="reply" aria-live="polite">' + esc(state.chat.reply) + '</p>'
        : '<div class="tips">' + tips.map(function (t) { return '<button type="button" data-act="tip" data-v="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>') +
      (canListen ? '' : '<p class="fine">' + (MOCKUP ? 'In the app you can also tap a microphone and talk; replies are read aloud.' : 'This browser has no speech recognition, so type instead.') + '</p>') +
      '</section>';
  }

  function capture() {
    return '<section class="card capture">' +
      '<p class="ask">What look are you going for?</p>' +
      '<div class="looks" role="group" aria-label="Look">' + RF.LOOKS.map(function (l) {
        return '<button class="look" data-act="look" data-v="' + l.id + '" aria-pressed="' + (state.look === l.id) + '">' +
          '<span class="dots"><i style="background:' + l.c.cabinet + '"></i><i style="background:' + l.c.bold + '"></i><i style="background:' + l.c.hardware + '"></i></span>' + l.name + '</button>';
      }).join('') + '</div>' +
      '<p class="fine look-brief">' + esc(RF.look(state.look).brief) + '</p>' +
      '<div class="row">' +
      '<div class="seg" role="group" aria-label="Room type">' +
      '<button data-act="room" data-v="kitchen" aria-pressed="' + (state.room === 'kitchen') + '">Kitchen</button>' +
      '<button data-act="room" data-v="bathroom" aria-pressed="' + (state.room === 'bathroom') + '">Bathroom</button></div>' +
      '<label class="zip">ZIP <input id="zip" inputmode="numeric" maxlength="5" value="' + esc(state.zip) + '" aria-label="Property ZIP code"></label>' +
      '</div>' +
      '<div class="row">' +
      '<label class="btn ghost" for="photo">' + (state.photo ? 'Retake photo' : 'Take or upload photo') + '</label>' +
      '<input id="photo" type="file" accept="image/*" capture="environment" hidden>' +
      '<button class="btn" data-act="estimate"' + (state.busy ? ' disabled' : '') + '>' + (state.busy ? 'Reading the room…' : 'Estimate this room') + '</button>' +
      '</div>' +
      (state.notice ? '<p class="notice">' + esc(state.notice) + '</p>' : '') +
      '</section>';
  }

  function tiers() {
    return '<div class="tiers" role="group" aria-label="Rehab package">' + RF.TIERS.map(function (t) {
      var p = priced(t.id);
      return '<button class="tier" data-act="tier" data-v="' + t.id + '" aria-pressed="' + (state.tier === t.id) + '">' +
        '<span class="tier-name">' + t.name + '</span>' +
        '<span class="tier-total">' + short(p.typical) + '</span>' +
        '<span class="tier-range">' + short(p.totalLo) + ' – ' + short(p.totalHi) + '</span></button>';
    }).join('') + '</div>';
  }

  function concept() {
    var t = state.analysis.tiers[state.tier], p = palette(t.palette);
    var names = { wall: 'Walls', cabinet: state.analysis.room_type === 'bathroom' ? 'Vanity' : 'Cabinets', counter: 'Counter', backsplash: state.analysis.room_type === 'bathroom' ? 'Surround' : 'Backsplash', floor: 'Floor', hardware: 'Hardware' };
    return '<section class="card"><h2>' + esc(t.concept_name) + '</h2><p class="body">' + esc(t.design_notes) + '</p>' +
      '<ul class="swatches">' + Object.keys(names).map(function (k) {
        return '<li><span class="chip" style="background:' + p[k] + '"></span>' + names[k] + '</li>';
      }).join('') + '</ul></section>';
  }

  function summary(p) {
    var sf = Number(state.analysis.measurements.floor_sf) || 0;
    return '<section class="card totals"><h2>' + tierDef(state.tier).name + ' budget</h2><dl>' +
      '<div><dt>Materials</dt><dd>' + usd(p.materials) + '</dd></div>' +
      '<div><dt>Labor <small>' + esc(p.region.label) + '</small></dt><dd>' + range(p.laborLo, p.laborHi) + '</dd></div>' +
      '<div><dt>Contingency <small>' + p.contingencyPct + '%</small></dt><dd>' + range(p.contLo, p.contHi) + '</dd></div>' +
      '<div class="grand"><dt>Total</dt><dd>' + range(p.totalLo, p.totalHi) + '</dd></div></dl>' +
      (sf ? '<p class="fine">About ' + usd(p.typical / sf) + ' per square foot of floor. Not contractor verified.</p>' : '') +
      '</section>';
  }

  var LEVELS = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard', pro: 'Hire a pro' };
  function hours(l) { return l.hoursLo === l.hoursHi ? l.hoursLo : l.hoursLo + '–' + l.hoursHi; }
  function catalogItem(id) { return RF.CATALOG.filter(function (it) { return it.id === id; })[0]; }
  function guide(l, key) {
    var it = catalogItem(l.id), g = it.diy, shop = RF.shopLinks(it.shop);
    var out = '<div class="guide">';
    if (shop.length) out += '<p class="shop">Check today\'s prices: ' + shop.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.store + '</a>'; }).join(' · ') + '</p>';
    if (!l.canDiy) return out + '<p class="lvl pro">Hire a pro</p><p class="fine">' + esc(g.why) + '</p></div>';
    out += '<p class="lvl ' + g.level + '">' + LEVELS[g.level] + ' to do yourself · about ' + hours(l) + ' hours</p>' +
      '<label class="check"><input id="d-' + key + '" type="checkbox" data-edit="diy" data-key="' + key + '"' + (l.diy ? ' checked' : '') + '> I\'ll do this myself (saves ' + range(l.proLo - l.supplies, l.proHi - l.supplies) + ')</label>' +
      '<h4>You need</h4><p class="fine">' + esc(g.tools) + '. Tools and supplies allowance: ' + usd(g.supplies) + '.</p>' +
      '<h4>Steps</h4><ol>' + g.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<p class="watch"><b>Watch for:</b> ' + esc(g.watch) + '</p></div>';
    return out;
  }
  function diyCard(p) {
    var can = p.lines.filter(function (l) { return l.included && l.canDiy; });
    if (!can.length) return '';
    var d = p.diy;
    return '<section class="card"><h2>Do it yourself</h2><p class="body">' +
      (d.count ? 'You are doing ' + d.count + ' job' + (d.count > 1 ? 's' : '') + ' yourself: about <b>' + (d.hoursLo === d.hoursHi ? d.hoursLo : d.hoursLo + '–' + d.hoursHi) + ' hours</b> of your time, saving <b>' + range(d.saveLo, d.saveHi) + '</b> after tools and supplies.'
        : 'Tick the jobs you would do yourself. Labor comes off the budget and each line shows the steps.') + '</p>' +
      can.map(function (l) {
        var key = p.tier + ':' + l.id;
        return '<label class="diyrow"><input id="dc-' + key + '" type="checkbox" data-edit="diy" data-key="' + key + '"' + (l.diy ? ' checked' : '') + '>' +
          '<span class="diy-name">' + esc(l.name) + '</span><span class="lvl ' + l.level + '">' + LEVELS[l.level] + '</span>' +
          '<span class="diy-save">' + hours(l) + ' h · ' + short(l.proLo - l.supplies) + '–' + short(l.proHi - l.supplies) + '</span></label>';
      }).join('') +
      '<p class="fine">Open a line under Itemized scope for tools, steps and what to watch for. Jobs not listed here need a licensed pro.</p></section>';
  }

  function lines(p) {
    var cats = [];
    p.lines.forEach(function (l) { if (cats.indexOf(l.cat) < 0) cats.push(l.cat); });
    return '<section class="card"><h2>Itemized scope</h2><p class="fine">Tap a line to change its quantity or price, or to leave it out.</p>' +
      cats.map(function (c) {
        return '<h3>' + esc(c) + '</h3>' + p.lines.filter(function (l) { return l.cat === c; }).map(function (l) {
          var key = p.tier + ':' + l.id;
          return '<details class="line' + (l.included ? '' : ' off') + '"' + (state.openLine === key ? ' open' : '') + ' data-key="' + key + '">' +
            '<summary><span class="line-name">' + esc(l.name) + (l.diy ? ' <em>DIY</em>' : '') + (l.edited ? ' <em>edited</em>' : '') + '</span>' +
            '<span class="line-qty">' + l.qty + ' ' + l.unit + '</span>' +
            '<span class="line-cost">' + (l.included ? range(l.mat + l.laborLo, l.mat + l.laborHi) : 'left out') + '</span></summary>' +
            '<div class="line-edit">' +
            '<label>Quantity (' + l.unit + ') <input id="q-' + key + '" type="number" min="0" step="any" data-edit="qty" data-key="' + key + '" value="' + l.qty + '"></label>' +
            '<label>Material per ' + l.unit + ' <input id="m-' + key + '" type="number" min="0" step="any" data-edit="mat" data-key="' + key + '" value="' + l.matUnit + '"></label>' +
            '<label class="check"><input id="i-' + key + '" type="checkbox" data-edit="off" data-key="' + key + '"' + (l.included ? ' checked' : '') + '> Include</label>' +
            '<p class="fine">Materials ' + usd(l.mat) + ' · Labor ' + (l.diy ? 'yours' : range(l.laborLo, l.laborHi)) + '</p>' + guide(l, key) + '</div></details>';
        }).join('');
      }).join('') + '</section>';
  }

  function assumptions() {
    var a = state.analysis, m = a.measurements;
    return '<section class="card"><h2>What the estimate assumes</h2><p class="body">' + esc(a.summary) + '</p>' +
      '<div class="measures">' + RF.MEASURES.map(function (d) {
        return '<label>' + d.label + ' <span><input id="ms-' + d.key + '" type="number" min="0" step="any" data-measure="' + d.key + '" value="' + (m[d.key] || 0) + '"> ' + d.unit + '</span></label>';
      }).join('') + '</div>' +
      '<h3>Seen in the photo</h3><ul class="list">' + a.observations.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' +
      '<h3 class="warn">A photo can\'t show</h3><ul class="list">' + a.unseen_risks.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' +
      '</section>';
  }

  function estimateTab() {
    var p = priced(state.tier);
    return viewer() + ask() + capture() + tiers() + summary(p) + diyCard(p) + concept() + lines(p) + assumptions();
  }

  function ratesTab() {
    var r = RF.regionFactor(state.zip), lm = state.settings.laborMult;
    return '<section class="card"><h2>Labor in your market</h2>' +
      '<p class="body">ZIP ' + esc(state.zip) + ' uses a labor index of <b>' + r.factor.toFixed(2) + '</b> (' + esc(r.label) + '). If your contractor runs cheaper or pricier than typical, adjust here and every estimate follows.</p>' +
      '<label class="slider">My contractor vs. area average <b>' + Math.round(lm * 100) + '%</b>' +
      '<input id="laborMult" type="range" min="0.6" max="1.6" step="0.05" value="' + lm + '"></label></section>' +
      '<section class="card"><h2>Contingency</h2><p class="body">The buffer for surprises behind walls and under floors.</p><div class="measures">' +
      RF.TIERS.map(function (t) {
        var v = state.settings.contingency[t.id];
        return '<label>' + t.name + ' <span><input id="ct-' + t.id + '" type="number" min="0" max="50" data-cont="' + t.id + '" value="' + (v != null && v !== '' ? v : t.contingency) + '"> %</span></label>';
      }).join('') + '</div></section>' +
      '<section class="card"><h2>Price edits</h2><p class="body">' + Object.keys(state.settings.overrides).length + ' line edits on this room.</p>' +
      '<button class="btn ghost" data-act="reset">Reset edits and rates</button></section>';
  }

  function sheetTab() {
    var a = state.analysis, p = priced(state.tier), t = a.tiers[state.tier];
    var arv = Number(state.arv) || 0, buy = Number(state.purchase) || 0;
    var mao = arv ? Math.round(arv * 0.7 - p.totalHi) : 0;
    return '<section class="card sheet">' +
      '<div class="sheet-head"><div><p class="eyebrow">Rehab deal sheet</p>' +
      '<input id="label" class="sheet-title" placeholder="Property address or nickname" value="' + esc(state.label) + '" aria-label="Property label"></div>' +
      '<p class="fine">' + (a.room_type === 'bathroom' ? 'Bathroom' : 'Kitchen') + ' · ZIP ' + esc(state.zip) + '<br>' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + '</p></div>' +
      '<div class="sheet-img">' + RF.sketch(a.room_type, palette(t.palette), state.tier, 'Concept sketch') + '<span class="tag">Concept sketch, not a photo</span></div>' +
      '<div class="scroll"><table><thead><tr><th>Package</th><th>Materials</th><th>Labor</th><th>Total</th></tr></thead><tbody>' +
      RF.TIERS.map(function (x) {
        var q = priced(x.id);
        return '<tr' + (x.id === state.tier ? ' class="sel"' : '') + '><td>' + x.name + '</td><td>' + usd(q.materials) + '</td><td>' + range(q.laborLo, q.laborHi) + '</td><td>' + range(q.totalLo, q.totalHi) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<h3>' + tierDef(state.tier).name + ' scope · ' + esc(t.concept_name) + '</h3>' +
      '<div class="scroll"><table class="scope"><thead><tr><th>Item</th><th>Qty</th><th>Materials</th><th>Labor</th></tr></thead><tbody>' +
      p.lines.filter(function (l) { return l.included; }).map(function (l) {
        return '<tr><td>' + esc(l.name) + '</td><td>' + l.qty + ' ' + l.unit + '</td><td>' + usd(l.mat) + '</td><td>' + (l.diy ? 'DIY' : range(l.laborLo, l.laborHi)) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<h3>Offer check</h3><div class="measures">' +
      '<label>After-repair value (your number) <span>$ <input id="arv" type="number" min="0" step="1000" value="' + esc(state.arv) + '" placeholder="0"></span></label>' +
      '<label>Asking or contract price <span>$ <input id="purchase" type="number" min="0" step="1000" value="' + esc(state.purchase) + '" placeholder="0"></span></label></div>' +
      (arv ? '<p class="body">70% rule on this room alone: maximum offer <b>' + usd(mao) + '</b>' + (buy ? (buy <= mao ? ' <span class="good">Price is under it.</span>' : ' <span class="warn">Price is ' + usd(buy - mao) + ' over.</span>') : '') + '</p>' : '<p class="fine">Enter your own after-repair value to see a maximum offer by the 70% rule. This room\'s high-end total is used as the repair cost; add other repairs before relying on it.</p>') +
      '<p class="fine disclaimer">Planning estimate from one photo and a starter price book. Not contractor verified, not a bid and not an appraisal. Hidden conditions can change the cost.</p>' +
      (MOCKUP ? '<p class="fine">In the app, this page exports as a one-page PDF.</p>' : '<button class="btn noprint" data-act="print">Print or save as PDF</button>') +
      '</section>';
  }

  function render() {
    var tabs = [['estimate', 'Estimate'], ['rates', 'My rates'], ['sheet', 'Deal sheet']];
    root.innerHTML =
      '<header class="bar"><span class="brand">Rehab<b>Flipper</b></span>' +
      '<span class="badge">' + (state.live ? 'Live analysis' : 'Sample numbers') + '</span></header>' +
      '<nav class="tabs" aria-label="Sections">' + tabs.map(function (t) {
        return '<button data-act="tab" data-v="' + t[0] + '" aria-current="' + (state.tab === t[0] ? 'page' : 'false') + '">' + t[1] + '</button>';
      }).join('') + '</nav><main>' +
      (state.tab === 'estimate' ? estimateTab() : state.tab === 'rates' ? ratesTab() : sheetTab()) + '</main>';
  }

  // ---------- actions ----------
  function shrink(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1568, k = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { cb(null); };
      img.src = reader.result;
    };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  function useSample(msg) {
    state.analysis = RF.applyLook(RF.DEMO[state.room], state.look); state.live = false; state.settings.overrides = {};
    state.notice = msg; state.busy = false; render();
  }

  function estimate() {
    if (!/^\d{5}$/.test(state.zip)) { state.notice = 'Enter a 5-digit ZIP code so labor can be priced for the area.'; return render(); }
    if (MOCKUP) return useSample('This mock-up shows sample numbers. In the app, your photo is analyzed here.');
    if (!state.photo) return useSample('Showing the sample ' + state.room + '. Add a photo to estimate a real room.');
    state.busy = true; state.notice = ''; render();
    fetch('api/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: state.photo, roomType: state.room, zip: state.zip, look: state.look }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) return useSample(res.body.error || 'The photo could not be analyzed. Showing sample numbers.');
        state.analysis = res.body.analysis; state.room = state.analysis.room_type; state.live = true;
        state.settings.overrides = {}; state.view = 'after'; state.busy = false; state.notice = ''; render();
      })
      .catch(function () { useSample('Could not reach the server. Showing sample numbers.'); });
  }

  // ---------- talk to it ----------
  function speak(text) {
    try { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) { /* no voice output */ }
  }
  function totalSentence() {
    var p = priced(state.tier);
    return tierDef(state.tier).name + ' package is ' + usd(p.totalLo) + ' to ' + usd(p.totalHi) + '.';
  }
  /* Applies actions and returns a short sentence for each one that took effect. */
  function applyActions(actions) {
    var said = [], lines = priced(state.tier).lines;
    function line(id) { return lines.filter(function (l) { return l.id === id; })[0]; }
    function ov(id) { var k = state.tier + ':' + id; return (state.settings.overrides[k] = state.settings.overrides[k] || {}); }
    (actions || []).forEach(function (a) {
      var n = Number(a.number), l;
      switch (a.type) {
        case 'look': if (RF.look(a.target).id === a.target) { state.look = a.target; state.analysis = RF.applyLook(state.analysis, a.target); state.view = 'after'; said.push('Restyled to ' + RF.look(a.target).name + '.'); } break;
        case 'tier': if (tierDef(a.target)) { state.tier = a.target; state.view = 'after'; lines = priced(state.tier).lines; said.push('Showing the ' + tierDef(a.target).name + ' package.'); } break;
        case 'room': if ((a.target === 'kitchen' || a.target === 'bathroom') && a.target !== state.analysis.room_type) {
          if (state.live) said.push('Take a photo of the ' + a.target + ' to switch rooms.');
          else { state.room = a.target; state.analysis = RF.applyLook(RF.DEMO[a.target], state.look); state.settings.overrides = {}; lines = priced(state.tier).lines; said.push('Switched to the ' + a.target + '.'); }
        } break;
        case 'view': if (a.target === 'before' || a.target === 'after') { state.view = a.target; state.tab = 'estimate'; said.push('Showing ' + a.target + '.'); } break;
        case 'tab': if (['estimate', 'rates', 'sheet'].indexOf(a.target) >= 0) { state.tab = a.target; said.push(a.target === 'sheet' ? 'Here is the deal sheet.' : a.target === 'rates' ? 'Here are your rates.' : 'Back to the estimate.'); } break;
        case 'exclude': if ((l = line(a.target))) { ov(l.id).off = true; said.push('Left out ' + l.name.toLowerCase() + '.'); } break;
        case 'include': if ((l = line(a.target))) { ov(l.id).off = false; said.push('Added back ' + l.name.toLowerCase() + '.'); } break;
        case 'qty': if ((l = line(a.target)) && n >= 0) { ov(l.id).qty = n; said.push('Set ' + l.name.toLowerCase() + ' to ' + n + ' ' + l.unit + '.'); } break;
        case 'price': if ((l = line(a.target)) && n >= 0) { ov(l.id).mat = n; said.push('Priced ' + l.name.toLowerCase() + ' at ' + usd(n) + ' per ' + l.unit + '.'); } break;
        case 'labor': if (n > 0) { state.settings.laborMult = Math.min(1.6, Math.max(0.6, n / 100)); said.push('Labor set to ' + Math.round(state.settings.laborMult * 100) + ' percent of the area average.'); } break;
        case 'contingency': if (n >= 0 && n <= 50) { state.settings.contingency[state.tier] = n; said.push('Contingency set to ' + n + ' percent.'); } break;
        case 'zip': if (/^[0-9]{5}$/.test(a.target)) { state.zip = a.target; said.push('Pricing labor for ZIP ' + a.target.split('').join(' ') + '.'); } break;
        case 'arv': if (n > 0) { state.arv = String(n); state.tab = 'sheet'; said.push('After-repair value set to ' + usd(n) + '.'); } break;
        case 'purchase': if (n > 0) { state.purchase = String(n); state.tab = 'sheet'; said.push('Price set to ' + usd(n) + '.'); } break;
        case 'diy': if ((l = line(a.target))) { if (l.canDiy) { ov(l.id).diy = true; said.push('You are doing ' + l.name.toLowerCase() + ' yourself, about ' + hours(l) + ' hours.'); } else said.push(l.name + ' needs a licensed pro, so I left it as hired out.'); } break;
        case 'pro': if ((l = line(a.target))) { ov(l.id).diy = false; said.push('Hiring out ' + l.name.toLowerCase() + '.'); } break;
        case 'reset': state.settings = { laborMult: 1, contingency: {}, overrides: {} }; said.push('Cleared your edits.'); break;
        case 'total': said.push(''); break;
      }
    });
    persist();
    return said;
  }
  function command(text, spoken) {
    text = String(text || '').trim(); if (!text) return;
    function finish(actions, lead) {
      var said = applyActions(actions), reply;
      if (!said.length) reply = lead || "I didn't catch a change. Try “make it farmhouse” or “leave out the appliances”.";
      else reply = (lead || said.filter(Boolean).join(' ')) + ' ' + totalSentence();
      state.chat = { you: text, reply: reply.trim() }; state.openLine = null; render();
      if (spoken) speak(state.chat.reply);
    }
    function local() { finish(RF.parseCommand(text, { lines: priced(state.tier).lines }).actions); }
    if (MOCKUP || !state.ai) return local();
    var p = priced(state.tier);
    fetch('api/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text, context: {
      room: state.analysis.room_type, tier: state.tier, look: state.look, zip: state.zip,
      items: p.lines.map(function (l) { return { id: l.id, name: l.name, qty: l.qty, unit: l.unit, included: l.included, canDiy: l.canDiy, diy: l.diy }; }) } }) })
      .then(function (r) { if (!r.ok) throw new Error('command failed'); return r.json(); })
      .then(function (j) { finish(j.actions, j.reply); })
      .catch(local);
  }
  var recog = null;
  function toggleMic() {
    if (state.listening && recog) { recog.stop(); return; }
    recog = new SR(); recog.lang = 'en-US'; recog.interimResults = false; recog.maxAlternatives = 1;
    var heard = '';
    recog.onresult = function (e) { heard = e.results[0][0].transcript; };
    recog.onerror = function (e) { state.chat = { you: '…', reply: e.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in the browser, or type instead.' : "I couldn't hear that. Try again or type it." }; };
    recog.onend = function () { state.listening = false; if (heard) command(heard, true); else render(); };
    state.listening = true; render();
    try { recog.start(); } catch (e) { state.listening = false; render(); }
  }
  root.addEventListener('submit', function (e) {
    if (e.target.id !== 'askform') return;
    e.preventDefault(); command(document.getElementById('say').value, false);
  });

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act, v = b.dataset.v;
    if (act === 'tab') state.tab = v;
    else if (act === 'tier') { state.tier = v; state.view = 'after'; state.openLine = null; }
    else if (act === 'view') state.view = v;
    else if (act === 'room') { state.room = v; if (!state.live) { state.analysis = RF.applyLook(RF.DEMO[v], state.look); state.settings.overrides = {}; } }
    else if (act === 'look') { state.look = v; state.analysis = RF.applyLook(state.analysis, v); state.view = 'after'; persist(); }
    else if (act === 'estimate') return estimate();
    else if (act === 'mic') return toggleMic();
    else if (act === 'tip') return command(v, false);
    else if (act === 'print') return window.print();
    else if (act === 'reset') { state.settings = { laborMult: 1, contingency: {}, overrides: {} }; persist(); }
    render();
  });

  root.addEventListener('toggle', function (e) {
    var d = e.target; if (!d.classList || !d.classList.contains('line')) return;
    if (d.open) state.openLine = d.dataset.key; else if (state.openLine === d.dataset.key) state.openLine = null;
  }, true);

  root.addEventListener('change', function (e) {
    var el = e.target, d = el.dataset;
    if (el.id === 'photo') {
      if (!el.files[0]) return;
      return shrink(el.files[0], function (url) {
        if (!url) { state.notice = 'That file could not be read as a photo.'; return render(); }
        state.photo = url; state.view = 'before'; state.notice = 'Photo added. Tap Estimate this room.'; render();
      });
    }
    if (el.id === 'zip') state.zip = el.value.trim();
    else if (el.id === 'label') { state.label = el.value; return; }
    else if (el.id === 'arv') state.arv = el.value;
    else if (el.id === 'purchase') state.purchase = el.value;
    else if (el.id === 'laborMult') state.settings.laborMult = Number(el.value);
    else if (d.cont) state.settings.contingency[d.cont] = el.value === '' ? null : Math.max(0, Number(el.value));
    else if (d.measure) { state.analysis = Object.assign({}, state.analysis, { measurements: Object.assign({}, state.analysis.measurements) }); state.analysis.measurements[d.measure] = Math.max(0, Number(el.value) || 0); }
    else if (d.edit) {
      var o = state.settings.overrides[d.key] = state.settings.overrides[d.key] || {};
      if (d.edit === 'off') o.off = !el.checked;
      else if (d.edit === 'diy') o.diy = el.checked;
      else if (el.value === '' || Number(el.value) < 0) delete o[d.edit];
      else o[d.edit] = Number(el.value);
    } else return;
    persist(); render();
  });

  if (!MOCKUP) {
    fetch('api/health').then(function (r) { return r.json(); }).then(function (h) {
      state.ai = !!h.ai;
      if (!h.ai) { state.notice = 'No AI key is set on the server, so photos are not analyzed yet. Sample numbers are shown.'; render(); }
    }).catch(function () { /* static hosting: stay on sample data */ });
  }
  render();
})();
