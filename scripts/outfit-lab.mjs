// ===========================================================================
// REGISTER A BATCH OF FLOATING GARMENTS ONTO THE AVATAR BODY — a review lab.
//
//   node scripts/outfit-lab.mjs
//   node scripts/outfit-lab.mjs --src "some other delivery folder"
//   node scripts/outfit-lab.mjs --size 600      # output plate size
//
// Reads   a delivery folder of garment paintings (default: the 2026-09 batch)
// Writes  public/outfit-lab/*.webp + manifest.json
// Look at it with  npm run dev  →  http://localhost:5173/outfit-lab.html
//
// NOTHING HERE TOUCHES THE GAME. The plates land in public/outfit-lab/, not in
// avatar-v2/; src/data/avatar.js is not regenerated; the customize-traveler
// editor cannot see any of this. That is deliberate — the question this script
// exists to answer is "can these be aligned well enough to ship?", and the
// answer has to be judged before anything reaches a child's wardrobe.
//
// ---------------------------------------------------------------------------
// WHY THIS IS HARD, AND WHY IT IS NOT THE SAME JOB build-avatar-layers.mjs DOES
// ---------------------------------------------------------------------------
// The shipped avatar pipeline is thirty lines of bookkeeping because the art
// arrives pre-registered: every plate is the same 1200x1200 canvas and every
// plate within a variant is a recolour of one drawing, so stacking them IS the
// assembly. Its header says so, and it is right.
//
// This batch is not that. The plates are 1024x1536, 1536x1024 and 1024x1024;
// each garment is drawn floating on an invisible mannequin at whatever size
// suited the painting; and they carry a neck stub that the shipped plates do
// not (the shipped ones let the head plate's own jaw and neck fill the collar).
// There is no shared canvas and no shared registration. Dropping them into
// "Images/Avatar designs/" and re-running the real build would produce collars
// floating a hundred pixels off a child's shoulders.
//
// ---------------------------------------------------------------------------
// HOW THE ALIGNMENT IS DERIVED
// ---------------------------------------------------------------------------
// Not from landmarks. The obvious approach — find the neck opening, find the
// shoulder points, match them — needs a rule that reads both drawing
// conventions, and the conventions genuinely differ: on a shipped plate the
// topmost ink is the collar, on a new one it is the mannequin's neck. Every
// landmark rule I tried needed a special case for that, and a special case is
// a thing that silently picks the wrong point on the twenty-ninth garment.
//
// Instead the BODY is measured from the art that is already correct. The five
// shipped outfits are all drawn on the same child, so the silhouette at least
// three of the five agree on is that child's shoulders — collar, shoulder line,
// upper arms — independent of whether any one of them is a hoodie or a
// cardigan. Each new garment is then fitted to that shape by searching scale,
// dx and dy for maximum overlap (a coarse sweep, then three refinement passes).
//
// Two details that matter:
//
//   - Only the top 42% of the reference body is used. Below the shoulder line
//     the five shipped garments legitimately disagree — a cardigan hangs
//     differently from a bomber jacket — and fitting to their average down
//     there would squeeze whichever new silhouette is the odd one out. The
//     shoulders are the part that has to be right; the hem can be whatever the
//     garment is.
//
//   - The score reported is IoU over that band, plus `cover` (how much of the
//     body the garment covers) and `spill` (how much of the garment hangs
//     outside the body). They are reported per plate BECAUSE the fit cannot be
//     trusted uniformly: a poncho and a fitted shirt cannot both score well
//     against one shoulder shape, and a number next to each thumbnail is how
//     the eye knows which ones to look at hardest.
//
// The manifest keeps every fitted number, so a garment the eye rejects can be
// nudged by hand in the lab page and the corrected numbers pasted back into
// MANUAL below, rather than the whole approach being thrown away for one plate.
// ===========================================================================
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const REPO = new URL("../", import.meta.url);
const SRC = fileURLToPath(new URL(arg("src", "NOT YET USED Shutterbug more avatar assets") + "/", REPO));
const REF = fileURLToPath(new URL("Images/Avatar designs/", REPO));
const DEST = fileURLToPath(new URL("public/outfit-lab/", REPO));
const SIZE = Number(arg("size", 600));

