// Shrink the illustrated UI art (badges, mode icons, theme crests, difficulty
// emblems) to a 256-colour palette PNG, in place. Run after dropping a new batch
// of art into public/assets/shutterbug-ui/:
//
//   node scripts/optimize-ui-art.mjs                 # the art subfolders
//   node scripts/optimize-ui-art.mjs badges themes   # just those
//
// Why: the generated art arrives as full RGBA truecolour at ~400 KB each, but
// it's flat illustration — few distinct colours, no photographic gradients — and
// it renders at 22–62 px. A 256-colour palette is visually indistinguishable at
// both full size and display size while costing ~20% of the bytes. That matters
// here specifically because the PWA precaches every PNG (see the `globPatterns`
// in vite.config.js), so each megabyte lands on the iPad at install time.
//
// Idempotent: PNGs already stored as a palette are skipped, so re-running after
// adding one new file won't re-quantize (and slowly degrade) the existing set.
// Do NOT point this at photographic assets — palette banding shows on gradients.
// The pristine originals stay in the delivery folder outside the repo.
import sharp from "sharp";
import { readdir, stat, rename, open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ART_DIRS = ["badges", "modes", "themes", "difficulty", "ranks", "medals", "roundels", "transport"];
const COLORS = 256;

// True if the PNG is already stored as a palette. Read from the file header
// rather than sharp's metadata: sharp decodes a palette PNG to RGBA and reports
// `palette: undefined`, so asking it would re-quantize an already-done file on
// every run. The header never lies — byte 25 is the IHDR colour type (3 =
// palette), at a fixed offset because IHDR must be the first chunk.
async function isPalettePng(path) {
  const fh = await open(path, "r");
  try {
    const { buffer } = await fh.read(Buffer.alloc(26), 0, 26, 0);
    return buffer.readUInt8(25) === 3;
  } finally {
    await fh.close();
  }
}

const root = fileURLToPath(new URL("../public/assets/shutterbug-ui/", import.meta.url));
const dirs = process.argv.slice(2).length ? process.argv.slice(2) : ART_DIRS;

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
let before = 0, after = 0, done = 0, skipped = 0;

for (const dir of dirs) {
  const abs = join(root, dir);
  let files;
  try {
    files = (await readdir(abs)).filter((f) => f.endsWith(".png")).sort();
  } catch {
    console.error(`  ! no such art folder: ${dir}`);
    continue;
  }
  console.log(`\n${dir}/`);
  for (const name of files) {
    const src = join(abs, name);
    const size = (await stat(src)).size;

    if (await isPalettePng(src)) {
      console.log(`  · ${name.padEnd(38)} ${kb(size).padStart(8)}  already a palette, skipped`);
      before += size; after += size; skipped++;
      continue;
    }

    // sharp can't write over the file it's reading — stage next to it, then swap.
    const tmp = `${src}.tmp`;
    await sharp(src).png({ palette: true, colors: COLORS, effort: 10 }).toFile(tmp);
    const out = (await stat(tmp)).size;
    await rename(tmp, src);

    console.log(`  ✓ ${name.padEnd(38)} ${kb(size).padStart(8)} → ${kb(out).padStart(8)}  (${Math.round((100 * out) / size)}%)`);
    before += size; after += out; done++;
  }
}

console.log(`\n${done} optimized, ${skipped} skipped — ${kb(before)} → ${kb(after)} (${Math.round((100 * after) / before)}%)`);
