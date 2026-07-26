// Reproject Antarctica's coastline from the world map's equirectangular path
// (x = lon+180, y = 90−lat) to a SOUTH-POLAR azimuthal-equidistant view, so the
// end-quiz shape question can show the continent the way it really looks from above
// (a rounded landmass with the Antarctic Peninsula reaching out) instead of the
// horizontally-smeared band every flat world map draws it as.
//
// Output: prints an SVG path `d` to paste into src/data/worldmap.js as
// ANTARCTICA_POLAR. Run: node scripts/make-antarctica-polar.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/data/worldmap.js", import.meta.url), "utf8");
// Pull the { name: "Antarctica", d: "…" } entry's d string.
const m = src.match(/\{\s*name:\s*"Antarctica",\s*d:\s*"([^"]+)"\s*\}/);
if (!m) { console.error("Could not find the Antarctica path in worldmap.js"); process.exit(1); }
const d = m[1];

// Split into subpaths on M (each starts a ring); drop trailing Z markers. The data
// uses absolute M/L with space- or letter-separated coordinate pairs.
const rings = [];
for (const chunk of d.split("M")) {
  const s = chunk.trim().replace(/Z\s*$/i, "");
  if (!s) continue;
  // Coordinates are "x y" pairs separated by "L" or spaces. Normalise to a flat list.
  const nums = s.replace(/L/g, " ").trim().split(/\s+/).map(Number).filter((n) => !Number.isNaN(n));
  const pts = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  if (pts.length >= 3) rings.push(pts);
}

// Equirect → lon/lat → south-polar azimuthal equidistant.
//   lon = x − 180 (deg)   lat = 90 − y (deg)
//   colatitude from the south pole = lat + 90  (0 at the pole, grows toward the coast)
//   screen: centre + r·(sin θ, cos θ), θ = lon. Scale so the coast (~lat −60) fills.
const R = 100, CX = 0, CY = 0, SCALE = R / 32; // ~32° from pole to the outer coast
const project = ([x, y]) => {
  const lon = (x - 180) * Math.PI / 180;
  const lat = 90 - y;
  const r = (lat + 90) * SCALE;
  return [CX + r * Math.sin(lon), CY + r * Math.cos(lon)];
};

// Keep only substantial rings (the mainland + big shelves), drop tiny specks that
// would just be noise at quiz size. Round to 2dp to keep the string compact.
const round = (n) => Math.round(n * 100) / 100;
const ringArea = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  return Math.abs(a) / 2;
};
const projected = rings.map((r) => r.map(project));
const areas = projected.map(ringArea);
const maxArea = Math.max(...areas);
const kept = projected.filter((_, i) => areas[i] >= maxArea * 0.004);

const out = kept.map((pts) =>
  "M" + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L") + "Z"
).join("");

console.error(`rings: ${rings.length} total, ${kept.length} kept; length ${out.length}`);
console.log(out);
