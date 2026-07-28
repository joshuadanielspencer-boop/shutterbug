// Build the web-ready avatar layer set from Joshua's delivered artwork.
//
//   node scripts/build-avatar-layers.mjs
//   node scripts/build-avatar-layers.mjs --size 800   # bigger output plates
//
// Reads   Images/Avatar designs/*.png   (the pristine 1200x1200 deliveries)
// Writes  public/assets/shutterbug-ui/avatar-v2/*.webp + manifest.json
//
// The delivered art is already doing the hard part for us: every plate is the
// same 1200x1200 canvas and — verified by comparing alpha histograms — every
// plate within a family (all the eyes, all the hair, all the outfits) is
// pixel-identical in its alpha mask. They are recolours of one drawing, not
// separate drawings, so they stack with NO per-layer anchor or scale. That is
// exactly what the previous sprite sheets could not do (see
// docs/remaining-work.md §1), and it is why this script is thirty lines of
// bookkeeping instead of a calibration tool.
//
// Two things happen to each plate:
//
// 1. The black presentation frame comes off. It is a uniform 6px top/left and
//    11px bottom/right border on every file. We extract the interior and
//    re-extend it with transparency rather than cropping, so every pixel keeps
//    the exact coordinate it had in the delivery — the registration between
//    layers survives untouched, and a future plate drawn against the same
//    template drops straight in.
//
// 2. It is scaled down and written as WebP. NOT palette PNG: this art is
//    soft-shaded painting (skin gradients, fabric folds), and
//    scripts/optimize-ui-art.mjs says in its own header not to point it at
//    anything gradient-heavy. WebP holds the gradients and the alpha at about a
//    twentieth of the bytes.
//
// Filenames are the content spec — see parseName() for the grammar. Adding a
// new colour or a new outfit means dropping a correctly-named PNG in the
// delivery folder and re-running this; no code change.
import sharp from "sharp";
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { extractBrows, hairTone, recolourBrows, rgb2hsl } from "./avatar-brows.mjs";

const FRAME = { top: 6, left: 6, bottom: 11, right: 11 };
const CANVAS = 1200;
const DEFAULT_SIZE = 600;

const SRC = fileURLToPath(new URL("../Images/Avatar designs/", import.meta.url));
const DEST = fileURLToPath(new URL("../public/assets/shutterbug-ui/avatar-v2/", import.meta.url));

// The parts, bottom to top. This IS the z-order the game composites in, and it
// lives here rather than in the UI so that art and stacking order stay one fact.
// The outfit sits at the BOTTOM: the head plate carries the jaw and neck all the
// way down, so drawing it over the collar keeps the face continuous. Stacked the
// other way the collar cuts across the chin.
// "brow" is not delivered art — it is lifted out of the head plates and
// recoloured to match the hair (see scripts/avatar-brows.mjs), so it sits above
// the head and below the hair that may fall across it.
const PARTS = ["outfit", "head", "brow", "eyes", "hair"];

// Parts the player does not pick directly. The brow follows the hair colour.
const DERIVED = { brow: "hair" };

// Filename grammar, forgiving on purpose so the next delivery batch needs no
// code change:
//
//   <part>_[male|female_]<variant>_<colour words…>[_<style word>].png
//
//   head_1_light_skin           → head,   variant 1, colour "light"   (trailing "skin" dropped)
//   eyes_male_blue              → eyes,   sex male,  colour "blue"
//   hair_3_light_chestnut       → hair,   variant 3, colour "light chestnut"
//   outfit_5_blue_jacket        → outfit, variant 5, colour "blue", style "jacket"
//
// A male/female token anywhere marks the plate as sex-specific; without one the
// plate is offered to everybody. Joshua's next batch adds female eyelashes and
// hair, plus outfits beyond jackets — both land as new filenames alone.
//
// Two conventions the names have to keep:
//   - the garment is ONE word. `outfit_9_blue_raincoat` is right;
//     `outfit_9_blue_rain_coat` reads as the colour "blue rain".
//   - a brand-new KIND of part (a hat, a scarf) needs adding to PARTS above, at
//     the height it should stack. Nothing else in the pipeline changes.
function parseName(file) {
  const tokens = file.replace(/\.png$/i, "").split("_");
  const part = tokens.shift();
  if (!PARTS.includes(part)) return null;

  let sex = "any";
  const sexAt = tokens.findIndex((t) => t === "male" || t === "female");
  if (sexAt !== -1) sex = tokens.splice(sexAt, 1)[0];

  // A leading all-digits token is the variant number; otherwise the variants of
  // this part are distinguished by colour alone (as the eyes currently are).
  const variant = /^\d+$/.test(tokens[0]) ? tokens.shift() : "1";

  // "skin" is a noun, not a colour: head_1_light_skin is the light one.
  if (tokens.at(-1) === "skin") tokens.pop();

  // For outfits the last word names the garment; everything before it is colour.
  // Hair and eyes have no garment word, so their style is the part itself.
  let style = part;
  if (part === "outfit" && tokens.length > 1) style = tokens.pop();

  const colour = tokens.join(" ") || "default";
  return { part, sex, variant, style, colour, id: file.replace(/\.png$/i, "") };
}

