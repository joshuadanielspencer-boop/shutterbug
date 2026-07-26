// Chroma-key the green background out of Pickles's outfit PNGs (they ship on a solid
// green screen, ~RGB 5,185,5, with no alpha). A soft key on "greenness" = G − max(R,B)
// makes the background transparent while leaving the dog and her khaki/tan costumes
// alone (neither is a saturated green), and a despill on the feathered edge pixels
// kills the green halo around her fur. Overwrites the files in
// public/assets/shutterbug-ui/dog-outfits/ in place; the originals in
// Images/Pickles outfits/ are untouched. Run: node scripts/key-dog-outfits.mjs
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const DIR = fileURLToPath(new URL("../public/assets/shutterbug-ui/dog-outfits/", import.meta.url));
const T_HIGH = 55; // greenness ≥ this → fully transparent (background)
const T_LOW = 14;  // greenness ≤ this → fully opaque (the dog)

const files = readdirSync(DIR).filter((f) => f.endsWith(".png"));
let done = 0;
for (const f of files) {
  const p = join(DIR, f);
  const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height, ch = info.channels; // 4 after ensureAlpha
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const s = i * ch, d = i * 4;
    let r = data[s], g = data[s + 1], b = data[s + 2];
    const mx = Math.max(r, b);
    const greenness = g - mx;
    let a = 255;
    if (greenness >= T_HIGH) a = 0;
    else if (greenness > T_LOW) {
      a = Math.round((255 * (T_HIGH - greenness)) / (T_HIGH - T_LOW));
      if (g > mx) g = mx; // despill the semi-transparent fringe so no green halo remains
    }
    out[d] = r; out[d + 1] = g; out[d + 2] = b; out[d + 3] = a;
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(p);
  done++;
}
console.log(`keyed ${done} outfit PNGs`);
