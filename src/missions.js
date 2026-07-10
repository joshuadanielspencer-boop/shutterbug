// ===========================================================================
// CATEGORY-MISSION RULES — the logic that decides when "photograph any X in Y"
// is a fair assignment, and which countries such a mission may offer.
//
// Pulled out of the game component so `npm test` can exercise the real rules
// against the real content, rather than a copy of them.
//
// The bug this exists to prevent: a player asked for "any desert in Africa" was
// shown Algeria as a country option and told they were wrong. Algeria genuinely
// contains the Sahara — but the game's Algeria entry is a rock formation, not a
// desert. The mission means "any desert ON THE EDITOR'S LIST". So the country
// step must only ever offer countries that really hold one, and the clue must
// say how many there are.
// ===========================================================================
import { LOCATIONS } from "./data/locations.js";

// A landmark usually sits in one country; a few straddle a border (Niagara,
// Lake Kariba) and count for either.
export const countriesOf = (l) => (l.countries && l.countries.length ? l.countries : [l.country]);

// Every country on `continent` that holds a member of `category`.
export function categoryCountries(continent, category, locations = LOCATIONS) {
  const set = new Set();
  for (const l of locations) {
    if (l.continent !== continent || l.category !== category) continue;
    for (const c of countriesOf(l)) set.add(c);
  }
  return [...set];
}

export function categoryMembers(continent, category, locations = LOCATIONS) {
  return locations.filter((l) => l.continent === continent && l.category === category);
}

// Is "photograph any <category> in <continent>" a fair mission?
//
// - Never on Antarctica: nearly everything there reads as ice/mountain/desert at
//   a glance, so the category framing is inherently confusing (playtest feedback).
// - It needs at least two members, or "any X here" is a riddle with one answer.
// - When the country step is in play (Medium/Hard), it also needs at least two
//   qualifying countries, or that step is a coin flip.
//
// `withCountryStep` is the caller's usesCountryLayer(mode, continent).
export function categoryMissionOK(category, continent, withCountryStep = false, locations = LOCATIONS) {
  if (continent === "Antarctica") return false;
  if (categoryMembers(continent, category, locations).length < 2) return false;
  if (withCountryStep) return categoryCountries(continent, category, locations).length >= 2;
  return true;
}