const title = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// The rectangle a plate's ink actually occupies, as fractions of the canvas.
// The pickers need it: an eyes plate is 97% empty square, so a thumbnail that
// just shrinks the whole plate shows a child two dots in a field of nothing.
// Measuring it here — from the built plate, once, per part — beats hand-tuned
// CSS zoom numbers that go stale the moment new art arrives.
const ALPHA_FLOOR = 8; // ignore the faint anti-aliased fringe

async function inkBox(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * c + 3] <= ALPHA_FLOOR) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x: x0 / w, y: y0 / h, w: (x1 - x0 + 1) / w, h: (y1 - y0 + 1) / h };
}

function union(a, b) {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

const round4 = (box) => box && Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Number(v.toFixed(4))]));

// One representative colour per plate. It is NOT for display — the editor shows
// real cropped thumbnails — it exists so an avatar saved under the old
// procedural-SVG scheme can be carried over by matching its old hex against the
// nearest new plate (see migrateAvatar in src/avatar-spec.js).
//
// A plain median works for a head (nearly all skin) or hair (nearly all hair),
// but not for an outfit, where the camera, straps and shirt would drag a red
// jacket toward grey, nor for eyes, where the white sclera outvotes the iris.
// For those, keep only mid-lit, saturated pixels: the dyed cloth and the iris
// are exactly the parts that are both. The lightness band matters as much as
// the saturation — measured on saturation alone, a red jacket resolves to its
// darkest shadow fold (#5c0f0a) and an eye to its pupil, because a very dark
// pixel is technically very saturated.
const COLOURFUL = { eyes: true, outfit: true };
const LIT = [0.25, 0.75]; // lightness band a nameable colour lives in
const TOP_SAT = 0.6;      // keep the most saturated 40% inside that band

