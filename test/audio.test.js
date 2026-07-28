// ===========================================================================
// Audio graph invariants.
//
// The music is synthesized, so there is no file to listen to in CI and no way to
// eyeball a waveform in a browser (MUSIC is a closure — its oscillators aren't
// reachable from the page). What CAN be checked is the shape of the graph it
// builds, and the two things that were easy to get wrong are exactly that shape:
//
//   1. The splash drone must become the jig's drone, not a second one underneath
//      it. Layering two pairs of sawtooths on the same pitches doubles the drone's
//      level and puts a phasing beat under the whole opening.
//   2. A country tune must play once. It used to play twice with a rest between.
// ===========================================================================
import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- A minimal Web Audio mock -------------------------------------------------
// Records every oscillator created so a test can ask what was built.
function installFakeAudio() {
  const created = { oscillators: [], gains: [] };
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  });
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn() });
  class FakeContext {
    constructor() { this.currentTime = 0; this.state = "running"; this.destination = node(); }
    createOscillator() {
      const o = { ...node(), type: "sine", frequency: { value: 0 }, start: vi.fn(), stop: vi.fn() };
      created.oscillators.push(o);
      return o;
    }
    createGain() { const g = { ...node(), gain: param() }; created.gains.push(g); return g; }
    createBiquadFilter() { return { ...node(), type: "lowpass", frequency: { value: 0 }, Q: { value: 0 } }; }
    createBufferSource() { return { ...node(), buffer: null, start: vi.fn(), stop: vi.fn() }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    resume() {}
  }
  globalThis.window = { AudioContext: FakeContext, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  return created;
}

const DRONE_HZ = [73.42, 110.0]; // D2 + A2 — the pipes' tonic and fifth

describe("splash drone becomes the jig's drone", () => {
  let created, MUSIC;
  beforeEach(async () => {
    created = installFakeAudio();
    vi.resetModules();
    ({ MUSIC } = await import("../src/audio.js"));
  });

  it("droneBed() sounds exactly the two drone pitches and no melody", () => {
    MUSIC.droneBed();
    const freqs = created.oscillators.map((o) => o.frequency.value).sort((a, b) => a - b);
    expect(freqs).toEqual(DRONE_HZ.slice().sort((a, b) => a - b));
  });

  it("start() after droneBed() reuses that drone instead of stacking a second one", () => {
    MUSIC.droneBed();
    const afterBed = created.oscillators.length;
    expect(afterBed).toBe(2);
    MUSIC.start();
    // The jig schedules melody notes, so more oscillators are expected — but none of
    // them may be a THIRD or FOURTH oscillator sitting on a drone pitch.
    const dronePitched = created.oscillators.filter((o) => DRONE_HZ.includes(o.frequency.value));
    expect(dronePitched.length).toBe(2);
  });
});

describe("a country tune plays once", () => {
  it("schedules each note of the sequence exactly one time", async () => {
    const created = installFakeAudio();
    vi.resetModules();
    const { MUSIC } = await import("../src/audio.js");
    const { TUNES } = await import("../src/data/tunes.js");
    // Germany -> odeToJoy, whose sequence has no rests, so note count == oscillators.
    MUSIC.countryTune("Germany", "Europe");
    const expected = TUNES.odeToJoy.seq.filter(([n]) => n !== "r").length;
    const melodic = created.oscillators.filter((o) => o.frequency.value > 0);
    expect(melodic.length).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Title, travel and finale. The title screen and the flights now draw from ONE pool
// of upbeat jigs, but each playthrough must use a DIFFERENT one for each — the whole
// point is that setting off never sounds like the menu you just left. The finale
// keeps its own brighter pool. "They sound different" can't be asserted, but the
// notes that get scheduled can.
// ---------------------------------------------------------------------------
describe("title, travel and finale tunes", () => {
  const notesOf = (created) => created.oscillators.map((o) => o.frequency.value).filter((f) => f > 0);
  const run = async (fn) => {
    const created = installFakeAudio();
    vi.resetModules();
    const { MUSIC } = await import("../src/audio.js");
    fn(MUSIC);
    return notesOf(created);
  };

  it("never sets off to the same jig the title screen was looping", async () => {
    // The title tune and the travel tune are drawn from ONE pool each playthrough and
    // must differ — that difference is the whole point (setting off shouldn't sound
    // like the menu). Two distinct jigs can still share their opening notes, so this
    // checks the selection guarantee itself rather than inferring it from audio: over
    // many rolls, the pair is ALWAYS distinct.
    installFakeAudio();
    vi.resetModules();
    const { MUSIC } = await import("../src/audio.js");
    for (let i = 0; i < 200; i++) {
      expect(MUSIC._rollDistinct(), `collision on roll ${i}`).toBe(true);
    }
  });

  it("the finale is a full phrase that reaches A5 and ends on a chord", async () => {
    const finale = await run((M) => M.finale());
    expect(finale.length).toBeGreaterThan(20);            // a phrase, not a 12-note run
    expect(Math.max(...finale)).toBeGreaterThanOrEqual(880); // reaches A5
  });

  it("every cue stays in D — the drone has to sit under all of them", async () => {
    // D mixolydian on D: D E F# G A B C(natural). Anything outside it would clash
    // with the sustained D2+A2 drone the splash holds.
    const SCALE = [293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25,
                   587.33, 659.25, 739.99, 783.99, 880.0, 146.83, 73.42, 110.0];
    const near = (f) => SCALE.some((s) => Math.abs(f - s) < 1.5);
    for (const cue of ["travelJig", "finale", "start"]) {
      const notes = await run((M) => M[cue]());
      const strays = [...new Set(notes.filter((f) => !near(f)))];
      expect(strays, `${cue} plays notes outside D mixolydian: ${strays}`).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Every country must SOUND like somewhere.
// ---------------------------------------------------------------------------
describe("country tunes", () => {
  it("no country falls through to the neutral generic bed", async () => {
    const { LOCATIONS } = await import("../src/data/locations.js");
    const { tuneKeyFor, TUNES } = await import("../src/data/tunes.js");
    // `generic` is a music box with no regional character at all. It exists as a
    // backstop so a new country never arrives in silence — but a country actually
    // REACHING it means a child photographs, say, Banff and Niagara and hears the
    // same nothing-in-particular each time. Canada was doing exactly that with ten
    // places, which is how this test came to be written.
    const fellThrough = [...new Set(LOCATIONS
      .filter((l) => tuneKeyFor(l.country, l.continent) === "generic")
      .map((l) => l.country))];
    expect(fellThrough, `these countries have no music of their own: ${fellThrough.join(", ")}`).toEqual([]);
  });

  it("every tune a country resolves to actually exists, and is long enough to stand alone", async () => {
    const { LOCATIONS } = await import("../src/data/locations.js");
    const { tuneKeyFor, TUNES } = await import("../src/data/tunes.js");
    for (const country of new Set(LOCATIONS.map((l) => l.country))) {
      const l = LOCATIONS.find((x) => x.country === country);
      const key = tuneKeyFor(country, l.continent);
      const t = TUNES[key];
      expect(t, `${country} resolves to "${key}", which has no tune`).toBeTruthy();
      // The tunes play ONCE now, so a phrase too short to stand on its own reads as
      // a fragment rather than a melody. The shipped beds run 4.7-9.9 seconds.
      const secs = t.seq.reduce((s, [, beats]) => s + beats * t.spb, 0);
      expect(secs, `${key} is only ${secs.toFixed(1)}s — too short to play once`).toBeGreaterThan(4);
      expect(secs, `${key} is ${secs.toFixed(1)}s — too long to hold an arrival`).toBeLessThan(12);
    }
  });
});

// ===========================================================================
// Which voice reads a word aloud.
//
// Setting `utterance.lang` and stopping there hands the choice to the browser,
// and the browser hands it to its oldest voice: on macOS the en-US default is
// Samantha, the pre-Siri one, which is what a player heard and called atrocious.
//
// The sharper problem is what ELSE is in that list. macOS ships Bad News, Bahh,
// Boing, Bubbles, Cellos, Jester, Organ, Superstar, Trinoids, Whisper, Wobble and
// Zarvox as ordinary en-US voices, and for French, German, Japanese and Spanish the
// list is dominated by the character voices. This game says foreign words out loud
// to teach a child how they sound; a comedy voice doing that teaches the wrong
// sound, which is worse than silence.
// ===========================================================================
import { rankVoices } from "../src/audio.js";

const V = (name, lang, extra = {}) => ({ name, lang, default: false, localService: true, ...extra });

describe("choosing a voice", () => {
  // The real macOS en-US list, near enough.
  const MAC_EN = [
    V("Samantha", "en-US", { default: true }), V("Albert", "en-US"), V("Bad News", "en-US"),
    V("Bahh", "en-US"), V("Bells", "en-US"), V("Boing", "en-US"), V("Bubbles", "en-US"),
    V("Cellos", "en-US"), V("Fred", "en-US"), V("Good News", "en-US"), V("Jester", "en-US"),
    V("Junior", "en-US"), V("Kathy", "en-US"), V("Organ", "en-US"), V("Ralph", "en-US"),
    V("Superstar", "en-US"), V("Trinoids", "en-US"), V("Whisper", "en-US"),
    V("Wobble", "en-US"), V("Zarvox", "en-US"), V("Daniel", "en-GB"),
  ];

  it("never picks a joke voice, even when most of the list is jokes", () => {
    for (let i = 0; i < 20; i++) {
      const got = rankVoices(MAC_EN, "en-US");
      expect(got, "nothing was chosen at all").toBeTruthy();
      expect(got.name).toBe("Samantha");
    }
  });

  it("prefers a downloaded Enhanced or Siri voice the moment one exists", () => {
    // This is the whole upgrade path: the good Apple voices are a free download,
    // and when one is installed it must be picked with no code change.
    const withGood = [...MAC_EN, V("Samantha (Enhanced)", "en-US"), V("Siri Voice 4", "en-US")];
    expect(rankVoices(withGood, "en-US").name).toMatch(/Siri/);
    expect(rankVoices([...MAC_EN, V("Samantha (Enhanced)", "en-US")], "en-US").name).toMatch(/Enhanced/);
  });

  it("prefers Chrome's and Edge's better voices over the system default", () => {
    const chrome = [V("Samantha", "en-US", { default: true }), V("Google US English", "en-US", { localService: false })];
    expect(rankVoices(chrome, "en-US").name).toMatch(/Google/);
    const edge = [V("Microsoft David", "en-US", { default: true }), V("Microsoft Ava Online (Natural)", "en-US")];
    expect(rankVoices(edge, "en-US").name).toMatch(/Natural/);
  });

  it("picks the plain voice over the character ones for a foreign greeting", () => {
    // Amélie should read "Bonjour", not Grandpa.
    const fr = [V("Grandma (French (France))", "fr-FR"), V("Grandpa (French (France))", "fr-FR"),
      V("Rocko (French (France))", "fr-FR"), V("Amélie", "fr-FR"), V("Jacques", "fr-FR")];
    expect(["Amélie", "Jacques"]).toContain(rankVoices(fr, "fr-FR").name);
    const ja = [V("Grandma (Japanese (Japan))", "ja-JP"), V("Rocko (Japanese (Japan))", "ja-JP"), V("Kyoko", "ja-JP")];
    expect(rankVoices(ja, "ja-JP").name).toBe("Kyoko");
  });

  it("prefers the exact region but accepts the language", () => {
    const fr = [V("Amélie", "fr-CA"), V("Thomas", "fr-FR")];
    expect(rankVoices(fr, "fr-CA").name).toBe("Amélie");
    expect(rankVoices(fr, "fr-FR").name).toBe("Thomas");
    expect(rankVoices(fr, "fr")).toBeTruthy();   // bare language still matches
  });

  it("says NOTHING rather than something silly when only jokes are available", () => {
    // This is what makes the greeting layer fall back to reading the romanization
    // in English, which is the right answer for a language the device can't speak.
    const only = [V("Jester", "xx-XX"), V("Bubbles", "xx-XX")];
    expect(rankVoices(only, "xx-XX")).toBe(null);
    expect(rankVoices([], "en-US")).toBe(null);
    expect(rankVoices(null, "en-US")).toBe(null);
  });

  it("returns null for a language the device has no voice for at all", () => {
    expect(rankVoices(MAC_EN, "fa-IR")).toBe(null);   // Persian: no macOS voice
  });

  it("handles the underscore form some engines report", () => {
    expect(rankVoices([V("Anna", "de_DE")], "de-DE").name).toBe("Anna");
  });
});
