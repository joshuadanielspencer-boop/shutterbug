// Data-invariant tests — guardrails for the game content as it grows.
// These don't check the WORDING of facts/greetings (a human must verify those,
// per CLAUDE.md rule 2); they check the SHAPE and internal consistency so a typo
// or a bad category can't ship silently. Run with `npm test`.
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { CATEGORIES, CATEGORY_ORDER, KIND_META } from "../src/data/categories.js";
import { WORLD_COUNTRIES, COUNTRY_CONTINENT } from "../src/data/worldmap.js";

const CONTINENTS = [
  "North America", "South America", "Europe", "Africa", "Asia", "Oceania", "Antarctica",
];
const MAX_CITY_DECOYS = 4; // hardest mode; a continent needs target + 4 decoys = 5

describe("categories registry", () => {
  it("CATEGORY_ORDER lists exactly the CATEGORIES keys", () => {
    expect([...CATEGORY_ORDER].sort()).toEqual(Object.keys(CATEGORIES).sort());
  });
  it("every category has name, plural, noun, emoji, a known kind, and a colour", () => {
    for (const [key, c] of Object.entries(CATEGORIES)) {
      expect(c.name, key).toBeTruthy();
      expect(c.plural, key).toBeTruthy();
      expect(c.noun, key).toBeTruthy();
      expect(c.emoji, key).toBeTruthy();
      expect(KIND_META[c.kind], `${key} kind ${c.kind}`).toBeTruthy();
      expect(c.color, key).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("locations", () => {
  it("has unique ids", () => {
    const ids = LOCATIONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every location has the required, well-typed fields", () => {
    for (const l of LOCATIONS) {
      const where = l.id || l.subject;
      expect(l.id, where).toMatch(/^[a-z0-9]+$/);
      expect(l.city, where).toBeTruthy();
      expect(l.country, where).toBeTruthy();
      expect(l.flag, where).toBeTruthy();
      expect(CONTINENTS, where).toContain(l.continent);
      expect(typeof l.x, where).toBe("number");
      expect(typeof l.y, where).toBe("number");
      expect(l.x, where).toBeGreaterThanOrEqual(0);
      expect(l.x, where).toBeLessThanOrEqual(360);
      expect(l.y, where).toBeGreaterThanOrEqual(0);
      expect(l.y, where).toBeLessThanOrEqual(180);
      expect(l.subject, where).toBeTruthy();
      expect(l.easy, where).toBeTruthy();
      expect(l.hard, where).toBeTruthy();
      expect(l.fact, where).toBeTruthy();
      expect(Array.isArray(l.tags), where).toBe(true);
      expect(CATEGORIES[l.category], `${where} category "${l.category}"`).toBeTruthy();
    }
  });

  it("has all three clue tiers, and the reveal ladder withholds place names", () => {
    // easy spells things out; medium may name the continent/region but not the
    // country; hard is pure context — no country, continent, or city name — so the
    // player must deduce the place. (Antarctica's "country" is itself, so skip it.)
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const has = (text, word) => new RegExp("\\b" + esc(word) + "\\b", "i").test(text);
    for (const l of LOCATIONS) {
      for (const tier of ["easy", "medium", "hard"]) {
        expect(typeof l[tier], `${l.id}.${tier}`).toBe("string");
        expect(l[tier].length, `${l.id}.${tier} length`).toBeGreaterThan(20);
      }
      if (l.country !== "Antarctica") {
        expect(has(l.medium, l.country), `${l.id}: medium leaks country`).toBe(false);
        expect(has(l.hard, l.country), `${l.id}: hard leaks country`).toBe(false);
      }
      expect(has(l.hard, l.continent), `${l.id}: hard leaks continent`).toBe(false);
      if (l.city.length > 3) expect(has(l.hard, l.city), `${l.id}: hard leaks city`).toBe(false);
    }
  });

  it("every photo is a freely-licensed Wikimedia file with attribution", () => {
    const FREE = /^(cc[ -]?by([ -]sa)?[ -0-9.]*|cc0|public domain)/i;
    for (const l of LOCATIONS) {
      const p = l.photo;
      const where = l.id;
      expect(p, where).toBeTruthy();
      expect(p.src, where).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
      expect(p.source, where).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(p.credit, where).toBeTruthy();
      expect(p.license, `${where} license "${p.license}"`).toMatch(FREE);
    }
  });

  it("greeting is null or a well-formed object", () => {
    for (const l of LOCATIONS) {
      if (l.greeting === null) continue;
      expect(l.greeting.text, l.id).toBeTruthy();
      expect(l.greeting.language, l.id).toBeTruthy();
      expect("pronunciation" in l.greeting, l.id).toBe(true);
    }
  });
});

describe("balance (so every mission type is satisfiable)", () => {
  it("each continent that has content has enough for the hardest mode", () => {
    const byCont = {};
    for (const l of LOCATIONS) byCont[l.continent] = (byCont[l.continent] || 0) + 1;
    for (const [cont, n] of Object.entries(byCont)) {
      expect(n, `${cont} has only ${n}`).toBeGreaterThanOrEqual(MAX_CITY_DECOYS + 1);
    }
  });

  it("every category is populated (no empty category mission)", () => {
    const byCat = {};
    for (const l of LOCATIONS) byCat[l.category] = (byCat[l.category] || 0) + 1;
    for (const key of CATEGORY_ORDER) {
      expect(byCat[key], `category "${key}" is empty`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("world map ↔ continents", () => {
  it("every drawn country maps to a valid continent", () => {
    for (const c of WORLD_COUNTRIES) {
      const cont = COUNTRY_CONTINENT[c.name];
      expect(CONTINENTS, `country "${c.name}"`).toContain(cont);
    }
  });
});
