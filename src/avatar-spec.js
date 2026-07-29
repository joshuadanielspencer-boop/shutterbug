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

// ---------------------------------------------------------------------------
// The editor's rows
// ---------------------------------------------------------------------------
// A plate is two independent choices — WHICH one (its `variant`: which haircut,
// which garment) and what COLOUR it is — and the editor gives each its own row.
// One row per part could only ever walk the two together: stepping "Hair" moved
// through style 1 in six colours, then style 2 in six colours, so finding the
// cut you wanted in the colour you wanted meant up to 24 presses and knowing the
// order. Two rows make it two obvious ones.
//
// The rows are DERIVED, not listed: a part gets a style row only if it actually
// has more than one variant. The head has a single painting in six skin tones,
// so it gets one row and is not made to pretend otherwise — and the day a second
// head shape is delivered, its style row appears on its own.
const ROW_LABEL = {
  head: { colour: "Skin" },
  eyes: { colour: "Eyes" },
  hair: { variant: "Hair Style", colour: "Hair Color" },
  outfit: { variant: "Outfit Style", colour: "Outfit Color" },
};

const distinct = (part, axis) => new Set(PARTS[part].map((o) => o[axis])).size;

export const AVATAR_ROWS = PICKABLE.flatMap((part) =>
  ["variant", "colour"]
    .filter((axis) => ROW_LABEL[part]?.[axis] && distinct(part, axis) > 1)
    .map((axis) => ({ part, axis, key: `${part}.${axis}`, label: ROW_LABEL[part][axis] })));

// ---------------------------------------------------------------------------
// Sex
// ---------------------------------------------------------------------------
// A traveler is male or female, and that choice narrows two of the four things
// they pick: the eyes and the hair are drawn per sex (different lashes, four
// hairstyles each), while the skin and the outfit are the same paintings for
// everybody. So sex is not a fifth wardrobe row — it is a filter over two of the
// existing ones.
export const SEXES = ["male", "female"];

// WHICH parts it filters is read off the art, not listed here. A part is
// sex-specific if any of its plates names a sex, so the day a delivery adds
// female-specific outfits the editor narrows those too with no code change.
export const SEXED = Object.fromEntries(
  Object.keys(PARTS).map((p) => [p, PARTS[p].some((o) => o.sex && o.sex !== "any")]),
);

export const sexOf = (spec) => (SEXES.includes(spec?.sex) ? spec.sex : SEXES[0]);

// The plates of `part` a traveler of `sex` may wear, each carrying the index it
// sits at in the FULL list.
//
// That last part is the whole design. A spec's numbers stay indices into
// PARTS[part] and never become indices into a filtered view — otherwise every
// saved profile would mean something different the moment the filter existed,
// and a girl's saved hair would come back as a boy's.
export function optionsFor(part, sex) {
  const all = PARTS[part] ?? [];
  const mine = all.map((o, i) => ({ o, i })).filter(({ o }) => !o.sex || o.sex === "any" || o.sex === sex);
  // A part with no plates for this sex at all is offered whole rather than empty.
  return mine.length ? mine : all.map((o, i) => ({ o, i }));
}

// The variants a sex is offered, in order. Male hairstyles are numbered 1-4 and
// female ones lettered a-d, so they can only be matched to each other by
// POSITION — there is no "the same style" across the two sets, only "the same
// one along".
const variantsOf = (list) => [...new Set(list.map(({ o }) => o.variant))];

// The nearest equivalent plate in the other sex's set. Switching sex should feel
// like changing who is wearing the haircut, not like being handed a stranger, so
// colour is held first and the variant's position second.
function matchAcrossSex(part, index, fromSex, toSex) {
  const to = optionsFor(part, toSex);
  const cur = PARTS[part]?.[index];
  if (!cur) return to[0].i;
  const rank = variantsOf(optionsFor(part, fromSex)).indexOf(cur.variant);
  const toVariants = variantsOf(to);
  const want = toVariants[Math.min(Math.max(rank, 0), toVariants.length - 1)];
  return (to.find(({ o }) => o.colour === cur.colour && o.variant === want)
       ?? to.find(({ o }) => o.colour === cur.colour)
       ?? to[0]).i;
}

// Move one step through the options this traveler's sex is offered. The editor's
// arrows call this rather than doing `(i + 1) % n` themselves, which would walk
// straight out of the boy's hairstyles and into the girl's.
export function stepPart(spec, part, delta) {
  const opts = optionsFor(part, sexOf(spec));
  const at = opts.findIndex(({ i }) => i === spec[part]);
  const from = at === -1 ? 0 : at;
  const next = opts[(((from + delta) % opts.length) + opts.length) % opts.length];
  return { ...spec, [part]: next.i };
}

