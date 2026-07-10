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
import { kindOf } from "./data/categories.js";

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

// Save the traveller's avatar (a small spec object the Avatar component
// renders; see AVATAR_PARTS in the game component). null clears it back to
// the name-derived default.
export function setAvatar(name, avatar) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return;
  p.avatar = avatar || null;
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

// Record one finished game against a profile.
// Returns { isBest, best, isBestTime, bestTime }.
export function recordGame(name, { difficulty, score, timeMs = 0, won = false, rank = null, mode = "assignments", visitedIds = [], correctIds = [], missedIds = [] }) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { isBest: false, best: 0, isBestTime: false, bestTime: 0 };

  p.games = (p.games || 0) + 1;
  p.lastPlayed = Date.now();
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
  // game can favour genuinely NEW/least-recent places each playthrough.
  const now = Date.now();
  [...new Set([...visitedIds, ...correctIds])].forEach((id) => { if (p.loc[id]) p.loc[id].t = now; });

  s.lastProfile = name;
  write(s);
  return { isBest, best: p.best[difficulty], isBestTime, bestTime: p.bestTime[difficulty] || 0 };
}

// Daily Challenge: everyone plays the SAME seeded assignments on a given date.
// We keep each traveller's best score for that date. Returns { isBest, best, first }.
export function recordDaily(name, dateKey, { score = 0, rank = null, timeMs = 0, won = false, visitedIds = [], correctIds = [] } = {}) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { isBest: false, best: 0, first: false };
  p.daily = p.daily || {};
  const prev = p.daily[dateKey];
  const isBest = !prev || score > prev.score;
  if (isBest) p.daily[dateKey] = { score, rank, timeMs, won, at: Date.now() };
  p.loc = p.loc || {};
  const now = Date.now();
  const bump = (id, f) => { const e = p.loc[id] || (p.loc[id] = { v: 0, c: 0, m: 0 }); e[f] += 1; e.t = now; return e; };
  visitedIds.forEach((id) => bump(id, "v"));
  correctIds.forEach((id) => { bump(id, "c").last = "c"; });
  p.lastPlayed = now;
  s.lastProfile = name;
  write(s);
  return { isBest, best: p.daily[dateKey].score, first: !prev };
}

// Today's board: every traveller's best score for this date, high→low (ties broken
// by the faster time).
export function dailyTop(dateKey, n = 5) {
  const s = read();
  const rows = [];
  for (const p of Object.values(s.profiles)) {
    const d = p.daily && p.daily[dateKey];
    if (d && d.score > 0) rows.push({ name: p.name, avatar: p.avatar || null, score: d.score, rank: d.rank, timeMs: d.timeMs || 0 });
  }
  rows.sort((a, b) => b.score - a.score || a.timeMs - b.timeMs);
  return rows.slice(0, n);
}

// Has this traveller already played today's challenge? Returns their record or null.
export function dailyPlayed(name, dateKey) {
  const p = getProfile(name);
  return (p && p.daily && p.daily[dateKey]) || null;
}

// Streak / Survival: record a finished run. Keeps the profile's longest streak,
// and stamps the places photographed into the passport (as `c`, like a real shot).
// Returns { isBest, best }.
export function recordStreak(name, { streak = 0, score = 0, timeMs = 0, visitedIds = [], correctIds = [] } = {}) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { isBest: false, best: 0 };
  p.streakGames = (p.streakGames || 0) + 1;
  p.lastPlayed = Date.now();
  p.loc = p.loc || {};
  const now = Date.now();
  const bump = (id, field) => { const e = p.loc[id] || (p.loc[id] = { v: 0, c: 0, m: 0 }); e[field] += 1; e.t = now; return e; };
  visitedIds.forEach((id) => bump(id, "v"));
  correctIds.forEach((id) => { bump(id, "c").last = "c"; });
  const prev = (p.streakBest && p.streakBest.streak) || 0;
  const isBest = streak > prev;
  if (isBest) p.streakBest = { streak, score, timeMs, at: now };
  s.lastProfile = name;
  write(s);
  return { isBest, best: (p.streakBest && p.streakBest.streak) || 0 };
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
    .map((l) => ({ id: l.id, t: (loc[l.id] && loc[l.id].t) || 0, r: Math.random() }))
    .sort((a, b) => (a.t - b.t) || (a.r - b.r))
    .map((x) => x.id);
}

// A weighted-random ordering of every location id (Efraimidis–Spirakis: take
// the largest u^(1/weight) keys). A null profile gives a plain shuffle, so
// guests and brand-new players get uniform variety.
export function weightedOrder(profile) {
  return LOCATIONS
    .map((l) => ({ id: l.id, k: Math.pow(Math.random() || 1e-9, 1 / weightFor(profile, l.id)) }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.id);
}

// Leaderboard: the top-N single best scores across all saved travellers. Each
// traveller contributes their highest score (over difficulties); returns
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
// Badges the player works toward across games. Each is { id, name, emoji, have,
// need, earned }. Completion badges use category/kind totals; special ones use
// tags. Long-term goals like these are the main replay driver.
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
  const add = (id, name, emoji, have, need) => list.push({ id, name, emoji, have, need, earned: have >= need });
  for (const c of Object.keys(ACH_CATNAME)) add("cat_" + c, ACH_CATNAME[c][0], ACH_CATNAME[c][1], catHave[c] || 0, catTotal[c] || 0);
  add("kind_built", "Master Builder", "🏛️", kindHave.built || 0, kindTotal.built || 0);
  add("kind_natural", "Force of Nature", "⛰️", kindHave.natural || 0, kindTotal.natural || 0);
  add("kind_living", "Life Lister", "🦁", kindHave.living || 0, kindTotal.living || 0);
  add("summits", "Continental Giants", "🗻", summitHave, summitTotal);
  add("unesco", "World Heritage", "🌐", unescoHave, 20);
  add("globe", "Globetrotter", "🌍", contSet.size, 7);
  add("record", "Record Breaker", "🏅", superHave, 8);
  add("m25", "Shutterbug", "📸", distinct, 25);
  add("m50", "Seasoned Traveller", "🧳", distinct, 50);
  add("m100", "Around the World", "🗺️", distinct, 100);
  return list;
}

function continentTotals(list) {
  const all = {};
  for (const l of LOCATIONS) all[l.continent] = (all[l.continent] || new Set()).add(l.country);
  const out = {};
  for (const [k, set] of Object.entries(all)) out[k] = { total: set.size, mastered: 0 };
  for (const c of list) if (c.mastered && out[c.continent]) out[c.continent].mastered += 1;
  return out;
}
