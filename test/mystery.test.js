// ===========================================================================
// Mystery Photos — the archive round.
//
// Two things here are worth a test rather than a read-through:
//
//   • The distance strings are PLAYER-FACING MEASUREMENTS, so rule 3 applies to
//     them exactly as it does to a clue: imperial first, metric in parentheses.
//     Unlike the clues, these are GENERATED at runtime — the imperial-first test
//     over locations.js can never see them — so they get pinned here or nowhere.
//
//   • The scoring must not be able to hand out a zero, and must not be able to
//     rank a worse pin above a better one. Both are easy to break later by
//     reordering the bands.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { withSeed } from "../src/rng.js";
import { LOCATIONS } from "../src/data/locations.js";
import { pickSlides, scorePin, distanceText, kmApart, bearingWord,
  roundVerdict, BANDS, MAX_POINTS, SLIDES_PER_ROUND } from "../src/mystery.js";

const BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
const paris = BY_ID.paris;

describe("Mystery Photos — choosing the slides", () => {
  it("only ever offers a slide that HAS a photograph", () => {
    // The whole mode is "look at this picture". A location whose photo is still
    // null would show the hand-drawn icon fallback, which is a drawing of the
    // answer — it would give the game away and teach nothing.
    for (let i = 0; i < 40; i++)
      for (const l of pickSlides(LOCATIONS, null))
        expect(l.photo && l.photo.src, `${l.id} has no photo`).toBeTruthy();
  });

  it("gives a full round, with no slide repeated inside it", () => {
    const slides = pickSlides(LOCATIONS, null);
    expect(slides).toHaveLength(SLIDES_PER_ROUND);
    expect(new Set(slides.map((l) => l.id)).size).toBe(SLIDES_PER_ROUND);
  });

  it("asks about the places you have actually photographed first", () => {
    // The mode is review before it is anything else.
    const target = LOCATIONS.filter((l) => l.photo && l.photo.src).slice(0, 3);
    const profile = { loc: Object.fromEntries(target.map((l) => [l.id, { v: 1, c: 1 }])) };
    const ids = new Set(pickSlides(LOCATIONS, profile).map((l) => l.id));
    for (const l of target) expect(ids.has(l.id), `${l.id} was mastered but not asked`).toBe(true);
  });

  it("still fills a round for a traveler who has been nowhere", () => {
    expect(pickSlides(LOCATIONS, { loc: {} })).toHaveLength(SLIDES_PER_ROUND);
  });

  it("is reproducible inside withSeed", () => {
    const draw = () => withSeed("archive-1", () => pickSlides(LOCATIONS, null).map((l) => l.id));
    expect(draw()).toEqual(draw());
    expect(draw()).not.toEqual(withSeed("archive-2", () => pickSlides(LOCATIONS, null).map((l) => l.id)));
  });
});

describe("Mystery Photos — distances read imperial first (rule 3)", () => {
  // Same shape as the locations check in data.test.js, but over the strings this
  // module BUILDS. Anything with a metric figure must carry an imperial one, and
  // the imperial one must come first.
  const METRIC = /\b\d[\d,.]*\s?(?:km|kilometres|kilometers|metres|meters)\b/i;
  const IMPERIAL = /\b\d[\d,.]*\s?miles?\b/i;

  const samples = [0, 1, 9, 15, 60, 120, 250, 900, 2500, 9000, 19000];

  it("every distance string leads with miles and puts km in parentheses", () => {
    for (const km of samples) {
      const t = distanceText(km);
      expect(METRIC.test(t), `"${t}" has no metric figure`).toBe(true);
      expect(IMPERIAL.test(t), `"${t}" has no imperial figure`).toBe(true);
      expect(t.search(IMPERIAL) < t.search(METRIC), `"${t}" leads with metric`).toBe(true);
      expect(t, `"${t}" should bracket the metric`).toMatch(/\(.*(km|kilometers)\)/i);
    }
  });

  it("never claims more precision than a dropped pin has", () => {
    // 1,237.4 miles is a lie about how carefully anyone clicked.
    expect(distanceText(2000)).not.toMatch(/\d\.\d/);
    expect(distanceText(12345)).not.toMatch(/\d\.\d/);
  });

  it("the miles figure really is smaller than the km one", () => {
    // Catches the units being swapped — which would still pass the order test.
    const t = distanceText(1000);
    const [mi, km] = t.match(/[\d,]+/g).map((s) => Number(s.replace(/,/g, "")));
    expect(mi).toBeLessThan(km);
    expect(mi / km).toBeCloseTo(0.621, 1);
  });
});

