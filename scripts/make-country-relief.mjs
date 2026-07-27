// ===========================================================================
// make-country-relief.mjs — per-country high-resolution relief plates.
//
// WHY THIS EXISTS
//
// The world plate (public/relief-world-hyp2.jpg) is 12288px wide, which is 34
// pixels per degree of longitude. That is plenty for the world and continent
// views. It is not remotely enough for a COUNTRY view: Switzerland's map frames
// about 5.5° of longitude into ~1400 CSS px, which asks for ~254 px/degree. The
// map was being magnified about seven times, and it looked it — the Alps came out
// as brown mush with no valleys in them.
//
// The source we build the world plate FROM is 21600px, or 60 px/degree. So the
// resolution already exists; it was simply being thrown away before anyone zoomed
// in. This script crops that source per country, at its native resolution, and the
// map draws the country's own plate over the world one when it has it.
//
// 60 px/degree still is not infinite — Switzerland ends up magnified ~2.7x rather
// than ~7x — but that is the ceiling of this art style's source, and the
// difference between the two is the difference between mush and legible terrain.
// Going further would mean rendering our own hillshade from elevation data and
// re-deriving Natural Earth's cross-blended hypsometric tint, which would change
// the look of every map in the game.
//
// HOW THE CROP IS SIZED
//
// Each country's plate has to cover the ground its map actually shows, so this
// derives the country's zoom box with THE SAME code the game uses — fitBox,
// pathBBox, toFrameAspect and COUNTRY_BOX_OVERRIDE, all imported from
// src/map-geometry.js. Duplicating that arithmetic here is how the two would
// quietly disagree, and a plate that is a degree too small shows as a hard seam
// where the sharp map stops and the blurry one resumes.
//
// It then pads by COVER_PAD, because the box is not the whole story: the SVG fits
// the box with preserveAspectRatio="meet" and the viewBox carries VB_PAD, so the
// frame always draws somewhat more ground than the box declares. The renderer
// double-checks the containment at draw time and falls back to the world plate if
// a plate ever fails to cover — so a future change to the box maths degrades to
// "no sharper" rather than to a visible seam.
//
// The colour treatment (flat game-blue ocean, gentle land saturation lift) is the
// same as scripts/make-relief.mjs, and has to stay that way or a country's plate
// would not match the world plate underneath it at the edges.
//
// Usage:
//   node scripts/make-country-relief.mjs <HYP_HR_SR_W.tif>
//   node scripts/make-country-relief.mjs <src.tif> --only Switzerland,Vanuatu
//   node scripts/make-country-relief.mjs <src.tif> --max-width 2048
// ===========================================================================
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { LOCATIONS } from "../src/data/locations.js";
import { WORLD_COUNTRIES } from "../src/data/worldmap.js";
import { COUNTRY_LAYER_CONTINENTS } from "../src/data/countries.js";
import { countryKey, pathBBox, fitBox, toFrameAspect, WC_ALIAS, COUNTRY_BOX_OVERRIDE } from "../src/map-geometry.js";

const OUT_DIR = fileURLToPath(new URL("../public/relief/", import.meta.url));
const DATA_OUT = fileURLToPath(new URL("../src/data/relief-plates.js", import.meta.url));

const SEA = [0x1e, 0x4e, 0x82];   // src/theme.js SEA — kept in sync by hand
const LAND_SAT = 1.06;            // same gentle lift make-relief.mjs uses
// Extra ground beyond the box. A country box already carries the frame's aspect, so
// the meet-fit adds nothing and the country view's VB_PAD is only 1% — this is five
// times the headroom that needs, and every extra percent is pixels nobody sees.
const COVER_PAD = 0.06;
const SRC_W = 21600, SRC_H = 10800;
const WORLD_PX_PER_DEG = 12288 / 360; // what the shared plate already gives (34.1)
// A plate is only worth making if it beats the world plate by a clear margin. Without
// this, a huge country hitting MAX_PX would be written at a LOWER resolution than the
// map it is meant to sharpen — Russia spans 174°, which at the cap is 12 px/degree
// against the world plate's 34. Those countries are barely magnified anyway.
const MIN_PX_PER_DEG = WORLD_PX_PER_DEG * 1.25;