// The shipped delivery template: a uniform black presentation border, and the
// canvas that is left once it comes off. Same numbers as build-avatar-layers.mjs
// — if that template ever changes, both scripts change together.
const FRAME = { top: 6, left: 6, bottom: 11, right: 11 };
const CANVAS = 1183;
const ALPHA_FLOOR = 8;

// Hand corrections, keyed by source filename, applied on top of the automatic
// fit: `{ scale, dx, dy }`, each optional, scale MULTIPLYING what the fit found
// and dx/dy ADDED to it (in reference-canvas pixels). The lab page's nudge
// sliders print the line to paste.
//
// Two of the twenty-three are here, both flagged automatically by the scale
// check below, and both set by LADDER rather than by eye: the garment rendered
// at a row of scales and collar heights, composited under the real head plate at
// the real canvas size, and the row compared. That is the method, and it matters,
// because the first attempt at these two was a pair of numbers I judged against a
// 400px preview — they came out visibly off to one side, and Joshua caught it
// immediately at full size. A scarf hanging down one side is exactly the thing
// that makes "looks centred" a bad judgement, and half the eventual error was in
// the diagnostic rather than the art: my first ladder composited the 600px head
// plates onto the 1183px reference canvas and invented a gap that was never there.
//
// Before reaching for a hand number, read the paragraph under SCALE_BAND on what
// was tried automatically and why none of it worked for these two shapes.
const MANUAL = {
  // Chunky cowl-neck sweater with a scarf. Fitted scale 0.4655 → 0.75.
  "8f47d6ba-b234-4c82-8350-a193797a3514.png": { scale: 1.6112, dx: -146, dy: -56 },
  // Padded coat, hood worn up. Fitted scale 0.5051 → 0.72.
  "c41541d7-42cf-457b-ab1b-6f6bf5d9ccc2.png": { scale: 1.4255, dx: -115, dy: -96 },
};

// DETECTING a fit that has gone wrong, which turns out to be the part worth
// automating. A garment whose collar is not where the shipped collars are — a
// high cowl, a raised hood — can score BETTER by shrinking until its whole
// silhouette nests inside the shoulder band than by sitting on the shoulders
// honestly. The objective is genuinely maximised there. It is a real optimum and
// the wrong answer, so a low score does not distinguish it from a legitimately
// unusual garment: 0.66 and 0.72 are unremarkable numbers.
//
// The SCALE is what gives it away. Every plate on the 1024x1536 canvas fitted
// between 0.86 and 1.05; these two came back at 0.47 and 0.51. Nothing that is
// really a garment for this body is half the size of every other garment drawn on
// the same sheet. So: take the median scale of the fits that scored well, grouped
// by source canvas, and flag anything far outside it. That reads the threshold off
// the plates that worked rather than off a number anyone chose, and it caught both
// failures with no false positives.
//
// CORRECTING them automatically is what did not work, and the record is here so
// the next person does not spend the afternoon I did:
//
//   - Re-running the search with the scale confined to the peer band pins itself
//     to the floor of whatever band it is given. For these shapes the objective
//     really is monotone — every pixel smaller is every pixel less spill — so
//     constraining the range only moves where it bottoms out.
//   - Matching the shoulder SPAN instead (same width, same midpoint, same row)
//     centres them correctly and sizes them plausibly, and still sits them a
//     neck's width too low. The measurement is consistent enough to calibrate —
//     the ratio between the two families came back at 0.857 across 21 trusted
//     fits, spread 0.809-0.908 — but a chunky knit's outer shoulder is not the
//     same landmark as a jacket's, so matching it oversizes the sweater by about
//     a fifth and the cowl then dwarfs the head.
//
// Both are plausible and both are wrong, which is the argument for a lab rather
// than a cleverer objective: two plates out of twenty-three need a person to look,
// and what is worth automating is making sure that person is TOLD which two.
const TRUSTED_IOU = 0.85;   // a fit good enough to vote on what "normal scale" is
const SCALE_BAND = 0.25;    // outside ±25% of its peers' median, a fit is not believed

