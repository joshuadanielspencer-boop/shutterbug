// Invariants for the traveler avatar. The one with real stakes is the
// migration: a child who has been playing for months has a face they recognise,
// and swapping the procedural SVG for painted art must not take it away.
import { describe, it, expect } from "vitest";
import {
  PARTS, ORDER, PICKABLE, AVATAR_DIMS, PORTRAIT,
  defaultAvatar, randomAvatar, normalizeAvatar, migrateAvatar, isLegacySpec,
  avatarFor, avatarLayers, focusStyle,
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
    expect(AVATAR_DIMS.map((d) => d.key)).toEqual(PICKABLE);
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
