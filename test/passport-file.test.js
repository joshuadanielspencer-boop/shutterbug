// ===========================================================================
// Export / import a passport as a file.
//
// This is the only recovery path there is — no backend, no accounts — so the two
// things worth pinning are the ones whose failure is silent and permanent:
//
//   1. A round trip must lose NOTHING. The profile carries arbitrary keys written
//      by setProfileFlag, so any importer that whitelists fields would quietly drop
//      flags added later, and the bug would present as lost progress months on.
//   2. Importing must never overwrite an existing traveler. A duplicate is an
//      annoyance; a clobbered passport is exactly the loss this prevents.
// ===========================================================================
import { describe, it, expect, beforeEach } from "vitest";

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

let profiles;
beforeEach(async () => {
  installStorage();
  // Fresh module each test so the store starts empty.
  const mod = await import("../src/profiles.js?t=" + Math.random());
  profiles = mod;
});

describe("passport round trip", () => {
  it("survives export and re-import with every field intact", () => {
    profiles.createProfile("Ana");
    profiles.recordGame("Ana", {
      difficulty: "medium", score: 12, timeMs: 90000, won: true, rank: "Ace",
      visitedIds: ["london"], correctIds: ["london"], missedIds: ["nyc"],
    });
    profiles.setProfileFlag("Ana", "metMrO", true);
    // A key nothing in this test knows about — stands in for any flag added later.
    profiles.setProfileFlag("Ana", "someFutureFlag", { nested: [1, 2, 3] });

    const before = profiles.getProfile("Ana");
    const file = profiles.exportPassport("Ana", 1_700_000_000_000);
    expect(file.app).toBe("shutterbug");
    expect(file.kind).toBe("passport");

    // Import into a DIFFERENT store, as a new machine would.
    installStorage();
    return import("../src/profiles.js?t=" + Math.random()).then((fresh) => {
      const res = fresh.importPassport(JSON.parse(JSON.stringify(file)));
      expect(res.ok).toBe(true);
      expect(res.name).toBe("Ana");
      const after = fresh.getProfile("Ana");
      expect(after).toEqual(before);
      expect(after.someFutureFlag).toEqual({ nested: [1, 2, 3] });
      expect(after.loc.london.c).toBe(1);
    });
  });

  it("never overwrites an existing traveler of the same name", () => {
    profiles.createProfile("Ana");
    profiles.recordGame("Ana", { difficulty: "easy", score: 99, correctIds: ["london"] });
    const original = profiles.getProfile("Ana");

    const incoming = {
      app: "shutterbug", kind: "passport", version: 1, exported: 1,
      profile: { name: "Ana", created: 1, games: 0, best: {}, loc: {} },
    };
    const res = profiles.importPassport(incoming);
    expect(res.ok).toBe(true);
    expect(res.name).toBe("Ana (2)");
    // The one that was already there is untouched.
    expect(profiles.getProfile("Ana")).toEqual(original);
    expect(profiles.getProfile("Ana (2)").games).toBe(0);
  });

  it("refuses files that aren't Shutterbug passports", () => {
    expect(profiles.importPassport(null).ok).toBe(false);
    expect(profiles.importPassport({ app: "something-else", kind: "passport", version: 1 }).ok).toBe(false);
    expect(profiles.importPassport({ app: "shutterbug", kind: "savegame", version: 1 }).ok).toBe(false);
    // A passport from a FUTURE version must be refused, not half-read.
    expect(profiles.importPassport({ app: "shutterbug", kind: "passport", version: 99, profile: { name: "X" } }).ok).toBe(false);
    expect(profiles.importPassportText("not json at all").ok).toBe(false);
    // Right envelope, no traveler inside.
    expect(profiles.importPassport({ app: "shutterbug", kind: "passport", version: 1, profile: {} }).ok).toBe(false);
  });

  it("names the file after the traveler and the date", () => {
    const name = profiles.passportFilename("Ana Ruiz", Date.UTC(2026, 6, 19, 12));
    expect(name).toMatch(/^shutterbug-ana-ruiz-2026-07-19\.json$/);
  });
});