// --- the same ocean key as make-relief.mjs (see its comments for the tuning) ---
const keyNormal = (r, g, b) => {
  const a = Math.min(1, Math.max(0, (b - r - 14) / 14));
  const c = Math.min(1, Math.max(0, (b - g - 4) / 6));
  return a * c;
};
const keyPolar = (r, g, b) => {
  const a = Math.min(1, Math.max(0, (b - r - 34) / 14));
  const c = Math.min(1, Math.max(0, (b - g - 18) / 8));
  return a * c;
};
const waterness = (r, g, b, p = 0) =>
  p <= 0 ? keyNormal(r, g, b) : p >= 1 ? keyPolar(r, g, b)
    : keyNormal(r, g, b) * (1 - p) + keyPolar(r, g, b) * p;

// --- derive every country's zoom box, exactly as the game does -----------------
const WC_BY_NAME = Object.fromEntries(WORLD_COUNTRIES.map((c) => [c.name, c.d]));
const countriesOf = (l) => (l.countries && l.countries.length ? l.countries : [l.country]);

function countryBoxes() {
  const out = [];
  for (const cont of COUNTRY_LAYER_CONTINENTS) {
    // Oceania is the Pacific-centred "wrap" continent; its boxes are built from
    // landmarks only (the border paths would be split across the antimeridian).
    const wrap = cont === "Oceania";
    const byC = {};
    for (const l of LOCATIONS) if (l.continent === cont) for (const c of countriesOf(l)) (byC[c] = byC[c] || []).push(l);
    for (const [country, ls] of Object.entries(byC)) {
      const xs = ls.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = ls.map((l) => l.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      let bx0 = minX, bx1 = maxX, by0 = minY, by1 = maxY;
      const bpath = !wrap && (WC_BY_NAME[country] || WC_BY_NAME[WC_ALIAS[country]]);
      const landSpan = Math.max(maxX - minX, maxY - minY);
      const bb = bpath && pathBBox(bpath, cx, cy, Math.max(7, landSpan * 2.5));
      if (bb) { bx0 = Math.min(bx0, bb.minX); bx1 = Math.max(bx1, bb.maxX); by0 = Math.min(by0, bb.minY); by1 = Math.max(by1, bb.maxY); }
      const key = countryKey(cont, country);
      const box = COUNTRY_BOX_OVERRIDE[key]
        ? toFrameAspect(COUNTRY_BOX_OVERRIDE[key])
        : fitBox((bx0 + bx1) / 2, (by0 + by1) / 2, bx1 - bx0, by1 - by0);
      out.push({ key, cont, country, box });
    }
  }
  return out;
}

// --- crop one country ----------------------------------------------------------
async function plate(src, entry, maxWidth) {
  const b = entry.box;
  // Pad the box out to what the frame can actually draw, then clamp NORTH-SOUTH to
  // the globe: a box can legitimately run past a pole (Canada's reaches y = −5) and
  // there is no map above one, for this plate or the world plate.
  const padW = b.w * COVER_PAD, padH = b.h * COVER_PAD;
  const x0 = b.x - padW, x1 = b.x + b.w + padW;
  const y0 = Math.max(0, b.y - padH), y1 = Math.min(180, b.y + b.h + padH);
  const degW = x1 - x0, degH = y1 - y0;
  if (degW <= 0 || degH <= 0) return null;

  // Skip the ones that would come out no sharper than the map they sit on.
  const nativeW = Math.round((degW / 360) * SRC_W);
  if (Math.min(nativeW, maxWidth) / degW < MIN_PX_PER_DEG) return null;

  // The source is one −180..180 plate, but a box can live in Oceania's wrapped space
  // and can straddle the antimeridian (Fiji runs 177E…178W). Normalise the left edge
  // into range; if the crop then runs off the right of the source, take it as two
  // pieces and join them, rather than skipping the country — Fiji is exactly the size
  // of country that needs this most.
  const nx0 = ((x0 % 360) + 360) % 360;
  const top = Math.round((y0 / 180) * SRC_H), bottom = Math.round((y1 / 180) * SRC_H);
  const px = (deg) => Math.round((deg / 360) * SRC_W);
  let h = bottom - top;
  if (h < 8) return null;

  let pipe;
  if (nx0 + degW <= 360) {
    pipe = sharp(src, { limitInputPixels: false })
      .extract({ left: px(nx0), top, width: px(nx0 + degW) - px(nx0), height: h });
  } else {
    const leftW = SRC_W - px(nx0), rightW = px(nx0 + degW - 360);
    const a = await sharp(src, { limitInputPixels: false }).extract({ left: px(nx0), top, width: leftW, height: h }).raw().toBuffer();
    const c = await sharp(src, { limitInputPixels: false }).extract({ left: 0, top, width: rightW, height: h }).raw().toBuffer();
    pipe = sharp({ create: { width: leftW + rightW, height: h, channels: 3, background: { r: 0, g: 0, b: 0 } } })
      .composite([
        { input: a, raw: { width: leftW, height: h, channels: 3 }, left: 0, top: 0 },
        { input: c, raw: { width: rightW, height: h, channels: 3 }, left: leftW, top: 0 },
      ]);
    pipe = sharp(await pipe.png().toBuffer());
  }

  let w = px(nx0 + Math.min(degW, 360)) - px(nx0);
  if (nx0 + degW > 360) w = (SRC_W - px(nx0)) + px(nx0 + degW - 360);
  if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; pipe = pipe.resize(w, h, { kernel: "lanczos3" }); }

  const { data, info } = await pipe.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], bl = data[i + 2];
    const lat = 90 - (y0 + (((i / ch / info.width) | 0) / info.height) * (y1 - y0));
    const polarness = Math.min(1, Math.max(0, (Math.abs(lat) - 56) / 16));
    const wt = waterness(r, g, bl, polarness);
    if (wt > 0) for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (SEA[c] - data[i + c]) * wt);
    if (wt < 1) {
      const k = (1 - wt) * LAND_SAT + wt;
      const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
      for (let c = 0; c < 3; c++) data[i + c] = Math.min(255, Math.max(0, Math.round(lum + (data[i + c] - lum) * k)));
    }
  }
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();

  const file = entry.key.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".jpg";
  writeFileSync(join(OUT_DIR, file), buf);
  // The rect is recorded in the SAME coordinate space the box was derived in — which
  // for Oceania is the wrapped, Pacific-centred one — so the map can draw the plate
  // at exactly `x` without knowing anything about how it was cropped.
  return { key: entry.key, file, x: x0, y: y0, w: degW, h: degH, px: info.width, bytes: buf.length };
}