// ---------------------------------------------------------------------------
// pixels
// ---------------------------------------------------------------------------

async function rgba(file, { deframe = false } = {}) {
  let p = sharp(file).ensureAlpha();
  if (deframe) {
    const m = await sharp(file).metadata();
    p = sharp(file).ensureAlpha().extract({
      left: FRAME.left, top: FRAME.top,
      width: m.width - FRAME.left - FRAME.right,
      height: m.height - FRAME.top - FRAME.bottom,
    });
  }
  const { data, info } = await p.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, c: info.channels };
}

function alphaMask({ data, w, h, c }) {
  const a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = data[i * c + 3] > ALPHA_FLOOR ? 1 : 0;
  return { a, w, h };
}

function boxOf({ a, w, h }) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!a[y * w + x]) continue;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// ---------------------------------------------------------------------------
// which plates are garments
// ---------------------------------------------------------------------------
// The batch mixes garments and hairstyles in one folder with UUID filenames, so
// there is no name to read. It follows the delivery convention the avatar
// pipeline already relies on, though — one plate per SHAPE in a single colour —
// and here that colour is red for every garment and blonde for every hair.
//
// So: which hue does the plate's saturated ink hold MORE of. Not the median
// hue, which was the first thing I tried and which got two of the twenty-three
// garments wrong — a varsity jacket with big cream sleeve panels and a red vest
// with cream arms are both more than half cream, so their median lands in the
// blonde band and they were filed as hairstyles. Red is the thing a garment in
// this batch always has some of and a blonde hairstyle never has any of, which
// makes the comparison the reliable question and the average the misleading one.
//
// Self-checking on purpose: a plate where neither population is clear is
// reported UNSURE rather than guessed at, because a hairstyle silently fitted to
// a torso is the exact failure this whole script exists to avoid.
function hueMix({ data, w, h, c }) {
  let red = 0, yellow = 0, other = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i * c + 3] < 250) continue;
    const r = data[i * c] / 255, g = data[i * c + 1] / 255, b = data[i * c + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    const l = (mx + mn) / 2;
    if (d < 0.22 || l < 0.18 || l > 0.9) continue;  // grey, shadow, highlight
    let hdeg;
    if (mx === r) hdeg = 60 * (((g - b) / d) % 6);
    else if (mx === g) hdeg = 60 * ((b - r) / d + 2);
    else hdeg = 60 * ((r - g) / d + 4);
    hdeg = (hdeg + 360) % 360;
    if (hdeg <= 22 || hdeg >= 338) red++;
    else if (hdeg >= 30 && hdeg <= 62) yellow++;
    else other++;
  }
  const n = red + yellow + other;
  return n ? { red: red / n, yellow: yellow / n, n } : null;
}

const classify = (mix) => {
  if (!mix || mix.n < 5000) return "unsure";
  // A garment always carries a real red population; a blonde hairstyle carries
  // none worth the name. Measured over this batch the two groups are nowhere
  // near each other: the reddest of the fifteen hairstyles is 2.2% red (warm
  // shadow in the blonde), the least-red of the twenty-three garments is 47.5%.
  // 20% sits in the middle of a gap that wide, so this threshold is not tuned
  // to the batch and a future delivery would have to be very strange to trouble
  // it — and if it is, the plate comes back UNSURE and gets looked at.
  if (mix.red >= 0.2) return "outfit";
  if (mix.yellow >= 0.3 && mix.red < 0.05) return "hair";
  return "unsure";
};

