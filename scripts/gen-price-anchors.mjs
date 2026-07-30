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
import { inflateRawSync } from "node:zlib";
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
// time. Four are reachable with no key, no registration and no scraping:
//
//   United States   BLS Average Price Data, series APU0000702111 — "Bread, white,
//                   pan, per lb." US city average. Already per POUND, so rule 3
//                   needs no conversion at all.
//   Canada          Statistics Canada table 18-10-0245, "Monthly average retail
//                   prices for selected products", geography 11 (Canada),
//                   product 56 (White bread, 675 grams).
//   Japan           e-Stat's Retail Price Survey (小売物価統計調査), table 1,
//                   "Retail Prices of Major Items by Cities" — the published
//                   monthly Excel, item 1001/1002 うるち米 (non-glutinous rice)
//                   in 東京都区部 (region 13100).
//   Mexico          INEGI's average-price tool on the 2Q-Jul-2018 base, genérico
//                   014 "Tortilla de maíz" in the Mexico City metropolitan area
//                   (city 01).
//
// The last two are NOT national averages — they are one named city each, so they
// carry a `city` and the card says which, exactly as the WFP block does. That is
// the honest shape: neither office publishes a national average retail price, and
// averaging their 55 and 82 cities here would be a number this project computed
// rather than a number anybody published (rule 2).
//
// ⚠ THE TRAP THAT COST A SESSION, twice: for both of these the API wants a
// registered key and THE PUBLIC SITE DOES NOT. "Requires a key" was written down
// as a wall for both, and it was wrong both times — the wall was only ever on the
// API. Before recording a country as blocked, check what the site itself serves.
//
// A national office BEATS the WFP block for the same country. Nothing overlaps
// today — WFP is in none of these four — but the rule should exist before it is
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
//   Australia       ABS's Data API is live but its average-retail-price series
//                   was discontinued; what remains is CPI indices, not prices.
//   Germany         Destatis publishes consumer price INDICES only — no average
//                   price in euros for any staple. A key would not have helped.
//   Eurozone        Eurostat's detailed average prices are gone (404 on every
//                   dataset), so France, Italy, Greece and Spain each need their
//                   own office.
//
// Adding one is a new entry in NATIONAL below plus its fetch.

// ---------------------------------------------------------------------------
// Just enough .xlsx to read one published table, because Japan publishes this as
// a spreadsheet and nothing else. An xlsx is a ZIP of XML: read the central
// directory, inflate the members, pull the shared strings and the cells. Sixty
// lines of node:zlib beats adding a parser dependency to a game that has three.
// ---------------------------------------------------------------------------
const unzip = (buf) => {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("not a zip file");
  let off = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let i = 0, n = buf.readUInt16LE(eocd + 10); i < n; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error("bad zip central directory");
    const method = buf.readUInt16LE(off + 10);
    const csize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28), extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.toString("utf8", off + 46, off + 46 + nameLen);
    const start = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    const raw = buf.subarray(start, start + csize);
    files[name] = method === 0 ? raw : inflateRawSync(raw);
    off += 46 + nameLen + extraLen + commentLen;
  }
  return files;
};

const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");

