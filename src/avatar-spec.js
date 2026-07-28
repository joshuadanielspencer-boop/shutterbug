// ===========================================================================
// TRAVELER AVATAR SPEC — everything about an avatar that isn't rendering.
//
// Kept out of the component so it can be tested: this file decides what a new
// traveler looks like, what a random one looks like, and — the part with a real
// failure mode — how an avatar saved under the OLD procedural-SVG scheme is
// carried onto the new painted art. A child who has been playing for months has
// a face they recognise; losing it to a graphics upgrade is not acceptable.
//
// A spec is `{ head, eyes, hair, outfit }`, all INDICES into src/data/avatar.js.
// Indices rather than filenames, for the same reason the old scheme used them:
// the art can grow without touching a single saved profile.
// ===========================================================================
import { PARTS, ORDER, DERIVED, FOCUS, AVATAR_BASE, AVATAR_CANVAS } from "./data/avatar.js";
import { BASE } from "./theme.js";

// The parts a player actually chooses. Anything in DERIVED (the brows, which
// follow the hair) is not among them.
//
// The order here is the order the EDITOR lists them in, which is not ORDER:
// ORDER is z-order, bottom plate first, so it opens with the jacket. A child
// building a traveler works outward from the face, so the editor does too.
// Two different facts, deliberately not sharing one list.
const EDITOR_ORDER = ["head", "eyes", "hair", "outfit"];

export const PICKABLE = EDITOR_ORDER.filter((p) => ORDER.includes(p) && !(p in DERIVED))
  .concat(ORDER.filter((p) => !(p in DERIVED) && !EDITOR_ORDER.includes(p)));

const LABEL = { head: "Skin", eyes: "Eyes", hair: "Hair", outfit: "Jacket" };

// The editor and the create-traveler popup both render this table, which is why
// it is a table and not two copies of a layout.
export const AVATAR_DIMS = PICKABLE.map((key) => ({
  key,
  label: LABEL[key] || key,
  n: PARTS[key].length,
  options: PARTS[key],
}));

// FNV-1a, so a traveler who never opens the editor still has a stable face.
const hashStr = (str) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const wrap = (i, n) => (((i | 0) % n) + n) % n; // negative-safe

export function defaultAvatar(name) {
  const spec = {};
  // Hash the part NAME into the seed rather than shifting one hash by the part's
  // position in PICKABLE. Position would mean that reordering the editor's rows
  // silently reassigns every un-customised traveler a new face.
  for (const key of PICKABLE) spec[key] = hashStr(`av:${name ?? "?"}:${key}`) % PARTS[key].length;
  return spec;
}

export function randomAvatar(rand = Math.random) {
  const spec = {};
  for (const key of PICKABLE) spec[key] = Math.floor(rand() * PARTS[key].length);
  return spec;
}

// ---------------------------------------------------------------------------
// Carrying the old avatars over
// ---------------------------------------------------------------------------
// The palettes the procedural SVG used, frozen at the moment it was replaced.
// They exist for ONE purpose — to look up what colour a saved index used to
// mean, so it can be matched to the nearest new plate. Never add to them: a new
// entry here would describe art that no longer exists.
const LEGACY_SKIN = ["#F7D7C4", "#EFC3A4", "#E7B48F", "#D9A184", "#B97F5E", "#8E5B3F", "#6A4430", "#4A2E1E"];
const LEGACY_HAIRC = ["#2B2118", "#4A3325", "#5C4030", "#8A6238", "#C99C4F", "#E6CE8A", "#8A3B24", "#C4483F",
  "#E4873C", "#9AA0A3", "#E9E6E1", "#3E73B0", "#C25FA0", "#5FA36B", "#8E6FC1"];
const LEGACY_SHIRT = ["#E96A4C", "#2E6E75", "#3E8E5A", "#D9A036", "#8E6FC1", "#1F3D66", "#C25FA0", "#4FA6C4",
  "#7A8A3A", "#B23A48", "#2B2B2B", "#EDE6D2"];

