// Which countries get the pulsing locator ring on a continent map.
//
// The map applies an automatic span floor plus ALWAYS_RING for the judgement a
// measurement can't make. Joshua has set the boundary twice, from play:
//   · Jamaica is findable unaided — the first version of the floor ringed it and
//     he said that was too generous.
//   · Trinidad and Tobago is not — he found it unringed and asked for a sweep of
//     everything its size or smaller, benchmarked against Hungary.
//
// Those two together give a rule a test can hold: anything SMALLER THAN JAMAICA
// must be ringed. Jamaica itself and everything above it is left to the automatic
// floor and to judgement, because "a ring on everything is a ring on nothing".
//
// This is deliberately a CONTENT test — it runs on the outlines, so a new country
// added to the game gets checked the moment it lands, which is exactly how
// Trinidad and Tobago slipped through.
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { WORLD_COUNTRIES } from "../src/data/worldmap.js";
import { ALWAYS_RING } from "../src/data/countries.js";
import { pathBBox, pathArea, WC_ALIAS } from "../src/map-geometry.js";

const OUTLINE = {};
for (const c of WORLD_COUNTRIES) OUTLINE[c.name] = c.d;

const sized = (() => {
  const seen = new Map();
  for (const l of LOCATIONS) if (!seen.has(l.country)) seen.set(l.country, l.continent);
  const out = [];
  for (const [country, continent] of seen) {
    const d = OUTLINE[country] || OUTLINE[WC_ALIAS[country]];
    if (!d) continue;                       // Singapore has no outline at this scale
    const bb = pathBBox(d, null);
    if (!bb) continue;
    out.push({
      country, continent,
      side: Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY),
      area: pathArea(d),
    });
  }
  return out;
})();

const jamaica = sized.find((r) => r.country === "Jamaica");

describe("small-country locator rings", () => {
  it("has Jamaica to measure against", () => {
    expect(jamaica, "Jamaica is the agreed floor and must be in the game").toBeTruthy();
  });

  it("rings every country smaller than Jamaica", () => {
    const missed = sized
      .filter((r) => r.area < jamaica.area && r.side < jamaica.side)
      .filter((r) => !ALWAYS_RING.has(r.country))
      .map((r) => `${r.country} (${r.continent}): area ${r.area.toFixed(2)} vs Jamaica ${jamaica.area.toFixed(2)}, side ${r.side.toFixed(2)} vs ${jamaica.side.toFixed(2)}`);
    expect(missed, `smaller than Jamaica and not ringed:\n  ${missed.join("\n  ")}`).toEqual([]);
  });

  it("does not ring Jamaica itself", () => {
    // Pins Joshua's own correction. If this ever fails, the floor has crept back
    // up and the ring is about to start meaning nothing again.
    expect(ALWAYS_RING.has("Jamaica")).toBe(false);
  });

  // Every entry must resolve to something the map could match — a country the
  // game draws, or a real outline name for one it might draw later. This is the
  // check that would have caught "Eswatini", which Natural Earth spells "eSwatini"
  // and which therefore sat in the list for months matching nothing at all.
  it("only names countries the map could actually match", () => {
    const drawn = new Set(LOCATIONS.flatMap((l) => (l.countries && l.countries.length ? l.countries : [l.country])));
    const unmatched = [...ALWAYS_RING].filter((c) => !drawn.has(c) && !OUTLINE[c]);
    expect(unmatched, `ALWAYS_RING entries that match nothing: ${unmatched.join(", ")}`).toEqual([]);
  });

  // The list is allowed to name countries with no landmarks yet — they are
  // pre-registered — but the ones that CAN fire are the ones worth counting, and
  // a ring on everything is a ring on nothing.
  it("keeps the live list small next to the countries actually drawn", () => {
    const drawn = new Set(LOCATIONS.flatMap((l) => (l.countries && l.countries.length ? l.countries : [l.country])));
    const live = [...ALWAYS_RING].filter((c) => drawn.has(c));
    expect(live.length).toBeLessThan(drawn.size / 5);
  });
});
