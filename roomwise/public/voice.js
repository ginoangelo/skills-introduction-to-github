/* Understands a spoken or typed request without a server. Used in the mock-up,
   when no AI key is set, and as the fallback if the AI command call fails.
   Returns { actions: [{ type, target, number }] }; the app applies them.     */
(function (root) {
  var RF = root.RF || {};
  var STOP = { the: 1, a: 1, an: 1, and: 1, or: 1, to: 1, of: 1, with: 1, new: 1, existing: 1, my: 1, it: 1, out: 1, back: 1, in: 1, on: 1, for: 1, is: 1, at: 1, per: 1, set: 1, make: 1, change: 1 };
  var ALIAS = { counters: 'countertop', counter: 'countertop', countertops: 'countertop', floors: 'flooring', floor: 'flooring', lights: 'light', lighting: 'light', cabinet: 'cabinets', appliance: 'appliance', appliances: 'appliance', painting: 'paint', permits: 'permit', tile: 'tile', sink: 'sink', handles: 'pulls', knobs: 'pulls', hardware: 'pulls', demolition: 'demo', fridge: 'appliance', stove: 'appliance', range: 'appliance', tub: 'tub', shower: 'tub', fan: 'fan' };

  function words(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(function (w) { return w && !STOP[w]; })
      .map(function (w) { return ALIAS[w] || w; });
  }
  function num(s) {
    var m = /\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?/i.exec(s);
    if (!m) return null;
    var n = parseFloat(m[1].replace(/,/g, ''));
    return m[2] ? n * 1000 : n;
  }
  function matchLine(text, lines) {
    var tw = words(text), best = null, bestScore = 0;
    (lines || []).forEach(function (l) {
      var lw = words(l.name + ' ' + l.cat), score = 0;
      tw.forEach(function (w) { if (lw.indexOf(w) >= 0) score += w.length > 4 ? 2 : 1; });
      if (score > bestScore) { bestScore = score; best = l; }
    });
    return bestScore >= 2 ? best : null;
  }

  function parseCommand(text, ctx) {
    var t = ' ' + String(text || '').toLowerCase().replace(/[’']/g, '') + ' ';
    var A = [];
    function add(type, target, number) { A.push({ type: type, target: target || '', number: number == null ? 0 : number }); }
    var n = num(t);

    if (/\b(reset|start over|undo everything)\b/.test(t)) { add('reset'); return { actions: A }; }

    if (/farmhouse/.test(t)) add('look', 'farmhouse');
    else if (/\b(dark|charcoal)\b/.test(t) || (/\bmodern\b/.test(t) && !/farmhouse/.test(t))) add('look', 'modern');
    else if (/\b(warm|natural|walnut|brass)\b/.test(t)) add('look', 'warm');
    else if (/\b(coastal|beach|navy)\b/.test(t)) add('look', 'coastal');
    else if (/\b(clean white|all white|plain white|bright white)\b/.test(t)) add('look', 'clean');

    if (/\b(cosmetic|cheapest|budget|lipstick)\b/.test(t)) add('tier', 'cosmetic');
    else if (/\b(mid|middle|mid-grade|midgrade)\b/.test(t)) add('tier', 'mid');
    else if (/\b(full|high end|high-end|top end|gut)\b/.test(t)) add('tier', 'full');

    if (/\bbath(room)?\b/.test(t)) add('room', 'bathroom');
    else if (/\bkitchen\b/.test(t)) add('room', 'kitchen');

    if (/\bbefore\b/.test(t)) add('view', 'before');
    else if (/\bafter\b/.test(t) && !/after.repair/.test(t)) add('view', 'after');

    if (/scope of work|for bids/.test(t)) add('tab', 'scope');
    else if (/\b(diy|weekend|my) plan\b/.test(t)) add('tab', 'diy');
    else if (/deal sheet/.test(t)) add('tab', 'sheet');
    else if (/\b(my )?rates\b/.test(t)) add('tab', 'rates');

    var numeric = false;
    if (/contingency/.test(t) && n != null) { add('contingency', '', n); numeric = true; }
    else if (/\blabor\b/.test(t) && n != null) { add('labor', '', n); numeric = true; }
    else if (/\bzip\b/.test(t) && /\b\d{5}\b/.test(t)) { add('zip', /\b(\d{5})\b/.exec(t)[1]); numeric = true; }
    else if (/\b(arv|after.repair)\b/.test(t) && n != null) { add('arv', '', n); numeric = true; }
    else if (/\b(asking|contract|purchase|offer) price\b/.test(t) && n != null) { add('purchase', '', n); numeric = true; }

    if (!numeric) {
      var line = matchLine(t, ctx && ctx.lines);
      if (line) {
        if (/\b(myself|ourselves|diy|do it yourself|on my own|i can do|ill do|i will do)\b/.test(t)) add('diy', line.id);
        else if (/\b(hire|contractor|sub out|professional|pro do)\b/.test(t)) add('pro', line.id);
        else if (/\b(remove|skip|leave out|drop|take out|without|dont need|do not need|keep the existing|keep my|keep the old|no need)\b/.test(t)) add('exclude', line.id);
        else if (/\b(add back|put back|include|add)\b/.test(t)) add('include', line.id);
        else if (n != null && /(\$|\bprice\b|\bcosts?\b|\bper\b|\bdollars?\b)/.test(t)) add('price', line.id, n);
        else if (n != null) add('qty', line.id, n);
      }
    }

    if (!A.length && /\b(total|how much|cost|budget|price)\b/.test(t)) add('total');
    return { actions: A };
  }

  var api = { parseCommand: parseCommand };
  root.RF = Object.assign(root.RF || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
