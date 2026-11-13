import test from "node:test";
import assert from "node:assert/strict";
import "../public/catalog.js";
import "../public/pricing.js";
import "../public/demo.js";
import "../public/looks.js";
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
