/* Sample analyses, shown when no AI key is configured and in the mock-up.
   Same shape the server returns from a real photo.                           */
(function (root) {
  var DEMO = {
    kitchen: {
      room_type: 'kitchen', confidence: 'medium', sample: true,
      summary: 'Dated but solid L-shaped kitchen. The oak cabinet boxes look square and dry, so the cheapest package can keep them.',
      observations: [
        'Oak raised-panel cabinets, finish worn below the sink',
        'Laminate countertop stained, with an open seam at the corner',
        'Walls painted bright green up to the upper cabinets',
        'Drop-in double sink with a basic two-handle faucet',
        'Appliances of mixed ages and finishes'
      ],
      unseen_risks: [
        'Water damage inside the sink base',
        'Subfloor condition under the vinyl',
        'Wiring age and whether outlets are grounded'
      ],
      measurements: { floor_sf: 140, wall_sf: 320, cabinet_lf: 22, counter_sf: 42, backsplash_sf: 30, light_count: 3 },
      current_palette: { wall: '#3f8f45', cabinet: '#a8672f', counter: '#d8d2c4', backsplash: '#3f8f45', floor: '#b5683c', hardware: '#8a5a2b' },
      tiers: {
        cosmetic: { concept_name: 'Fresh coat', design_notes: 'Keep the cabinet boxes. Paint them white, brighten the walls, swap pulls and the faucet, and lay plank over the old vinyl.', palette: { wall: '#eef0ec', cabinet: '#fbfaf5', counter: '#c9b79a', backsplash: '#eef0ec', floor: '#a98f6d', hardware: '#2b2f33' }, item_ids: [] },
        mid: { concept_name: 'Clean shaker', design_notes: 'New white shaker cabinets, light quartz, subway tile and stainless appliances. The safe choice for most resale buyers.', palette: { wall: '#e9ecec', cabinet: '#fbfaf5', counter: '#eceae4', backsplash: '#f7f7f4', floor: '#9c8263', hardware: '#8a8f94' }, item_ids: [] },
        full: { concept_name: 'Two-tone modern', design_notes: 'Deep green base cabinets, premium quartz, full-height tile, tile floor, a range hood and brass accents. Aims at the top of the neighborhood.', palette: { wall: '#f1f0ea', cabinet: '#2f4a43', counter: '#f4f2ec', backsplash: '#f7f5ee', floor: '#cfc9bd', hardware: '#b8924a' }, item_ids: [] }
      }
    },
    bathroom: {
      room_type: 'bathroom', confidence: 'medium', sample: true,
      summary: 'Standard 5 by 8 hall bath. Tub is sound but stained, vanity is swollen at the toe kick, tile is original.',
      observations: [
        'Almond tub with worn finish and failing caulk',
        'Vanity base swollen at the bottom edge',
        'Hollywood-strip light bar over a plate mirror',
        'No visible exhaust fan'
      ],
      unseen_risks: [
        'Rot behind the tub surround',
        'Subfloor softness around the toilet flange',
        'Age of the shower valve inside the wall'
      ],
      measurements: { floor_sf: 40, wall_sf: 210, cabinet_lf: 3, counter_sf: 6, backsplash_sf: 75, light_count: 1 },
      current_palette: { wall: '#d6cba8', cabinet: '#a8743c', counter: '#d9cdb5', backsplash: '#e4d8bb', floor: '#c2b393', hardware: '#b8962e' },
      tiers: {
        cosmetic: { concept_name: 'Clean and bright', design_notes: 'Reglaze the tub and surround white, paint the vanity and walls, new faucet, mirror, light and plank floor.', palette: { wall: '#eef0ec', cabinet: '#fbfaf5', counter: '#d9cdb5', backsplash: '#f7f7f4', floor: '#a98f6d', hardware: '#2b2f33' }, item_ids: [] },
        mid: { concept_name: 'Hotel white', design_notes: 'New vanity with top, new toilet, tile floor, exhaust fan and a reglazed tub. Reads as fully updated in listing photos.', palette: { wall: '#e9ecec', cabinet: '#fbfaf5', counter: '#eceae4', backsplash: '#f7f7f4', floor: '#b9bdbf', hardware: '#8a8f94' }, item_ids: [] },
        full: { concept_name: 'Spa navy', design_notes: 'Navy furniture-style vanity, new tub with tiled surround and glass panel, round mirror with sconces and brass fixtures.', palette: { wall: '#f1f0ea', cabinet: '#26384d', counter: '#f4f2ec', backsplash: '#f3f1ea', floor: '#d5d0c5', hardware: '#b8924a' }, item_ids: [] }
      }
    }
  };
  root.RF = Object.assign(root.RF || {}, { DEMO: DEMO });
})(typeof globalThis !== 'undefined' ? globalThis : this);
