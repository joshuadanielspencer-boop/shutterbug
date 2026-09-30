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
import { PRICE_ANCHORS } from "../src/data/price-anchors.js";

const hubByCode = Object.fromEntries(Object.values(HUBS).flat().map((h) => [h.code, h]));

describe("souvenir stalls", () => {
  it("every stall is in a country the game has, and one with a price anchor", () => {
    // Stalls exist to make the exchange rate a shopping trip, and the "pounds of
    // rice" line under each price is the verified half of that. A country with
    // no anchor could still have a stall; it would just teach less, so none does.
    for (const country of Object.keys(SOUVENIR_STALLS)) {
      expect(COUNTRY_CURRENCY[country], `${country} has no currency`).toBeTruthy();
      expect(PRICE_ANCHORS[country], `${country} has no price anchor`).toBeTruthy();
    }
  });

  it("a stall that names a hub names one that exists, in its own country", () => {
    for (const [country, s] of Object.entries(SOUVENIR_STALLS)) {
      if (!s.hub) continue;
      expect(hubByCode[s.hub], `${country}: ${s.hub} is not a hub in travel.js`).toBeTruthy();
      expect(hubByCode[s.hub].country, `${country}: ${s.hub} is in ${hubByCode[s.hub]?.country}`).toBe(country);
    }
  });

  it("every anchor country with a hub has a stall, except the ones priced in dollars", () => {
    // The stall teaches judging FOREIGN money. A country whose money is the US
    // dollar (or sits at exact par with it) is left out on purpose, and this
    // pins that the exceptions are exactly those and nothing else was forgotten.
    const hubCountries = new Set(Object.values(HUBS).flat().map((h) => h.country));
    for (const country of Object.keys(PRICE_ANCHORS)) {
      if (!hubCountries.has(country)) continue;
      const dollar = currencyFor(country).perUsd === 1;
      expect(!!SOUVENIR_STALLS[country], `${country}: ${dollar ? "prices in dollars, should have no stall" : "has a hub and an anchor but no stall"}`).toBe(!dollar);
    }
  });

  it("never prices a stall in dollars", () => {
    for (const country of Object.keys(SOUVENIR_STALLS)) {
      expect(currencyFor(country).perUsd, `${country} is at par with the dollar`).not.toBe(1);
    }
  });

  it("every stall's country has a currency to price in", () => {
    for (const country of Object.keys(SOUVENIR_STALLS)) {
      expect(currencyFor(country).perUsd).toBeGreaterThan(0);
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

  it("ids are unique within a stall, and every key resolves — including the old hub-coded ones", () => {
    for (const [country, s] of Object.entries(SOUVENIR_STALLS)) {
      const ids = s.items.map((i) => i.id);
      expect(new Set(ids).size, country).toBe(ids.length);
      for (const it of s.items) {
        expect(SOUVENIR_BY_KEY[`${country}/${it.id}`], `${country}/${it.id}`).toBeTruthy();
        // A passport written on 2026-09-28/30 holds `HND/daruma`-style keys.
        if (s.hub) expect(SOUVENIR_BY_KEY[`${s.hub}/${it.id}`], `legacy ${s.hub}/${it.id}`).toBe(SOUVENIR_BY_KEY[`${country}/${it.id}`]);
      }
    }
  });

  it("Jonah has a thank-you for every item, and for nothing that isn't one", () => {
    for (const [country, s] of Object.entries(SOUVENIR_STALLS))
      for (const it of s.items) expect(SOUVENIR_THANKS[`${country}/${it.id}`], `no thanks for ${country}/${it.id}`).toBeTruthy();
    for (const key of Object.keys(SOUVENIR_THANKS)) expect(SOUVENIR_BY_KEY[key], `thanks for a ${key} that is not for sale`).toBeTruthy();
  });

  it("prices are small next to the wallet — a souvenir can never end a trip", () => {
    // The Expert wallet is $2,500; the whole stall together must stay well under
    // what a single leg costs, so buying everything is a choice about the cash
    // bonus and never about reaching the next target.
    for (const [country, s] of Object.entries(SOUVENIR_STALLS)) {
      const total = s.items.reduce((a, i) => a + i.usd, 0);
      expect(total, `${country} stall total`).toBeLessThanOrEqual(100);
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
    profiles.recordGame("Ana", { difficulty: "medium", score: 10, souvenirs: ["Japan/daruma", "Japan/kokeshi", "Japan/daruma"] });
    const p = profiles.getProfile("Ana");
    expect(Object.keys(p.souvenirs).sort()).toEqual(["Japan/daruma", "Japan/kokeshi"]);
    expect(typeof p.souvenirs["Japan/daruma"]).toBe("number");
  });

  it("keeps earlier souvenirs when a later run buys more, and their original date", () => {
    profiles.recordGame("Ana", { difficulty: "medium", score: 10, souvenirs: ["Japan/daruma"] });
    const first = profiles.getProfile("Ana").souvenirs["Japan/daruma"];
    profiles.recordGame("Ana", { difficulty: "medium", score: 12, souvenirs: ["Japan/furoshiki", "Japan/daruma"] });
    const p = profiles.getProfile("Ana");
    expect(Object.keys(p.souvenirs).sort()).toEqual(["Japan/daruma", "Japan/furoshiki"]);
    expect(p.souvenirs["Japan/daruma"]).toBe(first);
  });

  it("writes nothing when nothing was bought", () => {
    profiles.recordGame("Ana", { difficulty: "medium", score: 10 });
    expect(profiles.getProfile("Ana").souvenirs).toBeUndefined();
  });
});
