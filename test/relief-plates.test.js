// ===========================================================================
// The per-country relief plates — do they actually cover the map they sharpen?
//
// Each plate is a crop of the 10m source pinned to a rectangle of ground. The map
// only uses one if it covers everything the frame will draw, so a plate that is a
// degree too small is not a crash and not a wrong picture: it is silently ignored,
// and the country quietly goes back to the blurry shared plate. That is a good
// failure mode and a terrible thing to discover by eye six months later.
//
// So this recomputes each country's zoom box the way the game does and asserts the
// plate contains the whole drawn area. It fails if the box maths moves and the
// plates are not regenerated — which is exactly when it should.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { WORLD_COUNTRIES } from "../src/data/worldmap.js";
import { COUNTRY_LAYER_CONTINENTS } from "../src/data/countries.js";
import {
  countryKey, pathBBox, fitBox, toFrameAspect, FRAME_AR,
  WC_ALIAS, COUNTRY_BOX_OVERRIDE,
} from "../src/map-geometry.js";
import { COUNTRY_PLATES } from "../src/data/relief-plates.js";

const WC = Object.fromEntries(WORLD_COUNTRIES.map((c) => [c.name, c.d]));
const countriesOf = (l) => (l.countries && l.countries.length ? l.countries : [l.country]);
const VB_PAD_COUNTRY = 0.01; // the country view's margin, from shutterbug-world.jsx

// The same derivation the map and the generator both run.
function boxes() {
  const out = [];
  for (const cont of COUNTRY_LAYER_CONTINENTS) {
    const wrap = cont === "Oceania";
    const byC = {};
    for (const l of LOCATIONS) if (l.continent === cont) for (const c of countriesOf(l)) (byC[c] = byC[c] || []).push(l);
    for (const [country, ls] of Object.entries(byC)) {
      const xs = ls.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = ls.map((l) => l.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      let b0 = minX, b1 = maxX, c0 = minY, c1 = maxY;
      const bp = !wrap && (WC[country] || WC[WC_ALIAS[country]]);
      const bb = bp && pathBBox(bp, cx, cy, Math.max(7, Math.max(maxX - minX, maxY - minY) * 2.5));
      if (bb) { b0 = Math.min(b0, bb.minX); b1 = Math.max(b1, bb.maxX); c0 = Math.min(c0, bb.minY); c1 = Math.max(c1, bb.maxY); }
      const key = countryKey(cont, country);
      out.push({
        key, country,
        box: COUNTRY_BOX_OVERRIDE[key]
          ? toFrameAspect(COUNTRY_BOX_OVERRIDE[key])
          : fitBox((b0 + b1) / 2, (c0 + c1) / 2, b1 - b0, c1 - c0),
      });
    }
  }
  return out;
}

// What the frame actually draws: the box plus its margin, then widened to the
// frame's aspect by the `meet` fit, then clipped to the globe north-south.
function drawn(box) {
  const vx = box.x - VB_PAD_COUNTRY * box.w, vy = box.y - VB_PAD_COUNTRY * box.h;
  const vw = box.w * (1 + 2 * VB_PAD_COUNTRY), vh = box.h * (1 + 2 * VB_PAD_COUNTRY);
  const w = Math.max(vw, FRAME_AR * vh), h = Math.max(vh, vw / FRAME_AR);
  const x = vx + vw / 2 - w / 2, y = vy + vh / 2 - h / 2;
  return { x, w, y0: Math.max(0, y), y1: Math.min(180, y + h) };
}

describe("per-country relief plates", () => {
  const all = boxes();

  it("covers every drawn pixel of the country it belongs to", () => {
    for (const { key, box } of all) {
      const p = COUNTRY_PLATES[key];
      if (!p) continue; // no plate is legitimate — the giants keep the world plate
      const d = drawn(box);
      expect(p.x, `${key}: plate starts east of the frame`).toBeLessThanOrEqual(d.x + 1e-6);
      expect(p.x + p.w, `${key}: plate ends west of the frame`).toBeGreaterThanOrEqual(d.x + d.w - 1e-6);
      expect(p.y, `${key}: plate starts south of the frame`).toBeLessThanOrEqual(d.y0 + 1e-6);
      expect(p.y + p.h, `${key}: plate ends north of the frame`).toBeGreaterThanOrEqual(d.y1 - 1e-6);
    }
  });

  it("is worth loading — every plate beats the shared world plate", () => {
    // The world plate is 12288px over 360°. A country plate coarser than that would
    // be a download that makes the map WORSE, which is the one outcome this whole
    // mechanism must never produce.
    const WORLD_PX_PER_DEG = 12288 / 360;
    for (const [key, p] of Object.entries(COUNTRY_PLATES)) {
      // Plates are cropped at the source's native 60 px/degree and only downscaled by
      // the generator's width cap, so degrees-per-plate is the honest proxy here.
      expect(p.w, `${key}: zero-width plate`).toBeGreaterThan(0);
      expect(p.w, `${key}: too wide to be sharper than the world plate`)
        .toBeLessThan(2048 / (WORLD_PX_PER_DEG * 1.25));
    }
  });

  it("names a country that is actually in the game", () => {
    const known = new Set(all.map((b) => b.key));
    for (const key of Object.keys(COUNTRY_PLATES)) {
      expect(known.has(key), `${key}: plate for a country with no country map`).toBe(true);
    }
  });
});