describe("Mystery Photos — scoring a pin", () => {
  const at = (loc, dx = 0, dy = 0) => ({ x: loc.x + dx, y: loc.y + dy });

  it("a pin right on the place scores full marks", () => {
    const r = scorePin(at(paris), paris, "Europe");
    expect(r.points).toBe(MAX_POINTS);
    expect(r.km).toBeLessThan(1);
  });

  it("never scores zero, however wrong the pin is", () => {
    // Score is not a punishment in this game. The antipode of Paris is about as
    // wrong as a pin on Earth can be.
    const r = scorePin({ x: (paris.x + 180) % 360, y: 180 - paris.y }, paris, "Oceania");
    expect(r.points).toBeGreaterThanOrEqual(1);
  });

  it("scores can only fall as the pin gets further away", () => {
    let last = Infinity;
    for (const dx of [0, 0.5, 3, 12, 60, 170]) {
      const r = scorePin(at(paris, dx), paris, "Europe");
      expect(r.points).toBeLessThanOrEqual(last);
      last = r.points;
    }
  });

  it("the right continent is a floor, so a good continent guess beats a wild one", () => {
    // Both pins are far from Paris; one reasoned its way to Europe.
    const inEurope = scorePin({ x: 205, y: 55 }, paris, "Europe");   // eastern Europe
    const nowhere = scorePin({ x: 60, y: 130 }, paris, "Africa");
    expect(inEurope.rightContinent).toBe(true);
    expect(inEurope.points).toBeGreaterThanOrEqual(2);
    expect(inEurope.points).toBeGreaterThan(nowhere.points);
  });

  it("a close pin on the wrong side of a border still scores on distance", () => {
    // Rule-of-thumb sanity: being 30 miles out but in the next country along is
    // a near-perfect answer, not a continent-level one.
    const nearby = scorePin(at(paris, 0.3, 0.2), paris, "Europe");
    expect(nearby.points).toBe(MAX_POINTS);
  });

  it("open water is handled without pretending it is a continent", () => {
    const r = scorePin({ x: 210, y: 120 }, paris, null); // mid-Indian Ocean
    expect(r.rightContinent).toBe(false);
    expect(r.lesson).toMatch(/open water/i);
    expect(r.points).toBe(1);
  });

  it("always says which way the real place lies", () => {
    for (const [dx, dy, want] of [[-20, 0, "east"], [20, 0, "west"], [0, 20, "north"], [0, -20, "south"]]) {
      const r = scorePin(at(paris, dx, dy), paris, "Europe");
      expect(r.bearing, `pin at dx=${dx} dy=${dy}`).toContain(want);
    }
  });

  it("gives a bearing across the seam the short way, not all the way round", () => {
    // A pin just west of the antimeridian and a target just east of it are
    // neighbours. Naive subtraction calls that 350 degrees and points the wrong way.
    const target = { x: 5, y: 90 };   // lon 175°W
    const guess = { x: 355, y: 90 };  // lon 175°E
    expect(bearingWord(guess, target)).toContain("east");
  });

  it("the bands are ordered, so BANDS.find picks the tightest one", () => {
    for (let i = 1; i < BANDS.length; i++) {
      expect(BANDS[i].maxMi).toBeGreaterThan(BANDS[i - 1].maxMi);
      expect(BANDS[i].points).toBeLessThan(BANDS[i - 1].points);
    }
  });
});

describe("Mystery Photos — the round summary", () => {
  it("says something kind at every score, including nothing at all", () => {
    for (const p of [0, 3, 9, 17, 25]) {
      const v = roundVerdict(p, 5);
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(10);
    }
  });

  it("a perfect round is not described the same way as a blank one", () => {
    expect(roundVerdict(25, 5)).not.toBe(roundVerdict(0, 5));
  });

  it("does not divide by zero on an empty round", () => {
    expect(() => roundVerdict(0, 0)).not.toThrow();
  });
});

describe("Mystery Photos — the distance maths agrees with the rest of the game", () => {
  it("matches known great-circle distances", () => {
    // Paris–New York is about 3,630 miles (5,840 km); allow 2%.
    const ny = LOCATIONS.find((l) => l.city === "New York City") || BY_ID["statue-of-liberty"];
    if (!ny) return;
    const km = kmApart({ x: paris.x, y: paris.y }, { x: ny.x, y: ny.y });
    expect(km).toBeGreaterThan(5700);
    expect(km).toBeLessThan(6000);
  });
});

describe("Mystery Photos — the lesson reads as a sentence", () => {
  // Several subjects carry a leading article because that is how they read inside
  // a clue ("photograph the Qutang Gorge"). Dropped straight into the lesson they
  // gave "You put it in Europe. the Qutang Gorge is in Asia."
  const lower = LOCATIONS.filter((l) => /^[a-z]/.test(l.subject));

  it("there really are subjects that start lowercase (so this test has teeth)", () => {
    expect(lower.length).toBeGreaterThan(0);
  });

  it("no sentence inside a lesson begins with a lowercase letter", () => {
    const cases = [
      ["wrong continent", (l) => scorePin({ x: 190, y: 45 }, l, "Europe")],
      ["open water", (l) => scorePin({ x: 210, y: 120 }, l, null)],
      ["right continent", (l) => scorePin({ x: l.x + 40, y: l.y + 20 }, l, l.continent)],
    ];
    for (const l of lower.slice(0, 25)) {
      for (const [what, run] of cases) {
        for (const sentence of run(l).lesson.split(/(?<=[.!?])\s+/)) {
          expect(/^[a-z]/.test(sentence), `${l.id} (${what}): "${sentence}"`).toBe(false);
        }
      }
    }
  });
});
