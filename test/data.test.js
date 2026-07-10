// Data-invariant tests — guardrails for the game content as it grows.
// These don't check the WORDING of facts/greetings (a human must verify those,
// per CLAUDE.md rule 2); they check the SHAPE and internal consistency so a typo
// or a bad category can't ship silently. Run with `npm test`.
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { CATEGORIES, CATEGORY_ORDER, KIND_META } from "../src/data/categories.js";
import { WORLD_COUNTRIES, COUNTRY_CONTINENT } from "../src/data/worldmap.js";
import { COUNTRY_INFO } from "../src/data/countries.js";
import { categoryCountries, categoryMissionOK } from "../src/missions.js";
import { COUNTRY_PEOPLE, GREETING_MEANING } from "../src/data/culture.js";

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

describe("country registry (COUNTRY_INFO)", () => {
  // Antarctica has no country, so no capital, region or blurb.
  const played = [...new Set(LOCATIONS.map((l) => l.country))].filter((c) => c !== "Antarctica");

  it("every country a player can visit has an entry", () => {
    for (const c of played) expect(COUNTRY_INFO[c], `no COUNTRY_INFO for "${c}"`).toBeTruthy();
  });

  it("every entry has a capital, a region, and a two-sentence blurb", () => {
    for (const [country, info] of Object.entries(COUNTRY_INFO)) {
      expect(typeof info.capital, country).toBe("string");
      expect(info.capital.length, country).toBeGreaterThan(1);
      expect(typeof info.region, country).toBe("string");
      expect(info.region.length, country).toBeGreaterThan(1);
      expect(typeof info.blurb, country).toBe("string");
      // Kid-sized: long enough to teach, short enough to read on a card.
      expect(info.blurb.length, `${country} blurb length`).toBeGreaterThan(80);
      expect(info.blurb.length, `${country} blurb length`).toBeLessThan(340);
      // The blurb should name the capital it claims (except multi-seated ones,
      // whose `capital` field is a phrase, not a single city name).
      if (info.quizCapital !== false) {
        expect(info.blurb, `${country} blurb should name ${info.capital}`).toContain(info.capital);
      }
    }
  });

  it("COUNTRY_INFO has no entry for a country nobody can visit", () => {
    for (const country of Object.keys(COUNTRY_INFO)) {
      expect(played, `COUNTRY_INFO has orphan "${country}"`).toContain(country);
    }
  });

  it("the capital quiz has enough unambiguous capitals for 3 distractors", () => {
    const quizzable = Object.values(COUNTRY_INFO).filter((i) => i.quizCapital !== false);
    expect(quizzable.length).toBeGreaterThanOrEqual(4);
    // …and enough on each continent that same-continent distractors are the norm.
    const contOf = {};
    for (const l of LOCATIONS) if (!contOf[l.country]) contOf[l.country] = l.continent;
    const byCont = {};
    for (const [country, info] of Object.entries(COUNTRY_INFO)) {
      if (info.quizCapital !== false) byCont[contOf[country]] = (byCont[contOf[country]] || 0) + 1;
    }
    for (const [cont, n] of Object.entries(byCont)) {
      expect(n, `only ${n} quizzable capital(s) on ${cont}`).toBeGreaterThanOrEqual(1);
    }
  });

  it("capitals are distinct (a duplicate would make a quiz question unanswerable)", () => {
    const caps = Object.entries(COUNTRY_INFO).filter(([, i]) => i.quizCapital !== false).map(([, i]) => i.capital);
    expect(new Set(caps).size, "duplicate capital in the quiz pool").toBe(caps.length);
  });
});

describe("category missions are answerable", () => {
  // The real bug: "In AFRICA, find any desert" offered Algeria — which genuinely
  // contains the Sahara — but the game's Algeria entry is a rock formation, so the
  // pick was rejected. These tests run the SHIPPING rule (src/missions.js), not a copy.
  const LAYER_CONTINENTS = ["North America", "South America", "Europe", "Africa", "Asia", "Oceania"];

  it("a mission offered with a country step only offers countries that qualify", () => {
    for (const cont of LAYER_CONTINENTS) {
      for (const cat of CATEGORY_ORDER) {
        if (!categoryMissionOK(cat, cont, true)) continue;   // not offered there — fine
        const offered = categoryCountries(cont, cat);
        expect(offered.length, `${cat} on ${cont}`).toBeGreaterThanOrEqual(2);
        for (const country of offered) {
          const holds = LOCATIONS.some(
            (l) => l.continent === cont && l.category === cat &&
              (l.countries && l.countries.length ? l.countries : [l.country]).includes(country)
          );
          expect(holds, `${cont}: "${country}" offered for "${cat}" but holds none`).toBe(true);
        }
      }
    }
  });

  it("the Algeria/Sahara case stays fixed: Africa's desert mission never offers Algeria", () => {
    // Algeria's entry (Tassili n'Ajjer) is categorised "rock", so it must not appear.
    expect(categoryCountries("Africa", "desert")).not.toContain("Algeria");
    // …and the mission is still offerable, with real choices.
    expect(categoryMissionOK("desert", "Africa", true)).toBe(true);
  });

  it("a one-country category is never offered with a country step", () => {
    for (const cont of LAYER_CONTINENTS) {
      for (const cat of CATEGORY_ORDER) {
        if (categoryCountries(cont, cat).length === 1) {
          expect(categoryMissionOK(cat, cont, true), `${cat} on ${cont} is a coin flip`).toBe(false);
        }
      }
    }
  });

  it("a single-member category is never a category mission at all", () => {
    for (const cont of [...LAYER_CONTINENTS, "Antarctica"]) {
      for (const cat of CATEGORY_ORDER) {
        const n = LOCATIONS.filter((l) => l.continent === cont && l.category === cat).length;
        if (n === 1) expect(categoryMissionOK(cat, cont, false), `${cat} on ${cont}`).toBe(false);
      }
    }
  });

  it("Antarctica is never a category mission", () => {
    for (const cat of CATEGORY_ORDER) expect(categoryMissionOK(cat, "Antarctica", false)).toBe(false);
  });
});

describe("culture cards", () => {
  const FREE = /^(cc[ -]?by([ -]sa)?[ -0-9.]*|cc0|public domain)/i;
  const visitable = [...new Set(LOCATIONS.map((l) => l.country))].filter((c) => c !== "Antarctica");

  it("every visitable country has a photo of its people", () => {
    // Sweden shipped without one once, because the country was added to
    // locations.js long after the culture pipeline had "finished".
    for (const c of visitable) expect(COUNTRY_PEOPLE[c], `no culture photo for "${c}"`).toBeTruthy();
  });

  it("no orphan photos for countries nobody can visit", () => {
    for (const c of Object.keys(COUNTRY_PEOPLE)) expect(visitable, `orphan photo "${c}"`).toContain(c);
  });

  it("every photo is a freely-licensed Commons file with credit and caption", () => {
    for (const [c, p] of Object.entries(COUNTRY_PEOPLE)) {
      expect(p.src, c).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
      expect(p.source, c).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(p.credit, c).toBeTruthy();
      expect(p.caption && p.caption.length > 10, `${c} caption`).toBe(true);
      expect(p.license, `${c} licence "${p.license}"`).toMatch(FREE);
    }
  });

  it("every greeting used in the game has an English gloss", () => {
    for (const l of LOCATIONS) {
      if (!l.greeting?.text) continue;
      expect(GREETING_MEANING[l.greeting.text], `no gloss for "${l.greeting.text}" (${l.country})`).toBeTruthy();
    }
  });
});
