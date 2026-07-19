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
