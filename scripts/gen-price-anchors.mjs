// ===========================================================================
// gen-price-anchors.mjs — build src/data/price-anchors.js.
//
// Phase 2 of "local currencies". The card already says what money a country uses
// and roughly how many of it a dollar buys. That teaches the RATE. What it does
// not teach is what the money BUYS, and that is the half a child can actually feel:
// "about 37 córdobas to the dollar" is arithmetic, "a pound of rice costs about 25
// córdobas" is a shopping trip.
//
// SOURCE (rule 2 — nothing here is invented or estimated):
//   WFP's Global Food Prices, published on the Humanitarian Data Exchange under
//   CC BY-IGO and updated monthly. Every figure below is a real observed retail
//   price in a real named market on a real date.
//
// ---------------------------------------------------------------------------
// READ THIS BEFORE ADDING A COUNTRY. The trap here is severe.
// ---------------------------------------------------------------------------
//
// WFP monitors the markets WFP OPERATES IN. Its 72 countries of retail data are
// not 72 national price surveys — they are food-security monitoring, and a great
// deal of it is refugee camps and conflict zones. Taken naively:
//
//   Kenya    every market is Kakuma or Dadaab — refugee camps.
//   Uganda   every market is a refugee settlement.
//   Algeria  Tindouf, Smara, Dakhla, Laayoun — the Sahrawi camps and Western
//            Sahara. Not, in any useful sense, "what things cost in Algeria".
//   Zimbabwe Tongogara Refugee Camp among them.
//   Nigeria  the north-eastern conflict markets.
//
// Every one of those produces a well-formed, plausible-looking number that would
// be flatly wrong on a card that says "in Kenya". This is the same shape as the
// Nile that stopped in Sudan: the data is not bad, it is answering a different
// question than the one the card asks.
//
// So countries are NOT taken from whatever WFP happens to cover. They are taken
// from the explicit allowlist below, and each entry names ONE market that is
// either the country's own published national average or a market in its capital
// (verified against the row's admin1 region). Absence means no anchor, and the
// card simply omits the line — which is the correct behaviour under rule 2 and
// the reason this file is short.
//
// The card says WHICH CITY and WHICH MONTH, because a price in Kathmandu in May
// is what this is, and calling it "Nepal" would be claiming more than one market
// can support.
//
// Run: node scripts/gen-price-anchors.mjs
// ===========================================================================
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { COUNTRY_CURRENCY } from "../src/data/currency.js";

const OUT = fileURLToPath(new URL("../src/data/price-anchors.js", import.meta.url));
const UA = "ShutterbugGame/1.0 (educational; joshuadanielspencer@gmail.com)";
const HDX = "https://data.humdata.org/api/3/action/package_show?id=global-wfp-food-prices";

// game country -> the ONE market whose prices may speak for it, and the city name
// the card will print. Verified: every market below sits in the admin1 region named
// beside it. See the warning above for why this is a list and not a filter.
const MARKETS = {
  // A national average the country's own statistics publish through WFP.
  "Nicaragua":  { market: "National Average",         city: null,          region: "national" },
  "Egypt":      { market: "Cairo (national average)", city: null,          region: "Cairo" },
  "Turkey":     { market: "Ankara (national average)",city: null,          region: "Ankara" },
  // A market in the capital.
  "Bolivia":    { market: "La Paz City",              city: "La Paz",      region: "La Paz" },
  "Cameroon":   { market: "Yaoundé-Mfoundi",          city: "Yaoundé",     region: "Centre" },
  "Ecuador":    { market: "Quito",                    city: "Quito",       region: "Pichincha" },
  "Ethiopia":   { market: "Addis Ababa",              city: "Addis Ababa", region: "Addis Ababa" },
  "Guatemala":  { market: "La Terminal",              city: "Guatemala City", region: "Guatemala" },
  "Iran":       { market: "Tehran Market",            city: "Tehran",      region: "Tehran" },
  "Jordan":     { market: "Amman",                    city: "Amman",       region: "Amman" },
  "Madagascar": { market: "Antananarivo",             city: "Antananarivo",region: "Analamanga" },
  "Namibia":    { market: "Windhoek",                 city: "Windhoek",    region: "Khomas" },
  "Nepal":      { market: "Kathmandu",                city: "Kathmandu",   region: "Province No. 3" },
  "Philippines":{ market: "Metro Manila",             city: "Manila",      region: "National Capital region" },
  "Sri Lanka":  { market: "Colombo City",             city: "Colombo",     region: "Western" },
  "Sudan":      { market: "Khartoum",                 city: "Khartoum",    region: "Khartoum" },
  "Zambia":     { market: "Lusaka",                   city: "Lusaka",      region: "Lusaka" },
};

