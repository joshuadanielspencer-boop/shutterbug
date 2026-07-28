// ===========================================================================
// gen-voices.mjs — fetch a real human saying each country's name, from Wikimedia's
// Lingua Libre, and write them into public/voices/ + src/data/voices.js.
//
//   node scripts/gen-voices.mjs           # fetch anything missing
//   node scripts/gen-voices.mjs --force   # re-fetch everything
//
// WHY THIS EXISTS
// ---------------
// The game says each country's name aloud when you land there, and it was using
// the browser's speech synthesis to do it. On macOS that means Samantha, the
// pre-Siri voice, which is what a player heard and reasonably called atrocious.
// src/audio.js now at least picks the best voice a device HAS — but no code can
// conjure a good voice out of a machine that doesn't have one, and the device is
// exactly what we don't control.
//
// Lingua Libre is a Wikimedia project where volunteers record themselves saying
// single words. The audit that led here found:
//
//   • 104 of the game's 108 country names have an English recording, and 106 once
//     Czechia and Côte d'Ivoire are looked up under "Czech Republic" and
//     "Ivory Coast" — which is what a speaker would say anyway.
//   • ONE speaker, "Soundguys", has recorded 102 of them. That matters more than
//     the coverage number: 102 different volunteers announcing country names would
//     sound like a ransom note. Two more speakers fill the last gaps.
//   • Every Soundguys recording is CC0 — public domain, no attribution required.
//     (We credit anyway; see CREDITS in the generated file.)
//   • Commons already generates MP3 transcodes, so the ~110 KB WAVs come down as
//     ~25 KB MP3s and this script needs no encoder installed.
//
// Total: about 2.5 MB for the set, against the ~330 MB the PWA already precaches.
//
// WHAT IS NOT HERE
// ----------------
// The GREETINGS stay on speech synthesis. The same audit found only 16 of 79 with
// a recording in the RIGHT language — many more exist with the same spelling in
// some other language, and "Hola" read by a Polish speaker teaches a child the
// wrong sound, which is the whole thing we are trying to fix. 16 of 79 is not
// enough to be worth a pipeline, and half-and-half would be worse than either.
// ===========================================================================
import fs from "node:fs/promises";
import path from "node:path";
import { LOCATIONS } from "../src/data/locations.js";
import { displayCountry } from "../src/data/countries.js";

