// ===========================================================================
// map-geometry.js — the pure geometry behind every map in the game.
//
// WHY THIS IS ITS OWN MODULE
//
// Three separate bugs in one session (2026-07-21) had the same shape: geometry
// that one code path handled and another quietly didn't.
//
//   - New Zealand's and Fiji's clickable regions were ~2,000 plate units wide,
//     because a Pacific-centred plate needs its outlines shifted onto it and the
//     country layer wasn't doing that.
//   - The USA's clickable region on the North America map was 270% OF THE FRAME
//     — its outline crosses the antimeridian via the Aleutians, so the raw path
//     spans the whole world and pointing almost anywhere selected it.
//   - Country zoom boxes were built square while the atlas frame is 1.45:1, so
//     every country in the game occupied exactly 38% of the frame width and
//     anything positioned from the box landed against the wrong rectangle.
//
// None of that was visible in a screenshot until it was extreme, none of it had
// a test, and all of it lived inline in a 7,900-line component where the only
// way to check a bounding box was to play the game and squint.
//
// Everything here is PURE — no React, no DOM (except eqPointFromEvent, which
// takes the event and is the one honest exception), no game data. That is the
// point: it can be tested directly, and test/map-geometry.test.js does exactly
// that, pinning the antimeridian cases that keep biting.
// ===========================================================================
import { robinsonToEq } from "./robinson.js";

// The atlas window's aspect. Every zoom box is built to it so a map FILLS the
// frame instead of letterboxing (rule 5). One definition: it was three separate
// `1.45` literals, which is the kind of thing that drifts the first time one of
// them is tuned.
export const FRAME_AR = 1.45;

export const countryKey = (continent, country) => `${continent}|${country}`;

// Bounding box of a path. The map paths are absolute M/L coords (no curves), so
// every number pairs up as an (x, y) point.
//
// `refX` is a longitude the shape is known to sit near. Every point is measured
// in the wrap-around nearest that reference, because a country whose outline
// crosses the antimeridian would otherwise measure as if it spanned the planet:
// the USA's Aleutians run past 180°E, so a raw box put its "centre" on the prime
// meridian and the United States map opened on AFRICA.
//
// `clip` (optional): ignore points more than this many degrees from (refX, refY),
// so a country's far-flung overseas territories — French Guiana, Réunion, the
// Azores — don't blow the zoom box out to span the whole world.
export const pathBBox = (d, refX, refY = null, clip = Infinity) => {
  const nums = d && d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 4) return null;
  const near = (x) => (refX == null ? x : x + 360 * Math.round((refX - x) / 360));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = near(+nums[i]), y = +nums[i + 1];
    if (Math.abs(x - refX) > clip) continue;
    if (refY != null && Math.abs(y - refY) > clip) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  if (minX === Infinity) return null;
  return { minX, minY, maxX, maxY };
};

// pathBBox walks every coordinate in a path string, and the country layer
// re-renders on every hover. Memoised by the path itself — the strings are module
// constants, so the cache is bounded by the number of countries and never stale.
export const pathBBoxCached = (() => {
  const cache = new Map();
  return (d) => {
    if (!cache.has(d)) cache.set(d, pathBBox(d, null));
    return cache.get(d);
  };
})();

// ---- Antimeridian, problem 1 of 2: the Pacific-centred plate ----------------
// Oceania is drawn with the Pacific in the middle, so its x runs past 180 and a
// raw Natural Earth path lands a whole world to the left. Shift every point onto
// the plate. Without this the country layer fell back to drawing a disc over each
// country — which is why Oceania used to be circles instead of borders, and why
// New Zealand's hit area was the width of the ocean.
export const wrapPathPacific = (() => {
  const cache = new Map();
  return (d) => {
    if (!cache.has(d)) {
      cache.set(d, d.replace(/(-?\d+(?:\.\d+)?)(\s+)(-?\d+(?:\.\d+)?)/g,
        (_, xs, sp, ys) => `${(+xs < 180 ? +xs + 360 : +xs).toFixed(2)}${sp}${ys}`));
    }
    return cache.get(d);
  };
})();

// ---- Antimeridian, problem 2 of 2: ordinary plates -------------------------
// On a normal plate only the countries that CROSS the line are wrong: the USA
// reaches past 180 with the Aleutians, Russia with Chukotka. Their raw outlines
// span the full 360, so the clickable region becomes the entire map.
//
// Two cutters, because the two maps know different things:
//
// trimWrappedSubpaths cuts against a FIXED SEAM, for the Robinson world map.
// Every legitimate North American point projects to x < ~230 while the wrapped
// Aleutian slivers land at x > 300, so a fixed cut is exact there.
export const WORLD_WRAP_CUT = 250;
export const trimWrappedSubpaths = (d, cut = WORLD_WRAP_CUT) => {
  if (!d || d.indexOf("M") < 0) return d;
  const kept = d.split("M").filter(Boolean).filter((s) => {
    const nums = s.match(/-?\d+(?:\.\d+)?/g);
    if (!nums) return false;
    for (let i = 0; i + 1 < nums.length; i += 2) if (+nums[i] <= cut) return true;
    return false; // whole subpath sits in the far-right wrap zone → drop it
  });
  return kept.length ? "M" + kept.join("M") : d;
};

