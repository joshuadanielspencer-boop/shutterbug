// ===========================================================================
// The Long Trip's banked renown (roguelike slice 4).
//
// The Long Trip is the endurance mode: running out of days is the EXPECTED ending,
// so a run has to bank something even when it ends short, or a loss reads as pure
// failure. That something is renown — reporter reputation that only ever climbs. The
// numbers here are pinned because their failure is silent: a renown total that
// quietly drifts, or a "personal best" that fires on a run that wasn't one, would
// look fine on screen and be wrong.
// ===========================================================================
import { describe, it, expect, beforeEach } from "vitest";
import { renownRank, renownGain } from "../src/profiles.js";

// A localStorage stand-in — profiles.js talks to the global directly.
function installStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
  return map;
}

describe("renownGain — the per-run formula", () => {
  it("pays two renown per photo brought home, and nothing for none", () => {
    expect(renownGain({ places: 0 }).total).toBe(0);
    expect(renownGain({ places: 1 }).base).toBe(2);
    expect(renownGain({ places: 6 }).base).toBe(12);
  });

  it("books a five-point scoop the first time a run is a personal best", () => {
    expect(renownGain({ places: 6, isBestDistance: true }).scoop).toBe(5);
    expect(renownGain({ places: 6, isBestDistance: true }).total).toBe(17);
    // No photos means no run to celebrate — no scoop even if flagged a best.
    expect(renownGain({ places: 0, isBestDistance: true }).scoop).toBe(0);
  });

  it("never rewards a wrong guess — places is photos actually filed", () => {
    // A fractional/negative count can't sneak in a bonus.
    expect(renownGain({ places: -3 }).total).toBe(0);
    expect(renownGain({ places: 2.9 }).base).toBe(4);
  });

  it("adds the Cover Story bonus on top of photos and scoop", () => {
    // 4 photos (8) + best-distance scoop (5) + cover (10) = 23.
    const g = renownGain({ places: 4, isBestDistance: true, coverBonus: 10 });
    expect(g.cover).toBe(10);
    expect(g.total).toBe(23);
    // No cover shot, no cover bonus.
    expect(renownGain({ places: 4 }).cover).toBe(0);
  });
});

describe("renownRank — the newsroom ladder", () => {
  it("starts at the bottom and climbs monotonically with total", () => {
    let lastTier = -1;
    for (const total of [0, 19, 20, 49, 50, 99, 100, 199, 200, 399, 400, 10000]) {
      const r = renownRank(total);
      expect(r.tier).toBeGreaterThanOrEqual(lastTier);
      lastTier = r.tier;
    }
  });

  it("names the standing and how far to the next one", () => {
    const r = renownRank(20);
    expect(r.title).toBe("Local Stringer");
    expect(r.nextNeed).toBe(50);
    expect(r.into).toBe(0);   // just crossed into the band
    expect(r.span).toBe(30);  // 50 - 20
  });

  it("has no next once at the top of the masthead", () => {
    const r = renownRank(100000);
    expect(r.next).toBeNull();
    expect(r.nextNeed).toBeNull();
    expect(r.span).toBeNull();
  });
});

describe("recordLongTrip — banking a finished run", () => {
  let profiles;
  beforeEach(async () => {
    installStorage();
    profiles = await import("../src/profiles.js?t=" + Math.random());
    profiles.createProfile("Ana");
  });

  it("accumulates renown across runs and only ever climbs", () => {
    const first = profiles.recordLongTrip("Ana", { places: 6, score: 20 });
    expect(first.gained).toBe(6 * 2 + 5); // first run is always a distance best → scoop
    expect(first.total).toBe(17);
    expect(first.isBestDistance).toBe(true);
    expect(first.bestDistance).toBe(6);

    const second = profiles.recordLongTrip("Ana", { places: 4, score: 10 });
    expect(second.isBestDistance).toBe(false);        // 4 < 6, not a record
    expect(second.gained).toBe(8);                    // 4 photos, no scoop
    expect(second.total).toBe(25);                    // 17 + 8, monotonic
    expect(second.bestDistance).toBe(6);              // record unchanged
  });

  it("reports a promotion exactly when the run crosses a rank threshold", () => {
    // 9 photos + scoop = 23 renown → crosses 20 (Local Stringer) from Unknown.
    const run = profiles.recordLongTrip("Ana", { places: 9, score: 30 });
    expect(run.rankedUp).toBe(true);
    expect(run.rank.title).toBe("Local Stringer");

    // A tiny follow-up run banks renown but crosses no new threshold.
    const flat = profiles.recordLongTrip("Ana", { places: 1, score: 2 });
    expect(flat.rankedUp).toBe(false);
  });

  it("persists to the profile so a later session sees the total", () => {
    profiles.recordLongTrip("Ana", { places: 5, score: 12 });
    const stats = profiles.longTripStats(profiles.getProfile("Ana"));
    expect(stats.renown).toBe(5 * 2 + 5);
    expect(stats.bestDistance).toBe(5);
    expect(stats.runs).toBe(1);
  });

  it("banks the Cover Story bonus and counts covers made", () => {
    const run = profiles.recordLongTrip("Ana", { places: 6, score: 20, coverBonus: 10 });
    expect(run.cover).toBe(10);
    expect(run.total).toBe(6 * 2 + 5 + 10); // photos + first-run scoop + cover
    expect(run.covers).toBe(1);
    // A later run with no cover leaves the covers count alone.
    const plain = profiles.recordLongTrip("Ana", { places: 2, score: 5 });
    expect(plain.covers).toBe(1);
    expect(profiles.longTripStats(profiles.getProfile("Ana")).covers).toBe(1);
  });

  it("is a harmless no-op for an unknown traveler", () => {
    expect(profiles.recordLongTrip("Nobody", { places: 4 })).toBeNull();
  });
});
