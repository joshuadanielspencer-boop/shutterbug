// Force the SUBTITLE sign's white lettering fully opaque.
//
//   node scripts/solidify-subtitle.mjs            # fix it
//   node scripts/solidify-subtitle.mjs --check    # report only, write nothing
//
// The bug this exists to fix: shutterbug-subtitle.png ("A World Photo Safari")
// shipped with its letter fill at RGB(255,255,255) but alpha ~105 — only 41%
// opaque. Over a white page that reads as white, which is why it survived review;
// over the splash art's blue sky it reads as SKY BLUE, because the sky is what
// you are literally seeing through the letters. The art was never blue.
//
// The fix has to leave two things alone:
//   - the transparency OUTSIDE the sign (its rounded corners and drop shadow), and
//   - the antialiased rim where the sign meets that transparency.
// So "make the whole file opaque" is wrong — it would square off the corners.
//
// Instead: flood-fill inward from the image border through near-transparent
// pixels. That marks exactly the outside region and the soft rim, and it CANNOT
// reach the lettering, because every letter is sealed inside its own opaque dark
// outline. Whatever the flood never reached is sign interior; of that, the
// white-ish pixels are the lettering, and those are the only pixels we touch.
import sharp from "sharp";

const SRC = "public/assets/shutterbug-ui/shutterbug-subtitle.png";
const CHECK = process.argv.includes("--check");

// A pixel the flood may pass through: transparent enough to be outside-the-sign
// or its feathered rim. Well below the lettering's ~105 so the flood can never
// wander into a letter even if one were nicked open by antialiasing.
const FLOOD_MAX_A = 64;
// A pixel that is part of the white lettering: white-ish, and not already solid.
const isLetter = (r, g, b, a) => a < 255 && Math.min(r, g, b) > 200;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const at = (x, y) => (y * W + x) * C;

// ---- flood-fill the outside, 4-connected, from every border pixel ----
const outside = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  const p = y * W + x;
  if (outside[p] || data[at(x, y) + 3] > FLOOD_MAX_A) return;
  outside[p] = 1;
  stack.push(x, y);
};
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
while (stack.length) {
  const y = stack.pop(), x = stack.pop();
  if (x > 0) push(x - 1, y);
  if (x < W - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < H - 1) push(x, y + 1);
}

// ---- solidify the lettering the flood never reached ----
let fixed = 0, alphaSum = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (outside[y * W + x]) continue;               // outside the sign, or its rim
    const i = at(x, y);
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (!isLetter(r, g, b, a)) continue;
    alphaSum += a;
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = 255;
    fixed++;
  }
}

const pct = (n) => `${((100 * n) / (W * H)).toFixed(2)}%`;
console.log(`${SRC}  ${W}x${H}`);
console.log(`  outside/rim (untouched): ${outside.reduce((s, v) => s + v, 0)} px  ${pct(outside.reduce((s, v) => s + v, 0))}`);
console.log(`  lettering solidified:    ${fixed} px  ${pct(fixed)}  (mean alpha was ${fixed ? (alphaSum / fixed).toFixed(0) : "-"} → 255)`);

if (CHECK) { console.log("  --check: nothing written"); process.exit(0); }
if (!fixed) { console.log("  already solid, nothing to do"); process.exit(0); }

await sharp(data, { raw: { width: W, height: H, channels: C } }).png().toFile(`${SRC}.tmp`);
const { rename } = await import("node:fs/promises");
await rename(`${SRC}.tmp`, SRC);
console.log("  ✓ written");
