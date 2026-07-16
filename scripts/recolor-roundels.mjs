// Recolour the continent roundels so each landmass wears its colour from the
// game's continent palette, matching the world map a child just clicked.
//
//   node scripts/recolor-roundels.mjs --src "<folder of the original roundel PNGs>"
//   node scripts/recolor-roundels.mjs --src "…" --preview   # write a contact sheet, don't install
//
// The art was delivered as seven identical teal-and-gold discs, distinguished only
// by the landmass shape. On the world map the OCEAN is dark and the CONTINENT is
// coloured, so the colour belongs on the land: the dark teal field stays put as
// sea, and only the gold landmass is re-hued. Two things make that safe:
//
//   • Legibility survives any hue. Land sits at value ~0.85 and sea at ~0.19, so
//     the land/sea read is carried by VALUE, not hue — recolouring can't muddy it,
//     even for Africa's orange or Oceania's yellow.
//   • The rim is spared. The frame is gold too, so a naive "recolour all gold"
//     would swallow it and the seven would stop reading as one set. The land sits
//     at radius <0.7 and the rim spikes at 0.9, so a radial cut at RIM_R splits
//     them cleanly.
//
// Reads the ORIGINAL full-colour drop, not the installed copies — recolouring an
// already-quantized PNG and re-quantizing it compounds the loss, and re-running
// against public/ would hue-shift a second time. Run optimize-ui-art.mjs after.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// From CONTINENT_COLOR in src/shutterbug-world.jsx. Keep in sync — a roundel that
// disagrees with the map region it stands for is worse than a plain one.
const CONTINENT_COLOR = {
  "north-america": "#3B76C9", // blue
  "south-america": "#4CA362", // green
  "africa":        "#E39A3E", // orange
  "europe":        "#8E6BB0", // purple
  "asia":          "#D2564B", // red
  "oceania":       "#E9C33F", // yellow
  "antarctica":    "#EDEDE6", // white
};

const RIM_R = 0.86;      // radial cut (fraction of half-width): land inside, frame outside
const GOLD = [15, 65];   // hue window of the delivered landmass, in degrees
const MIN_SAT = 0.18;    // below this it's parchment texture, not land
const MIN_VAL = 0.30;    // below this it's shadow

const args = process.argv.slice(2);
const srcDir = args[args.indexOf("--src") + 1];
const preview = args.includes("--preview");
if (!srcDir || srcDir.startsWith("--")) {
  console.error('usage: node scripts/recolor-roundels.mjs --src "<folder>" [--preview]');
  process.exit(1);
}
const outDir = fileURLToPath(new URL("../public/assets/shutterbug-ui/roundels/", import.meta.url));
const previewDir = fileURLToPath(new URL("../", import.meta.url));

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx];
}
function hsv2rgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return t.map((n) => Math.round((n + m) * 255));
}

async function recolor(slug, hex) {
  const src = join(srcDir, `roundel-${slug}.png`);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const [tr, tg, tb] = hex2rgb(hex);
  const [th, ts] = rgb2hsv(tr, tg, tb);
  const cx = w / 2, cy = h / 2, half = w / 2;
  let touched = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      if (data[i + 3] < 8) continue;
      if (Math.hypot(x - cx, y - cy) / half >= RIM_R) continue;   // leave the frame alone
      const [ph, ps, pv] = rgb2hsv(data[i], data[i + 1], data[i + 2]);
      if (ph < GOLD[0] || ph > GOLD[1] || ps < MIN_SAT || pv < MIN_VAL) continue;

      // Keep the pixel's own value so the illustrator's shading and edge work
      // survive; take the target's hue, and scale saturation by how saturated this
      // pixel was relative to the delivered gold (~0.55). Antarctica's near-zero
      // saturation therefore lands as shaded white rather than flat white.
      const [nr, ng, nb] = hsv2rgb(th, Math.min(1, ps * (ts / 0.55)), pv);
      data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
      touched++;
    }
  }
  const png = await sharp(data, { raw: { width: w, height: h, channels: ch } }).png().toBuffer();
  return { slug, png, touched };
}

const results = [];
for (const [slug, hex] of Object.entries(CONTINENT_COLOR)) {
  const r = await recolor(slug, hex);
  results.push(r);
  console.log(`  ${slug.padEnd(15)} ${hex}  ${r.touched.toLocaleString()} px re-hued`);
}

if (preview) {
  const CELL = 200;
  const tiles = await Promise.all(results.map((r) => sharp(r.png).resize(CELL, CELL).toBuffer()));
  const sheet = await sharp({
    create: { width: CELL * results.length, height: CELL, channels: 4, background: "#F4ECD8" },
  })
    .composite(tiles.map((input, i) => ({ input, left: i * CELL, top: 0 })))
    .png().toBuffer();
  await writeFile(join(previewDir, "roundel-preview.png"), sheet);
  console.log("\npreview → roundel-preview.png (not installed)");
} else {
  await mkdir(outDir, { recursive: true });
  for (const r of results) await writeFile(join(outDir, `roundel-${r.slug}.png`), r.png);
  console.log(`\ninstalled ${results.length} → public/assets/shutterbug-ui/roundels/`);
  console.log("now run: node scripts/optimize-ui-art.mjs roundels");
}
