// ===========================================================================
// Currency data invariants.
//
// This can't check that a rate is RIGHT — that needs a human against a source, and
// it drifts by the week regardless. What it can check is the shape, and the shape is
// where the real danger was: the first version of the generator read Wikidata and
// confidently produced a France that used the CFP franc and a Zimbabwe that used the
// INDIAN RUPEE. Both are well-formed. Both are rubbish.
//
// So the two things pinned here are the two that caught that: every country the game
// visits has money, and no two countries share a currency unless they genuinely do.
// The second is what a bad join breaks first.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { COUNTRY_CURRENCY, CURRENCY_AS_OF } from "../src/data/currency.js";

const countries = [...new Set(LOCATIONS.flatMap((l) => (l.countries?.length ? l.countries : [l.country])))];

describe("currency data", () => {
  it("covers every country in the game except Antarctica", () => {
    for (const c of countries) {
      if (c === "Antarctica") continue; // no economy; the ISO register agrees
      expect(COUNTRY_CURRENCY[c], `${c} has no currency`).toBeTruthy();
    }
    expect(COUNTRY_CURRENCY["Antarctica"], "Antarctica must not have money").toBeUndefined();
  });

  it("is well formed — ISO code, name, symbol, positive rate", () => {
    for (const [c, m] of Object.entries(COUNTRY_CURRENCY)) {
      expect(m.code, `${c}: code must be 3 letters`).toMatch(/^[A-Z]{3}$/);
      expect(m.name, `${c}: no currency name`).toBeTruthy();
      expect(m.symbol, `${c}: no symbol`).toBeTruthy();
      expect(m.perUsd, `${c}: rate must be positive`).toBeGreaterThan(0);
      // Rounded to two significant figures on purpose, so it stays true as it drifts.
      // A long decimal here means someone hand-edited a generated file.
      const s = String(m.perUsd);
      expect(s.replace(/^\d+\.?/, "").length, `${c}: too precise (${s})`).toBeLessThanOrEqual(2);
    }
  });

  it("names the month its rates came from", () => {
    expect(CURRENCY_AS_OF).toMatch(/^[A-Z][a-z]+ \d{4}$/);
  });

  it("gives the eurozone the euro, and only the eurozone", () => {
    // A spot-check with teeth: France on anything but EUR is the exact failure the
    // Wikidata version shipped, and it is invisible unless something asserts it.
    for (const c of ["France", "Germany", "Italy", "Spain", "Greece", "Portugal", "Netherlands", "Belgium", "Austria", "Malta"]) {
      if (!COUNTRY_CURRENCY[c]) continue;
      expect(COUNTRY_CURRENCY[c].code, `${c} should use the euro`).toBe("EUR");
    }
    for (const c of ["United Kingdom", "Switzerland", "Poland", "Czechia", "Hungary", "Norway", "Sweden", "Denmark", "Iceland"]) {
      if (!COUNTRY_CURRENCY[c]) continue;
      expect(COUNTRY_CURRENCY[c].code, `${c} does NOT use the euro`).not.toBe("EUR");
    }
  });

  it("does not put a country on a neighbour's money by accident", () => {
    // Codes that MORE THAN ONE country in this game legitimately uses: the eurozone,
    // the CFA and CFP franc zones, the countries that use the US dollar outright, and
    // the Danish krone (Greenland is part of the Kingdom of Denmark). Anything else
    // sharing a code with an unrelated country is the signature of a bad join.
    const SHARED = new Set(["EUR", "XOF", "XAF", "XPF", "USD", "DKK"]);
    const byCode = {};
    for (const [c, m] of Object.entries(COUNTRY_CURRENCY)) {
      if (SHARED.has(m.code)) continue;
      (byCode[m.code] = byCode[m.code] || []).push(c);
    }
    for (const [code, cs] of Object.entries(byCode)) {
      expect(cs.length, `${code} is claimed by ${cs.join(", ")}`).toBe(1);
    }
  });
});
