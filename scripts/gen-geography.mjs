// ===========================================================================
// gen-geography.mjs — build src/data/geography.js (the water-features layer).
//
// SOURCE (public domain — "no permission needed", naturalearthdata.com/about/terms-of-use):
//   Natural Earth 10m physical vectors, via the official nvkelso/natural-earth-vector
//   repository's GeoJSON builds:
//     ne_10m_rivers_lake_centerlines.geojson
//     ne_10m_lakes.geojson
//     ne_10m_geography_marine_polys.geojson
//
// Every shape and every label position in the generated file therefore comes from
// Natural Earth — nothing is hand-placed or eyeballed (project rule 2). What IS
// editorial here is only: (a) WHICH features we teach, and (b) the display name,
// where Natural Earth's `name` isn't the usual English one (it calls the Yellow
// River "Huang" and the Amazon "Amazonas"). Those renames are listed explicitly
// below so they can be re-checked.
//
// Run:  node scripts/gen-geography.mjs
// ===========================================================================
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";

const CACHE = new URL("./.cache/", import.meta.url);
const RAW = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const SETS = { rivers: "ne_10m_rivers_lake_centerlines", lakes: "ne_10m_lakes", marine: "ne_10m_geography_marine_polys" };
const SOURCE = (set) => `Natural Earth 10m (${SETS[set]}), public domain`;

// ---------------------------------------------------------------------------
// The curated syllabus. `ne` is the EXACT Natural Earth `name` to pull geometry
// from (a river is stored as several segments sharing one name — they're merged).
// `as` overrides the display name where Natural Earth's differs from standard
// English usage. `tier` is purely editorial — how far you must zoom in to see it:
//   1 = labelled on the world map too   2 = continent zooms   3 = country zooms only
// ---------------------------------------------------------------------------
// `ne` may be a LIST of names: Natural Earth stores a long river under its local
// names, so the Nile above Khartoum is "El Bahr el Abyad" and the upper Yangtze is
// "Chang Jiang"/"Jinsha". Matching only the English name gave a Nile that stopped
// in Sudan and a Yangtze that started halfway to the sea — true-looking, and wrong.
// `near` [lonMin, lonMax, latMin, latMax] disambiguates a name used twice on Earth:
// there is a Colorado in Argentina as well as in the USA, and it is the longer one.
const RIVERS = [
  // Africa
  { ne: ["Nile", "El Bahr el Abyad", "Bahr el Jebel", "Albert Nile"], as: "Nile", tier: 1 },
  { ne: "El Bahr el Azraq", as: "Blue Nile", tier: 3 },
  { ne: "Congo", tier: 2 }, { ne: "Niger", tier: 2 },
  { ne: "Zambezi", tier: 2 }, { ne: "Orange", tier: 3 }, { ne: "Limpopo", tier: 3 },
  // Asia
  { ne: ["Yangtze", "Chang Jiang", "Jinsha", "Tongtian", "Tuotuo"], as: "Yangtze", tier: 1 },
  { ne: "Huang", as: "Yellow River", tier: 2 },
  { ne: ["Mekong", "Lancang"], as: "Mekong", tier: 2 },
  { ne: "Ganges", tier: 2 }, { ne: "Brahmaputra", tier: 3 },
  { ne: "Indus", tier: 2 }, { ne: "Ob", tier: 3 }, { ne: "Yenisey", tier: 3 },
  { ne: "Lena", tier: 3 }, { ne: "Amur", tier: 3 },
  { ne: "Euphrates", tier: 3 }, { ne: "Tigris", tier: 3 },
  // Europe
  { ne: ["Danube", "Donau"], as: "Danube", tier: 1 },
  { ne: "Volga", tier: 2 }, { ne: "Rhine", tier: 2 },
  { ne: "Loire", tier: 3 }, { ne: "Seine", tier: 3 }, { ne: "Elbe", tier: 3 },
  { ne: "Vistula", tier: 3 }, { ne: "Dnipro", as: "Dnieper", tier: 3 },
  { ne: "Thames", tier: 3 }, { ne: "Po", tier: 3 }, { ne: "Ural", tier: 3 },
  // North America
  { ne: "Mississippi", tier: 1 }, { ne: "Missouri", tier: 2 },
  { ne: "Colorado", tier: 2, near: [-115, -105, 31, 41] },   // the Grand Canyon one
  { ne: "Rio Grande", tier: 2 }, { ne: "Yukon", tier: 3 }, { ne: "Mackenzie", tier: 3 },
  // South America
  { ne: "Amazonas", as: "Amazon", tier: 1 }, { ne: "Paraná", tier: 2 },
  { ne: "Orinoco", tier: 3 }, { ne: "São  Francisco", as: "São Francisco", tier: 3 },
  // Oceania
  { ne: "Murray", tier: 2 }, { ne: "Darling", tier: 3 },
];

