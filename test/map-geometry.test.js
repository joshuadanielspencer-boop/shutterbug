// ===========================================================================
// map-geometry.test.js
//
// These tests exist because of one bad session. On 2026-07-21 three separate
// map bugs shipped, all the same shape — geometry one code path handled and
// another quietly didn't — and none of them were catchable without playing the
// game and squinting at a map:
//
//   - New Zealand's clickable region was ~2,000 plate units wide
//   - the USA's was 270% of the atlas frame
//   - every country map showed its country at 38% of the frame width
//
// Each case below is one of those, pinned with real coordinates. The point is
// not coverage; it's that the next person to touch the antimeridian handling
// finds out from a failing test rather than from a child clicking Fiji and
// landing in Chile.
// ===========================================================================
import { describe, it, expect } from "vitest";
import {
  FRAME_AR, pathBBox, pathBBoxCached, wrapPathPacific, trimWrappedSubpaths,
  trimFarSubpaths, toFrameAspect, fitBox, milesPerLonDegree, niceScaleMiles,
} from "../src/map-geometry.js";

const width = (bb) => bb.maxX - bb.minX;

describe("pathBBox", () => {
  it("measures a simple path", () => {
    const bb = pathBBox("M10 20L30 40L20 15", null);
    expect(bb).toEqual({ minX: 10, minY: 15, maxX: 30, maxY: 40 });
  });

  it("returns null for a path with no usable coordinates", () => {
    expect(pathBBox("", null)).toBeNull();
    expect(pathBBox("M10", null)).toBeNull();
    expect(pathBBox(null, null)).toBeNull();
  });

  // The bug: the USA's Aleutians run past 180°E, so a raw box put the country's
  // centre on the prime meridian and its "country map" opened on Africa.
  it("measures across the antimeridian relative to a reference longitude", () => {
    const straddling = "M179 10L-179 12";           // 2 degrees apart in reality
    expect(width(pathBBox(straddling, null))).toBe(358);   // naive: nearly the planet
    expect(width(pathBBox(straddling, 179))).toBe(2);      // reference-aware: correct
  });

  // The clip is what stops France's Réunion, or Portugal's Azores, dragging a
  // country's zoom box out to sea.
  it("clips points far from the reference", () => {
    const mainlandPlusIsland = "M0 0L10 10L150 5";
    expect(width(pathBBox(mainlandPlusIsland, 5))).toBe(150);
    expect(width(pathBBox(mainlandPlusIsland, 5, null, 50))).toBe(10);
  });

  it("caches by path string and returns an equal box", () => {
    const d = "M1 2L3 4";
    expect(pathBBoxCached(d)).toEqual(pathBBox(d, null));
    expect(pathBBoxCached(d)).toBe(pathBBoxCached(d));   // same object: memoised
  });
});

describe("wrapPathPacific", () => {
  // NOTE the coordinate system, because getting this wrong is what made the first
  // draft of these tests fail: these paths are in PLATE units, x = lon + 180, not
  // longitudes. New Zealand sits at plate x ~348, Fiji ~357, French Polynesia ~28.
  // The Pacific-centred plate runs 180..540, so the antimeridian (plate 360) is in
  // the middle and only the countries WEST of it need shifting.

  // The bug: Oceania is drawn Pacific-centred, so a country left of plate 180 lands
  // a whole world away. The country layer wasn't shifting it, so every Oceania
  // country fell back to a disc — and New Zealand's hit area spanned the ocean.
  it("shifts points west of the plate's origin onto it", () => {
    const frenchPolynesia = "M28.3 111.0L31.0 113.0";   // lon ~-152
    const bb = pathBBox(wrapPathPacific(frenchPolynesia), null);
    expect(bb.minX).toBeGreaterThan(360);                // moved onto the plate
    expect(width(bb)).toBeCloseTo(2.7, 1);               // and kept its real width
  });

  it("leaves points already east of the origin alone", () => {
    const nz = "M347.9 126.0L353.0 136.0";               // New Zealand, lon ~168
    const bb = pathBBox(wrapPathPacific(nz), null);
    expect(bb.minX).toBeCloseTo(347.9, 1);
    expect(width(bb)).toBeCloseTo(5.1, 1);
  });

  // A country straddling the antimeridian is the case the whole thing exists for.
  it("makes a straddling country contiguous instead of planet-wide", () => {
    const straddling = "M359 106L1 108";                 // lon 179 and -179
    expect(width(pathBBox(straddling, null))).toBe(358);       // naive: the planet
    expect(width(pathBBox(wrapPathPacific(straddling), null))).toBeCloseTo(2, 1);
  });
});

describe("trimWrappedSubpaths (fixed seam — the Robinson world map)", () => {
  it("drops a subpath that lies entirely in the far-right wrap zone", () => {
    const d = "M100 10L120 20M320 5L340 8";
    expect(trimWrappedSubpaths(d)).toBe("M100 10L120 20");
  });

  it("keeps a subpath with any point inside the cut", () => {
    const d = "M100 10L320 20";
    expect(trimWrappedSubpaths(d)).toBe(d);
  });

  it("never returns empty — a path entirely past the cut is left alone", () => {
    const d = "M320 5L340 8";
    expect(trimWrappedSubpaths(d)).toBe(d);
  });
});

