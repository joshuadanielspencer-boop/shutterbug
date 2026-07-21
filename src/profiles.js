// ===========================================================================
// Player profiles + progress, saved in the browser's localStorage.
//
// No login and no backend — this is a standalone app. Each child picks a
// name on the start screen; everything below is stored under one key and
// kept per-browser. If localStorage is unavailable (private mode, blocked),
// every function degrades to a harmless no-op / empty result.
//
// Per profile we record, for each location id: how many times it was
//   v = visited (flown to), c = photographed correctly, m = missed
//       (assigned but not filed before the trip ended).
// Countries and continents are derived from these on the fly (see passportData).
// ===========================================================================
import { LOCATIONS } from "./data/locations.js";
import { rnd } from "./rng.js";
import { kindOf } from "./data/categories.js";
import { CATEGORY_ART, ACHIEVEMENT_ART } from "./data/art.js";

const KEY = "shutterbug.v1";
const MAX_NAME = 20;

const emptyStore = () => ({ version: 1, lastProfile: null, profiles: {} });

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return parsed && parsed.profiles ? parsed : emptyStore();
  } catch {
    return emptyStore();
  }
}

function write(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false; // storage full or blocked — progress just won't persist
  }
}

// The raw store, for the sync layer only (src/sync.js). Game code must go through the
// named functions above and below — these two exist so background reconciliation can
// read and replace the whole store atomically without profiles.js having to know that
// a network exists.
export const readStore = () => read();
export const writeStore = (store) => write(store);

export function storageAvailable() {
  try {
    const k = "__sb_probe__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function listProfiles() {
  const s = read();
  return Object.values(s.profiles).sort(
    (a, b) => (b.lastPlayed || b.created || 0) - (a.lastPlayed || a.created || 0)
  );
}

export function lastProfileName() {
  return read().lastProfile;
}

export function getProfile(name) {
  if (!name) return null;
  return read().profiles[name] || null;
}

export function createProfile(rawName) {
  const name = String(rawName || "").trim().slice(0, MAX_NAME);
  if (!name) return null;
  const s = read();
  if (!s.profiles[name]) {
    s.profiles[name] = { name, created: Date.now(), games: 0, best: {}, loc: {} };
  }
  s.lastProfile = name;
  write(s);
  return s.profiles[name];
}

// Save the traveler's avatar (a small spec object the Avatar component
// renders; see AVATAR_PARTS in the game component). null clears it back to
// the name-derived default.
export function setAvatar(name, avatar) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return;
  p.avatar = avatar || null;
  write(s);
}

// Curiosity layer: remember which tap-to-learn field-note cards a traveler has
// read, so "Curiosities found: X / Y" counts poking around as progress. Stored as
// a plain map of card id → true. Returns the updated set size, or 0 for guests.
export function markCuriositySeen(name, cardId) {
  const s = read();
  const p = s.profiles[name];
  if (!p || !cardId) return 0;
  p.curios = p.curios || {};
  p.curios[cardId] = true;
  write(s);
  return Object.keys(p.curios).length;
}
export function curiositiesSeen(profile) {
  return (profile && profile.curios) || {};
}

// Persist a small arbitrary flag on a profile (e.g. story progress like
// whether the traveler has met Uncle Jonah yet). Unknown keys are fine.
export function setProfileFlag(name, key, value) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return;
  p[key] = value;
  write(s);
}

export function setLastProfile(name) {
  const s = read();
  if (name === null || s.profiles[name]) {
    s.lastProfile = name;
    write(s);
  }
}

export function deleteProfile(name) {
  const s = read();
  delete s.profiles[name];
  if (s.lastProfile === name) s.lastProfile = null;
  write(s);
}

// Rename a traveler, keeping all their progress. Profiles are keyed by name, so
// this re-keys the object and its `name` field. Returns the new name on success,
// or null if the new name is empty or already taken by a DIFFERENT traveler.
export function renameProfile(oldName, rawNew) {
  const newName = String(rawNew || "").trim().slice(0, MAX_NAME);
  if (!newName) return null;
  const s = read();
  const p = s.profiles[oldName];
  if (!p) return null;
  if (newName === oldName) return oldName;                 // nothing to do
  if (s.profiles[newName]) return null;                    // would clobber another traveler
  p.name = newName;
  s.profiles[newName] = p;
  delete s.profiles[oldName];
  if (s.lastProfile === oldName) s.lastProfile = newName;
  write(s);
  return newName;
}

