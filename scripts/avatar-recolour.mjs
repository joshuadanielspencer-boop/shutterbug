// Generate the avatar colour range from Joshua's base art.
//
// Used by scripts/build-avatar-layers.mjs; not run directly.
//
// THE PROBLEM THIS SOLVES. The delivery is one painting per SHAPE, not per
// colour: one head, two sets of eyes, eight hairstyles, five outfits — and each
// of them arrives in exactly one colour. What the game needs is every shape in
// every colour, which is 100-odd plates. Painting them by hand is a month of
// work and a month of drift; generating them is this file.
//
// WHY THIS IS SAFE TO DO AUTOMATICALLY. The art is soft-shaded painting, and the
// thing that makes a recolour look painted rather than filtered is keeping the
// shading and changing only the dye. In HSL that is exactly what it sounds like:
// take the pixel's distance from its own colour's median lightness, and re-hang
// it under a new median. SHIFT the lightness, never SCALE it — scaling by
// target/source squashes every fold toward zero for a dark target and turns a
// painted jacket into a flat slab. (scripts/avatar-brows.mjs learned this first;
// the same note is in its recolourBrows.)
//
// WHAT THE MASK IS FOR, AND WHY IT IS NOT "EVERYTHING". Only the hair plates are
// a single dyed thing. Everywhere else the plate holds several materials that
// must NOT move together:
//
//   eyes    the iris is the only coloured part. The sclera, the lash line and
//           the pupil stay exactly as painted — a green-eyed child still has
//           white eyes and black lashes.
//   outfit  the colour word in the FILENAME names the garment that carries the
//           colour, and it is a different garment each time. outfit_1/2/3_blue
//           are blue jackets over a tan shirt. outfit_4_purple is a purple
//           cardigan over a cream shirt with a yellow star. outfit_5_red is a
//           RED T-SHIRT under a blue denim jacket — 45% of that plate is denim
//           and only 16% is the thing being recoloured. So the mask is "pixels
//           near the declared colour", which is self-checking: if the art and
//           the filename ever disagree, the mask comes back empty and the build
//           says so instead of dyeing the camera.
//   head    everything moves, deliberately — see SKIN below.
//
// SKIN, AND THE ONE THING THAT MAKES IT DIFFERENT. A head is skin AND the ink
// that draws the face, and they are the same hue: the skin sits at 27 degrees
// and the line work at 19-22, both orange, separated only by lightness. There is
// no hue mask that splits them. Two options, and the choice matters:
//
//   Leave the ink alone and move only the skin. Keeps the line art identical
//   across tones, which is the property scripts/avatar-brows.mjs relies on.
//   But on the darkest tone the skin arrives at the same lightness as the
//   lines and the face loses its features entirely.
//
//   Move everything. The lines darken with the skin, which is how this art
//   would have been painted in the first place, and the face keeps its
//   contrast at every tone.
//
// We move everything, and pay for it by extracting the brows from the SOURCE
// head here rather than by comparing finished tones — see browsFromOneHead.
import sharp from "sharp";
import { rgb2hsl, hsl2rgb } from "./avatar-brows.mjs";

// ---- the palettes ----------------------------------------------------------
// Named colours a child picks from. Hue in degrees, saturation and lightness
// 0-1: the MEDIAN the recoloured material should sit at, not a flat fill.
//
// Joshua's brief for all four: deep and rich, never bright or pastel. The
// saturations below are the shipped ones and they read as dyed cloth and real
// hair rather than as poster paint. Every one was checked in the avatar lab.

// Natural hair. Blonde is the source art, so its entry is a no-op reference that
// keeps the delivered painting untouched rather than round-tripping it.
export const HAIR = [
  { name: "black",      h: 25,  s: 0.20, l: 0.11 },
  { name: "dark brown", h: 22,  s: 0.45, l: 0.20 },
  { name: "brown",      h: 25,  s: 0.52, l: 0.29 },
  { name: "light brown", h: 30, s: 0.55, l: 0.42 },
  { name: "blonde",     source: true },
  { name: "red",        h: 14,  s: 0.72, l: 0.35 },
];

