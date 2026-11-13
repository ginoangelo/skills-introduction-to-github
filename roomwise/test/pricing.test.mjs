import test from "node:test";
import assert from "node:assert/strict";
import "../public/catalog.js";
import "../public/diy.js";
import "../public/pricing.js";
import "../public/demo.js";
import "../public/looks.js";
import "../public/voice.js";
import { sanitize } from "../lib/analyze.mjs";

const RF = globalThis.RF;
const kitchen = RF.DEMO.kitchen;

test("every catalog id is unique and every package has items", () => {
  const ids = RF.CATALOG.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const room of ["kitchen", "bathroom"]) for (const t of RF.TIERS) assert.ok(RF.defaultItems(room, t.id).length >= 5);
});

test("packages cost more as they go up, for both rooms", () => {
  for (const room of ["kitchen", "bathroom"]) {
    const [c, m, f] = RF.TIERS.map((t) => RF.price(RF.DEMO[room], t.id, { zip: "43215" }));
    assert.ok(c.totalHi < m.totalLo && m.totalHi < f.totalLo, room);
  }
});

test("totals add up: materials + labor, plus contingency", () => {
  const p = RF.price(kitchen, "mid", { zip: "00000x" });
  const mat = p.lines.reduce((s, l) => s + l.mat, 0);
  const lo = p.lines.reduce((s, l) => s + l.laborLo, 0);
  assert.equal(p.materials, mat);
  assert.equal(p.laborLo, lo);
  assert.equal(p.totalLo, Math.round((mat + lo) * 1.15));
});

test("a known line prices as expected", () => {
  const p = RF.price(kitchen, "cosmetic", {});
  const paint = p.lines.find((l) => l.id === "k_paint_walls");
  assert.deepEqual([paint.qty, paint.mat, paint.laborLo, paint.laborHi], [320, 112, 384, 800]);
});

test("area index and contractor multiplier scale labor only", () => {
  const base = RF.price(kitchen, "mid", {});
  const sf = RF.price(kitchen, "mid", { zip: "94110", laborMult: 1.1 });
  assert.equal(sf.materials, base.materials);
  assert.ok(Math.abs(sf.laborHi - base.laborHi * 1.5 * 1.1) < 15);
  assert.equal(RF.regionFactor("123").known, false);
  RF.LABOR = { year: "2025", zip3: { 941: [1.39, "San Francisco-Oakland-Fremont, CA"] } };
  assert.deepEqual(RF.regionFactor("94110"), { factor: 1.39, label: "San Francisco-Oakland-Fremont, CA", known: true, source: "BLS 2025" });
  assert.equal(RF.regionFactor("43215").source, undefined);
  RF.LABOR = null;
});

test("overrides: quantity, unit price, leave out, contingency", () => {
  const base = RF.price(kitchen, "mid", {});
  const o = RF.price(kitchen, "mid", {
    contingency: { mid: 0 },
    overrides: { "mid:k_quartz": { qty: 10, mat: 100 }, "mid:k_appl_std": { off: true } },
  });
  const q = o.lines.find((l) => l.id === "k_quartz");
  assert.equal(q.mat, 1000);
  assert.equal(o.lines.find((l) => l.id === "k_appl_std").included, false);
  assert.equal(o.totalLo, o.materials + o.laborLo);
  assert.ok(o.materials < base.materials - 2600);
});

test("sanitize drops unknown or wrong-room items and falls back to defaults", () => {
  const a = structuredClone(kitchen);
  a.tiers.cosmetic.item_ids = ["k_paint_walls", "b_toilet", "made_up", "k_paint_walls"];
  a.tiers.mid.item_ids = ["nope"];
  const s = sanitize(a);
  assert.deepEqual(s.tiers.cosmetic.item_ids, ["k_paint_walls"]);
  assert.deepEqual(s.tiers.mid.item_ids, RF.defaultItems("kitchen", "mid"));
});

test("a look restyles every package without changing scope or price", () => {
  const before = RF.price(kitchen, "full", {});
  const a = RF.applyLook(kitchen, "farmhouse");
  assert.equal(a.look, "farmhouse");
  assert.equal(a.tiers.full.palette.cabinet, RF.look("farmhouse").c.bold);
  assert.equal(a.tiers.cosmetic.palette.counter, kitchen.current_palette.counter);
  assert.equal(RF.price(a, "full", {}).typical, before.typical);
  assert.equal(RF.applyLook(kitchen, "unknown").look, "clean");
  assert.notEqual(a.tiers.mid.palette.wall, RF.applyLook(kitchen, "modern").tiers.mid.palette.wall);
});