// ---------------------------------------------------------------------------
// the reference body
// ---------------------------------------------------------------------------

async function referenceBody() {
  const files = (await readdir(REF)).filter((f) => /^outfit_/.test(f));
  if (files.length < 3) throw new Error(`need at least 3 shipped outfits in ${REF}, found ${files.length}`);
  const vote = new Uint16Array(CANVAS * CANVAS);
  for (const f of files) {
    const m = alphaMask(await rgba(REF + f, { deframe: true }));
    if (m.w !== CANVAS || m.h !== CANVAS) throw new Error(`${f} de-frames to ${m.w}x${m.h}, expected ${CANVAS}`);
    for (let i = 0; i < vote.length; i++) vote[i] += m.a[i];
  }
  // "At least three of five" — a simple majority of the shipped garments. Union
  // would inflate the body to the widest sleeve in the set; intersection would
  // shrink it to the narrowest cardigan. The majority is the child.
  const need = Math.ceil(files.length / 2);
  const body = new Uint8Array(CANVAS * CANVAS);
  for (let i = 0; i < body.length; i++) body[i] = vote[i] >= need ? 1 : 0;
  const bb = boxOf({ a: body, w: CANVAS, h: CANVAS });

  const bandY1 = bb.y0 + Math.round(bb.h * 0.42);
  const band = new Uint8Array(CANVAS * CANVAS);
  let n = 0;
  for (let y = bb.y0; y <= bandY1; y++) for (let x = 0; x < CANVAS; x++) {
    if (body[y * CANVAS + x]) { band[y * CANVAS + x] = 1; n++; }
  }
  return { band, n, bb, bandY1, sources: files.length };
}

// ---------------------------------------------------------------------------
// the fit
// ---------------------------------------------------------------------------

function overlap(ref, src, sw, sh, scale, dx, dy) {
  let inter = 0, mine = 0;
  for (let y = ref.bb.y0; y <= ref.bandY1; y++) {
    const sy = Math.round((y - dy) / scale);
    if (sy < 0 || sy >= sh) continue;
    for (let x = ref.bb.x0; x <= ref.bb.x1; x++) {
      const sx = Math.round((x - dx) / scale);
      if (sx < 0 || sx >= sw) continue;
      if (!src[sy * sw + sx]) continue;
      mine++;
      if (ref.band[y * CANVAS + x]) inter++;
    }
  }
  return {
    iou: inter / (ref.n + mine - inter),
    cover: inter / ref.n,
    spill: mine ? (mine - inter) / mine : 1,
  };
}

function fit(ref, mask) {
  const nb = boxOf(mask);
  const seed = ref.bb.w / nb.w;
  let best = null;
  // Coarse sweep. The ranges are wide because the batch's plates vary by a
  // factor of 1.5 in canvas size and the garment sits anywhere in the frame.
  for (let si = -14; si <= 14; si++) {
    const scale = seed * (1 + si * 0.035);
    for (let xi = -10; xi <= 10; xi++) {
      const dx = (ref.bb.x0 + ref.bb.w / 2) - (nb.x0 + nb.w / 2) * scale + xi * 9;
      for (let yi = -14; yi <= 14; yi++) {
        const dy = ref.bb.y0 - nb.y0 * scale + yi * 11;
        const r = overlap(ref, mask.a, mask.w, mask.h, scale, dx, dy);
        if (!best || r.iou > best.iou) best = { ...r, scale, dx, dy };
      }
    }
  }
  for (const [step, px] of [[0.012, 4], [0.005, 2], [0.002, 1]]) {
    let b = best;
    for (let si = -3; si <= 3; si++) for (let xi = -3; xi <= 3; xi++) for (let yi = -3; yi <= 3; yi++) {
      const scale = best.scale * (1 + si * step);
      const dx = best.dx + xi * px, dy = best.dy + yi * px;
      const r = overlap(ref, mask.a, mask.w, mask.h, scale, dx, dy);
      if (r.iou > b.iou) b = { ...r, scale, dx, dy };
    }
    best = b;
  }
  return best;
}

