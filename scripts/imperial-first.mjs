// ===========================================================================
// imperial-first.mjs — one-off: rewrite metric-only measurements in the game's
// content as IMPERIAL first, with metric in parentheses.
//
//   "rising 3,776 metres"  ->  "rising 12,388 feet (3,776 m)"
//   "over 21,000 km"       ->  "over 13,050 miles (21,000 km)"
//
// The `fact` fields were already written that way; the clues and country blurbs
// weren't. Doing 156 conversions by hand is how you end up with one wrong number
// in a teaching tool, so the arithmetic is done here, once, from one formula —
// and `npm test` then refuses any future string that gives metric without an
// imperial equivalent.
//
// Precision: a plain figure converts exactly (rounded to the nearest whole unit,
// which is the house style — "330 m" was already written as "1,083 feet"). A
// HEDGED figure ("about 4,000 m") stays hedged: an exact-looking 13,123 would
// claim a precision the source never had, so it rounds to a comparable step.
//
// Run once:  node scripts/imperial-first.mjs [--dry]
// ===========================================================================
import { readFileSync, writeFileSync } from "node:fs";

const FILES = ["src/data/locations.js", "src/data/mr-o.js", "src/data/anecdotes.js", "src/data/countries.js"];

// metric unit -> [factor to imperial, imperial name (singular, plural), metric abbreviation]
// Singular spellings are listed as well as plural, and they are not decoration:
// a measurement used as a compound adjective is always singular ("a 508-meter
// tower"), and leaving them out is exactly how 25 metric-only figures survived
// the first pass through this script.
const UNITS = {
  "square kilometres": [0.386102, ["square mile", "square miles"], "sq km"],
  "square kilometers": [0.386102, ["square mile", "square miles"], "sq km"],
  "square km": [0.386102, ["square mile", "square miles"], "sq km"],
  "km²": [0.386102, ["square mile", "square miles"], "sq km"],
  "hectares": [2.47105, ["acre", "acres"], "hectares"],
  "hectare": [2.47105, ["acre", "acres"], "hectares"],
  "kilometres": [0.621371, ["mile", "miles"], "km"],
  "kilometers": [0.621371, ["mile", "miles"], "km"],
  "kilometre": [0.621371, ["mile", "miles"], "km"],
  "kilometer": [0.621371, ["mile", "miles"], "km"],
  "km": [0.621371, ["mile", "miles"], "km"],
  "centimetres": [0.393701, ["inch", "inches"], "cm"],
  "centimeters": [0.393701, ["inch", "inches"], "cm"],
  "centimetre": [0.393701, ["inch", "inches"], "cm"],
  "centimeter": [0.393701, ["inch", "inches"], "cm"],
  "cm": [0.393701, ["inch", "inches"], "cm"],
  "metres": [3.28084, ["foot", "feet"], "m"],
  "meters": [3.28084, ["foot", "feet"], "m"],
  "metre": [3.28084, ["foot", "feet"], "m"],
  "meter": [3.28084, ["foot", "feet"], "m"],
  "m": [3.28084, ["foot", "feet"], "m"],
  "tonnes": [1.10231, ["ton", "tons"], "tonnes"],
  "tonne": [1.10231, ["ton", "tons"], "tonnes"],
  "kilograms": [2.20462, ["pound", "pounds"], "kg"],
  "kilogram": [2.20462, ["pound", "pounds"], "kg"],
  "kg": [2.20462, ["pound", "pounds"], "kg"],
};
// Longest unit names first, so "square km" wins over "km" and "metres" over "m".
const UNIT_RE = Object.keys(UNITS).sort((a, b) => b.length - a.length)
  .map((u) => u.replace(/[²]/g, "\\u00b2")).join("|");

// Does the text already give an imperial figure? Then leave the line alone.
// `[\s-]?` is what makes this script safe to re-run: it now WRITES the
// hyphenated form ("a 1,083-foot tower"), and a guard that only recognised
// "1,083 feet" would fail to see its own output and convert the "(330 m)" it
// had just added, nesting a second conversion inside the first.
// `(?:square )?` matters as much as the hyphen: without it "about 31,700 square
// miles (82,000 square kilometers)" read as having NO imperial figure, and the
// script duly converted the parenthesised metric that was already the second
// half of a correct pair, producing "31,700 square miles (31,660 square miles
// (82,000 sq km))".
const HAS_IMPERIAL = /\b[\d][\d,.]*[\s-]?(?:square )?(?:miles?|feet|foot|ft|inches?|pounds?|lb|tons?|acres?)\b/i;
// Words that mark a figure as approximate — the imperial must stay approximate too.
const HEDGE = /\b(?:about|roughly|some|nearly|around|almost|over|more than|up to|under|~)\s*$/i;