const LAKES = [
  // North America — the Great Lakes
  { ne: "Lake Superior", tier: 1 }, { ne: "Lake Michigan", tier: 1 }, { ne: "Lake Huron", tier: 1 },
  { ne: "Lake Erie", tier: 2 }, { ne: "Lake Ontario", tier: 2 },
  { ne: "Great Bear Lake", tier: 2 }, { ne: "Great Slave Lake", tier: 3 },
  { ne: "Lake Winnipeg", tier: 3 }, { ne: "Great Salt Lake", tier: 3 },
  { ne: "Lago de Nicaragua", as: "Lake Nicaragua", tier: 3 },
  // South America
  { ne: "Lago Titicaca", as: "Lake Titicaca", tier: 2 },
  // Africa
  { ne: "Lake Victoria", tier: 1 }, { ne: "Lake Tanganyika", tier: 2 }, { ne: "Lake Malawi", tier: 2 },
  { ne: "Lake Chad", tier: 2 }, { ne: "Lake Turkana", tier: 3 }, { ne: "Lake Albert", tier: 3 },
  { ne: "Lake Kivu", tier: 3 }, { ne: "Lake Volta", tier: 3 }, { ne: "Lake Kariba", tier: 3 },
  { ne: "Lake Nasser", tier: 3 }, { ne: "Lake Tana", tier: 3 },
  // Europe
  { ne: "Lake Ladoga", tier: 2 }, { ne: "Lake Onega", tier: 3 }, { ne: "Lake Geneva", tier: 3 },
  // Asia
  { ne: "Lake Baikal", tier: 1 }, { ne: "Lake Balkhash", tier: 3 }, { ne: "Issyk-Kul", tier: 3 },
  { ne: "Qinghai Hu", as: "Qinghai Lake", tier: 3 }, { ne: "Lake Urmia", tier: 3 },
  { ne: "Lake Van", tier: 3 }, { ne: "Dead Sea", tier: 2 },
  { ne: "North Aral Sea", tier: 3 }, { ne: "South Aral Sea", tier: 3 },
  // Oceania
  { ne: "Lake Eyre North", as: "Lake Eyre", tier: 2 },
];

// Marine features are LABELS only — the relief plate already draws the water, so
// re-drawing the polygons would just muddy it. Natural Earth's `featurecla` gives
// the kind (ocean / sea / bay / gulf), which is what the game colour-codes on.
const MARINE = [
  // Oceans — Natural Earth splits the Atlantic and Pacific into north and south
  // halves, which is genuinely how they're named on an atlas, so we keep them.
  { ne: "Arctic Ocean", tier: 1 }, { ne: "SOUTHERN OCEAN", as: "Southern Ocean", tier: 1 },
  { ne: "INDIAN OCEAN", as: "Indian Ocean", tier: 1 },
  { ne: "North Atlantic Ocean", tier: 1 }, { ne: "South Atlantic Ocean", tier: 1 },
  { ne: "North Pacific Ocean", tier: 1 }, { ne: "South Pacific Ocean", tier: 1 },
  // Seas
  { ne: "Mediterranean Sea", tier: 1 }, { ne: "Caribbean Sea", tier: 1 },
  { ne: "Caspian Sea", tier: 1 }, { ne: "Black Sea", tier: 2 }, { ne: "Red Sea", tier: 2 },
  { ne: "South China Sea", tier: 2 }, { ne: "Arabian Sea", tier: 2 }, { ne: "Coral Sea", tier: 2 },
  { ne: "Bering Sea", tier: 2 }, { ne: "North Sea", tier: 2 }, { ne: "Baltic Sea", tier: 2 },
  { ne: "Tasman Sea", tier: 2 }, { ne: "Philippine Sea", tier: 3 },
  { ne: "Labrador Sea", tier: 3 }, { ne: "Beaufort Sea", tier: 3 },
  // Bays
  { ne: "Hudson Bay", tier: 1 }, { ne: "Baffin Bay", tier: 2 }, { ne: "Bay of Bengal", tier: 1 },
  { ne: "Bay of Biscay", tier: 3 }, { ne: "James Bay", tier: 3 },
  // Gulfs
  { ne: "Gulf of Mexico", tier: 1 }, { ne: "Persian Gulf", tier: 2 }, { ne: "Gulf of Alaska", tier: 3 },
  { ne: "Gulf of Guinea", tier: 2 }, { ne: "Gulf of Aden", tier: 3 },
  { ne: "Gulf of Carpentaria", tier: 3 }, { ne: "Great Australian Bight", tier: 2 },
  { ne: "Gulf of Thailand", tier: 3 },
];

