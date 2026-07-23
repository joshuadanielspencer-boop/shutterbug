// ===========================================================================
// refine-outlines.mjs — upgrade a country's outline from Natural Earth 10m.
//
// WHY
//
// src/data/worldmap.js was built from Natural Earth **1:110m**, the coarsest
// vector set. That is the right choice for the world map — it is small, and at
// world scale nobody can tell. It is the wrong source the moment a country gets
// its own zoomed map (rule 5), for two reasons:
//
//   - 110m DROPS small islands entirely. French Polynesia isn't in it at all,
//     which is why its "country map" was the whole Oceania view: with no outline
//     there is no box to zoom to.
//   - 110m simplifies hard. New Caledonia's whole outline was 375 characters —
//     a blob, not a coastline.
//
// The 10m set has French Polynesia as 88 separate islands and New Caledonia at
// 986 points. Both are public domain.
//
// WHAT THIS DOES
//
// Pulls named countries out of the 10m GeoJSON, projects them into the game's
// plate coordinates (x = lon + 180, y = 90 - lat), simplifies to a tolerance
// that keeps the shape while staying committable, and prints ready-to-paste
// entries for src/data/worldmap.js.
//
// It deliberately does NOT rewrite worldmap.js in place. That file is hand-
// maintained data (rule 1) and a script that silently rewrites 290 KB of it is
// how a bad run wipes the map.
//
// Usage:
//   node scripts/refine-outlines.mjs <ne_10m_admin_0_map_units.geojson> "French Polynesia" "New Caledonia"
//
// Source (public domain):
//   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_map_units.geojson
// ===========================================================================
import { readFileSync } from "node:fs";

// Perpendicular distance of p from the segment a-b, for Douglas–Peucker.
const segDist = (p, a, b) => {
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  return Math.hypot(p[0] - x, p[1] - y);
};

// Douglas–Peucker. Keeps the points that carry the SHAPE and drops the ones that
// only carry precision — which is exactly the trade a zoomed country map wants:
// a recognisable coastline, not a survey.
const simplify = (pts, tol) => {
  if (pts.length <= 2) return pts;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = segDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
};

const [srcPath, ...names] = process.argv.slice(2);
if (!srcPath || !names.length) {
  console.error('usage: node scripts/refine-outlines.mjs <ne_10m.geojson> "Country" ["Country2" ...]');
  process.exit(1);
}

const gj = JSON.parse(readFileSync(srcPath, "utf8"));

for (const name of names) {
  const f = gj.features.find((x) => {
    const p = x.properties;
    return [p.NAME, p.ADMIN, p.NAME_LONG, p.GEOUNIT].includes(name);
  });
  if (!f) { console.error(`  ${name}: NOT FOUND in the source`); continue; }

  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;

  // Rings smaller than this are dropped. An 88-island archipelago carries a lot
  // of specks that render as a single pixel and cost bytes; the tolerance is in
  // square degrees, so it scales sensibly rather than by point count.
  const MIN_AREA = 2e-5;
  const TOL = 0.01;          // ~1.1 km — finer than the plate can show anyway

  const ringArea = (r) => {
    let a = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
    return Math.abs(a / 2);
  };

  const subpaths = [];
  let kept = 0, dropped = 0;
  for (const poly of polys) {
    // [0] is the outer ring; the rest are holes, which this format can express
    // via fill-rule="evenodd" — worldmap paths already rely on that.
    for (const ring of poly) {
      if (ringArea(ring) < MIN_AREA) { dropped++; continue; }
      kept++;
      const pts = simplify(ring.map(([lon, lat]) => [lon + 180, 90 - lat]), TOL);
      if (pts.length < 3) continue;
      subpaths.push("M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L"));
    }
  }

  const d = subpaths.join("");
  const xs = d.match(/-?\d+(?:\.\d+)?/g).filter((_, i) => i % 2 === 0).map(Number);
  const ys = d.match(/-?\d+(?:\.\d+)?/g).filter((_, i) => i % 2 === 1).map(Number);
  console.error(`  ${name}: ${kept} rings kept, ${dropped} specks dropped, ${d.length} chars, ` +
    `x ${Math.min(...xs).toFixed(1)}..${Math.max(...xs).toFixed(1)}  y ${Math.min(...ys).toFixed(1)}..${Math.max(...ys).toFixed(1)}`);
  console.log(`  { name: ${JSON.stringify(name)}, d: ${JSON.stringify(d)} },`);
}
