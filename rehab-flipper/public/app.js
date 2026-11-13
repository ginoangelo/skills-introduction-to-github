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

  function lines(p) {
    var cats = [];
    p.lines.forEach(function (l) { if (cats.indexOf(l.cat) < 0) cats.push(l.cat); });
    return '<section class="card"><h2>Itemized scope</h2><p class="fine">Tap a line to change its quantity or price, or to leave it out.</p>' +
      cats.map(function (c) {
        return '<h3>' + esc(c) + '</h3>' + p.lines.filter(function (l) { return l.cat === c; }).map(function (l) {
          var key = p.tier + ':' + l.id;
          return '<details class="line' + (l.included ? '' : ' off') + '"' + (state.openLine === key ? ' open' : '') + ' data-key="' + key + '">' +
            '<summary><span class="line-name">' + esc(l.name) + (l.edited ? ' <em>edited</em>' : '') + '</span>' +
            '<span class="line-qty">' + l.qty + ' ' + l.unit + '</span>' +
            '<span class="line-cost">' + (l.included ? range(l.mat + l.laborLo, l.mat + l.laborHi) : 'left out') + '</span></summary>' +
            '<div class="line-edit">' +
            '<label>Quantity (' + l.unit + ') <input id="q-' + key + '" type="number" min="0" step="any" data-edit="qty" data-key="' + key + '" value="' + l.qty + '"></label>' +
            '<label>Material per ' + l.unit + ' <input id="m-' + key + '" type="number" min="0" step="any" data-edit="mat" data-key="' + key + '" value="' + l.matUnit + '"></label>' +
            '<label class="check"><input id="i-' + key + '" type="checkbox" data-edit="off" data-key="' + key + '"' + (l.included ? ' checked' : '') + '> Include</label>' +
            '<p class="fine">Materials ' + usd(l.mat) + ' · Labor ' + range(l.laborLo, l.laborHi) + '</p></div></details>';
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
    return viewer() + capture() + tiers() + summary(p) + concept() + lines(p) + assumptions();
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
        return '<tr><td>' + esc(l.name) + '</td><td>' + l.qty + ' ' + l.unit + '</td><td>' + usd(l.mat) + '</td><td>' + range(l.laborLo, l.laborHi) + '</td></tr>';
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

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act, v = b.dataset.v;
    if (act === 'tab') state.tab = v;
    else if (act === 'tier') { state.tier = v; state.view = 'after'; state.openLine = null; }
    else if (act === 'view') state.view = v;
    else if (act === 'room') { state.room = v; if (!state.live) { state.analysis = RF.applyLook(RF.DEMO[v], state.look); state.settings.overrides = {}; } }
    else if (act === 'look') { state.look = v; state.analysis = RF.applyLook(state.analysis, v); state.view = 'after'; persist(); }
    else if (act === 'estimate') return estimate();
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
      else if (el.value === '' || Number(el.value) < 0) delete o[d.edit];
      else o[d.edit] = Number(el.value);
    } else return;
    persist(); render();
  });

  if (!MOCKUP) {
    fetch('api/health').then(function (r) { return r.json(); }).then(function (h) {
      if (!h.ai) { state.notice = 'No AI key is set on the server, so photos are not analyzed yet. Sample numbers are shown.'; render(); }
    }).catch(function () { /* static hosting: stay on sample data */ });
  }
  render();
})();
