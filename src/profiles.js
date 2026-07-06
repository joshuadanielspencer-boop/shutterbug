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
export function recordGame(name, { difficulty, score, timeMs = 0, won = false, visitedIds = [], correctIds = [], missedIds = [] }) {
  const s = read();
  const p = s.profiles[name];
  if (!p) return { isBest: false, best: 0, isBestTime: false, bestTime: 0 };

  p.games = (p.games || 0) + 1;
  p.lastPlayed = Date.now();
  p.best = p.best || {};
  const prevBest = p.best[difficulty] || 0;
  const isBest = score > prevBest;
  if (isBest) p.best[difficulty] = score;

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

  s.lastProfile = name;
  write(s);
  return { isBest, best: p.best[difficulty], isBestTime, bestTime: p.bestTime[difficulty] || 0 };
}

// How strongly to resurface a location for this profile (higher = more often).
export function weightFor(profile, id) {
  const e = profile && profile.loc && profile.loc[id];
  if (!e) return 2.5;                       // never encountered → worth surfacing
  if (e.c === 0 && e.m > 0) return 4;       // assigned but missed → surface a lot
  if (e.c === 0) return 2.5;                // visited but never photographed
  return Math.max(1, 2 - e.c * 0.4);        // mastered → gradually rarer
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
    if (st.c > 0) { c.mastered = true; c.correct += st.c; c.facts.push({ subject: l.subject, fact: l.fact }); }
  }
  const totalCountries = new Set(LOCATIONS.map((l) => l.country)).size;
  const list = Object.values(countries).sort((a, b) => a.country.localeCompare(b.country));
  return {
    countries: list,
    visitedCount: list.filter((c) => c.visited).length,
    masteredCount: list.filter((c) => c.mastered).length,
    totalCountries,
    continents: continentTotals(list),
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
