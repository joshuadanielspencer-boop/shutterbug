// ===========================================================================
// make-relief.mjs — build the game's shaded-relief map plates.
//
// Source (public domain, no attribution required):
//   Cross Blended Hypsometric Tints with Shaded Relief and Water, 10m "HR"
//   raster (21600×10800)
//   https://www.naturalearthdata.com/downloads/10m-raster-data/10m-cross-blend-hypso/
//   direct: https://naciscdn.org/naturalearth/10m/raster/HYP_HR_SR_W.zip
//
//   Was NE1 (Natural Earth I) until 2026-07-21. NE1 is designed as a base for
//   LABELS, so it is deliberately pale and carries almost no elevation
//   information — on it the Po Valley and the Apennines are the same flat cream,
//   and a child cannot see that Italy has a mountain spine. The hypsometric
//   source paints elevation: green lowlands, tan and brown highlands, pale peaks.
//
//   CROSS-BLENDED specifically, not a plain elevation ramp. Cross blending varies
//   the tint by climate, so the Sahara stays sand-coloured instead of going green
//   at sea level. A naive ramp would be prettier and would teach something false,
//   which matters more here than it looks (rule 2).
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
//   node scripts/make-relief.mjs <source.tif> --width 12288 --out public/relief-world-hyp.jpg
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
// Retuned for the hypsometric source (2026-07-21), and the old ramp is why the
// first attempt came out mottled. Measured from the source itself:
//
//   deep Pacific       rgb(122,166,208)   b-r 86   -> keyed fully by either ramp
//   Adriatic, shallow  rgb(209,229,241)   b-r 32   -> old ramp gave it 0.50
//   Antarctic ice      rgb(225,232,246)   b-r 21
//   Everest snow       rgb(232,232,232)   b-r  0
//
// Natural Earth's hypso paints shallow seas almost white-blue, so half-keying
// left the shaded-relief texture showing through every coastal sea — which is
// exactly the speckled Adriatic in the first build. Widening the ramp fixes that
// and creates a new problem: polar ICE is the same pale blue-white, and would key
// as ocean.
//
// Colour cannot separate those two. Latitude can, and the caller knows it — so
// `polar` softens the key back towards the old conservative ramp above 62°, where
// there is ice to protect and (on this plate) very little sea that matters. The
// Antarctic map is a separate polar plate anyway, so the world plate's ice only
// ever appears at world-map scale.
const waterness = (r, g, b, polar = false) => {
  if (polar) {
    const a = Math.min(1, Math.max(0, (b - r - 34) / 14));
    const c = Math.min(1, Math.max(0, (b - g - 18) / 8));
    return a * c;
  }
  const a = Math.min(1, Math.max(0, (b - r - 14) / 14));
  const c = Math.min(1, Math.max(0, (b - g - 4) / 6));
  return a * c;
};

// `land`: NE1 shipped washed out and wanted a 1.32 saturation lift. The
// hypsometric source is already carrying its meaning in colour, so lifting it
// that hard turned the highlands radioactive. 1.06 is a nudge, not a repaint.
async function build(src, width, out, { quality = 82, land = 1.06 } = {}) {
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
    // Row -> latitude, so the polar guard above knows where it is.
    const lat = 90 - ((i / ch / width) | 0) / height * 180;
    const w = waterness(r, g, b, Math.abs(lat) > 62);
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
  if (!src) { console.error("usage: node scripts/make-relief.mjs <NE1_HR_LC_SR_W.tif> --width 12288 --out public/relief-world-hyp.jpg"); process.exit(1); }
  const r = await build(src, Number(flag("width", 12288)), flag("out", "public/relief-world-hyp.jpg"), { quality: Number(flag("quality", 82)) });
  console.log(`${r.out}  ${r.width}×${r.height}  ${kb(r.bytes)}  (${(r.width / 360).toFixed(1)} px/degree)`);
}
