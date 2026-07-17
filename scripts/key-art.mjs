// Cut the background off delivered art so it can sit on the game's own scenery.
//
//   node scripts/key-art.mjs green  <out-dir> <file...>   # chroma-key a green screen
//   node scripts/key-art.mjs check  <out-dir> <file...>   # key a painted "transparency" checkerboard
//   …add --preview to write <out-dir>/_preview.png over a blue field instead of installing
//
// The drops arrive as flat RGB with no alpha, and in two flavours:
//
//   GREEN  — camera-bag, the dog poses: a real chroma-key green (~17,213,33). Keyed
//            on hue, not on distance to one colour, so the anti-aliased fringe goes
//            too; every kept pixel then has the leftover green spill pulled out of
//            it, or the art wears a lime halo on any background but green.
//
//   CHECK  — the hello bubbles: the generator PAINTED a fake transparency
//            checkerboard (alternating 243/254 grey) instead of writing an alpha
//            channel. It can't be keyed by colour: the bubbles have a flat 255 white
//            rim, and the checkerboard contains 255 too. What saves it is that the
//            artist also drew a drop shadow BETWEEN the two, dipping to ~210 — so a
//            flood fill inward from the border, stopping at anything darker than
//            CHECK_FLOOR, eats the checkerboard and halts in the shadow without ever
//            reaching the rim. Flood fill, not a colour test, because only the fill
//            knows "connected to the border" — the white rim is the same colour and
//            must stay.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const GREEN_HUE = [80, 165];   // degrees; the delivered screens sit near 130
const GREEN_SAT = 0.35;        // below this it's a grey/skin pixel that happens to lean green
const CHECK_MARGIN = 5;        // how far below the darkest border grey the fill may still go

const [mode, outDir, ...rest] = process.argv.slice(2);
const preview = rest.includes("--preview");
const files = rest.filter((f) => !f.startsWith("--"));
if (!["green", "check"].includes(mode) || !outDir || !files.length) {
  console.error('usage: node scripts/key-art.mjs <green|check> <out-dir> <file...> [--preview]');
  process.exit(1);
}

const rgb2hsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  }
  return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx];
};

async function keyGreen(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  let cut = 0;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const [hu, sa] = rgb2hsv(r, g, b);
    if (hu >= GREEN_HUE[0] && hu <= GREEN_HUE[1] && sa >= GREEN_SAT) { data[i + 3] = 0; cut++; continue; }
    // Spill suppression: a green edge pixel keeps a green cast that reads as a lime
    // outline once the screen is gone. Cap green at the brighter of its neighbours.
    const cap = Math.max(r, b);
    if (g > cap) data[i + 1] = Math.round(cap + (g - cap) * 0.15);
  }
  return { w, h, ch, data, cut };
}

async function keyCheckerboard(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const lum = (i) => (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  // The checkerboard's darker square isn't the same grey in every drop — it runs
  // 233..243 across the twenty. A fixed floor therefore either leaves a grid of
  // remnants on the darker ones or eats into the lighter ones' shadows, so read it
  // off THIS image's border, which is guaranteed to be background.
  let darkestBorder = 255;
  for (let x = 0; x < w; x++) {
    darkestBorder = Math.min(darkestBorder, lum(x * ch), lum(((h - 1) * w + x) * ch));
  }
  for (let y = 0; y < h; y++) {
    darkestBorder = Math.min(darkestBorder, lum(y * w * ch), lum((y * w + w - 1) * ch));
  }
  const floor = darkestBorder - CHECK_MARGIN;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    if (lum(p * ch) < floor) return;   // the drawn shadow — stop here, the rim is past it
    seen[p] = 1; stack.push(p);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w, y = (p - x) / w;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  let cut = 0;
  for (let p = 0; p < w * h; p++) if (seen[p]) { data[p * ch + 3] = 0; cut++; }
  return { w, h, ch, data, cut };
}

await mkdir(outDir, { recursive: true });
const outs = [];
for (const f of files) {
  const { w, h, ch, data, cut } = mode === "green" ? await keyGreen(f) : await keyCheckerboard(f);
  const png = await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .trim({ threshold: 0 })          // drop the now-empty margin so the art fills its box
    .png().toBuffer();
  outs.push({ name: basename(f), png });
  console.log(`  ${basename(f).padEnd(42)} ${((100 * cut) / (w * h)).toFixed(0).padStart(3)}% cut away`);
}

if (preview) {
  const CELL = 190, cols = Math.min(outs.length, 7), rows = Math.ceil(outs.length / cols);
  const tiles = await Promise.all(outs.map((o) => sharp(o.png).resize(CELL - 12, CELL - 12, { fit: "inside" }).toBuffer()));
  const sheet = await sharp({ create: { width: cols * CELL, height: rows * CELL, channels: 4, background: "#3B76C9" } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * CELL + 6, top: Math.floor(i / cols) * CELL + 6 })))
    .png().toBuffer();
  await writeFile(join(outDir, "_preview.png"), sheet);
  console.log(`\npreview → ${join(outDir, "_preview.png")} (on sky blue; nothing installed)`);
} else {
  for (const o of outs) await writeFile(join(outDir, o.name), o.png);
  console.log(`\ninstalled ${outs.length} → ${outDir}`);
}