// Sheet 1 as { rowNumber: { column: value } }, e.g. rows[12].AM. Furigana (<rPh>)
// is dropped first — it is a phonetic gloss stored inside the same shared string,
// and leaving it in turns 札幌市 into 札幌市サッポロシ.
const readSheet = (buf) => {
  const files = unzip(buf);
  const sharedXml = files["xl/sharedStrings.xml"]?.toString("utf8") || "";
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(([, si]) =>
    [...si.replace(/<rPh[\s\S]*?<\/rPh>/g, "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
      .map((m) => unesc(m[1])).join(""));
  const sheet = files["xl/worksheets/sheet1.xml"].toString("utf8");
  const rows = {};
  for (const [, attrs, body] of sheet.matchAll(/<row([^>]*)>([\s\S]*?)<\/row>/g)) {
    const n = Number(/ r="(\d+)"/.exec(attrs)?.[1]);
    const cells = {};
    for (const [, cAttrs, v] of body.matchAll(/<c([^>]*)>[\s\S]*?<v>([\s\S]*?)<\/v>[\s\S]*?<\/c>/g)) {
      const ref = / r="([A-Z]+)\d+"/.exec(cAttrs)?.[1];
      if (!ref) continue;
      cells[ref] = / t="s"/.test(cAttrs) ? shared[Number(v)] : unesc(v);
    }
    rows[n] = cells;
  }
  return rows;
};

// "1袋･5kg" -> 5, "1kg" -> 1, "100g" -> 0.1. The pack size is spelled into the
// unit column rather than given as a number, and getting it wrong is a factor-of-
// five error that still looks like a price, so the LAST mass in the string wins
// and anything unreadable throws rather than guessing.
const packKg = (unit) => {
  const ms = [...unit.matchAll(/(\d+(?:\.\d+)?)\s*(kg|g)\b/gi)];
  if (!ms.length) throw new Error(`cannot read a pack size out of "${unit}"`);
  const [, n, u] = ms[ms.length - 1];
  return u.toLowerCase() === "kg" ? Number(n) : Number(n) / 1000;
};
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
  {
    country: "Japan",
    city: "Tokyo",
    source: "Statistics Bureau of Japan, Retail Price Survey, table 1",
    item: "rice",
    // Rice, not bread, and not because rice is the cheaper number: 食パン is in
    // the same table at 534 yen a kilo. うるち米 is what a Japanese kitchen
    // actually runs on, and the point of this line is a shopping trip a child can
    // picture, not a like-for-like row in a spreadsheet.
    async fetchPerLb() {
      // e-Stat's month filter uses an opaque code per calendar month. They are
      // stable across years (verified back to 2021) and there is no pattern to
      // derive, so they are a table.
      const MONTH = { 1: "11010301", 2: "11010302", 3: "11010303", 4: "12040604", 5: "12040605", 6: "12040606",
        7: "23070907", 8: "23070908", 9: "23070909", 10: "24101210", 11: "24101211", 12: "24101212" };
      const LIST = "https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&cycle=1"
        + "&toukei=00200571&tstat=000000680001&tclass1val=0";
      const DL = (id) => `https://www.e-stat.go.jp/stat-search/file-download?statInfId=${id}&fileKind=0`;
      const now = new Date();
      // A month's table is published late in the FOLLOWING month, so the newest
      // one is never the current month. Walk back until a listing has it.
      for (let back = 0; back < 14; back++) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
        const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1;
        const html = await (await get(`${LIST}&year=${y}0&month=${MONTH[m]}`)).text();
        // One month's listing holds several tables and each table can be split
        // across files. The wanted one is table 1 ("主要品目の都市別小売価格"),
        // in the part whose item range starts at 1001 — matched on the block of
        // page text that precedes each download link.
        const ids = [];
        for (const hit of html.matchAll(/statInfId=(\d+)&fileKind=0/g)) {
          const before = html.slice(Math.max(0, hit.index - 5000), hit.index).replace(/<[^>]+>/g, " ");
          if (/主要品目の都市別小売価格/.test(before) && /「1001/.test(before)) ids.push(hit[1]);
        }
        for (const id of ids) {
          const rows = readSheet(Buffer.from(await (await get(DL(id))).arrayBuffer()));
          // Row 10 is the region-code header; 13100 is 東京都区部, the 23 wards.
          const col = Object.entries(rows[10] || {}).find(([, v]) => v === "13100")?.[0];
          if (!col) continue;
          // Both varieties of うるち米 the survey prices — Koshihikari and not —
          // and the median across them, which is what "a pound of rice" honestly
          // means where the shop sells two kinds. Column J is the item code, K its
          // name, L the pack the price is for.
          const priced = Object.values(rows)
            .filter((r) => (r.J === "1001" || r.J === "1002") && Number(r[col]) > 0)
            .map((r) => ({ perKg: Number(r[col]) / packKg(r.L), name: r.K }));
          if (priced.length !== 2) continue;
          return { perLb: median(priced.map((p) => p.perKg)) * KG_PER_LB, asOf: `${y}-${String(m).padStart(2, "0")}` };
        }
      }
      throw new Error("no Retail Price Survey table 1 with item 1001 in the last 14 months");
    },
  },
  {
    country: "Mexico",
    city: "Mexico City",
    source: "INEGI, Precios promedio (base 2Q Jul 2018)",
    item: "tortillas",
    // INEGI's export is an ASP.NET app that keeps the chosen product in SESSION
    // and posts an EMPTY `series` field — which is why "read the series id off the
    // page" was a dead end for a previous session. There is no series id to read.
    // The sequence is: take a cookie, tell the count service what you want (that
    // is what writes the session), then post the export form.
    async fetchPerLb() {
      const B = "https://www.inegi.org.mx/app/preciospromedio";
      const jar = new Map();
      const keep = (res) => {
        for (const c of res.headers.getSetCookie?.() ?? []) {
          const pair = c.split(";")[0];          // "name=value", dropping Path/HttpOnly/…
          const eq = pair.indexOf("=");
          if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
        }
        return res;
      };
      const headers = () => ({ "User-Agent": UA, Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") });
      const asmx = async (method, body) => {
        const r = keep(await get(`${B}/Servicios/ArbolAjaxInteraccion.asmx/${method}`, 4, {
          method: "POST", headers: { ...headers(), "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(body),
        }));
        return (await r.json()).d;
      };

      keep(await get(`${B}/?bs=18a`, 4, { headers: { "User-Agent": UA } }));
      // Periods come back newest-first as "2026/06_202606_2026/05_202605_…".
      const period = (await asmx("ObtienePeriodo", { cab: "18a" })).split("_")[1];
      if (!/^\d{6}$/.test(period)) throw new Error(`INEGI gave no usable period ("${period}")`);
      // 014 is the genérico "Tortilla de maíz" — the app sends only the last three
      // digits of the tree code 001011111001014, and they are unique across the
      // whole basket. 01 is the Mexico City metropolitan area.
      await asmx("ObtieneCountReg", { obsolet_series: "014", series2: "", pi: period, pf: period,
        entidades: ",01_01,", countreg: "1", cab: "18a" });
      const res = await get(`${B}/Exportacion.aspx`, 4, {
        method: "POST", headers: { ...headers(), "Content-Type": "application/x-www-form-urlencoded" },
        body: `series=&tipo=CSV&pi=${period}&pf=${period}&ent=${encodeURIComponent(",01_01,")}&bs=18a`,
      });
      // Served as Windows-1252 despite the header saying UTF-8; latin1 covers
      // every accent that appears in it.
      const text = Buffer.from(await res.arrayBuffer()).toString("latin1");
      const lines = text.split(/\r?\n/);
      const h = lines.findIndex((l) => l.includes("Precio promedio"));
      if (h < 0) throw new Error("INEGI returned no price table (the export needs the session cookie)");
      const ix = Object.fromEntries(splitCsv(lines[h]).map((c, i) => [c.trim(), i]));
      const rows = lines.slice(h + 1).filter(Boolean).map(splitCsv)
        .filter((f) => f[ix["Clave ciudad"]] === "01" && f[ix["Clave genérico"]] === "014");
      if (!rows.length) throw new Error("INEGI returned no rows for genérico 014 in city 01");
      // Guard the two things a silently-changed code would break: that this is
      // still tortillas, and that it is still priced by the kilo.
      if (!/Tortilla/i.test(rows[0][ix["Genérico"]])) throw new Error(`genérico 014 is now "${rows[0][ix["Genérico"]]}"`);
      const kg = rows.map((f) => {
        if (f[ix.Unidad].trim().toUpperCase() !== "KG") throw new Error(`tortillas priced per ${f[ix.Unidad]}, not KG`);
        return Number(f[ix["Precio promedio"]]) / Number(f[ix.Cantidad]);
      }).filter((n) => Number.isFinite(n) && n > 0);
      // Every quote INEGI collected in that city that month — dozens of shops, and
      // the median across them is the one number that means "what it costs there".
      return { perLb: median(kg) * KG_PER_LB, asOf: `${period.slice(0, 4)}-${period.slice(4)}` };
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
  // Same magnitude sanity as the WFP block: a pound of a staple between 5c and $10.
  const usd = got.perLb / cur.perUsd;
  if (!(usd > 0.05 && usd < 10)) { skipped.push(`${n.country} — ${got.perLb.toFixed(2)} ${cur.code}/lb is $${usd.toFixed(2)}, which is not a ${n.item} price`); continue; }
  anchors[n.country] = {
    item: n.item, unit: "pound", metric: "0.45 kg",
    price: round2sf(got.perLb), city: n.city ?? null, asOf: got.asOf, markets: 1, source: n.source,
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
// file is assembled from five:
//
//   WFP Global Food Prices (HDX, CC BY-IGO)  — one named market per country
//   US Bureau of Labor Statistics             — national average, already per lb
//   Statistics Canada, table 18-10-0245       — national average
//   Statistics Bureau of Japan, Retail Price Survey — rice in Tokyo
//   INEGI Precios promedio                    — tortillas in Mexico City
//
// \`price\` is in the country's own currency, per POUND or per QUART (rule 3:
// imperial first), converted from the source's kilo/litre/pack by one formula in
// the generator. It is rounded hard, like the exchange rate beside it and for the
// same reason — this is a magnitude, not a till receipt.
//
// \`city\` is null where the figure is a published NATIONAL average; otherwise it
// is the city the price was collected in, and the card names it. That distinction
// is not decoration: WFP monitors the markets WFP operates in, and for many
// countries that means refugee camps and conflict zones. The generator's allowlist
// is what keeps those out — read the warning at the top of it before adding a
// country. Japan and Mexico name a city for a duller reason: neither statistics
// office publishes a national average retail price, and averaging their cities
// here would be a number this project computed rather than one anybody published.
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
