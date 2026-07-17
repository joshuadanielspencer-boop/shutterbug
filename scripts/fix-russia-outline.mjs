// One-shot repair for Russia's outline in src/data/worldmap.js.
//
// The bug: Russia's far-eastern coast (Kamchatka / Chukotka, which straddles the
// 180° antimeridian) was stored as rings that AREN'T cut at the antimeridian, so
// each fills with a long diagonal "closing" edge — a red slash across the Bering
// Sea on the Asia zoom, and an X on the recentred Robinson world map. It is a
// data bug, present in both projections; not the projection itself.
//
// The fix: re-read Russia straight from the Natural Earth 110m Admin-0 vector (the
// same public-domain source the rest of worldmap.js came from) and rebuild its
// path with the antimeridian handled the way Fiji already is here — any ring that
// crosses 180° is SPLIT into an eastern piece and a western piece, each closed
// along the seam. Everything else about the map is left exactly as it was; only
// Russia's `d` string changes.
//
//   node scripts/fix-russia-outline.mjs --check   # render before/after, write nothing
//   node scripts/fix-russia-outline.mjs           # rewrite worldmap.js Russia, then
//                                                  # run reproject-robinson.mjs yourself
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHP = join(HERE, ".cache/ne_110m_admin_0/ne_110m_admin_0_countries.shp");
const DBF = join(HERE, ".cache/ne_110m_admin_0/ne_110m_admin_0_countries.dbf");

// ---- minimal shapefile reader (polygon shapes only, the one type NE uses) ----
// Format: 100-byte header, then records. Each record = 8-byte big-endian header
// (number, content length in 16-bit words) then a little-endian shape body. For a
// Polygon (type 5): bbox[4 double], numParts[int], numPoints[int], parts[int*],
// points[ (x,y) double* ]. Parts index the start of each ring in the point list.
function readPolygons(buf) {
  const shapes = [];
  let off = 100;
  while (off < buf.length) {
    const contentLen = buf.readInt32BE(off + 4) * 2; // words → bytes
    let p = off + 8;
    const type = buf.readInt32LE(p); p += 4;
    if (type === 5) {
      p += 32; // skip bbox
      const numParts = buf.readInt32LE(p); p += 4;
      const numPoints = buf.readInt32LE(p); p += 4;
      const parts = [];
      for (let i = 0; i < numParts; i++) { parts.push(buf.readInt32LE(p)); p += 4; }
      const pts = [];
      for (let i = 0; i < numPoints; i++) { pts.push([buf.readDoubleLE(p), buf.readDoubleLE(p + 8)]); p += 16; }
      const rings = [];
      for (let i = 0; i < numParts; i++) rings.push(pts.slice(parts[i], parts[i + 1] ?? numPoints));
      shapes.push(rings);
    } else {
      shapes.push(null); // non-polygon (none expected in this file)
    }
    off += 8 + contentLen;
  }
  return shapes;
}

// ---- minimal DBF reader: just enough to read one text column per record ----
function readDbfColumn(buf, wanted) {
  const numRecords = buf.readInt32LE(4);
  const headerSize = buf.readInt16LE(8);
  const recordSize = buf.readInt16LE(10);
  const fields = [];
  let p = 32, colStart = 1; // 1 = past the record's deletion-flag byte
  while (buf[p] !== 0x0d) {
    const name = buf.toString("ascii", p, p + 11).replace(/\0.*$/, "");
    const len = buf[p + 16];
    fields.push({ name, start: colStart, len });
    colStart += len; p += 32;
  }
  const f = fields.find((x) => x.name === wanted);
  if (!f) throw new Error(`DBF column ${wanted} not found; have: ${fields.map((x) => x.name).join(",")}`);
  const out = [];
  for (let i = 0; i < numRecords; i++) {
    const base = headerSize + i * recordSize + f.start;
    out.push(buf.toString("ascii", base, base + f.len).replace(/\0+$/, "").trim());
  }
  return out;
}

// ---- antimeridian-aware conversion to the game's map coords ----
// Game coords: x = lon + 180 (0..360), y = 90 - lat (0..180). A ring edge that
// jumps more than 180° of longitude is really crossing the seam the short way; we
// cut it there, closing each side along x=0 / x=360 — exactly what makes Fiji a
// clean two-piece shape instead of a band. Emits one or more game-space rings.
function splitRingAtSeam(ring) {
  const pieces = [];
  let cur = [];
  const gx = (lon) => lon + 180;
  const gy = (lat) => 90 - lat;
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    if (cur.length) {
      const [plon, plat] = ring[i - 1];
      if (Math.abs(lon - plon) > 180) {
        // Crossing the seam. Interpolate the latitude at ±180 and close both sides
        // along that edge, so neither piece has a diagonal leap.
        const goingEast = lon < plon;           // prev near +180, now near -180
        const edgePrev = goingEast ? 180 : -180;
        const edgeNow = goingEast ? -180 : 180;
        // fraction to the seam, measured the short way round
        const span = (edgeNow + (goingEast ? 360 : -360)) - plon; // signed lon delta prev→now the short way
        const t = (edgePrev - plon) / ((lon + (goingEast ? 360 : -360)) - plon);
        const latSeam = plat + (lat - plat) * t;
        cur.push([gx(edgePrev), gy(latSeam)]);
        pieces.push(cur);
        cur = [[gx(edgeNow), gy(latSeam)]];
      }
    }
    cur.push([gx(lon), gy(lat)]);
  }
  if (cur.length) pieces.push(cur);
  return pieces;
}

const r1 = (n) => Math.round(n * 10) / 10;
function ringsToPath(rings) {
  let d = "";
  for (const ring of rings) {
    for (const pieces0 of [splitRingAtSeam(ring)]) {
      for (const piece of pieces0) {
        if (piece.length < 3) continue;
        d += "M" + piece.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L");
      }
    }
  }
  return d;
}

// ---- run ----
const shpBuf = readFileSync(SHP);
const dbfBuf = readFileSync(DBF);
const names = readDbfColumn(dbfBuf, "ADMIN");
const polys = readPolygons(shpBuf);
const idx = names.findIndex((n) => n === "Russia");
if (idx < 0) throw new Error("Russia not found in DBF ADMIN column");
const russiaRings = polys[idx];
console.log(`Russia: ${russiaRings.length} rings, ${russiaRings.reduce((s, r) => s + r.length, 0)} points`);
const newD = ringsToPath(russiaRings);
console.log(`new path: ${newD.length} chars, ${(newD.match(/M/g) || []).length} subpaths`);

export { newD };
