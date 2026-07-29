// Invariants for the traveler avatar. The one with real stakes is the
// migration: a child who has been playing for months has a face they recognise,
// and swapping the procedural SVG for painted art must not take it away.
import { describe, it, expect } from "vitest";
import {
  PARTS, ORDER, PICKABLE, AVATAR_ROWS, PORTRAIT,
  defaultAvatar, randomAvatar, normalizeAvatar, migrateAvatar, isLegacySpec,
  avatarFor, avatarLayers, focusStyle,
  SEXES, SEXED, sexOf, optionsFor, stepPart, stepAxis, stepSex, withSex,
} from "../src/avatar-spec.js";
import { DERIVED, FOCUS } from "../src/data/avatar.js";

const LEGACY = { skin: 0, hair: 3, hairColor: 0, glasses: 1, hat: 2, shirt: 0 };

describe("avatar parts data", () => {
  it("has options for every part in the z-order", () => {
    for (const part of ORDER) {
      expect(PARTS[part], part).toBeDefined();
      expect(PARTS[part].length, part).toBeGreaterThan(0);
    }
  });

  it("gives every option a file, a label and a swatch", () => {
    for (const part of ORDER) {
      for (const opt of PARTS[part]) {
        expect(opt.file, `${part} file`).toMatch(/\.webp$/);
        expect(opt.label, `${part} label`).toBeTruthy();
        expect(opt.swatch, `${part} ${opt.label} swatch`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("has a distinct file per option", () => {
    const files = ORDER.flatMap((p) => PARTS[p].map((o) => o.file));
    expect(new Set(files).size).toBe(files.length);
  });

  // Every derived part must cover every colour of the part it follows, or a
  // hair colour would silently render with no eyebrows at all.
  it("covers every driving colour for each derived part", () => {
    for (const [part, from] of Object.entries(DERIVED)) {
      const have = new Set(PARTS[part].map((o) => o.colour));
      for (const src of PARTS[from]) expect(have, `${part} for ${from}/${src.colour}`).toContain(src.colour);
    }
  });

  it("measures a focus box inside the plate for every part", () => {
    for (const part of ORDER) {
      const b = FOCUS[part];
      expect(b, part).toBeTruthy();
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(1);
      expect(b.y + b.h).toBeLessThanOrEqual(1);
    }
  });

  it("does not offer derived parts to the player", () => {
    for (const part of Object.keys(DERIVED)) expect(PICKABLE).not.toContain(part);
    // Every editor row belongs to a part the player may pick, and every such
    // part gets at least one row — so a delivery can add a part without it
    // silently becoming unreachable.
    expect(new Set(AVATAR_ROWS.map((r) => r.part))).toEqual(new Set(PICKABLE));
  });
});

describe("defaultAvatar", () => {
  it("is stable for a name", () => {
    expect(defaultAvatar("Alice")).toEqual(defaultAvatar("Alice"));
  });

  it("is in range for every part", () => {
    for (const name of ["Alice", "Bob", "", "Zeke-9", "语", "a".repeat(40)]) {
      const spec = defaultAvatar(name);
      for (const key of PICKABLE) {
        expect(spec[key], `${name}/${key}`).toBeGreaterThanOrEqual(0);
        expect(spec[key], `${name}/${key}`).toBeLessThan(PARTS[key].length);
      }
    }
  });

  // Not a uniformity claim — just that the hash isn't collapsing every child
  // onto the same face, which a bad shift would do silently.
  it("spreads across the options", () => {
    const names = Array.from({ length: 200 }, (_, i) => `child${i}`);
    for (const key of PICKABLE) {
      const seen = new Set(names.map((n) => defaultAvatar(n)[key]));
      expect(seen.size, key).toBeGreaterThan(1);
    }
  });
});

describe("randomAvatar", () => {
  it("stays in range at both ends of the generator", () => {
    for (const r of [() => 0, () => 0.999999]) {
      const spec = randomAvatar(r);
      for (const key of PICKABLE) {
        expect(spec[key], key).toBeGreaterThanOrEqual(0);
        expect(spec[key], key).toBeLessThan(PARTS[key].length);
      }
    }
  });
});

describe("normalizeAvatar", () => {
  it("passes a good spec through unchanged", () => {
    const spec = defaultAvatar("Rosa");
    expect(normalizeAvatar(spec, "Rosa")).toEqual(spec);
  });

  it("repairs junk rather than throwing", () => {
    for (const junk of [null, undefined, {}, { head: "x" }, { head: NaN }, { head: 999, hair: -4 }]) {
      const spec = normalizeAvatar(junk, "Rosa");
      for (const key of PICKABLE) {
        expect(Number.isInteger(spec[key]), `${JSON.stringify(junk)}/${key}`).toBe(true);
        expect(spec[key]).toBeGreaterThanOrEqual(0);
        expect(spec[key]).toBeLessThan(PARTS[key].length);
      }
    }
  });

  it("wraps an out-of-range index instead of clamping to zero", () => {
    const n = PARTS.head.length;
    expect(normalizeAvatar({ head: n + 2 }, "Rosa").head).toBe(2);
    expect(normalizeAvatar({ head: -1 }, "Rosa").head).toBe(n - 1);
  });
});

describe("migrating avatars saved before the art changed", () => {
  it("recognises a legacy spec and only a legacy spec", () => {
    expect(isLegacySpec(LEGACY)).toBe(true);
    expect(isLegacySpec(defaultAvatar("Rosa"))).toBe(false);
    expect(isLegacySpec(null)).toBe(false);
    expect(isLegacySpec({})).toBe(false);
  });

  it("produces a valid new spec from every legacy combination", () => {
    // The full old space is 8 skin x 13 hair x 15 hair colour x 4 glasses
    // x 9 hat x 12 shirt; the three that survive are what we sweep.
    for (let skin = 0; skin < 8; skin++) {
      for (let hairColor = 0; hairColor < 15; hairColor++) {
        for (let shirt = 0; shirt < 12; shirt++) {
          const spec = migrateAvatar({ skin, hairColor, shirt, hair: 1, hat: 0, glasses: 0 }, "Rosa");
          for (const key of PICKABLE) {
            expect(spec[key], `skin${skin}/hair${hairColor}/shirt${shirt} → ${key}`).toBeGreaterThanOrEqual(0);
            expect(spec[key]).toBeLessThan(PARTS[key].length);
          }
        }
      }
    }
  });

  it("is deterministic", () => {
    expect(migrateAvatar(LEGACY, "Rosa")).toEqual(migrateAvatar(LEGACY, "Rosa"));
  });

  // The point of matching on colour rather than on index: a child with the
  // palest old skin must not come back with the darkest new one.
  //
  // Asserted on the SWATCH, not the index. The first version pinned index 0 as
  // the lightest, which was true of the delivery it was written against and
  // stopped being true the moment the palette was reordered to run dark-to-light
  // (which is the order Joshua listed the tones in). An index is an accident of
  // presentation; "the pale one stays pale" is the requirement, and it survives
  // the palette being reshuffled again.
  it("keeps the light end light and the dark end dark", () => {
    const lum = (hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const headFor = (skin) => PARTS.head[migrateAvatar({ skin, hairColor: 0, shirt: 0 }, "Rosa").head];
    const lightest = headFor(0), darkest = headFor(7);
    expect(lum(lightest.swatch), `legacy palest landed on "${lightest.colour}"`)
      .toBeGreaterThan(lum(darkest.swatch));
    // And on the ENDS of the range, not merely the right side of the middle.
    const byLum = PARTS.head.slice().sort((a, b) => lum(a.swatch) - lum(b.swatch));
    expect(lightest.colour).toBe(byLum.at(-1).colour);
    expect(darkest.colour).toBe(byLum[0].colour);
  });

  it("keeps dark hair dark and blonde hair blonde", () => {
    // Legacy hair colour 0 is near-black (#2B2118); 5 is pale blonde (#E6CE8A).
    const black = PARTS.hair[migrateAvatar({ skin: 0, hairColor: 0, shirt: 0 }, "Rosa").hair];
    const blonde = PARTS.hair[migrateAvatar({ skin: 0, hairColor: 5, shirt: 0 }, "Rosa").hair];
    expect(black.colour).toBe("black");
    expect(blonde.colour).toBe("blonde");
  });

  it("routes a legacy spec through normalizeAvatar and avatarFor", () => {
    expect(normalizeAvatar(LEGACY, "Rosa")).toEqual(migrateAvatar(LEGACY, "Rosa"));
    expect(avatarFor({ name: "Rosa", avatar: LEGACY })).toEqual(migrateAvatar(LEGACY, "Rosa"));
  });

  it("gives a profile with no saved avatar its name's default", () => {
    expect(avatarFor({ name: "Rosa" })).toEqual(defaultAvatar("Rosa"));
    expect(avatarFor({ name: "Rosa", avatar: null })).toEqual(defaultAvatar("Rosa"));
  });
});

describe("avatarLayers", () => {
  it("returns one plate per part, in z-order", () => {
    const layers = avatarLayers(defaultAvatar("Rosa"));
    expect(layers.map((l) => l.part)).toEqual(ORDER);
    for (const l of layers) expect(l.src).toMatch(/\.webp$/);
  });

  it("picks the brow that matches the chosen hair, for every hair colour", () => {
    for (let i = 0; i < PARTS.hair.length; i++) {
      const layers = avatarLayers({ ...defaultAvatar("Rosa"), hair: i });
      const brow = layers.find((l) => l.part === "brow");
      expect(brow, `hair ${PARTS.hair[i].colour}`).toBeTruthy();
      expect(brow.src).toContain(PARTS.brow.find((o) => o.colour === PARTS.hair[i].colour).file);
    }
  });

  it("still renders a full stack from a legacy spec", () => {
    expect(avatarLayers(LEGACY).map((l) => l.part)).toEqual(ORDER);
  });
});

describe("focusStyle", () => {
  it("zooms in rather than out for every part", () => {
    for (const part of ORDER) {
      const scale = Number(focusStyle(FOCUS[part]).transform.match(/scale\(([\d.]+)\)/)[1]);
      expect(scale, part).toBeGreaterThan(1);
    }
  });

  it("frames the portrait crop on the head, not the whole bust", () => {
    expect(PORTRAIT).toBeTruthy();
    expect(PORTRAIT.h).toBeLessThan(1);
    // It must contain the head and the hair, or the crop cuts the face.
    expect(PORTRAIT.y).toBeLessThanOrEqual(Math.min(FOCUS.head.y, FOCUS.hair.y));
    expect(PORTRAIT.y + PORTRAIT.h).toBeGreaterThanOrEqual(FOCUS.head.y + FOCUS.head.h);
  });

  it("returns nothing for a missing box instead of NaN transforms", () => {
    expect(focusStyle(null)).toEqual({});
  });
});

// ===========================================================================
// Sex, which is a FILTER over two of the four wardrobe rows rather than a fifth
// row of its own. The eyes and the hair are drawn per sex; the skin and the
// outfit are the same paintings for everybody.
//
// The failure mode worth guarding is silent: a spec's numbers are indices into
// the FULL plate list, and the moment anything treats them as indices into the
// filtered view instead, every saved profile means a different face — a girl's
// saved hair comes back as a boy's, and nothing errors.
// ===========================================================================
describe("choosing a sex", () => {
  const sexed = PICKABLE.filter((p) => SEXED[p]);

  it("filters the parts that are drawn per sex, and only those", () => {
    expect(sexed, "the delivery should have sex-specific eyes and hair").toEqual(
      expect.arrayContaining(["eyes", "hair"]));
    for (const part of PICKABLE) {
      const m = optionsFor(part, "male"), f = optionsFor(part, "female");
      if (SEXED[part]) {
        expect(m.length + f.length, part).toBe(PARTS[part].length);
        expect(m.map((o) => o.i)).not.toEqual(f.map((o) => o.i));
      } else {
        // Skin and outfits: everybody sees every plate, same indices.
        expect(m.map((o) => o.i), part).toEqual(f.map((o) => o.i));
      }
    }
  });

  it("only ever offers a traveler plates their own sex can wear", () => {
    for (const sex of SEXES) {
      for (const part of sexed) {
        for (const { o } of optionsFor(part, sex)) expect(o.sex, `${part}/${sex}`).toBe(sex);
      }
    }
  });

  it("steps within its own sex and wraps there, never into the other's", () => {
    for (const sex of SEXES) {
      for (const part of sexed) {
        const opts = optionsFor(part, sex);
        let spec = { sex, [part]: opts[0].i };
        // A full lap must return exactly where it started, having touched every
        // option of this sex and none of the other's.
        const seen = new Set();
        for (let n = 0; n < opts.length; n++) {
          seen.add(spec[part]);
          expect(PARTS[part][spec[part]].sex, `${part}/${sex}`).toBe(sex);
          spec = stepPart(spec, part, 1);
        }
        expect(seen.size, `${part}/${sex} lap`).toBe(opts.length);
        expect(spec[part]).toBe(opts[0].i);
      }
    }
  });

  it("keeps the colour when the sex changes", () => {
    // Switching should feel like changing who is wearing the haircut. Colour is
    // what a child recognises as "mine", so it is held first.
    for (const part of sexed) {
      for (const { o, i } of optionsFor(part, "male")) {
        const after = withSex({ sex: "male", [part]: i }, "female");
        expect(PARTS[part][after[part]].colour, `${part} ${o.colour}`).toBe(o.colour);
        expect(PARTS[part][after[part]].sex).toBe("female");
        // …and back again lands on the plate it started from.
        expect(withSex(after, "male")[part]).toBe(i);
      }
    }
  });

  it("leaves the unisex choices alone when the sex changes", () => {
    const before = { sex: "male", head: 3, outfit: 11, eyes: optionsFor("eyes", "male")[2].i,
                     hair: optionsFor("hair", "male")[7].i };
    const after = withSex(before, "female");
    expect(after.head).toBe(before.head);
    expect(after.outfit).toBe(before.outfit);
  });

  it("gives every default and random traveler a sex they can actually wear", () => {
    for (const name of ["Rosa", "Sam", "Ada", "Kai", "Jo", "Wren", "Bo"]) {
      const spec = defaultAvatar(name);
      expect(SEXES).toContain(spec.sex);
      for (const part of sexed) expect(PARTS[part][spec[part]].sex, `${name}/${part}`).toBe(spec.sex);
    }
    for (let n = 0; n < 40; n++) {
      const spec = randomAvatar(() => (n * 0.137 + 0.01) % 1);
      for (const part of sexed) expect(PARTS[part][spec[part]].sex, `random ${n}/${part}`).toBe(spec.sex);
    }
  });

  // The one that matters for a child mid-play: their profile was written before
  // this choice existed, so it has no `sex` and its indices may point anywhere.
  it("carries a profile saved before sex existed onto plates that agree", () => {
    for (const part of sexed) {
      for (let i = 0; i < PARTS[part].length; i++) {
        const spec = normalizeAvatar({ head: 0, outfit: 0, eyes: 0, hair: 0, [part]: i }, "Rosa");
        expect(SEXES).toContain(spec.sex);
        for (const p of sexed)
          expect(PARTS[p][spec[p]].sex, `${part}=${i} → ${p}`).toBe(spec.sex);
      }
    }
  });

  it("never leaves a migrated legacy traveler wearing the other sex's art", () => {
    for (let skin = 0; skin < 8; skin++) {
      for (let hairColor = 0; hairColor < 15; hairColor += 3) {
        const spec = migrateAvatar({ skin, hairColor, shirt: 0 }, "Rosa");
        for (const part of sexed) expect(PARTS[part][spec[part]].sex).toBe(spec.sex);
      }
    }
  });
});

// ===========================================================================
// Style and colour as SEPARATE rows. One row per part could only walk the two
// together — stepping "Hair" went through cut 1 in six colours, then cut 2 in
// six colours — so reaching the cut you wanted in the colour you wanted took up
// to 24 presses and knowing the order.
// ===========================================================================
describe("stepping style and colour apart", () => {
  const rowsFor = (part) => AVATAR_ROWS.filter((r) => r.part === part);

  it("gives a part a style row only when it has more than one style", () => {
    for (const part of PICKABLE) {
      const axes = new Set(rowsFor(part).map((r) => r.axis));
      const styles = new Set(PARTS[part].map((o) => o.variant)).size;
      expect(axes.has("variant"), `${part} has ${styles} style(s)`).toBe(styles > 1);
      expect(axes.has("colour"), part).toBe(true);
    }
    // As delivered: one head painting, one pair of eyes, four hairstyles per
    // sex, five outfits. So hair and outfit get two rows and the others one.
    expect(rowsFor("hair").length).toBe(2);
    expect(rowsFor("outfit").length).toBe(2);
    expect(rowsFor("head").length).toBe(1);
    expect(rowsFor("eyes").length).toBe(1);
  });

  it("holds the other axis still while one moves", () => {
    for (const sex of SEXES) {
      for (const { part, axis } of AVATAR_ROWS) {
        const other = axis === "variant" ? "colour" : "variant";
        const start = optionsFor(part, sex)[0].i;
        let spec = { sex, [part]: start };
        const held = PARTS[part][start][other];
        const moved = new Set();
        const values = new Set(optionsFor(part, sex).map(({ o }) => o[axis]));
        for (let n = 0; n < values.size; n++) {
          spec = stepAxis(spec, part, axis, 1);
          const now = PARTS[part][spec[part]];
          expect(now[other], `${part}.${axis} moved ${other} too`).toBe(held);
          expect(now.sex === "any" || now.sex === sex, `${part}.${axis} left ${sex}`).toBe(true);
          moved.add(now[axis]);
        }
        // A full lap visits every value of this axis and returns to the start.
        expect(moved, `${part}.${axis}`).toEqual(values);
        expect(spec[part], `${part}.${axis} lap`).toBe(start);
      }
    }
  });

  it("cycles the eye colours rather than sitting still", () => {
    // Reported as "Eyes doesn't rotate". The row exists and does move; what it
    // could not do before was move WITHOUT also stepping through the other sex's
    // plates, because the eyes list interleaves male and female.
    for (const sex of SEXES) {
      const seen = [];
      let spec = { sex, eyes: optionsFor("eyes", sex)[0].i };
      for (let n = 0; n < 6; n++) { seen.push(PARTS.eyes[spec.eyes].colour); spec = stepAxis(spec, "eyes", "colour", 1); }
      expect(new Set(seen).size, `${sex} eye colours`).toBe(6);
      expect(seen).toEqual(expect.arrayContaining(["brown", "green", "blue"]));
    }
  });

  it("keeps a hair style when only the colour changes, and vice versa", () => {
    const start = optionsFor("hair", "female").find(({ o }) => o.variant === "c" && o.colour === "red");
    expect(start, "the delivery should have a red 'c' hairstyle").toBeTruthy();
    const recoloured = stepAxis({ sex: "female", hair: start.i }, "hair", "colour", 1);
    expect(PARTS.hair[recoloured.hair].variant).toBe("c");
    const restyled = stepAxis({ sex: "female", hair: start.i }, "hair", "variant", 1);
    expect(PARTS.hair[restyled.hair].colour).toBe("red");
  });
});

// ===========================================================================
// Does a colour option actually look like a different colour?
//
// This exists because "female eyes can't change colour" was true and shipped.
// A lightness band in the recolour was measured off the MALE eye plate — where
// the iris is a saturated amber-brown at lightness 0.11-0.55 — and hard-coded.
// The female eyes are painted differently: heavier lashes, and a lighter, more
// muted rosy iris at 0.55-0.70. The band caught 110 of her iris pixels against
// 2,787 of his, so all six of her "colours" rendered the same brown.
//
// Nothing failed. The generator printed a tick for every plate, the plates all
// existed, the manifest listed six colours, every other test passed, and the
// only symptom was a child pressing an arrow and seeing nothing happen.
//
// So: within one part, one sex and one style, the swatches must be far enough
// apart to be different colours. The swatch is measured off the built plate at
// build time, which makes this a check on the ART rather than on the palette I
// asked for — the two disagreeing is exactly the failure.
// ===========================================================================
describe("every colour option is visibly a different colour", () => {
  // Redmean, the same cheap perceptual distance the legacy migration uses.
  const dist = (a, b) => {
    const [r1, g1, b1] = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const [r2, g2, b2] = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    const rm = (r1 + r2) / 2, dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
  };
  // Two plates a child is told are different colours should not be within this of
  // each other. The identical female eyes were 3-6 apart; the closest real pair in
  // the shipped set is comfortably above it.
  const MIN_APART = 30;

  it("keeps the colours of one style apart from each other", () => {
    const tooClose = [];
    for (const part of PICKABLE) {
      const groups = {};
      for (const o of PARTS[part]) ((groups[`${o.sex}/${o.variant}`] ??= [])).push(o);
      for (const [group, opts] of Object.entries(groups)) {
        for (let i = 0; i < opts.length; i++) {
          for (let j = i + 1; j < opts.length; j++) {
            const d = dist(opts[i].swatch, opts[j].swatch);
            if (d < MIN_APART)
              tooClose.push(`${part} ${group}: ${opts[i].colour} ${opts[i].swatch} vs ${opts[j].colour} ${opts[j].swatch} (${d.toFixed(0)} apart)`);
          }
        }
      }
    }
    expect(tooClose, `these render as the same colour — the recolour mask missed:\n  ${tooClose.join("\n  ")}`).toEqual([]);
  });

  // The same failure seen from the other side: if a mask misses, every plate of
  // that part collapses onto one appearance, so the count of DISTINCT swatches
  // drops below the count of colours offered.
  it("offers as many distinct appearances as it offers colours", () => {
    for (const part of PICKABLE) {
      for (const sex of [...new Set(PARTS[part].map((o) => o.sex))]) {
        const opts = PARTS[part].filter((o) => o.sex === sex && o.variant === PARTS[part].find((x) => x.sex === sex).variant);
        const colours = new Set(opts.map((o) => o.colour)).size;
        const looks = new Set(opts.map((o) => o.swatch)).size;
        expect(looks, `${part}/${sex} offers ${colours} colours but only ${looks} appearances`).toBe(colours);
      }
    }
  });
});