// Move along ONE axis of a part — its style or its colour — holding the other
// where it is. This is what makes "Hair Style" and "Hair Color" two rows rather
// than one: pressing Style keeps the colour, pressing Color keeps the cut.
//
// It stays inside the sex's own set, so the styles a boy cycles are the four
// male ones and a girl's are the four female ones. And it is written against the
// VALUE (variant "3", colour "red") rather than a position, because male and
// female styles are numbered differently — there is no shared index to step.
export function stepAxis(spec, part, axis, delta) {
  const opts = optionsFor(part, sexOf(spec));
  const cur = PARTS[part]?.[spec[part]];
  const values = [...new Set(opts.map(({ o }) => o[axis]))];
  if (values.length < 2) return spec;
  const at = values.indexOf(cur?.[axis]);
  const want = values[((((at < 0 ? 0 : at) + delta) % values.length) + values.length) % values.length];
  const other = axis === "variant" ? "colour" : "variant";
  // Hold the other axis if that combination exists; every plate in this delivery
  // is every style in every colour, so it always does — but a partial future
  // batch would fall back to the first plate of the wanted value rather than
  // refusing to move.
  const found = opts.find(({ o }) => o[axis] === want && o[other] === cur?.[other])
             ?? opts.find(({ o }) => o[axis] === want);
  return found ? { ...spec, [part]: found.i } : spec;
}

// Switch sex, carrying every sexed choice to its nearest equivalent.
export function withSex(spec, sex) {
  const from = sexOf(spec);
  const out = { ...spec, sex: SEXES.includes(sex) ? sex : from };
  if (out.sex === from) return out;
  for (const part of PICKABLE) {
    if (SEXED[part]) out[part] = matchAcrossSex(part, spec[part], from, out.sex);
  }
  return out;
}

export const stepSex = (spec, delta) =>
  withSex(spec, SEXES[(((SEXES.indexOf(sexOf(spec)) + delta) % SEXES.length) + SEXES.length) % SEXES.length]);

// FNV-1a, so a traveler who never opens the editor still has a stable face.
const hashStr = (str) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const wrap = (i, n) => (((i | 0) % n) + n) % n; // negative-safe

export function defaultAvatar(name) {
  // Hash the part NAME into the seed rather than shifting one hash by the part's
  // position in PICKABLE. Position would mean that reordering the editor's rows
  // silently reassigns every un-customised traveler a new face.
  const sex = SEXES[hashStr(`av:${name ?? "?"}:sex`) % SEXES.length];
  const spec = { sex };
  // Drawn from the options that sex is offered, so an un-customised traveler
  // never opens the editor to find their own hair not in the list.
  for (const key of PICKABLE) {
    const opts = optionsFor(key, sex);
    spec[key] = opts[hashStr(`av:${name ?? "?"}:${key}`) % opts.length].i;
  }
  return spec;
}

export function randomAvatar(rand = Math.random) {
  const sex = SEXES[Math.floor(rand() * SEXES.length)];
  const spec = { sex };
  for (const key of PICKABLE) {
    const opts = optionsFor(key, sex);
    spec[key] = opts[Math.floor(rand() * opts.length)].i;
  }
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

// Restricted to what `sex` may wear: matching a legacy hair colour against every
// plate in the file would happily hand a boy one of the girls' hairstyles,
// because colour is all it compares and both sexes have the same six colours.
function nearestPlate(part, hex, sex) {
  const pool = optionsFor(part, sex);
  if (!hex) return pool[0].i;
  const want = hex2rgb(hex);
  let best = pool[0].i, bestD = Infinity;
  for (const { o, i } of pool) {
    if (!o.swatch) continue;
    const d = colourDistance(want, hex2rgb(o.swatch));
    if (d < bestD) { bestD = d; best = i; }
  }
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
// Sex has no successor either — the old scheme had no such choice — so it comes
// from the name hash like the eye colour does.
export function migrateAvatar(spec, name) {
  const fallback = defaultAvatar(name);
  if (!isLegacySpec(spec)) return fallback;
  const sex = fallback.sex;
  return {
    ...fallback,
    head: nearestPlate("head", LEGACY_SKIN[wrap(spec.skin, LEGACY_SKIN.length)], sex),
    hair: nearestPlate("hair", LEGACY_HAIRC[wrap(spec.hairColor, LEGACY_HAIRC.length)], sex),
    outfit: nearestPlate("outfit", LEGACY_SHIRT[wrap(spec.shirt, LEGACY_SHIRT.length)], sex),
  };
}

// Clamp a spec to real plates, filling anything missing from the name default.
// Every read goes through here, so a hand-edited localStorage entry, a spec from
// a device running an older build, or a legacy spec all render something.
export function normalizeAvatar(spec, name) {
  if (isLegacySpec(spec)) return migrateAvatar(spec, name);
  const base = defaultAvatar(name);
  const sex = SEXES.includes(spec?.sex) ? spec.sex : base.sex;
  const out = { sex };
  for (const key of PICKABLE) {
    const v = spec && spec[key];
    let i = Number.isFinite(v) ? wrap(v, PARTS[key].length) : base[key];
    // A saved index can point at the OTHER sex's art: a profile written before
    // this choice existed, a spec synced from an older build, a hand-edited
    // localStorage entry. Carry it across to the nearest equivalent rather than
    // resetting the child's face to a default they never chose.
    if (SEXED[key] && !optionsFor(key, sex).some((o) => o.i === i)) {
      const was = PARTS[key][i]?.sex;
      i = matchAcrossSex(key, i, SEXES.includes(was) ? was : sex, sex);
    }
    out[key] = i;
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
