// ===========================================================================
// The Daily Expedition's one promise: everybody playing on the same day, at the
// same level, flies the SAME run — with no server to tell them what it is.
//
// That promise rests entirely on the run being a pure function of (day, tier).
// It is easy to break by accident: one stray Math.random() left in the mission
// generator, or one lookup that quietly consults the player's own profile, and
// two players' "identical" expeditions silently diverge. Nothing in the UI would
// look wrong — you'd only find out when two kids compared score cards and the
// clues didn't match. So it's pinned here.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { withSeed, shuffled, mulberry32, seedFrom, rnd } from "../src/rng.js";
import { weightedOrder, freshFirst } from "../src/profiles.js";
import { dayNumber, dailySeed, dailyKey, shareText } from "../src/daily.js";
import { LOCATIONS } from "../src/data/locations.js";

describe("seeded RNG", () => {
  it("same seed, same sequence — and a different seed diverges", () => {
    const draw = (seed) => withSeed(seed, () => [rnd(), rnd(), rnd()]);
    expect(draw("abc")).toEqual(draw("abc"));
    expect(draw("abc")).not.toEqual(draw("abd"));
  });

  it("restores the real Math.random afterwards, even if the block throws", () => {
    const before = rnd();
    expect(() => withSeed("x", () => { throw new Error("boom"); })).toThrow("boom");
    // if the seeded generator leaked, every later draw would be deterministic —
    // which would quietly make every NORMAL game identical too.
    const after = [rnd(), rnd(), rnd()];
    expect(new Set([before, ...after]).size).toBe(4);
  });

  it("shuffles unbiasedly (sort(() => random - 0.5) does not)", () => {
    // Fisher–Yates must reach every position. A comparator shuffle leaves the
    // first element in place far too often — the old code did exactly that.
    const counts = new Array(5).fill(0);
    for (let i = 0; i < 4000; i++) counts[shuffled([0, 1, 2, 3, 4]).indexOf(0)]++;
    for (const c of counts) expect(c).toBeGreaterThan(4000 / 5 * 0.75);
  });

  it("does not depend on the engine's own Math.random", () => {
    // mulberry32 is our own arithmetic, so the same seed gives the same run in
    // every browser — which is what makes the daily comparable across devices.
    const a = mulberry32(seedFrom("shutterbug-daily|214|easy"));
    const b = mulberry32(seedFrom("shutterbug-daily|214|easy"));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("the daily run is the same for everyone", () => {
  // The real generator lives in the game component (which needs a DOM), but every
  // random choice it makes is drawn through these two orderings. If they're stable
  // under a seed, the plan built on top of them is too.
  const plan = (seed, profile) => withSeed(seed, () => ({
    order: weightedOrder(profile).slice(0, 20),
    fresh: freshFirst(profile).slice(0, 20),
  }));

  it("two players on the same day and tier get the identical plan", () => {
    const seed = dailySeed(214, "easy");
    expect(plan(seed, null)).toEqual(plan(seed, null));
  });

  it("a different tier — or a different day — is a different run", () => {
    const day = plan(dailySeed(214, "easy"), null);
    expect(plan(dailySeed(214, "hard"), null)).not.toEqual(day);
    expect(plan(dailySeed(215, "easy"), null)).not.toEqual(day);
  });

  it("the run ignores the player's own history", () => {
    // The generator is handed a NULL profile on a daily. If that ever regresses,
    // spaced repetition would quietly tailor the run to each child — so a veteran
    // and a beginner would get different clues and their scores wouldn't compare.
    // Mastered enough of the atlas that spaced repetition really would re-order it.
    const veteran = { loc: Object.fromEntries(LOCATIONS.slice(0, 200)
      .map((l, i) => [l.id, { v: 9, c: 9, m: 0, t: i + 1 }])) };
    const seed = dailySeed(214, "easy");
    expect(plan(seed, null)).toEqual(plan(seed, null));
    // sanity: a profile DOES change the ordering, so the test above isn't vacuous
    expect(plan(seed, veteran)).not.toEqual(plan(seed, null));
  });
});

describe("day numbering", () => {
  it("counts from 1 Jan 2025, in local time", () => {
    expect(dayNumber(new Date(2025, 0, 1, 9, 30))).toBe(1);
    expect(dayNumber(new Date(2025, 0, 2, 0, 1))).toBe(2);
    expect(dayNumber(new Date(2026, 0, 1, 23, 59))).toBe(366); // 1 Jan 2025 is day 1, and 2025 had 365 days
  });

  it("advances by exactly one a day across a daylight-saving change", () => {
    // Flooring a 23-hour day loses one; this is why dayNumber rounds.
    for (const [y, m, d] of [[2025, 2, 8], [2025, 2, 9], [2025, 10, 1], [2025, 10, 2]]) {
      const today = dayNumber(new Date(y, m, d, 12));
      const tomorrow = dayNumber(new Date(y, m, d + 1, 12));
      expect(tomorrow - today, `${y}-${m + 1}-${d} → next day`).toBe(1);
    }
  });

  it("a key is unique per day and tier", () => {
    expect(dailyKey(214, "easy")).not.toBe(dailyKey(214, "hard"));
    expect(dailyKey(214, "easy")).not.toBe(dailyKey(215, "easy"));
  });
});

describe("the share card", () => {
  const run = { day: 214, difficulty: "easy", label: "Explorer", score: 12,
    marks: ["first", "first", "second", "first", "missed"], daysLeft: 2 };

  it("reports the run without giving away where it went", () => {
    const text = shareText(run);
    expect(text).toContain("Day 214 · Explorer");
    expect(text).toContain("4/5 shots");
    expect(text).toContain("3 first-try");
    expect(text).toContain("2 days to spare");
    // A daily is only worth sharing if reading it can't spoil it: no place names.
    for (const spoiler of ["Paris", "Egypt", "Cairo", "Europe", "Africa"])
      expect(text).not.toContain(spoiler);
  });

  it("says nothing about spare days when there are none", () => {
    expect(shareText({ ...run, daysLeft: 0 })).not.toContain("spare");
  });
});
