// Regenerate src/data/worldmap-robinson.js from src/data/worldmap.js by
// re-projecting every country outline into the Robinson projection.
// Run from the repo root:  node scripts/reproject-robinson.mjs
import { WORLD_COUNTRIES } from "../src/data/worldmap.js";
import { eqToRobinson } from "../src/robinson.js";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/data/worldmap-robinson.js");
const r1 = (n) => Math.round(n * 10) / 10;

// Paths are pure M/L/Z polylines with "x y" pairs — reproject each vertex.
function reproj(d) {
  let out = "";
  const re = /([MLZ])([^MLZ]*)/g;
  let m;
  while ((m = re.exec(d))) {
    if (m[1] === "Z") { out += "Z"; continue; }
    const [x, y] = m[2].trim().split(/\s+/).map(Number);
    const p = eqToRobinson(x, y);
    out += `${m[1]}${r1(p.x)} ${r1(p.y)}`;
  }
  return out;
}

const rows = WORLD_COUNTRIES.map((c) => `  { name: ${JSON.stringify(c.name)}, d: ${JSON.stringify(reproj(c.d))} },`).join("\n");

writeFileSync(OUT, `// ===========================================================================
// WORLD MAP GEOMETRY — ROBINSON PROJECTION (auto-generated; do not hand-edit).
//
// Same country outlines as data/worldmap.js, re-projected into the Robinson
// projection via src/robinson.js, for the world (continent-selection) map only.
// Regenerate with:  node scripts/reproject-robinson.mjs
// Coordinate space: x ≈ 0..360, y ≈ 0..182.6 (see robinson.js).
// ===========================================================================

export const WORLD_COUNTRIES_ROBINSON = [
${rows}
];
`);
console.log("wrote", WORLD_COUNTRIES.length, "countries →", OUT);