// Which staple to prefer, most recognisable to a child first. Matched as a PREFIX,
// because WFP records varieties rather than the bare word — Metro Manila sells
// "Rice (regular, milled)" and "Rice (well milled)" and nothing called just "Rice",
// and an exact match quietly fell through to TOMATOES for the Philippines. Where a
// market sells several varieties the anchor is the median across them, which is
// what "a pound of rice" honestly means in a market selling four kinds.
//
// A commodity is only used if that country's own market sells it; there is no
// substituting one country's rice for another's. And nothing outside this list is
// eligible: Guatemala's one monitored market sells nothing but FUEL, and a card
// reading "a gallon of petrol costs…" is not what "what things cost here" means to
// a nine-year-old.
const STAPLES = [
  ["Bread", "bread"], ["Rice", "rice"], ["Eggs", "eggs"], ["Milk", "milk"],
  ["Potatoes", "potatoes"], ["Wheat flour", "flour"], ["Sugar", "sugar"],
  ["Maize", "maize"], ["Beans", "beans"], ["Onions", "onions"],
  ["Tomatoes", "tomatoes"], ["Oil (vegetable)", "cooking oil"],
];

// Currencies with no single honest rate to quote — hyperinflation, or an official
// rate and a street rate that differ by multiples. src/data/travel.js already
// refuses to publish a rate for these; publishing a PRICE in them is the same
// claim wearing a different hat, and worse, because a price looks concrete.
const NO_HONEST_RATE = new Set(["Venezuela", "Zimbabwe", "Sudan", "Iran", "Cuba"]);

// How stale a price may be. A rounded staple price does not swing much in a stable
// currency, but a figure from two years ago presented in the present tense is a
// claim about today that nobody checked.
const MAX_AGE_MONTHS = 12;

// Rule 3: imperial first. WFP sells by the kilo and the litre; a child in a US
// homeschool buys by the pound and the quart. Spelled out, not abbreviated: the
// card reads "a pound of rice", and "a lb of rice" is not a sentence. One formula,
// not a hand conversion — the same discipline as scripts/imperial-first.mjs.
const KG_PER_LB = 0.45359237;
const L_PER_QT = 0.946352946;
const UNITS = {
  KG: { unit: "pound", metric: "0.45 kg", factor: KG_PER_LB },
  L:  { unit: "quart", metric: "0.95 L", factor: L_PER_QT },
};

// The same hard rounding the exchange rate gets, and for the same reason: this is
// a magnitude, not a till receipt. A price that reads "about 25 córdobas" is still
// true next year; "24.83" is wrong within a month and claims a precision the word
// "about" already disclaims.
//
// TWO SIGNIFICANT FIGURES, at every scale. gen-currency.mjs words the same idea as
// "two significant figures, and to the nearest ten above 100", and those two rules
// quietly disagree above a thousand: nearest-ten turned an ariary price into 1510,
// which is three figures and reads like a receipt. Two figures all the way up gives
// 1500, which is as true and doesn't pretend. The test caught this, not a human.
const round2sf = (n) => {
  if (n >= 10) {
    const mag = Math.pow(10, Math.floor(Math.log10(n)) - 1);
    return Math.round(n / mag) * mag;
  }
  if (n >= 1) return Math.round(n * 10) / 10;
  return Math.round(n * 100) / 100;
};

