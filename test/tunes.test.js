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

  // The general version of Joshua's complaint. The ceiling is 8 rather than
  // something tighter because FOUR motifs are still at 7-8 and are the same problem
  // waiting to be done: southeastasia (8), tropical (8), latin (7), westafrica (7).
  // This holds the line at today's worst so it cannot quietly get worse, and should
  // be tightened as those are split.
  it("no single tune carries more of the world than today's worst", () => {
    const byTune = {};
    for (const country of new Set(LOCATIONS.map((l) => l.country))) {
      const key = tuneKeyFor(country, LOCATIONS.find((l) => l.country === country).continent);
      (byTune[key] = byTune[key] || []).push(country);
    }
    const hogs = Object.entries(byTune)
      .filter(([, cs]) => cs.length > 8)
      .map(([k, cs]) => `${k}: ${cs.length} countries (${cs.join(", ")})`);
    expect(hogs, `tunes carrying more than eight countries:\n  ${hogs.join("\n  ")}`).toEqual([]);
  });
});
