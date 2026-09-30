// ===========================================================================
// Souvenir stalls — the things a child can buy for Uncle Jonah in local money.
//
// Shape tests, plus the two rule-2 guards this content specifically needs: every
// item's description must carry a source (it is a real object and the stall says
// what it is), and every stall must sit at a hub that exists, in a country the
// game has money for — a stall pricing yen at a hub that is not in Japan would
// teach exactly the wrong number.
// ===========================================================================
import { describe, it, expect, beforeEach } from "vitest";
import { SOUVENIR_STALLS, SOUVENIR_BY_KEY, SOUVENIR_THANKS } from "../src/data/souvenirs.js";
import { HUBS, currencyFor } from "../src/data/travel.js";
import { COUNTRY_CURRENCY } from "../src/data/currency.js";

const hubByCode = Object.fromEntries(Object.values(HUBS).flat().map((h) => [h.code, h]));

describe("souvenir stalls", () => {
  it("every stall is at a real hub, in that hub's own country", () => {
    for (const [code, s] of Object.entries(SOUVENIR_STALLS)) {
      expect(hubByCode[code], `${code} is not a hub in travel.js`).toBeTruthy();
      expect(hubByCode[code].country, `${code}'s stall says ${s.country}`).toBe(s.country);
    }
  });

  it("every stall's country has a currency to price in", () => {
    for (const s of Object.values(SOUVENIR_STALLS)) {
      expect(COUNTRY_CURRENCY[s.country], s.country).toBeTruthy();
      expect(currencyFor(s.country).perUsd).toBeGreaterThan(0);
    }
  });

  it("every item is a named real thing with a source, a description and a game price", () => {
    for (const [key, it] of Object.entries(SOUVENIR_BY_KEY)) {
      expect(it.name, key).toBeTruthy();
      expect(it.about, key).toBeTruthy();
      expect(it.about.length, `${key} description`).toBeLessThan(260);
      expect(it.source, `${key} has no source`).toMatch(/^https:\/\//);
      expect(it.usd, `${key} price`).toBeGreaterThan(0);
      expect(Number.isInteger(it.usd), `${key} price is whole dollars`).toBe(true);
      expect(it.emoji, `${key} needs an emoji until it has art`).toBeTruthy();
    }
  });

  it("ids are unique within a stall and keys are unique overall", () => {
    for (const [code, s] of Object.entries(SOUVENIR_STALLS)) {
      const ids = s.items.map((i) => i.id);
      expect(new Set(ids).size, code).toBe(ids.length);
    }
    const keys = Object.keys(SOUVENIR_BY_KEY);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("Jonah has a thank-you for every item, and for nothing that isn't one", () => {
    for (const key of Object.keys(SOUVENIR_BY_KEY)) expect(SOUVENIR_THANKS[key], `no thanks for ${key}`).toBeTruthy();
    for (const key of Object.keys(SOUVENIR_THANKS)) expect(SOUVENIR_BY_KEY[key], `thanks for a ${key} that is not for sale`).toBeTruthy();
  });

  it("prices are small next to the wallet — a souvenir can never end a trip", () => {
    // The Expert wallet is $2,500; the whole stall together must stay well under
    // what a single leg costs, so buying everything is a choice about the cash
    // bonus and never about reaching the next target.
    for (const [code, s] of Object.entries(SOUVENIR_STALLS)) {
      const total = s.items.reduce((a, i) => a + i.usd, 0);
      expect(total, `${code} stall total`).toBeLessThanOrEqual(100);
    }
  });
});

// ---------------------------------------------------------------------------
// They reach the passport at the END of a run, with the stamps — the same rule
// every other record follows (see recordGame). Nothing mid-run, so an abandoned
// trip leaves no souvenir; and a second daruma is still one daruma.
// ---------------------------------------------------------------------------
describe("souvenirs in the passport", () => {
  let profiles;
  beforeEach(async () => {
    const map = new Map();
    globalThis.localStorage = {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
      clear: () => map.clear(),
    };
    profiles = await import("../src/profiles.js?t=" + Math.random());
    profiles.createProfile("Ana");
  });

  it("records what was bought, once each, with when", () => {
    profiles.recordGame("Ana", { difficulty: "medium", score: 10, souvenirs: ["HND/daruma", "HND/kokeshi", "HND/daruma"] });
    const p = profiles.getProfile("Ana");
    expect(Object.keys(p.souvenirs).sort()).toEqual(["HND/daruma", "HND/kokeshi"]);
    expect(typeof p.souvenirs["HND/daruma"]).toBe("number");
  });

  it("keeps earlier souvenirs when a later run buys more, and their original date", () => {
    profiles.recordGame("Ana", { difficulty: "medium", score: 10, souvenirs: ["HND/daruma"] });
    const first = profiles.getProfile("Ana").souvenirs["HND/daruma"];
    profiles.recordGame("Ana", { difficulty: "medium", score: 12, souvenirs: ["HND/furoshiki", "HND/daruma"] });
    const p = profiles.getProfile("Ana");
    expect(Object.keys(p.souvenirs).sort()).toEqual(["HND/daruma", "HND/furoshiki"]);
    expect(p.souvenirs["HND/daruma"]).toBe(first);
  });

  it("writes nothing when nothing was bought", () => {
    profiles.recordGame("Ana", { difficulty: "medium", score: 10 });
    expect(profiles.getProfile("Ana").souvenirs).toBeUndefined();
  });
});
