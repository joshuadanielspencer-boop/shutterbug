// Landmark pin NAMES must not print over one another.
//
// The pin de-overlap solver already spaces the discs; nothing spaced the names,
// so every label sat in the same corner and two nearby pins produced two words
// on top of each other. Joshua caught it on Vietnam's northern pair. Sweeping
// every country turned up 43 colliding pairs.
//
// This pins the fix by replaying the real geometry: the same COUNTRY_META box
// derivation the map builds, the same WoverS, the same solver, and the shared
// placeLabels/labelClashes from src/map-geometry.js.
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { WORLD_COUNTRIES } from "../src/data/worldmap.js";
import {
  fitBox, toFrameAspect, pathBBox, FRAME_AR, countryKey, WC_ALIAS,
  COUNTRY_BOX_OVERRIDE, placeLabels, labelClashes, boxFloorFor,
} from "../src/map-geometry.js";

const PIN_K = 0.033;          // the radius the current pin actually draws at
const COUNTRY_PAD = 0.01;     // vbPad on a country plate

const WC_BY_NAME = {};
for (const c of WORLD_COUNTRIES) WC_BY_NAME[c.name] = c.d;

// Rebuild the country zoom boxes exactly as shutterbug-world.jsx does.
const META = (() => {
  const byCont = {};
  for (const l of LOCATIONS) (byCont[l.continent] = byCont[l.continent] || []).push(l);
  const out = {};
  for (const [cont, ls0] of Object.entries(byCont)) {
    const wrap = cont === "Oceania";
    const byC = {};
    for (const l of ls0) (byC[l.country] = byC[l.country] || []).push(l);
    for (const [country, ls] of Object.entries(byC)) {
      const xs = ls.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = ls.map((l) => l.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      let bx0 = minX, bx1 = maxX, by0 = minY, by1 = maxY;
      const bpath = !wrap && (WC_BY_NAME[country] || WC_BY_NAME[WC_ALIAS[country]]);
      const bb = bpath && pathBBox(bpath, cx, cy, Math.max(7, Math.max(maxX - minX, maxY - minY) * 2.5));
      if (bb) { bx0 = Math.min(bx0, bb.minX); bx1 = Math.max(bx1, bb.maxX); by0 = Math.min(by0, bb.minY); by1 = Math.max(by1, bb.maxY); }
      out[countryKey(cont, country)] = { box: fitBox((bx0 + bx1) / 2, (by0 + by1) / 2, bx1 - bx0, by1 - by0, { min: boxFloorFor(country) }), locs: ls, wrap };
    }
  }
  for (const [key, box] of Object.entries(COUNTRY_BOX_OVERRIDE)) if (out[key]) out[key].box = toFrameAspect(box);
  return out;
})();

const wOverS = (box) => (box.w / box.h) > FRAME_AR
  ? (1 + 2 * COUNTRY_PAD) * box.w
  : FRAME_AR * (1 + 2 * COUNTRY_PAD) * box.h;

// The map component's de-overlap solver, same constants.
function solve(pts, WoverS) {
  const overlapD = 2 * PIN_K * WoverS, targetD = 1.8 * PIN_K * WoverS;
  for (let iter = 0; iter < 24; iter++) {
    let any = false;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      let dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y, d = Math.hypot(dx, dy);
      if (d >= overlapD) continue;
      if (d < 1e-6) { const a = i * 2.399963 + j; dx = Math.cos(a); dy = Math.sin(a); d = 1; }
      const push = (targetD - d) / 2, ux = dx / d, uy = dy / d;
      pts[i].x -= ux * push; pts[i].y -= uy * push;
      pts[j].x += ux * push; pts[j].y += uy * push;
      any = true;
    }
    if (!any) break;
  }
  return pts;
}

const pinsOf = (m, locs) => locs.map((l) => ({
  id: l.id, city: l.city, x: (m.wrap && l.x < 180 ? l.x + 360 : l.x), y: l.y,
}));

// A deterministic generator — a flaky map test is worse than none.
const lcg = (seed) => () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

describe("landmark pin labels", () => {
  it("spaces the discs so none are left crowded", () => {
    const bad = [];
    for (const [key, m] of Object.entries(META)) {
      if (m.locs.length < 2) continue;
      const W = wOverS(m.box);
      const pts = solve(pinsOf(m, m.locs), W);
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
        if (d / (2 * PIN_K * W) < 0.85) bad.push(`${key}: ${pts[i].city}/${pts[j].city}`);
      }
    }
    expect(bad, `crowded discs:\n  ${bad.join("\n  ")}`).toEqual([]);
  });

  // The real test. A country never shows ALL its landmarks at once — the mode's
  // countryOpts caps it at 4-7 — so this samples the draws the game can actually
  // produce rather than the impossible worst case of all 25 US landmarks at once.
  it("almost never lets two names collide in a draw the game can produce", () => {
    const rnd = lcg(20260728);
    let sets = 0, clashed = 0;
    const examples = [];
    for (const [key, m] of Object.entries(META)) {
      if (m.locs.length < 2) continue;
      const W = wOverS(m.box);
      for (let trial = 0; trial < 60; trial++) {
        const pool = m.locs.slice();
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        const pts = solve(pinsOf(m, pool.slice(0, Math.min(7, pool.length))), W);
        const n = labelClashes(pts, placeLabels(pts, W, PIN_K), W);
        sets++;
        if (n) { clashed++; if (examples.length < 6) examples.push(`${key}: ${pts.map((p) => p.city).join(", ")}`); }
      }
    }
    const rate = clashed / sets;
    // Measured at 0.3% when this landed. The ceiling is deliberately close to that:
    // it should fail if a content change (a very long city name, a new landmark
    // beside an existing one) quietly makes crowding common again.
    expect(rate, `${clashed}/${sets} draws had colliding labels:\n  ${examples.join("\n  ")}`).toBeLessThan(0.01);
  });

  it("keeps a lone pin's name in the default corner", () => {
    const solo = [{ id: "a", city: "Lima", x: 100, y: 50 }];
    expect(placeLabels(solo, 20, PIN_K)).toEqual({ a: 0 });
  });
});
