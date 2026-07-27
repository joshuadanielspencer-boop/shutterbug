// ===========================================================================
// gen-currency.mjs — build src/data/currency.js.
//
// Phase 1 of "local currencies": no mechanics, no spending. Each country's culture
// card says what money is used there, what it is called, and roughly how many of it
// a US dollar buys. That last number is the whole lesson — it is what lets a child
// tell that 1,500 yen and 1,500 dollars are not remotely the same thing. Orders of
// magnitude, not arithmetic.
//
// SOURCES (rule 2 — nothing here is invented):
//   • Country -> currency, currency name, ISO 4217 code: the ISO 4217 register
//     itself (SIX Financial Information, who maintain it on ISO's behalf).
//   • Approximate rate against the US dollar: open.er-api.com, which aggregates
//     central-bank reference rates.
//
// The FIRST attempt at this used Wikidata's P38 "currency" statements, and it is
// worth recording why that was thrown away: it put France on the CFP franc (which
// is used in French Polynesia and New Caledonia, not in France) and Zimbabwe on the
// INDIAN RUPEE. Both look perfectly plausible in a data file and both are rubbish.
// The ISO register is the actual authority for this exact mapping, and it does not
// have that class of error in it.
//
// The rate is deliberately ROUNDED HARD — two significant figures at most, and to
// the nearest ten above 100. A rate is a moving number and this is not a currency
// converter: "about 37 córdobas to the dollar" teaches the same thing next year
// that it teaches today, where "36.82" would be quietly wrong within a week and
// would claim a precision the word "about" already disclaims. The card prints the
// month the number was taken, so it is honest about being a snapshot.
//
// Run: node scripts/gen-currency.mjs
// ===========================================================================
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../src/data/locations.js";

const OUT = fileURLToPath(new URL("../src/data/currency.js", import.meta.url));
const UA = "ShutterbugGame/1.0 (educational; joshuadanielspencer@gmail.com)";
const ISO_URL = "https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml";

// Antarctica is in the ISO register as "No universal currency", which is correct and
// is why it gets no card line — inventing money for it would be inventing a fact.
const NO_CURRENCY = new Set(["Antarctica"]);

// Game name -> ISO register name, for the ones normalisation can't reach on its own
// (the register uses formal state names).
const ALIAS = {
  "Russia": "RUSSIAN FEDERATION",
  "South Korea": "KOREA (THE REPUBLIC OF)",
  "Vietnam": "VIET NAM",
  "Dem. Rep. Congo": "CONGO (THE DEMOCRATIC REPUBLIC OF THE)",
  "Solomon Is.": "SOLOMON ISLANDS",
  "United States": "UNITED STATES OF AMERICA",
  "United Kingdom": "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
  "Taiwan": "TAIWAN (PROVINCE OF CHINA)",
  "Czechia": "CZECHIA",
  // Named exactly because normalising "KOREA (THE REPUBLIC OF)" collides with the
  // DPRK's entry, and the register spells Turkey the Turkish way.
  "Turkey": "TÜRKİYE",
};

// Symbols are NOT in the ISO register, so this is a hand-checked list of the ones
// that are unambiguous. Anything not here falls back to its ISO code, which is
// always correct and reads perfectly well ("CHF 20"). A guessed symbol would be a
// small invented fact, which is exactly what rule 2 forbids.
const SYMBOL = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹", KRW: "₩", RUB: "₽",
  TRY: "₺", VND: "₫", THB: "฿", PHP: "₱", NGN: "₦", KZT: "₸", UAH: "₴", ILS: "₪",
  AUD: "$", NZD: "$", CAD: "$", MXN: "$", BRL: "R$", ARS: "$", CLP: "$", COP: "$",
  PEN: "S/", NIO: "C$", CRC: "₡", GTQ: "Q", PAB: "B/.", CUP: "$", JMD: "$", TTD: "$",
  ZAR: "R", GHS: "₵", PYG: "₲", MNT: "₮", KHR: "៛", MYR: "RM", SGD: "$", IDR: "Rp",
  TWD: "NT$", PKR: "₨", NPR: "₨", LKR: "₨", BDT: "৳", PLN: "zł", CZK: "Kč", HUF: "Ft",
  ISK: "kr", NOK: "kr", SEK: "kr", DKK: "kr", FJD: "$", SBD: "$", HKD: "HK$",
};

const get = async (url, headers = {}) => {
  const r = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};

// Fold the register's formal names toward the everyday ones: drop diacritics, drop a
// trailing "(THE)" or "(ISLAMIC REPUBLIC OF)"-style qualifier, drop a ", UNITED
// REPUBLIC OF"-style suffix. That alone matches most of them.
const norm = (s) => s
  .normalize("NFKD").replace(/[̀-ͯ]/g, "")
  .toUpperCase().replace(/\(.*?\)/g, "").split(",")[0]
  .replace(/[^A-Z ]/g, " ").replace(/\s+/g, " ").trim();