// --- run -----------------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const src = args.find((a, i) => !a.startsWith("--") && !String(args[i - 1] || "").startsWith("--"));
if (!src) { console.error("usage: node scripts/make-country-relief.mjs <HYP_HR_SR_W.tif> [--only A,B] [--max-width 2048]"); process.exit(1); }
const maxWidth = Number(flag("max-width", 2048));
const only = flag("only", null);
const wanted = only ? new Set(only.split(",").map((s) => s.trim())) : null;

mkdirSync(OUT_DIR, { recursive: true });
const entries = countryBoxes().filter((e) => !wanted || wanted.has(e.country));
const made = [];
let skipped = 0, bytes = 0;
for (const e of entries) {
  const r = await plate(src, e, maxWidth);
  if (!r) { skipped++; continue; }
  made.push(r); bytes += r.bytes;
  process.stdout.write(`\r  ${made.length}/${entries.length} ${(bytes / 1048576).toFixed(1)} MB   `);
}
process.stdout.write("\n");

made.sort((a, b) => a.key.localeCompare(b.key));
const rows = made.map((m) =>
  `  ${JSON.stringify(m.key)}: { f: ${JSON.stringify(m.file)}, x: ${+m.x.toFixed(4)}, y: ${+m.y.toFixed(4)}, w: ${+m.w.toFixed(4)}, h: ${+m.h.toFixed(4)} },`).join("\n");
writeFileSync(DATA_OUT, `// GENERATED by scripts/make-country-relief.mjs — do not hand-edit.
//
// Per-country high-resolution relief plates, cropped from the 10m Natural Earth
// hypsometric source at its native 60 px/degree (the shared world plate is 34).
// Each entry is the ground the plate covers, in the map's equirectangular units
// (x = lon + 180, y = 90 - lat), so the map can draw it in exactly the right place
// — and check that it actually covers the view before using it.
//
// Regenerate with:  node scripts/make-country-relief.mjs <HYP_HR_SR_W.tif>
export const COUNTRY_PLATES = {
${rows}
};
`);

const px = made.length ? Math.round(made.reduce((s, m) => s + m.px / m.w, 0) / made.length) : 0;
console.log(`${made.length} plates, ${(bytes / 1048576).toFixed(1)} MB total, ~${px} px/degree average`);
if (skipped) console.log(`${skipped} skipped — too wide to beat the world plate at ${MIN_PX_PER_DEG.toFixed(0)} px/degree.\n` +
  `  These are the giants (the USA, Canada, Brazil, Russia, China…), whose maps show so\n` +
  `  much ground that the shared plate is already sampling above the frame's own width.\n` +
  `  They keep it, which is the right answer, not a gap.`);
console.log(`wrote ${DATA_OUT}`);
