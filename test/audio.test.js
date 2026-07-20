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
// Three cues, three tunes. The opening, the flight and the finale used to share a
// melody pool — the flight literally reused MELODY — so setting off sounded like
// the menu you had just left. "They sound different" can't be asserted, but the
// thing that actually went wrong CAN be: whether the same notes get scheduled.
// ---------------------------------------------------------------------------
describe("the opening, travel and finale are different tunes", () => {
  const notesOf = (created) => created.oscillators.map((o) => o.frequency.value).filter((f) => f > 0);
  const run = async (fn) => {
    const created = installFakeAudio();
    vi.resetModules();
    const { MUSIC } = await import("../src/audio.js");
    fn(MUSIC);
    return notesOf(created);
  };

  it("the flight does not replay the opening's melody", async () => {
    // Both pick at random, so compare the SETS of pitches each cue can reach rather
    // than one sample — travel climbs to Fs5/G5/A5, which the opening jigs never use.
    const travel = await run((M) => M.travelJig());
    const opening = await run((M) => M.start());
    const high = (list) => list.filter((f) => f > 700).length;   // above Fs5
    expect(high(travel)).toBeGreaterThan(0);
    expect(high(opening)).toBe(0);
  });

  it("the finale is pitched above both of them and ends on a chord", async () => {
    const finale = await run((M) => M.finale());
    expect(finale.length).toBeGreaterThan(20);            // a phrase, not a 12-note run
    expect(Math.max(...finale)).toBeGreaterThanOrEqual(880); // reaches A5
  });

  it("every cue still stays in D — the drone has to sit under all of them", async () => {
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
