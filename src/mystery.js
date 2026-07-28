// ===========================================================================
// MYSTERY PHOTOS — the logic behind Uncle Jonah's unsorted archive.
//
// Every other mode in this game runs the same direction: a clue arrives, you
// work out the place, you fly there. That exercises RECALL — given a
// description, produce a location. It never once exercises RECOGNITION: given
// the place itself, know where on Earth you are standing.
//
// This mode is that loop run backwards. Jonah hands you an unlabelled photograph
// from his travelling years and you put a pin on the world map. No clue, no
// country, no name — just the picture and whatever you can read out of it.
//
// It needs no new content: all 464 locations already carry a verified,
// freely-licensed photograph, and none of them has ever been shown to the player
// FIRST.
//
// This file is the pure part — choosing the slides and scoring a pin. The screen
// is src/components/mystery.jsx. Split so the arithmetic can be tested without a
// DOM (test/mystery.test.js), which matters here because the scoring feeds
// player-facing distance strings and those are subject to rule 3.
// ===========================================================================
import { shuffled } from "./rng.js";

export const SLIDES_PER_ROUND = 5;

// Kilometres → statute miles.
const MI_PER_KM = 0.621371;

// ---------------------------------------------------------------------------
// Choosing the slides
// ---------------------------------------------------------------------------
// Places the player has actually PHOTOGRAPHED come first. That is the whole
// point of the mode as review: a child who has been to Petra should be asked to
// recognise Petra. Places merely visited come next, then everything else, so a
// brand-new traveler still gets a full round rather than an empty archive.
//
// Shuffling goes through rng.js, so a round built inside withSeed() is
// reproducible — the same primitive the seeded-run tests guard.
export function pickSlides(locations, profile, n = SLIDES_PER_ROUND) {
  const withPhoto = locations.filter((l) => l.photo && l.photo.src);
  const st = (l) => (profile && profile.loc && profile.loc[l.id]) || null;
  const mastered = [], visited = [], rest = [];
  for (const l of withPhoto) {
    const s = st(l);
    if (s && s.c > 0) mastered.push(l);
    else if (s && s.v > 0) visited.push(l);
    else rest.push(l);
  }
  const pool = [...shuffled(mastered), ...shuffled(visited), ...shuffled(rest)];
  return pool.slice(0, Math.min(n, pool.length));
}

// ---------------------------------------------------------------------------
// Scoring a pin
// ---------------------------------------------------------------------------
// Distance bands, with the continent as a floor underneath them. Both are
// needed, and neither alone is right:
//   • Distance alone punishes a child who correctly reasoned "this is somewhere
//     in Africa" and put the pin 2,000 miles from the actual spot — which, on a
//     continent 4,600 miles across, is a good answer.
//   • Continent alone can't tell "somewhere in Asia" from "that exact valley".
// So: the band earns what it earns, and being on the right continent guarantees
// at least 2. Nothing scores zero — a wrong pin still teaches, and this game
// does not use score as a punishment.
export const BANDS = [
  { maxMi: 60, points: 5, verdict: "Right on it." },
  { maxMi: 250, points: 4, verdict: "Very close." },
  { maxMi: 900, points: 3, verdict: "The right corner of the world." },
];
export const MAX_POINTS = 5;

// Haversine, in kilometres, on the game's equirectangular coords
// (x = lon + 180, y = 90 − lat). Same formula as routes.js kmBetween; repeated
// here rather than imported so this module stays free of the routing layer.
export function kmApart(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = toRad(90 - a.y), lat2 = toRad(90 - b.y);
  const h = Math.sin(toRad(a.y - b.y) / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(toRad(b.x - a.x) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Which way the real place lies from the pin, in words a child can act on.
// North/south first because that is the axis people get wrong.
export function bearingWord(from, to) {
  const dy = from.y - to.y;                        // +ve: target is NORTH of the pin
  const dx = ((to.x - from.x + 540) % 360) - 180;  // +ve: target is EAST, short way round
  const ns = Math.abs(dy) < 4 ? "" : dy > 0 ? "north" : "south";
  const ew = Math.abs(dx) < 4 ? "" : dx > 0 ? "east" : "west";
  if (ns && ew) return `${ns}-${ew}`;
  return ns || ew || "just about there";
}

// Round a distance to a precision it has actually earned. A haversine on a pin a
// child dropped with a mouse is not accurate to the mile, and printing "1,237
// miles" would claim that it is.
const roundDist = (v) => (v < 10 ? Math.round(v) : v < 100 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10);

// Player-facing distance, IMPERIAL FIRST with metric in parentheses (rule 3).
export function distanceText(km) {
  const mi = km * MI_PER_KM;
  if (mi < 10) return "under 10 miles (16 km)";
  const m = roundDist(mi), k = roundDist(km);
  return `${m.toLocaleString("en-US")} miles (${k.toLocaleString("en-US")} km)`;
}

// Some subjects are written with a leading article ("the Qutang Gorge") because
// that is how they read inside a clue. Starting a sentence with one gives you
// "You put it in Europe. the Qutang Gorge is in Asia."
const cap = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

// Score one pin against one slide.
//   guess  { x, y }   where the player put the pin, in game coords
//   loc               the location object (x, y, continent, …)
//   guessContinent    the continent the pin landed in, or null for open ocean
export function scorePin(guess, loc, guessContinent) {
  const km = kmApart(guess, { x: loc.x, y: loc.y });
  const mi = km * MI_PER_KM;
  const band = BANDS.find((b) => mi <= b.maxMi);
  const rightContinent = !!guessContinent && guessContinent === loc.continent;
  const points = Math.max(band ? band.points : 1, rightContinent ? 2 : 1);
  const verdict = band ? band.verdict
    : rightContinent ? "Right continent, wrong corner."
    : "Not this time.";
  return {
    km, miles: mi, points, verdict, rightContinent,
    distance: distanceText(km),
    bearing: bearingWord(guess, { x: loc.x, y: loc.y }),
    // The teaching line: never just "wrong", always which way to have looked.
    lesson: points === MAX_POINTS
      ? `That is ${loc.subject}, and you had it.`
      : guessContinent && !rightContinent
        ? `You put it in ${guessContinent}. ${cap(loc.subject)} is in ${loc.continent} — ${bearingWord(guess, { x: loc.x, y: loc.y })} of your pin.`
        : !guessContinent
          ? `Your pin landed in open water. ${cap(loc.subject)} is in ${loc.country} (${loc.continent}), ${bearingWord(guess, { x: loc.x, y: loc.y })} of where you put it.`
          : `Right continent. ${cap(loc.subject)} is in ${loc.country}, ${bearingWord(guess, { x: loc.x, y: loc.y })} of your pin.`,
  };
}

// How the round as a whole went. Deliberately warm at the bottom end: the child
// who scores 7 out of 25 has just been shown five places they didn't know, which
// is the mode working, not the child failing.
export function roundVerdict(points, slides) {
  const max = slides * MAX_POINTS;
  const pct = max ? points / max : 0;
  if (pct >= 0.9) return "Jonah is astonished. You knew his archive better than he does.";
  if (pct >= 0.7) return "Jonah is impressed — most of those you placed within a few hundred miles.";
  if (pct >= 0.45) return "A good sorting. Jonah reshelves the ones you found and keeps the rest out.";
  if (pct >= 0.2) return "A tricky box. Jonah talks you through the ones that got away.";
  return "Jonah doesn't mind — he says half these places he had to be told himself.";
}
