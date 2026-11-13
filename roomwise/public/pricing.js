/* Pricing engine. The AI supplies measurements and item choices; every dollar
   figure is computed here from the price book so totals are reproducible.    */
(function (root) {
  var RF = root.RF || (typeof require !== 'undefined' ? require('./catalog.js') : {});

  /* Area labor index by ZIP prefix. Starter values, not sourced from a wage
     dataset yet. Replace with real metro wage data before relying on it.     */
  var ZIP3 = [
    [100, 104, 1.45, 'New York City area'], [110, 119, 1.38, 'Long Island area'],
    [70, 89, 1.3, 'Northern New Jersey'], [21, 24, 1.35, 'Boston area'],
    [60, 69, 1.22, 'Connecticut'], [190, 191, 1.18, 'Philadelphia area'],
    [200, 205, 1.2, 'Washington DC area'], [206, 219, 1.1, 'Maryland'],
    [300, 303, 0.98, 'Atlanta area'], [320, 329, 0.95, 'Central Florida'],
    [330, 334, 1.08, 'Miami area'], [370, 372, 0.97, 'Nashville area'],
    [380, 381, 0.88, 'Memphis area'], [430, 432, 0.97, 'Columbus area'],
    [440, 441, 0.98, 'Cleveland area'], [460, 462, 0.94, 'Indianapolis area'],
    [480, 482, 1.02, 'Detroit area'], [530, 532, 1.04, 'Milwaukee area'],
    [550, 554, 1.1, 'Minneapolis area'], [600, 608, 1.2, 'Chicago area'],
    [630, 631, 1.0, 'St. Louis area'], [640, 641, 0.98, 'Kansas City area'],
    [730, 731, 0.87, 'Oklahoma City area'], [750, 753, 0.97, 'Dallas area'],
    [770, 775, 0.95, 'Houston area'], [780, 782, 0.9, 'San Antonio area'],
    [786, 787, 1.0, 'Austin area'], [800, 805, 1.08, 'Denver area'],
    [840, 841, 1.0, 'Salt Lake City area'], [850, 853, 1.0, 'Phoenix area'],
    [889, 891, 1.05, 'Las Vegas area'], [900, 918, 1.3, 'Los Angeles area'],
    [919, 921, 1.25, 'San Diego area'], [940, 951, 1.5, 'San Francisco Bay Area'],
    [956, 958, 1.2, 'Sacramento area'], [970, 972, 1.18, 'Portland area'],
    [980, 984, 1.3, 'Seattle area']
  ];
  var FIRST_DIGIT = [1.15, 1.12, 1.0, 0.9, 0.95, 1.0, 0.95, 0.9, 1.0, 1.15];

  function regionFactor(zip) {
    var z = String(zip || '').replace(/\D/g, '');
    if (z.length < 5) return { factor: 1, label: 'National average', known: false };
    var gov = RF.LABOR && RF.LABOR.zip3 && RF.LABOR.zip3[z.slice(0, 3)];
    if (gov) return { factor: gov[0], label: gov[1], known: true, source: 'BLS ' + RF.LABOR.year };
    var p = parseInt(z.slice(0, 3), 10);
    for (var i = 0; i < ZIP3.length; i++) {
      if (p >= ZIP3[i][0] && p <= ZIP3[i][1]) return { factor: ZIP3[i][2], label: ZIP3[i][3], known: true };
    }
    return { factor: FIRST_DIGIT[parseInt(z[0], 10)], label: 'Regional average', known: true };
  }

  function defaultItems(room, tier) {
    var k = RF.kind(room);
    return RF.CATALOG.filter(function (it) { return it.room === k && it.tiers.indexOf(tier) >= 0; })
      .map(function (it) { return it.id; });
  }

  function round(n) { return Math.round(n); }

  /* analysis: { room_type, measurements, tiers: { cosmetic: { item_ids }, ... } }
     settings: { zip, laborMult, contingency: {tier: pct}, overrides: { 'tier:id': { qty, mat, off } } } */
  function price(analysis, tier, settings) {
    settings = settings || {};
    var room = RF.kind(analysis.room_type);
    var m = analysis.measurements || {};
    var region = regionFactor(settings.zip);
    var laborMult = region.factor * (settings.laborMult || 1);
    var chosen = (analysis.tiers && analysis.tiers[tier] && analysis.tiers[tier].item_ids) || [];
    if (!chosen.length) chosen = defaultItems(room, tier);
    var byId = {};
    RF.CATALOG.forEach(function (it) { byId[it.id] = it; });
    var ov = settings.overrides || {};

    var lines = [];
    chosen.forEach(function (id) {
      var it = byId[id];
      if (!it || it.room !== room) return;
      var o = ov[tier + ':' + id] || {};
      var baseQty = it.qty.fixed != null ? it.qty.fixed : (Number(m[it.qty.from]) || 0) * (it.qty.factor || 1);
      baseQty = it.unit === 'EA' || it.unit === 'LS' ? Math.ceil(baseQty) : Math.round(baseQty * 10) / 10;
      var qty = o.qty != null ? Number(o.qty) : baseQty;
      var matUnit = o.mat != null ? Number(o.mat) : it.mat;
      var g = it.diy || { level: 'pro' };
      var canDiy = g.level !== 'pro', isDiy = canDiy && !!o.diy;
      var proLo = round(qty * it.labor[0] * laborMult), proHi = round(qty * it.labor[1] * laborMult);
      var b = g.base || [0, 0], per = g.per || [0, 0];
      lines.push({
        id: id, cat: it.cat, name: it.name, unit: it.unit, qty: qty, matUnit: matUnit,
        mat: round(qty * matUnit) + (isDiy ? g.supplies || 0 : 0),
        laborLo: isDiy ? 0 : proLo, laborHi: isDiy ? 0 : proHi,
        proLo: proLo, proHi: proHi, supplies: canDiy ? g.supplies || 0 : 0,
        canDiy: canDiy, diy: isDiy, level: g.level,
        hoursLo: canDiy ? Math.round((b[0] + qty * per[0]) * 2) / 2 : 0,
        hoursHi: canDiy ? Math.round((b[1] + qty * per[1]) * 2) / 2 : 0,
        included: !o.off, edited: o.qty != null || o.mat != null
      });
    });

    var t = { materials: 0, laborLo: 0, laborHi: 0 };
    var d = { count: 0, saveLo: 0, saveHi: 0, hoursLo: 0, hoursHi: 0 };
    lines.forEach(function (l) {
      if (!l.included) return;
      t.materials += l.mat; t.laborLo += l.laborLo; t.laborHi += l.laborHi;
      if (l.diy) { d.count++; d.saveLo += l.proLo - l.supplies; d.saveHi += l.proHi - l.supplies; d.hoursLo += l.hoursLo; d.hoursHi += l.hoursHi; }
    });
    var tierDef = RF.TIERS.filter(function (x) { return x.id === tier; })[0];
    var custom = settings.contingency && settings.contingency[tier];
    var pct = custom != null && custom !== '' ? Number(custom) : tierDef.contingency;
    var subLo = t.materials + t.laborLo, subHi = t.materials + t.laborHi;
    return {
      tier: tier, lines: lines, region: region, diy: d,
      materials: t.materials, laborLo: t.laborLo, laborHi: t.laborHi,
      contingencyPct: pct, contLo: round(subLo * pct / 100), contHi: round(subHi * pct / 100),
      totalLo: round(subLo * (1 + pct / 100)), totalHi: round(subHi * (1 + pct / 100)),
      typical: round((subLo + subHi) / 2 * (1 + pct / 100))
    };
  }

  var api = { price: price, regionFactor: regionFactor, defaultItems: defaultItems };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RF = Object.assign(root.RF || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
