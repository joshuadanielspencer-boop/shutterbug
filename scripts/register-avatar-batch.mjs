// ===========================================================================
// PROMOTE FITTED LAB PLATES INTO A DELIVERY THE REAL AVATAR BUILD CAN READ.
//
//   node scripts/register-avatar-batch.mjs            # writes the registered set
//   node scripts/register-avatar-batch.mjs --dry      # just print the naming
//
// Reads   public/outfit-lab/manifest.json  (what scripts/outfit-lab.mjs judged)
//         the delivery folder it was fitted from (the pristine paintings)
// Writes  Images/Avatar designs-registered/<part>_<sex>_<variant>_<colour>.png
//         — 1200x1200, with the same black presentation frame the first delivery
//         carries, each garment or hairstyle placed at its fitted transform.
//
// This is the bridge between the two pipelines, and it is deliberately a
// separate step from both. The lab (outfit-lab.mjs) answers "does this plate
// line up?" and is allowed to be wrong, flagged, nudged and re-run all day; the
// real build (build-avatar-layers.mjs) assumes everything it reads is already
// registered and does no fitting at all. Nothing should flow from the first to
// the second except by a person looking at the lab and running this. So this
// script has no fitting logic of its own: it takes the transform the lab settled
// on, MANUAL corrections included, and bakes it into a plate on the delivery
// template. If the lab is wrong, fix the lab.
//
// WHY THE OUTPUT IS A FAKE DELIVERY. build-avatar-layers.mjs reads one folder of
// framed 1200x1200 PNGs whose FILENAMES are the content spec. Teaching it a
// second, differently-shaped input would mean a second code path through the
// canvas check, the de-frame and the recolour — the three things that keep the
// wardrobe honest. Writing the registered plates in the same shape as Joshua's
// own delivery means that script does not know these ever needed fitting, and
// its "is this batch registered against the others?" check runs on them like
// on anything else. The folder is a sibling of the delivery, not inside it,
// because that one holds only pristine paintings and this holds derived files.
//
// THE NAMES. The batch's UUID filenames carry nothing, so the sex, variant and
// style come from SPLIT below — Joshua's boy/girl assignment from the numbered
// sheets, agreed 2026-09-28. Every item is assigned (his call: no unisex items
// in the new batch), the five shipped outfits stay `any` and so remain offered
// to everyone, and the variant numbering continues each sex's existing run:
// male hair is numbered (1-4 shipped, 5- here), female hair lettered (a-d
// shipped, e- here); outfits had no sex before, so both runs start at 6 with a
// sex token, which the name grammar in build-avatar-layers.mjs already parses.
// ===========================================================================
import sharp from "sharp";
import { readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const REPO = new URL("../", import.meta.url);
const LAB = fileURLToPath(new URL("public/outfit-lab/", REPO));
const OUT = fileURLToPath(new URL("Images/Avatar designs-registered/", REPO));
const DRY = process.argv.includes("--dry");

// The first delivery's template: 1200x1200 with a 6px top/left, 11px
// bottom/right black frame; the canvas inside is 1183x1183. Same numbers as the
// two scripts either side of this one.
const CANVAS_OUT = 1200;
const FRAME = { top: 6, left: 6, bottom: 11, right: 11 };
const INNER = 1183;

// Joshua's split, keyed by the first 8 characters of the source filename — the
// same keys the lab's numbered review sheets used (G1-G23, H1-H15, in filename
// order). `style` is the garment word the name grammar takes as the last token;
// one word only, or the grammar reads the extra words as colour.
const SPLIT = {
  // ---- garments: boys ----
  "0339b73c": { sex: "male",   style: "varsity" },     // G1  letterman jacket with the R
  "152dd1bd": { sex: "male",   style: "parka" },       // G2  hooded utility coat
  "18f93964": { sex: "male",   style: "bomber" },      // G4  striped bomber
  "1aeabbfb": { sex: "male",   style: "trackjacket" }, // G6  track jacket, sleeve stripes
  "257e46fc": { sex: "male",   style: "jacket" },      // G7  plain zip jacket
  "2cd34b3c": { sex: "male",   style: "letterman" },   // G8  varsity, cream sleeves
  "460f7aab": { sex: "male",   style: "fieldjacket" }, // G10 pocketed field jacket
  "606af8a6": { sex: "male",   style: "hoodedvest" },  // G12 vest over hooded shirt
  "6bef2e43": { sex: "male",   style: "hoodie" },      // G14 zip hoodie, stripes
  "c41541d7": { sex: "male",   style: "puffer" },      // G18 padded coat, hood up
  "d7e0f5fa": { sex: "male",   style: "anorak" },      // G20 hooded pullover coat
  "e5c13582": { sex: "male",   style: "windbreaker" }, // G22 half-zip windbreaker
  // ---- garments: girls ----
  "15572fd2": { sex: "female", style: "boleroblouse" },// G3  cropped jacket, bow at the neck
  "1a562cb5": { sex: "female", style: "varsity" },     // G5  cream-bodied varsity
  "3a9ca98c": { sex: "female", style: "quilted" },     // G9  quilted jacket, cream collar
  "4d6dfc39": { sex: "female", style: "bowjacket" },   // G11 jacket with bows on the pockets
  "6bea059e": { sex: "female", style: "sailordress" }, // G13 sailor-collar dress
  "8a4aabba": { sex: "female", style: "cardigan" },    // G15 V-neck cardigan
  "8f47d6ba": { sex: "female", style: "cowlsweater" }, // G16 cowl-neck sweater with scarf
  "9c22542b": { sex: "female", style: "puffdress" },   // G17 puff-sleeve dress with bow
  "d74c087c": { sex: "female", style: "sweatshirt" },  // G19 plain sweatshirt
  "e486db36": { sex: "female", style: "cableknit" },   // G21 cable-knit sweater
  "fc9749b0": { sex: "female", style: "romper" },      // G23 bow romper
  // ---- hair: boys ----
  "2f3531b9": { sex: "male" },    // H2  swept crop
  "33f2e211": { sex: "male" },    // H3  spiky crop
  "51f8e591": { sex: "male" },    // H4  tousled, longer sweep
  "5807db33": { sex: "male" },    // H6  spiky
  "675e1279": { sex: "male" },    // H7  bowl cut
  "6c5e8d65": { sex: "male" },    // H8  messy crop
  "d636a54d": { sex: "male" },    // H14 wild spikes
  // ---- hair: girls ----
  "1c662219": { sex: "female" },  // H1  side ponytail
  "57aa0aa6": { sex: "female" },  // H5  long, centre part
  "9091a7c7": { sex: "female" },  // H9  shoulder-length waves
  "9f1b0c96": { sex: "female" },  // H10 low side ponytail
  "ab3d9566": { sex: "female" },  // H11 long with fringe
  "c0b5b402": { sex: "female" },  // H12 bob with fringe
  "c46f8f93": { sex: "female" },  // H13 braid
  "f981d36f": { sex: "female" },  // H15 space buns
};

// Where each sex's variant run continues from. Read off the shipped delivery
// rather than assumed: male hair 1-4 → next is 5; female hair a-d → next is e;
// outfits 1-5 with no sex → each sex starts a fresh run at 6 so the numbers
// cannot collide with the unisex five.
const NEXT = { hair: { male: 5, female: "e" }, outfit: { male: 6, female: 6 } };
const bump = (v) => (typeof v === "number" ? v + 1 : String.fromCharCode(v.charCodeAt(0) + 1));

const lab = JSON.parse(await readFile(LAB + "manifest.json", "utf8"));
const SRC = fileURLToPath(new URL(lab.src + "/", REPO));
if (lab.refCanvas !== INNER) throw new Error(`lab was fitted on a ${lab.refCanvas} canvas, this writes ${INNER}`);

// The colour word is the batch's own convention — every garment red, every
// hairstyle blonde — and it has to be TRUE, because the recolour masks on it.
const COLOUR = { outfit: "red", hair: "blonde" };

// Stable order: by part, then sex, then the review-sheet order (filename order),
// so the variant numbers land in the same order the sheets were read in.
const plates = [...lab.plates].sort((a, b) => a.part.localeCompare(b.part) || a.source.localeCompare(b.source));
const counters = JSON.parse(JSON.stringify(NEXT));
const jobs = [];
const unassigned = [];
for (const p of plates) {
  const key = p.source.slice(0, 8);
  const split = SPLIT[key];
  if (!split) { unassigned.push(p.source); continue; }
  const variant = counters[p.part][split.sex];
  counters[p.part][split.sex] = bump(variant);
  const tokens = [p.part, split.sex, variant, COLOUR[p.part]];
  if (p.part === "outfit") tokens.push(split.style);
  jobs.push({ p, name: tokens.join("_") + ".png", split });
}
if (unassigned.length) {
  console.error(`\n! ${unassigned.length} fitted plate(s) have no entry in SPLIT and were NOT written:\n  ${unassigned.join("\n  ")}\nEvery item is assigned a sex on purpose; add them.`);
}

for (const j of jobs) {
  const flag = j.p.manual ? "  ✎ hand-placed" : "";
  console.log(`  ${j.p.source.slice(0, 8)}  →  ${j.name}${flag}`);
}
console.log(`\n${jobs.length} plates${DRY ? " (dry run — nothing written)" : ` → ${OUT}`}`);
if (DRY) process.exit(0);

// Place the painting at its fitted transform on the 1183 inner canvas, then put
// the delivery frame around it. Composite offsets can't be negative, so the part
// of the painting that falls above or left of the canvas is cropped off first.
// Two sharp pipelines, because sharp applies resize before composite whatever
// order you call them in (the lab learned this the hard way).
async function registered(file, { scale, dx, dy }) {
  const m = await sharp(file).metadata();
  const w = Math.max(1, Math.round(m.width * scale)), h = Math.max(1, Math.round(m.height * scale));
  const scaled = await sharp(file).ensureAlpha().resize(w, h).png().toBuffer();
  const left = Math.round(dx), top = Math.round(dy);
  const sx = Math.max(0, -left), sy = Math.max(0, -top);
  const vw = Math.min(w - sx, INNER - Math.max(0, left)), vh = Math.min(h - sy, INNER - Math.max(0, top));
  if (vw <= 0 || vh <= 0) throw new Error(`${file} lands entirely off the canvas`);
  const crop = await sharp(scaled).extract({ left: sx, top: sy, width: vw, height: vh }).png().toBuffer();
  const inner = await sharp({ create: { width: INNER, height: INNER, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: crop, left: Math.max(0, left), top: Math.max(0, top) }]).png().toBuffer();
  // The frame is opaque black, exactly as the first delivery's is — the build's
  // de-frame extracts the interior by pixel offsets, so what the border is made
  // of does not matter, but matching it means a plate from here is
  // indistinguishable from a plate Joshua exported.
  return sharp(inner)
    .extend({ ...FRAME, background: { r: 0, g: 0, b: 0, alpha: 255 } })
    .png()
    .toBuffer();
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
let bytes = 0;
for (const j of jobs) {
  const buf = await registered(SRC + j.p.source, j.p.fit);
  const meta = await sharp(buf).metadata();
  if (meta.width !== CANVAS_OUT || meta.height !== CANVAS_OUT) throw new Error(`${j.name} is ${meta.width}x${meta.height}, not ${CANVAS_OUT}`);
  await writeFile(OUT + j.name, buf);
  bytes += buf.length;
}
console.log(`written: ${jobs.length} plates, ${(bytes / 1024 / 1024).toFixed(1)} MB\n`);
console.log(`next:  node scripts/build-avatar-layers.mjs --also "Images/Avatar designs-registered"`);
