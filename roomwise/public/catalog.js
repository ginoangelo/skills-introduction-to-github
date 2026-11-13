/* Starter price book. Planning-grade national ballparks, NOT verified against
   contractor bids. Every number here is meant to be replaced with real data.
   mat   = material cost per unit (USD)
   labor = [low, high] labor cost per unit (USD), before the area labor index
   qty   = { from: <measurement key>, factor } or { fixed: n }                */
(function (root) {
  var K = 'kitchen', B = 'bathroom', S = 'space', X = 'exterior';
  /* Room types. Bedrooms and living rooms share one price book ("space"). */
  var ROOMS = [
    { id: 'kitchen', name: 'Kitchen', kind: K },
    { id: 'bathroom', name: 'Bathroom', kind: B },
    { id: 'bedroom', name: 'Bedroom', kind: S },
    { id: 'living', name: 'Living room', kind: S },
    { id: 'exterior', name: 'Exterior', kind: X }
  ];
  function room(id) { for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i]; return null; }
  function kind(id) { var r = room(id); return r ? r.kind : id; }
  var CATALOG = [
    // ---------- Kitchen ----------
    { id: 'k_demo', room: K, cat: 'Demo & prep', name: 'Demo and haul-off', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [500, 1200], tiers: ['mid', 'full'] },
    { id: 'k_clean', room: K, cat: 'Demo & prep', name: 'Patch, caulk and deep clean', unit: 'LS', qty: { fixed: 1 }, mat: 40, labor: [150, 350], tiers: ['cosmetic'] },
    { id: 'k_paint_walls', room: K, cat: 'Paint', name: 'Paint walls and ceiling', unit: 'SF', qty: { from: 'wall_sf' }, mat: 0.35, labor: [1.2, 2.5], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'k_paint_cab', room: K, cat: 'Cabinets', name: 'Paint existing cabinets', unit: 'LF', qty: { from: 'cabinet_lf' }, mat: 12, labor: [60, 110], tiers: ['cosmetic'] },
    { id: 'k_cab_stock', room: K, cat: 'Cabinets', name: 'Stock shaker cabinets', unit: 'LF', qty: { from: 'cabinet_lf' }, mat: 190, labor: [60, 120], tiers: ['mid'] },
    { id: 'k_cab_semi', room: K, cat: 'Cabinets', name: 'Semi-custom cabinets', unit: 'LF', qty: { from: 'cabinet_lf' }, mat: 380, labor: [90, 160], tiers: ['full'] },
    { id: 'k_hardware', room: K, cat: 'Cabinets', name: 'Cabinet pulls and knobs', unit: 'EA', qty: { from: 'cabinet_lf', factor: 1.5 }, mat: 6, labor: [3, 6], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'k_quartz', room: K, cat: 'Counters', name: 'Quartz countertop, builder grade', unit: 'SF', qty: { from: 'counter_sf' }, mat: 45, labor: [15, 30], tiers: ['mid'] },
    { id: 'k_quartz_prem', room: K, cat: 'Counters', name: 'Quartz countertop, premium', unit: 'SF', qty: { from: 'counter_sf' }, mat: 75, labor: [20, 35], tiers: ['full'] },
    { id: 'k_backsplash_subway', room: K, cat: 'Tile', name: 'Subway tile backsplash', unit: 'SF', qty: { from: 'backsplash_sf' }, mat: 6, labor: [12, 22], tiers: ['mid'] },
    { id: 'k_backsplash_full', room: K, cat: 'Tile', name: 'Full-height tile backsplash', unit: 'SF', qty: { from: 'backsplash_sf', factor: 1.6 }, mat: 12, labor: [15, 28], tiers: ['full'] },
    { id: 'k_faucet', room: K, cat: 'Plumbing', name: 'Replace faucet', unit: 'EA', qty: { fixed: 1 }, mat: 160, labor: [150, 300], tiers: ['cosmetic'] },
    { id: 'k_sink_faucet', room: K, cat: 'Plumbing', name: 'Undermount sink and faucet', unit: 'EA', qty: { fixed: 1 }, mat: 420, labor: [250, 450], tiers: ['mid', 'full'] },
    { id: 'k_plumb', room: K, cat: 'Plumbing', name: 'New shutoffs and supply lines', unit: 'LS', qty: { fixed: 1 }, mat: 150, labor: [600, 1400], tiers: ['full'] },
    { id: 'k_appl_std', room: K, cat: 'Appliances', name: 'Stainless appliance package', unit: 'LS', qty: { fixed: 1 }, mat: 2600, labor: [150, 300], tiers: ['mid'] },
    { id: 'k_appl_up', room: K, cat: 'Appliances', name: 'Upgraded appliance package with hood', unit: 'LS', qty: { fixed: 1 }, mat: 5200, labor: [250, 500], tiers: ['full'] },
    { id: 'k_lvp', room: K, cat: 'Flooring', name: 'Luxury vinyl plank flooring', unit: 'SF', qty: { from: 'floor_sf' }, mat: 3.2, labor: [2, 4], tiers: ['cosmetic', 'mid'] },
    { id: 'k_floor_tile', room: K, cat: 'Flooring', name: 'Porcelain tile flooring', unit: 'SF', qty: { from: 'floor_sf' }, mat: 6.5, labor: [4, 8], tiers: ['full'] },
    { id: 'k_lights_swap', room: K, cat: 'Electrical', name: 'Swap light fixtures', unit: 'EA', qty: { from: 'light_count' }, mat: 90, labor: [80, 160], tiers: ['cosmetic', 'mid'] },
    { id: 'k_recessed', room: K, cat: 'Electrical', name: 'Add recessed lights', unit: 'EA', qty: { fixed: 4 }, mat: 35, labor: [120, 220], tiers: ['mid', 'full'] },
    { id: 'k_pendants', room: K, cat: 'Electrical', name: 'Pendants and under-cabinet lighting', unit: 'LS', qty: { fixed: 1 }, mat: 450, labor: [350, 700], tiers: ['full'] },
    { id: 'k_elec', room: K, cat: 'Electrical', name: 'GFCI outlets and circuit updates', unit: 'LS', qty: { fixed: 1 }, mat: 250, labor: [800, 1800], tiers: ['full'] },
    { id: 'k_permit', room: K, cat: 'Permits', name: 'Permit allowance', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [300, 900], tiers: ['full'] },

    // ---------- Bathroom ----------
    { id: 'b_demo', room: B, cat: 'Demo & prep', name: 'Demo and haul-off', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [400, 1000], tiers: ['mid', 'full'] },
    { id: 'b_caulk', room: B, cat: 'Demo & prep', name: 'Re-caulk, patch and deep clean', unit: 'LS', qty: { fixed: 1 }, mat: 35, labor: [120, 300], tiers: ['cosmetic'] },
    { id: 'b_paint', room: B, cat: 'Paint', name: 'Paint walls and ceiling', unit: 'SF', qty: { from: 'wall_sf' }, mat: 0.4, labor: [1.4, 2.8], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'b_vanity_paint', room: B, cat: 'Vanity', name: 'Paint existing vanity', unit: 'LF', qty: { from: 'cabinet_lf' }, mat: 15, labor: [60, 110], tiers: ['cosmetic'] },
    { id: 'b_vanity_stock', room: B, cat: 'Vanity', name: 'Stock vanity with top', unit: 'LF', qty: { from: 'cabinet_lf' }, mat: 180, labor: [70, 130], tiers: ['mid'] },
    { id: 'b_vanity_semi', room: B, cat: 'Vanity', name: 'Furniture-style vanity, quartz top', unit: 'LF', qty: { from: 'cabinet_lf' }, mat: 360, labor: [90, 160], tiers: ['full'] },
    { id: 'b_hardware', room: B, cat: 'Vanity', name: 'Pulls, towel bar and paper holder', unit: 'LS', qty: { fixed: 1 }, mat: 85, labor: [50, 120], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'b_mirror', room: B, cat: 'Vanity', name: 'Framed mirror', unit: 'EA', qty: { fixed: 1 }, mat: 110, labor: [40, 90], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'b_faucet', room: B, cat: 'Plumbing', name: 'Replace sink faucet', unit: 'EA', qty: { fixed: 1 }, mat: 110, labor: [120, 250], tiers: ['cosmetic', 'mid'] },
    { id: 'b_faucet_set', room: B, cat: 'Plumbing', name: 'Sink faucet and shower trim set', unit: 'LS', qty: { fixed: 1 }, mat: 480, labor: [350, 700], tiers: ['full'] },
    { id: 'b_toilet', room: B, cat: 'Plumbing', name: 'New toilet', unit: 'EA', qty: { fixed: 1 }, mat: 240, labor: [150, 300], tiers: ['mid', 'full'] },
    { id: 'b_plumb', room: B, cat: 'Plumbing', name: 'New shutoffs, valve and supply lines', unit: 'LS', qty: { fixed: 1 }, mat: 220, labor: [700, 1600], tiers: ['full'] },
    { id: 'b_reglaze', room: B, cat: 'Tub & shower', name: 'Reglaze tub and surround', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [450, 750], tiers: ['cosmetic', 'mid'] },
    { id: 'b_tub_new', room: B, cat: 'Tub & shower', name: 'New tub', unit: 'EA', qty: { fixed: 1 }, mat: 550, labor: [600, 1200], tiers: ['full'] },
    { id: 'b_surround_tile', room: B, cat: 'Tub & shower', name: 'Tile tub surround', unit: 'SF', qty: { from: 'backsplash_sf' }, mat: 7, labor: [14, 26], tiers: ['full'] },
    { id: 'b_glass', room: B, cat: 'Tub & shower', name: 'Glass tub panel', unit: 'EA', qty: { fixed: 1 }, mat: 420, labor: [150, 300], tiers: ['full'] },
    { id: 'b_lvp', room: B, cat: 'Flooring', name: 'Waterproof vinyl plank flooring', unit: 'SF', qty: { from: 'floor_sf' }, mat: 3.4, labor: [2.5, 5], tiers: ['cosmetic'] },
    { id: 'b_floor_tile', room: B, cat: 'Flooring', name: 'Porcelain tile flooring', unit: 'SF', qty: { from: 'floor_sf' }, mat: 6, labor: [8, 15], tiers: ['mid', 'full'] },
    { id: 'b_light', room: B, cat: 'Electrical', name: 'Vanity light fixture', unit: 'EA', qty: { from: 'light_count' }, mat: 95, labor: [80, 160], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'b_fan', room: B, cat: 'Electrical', name: 'Exhaust fan', unit: 'EA', qty: { fixed: 1 }, mat: 120, labor: [150, 350], tiers: ['mid', 'full'] },
    { id: 'b_elec', room: B, cat: 'Electrical', name: 'GFCI outlets and wiring updates', unit: 'LS', qty: { fixed: 1 }, mat: 120, labor: [400, 900], tiers: ['full'] },
    { id: 'b_permit', room: B, cat: 'Permits', name: 'Permit allowance', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [200, 600], tiers: ['full'] },

    // ---------- Bedroom and living room ----------
    { id: 's_patch', room: S, cat: 'Demo & prep', name: 'Patch walls, caulk and clean', unit: 'LS', qty: { fixed: 1 }, mat: 30, labor: [120, 300], tiers: ['cosmetic', 'mid'] },
    { id: 's_demo', room: S, cat: 'Demo & prep', name: 'Pull carpet and haul off', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [150, 400], tiers: ['full'] },
    { id: 's_paint', room: S, cat: 'Paint', name: 'Paint walls and ceiling', unit: 'SF', qty: { from: 'wall_sf' }, mat: 0.35, labor: [1.2, 2.5], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 's_trim_paint', room: S, cat: 'Paint', name: 'Paint baseboards and trim', unit: 'LF', qty: { from: 'trim_lf' }, mat: 0.3, labor: [1, 2.2], tiers: ['mid'] },
    { id: 's_carpet_clean', room: S, cat: 'Flooring', name: 'Deep-clean carpet', unit: 'SF', qty: { from: 'floor_sf' }, mat: 0, labor: [0.3, 0.6], tiers: ['cosmetic'] },
    { id: 's_carpet_new', room: S, cat: 'Flooring', name: 'New carpet and pad', unit: 'SF', qty: { from: 'floor_sf' }, mat: 2.6, labor: [1, 2], tiers: ['mid'] },
    { id: 's_lvp', room: S, cat: 'Flooring', name: 'Luxury vinyl plank flooring', unit: 'SF', qty: { from: 'floor_sf' }, mat: 3.2, labor: [2, 4], tiers: ['full'] },
    { id: 's_baseboard', room: S, cat: 'Trim & doors', name: 'New baseboards', unit: 'LF', qty: { from: 'trim_lf' }, mat: 1.6, labor: [2.5, 4.5], tiers: ['full'] },
    { id: 's_door_hw', room: S, cat: 'Trim & doors', name: 'Door knobs and hinges', unit: 'EA', qty: { from: 'door_count' }, mat: 30, labor: [20, 45], tiers: ['cosmetic', 'mid'] },
    { id: 's_doors', room: S, cat: 'Trim & doors', name: 'New interior doors', unit: 'EA', qty: { from: 'door_count' }, mat: 110, labor: [120, 220], tiers: ['full'] },
    { id: 's_closet', room: S, cat: 'Trim & doors', name: 'Closet shelving system', unit: 'LS', qty: { fixed: 1 }, mat: 180, labor: [120, 260], tiers: ['full'] },
    { id: 's_blinds', room: S, cat: 'Windows', name: 'New blinds', unit: 'EA', qty: { from: 'window_count' }, mat: 35, labor: [20, 40], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 's_lights', room: S, cat: 'Electrical', name: 'Swap light fixtures', unit: 'EA', qty: { from: 'light_count' }, mat: 70, labor: [80, 160], tiers: ['cosmetic'] },
    { id: 's_fan', room: S, cat: 'Electrical', name: 'New ceiling fan with light', unit: 'EA', qty: { fixed: 1 }, mat: 140, labor: [120, 250], tiers: ['mid', 'full'] },
    { id: 's_plates', room: S, cat: 'Electrical', name: 'New outlets, switches and plates', unit: 'LS', qty: { fixed: 1 }, mat: 40, labor: [80, 200], tiers: ['cosmetic', 'mid'] },
    { id: 's_elec', room: S, cat: 'Electrical', name: 'Add outlets and update wiring', unit: 'LS', qty: { fixed: 1 }, mat: 150, labor: [400, 900], tiers: ['full'] },

    // ---------- Exterior ----------
    { id: 'x_wash', room: X, cat: 'Clean-up', name: 'Pressure-wash siding and walks', unit: 'SF', qty: { from: 'wall_sf' }, mat: 0.02, labor: [0.15, 0.35], tiers: ['cosmetic', 'mid'] },
    { id: 'x_gutter_clean', room: X, cat: 'Clean-up', name: 'Clean gutters and downspouts', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [150, 300], tiers: ['cosmetic'] },
    { id: 'x_yard_clean', room: X, cat: 'Landscaping', name: 'Yard clean-up and fresh mulch', unit: 'SF', qty: { from: 'yard_sf' }, mat: 0.08, labor: [0.15, 0.4], tiers: ['cosmetic'] },
    { id: 'x_landscape', room: X, cat: 'Landscaping', name: 'New shrubs, mulch and lawn repair', unit: 'SF', qty: { from: 'yard_sf' }, mat: 0.35, labor: [0.4, 0.9], tiers: ['mid', 'full'] },
    { id: 'x_trim', room: X, cat: 'Paint', name: 'Scrape and paint trim', unit: 'LF', qty: { from: 'trim_lf' }, mat: 0.4, labor: [1.5, 3], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'x_paint', room: X, cat: 'Paint', name: 'Repaint siding', unit: 'SF', qty: { from: 'wall_sf' }, mat: 0.55, labor: [1.6, 3.2], tiers: ['mid', 'full'] },
    { id: 'x_door_paint', room: X, cat: 'Entry', name: 'Paint front door', unit: 'EA', qty: { from: 'door_count' }, mat: 25, labor: [80, 160], tiers: ['cosmetic', 'mid'] },
    { id: 'x_door_new', room: X, cat: 'Entry', name: 'New entry door', unit: 'EA', qty: { from: 'door_count' }, mat: 450, labor: [300, 600], tiers: ['full'] },
    { id: 'x_curb', room: X, cat: 'Entry', name: 'House numbers, mailbox and door hardware', unit: 'LS', qty: { fixed: 1 }, mat: 160, labor: [100, 220], tiers: ['cosmetic', 'mid', 'full'] },
    { id: 'x_lights', room: X, cat: 'Electrical', name: 'Swap exterior light fixtures', unit: 'EA', qty: { from: 'light_count' }, mat: 90, labor: [80, 160], tiers: ['mid', 'full'] },
    { id: 'x_gutter_fix', room: X, cat: 'Roof & gutters', name: 'Repair gutters and downspouts', unit: 'LS', qty: { fixed: 1 }, mat: 150, labor: [250, 600], tiers: ['mid'] },
    { id: 'x_gutter_new', room: X, cat: 'Roof & gutters', name: 'New gutters', unit: 'LS', qty: { fixed: 1 }, mat: 600, labor: [500, 1100], tiers: ['full'] },
    { id: 'x_roof', room: X, cat: 'Roof & gutters', name: 'Roof repair allowance', unit: 'LS', qty: { fixed: 1 }, mat: 400, labor: [800, 2500], tiers: ['full'] },
    { id: 'x_drive', room: X, cat: 'Hardscape', name: 'Patch and seal driveway', unit: 'LS', qty: { fixed: 1 }, mat: 120, labor: [300, 800], tiers: ['full'] },
    { id: 'x_permit', room: X, cat: 'Permits', name: 'Permit allowance', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [150, 500], tiers: ['full'] }
  ];

  var TIERS = [
    { id: 'cosmetic', name: 'Cosmetic', blurb: 'Paint, hardware, fixtures', contingency: 10 },
    { id: 'mid', name: 'Mid-grade', blurb: 'New cabinets, counters, tile', contingency: 15 },
    { id: 'full', name: 'Full', blurb: 'Everything new, same layout', contingency: 20 }
  ];

  /* What gets measured. Each entry is labeled per kind of room; a kind with no label does not use it. */
  var MEASURES = [
    { key: 'floor_sf', unit: 'SF', label: { kitchen: 'Floor area', bathroom: 'Floor area', space: 'Floor area' } },
    { key: 'wall_sf', unit: 'SF', label: { kitchen: 'Paintable wall area', bathroom: 'Paintable wall area', space: 'Paintable wall area', exterior: 'Siding area' } },
    { key: 'cabinet_lf', unit: 'LF', label: { kitchen: 'Cabinet run', bathroom: 'Vanity width' } },
    { key: 'counter_sf', unit: 'SF', label: { kitchen: 'Countertop area', bathroom: 'Countertop area' } },
    { key: 'backsplash_sf', unit: 'SF', label: { kitchen: 'Backsplash area', bathroom: 'Tub surround tile' } },
    { key: 'light_count', unit: 'EA', label: { kitchen: 'Light fixtures', bathroom: 'Light fixtures', space: 'Light fixtures', exterior: 'Exterior lights' } },
    { key: 'door_count', unit: 'EA', label: { space: 'Doors', exterior: 'Entry doors' } },
    { key: 'window_count', unit: 'EA', label: { space: 'Windows' } },
    { key: 'trim_lf', unit: 'LF', label: { space: 'Baseboard', exterior: 'Trim to paint' } },
    { key: 'yard_sf', unit: 'SF', label: { exterior: 'Front yard area' } }
  ];

  var api = { CATALOG: CATALOG, TIERS: TIERS, MEASURES: MEASURES, ROOMS: ROOMS, room: room, kind: kind };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RF = Object.assign(root.RF || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
