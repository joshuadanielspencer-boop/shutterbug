// Synthesise an eyebrow layer that matches the chosen hair colour.
//
// Used by scripts/build-avatar-layers.mjs; not run directly.
//
// The problem: the eyebrows are painted into the head plate in one fixed brown,
// so a black-haired or red-haired child keeps brown brows. Rather than ask for
// four skin tones x N hair colours of new head art, we lift the brows out of the
// existing plates and recolour them.
//
// This is only possible because of a property the delivered art happens to have,
// which the code verifies rather than assumes: the LINE ART is identical across
// all four skin tones. Outlines, mouth, ears and brows are the same pixels in
// head_1_light_skin as in head_4_dark_skin; only the skin between them differs.
// So "pixels that do not change when the skin tone changes" isolates the ink,
// and a connected-component pass keeps only the two blobs sitting in the brow
// band (the head outline is one enormous component and is discarded by its size).
//
// The brow is then UNMIXED from the skin it was painted over. Treating each
// pixel as  C = a*Ink + (1-a)*Skin,  the browness `a` falls straight out of how
// far C sits from skin along the skin→ink line, and Ink = (C - (1-a)*Skin)/a.
// Recolouring the unmixed Ink rather than the composited C is what keeps a black
// brow from wearing a pale halo: the halo is the skin contribution in the
// anti-aliased edge pixels, and unmixing removes it.
//
// One further consequence of the line art being tone-invariant: `a` and `Ink`
// are the same for every skin tone (the skin terms cancel), so ONE brow plate
// per hair colour serves all four heads.

const BAND = { x0: 380, y0: 330, x1: 810, y1: 510 }; // where brows may live
const MIN_BLOB = 60;      // px; smaller invariant specks are noise
const REACH = 7;          // px to grow the ink mask, to catch its soft edge
const SOFT_FROM = 2;      // px from the ink where the reach starts fading out
const INK_FLOOR = 0.18;   // below this browness, unmixing amplifies noise
const PEDESTAL = 0.06;    // browness below this is freckles and skin shading
const BROW_VS_HAIR = 0.8; // brows read a shade darker than the hair above them
const DETAIL = 1.0;       // how much of the brow's own stroke contrast to keep

// ---- colour space ------------------------------------------------------------
export function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

export function hsl2rgb(h, s, l) {
  const clamp = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  if (s === 0) return [clamp(l), clamp(l), clamp(l)];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => {
    t = (t + 1) % 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  return [clamp(f(h + 1 / 3)), clamp(f(h)), clamp(f(h - 1 / 3))];
}

const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : 0);

// Hue is an angle: the plain median of red's hues (values near 0 and near 1)
// lands on cyan. Average the unit vectors instead.
function medianHue(hs) {
  let sx = 0, sy = 0;
  for (const h of hs) { sx += Math.cos(h * 2 * Math.PI); sy += Math.sin(h * 2 * Math.PI); }
  const a = Math.atan2(sy, sx) / (2 * Math.PI);
  return a < 0 ? a + 1 : a;
}

