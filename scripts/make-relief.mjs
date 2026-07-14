// ===========================================================================
// make-relief.mjs — build the game's shaded-relief map plates.
//
// Source (public domain, no attribution required):
//   Natural Earth I with Shaded Relief and Water, 10m "HR" raster (21600×10800)
//   https://www.naturalearthdata.com/downloads/10m-raster-data/10m-natural-earth-1/
//   direct: https://naciscdn.org/naturalearth/10m/raster/NE1_HR_LC_SR_W.zip
//   Terms:  "Natural Earth is in the public domain. You may use the maps in any
//            manner, including modifying the content and design."
//
// What it does:
//   1. Detects Natural Earth's ocean by colour (its water is a blue ramp; land,
//      ice and snow never satisfy the test) and repaints it FLAT in the game's
//      own SEA blue, so the relief plates match the flat world map's palette
//      instead of reading as a dark satellite photo.
//   2. Warms the land slightly — Natural Earth ships deliberately pale so labels
//      sit on top; the game has no labels and wants the atlas look.
//   3. Downsamples to the target width and encodes as JPEG.
//
// A flat ocean is also why a much larger plate stays affordable: ~70% of an
// equirectangular world is water, and flat colour costs a JPEG almost nothing.
//
// Usage:
//   node scripts/make-relief.mjs <source.tif> --width 8192 --out public/relief-world.jpg
//   node scripts/make-relief.mjs --antarctica            (recolour the polar plate's ocean)
// ===========================================================================
import sharp from "sharp";
import { writeFileSync } from "node:fs";

// The game's map-ocean blue (src/theme.js SEA) — kept in sync by hand.
const SEA = [0x1e, 0x4e, 0x82];

// How "water" a pixel is, 0..1. Natural Earth's ocean is strongly blue-dominant;
// its palest land (Sahara sand, Himalayan snow, Antarctic ice) is not. The soft
// ramp — rather than a hard yes/no — leaves a one-pixel shallow-water blend at
// the coast instead of a hard, aliased cut.
const waterness = (r, g, b) => {
  const a = Math.min(1, Math.max(0, (b - r - 20) / 12));
  const c = Math.min(1, Math.max(0, (b - g - 8) / 8));
  return a * c;
};

async function build(src, width, out, { quality = 82, land = 1.32 } = {}) {
  const height = Math.round(width / 2);
  // Resize FIRST, then key the ocean: the source is 233 megapixels, and keying at
  // full size costs minutes for a result we immediately throw away. Downsampling
  // blends coast pixels, which the soft ramp already handles.
  const { data, info } = await sharp(src, { limitInputPixels: false })
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const w = waterness(r, g, b);
    if (w > 0) {
      data[i] = Math.round(r + (SEA[0] - r) * w);
      data[i + 1] = Math.round(g + (SEA[1] - g) * w);
      data[i + 2] = Math.round(b + (SEA[2] - b) * w);
    }
    if (w < 1 && land !== 1) {
      // Gentle saturation lift on the land only, scaled down as we approach water
      // so the coastline doesn't get a bright fringe.
      const k = (1 - w) * land + w;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      for (let c = 0; c < 3; c++) {
        const v = data[i + c];
        data[i + c] = Math.min(255, Math.max(0, Math.round(lum + (v - lum) * k)));
      }
    }
  }

  const buf = await sharp(data, { raw: { width, height, channels: ch } })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer();
  writeFileSync(out, buf);
  return { out, width, height, bytes: buf.length };
}

// The Antarctica plate is a SOUTH-POLAR projection, so it can't come from the
// equirectangular source — we only restyle the ocean it already has (a flat
// navy, rgb(0,0,50)) into the game's SEA blue.
async function antarctica(src, out, { quality = 84 } = {}) {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // its ocean is flat navy: very dark, blue-dominant. JPEG noise wobbles it a
    // few counts either way, so match on distance rather than equality.
    const d = Math.hypot(r - 0, g - 0, b - 50);
    const w = Math.min(1, Math.max(0, (34 - d) / 22));
    if (w > 0) for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (SEA[c] - data[i + c]) * w);
  }
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
  writeFileSync(out, buf);
  return { out, width: info.width, height: info.height, bytes: buf.length };
}

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

if (args.includes("--antarctica")) {
  const r = await antarctica(flag("in", "public/relief-antarctica.jpg"), flag("out", "public/relief-antarctica.jpg"));
  console.log(`${r.out}  ${r.width}×${r.height}  ${kb(r.bytes)}`);
} else {
  const src = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--width"
    && args[args.indexOf(a) - 1] !== "--out" && args[args.indexOf(a) - 1] !== "--quality");
  if (!src) { console.error("usage: node scripts/make-relief.mjs <NE1_HR_LC_SR_W.tif> --width 8192 --out public/relief-world.jpg"); process.exit(1); }
  const r = await build(src, Number(flag("width", 8192)), flag("out", "public/relief-world.jpg"), { quality: Number(flag("quality", 82)) });
  console.log(`${r.out}  ${r.width}×${r.height}  ${kb(r.bytes)}  (${(r.width / 360).toFixed(1)} px/degree)`);
}