// Record one finished game against a profile.
// Returns { isBest, best, isBestTime, bestTime }.
export function recordGame(name, { difficulty, score, timeMs = 0, won = false, rank = null, mode = "assignments", visitedIds = [], correctIds = [], missedIds = [] }) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { isBest: false, best: 0, isBestTime: false, bestTime: 0 };

  p.games = (p.games || 0) + 1;
  p.lastPlayed = Date.now();
  // Remember the most recent trip's outcome so Uncle can comment on it at the
  // start of the next expedition (see the meet screen).
  p.lastRun = { won: !!won, difficulty, score, mode, at: Date.now() };
  p.best = p.best || {};
  const prevBest = p.best[difficulty] || 0;
  const isBest = score > prevBest;
  if (isBest) {
    p.best[difficulty] = score;
    // Remember the details of the run that set this best, for the leaderboard:
    // the editor-rank earned, the mode, and how long the trip took.
    p.bestMeta = p.bestMeta || {};
    p.bestMeta[difficulty] = { score, rank, mode, timeMs, won, at: Date.now() };
  }

  // Best time is only tracked for a fully completed trip (all shots filed).
  let isBestTime = false;
  p.bestTime = p.bestTime || {};
  if (won && timeMs > 0) {
    const prevT = p.bestTime[difficulty];
    if (!prevT || timeMs < prevT) { p.bestTime[difficulty] = timeMs; isBestTime = true; }
  }

  p.loc = p.loc || {};
  const bump = (id, field) => {
    const e = p.loc[id] || (p.loc[id] = { v: 0, c: 0, m: 0 });
    e[field] += 1;
    return e;
  };
  visitedIds.forEach((id) => bump(id, "v"));
  correctIds.forEach((id) => { bump(id, "c").last = "c"; });
  missedIds.forEach((id) => { const e = bump(id, "m"); if (e.last !== "c") e.last = "m"; });
  // Stamp when each place was last encountered (flown to or photographed) so the
  // game can favor genuinely NEW/least-recent places each playthrough.
  const now = Date.now();
  [...new Set([...visitedIds, ...correctIds])].forEach((id) => { if (p.loc[id]) p.loc[id].t = now; });

  s.lastProfile = name;
  write(s);
  return { isBest, best: p.best[difficulty], isBestTime, bestTime: p.bestTime[difficulty] || 0 };
}





// Quiz mode: record a finished quiz. Keeps the profile's best quiz score.
// Returns { isBest, best }.
export function recordQuiz(name, { score = 0, correct = 0, total = 0 } = {}) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { isBest: false, best: 0 };
  p.quizGames = (p.quizGames || 0) + 1;
  p.lastPlayed = Date.now();
  const prev = (p.quizBest && p.quizBest.score) || 0;
  const isBest = score > prev;
  if (isBest) p.quizBest = { score, correct, total, at: Date.now() };
  s.lastProfile = name;
  write(s);
  return { isBest, best: (p.quizBest && p.quizBest.score) || 0 };
}

// ---- The Daily Expedition ----------------------------------------------
// One official attempt per day per tier: the FIRST completed run is the one that
// counts, so nobody can quietly re-roll a bad day. You can still replay it — the
// game just calls that a practice run and leaves the banked result alone.
export function dailyResult(profile, key) {
  return (profile && profile.daily && profile.daily[key]) || null;
}
// Returns the result now on record — which is the EXISTING one if today was
// already played, so the caller can tell the player their run didn't overwrite it.
export function recordDaily(name, key, result) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { banked: result, wasFirst: false };
  p.daily = p.daily || {};
  const wasFirst = !p.daily[key];
  if (wasFirst) p.daily[key] = { ...result, at: Date.now() };
  p.lastPlayed = Date.now();
  s.lastProfile = name;
  write(s);
  return { banked: p.daily[key], wasFirst };
}
// How many days in a row, ending today, this player has filed a daily (at any
// tier). The one number that actually brings a kid back tomorrow.
export function dailyStreak(profile, today) {
  const done = (profile && profile.daily) || {};
  const played = new Set(Object.keys(done).map((k) => Number(k.split("|")[0])));
  let n = 0;
  for (let d = today; played.has(d); d--) n++;
  return n;
}