describe("trimFarSubpaths (own-position — the continent maps)", () => {
  // The bug: the USA's clickable region was 270% of the frame, so pointing almost
  // anywhere on the North America map selected it.
  it("drops the Aleutian tail that spans the world", () => {
    const usa = "M69 40L114 30M355 35L358 36";     // mainland + wrapped tail
    expect(width(pathBBoxCached(usa))).toBeGreaterThan(180);
    const trimmed = trimFarSubpaths(usa, 84.5);
    expect(width(pathBBoxCached(trimmed))).toBe(45);
  });

  // This is the subtle one and the reason the first attempt at the fix failed:
  // a seam-aware distance calls the Aleutians "close" and changes nothing.
  it("uses PLAIN distance, not the short way round the seam", () => {
    const d = "M69 40L114 30M355 35L358 36";
    const trimmed = trimFarSubpaths(d, 84.5);
    expect(trimmed).not.toContain("355");
  });

  it("keeps everything when the whole country is near the reference", () => {
    const d = "M69 40L114 30";
    expect(trimFarSubpaths(d, 84.5)).toBe(d);
  });
});

describe("toFrameAspect", () => {
  // The bug: hand-set boxes predated rule 5. A box narrower than the frame spills
  // sideways under `meet`, so anything positioned from the box lands wrong.
  it("widens a square box to the frame aspect, keeping its centre", () => {
    const out = toFrameAspect({ x: 171, y: 29.5, w: 12, h: 12 });   // the UK's old box
    expect(out.w / out.h).toBeCloseTo(FRAME_AR, 5);
    expect(out.x + out.w / 2).toBeCloseTo(177, 5);
    expect(out.y + out.h / 2).toBeCloseTo(35.5, 5);
    expect(out.w).toBeGreaterThan(12);
  });

  it("widens a tall box a long way — Chile spilled 145%", () => {
    const out = toFrameAspect({ x: 96, y: 104, w: 26, h: 44 });
    expect(out.w).toBeCloseTo(44 * FRAME_AR, 5);
    expect(out.w / 26).toBeGreaterThan(2);
  });

  it("leaves a box already at the frame aspect alone", () => {
    const b = { x: 0, y: 0, w: 14.5, h: 10 };
    const out = toFrameAspect(b);
    expect(out.w).toBeCloseTo(b.w, 5);
    expect(out.h).toBeCloseTo(b.h, 5);
  });
});

describe("fitBox", () => {
  // The bug: a square box in a 1.45 frame is fitted by height, so EVERY country
  // occupied exactly 38% of the frame width regardless of its shape.
  it("always produces the frame aspect", () => {
    for (const [w, h] of [[10, 10], [60, 30], [12, 40], [1, 1]]) {
      const b = fitBox(0, 0, w, h);
      expect(b.w / b.h).toBeCloseTo(FRAME_AR, 5);
    }
  });

  it("fills most of the frame for a country shaped like it", () => {
    const b = fitBox(0, 0, 14.5, 10);
    expect(14.5 / b.w).toBeGreaterThan(0.9);      // >90% of the frame width
  });

  it("fills the height for a tall country instead of a fifth of it", () => {
    const b = fitBox(0, 0, 26, 44);               // Chile
    expect(44 / b.h).toBeGreaterThan(0.9);
  });

  it("floors microstates so the relief has detail left to show", () => {
    const b = fitBox(0, 0, 0.05, 0.05);           // Monaco
    expect(b.h).toBeCloseTo(4.5, 5);
  });

  it("caps the largest countries", () => {
    const b = fitBox(0, 0, 400, 300);
    expect(b.h).toBeCloseTo(120, 5);
  });

  it("stays centred on the point it was given", () => {
    const b = fitBox(84.5, 51.5, 59, 26);
    expect(b.x + b.w / 2).toBeCloseTo(84.5, 5);
    expect(b.y + b.h / 2).toBeCloseTo(51.5, 5);
  });
});

describe("scale bar", () => {
  it("shrinks a degree of longitude towards the poles", () => {
    expect(milesPerLonDegree(0)).toBeCloseTo(69.09, 2);
    expect(milesPerLonDegree(60)).toBeCloseTo(34.5, 1);
    expect(milesPerLonDegree(60)).toBeLessThan(milesPerLonDegree(0));
  });

  it("stays finite at the pole", () => {
    expect(milesPerLonDegree(90)).toBeGreaterThan(0);
    expect(Number.isFinite(milesPerLonDegree(90))).toBe(true);
  });

  it("picks a round number near a fifth of the frame", () => {
    expect(niceScaleMiles(16.6, 42)).toBe(200);     // Italy
    expect(niceScaleMiles(127, 60)).toBe(1000);     // Canada
  });

  it("always picks from the round set", () => {
    for (const w of [2, 8, 30, 90, 200, 360]) {
      const m = niceScaleMiles(w, 20);
      expect([10, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000]).toContain(m);
    }
  });
});