// Eyes. Joshua asked for green, brown and blue and invited suggestions; hazel,
// amber and grey are the three that a child recognises as their own and that
// this palette can render honestly at this size.
// The source brown sits at hue 25, saturation 0.61, lightness 0.38, and amber
// and hazel have to be placed away from it or they render as "brown again":
// a first pass put amber at hue 32 and it was indistinguishable at eye size.
export const EYES = [
  { name: "brown",  source: true },
  { name: "blue",   h: 205, s: 0.62, l: 0.40 },
  { name: "green",  h: 135, s: 0.50, l: 0.32 },
  { name: "hazel",  h: 60,  s: 0.42, l: 0.34 },
  { name: "amber",  h: 40,  s: 0.88, l: 0.46 },
  { name: "grey",   h: 205, s: 0.13, l: 0.42 },
];

// Skin, dark to light. The delivered head is the tan one, so it is the source.
// The hue drifts warmer-to-cooler across the range on purpose: real skin is not
// one hue at six brightnesses.
export const SKIN = [
  { name: "deep",   h: 22, s: 0.46, l: 0.24 },
  { name: "dark",   h: 24, s: 0.48, l: 0.34 },
  { name: "brown",  h: 25, s: 0.52, l: 0.45 },
  { name: "medium", h: 26, s: 0.60, l: 0.57 },
  { name: "tan",    source: true },
  { name: "light",  h: 28, s: 0.85, l: 0.82 },
];

// Garments. Seven, deep and rich — the brief said explicitly not bright and not
// pastel, so nothing here goes above 0.62 saturation or 0.52 lightness.
export const GARMENT = [
  { name: "red",    h: 4,   s: 0.62, l: 0.40 },
  { name: "orange", h: 24,  s: 0.62, l: 0.44 },
  { name: "yellow", h: 43,  s: 0.60, l: 0.48 },
  { name: "green",  h: 145, s: 0.45, l: 0.32 },
  { name: "blue",   h: 213, s: 0.58, l: 0.38 },
  { name: "purple", h: 285, s: 0.36, l: 0.38 },
  { name: "pink",   h: 335, s: 0.45, l: 0.48 },
];

export const PALETTE = { hair: HAIR, eyes: EYES, head: SKIN, outfit: GARMENT };

// ---- which pixels each part dyes -------------------------------------------
//
// A hue window and a lightness band. Both are needed: hue alone calls the pupil
// part of a brown iris (a near-black pixel is technically very saturated), and
// lightness alone calls the shadow under the collar part of a blue jacket.
const RULES = {
  // The whole plate. A hair plate holds nothing but hair.
  hair: { all: true },
  // The iris only, and the band is measured rather than guessed. A lightness
  // histogram of the saturated pixels in the delivered eyes comes back in three
  // separated masses: 3,056 px below 0.10 (the lash line and the pupil), a broad
  // even ramp from 0.11 to 0.55 (the iris, which is painted as a gradient — deep
  // brown at the top, amber at the bottom), and 1,958 px above 0.80 (the sclera
  // and the two highlights). A first attempt floored this at 0.24 and quietly
  // left the iris's whole dark upper half brown, so a blue eye came out blue
  // only along the bottom.
  //
  // `compact` then throws away everything that is not an iris. The eyelid CREASE
  // is painted in the same warm brown and passes every colour test there is, so
  // a purely chromatic mask dyes it too and a blue-eyed child gets blue eyeliner.
  // It separates on SHAPE instead, and cleanly: the two irises come back as
  // 1,425 and 1,362 px at 0.43-0.48 of their bounding box, the creases as 231 and
  // 197 px at 0.06. Anything under a quarter of the biggest blob, or too thin to
  // be a disc, is not an iris.
  eyes: { hueWindow: 40, satFloor: 0.40, lum: [0.11, 0.58], compact: { share: 0.25, fill: 0.25 } },
  // The whole head, ink included. See the SKIN note at the top of the file.
  head: { all: true },
  // The declared garment. The window is wide enough to hold a dyed cloth's own
  // hue drift (a blue jacket wanders 208-217 degrees) and far narrower than the
  // gap to anything else on the plate.
  outfit: { hueWindow: 30, satFloor: 0.14, lum: [0.06, 0.80] },
};