const TODAY = new Date().toISOString().slice(0, 7);
const monthsBetween = (a, b) => {
  const [ay, am] = a.split("-").map(Number), [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
};

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// The yearly CSVs are 20-55 MB and the HDX edge drops the big one part-way through
// often enough that a single fetch is not a reliable build step. Retry, and accept
// local copies (`--csv a.csv b.csv`) so a rerun on a bad line doesn't need the
// network at all.
const get = async (url, tries = 4, init = null) => {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, init || { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return r;
    } catch (e) {
      last = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error(`${last.message} for ${url}`);
};

const LOCAL = (() => {
  const i = process.argv.indexOf("--csv");
  return i === -1 ? [] : process.argv.slice(i + 1).filter((a) => !a.startsWith("--"));
})();

// ---- Find this year's and last year's CSVs on HDX -------------------------------
let csvs;
if (LOCAL.length) {
  csvs = LOCAL.map((p) => ({ name: p, local: p }));
  console.log(`reading local: ${LOCAL.join(", ")}`);
} else {
  const pkg = await (await get(HDX)).json();
  const year = new Date().getUTCFullYear();
  const wanted = [String(year), String(year - 1)];
  csvs = pkg.result.resources
    .filter((r) => wanted.some((y) => r.name.includes(y)) && r.format === "CSV")
    .map((r) => ({ name: r.name, url: r.url }));
  if (!csvs.length) throw new Error("no recent WFP price CSVs found on HDX");
  console.log(`WFP resources: ${csvs.map((c) => c.name).join(", ")}`);
}

// ---- Read the rows we care about ------------------------------------------------
// The files are tens of megabytes each and almost none of it is wanted, so this
// streams and keeps only the handful of markets in MARKETS.
const byMarket = new Map();   // market -> [row]
const wantMarkets = new Set(Object.values(MARKETS).map((m) => m.market));

const splitCsv = (line) => {
  const out = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
};

for (const { name, url, local } of csvs) {
  const text = local ? readFileSync(local, "utf8") : await (await get(url)).text();
  const lines = text.split("\n");
  const head = splitCsv(lines[0]);
  const ix = Object.fromEntries(head.map((h, i) => [h.trim(), i]));
  let kept = 0;
  for (let i = 2; i < lines.length; i++) {      // line 1 is the HXL tag row
    if (!lines[i]) continue;
    const f = splitCsv(lines[i]);
    const market = f[ix.market];
    if (!wantMarkets.has(market)) continue;
    if (f[ix.pricetype] !== "Retail") continue;
    const row = {
      date: f[ix.date], market, admin1: f[ix.admin1],
      commodity: f[ix.commodity], unit: f[ix.unit],
      currency: f[ix.currency], price: Number(f[ix.price]), usd: Number(f[ix.usdprice]),
    };
    if (!Number.isFinite(row.price) || row.price <= 0) continue;
    if (!byMarket.has(market)) byMarket.set(market, []);
    byMarket.get(market).push(row);
    kept++;
  }
  console.log(`  ${name}: kept ${kept} rows`);
}

// ---- Pick one price per country -------------------------------------------------
const anchors = {};
const skipped = [];
for (const [country, spec] of Object.entries(MARKETS)) {
  const rows = byMarket.get(spec.market) || [];
  if (!rows.length) { skipped.push(`${country} — no rows for "${spec.market}"`); continue; }
  // Every row must be in the region this market was verified to sit in, or the
  // market name has been reused somewhere else in the country and the check that
  // made this entry trustworthy no longer holds.
  if (spec.region !== "national") {
    const wrong = rows.filter((r) => r.admin1 && r.admin1 !== spec.region);
    if (wrong.length) {
      skipped.push(`${country} — "${spec.market}" now also appears in ${[...new Set(wrong.map((r) => r.admin1))].join(", ")}, not just ${spec.region}`);
      continue;
    }
  }
  if (NO_HONEST_RATE.has(country)) {
    skipped.push(`${country} — no single honest exchange rate, so no honest price either`);
    continue;
  }
  let picked = null;
  for (const [prefix, label] of STAPLES) {
    const cands = rows.filter((r) => r.commodity.startsWith(prefix) && UNITS[r.unit]);
    if (!cands.length) continue;
    const latest = cands.reduce((a, r) => (r.date > a ? r.date : a), "");
    // Every variety priced in that same month, and only one unit — a market that
    // sells rice by the kilo and eggs by the litre would otherwise average them.
    const unit = cands.find((r) => r.date === latest).unit;
    const same = cands.filter((r) => r.date === latest && r.unit === unit);
    picked = { label, unit, date: latest, rows: same };
    break;
  }
  if (!picked) { skipped.push(`${country} — "${spec.market}" sells no staple this generator recognises`); continue; }
  const ageMonths = monthsBetween(picked.date.slice(0, 7), TODAY);
  if (ageMonths > MAX_AGE_MONTHS) {
    skipped.push(`${country} — newest price is ${picked.date.slice(0, 7)}, ${ageMonths} months old`);
    continue;
  }

  const u = UNITS[picked.unit];
  const perUnit = median(picked.rows.map((r) => r.price)) * u.factor;
  const cur = COUNTRY_CURRENCY[country];
  if (!cur) { skipped.push(`${country} — no currency on file`); continue; }
  const rowCur = picked.rows[0].currency;
  if (rowCur !== cur.code) {
    // WFP quotes some markets in dollars. That is not this country's money and the
    // card would read as though it were.
    skipped.push(`${country} — WFP quotes ${spec.market} in ${rowCur}, the card says ${cur.code}`);
    continue;
  }
  // Independent cross-check: WFP publishes its own USD conversion per row. If our
  // rate and theirs disagree by more than half, one of the two numbers is wrong and
  // the card must not carry either. (This is the "pin it to an independent fact"
  // habit the water-feature tests exist for.)
  const oursUsd = median(picked.rows.map((r) => r.price)) / cur.perUsd;
  const theirsUsd = median(picked.rows.map((r) => r.usd).filter(Number.isFinite));
  if (theirsUsd > 0 && (oursUsd / theirsUsd > 1.5 || theirsUsd / oursUsd > 1.5)) {
    skipped.push(`${country} — our rate says $${oursUsd.toFixed(2)}/unit, WFP says $${theirsUsd.toFixed(2)}`);
    continue;
  }
  anchors[country] = {
    item: picked.label,
    unit: u.unit,
    metric: u.metric,
    price: round2sf(perUnit),
    city: spec.city,
    asOf: picked.date.slice(0, 7),
    markets: picked.rows.length,
    source: "WFP Global Food Prices (HDX)",
  };
}


// =============================================================================
// NATIONAL STATISTICS OFFICES
// =============================================================================
// WFP measures the markets WFP operates in, which is why the block above is an
// allowlist of seventeen and why it yields ten. The countries a child actually
// visits most are the ones WFP has no reason to be in at all: the USA is 32 of
// this game's places and China 21.
//
// For those the source has to be the country's own statistics office, one at a
// time. Two are reachable with no key, no registration and no scraping, and both
// publish a real national average retail price:
//
//   United States   BLS Average Price Data, series APU0000702111 — "Bread, white,
//                   pan, per lb." US city average. Already per POUND, so rule 3
//                   needs no conversion at all.
//   Canada          Statistics Canada table 18-10-0245, "Monthly average retail
//                   prices for selected products", geography 11 (Canada),
//                   product 56 (White bread, 675 grams).
//
// A national office BEATS the WFP block for the same country. Nothing overlaps
// today — WFP is not in either of these — but the rule should exist before it is
// needed rather than after.
//
// WHY NOT THE OTHERS. Checked, and each is a specific wall rather than a lack of
// trying:
//
//   United Kingdom  ONS retired its timeseries API in Nov 2024, and the raw price
//                   quotes it still publishes hold 394 items with NO staple foods
//                   in them — groceries moved to retailer scanner data, so the
//                   collector file is leggings, golf balls and blank CDs.
//   China           data.stats.gov.cn returns 403 to non-Chinese IPs.
//   Japan           e-Stat requires a registered application ID.
//   Mexico          INEGI requires an API token.
//   Australia       ABS's Data API is live but its average-retail-price series
//                   was discontinued; what remains is CPI indices, not prices.
//   Eurozone        Eurostat's detailed average prices are gone (404 on every
//                   dataset), so France, Germany, Italy, Greece and Spain each
//                   need their own office, and Destatis GENESIS wants
//                   registration too.
//
// Every one of those is a "get a key" or "find a mirror" task, not a code task.
// Adding one is a new entry in NATIONAL below plus its fetch.
const NATIONAL = [
  {
    country: "United States",
    source: "US Bureau of Labor Statistics, Average Price Data",
    item: "bread",
    async fetchPerLb() {
      const r = await get("https://api.bls.gov/publicAPI/v2/timeseries/data/", 4, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": UA },
        body: JSON.stringify({ seriesid: ["APU0000702111"], startyear: String(new Date().getUTCFullYear() - 1), endyear: String(new Date().getUTCFullYear()) }),
      });
      const j = await r.json();
      if (j.status !== "REQUEST_SUCCEEDED") throw new Error(`BLS said ${j.status}: ${(j.message || []).join("; ")}`);
      const rows = (j.Results?.series?.[0]?.data || []).filter((d) => d.value && d.period?.startsWith("M"));
      if (!rows.length) throw new Error("BLS returned no monthly observations");
      // Already per pound — the series is defined that way, so there is nothing
      // to convert and nothing to get wrong.
      const latest = rows[0];
      return { perLb: Number(latest.value), asOf: `${latest.year}-${latest.period.slice(1)}` };
    },
  },
  {
    country: "Canada",
    source: "Statistics Canada, table 18-10-0245",
    item: "bread",
    async fetchPerLb() {
      const r = await get("https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods", 4, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": UA },
        // geography 11 = Canada, product 56 = White bread, 675 grams.
        body: JSON.stringify([{ productId: 18100245, coordinate: "11.56.0.0.0.0.0.0.0.0", latestN: 3 }]),
      });
      const j = await r.json();
      const pts = j?.[0]?.object?.vectorDataPoint;
      if (!pts?.length) throw new Error(`Statistics Canada returned no data (${j?.[0]?.status})`);
      const latest = pts.reduce((a, p) => (p.refPer > a.refPer ? p : a));
      // The series is priced per 675 g loaf, so this is the one conversion.
      return { perLb: latest.value * 453.59237 / 675, asOf: latest.refPer.slice(0, 7) };
    },
  },
];

