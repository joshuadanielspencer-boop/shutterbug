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
import { readdir, mkdir, writeFile, stat, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { extractBrows, hairTone, recolourBrows, rgb2hsl, hsl2rgb } from "./avatar-brows.mjs";
import { PALETTE, materialMask, recolourPlate } from "./avatar-recolour.mjs";

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
  // A doubled extension is an export slip, not a colour: three plates in the
  // 2026-07-29 batch arrived as "…_blonde.png.png", and stripping only one left
  // the colour reading as "blonde.png". Strip them all.
  const tokens = file.replace(/(\.png)+$/i, "").split("_");
  const part = tokens.shift();
  if (!PARTS.includes(part)) return null;

  let sex = "any";
  const sexAt = tokens.findIndex((t) => t === "male" || t === "female");
  if (sexAt !== -1) sex = tokens.splice(sexAt, 1)[0];

  // A leading token of digits OR a single letter is the variant; otherwise the
  // variants of this part are distinguished by colour alone.
  //
  // The letter case matters. The male hairstyles are numbered 1-4 and the female
  // ones lettered a-d, and matching only digits made "hair_female_a_blonde" a
  // plate whose COLOUR was "a blonde" — so four hairSTYLES presented themselves
  // to the child as four colours of one style, while all four male styles
  // collapsed onto a single key and overwrote each other.
  const variant = /^(\d+|[a-z])$/.test(tokens[0] ?? "") ? tokens.shift() : "1";

  // "skin" is a noun, not a colour: head_1_light_skin is the light one.
  if (tokens.at(-1) === "skin") tokens.pop();

  // For outfits the last word names the garment; everything before it is colour.
  // Hair and eyes have no garment word, so their style is the part itself.
  let style = part;
  if (part === "outfit" && tokens.length > 1) style = tokens.pop();

  const colour = tokens.join(" ") || "default";
  // The id is rebuilt from the parsed pieces rather than taken from the filename,
  // so a recoloured variant can differ from its source in exactly one token.
  const id = idFor({ part, sex, variant, style, colour });
  return { part, sex, variant, style, colour, id };
}

// part_[sex_]variant_colour[_style]. Stable and unique: two plates that differ
// only in colour differ only in that token, which is what lets one delivered
// painting become a whole palette without the ids colliding.
const idFor = ({ part, sex, variant, style, colour }) => [
  part,
  sex === "any" ? null : sex,
  variant,
  colour.replace(/\s+/g, "-"),
  style !== part ? style : null,
].filter(Boolean).join("_");

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

// ---- Is this batch registered against the others? --------------------------
// The whole pipeline rests on one property: every plate is the same canvas with
// the character drawn in the same place, so stacking them IS the assembly. That
// held for the first delivery, and nothing guarantees it holds for the next —
// a generator that re-frames or re-crops between batches produces art that looks
// perfect on its own and lands a head half an inch off the neck.
//
// The frame is not what registers them (it comes off), and neither is the file
// size. What matters is the CANVAS and where the ink sits inside it. So: every
// plate must be the same dimensions, and every plate must overlap the running
// average ink box of its own part. A head that suddenly sits 200px lower than the
// other heads is caught here rather than by Joshua noticing a floating face.
async function canvasOf(file) {
  const m = await sharp(join(SRC, file)).metadata();
  return `${m.width}x${m.height}`;
}
const canvases = new Map();
for (const f of files) {
  const c = await canvasOf(f);
  (canvases.get(c) || canvases.set(c, []).get(c)).push(f);
}
// The majority canvas is the template; anything else is SKIPPED rather than built,
// because a plate on a different canvas will not line up and shipping it crooked is
// worse than not shipping it. Loud, named, and non-fatal — the rest of the set
// still builds, so one bad export can't block the pipeline.
const majority = [...canvases.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0];
const wrongCanvas = new Set();
if (canvases.size > 1) {
  console.warn(`\n  ! NOT EVERY PLATE IS THE SAME CANVAS. The set stacks only because they share one.`);
  for (const [c, fs] of canvases) {
    const tag = c === majority ? "template" : "SKIPPED";
    console.warn(`      ${c.padEnd(11)} ${String(fs.length).padStart(2)} file(s)  ${tag.padEnd(9)} ${fs.slice(0, 3).join(", ")}${fs.length > 3 ? "…" : ""}`);
    if (c !== majority) for (const f of fs) wrongCanvas.add(f);
  }
  console.warn(`    Re-export the skipped ones at ${majority} with the character in the same place.\n`);
}