// Explore mode: stamp every place the player visited into the passport (counts
// as "visited", not "photographed/mastered") without recording a scored game.
export function recordExplore(name, visitedIds = []) {
  const s = read();
  const p = s.profiles[name];
  if (!p || !visitedIds.length) return;
  p.loc = p.loc || {};
  const now = Date.now();
  for (const id of visitedIds) {
    const e = p.loc[id] || (p.loc[id] = { v: 0, c: 0, m: 0 });
    e.v += 1; e.t = now;
  }
  p.lastPlayed = now;
  s.lastProfile = name;
  write(s);
}

// How strongly to resurface a location for this profile (higher = more often).
export function weightFor(profile, id) {
  const e = profile && profile.loc && profile.loc[id];
  if (!e) return 2.5;                       // never encountered → worth surfacing
  if (e.c === 0 && e.m > 0) return 4;       // assigned but missed → surface a lot
  if (e.c === 0) return 2.5;                // visited but never photographed
  return Math.max(1, 2 - e.c * 0.4);        // mastered → gradually rarer
}

// Every location id ordered FRESHEST first: never-encountered places (no
// timestamp) come first in random order, then the least-recently-visited. Once a
// player has seen everything, their oldest visits become "new" again — so review
// continues indefinitely. Used to guarantee a share of new places each game.
export function freshFirst(profile) {
  const loc = (profile && profile.loc) || {};
  return LOCATIONS
    .map((l) => ({ id: l.id, t: (loc[l.id] && loc[l.id].t) || 0, r: rnd() }))
    .sort((a, b) => (a.t - b.t) || (a.r - b.r))
    .map((x) => x.id);
}

// A weighted-random ordering of every location id (Efraimidis–Spirakis: take
// the largest u^(1/weight) keys). A null profile gives a plain shuffle, so
// guests and brand-new players get uniform variety.
export function weightedOrder(profile) {
  return LOCATIONS
    .map((l) => ({ id: l.id, k: Math.pow(rnd() || 1e-9, 1 / weightFor(profile, l.id)) }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.id);
}

// Leaderboard: the top-N single best scores across all saved travelers. Each
// traveler contributes their highest score (over difficulties); returns
// [{ name, score, difficulty }] sorted high→low. Guests aren't saved, so they
// never appear.
export function topScores(n = 5) {
  const s = read();
  const rows = [];
  for (const p of Object.values(s.profiles)) {
    let max = 0, diff = null;
    for (const [d, v] of Object.entries(p.best || {})) if (v > max) { max = v; diff = d; }
    if (max > 0) {
      const meta = (p.bestMeta && p.bestMeta[diff]) || {};
      rows.push({ name: p.name, avatar: p.avatar || null, score: max, difficulty: diff, rank: meta.rank || null, timeMs: meta.timeMs || 0, mode: meta.mode || null });
    }
  }
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, n);
}