// The hue a colour word names, for finding the material to dye. Only needs the
// words that actually appear in the delivery filenames.
const WORD_HUE = { blue: 213, purple: 295, red: 7, brown: 25, blonde: 32, tan: 27 };

const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : 0);
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// Circular median: the plain median of hues either side of 0 lands on cyan.
function medianHueDeg(hs) {
  let sx = 0, sy = 0;
  for (const h of hs) { sx += Math.cos(h * Math.PI / 180); sy += Math.sin(h * Math.PI / 180); }
  const a = Math.atan2(sy, sx) * 180 / Math.PI;
  return a < 0 ? a + 360 : a;
}

// Keep only the blobs of `mask` that look like a disc: big relative to the
// biggest one, and filling a decent share of their own bounding box. Everything
// else is zeroed in place.
function keepCompactBlobs(mask, w, h, { share, fill }) {
  const n = w * h;
  const seen = new Uint8Array(n), stack = new Int32Array(n);
  const blobs = [];
  for (let s = 0; s < n; s++) {
    if (mask[s] <= 0.2 || seen[s]) continue;
    let sp = 0, count = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
    const px = [];
    stack[sp++] = s; seen[s] = 1;
    while (sp) {
      const p = stack[--sp]; count++; px.push(p);
      const x = p % w, y = (p / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1])
        if (q >= 0 && mask[q] > 0.2 && !seen[q]) { seen[q] = 1; stack[sp++] = q; }
    }
    blobs.push({ px, count, fill: count / ((x1 - x0 + 1) * (y1 - y0 + 1)) });
  }
  if (!blobs.length) return;
  const biggest = Math.max(...blobs.map((b) => b.count));
  const keep = new Uint8Array(n);
  for (const b of blobs) {
    if (b.count < biggest * share || b.fill < fill) continue;
    for (const p of b.px) keep[p] = 1;
  }
  // The feathered fringe around a kept blob has mask > 0 but was never part of a
  // blob (blobs are cut at 0.2), so grow the keep set by one step of "touching".
  for (let i = 0; i < n; i++) {
    if (mask[i] <= 0 || keep[i]) continue;
    const x = i % w, y = (i / w) | 0;
    let near = false;
    for (let dy = -2; dy <= 2 && !near; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && keep[ny * w + nx]) { near = true; break; }
      }
    if (!near) mask[i] = 0;
  }
  for (let i = 0; i < n; i++) if (!keep[i] && mask[i] > 0.2) mask[i] = 0;
}

// Which pixels of `raw` carry `colourWord`, and what colour they currently are.
export function materialMask(part, colourWord, raw, w, h) {
  const rule = RULES[part];
  const n = w * h;
  const mask = new Float32Array(n);
  const hs = [], ss = [], ls = [];
  const ref = WORD_HUE[colourWord.split(" ").pop()] ?? WORD_HUE[colourWord];

  for (let i = 0; i < n; i++) {
    const a = raw[i * 4 + 3];
    if (a < 8) continue;
    const [hu, s, l] = rgb2hsl(raw[i * 4], raw[i * 4 + 1], raw[i * 4 + 2]);
    const deg = hu * 360;
    let m = 1;
    if (!rule.all) {
      if (ref === undefined) throw new Error(`no reference hue for colour word "${colourWord}"`);
      if (l < rule.lum[0] || l > rule.lum[1]) continue;
      if (s < rule.satFloor) continue;
      const d = hueDist(deg, ref);
      if (d > rule.hueWindow) continue;
      // Feather the last third of the window so the dyed area does not end on a
      // hard edge against the cloth it borders.
      m = Math.min(1, (rule.hueWindow - d) / (rule.hueWindow / 3));
    }
    mask[i] = m;
    if (m > 0.9) { hs.push(deg); ss.push(s); ls.push(l); }
  }
  if (!hs.length) return null;
  if (rule.compact) keepCompactBlobs(mask, w, h, rule.compact);
  return { mask, h: medianHueDeg(hs), s: median(ss), l: median(ls), count: hs.length, total: n };
}