for (const n of NATIONAL) {
  const cur = COUNTRY_CURRENCY[n.country];
  if (!cur) { skipped.push(`${n.country} — no currency on file`); continue; }
  let got;
  try { got = await n.fetchPerLb(); }
  catch (e) { skipped.push(`${n.country} — ${n.source} unreachable: ${e.message}`); continue; }
  const age = monthsBetween(got.asOf, TODAY);
  if (age > MAX_AGE_MONTHS) { skipped.push(`${n.country} — newest ${n.source} figure is ${got.asOf}, ${age} months old`); continue; }
  // Same magnitude sanity as the WFP block: a pound of bread between 5c and $10.
  const usd = got.perLb / cur.perUsd;
  if (!(usd > 0.05 && usd < 10)) { skipped.push(`${n.country} — ${got.perLb.toFixed(2)} ${cur.code}/lb is $${usd.toFixed(2)}, which is not a bread price`); continue; }
  anchors[n.country] = {
    item: n.item, unit: "pound", metric: "0.45 kg",
    price: round2sf(got.perLb), city: null, asOf: got.asOf, markets: 1, source: n.source,
  };
}

// ---- Write ----------------------------------------------------------------------
const q = (s) => (s === null ? "null" : JSON.stringify(s));
const body = Object.entries(anchors)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([c, a]) =>
    `  ${JSON.stringify(c)}: { item: ${q(a.item)}, unit: ${q(a.unit)}, metric: ${q(a.metric)}, `
    + `price: ${a.price}, city: ${q(a.city)}, asOf: ${q(a.asOf)}, source: ${q(a.source)} },`)
  .join("\n");