const hex2rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// "Redmean" — a cheap approximation of perceptual distance that is markedly
// better than plain RGB for exactly the comparison being made here (skin tones
// and hair browns, which plain RGB ranks badly). Good enough for picking a
// nearest neighbour out of four to seven candidates; not a colour science claim.
function colourDistance(a, b) {
  const [r1, g1, b1] = a, [r2, g2, b2] = b;
  const rm = (r1 + r2) / 2;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

function nearestPlate(part, hex) {
  if (!hex) return 0;
  const want = hex2rgb(hex);
  let best = 0, bestD = Infinity;
  PARTS[part].forEach((opt, i) => {
    if (!opt.swatch) return;
    const d = colourDistance(want, hex2rgb(opt.swatch));
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

// Keys that ONLY the old scheme ever had. `hair` is deliberately not among them:
// it is the one name both schemes use and it means different things in each (old
// = which of thirteen hair STYLES; new = which of five hair COLOURS), so its
// presence proves nothing. Detecting on "has no new-scheme key" instead would
// read every legacy spec as modern — they all carry `hair` — and quietly drop
// the child's skin tone and jacket back to a name-hash default.
const LEGACY_ONLY = ["skin", "hairColor", "glasses", "hat", "shirt"];

export const isLegacySpec = (spec) =>
  !!spec && typeof spec === "object" && LEGACY_ONLY.some((k) => k in spec);

// Old spec in, new spec out, by matching the colour each old index stood for
// against the nearest new plate. Three of the old dimensions have no successor
// and are dropped: hat and glasses have no painted equivalent, and hair STYLE
// has only one option now. The old fantasy hair colours (green, purple, blue,
// pink) have no successor either and land on whichever real colour is nearest;
// there is no honest alternative short of not shipping the new art.
//
// Eye colour is the reverse case — the new art has it and the old spec did not —
// so it comes from the name hash, which is what an un-customised traveler would
// have got anyway.
export function migrateAvatar(spec, name) {
  const fallback = defaultAvatar(name);
  if (!isLegacySpec(spec)) return fallback;
  return {
    ...fallback,
    head: nearestPlate("head", LEGACY_SKIN[wrap(spec.skin, LEGACY_SKIN.length)]),
    hair: nearestPlate("hair", LEGACY_HAIRC[wrap(spec.hairColor, LEGACY_HAIRC.length)]),
    outfit: nearestPlate("outfit", LEGACY_SHIRT[wrap(spec.shirt, LEGACY_SHIRT.length)]),
  };
}

// Clamp a spec to real plates, filling anything missing from the name default.
// Every read goes through here, so a hand-edited localStorage entry, a spec from
// a device running an older build, or a legacy spec all render something.
export function normalizeAvatar(spec, name) {
  if (isLegacySpec(spec)) return migrateAvatar(spec, name);
  const base = defaultAvatar(name);
  const out = {};
  for (const key of PICKABLE) {
    const v = spec && spec[key];
    out[key] = Number.isFinite(v) ? wrap(v, PARTS[key].length) : base[key];
  }
  return out;
}

export const avatarFor = (profile) => normalizeAvatar(profile && profile.avatar, profile && profile.name);

// ---------------------------------------------------------------------------
// Rendering inputs
// ---------------------------------------------------------------------------
// The plates to stack, bottom first. Derived parts are resolved here: the brow
// is whichever brow plate shares the chosen hair's colour.
export function avatarLayers(spec) {
  const v = normalizeAvatar(spec, "?");
  const layers = [];
  for (const part of ORDER) {
    let opt;
    if (part in DERIVED) {
      const want = PARTS[DERIVED[part]][v[DERIVED[part]]]?.colour;
      opt = PARTS[part].find((o) => o.colour === want);
    } else {
      opt = PARTS[part][v[part]];
    }
    if (opt) layers.push({ part, src: BASE + AVATAR_BASE + opt.file });
  }
  return layers;
}

// Head and hair together, dropped a little to catch the collar. The plates are
// waist-up busts: shrink one into a 24px list bullet and the face — the only
// part that says whose avatar it is — is three pixels across.
export const PORTRAIT = (() => {
  const h = FOCUS.head, r = FOCUS.hair;
  if (!h || !r) return null;
  const x = Math.min(h.x, r.x), y = Math.min(h.y, r.y);
  return {
    x, y,
    w: Math.max(h.x + h.w, r.x + r.w) - x,
    h: Math.max(h.y + h.h, r.y + r.h) - y + 0.04,
  };
})();

// CSS that zooms a plate onto a sub-rectangle of itself. Used for the small
// round avatars (PORTRAIT) and for the editor's per-part thumbnails (FOCUS).
export function focusStyle(box, pad = 1.06) {
  if (!box) return {};
  const scale = 1 / (Math.max(box.w, box.h) * pad);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  return {
    transformOrigin: `${cx * 100}% ${cy * 100}%`,
    transform: `translate(${(0.5 - cx) * 100}%, ${(0.5 - cy) * 100}%) scale(${scale.toFixed(3)})`,
  };
}

// The band the drawing actually occupies top to bottom: the crown of the hair
// down to the hem of the jacket. The plates carry a margin below the jacket, so a
// portrait fitted whole leaves a wedge of empty disc under the outfit — which is
// fine at 44px and looks like a mistake at 230.
export const BODY_BAND = (() => {
  const hair = FOCUS.hair, outfit = FOCUS.outfit, head = FOCUS.head;
  if (!hair || !outfit) return null;
  return { top: Math.min(hair.y, head?.y ?? 1), bottom: outfit.y + outfit.h };
})();

// Scale a plate so that band fills the frame HEIGHT exactly, letting the width
// overflow — the disc crops it anyway, and cropping the shoulders is the right
// trade for the outfit reaching the bottom edge. Deliberately not focusStyle:
// that fits the LONGER side, which is what leaves the gap here.
export function fillHeightStyle(band = BODY_BAND) {
  if (!band) return {};
  const h = band.bottom - band.top;
  if (!(h > 0)) return {};
  const cy = (band.top + band.bottom) / 2;
  return {
    transformOrigin: `50% ${cy * 100}%`,
    transform: `translate(0, ${(0.5 - cy) * 100}%) scale(${(1 / h).toFixed(3)})`,
  };
}

export { PARTS, ORDER, FOCUS, AVATAR_CANVAS };
