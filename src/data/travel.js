// ===========================================================================
// TRAVEL MODES — regional hub airports, last-leg transport, and currencies.
//
// A higher-difficulty layer (Adventurer/Expert): instead of a single magic
// flight, the traveller flies into a real REGIONAL HUB airport, then chooses a
// GROUND/WATER transport for the last leg to the landmark — trading TIME against
// MONEY. The point is familiarity with the world's major hubs and with the kinds
// of local transport people actually use, plus a little budgeting practice.
//
// RULES THAT BIND THIS FILE:
//  • Rule 1 — all this content lives HERE, never inline in a component.
//  • Rule 2 — the hubs are real airports at real coordinates; a transport mode is
//    only ever OFFERED where it genuinely exists (a gondola only in Venice, a camel
//    only at a desert site). Prices are deliberately ABSTRACT (a time↔money
//    tradeoff, not a real fare we'd have to source and keep current).
//  • Rule 3 — money reads dollars first, local currency in parentheses (like the
//    imperial-first rule). Exchange rates drift, so each carries an `asOf` year.
//
// Coordinates use the game's map space (x = lon + 180, y = 90 − lat), same as the
// relief plate and the landmark pins.
// ===========================================================================

const at = (lat, lon) => ({ lat, lon, x: lon + 180, y: 90 - lat });

// ---- Regional hub airports -------------------------------------------------
// A few real major hubs per continent, spread out, so the player learns to pick
// the one nearest their destination. `code` is the IATA code (shown as flavour).
export const HUBS = {
  "North America": [
    { code: "ATL", name: "Atlanta", country: "United States", ...at(33.64, -84.43) },
    { code: "LAX", name: "Los Angeles", country: "United States", ...at(33.94, -118.41) },
    { code: "ORD", name: "Chicago", country: "United States", ...at(41.98, -87.90) },
    { code: "YYZ", name: "Toronto", country: "Canada", ...at(43.68, -79.63) },
    { code: "MEX", name: "Mexico City", country: "Mexico", ...at(19.44, -99.07) },
  ],
  "South America": [
    { code: "GRU", name: "São Paulo", country: "Brazil", ...at(-23.43, -46.47) },
    { code: "BOG", name: "Bogotá", country: "Colombia", ...at(4.70, -74.15) },
    { code: "LIM", name: "Lima", country: "Peru", ...at(-12.02, -77.11) },
    { code: "EZE", name: "Buenos Aires", country: "Argentina", ...at(-34.82, -58.54) },
    { code: "SCL", name: "Santiago", country: "Chile", ...at(-33.39, -70.79) },
  ],
  "Europe": [
    { code: "LHR", name: "London", country: "United Kingdom", ...at(51.47, -0.45) },
    { code: "CDG", name: "Paris", country: "France", ...at(49.01, 2.55) },
    { code: "FRA", name: "Frankfurt", country: "Germany", ...at(50.03, 8.56) },
    { code: "MAD", name: "Madrid", country: "Spain", ...at(40.47, -3.56) },
    { code: "IST", name: "Istanbul", country: "Turkey", ...at(41.28, 28.75) },
  ],
  "Africa": [
    { code: "CAI", name: "Cairo", country: "Egypt", ...at(30.11, 31.41) },
    { code: "CMN", name: "Casablanca", country: "Morocco", ...at(33.37, -7.59) },
    { code: "NBO", name: "Nairobi", country: "Kenya", ...at(-1.32, 36.93) },
    { code: "JNB", name: "Johannesburg", country: "South Africa", ...at(-26.14, 28.24) },
    { code: "ADD", name: "Addis Ababa", country: "Ethiopia", ...at(8.98, 38.80) },
  ],
  "Asia": [
    { code: "DXB", name: "Dubai", country: "United Arab Emirates", ...at(25.25, 55.36) },
    { code: "DEL", name: "Delhi", country: "India", ...at(28.56, 77.10) },
    { code: "BKK", name: "Bangkok", country: "Thailand", ...at(13.69, 100.75) },
    { code: "SIN", name: "Singapore", country: "Singapore", ...at(1.36, 103.99) },
    { code: "HKG", name: "Hong Kong", country: "China", ...at(22.31, 113.91) },
    { code: "HND", name: "Tokyo", country: "Japan", ...at(35.55, 139.78) },
  ],
  "Oceania": [
    { code: "SYD", name: "Sydney", country: "Australia", ...at(-33.95, 151.18) },
    { code: "PER", name: "Perth", country: "Australia", ...at(-31.94, 115.97) },
    { code: "AKL", name: "Auckland", country: "New Zealand", ...at(-37.01, 174.79) },
    { code: "NAN", name: "Nadi", country: "Fiji", ...at(-17.76, 177.44) },
  ],
  // Antarctica has no commercial hub — the travel-modes layer skips it (you're
  // flown in by expedition, as the game already treats it).
};

