// Arrival music: does every tune actually play, and does any one of them carry
// so many countries that the world starts sounding the same?
//
// The second question is the one Joshua asked. Eight of the game's nineteen
// Muslim-majority countries shared a single "mideast" motif — Morocco through
// Sudan — and Turkey was on Iran's, which is a different tradition. A player
// hears that as "this game has one Arabic song".
import { describe, it, expect } from "vitest";
import { TUNES, tuneKeyFor } from "../src/data/tunes.js";
import { LOCATIONS } from "../src/data/locations.js";

// The same grammar src/audio.js parses. If a note doesn't match, noteFreq returns
// 0 and the note is SILENT — a typo like "Gb" written "G♭" would just quietly
// punch a hole in the melody.
const NOTE = /^([A-G])([#b]?)(-?\d)$/;
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midiOf = (n) => {
  const m = NOTE.exec(n);
  let s = SEMI[m[1]];
  if (m[2] === "#") s++;
  if (m[2] === "b") s--;
  return s + (parseInt(m[3], 10) + 1) * 12;
};

describe("arrival tunes", () => {
  it("every note parses the way the synth parses it", () => {
    const bad = [];
    for (const [key, tune] of Object.entries(TUNES))
      for (const [n] of tune.seq)
        if (n !== "r" && !NOTE.test(n)) bad.push(`${key}: "${n}"`);
    expect(bad, `notes the synth would render as silence:\n  ${bad.join("\n  ")}`).toEqual([]);
  });

  it("stays inside a range a small speaker can actually reproduce", () => {
    const bad = [];
    for (const [key, tune] of Object.entries(TUNES))
      for (const [n] of tune.seq) {
        if (n === "r") continue;
        const midi = midiOf(n);
        if (midi < 36 || midi > 96) bad.push(`${key}: "${n}" (midi ${midi})`);
      }
    expect(bad, `notes outside C2-C7:\n  ${bad.join("\n  ")}`).toEqual([]);
  });

  it("is one phrase long, not a whole song", () => {
    // The engine repeats each tune with a rest between (TUNE_PASSES), so an entry
    // here is ONE pass. A tune that ran long would still be playing when the child
    // has moved on.
    const bad = [];
    for (const [key, tune] of Object.entries(TUNES)) {
      const secs = tune.seq.reduce((a, [, d]) => a + d, 0) * tune.spb;
      if (secs < 4 || secs > 11) bad.push(`${key}: ${secs.toFixed(1)}s`);
    }
    expect(bad, `passes outside 4-11s:\n  ${bad.join("\n  ")}`).toEqual([]);
  });

  it("names a tune that exists for every country in the game", () => {
    const bad = [];
    for (const country of new Set(LOCATIONS.map((l) => l.country))) {
      const key = tuneKeyFor(country, LOCATIONS.find((l) => l.country === country).continent);
      if (!TUNES[key]) bad.push(`${country} -> "${key}", which is not a tune`);
    }
    expect(bad, bad.join("\n  ")).toEqual([]);
  });

  // The specific regression guard. These eight all played the same motif until
  // 2026-07-28 — Joshua heard it as "the Islamic countries all sound the same" —
  // and they now span the Levant, the Maghreb, the Gulf and the Nile. Listed by
  // name rather than by any grouping the codebase would otherwise have to hold an
  // opinion about.
  it("keeps the countries that used to share one motif spread across several", () => {
    const WAS_ONE_MOTIF = ["Morocco", "Algeria", "Tunisia", "Egypt", "Jordan",
      "Saudi Arabia", "United Arab Emirates", "Sudan"];
    const keys = new Set(WAS_ONE_MOTIF.map((c) => {
      const l = LOCATIONS.find((x) => x.country === c);
      return l && tuneKeyFor(c, l.continent);
    }).filter(Boolean));
    expect(keys.size, `these eight now share ${keys.size} motif(s): ${[...keys].join(", ")}`).toBeGreaterThanOrEqual(4);
  });

  // Turkey and Iran are related traditions, not the same one — Ottoman makam and
  // Persian dastgāh — and they shared a motif until the same pass.
  it("does not give Turkey and Iran the same tune", () => {
    const key = (c) => tuneKeyFor(c, LOCATIONS.find((x) => x.country === c).continent);
    expect(key("Turkey")).not.toBe(key("Iran"));
  });

  // The four that were next, split 2026-07-28 for the same reason. Each row is the
  // set of countries that shared ONE motif, and the number of motifs they must now
  // span. Written out by name, like the block above, so that moving a country between
  // beds is a decision someone has to make here rather than something that happens
  // quietly.
  it.each([
    ["South-East Asia", ["Thailand", "Cambodia", "Myanmar", "Vietnam", "Malaysia",
      "Singapore", "Indonesia", "Philippines"], 5],
    ["Oceania", ["New Zealand", "French Polynesia", "Fiji", "Vanuatu",
      "Papua New Guinea", "Solomon Is.", "New Caledonia", "Micronesia"], 4],
    ["South America", ["Brazil", "Argentina", "Uruguay", "Paraguay", "Colombia",
      "Venezuela", "Guyana"], 5],
    ["West Africa", ["Mali", "Senegal", "Ghana", "Côte d'Ivoire", "Nigeria", "Benin",
      "Cameroon"], 4],
    ["the northern Mediterranean", ["Greece", "Italy", "Spain", "Portugal", "Croatia",
      "Malta"], 5],
  ])("keeps %s spread across several motifs", (_region, countries, least) => {
    const keys = new Set(countries.map((c) => {
      const l = LOCATIONS.find((x) => x.country === c);
      expect(l, `${c} is not in the game any more — update this list`).toBeTruthy();
      return tuneKeyFor(c, l.continent);
    }));
    expect(keys.size, `these ${countries.length} share ${keys.size} motif(s): ${[...keys].join(", ")}`)
      .toBeGreaterThanOrEqual(least);
  });

  // The general version of Joshua's complaint. The ceiling was 8 while four motifs
  // were still at 7-8; those are split, and so is the Mediterranean that was next
  // after them. It comes down to 6, which is now `caribbean` alone — Cuba, Jamaica,
  // Haiti, Trinidad, Belize and Guyana on one steel-drum bed, when a Cuban tres, a
  // Haitian méringue and a Garifuna punta are four traditions and three languages.
  // That is the next one of these to do, and the last of the big ones.
  it("no single tune carries more of the world than today's worst", () => {
    const byTune = {};
    for (const country of new Set(LOCATIONS.map((l) => l.country))) {
      const key = tuneKeyFor(country, LOCATIONS.find((l) => l.country === country).continent);
      (byTune[key] = byTune[key] || []).push(country);
    }
    const hogs = Object.entries(byTune)
      .filter(([, cs]) => cs.length > 6)
      .map(([k, cs]) => `${k}: ${cs.length} countries (${cs.join(", ")})`);
    expect(hogs, `tunes carrying more than six countries:\n  ${hogs.join("\n  ")}`).toEqual([]);
  });
});
