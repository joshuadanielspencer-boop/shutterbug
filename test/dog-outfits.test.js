// ===========================================================================
// Pickles's wardrobe — the earning rules.
//
// Which outfit a country dresses her in, and which outfits a profile has EARNED,
// are pure functions of the content + the player's mastered places. Pinned here so
// the thresholds can't drift silently: a region outfit that suddenly needs one place
// instead of three, or an "all 7 continents" reward that fires at six, would both
// look fine on screen and be wrong.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import {
  COUNTRY_REGION, OUTFIT_REGIONS, outfitRegionFor,
  unlockedOutfits, OUTFIT_UNLOCK, ALL_OUTFITS,
} from "../src/data/dog-outfits.js";

const profile = (ids) => ({ loc: Object.fromEntries(ids.map((id) => [id, { c: 1 }])) });
const idsInRegion = (r) => LOCATIONS.filter((l) => COUNTRY_REGION[l.country] === r).map((l) => l.id);
const idsInCategory = (c) => LOCATIONS.filter((l) => l.category === c).map((l) => l.id);
const onePerContinent = () => {
  const seen = new Set(), out = [];
  for (const l of LOCATIONS) if (!seen.has(l.continent)) { seen.add(l.continent); out.push(l.id); }
  return out;
};

describe("every country and outfit is wired up", () => {
  it("maps every game country to a region that has outfits", () => {
    const countries = [...new Set(LOCATIONS.map((l) => l.country))];
    for (const c of countries) {
      const region = outfitRegionFor(c);
      expect(region, `${c} has no wardrobe region`).toBeTruthy();
      expect(OUTFIT_REGIONS[region], `region ${region} has no outfits`).toBeTruthy();
    }
  });

  it("every outfit named by a region also has an unlock rule", () => {
    const used = new Set();
    for (const r of Object.values(OUTFIT_REGIONS)) { used.add(r.primary); if (r.alt) used.add(r.alt); }
    for (const o of used) expect(OUTFIT_UNLOCK[o], `${o} has no unlock rule`).toBeTruthy();
    expect(ALL_OUTFITS.length).toBe(18);
  });
});

describe("outfits are earned at the right thresholds", () => {
  it("a home region opens at three places there, not two", () => {
    const alps = idsInRegion("alpine_europe");
    expect(alps.length).toBeGreaterThanOrEqual(3); // sanity — the region has enough to test
    expect(unlockedOutfits(profile(alps.slice(0, 2))).has("alpine_europe")).toBe(false);
    expect(unlockedOutfits(profile(alps.slice(0, 3))).has("alpine_europe")).toBe(true);
  });

  it("the Photographer opens at 10 places, the Aviator not until 25", () => {
    const ten = LOCATIONS.slice(0, 10).map((l) => l.id);
    const set = unlockedOutfits(profile(ten));
    expect(set.has("photographer")).toBe(true);
    expect(set.has("aviator")).toBe(false);
  });

  it("a single stamp in the region earns its gap costume", () => {
    const carib = idsInRegion("caribbean");
    expect(carib.length).toBeGreaterThanOrEqual(1);
    expect(unlockedOutfits(profile([carib[0]])).has("pirate_captain")).toBe(true);
  });

  it("the Mountain Hiker wants five mountains", () => {
    const mtns = idsInCategory("mountain");
    expect(mtns.length).toBeGreaterThanOrEqual(5);
    expect(unlockedOutfits(profile(mtns.slice(0, 4))).has("mountain_hiker")).toBe(false);
    expect(unlockedOutfits(profile(mtns.slice(0, 5))).has("mountain_hiker")).toBe(true);
  });

  it("the Astronaut is earned only on all seven continents", () => {
    const seven = onePerContinent();
    expect(seven.length).toBe(7);
    expect(unlockedOutfits(profile(seven.slice(0, 6))).has("astronaut")).toBe(false);
    expect(unlockedOutfits(profile(seven)).has("astronaut")).toBe(true);
  });

  it("a brand-new profile has earned nothing", () => {
    expect(unlockedOutfits(profile([])).size).toBe(0);
  });
});