// ---- Last-leg transport modes ---------------------------------------------
// `speed`/`cost` are RELATIVE 1–3 (1 = slow/cheap, 3 = fast/pricey). `contexts`
// are the situations a mode fits; a mode is only ever offered where its context
// matches the destination (see transportOptionsFor). `core` modes work almost
// anywhere on land and are the always-available fallback.
export const TRANSPORT_MODES = [
  { id: "flight",   name: "Domestic flight", emoji: "🛩️", speed: 3, cost: 3, contexts: ["far"], blurb: "Quickest, but the priciest way to close a long gap." },
  { id: "train",    name: "Train",           emoji: "🚆", speed: 2, cost: 2, core: true, blurb: "A steady, comfortable ride across the land." },
  { id: "bus",      name: "Bus",             emoji: "🚌", speed: 1, cost: 1, core: true, blurb: "The slow, cheap way — and you see the countryside." },
  { id: "taxi",     name: "Taxi",            emoji: "🚕", speed: 3, cost: 3, contexts: ["near"], blurb: "Door to door and fast, for a short, pricey hop." },
  { id: "ferry",    name: "Ferry",           emoji: "⛴️", speed: 2, cost: 2, contexts: ["water", "island"], blurb: "Across the water by boat." },
  { id: "riverboat",name: "Riverboat",       emoji: "🛥️", speed: 1, cost: 2, contexts: ["river"], blurb: "Up the river — sometimes the only road there is." },
  { id: "canoe",    name: "Dugout canoe",    emoji: "🛶", speed: 1, cost: 1, contexts: ["dugout"], blurb: "Paddled the last stretch, the old way." },
  { id: "gondola",  name: "Gondola",         emoji: "🛶", speed: 1, cost: 3, contexts: ["venice"], blurb: "Poled through the canals — only in Venice." },
  { id: "cablecar", name: "Cable car",       emoji: "🚠", speed: 2, cost: 2, contexts: ["cablecar"], blurb: "Swung up the mountainside by cable." },
  { id: "cograil",  name: "Cog railway",     emoji: "🚞", speed: 1, cost: 2, contexts: ["cograil"], blurb: "A toothed rail that grips the steep track." },
  { id: "tuktuk",   name: "Tuk-tuk",         emoji: "🛺", speed: 2, cost: 1, contexts: ["southasia", "seasia"], blurb: "A little three-wheeler — cheap and everywhere." },
  { id: "camel",    name: "Camel",           emoji: "🐪", speed: 1, cost: 1, contexts: ["camelriding"], blurb: "The desert's own ship, one slow swaying step at a time." },
];
export const TRANSPORT_BY_ID = Object.fromEntries(TRANSPORT_MODES.map((m) => [m.id, m]));

// Which extra contexts a destination unlocks, beyond the always-there core modes.
// Driven by the landmark's category/tags/country so a mode is only shown where it
// truly fits (rule 2). `far`/`near` are added by the caller from the leg distance.
const SEASIA = new Set(["Thailand", "Vietnam", "Cambodia", "Myanmar", "Malaysia", "Singapore", "Indonesia", "Philippines", "Laos"]);
const SOUTHASIA = new Set(["India", "Nepal", "Pakistan", "Sri Lanka", "Bangladesh"]);