// ---- the brow mask -----------------------------------------------------------
// `heads` are raw RGBA buffers of the head plates, all the same w*h.
export function extractBrows(heads, w, h) {
  if (heads.length < 2) throw new Error("brow extraction needs at least two skin tones to compare");
  const n = w * h;

  // Ink = opaque pixels that every skin tone agrees on.
  const invariant = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (heads[0][i * 4 + 3] < 200) continue;
    let maxd = 0;
    for (let k = 1; k < heads.length; k++) {
      for (let c = 0; c < 3; c++) {
        const d = Math.abs(heads[0][i * 4 + c] - heads[k][i * 4 + c]);
        if (d > maxd) maxd = d;
      }
    }
    if (maxd <= 10) invariant[i] = 1;
  }

  // Keep only ink blobs that fit entirely inside the brow band. The head outline
  // is a single component spanning the whole canvas and fails that test.
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  const core = new Uint8Array(n);
  const blobs = [];
  for (let s = 0; s < n; s++) {
    if (!invariant[s] || seen[s]) continue;
    let sp = 0, count = 0;
    stack[sp++] = s; seen[s] = 1;
    const px = [];
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    while (sp) {
      const p = stack[--sp];
      count++; px.push(p);
      const x = p % w, y = (p / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (q >= 0 && invariant[q] && !seen[q]) { seen[q] = 1; stack[sp++] = q; }
      }
    }
    if (count < MIN_BLOB) continue;
    if (x0 < BAND.x0 || x1 > BAND.x1 || y0 < BAND.y0 || y1 > BAND.y1) continue;
    for (const p of px) core[p] = 1;
    blobs.push({ count, x0, y0, x1, y1 });
  }
  if (!blobs.length) throw new Error("found no eyebrow blobs — has the head art moved out of the brow band?");

  // Grow outward: `core` is the solid ink, but the brow fades into skin over a
  // few pixels and a hard cut would leave a brown fringe behind. Record the
  // DISTANCE to the ink, not just membership — the skin around the brow is
  // gently shaded, so every pixel in the grown region reads as very slightly
  // un-skin-like, and taking that at face value tints a visible rectangle of
  // forehead. Fading the reach out with distance confines the layer to the brow.
  const dist = new Float32Array(n).fill(Infinity);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!core[y * w + x]) continue;
      for (let dy = -REACH; dy <= REACH; dy++) {
        for (let dx = -REACH; dx <= REACH; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const d = Math.hypot(dx, dy);
          if (d < dist[ny * w + nx]) dist[ny * w + nx] = d;
        }
      }
    }
  }
  const near = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const d = dist[i];
    if (d > REACH) continue;
    const t = Math.max(0, Math.min(1, (d - SOFT_FROM) / (REACH - SOFT_FROM)));
    near[i] = 1 - t * t * (3 - 2 * t); // smoothstep
  }

  // Reference colours, from the first head plate. Skin: the median of grown-but-
  // not-ink pixels. Ink: the median of core pixels.
  const head = heads[0];
  const pick = (test, c) => { const out = []; for (let i = 0; i < n; i++) if (test(i)) out.push(head[i * 4 + c]); return out; };
  const skin = [0, 1, 2].map((c) => median(pick((i) => near[i] > 0 && !core[i] && head[i * 4 + 3] > 200, c)));
  const inkRef = [0, 1, 2].map((c) => median(pick((i) => core[i], c)));
  const span = Math.hypot(inkRef[0] - skin[0], inkRef[1] - skin[1], inkRef[2] - skin[2]);
  if (span < 20) throw new Error("brow ink is indistinguishable from skin — check the head art");

  // Per-pixel browness and unmixed ink.
  const alpha = new Float32Array(n);
  const ink = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    if (near[i] <= 0 || head[i * 4 + 3] < 8) continue;
    const c = [head[i * 4], head[i * 4 + 1], head[i * 4 + 2]];
    // Subtract a small pedestal before scaling: freckles and skin shading push a
    // few units off the median all by themselves, and that is not brow.
    const raw = Math.hypot(c[0] - skin[0], c[1] - skin[1], c[2] - skin[2]) / span;
    const a = Math.min(1, Math.max(0, (raw - PEDESTAL) / (1 - PEDESTAL)) * near[i]);
    if (a < 0.02) continue;
    alpha[i] = a;
    // C = a*Ink + (1-a)*Skin  =>  Ink = (C - (1-a)*Skin) / a. Faint pixels make
    // that division explode, so they borrow the reference ink and lean on alpha
    // alone to stay faint.
    const d = Math.max(a, INK_FLOOR);
    for (let c3 = 0; c3 < 3; c3++) {
      ink[i * 3 + c3] = a >= INK_FLOOR
        ? Math.max(0, Math.min(255, (c[c3] - (1 - d) * skin[c3]) / d))
        : inkRef[c3];
    }
  }

  const inkL = median(Array.from({ length: n }, (_, i) => i).filter((i) => core[i])
    .map((i) => rgb2hsl(ink[i * 3], ink[i * 3 + 1], ink[i * 3 + 2])[2]));
  const inkS = median(Array.from({ length: n }, (_, i) => i).filter((i) => core[i])
    .map((i) => rgb2hsl(ink[i * 3], ink[i * 3 + 1], ink[i * 3 + 2])[1]));

  return { alpha, ink, inkL, inkS, blobs, skin, inkRef };
}

// The colour a hair plate reads as: the median hue/saturation/lightness of its
// fully-opaque pixels.
export function hairTone(hair, w, h) {
  const hs = [], ss = [], ls = [];
  for (let i = 0; i < w * h; i++) {
    if (hair[i * 4 + 3] < 250) continue;
    const [hu, s, l] = rgb2hsl(hair[i * 4], hair[i * 4 + 1], hair[i * 4 + 2]);
    hs.push(hu); ss.push(s); ls.push(l);
  }
  return { h: medianHue(hs), s: median(ss), l: median(ls) };
}

// Paint the extracted brow in a hair colour. Returns a raw RGBA buffer.
export function recolourBrows(brows, tone, w, h) {
  const { alpha, ink, inkL, inkS } = brows;
  const targetL = tone.l * BROW_VS_HAIR;
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = alpha[i];
    if (a <= 0.02) continue;
    const [, s, l] = rgb2hsl(ink[i * 3], ink[i * 3 + 1], ink[i * 3 + 2]);
    // SHIFT the brow's lightness to the target, don't SCALE it. Scaling by
    // targetL/inkL compresses everything toward zero for a dark target, which
    // flattens the individual painted strokes into one solid slab. An offset
    // moves the whole range and leaves the stroke contrast intact.
    const [r, g, b] = hsl2rgb(
      tone.h,
      Math.max(0, Math.min(1, tone.s + (s - inkS) * DETAIL)),
      Math.max(0, Math.min(1, targetL + (l - inkL) * DETAIL)),
    );
    out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b;
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return out;
}
