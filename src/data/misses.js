// ===========================================================================
// What a wrong answer TEACHES.
//
// A miss used to be a verdict and nothing else: "Jonah's subject isn't here", a
// lost half-day, try again. In a teaching tool that's a free lesson thrown away —
// the child has just pointed at a real place on a real map and been told only that
// it was the wrong one. Every miss now comes back with a true sentence about where
// they pointed and how it stands to where they meant to go.
//
// CLAUDE.md rule 1: the phrasing is content, so it lives here rather than inline in
// the component. The component supplies the geometry (distance, bearing) and the
// two locations; this file decides what to say about them.
//
// Rule 2 (everything must be verifiable) is satisfied structurally rather than by
// checking sources: nothing here asserts a fact that isn't already in
// src/data/locations.js (city, country, continent) or computed from the two sets of
// coordinates (distance, compass bearing). There is no claim to get wrong — if a
// sentence here is false, then either the coordinates or the country in the
// location data is wrong, and `npm test` guards those separately.
//
// Rule 3: distances read imperial first, metric in brackets.
// ===========================================================================

// Rounded so the number reads as an estimate rather than a false precision — the
// pins are city-centre points, so "about 620 miles" is honest and "617.4" is not.
const roundish = (n) => {
  if (n < 100) return Math.max(5, Math.round(n / 5) * 5);
  if (n < 1000) return Math.round(n / 10) * 10;
  return Math.round(n / 50) * 50;
};
const withCommas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// km in, "about 620 miles (1,000 km)" out. Imperial leads (rule 3).
export function distancePhrase(km) {
  const mi = roundish(km * 0.621371);
  return `about ${withCommas(mi)} miles (${withCommas(roundish(km))} km)`;
}

// ---- A wrong CITY, on the right continent ---------------------------------
// `bearing` is a compass word ("north-east") pointing from the clicked place to the
// target. Three shapes, because what's worth saying differs:
//   • same country  — teach the internal geography ("also in Peru, 300 miles south")
//   • same continent — teach the neighbour ("that's Chile; you want Argentina")
//   • the target is a category, not a place — teach what they DID photograph
export function cityMissLesson({ clicked, target, km, bearing }) {
  if (!clicked || !target) return null;
  const where = distancePhrase(km);
  if (clicked.country === target.country) {
    return `That's ${clicked.city}. ${target.city} is in ${target.country} too — ${where} to the ${bearing}.`;
  }
  return `That's ${clicked.city}, in ${clicked.country}. What you want is in ${target.country}, ${where} to the ${bearing}.`;
}

// When the assignment asked for a KIND of place rather than a named one, the useful
// lesson is what the child actually pointed at — they found a real thing, just not
// the thing on the list.
export function categoryMissLesson({ clicked, wantNoun, clickedKindName }) {
  if (!clicked) return null;
  return `That's ${clicked.city} in ${clicked.country} — ${clickedKindName ? `a ${clickedKindName}` : "a fine subject"}, but Jonah asked for ${wantNoun}.`;
}

// ---- A wrong CONTINENT ----------------------------------------------------
// The ocean or the direction between two continents is the single most useful thing
// a child can take from picking the wrong one, so it's said outright. The crossing
// names are geography, not decoration: they're what makes "west of Africa" mean
// something.
// Keyed FROM|TO; the phrase says where TO lies as seen from FROM, and is dropped
// into "…is in {to}, {phrase} from there." Both directions of every pair are spelled
// out rather than derived, because the reverse of a crossing is not its mirror: you
// go south-east from Asia to Oceania, but north-west coming back, and the Mediterranean
// is "just north" from Africa and "just south" from Europe.
const CROSSINGS = {
  "Africa|South America": "west across the Atlantic", "South America|Africa": "east across the Atlantic",
  "Africa|North America": "north-west across the Atlantic", "North America|Africa": "south-east across the Atlantic",
  "Europe|North America": "west across the Atlantic", "North America|Europe": "east across the Atlantic",
  "Europe|South America": "south-west across the Atlantic", "South America|Europe": "north-east across the Atlantic",
  "Asia|North America": "east across the Pacific", "North America|Asia": "west across the Pacific",
  "Asia|Oceania": "south-east, down past the islands", "Oceania|Asia": "north-west, up past the islands",
  "Oceania|North America": "north-east across the Pacific", "North America|Oceania": "south-west across the Pacific",
  "Oceania|South America": "east across the Pacific", "South America|Oceania": "west across the Pacific",
  "Africa|Europe": "just north, across the Mediterranean", "Europe|Africa": "just south, across the Mediterranean",
  "Africa|Asia": "to the north-east", "Asia|Africa": "to the south-west",
  "Europe|Asia": "to the east", "Asia|Europe": "to the west",
  "North America|South America": "to the south", "South America|North America": "to the north",
  "Africa|Oceania": "east across the Indian Ocean", "Oceania|Africa": "west across the Indian Ocean",
  "Europe|Oceania": "far to the south-east, half a world away", "Oceania|Europe": "far to the north-west, half a world away",
  "Asia|South America": "east across the Pacific", "South America|Asia": "west across the Pacific",
  "Antarctica|Oceania": "to the north", "Oceania|Antarctica": "far to the south",
  "Antarctica|South America": "to the north", "South America|Antarctica": "far to the south",
  "Antarctica|Africa": "to the north", "Africa|Antarctica": "far to the south",
};
export function continentMissLesson({ from, to, bearing, alreadyHere }) {
  if (!from || !to) return null;
  const crossing = CROSSINGS[`${from}|${to}`] || `to the ${bearing}`;
  if (alreadyHere) {
    return `You're standing in ${from}. What Jonah wants is in ${to} — ${crossing} from here.`;
  }
  return `That's ${from}. Jonah's subject is in ${to}, ${crossing} from there.`;
}