// Draw the garment onto the shipped 1183 canvas at the fitted transform, then
// down to the output size. Composite offsets cannot be negative, so the part of
// the garment that falls off the top or left is cropped away first.
async function place(file, { scale, dx, dy }, size) {
  const m = await sharp(file).metadata();
  const w = Math.max(1, Math.round(m.width * scale)), h = Math.max(1, Math.round(m.height * scale));
  const scaled = await sharp(file).ensureAlpha().resize(w, h).png().toBuffer();
  const left = Math.round(dx), top = Math.round(dy);
  const sx = Math.max(0, -left), sy = Math.max(0, -top);
  const vw = Math.min(w - sx, CANVAS - Math.max(0, left));
  const vh = Math.min(h - sy, CANVAS - Math.max(0, top));
  if (vw <= 0 || vh <= 0) return null;
  const crop = await sharp(scaled).extract({ left: sx, top: sy, width: vw, height: vh }).png().toBuffer();
  // Two pipelines, not one. sharp runs resize BEFORE composite whatever order
  // you call them in, so chaining .composite().resize() shrinks the 1183 canvas
  // to 600 first and then refuses the 1183-wide garment as too big to composite
  // onto it. Land the garment, then resize what came out.
  const full = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: crop, left: Math.max(0, left), top: Math.max(0, top) }])
    .png().toBuffer();
  return sharp(full).resize(size, size).webp({ quality: 88 }).toBuffer();
}

// ---------------------------------------------------------------------------

const ref = await referenceBody();
console.log(`reference body from ${ref.sources} shipped outfits: bbox ${ref.bb.x0},${ref.bb.y0} ${ref.bb.w}x${ref.bb.h}, shoulder band to y=${ref.bandY1} (${ref.n.toLocaleString()} px)`);

const all = (await readdir(SRC)).filter((f) => /\.png$/i.test(f)).sort();
if (!all.length) throw new Error(`no PNGs in ${SRC}`);

// The batch ships some plates more than once (an export slip — same bytes, a
// "-1"/"-2" suffix). Hash first so a duplicate is not fitted, written and shown
// to Joshua three times as if it were three garments.
const seen = new Map();
const dupes = [];
for (const f of all) {
  const h = createHash("sha1").update(await readFile(SRC + f)).digest("hex");
  if (seen.has(h)) dupes.push([f, seen.get(h)]);
  else seen.set(h, f);
}
const unique = [...seen.values()].sort();
console.log(`${all.length} files, ${unique.length} unique (${dupes.length} exact duplicates skipped)`);

await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });

// ---- pass 1: fit every garment freely -------------------------------------
const skipped = [];
const fits = [];
for (const f of unique) {
  const px = await rgba(SRC + f);
  const kind = classify(hueMix(px));
  if (kind !== "outfit") { skipped.push({ file: f, kind }); continue; }
  const mask = alphaMask(px);
  fits.push({ f, px, mask, found: fit(ref, mask), suspect: null });
}

