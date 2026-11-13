// Sample report returned in DEMO_MODE (no API key) so the app can be tried end-to-end.
const DEMO_REPORT = {
  title: "Dripping single-handle kitchen faucet",
  category: "plumbing",
  diagnosis:
    "The steady drip from the spout with the handle fully off points to a worn cartridge. Inside single-handle faucets, a plastic cartridge controls water flow; its rubber seals wear out after 5–10 years and let water seep past even when closed.",
  other_possible_causes: [
    "Worn O-rings (more likely if it leaks from the base of the spout instead of the tip)",
    "Mineral buildup on the cartridge seats (common with hard water)",
  ],
  confidence: "medium",
  verdict: "diy_easy",
  verdict_reason:
    "Replacing a cartridge needs only basic hand tools, takes under an hour, and the water supply is easy to shut off under the sink.",
  urgency: "fix_soon",
  time_estimate: "45–60 minutes",
  safety_warnings: [
    "Shut off both hot and cold supply valves under the sink before you start.",
    "Hot water lines can scald — let the faucet run cold before disassembly.",
  ],
  stop_and_call_a_pro_if: [
    "The shutoff valves under the sink won't turn or are leaking themselves.",
    "The faucet body is cracked or corroded once you take the handle off.",
    "Water is coming from under the sink, not the faucet.",
  ],
  materials: [
    { item: "Replacement cartridge (match your faucet brand/model — bring the old one to the store)", quantity: "1", cost_low: 15, cost_high: 45, where_to_buy: "Home Depot / Lowe's plumbing aisle", already_own_likely: false },
    { item: "Silicone plumber's grease", quantity: "1 small tube", cost_low: 4, cost_high: 7, where_to_buy: "Plumbing aisle", already_own_likely: false },
    { item: "White vinegar (to clean mineral deposits)", quantity: "1 cup", cost_low: 0, cost_high: 3, where_to_buy: "Grocery store", already_own_likely: true },
  ],
  tools: [
    { item: "Allen (hex) key set", quantity: "1 set", cost_low: 8, cost_high: 15, where_to_buy: "Hardware aisle", already_own_likely: true },
    { item: "Adjustable wrench", quantity: "1", cost_low: 10, cost_high: 20, where_to_buy: "Hardware aisle", already_own_likely: true },
    { item: "Phillips & flathead screwdrivers", quantity: "1 each", cost_low: 6, cost_high: 12, where_to_buy: "Hardware aisle", already_own_likely: true },
    { item: "Cartridge puller (only if the cartridge is stuck)", quantity: "1", cost_low: 12, cost_high: 25, where_to_buy: "Plumbing aisle", already_own_likely: false },
  ],
  steps: [
    { title: "Shut off the water", instructions: "Turn both supply valves under the sink clockwise until they stop. Open the faucet to drain remaining water and relieve pressure.", tip: "Put a towel in the sink and close the drain stopper so small parts can't fall down the drain.", safety: "If a valve won't budge, stop — don't force it." },
    { title: "Remove the handle", instructions: "Pop off the decorative cap on the handle with a flathead screwdriver, then loosen the set screw underneath with an Allen key or Phillips screwdriver. Lift the handle off.", tip: "Take a phone photo at each step so reassembly is easy.", safety: "" },
    { title: "Remove the retaining nut or clip", instructions: "Unscrew the dome/retaining nut with the adjustable wrench (counter-clockwise), or pull out the U-shaped retaining clip with pliers.", tip: "Wrap the wrench jaws with tape to avoid scratching the finish.", safety: "" },
    { title: "Pull out the old cartridge", instructions: "Note which way the cartridge faces (look for 'HOT' marking or a notch), then pull it straight up. Use a cartridge puller if it's stuck.", tip: "Take the old cartridge to the store to get an exact match.", safety: "" },
    { title: "Clean and install the new cartridge", instructions: "Wipe out the faucet body; soak any mineral crust with vinegar for 10 minutes. Lightly grease the new cartridge's O-rings and push it in, facing the same direction as the old one.", tip: "If hot and cold are reversed after reassembly, rotate the cartridge 180°.", safety: "" },
    { title: "Reassemble and test", instructions: "Reinstall the nut/clip, handle, set screw and cap. Slowly open the supply valves and run the faucet hot and cold. Check for drips over the next hour.", tip: "", safety: "" },
  ],
  diy_total_low: 19,
  diy_total_high: 52,
  pro_type: "Handyman or licensed plumber",
  pro_cost_low: 150,
  pro_cost_high: 325,
  alternatives: [
    { option: "Hire a handyman", description: "Most handymen will swap a cartridge in under an hour; often cheaper than a plumber for simple jobs.", cost_low: 120, cost_high: 220 },
    { option: "Licensed plumber", description: "Best if the valves under the sink are seized or the faucet body is damaged.", cost_low: 175, cost_high: 350 },
    { option: "Replace the whole faucet", description: "Worth it if the faucet is 10+ years old or parts are discontinued. Mid-range faucet $120–$250 plus install.", cost_low: 150, cost_high: 450 },
    { option: "Manufacturer warranty", description: "Moen, Delta and Kohler offer lifetime warranties on cartridges — call them for a free replacement part.", cost_low: 0, cost_high: 0 },
  ],
  what_to_tell_the_pro:
    "Hi — my single-handle kitchen faucet drips steadily from the spout even when fully off. It started about two weeks ago and is getting worse. I think the cartridge is worn. The shutoff valves under the sink work. Could you give me a quote to replace the cartridge (or the faucet if needed), and let me know your trip fee?",
  questions_to_ask_the_pro: [
    "Is your price flat-rate or hourly, and is there a trip fee?",
    "Will you bring the matching cartridge, or should I buy it?",
    "Do you guarantee the work if it starts leaking again?",
  ],
  follow_up_questions: [
    "What brand is the faucet (look for a logo on the handle or base)?",
    "Does it drip from the spout tip or leak around the base?",
  ],
  video_search_query: "how to replace single handle kitchen faucet cartridge",
};

module.exports = { DEMO_REPORT };