// ---------------------------------------------------------------------------
// geometry helpers
// ---------------------------------------------------------------------------
// Game map coords: x = lon + 180 (0..360), y = 90 − lat (0..180). Same space the
// relief plate and the city pins already live in.
const toXY = ([lon, lat]) => [lon + 180, 90 - lat];

// Ramer–Douglas–Peucker. Keeps the shape, drops the points the eye can't see.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const sqTol = tol * tol;
  const sqSegDist = (p, a, b) => {
    let [x, y] = a; let dx = b[0] - x, dy = b[1] - y;
    if (dx || dy) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x; dy = p[1] - y;
    return dx * dx + dy * dy;
  };
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    let far = 0, idx = -1;
    for (let i = lo + 1; i < hi; i++) {
      const d = sqSegDist(pts[i], pts[lo], pts[hi]);
      if (d > far) { far = d; idx = i; }
    }
    if (far > sqTol && idx > 0) { keep[idx] = true; stack.push([lo, idx], [idx, hi]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const R = (n) => Math.round(n * 1000) / 1000;         // 0.001° ≈ 110 m — sub-pixel at every zoom
const lineD = (pts) => "M" + pts.map(([x, y]) => `${R(x)} ${R(y)}`).join("L");
const ringD = (pts) => lineD(pts) + "Z";
// Bounding box [x0, y0, x1, y1] — lets the map skip every feature that isn't on
// screen, so a tight country zoom doesn't hand the browser 40 rivers to clip.
const bbox = (lines) => {
  const all = lines.flat();
  return [Math.min(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])),
    Math.max(...all.map((p) => p[0])), Math.max(...all.map((p) => p[1]))].map(R);
};
const len2 = (pts) => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);

// Rings of a Polygon/MultiPolygon, as XY, outer rings only (holes are islands in
// a lake — visually negligible at our zooms, and dropping them halves the data).
const outerRings = (geom) => (geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates)
  .map((poly) => poly[0].map(toXY));

const ringArea = (r) => Math.abs(r.reduce((s, p, i) => {
  const q = r[(i + 1) % r.length];
  return s + (p[0] * q[1] - q[0] * p[1]);
}, 0) / 2);