// Build passport data: one entry per country the profile has touched, plus
// totals. Countries/continents are derived from the per-location stats.
export function passportData(profile) {
  const countries = {};
  for (const l of LOCATIONS) {
    const st = profile && profile.loc && profile.loc[l.id];
    if (!st) continue;
    const c = countries[l.country] || (countries[l.country] = {
      country: l.country, flag: l.flag, continent: l.continent,
      visited: false, mastered: false, correct: 0, facts: [],
    });
    if (st.v > 0 || st.c > 0) c.visited = true;
    if (st.c > 0) {
      c.mastered = true; c.correct += st.c;
      c.facts.push({ subject: l.subject, fact: l.fact });
      // The first mastered landmark's photo becomes this country's "sticker".
      if (!c.photo) c.photo = { ...l.photo, subject: l.subject };
      c.locsMastered = (c.locsMastered || 0) + 1;
    }
  }
  // How many landmarks each country holds in total (mastered or not), so the
  // sticker book can show "2 / 3 places" per country slot.
  const countryLocTotals = {};
  for (const l of LOCATIONS) countryLocTotals[l.country] = (countryLocTotals[l.country] || 0) + 1;
  const totalCountries = new Set(LOCATIONS.map((l) => l.country)).size;
  const list = Object.values(countries).sort((a, b) => a.country.localeCompare(b.country));

  // Collections: distinct locations photographed correctly per category, and per
  // family (Human-Made / Natural / Living) — powers the passport Collections grid.
  const catTotal = {}, catMastered = {}, kinds = {};
  const mastered = (id) => { const st = profile && profile.loc && profile.loc[id]; return !!(st && st.c > 0); };
  for (const l of LOCATIONS) {
    catTotal[l.category] = (catTotal[l.category] || 0) + 1;
    if (mastered(l.id)) catMastered[l.category] = (catMastered[l.category] || 0) + 1;
    const k = kindOf(l.category);
    const kk = kinds[k] || (kinds[k] = { mastered: 0, total: 0 });
    kk.total += 1;
    if (mastered(l.id)) kk.mastered += 1;
  }
  const collections = Object.keys(catTotal).map((c) => ({ category: c, mastered: catMastered[c] || 0, total: catTotal[c] }));

  return {
    countries: list,
    byCountry: Object.fromEntries(list.map((c) => [c.country, c])),
    countryLocTotals,
    visitedCount: list.filter((c) => c.visited).length,
    masteredCount: list.filter((c) => c.mastered).length,
    totalCountries,
    continents: continentTotals(list),
    collections,
    kinds,
  };
}

// ---- Achievements ---------------------------------------------------------
// Badges the player works toward across games. Each is { id, name, emoji, art,
// have, need, earned }. Completion badges use category/kind totals; special ones
// use tags. Long-term goals like these are the main replay driver.
//
// `art` is the illustrated badge (see data/art.js), or null where it hasn't been
// drawn yet — the 14 category badges have art; the ranks, mega-badges and medals
// still render `emoji`. Both fields stay populated so a render site can prefer
// the art and fall back without knowing which batch has landed.
const ACH_CATNAME = {
  mountain: ["Peak Bagger", "🏔️"], volcano: ["Volcano Hunter", "🌋"], waterfall: ["Waterfall Chaser", "💦"],
  waterway: ["River Runner", "🏞️"], desert: ["Desert Wanderer", "🏜️"], ice: ["Polar Explorer", "🧊"],
  coast: ["Island Hopper", "🏝️"], rock: ["Rockhound", "🪨"], wildlife: ["Safari Ranger", "🦁"],
  ruins: ["Time Traveler", "🏛️"], temple: ["Pilgrim", "⛪"], palace: ["Royal Guest", "🏰"],
  monument: ["Monument Hunter", "🗽"], cityscape: ["City Slicker", "🏙️"],
};
const SUPERLATIVES = new Set(["highest", "tallest", "largest", "deepest", "longest", "driest", "oldest", "lowest", "most-active", "widest", "biggest"]);

