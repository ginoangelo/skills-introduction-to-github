/* Concept sketches. A recolorable drawing of a kitchen or bathroom that shows a
   package's finishes until a photo-realistic image model is wired in.        */
(function (root) {
  var STYLE = {
    before: { shaker: false, tile: false, stainless: false, pendants: false, hood: false, glass: false, dated: true },
    cosmetic: { shaker: false, tile: false, stainless: false, pendants: false, hood: false, glass: false },
    mid: { shaker: true, tile: true, stainless: true, pendants: false, hood: false, glass: false },
    full: { shaker: true, tile: true, stainless: true, pendants: true, hood: true, glass: true }
  };
  var INK = '#1b2630';

  function doors(x0, x1, y, h, w, p, s, pullTop) {
    var out = '';
    for (var x = x0; x < x1 - 1; x += w) {
      out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + p.cabinet + '" stroke="' + INK + '" stroke-opacity=".28"/>';
      if (s.shaker) out += '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (w - 12) + '" height="' + (h - 12) + '" fill="none" stroke="' + INK + '" stroke-opacity=".22"/>';
      out += '<rect x="' + (x + w - 10) + '" y="' + (pullTop ? y + 8 : y + h - 20) + '" width="3" height="12" rx="1.5" fill="' + p.hardware + '"/>';
    }
    return out;
  }
  function tiles(x, y, w, h, tw, th, fill) {
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
    for (var r = 0; r * th < h; r++) {
      out += '<line x1="' + x + '" y1="' + (y + r * th) + '" x2="' + (x + w) + '" y2="' + (y + r * th) + '" stroke="' + INK + '" stroke-opacity=".14"/>';
      for (var c = (r % 2 ? tw / 2 : 0); c < w; c += tw) {
        out += '<line x1="' + (x + c) + '" y1="' + (y + r * th) + '" x2="' + (x + c) + '" y2="' + Math.min(y + h, y + (r + 1) * th) + '" stroke="' + INK + '" stroke-opacity=".14"/>';
      }
    }
    return out;
  }
  function floor(p, y, planks) {
    var out = '<rect x="0" y="' + y + '" width="400" height="' + (300 - y) + '" fill="' + p.floor + '"/>';
    if (planks) for (var i = 1; i < 5; i++) out += '<line x1="0" y1="' + (y + i * 16) + '" x2="400" y2="' + (y + i * 16) + '" stroke="' + INK + '" stroke-opacity=".12"/>';
    return out;
  }

  function kitchen(p, s) {
    var appl = s.stainless ? '#b9c0c6' : '#f1efe9';
    var o = '<rect width="400" height="232" fill="' + p.wall + '"/>' + floor(p, 232, true);
    o += '<rect x="158" y="34" width="84" height="66" fill="#ffffff" stroke="' + INK + '" stroke-opacity=".3"/><rect x="164" y="40" width="72" height="54" fill="#cfe3ee"/><line x1="200" y1="40" x2="200" y2="94" stroke="#ffffff" stroke-width="3"/>';
    o += doors(20, 140, 34, 72, 40, p, s, false) + doors(256, 316, 34, 72, 30, p, s, false);
    o += s.tile ? tiles(20, 106, 296, s.hood ? 44 : 44, 22, 11, p.backsplash) : '<rect x="20" y="106" width="296" height="44" fill="' + p.backsplash + '"/>';
    if (s.hood) o += '<path d="M176 100h48l8 22h-64z" fill="' + appl + '" stroke="' + INK + '" stroke-opacity=".3"/>';
    o += doors(20, 170, 160, 72, 50, p, s, true) + doors(230, 316, 160, 72, 43, p, s, true);
    o += '<rect x="170" y="152" width="60" height="80" fill="' + appl + '" stroke="' + INK + '" stroke-opacity=".3"/><rect x="178" y="176" width="44" height="34" rx="3" fill="' + INK + '" fill-opacity=".55"/><rect x="178" y="166" width="44" height="4" rx="2" fill="' + INK + '" fill-opacity=".4"/>';
    o += '<rect x="14" y="150" width="156" height="10" fill="' + p.counter + '" stroke="' + INK + '" stroke-opacity=".25"/><rect x="230" y="150" width="92" height="10" fill="' + p.counter + '" stroke="' + INK + '" stroke-opacity=".25"/>';
    o += '<path d="M84 150v-18q0-9 9-9h6" fill="none" stroke="' + p.hardware + '" stroke-width="4" stroke-linecap="round"/>';
    o += '<rect x="326" y="52" width="60" height="180" fill="' + appl + '" stroke="' + INK + '" stroke-opacity=".3"/><line x1="326" y1="118" x2="386" y2="118" stroke="' + INK + '" stroke-opacity=".3"/><rect x="332" y="92" width="3" height="20" rx="1.5" fill="' + INK + '" fill-opacity=".45"/><rect x="332" y="126" width="3" height="30" rx="1.5" fill="' + INK + '" fill-opacity=".45"/>';
    if (s.pendants) [70, 120].forEach(function (x) { o += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="16" stroke="' + INK + '"/><path d="M' + (x - 9) + ' 28q9-18 18 0z" fill="' + p.hardware + '"/>'; });
    else if (s.dated) o += '<rect x="170" y="0" width="60" height="9" rx="3" fill="#efe6c8" stroke="' + INK + '" stroke-opacity=".3"/>';
    return o;
  }

  function bathroom(p, s) {
    var o = '<rect width="400" height="232" fill="' + p.wall + '"/>';
    o += s.tile ? tiles(0, 232, 400, 68, 34, 17, p.floor) : floor(p, 232, true);
    // tub and surround
    o += s.tile ? tiles(262, 20, 138, 168, 23, 11.5, p.backsplash) : '<rect x="262" y="20" width="138" height="168" fill="' + p.backsplash + '"/>';
    o += '<rect x="262" y="20" width="138" height="168" fill="none" stroke="' + INK + '" stroke-opacity=".25"/>';
    o += '<rect x="256" y="186" width="144" height="46" rx="6" fill="#f6f5f1" stroke="' + INK + '" stroke-opacity=".3"/>';
    o += '<path d="M372 46h-22q-10 0-10 10" fill="none" stroke="' + p.hardware + '" stroke-width="4" stroke-linecap="round"/><circle cx="340" cy="62" r="6" fill="' + p.hardware + '"/>';
    if (s.glass) o += '<rect x="262" y="20" width="56" height="168" fill="#cfe3ee" fill-opacity=".45" stroke="' + INK + '" stroke-opacity=".35"/>';
    else if (s.dated) o += '<path d="M262 20h138" stroke="' + INK + '" stroke-width="3"/><path d="M270 22q8 80 0 160M290 22q8 80 0 160M310 22q8 80 0 160" fill="none" stroke="#c9b98c" stroke-width="10" stroke-opacity=".7"/>';
    // vanity
    o += doors(28, 148, 166, 66, 60, p, s, true);
    o += '<rect x="22" y="156" width="132" height="10" fill="' + p.counter + '" stroke="' + INK + '" stroke-opacity=".25"/>';
    o += '<path d="M88 156v-14q0-8 8-8h5" fill="none" stroke="' + p.hardware + '" stroke-width="4" stroke-linecap="round"/>';
    o += s.shaker
      ? '<rect x="52" y="44" width="72" height="84" rx="36" fill="#dbe9f0" stroke="' + p.hardware + '" stroke-width="4"/>'
      : '<rect x="40" y="50" width="96" height="76" fill="#dbe9f0" stroke="' + (s.dated ? '#b08a4a' : p.hardware) + '" stroke-width="4"/>';
    o += s.pendants
      ? '<rect x="30" y="64" width="6" height="30" rx="3" fill="' + p.hardware + '"/><rect x="140" y="64" width="6" height="30" rx="3" fill="' + p.hardware + '"/>'
      : '<rect x="58" y="24" width="60" height="10" rx="5" fill="' + (s.dated ? '#efe6c8' : '#fbfaf5') + '" stroke="' + INK + '" stroke-opacity=".3"/>';
    // toilet
    o += '<rect x="184" y="132" width="44" height="50" rx="5" fill="#f6f5f1" stroke="' + INK + '" stroke-opacity=".3"/><path d="M180 182h52q0 30-14 40v10h-24v-10q-14-10-14-40z" fill="#f6f5f1" stroke="' + INK + '" stroke-opacity=".3"/>';
    return o;
  }

  function sketch(room, palette, styleKey, label) {
    var s = STYLE[styleKey] || STYLE.cosmetic;
    var body = room === 'bathroom' ? bathroom(palette, s) : kitchen(palette, s);
    return '<svg viewBox="0 0 400 300" role="img" aria-label="' + label + '" preserveAspectRatio="xMidYMid slice">' + body + '</svg>';
  }

  root.RF = Object.assign(root.RF || {}, { sketch: sketch });
})(typeof globalThis !== 'undefined' ? globalThis : this);