// ---- the countries the game actually visits ------------------------------------
const countries = [...new Set(LOCATIONS.flatMap((l) => (l.countries?.length ? l.countries : [l.country])))].sort();

// ---- ISO 4217 ------------------------------------------------------------------
const xml = await get(ISO_URL);
// Indexed BOTH ways. The normalised index is what matches most countries without
// ceremony, but normalising is lossy — it folds "KOREA (THE REPUBLIC OF)" and "KOREA
// (THE DEMOCRATIC PEOPLE'S REPUBLIC OF)" onto the same key, and the first attempt at
// this quietly put South Korea on the NORTH Korean won. So a normalised key that more
// than one register entry claims is marked ambiguous and refuses to resolve; those
// countries must name the register entry exactly, in ALIAS.
const raws = {};                  // exact register name -> rows
const norms = {}, ambiguous = new Set();
for (const [, block] of xml.matchAll(/<CcyNtry>([\s\S]*?)<\/CcyNtry>/g)) {
  const tag = (t) => (block.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1]?.trim();
  const ctry = tag("CtryNm"), name = tag("CcyNm"), code = tag("Ccy");
  if (!ctry || !name || !code) continue;   // "No universal currency" entries have no code
  (raws[ctry] = raws[ctry] || []).push({ name, code });
}
for (const [ctry, rows] of Object.entries(raws)) {
  const k = norm(ctry);
  if (norms[k] && norms[k] !== rows) ambiguous.add(k);
  norms[k] = rows;
}
const lookup = (country) => {
  const alias = ALIAS[country];
  if (alias) return raws[alias] || raws[Object.keys(raws).find((r) => norm(r) === norm(alias))];
  const k = norm(country);
  if (ambiguous.has(k)) return null;
  return norms[k];
};

// A handful of countries list more than one legal tender. Prefer the country's OWN
// currency over a foreign one it also accepts (Panama's balboa over the US dollar,
// Namibia's dollar over the rand) — that is the one prices are written in. Where the
// foreign currency is the only one, it stays.
const pick = (rows) => {
  const own = rows.filter((r) => !/^(US Dollar|Rand)$/i.test(r.name));
  return (own.length ? own : rows)[0];
};

// ---- rates ---------------------------------------------------------------------
const fx = JSON.parse(await get("https://open.er-api.com/v6/latest/USD"));
if (fx.result !== "success") throw new Error("rate fetch failed");
const asOf = new Date(fx.time_last_update_unix * 1000)
  .toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

const round = (v) => {
  if (!isFinite(v) || v <= 0) return null;
  if (v >= 1000) return Math.round(v / 100) * 100;
  if (v >= 100) return Math.round(v / 10) * 10;
  if (v >= 10) return Math.round(v);
  if (v >= 1) return Math.round(v * 10) / 10;
  return Math.round(v * 100) / 100;
};

// ---- join ----------------------------------------------------------------------
const rows = [], missing = [];
for (const country of countries) {
  if (NO_CURRENCY.has(country)) continue;
  const rowset = lookup(country);
  if (!rowset) { missing.push(`${country} — no unambiguous ISO 4217 entry`); continue; }
  const cur = pick(rowset);
  const perUsd = round(fx.rates[cur.code]);
  if (perUsd === null) { missing.push(`${country} — no rate for ${cur.code}`); continue; }
  rows.push({ country, name: cur.name, code: cur.code, symbol: SYMBOL[cur.code] || cur.code, perUsd });
}

if (missing.length) {
  console.error(`\nNO CURRENCY for ${missing.length}:\n  ${missing.join("\n  ")}\n`);
  console.error("Add an ALIAS (with the register's exact name) and re-run.\n");
  process.exit(1);
}

const body = rows.map((r) =>
  `  ${JSON.stringify(r.country)}: { name: ${JSON.stringify(r.name)}, code: ${JSON.stringify(r.code)}, ` +
  `symbol: ${JSON.stringify(r.symbol)}, perUsd: ${r.perUsd} },`).join("\n");

writeFileSync(OUT, `// GENERATED by scripts/gen-currency.mjs — do not hand-edit.
//
// What money each country uses, for the culture card. \`perUsd\` is roughly how many
// units one US dollar buys — a MAGNITUDE, not a conversion rate: it is rounded to
// two significant figures precisely so it stays true as it drifts, and the card
// prints CURRENCY_AS_OF beside it so the number is honest about being a snapshot.
//
// Sources: the ISO 4217 register (country -> currency, name, code) and
// open.er-api.com (central-bank reference rates). Symbols are a hand-checked list in
// the generator; a currency without a confidently-known symbol shows its ISO code
// instead, which is always right.
//
// Antarctica is absent on purpose — the register lists it as having no universal
// currency, and giving it money would be inventing a fact.
//
// Regenerate with:  node scripts/gen-currency.mjs
export const CURRENCY_AS_OF = ${JSON.stringify(asOf)};
export const COUNTRY_CURRENCY = {
${body}
};
`);
console.log(`${rows.length} countries, rates as of ${asOf}`);
console.log(`wrote ${OUT}`);