const commas = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

// A hedged figure ("about 11 km") is already approximate, so its conversion must
// read as approximate too. Significant figures do that honestly: 6.84 becomes
// "6.8 miles", not "7 miles" (which throws away real information) and not
// "6.84 miles" (which claims precision the "about" already disclaimed).
const hedgedRound = (v) => {
  const sig = v < 100 ? 2 : 3;
  const step = Math.pow(10, Math.floor(Math.log10(v)) - (sig - 1));
  const r = Math.round(v / step) * step;
  return v < 10 ? Math.round(r * 10) / 10 : Math.round(r);
};

let changed = 0;
const report = [];
const articles = [];

for (const file of FILES) {
  const lines = readFileSync(file, "utf8").split("\n");
  const out = lines.map((line, i) => {
    // Only touch lines that give metric and NO imperial. (Everything already
    // written imperial-first is left exactly as the author wrote it.)
    if (HAS_IMPERIAL.test(line)) return line;
    // NEVER touch a line carrying a URL. "Belém" percent-encodes to "%C3%A9m",
    // whose "9m" reads as nine metres — this rewrote a photo link before the dry
    // run caught it. Measurements never appear in a URL, so skipping is free.
    if (/https?:|%[0-9A-Fa-f]{2}/.test(line)) return line;
    // Nor a source comment. These are notes TO US, not to the player, and one of
    // them explains that a length is quoted as "50 m, 91 m and 96 m" by
    // different sources and so is deliberately left out of the game — rewriting
    // it imperial-first turned a note about uncertainty into three assertions.
    if (/^\s*(?:\/\/|\*|\/\*)/.test(line)) return line;
    const re = new RegExp(`(\\d[\\d,]*(?:\\.\\d+)?)([\\s-]?)(${UNIT_RE})\\b`, "g");
    const next = line.replace(re, (whole, numStr, sep, unit, offset) => {
      const [factor, [one, many], abbr] = UNITS[unit.toLowerCase()] || UNITS[unit];
      const value = Number(numStr.replace(/,/g, ""));
      if (!isFinite(value) || value === 0) return whole;
      const hedged = HEDGE.test(line.slice(0, offset));
      const raw = value * factor;
      // Whole units are the house style, but only once there are enough of them
      // for a whole unit to be a small step: 2.7 km is 1.68 miles, and calling
      // that "2 miles" is a 19% error in a teaching tool. Below ten, keep the
      // tenth — the same threshold hedgedRound already uses, for the same reason.
      const exact = raw < 10 ? Math.round(raw * 10) / 10 : Math.round(raw);
      const imp = hedged ? hedgedRound(raw) : exact;
      // A hyphen means the measurement is a compound adjective, and English
      // makes those singular: "a 508-meter tower" becomes "a 1,667-foot tower",
      // never "a 1,667 feet tower".
      const res = sep === "-"
        ? `${commas(imp)}-${one} (${numStr} ${abbr})`
        : `${commas(imp)} ${imp === 1 ? one : many} (${numStr} ${abbr})`;
      // "an 800-kilometer circle" must become "a 497-mile circle". Whether the
      // new number takes "a" or "an" depends on how it is READ ALOUD ("eight
      // hundred" vs "four hundred"), which is more than this script should
      // pretend to know — so it flags the line for a human instead of guessing.
      if (/\ban\s$/i.test(line.slice(0, offset))) articles.push(`${file}:${i + 1}  "an ${whole}" -> "an ${res}" — check the article`);
      report.push(`${file}:${i + 1}  ${whole}  ->  ${res}`);
      changed++;
      return res;
    });
    return next;
  });
  if (!process.argv.includes("--dry")) writeFileSync(file, out.join("\n"));
}

for (const r of report) console.log(r);
if (articles.length) {
  console.log("\nCHECK BY HAND — the indefinite article may now be wrong:");
  for (const a of articles) console.log(`  ! ${a}`);
}
console.log(`\n${changed} measurement(s) rewritten imperial-first across ${FILES.length} files.`);
