/* Looks: the style the user is going for. A look sets the finishes for all
   three packages; it does not change prices in this version.                */
(function (root) {
  var LOOKS = [
    { id: 'clean', name: 'Clean white', brief: 'Bright white cabinets, light quartz, brushed nickel. The safest resale look.',
      c: { wall: '#e9ecec', cabinet: '#fbfaf5', bold: '#3c4a57', counter: '#eceae4', backsplash: '#f7f7f4', floor: '#9c8263', tile: '#cfc9bd', hardware: '#8a8f94' },
      n: { cabinet: 'bright white', bold: 'slate blue-gray', wall: 'cool off-white', hardware: 'brushed nickel', floor: 'mid-brown plank' } },
    { id: 'farmhouse', name: 'Modern farmhouse', brief: 'Cream shaker cabinets, sage green accents, matte black hardware, warm wood floor.',
      c: { wall: '#f1efe6', cabinet: '#f7f4ea', bold: '#5d6f5a', counter: '#ece6d8', backsplash: '#f5f2e8', floor: '#a47c52', tile: '#b9a98f', hardware: '#2b2f33' },
      n: { cabinet: 'cream', bold: 'sage green', wall: 'soft cream', hardware: 'matte black', floor: 'warm oak plank' } },
    { id: 'modern', name: 'Dark modern', brief: 'Charcoal and pale gray, flat fronts, black hardware, cool gray floor.',
      c: { wall: '#eceded', cabinet: '#dfe2e3', bold: '#23292e', counter: '#f4f4f2', backsplash: '#e3e6e7', floor: '#a39f98', tile: '#c4c6c6', hardware: '#1f2326' },
      n: { cabinet: 'pale gray', bold: 'charcoal', wall: 'gallery white', hardware: 'black', floor: 'gray plank' } },
    { id: 'warm', name: 'Warm natural', brief: 'Cream and walnut tones, brass hardware, honey wood floor.',
      c: { wall: '#f0e9dd', cabinet: '#e8dcc8', bold: '#8a6a45', counter: '#f1ece2', backsplash: '#ece2d0', floor: '#b08a5e', tile: '#d4c4a8', hardware: '#b8924a' },
      n: { cabinet: 'warm cream', bold: 'walnut', wall: 'linen', hardware: 'brass', floor: 'honey plank' } },
    { id: 'coastal', name: 'Coastal blue', brief: 'White with navy accents, pale blue tile, chrome hardware, light wood floor.',
      c: { wall: '#eef3f4', cabinet: '#fbfaf5', bold: '#2f4f6b', counter: '#f2f1ec', backsplash: '#dfeaee', floor: '#c2a57d', tile: '#d5d6d0', hardware: '#9aa3a8' },
      n: { cabinet: 'white', bold: 'navy', wall: 'pale sea-glass', hardware: 'chrome', floor: 'light oak plank' } }
  ];

  function look(id) { return LOOKS.filter(function (l) { return l.id === id; })[0] || LOOKS[0]; }

  /* Returns a copy of the analysis with all three packages restyled to the look. */
  function applyLook(analysis, id) {
    var L = look(id), c = L.c, n = L.n;
    var kind = root.RF && root.RF.kind ? root.RF.kind(analysis.room_type) : analysis.room_type;
    if (kind === 'space' || kind === 'exterior') return applyOther(analysis, L, kind);
    var bath = analysis.room_type === 'bathroom';
    var box = bath ? 'vanity' : 'cabinets';
    var cur = analysis.current_palette || {};
    var t = analysis.tiers;
    function tier(old, name, notes, palette) {
      return { concept_name: name, design_notes: notes, palette: palette, item_ids: old.item_ids };
    }
    var out = Object.assign({}, analysis, { look: L.id });
    out.tiers = {
      cosmetic: tier(t.cosmetic, L.name + ' refresh',
        'Keep what is sound. Paint the ' + box + ' ' + n.cabinet + ' and the walls ' + n.wall + ', switch to ' + n.hardware + ' hardware and lay ' + n.floor + '. The counter stays.',
        { wall: c.wall, cabinet: c.cabinet, counter: cur.counter || c.counter, backsplash: c.wall, floor: c.floor, hardware: c.hardware }),
      mid: tier(t.mid, L.name + ' remodel',
        'New ' + n.cabinet + ' shaker ' + box + ', light quartz, ' + (bath ? 'tile floor' : 'tile backsplash') + ' and ' + n.hardware + ' hardware on ' + n.wall + ' walls.',
        { wall: c.wall, cabinet: c.cabinet, counter: c.counter, backsplash: c.backsplash, floor: bath ? c.tile : c.floor, hardware: c.hardware }),
      full: tier(t.full, L.name + ' statement',
        'Everything new with ' + n.bold + ' ' + box + ' as the feature, premium quartz, ' + (bath ? 'a tiled surround with glass' : 'full-height tile') + ', tile floor and ' + n.hardware + ' fixtures.',
        { wall: c.wall, cabinet: c.bold, counter: c.counter, backsplash: c.backsplash, floor: c.tile, hardware: c.hardware })
    };
    return out;
  }

  /* Bedrooms, living rooms and exteriors. Palette slots are reused: for a space,
     cabinet = trim and doors and backsplash = accent wall; for an exterior,
     wall = siding, cabinet = front door, counter = trim, backsplash = roof, floor = lawn. */
  function applyOther(analysis, L, kind) {
    var c = L.c, n = L.n, cur = analysis.current_palette || {}, t = analysis.tiers, white = '#fbfaf5';
    function tier(old, name, notes, palette) { return { concept_name: name, design_notes: notes, palette: palette, item_ids: old.item_ids }; }
    var out = Object.assign({}, analysis, { look: L.id });
    if (kind === 'space') {
      out.tiers = {
        cosmetic: tier(t.cosmetic, L.name + ' refresh', 'Patch and paint the walls ' + n.wall + ' with clean white trim, deep-clean the carpet, and swap the light, blinds and door hardware to ' + n.hardware + '.',
          { wall: c.wall, cabinet: white, counter: c.counter, backsplash: c.wall, floor: cur.floor || '#8f8375', hardware: c.hardware }),
        mid: tier(t.mid, L.name + ' remodel', 'New neutral carpet, ' + n.wall + ' walls, freshly painted trim and a new ceiling fan with ' + n.hardware + ' details.',
          { wall: c.wall, cabinet: white, counter: c.counter, backsplash: c.wall, floor: '#b9b1a4', hardware: c.hardware }),
        full: tier(t.full, L.name + ' statement', 'Pull the carpet for ' + n.floor + ', add new baseboards, doors and a closet system, and paint one ' + n.bold + ' accent wall.',
          { wall: c.wall, cabinet: white, counter: c.counter, backsplash: c.bold, floor: c.floor, hardware: c.hardware })
      };
    } else {
      var roof = cur.backsplash || '#5a5f66';
      out.tiers = {
        cosmetic: tier(t.cosmetic, L.name + ' clean-up', 'Pressure-wash the siding, paint the front door ' + n.bold + ', touch up the trim, clean the gutters and beds, and add new house numbers and door hardware.',
          { wall: cur.wall || c.cabinet, cabinet: c.bold, counter: white, backsplash: roof, floor: '#7d9a5c', hardware: c.hardware }),
        mid: tier(t.mid, L.name + ' repaint', 'Repaint the siding ' + n.cabinet + ' with crisp white trim and a ' + n.bold + ' front door, replant the beds and fit new exterior lights.',
          { wall: c.cabinet, cabinet: c.bold, counter: white, backsplash: roof, floor: '#6f9a55', hardware: c.hardware }),
        full: tier(t.full, L.name + ' curb appeal', 'Full repaint in ' + n.cabinet + ', a new ' + n.bold + ' entry door, new gutters, fresh landscaping, a sealed driveway and an allowance for roof repairs.',
          { wall: c.cabinet, cabinet: c.bold, counter: white, backsplash: roof, floor: '#6f9a55', hardware: c.hardware })
      };
    }
    return out;
  }

  var api = { LOOKS: LOOKS, look: look, applyLook: applyLook };
  root.RF = Object.assign(root.RF || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
