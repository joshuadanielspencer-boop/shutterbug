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
  pickDogOutfit, CLIMATE_SIGNATURE, NEUTRAL_OUTFITS,
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

  // Every region needs a primary, and an alternate that is genuinely different if it
  // has one at all. A region that quietly lost its alternate to a typo would still
  // render — Pickles would wear one outfit forever there — so `alt` must be either a
  // real second outfit or an explicit null.
  //
  // MENA is the deliberate null: its alternate was the Aviator, on the reasoning
  // that the desert had airmail routes, and what reached the player was a dog in a
  // flying cap in Tehran. Joshua asked why, which is the answer. One right costume
  // beats two of which one is wrong.
  it("every region has a primary, and any alternate is a different outfit", () => {
    for (const [region, r] of Object.entries(OUTFIT_REGIONS)) {
      expect(r.primary, `${region} has no primary`).toBeTruthy();
      expect(r.alt === null || typeof r.alt === "string", `${region}'s alt must be an outfit id or an explicit null`).toBe(true);
      if (r.alt) expect(r.alt, `${region} wears the same outfit twice`).not.toBe(r.primary);
    }
    expect(Object.keys(OUTFIT_REGIONS).length).toBe(20);
    // Keep the exception rare: if most regions stop shuffling, the wardrobe has
    // quietly become one costume per place.
    const single = Object.values(OUTFIT_REGIONS).filter((r) => !r.alt).length;
    expect(single, "too many regions with only one look").toBeLessThanOrEqual(2);
  });

  // Each of the 18 outfits has to be reachable — an outfit a player can earn but
  // never see worn is a costume that fell out of the map.
  it("every outfit is worn by at least one region", () => {
    const worn = new Set();
    for (const r of Object.values(OUTFIT_REGIONS)) { worn.add(r.primary); worn.add(r.alt); }
    for (const o of ALL_OUTFITS) expect(worn.has(o), `${o} is earnable but never worn`).toBe(true);
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

// ---------------------------------------------------------------------------
// Which outfit she actually turns up in. Both of these were reported from play,
// not caught here, which is why they are now pinned.
// ---------------------------------------------------------------------------
describe("what Pickles wears where", () => {
  const all = () => true;
  const none = () => false;
  const only = (...ids) => (o) => ids.includes(o);

  it("never puts her in another region's costume when her own isn't earned", () => {
    // The bug as reported: Pickles arrived in INDIA DRESSED AS AN ASTRONAUT. The
    // old fallback picked at random from every outfit the player owned, so the
    // stand-in could be a spacesuit, a pirate hat, or the Andean kit — each of
    // which is a false claim about where she is standing.
    for (let i = 0; i < 200; i++) {
      const got = pickDogOutfit("India", all);
      expect(NEUTRAL_OUTFITS.includes(got) || got === OUTFIT_REGIONS.south_asian.primary
        || got === OUTFIT_REGIONS.south_asian.alt, `India gave "${got}"`).toBe(true);
    }
  });

  it("stands in only with job outfits, which make sense anywhere", () => {
    // Own everything EXCEPT the region's two, and see what she reaches for.
    const notMine = (o) => o !== OUTFIT_REGIONS.south_asian.primary && o !== OUTFIT_REGIONS.south_asian.alt;
    for (let i = 0; i < 200; i++) {
      const got = pickDogOutfit("India", notMine);
      expect(NEUTRAL_OUTFITS, `India stood in with "${got}"`).toContain(got);
    }
  });

  it("wears her own fur rather than something absurd when she owns no stand-in", () => {
    expect(pickDogOutfit("India", none)).toBe(null);
  });

  it("always wears the parka in the Arctic, never the alternate", () => {
    // The other half of the report: "She shows up as a photographer in icy Sweden.
    // Shouldn't it be a Nordic outfit?" It should — the parka IS the geography
    // there, and the alternate read as a bug even though it was deliberate.
    const parka = OUTFIT_REGIONS.nordic_arctic.primary;
    for (let i = 0; i < 200; i++) expect(pickDogOutfit("Sweden", all)).toBe(parka);
    for (const c of ["Norway", "Iceland", "Finland", "Greenland"])
      if (outfitRegionFor(c) === "nordic_arctic") expect(pickDogOutfit(c, all)).toBe(parka);
  });

  it("holds every climate-signature region to its own kit", () => {
    for (const region of CLIMATE_SIGNATURE) {
      const country = Object.keys(COUNTRY_REGION).find((c) => COUNTRY_REGION[c] === region);
      if (!country) continue;
      const primary = OUTFIT_REGIONS[region].primary;
      for (let i = 0; i < 40; i++)
        expect(pickDogOutfit(country, all), `${country} (${region})`).toBe(primary);
    }
  });

  it("still varies where the alternate is a joke about the place, not a claim", () => {
    // London's alternate is a deerstalker. That should still show up sometimes, or
    // the wardrobe stops being fun.
    const { primary, alt } = OUTFIT_REGIONS.british_isles;
    const seen = new Set();
    for (let i = 0; i < 400; i++) seen.add(pickDogOutfit("United Kingdom", all));
    expect(seen).toContain(primary);
    expect(seen).toContain(alt);
  });

  it("falls back to whichever of the two is earned", () => {
    const { primary, alt } = OUTFIT_REGIONS.british_isles;
    expect(pickDogOutfit("United Kingdom", only(alt))).toBe(alt);
    expect(pickDogOutfit("United Kingdom", only(primary))).toBe(primary);
  });
});
