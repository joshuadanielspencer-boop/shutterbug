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
// The THIRD policy, and the one the other two should probably become.
//
// "." is the root of shutterbug-ui/ — the loose files: Mr O's ten portraits, the
// desk and paper textures, the open-book plates, the camera bag. It was in
// neither list above, and the cost of that was visible: SIX of Mr O's ten plates
// are stored as palette PNGs and FOUR are truecolour at ~1 MB each. Nobody chose
// that. Somebody quantized the folder by hand, missed four, and there was no run
// to repeat and nothing to notice.
//
// The root can't just be added to PALETTE_DIRS, because it also holds the paper
// and wood textures, which are exactly the gradient-heavy art the header above
// says not to quantize. So this policy does not decide from a list at all: it
// quantizes, MEASURES the result against the original, and keeps it only if the
// difference is invisible. A file it would damage is reported and left alone.
//
// That is the same move `test/precache-size.test.js` made — judge what is
// actually there rather than trusting a list somebody has to maintain — and it
// means a new loose file is handled correctly the first time without anyone
// deciding which bucket it belongs in.
const PALETTE_DIRS = ["badges", "modes", "themes", "difficulty", "ranks", "medals", "roundels", "transport", "hello", "dog"];
const RESIZE_DIRS = { "dog-outfits": 800 };
const MEASURED_DIRS = ["."];
const ART_DIRS = [...PALETTE_DIRS, ...Object.keys(RESIZE_DIRS), ...MEASURED_DIRS];
const COLORS = 256;
const WEBP_QUALITY = 88;
// Mean absolute per-channel difference, 0-255, of the FLATTENED copies (see
// compare()), below which the quantized version is treated as the same picture.
// The dog resize (2026-07-30) measured 0.94 at the size she is actually drawn and
// was accepted by eye, so this is in the same territory as a change that has
// already shipped and been looked at. The max is printed alongside because a low
// mean can still hide banding concentrated in one gradient — that is the failure
// this is guarding against, and it is the number to look at before trusting a
// pass on any art with a big smooth area.
const SAME_PICTURE = 1.5;
// Below this there is nothing worth the risk — the whole root folder's small
// files together are a rounding error next to one Mr O plate.
const MEASURE_FLOOR_KB = 300;

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

// The paper the UI is painted on. Both copies are flattened onto it before they
// are compared, and that is the whole trick — see compare().
const PAPER = { r: 244, g: 236, b: 216 };

// How far the quantized copy moved from the original, MEASURED THE WAY IT IS
// SEEN: flattened onto the background it is drawn against, so every pixel's
// contribution is weighted by its own opacity, for free.
//
// Comparing the raw RGBA buffers instead does not work on art with alpha, and it
// fails in the direction that costs you. Mr O's four truecolour plates came back
// at 1.55-1.86 mean with a max near 200, comfortably "damaged" — and they are
// not. The number was almost entirely the anti-aliased fringe, where alpha is
// near zero and RGB is therefore very nearly meaningless: a quantizer may put
// anything it likes in a pixel nobody can see, and a naive comparison counts
// that as a catastrophe. Flattened first, the same four plates measure 0.42-0.51
// mean with a max in the 60s, and at the size Mr O is actually drawn (630 px
// tall) it is 0.29-0.35. The threshold below is calibrated for the flattened
// figure, so changing this function means recalibrating it.
async function compare(a, b) {
  const meta = await sharp(a).metadata();
  const flat = async (path) => {
    // sharp applies resize before composite regardless of call order, so this
    // stays a separate pipeline from anything that scales.
    const onPaper = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: PAPER } })
      .composite([{ input: path }]).png().toBuffer();
    return sharp(onPaper).raw().toBuffer();
  };
  const [x, y] = await Promise.all([flat(a), flat(b)]);
  if (x.length !== y.length) throw new Error(`size mismatch comparing ${a}`);
  let sum = 0, max = 0;
  for (let i = 0; i < x.length; i++) {
    const d = Math.abs(x[i] - y[i]);
    sum += d;
    if (d > max) max = d;
  }
  return { mean: sum / x.length, max };
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
  // Quantize, compare, keep only if the picture did not change. See MEASURED_DIRS.
  if (MEASURED_DIRS.includes(dir)) {
    for (const name of files) {
      const src = join(abs, name);
      const size = (await stat(src)).size;
      if (size < MEASURE_FLOOR_KB * 1024) { before += size; after += size; skipped++; continue; }
      if (await isPalettePng(src)) {
        console.log(`  · ${name.padEnd(38)} ${kb(size).padStart(8)}  already a palette, skipped`);
        before += size; after += size; skipped++;
        continue;
      }
      const tmp = `${src}.tmp`;
      await sharp(src).png({ palette: true, colors: COLORS, effort: 10 }).toFile(tmp);
      const { mean, max } = await compare(src, tmp);
      const out = (await stat(tmp)).size;
      if (mean > SAME_PICTURE) {
        await unlink(tmp);
        console.log(`  ✗ ${name.padEnd(38)} ${kb(size).padStart(8)}  LEFT ALONE — quantizing shifts it by ${mean.toFixed(2)} (max ${max}); would have been ${kb(out)}`);
        before += size; after += size; skipped++;
        continue;
      }
      await rename(tmp, src);
      console.log(`  ✓ ${name.padEnd(38)} ${kb(size).padStart(8)} → ${kb(out).padStart(8)}  (${Math.round((100 * out) / size)}%)  diff ${mean.toFixed(2)} mean / ${max} max`);
      before += size; after += out; done++;
    }
    continue;
  }

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
