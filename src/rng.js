// ===========================================================================
// RNG — one swappable source of randomness for the whole game.
//
// Everything that shapes a run (which places are chosen, which decoys, which
// countries appear in the country step, the order they're shuffled into) draws
// from `rnd()` rather than Math.random directly. Normally `rnd()` IS Math.random.
// But wrap a block in `withSeed(...)` and every draw inside it becomes a pure
// function of the seed — which is what lets the Daily Expedition hand every
// player on a given day and tier the exact same run, with no server involved.
//
// Why this instead of threading a `random` argument through every helper: the
// generator is a dozen functions deep (weightedOrder → pickAnchors →
// makeAssignmentPlan → buildOptions), and one missed hand-off would silently
// desync one player's daily from everyone else's.
// ===========================================================================

let current = Math.random;

// The game's source of randomness. Identical to Math.random outside withSeed().
export const rnd = () => current();

// mulberry32 — small, fast, and good enough for shuffling a deck of landmarks.
// Same seed → same sequence, in every browser, forever (no reliance on the
// engine's Math.random, which is deliberately unspecified and differs by engine).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a — turns any string ("214|easy") into a seed.
export function seedFrom(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Run `fn` with a seeded RNG, then restore whatever was there before. Nested and
// exception-safe: if `fn` throws, the real Math.random is still put back.
export function withSeed(seed, fn) {
  const prev = current;
  current = mulberry32(typeof seed === "string" ? seedFrom(seed) : seed);
  try {
    return fn();
  } finally {
    current = prev;
  }
}

// An unbiased shuffle. (The codebase used `.sort(() => Math.random() - 0.5)` in
// a dozen places — that isn't a shuffle: it's a biased ordering whose result
// depends on the engine's sort, so it could NOT be made reproducible even with a
// seed. Fisher–Yates is both correct and seedable.)
export function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A random item, and a random integer in [0, n).
export const pickOne = (arr) => arr[Math.floor(rnd() * arr.length)];
export const randInt = (n) => Math.floor(rnd() * n);
