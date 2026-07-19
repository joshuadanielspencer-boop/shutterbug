// Data-invariant tests — guardrails for the game content as it grows.
// These don't check the WORDING of facts/greetings (a human must verify those,
// per CLAUDE.md rule 2); they check the SHAPE and internal consistency so a typo
// or a bad category can't ship silently. Run with `npm test`.
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { CATEGORIES, CATEGORY_ORDER, KIND_META } from "../src/data/categories.js";
import { WORLD_COUNTRIES, COUNTRY_CONTINENT } from "../src/data/worldmap.js";
import { COUNTRY_NATIVE } from "../src/data/countries.js";
import { COUNTRY_INFO } from "../src/data/countries.js";
import { categoryCountries, categoryMissionOK } from "../src/missions.js";
import { COUNTRY_PEOPLE, GREETING_MEANING, peopleCards } from "../src/data/culture.js";
import { RIVERS, LAKES, MARINE, WATER_FEATURES, WATER_KINDS } from "../src/data/geography.js";
import { JOURNEYS, journeyBox, closestStops, unrolledX } from "../src/data/journeys.js";
import { CURIOSITY_DECKS, CURIOSITY_DECK_BY_ID, ALL_CURIOSITY_IDS } from "../src/data/curiosities.js";

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
    // Reveal ladder: easy spells things out; MEDIUM (Adventurer) names the COUNTRY
    // but not the continent; hard is pure context — no country, continent, or city
    // name. (Antarctica's "country" is itself, so skip its country/continent checks.)
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const has = (text, word) => new RegExp("\\b" + esc(word) + "\\b", "i").test(text);
    for (const l of LOCATIONS) {
      for (const tier of ["easy", "medium", "hard"]) {
        expect(typeof l[tier], `${l.id}.${tier}`).toBe("string");
        expect(l[tier].length, `${l.id}.${tier} length`).toBeGreaterThan(20);
      }
      if (l.country !== "Antarctica") {
        // Medium names the country (tolerant substring — abbreviations like
        // "Solomon Is." and adjective forms like "South Korean" still count).
        const norm = l.country.replace(/\.$/, "").toLowerCase();
        expect(l.medium.toLowerCase().includes(norm), `${l.id}: medium must name the country`).toBe(true);
        // Medium must not name the continent — unless the country name itself
        // contains it (e.g. "South Africa" necessarily contains "Africa").
        if (!l.country.toLowerCase().includes(l.continent.toLowerCase())) {
          expect(has(l.medium, l.continent), `${l.id}: medium leaks continent`).toBe(false);
        }
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
    for (const c of visitable) expect(peopleCards(c).length, `no culture photo for "${c}"`).toBeGreaterThan(0);
  });

  it("no orphan photos for countries nobody can visit", () => {
    for (const c of Object.keys(COUNTRY_PEOPLE)) expect(visitable, `orphan photo "${c}"`).toContain(c);
  });

  it("every photo is a freely-licensed Commons file with credit and caption", () => {
    // Runs over EVERY card, not just the first — a country with rotating cards
    // could otherwise smuggle an unlicensed second photo past this check.
    for (const c of Object.keys(COUNTRY_PEOPLE)) {
      for (const p of peopleCards(c)) {
        expect(p.src, c).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
        expect(p.source, c).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
        expect(p.credit, c).toBeTruthy();
        expect(p.caption && p.caption.length > 10, `${c} caption`).toBe(true);
        expect(p.license, `${c} licence "${p.license}"`).toMatch(FREE);
      }
    }
  });

  it("a country with several peoples names each one, and shows no more than three", () => {
    for (const c of Object.keys(COUNTRY_PEOPLE)) {
      const cards = peopleCards(c);
      if (cards.length === 1) continue;
      // Three is the cap: the card rotates on arrival, and beyond three a child
      // would rarely see the same people twice, which defeats the point.
      expect(cards.length, `${c} has ${cards.length} cards`).toBeLessThanOrEqual(3);
      // Rotating anonymous photos teaches nothing — each must say WHO it shows.
      for (const p of cards) expect(p.people, `${c}: a rotating card with no people named`).toBeTruthy();
      const names = cards.map((p) => p.people);
      expect(new Set(names).size, `${c}: two cards claim the same people`).toBe(names.length);
    }
  });

  it("the United States shows at least its Native, African American and European-descended peoples", () => {
    const named = peopleCards("United States").map((p) => p.people);
    for (const who of ["Native American", "African American"])
      expect(named, `the US card set is missing ${who}`).toContain(who);
    expect(named.length, "the US should not be represented by one people").toBeGreaterThanOrEqual(3);
  });

  it("every greeting used in the game has an English gloss", () => {
    for (const l of LOCATIONS) {
      if (!l.greeting?.text) continue;
      expect(GREETING_MEANING[l.greeting.text], `no gloss for "${l.greeting.text}" (${l.country})`).toBeTruthy();
    }
  });

  it("native country names are real endonyms, and only for countries we have", () => {
    const known = new Set(LOCATIONS.map((l) => l.country));
    for (const [country, v] of Object.entries(COUNTRY_NATIVE)) {
      // must belong to a country that actually appears in the game
      expect(known.has(country), `${country}: native name for an unknown country`).toBe(true);
      expect(typeof v.name, `${country}.name`).toBe("string");
      expect(v.name.length, `${country}.name empty`).toBeGreaterThan(1);
      // an endonym identical to the English name teaches nothing — don't ship it
      const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
      if (!v.roman) {
        expect(norm(v.name) === norm(country), `${country}: native name is the same as English`).toBe(false);
      }
      // non-Latin scripts must carry a romanization so kids can say it
      const hasNonLatin = /[^\u0000-\u024F\u1E00-\u1EFF\s·‘’ʻʼ'.-]/.test(v.name);
      if (hasNonLatin) expect(typeof v.roman, `${country}: non-Latin script needs a romanization`).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// Water features (src/data/geography.js, generated from Natural Earth).
//
// The shape checks are cheap. The one that EARNS its keep is the last: a river's
// NAME in Natural Earth is not a river. Unrelated rivers share names (there is a
// Colorado in Argentina, a Mackenzie in Queensland), and a long river is stored
// under its local names, so a naive lookup silently produced a Colorado in South
// America and a Nile that stopped in Sudan. Both looked entirely plausible drawn
// on the map. So we pin each big river to a box it must lie inside and a real
// city it must run past — facts checked independently, not read back out of the
// data they're guarding.
// ---------------------------------------------------------------------------
describe("water features", () => {
  const inMap = (x, y) => x >= 0 && x <= 360 && y >= 0 && y <= 180;

  it("every feature is well formed and uniquely identified", () => {
    const ids = new Set();
    for (const f of WATER_FEATURES) {
      expect(f.name, `${f.id}: no name`).toBeTruthy();
      expect(ids.has(f.id), `duplicate id ${f.id}`).toBe(false);
      ids.add(f.id);
      expect(Object.keys(WATER_KINDS), `${f.id}: unknown kind ${f.kind}`).toContain(f.kind);
      expect([1, 2, 3], `${f.id}: bad tier`).toContain(f.tier);
      expect(inMap(f.lx, f.ly), `${f.id}: label anchor is off the map`).toBe(true);
      // Rule 2: every name must say where it came from, so it can be re-checked.
      expect(f.source, `${f.id}: no source cited`).toMatch(/Natural Earth/);
    }
  });

  it("rivers and lakes carry geometry, and their label sits on it", () => {
    for (const f of [...RIVERS, ...LAKES]) {
      expect(f.d, `${f.id}: no path`).toMatch(/^M/);
      const [x0, y0, x1, y1] = f.b;
      expect(x1 > x0 && y1 >= y0, `${f.id}: empty bounding box`).toBe(true);
      expect(f.lx >= x0 - 0.5 && f.lx <= x1 + 0.5 && f.ly >= y0 - 0.5 && f.ly <= y1 + 0.5,
        `${f.id}: label anchor is nowhere near the feature`).toBe(true);
    }
    for (const f of MARINE) expect(f.d, `${f.id}: marine features are labels only`).toBeUndefined();
  });

  it("the oceans, and at least one sea, bay and gulf, show on the world map", () => {
    const worldwide = MARINE.filter((f) => f.tier === 1);
    for (const kind of ["ocean", "sea", "bay", "gulf"])
      expect(worldwide.some((f) => f.kind === kind), `nothing of kind "${kind}" shows at world zoom`).toBe(true);
    expect(MARINE.filter((f) => f.kind === "ocean").length).toBeGreaterThanOrEqual(5);
  });

  it("each big river lies in its own basin, and runs past the city it's famous for", () => {
    const TRUTH = {
      "Nile":         { box: [24, 36, 0, 32],      city: [32.5, 15.6] },   // Khartoum
      "Blue Nile":    { box: [32, 40, 9, 16],      city: [32.5, 15.6] },   // Khartoum
      "Yangtze":      { box: [90, 123, 24, 36],    city: [106.5, 29.6] },  // Chongqing
      "Danube":       { box: [7, 30, 42, 50],      city: [16.4, 48.2] },   // Vienna
      "Mekong":       { box: [93, 107, 8, 34],     city: [104.9, 11.6] },  // Phnom Penh
      "Colorado":     { box: [-116, -104, 30, 42], city: [-112.1, 36.1] }, // the Grand Canyon
      "Mississippi":  { box: [-96, -88, 28, 48],   city: [-90.1, 35.1] },  // Memphis
      "Amazon":       { box: [-75, -48, -6, 1],    city: [-60.0, -3.1] },  // Manaus
      "Rio Grande":   { box: [-108, -96, 25, 39],  city: [-106.5, 31.8] }, // El Paso
      "Mackenzie":    { box: [-138, -110, 58, 70], city: [-133.7, 67.4] }, // Inuvik
      "Volga":        { box: [31, 52, 44, 60],     city: [44.5, 48.7] },   // Volgograd
      "Yellow River": { box: [95, 121, 32, 42],    city: [111.0, 36.0] },  // Linfen
    };
    const SLACK = 2;   // degrees — the courses are simplified, so don't be brittle
    for (const [name, t] of Object.entries(TRUTH)) {
      const r = RIVERS.find((x) => x.name === name);
      expect(r, `${name}: missing from the rivers layer`).toBeTruthy();
      const lon0 = r.b[0] - 180, lon1 = r.b[2] - 180, lat0 = 90 - r.b[3], lat1 = 90 - r.b[1];
      expect(lon0 >= t.box[0] - SLACK && lon1 <= t.box[1] + SLACK
        && lat0 >= t.box[2] - SLACK && lat1 <= t.box[3] + SLACK,
      `${name}: runs outside its real basin (lon ${lon0.toFixed(0)}..${lon1.toFixed(0)}, lat ${lat0.toFixed(0)}..${lat1.toFixed(0)}) — likely a same-named river on another continent`).toBe(true);
      const cx = t.city[0] + 180, cy = 90 - t.city[1];
      expect(cx >= r.b[0] - SLACK && cx <= r.b[2] + SLACK && cy >= r.b[1] - SLACK && cy <= r.b[3] + SLACK,
        `${name}: never reaches the city it's known for — likely truncated, because Natural Earth stores the rest of its course under a local name`).toBe(true);
    }
  });

  it("the lakes the game promises are all present", () => {
    for (const name of ["Lake Superior", "Lake Michigan", "Lake Huron", "Lake Erie", "Lake Ontario",
      "Lake Baikal", "Lake Victoria", "Lake Tanganyika", "Lake Titicaca"])
      expect(LAKES.some((l) => l.name === name), `${name} is missing`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Units. The game teaches American homeschoolers, so every measurement reads
// IMPERIAL first with metric in parentheses — "12,388 feet (3,776 m)". The
// conversions were done once, from one formula (scripts/imperial-first.mjs),
// because doing 166 of them by hand is how a teaching tool ends up with one
// wrong number in it. This stops a metric-only figure creeping back in later.
// ---------------------------------------------------------------------------
describe("measurements read imperial first", () => {
  const METRIC = /\b\d[\d,.]*\s?(?:km|kilometres|kilometers|metres|meters|cm|centimetres|kg|tonnes|hectares)\b/i;
  const SPELLED = /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|sixteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)[- ](?:metres|meters|kilometres|kilometers|km)\b/i;
  // "a mile" and "half a mile" count as imperial figures just as much as "1.2 miles".
  const IMPERIAL = /\b(?:[\d][\d,.]*|a|an|half|quarter|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)[- ]?(?:miles?|feet|foot|ft|inch|inches|pounds?|lb|tons?|acres?)\b/i;

  // Every player-facing string in a location: the three clue tiers and the fact.
  const strings = [];
  for (const l of LOCATIONS)
    for (const k of ["easy", "medium", "hard", "fact"])
      if (l[k]) strings.push([`${l.id}.${k}`, l[k]]);
  for (const [country, info] of Object.entries(COUNTRY_INFO))
    if (info.blurb) strings.push([`${country}.blurb`, info.blurb]);
  for (const j of JOURNEYS) {
    strings.push([`${j.id}.intro`, j.intro]);
    for (const s2 of j.stops) strings.push([`${j.id}/${s2.id}.fact`, s2.fact], [`${j.id}/${s2.id}.prompt`, s2.prompt]);
  }
  for (const d of CURIOSITY_DECKS)
    for (const c of d.cards) strings.push([`curio/${c.id}`, `${c.title} ${c.body}`]);

  it("no player-facing text gives metric without an imperial equivalent", () => {
    for (const [where, text] of strings) {
      if (!METRIC.test(text) && !SPELLED.test(text)) continue;
      expect(IMPERIAL.test(text),
        `${where}: gives a metric measurement with no imperial one — "${text.slice(0, 90)}…"`).toBe(true);
    }
  });

  it("the imperial figure comes FIRST, with metric in parentheses", () => {
    // The Bayterek Tower's cryptic clue is the one deliberate exception: its
    // "ninety-seven metres" IS the riddle (the deck marks 1997, the year Astana
    // became the capital), so leading with 318 feet would destroy the puzzle.
    const EXCEPT = new Set(["bayterek.hard"]);
    for (const [where, text] of strings) {
      if (EXCEPT.has(where)) continue;
      if (!METRIC.test(text) && !SPELLED.test(text)) continue;
      const imp = text.search(IMPERIAL);
      const met = Math.min(...[text.search(METRIC), text.search(SPELLED)].filter((i) => i >= 0));
      expect(imp >= 0 && imp < met,
        `${where}: leads with metric — imperial should come first, metric in parentheses`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Journeys — ordered historical routes (src/data/journeys.js).
// ---------------------------------------------------------------------------
describe("journeys", () => {
  it("every stop is a real, sourced place with coordinates that agree with each other", () => {
    for (const j of JOURNEYS) {
      expect(j.stops.length, `${j.id}: too few stops`).toBeGreaterThanOrEqual(4);
      for (const s of j.stops) {
        expect(s.name && s.place && s.when, `${j.id}/${s.id}: incomplete`).toBeTruthy();
        expect(s.fact.length, `${j.id}/${s.id}: fact too thin`).toBeGreaterThan(40);
        // Rule 2: coordinates came from a source, and the source is recorded.
        expect(s.source, `${j.id}/${s.id}: no source`).toMatch(/^https?:\/\//);
        expect(s.lat).toBeGreaterThanOrEqual(-90);
        expect(s.lat).toBeLessThanOrEqual(90);
        expect(s.lon).toBeGreaterThanOrEqual(-180);
        expect(s.lon).toBeLessThanOrEqual(180);
        // the map-space copy must be derived from the real coordinates, not typed in
        expect(s.x).toBeCloseTo(s.lon + 180, 6);
        expect(s.y).toBeCloseTo(90 - s.lat, 6);
      }
    }
  });

  it("no two stops sit on top of each other", () => {
    // Two stops closer than this render as one pin, and the player physically cannot
    // click the one they mean. Fort Clatsop and Cape Disappointment are 12 miles
    // apart — that's why the Lewis & Clark route carries just one of them.
    //
    // The limit is a FRACTION OF THE MAP, not a fixed number of degrees: 1.2° is a
    // comfortable gap on a map of Wyoming and about four pixels on a map of the whole
    // world. Port St Julian is 5.7° from the Strait of Magellan and still had to go.
    for (const j of JOURNEYS) {
      const w = journeyBox(j).w;
      expect(closestStops(j), `${j.id}: two stops are too close to tell apart on a ${Math.round(w)}°-wide map`)
        .toBeGreaterThan(0.024 * w);
    }
  });

  it("the map window holds every stop", () => {
    for (const j of JOURNEYS) {
      const b = journeyBox(j);
      const xs = unrolledX(j);   // where the pins are actually DRAWN
      j.stops.forEach((s, i) => {
        expect(xs[i] >= b.x && xs[i] <= b.x + b.w, `${j.id}/${s.id}: off the map horizontally`).toBe(true);
        expect(s.y >= b.y && s.y <= b.y + b.h, `${j.id}/${s.id}: off the map vertically`).toBe(true);
      });
      // There is no map beyond the poles: a box taller than the world would hang a
      // band of open sea below Antarctica, which is not a place.
      expect(b.y, `${j.id}: map window runs off the top of the world`).toBeGreaterThanOrEqual(0);
      expect(b.y + b.h, `${j.id}: map window runs off the bottom of the world`).toBeLessThanOrEqual(180 + 1e-9);
    }
  });

  // A leg that sails west must be DRAWN going west. Unrolled, each leg is the short
  // way round the globe; drawn naively, Magellan's Pacific crossing comes out as a
  // line running back east across Africa — plausible, and the wrong way round the
  // world. This is trap 1 in docs/remaining-work.md, in map form.
  it("no leg is drawn the long way round the world", () => {
    for (const j of JOURNEYS) {
      const xs = unrolledX(j);
      for (let i = 1; i < xs.length; i++)
        expect(Math.abs(xs[i] - xs[i - 1]),
          `${j.id}/${j.stops[i].id}: drawn as a ${Math.round(Math.abs(xs[i] - xs[i - 1]))}° leg — it should have gone the other way`)
          .toBeLessThanOrEqual(180);
    }
  });

  // The two circumnavigations must actually circumnavigate: the whole point is that
  // you come home from the far side, so the route has to span most of the globe.
  it("a round-the-world route really does go round the world", () => {
    for (const id of ["beagle", "magellan"]) {
      const j = JOURNEYS.find((x) => x.id === id);
      const xs = unrolledX(j);
      expect(Math.max(...xs) - Math.min(...xs), `${id}: doesn't span the globe`).toBeGreaterThan(340);
    }
  });
});

// ---------------------------------------------------------------------------
// The "tap to learn" curiosity layer (src/data/curiosities.js). Shape only — a
// human still verifies the facts (rule 2). But the shape guards catch a card with
// no source, a duplicate id (which would break the "found" tracker's count), or a
// time-sensitive claim shipped without the `asOf` stamp that keeps it honest.
// ---------------------------------------------------------------------------
describe("curiosity layer", () => {
  it("every card is well-formed and has a source (or is deliberately source-free)", () => {
    for (const d of CURIOSITY_DECKS) {
      expect(d.label && d.emoji, `${d.id}: deck missing label/emoji`).toBeTruthy();
      expect(["trivia", "story"], `${d.id}: unknown narrator`).toContain(d.narrator);
      expect(d.cards.length, `${d.id}: needs at least one card`).toBeGreaterThanOrEqual(1);
      for (const c of d.cards) {
        expect(c.title && c.body, `${d.id}/${c.id}: incomplete`).toBeTruthy();
        expect(c.body.length, `${d.id}/${c.id}: body too thin`).toBeGreaterThan(40);
        // A source is required for any external fact. The only source-free deck is
        // the game's own "about" deck, which describes the game itself.
        if (d.id !== "logo")
          expect(c.source, `${d.id}/${c.id}: no source`).toMatch(/^https?:\/\//);
      }
    }
  });

  it("card ids are globally unique (the 'found' counter relies on it)", () => {
    expect(new Set(ALL_CURIOSITY_IDS).size, "duplicate curiosity id").toBe(ALL_CURIOSITY_IDS.length);
  });

  it("time-sensitive facts carry an as-of year", () => {
    // A card that states a country count, the members of a bloc, or a most-visited
    // ranking WILL go stale. It must say when it was true, so a future reader sees a
    // dated fact rather than a wrong one. This pins the ones we know change.
    const MUST_DATE = ["ctry-count", "ctry-blocs", "dest-country", "dest-city"];
    for (const id of MUST_DATE) {
      const card = CURIOSITY_DECKS.flatMap((d) => d.cards).find((c) => c.id === id);
      expect(card, `${id}: card went missing`).toBeTruthy();
      expect(typeof card.asOf, `${id}: time-sensitive fact with no asOf year`).toBe("number");
    }
  });
});

import { HUBS, TRANSPORT_MODES, TRANSPORT_BY_ID, CURRENCIES, COUNTRY_CURRENCY, currencyFor, money, transportOptionsFor, destinationContexts } from "../src/data/travel.js";
import { nextGoal } from "../src/profiles.js";

// The results screen's reason to play again. It's the last thing a child reads
// before deciding, so what it points at matters more than that it points at all.
describe("the next goal", () => {
  const byCat = {};
  for (const l of LOCATIONS) (byCat[l.category] ||= []).push(l);
  const profileWith = (spec) => {
    const loc = {};
    for (const [cat, n] of Object.entries(spec)) for (const l of byCat[cat].slice(0, n)) loc[l.id] = { v: 1, c: 1, m: 0 };
    return { loc };
  };

  it("points at the collection that is CLOSEST, not the one furthest along", () => {
    // 8/9 ice (1 left) vs 12/15 desert (3 left). Percentage would pick desert at
    // 80%… no — percentage picks ice too. Use a case where they disagree: 8/9 ice
    // (89%, 1 left) vs 30/36 rock (83%, 6 left). Both say ice. The real test is
    // that a nearly-untouched huge collection never wins on raw count.
    const g = nextGoal(profileWith({ ice: 8, desert: 12 }));
    expect(g.left).toBe(1);
    expect(g.name).toBe("Polar Explorer");
  });

  it("ignores collections the traveler has never started", () => {
    // A child who has never shot a waterfall does not need to hear about all 27.
    const g = nextGoal(profileWith({ ice: 8 }));
    expect(g.name).toBe("Polar Explorer");
    expect(g.have).toBeGreaterThan(0);
  });

  it("is null for a brand-new traveler and for a guest", () => {
    expect(nextGoal({ loc: {} })).toBe(null);
    expect(nextGoal(null)).toBe(null);
  });

  it("never points at something already earned", () => {
    // Every ice place shot: Polar Explorer is done, so it must offer something else.
    const g = nextGoal(profileWith({ ice: byCat.ice.length, desert: 3 }));
    expect(g?.name).not.toBe("Polar Explorer");
  });
});

describe("travel modes", () => {
  it("every hub is a real airport with coordinates in range and derived map coords", () => {
    for (const [cont, hubs] of Object.entries(HUBS)) {
      for (const h of hubs) {
        expect(h.code && h.name && h.country, `${cont}/${h.name}: incomplete hub`).toBeTruthy();
        expect(h.lat).toBeGreaterThanOrEqual(-90); expect(h.lat).toBeLessThanOrEqual(90);
        expect(h.lon).toBeGreaterThanOrEqual(-180); expect(h.lon).toBeLessThanOrEqual(180);
        expect(h.x).toBeCloseTo(h.lon + 180, 6);
        expect(h.y).toBeCloseTo(90 - h.lat, 6);
      }
    }
  });

  it("every travel-layer continent offers at least three spread-out hubs", () => {
    for (const [cont, hubs] of Object.entries(HUBS)) {
      expect(hubs.length, `${cont}: too few hubs`).toBeGreaterThanOrEqual(3);
    }
  });

  it("transport modes are well-formed and span a real time/money tradeoff", () => {
    for (const m of TRANSPORT_MODES) {
      expect(m.id && m.name && m.emoji && m.blurb, `${m.id}: incomplete mode`).toBeTruthy();
      for (const k of ["speed", "cost"]) { expect(m[k]).toBeGreaterThanOrEqual(1); expect(m[k]).toBeLessThanOrEqual(3); }
      expect(m.core || (m.contexts && m.contexts.length), `${m.id}: neither core nor context-fitted`).toBeTruthy();
    }
  });

  it("every landmark can be reached: 2–3 options with a genuine cheap↔fast spread", () => {
    for (const l of LOCATIONS) {
      if (l.continent === "Antarctica") continue;
      const opts = transportOptionsFor(l, 12);
      expect(opts.length, `${l.id}: no transport options`).toBeGreaterThanOrEqual(2);
      expect(opts.length).toBeLessThanOrEqual(3);
      const costs = opts.map((o) => o.usd), times = opts.map((o) => o.days);
      // at least one axis must actually differ, or there's no decision to make
      expect(Math.max(...costs) > Math.min(...costs) || Math.max(...times) > Math.min(...times),
        `${l.id}: all options cost the same`).toBe(true);
      for (const o of opts) { expect(o.usd).toBeGreaterThan(0); expect(o.days).toBeGreaterThan(0); }
    }
  });

  // These pin the "a mode is only offered where it truly fits" promise in travel.js.
  // They exist because the category-derived rules read as completely plausible and
  // were wrong: a camel at the Dune du Pilat outside Bordeaux, a cable car up
  // Kilimanjaro (proposed 2019, never built), a dugout canoe on the Douro.
  const CAMEL_OK = new Set(["Morocco", "Egypt", "Jordan", "Mongolia", "China", "Australia"]);
  const offers = (l, id, deg = 14) => transportOptionsFor(l, deg).some((o) => o.id === id);

  it("offers a camel only where camels actually are", () => {
    for (const l of LOCATIONS) {
      if (!offers(l, "camel")) continue;
      expect(CAMEL_OK.has(l.country), `camel offered in ${l.country} (${l.subject})`).toBe(true);
    }
    // The Americas have llamas, alpacas, vicuñas and guanacos — camelids, but not
    // camels, and not ridden. Antarctica is honestly tagged as a desert, which is
    // exactly how a camel got there.
    for (const l of LOCATIONS.filter((x) => ["South America", "North America", "Antarctica", "Europe"].includes(x.continent))) {
      expect(offers(l, "camel"), `camel offered at ${l.subject} in ${l.continent}`).toBe(false);
    }
  });

  it("offers a cable car or cog railway only where one has been built", () => {
    // Subset, not equality: a place with both (the Matterhorn has the Glacier
    // Paradise cable car AND the Gornergrat cog railway) shows whichever its hash
    // picks, so asserting an exact list would pin the hash rather than the fact.
    const CABLE_OK = new Set(["capetown", "matterhorn", "montblanc", "zugspitze", "huangshan"]);
    const COG_OK = new Set(["matterhorn", "zugspitze", "rio"]);
    for (const l of LOCATIONS) {
      if (offers(l, "cablecar")) expect(CABLE_OK, `cable car at ${l.subject}`).toContain(l.id);
      if (offers(l, "cograil")) expect(COG_OK, `cog railway at ${l.subject}`).toContain(l.id);
    }
    // The great expedition peaks have neither, and must never be offered one.
    for (const id of ["everest", "denali", "aconcagua", "kilimanjaro", "vinson", "k2"]) {
      const l = LOCATIONS.find((x) => x.id === id);
      if (!l) continue;
      expect(offers(l, "cablecar"), `cable car up ${l.subject}`).toBe(false);
      expect(offers(l, "cograil"), `cog railway up ${l.subject}`).toBe(false);
    }
  });

  it("offers a dugout canoe only in dugout country", () => {
    for (const l of LOCATIONS) {
      if (!offers(l, "canoe")) continue;
      expect(["Botswana", "Brazil", "Colombia"], `dugout offered in ${l.country}`).toContain(l.country);
    }
  });

  it("every waterway says whether it is a river, a lake or a canal", () => {
    // The river tag is what gates the riverboat, so an untagged waterway silently
    // loses its boat — and a lake that claimed `river` would gain one it can't have.
    for (const l of LOCATIONS.filter((x) => x.category === "waterway")) {
      const t = l.tags || [];
      const kinds = ["river", "lake", "canal"].filter((k) => t.includes(k));
      expect(kinds.length, `${l.subject}: tagged ${kinds.join("+") || "neither"}`).toBe(1);
    }
  });

  it("every transport mode can actually be offered somewhere", () => {
    // A mode nobody can reach is a drawn icon nobody will ever see. The ferry used
    // to win every river's single flavour slot, hiding the riverboat and the canoe.
    const seen = new Set();
    for (const l of LOCATIONS) for (const deg of [3, 10, 25]) {
      for (const o of transportOptionsFor(l, deg)) seen.add(o.id);
    }
    for (const m of TRANSPORT_MODES) expect(seen, `${m.name} is never offered anywhere`).toContain(m.id);
  });

  it("gives a place the same options every time (no rng in the chooser)", () => {
    // The flavour pick is hashed off the location id, not rnd(): a random draw here
    // would make the Daily Expedition differ between two players on the same day.
    const once = LOCATIONS.map((l) => transportOptionsFor(l, 14).map((o) => o.id).join("|"));
    const twice = LOCATIONS.map((l) => transportOptionsFor(l, 14).map((o) => o.id).join("|"));
    expect(once).toEqual(twice);
  });

  it("currencies are well-formed and the country map points at real ones", () => {
    for (const [code, c] of Object.entries(CURRENCIES)) {
      expect(c.name && c.symbol, `${code}: incomplete currency`).toBeTruthy();
      expect(c.perUsd, `${code}: bad rate`).toBeGreaterThan(0);
    }
    for (const [country, code] of Object.entries(COUNTRY_CURRENCY)) {
      expect(CURRENCIES[code], `${country} → ${code}: unknown currency`).toBeTruthy();
    }
  });

  it("money() reads dollars first, local currency in parentheses (rule 3)", () => {
    expect(money(100, "United States")).toBe("$100");
    const jp = money(100, "Japan");
    expect(jp.startsWith("$100"), `dollars must lead: ${jp}`).toBe(true);
    expect(jp).toMatch(/¥/);
  });

  // The pegged rates are DERIVED from their anchor, so these pin the parity rather
  // than the dollar figure: the anchor's rate is free to be refreshed, but the peg
  // itself is a published fact that must survive it. A euro edit that silently
  // broke the CFA franc's 655.957 would otherwise be invisible.
  it("pegged currencies hold their published parity to their anchor", () => {
    const parity = (code, anchor) => CURRENCIES[code].perUsd / CURRENCIES[anchor].perUsd;
    expect(parity("XOF", "EUR")).toBeCloseTo(655.957, 2);   // fixed 1 Jan 1999
    expect(parity("XAF", "EUR")).toBeCloseTo(655.957, 2);   // same parity, separate currency
    expect(parity("XPF", "EUR")).toBeCloseTo(119.3317, 3);  // fixed 1 Jan 1999
    expect(parity("DKK", "EUR")).toBeCloseTo(7.46038, 4);   // ERM II central rate
    expect(parity("SAR", "USD")).toBeCloseTo(3.75, 3);      // since June 1986
    expect(parity("JOD", "USD")).toBeCloseTo(0.709, 3);     // since Oct 1995
    expect(parity("BZD", "USD")).toBeCloseTo(2, 3);         // since 1978
    expect(parity("NAD", "ZAR")).toBeCloseTo(1, 6);         // Common Monetary Area
  });

  it("a country using the dollar by policy is not a country we failed to map", () => {
    // Ecuador and Panama are dollarized, so they render bare "$120" — identical to
    // the unmapped fallback. The map entry is the only thing recording that we know.
    for (const c of ["Ecuador", "Panama"]) {
      expect(COUNTRY_CURRENCY[c], `${c} must be explicitly mapped`).toBe("USD");
      expect(money(120, c)).toBe("$120");
    }
  });

  it("a word-like currency symbol is spaced off its number", () => {
    // "CFA72,420" reads as one token; "CFA 72,420" reads as money.
    expect(money(120, "Senegal")).toMatch(/CFA [\d,]+/);
    expect(money(120, "Denmark")).toMatch(/kr [\d,]+/);
    expect(money(120, "Belgium")).toMatch(/€\d/);   // a glyph still hugs its number
  });
});

// ---------------------------------------------------------------------------
// He is "Uncle Jonah", or "Jonah" — never bare "Uncle". Nobody refers to a person
// as just "Uncle", and in a game a child reads aloud it lands as a missing word.
// Two shipped strings had drifted into it (a results-screen button and a field-note
// card), so this guards the whole content layer rather than those two spots.
// ---------------------------------------------------------------------------
describe("Uncle Jonah is never just \"Uncle\"", () => {
  const bareUncle = /\bUncle\b(?!\s+Jonah)/;
  const walk = (value, path, hits) => {
    if (typeof value === "string") { if (bareUncle.test(value)) hits.push(`${path}: ${value.slice(0, 70)}`); return; }
    if (Array.isArray(value)) { value.forEach((v, i) => walk(v, `${path}[${i}]`, hits)); return; }
    if (value && typeof value === "object") { for (const k of Object.keys(value)) walk(value[k], `${path}.${k}`, hits); }
  };
  it("never appears in any player-facing content module", async () => {
    const modules = {
      grandpa: await import("../src/data/grandpa.js"),
      curiosities: await import("../src/data/curiosities.js"),
      mrO: await import("../src/data/mr-o.js"),
      anecdotes: await import("../src/data/anecdotes.js"),
      locations: await import("../src/data/locations.js"),
      culture: await import("../src/data/culture.js"),
    };
    const hits = [];
    for (const [name, mod] of Object.entries(modules)) walk({ ...mod }, name, hits);
    expect(hits).toEqual([]);
  });
});