// Where a camel is a real way to cross a desert. Dromedaries run across North
// Africa, the Middle East and East Africa; Bactrians across Mongolia and northern
// China; Australia has feral dromedaries, brought over in the 1800s and now the
// world's largest herd.
//
// Emphatically NOT the Americas: the Atacama and Uyuni have llamas, alpacas,
// vicuñas and guanacos, which are camelids but are not camels and are not ridden
// across deserts. And not Europe. The rule here used to be `category === "desert"`,
// which is how the game came to offer a camel at the Dune du Pilat outside
// Bordeaux, at White Sands in New Mexico, on the Uyuni salt flats — and, because
// they are honestly tagged as the driest desert on Earth, in the McMurdo Dry
// Valleys of Antarctica.
// Sources: en.wikipedia.org/wiki/Dromedary, /Bactrian_camel, /Australian_feral_camel,
// /Vicu%C3%B1a (checked 2026-07-16).
const CAMEL_COUNTRIES = new Set([
  // North Africa (dromedary)
  "Morocco", "Algeria", "Tunisia", "Libya", "Egypt", "Sudan", "Mauritania", "Mali", "Niger", "Chad",
  // East Africa (dromedary — the largest populations on Earth)
  "Somalia", "Ethiopia", "Kenya", "Djibouti", "Eritrea",
  // Middle East (dromedary)
  "Saudi Arabia", "United Arab Emirates", "Oman", "Yemen", "Jordan", "Israel", "Iraq", "Iran", "Syria",
  // South & Central Asia (dromedary, then Bactrian further north)
  "India", "Pakistan", "Afghanistan", "Turkmenistan", "Uzbekistan", "Kazakhstan",
  // Bactrian country
  "Mongolia", "China",
  // Introduced, and thriving
  "Australia",
]);

// Mountains that genuinely have one, listed explicitly rather than derived from the
// mountain category — because most mountains have neither. The old rule offered a
// cable car up Denali, Aconcagua, Everest, K2, Mount Vinson and Kilimanjaro, none of
// which has one. (Kilimanjaro's was announced in 2019, met heavy opposition from the
// guiding industry, and was never built. Fuji's ropeway climbs Mount Tenjo, which
// faces Fuji — it does not go up Fuji.)
//
// An id missing here means the mode simply isn't offered, which is the safe default:
// add one only once you have checked it, and note what you checked (rule 2).
const CABLECAR_PLACES = new Set([
  "capetown",   // Table Mountain Aerial Cableway, running since 1929
  "matterhorn", // Matterhorn Glacier Paradise, Zermatt — Europe's highest mountain station
  "montblanc",  // Aiguille du Midi from Chamonix — the world's highest vertical ascent
  "zugspitze",  // Seilbahn Zugspitze, opened 2017
  "huangshan",  // the Yellow Mountains carry four separate cableways
]);
const COGRAIL_PLACES = new Set([
  "matterhorn", // Gornergrat Railway — Europe's highest open-air cog railway
  "zugspitze",  // Bayerische Zugspitzbahn, running since 1930
  "rio",        // the Corcovado Rack Railway up to Christ the Redeemer, running since 1884
]);

// Where a DUGOUT is the boat you'd actually be in — a hollowed log, paddled or
// poled. Not simply "a river": the Douro has rabelo boats and cruise decks, and the
// Verdon has kayaks, so keying this off the river tag put a dugout in Portugal and
// France. It is a tropical-basin craft, so it gets its own short list.
// Sources: en.wikipedia.org/wiki/Mokoro (checked 2026-07-16).
const DUGOUT_PLACES = new Set([
  "okavango",      // the mokoro — a dugout poled from the stern, the delta's own boat
  "amazon",        // dugouts are daily working transport on the river and its tributaries
  "canocristales", // reached through the Macarena by river, in the Orinoco basin
]);

