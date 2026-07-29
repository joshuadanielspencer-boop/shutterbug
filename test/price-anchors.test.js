// ===========================================================================
// The price anchors — what a country's money actually BUYS.
//
// This file exists because of the specific way this data goes wrong. The source
// (WFP's Global Food Prices) is authoritative and free and covers 72 countries,
// and taking those 72 countries is the WRONG THING TO DO: WFP monitors the markets
// WFP OPERATES IN. Every Kenyan market in it is Kakuma or Dadaab, every Ugandan
// one is a refugee settlement, and Algeria's are the Sahrawi camps at Tindouf.
// Each of those yields a perfectly well-formed number that would be false on a
// card reading "in Kenya" — the same shape as the Nile that stopped in Sudan.
//
// So what is pinned here is not "is the number well formed" (it is, always) but
// the things that would let a bad figure through: a country that isn't on the
// allowlist, a price whose magnitude disagrees with the exchange rate beside it,
// a currency this project has already decided has no honest rate, and a figure
// old enough that the present tense is a claim nobody checked.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { PRICE_ANCHORS } from "../src/data/price-anchors.js";
import { COUNTRY_CURRENCY } from "../src/data/currency.js";
import { LOCATIONS } from "../src/data/locations.js";

const countries = new Set(LOCATIONS.map((l) => l.country));
const entries = Object.entries(PRICE_ANCHORS);

// Hyperinflation, or an official rate and a street rate differing by multiples.
// travel.js already refuses to publish a RATE for these; a price is the same claim
// wearing a different hat, and worse, because a price looks concrete.
const NO_HONEST_RATE = ["Venezuela", "Zimbabwe", "Sudan", "Iran", "Cuba"];

describe("price anchors", () => {
  it("only names countries the game actually visits", () => {
    for (const [c] of entries) expect(countries.has(c), `${c} is not in the game`).toBe(true);
  });

  it("has a currency to price it in", () => {
    for (const [c] of entries) expect(COUNTRY_CURRENCY[c], `${c} has no currency`).toBeTruthy();
  });

  it("is well formed — a positive price, an imperial unit, a metric equivalent", () => {
    for (const [c, a] of entries) {
      expect(a.price, `${c}: price must be positive`).toBeGreaterThan(0);
      // Rule 3. The unit a child reads is imperial; the metric is the bracket.
      expect(["pound", "quart"], `${c}: ${a.unit} is not an imperial unit`).toContain(a.unit);
      expect(a.metric, `${c}: no metric equivalent`).toMatch(/^[\d.]+ (kg|L)$/);
      expect(a.item, `${c}: no item`).toBeTruthy();
      expect(a.asOf, `${c}: asOf must be YYYY-MM`).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      // Rule 2: every figure names who published it. There is no single global
      // source of everyday prices, so the file is assembled from three and a
      // figure without a source cannot be re-checked by anyone.
      expect(a.source, `${c}: no source`).toBeTruthy();
    }
  });

  it("rounds hard, like the exchange rate beside it", () => {
    // A price is a magnitude here, not a till receipt. Three significant figures
    // would claim a precision the word "about" on the card already disclaims, and
    // a long decimal means someone hand-edited a generated file.
    for (const [c, a] of entries) {
      const sig = String(a.price).replace(/[.0]+$/, "").replace(/[^1-9]/g, "").length;
      expect(sig, `${c}: ${a.price} carries ${sig} significant figures`).toBeLessThanOrEqual(2);
    }
  });

  // The one with teeth. A price and an exchange rate are two independent numbers
  // from two independent sources, and if they disagree about what a pound of rice
  // costs in dollars then one of them is wrong and the card must not carry either.
  // A staple food between 5 cents and 10 dollars a pound is a wide net on purpose —
  // it is there to catch a rate off by a factor of a thousand, not to second-guess
  // a real market.
  it("agrees with the exchange rate about what a pound of food costs", () => {
    const bad = [];
    for (const [c, a] of entries) {
      const usd = a.price / COUNTRY_CURRENCY[c].perUsd;
      if (usd < 0.05 || usd > 10) bad.push(`${c}: ${a.price} ${COUNTRY_CURRENCY[c].code} is $${usd.toFixed(2)} per ${a.unit} of ${a.item}`);
    }
    expect(bad, `prices the exchange rate disagrees with:\n  ${bad.join("\n  ")}`).toEqual([]);
  });

  it("never prices a currency that has no honest rate", () => {
    for (const c of NO_HONEST_RATE)
      expect(PRICE_ANCHORS[c], `${c} has no single honest rate, so it can have no honest price`).toBeUndefined();
  });

  // Not a hard failure on age — the data updates monthly and a rounded staple price
  // in a stable currency does not swing — but two years is a claim about today that
  // nobody checked, and the generator is meant to be re-run.
  it("is not presenting a stale figure in the present tense", () => {
    const now = new Date();
    const stale = entries.filter(([, a]) => {
      const [y, m] = a.asOf.split("-").map(Number);
      return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m) > 24;
    }).map(([c, a]) => `${c} (${a.asOf})`);
    expect(stale, `re-run node scripts/gen-price-anchors.mjs — stale: ${stale.join(", ")}`).toEqual([]);
  });
});
