// Art-registry invariants — every key in src/data/art.js must have a real file
// behind it, and every file must be reachable from a key.
//
// This is a shape test in the spirit of the others, but it earns its place for a
// specific reason: a wrong path here fails INVISIBLY in the one place nobody
// looks. A badge is decorative and aria-hidden, so a typo'd filename renders a
// broken-image glyph that no test, no console error, and no screen reader would
// report — it just quietly looks broken to a child. The art lands in batches from
// an external illustrator, so drift between the folder and the registry is the
// normal state of this file, not a rare accident.
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { DIFFICULTY_ART, MODE_ART, THEME_ART, CATEGORY_ART, ACHIEVEMENT_ART,
  RANK_ART, ROUNDEL_ART, RECORD_ART, SEAL_UNLOCKED, MARKER_MASTERED } from "../src/data/art.js";
import { CATEGORIES } from "../src/data/categories.js";
import { achievements, careerRank } from "../src/profiles.js";
import { LOCATIONS } from "../src/data/locations.js";

// PRESS_RANKS isn't exported; careerRank walks it, so the top tier's index+1 is
// the count. A 7th rank added there must come with a 7th insignia.
const PRESS_RANK_COUNT = careerRank({ loc: Object.fromEntries(LOCATIONS.map((l) => [l.id, { c: 1 }])) }).tier + 1;

const UI_DIR = fileURLToPath(new URL("../public/assets/shutterbug-ui/", import.meta.url));
// Every registry, normalized to a {key: path} map — RANK_ART is an array (keyed by
// rank tier) and the two ornaments are bare strings, but they all need the same
// "does this file exist / is it claimed" coverage.
const REGISTRIES = {
  DIFFICULTY_ART, MODE_ART, THEME_ART, CATEGORY_ART, ACHIEVEMENT_ART,
  RANK_ART: { ...RANK_ART },
  ROUNDEL_ART,
  RECORD_ART,
  ORNAMENTS: { seal: SEAL_UNLOCKED, marker: MARKER_MASTERED },
};
const ART_FOLDERS = ["badges", "modes", "themes", "difficulty", "ranks", "medals", "roundels"];

// The keys each registry must cover, mirrored from the game. Kept literal rather
// than imported: shutterbug-world.jsx is the whole game component and importing
// it here would drag React and every asset into the test run. If a tier/mode/theme
// is ever added there, this list is the checklist that says "draw art for it".
const DIFFICULTY_KEYS = ["scout", "easy", "medium", "hard"];
const MODE_KEYS = ["assignments", "tour", "explore", "quiz", "journey", "daily"];
const THEME_KEYS = ["classic", "wildlife", "volcano", "mountain", "waterfall", "ruins", "heritage"];
const CONTINENTS = ["North America", "South America", "Europe", "Africa", "Asia", "Oceania", "Antarctica"];

describe("art registry", () => {
  it("every registered path points at a file that exists", () => {
    for (const [name, reg] of Object.entries(REGISTRIES)) {
      for (const [key, path] of Object.entries(reg)) {
        expect(existsSync(join(UI_DIR, path)), `${name}.${key} → ${path}`).toBe(true);
      }
    }
  });

  it("every registered path is a transparent PNG in one of the art folders", () => {
    for (const [name, reg] of Object.entries(REGISTRIES)) {
      for (const [key, path] of Object.entries(reg)) {
        expect(path, `${name}.${key}`).toMatch(/\.png$/);
        expect(ART_FOLDERS, `${name}.${key} → ${path}`).toContain(path.split("/")[0]);
      }
    }
  });

  it("no two keys claim the same file", () => {
    const all = Object.values(REGISTRIES).flatMap((reg) => Object.values(reg));
    expect(all.length).toBe(new Set(all).size);
  });

  it("covers every difficulty tier, mode, and tour theme", () => {
    expect(Object.keys(DIFFICULTY_ART).sort()).toEqual([...DIFFICULTY_KEYS].sort());
    expect(Object.keys(MODE_ART).sort()).toEqual([...MODE_KEYS].sort());
    expect(Object.keys(THEME_ART).sort()).toEqual([...THEME_KEYS].sort());
  });

  it("covers all 14 subject categories, and invents no key that isn't one", () => {
    expect(Object.keys(CATEGORY_ART).sort()).toEqual(Object.keys(CATEGORIES).sort());
  });

  it("covers every achievement id that achievements() actually emits", () => {
    // The real list, computed from a profile — not a hand-copy that can drift.
    // Category badges live in CATEGORY_ART, so the rest must be in ACHIEVEMENT_ART.
    const ids = achievements({ loc: {} }).map((a) => a.id).filter((id) => !id.startsWith("cat_"));
    expect(Object.keys(ACHIEVEMENT_ART).sort()).toEqual(ids.sort());
  });

  it("every achievement has art or an emoji to fall back to, and never neither", () => {
    for (const a of achievements({ loc: {} })) {
      expect(a.art || a.emoji, `${a.id} would render as nothing`).toBeTruthy();
    }
  });

  it("has one insignia per career rank, in tier order", () => {
    expect(RANK_ART.length).toBe(PRESS_RANK_COUNT);
    RANK_ART.forEach((p, i) => expect(p, `tier ${i}`).toContain(`rank-${i + 1}-`));
  });

  it("has a roundel for every continent the locations use", () => {
    expect(Object.keys(ROUNDEL_ART).sort()).toEqual([...CONTINENTS].sort());
    const used = [...new Set(LOCATIONS.map((l) => l.continent))];
    for (const c of used) expect(ROUNDEL_ART, `no roundel for ${c}`).toHaveProperty(c);
  });

  // The other direction: a file sitting in the folder that no key points at is
  // either art we forgot to wire up or a leftover — both worth surfacing, since
  // the PWA precaches every PNG whether or not the game ever renders it.
  it("every file in the art folders is claimed by a key", () => {
    const claimed = new Set(Object.values(REGISTRIES).flatMap((reg) => Object.values(reg)));
    for (const folder of ART_FOLDERS) {
      for (const file of readdirSync(join(UI_DIR, folder)).filter((f) => f.endsWith(".png"))) {
        expect(claimed, `${folder}/${file} is in the folder but no art.js key points at it`).toContain(`${folder}/${file}`);
      }
    }
  });
});