export function achievements(profile) {
  const has = (id) => { const st = profile && profile.loc && profile.loc[id]; return !!(st && st.c > 0); };
  const catHave = {}, catTotal = {}, kindHave = {}, kindTotal = {};
  let unescoHave = 0, summitHave = 0, summitTotal = 0, superHave = 0, distinct = 0;
  const contSet = new Set();
  for (const l of LOCATIONS) {
    const tags = l.tags || [];
    catTotal[l.category] = (catTotal[l.category] || 0) + 1;
    const k = kindOf(l.category); kindTotal[k] = (kindTotal[k] || 0) + 1;
    if (tags.includes("continental-high")) summitTotal += 1;
    if (has(l.id)) {
      distinct += 1; contSet.add(l.continent);
      catHave[l.category] = (catHave[l.category] || 0) + 1;
      kindHave[k] = (kindHave[k] || 0) + 1;
      if (tags.includes("unesco")) unescoHave += 1;
      if (tags.includes("continental-high")) summitHave += 1;
      if (tags.some((t) => SUPERLATIVES.has(t))) superHave += 1;
    }
  }
  const list = [];
  const add = (id, name, emoji, have, need, art = ACHIEVEMENT_ART[id] || null) =>
    list.push({ id, name, emoji, art, have, need, earned: have >= need });
  for (const c of Object.keys(ACH_CATNAME)) add("cat_" + c, ACH_CATNAME[c][0], ACH_CATNAME[c][1], catHave[c] || 0, catTotal[c] || 0, CATEGORY_ART[c] || null);
  add("kind_built", "Master Builder", "🏛️", kindHave.built || 0, kindTotal.built || 0);
  add("kind_natural", "Force of Nature", "⛰️", kindHave.natural || 0, kindTotal.natural || 0);
  add("kind_living", "Life Lister", "🦁", kindHave.living || 0, kindTotal.living || 0);
  add("summits", "Continental Giants", "🗻", summitHave, summitTotal);
  add("unesco", "World Heritage", "🌐", unescoHave, 20);
  add("globe", "Globetrotter", "🌍", contSet.size, 7);
  add("record", "Record Breaker", "🏅", superHave, 8);
  add("m25", "Shutterbug", "📸", distinct, 25);
  add("m50", "Seasoned Traveler", "🧳", distinct, 50);
  add("m100", "Around the World", "🗺️", distinct, 100);
  return list;
}

// ---- What to chase next ---------------------------------------------------
// The closest unfinished thing, for the results screen.
//
// This exists because of what the results screen was doing wrong: it ended a run
// with a SCORE. A score is a verdict on the trip you just finished. It gives a
// child nothing to want. Everything needed to give them something was already
// here — every badge already knows it's at have/need — it was just buried in a
// passport tab nobody opens at the moment they're deciding whether to play again.
//
// Returns the nearest badge that is started but unfinished, or null if there's
// nothing meaningful to point at. "Nearest" is by how many places are LEFT, not by
// percentage: "one more desert" is a reason to fly, "82% of Monument Hunter" is a
// statistic. Badges not yet started are skipped — a child who has never shot a
// waterfall doesn't need to hear about all 27 of them.
export function nextGoal(profile) {
  if (!profile) return null;
  const near = achievements(profile)
    .filter((a) => !a.earned && a.have > 0 && a.need > a.have)
    .sort((a, b) => (a.need - a.have) - (b.need - b.have) || b.have - a.have)[0];
  if (!near) return null;
  const left = near.need - near.have;
  return { ...near, left };
}

// ---- Career rank + unlocks ------------------------------------------------
// A traveler's PERSISTENT rank grows with how many distinct places they've
// photographed (mastered) across all their trips — separate from the per-trip
// "how did this run go" title on the results screen. It's their press card.
export function distinctMastered(profile) {
  const loc = (profile && profile.loc) || {};
  let n = 0;
  for (const id in loc) if (loc[id] && loc[id].c > 0) n++;
  return n;
}
const PRESS_RANKS = [
  { need: 0, title: "Cub Reporter" },
  { need: 10, title: "Field Stringer" },
  { need: 25, title: "Roving Correspondent" },
  { need: 50, title: "Bureau Chief" },
  { need: 100, title: "Globe Editor" },
  { need: 200, title: "Photographer Laureate" },
];
export function careerRank(profile) {
  const have = distinctMastered(profile);
  let i = 0;
  for (let k = 0; k < PRESS_RANKS.length; k++) if (have >= PRESS_RANKS[k].need) i = k;
  const next = PRESS_RANKS[i + 1] || null;
  return { tier: i, title: PRESS_RANKS[i].title, have, next: next ? next.title : null, nextNeed: next ? next.need : null };
}