// Pole of inaccessibility — the point FURTHEST from any edge, i.e. the middle of
// the widest part of the shape. A plain centroid would put "Mediterranean Sea"
// on Italy and "Hudson Bay" on its own shoreline; this can't, because it only
// ever returns a point strictly inside the polygon.
function poleOfInaccessibility(ring) {
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const inside = (x, y) => {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  const edgeDist = (x, y) => {
    let best = Infinity;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      let dx = xj - xi, dy = yj - yi;
      let t = (dx || dy) ? ((x - xi) * dx + (y - yi) * dy) / (dx * dx + dy * dy) : 0;
      t = Math.max(0, Math.min(1, t));
      best = Math.min(best, Math.hypot(x - (xi + dx * t), y - (yi + dy * t)));
    }
    return best;
  };
  // Coarse grid, then refine around the winner — plenty for label placement.
  let best = null, bestD = -1;
  for (let pass = 0, x0 = minX, x1 = maxX, y0 = minY, y1 = maxY; pass < 3; pass++) {
    const N = 24;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      const x = x0 + ((x1 - x0) * i) / N, y = y0 + ((y1 - y0) * j) / N;
      if (!inside(x, y)) continue;
      const d = edgeDist(x, y);
      if (d > bestD) { bestD = d; best = [x, y]; }
    }
    if (!best) break;
    const rx = (x1 - x0) / N, ry = (y1 - y0) / N;
    x0 = best[0] - rx; x1 = best[0] + rx; y0 = best[1] - ry; y1 = best[1] + ry;
  }
  return best || [(minX + maxX) / 2, (minY + maxY) / 2];
}

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------------------------------------------------------------------------
async function load(set) {
  mkdirSync(CACHE, { recursive: true });
  const file = new URL(`${SETS[set]}.geojson`, CACHE);
  if (!existsSync(file)) {
    process.stdout.write(`  fetching ${SETS[set]}…\n`);
    const res = await fetch(`${RAW}/${SETS[set]}.geojson`);
    if (!res.ok) throw new Error(`${SETS[set]}: HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

const missing = [];
// Every coordinate of a feature, for the `near` region test.
const coordsOf = (g) => (g.type === "LineString" || g.type === "Polygon" ? [g.coordinates].flat(g.type === "Polygon" ? 1 : 0)
  : g.coordinates.flat(g.type === "MultiPolygon" ? 2 : 1));
const pick = (features, ne, near) => {
  const names = Array.isArray(ne) ? ne : [ne];
  let hits = features.filter((f) => names.includes(f.properties.name));
  for (const n of names) if (!hits.some((f) => f.properties.name === n)) missing.push(n);
  if (near) hits = hits.filter((f) => coordsOf(f.geometry)
    .some(([lon, lat]) => lon >= near[0] && lon <= near[1] && lat >= near[2] && lat <= near[3]));
  return hits;
};

// A NAME IS NOT A RIVER. Natural Earth stores each river as several segments that
// share a name — but unrelated rivers on opposite sides of the planet share names
// too (there's a Mackenzie in Canada AND in Queensland; a Colorado in the USA AND
// in Argentina). Merging every same-named segment drew a "Mackenzie" across the
// Mediterranean. So: keep the longest segment, then keep only the segments that
// actually connect to it — a river is continuous, so anything sitting degrees away
// is a different river with the same name, and gets dropped.
const dropped = [];
const JOIN = 3;                                   // degrees — a generous "touches"
function oneRiver(lines, name) {
  if (lines.length < 2) return lines;
  const bb = (l) => [Math.min(...l.map((p) => p[0])), Math.min(...l.map((p) => p[1])),
    Math.max(...l.map((p) => p[0])), Math.max(...l.map((p) => p[1]))];
  const gap = (a, b) => Math.hypot(Math.max(0, Math.max(a[0] - b[2], b[0] - a[2])),
    Math.max(0, Math.max(a[1] - b[3], b[1] - a[3])));
  const boxes = lines.map(bb);
  const keep = new Set([0]);                      // lines[] is already longest-first
  for (let grew = true; grew;) {
    grew = false;
    for (let i = 0; i < lines.length; i++) {
      if (keep.has(i)) continue;
      if ([...keep].some((k) => gap(boxes[i], boxes[k]) <= JOIN)) { keep.add(i); grew = true; }
    }
  }
  if (keep.size < lines.length) dropped.push(`${name}: dropped ${lines.length - keep.size} of ${lines.length} segment(s) — a same-named river elsewhere`);
  return lines.filter((_, i) => keep.has(i));
}

const [riversGJ, lakesGJ, marineGJ] = await Promise.all([load("rivers"), load("lakes"), load("marine")]);

// --- rivers: merge every segment sharing the name, keep each as its own stroke
const rivers = RIVERS.map(({ ne, as, tier, near }) => {
  const hits = pick(riversGJ.features, ne, near);
  if (!hits.length) return null;
  const shownAs = as || (Array.isArray(ne) ? ne[0] : ne);
  let lines = [];
  for (const f of hits)
    for (const line of (f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates))
      lines.push(simplify(line.map(toXY), 0.02));
  lines.sort((a, b) => len2(b) - len2(a));
  lines = oneRiver(lines, shownAs);
  const main = lines[0];
  const mid = main[Math.floor(main.length * 0.55)];   // label sits on the river itself
  return { id: slug(shownAs), name: shownAs, kind: "river", tier,
    d: lines.map(lineD).join(" "), b: bbox(lines), lx: R(mid[0]), ly: R(mid[1]), source: SOURCE("rivers") };
}).filter(Boolean);

// --- lakes: filled shapes (the relief raster has NO lakes at all, so these are
//     the only thing putting Baikal, Victoria and the Great Lakes back on the map)
const lakes = LAKES.map(({ ne, as, tier }) => {
  const hits = pick(lakesGJ.features, ne);
  if (!hits.length) return null;
  let rings = hits.flatMap((f) => outerRings(f.geometry)).map((r) => simplify(r, 0.01));
  rings.sort((a, b) => ringArea(b) - ringArea(a));
  rings = oneRiver(rings, as || ne);   // same guard: a lake's parts must be one lake
  const [lx, ly] = poleOfInaccessibility(rings[0]);
  return { id: slug(as || ne), name: as || ne, kind: "lake", tier,
    d: rings.map(ringD).join(" "), b: bbox(rings), lx: R(lx), ly: R(ly), source: SOURCE("lakes") };
}).filter(Boolean);

// --- marine: label position only, from the polygon's pole of inaccessibility, so
//     an ocean's name always lands in open water rather than on a coastline.
const marine = MARINE.map(({ ne, as, tier }) => {
  const hits = pick(marineGJ.features, ne);
  if (!hits.length) return null;
  const rings = hits.flatMap((f) => outerRings(f.geometry));
  rings.sort((a, b) => ringArea(b) - ringArea(a));
  const [lx, ly] = poleOfInaccessibility(simplify(rings[0], 0.05));
  const kind = hits[0].properties.featurecla;          // ocean | sea | bay | gulf
  return { id: slug(as || ne), name: as || ne, kind, tier, lx: R(lx), ly: R(ly), source: SOURCE("marine") };
}).filter(Boolean);

if (missing.length) {
  console.error(`\n✗ ${missing.length} curated name(s) not found in Natural Earth — fix the spelling:\n   ${missing.join("\n   ")}\n`);
  process.exit(1);
}

const fmt = (f) => "  " + JSON.stringify(f) + ",";
const out = `// ===========================================================================
// WATER FEATURES — rivers, lakes, seas, oceans, bays and gulfs.
//
// GENERATED FILE — do not edit by hand.
//   Regenerate with:  node scripts/gen-geography.mjs
//   Curate WHICH features appear (and their display names) in that script.
//
// Source: Natural Earth 10m physical vectors (public domain — no permission
// needed, no attribution required: https://www.naturalearthdata.com/about/terms-of-use/).
// Every outline and every label position below is derived from that data, not
// hand-placed, which is what project rule 2 asks for. Label points are each
// polygon's "pole of inaccessibility" — the point furthest from any shore — so a
// sea's name always sits in open water.
//
// Coordinates are the game's map space: x = lon + 180, y = 90 − lat. That's the
// same space as the relief plates and the city pins, so these line up exactly.
// \`tier\` is how far you must zoom in before a feature is drawn:
//   1 = world map and every zoom   2 = continent zooms   3 = country zooms only
// ===========================================================================

// Rivers — \`d\` is one or more polylines (a river arrives as several segments).
export const RIVERS = [
${rivers.map(fmt).join("\n")}
];

// Lakes — \`d\` is a filled outline. Natural Earth's relief RASTER does not paint
// lakes, so these vectors are what put them on the map (and they stay crisp at
// any zoom, which a baked-in raster lake would not).
export const LAKES = [
${lakes.map(fmt).join("\n")}
];

// Seas, oceans, bays and gulfs — labels only. The relief plate already draws the
// water; re-drawing the polygons on top of it would only muddy the map.
export const MARINE = [
${marine.map(fmt).join("\n")}
];

export const WATER_FEATURES = [...RIVERS, ...LAKES, ...MARINE];

// How each kind is introduced to the player ("the Nile is a river").
export const WATER_KINDS = {
  river: { label: "River", article: "a river" },
  lake:  { label: "Lake",  article: "a lake" },
  ocean: { label: "Ocean", article: "an ocean" },
  sea:   { label: "Sea",   article: "a sea" },
  bay:   { label: "Bay",   article: "a bay" },
  gulf:  { label: "Gulf",  article: "a gulf" },
};
`;

writeFileSync(new URL("../src/data/geography.js", import.meta.url), out);
const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} KB`;
if (dropped.length) {
  console.log("\n  same-name collisions resolved (kept the segments that connect):");
  for (const d of dropped) console.log(`   · ${d}`);
}
console.log(`\n✓ src/data/geography.js  ${kb(out)}`);
console.log(`  ${rivers.length} rivers · ${lakes.length} lakes · ${marine.length} marine features`);
const kinds = {};
for (const m of marine) kinds[m.kind] = (kinds[m.kind] || 0) + 1;
console.log(`  marine kinds: ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(", ")}`);
