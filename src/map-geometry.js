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
// ---- The floor, and why an island needs a different one --------------------
//
// The per-country relief plates are cut from the 10m Natural Earth source at its
// native 60 pixels per degree (scripts/make-country-relief.mjs). That is a HARD
// ceiling on detail: Trinidad and Tobago is 1.35° across, so the island is 81
// source pixels wide and no amount of framing invents an 82nd. This is why the
// atlas has a floor at all — past some point you are not zooming in, you are
// enlarging the same pixels.
export const PLATE_PX_PER_DEG = 60;

// The default floor, in degrees of box HEIGHT (so 4.5 × 1.45 = 6.5° wide). At that
// size the plate supplies ~390 source pixels across the frame, which is a soft but
// honest ~2× on a desktop atlas.
export const BOX_MIN_DEG = 4.5;

// The island floor. It is smaller, and the reason is not that islands are special
// — it is what the frame is FULL OF when a country is backed off to the floor.
//
// Back Switzerland off to 6.5° and the frame fills with the Alps, Italy and
// France: real ground, drawn from the same plate, and a child looking at it learns
// where Switzerland sits. Nothing is wasted. Back Trinidad off to 6.5° and 72% of
// the frame is open Caribbean — flat blue with no information in it at all. The
// default floor buys context for a mainland country and buys literally nothing for
// an island, which is the whole asymmetry.
//
// So an island's floor is set by the only thing that actually binds: how many
// source pixels are left. Below ~140 across the frame an island stops reading as a
// shape and starts reading as a smudge, and that works out at 2.3° wide — enough
// that Trinidad, Jamaica and Fiji fill most of their frames, and Malta and
// Singapore stop being specks without pretending to a sharpness they cannot have.
export const ISLAND_MIN_FRAME_PX = 140;
export const ISLAND_MIN_DEG = ISLAND_MIN_FRAME_PX / PLATE_PX_PER_DEG / FRAME_AR;

// Which countries get it. An explicit list, the same way the camel and cable-car
// lists in travel.js are explicit: absence means the ordinary floor, which is the
// safe default. The test is not "is it politically an island" but "at the floor,
// is the frame around it ocean" — that is what the smaller floor is buying back.
//
// Haiti is in it despite sharing Hispaniola: at the floor its frame is still well
// over half open Caribbean, and the land that is not Haiti is the Dominican
// Republic, which the map labels anyway. Ireland is in it for the same reason —
// enlarging it loses some Irish Sea, not some Britain.
//
// Countries listed here that are too big to reach either floor (Japan, Indonesia,
// the Philippines, Cuba, Iceland, New Zealand, Madagascar…) are unaffected. They
// are named so the rule stays true if the game's places in them ever shift.
export const OCEAN_FRAMED = new Set([
  "Singapore", "Malta", "Trinidad and Tobago", "Jamaica", "Haiti", "Cuba",
  "Solomon Is.", "Fiji", "Vanuatu", "New Caledonia", "French Polynesia",
  "Micronesia", "Papua New Guinea", "New Zealand",
  "Sri Lanka", "Taiwan", "Japan", "Philippines", "Indonesia",
  "Ireland", "Iceland", "United Kingdom", "Madagascar",
]);

// The floor a given country's zoom box is held to.
export const boxFloorFor = (country) =>
  OCEAN_FRAMED.has(country) ? ISLAND_MIN_DEG : BOX_MIN_DEG;

export const fitBox = (cx, cy, contentW, contentH, { margin = 1.08, min = BOX_MIN_DEG, max = 120, ar = FRAME_AR } = {}) => {
  let w = Math.max(contentW, contentH * ar) * margin;
  let h = w / ar;
  if (w < min * ar) { w = min * ar; h = min; }
  if (w > max * ar) { w = max * ar; h = max; }
  return { x: cx - w / 2, y: cy - h / 2, w, h };
};

// A few location country names differ from the world-map polygon names, so the
// outline can still be found. (Singapore has no polygon — a tiny island — and
// simply shows a marker with no border.)
export const WC_ALIAS = { "United States": "United States of America" };

// A box at the atlas frame's own aspect, centred on (cx, cy) and `w` wide.
const box145 = (cx, cy, w) => ({ x: cx - w / 2, y: cy - (w / FRAME_AR) / 2, w, h: w / FRAME_AR });

