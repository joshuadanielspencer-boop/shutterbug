// Cut the faux-transparency CHECKERBOARD out of Mr O's portraits.
//
// Some of his art was exported flattened: the tool drew its own grey-and-white
// "this bit is transparent" checker into the pixels and saved with no alpha, so
// the game showed the checker. This keys it back out and writes a real alpha
// channel. Run: node scripts/key-mr-o.mjs
//
// The checker is two neutral near-white tones (~245 and ~254), which is also
// roughly the colour of Mr O's TEETH and the whites of his eyes — so a plain
// "delete every near-white pixel" key would knock holes in his face. Instead
// this flood-fills inward from the border: only near-white that is CONNECTED to
// the edge of the frame is background. His teeth are enclosed by his face, so
// they are never reached.
//
// Afterwards a short feather pass fades the antialiased rim where the figure met
// the checker, so he doesn't carry a white halo onto the game's dark panels.
//
// Idempotent by construction: it reads the pristine originals in Images/ and only
// TOUCHES the ones that were flattened. A portrait whose original already has an
// alpha channel is left alone entirely — re-exporting it would rewrite six files
// with a byte-different but visually identical re-encode, which is a noisy diff
// and a pointless few hundred KB in every future clone.
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const SRC = fileURLToPath(new URL("../Images/Mr O complete/", import.meta.url));
const OUT = fileURLToPath(new URL("../public/assets/shutterbug-ui/", import.meta.url));
const WIDTH = 800; // match the portraits that already shipped correctly

const BG_MIN = 238;    // a background pixel is at least this bright...
const BG_SPREAD = 10;  // ...and this close to neutral grey (checker has no hue)
const EDGE_HI = 250;   // rim pixel this bright is really background → clear it
const EDGE_LO = 195;   // ...below this it's the figure → keep it
const FEATHER = 2;     // rim passes

// "Mr O teaching.png" / "Mr. O hanging out.png" → "mr-o-teaching" / "mr-o-hangingout"
const slug = (f) =>
  "mr-o-" +
  f.replace(/\.png$/i, "").replace(/^mr\.?\s*o\s*/i, "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const files = readdirSync(SRC).filter((f) => f.toLowerCase().endsWith(".png"));
let keyed = 0, passed = 0;

for (const f of files) {
  const src = join(SRC, f);
  const hadAlpha = (await sharp(src).metadata()).hasAlpha;
  if (hadAlpha) { passed++; continue; }
  let img = sharp(src);

  {
    const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const px = data; // RGBA
    const isBg = (i) => {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      return Math.min(r, g, b) >= BG_MIN && Math.max(r, g, b) - Math.min(r, g, b) <= BG_SPREAD;
    };

    // Flood fill inward from every border pixel that looks like checker.
    const bg = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x;
      if (bg[p] || !isBg(p * 4)) return;
      bg[p] = 1; stack.push(p);
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const p = stack.pop(), x = p % w, y = (p / w) | 0;
      push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
    }
    for (let p = 0; p < w * h; p++) if (bg[p]) px[p * 4 + 3] = 0;

    // Feather the rim: an antialiased pixel that is mostly checker still reads as
    // a bright fringe against a dark panel, so fade it by how bright it is.
    for (let pass = 0; pass < FEATHER; pass++) {
      const clear = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (px[p * 4 + 3] === 0) continue;
        const touches =
          (x > 0 && px[(p - 1) * 4 + 3] === 0) || (x < w - 1 && px[(p + 1) * 4 + 3] === 0) ||
          (y > 0 && px[(p - w) * 4 + 3] === 0) || (y < h - 1 && px[(p + w) * 4 + 3] === 0);
        if (!touches) continue;
        const r = px[p * 4], g = px[p * 4 + 1], b = px[p * 4 + 2];
        const lum = (r + g + b) / 3;
        if (lum >= EDGE_HI) clear.push([p, 0]);
        else if (lum > EDGE_LO) clear.push([p, Math.round((255 * (EDGE_HI - lum)) / (EDGE_HI - EDGE_LO))]);
      }
      for (const [p, a] of clear) px[p * 4 + 3] = Math.min(px[p * 4 + 3], a);
    }

    const left = (() => { let n = 0; for (let p = 0; p < w * h; p++) if (!bg[p] && isBg(p * 4)) n++; return n; })();
    console.log(`  ${f}: keyed (${left} near-white px left enclosed — teeth/eyes, expected small)`);
    img = sharp(px, { raw: { width: w, height: h, channels: 4 } });
    keyed++;
  }

  await img.resize({ width: WIDTH }).png().toFile(join(OUT, `${slug(f)}.png`));
}
console.log(`keyed ${keyed} flattened portraits, left ${passed} alone (they already had alpha)`);
