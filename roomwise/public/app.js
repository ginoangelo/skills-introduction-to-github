/* Roomwise AI UI. One state object, one render function.
   A project holds one look, one ZIP and any number of rooms.                */
(function () {
  var RF = window.RF;
  var MOCKUP = !!window.RF_MOCKUP;
  var root = document.getElementById('app');
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var canListen = !!SR && !MOCKUP;
  var LEVELS = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard', pro: 'Hire a pro' };
  var TABS = [['estimate', 'Estimate'], ['diy', 'DIY plan'], ['rates', 'My rates'], ['sheet', 'Paperwork']];

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };

  function blank() {
    return { step: 'look', tab: 'estimate', sheetView: 'deal', look: 'clean', zip: '43215', label: '', arv: '', purchase: '',
      rooms: [], cur: 0, settings: { laborMult: 1, contingency: {} } };
  }
  var state = blank();
  var saved = store.get('rw.project', null);
  if (saved && saved.v === 1 && saved.rooms && saved.rooms.length) {
    ['look', 'zip', 'label', 'arv', 'purchase', 'rooms', 'cur', 'settings'].forEach(function (k) { if (saved[k] != null) state[k] = saved[k]; });
    state.cur = Math.min(state.cur, state.rooms.length - 1); state.step = 'plan';
  }
  state.draft = { room: 'kitchen', photo: null };
  state.busy = false; state.notice = ''; state.openLine = null; state.chat = null; state.listening = false; state.ai = false;
  state.copyText = ''; state.copied = ''; state.confirm = '';

  function persist() {
    var data = { v: 1, look: state.look, zip: state.zip, label: state.label, arv: state.arv, purchase: state.purchase, rooms: state.rooms, cur: state.cur, settings: state.settings };
    if (store.set('rw.project', data)) return;
    // Photos can be too large for browser storage; keep the numbers and drop the pictures.
    data.rooms = state.rooms.map(function (r) { return Object.assign({}, r, { photo: null }); });
    store.set('rw.project', data);
  }

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function short(n) { return n >= 10000 ? '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : usd(n); }
  function range(a, b) { return a === b ? usd(a) : usd(a) + ' – ' + usd(b); }
  function hrs(a, b) { return a === b ? String(a) : a + '–' + b; }
  function hex(c, d) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : d; }
  function palette(p) {
    p = p || {};
    return { wall: hex(p.wall, '#e9ecec'), cabinet: hex(p.cabinet, '#fbfaf5'), counter: hex(p.counter, '#eceae4'), backsplash: hex(p.backsplash, '#f7f7f4'), floor: hex(p.floor, '#9c8263'), hardware: hex(p.hardware, '#8a8f94') };
  }
  function tierDef(id) { return RF.TIERS.filter(function (t) { return t.id === id; })[0]; }
  function catalogItem(id) { return RF.CATALOG.filter(function (it) { return it.id === id; })[0]; }
  function room() { return state.rooms[state.cur]; }
  function priced(r, tier) {
    return RF.price(r.analysis, tier || r.tier, { zip: state.zip, laborMult: state.settings.laborMult, contingency: state.settings.contingency, overrides: r.overrides });
  }
  function project() {
    var t = { materials: 0, laborLo: 0, laborHi: 0, totalLo: 0, totalHi: 0, diyCount: 0, hoursLo: 0, hoursHi: 0, saveLo: 0, saveHi: 0 };
    state.rooms.forEach(function (r) {
      var p = priced(r);
      t.materials += p.materials; t.laborLo += p.laborLo; t.laborHi += p.laborHi; t.totalLo += p.totalLo; t.totalHi += p.totalHi;
      t.diyCount += p.diy.count; t.hoursLo += p.diy.hoursLo; t.hoursHi += p.diy.hoursHi; t.saveLo += p.diy.saveLo; t.saveHi += p.diy.saveHi;
    });
    return t;
  }
  function roomName(type) {
    var n = state.rooms.filter(function (r) { return r.room === type; }).length;
    return (type === 'bathroom' ? 'Bathroom' : 'Kitchen') + (n ? ' ' + (n + 1) : '');
  }
  function today() { return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  function sketch(r, tier, label) { return RF.sketch(r.analysis.room_type, palette(r.analysis.tiers[tier].palette), tier, label); }

  // ---------- step 1: look ----------
  function lookStep() {
    var base = RF.DEMO[state.draft.room];
    return '<section class="intro"><h1>What look are you going for?</h1><p class="body">Pick a direction. Every room in the project is designed and priced toward it, and you can change it any time.</p></section>' +
      '<div class="lookgrid" role="group" aria-label="Look">' + RF.LOOKS.map(function (l) {
        var a = RF.applyLook(base, l.id);
        return '<button class="lookcard" data-act="look" data-v="' + l.id + '" aria-pressed="' + (state.look === l.id) + '">' +
          '<span class="lookpic">' + RF.sketch(a.room_type, palette(a.tiers.mid.palette), 'mid', l.name + ' example') + '</span>' +
          '<span class="lookname">' + l.name + '</span><span class="lookbrief">' + esc(l.brief) + '</span></button>';
      }).join('') + '</div>' +
      '<button class="btn wide" data-act="step" data-v="photo">Next: your room</button>';
  }

  // ---------- step 2: room and photo ----------
  function photoStep() {
    var d = state.draft;
    return '<section class="intro"><h1>' + (state.rooms.length ? 'Add another room' : 'Show us the room') + '</h1><p class="body">One clear photo from the doorway works best. The ZIP code prices labor for the area.</p></section>' +
      '<section class="card capture">' +
      '<div class="row"><div class="seg" role="group" aria-label="Room type">' +
      '<button data-act="draftroom" data-v="kitchen" aria-pressed="' + (d.room === 'kitchen') + '">Kitchen</button>' +
      '<button data-act="draftroom" data-v="bathroom" aria-pressed="' + (d.room === 'bathroom') + '">Bathroom</button></div>' +
      '<label class="zip">ZIP <input id="zip" inputmode="numeric" maxlength="5" value="' + esc(state.zip) + '" aria-label="Property ZIP code"></label></div>' +
      (d.photo ? '<div class="viewer"><img src="' + d.photo + '" alt="Your photo of the room"><span class="tag">Your photo</span></div>' : '') +
      '<div class="row"><label class="btn ghost" for="photo">' + (d.photo ? 'Retake photo' : 'Take or upload photo') + '</label>' +
      '<input id="photo" type="file" accept="image/*" capture="environment" hidden>' +
      '<button class="btn" data-act="estimate"' + (state.busy ? ' disabled' : '') + '>' + (state.busy ? 'Reading the room…' : d.photo ? 'Design this room' : 'Use a sample ' + d.room) + '</button></div>' +
      (state.notice ? '<p class="notice">' + esc(state.notice) + '</p>' : '') +
      (MOCKUP ? '<p class="fine">This mock-up designs a sample room. In the app, your photo is analyzed here.</p>' : '') +
      '</section>';
  }

  // ---------- step 3: the plan ----------
  function roomBar() {
    var t = project();
    return '<div class="roombar"><div class="rooms" role="group" aria-label="Rooms">' + state.rooms.map(function (r, i) {
      return '<button data-act="room" data-v="' + i + '" aria-pressed="' + (i === state.cur) + '">' + esc(r.name) + ' <small>' + short(priced(r).typical) + '</small></button>';
    }).join('') + '<button class="add" data-act="addroom">+ Add room</button></div>' +
      (state.rooms.length > 1 ? '<p class="projtotal">Whole project <b>' + range(t.totalLo, t.totalHi) + '</b> across ' + state.rooms.length + ' rooms</p>' : '') + '</div>';
  }

  function viewer(r) {
    var a = r.analysis, t = a.tiers[r.tier], split = r.split == null ? 50 : r.split;
    var before = r.photo ? '<img src="' + r.photo + '" alt="Your photo of the room">' : RF.sketch(a.room_type, palette(a.current_palette), 'before', 'The room as it is now');
    return '<div class="compare"><div class="viewer" id="viewer" style="--split:' + split + '%">' +
      '<div class="layer">' + before + '</div>' +
      '<div class="layer after">' + sketch(r, r.tier, 'Concept sketch of the ' + tierDef(r.tier).name + ' package') + '</div>' +
      '<div class="divider"></div>' +
      '<span class="tag">' + (r.photo ? (r.samplePhoto ? 'Before · sample photo' : 'Your photo') : 'Before') + '</span><span class="tag r">After · ' + esc(t.concept_name) + '</span></div>' +
      '<input id="split" class="split" type="range" min="0" max="100" value="' + split + '" aria-label="Slide to compare before and after">' +
      '<p class="fine center">Slide to compare. The after view is a concept sketch, not a photo.</p></div>';
  }

  function ask() {
    var tips = ['Make it modern farmhouse', 'Leave out the appliances', "I'll paint it myself", "What's the total?"];
    return '<section class="card ask-card"><form id="askform" class="askrow">' +
      (canListen ? '<button type="button" class="mic' + (state.listening ? ' on' : '') + '" data-act="mic" aria-pressed="' + state.listening + '" aria-label="' + (state.listening ? 'Stop listening' : 'Talk to Roomwise') + '">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' : '') +
      '<input id="say" type="text" autocomplete="off" placeholder="' + (state.listening ? 'Listening…' : canListen ? 'Talk or type a change' : 'Type a change') + '" aria-label="Tell Roomwise what to change">' +
      '<button class="btn send" type="submit">Go</button></form>' +
      (state.chat
        ? '<p class="you">“' + esc(state.chat.you) + '”</p><p class="reply" aria-live="polite">' + esc(state.chat.reply) + '</p>'
        : '<div class="tips">' + tips.map(function (t) { return '<button type="button" data-act="tip" data-v="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>') +
      (canListen ? '' : '<p class="fine">' + (MOCKUP ? 'In the app you can also tap a microphone and talk; replies are read aloud.' : 'This browser has no speech recognition, so type instead.') + '</p>') +
      '</section>';
  }

  function lookChips() {
    return '<section class="card capture"><p class="ask">Look</p><div class="looks" role="group" aria-label="Look">' + RF.LOOKS.map(function (l) {
      return '<button class="look" data-act="look" data-v="' + l.id + '" aria-pressed="' + (state.look === l.id) + '">' +
        '<span class="dots"><i style="background:' + l.c.cabinet + '"></i><i style="background:' + l.c.bold + '"></i><i style="background:' + l.c.hardware + '"></i></span>' + l.name + '</button>';
    }).join('') + '</div></section>';
  }

  function tiers(r) {
    return '<div class="tiers" role="group" aria-label="Rehab package">' + RF.TIERS.map(function (t) {
      var p = priced(r, t.id);
      return '<button class="tier" data-act="tier" data-v="' + t.id + '" aria-pressed="' + (r.tier === t.id) + '">' +
        '<span class="tier-name">' + t.name + '</span><span class="tier-total">' + short(p.typical) + '</span>' +
        '<span class="tier-range">' + short(p.totalLo) + ' – ' + short(p.totalHi) + '</span></button>';
    }).join('') + '</div>';
  }

  function summary(r, p) {
    var sf = Number(r.analysis.measurements.floor_sf) || 0;
    return '<section class="card totals"><h2>' + esc(r.name) + ' · ' + tierDef(r.tier).name + ' budget</h2><dl>' +
      '<div><dt>Materials</dt><dd>' + usd(p.materials) + '</dd></div>' +
      '<div><dt>Labor <small>' + esc(p.region.label) + '</small></dt><dd>' + range(p.laborLo, p.laborHi) + '</dd></div>' +
      '<div><dt>Contingency <small>' + p.contingencyPct + '%</small></dt><dd>' + range(p.contLo, p.contHi) + '</dd></div>' +
      '<div class="grand"><dt>Total</dt><dd>' + range(p.totalLo, p.totalHi) + '</dd></div></dl>' +
      (sf ? '<p class="fine">About ' + usd(p.typical / sf) + ' per square foot of floor. Not contractor verified.</p>' : '') + '</section>';
  }

  function diyCard(p) {
    var can = p.lines.filter(function (l) { return l.included && l.canDiy; });
    if (!can.length) return '';
    var d = p.diy;
    return '<section class="card"><h2>Do it yourself</h2><p class="body">' +
      (d.count ? 'You are doing ' + d.count + ' job' + (d.count > 1 ? 's' : '') + ' yourself: about <b>' + hrs(d.hoursLo, d.hoursHi) + ' hours</b> of your time, saving <b>' + range(d.saveLo, d.saveHi) + '</b> after tools and supplies.'
        : 'Tick the jobs you would do yourself. Labor comes off the budget and each line shows the steps.') + '</p>' +
      can.map(function (l) {
        var key = p.tier + ':' + l.id;
        return '<label class="diyrow"><input id="dc-' + key + '" type="checkbox" data-edit="diy" data-key="' + key + '"' + (l.diy ? ' checked' : '') + '>' +
          '<span class="diy-name">' + esc(l.name) + '</span><span class="lvl ' + l.level + '">' + LEVELS[l.level] + '</span>' +
          '<span class="diy-save">' + hrs(l.hoursLo, l.hoursHi) + ' h · ' + short(l.proLo - l.supplies) + '–' + short(l.proHi - l.supplies) + '</span></label>';
      }).join('') +
      (d.count ? '<button class="btn ghost wide" data-act="tab" data-v="diy">See my DIY plan</button>' : '') +
      '<p class="fine">Jobs not listed here need a licensed pro.</p></section>';
  }

  function concept(r) {
    var t = r.analysis.tiers[r.tier], p = palette(t.palette), bath = r.analysis.room_type === 'bathroom';
    var names = { wall: 'Walls', cabinet: bath ? 'Vanity' : 'Cabinets', counter: 'Counter', backsplash: bath ? 'Surround' : 'Backsplash', floor: 'Floor', hardware: 'Hardware' };
    return '<section class="card"><h2>' + esc(t.concept_name) + '</h2><p class="body">' + esc(t.design_notes) + '</p><ul class="swatches">' +
      Object.keys(names).map(function (k) { return '<li><span class="chip" style="background:' + p[k] + '"></span>' + names[k] + '</li>'; }).join('') + '</ul></section>';
  }

  function guide(l, key) {
    var it = catalogItem(l.id), g = it.diy, shop = RF.shopLinks(it.shop);
    var out = '<div class="guide">';
    if (shop.length) out += '<p class="shop">Check today\'s prices: ' + shop.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.store + '</a>'; }).join(' · ') + '</p>';
    if (!l.canDiy) return out + '<p class="lvl pro">Hire a pro</p><p class="fine">' + esc(g.why) + '</p></div>';
    return out + '<p class="lvl ' + g.level + '">' + LEVELS[g.level] + ' to do yourself · about ' + hrs(l.hoursLo, l.hoursHi) + ' hours</p>' +
      '<label class="check"><input id="d-' + key + '" type="checkbox" data-edit="diy" data-key="' + key + '"' + (l.diy ? ' checked' : '') + '> I\'ll do this myself (saves ' + range(l.proLo - l.supplies, l.proHi - l.supplies) + ')</label>' +
      '<h4>You need</h4><p class="fine">' + esc(g.tools) + '. Tools and supplies allowance: ' + usd(g.supplies) + '.</p>' +
      '<h4>Steps</h4><ol>' + g.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<p class="watch"><b>Watch for:</b> ' + esc(g.watch) + '</p></div>';
  }

  function lines(p) {
    var cats = [];
    p.lines.forEach(function (l) { if (cats.indexOf(l.cat) < 0) cats.push(l.cat); });
    return '<section class="card"><h2>Itemized scope</h2><p class="fine">Tap a line to change its quantity or price, leave it out, or see how to do it yourself.</p>' +
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

  function assumptions(r) {
    var a = r.analysis, m = a.measurements;
    return '<section class="card"><h2>What the estimate assumes</h2><p class="body">' + esc(a.summary) + '</p>' +
      '<div class="measures">' + RF.MEASURES.map(function (d) {
        return '<label>' + d.label + ' <span><input id="ms-' + d.key + '" type="number" min="0" step="any" data-measure="' + d.key + '" value="' + (m[d.key] || 0) + '"> ' + d.unit + '</span></label>';
      }).join('') + '</div>' +
      '<h3>Seen in the photo</h3><ul class="list">' + a.observations.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' +
      '<h3 class="warn">A photo can\'t show</h3><ul class="list">' + a.unseen_risks.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' +
      '<button class="btn ghost wide danger" data-act="removeroom">' + (state.confirm === 'room' ? 'Tap again to remove ' + esc(r.name) : 'Remove this room') + '</button></section>';
  }

  function estimateTab() {
    var r = room(), p = priced(r);
    return roomBar() + viewer(r) + ask() + tiers(r) + summary(r, p) + diyCard(p) + lookChips() + concept(r) + lines(p) + assumptions(r);
  }

  // ---------- DIY plan ----------
  function diyJobs() {
    var jobs = [];
    state.rooms.forEach(function (r) {
      priced(r).lines.forEach(function (l) {
        if (l.included && l.diy) jobs.push({ room: r, line: l, item: catalogItem(l.id) });
      });
    });
    jobs.sort(function (a, b) { return (a.item.diy.seq || 50) - (b.item.diy.seq || 50); });
    return jobs;
  }
  function diyTab() {
    var jobs = diyJobs(), t = project();
    if (!jobs.length) {
      return '<section class="card"><h2>Your DIY plan</h2><p class="body">No jobs marked do-it-yourself yet. On the Estimate tab, tick the jobs you would take on, or say “I\'ll paint it myself”. They show up here in the order to do them, with one tool list and one shopping list.</p>' +
        '<button class="btn wide" data-act="tab" data-v="estimate">Pick jobs to do myself</button></section>';
    }
    var cum = 0, day = 0, tools = [], seen = {};
    var list = jobs.map(function (j) {
      var mid = (j.line.hoursLo + j.line.hoursHi) / 2, d = Math.floor(cum / 8) + 1; cum += mid;
      j.item.diy.tools.split(', ').forEach(function (x) { var k = x.toLowerCase(); if (!seen[k]) { seen[k] = 1; tools.push(k); } });
      var head = d !== day ? '<h3>Day ' + d + '</h3>' : ''; day = d;
      return head + '<details class="line"><summary><span class="line-name">' + esc(j.line.name) + '</span><span class="line-qty">' + esc(j.room.name) + ' · ' + LEVELS[j.line.level] + '</span>' +
        '<span class="line-cost">' + hrs(j.line.hoursLo, j.line.hoursHi) + ' h</span></summary><div class="line-edit"><div class="guide plain"><ol>' +
        j.item.diy.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol><p class="watch"><b>Watch for:</b> ' + esc(j.item.diy.watch) + '</p></div></div></details>';
    }).join('');
    var shop = jobs.filter(function (j) { return j.item.shop; }).map(function (j) {
      var links = RF.shopLinks(j.item.shop);
      return '<tr><td>' + esc(j.line.name) + '<br><small>' + esc(j.room.name) + '</small></td><td>' + j.line.qty + ' ' + j.line.unit + '</td><td>' + usd(j.line.mat) + '</td><td>' +
        links.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.store + '</a>'; }).join('<br>') + '</td></tr>';
    }).join('');
    var days = Math.max(1, Math.ceil(cum / 8));
    return '<section class="card"><h2>Your DIY plan</h2><p class="body"><b>' + jobs.length + ' job' + (jobs.length > 1 ? 's' : '') + '</b>, about <b>' + hrs(t.hoursLo, t.hoursHi) + ' hours</b>, roughly <b>' + days + ' working day' + (days > 1 ? 's' : '') + '</b>. Doing them yourself saves <b>' + range(t.saveLo, t.saveHi) + '</b> after tools and supplies.</p>' +
      '<p class="fine">Listed in the order to do them, at 8 hours a day. Tap a job for its steps.</p>' + list + '</section>' +
      '<section class="card"><h2>One tool list</h2><ul class="list cols">' + tools.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>' +
      (shop ? '<section class="card"><h2>Shopping list</h2><div class="scroll"><table><thead><tr><th>Job</th><th>Qty</th><th>Budget</th><th>Price it</th></tr></thead><tbody>' + shop + '</tbody></table></div><p class="fine">Budget figures come from the starter price book. The links open a search at each store.</p></section>' : '') +
      '<section class="card"><h2>Still hired out</h2><p class="body">Everything else goes to contractors: <b>' + range(t.laborLo, t.laborHi) + '</b> in labor. The scope of work lists it for bids.</p><button class="btn ghost wide" data-act="scope">Open scope of work</button></section>';
  }

  // ---------- rates ----------
  function ratesTab() {
    var r = RF.regionFactor(state.zip), lm = state.settings.laborMult;
    return '<section class="card"><h2>Labor in your market</h2>' +
      '<p class="body">ZIP <input id="zip" class="inline" inputmode="numeric" maxlength="5" value="' + esc(state.zip) + '" aria-label="Property ZIP code"> uses a labor index of <b>' + r.factor.toFixed(2) + '</b> (' + esc(r.label) + ', ' + (r.source ? 'from ' + esc(r.source) + ' construction wages' : 'a starter estimate') + '). If your contractor runs cheaper or pricier than typical, adjust here and every room follows.</p>' +
      '<label class="slider">My contractor vs. area average <b>' + Math.round(lm * 100) + '%</b>' +
      '<input id="laborMult" type="range" min="0.6" max="1.6" step="0.05" value="' + lm + '"></label></section>' +
      '<section class="card"><h2>Contingency</h2><p class="body">The buffer for surprises behind walls and under floors.</p><div class="measures">' +
      RF.TIERS.map(function (t) {
        var v = state.settings.contingency[t.id];
        return '<label>' + t.name + ' <span><input id="ct-' + t.id + '" type="number" min="0" max="50" data-cont="' + t.id + '" value="' + (v != null && v !== '' ? v : t.contingency) + '"> %</span></label>';
      }).join('') + '</div></section>' +
      '<section class="card"><h2>This project</h2><p class="body">Saved on this device as you go. ' + state.rooms.length + ' room' + (state.rooms.length > 1 ? 's' : '') + '.</p>' +
      '<div class="row"><button class="btn ghost" data-act="reset">Reset edits and rates</button>' +
      '<button class="btn ghost danger" data-act="newproject">' + (state.confirm === 'project' ? 'Tap again to erase' : 'Start a new project') + '</button></div></section>';
  }

  // ---------- paperwork: deal sheet and scope of work ----------
  function summaryText() {
    var t = project(), out = ['Roomwise AI rehab estimate' + (state.label ? ' - ' + state.label : ''), 'ZIP ' + state.zip + ' · ' + today() + ' · Look: ' + RF.look(state.look).name, ''];
    state.rooms.forEach(function (r) {
      var p = priced(r);
      out.push(r.name + ' (' + tierDef(r.tier).name + ', ' + r.analysis.tiers[r.tier].concept_name + '): ' + range(p.totalLo, p.totalHi));
    });
    out.push('', 'Project total with contingency: ' + range(t.totalLo, t.totalHi));
    if (t.diyCount) out.push('Owner is doing ' + t.diyCount + ' job(s), about ' + hrs(t.hoursLo, t.hoursHi) + ' hours.');
    out.push('', 'Planning estimate from photos and a starter price book. Not contractor verified, not a bid and not an appraisal.');
    return out.join('\n');
  }
  function scopeText() {
    var out = ['Scope of work' + (state.label ? ' - ' + state.label : ''), 'ZIP ' + state.zip + ' · ' + today(), 'Finish direction: ' + RF.look(state.look).name + '. ' + RF.look(state.look).brief, ''];
    state.rooms.forEach(function (r) {
      var t = r.analysis.tiers[r.tier];
      out.push(r.name.toUpperCase() + ' - ' + t.concept_name, t.design_notes);
      priced(r).lines.filter(function (l) { return l.included; }).forEach(function (l) {
        out.push('  [' + (l.diy ? 'by owner' : 'bid: $______') + '] ' + l.name + ', ' + l.qty + ' ' + l.unit);
      });
      out.push('');
    });
    out.push('Layout stays as is. Contractor to confirm all quantities on site, supply labor and listed materials unless marked by owner, pull required permits and haul away debris.');
    return out.join('\n');
  }
  function copyBox() {
    return (state.copied ? '<p class="notice ok">' + esc(state.copied) + '</p>' : '') +
      (state.copyText ? '<label class="fine" for="copytext">Copying is blocked here. Select the text and copy it:</label><textarea id="copytext" class="copytext" readonly rows="8">' + esc(state.copyText) + '</textarea>' : '');
  }

  function dealSheet() {
    var t = project(), arv = Number(state.arv) || 0, buy = Number(state.purchase) || 0, mao = arv ? Math.round(arv * 0.7 - t.totalHi) : 0;
    return '<section class="card sheet">' +
      '<div class="sheet-head"><div><p class="eyebrow">Roomwise AI deal sheet</p>' +
      '<input id="label" class="sheet-title" placeholder="Property address or nickname" value="' + esc(state.label) + '" aria-label="Property label"></div>' +
      '<p class="fine">ZIP ' + esc(state.zip) + '<br>' + today() + '</p></div>' +
      '<div class="scroll"><table><thead><tr><th>Room</th><th>Package</th><th>Materials</th><th>Labor</th><th>Total</th></tr></thead><tbody>' +
      state.rooms.map(function (r) {
        var p = priced(r);
        return '<tr><td>' + esc(r.name) + '</td><td>' + tierDef(r.tier).name + '</td><td>' + usd(p.materials) + '</td><td>' + range(p.laborLo, p.laborHi) + '</td><td>' + range(p.totalLo, p.totalHi) + '</td></tr>';
      }).join('') +
      '<tr class="sel"><td>Project</td><td></td><td>' + usd(t.materials) + '</td><td>' + range(t.laborLo, t.laborHi) + '</td><td>' + range(t.totalLo, t.totalHi) + '</td></tr></tbody></table></div>' +
      state.rooms.map(function (r) {
        var p = priced(r), tt = r.analysis.tiers[r.tier];
        return '<h3>' + esc(r.name) + ' · ' + tierDef(r.tier).name + ' · ' + esc(tt.concept_name) + '</h3>' +
          '<div class="pair">' + (r.photo ? '<div class="sheet-img"><img src="' + r.photo + '" alt="Photo of the ' + esc(r.name) + '"><span class="tag">Now</span></div>' : '') +
          '<div class="sheet-img">' + sketch(r, r.tier, 'Concept sketch') + '<span class="tag">Concept sketch, not a photo</span></div></div>' +
          '<div class="scroll"><table class="scope"><thead><tr><th>Item</th><th>Qty</th><th>Materials</th><th>Labor</th></tr></thead><tbody>' +
          p.lines.filter(function (l) { return l.included; }).map(function (l) {
            return '<tr><td>' + esc(l.name) + '</td><td>' + l.qty + ' ' + l.unit + '</td><td>' + usd(l.mat) + '</td><td>' + (l.diy ? 'DIY' : range(l.laborLo, l.laborHi)) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }).join('') +
      '<h3>Offer check</h3><div class="measures">' +
      '<label>After-repair value (your number) <span>$ <input id="arv" type="number" min="0" step="1000" value="' + esc(state.arv) + '" placeholder="0"></span></label>' +
      '<label>Asking or contract price <span>$ <input id="purchase" type="number" min="0" step="1000" value="' + esc(state.purchase) + '" placeholder="0"></span></label></div>' +
      (arv ? '<p class="body">70% rule with these rooms as the repairs: maximum offer <b>' + usd(mao) + '</b>' + (buy ? (buy <= mao ? ' <span class="good">Price is under it.</span>' : ' <span class="warn">Price is ' + usd(buy - mao) + ' over.</span>') : '') + '</p>'
        : '<p class="fine">Enter your own after-repair value to see a maximum offer by the 70% rule. Only the rooms in this project count as repairs; add anything else before relying on it.</p>') +
      '<p class="fine disclaimer">Planning estimate from photos and a starter price book. Not contractor verified, not a bid and not an appraisal. Hidden conditions can change the cost.</p></section>';
  }

  function scopeSheet() {
    var L = RF.look(state.look);
    return '<section class="card sheet">' +
      '<div class="sheet-head"><div><p class="eyebrow">Scope of work for bids</p>' +
      '<input id="label" class="sheet-title" placeholder="Property address or nickname" value="' + esc(state.label) + '" aria-label="Property label"></div>' +
      '<p class="fine">ZIP ' + esc(state.zip) + '<br>' + today() + '</p></div>' +
      '<p class="body"><b>Finish direction:</b> ' + esc(L.name) + '. ' + esc(L.brief) + '</p>' +
      state.rooms.map(function (r) {
        var t = r.analysis.tiers[r.tier];
        return '<h3>' + esc(r.name) + ' · ' + esc(t.concept_name) + '</h3><p class="fine">' + esc(t.design_notes) + '</p>' +
          '<div class="scroll"><table class="scope"><thead><tr><th>Work item</th><th>Qty</th><th>Bid</th></tr></thead><tbody>' +
          priced(r).lines.filter(function (l) { return l.included; }).map(function (l) {
            return '<tr><td>' + esc(l.name) + '</td><td>' + l.qty + ' ' + l.unit + '</td><td>' + (l.diy ? 'by owner' : '$ ________') + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }).join('') +
      '<p class="fine disclaimer">Layout stays as is. Contractor to confirm all quantities on site, supply labor and listed materials unless marked by owner, pull required permits and haul away debris. Your budget figures are left off this page on purpose.</p></section>';
  }

  function sheetTab() {
    var scope = state.sheetView === 'scope';
    return '<div class="seg full" role="group" aria-label="Document">' +
      '<button data-act="sheetview" data-v="deal" aria-pressed="' + !scope + '">Deal sheet</button>' +
      '<button data-act="sheetview" data-v="scope" aria-pressed="' + scope + '">Scope of work</button></div>' +
      (scope ? scopeSheet() : dealSheet()) +
      '<section class="card noprint"><div class="row"><button class="btn ghost" data-act="copy">Copy as text</button>' +
      (MOCKUP ? '' : '<button class="btn" data-act="print">Print or save as PDF</button>') + '</div>' + copyBox() +
      (MOCKUP ? '<p class="fine">In the app, this page also exports as a PDF.</p>' : '') + '</section>';
  }

  // ---------- frame ----------
  function render() {
    var steps = [['look', 'Look'], ['photo', 'Room'], ['plan', 'Plan']], has = state.rooms.length > 0;
    var live = state.rooms.some(function (r) { return r.live; });
    var body;
    if (state.step === 'plan' && has) {
      body = '<nav class="tabs" aria-label="Sections">' + TABS.map(function (t) {
        return '<button data-act="tab" data-v="' + t[0] + '" aria-current="' + (state.tab === t[0] ? 'page' : 'false') + '">' + t[1] + '</button>';
      }).join('') + '</nav><main>' + (state.tab === 'estimate' ? estimateTab() : state.tab === 'diy' ? diyTab() : state.tab === 'rates' ? ratesTab() : sheetTab()) + '</main>';
    } else body = '<main>' + (state.step === 'photo' ? photoStep() : lookStep()) + '</main>';
    root.innerHTML =
      '<header class="bar"><span class="brand">Room<b>wise</b> <i>AI</i></span>' +
      (has ? '<span class="badge">' + (live ? 'Live analysis' : 'Sample numbers') + '</span>' : '') + '</header>' +
      '<ol class="steps">' + steps.map(function (s, i) {
        var on = state.step === s[0], ok = s[0] !== 'plan' || has;
        return '<li><button data-act="step" data-v="' + s[0] + '"' + (ok ? '' : ' disabled') + ' aria-current="' + (on ? 'step' : 'false') + '"><span>' + (i + 1) + '</span>' + s[1] + '</button></li>';
      }).join('') + '</ol>' + body;
  }

  // ---------- actions ----------
  function shrink(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1568 / Math.max(img.width, img.height));
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

  function addRoom(analysis, live, photo, notice, samplePhoto) {
    state.rooms.push({ samplePhoto: !!(samplePhoto && photo), id: Date.now(), room: analysis.room_type, name: roomName(analysis.room_type), photo: photo, analysis: analysis, tier: 'mid', overrides: {}, live: live, split: 50 });
    state.cur = state.rooms.length - 1; state.step = 'plan'; state.tab = 'estimate';
    state.draft = { room: 'kitchen', photo: null }; state.busy = false; state.notice = ''; state.chat = notice ? { you: 'Design this room', reply: notice } : null;
    persist(); render(); window.scrollTo(0, 0);
  }
  function estimate() {
    var d = state.draft;
    if (!/^\d{5}$/.test(state.zip)) { state.notice = 'Enter a 5-digit ZIP code so labor can be priced for the area.'; return render(); }
    function sample(msg) { var own = !!d.photo; addRoom(RF.applyLook(RF.DEMO[d.room], state.look), false, d.photo || (window.RF_SAMPLES || {})[d.room] || null, msg, !own); }
    if (MOCKUP || !d.photo) return sample('');
    if (!state.ai) return sample('No AI key is set on the server, so this photo was not analyzed. Sample numbers are shown.');
    state.busy = true; state.notice = ''; render();
    fetch('api/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: d.photo, roomType: d.room, zip: state.zip, look: state.look }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) return sample((res.body.error || 'The photo could not be analyzed.') + ' Sample numbers are shown.');
        addRoom(res.body.analysis, true, d.photo, '');
      })
      .catch(function () { sample('Could not reach the server. Sample numbers are shown.'); });
  }

  // ---------- talk to it ----------
  function speak(text) {
    try { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) { /* no voice output */ }
  }
  function totalSentence() {
    var r = room(), p = priced(r), t = project();
    return r.name + ' ' + tierDef(r.tier).name + ' package is ' + usd(p.totalLo) + ' to ' + usd(p.totalHi) + '.' +
      (state.rooms.length > 1 ? ' Whole project is ' + usd(t.totalLo) + ' to ' + usd(t.totalHi) + '.' : '');
  }
  /* Applies actions to the current room and returns a sentence for each one that took effect. */
  function applyActions(actions) {
    var said = [], r = room(), ls = priced(r).lines;
    function line(id) { return ls.filter(function (l) { return l.id === id; })[0]; }
    function ov(id) { var k = r.tier + ':' + id; return (r.overrides[k] = r.overrides[k] || {}); }
    (actions || []).forEach(function (a) {
      var n = Number(a.number), l, i;
      switch (a.type) {
        case 'look': if (RF.look(a.target).id === a.target) { setLook(a.target); said.push('Restyled to ' + RF.look(a.target).name + '.'); } break;
        case 'tier': if (tierDef(a.target)) { r.tier = a.target; r.split = 50; ls = priced(r).lines; said.push('Showing the ' + tierDef(a.target).name + ' package.'); } break;
        case 'room': if (a.target === 'kitchen' || a.target === 'bathroom') {
          i = state.rooms.map(function (x) { return x.room; }).indexOf(a.target);
          if (i === state.cur) break;
          if (i >= 0) { state.cur = i; r = room(); ls = priced(r).lines; said.push('Switched to the ' + r.name.toLowerCase() + '.'); }
          else { state.draft.room = a.target; state.step = 'photo'; said.push('Add a photo of the ' + a.target + ' to bring it into the project.'); }
        } break;
        case 'view': if (a.target === 'before' || a.target === 'after') { r.split = a.target === 'before' ? 100 : 0; state.tab = 'estimate'; said.push('Showing ' + a.target + '.'); } break;
        case 'tab':
          if (a.target === 'scope') { state.tab = 'sheet'; state.sheetView = 'scope'; said.push('Here is the scope of work.'); }
          else if (['estimate', 'diy', 'rates', 'sheet'].indexOf(a.target) >= 0) { state.tab = a.target; if (a.target === 'sheet') state.sheetView = 'deal'; said.push({ sheet: 'Here is the deal sheet.', rates: 'Here are your rates.', diy: 'Here is your DIY plan.', estimate: 'Back to the estimate.' }[a.target]); }
          break;
        case 'exclude': if ((l = line(a.target))) { ov(l.id).off = true; said.push('Left out ' + l.name.toLowerCase() + '.'); } break;
        case 'include': if ((l = line(a.target))) { ov(l.id).off = false; said.push('Added back ' + l.name.toLowerCase() + '.'); } break;
        case 'qty': if ((l = line(a.target)) && n >= 0) { ov(l.id).qty = n; said.push('Set ' + l.name.toLowerCase() + ' to ' + n + ' ' + l.unit + '.'); } break;
        case 'price': if ((l = line(a.target)) && n >= 0) { ov(l.id).mat = n; said.push('Priced ' + l.name.toLowerCase() + ' at ' + usd(n) + ' per ' + l.unit + '.'); } break;
        case 'diy': if ((l = line(a.target))) { if (l.canDiy) { ov(l.id).diy = true; said.push('You are doing ' + l.name.toLowerCase() + ' yourself, about ' + hrs(l.hoursLo, l.hoursHi) + ' hours.'); } else said.push(l.name + ' needs a licensed pro, so I left it as hired out.'); } break;
        case 'pro': if ((l = line(a.target))) { ov(l.id).diy = false; said.push('Hiring out ' + l.name.toLowerCase() + '.'); } break;
        case 'labor': if (n > 0) { state.settings.laborMult = Math.min(1.6, Math.max(0.6, n / 100)); said.push('Labor set to ' + Math.round(state.settings.laborMult * 100) + ' percent of the area average.'); } break;
        case 'contingency': if (n >= 0 && n <= 50) { state.settings.contingency[r.tier] = n; said.push('Contingency set to ' + n + ' percent.'); } break;
        case 'zip': if (/^[0-9]{5}$/.test(a.target)) { state.zip = a.target; said.push('Pricing labor for ZIP ' + a.target.split('').join(' ') + '.'); } break;
        case 'arv': if (n > 0) { state.arv = String(n); state.tab = 'sheet'; state.sheetView = 'deal'; said.push('After-repair value set to ' + usd(n) + '.'); } break;
        case 'purchase': if (n > 0) { state.purchase = String(n); state.tab = 'sheet'; state.sheetView = 'deal'; said.push('Price set to ' + usd(n) + '.'); } break;
        case 'reset': resetEdits(); said.push('Cleared your edits.'); break;
        case 'total': said.push(''); break;
      }
    });
    persist();
    return said;
  }
  function setLook(id) {
    state.look = id;
    state.rooms.forEach(function (r) { r.analysis = RF.applyLook(r.analysis, id); r.split = 50; });
  }
  function resetEdits() {
    state.settings = { laborMult: 1, contingency: {} };
    state.rooms.forEach(function (r) { r.overrides = {}; });
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
    var p = priced(room());
    function local() { finish(RF.parseCommand(text, { lines: p.lines }).actions); }
    if (MOCKUP || !state.ai) return local();
    fetch('api/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text, context: {
      room: room().analysis.room_type, rooms: state.rooms.map(function (r) { return r.name; }), tier: room().tier, look: state.look, zip: state.zip,
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
  function copy() {
    var text = state.tab === 'sheet' && state.sheetView === 'scope' ? scopeText() : summaryText();
    function fallback() { state.copied = ''; state.copyText = text; render(); var t = document.getElementById('copytext'); if (t) { t.focus(); t.select(); } }
    state.copyText = ''; state.copied = '';
    if (!navigator.clipboard || !navigator.clipboard.writeText) return fallback();
    navigator.clipboard.writeText(text).then(function () { state.copied = 'Copied. Paste it into a text, email or note.'; render(); }, fallback);
  }

  // ---------- events ----------
  root.addEventListener('submit', function (e) {
    if (e.target.id !== 'askform') return;
    e.preventDefault(); command(document.getElementById('say').value, false);
  });

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act, v = b.dataset.v, r = room(), keep = state.confirm;
    state.confirm = ''; state.copied = ''; state.copyText = '';
    if (act === 'step') { if (v !== 'plan' || state.rooms.length) state.step = v; state.notice = ''; }
    else if (act === 'look') setLook(v);
    else if (act === 'draftroom') state.draft.room = v;
    else if (act === 'estimate') return estimate();
    else if (act === 'addroom') { state.step = 'photo'; state.draft = { room: state.rooms.some(function (x) { return x.room === 'bathroom'; }) ? 'kitchen' : 'bathroom', photo: null }; }
    else if (act === 'room') { state.cur = Number(v); state.openLine = null; state.chat = null; }
    else if (act === 'removeroom') {
      if (keep !== 'room') state.confirm = 'room';
      else { state.rooms.splice(state.cur, 1); state.cur = 0; if (!state.rooms.length) { state.step = 'photo'; store.del('rw.project'); } }
    }
    else if (act === 'newproject') {
      if (keep !== 'project') state.confirm = 'project';
      else { store.del('rw.project'); var fresh = blank(); Object.keys(fresh).forEach(function (k) { state[k] = fresh[k]; }); state.chat = null; return render(); }
    }
    else if (act === 'tier') { r.tier = v; r.split = 50; state.openLine = null; }
    else if (act === 'tab') state.tab = v;
    else if (act === 'scope') { state.tab = 'sheet'; state.sheetView = 'scope'; }
    else if (act === 'sheetview') state.sheetView = v;
    else if (act === 'mic') return toggleMic();
    else if (act === 'tip') return command(v, false);
    else if (act === 'print') return window.print();
    else if (act === 'copy') return copy();
    else if (act === 'reset') resetEdits();
    if (state.rooms.length) persist();
    render();
    if (act === 'step' || act === 'tab' || act === 'addroom' || act === 'scope') window.scrollTo(0, 0);
  });

  root.addEventListener('toggle', function (e) {
    var d = e.target; if (!d.classList || !d.classList.contains('line') || !d.dataset.key) return;
    if (d.open) state.openLine = d.dataset.key; else if (state.openLine === d.dataset.key) state.openLine = null;
  }, true);

  root.addEventListener('input', function (e) {
    if (e.target.id !== 'split') return;
    room().split = Number(e.target.value);
    document.getElementById('viewer').style.setProperty('--split', e.target.value + '%');
  });

  root.addEventListener('change', function (e) {
    var el = e.target, d = el.dataset, r = room();
    if (el.id === 'photo') {
      if (!el.files[0]) return;
      return shrink(el.files[0], function (url) {
        if (!url) { state.notice = 'That file could not be read as a photo.'; return render(); }
        state.draft.photo = url; state.notice = ''; render();
      });
    }
    if (el.id === 'split') return persist();
    if (el.id === 'zip') state.zip = el.value.trim();
    else if (el.id === 'label') { state.label = el.value; return persist(); }
    else if (el.id === 'arv') state.arv = el.value;
    else if (el.id === 'purchase') state.purchase = el.value;
    else if (el.id === 'laborMult') state.settings.laborMult = Number(el.value);
    else if (d.cont) state.settings.contingency[d.cont] = el.value === '' ? null : Math.max(0, Number(el.value));
    else if (d.measure) { r.analysis = Object.assign({}, r.analysis, { measurements: Object.assign({}, r.analysis.measurements) }); r.analysis.measurements[d.measure] = Math.max(0, Number(el.value) || 0); }
    else if (d.edit) {
      var o = r.overrides[d.key] = r.overrides[d.key] || {};
      if (d.edit === 'off') o.off = !el.checked;
      else if (d.edit === 'diy') o.diy = el.checked;
      else if (el.value === '' || Number(el.value) < 0) delete o[d.edit];
      else o[d.edit] = Number(el.value);
    } else return;
    if (state.rooms.length) persist();
    render();
  });

  if (!MOCKUP) {
    fetch('api/health').then(function (r) { return r.json(); }).then(function (h) { state.ai = !!h.ai; }).catch(function () { /* static hosting: sample data only */ });
  }
  render();
})();