// How much of the source's own variation survives. Hue is damped hard: real
// dyed cloth drifts a few degrees, and carrying the source's full drift into a
// new hue makes a purple jacket go blue in its shadows.
const HUE_DETAIL = 0.25;
const SAT_DETAIL = 0.8;
const LUM_DETAIL = { head: 0.85, default: 1.0 };

// Where a pixel's lightness lands. A pure SHIFT keeps every fold and stroke at
// its painted contrast, which is what makes a recolour look painted — but it
// breaks at both ends of the range, and the ends are the line art:
//
//   toward light  the dark ink lifts by the same amount as the skin, so the
//                 lightest head loses its eyebrows and mouth into the face.
//   toward dark   the shift runs the darkest strands past black, clamps, and
//                 the shadow detail in black hair becomes one flat slab.
//
// A pure SCALE has the opposite problem (it flattens mid-tones) but gets the
// ends right, because it is a ratio and ratios are what contrast is made of. So:
// shift near the median, scale as the pixel approaches black, and cross over
// smoothly between. Black stays black at every target.
// HIGHLIGHTS get damped when the target is much darker than the source, and this
// is what makes black hair actually black. Blonde art is painted with a huge
// specular range — its brightest strands sit at lightness 0.78 against a 0.50
// median — and shifting that whole 0.28 spread down onto a 0.11 median leaves
// highlights at 0.39, which is mid-brown. The hair reads as dark brown with a
// shine, not as black. Damping in proportion to how far the median moved pulls
// them to 0.24 and keeps the strands visible without the colour lying.
const HILIGHT_DAMP_FLOOR = 0.45;

function remapLum(l, fromL, toL, detail) {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const damp = l > fromL
    ? Math.min(1, Math.max(HILIGHT_DAMP_FLOOR, toL / Math.max(fromL, 1e-3)))
    : 1;
  const shifted = clamp(toL + (l - fromL) * detail * damp);
  const scaled = clamp(l * (toL / Math.max(fromL, 1e-3)));
  const x = Math.max(0, Math.min(1, l / Math.max(fromL, 1e-3)));
  const t = x * x * (3 - 2 * x);            // smoothstep: 0 at black, 1 at the median
  return l >= fromL ? shifted : scaled * (1 - t) + shifted * t;
}

// Recolour one plate. Returns a raw RGBA buffer the same size as the input.
export function recolourPlate(part, raw, w, h, found, target) {
  const out = Buffer.from(raw);
  const lumDetail = LUM_DETAIL[part] ?? LUM_DETAIL.default;
  for (let i = 0; i < w * h; i++) {
    const m = found.mask[i];
    if (m <= 0) continue;
    const [hu, s, l] = rgb2hsl(raw[i * 4], raw[i * 4 + 1], raw[i * 4 + 2]);
    let dh = (hu * 360 - found.h + 540) % 360 - 180;      // signed, shortest way
    const nh = (target.h + dh * HUE_DETAIL + 360) % 360;
    const ns = Math.max(0, Math.min(1, target.s + (s - found.s) * SAT_DETAIL));
    const nl = remapLum(l, found.l, target.l, lumDetail);
    const [r, g, b] = hsl2rgb(nh / 360, ns, nl);
    // Feathered edge pixels blend back toward what was painted there.
    out[i * 4] = Math.round(raw[i * 4] * (1 - m) + r * m);
    out[i * 4 + 1] = Math.round(raw[i * 4 + 1] * (1 - m) + g * m);
    out[i * 4 + 2] = Math.round(raw[i * 4 + 2] * (1 - m) + b * m);
  }
  return out;
}

export async function rawOf(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { raw: data, w: info.width, h: info.height };
}

export const toPng = (raw, w, h) =>
  sharp(raw, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