const UA = "ShutterbugGeographyGame/1.0 (https://github.com/joshuadanielspencer-boop/shutterbug; joshuadanielspencer@gmail.com)";
const OUT_DIR = path.join(process.cwd(), "public", "voices");
const OUT_DATA = path.join(process.cwd(), "src", "data", "voices.js");
const FORCE = process.argv.includes("--force");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// NOT `origin: "*"`. That puts the request in anonymous-CORS mode, which the search
// API rate-limits far harder — a first run of this script got 24 countries and then
// silently empty results for the remaining 84, which looked exactly like "these
// countries have no recording". They all do. Retries below distinguish the two: an
// empty `query` is treated as a throttle and retried, and only a genuinely empty
// SEARCH RESULT counts as absence.
const call = async (params) => {
  let lastErr = "";
  for (let t = 0; t < 5; t++) {
    try {
      const r = await fetch(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: "json", ...params })}`,
        { headers: { "User-Agent": UA } });
      if (r.ok) {
        const j = await r.json();
        if (j && !j.error && j.query) return j;
        lastErr = j?.error?.info || "no query in response";
      } else lastErr = `HTTP ${r.status}`;
    } catch (e) { lastErr = e.message; }
    await sleep(1500 * (t + 1));
  }
  throw new Error(`Commons: ${lastErr}`);
};

// "File:LL-Q1860 (eng)-Soundguys-Belgium.wav" → { speaker, word }
const parseTitle = (title) => {
  const m = title.match(/^File:LL-\S+ \([a-z]+\)-(.*)\.wav$/i);
  if (!m) return null;
  const rest = m[1], i = rest.indexOf("-");
  return i < 0 ? null : { speaker: rest.slice(0, i), word: rest.slice(i + 1) };
};

// Prefer one voice for the whole set, so the game doesn't sound like a relay of
// strangers. The rest are only reached where the first has nothing.
const SPEAKER_ORDER = ["Soundguys", "Boredcookie", "Pavani916", "Wodencafe", "PinkberryMoloko", "Saikrishna gangula"];

// Two countries whose recording lives under the name a speaker would actually say.
// Not a fudge: "Czech Republic" and "Ivory Coast" are what the words sound like,
// and the card still reads Czechia / Côte d'Ivoire.
const SPOKEN_AS = { "Czechia": "Czech Republic", "Côte d'Ivoire": "Ivory Coast" };

async function findRecording(country) {
  const said = SPOKEN_AS[country] || displayCountry(country);
  const j = await call({ action: "query", list: "search", srnamespace: "6",
    srsearch: `intitle:"LL-Q1860" intitle:"${said}"`, srlimit: "50" });
  const hits = (j?.query?.search || [])
    .map((s) => ({ title: s.title, ...(parseTitle(s.title) || {}) }))
    // intitle: is a prefix-ish match, so "France" also returns "French Guiana".
    // Compare the parsed WORD exactly or the wrong country gets announced.
    .filter((h) => h.word && h.word.trim().toLowerCase() === said.toLowerCase());
  if (!hits.length) return null;
  hits.sort((a, b) => {
    const ra = SPEAKER_ORDER.indexOf(a.speaker), rb = SPEAKER_ORDER.indexOf(b.speaker);
    return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
  });
  return { ...hits[0], said };
}

async function fileInfo(title) {
  const j = await call({ action: "query", prop: "imageinfo", iiprop: "url|size|extmetadata", titles: title });
  const p = Object.values(j?.query?.pages || {})[0];
  const ii = p?.imageinfo?.[0];
  if (!ii) return null;
  const strip = (h) => (h || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return {
    url: ii.url, size: ii.size,
    license: strip(ii.extmetadata?.LicenseShortName?.value) || "?",
    author: strip(ii.extmetadata?.Artist?.value) || "",
    // Commons auto-transcodes audio; the MP3 is ~1/5 the size and needs no encoder
    // here. The path is the original's, with /transcoded/ spliced in.
    mp3: `${ii.url.replace("/commons/", "/commons/transcoded/")}/${ii.url.split("/").pop()}.mp3`,
    page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  };
}

const slug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const countries = [...new Set(LOCATIONS.map((l) => l.country))].sort();
await fs.mkdir(OUT_DIR, { recursive: true });

const entries = [], missing = [];
let bytes = 0;
for (const country of countries) {
  const file = `${slug(country)}.mp3`;
  const dest = path.join(OUT_DIR, file);
  const already = !FORCE && await fs.stat(dest).then(() => true, () => false);

  // A thrown error here is a network or throttling problem, NOT an absent recording,
  // and must not be quietly written into the data as one. Stop instead.
  const rec = await findRecording(country);
  if (!rec) { missing.push(country); process.stdout.write("!"); await sleep(500); continue; }
  const info = await fileInfo(rec.title);
  if (!info) { missing.push(country); process.stdout.write("!"); await sleep(500); continue; }

  if (!already) {
    const r = await fetch(info.mp3, { headers: { "User-Agent": UA } });
    if (!r.ok) { missing.push(country); process.stdout.write("!"); await sleep(600); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    await fs.writeFile(dest, buf);
    bytes += buf.length;
  } else {
    bytes += (await fs.stat(dest)).size;
  }
  entries.push({ country, file, said: rec.said, speaker: rec.speaker, license: info.license, page: info.page });
  process.stdout.write(".");
  await sleep(650);
}
console.log("");

const byLicense = {};
for (const e of entries) byLicense[e.license] = (byLicense[e.license] || 0) + 1;
const speakers = [...new Set(entries.map((e) => e.speaker))];

const js = `// GENERATED by scripts/gen-voices.mjs — do not hand-edit.
//
// A real person saying each country's name, from Wikimedia's Lingua Libre. The
// browser's own speech synthesis is the fallback for anything not here (see
// speakCountry in src/audio.js), so a missing entry costs nothing but the voice.
//
// ${entries.length} of ${countries.length} countries covered${missing.length ? `; missing: ${missing.join(", ")}` : ""}.
// Licences: ${Object.entries(byLicense).map(([k, v]) => `${v} × ${k}`).join(", ")}.
// Speakers: ${speakers.join(", ")}.
//
// Two countries are recorded under the name a speaker actually says — Czechia as
// "Czech Republic", Côte d'Ivoire as "Ivory Coast". The card still reads the
// country's own name; only the audio differs.
export const COUNTRY_VOICE = {
${entries.map((e) => `  ${JSON.stringify(e.country)}: ${JSON.stringify(e.file)},`).join("\n")}
};

// Everything needed to credit these properly on the credits screen.
export const VOICE_CREDITS = {
  project: "Lingua Libre (Wikimedia)",
  speakers: ${JSON.stringify(speakers)},
  licenses: ${JSON.stringify(Object.keys(byLicense))},
  sources: {
${entries.map((e) => `    ${JSON.stringify(e.country)}: ${JSON.stringify(e.page)},`).join("\n")}
  },
};
`;
await fs.writeFile(OUT_DATA, js);

console.log(`\n${entries.length}/${countries.length} recorded — ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`licences: ${Object.entries(byLicense).map(([k, v]) => `${v} × ${k}`).join(", ")}`);
console.log(`speakers: ${speakers.join(", ")}`);
if (missing.length) console.log(`\nno recording found for: ${missing.join(", ")}`);
console.log(`\nwrote ${OUT_DATA}`);
