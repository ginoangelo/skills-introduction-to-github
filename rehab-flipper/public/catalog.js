/* Starter price book. Planning-grade national ballparks, NOT verified against
   contractor bids. Every number here is meant to be replaced with real data.
   mat   = material cost per unit (USD)
   labor = [low, high] labor cost per unit (USD), before the area labor index
   qty   = { from: <measurement key>, factor } or { fixed: n }                */
(function (root) {
  var K = 'kitchen', B = 'bathroom';
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
    { id: 'b_permit', room: B, cat: 'Permits', name: 'Permit allowance', unit: 'LS', qty: { fixed: 1 }, mat: 0, labor: [200, 600], tiers: ['full'] }
  ];

  var TIERS = [
    { id: 'cosmetic', name: 'Cosmetic', blurb: 'Paint, hardware, fixtures', contingency: 10 },
    { id: 'mid', name: 'Mid-grade', blurb: 'New cabinets, counters, tile', contingency: 15 },
    { id: 'full', name: 'Full', blurb: 'Everything new, same layout', contingency: 20 }
  ];

  var MEASURES = [
    { key: 'floor_sf', label: 'Floor area', unit: 'SF' },
    { key: 'wall_sf', label: 'Paintable wall area', unit: 'SF' },
    { key: 'cabinet_lf', label: 'Cabinet or vanity run', unit: 'LF' },
    { key: 'counter_sf', label: 'Countertop area', unit: 'SF' },
    { key: 'backsplash_sf', label: 'Backsplash or surround tile', unit: 'SF' },
    { key: 'light_count', label: 'Light fixtures', unit: 'EA' }
  ];

  var api = { CATALOG: CATALOG, TIERS: TIERS, MEASURES: MEASURES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RF = Object.assign(root.RF || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