async function swatchOf(part, webp) {
  const { data, info } = await sharp(webp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < info.width * info.height; i++) {
    if (data[i * 4 + 3] < 250) continue;
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const [, s, l] = rgb2hsl(r, g, b);
    if (COLOURFUL[part] && (l < LIT[0] || l > LIT[1])) continue;
    px.push({ r, g, b, s });
  }
  if (!px.length) return null;
  let keep = px;
  if (COLOURFUL[part]) {
    keep = px.slice().sort((a, b) => a.s - b.s).slice(Math.floor(px.length * TOP_SAT));
  }
  const mid = (c) => keep.map((p) => p[c]).sort((a, b) => a - b)[keep.length >> 1];
  return "#" + [mid("r"), mid("g"), mid("b")].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const sizeArg = process.argv.indexOf("--size");
const size = sizeArg === -1 ? DEFAULT_SIZE : Number(process.argv[sizeArg + 1]);

await mkdir(DEST, { recursive: true });

// De-frame, scale, encode. Every plate goes through exactly this, including the
// synthesised brows, so nothing can drift out of registration with anything else.
// Two passes on purpose. In a single sharp pipeline `extract` is applied to the
// input before `resize` but `extend` is applied after it, which would pad the
// already-shrunk image with a full-size 17px border and give a 617px plate. The
// de-frame has to finish at 1200x1200 before anything is scaled.
const plate = async (img) => {
  const deframed = await img
    .ensureAlpha()
    .extract({
      left: FRAME.left,
      top: FRAME.top,
      width: CANVAS - FRAME.left - FRAME.right,
      height: CANVAS - FRAME.top - FRAME.bottom,
    })
    .extend({ ...FRAME, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp(deframed).resize(size, size).webp({ quality: 88, effort: 6, alphaQuality: 100 }).toBuffer();
};

const rawOf = async (file) =>
  (await sharp(join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;

const files = (await readdir(SRC)).filter((f) => /\.png$/i.test(f)).sort();
const layers = [];
const focus = Object.fromEntries(PARTS.map((p) => [p, null]));
let bytesIn = 0, bytesOut = 0;

for (const file of files) {
  const spec = parseName(file);
  if (!spec) {
    console.warn(`  ! skipped: ${file} — "${file.split("_")[0]}" is not a known part.`);
    console.warn(`    Add it to PARTS in this script, positioned at the height it stacks: ${PARTS.join(" → ")}`);
    continue;
  }

  const srcBytes = (await stat(join(SRC, file))).size;
  const out = await plate(sharp(join(SRC, file)));

  focus[spec.part] = union(focus[spec.part], await inkBox(out));

  const name = `${spec.id}.webp`;
  await writeFile(join(DEST, name), out);
  layers.push({ ...spec, file: name, label: title(spec.colour), swatch: await swatchOf(spec.part, out) });
  bytesIn += srcBytes;
  bytesOut += out.length;

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log(`  ✓ ${file.padEnd(30)} ${kb(srcBytes).padStart(8)} → ${kb(out.length).padStart(7)}  ${spec.part}/${spec.colour}`);
}

// ---- the synthesised brow layer ---------------------------------------------
// One plate per hair colour, lifted out of the head art. See avatar-brows.mjs
// for why one plate covers all four skin tones.
const headFiles = layers.filter((l) => l.part === "head").map((l) => `${l.id}.png`);
const hairLayers = layers.filter((l) => l.part === "hair");
const drawnBrows = layers.filter((l) => l.part === "brow").length;

if (drawnBrows) {
  // Hand-drawn brows beat lifted ones. If a delivery ever includes brow_*.png,
  // it wins outright and nothing is synthesised on top of it.
  console.log(`\n  brows: ${drawnBrows} drawn plates delivered — skipping synthesis`);
} else if (headFiles.length >= 2 && hairLayers.length) {
  const heads = [];
  for (const f of headFiles) heads.push(await rawOf(f));
  const brows = extractBrows(heads, CANVAS, CANVAS);
  console.log(`\n  brows: ${brows.blobs.length} ink blobs lifted from ${heads.length} skin tones`);

  for (const hair of hairLayers) {
    const tone = hairTone(await rawOf(`${hair.id}.png`), CANVAS, CANVAS);
    const rgba = recolourBrows(brows, tone, CANVAS, CANVAS);
    const out = await plate(sharp(rgba, { raw: { width: CANVAS, height: CANVAS, channels: 4 } }));
    const name = `brow_${hair.colour.replace(/ /g, "_")}.webp`;
    await writeFile(join(DEST, name), out);
    focus.brow = union(focus.brow, await inkBox(out));
    // The brow's `colour` is the HAIR colour it belongs with — that is the key
    // the picker matches on, since the player never chooses brows directly.
    layers.push({ part: "brow", sex: hair.sex, variant: hair.variant, style: "brow",
                  colour: hair.colour, id: name.replace(/\.webp$/, ""), file: name, label: hair.label,
                  swatch: hair.swatch });
    bytesOut += out.length;
    console.log(`  ✓ ${name.padEnd(30)} ${(out.length / 1024).toFixed(0)} KB`.padEnd(52) + `matches hair/${hair.colour}`);
  }
} else {
  console.warn("  ! brows skipped — needs at least two skin tones and one hair colour");
}

// Group into the picker's shape: one entry per part, in z-order, each holding
// its options in delivery order (variant, then colour).
const manifest = {
  canvas: size,
  order: PARTS,
  derived: DERIVED,
  focus: Object.fromEntries(PARTS.map((part) => [part, round4(focus[part])])),
  parts: Object.fromEntries(
    PARTS.map((part) => [
      part,
      layers
        .filter((l) => l.part === part)
        .sort((a, b) => a.variant.localeCompare(b.variant, undefined, { numeric: true }) || a.colour.localeCompare(b.colour)),
    ]),
  ),
};

await writeFile(join(DEST, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// The game imports the manifest as a module rather than fetching the JSON: an
// avatar is in the header on the very first frame, and a fetch would make every
// board flash empty before it resolved. src/data/geography.js is generated the
// same way for the same reason — see CLAUDE.md rule 1.
const module_ = `// ===========================================================================
// TRAVELER AVATAR PARTS — which plate is which, and how they stack.
//
// GENERATED FILE — do not edit by hand.
//   Regenerate with:  node scripts/build-avatar-layers.mjs
//   The art it reads lives in "Images/Avatar designs/" (outside the repo build).
//
// \`ORDER\` is the z-order, bottom first. \`DERIVED\` names the parts the player
// never picks — the brow follows the hair colour. \`FOCUS\` is the rectangle each
// part's ink occupies, as fractions of the plate, measured at build time: the
// editor thumbnails and the small round crops frame themselves from it.
// \`swatch\` is a representative colour, used only to carry pre-existing saved
// avatars onto the nearest new plate.
// ===========================================================================

export const AVATAR_BASE = "assets/shutterbug-ui/avatar-v2/";
export const AVATAR_CANVAS = ${size};
export const ORDER = ${JSON.stringify(PARTS)};
export const DERIVED = ${JSON.stringify(DERIVED)};
export const FOCUS = ${JSON.stringify(manifest.focus, null, 2)};

export const PARTS = ${JSON.stringify(
    Object.fromEntries(
      PARTS.map((part) => [
        part,
        manifest.parts[part].map(({ file, colour, label, swatch, style, sex }) => ({ file, colour, label, swatch, style, sex })),
      ]),
    ),
    null,
    2,
  )};
`;
await writeFile(new URL("../src/data/avatar.js", import.meta.url), module_);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`\n✓ src/data/avatar.js  ${kb(Buffer.byteLength(module_))}`);
console.log(`${layers.length} layers → ${DEST.replace(/.*\/public\//, "public/")}`);
console.log(`${kb(bytesIn)} → ${kb(bytesOut)} (${Math.round((100 * bytesOut) / bytesIn)}%) at ${size}x${size}`);
for (const part of PARTS) console.log(`  ${part.padEnd(7)} ${manifest.parts[part].length} options`);
