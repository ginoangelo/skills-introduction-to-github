/* Do-it-yourself guides and store links, attached to price book items.
   level: easy | moderate | hard (can be DIY) or pro (hire it out).
   base / per: hours for the job, fixed and per unit. supplies: one-time tools
   and consumables in USD, added to materials when the user does it themselves.
   General guidance only; local codes and the product's own instructions win. */
(function (root) {
  var RF = root.RF || {};
  var G = {
    paint_walls: { level: 'easy', per: [0.02, 0.035], supplies: 60, tools: 'Roller and tray, angled brush, painter\'s tape, drop cloths, spackle, sanding sponge',
      steps: ['Clear the room, cover what stays and take off outlet covers.', 'Wash greasy walls with a degreaser, patch holes and sand the patches smooth.', 'Tape the trim and brush a band of paint along every edge.', 'Roll the ceiling first, then the walls. Two coats, letting the first dry fully.', 'Pull the tape while the last coat is still slightly wet.'],
      watch: 'Homes built before 1978 may have lead paint. Test before sanding and follow lead-safe rules.' },
    paint_cab: { level: 'moderate', per: [1.2, 2], supplies: 90, tools: 'Screwdriver, degreaser, 220-grit paper, bonding primer, cabinet enamel, foam roller, good brush',
      steps: ['Remove doors and drawer fronts and label where each one goes.', 'Degrease every surface, then scuff-sand so the primer can grip.', 'Apply one coat of bonding primer.', 'Apply two thin coats of cabinet enamel, sanding lightly between coats.', 'Let the paint cure for several days before rehanging the doors.'],
      watch: 'Most chipped cabinet paint comes from skipping the degrease or rehanging too soon.' },
    hardware: { level: 'easy', per: [0.05, 0.1], supplies: 15, tools: 'Drill, hardware template jig, screwdriver',
      steps: ['Set a template jig so every pull lands in the same spot.', 'Drill from the front with a scrap block held behind to stop tear-out.', 'Fasten the pulls. Fill old holes first if the new spacing differs.'],
      watch: 'Measure the screw spacing of the old pulls before you buy new ones.' },
    accessories: { level: 'easy', base: [1, 2], supplies: 15, tools: 'Drill, level, wall anchors',
      steps: ['Mark heights with a level: towel bar about 48 inches, paper holder about 26 inches.', 'Screw into a stud where you can; use rated wall anchors where you cannot.', 'Mount the brackets, then set the bars and tighten the set screws.'],
      watch: 'Check for pipes and wires before drilling into a wall next to the tub or vanity.' },
    mirror: { level: 'easy', base: [0.5, 1], supplies: 10, tools: 'Level, drill, anchors or a mirror cleat',
      steps: ['Center the mirror over the sink and mark the top edge.', 'Fasten the hanging hardware into studs or rated anchors.', 'Hang the mirror and check it with a level.'],
      watch: 'An old glued-on plate mirror can shatter when pried off. Tape it and wear gloves and eye protection.' },
    faucet: { level: 'moderate', base: [1.5, 3], supplies: 25, tools: 'Basin wrench, adjustable wrench, bucket, new braided supply lines',
      steps: ['Close both shutoff valves under the sink and open the faucet to drain it.', 'Disconnect the supply lines and undo the mounting nuts with a basin wrench.', 'Lift out the old faucet and clean the sink deck.', 'Set the new faucet with its gasket, tighten from below and connect new supply lines.', 'Open the valves slowly, check every joint for drips, then flush the aerator.'],
      watch: 'If a shutoff valve will not close or is corroded, stop and call a plumber.' },
    light_swap: { level: 'moderate', per: [0.75, 1.5], supplies: 20, tools: 'Non-contact voltage tester, screwdriver, wire nuts, stepladder',
      steps: ['Switch off the breaker and confirm the wires are dead with a voltage tester.', 'Take down the old fixture and note which wire went where.', 'Mount the new bracket to the ceiling or wall box.', 'Connect ground to ground, white to white and black to black, then cap each pair.', 'Tuck the wires in, mount the fixture and switch the breaker back on.'],
      watch: 'Aluminum wiring, no ground wire or scorched insulation means stop and hire an electrician. Some areas require a licensed electrician for any fixture work.' },
    lvp: { level: 'moderate', per: [0.04, 0.07], supplies: 80, tools: 'Utility knife or saw, spacers, tapping block, pull bar, tape measure',
      steps: ['Check that the subfloor is flat, dry and solid, and fix soft spots first.', 'Remove base trim and undercut the door jambs so planks slide under.', 'Plan the layout so the first and last rows are both wider than 2 inches.', 'Click the rows together, staggering end joints by at least 6 inches and leaving a 1/4 inch gap at the walls.', 'Reinstall the trim to cover the gap.'],
      watch: 'Old sheet vinyl and its glue can contain asbestos. Do not sand or scrape it; lay over it or have it tested.' },
    clean: { level: 'easy', base: [3, 6], supplies: 30, tools: 'Caulk remover tool, kitchen-and-bath silicone, degreaser, spackle, scrub pads',
      steps: ['Cut out old, cracked or moldy caulk.', 'Patch dings and nail holes and sand them flat.', 'Run new silicone along counters, tub and sink edges and smooth it with a wet finger.', 'Degrease and scrub every surface, inside cabinets included.'],
      watch: 'Let silicone cure for 24 hours before it gets wet.' },
    demo: { level: 'moderate', base: [6, 12], supplies: 120, tools: 'Pry bars, drill, hammer, gloves, eye protection, dust mask, dumpster bag or trailer',
      steps: ['Shut off water and power to the room.', 'Disconnect and remove appliances, the sink and the faucet.', 'Take out doors and drawers, then the upper cabinets, then the base cabinets.', 'Lift the countertop and pull the flooring last.', 'Haul the debris away. The supplies figure assumes a dumpster bag pickup.'],
      watch: 'Do not cut into walls blind, and leave gas lines to a professional. Older homes can have asbestos and lead.' },
    cab_install: { level: 'hard', per: [1, 1.8], supplies: 100, tools: 'Level, stud finder, drill, cabinet clamps, shims, ledger board, a helper',
      steps: ['Find the high point of the floor and draw level lines for the base and upper cabinets.', 'Mark every stud.', 'Hang the uppers first, resting them on a temporary ledger board.', 'Clamp neighbors together, screw the face frames, then screw each cabinet to the studs.', 'Set the base cabinets level with shims and fasten them.', 'Fit fillers and toe kicks, hang the doors and adjust the hinges.'],
      watch: 'Cabinets that are out of level cause countertop problems. This is a two-person job.' },
    backsplash: { level: 'moderate', per: [0.25, 0.4], supplies: 110, tools: 'Notched trowel, tile cutter, spacers, grout float, sponge, tile adhesive and grout',
      steps: ['Turn off power to the outlets and remove their covers.', 'Clean the wall and mark a level starting line.', 'Spread adhesive in small sections and set the tile with spacers, cutting around outlets.', 'Let it cure for a day, then grout and wipe off the haze.', 'Caulk the joint where tile meets the counter and refit the outlets with box extenders.'],
      watch: 'Start from a level line, not the countertop, which is rarely level.' },
    floor_tile: { level: 'hard', per: [0.3, 0.5], supplies: 180, tools: 'Tile saw, notched trowel, leveling spacers, backer board or membrane, mixing paddle',
      steps: ['Make sure the subfloor is stiff and flat, then install backer board or an uncoupling membrane.', 'Dry-lay tile from the center of the room to plan the cuts.', 'Spread thinset with the trowel size the tile calls for and back-butter large tiles.', 'Set the tile with spacers, checking for level as you go.', 'Let it cure for a day, grout, and seal if the grout requires it.'],
      watch: 'A floor that flexes will crack tile. In a bathroom the toilet has to come out and the flange height may need adjusting.' },
    vanity: { level: 'moderate', base: [3, 6], supplies: 40, tools: 'Adjustable wrench, bucket, level, drill, silicone, new trap and supply lines',
      steps: ['Shut off the water and disconnect the trap and supply lines.', 'Cut the caulk and pull the old vanity out.', 'Patch and paint the wall behind it.', 'Set the new vanity level and screw it to the studs.', 'Set the top in silicone and fit the faucet and drain.', 'Reconnect the trap and supplies, caulk the edges and test for leaks.'],
      watch: 'Check that the new vanity clears the existing drain and shutoff positions before you buy it.' },
    toilet: { level: 'moderate', base: [1.5, 3], supplies: 25, tools: 'Adjustable wrench, putty knife, sponge, new wax ring, bolts and supply line',
      steps: ['Shut off the water, flush, and sponge out what is left.', 'Disconnect the supply line and undo the floor nuts.', 'Rock the toilet loose and lift it straight up. It is heavy.', 'Scrape off the old wax and inspect the flange.', 'Set a new wax ring, lower the toilet straight down and snug the nuts a little at a time.', 'Reconnect, fill, check for leaks and caulk the base.'],
      watch: 'Over-tightening cracks the porcelain. A broken flange or soft floor must be repaired first.' },
    appliances: { level: 'easy', base: [2, 4], supplies: 30, tools: 'Tape measure, appliance dolly, level, new water line and power cord kits',
      steps: ['Measure each opening and every doorway on the path in before you order.', 'Order with delivery and haul-away of the old units.', 'Slide each unit in, level it and connect power and the refrigerator water line.', 'Fit the anti-tip bracket on the range.'],
      watch: 'A gas range must be connected by a licensed installer. A ducted hood needs a pro as well.' }
  };
  Object.assign(G, {
    carpet_out: { level: 'easy', base: [1.5, 3], supplies: 40, tools: 'Utility knife, pliers, pry bar, gloves, dust mask, contractor bags',
      steps: ['Cut the carpet into strips about 3 feet wide and roll each one up.', 'Pull the pad and scrape off anything glued down.', 'Pry up the tack strips and pull stray staples.', 'Bag it and haul it away.'],
      watch: 'Tack strips are sharp. Check what is under the carpet before you plan the new floor.' },
    carpet_clean: { level: 'easy', per: [0.01, 0.02], base: [1, 1.5], supplies: 60, tools: 'Rented carpet cleaner, cleaning solution, spot treatment, fan',
      steps: ['Vacuum thoroughly and treat stains first.', 'Run the rented cleaner slowly, overlapping each pass.', 'Make a second pass with water only to rinse.', 'Run fans and keep off it until dry.'],
      watch: 'Pet odor in the pad will not clean out. Budget for replacement if it smells after drying.' },
    trim_paint: { level: 'easy', per: [0.03, 0.06], supplies: 30, tools: 'Angled brush, painter\'s tape, caulk, sanding sponge, semi-gloss trim paint',
      steps: ['Fill nail holes, caulk the top edge and sand lightly.', 'Tape the floor or slide a guard along as you go.', 'Brush two thin coats of semi-gloss.'],
      watch: 'Paint the trim before the walls if you are doing both.' },
    baseboard: { level: 'moderate', per: [0.06, 0.1], supplies: 70, tools: 'Miter saw, brad nailer or hammer and finish nails, coping saw, caulk, stud finder',
      steps: ['Pry off the old baseboard and mark the studs.', 'Cut outside corners at 45 degrees and cope the inside corners.', 'Nail into the studs, then fill the holes and caulk the top edge.', 'Prime and paint.'],
      watch: 'Install after new flooring goes down, not before.' },
    door_hw: { level: 'easy', per: [0.3, 0.5], supplies: 10, tools: 'Screwdriver, chisel',
      steps: ['Unscrew the old knob and latch.', 'Fit the new latch and strike plate, chiseling the mortise if the shape differs.', 'Swap hinges one at a time so the door stays hung.'],
      watch: 'Check the backset of the old latch (2-3/8 or 2-3/4 inches) before buying.' },
    door_slab: { level: 'hard', per: [1.5, 3], supplies: 40, tools: 'Circular saw or planer, chisel, drill, hinge template, level',
      steps: ['Use the old door as a template for size, hinge and knob positions.', 'Trim the new slab to fit with an even gap all round.', 'Mortise the hinges and drill for the knob.', 'Hang it, check the swing and adjust.'],
      watch: 'Old frames are rarely square. A pre-hung door is easier if the frame is damaged.' },
    closet: { level: 'easy', base: [2, 4], supplies: 20, tools: 'Drill, level, stud finder, hacksaw for wire shelving',
      steps: ['Remove the old rod and shelf and patch the holes.', 'Mark a level line and find the studs.', 'Mount the rails or brackets into studs, then hang shelves and rods.'],
      watch: 'Use anchors rated for the load wherever you miss a stud.' },
    blinds: { level: 'easy', per: [0.3, 0.5], supplies: 5, tools: 'Tape measure, drill, level',
      steps: ['Measure each window in three places and order to the narrowest width.', 'Mount the brackets level inside the frame.', 'Snap in the headrail and attach the wand and valance.'],
      watch: 'Measure every window. They are rarely the same size.' },
    fan: { level: 'moderate', base: [1.5, 3], supplies: 20, tools: 'Voltage tester, screwdriver, wire nuts, stepladder',
      steps: ['Switch off the breaker and confirm the wires are dead.', 'Take down the old fixture and check the ceiling box is rated for a fan.', 'Assemble the fan, hang it on the bracket and connect the wires by color.', 'Fit the blades and light kit, then test.'],
      watch: 'A box not marked for fan support must be replaced with a fan-rated one. If there is no existing ceiling wiring, hire an electrician.' },
    plates: { level: 'moderate', base: [1.5, 3], supplies: 15, tools: 'Voltage tester, screwdriver, wire stripper',
      steps: ['Switch off the breaker and test each outlet before touching it.', 'Replace one device at a time, moving each wire to the same terminal on the new one.', 'Fit the new cover plates.'],
      watch: 'Scorched wires, aluminum wiring or no ground wire mean stop and call an electrician.' },
    pressure_wash: { level: 'easy', per: [0.002, 0.004], base: [1, 2], supplies: 90, tools: 'Rented pressure washer, wide-fan tip, house-wash detergent, eye protection',
      steps: ['Close windows and cover outlets and lights.', 'Apply detergent from the bottom up and let it sit.', 'Rinse from the top down with a wide tip, keeping the wand moving and angled down.'],
      watch: 'Too much pressure scars wood and forces water behind siding. Never spray upward under the laps.' },
    gutter_clean: { level: 'moderate', base: [2, 4], supplies: 25, tools: 'Extension ladder with stabilizer, gloves, scoop, hose',
      steps: ['Set the ladder on firm ground with a stabilizer.', 'Scoop debris into a bucket, working away from the downspout.', 'Flush with a hose and clear any clogged downspout.'],
      watch: 'Falls from ladders cause serious injuries. Do not lean out; move the ladder. Hire it out on two-story houses.' },
    yard: { level: 'easy', per: [0.004, 0.008], supplies: 40, tools: 'Rake, pruners, edger, wheelbarrow, gloves',
      steps: ['Cut back overgrowth and clear leaves and debris.', 'Edge the beds and pull weeds.', 'Spread 2 to 3 inches of mulch.', 'Seed or patch bare lawn areas.'],
      watch: 'Keep mulch and soil a few inches below the siding.' },
    ext_trim: { level: 'moderate', per: [0.05, 0.09], supplies: 60, tools: 'Scraper, sander, exterior primer, exterior paint, caulk, ladder',
      steps: ['Scrape loose paint and sand the edges smooth.', 'Replace or fill any rotted wood.', 'Prime bare wood, caulk the joints and apply two coats.'],
      watch: 'Homes built before 1978 may have lead paint. Test first and use lead-safe methods. Soft or rotted trim must be replaced, not painted.' },
    ext_paint: { level: 'hard', per: [0.03, 0.06], supplies: 200, tools: 'Ladders or scaffold, scraper, sprayer or rollers, exterior primer and paint, drop cloths',
      steps: ['Wash the siding and let it dry fully.', 'Scrape, sand and prime bare spots; caulk gaps.', 'Mask windows, doors and fixtures.', 'Spray or roll two coats, working top to bottom in the shade.'],
      watch: 'Working at height is the real risk. Pre-1978 paint may contain lead. Many owners hire this out.' },
    door_paint: { level: 'easy', per: [1.5, 3], supplies: 20, tools: 'Screwdriver, sanding sponge, primer, exterior enamel, small roller and brush',
      steps: ['Remove or mask the hardware.', 'Clean, sand lightly and prime bare or glossy areas.', 'Paint the panels first, then the rails, in two thin coats.'],
      watch: 'Start early on a dry day so the door can stay open until it is no longer tacky.' },
    curb: { level: 'easy', base: [1.5, 3], supplies: 15, tools: 'Drill, level, screwdriver',
      steps: ['Mount new house numbers level and visible from the street.', 'Replace the mailbox and the door handle set.', 'Check everything is tight and the door latches cleanly.'],
      watch: 'Measure the existing door-handle holes before buying a new set.' },
    drive: { level: 'moderate', base: [4, 8], supplies: 60, tools: 'Stiff broom, crack filler, patch compound, sealer squeegee',
      steps: ['Clean the surface and pull weeds from cracks.', 'Fill cracks and patch holes, then let them cure.', 'Spread sealer in thin coats with a squeegee.'],
      watch: 'Sealer needs a dry 24 to 48 hours above about 50 degrees. Large heaved sections need a contractor.' }
  });
  var PRO = {
    s_carpet_new: 'Carpet has to be stretched with tools most people do not own. Installers are usually arranged by the store.',
    s_elec: 'Adding outlets or circuits needs a licensed electrician and usually a permit.',
    x_door_new: 'An entry door must be set square, sealed and flashed. A poor fit leaks air and water.',
    x_gutter_fix: 'Gutter work is done from ladders at the roof edge and needs the right pitch.',
    x_gutter_new: 'New gutters are formed and hung by an installer.',
    x_roof: 'Roof work is dangerous and should be done by a licensed roofer.',
    x_permit: 'This is a fee allowance, not a task.',
    k_quartz: 'A fabricator measures, cuts and installs stone tops. Slabs are too heavy and fragile to handle yourself.',
    k_quartz_prem: 'A fabricator measures, cuts and installs stone tops. Slabs are too heavy and fragile to handle yourself.',
    k_sink_faucet: 'Undermount sinks are mounted by the countertop fabricator, and the plumbing is hooked up on the same visit.',
    k_plumb: 'Supply and valve work behind the cabinets should be done by a licensed plumber.',
    b_plumb: 'Valve work inside the wall should be done by a licensed plumber and may need a permit.',
    b_faucet_set: 'Replacing shower trim often means replacing the valve inside the wall. Hire a plumber.',
    k_elec: 'New circuits and outlet changes need a licensed electrician and usually a permit.',
    b_elec: 'New circuits and outlet changes need a licensed electrician and usually a permit.',
    k_recessed: 'New recessed lights mean new wiring in the ceiling. Hire an electrician.',
    k_pendants: 'New fixture locations mean new wiring. Hire an electrician.',
    b_fan: 'A new fan needs wiring and a duct to the outside. Hire it out.',
    b_reglaze: 'Reglazing uses spray coatings that need professional ventilation and equipment.',
    b_tub_new: 'Setting a tub involves the drain, the framing and sometimes the subfloor. Hire it out.',
    b_surround_tile: 'A shower wall has to be waterproofed correctly behind the tile, and mistakes are expensive.',
    b_glass: 'Tempered glass panels are heavy and unforgiving. Have the supplier install it.',
    k_permit: 'This is a fee allowance, not a task.',
    b_permit: 'This is a fee allowance, not a task.'
  };
  var GUIDE_OF = {
    k_demo: 'demo', b_demo: 'demo', k_clean: 'clean', b_caulk: 'clean', k_paint_walls: 'paint_walls', b_paint: 'paint_walls',
    k_paint_cab: 'paint_cab', b_vanity_paint: 'paint_cab', k_cab_stock: 'cab_install', k_cab_semi: 'cab_install',
    k_hardware: 'hardware', b_hardware: 'accessories', b_mirror: 'mirror', k_backsplash_subway: 'backsplash', k_backsplash_full: 'backsplash',
    k_faucet: 'faucet', b_faucet: 'faucet', k_appl_std: 'appliances', k_appl_up: 'appliances', k_lvp: 'lvp', b_lvp: 'lvp',
    k_floor_tile: 'floor_tile', b_floor_tile: 'floor_tile', k_lights_swap: 'light_swap', b_light: 'light_swap',
    b_vanity_stock: 'vanity', b_vanity_semi: 'vanity', b_toilet: 'toilet',
    s_patch: 'clean', s_demo: 'carpet_out', s_paint: 'paint_walls', s_trim_paint: 'trim_paint', s_carpet_clean: 'carpet_clean', s_lvp: 'lvp',
    s_baseboard: 'baseboard', s_door_hw: 'door_hw', s_doors: 'door_slab', s_closet: 'closet', s_blinds: 'blinds', s_lights: 'light_swap', s_fan: 'fan', s_plates: 'plates',
    x_wash: 'pressure_wash', x_gutter_clean: 'gutter_clean', x_yard_clean: 'yard', x_landscape: 'yard', x_trim: 'ext_trim', x_paint: 'ext_paint',
    x_door_paint: 'door_paint', x_curb: 'curb', x_lights: 'light_swap', x_drive: 'drive'
  };
  /* What to search for at a store. Items with no material to buy have none. */
  var SHOP = {
    k_paint_walls: 'interior paint and primer', b_paint: 'bathroom paint mildew resistant', k_paint_cab: 'cabinet enamel paint', b_vanity_paint: 'cabinet enamel paint',
    k_cab_stock: 'white shaker kitchen cabinets', k_cab_semi: 'semi custom kitchen cabinets', k_hardware: 'cabinet pulls', b_hardware: 'bathroom hardware set',
    k_quartz: 'quartz countertop', k_quartz_prem: 'quartz countertop', k_backsplash_subway: 'subway tile backsplash', k_backsplash_full: 'backsplash tile',
    k_faucet: 'kitchen faucet', k_sink_faucet: 'undermount kitchen sink', k_appl_std: 'stainless kitchen appliance package', k_appl_up: 'kitchen appliance package with range hood',
    k_lvp: 'luxury vinyl plank flooring', b_lvp: 'waterproof vinyl plank flooring', k_floor_tile: 'porcelain floor tile', b_floor_tile: 'porcelain floor tile',
    k_lights_swap: 'kitchen ceiling light fixture', k_recessed: 'recessed led lights', k_pendants: 'kitchen pendant lights', b_light: 'vanity light fixture',
    b_vanity_stock: 'bathroom vanity with top', b_vanity_semi: 'bathroom vanity quartz top', b_mirror: 'framed bathroom mirror', b_faucet: 'bathroom sink faucet',
    b_faucet_set: 'bathroom faucet and shower trim kit', b_toilet: 'toilet', b_tub_new: 'alcove bathtub', b_surround_tile: 'shower wall tile', b_glass: 'bathtub glass panel', b_fan: 'bathroom exhaust fan',
    s_paint: 'interior paint and primer', s_trim_paint: 'semi gloss trim paint', s_carpet_new: 'carpet', s_lvp: 'luxury vinyl plank flooring', s_baseboard: 'baseboard moulding',
    s_door_hw: 'interior door knob', s_doors: 'interior door slab', s_closet: 'closet organizer system', s_blinds: 'faux wood blinds', s_lights: 'flush mount ceiling light',
    s_fan: 'ceiling fan with light', s_plates: 'outlets and switch plates', x_yard_clean: 'mulch', x_landscape: 'shrubs and mulch', x_trim: 'exterior trim paint', x_paint: 'exterior house paint',
    x_door_paint: 'exterior door paint', x_door_new: 'front entry door', x_curb: 'house numbers and mailbox', x_lights: 'outdoor wall light', x_gutter_new: 'gutters', x_drive: 'driveway sealer'
  };

  /* The order jobs happen in on a real rehab: demo first, clean-up last. */
  var SEQ = { demo: 10, floor_tile: 30, paint_walls: 40, cab_install: 50, paint_cab: 52, vanity: 55, backsplash: 60, lvp: 65, toilet: 70, carpet_out: 12, pressure_wash: 14, gutter_clean: 16, ext_trim: 34, ext_paint: 36, door_paint: 42, baseboard: 67, trim_paint: 68, door_slab: 69, closet: 74, fan: 79, plates: 82, door_hw: 84, blinds: 88, curb: 89, drive: 90, yard: 92, carpet_clean: 96, faucet: 72, appliances: 75, light_swap: 80, hardware: 85, mirror: 86, accessories: 87, clean: 95 };
  Object.keys(G).forEach(function (k) { G[k].seq = SEQ[k]; });

  (RF.CATALOG || []).forEach(function (it) {
    it.diy = GUIDE_OF[it.id] ? G[GUIDE_OF[it.id]] : { level: 'pro', why: PRO[it.id] || 'Best left to a licensed contractor.' };
    it.shop = SHOP[it.id] || '';
  });

  function shopLinks(query) {
    if (!query) return [];
    var q = encodeURIComponent(query);
    return [
      { store: 'Home Depot', url: 'https://www.homedepot.com/s/' + q },
      { store: "Lowe's", url: 'https://www.lowes.com/search?searchTerm=' + q }
    ];
  }
  root.RF = Object.assign(RF, { shopLinks: shopLinks });
})(typeof globalThis !== 'undefined' ? globalThis : this);