const layers = [];
const focus = Object.fromEntries(PARTS.map((p) => [p, null]));
let bytesIn = 0, bytesOut = 0;

for (const file of files) {
  if (wrongCanvas.has(file)) continue;
  const spec = parseName(file);
  if (!spec) {
    console.warn(`  ! skipped: ${file} — "${file.split("_")[0]}" is not a known part.`);
    console.warn(`    Add it to PARTS in this script, positioned at the height it stacks: ${PARTS.join(" → ")}`);
    continue;
  }

  const srcBytes = (await stat(join(SRC, file))).size;
  bytesIn += srcBytes;

  // ONE delivered painting becomes the whole palette for its part. The delivery
  // is one plate per SHAPE — one head, two sets of eyes, eight hairstyles, five
  // outfits — each in a single colour, and the game needs every shape in every
  // colour. See scripts/avatar-recolour.mjs for how, and for why the mask is not
  // simply "every pixel" outside the hair.
  const palette = PALETTE[spec.part];
  const srcRaw = await rawOf(file);
  let found = null;
  if (palette) {
    found = materialMask(spec.part, spec.colour, srcRaw, CANVAS, CANVAS);
    if (!found) {
      console.warn(`  ! ${file}: nothing on this plate is "${spec.colour}" — shipping it as delivered, uncoloured.`);
      console.warn(`    The colour word in the filename names the garment that carries the colour;`);
      console.warn(`    if the art changed, the word has to change with it.`);
    }
  }

  const variants = found
    ? palette.map((t) => ({ tone: t, colour: t.name }))
    : [{ tone: { source: true }, colour: spec.colour }];

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  let wrote = 0;
  for (const { tone, colour } of variants) {
    const raw = tone.source ? srcRaw : recolourPlate(spec.part, srcRaw, CANVAS, CANVAS, found, tone);
    const out = await plate(sharp(raw, { raw: { width: CANVAS, height: CANVAS, channels: 4 } }));
    const one = { ...spec, colour, id: idFor({ ...spec, colour }) };
    focus[spec.part] = union(focus[spec.part], await inkBox(out));
    const name = `${one.id}.webp`;
    await writeFile(join(DEST, name), out);
    // `tone` and `srcFile` are build-time bookkeeping (the brow pass needs the
    // hair's target colour and the delivered head's filename); stripManifest
    // drops them before anything is written.
    layers.push({ ...one, file: name, label: title(colour), swatch: await swatchOf(spec.part, out),
                  tone, srcFile: file });
    bytesOut += out.length;
    wrote += out.length;
  }
  const shown = variants.map((v) => v.colour).join(", ");
  console.log(`  ✓ ${file.padEnd(30)} ${kb(srcBytes).padStart(8)} → ${kb(wrote).padStart(8)}  ${spec.part}/${spec.variant}  ${shown}`);
}

// ---- the synthesised brow layer ---------------------------------------------
// One plate per hair COLOUR (not per style — the player never picks brows, and a
// brow is a brow whatever the fringe above it is doing).
//
// extractBrows finds the ink by comparing two skin tones and keeping the pixels
// they agree on, which needs two head paintings that differ ONLY in skin. The
// 2026-07-29 delivery has one head, and the tones this build generates from it
// move the line art along with the skin on purpose (a face whose lines stay put
// loses its features at the darkest tone). So neither the delivery nor the
// output can be fed to it directly.
//
// What is fed to it is a throwaway pair: the delivered head, and the same head
// with ONLY its lighter pixels shifted. That is not shipped and never touches the
// manifest — it exists for one comparison, and it is exactly the comparison the
// extractor was written for, so the tested code stays unchanged and the ink it
// isolates is the real ink.
const SKIN_LUM_FLOOR = 0.34;   // below this a head pixel is line work, not skin
const headSources = layers.filter((l) => l.part === "head" && l.tone?.source).map((l) => l.srcFile);
const hairLayers = layers.filter((l) => l.part === "hair");
const drawnBrows = layers.filter((l) => l.part === "brow").length;
// One brow per hair colour, and the tone comes from the PALETTE rather than by
// measuring a built plate: the target is what the hair was dyed to, and reading
// it back off a WebP would only add rounding.
const browTones = new Map();
for (const h of hairLayers) if (!browTones.has(h.colour)) browTones.set(h.colour, h.tone);