export function destinationContexts(loc) {
  const c = new Set();
  const cat = loc.category, tags = loc.tags || [];
  if (["coast", "waterway"].includes(cat) || tags.includes("island")) c.add("water");
  if (tags.includes("island")) c.add("island");
  // A riverboat needs a destination that IS a river — both halves matter. The
  // category alone ("waterway" is Rivers *and Lakes*) put a riverboat on the Dead
  // Sea; the tag alone put one at Taroko Gorge and at Dunn's River Falls, where the
  // `river` tag only means a river runs through it and you arrive on foot. Every
  // waterway now carries `river`, `lake` or `canal`, so the pair is exact.
  if (cat === "waterway" && tags.includes("river")) c.add("river");
  if (DUGOUT_PLACES.has(loc.id)) c.add("dugout");
  if (cat === "desert" && CAMEL_COUNTRIES.has(loc.country)) c.add("camelriding");
  if (CABLECAR_PLACES.has(loc.id)) c.add("cablecar");
  if (COGRAIL_PLACES.has(loc.id)) c.add("cograil");
  if (loc.city === "Venice" || loc.subject === "Venice's Grand Canal") c.add("venice");
  if (SEASIA.has(loc.country)) c.add("seasia");
  if (SOUTHASIA.has(loc.country)) c.add("southasia");
  return c;
}

// ---- Currencies ------------------------------------------------------------
// name + symbol + ISO code are stable; `perUsd` is an APPROXIMATE rate that drifts,
// so it carries `asOf` and the game shows "(as of YYYY)". Eurozone and a few shared
// currencies cover many countries at once; everything else falls back to USD.
export const CURRENCY_AS_OF = 2026;
export const CURRENCIES = {
  USD: { name: "US dollar", symbol: "$", perUsd: 1 },
  EUR: { name: "euro", symbol: "€", perUsd: 0.92 },
  GBP: { name: "British pound", symbol: "£", perUsd: 0.79 },
  JPY: { name: "Japanese yen", symbol: "¥", perUsd: 150 },
  CNY: { name: "Chinese yuan", symbol: "¥", perUsd: 7.2 },
  INR: { name: "Indian rupee", symbol: "₹", perUsd: 83 },
  THB: { name: "Thai baht", symbol: "฿", perUsd: 36 },
  AED: { name: "UAE dirham", symbol: "د.إ", perUsd: 3.67 },
  BRL: { name: "Brazilian real", symbol: "R$", perUsd: 5.0 },
  MXN: { name: "Mexican peso", symbol: "$", perUsd: 18 },
  CAD: { name: "Canadian dollar", symbol: "$", perUsd: 1.36 },
  AUD: { name: "Australian dollar", symbol: "$", perUsd: 1.52 },
  NZD: { name: "New Zealand dollar", symbol: "$", perUsd: 1.65 },
  ZAR: { name: "South African rand", symbol: "R", perUsd: 18.5 },
  EGP: { name: "Egyptian pound", symbol: "£", perUsd: 48 },
  MAD: { name: "Moroccan dirham", symbol: "DH", perUsd: 10 },
  KES: { name: "Kenyan shilling", symbol: "KSh", perUsd: 130 },
  TRY: { name: "Turkish lira", symbol: "₺", perUsd: 32 },
  RUB: { name: "Russian ruble", symbol: "₽", perUsd: 92 },
  PEN: { name: "Peruvian sol", symbol: "S/", perUsd: 3.7 },
  ARS: { name: "Argentine peso", symbol: "$", perUsd: 950 },
  CLP: { name: "Chilean peso", symbol: "$", perUsd: 950 },
  COP: { name: "Colombian peso", symbol: "$", perUsd: 4000 },
  CHF: { name: "Swiss franc", symbol: "Fr", perUsd: 0.88 },
  ISK: { name: "Icelandic króna", symbol: "kr", perUsd: 138 },
  NOK: { name: "Norwegian krone", symbol: "kr", perUsd: 10.7 },
  IDR: { name: "Indonesian rupiah", symbol: "Rp", perUsd: 16000 },
  VND: { name: "Vietnamese đồng", symbol: "₫", perUsd: 25000 },
  KRW: { name: "South Korean won", symbol: "₩", perUsd: 1350 },
};

