// Framing audit: recompute every country map's auto-fitted zoom box the same way
// shutterbug-world.jsx does, and flag the ones most likely to read oddly — a box far
// bigger than the country itself (dead space), a landmark span that drags the frame,
// or a box that slams into the size cap. Surfaces candidates for a hand OVERRIDE.
// Run: node scripts/audit-country-frames.mjs
import { LOCATIONS } from "../src/data/locations.js";
import { WORLD_COUNTRIES } from "../src/data/worldmap.js";
import { fitBox, pathBBox, FRAME_AR } from "../src/map-geometry.js";

const WC_BY_NAME = Object.fromEntries(WORLD_COUNTRIES.map((c) => [c.name, c.d]));
const WC_ALIAS = { "United States": "United States of America" };
// Countries whose landmarks span the antimeridian sit on the Pacific-centred layer.
const WRAP_CONT = new Set(["Oceania"]);
const countriesOf = (l) => (l.countries && l.countries.length ? l.countries : [l.country]);
const CONTS = [...new Set(LOCATIONS.map((l) => l.continent))].filter((c) => c !== "Antarctica");

const rows = [];
for (const cont of CONTS) {
  const wrap = WRAP_CONT.has(cont);
  const byC = {};
  for (const l of LOCATIONS) if (l.continent === cont) for (const c of countriesOf(l)) (byC[c] = byC[c] || []).push(l);
  for (const [country, ls] of Object.entries(byC)) {
    const xs = ls.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = ls.map((l) => l.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    let bx0 = minX, bx1 = maxX, by0 = minY, by1 = maxY;
    const bpath = !wrap && (WC_BY_NAME[country] || WC_BY_NAME[WC_ALIAS[country]]);
    const landSpan = Math.max(maxX - minX, maxY - minY);
    const clip = Math.max(7, landSpan * 2.5);
    const bb = bpath && pathBBox(bpath, cx, cy, clip);
    if (bb) { bx0 = Math.min(bx0, bb.minX); bx1 = Math.max(bx1, bb.maxX); by0 = Math.min(by0, bb.minY); by1 = Math.max(by1, bb.maxY); }
    const bcx = (bx0 + bx1) / 2, bcy = (by0 + by1) / 2;
    const box = fitBox(bcx, bcy, bx1 - bx0, by1 - by0);
    // How far is each landmark from the box centre, as a share of the box half-width?
    // A landmark out past the frame edge means the box is being stretched to hold an
    // outlier — the classic "far-flung island drags the whole map" tell.
    const halfW = box.w / 2, halfH = box.h / 2;
    let worstOut = 0;
    for (const l of ls) {
      const lx = wrap && l.x < 180 ? l.x + 360 : l.x;
      worstOut = Math.max(worstOut, Math.abs(lx - (box.x + halfW)) / halfW, Math.abs(l.y - (box.y + halfH)) / halfH);
    }
    rows.push({ key: `${cont}|${country}`, n: ls.length, w: box.w, h: box.h, landSpan, worstOut });
  }
}

const round = (n) => Math.round(n * 10) / 10;
const CAP = 120;
console.log(`\n${rows.length} country maps audited.\n`);
console.log("=== WIDEST BOXES (most zoomed-out — check these read as the country, not a region) ===");
for (const r of [...rows].sort((a, b) => b.w - a.w).slice(0, 18))
  console.log(`  ${r.w >= CAP - 1 ? "‼ CAP " : "      "}${String(round(r.w)).padStart(6)}°w  span ${String(round(r.landSpan)).padStart(5)}°  n=${r.n}  ${r.key}`);

console.log("\n=== LANDMARK OUTSIDE THE FRAME (an outlier is stretching the box) ===");
for (const r of rows.filter((r) => r.worstOut > 1.02).sort((a, b) => b.worstOut - a.worstOut))
  console.log(`  worstOut ${round(r.worstOut)}×  ${round(r.w)}°w  span ${round(r.landSpan)}°  n=${r.n}  ${r.key}`);

console.log("\n=== SINGLE-LANDMARK COUNTRIES with a wide box (nothing to fill the frame) ===");
for (const r of rows.filter((r) => r.n === 1 && r.w > 14).sort((a, b) => b.w - a.w))
  console.log(`  ${round(r.w)}°w  ${r.key}`);