// ---- pass 2: re-fit anything whose SCALE disagrees with its peers ----------
// Grouped by source canvas, because a garment painted on a 1536x1024 sheet is a
// different number from the same garment on 1024x1536 and averaging them would
// say nothing. See SCALE_PRIOR above for why scale, not score, is the tell.
const median = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];
const groups = new Map();
for (const e of fits) {
  if (e.found.iou < TRUSTED_IOU) continue;
  const key = e.px.w + "x" + e.px.h;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(e.found.scale);
}
for (const [key, scales] of groups) {
  console.log(`  scale prior for ${key}: median ${median(scales).toFixed(4)} from ${scales.length} trusted fits`);
}
for (const e of fits) {
  const key = e.px.w + "x" + e.px.h;
  const peers = groups.get(key);
  if (!peers || peers.length < 3) continue;          // too few to have an opinion
  const mid = median(peers);
  const lo = mid * (1 - SCALE_BAND), hi = mid * (1 + SCALE_BAND);
  if (e.found.scale >= lo && e.found.scale <= hi) continue;
  e.suspect = { band: [+lo.toFixed(4), +hi.toFixed(4)], peerMedian: +mid.toFixed(4) };
  const fixed = MANUAL[e.f] ? "corrected in MANUAL" : "⚠ NOT CORRECTED — open the lab and set it";
  console.log(`  ⚠ ${e.f.slice(0, 8)} fitted at ${e.found.scale.toFixed(4)}, outside ${lo.toFixed(3)}-${hi.toFixed(3)} for ${key} — ${fixed}`);
}

// ---- write ----------------------------------------------------------------
const plates = [];
for (const e of fits) {
  const { f, px, found } = e;
  const man = MANUAL[f] || {};
  const t = {
    scale: found.scale * (man.scale ?? 1),
    dx: found.dx + (man.dx ?? 0),
    dy: found.dy + (man.dy ?? 0),
  };
  const out = `outfit_lab_${f.replace(/\.png$/i, "").slice(0, 8)}.webp`;
  const buf = await place(SRC + f, t, SIZE);
  if (!buf) { skipped.push({ file: f, kind: "off-canvas" }); continue; }
  await writeFile(DEST + out, buf);
  plates.push({
    id: out.replace(/\.webp$/, ""), file: out, source: f,
    canvas: [px.w, px.h],
    fit: { scale: +t.scale.toFixed(5), dx: Math.round(t.dx), dy: Math.round(t.dy) },
    manual: Object.keys(man).length ? man : null,
    // A plate whose fitted scale disagreed with its peers records that, so the
    // lab can say "this one was placed by hand and here is why" rather than the
    // judgement quietly disappearing into a number.
    suspect: e.suspect,
    quality: { iou: +found.iou.toFixed(3), cover: +found.cover.toFixed(3), spill: +found.spill.toFixed(3) },
    kb: Math.round(buf.length / 1024),
  });
  console.log(`  ${out}  scale=${t.scale.toFixed(4)} dx=${Math.round(t.dx)} dy=${Math.round(t.dy)}  IoU=${found.iou.toFixed(3)} cover=${found.cover.toFixed(3)} spill=${found.spill.toFixed(3)}  ${Math.round(buf.length / 1024)}KB${e.suspect ? "  ⚠ hand-placed" : ""}`);
}

plates.sort((a, b) => a.quality.iou - b.quality.iou);
await writeFile(DEST + "manifest.json", JSON.stringify({
  built: new Date().toISOString().slice(0, 10),
  src: arg("src", "NOT YET USED Shutterbug more avatar assets"),
  canvas: SIZE,
  refCanvas: CANVAS,
  reference: { sources: ref.sources, bbox: ref.bb, bandY1: ref.bandY1 },
  plates,
  skipped,
  duplicates: dupes.map(([a, b]) => ({ file: a, sameAs: b })),
}, null, 1) + "\n");

const worst = plates.slice(0, 3).map((p) => `${p.source.slice(0, 8)} ${p.quality.iou}`).join(", ");
console.log(`\n${plates.length} garments written to public/outfit-lab/`);
console.log(`${skipped.filter((s) => s.kind === "hair").length} hair plates skipped (this lab fits torsos; hair needs the head as its reference)`);
const unsure = skipped.filter((s) => s.kind === "unsure");
if (unsure.length) console.log(`⚠ ${unsure.length} plates could not be classified by colour: ${unsure.map((s) => s.file).join(", ")}`);
console.log(`worst three fits: ${worst}`);
console.log(`\nnpm run dev  →  http://localhost:5173/outfit-lab.html`);