// Which modes / difficulties / itineraries this profile has unlocked. New
// travelers start simple; more opens up as they collect the world, so the game
// reveals itself gradually (Uncle narrates each unlock on the meet screen).
// Guests (no profile) get everything — they can't progress, so nothing to gate.
export const UNLOCK_REQ = {
  medium: "Finish your first expedition",
  quiz: "Finish your first expedition",
  tour: "Photograph 15 places",
  hard: "Earn stamps on 3 continents",
  expeditions: "Photograph 25 places",
  // The Long Trip is the endurance mode; it wants a player who already knows the
  // map well enough that running out of days is a fair fight rather than a mystery.
  longtrip: "Photograph 20 places",
};
export function unlocks(profile) {
  if (!profile) return { assignments: true, daily: true, journey: true, explore: true, quiz: true, tour: true, scout: true, easy: true, medium: true, hard: true, expeditions: true };
  const mastered = distinctMastered(profile);
  const games = profile.games || 0;
  const contTouched = Object.values(continentTotals(passportData(profile).countries)).filter((v) => v.mastered > 0).length;
  return {
    assignments: true,
    daily: true,     // always available — the whole point is that it is there every day
    journey: true,   // a guided history route: never gated, it's the gentlest way in
    explore: true,
    scout: true,
    easy: true,
    quiz: games >= 1,
    medium: games >= 1,
    tour: mastered >= 15,
    hard: contTouched >= 3,
    expeditions: mastered >= 25,
    longtrip: mastered >= 20,
  };
}

function continentTotals(list) {
  const all = {};
  for (const l of LOCATIONS) all[l.continent] = (all[l.continent] || new Set()).add(l.country);
  const out = {};
  for (const [k, set] of Object.entries(all)) out[k] = { total: set.size, mastered: 0 };
  for (const c of list) if (c.mastered && out[c.continent]) out[c.continent].mastered += 1;
  return out;
}

// ===========================================================================
// Export / import a passport as a file.
//
// Everything above persists to ONE localStorage key. That is fine until it isn't:
// clearing site data, "reset your browser" advice, a new laptop, or Safari's own
// eviction of unused site storage all wipe months of a child's progress with no
// warning and nothing to restore from. There is no backend and no account, so a
// file the family keeps is the only recovery there can be.
//
// The envelope is deliberately more than the bare profile. `app` and `kind` let the
// importer reject a JSON file that isn't a passport instead of merging nonsense into
// the store, and `version` is the hook for migrating an old export if the profile
// shape ever changes. When a backend does arrive (see docs/remaining-work.md §7),
// this is the same serialization it would sync — which is why it's worth having now.
// ===========================================================================

export const PASSPORT_FILE_VERSION = 1;

// One traveler's whole record, ready to be written to disk. Returns null if there's
// no such traveler. `at` is passed in rather than read from the clock so a caller
// (or a test) can stamp it deterministically.
export function exportPassport(name, at = Date.now()) {
  const p = getProfile(name);
  if (!p) return null;
  return {
    app: "shutterbug",
    kind: "passport",
    version: PASSPORT_FILE_VERSION,
    exported: at,
    profile: p,
  };
}

