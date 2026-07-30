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
import { readdir, stat, rename, open, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Two policies, because the art is two different things.
//
// PALETTE_DIRS are small flat emblems drawn at 22–62 px. Same pixels, 256
// colours, still a PNG.
//
// RESIZE_DIRS are big character illustrations. Quantising those is treating a
// symptom: `dog-outfits` arrived as 108 plates of 1254×1254 truecolour PNG at
// ~2.7 MB each — 305 MB, precached in full onto every install — for a dog who is
// drawn at 390 px at her very largest and 87 px in the wardrobe. It was missed
// because this list is what the optimizer walks, and nobody added the new folder
// to it, so the batch shipped untouched and no build step complained. The value
// is the biggest size it is ever DRAWN, doubled for retina; webp because these
// are illustrations with alpha and a palette would band the shading.
//
// `test/precache-size.test.js` is the thing that will actually catch the next
// one — a list you must remember to update is not a guard.
const PALETTE_DIRS = ["badges", "modes", "themes", "difficulty", "ranks", "medals", "roundels", "transport", "hello", "dog"];
const RESIZE_DIRS = { "dog-outfits": 800 };
const ART_DIRS = [...PALETTE_DIRS, ...Object.keys(RESIZE_DIRS)];
const COLORS = 256;
const WEBP_QUALITY = 88;

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

  // Big character art: shrink to the size it is actually drawn at and re-encode
  // as webp, replacing the PNG. Idempotent for free — once converted there are
  // no PNGs left here, so a re-run after dropping in ONE new plate touches only
  // that plate.
  if (RESIZE_DIRS[dir]) {
    const edge = RESIZE_DIRS[dir];
    for (const name of files) {
      const src = join(abs, name);
      const size = (await stat(src)).size;
      const dest = join(abs, name.replace(/\.png$/, ".webp"));
      await sharp(src)
        .resize(edge, edge, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(dest);
      const out = (await stat(dest)).size;
      await unlink(src);
      console.log(`  ✓ ${name.padEnd(46)} ${kb(size).padStart(8)} → ${kb(out).padStart(8)} webp @${edge}px  (${Math.round((100 * out) / size)}%)`);
      before += size; after += out; done++;
    }
    continue;
  }

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