// ---- Pegged currencies -----------------------------------------------------
// Unlike the rates above, these do not float: each is fixed to an anchor by treaty
// or central-bank policy, so the PARITY is a durable fact even though the anchor's
// own dollar rate drifts. They are therefore DERIVED from their anchor rather than
// frozen as a second approximation — refresh `EUR` above and every euro-pegged
// currency follows for free, still exactly 655.957 to the euro.
//
// Sources (checked 2026-07-16, rule 2). Every parity below has held for decades:
//   XOF/XAF  655.957 per EUR, fixed since 1 Jan 1999, guaranteed by the French
//            Treasury — en.wikipedia.org/wiki/CFA_franc
//   XPF      119.3317 per EUR, fixed since 1 Jan 1999 — en.wikipedia.org/wiki/CFP_franc
//   DKK      7.46038 per EUR, the ERM II central rate since 1 Jan 1999 (±2.25%
//            band, so this is a central rate rather than a hard peg)
//   SAR      3.75 per USD since June 1986
//   JOD      0.709 per USD since 23 Oct 1995
//   BZD      2.00 per USD since 1978
//   NAD      1:1 with the rand (Common Monetary Area); the rand is also legal
//            tender in Namibia
const PEGGED = {
  XOF: { name: "West African CFA franc",   symbol: "CFA",  per: 655.957,  of: "EUR" },
  XAF: { name: "Central African CFA franc", symbol: "FCFA", per: 655.957,  of: "EUR" },
  XPF: { name: "CFP franc",                symbol: "F",    per: 119.3317, of: "EUR" },
  DKK: { name: "Danish krone",             symbol: "kr",   per: 7.46038,  of: "EUR" },
  SAR: { name: "Saudi riyal",              symbol: "SR",   per: 3.75,     of: "USD" },
  JOD: { name: "Jordanian dinar",          symbol: "JD",   per: 0.709,    of: "USD" },
  BZD: { name: "Belize dollar",            symbol: "BZ$",  per: 2,        of: "USD" },
  NAD: { name: "Namibian dollar",          symbol: "N$",   per: 1,        of: "ZAR" },
};
for (const [code, p] of Object.entries(PEGGED)) {
  CURRENCIES[code] = { name: p.name, symbol: p.symbol, perUsd: p.per * CURRENCIES[p.of].perUsd, pegged: p.of };
}
// Country → currency code. Anything not listed falls back to USD for the display.
export const COUNTRY_CURRENCY = {
  "United States": "USD", "Canada": "CAD", "Mexico": "MXN",
  "United Kingdom": "GBP", "Japan": "JPY", "China": "CNY", "India": "INR",
  "Thailand": "THB", "United Arab Emirates": "AED", "Brazil": "BRL",
  "Australia": "AUD", "New Zealand": "NZD", "South Africa": "ZAR", "Egypt": "EGP",
  "Morocco": "MAD", "Kenya": "KES", "Turkey": "TRY", "Russia": "RUB",
  "Peru": "PEN", "Argentina": "ARS", "Chile": "CLP", "Colombia": "COP",
  "Switzerland": "CHF", "Iceland": "ISK", "Norway": "NOK", "Indonesia": "IDR",
  "Vietnam": "VND", "South Korea": "KRW",
  // Eurozone
  "France": "EUR", "Germany": "EUR", "Spain": "EUR", "Italy": "EUR",
  "Greece": "EUR", "Portugal": "EUR", "Netherlands": "EUR", "Austria": "EUR",
  "Ireland": "EUR", "Croatia": "EUR", "Belgium": "EUR", "Finland": "EUR",
  // Officially dollarized — the USD *is* the national currency, not a fallback.
  // Listed so it's clear we know, and so nobody "fixes" it by adding a sucre.
  "Ecuador": "USD",  // adopted 2000
  "Panama": "USD",   // adopted 1904; the balboa is pegged 1:1 and coins circulate
  // Pegged (see PEGGED above)
  "Denmark": "DKK", "Greenland": "DKK",
  "Benin": "XOF", "Côte d'Ivoire": "XOF", "Mali": "XOF", "Senegal": "XOF",
  "Cameroon": "XAF",
  "French Polynesia": "XPF", "New Caledonia": "XPF",
  "Saudi Arabia": "SAR", "Jordan": "JOD", "Belize": "BZD", "Namibia": "NAD",
};
export function currencyFor(country) {
  return CURRENCIES[COUNTRY_CURRENCY[country]] || CURRENCIES.USD;
}