// HAND-SET country boxes, for the countries the derivation above cannot size.
//
// Two different problems land here. Some countries are so far-flung that a box
// holding all their landmarks spans a hemisphere (the USA's Denali and Kīlauea blew
// its box out to 120°, so its "country map" showed the Arctic, both oceans and half
// of South America). Others are sized wrong by their BORDER path, because a distant
// territory sits just inside the clip their landmarks earn — Chile's Easter Island,
// Spain's Canaries, South Africa's Prince Edward Islands each dragged the box out to
// sea and left the mainland small in a corner.
//
// Landmarks falling OUTSIDE an override still work: when a run's options include one,
// optionsFitCountry() sends that run to the wider continent view instead.
//
// Lives here rather than in the map component because it is map GEOMETRY, and because
// scripts/make-country-relief.mjs has to derive exactly the same boxes to know what
// ground each country's relief plate must cover.
export const COUNTRY_BOX_OVERRIDE = {
  // Zoomed out and centred WEST of the country, so the contiguous 48 sit in the RIGHT
  // of the frame and the left is a wide band of open Pacific — room for the Alaska and
  // Hawaiʻi locator boxes to stack clear of the mainland (Joshua asked for more Pacific
  // here). The right edge stays past the Atlantic coast (x 114 ≈ lon −66) so Maine and
  // Florida keep their east coast.
  "North America|United States": box145(77, 51.5, 78),
  // The mainland: lon −84…−58, lat −14…−58. Without this, Chile's border path carries
  // Easter Island (lon −109) and its map was really a map of the south Pacific.
  "South America|Chile": { x: 96, y: 104, w: 26, h: 44 },
  // The derived box carried ~5° of margin a side, so the islands sat small in a lot of
  // North Sea and Atlantic. Hug them.
  "Europe|United Kingdom": { x: 171, y: 29.5, w: 12, h: 12 },
  // The peninsula — lon −9.4…3.9, lat 35.6…44.2 — without the Canary Islands pulling
  // the box south-west into the Atlantic.
  "Europe|Spain": box145(177, 50.2, 13.4),
  // The mainland — lon 16.5…33, lat −22…−35 — without the Prince Edward Islands, 1,200
  // miles out in the Southern Ocean, sliding the box south.
  "Africa|South Africa": box145(204.7, 118.7, 21),
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

// ---------------------------------------------------------------------------
// Where a landmark pin's NAME goes.
//
// The pin de-overlap solver in the map component spaces the DISCS, and it does
// that well — swept across all 108 countries there are no crowded discs left.
// The names were another matter: every label was pinned to the same corner (up
// and to the right), so as soon as two pins sat near each other their names ran
// straight through one another. 43 pairs did, from "Toronto"/"Ottawa" to
// "Fez"/"Volubilis". A disc a child can tell apart is no use if the two words
// printed over it are illegible.
//
// Each label is offered four corners and takes the first that is clear of the
// labels already placed AND of every pin disc. Greedy in the pins' own order,
// which is stable, so a label doesn't hop between renders. If all four collide
// it keeps the default — better a clash than a name flung far from its pin.
//
// Lives here rather than in the component so the sweep that proved the problem
// can run as a test. Everything is in the same WoverS plate units the pin radii
// use, so it is resolution- and zoom-independent.
export const LABEL_FS = 0.017;    // font size, fraction of frame width
export const LABEL_DX = 0.033;    // horizontal stand-off from the pin centre
export const LABEL_DY = 0.024;    // vertical stand-off
const LABEL_CHAR_W = 0.6;         // monospace: ~0.6em a character

// The four corners, as (right?, above?).
const CORNERS = [[true, true], [true, false], [false, true], [false, false]];

export function labelBoxFor(pin, corner, WoverS) {
  const [right, above] = CORNERS[corner] || CORNERS[0];
  const w = String(pin.city || "").length * LABEL_FS * LABEL_CHAR_W * WoverS;
  const h = LABEL_FS * WoverS * 1.15;
  const x0 = right ? pin.x + LABEL_DX * WoverS : pin.x - LABEL_DX * WoverS - w;
  const yc = above ? pin.y - LABEL_DY * WoverS : pin.y + (LABEL_DY + LABEL_FS) * WoverS;
  return { x0, x1: x0 + w, y0: yc - h * 0.8, y1: yc + h * 0.2 };
}

export const labelCorner = (corner) => CORNERS[corner] || CORNERS[0];

const boxesHit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

// pins: [{ id, city, x, y }] already de-overlapped. pinK is the disc radius as a
// fraction of the frame width. Returns { [id]: cornerIndex }.
export function placeLabels(pins, WoverS, pinK) {
  const discR = pinK * WoverS;
  const hitsDisc = (bx, q) =>
    bx.x0 < q.x + discR && q.x - discR < bx.x1 && bx.y0 < q.y + discR && q.y - discR < bx.y1;
  const placed = [], corner = {};
  for (const p of pins) {
    let chosen = 0;
    for (let c = 0; c < CORNERS.length; c++) {
      const bx = labelBoxFor(p, c, WoverS);
      const clear = !placed.some((q) => boxesHit(bx, q)) &&
        !pins.some((q) => q.id !== p.id && hitsDisc(bx, q));
      if (clear) { chosen = c; break; }
    }
    corner[p.id] = chosen;
    placed.push(labelBoxFor(p, chosen, WoverS));
  }
  return corner;
}

// How many label pairs still collide for a given placement — the measure the
// sweep and the test both report.
export function labelClashes(pins, corner, WoverS) {
  const boxes = pins.map((p) => labelBoxFor(p, corner[p.id] ?? 0, WoverS));
  let n = 0;
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) if (boxesHit(boxes[i], boxes[j])) n++;
  return n;
}