// trimFarSubpaths cuts against the country's OWN position, for the continent
// maps, where there is no single seam that works for both the USA and Russia.
//
// The distance is deliberately PLAIN, not seam-aware. The whole problem is that
// the Aleutians sit at plate x ~355 while the USA sits at ~69: as real-world
// geography they are close across the date line, and on this plate they are a
// whole map apart — which is exactly what blows the bounding box up. Measuring
// "the short way round" would keep them and change nothing.
export const trimFarSubpaths = (() => {
  const cache = new Map();
  return (d, refX, maxDeg = 90) => {
    const key = d + "|" + Math.round(refX) + "|" + maxDeg;
    if (cache.has(key)) return cache.get(key);
    const kept = d.split("M").filter(Boolean).filter((sub) => {
      const nums = sub.match(/-?\d+(?:\.\d+)?/g);
      if (!nums) return false;
      for (let i = 0; i + 1 < nums.length; i += 2) {
        if (Math.abs(+nums[i] - refX) <= maxDeg) return true;
      }
      return false;
    });
    const out = kept.length ? "M" + kept.join("M") : d;
    cache.set(key, out);
    return out;
  };
})();

// Grow a box to the atlas frame's aspect, about its own centre (rule 5).
//
// A box NARROWER than the frame is not merely "a bit letterboxed": under
// preserveAspectRatio="meet" the plate is fitted by the binding axis and spills
// sideways well past the declared box. The UK's hand-set 12x12 drew 45% more map
// than it declared and Chile's 26x44 drew 145% more — so the scale bar and the
// locator insets, which are positioned from the box, were being placed against a
// rectangle two-thirds the size of what was actually on screen.
export const toFrameAspect = (b, ar = FRAME_AR) => {
  const w = Math.max(b.w, b.h * ar);
  const h = w / ar;
  return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h };
};

// A zoom box that FILLS the frame, centred on (cx, cy), sized to whichever
// dimension of the content is binding, plus a small honest margin.
//
// This replaced a square box of side = extent * 1.5. Two things were wrong with
// that and they compounded: a square box in a 1.45:1 frame is fitted by HEIGHT,
// so ~31% of the frame width was dead before any margin existed — every country
// in the game occupied exactly 38% of the frame width, because its shape never
// entered into it — and then the * 1.5 added 50% margin on top.
export const fitBox = (cx, cy, contentW, contentH, { margin = 1.08, min = 4.5, max = 120, ar = FRAME_AR } = {}) => {
  let w = Math.max(contentW, contentH * ar) * margin;
  let h = w / ar;
  if (w < min * ar) { w = min * ar; h = min; }
  if (w > max * ar) { w = max * ar; h = max; }
  return { x: cx - w / 2, y: cy - h / 2, w, h };
};

// Where on a map a pointer event actually landed, in the game's equirectangular
// coords. getScreenCTM is the browser's own answer to "how is this svg currently
// laid out", so it survives the frame being any size and the viewBox being
// letterboxed — which hand-rolled ratio arithmetic would not.
//
// Returns null rather than a guess if anything is missing (no owning svg, no CTM
// because the element isn't rendered yet); callers fall back to a fixed pin.
export const eqPointFromEvent = (e) => {
  const el = e.currentTarget;
  const svg = el && (el.ownerSVGElement || (el.tagName === "svg" ? el : null));
  if (!svg || !svg.createSVGPoint || !svg.getScreenCTM) return null;
  const m = svg.getScreenCTM();
  if (!m) return null;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(m.inverse());
  return robinsonToEq(p.x, p.y);
};

// Miles per degree of LONGITUDE at a given latitude (69.09 statute miles per
// degree at the equator). The floor keeps the scale bar finite at the poles.
export const milesPerLonDegree = (lat) => 69.09 * Math.max(0.08, Math.cos((lat * Math.PI) / 180));

// A round number of miles that lands the scale bar near `frac` of the frame, so
// it reads as a ruler rather than a stripe across the map.
const NICE_MILES = [10, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
export const niceScaleMiles = (boxW, midLat, frac = 0.2) => {
  const target = boxW * frac * milesPerLonDegree(midLat);
  return NICE_MILES.reduce((best, n) => (Math.abs(n - target) < Math.abs(best - target) ? n : best), NICE_MILES[0]);
};

// Total land area of a path, in square plate-degrees (shoelace over every ring).
//
// This exists because a bounding box lies about archipelagos, and the lie matters:
// French Polynesia's islands are scattered across its whole frame, so its bbox
// fills the frame while the LAND inside it is about 1% of it. New Caledonia is one
// island filling two-thirds of its frame. Both look identical to a bbox test and
// need opposite treatment — FP's specks have to be painted in because the relief
// raster has nothing to show at that scale, NC's shouldn't be, because flat-filling
// it would hide the very relief its map is for.
//
// Memoised: the paths are module constants and this walks every coordinate.
export const pathArea = (() => {
  const cache = new Map();
  return (d) => {
    if (cache.has(d)) return cache.get(d);
    let total = 0;
    for (const sub of d.split("M").filter(Boolean)) {
      const nums = sub.match(/-?\d+(?:\.\d+)?/g);
      if (!nums || nums.length < 6) continue;
      let a = 0;
      const n = Math.floor(nums.length / 2);
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = +nums[i * 2], yi = +nums[i * 2 + 1];
        const xj = +nums[j * 2], yj = +nums[j * 2 + 1];
        a += (xj + xi) * (yj - yi);
      }
      total += Math.abs(a / 2);
    }
    cache.set(d, total);
    return total;
  };
})();

// Is this country's land too small, in THIS frame, for the relief raster to show
// it? Below roughly 2% of the frame the plate has essentially nothing at that
// scale and an unfilled outline is a few hairlines on open blue.
export const isSpeckIn = (d, box, threshold = 0.02) =>
  !!d && !!box && pathArea(d) / (box.w * box.h) < threshold;