test("spoken requests turn into the right actions", () => {
  const lines = RF.price(kitchen, "mid", {}).lines;
  const act = (t) => RF.parseCommand(t, { lines }).actions.map((a) => [a.type, a.target, a.number]);
  assert.deepEqual(act("Make it modern farmhouse"), [["look", "farmhouse", 0]]);
  assert.deepEqual(act("go dark modern and show me the full package"), [["look", "modern", 0], ["tier", "full", 0]]);
  assert.deepEqual(act("Leave out the appliances"), [["exclude", "k_appl_std", 0]]);
  assert.deepEqual(act("keep the existing counters"), [["exclude", "k_quartz", 0]]);
  assert.deepEqual(act("add back the backsplash"), [["include", "k_backsplash_subway", 0]]);
  assert.deepEqual(act("the cabinets are 18 linear feet"), [["qty", "k_cab_stock", 18]]);
  assert.deepEqual(act("quartz costs $60 per square foot"), [["price", "k_quartz", 60]]);
  assert.deepEqual(act("set contingency to 12 percent"), [["contingency", "", 12]]);
  assert.deepEqual(act("my labor runs about 90 percent"), [["labor", "", 90]]);
  assert.deepEqual(act("ARV is 240k"), [["arv", "", 240000]]);
  assert.deepEqual(act("what's the total?"), [["total", "", 0]]);
  assert.deepEqual(act("tell me a joke"), []);
});

test("every item has either a DIY guide or a reason to hire a pro", () => {
  for (const it of RF.CATALOG) {
    if (it.diy.level === "pro") assert.ok(it.diy.why.length > 20, it.id);
    else { assert.ok(it.diy.steps.length >= 3 && it.diy.tools && it.diy.watch, it.id); assert.ok(it.diy.base || it.diy.per, it.id); }
  }
  assert.equal(RF.shopLinks("quartz countertop")[0].url, "https://www.homedepot.com/s/quartz%20countertop");
});

test("doing a job yourself removes its labor, adds supplies and counts hours", () => {
  const base = RF.price(kitchen, "cosmetic", {});
  const p = RF.price(kitchen, "cosmetic", { overrides: { "cosmetic:k_paint_walls": { diy: true }, "cosmetic:k_faucet": { diy: true } } });
  const paint = p.lines.find((l) => l.id === "k_paint_walls");
  assert.deepEqual([paint.laborLo, paint.laborHi, paint.mat, paint.hoursLo, paint.hoursHi], [0, 0, 172, 6.5, 11]);
  assert.equal(p.diy.count, 2);
  assert.equal(p.diy.saveLo, 384 - 60 + 150 - 25);
  assert.equal(base.materials + base.laborLo - p.materials - p.laborLo, p.diy.saveLo);
  const pro = RF.price(kitchen, "mid", { overrides: { "mid:k_quartz": { diy: true } } }).lines.find((l) => l.id === "k_quartz");
  assert.equal(pro.diy, false);
  assert.ok(pro.laborLo > 0);
});

test("saying you will do it yourself is understood", () => {
  const lines = RF.price(kitchen, "cosmetic", {}).lines;
  const act = (t) => RF.parseCommand(t, { lines }).actions.map((a) => [a.type, a.target]);
  assert.deepEqual(act("I'll do the flooring myself"), [["diy", "k_lvp"]]);
  assert.deepEqual(act("hire a contractor for the flooring"), [["pro", "k_lvp"]]);
});

test("DIY jobs carry a build order, and paperwork requests are understood", () => {
  const seq = (id) => RF.CATALOG.find((i) => i.id === id).diy.seq;
  assert.ok(seq("k_demo") < seq("k_paint_walls") && seq("k_paint_walls") < seq("k_cab_stock") && seq("k_cab_stock") < seq("k_lvp") && seq("k_lvp") < seq("k_clean"));
  for (const it of RF.CATALOG) if (it.diy.level !== "pro") assert.ok(it.diy.seq > 0, it.id);
  const act = (t) => RF.parseCommand(t, { lines: [] }).actions.map((a) => [a.type, a.target]);
  assert.deepEqual(act("show me the scope of work"), [["tab", "scope"]]);
  assert.deepEqual(act("open my DIY plan"), [["tab", "diy"]]);
});
