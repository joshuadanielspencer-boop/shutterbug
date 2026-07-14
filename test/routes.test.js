// ===========================================================================
// The Grand Tour is played against PAR — the cheapest circuit that exists. If
// par isn't actually the optimum, the mode quietly breaks in three ways at once:
// the player beats "the best possible route" by accident, "a perfect circuit"
// congratulates them for nothing, and the day budget (which is derived FROM par)
// comes out too generous, so the ordering stops mattering — which was the entire
// point of differentiating the mode from Assignments.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { tourPar, routeCost, flightDays, kmBetween } from "../src/routes.js";

// Stand-in continent pins, in the game's map space (x = lon + 180, y = 90 − lat).
const PINS = {
  "North America": { x: 80, y: 45 },
  "South America": { x: 120, y: 105 },
  "Europe": { x: 190, y: 40 },
  "Africa": { x: 200, y: 90 },
  "Asia": { x: 280, y: 45 },
  "Oceania": { x: 315, y: 115 },
  "Antarctica": { x: 180, y: 165 },
};
const HUB = { x: 106, y: 49 };

// Every ordering, scored the slow, obvious way. If the clever search ever
// disagrees with this, the clever search is wrong.
const permutations = (a) => (a.length <= 1 ? [a]
  : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));

describe("flight cost", () => {
  it("charges more for a longer haul, with a floor and a cap", () => {
    const short = flightDays(PINS["Europe"], PINS["Africa"]);
    const long = flightDays(PINS["North America"], PINS["Oceania"]);
    expect(long).toBeGreaterThan(short);
    expect(short).toBeGreaterThanOrEqual(0.5);   // even a hop costs half a day
    expect(long).toBeLessThanOrEqual(3);         // no single leg is ruinous
  });

  it("measures a Pacific hop the short way round, not across the whole map", () => {
    // x = 350 and x = 10 are 20° apart across the antimeridian, not 340°.
    const wrapped = kmBetween({ x: 350, y: 90 }, { x: 10, y: 90 });
    const direct = kmBetween({ x: 170, y: 90 }, { x: 190, y: 90 });
    expect(Math.abs(wrapped - direct)).toBeLessThan(1);
  });
});

describe("Grand Tour par", () => {
  const SETS = [
    ["Europe", "Africa"],
    ["North America", "Europe", "Asia"],
    ["South America", "Asia", "Oceania", "Europe"],
    ["North America", "South America", "Europe", "Africa", "Asia"],
    ["North America", "South America", "Europe", "Africa", "Asia", "Oceania"],
  ];

  it("really is the cheapest order — checked against every possible order", () => {
    for (const set of SETS) {
      const best = Math.min(...permutations(set).map((p) => routeCost(p, PINS, HUB)));
      const found = tourPar(set, PINS, HUB);
      expect(found.cost, `par for [${set}] should be the true minimum`).toBeCloseTo(best, 5);
      // and the order it hands back must actually cost what it claims
      expect(routeCost(found.order, PINS, HUB)).toBeCloseTo(found.cost, 5);
      expect([...found.order].sort()).toEqual([...set].sort());   // visits every stop, once
    }
  });

  it("a lazy order really is worse than par — otherwise the mode has no game in it", () => {
    // Bouncing across the planet and back must cost more than a sensible circuit.
    const lazy = ["Asia", "South America", "Asia" === "x" ? "" : "Europe"].filter(Boolean);
    const set = ["Asia", "South America", "Europe"];
    expect(routeCost(lazy, PINS, HUB)).toBeGreaterThan(tourPar(set, PINS, HUB).cost);
  });

  it("copes with the trivial cases", () => {
    expect(tourPar([], PINS, HUB).cost).toBe(0);
    expect(tourPar(["Europe"], PINS, HUB).cost).toBe(routeCost(["Europe"], PINS, HUB));
  });
});
