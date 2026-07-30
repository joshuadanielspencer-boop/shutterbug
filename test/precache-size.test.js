// ===========================================================================
// What the PWA puts on the iPad at install time.
//
// `vite.config.js` precaches every image under public/ (see `globPatterns`), so
// every byte of art lands on the device the moment the game is installed —
// before the child has played anything. That is deliberate and it is why the
// game works on a plane. It also means a careless art batch is not "a big file
// in the repo", it is a download and a permanent storage claim on a tablet.
//
// This is not hypothetical. `dog-outfits` shipped as 108 plates of 1254x1254
// truecolour PNG, ~2.7 MB each — 305 MB, for a dog drawn at 390 px — and took
// the whole precache to 326 MB. Nothing failed. The build was green, the tests
// passed, the deploy succeeded, and the only symptom was the app restarting on
// the iPad, which reads like a dozen other things.
//
// scripts/optimize-ui-art.mjs has a per-folder list and the batch was missed
// because nobody added the new folder to it. A list you have to remember to
// update is not a guard; this is. It walks what is actually on disk, so a folder
// nobody has thought about is checked anyway.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));

// Everything vite.config.js's globPatterns will precache.
const PRECACHED = /\.(png|jpg|jpeg|webp|svg|ico|woff2|mp3)$/i;
// The per-country relief plates are runtime-cached, not precached (globIgnores).
const NOT_PRECACHED = ["relief"];

function walk(dir, base = "") {
  const out = [];
  for (const entry of readdirSync(join(PUBLIC, dir), { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!NOT_PRECACHED.includes(rel)) out.push(...walk(join(dir, entry.name), rel));
    } else if (PRECACHED.test(entry.name)) {
      out.push({ path: rel, kb: statSync(join(PUBLIC, dir, entry.name)).size / 1024 });
    }
  }
  return out;
}

const files = walk(".");

describe("what an install downloads", () => {
  // The relief plate is the one legitimately large file: a 12288px shaded-relief
  // world at ~5 MB, and it is the map, so it earns its size. Nothing else should
  // come close — this is UI art rendered between 22 and 390 px.
  const ALLOWED_BIG = ["relief-world-hyp2.jpg", "relief-antarctica.jpg"];
  // 1100 KB is not a target, it is a tripwire: it clears the heaviest thing on
  // disk today (a ~1 MB Mr O plate) and still catches a 2.7 MB dog plate by two
  // and a half times. The plates between 700 KB and this line — five of Mr O,
  // two paper textures, the splash — are all bigger than they need to be and are
  // the next thing to shrink; lowering this number is how that gets finished.
  const CAP_KB = 1100;

  it("no single piece of art is larger than the map itself", () => {
    const heavy = files
      .filter((f) => !ALLOWED_BIG.some((n) => f.path.endsWith(n)))
      .filter((f) => f.kb > CAP_KB)
      .sort((a, b) => b.kb - a.kb);
    expect(heavy.map((f) => `${f.path} — ${Math.round(f.kb)} KB`),
      `art over ${CAP_KB} KB gets precached onto every install. Shrink it to the size it is DRAWN at: node scripts/optimize-ui-art.mjs`)
      .toEqual([]);
  });

  // A total, as well as a per-file cap: a thousand small files are the same
  // download as one enormous one, and the per-file cap alone would have let the
  // dog batch through at 108 x 900 KB. Today's set is ~57 MB, so 70 leaves room
  // for a normal art delivery and still fails long before another 300 MB one.
  it("the whole precache stays within an install budget", () => {
    const totalMB = files.reduce((n, f) => n + f.kb, 0) / 1024;
    const biggest = [...files].sort((a, b) => b.kb - a.kb).slice(0, 5)
      .map((f) => `${f.path} ${Math.round(f.kb)} KB`);
    expect(totalMB,
      `the PWA precache is ${totalMB.toFixed(0)} MB and every byte lands on the iPad at install. Biggest: ${biggest.join(", ")}`)
      .toBeLessThan(70);
  });
});
