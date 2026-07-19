// ===========================================================================
// Merging two copies of one passport.
//
// This is the part of sync that can lose a child's afternoon without anyone noticing,
// so it's tested harder than anything else in the project. The properties that make
// the merge safe on a flaky connection are algebraic, and they're asserted directly:
//
//   commutative — merge(a,b) == merge(b,a)      (device order can't matter)
//   idempotent  — merge(merge(a,b),b) == merge(a,b)   (a retry can't corrupt)
//   associative — merge(merge(a,b),c) == merge(a,merge(b,c))  (three devices)
//
// Plus the one asymmetry that is easy to get backwards and silent when you do:
// scores take the MAX, times take the MIN.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { mergePassports, mergeProfileMaps } from "../src/passport-merge.js";

const base = (over = {}) => ({
  name: "Ana", created: 1000, lastPlayed: 2000, games: 1,
  best: {}, bestTime: {}, loc: {}, curios: {}, ...over,
});

// avatar is the one field the merge is allowed to pick a side on, so property tests
// that compare both orderings ignore it.
const stripChoice = (p) => { const { avatar, lastRun, ...rest } = p || {}; return rest; };

describe("the merge is safe to run in any order", () => {
  const a = base({
    lastPlayed: 5000, games: 4,
    best: { easy: 20, medium: 8 }, bestTime: { easy: 90000 },
    loc: { london: { v: 2, c: 2, m: 0, last: "c", t: 5000 }, nyc: { v: 1, c: 0, m: 1, last: "m", t: 4000 } },
    curios: { "logo-film": true }, metMrO: true,
  });
  const b = base({
    lastPlayed: 7000, games: 3,
    best: { easy: 14, hard: 30 }, bestTime: { easy: 60000, hard: 120000 },
    loc: { london: { v: 3, c: 1, m: 1, last: "m", t: 7000 }, cairo: { v: 1, c: 1, m: 0, last: "c", t: 7000 } },
    curios: { "roll-24": true }, metNigel: true,
  });
  const c = base({ lastPlayed: 3000, games: 9, best: { medium: 40 }, loc: { cairo: { v: 5, c: 4, m: 0, last: "c", t: 3000 } } });

  it("is commutative", () => {
    expect(stripChoice(mergePassports(a, b))).toEqual(stripChoice(mergePassports(b, a)));
  });

  it("is idempotent — a retried sync can't corrupt anything", () => {
    const once = mergePassports(a, b);
    expect(stripChoice(mergePassports(once, b))).toEqual(stripChoice(once));
    expect(stripChoice(mergePassports(once, a))).toEqual(stripChoice(once));
  });

  it("is associative — three devices agree however they pair up", () => {
    const left = mergePassports(mergePassports(a, b), c);
    const right = mergePassports(a, mergePassports(b, c));
    expect(stripChoice(left)).toEqual(stripChoice(right));
  });
});

describe("nothing a player earned is lost", () => {
  it("keeps the HIGHER score and the LOWER time", () => {
    const a = base({ best: { easy: 20 }, bestTime: { easy: 90000 } });
    const b = base({ best: { easy: 14 }, bestTime: { easy: 60000 } });
    const m = mergePassports(a, b);
    expect(m.best.easy).toBe(20);      // higher score wins
    expect(m.bestTime.easy).toBe(60000); // FASTER time wins — the easy one to invert
  });

  it("attaches bestMeta to the run that actually set the winning score", () => {
    const a = base({ best: { easy: 20 }, bestMeta: { easy: { score: 20, rank: "Ace" } } });
    const b = base({ best: { easy: 14 }, bestMeta: { easy: { score: 14, rank: "Trainee" } } });
    expect(mergePassports(a, b).bestMeta.easy.rank).toBe("Ace");
    expect(mergePassports(b, a).bestMeta.easy.rank).toBe("Ace");
  });

  it("takes the max of every per-place counter", () => {
    const a = base({ loc: { london: { v: 2, c: 2, m: 0, t: 5000 } } });
    const b = base({ loc: { london: { v: 3, c: 1, m: 1, t: 7000 } } });
    const m = mergePassports(a, b).loc.london;
    expect(m).toMatchObject({ v: 3, c: 2, m: 1, t: 7000 });
  });

  it("keeps a place MASTERED once it has been mastered on either device", () => {
    // recordGame makes `last` sticky-correct; a later miss must not undo it, and
    // neither may a merge with a device that only ever missed the place.
    const mastered = base({ lastPlayed: 1000, loc: { london: { v: 1, c: 1, m: 0, last: "c", t: 1000 } } });
    const missed = base({ lastPlayed: 9000, loc: { london: { v: 1, c: 0, m: 3, last: "m", t: 9000 } } });
    expect(mergePassports(mastered, missed).loc.london.last).toBe("c");
    expect(mergePassports(missed, mastered).loc.london.last).toBe("c");
  });

  it("never turns a met-someone flag back off", () => {
    const met = base({ lastPlayed: 1000, metMrO: true, metNigel: true, dreamDone: true });
    const fresh = base({ lastPlayed: 9000 });
    const m = mergePassports(met, fresh);
    // A false here would replay Mr O's introduction — the exact bug just fixed.
    expect(m.metMrO).toBe(true);
    expect(m.metNigel).toBe(true);
    expect(m.dreamDone).toBe(true);
  });

  it("unions the collectable sets", () => {
    const a = base({ curios: { one: true }, daily: { "d-1": { ok: 1 } } });
    const b = base({ curios: { two: true }, daily: { "d-2": { ok: 1 } } });
    const m = mergePassports(a, b);
    expect(Object.keys(m.curios).sort()).toEqual(["one", "two"]);
    expect(Object.keys(m.daily).sort()).toEqual(["d-1", "d-2"]);
  });

  it("carries through keys the merge has never heard of", () => {
    // setProfileFlag writes arbitrary keys; a merge that enumerated only known fields
    // would silently drop every flag added after it was written.
    const a = base({ lastPlayed: 1000, someFutureFlag: { nested: [1, 2] } });
    const b = base({ lastPlayed: 9000 });
    expect(mergePassports(a, b).someFutureFlag).toEqual({ nested: [1, 2] });
  });

  it("keeps the EARLIEST created date", () => {
    expect(mergePassports(base({ created: 500 }), base({ created: 9000 })).created).toBe(500);
  });
});

describe("edge cases", () => {
  it("handles a traveler that exists on only one side", () => {
    const only = base({ name: "Ana" });
    expect(mergePassports(only, null)).toEqual(only);
    expect(mergePassports(null, only)).toEqual(only);
    expect(mergePassports(null, null)).toBe(null);
  });

  it("merges a whole store by traveler name", () => {
    const local = { Ana: base({ name: "Ana", best: { easy: 20 } }), Ben: base({ name: "Ben" }) };
    const remote = { Ana: base({ name: "Ana", best: { easy: 30 } }), Cy: base({ name: "Cy" }) };
    const m = mergeProfileMaps(local, remote);
    expect(Object.keys(m).sort()).toEqual(["Ana", "Ben", "Cy"]);
    expect(m.Ana.best.easy).toBe(30);
  });

  it("survives malformed values without throwing", () => {
    const junk = base({ games: "not a number", best: { easy: null }, loc: { x: "nope" } });
    expect(() => mergePassports(junk, base())).not.toThrow();
    expect(mergePassports(junk, base({ games: 3 })).games).toBe(3);
  });
});
