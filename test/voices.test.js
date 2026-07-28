// ===========================================================================
// The spoken country names.
//
// These are real people, from Wikimedia's Lingua Libre, fetched by
// scripts/gen-voices.mjs. Two things can go wrong silently and both are checked
// here, because neither shows up on screen — the failure is a sound that doesn't
// play, and a sound that doesn't play looks exactly like a sound you weren't
// listening for:
//
//   1. An entry naming a file that isn't in public/voices. The <audio> element's
//      error handler falls back to speech synthesis, so the game keeps working and
//      nobody finds out that a third of the recordings quietly stopped shipping.
//   2. An entry for a country the game doesn't have (a rename in locations.js),
//      or a file on disk that nothing points at — dead weight in the precache,
//      which is 2.3 MB of an installed app's budget.
// ===========================================================================
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LOCATIONS } from "../src/data/locations.js";
import { COUNTRY_VOICE, VOICE_CREDITS } from "../src/data/voices.js";

const DIR = path.join(process.cwd(), "public", "voices");
const onDisk = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".mp3")) : [];
const countries = new Set(LOCATIONS.map((l) => l.country));

describe("spoken country names", () => {
  it("every entry names a file that actually ships", () => {
    for (const [country, file] of Object.entries(COUNTRY_VOICE))
      expect(onDisk, `${country} → ${file} is missing from public/voices`).toContain(file);
  });

  it("every file that ships is pointed at by an entry", () => {
    const used = new Set(Object.values(COUNTRY_VOICE));
    for (const f of onDisk) expect(used, `public/voices/${f} is not referenced`).toContain(f);
  });

  it("every entry is a country the game actually visits", () => {
    for (const country of Object.keys(COUNTRY_VOICE))
      expect(countries, `"${country}" has a recording but no locations`).toContain(country);
  });

  it("covers nearly every country, and says which it doesn't", () => {
    // Not "all", because two genuinely have no recording on Lingua Libre yet
    // (French Polynesia, New Caledonia) and they fall back to synthesis. This is a
    // floor, so coverage can't quietly rot.
    const missing = [...countries].filter((c) => !COUNTRY_VOICE[c]);
    expect(missing.length, `missing: ${missing.join(", ")}`).toBeLessThanOrEqual(2);
    expect(Object.keys(COUNTRY_VOICE).length).toBeGreaterThanOrEqual(countries.size - 2);
  });

  it("no recording is suspiciously small", () => {
    // A truncated download is a file that exists, passes every check above, and
    // plays a fraction of a second of nothing.
    for (const [country, file] of Object.entries(COUNTRY_VOICE)) {
      const bytes = fs.statSync(path.join(DIR, file)).size;
      expect(bytes, `${country} (${file}) is only ${bytes} bytes`).toBeGreaterThan(4000);
    }
  });

  it("stays small enough to precache", () => {
    // These go in the service worker's precache, so they land on an installed iPad
    // at install time. Worth it for the game's voice; not worth it unbounded.
    const total = onDisk.reduce((a, f) => a + fs.statSync(path.join(DIR, f)).size, 0);
    expect(total / 1048576, `${(total / 1048576).toFixed(1)} MB of voice files`).toBeLessThan(6);
  });

  it("carries the credit the licences and the credits screen need", () => {
    expect(VOICE_CREDITS.project).toMatch(/Lingua Libre/);
    expect(VOICE_CREDITS.speakers.length).toBeGreaterThan(0);
    expect(VOICE_CREDITS.licenses.length).toBeGreaterThan(0);
    for (const country of Object.keys(COUNTRY_VOICE))
      expect(VOICE_CREDITS.sources[country], `${country} has no source link`).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
  });

  it("keeps one voice for the set, so arrivals don't sound like a relay", () => {
    // The whole reason the generator sorts by speaker. If this ever grows past a
    // handful, the set has been rebuilt without that preference.
    expect(VOICE_CREDITS.speakers.length).toBeLessThanOrEqual(3);
  });
});