// A filename a parent can recognise a year later: shutterbug-ana-2026-07-19.json
export function passportFilename(name, at = Date.now()) {
  const slug = String(name || "traveler").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "traveler";
  const d = new Date(at);
  const pad = (n) => String(n).padStart(2, "0");
  return `shutterbug-${slug}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

// Read a parsed file back in.
//
// It NEVER overwrites an existing traveler. Importing onto a name that's already in
// use lands as "Ana (2)" instead, because the failure mode of guessing wrong here is
// asymmetric: a duplicate traveler is a minor annoyance the family can delete, and a
// silently clobbered passport is the exact loss this feature exists to prevent.
//
// Returns { ok, name, error }.
export function importPassport(data) {
  if (!data || typeof data !== "object") return { ok: false, error: "That file isn't a Shutterbug passport." };
  if (data.app !== "shutterbug" || data.kind !== "passport") {
    return { ok: false, error: "That file isn't a Shutterbug passport." };
  }
  if (typeof data.version !== "number" || data.version > PASSPORT_FILE_VERSION) {
    return { ok: false, error: "That passport was saved by a newer version of Shutterbug." };
  }
  const p = data.profile;
  if (!p || typeof p !== "object" || typeof p.name !== "string" || !p.name.trim()) {
    return { ok: false, error: "That passport file is damaged — no traveler in it." };
  }
  const store = read();
  // Keep every key the file carries. Deliberately NOT a whitelist: setProfileFlag
  // writes arbitrary keys, so a whitelist here would silently drop any flag added
  // after this function was written, and the bug would look like lost progress.
  const incoming = { ...p };
  let name = String(p.name).slice(0, MAX_NAME).trim();
  if (store.profiles[name]) {
    let n = 2;
    while (store.profiles[`${name} (${n})`] && n < 100) n++;
    name = `${name} (${n})`;
  }
  incoming.name = name;
  if (!incoming.created) incoming.created = Date.now();
  incoming.loc = incoming.loc && typeof incoming.loc === "object" ? incoming.loc : {};
  incoming.best = incoming.best && typeof incoming.best === "object" ? incoming.best : {};
  store.profiles[name] = incoming;
  if (!write(store)) return { ok: false, error: "Couldn't save — this browser's storage is full or blocked." };
  return { ok: true, name };
}

// Parse-then-import, for a file the user picked. Kept separate from importPassport
// so the pure object path stays testable without a File.
export function importPassportText(text) {
  let data;
  try { data = JSON.parse(text); }
  catch { return { ok: false, error: "That file isn't readable JSON." }; }
  return importPassport(data);
}

// ===========================================================================
// The teaching view.
//
// The game already runs spaced repetition — weightedOrder, freshFirst, per-location
// mastery in profile.loc — and none of it is visible to anyone. For a homeschool tool
// that's a real miss: a parent can't see that a child is solid on Europe and shaky on
// South America, or which places he keeps missing, and those are exactly the things
// you'd teach from.
//
// Nothing here is newly tracked. It is all derived from profile.loc, which has been
// filling up since the first game.
// ===========================================================================

// Per-continent mastery at PLACE level, not country level. continentTotals() above
// counts countries, which flatters a big country: photographing one thing in Brazil
// marks the country mastered while 90% of South America's places remain unseen.
// "14 of 34 places" is the number a parent can actually teach from.
export function progressByContinent(profile) {
  const loc = (profile && profile.loc) || {};
  const out = {};
  for (const l of LOCATIONS) {
    const e = out[l.continent] || (out[l.continent] = { continent: l.continent, total: 0, mastered: 0, visited: 0, missed: 0 });
    e.total += 1;
    const st = loc[l.id];
    if (!st) continue;
    if (st.c > 0) e.mastered += 1;
    else if (st.v > 0) e.visited += 1;       // been there, never got the shot
    if (st.c === 0 && st.m > 0) e.missed += 1;
  }
  return Object.values(out).sort((a, b) => b.mastered / (b.total || 1) - a.mastered / (a.total || 1));
}

// The places a child has been given and got wrong, and has never since got right.
// This is the same signal weightFor() already uses to resurface a place (weight 4,
// its highest) — surfaced so a parent can see it too. Sorted by how often it's been
// missed, so the top of the list is the thing to go over at the table.
export function troubleSpots(profile, limit = 8) {
  const loc = (profile && profile.loc) || {};
  return LOCATIONS
    .map((l) => ({ l, st: loc[l.id] }))
    .filter(({ st }) => st && st.c === 0 && st.m > 0)
    .sort((a, b) => (b.st.m - a.st.m) || ((b.st.t || 0) - (a.st.t || 0)))
    .slice(0, limit)
    .map(({ l, st }) => ({
      id: l.id, city: l.city, country: l.country, continent: l.continent,
      subject: l.subject, flag: l.flag, category: l.category, misses: st.m,
    }));
}

// Places photographed correctly, most recently first — "what he's learned lately".
export function recentlyLearned(profile, limit = 6) {
  const loc = (profile && profile.loc) || {};
  return LOCATIONS
    .map((l) => ({ l, st: loc[l.id] }))
    .filter(({ st }) => st && st.c > 0)
    .sort((a, b) => (b.st.t || 0) - (a.st.t || 0))
    .slice(0, limit)
    .map(({ l }) => ({ id: l.id, city: l.city, country: l.country, subject: l.subject, flag: l.flag }));
}
