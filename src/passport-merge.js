// ===========================================================================
// Merging two copies of the same passport.
//
// Sync is local-first and offline-capable, which means the interesting case isn't
// "device A wrote, device B reads" — it's "the iPad and the desktop were BOTH played
// while one of them was offline, and now they meet". There is no server-side referee.
//
// Last-write-wins would be wrong here, and wrong in the worst way: it looks fine, and
// it silently eats whichever session lost the race. A child who played on the iPad in
// the car would come home, open the desktop, and find the afternoon gone.
//
// What makes a proper merge possible is that this profile is almost entirely
// MONOTONIC. Counters only climb. Bests only improve. Flags only turn on. Nothing a
// player does ever makes a number smaller — except best TIME, where smaller IS better.
// So a field-wise merge is conflict-free without any version vectors or clocks: take
// the max of every counter, the min of every time, the union of every set, and OR
// every flag. Run it on either device, in either order, any number of times, and you
// get the same answer (it is commutative, associative and idempotent — the properties
// that make this safe to run on a flaky connection).
//
// The one genuinely lossy field is `avatar`, which is a CHOICE rather than an
// accumulation: two devices can hold different avatars and there is no "more" of one.
// That falls back to whichever profile was played most recently, and it's the only
// place a merge can discard something a player did.
// ===========================================================================

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

// Merge two maps of {key: number} by picking, per key, whichever value `better` says.
function mergeNumberMap(a, b, better) {
  const out = {};
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = num((a || {})[k]), y = num((b || {})[k]);
    if (x === null) { if (y !== null) out[k] = y; continue; }
    if (y === null) { out[k] = x; continue; }
    out[k] = better(x, y);
  }
  return out;
}

// Per-location record: {v, c, m, last, t}. The three counters are monotonic, so max
// each. `last` is sticky-correct in recordGame (a miss never overwrites a "c"), so the
// merge honours the same rule rather than taking the more recent one. `t` is "when
// last encountered", so the later timestamp is the true one.
function mergeLoc(a, b) {
  const out = {};
  for (const id of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = (a || {})[id], y = (b || {})[id];
    if (!isObj(x)) { if (isObj(y)) out[id] = { ...y }; continue; }
    if (!isObj(y)) { out[id] = { ...x }; continue; }
    out[id] = {
      ...x, ...y,
      v: Math.max(num(x.v) || 0, num(y.v) || 0),
      c: Math.max(num(x.c) || 0, num(y.c) || 0),
      m: Math.max(num(x.m) || 0, num(y.m) || 0),
      last: (x.last === "c" || y.last === "c") ? "c" : (x.last || y.last),
      t: Math.max(num(x.t) || 0, num(y.t) || 0),
    };
  }
  return out;
}

// bestMeta describes the run that SET each best score, so it has to travel with the
// score it describes — taking it from the "newer" profile would attach the wrong run's
// details to a record it didn't set.
function mergeBestMeta(a, b, mergedBest) {
  const out = {};
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = (a || {})[k], y = (b || {})[k];
    const winner = num((mergedBest || {})[k]);
    const xs = isObj(x) ? num(x.score) : null;
    const ys = isObj(y) ? num(y.score) : null;
    if (xs !== null && xs === winner) out[k] = x;
    else if (ys !== null && ys === winner) out[k] = y;
    else out[k] = isObj(y) ? y : x;
  }
  return out;
}

const MAX = (x, y) => Math.max(x, y);
const MIN = (x, y) => Math.min(x, y);

// Merge two versions of ONE traveler's profile. Order-independent: mergePassports(a,b)
// and mergePassports(b,a) agree on every field except `avatar` (see the header).
export function mergePassports(a, b) {
  if (!isObj(a)) return isObj(b) ? { ...b } : null;
  if (!isObj(b)) return { ...a };

  // "Newer" only decides the genuinely un-mergeable fields.
  const aTime = num(a.lastPlayed) || num(a.created) || 0;
  const bTime = num(b.lastPlayed) || num(b.created) || 0;
  const newer = bTime >= aTime ? b : a;
  const older = bTime >= aTime ? a : b;

  const best = mergeNumberMap(a.best, b.best, MAX);

  return {
    // Anything this function doesn't know about rides along from both sides, newer
    // winning. setProfileFlag writes arbitrary keys, so a merge that enumerated only
    // the fields it recognised would quietly drop every flag added after it was
    // written — the same trap the passport importer avoids.
    ...older, ...newer,

    name: newer.name || older.name,
    created: Math.min(num(a.created) || Infinity, num(b.created) || Infinity) || newer.created,
    lastPlayed: Math.max(aTime, bTime) || undefined,

    // Monotonic counters.
    games: Math.max(num(a.games) || 0, num(b.games) || 0),
    quizGames: Math.max(num(a.quizGames) || 0, num(b.quizGames) || 0),

    // Scores climb; TIMES fall. Getting bestTime's direction backwards would throw
    // away the better record and look like nothing happened.
    best,
    bestTime: mergeNumberMap(a.bestTime, b.bestTime, MIN),
    bestMeta: mergeBestMeta(a.bestMeta, b.bestMeta, best),
    quizBest: (num((a.quizBest || {}).score) || -1) >= (num((b.quizBest || {}).score) || -1)
      ? (a.quizBest || b.quizBest) : (b.quizBest || a.quizBest),

    // Per-place mastery — the record of what the child actually learned. This is the
    // field it would hurt most to lose half of.
    loc: mergeLoc(a.loc, b.loc),

    // Sets: seen is seen, on either device.
    curios: { ...(a.curios || {}), ...(b.curios || {}) },
    daily: { ...(a.daily || {}), ...(b.daily || {}) },

    // Flags only ever turn on. Listed explicitly because "have you met Mr O" going
    // back to false would re-run his introduction, which is exactly the bug this
    // session just fixed.
    metNigel: !!(a.metNigel || b.metNigel),
    metMrO: !!(a.metMrO || b.metMrO),
    dreamDone: !!(a.dreamDone || b.dreamDone),

    // The one real choice, not an accumulation: no "more recent" avatar is more
    // correct than the other, so the last-played device wins.
    avatar: newer.avatar !== undefined ? newer.avatar : older.avatar,
    lastRun: newer.lastRun !== undefined ? newer.lastRun : older.lastRun,
  };
}

// Merge a whole store's worth of travelers, keyed by name.
export function mergeProfileMaps(local = {}, remote = {}) {
  const out = {};
  for (const name of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    out[name] = mergePassports(local[name], remote[name]);
  }
  return out;
}