if (drawnBrows) {
  // Hand-drawn brows beat lifted ones. If a delivery ever includes brow_*.png,
  // it wins outright and nothing is synthesised on top of it.
  console.log(`\n  brows: ${drawnBrows} drawn plates delivered — skipping synthesis`);
} else if (headSources.length && browTones.size) {
  const head = await rawOf(headSources[0]);
  const twin = Buffer.from(head);
  for (let i = 0; i < CANVAS * CANVAS; i++) {
    if (twin[i * 4 + 3] < 8) continue;
    const [hu, s, l] = rgb2hsl(twin[i * 4], twin[i * 4 + 1], twin[i * 4 + 2]);
    if (l < SKIN_LUM_FLOOR) continue;                      // leave the ink alone
    const [r, g, b] = hsl2rgb(hu, s, Math.max(0, l - 0.18));
    twin[i * 4] = r; twin[i * 4 + 1] = g; twin[i * 4 + 2] = b;
  }
  const brows = extractBrows([head, twin], CANVAS, CANVAS);
  console.log(`\n  brows: ${brows.blobs.length} ink blobs lifted from the head's own line art`);

  for (const [colour, tone] of browTones) {
    const hair = hairLayers.find((h) => h.colour === colour);
    const rgba = recolourBrows(brows, tone, CANVAS, CANVAS);
    const out = await plate(sharp(rgba, { raw: { width: CANVAS, height: CANVAS, channels: 4 } }));
    const name = `brow_${colour.replace(/\s+/g, "-")}.webp`;
    await writeFile(join(DEST, name), out);
    focus.brow = union(focus.brow, await inkBox(out));
    // The brow's `colour` is the HAIR colour it belongs with — that is the key
    // the picker matches on, since the player never chooses brows directly.
    layers.push({ part: "brow", sex: "any", variant: "1", style: "brow",
                  colour, id: name.replace(/\.webp$/, ""), file: name, label: title(colour),
                  swatch: hair.swatch });
    bytesOut += out.length;
    console.log(`  ✓ ${name.padEnd(30)} ${(out.length / 1024).toFixed(0)} KB`.padEnd(52) + `matches hair/${colour}`);
  }
} else {
  console.warn("  ! brows skipped — needs a delivered head plate and at least one hair colour");
}

// Colours come out in PALETTE order, not alphabetically. The palettes are
// written in an order a child reads as a range — skin runs deep to light, hair
// black to blonde — and sorting them by name shuffles that into nonsense
// ("black, blonde, brown, dark brown, light brown, red").
const paletteRank = (part, colour) => {
  const i = (PALETTE[part] ?? PALETTE.hair).findIndex((t) => t.name === colour);
  return i === -1 ? 999 : i;
};

// Group into the picker's shape: one entry per part, in z-order, each holding
// its options in delivery order (variant, then palette order).
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
        .sort((a, b) => a.variant.localeCompare(b.variant, undefined, { numeric: true }) || paletteRank(part, a.colour) - paletteRank(part, b.colour))
        // `tone` and `srcFile` are build-time only — see where they are set.
        .map(({ tone, srcFile, ...keep }) => keep),
    ]),
  ),
};

// Sweep out plates the manifest no longer names. The build writes into a folder
// it does not own the history of, and every rename leaves the old file sitting
// there — renaming the ids for the colour palette orphaned 23 plates and 651 KB,
// all of it still precached by the PWA and shipped to every iPad. Nothing reads
// them, so nothing fails; the set just quietly gets heavier every time the
// naming moves.
const live = new Set(Object.values(manifest.parts).flat().map((l) => l.file));
const onDisk = (await readdir(DEST)).filter((f) => f.endsWith(".webp"));
const orphans = onDisk.filter((f) => !live.has(f));
if (orphans.length) {
  let freed = 0;
  for (const f of orphans) {
    freed += (await stat(join(DEST, f))).size;
    await unlink(join(DEST, f));
  }
  console.log(`\n  swept ${orphans.length} plate(s) the manifest no longer names — ${(freed / 1024).toFixed(0)} KB`);
}

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
        // `variant` ships too. It is the only thing that says WHICH haircut a
        // plate is, and without it the editor cannot match a boy's second
        // hairstyle to a girl's second one when the sex changes — colour alone
        // sends every style home to the first one in the list.
        manifest.parts[part].map(({ file, colour, label, swatch, style, sex, variant }) =>
          ({ file, colour, label, swatch, style, sex, variant })),
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