writeFileSync(OUT, `// GENERATED by scripts/gen-price-anchors.mjs — do not hand-edit.
//
// What the money actually BUYS, so the exchange rate on the culture card stops
// being arithmetic and becomes a shopping trip. Every figure is a real observed
// RETAIL price on one named month, and every one carries the \`source\` that
// published it — there is no single global source of everyday prices, so this
// file is assembled from three:
//
//   WFP Global Food Prices (HDX, CC BY-IGO)  — one named market per country
//   US Bureau of Labor Statistics             — national average, already per lb
//   Statistics Canada, table 18-10-0245       — national average
//
// \`price\` is in the country's own currency, per POUND or per QUART (rule 3:
// imperial first), converted from WFP's kilo/litre by one formula in the
// generator. It is rounded hard, like the exchange rate beside it and for the same
// reason — this is a magnitude, not a till receipt.
//
// \`city\` is null where the figure is a published NATIONAL average; otherwise it
// is the city the market is in, and the card names it. That distinction is not
// decoration: WFP monitors the markets WFP operates in, and for many countries
// that means refugee camps and conflict zones. The generator's allowlist is what
// keeps those out — read the warning at the top of it before adding a country.
//
// Regenerate with:  node scripts/gen-price-anchors.mjs
export const PRICE_ANCHORS = {
${body}
};
`);

console.log(`\nwrote ${Object.keys(anchors).length} anchors -> ${OUT}`);
for (const [c, a] of Object.entries(anchors).sort())
  console.log(`  ${c.padEnd(14)} ${String(a.price).padStart(8)} ${COUNTRY_CURRENCY[c].code}  per ${a.unit} of ${a.item.padEnd(10)} ${a.city || "(national)"} ${a.asOf} [${a.markets} obs]`);
if (skipped.length) { console.log("\nskipped:"); for (const s of skipped) console.log(`  ${s}`); }