// ---- Choosing the last-leg options ----------------------------------------
// Given a destination and how far the chosen hub is from it, return 2–3 transport
// choices with concrete TIME (days) and MONEY ($) costs, always spanning a real
// tradeoff (at least one cheap-and-slow and one fast-and-pricey). Only modes that
// genuinely fit the place are offered (rule 2). `legDeg` is the hub→landmark
// distance in degrees; costs scale with it.
// A tiny stable string hash (FNV-1a). Deliberately not rng.js: this must give the
// same answer for the same place on every device and every run, forever.
function idHash(id) {
  let h = 0x811c9dc5;
  for (let i = 0; i < String(id).length; i++) {
    h ^= String(id).charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export function transportOptionsFor(loc, legDeg) {
  const ctx = destinationContexts(loc);
  if (legDeg > 22) ctx.add("far"); else if (legDeg < 6) ctx.add("near");
  const fits = (m) => m.core || (m.contexts || []).some((k) => ctx.has(k));
  let pool = TRANSPORT_MODES.filter(fits);
  // Guarantee a real span: keep a cheapest and a fastest, then add one flavour mode.
  const cheap = pool.slice().sort((a, b) => a.cost - b.cost || a.speed - b.speed)[0];
  const fast = pool.slice().sort((a, b) => b.speed - a.speed || b.cost - a.cost)[0];
  // Which flavour depends on the PLACE, not on the order of TRANSPORT_MODES. Taking
  // the first match meant a river destination always drew the ferry — it fits both
  // `water` and `river` and is listed first — so the riverboat and the dugout canoe
  // could never be offered anywhere in the game. Hashing the id keeps each place's
  // choice fixed (the Amazon always offers its riverboat) without any randomness,
  // which matters: a `rnd()` here would make the Daily Expedition differ per player.
  const flavours = pool.filter((m) => !m.core && m !== cheap && m !== fast);
  const flavour = flavours.length ? flavours[idHash(loc.id) % flavours.length] : null;
  const chosen = [cheap, fast, flavour].filter((m, i, a) => m && a.indexOf(m) === i).slice(0, 3);
  // Concrete costs: money scales with distance × the mode's cost tier; time (in
  // half-days) shrinks with the mode's speed. Rounded to friendly numbers.
  const base = Math.max(1, Math.round(legDeg));
  return chosen.map((m) => ({
    ...m,
    usd: Math.max(10, Math.round((base * (2 + m.cost * 3)) / 10) * 10),
    days: Math.max(0.5, Math.min(2, Math.round((base / (12 + m.speed * 10)) * 2) / 2)),
  }));
}
// Format a dollar amount with the local currency in parentheses (rule 3 order).
export function money(usd, country) {
  const c = currencyFor(country);
  const local = usd * c.perUsd;
  const localTxt = local >= 1000 ? Math.round(local / 10) * 10 : Math.round(local);
  const dollars = `$${usd}`;
  if (c.symbol === "$" && c.perUsd === 1) return dollars; // home currency — no parenthetical
  // A word-like symbol needs air before the number ("CFA 72,420", "kr 824"); a
  // glyph doesn't ("€110", "฿4,320"). Without this "CFA72420" reads as one token,
  // which is exactly the wrong first impression of an unfamiliar currency.
  const gap = /[A-Za-z]$/.test(c.symbol) ? " " : "";
  return `${dollars} (${c.symbol}${gap}${localTxt.toLocaleString("en-US")} ${c.name})`;
}
