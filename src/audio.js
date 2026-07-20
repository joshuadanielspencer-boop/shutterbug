// ===========================================================================
// AUDIO — synthesized sound effects, background music, and spoken greetings.
//
// All three are self-contained Web Audio / Web Speech engines: they ship no
// audio files, work offline, and never touch the game state or React. Moved out
// of the main component verbatim so the game logic reads cleanly; behavior is
// unchanged. Each guards every call so an audio hiccup can never break gameplay.
// ===========================================================================
import { TUNES, tuneKeyFor } from "./data/tunes.js";

export const SFX = (() => {
  let ctx = null;
  let master = null;
  const ac = () => {
    try {
      if (typeof window === "undefined") return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5; // one master level so overlapping sounds don't clip
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  };
  const noiseBuf = (c, dur) => {
    const n = Math.max(1, Math.floor(c.sampleRate * dur));
    const b = c.createBuffer(1, n, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };
  const burst = (c, t, dur, type, freq, peak) => {
    const src = c.createBufferSource();
    src.buffer = noiseBuf(c, dur);
    const f = c.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur);
    return { f, g };
  };
  const tone = (c, t, freq, dur, peak, type = "sine") => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  };
  const notes = (c, list, step, dur, peak, type) => {
    const t = c.currentTime;
    list.forEach((f, i) => tone(c, t + i * step, f, dur, peak, type));
  };
  // A tone with a pitch glide — the workhorse for anything that should feel alive.
  const slide = (c, t, f0, f1, dur, peak, type = "sine") => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  };
  // Every effect is wrapped so an audio hiccup can never break gameplay.
  // `muted` lives here rather than only in the component because the typing
  // components call type() straight from their per-character tick — threading a
  // sound flag through eleven call sites to reach them would be worse. The
  // component mirrors its Sound: On/Off toggle into setMuted().
  let muted = false;
  const safe = (fn) => { try { if (muted) return; const c = ac(); if (c) fn(c); } catch { /* ignore */ } };
  return {
    setMuted(v) { muted = !!v; },
    // Camera shutter: mirror-slap click, shutter close, then the soft rising
    // whirr of the film advance — the full "kerchunk-zzip" of an old SLR.
    shutter() { safe((c) => { const t = c.currentTime;
      burst(c, t, 0.03, "highpass", 2400, 0.34);
      burst(c, t + 0.045, 0.05, "highpass", 1400, 0.3);
      const { f } = burst(c, t + 0.12, 0.22, "bandpass", 900, 0.1);
      f.Q.value = 3; f.frequency.setValueAtTime(700, t + 0.12); f.frequency.linearRampToValueAtTime(1900, t + 0.34);
    }); },
    // Airplane: a low engine rumble under a swept jet whoosh that passes by.
    plane() { safe((c) => { const t = c.currentTime;
      const lo = burst(c, t, 0.9, "lowpass", 220, 0.1);
      lo.f.frequency.setValueAtTime(160, t); lo.f.frequency.linearRampToValueAtTime(90, t + 0.9);
      const { f } = burst(c, t, 0.85, "bandpass", 500, 0.12);
      f.Q.value = 0.9; f.frequency.setValueAtTime(320, t);
      f.frequency.linearRampToValueAtTime(1300, t + 0.4); f.frequency.linearRampToValueAtTime(380, t + 0.85);
    }); },
    // Correct shot: rising C–E–G chime with a bell-like octave shimmer on top.
    success() { safe((c) => { const t = c.currentTime;
      notes(c, [523.25, 659.25, 783.99], 0.085, 0.22, 0.28, "triangle");
      tone(c, t + 0.17, 1567.98, 0.3, 0.1, "sine");
    }); },
    // Trip complete: a four-note fanfare that lands on a held C-major chord.
    win() { safe((c) => { const t = c.currentTime;
      notes(c, [523.25, 659.25, 783.99, 1046.5], 0.11, 0.3, 0.3, "triangle");
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(c, t + 0.44, f, 0.7, 0.09, "sine"));
    }); },
    // Wrong subject: a soft two-note "wah-wah" slide — clearly wrong, never harsh.
    fail() { safe((c) => { const t = c.currentTime;
      slide(c, t, 220, 185, 0.2, 0.22, "sawtooth");
      slide(c, t + 0.16, 185, 140, 0.32, 0.2, "sawtooth");
    }); },
    // Out of days: slow sad descending minor line.
    lose() { safe((c) => notes(c, [440, 349.23, 261.63], 0.17, 0.42, 0.26, "sine")); },
    // Passport stamp / new record: a felt-pad THUNK, then the ink sparkle.
    stamp() { safe((c) => { const t = c.currentTime;
      slide(c, t, 180, 70, 0.14, 0.4, "sine");
      burst(c, t, 0.05, "lowpass", 400, 0.22);
      tone(c, t + 0.1, 1568, 0.12, 0.2, "triangle");
      tone(c, t + 0.17, 2093, 0.16, 0.18, "triangle");
    }); },
    // New badge: a bright bugle-style flourish, distinct from the stamp.
    badge() { safe((c) => { const t = c.currentTime;
      notes(c, [587.33, 587.33, 880], 0.09, 0.16, 0.26, "triangle");
      [880, 1108.73, 1318.51].forEach((f) => tone(c, t + 0.3, f, 0.55, 0.1, "sine"));
    }); },

    // ---- Texture: the small sounds under the whole game --------------------

    // One typebar hitting paper, for a letter appearing in Uncle's or Mr O's
    // speech. It has to be TINY: text reveals at ~42 characters a second, so this
    // fires more often than any other sound in the game and would become a buzz
    // saw at the volume of a click. A hair of pitch jitter keeps a long sentence
    // from sounding like one note held down. The caller throttles the rate.
    type() { safe((c) => { const t = c.currentTime;
      const b = burst(c, t, 0.016, "bandpass", 2000 + Math.random() * 900, 0.05);
      b.f.Q.value = 1.6;
      tone(c, t, 150 + Math.random() * 40, 0.02, 0.022, "square"); // the bar's thunk
    }); },

    // Mousing over something you can click. Quieter and shorter than the click it
    // precedes, and a fifth above it, so a hover followed by a click reads as one
    // gesture resolving rather than two competing noises.
    hover() { safe((c) => { const t = c.currentTime;
      tone(c, t, 1318.51, 0.055, 0.035, "sine");   // E6, a soft ping
      tone(c, t + 0.012, 1975.53, 0.04, 0.016, "sine"); // B6 shimmer on top
    }); },

    // A quiet wooden "thunk" under every button press — the soft knock of a
    // shutter button or a stamp on a desk. Deliberately understated: it plays on
    // EVERY click in the game, so it has to sit under the action, not announce it.
    // A short pitch-drop thump plus a whisper of felt (the noise burst).
    click() { safe((c) => { const t = c.currentTime;
      slide(c, t, 190, 96, 0.07, 0.11, "sine");     // the knock, pitch dropping
      burst(c, t, 0.03, "lowpass", 520, 0.05);      // a little felt on top
    }); },

    // Mr O arriving: a bright, comic "bwooop!" — a quick swoop up then a little
    // hop back down, like a cartoon pop-in. Announces him without being a fanfare.
    bwooop() { safe((c) => { const t = c.currentTime;
      slide(c, t, 300, 900, 0.16, 0.16, "triangle");        // the swoop up
      slide(c, t + 0.15, 900, 680, 0.12, 0.13, "triangle"); // the little hop down
      tone(c, t + 0.02, 1400, 0.1, 0.03, "sine");           // a touch of sparkle
    }); },

    // A PERFECT shot (filed first try): the happy `success` chime, but taken one
    // step further — a brighter, higher four-note run that lands on a sparkle, so a
    // bullseye sounds unmistakably better than a nice-after-a-miss shot.
    perfect() { safe((c) => { const t = c.currentTime;
      notes(c, [659.25, 830.61, 987.77, 1318.51], 0.075, 0.24, 0.28, "triangle"); // E5 G#5 B5 E6
      tone(c, t + 0.25, 1975.53, 0.35, 0.11, "sine");   // a bright bell on top
      tone(c, t + 0.25, 2637.02, 0.3, 0.05, "sine");    // and its shimmer
    }); },

    // Takeoff: engines spooling up and pitching away from you as the plane leaves.
    // `secs` is the map animation's scale-up time — the caller passes its own
    // PLANE_SCALE_MS so the sound is exactly as long as the picture it belongs to.
    // It used to be a 1.5 literal here and another one in the component, which is
    // two numbers that must agree and no way to notice when they stop agreeing.
    takeoff(secs = 2) { safe((c) => { const t = c.currentTime; const D = secs;
      const lo = burst(c, t, D, "lowpass", 200, 0.14);
      lo.f.frequency.setValueAtTime(70, t);
      lo.f.frequency.linearRampToValueAtTime(240, t + D);       // engines winding up
      // burst() schedules a short attack-and-decay of its own; clear it before
      // writing the long swell, or the two automations interleave into a stutter.
      lo.g.gain.cancelScheduledValues(t);
      lo.g.gain.setValueAtTime(0.0001, t);
      lo.g.gain.exponentialRampToValueAtTime(0.14, t + D * 0.55); // …and getting louder
      lo.g.gain.exponentialRampToValueAtTime(0.02, t + D);
      const { f } = burst(c, t, D, "bandpass", 600, 0.09);
      f.Q.value = 1.1;
      f.frequency.setValueAtTime(280, t);
      f.frequency.linearRampToValueAtTime(1500, t + D);          // the whoosh climbing away
    }); },

    // Landing: takeoff run backwards — the pitch falls and the engines throttle
    // back as the plane settles onto the map. "Backwards" is built from swapped
    // ramp endpoints rather than a reversed buffer: the source is white noise,
    // which is time-symmetric, so every bit of the direction you hear lives in the
    // filter and gain automation. Takes the same `secs` as takeoff().
    landing(secs = 2) { safe((c) => { const t = c.currentTime; const D = secs;
      const lo = burst(c, t, D, "lowpass", 200, 0.14);
      lo.f.frequency.setValueAtTime(240, t);
      lo.f.frequency.linearRampToValueAtTime(70, t + D);
      lo.g.gain.cancelScheduledValues(t);
      lo.g.gain.setValueAtTime(0.12, t);
      lo.g.gain.exponentialRampToValueAtTime(0.0001, t + D);
      const { f } = burst(c, t, D, "bandpass", 600, 0.09);
      f.Q.value = 1.1;
      f.frequency.setValueAtTime(1500, t);
      f.frequency.linearRampToValueAtTime(280, t + D);
    }); },
  };
})();

// ---- Background music (Web Audio): a Scottish jig ---------------------------
// A lilting 6/8 folk jig over a bagpipe-style drone (tonic + fifth), composed
// live by a look-ahead scheduler and looping a fixed melody in D Mixolydian
// (the natural-7th that gives Scottish and Irish tunes their color). Ships no
// audio files and works offline. It has its own context and mute toggle,
// separate from the sound effects. start() must be called from a user gesture
// (a click handler) to satisfy autoplay rules, especially on iPad Safari.
// finale() ends the loop and plays a short, jaunty flourish for the results.
export const MUSIC = (() => {
  // Three buses share one context: `master` is the overall level for everything;
  // `jigBus` carries ONLY the looping Scottish jig (drone + melody) so it can fade
  // out on its own when the player reaches the map; `countryBus` carries ONLY the
  // country-arrival tune, for the same reason — so leaving a country can silence
  // its music without touching anything else. Other one-shots (the travel jig, the
  // results flourish) play straight through `master`.
  //
  // countryBus exists because a Web Audio note, once scheduled, plays at its
  // appointed time no matter what: the notes are handed to the audio clock up
  // front, so there is no timer to cancel and nothing to call stop() on. The only
  // way to take back a sound you've already scheduled is to turn down a knob it is
  // routed through. That is this knob.
  //
  // It is built FRESH per arrival, and that's the whole trick — one long-lived
  // country bus cannot work. Silencing the old tune means ramping the bus to zero,
  // but the new tune needs that same bus open, and a bus can't be both. Give each
  // arrival its own knob and the two stop fighting: the outgoing tune fades out on
  // a bus nothing else is routed through, and is discarded.
  let ctx = null, master = null, jigBus = null, countryBus = null, timer = null, nextBeat = 0, running = false;
  let drone = []; // sustained bagpipe drone oscillators, torn down on stop()
  let countryActive = false; // is a country-arrival tune currently sounding?
  const ac = () => {
    try {
      if (typeof window === "undefined") return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.0001;
        jigBus = ctx.createGain();
        jigBus.gain.value = 0.0001;
        jigBus.connect(master);
        const soften = ctx.createBiquadFilter();
        soften.type = "lowpass"; soften.frequency.value = 2800; // rounds off the reedy edges
        master.connect(soften); soften.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch { return null; }
  };
  // D Mixolydian around the chanter's range. 0 = rest.
  const N = { D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.0, A4: 440.0, B4: 493.88,
    Cn5: 523.25, D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.0 };
  // ---- Multi-timbre voice (used by the country tunes + jig) ----
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const noteFreq = (name) => {
    if (!name || name === "r") return 0;
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 0;
    let s = SEMI[m[1]]; if (m[2] === "#") s++; if (m[2] === "b") s--;
    const midi = s + (parseInt(m[3], 10) + 1) * 12; // C4 = MIDI 60
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
  // timbre → oscillator + filter + envelope shape. `sustain` = organ/reed hold;
  // otherwise a plucked decay. `partial` adds a soft octave-ish overtone.
  const TIMBRE = {
    reed:    { osc: "sawtooth", lp: 2000, atk: 0.014, sustain: true },
    brass:   { osc: "sawtooth", lp: 1600, atk: 0.02, sustain: true },
    flute:   { osc: "sine", lp: 3000, atk: 0.05, sustain: true },
    koto:    { osc: "triangle", lp: 3200, atk: 0.005, partial: 2 },
    guitar:  { osc: "triangle", lp: 2600, atk: 0.006 },
    oud:     { osc: "sawtooth", lp: 1500, atk: 0.008 },
    sitar:   { osc: "sawtooth", lp: 2400, atk: 0.006, partial: 3 },
    steel:   { osc: "triangle", lp: 3600, atk: 0.003, partial: 2.4 },
    kalimba: { osc: "sine", lp: 2800, atk: 0.004, partial: 2 },
    pluck:   { osc: "triangle", lp: 2600, atk: 0.005 },
    uke:     { osc: "triangle", lp: 2800, atk: 0.006 },
    bell:    { osc: "sine", lp: 5000, atk: 0.004, partial: 2.4, long: true },
    music:   { osc: "sine", lp: 4000, atk: 0.004, partial: 2 },
  };
  const voice = (t, f, peak, dur, timbre, dest) => {
    const T = TIMBRE[timbre] || TIMBRE.music;
    const o = ctx.createOscillator(); o.type = T.osc; o.frequency.value = f;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = T.lp; lp.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + T.atk);
    const rel = T.long ? dur * 2.2 : dur;
    if (T.sustain) { g.gain.setValueAtTime(peak, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    else { g.gain.exponentialRampToValueAtTime(0.0001, t + rel); }
    o.connect(lp); lp.connect(g); g.connect(dest);
    o.start(t); o.stop(t + rel + 0.05);
    if (T.partial) {
      const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * T.partial;
      const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(peak * 0.2, t + T.atk);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.6);
      o2.connect(g2); g2.connect(dest); o2.start(t); o2.stop(t + dur * 0.7 + 0.05);
    }
  };
  // How many times a country tune plays through on one arrival, and the breath
  // between passes. Each tune in data is ONE phrase of a folk melody, which is
  // the honest unit to store — repeating a phrase is what folk music does, and it
  // keeps src/data/tunes.js a list of real melodies rather than a list of real
  // melodies typed three times (rule 1: the data file stays reviewable).
  //
  // The rest matters. Back-to-back passes with no gap don't read as "the tune
  // again", they read as a longer, stranger tune — the ear needs the phrase to
  // end before it can hear it start over.
  // ONE pass. The tunes used to be short phrases played twice with a rest between,
  // which is what you do when a phrase is too short to stand alone — and the fix for
  // that is a longer phrase, not a repeat. The sequences in src/data/tunes.js are now
  // full melodies, so a country is heard once, whole.
  const TUNE_PASSES = 1;
  const TUNE_REST_BEATS = 2;
  // Peak amplitude of one tune note into `master`. There is no limiter on this
  // context and `master` sits at 0.16, so a note lands at 0.45 * 0.16 ≈ 0.072 at
  // the destination — still decades of headroom even with the decay tails
  // overlapping. Raised from 0.28 (≈0.045) because the spoken country name is a
  // SpeechSynthesis utterance: it never passes through this graph, so no gain node
  // here can touch it, and at its default volume of 1.0 it was some 20 dB over the
  // music. The two had to be moved toward each other from both ends — see
  // SPEECH_VOLUME below for the other half.
  const TUNE_PEAK = 0.45;
  const DRONE_PEAK = 0.16;

  // Play a country/region tune (from src/data/tunes.js) onto the current
  // countryBus (see countryTune, which opens one). Falls back to `master` so a
  // stray caller still makes a sound — it just won't be silenceable.
  const playTune = (key) => {
    const t = TUNES[key] || TUNES.generic;
    const dest = countryBus || master;
    const start = ctx.currentTime + 0.06;
    let at = start;
    // The whole performance, so anything that has to span it can be told how long
    // it is. The drone below used to be a hardcoded 6.5s — fine when a tune was
    // one pass of roughly that length, silently wrong the moment it wasn't.
    const passSecs = t.seq.reduce((s, [, beats]) => s + beats * t.spb, 0);
    const totalSecs = TUNE_PASSES * passSecs + (TUNE_PASSES - 1) * TUNE_REST_BEATS * t.spb;
    if (key === "southasia") { // a low tonic drone under the sitar line
      for (const f of [146.83, 220.0]) voice(start, f, DRONE_PEAK, totalSecs, "reed", dest);
    }
    for (let pass = 0; pass < TUNE_PASSES; pass++) {
      if (pass) at += TUNE_REST_BEATS * t.spb;
      for (const [name, beats] of t.seq) {
        const dur = beats * t.spb;
        const f = noteFreq(name);
        if (f) voice(at, f, TUNE_PEAK, Math.max(0.12, dur * 0.95), t.timbre, dest);
        at += dur;
      }
    }
    return at - start;
  };
  // An original 8-bar jig phrase, six eighth-notes per bar (grouped 3+3). The
  // first note of each triplet group is accented, giving the jig its bounce.
  const MELODY = [
    N.D4, N.Fs4, N.A4,  N.D5, N.A4, N.Fs4,
    N.G4, N.B4, N.G4,   N.Fs4, N.A4, N.Fs4,
    N.E4, N.G4, N.B4,   N.A4, N.Fs4, N.D4,
    N.E4, N.Fs4, N.G4,  N.A4, 0, N.A4,
    N.B4, N.A4, N.G4,   N.Fs4, N.E4, N.Fs4,
    N.G4, N.Fs4, N.E4,  N.D4, N.E4, N.Fs4,
    N.A4, N.D5, N.Cn5,  N.B4, N.A4, N.G4,
    N.Fs4, N.E4, N.D4,  N.D4, 0, 0,
  ];
  // Four more 8-bar jig phrases in D (major/mixolydian) — same 3+3 lilt, each
  // ending on the tonic. One is chosen at random each time the opening plays.
  const MELODY_2 = [
    N.D4, N.A4, N.Fs4,  N.A4, N.D5, N.A4,
    N.B4, N.G4, N.E4,   N.G4, N.B4, N.G4,
    N.A4, N.Fs4, N.D4,  N.Fs4, N.A4, N.Fs4,
    N.G4, N.E4, N.Cn5,  N.B4, N.A4, N.G4,
    N.Fs4, N.A4, N.D5,  N.Cn5, N.B4, N.A4,
    N.B4, N.G4, N.E4,   N.Fs4, N.G4, N.A4,
    N.D5, N.Cn5, N.B4,  N.A4, N.G4, N.Fs4,
    N.E4, N.Fs4, N.G4,  N.D4, 0, 0,
  ];
  const MELODY_3 = [
    N.D4, N.E4, N.Fs4,  N.G4, N.A4, N.B4,
    N.A4, N.Fs4, N.D4,  N.E4, N.Fs4, N.G4,
    N.Fs4, N.G4, N.A4,  N.B4, N.Cn5, N.D5,
    N.B4, N.G4, N.E4,   N.Fs4, 0, N.A4,
    N.G4, N.Fs4, N.E4,  N.D4, N.E4, N.Fs4,
    N.A4, N.G4, N.Fs4,  N.G4, N.A4, N.B4,
    N.D5, N.B4, N.G4,   N.A4, N.Fs4, N.D4,
    N.E4, N.Fs4, N.E4,  N.D4, 0, 0,
  ];
  const MELODY_4 = [
    N.Fs4, N.A4, N.D5,  N.E5, N.D5, N.A4,
    N.B4, N.D5, N.B4,   N.A4, N.Fs4, N.A4,
    N.G4, N.B4, N.D5,   N.Cn5, N.A4, N.Fs4,
    N.G4, N.A4, N.B4,   N.A4, 0, N.Fs4,
    N.E5, N.D5, N.B4,   N.A4, N.G4, N.Fs4,
    N.A4, N.G4, N.Fs4,  N.E4, N.Fs4, N.G4,
    N.A4, N.D5, N.Cn5,  N.B4, N.A4, N.G4,
    N.Fs4, N.E4, N.D4,  N.D4, 0, 0,
  ];
  const MELODY_5 = [
    N.D4, N.Fs4, N.G4,  N.A4, N.Fs4, N.D4,
    N.E4, N.G4, N.A4,   N.B4, N.A4, N.G4,
    N.Fs4, N.A4, N.B4,  N.D5, N.B4, N.A4,
    N.G4, N.Fs4, N.E4,  N.Fs4, 0, N.A4,
    N.D5, N.B4, N.A4,   N.G4, N.Fs4, N.E4,
    N.Fs4, N.G4, N.A4,  N.B4, N.Cn5, N.D5,
    N.A4, N.Fs4, N.D4,  N.E4, N.Fs4, N.G4,
    N.A4, N.Fs4, N.E4,  N.D4, 0, 0,
  ];
  // ---- Travel: two jigs of their own -----------------------------------------
  // The flight used to reuse MELODY — the same tune as the splash — so setting off
  // sounded like the menu you had just left. These are still D mixolydian (the drone
  // and the country tunes have to sit under them), but they MOVE: long rising runs
  // and wider leaps instead of the opening's turn-around-the-tonic figures, so the
  // journey feels like going somewhere rather than waiting somewhere.
  const TRAVEL_1 = [
    N.D4, N.Fs4, N.A4,  N.D5, N.Fs5, N.D5,
    N.A4, N.D5, N.Fs5,  N.E5, N.D5, N.B4,
    N.G4, N.B4, N.D5,   N.G5, N.D5, N.B4,
    N.A4, N.B4, N.Cn5,  N.D5, 0, N.D5,
    N.E5, N.D5, N.B4,   N.A4, N.B4, N.G4,
    N.Fs4, N.A4, N.D5,  N.Cn5, N.A4, N.Fs4,
    N.G4, N.A4, N.B4,   N.Cn5, N.D5, N.E5,
    N.D5, N.A4, N.Fs4,  N.D4, 0, 0,
  ];
  const TRAVEL_2 = [
    N.A4, N.D5, N.A4,   N.Fs5, N.E5, N.D5,
    N.B4, N.E5, N.B4,   N.D5, N.Cn5, N.B4,
    N.A4, N.Fs4, N.A4,  N.D5, N.A4, N.Fs4,
    N.G4, N.B4, N.D5,   N.E5, 0, N.E5,
    N.Fs5, N.E5, N.D5,  N.B4, N.A4, N.G4,
    N.A4, N.B4, N.Cn5,  N.D5, N.E5, N.Fs5,
    N.E5, N.D5, N.B4,   N.A4, N.G4, N.Fs4,
    N.E4, N.Fs4, N.A4,  N.D4, 0, 0,
  ];
  // ---- Celebration: brighter, higher, and it lands UP --------------------------
  // The opening and travel jigs both fall back to a low D at the end, which reads as
  // "settled". These finish on the octave above, which reads as "won". Pitched a
  // register higher throughout so the finale is audibly the brightest thing in the
  // game rather than simply the same jig again at the end of a trip.
  const CELEBRATE_1 = [
    N.D5, N.A4, N.D5,   N.Fs5, N.A5, N.Fs5,
    N.E5, N.Fs5, N.G5,  N.Fs5, N.E5, N.D5,
    N.B4, N.D5, N.Fs5,  N.A5, N.Fs5, N.D5,
    N.E5, N.Fs5, N.G5,  N.A5, 0, N.A5,
    N.G5, N.Fs5, N.E5,  N.D5, N.E5, N.Fs5,
    N.A5, N.G5, N.Fs5,  N.E5, N.D5, N.B4,
    N.Cn5, N.D5, N.E5,  N.Fs5, N.G5, N.A5,
    N.Fs5, N.A5, N.Fs5, N.D5, 0, 0,
  ];
  const CELEBRATE_2 = [
    N.Fs5, N.E5, N.D5,  N.A4, N.D5, N.Fs5,
    N.G5, N.Fs5, N.E5,  N.D5, N.Cn5, N.B4,
    N.A4, N.D5, N.Fs5,  N.E5, N.D5, N.A4,
    N.B4, N.Cn5, N.D5,  N.Fs5, 0, N.Fs5,
    N.A5, N.Fs5, N.D5,  N.E5, N.Fs5, N.G5,
    N.Fs5, N.E5, N.D5,  N.B4, N.Cn5, N.D5,
    N.E5, N.Fs5, N.G5,  N.A5, N.G5, N.Fs5,
    N.D5, N.Fs5, N.A5,  N.D5, 0, 0,
  ];
  // Three pools, three moods. The opening set is the one you hear most, so it keeps
  // the largest share of phrases.
  const MELODIES = [MELODY, MELODY_2, MELODY_3, MELODY_4, MELODY_5];
  const TRAVEL_MELODIES = [TRAVEL_1, TRAVEL_2];
  const CELEBRATE_MELODIES = [CELEBRATE_1, CELEBRATE_2];
  const pickOne = (pool) => pool[Math.floor(Math.random() * pool.length)];
  let activeMelody = MELODY; // set at random on each fresh start()
  // A short reedy note — sawtooth through its own lowpass, quick attack and a
  // clipped tail so notes stay distinct at jig tempo. Chanter-like.
  const reed = (t, f, peak, dur) => {
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2000; lp.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.014);
    g.gain.exponentialRampToValueAtTime(peak * 0.6, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  };
  const EIGHTH = 0.148; // ~135 bpm dotted-quarter — a lively jig
  let idx = 0;
  const schedule = () => {
    try {
      if (!running || !ctx) return;
      const ahead = ctx.currentTime + 0.6;
      while (nextBeat < ahead) {
        const f = activeMelody[idx % activeMelody.length];
        const onDownbeat = (idx % 3) === 0;
        if (f) voice(nextBeat, f, (onDownbeat ? 0.13 : 0.09), onDownbeat ? EIGHTH * 1.1 : EIGHTH * 0.85, "reed", jigBus);
        idx += 1;
        nextBeat += EIGHTH;
      }
    } catch { /* music must never break gameplay */ }
  };
  const DRONE_FULL = 0.05;   // the drone's level under the jig melody
  const DRONE_BED = 0.032;   // quieter still on the splash, where it plays alone
  const startDrone = (t, peak = DRONE_FULL, rampSecs = 0.5) => {
    for (const f of [73.42, 110.0]) { // D2 + A2 — the pipe's tonic and fifth
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + rampSecs);
      o.connect(lp); lp.connect(g); g.connect(jigBus); o.start(t);
      drone.push({ o, g });
    }
  };
  // Bring an already-sounding drone up (or down) to a level over `secs`.
  const rampDrone = (peak, secs) => {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const d of drone) {
      d.g.gain.cancelScheduledValues(t);
      d.g.gain.setValueAtTime(Math.max(0.0001, d.g.gain.value), t);
      d.g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + secs);
    }
  };
  // How long the background music takes to fade out — a slow, unhurried 4-second
  // dissolve as you leave for the map, rather than a quick duck. A true wall-clock
  // linear ramp, because setTargetAtTime's exponential approach never actually
  // reaches zero and "4 seconds" would be a guess at its time-constant.
  const MUSIC_FADE_SECS = 4;
  const fadeOut = (param, secs = MUSIC_FADE_SECS) => {
    if (!ctx || !param) return;
    const t = ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(Math.max(0.0001, param.value), t);
    param.linearRampToValueAtTime(0.0001, t + secs);
  };
  const stopDrone = () => { const t = ctx ? ctx.currentTime : 0; for (const d of drone) { try { fadeOut(d.g.gain); d.o.stop(t + MUSIC_FADE_SECS + 0.2); } catch { /* ignore */ } } drone = []; };
  // Bring master up to the audible level (one-shots need it even when the jig
  // loop is faded out at the map).
  const wake = (c) => { master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(0.16, c.currentTime, 0.3); };
  return {
    // The SPLASH bed: the pipes' drone alone, no melody — the sound of a piper with
    // the bag filled, about to start. It is deliberately the same D2+A2 the jig's own
    // drone uses, because the jig is in D Mixolydian: when "Begin your adventure"
    // starts the melody over the top, the drone underneath simply swells and carries
    // on, so the two are the same piece of music rather than a cut between two.
    //
    // Web Audio cannot sound before a user gesture, so this may start silent; the
    // caller re-arms it on the first interaction (see startSplashDrone in the game).
    droneBed() {
      try {
        const c = ac(); if (!c) return;
        wake(c);
        jigBus.gain.cancelScheduledValues(c.currentTime);
        jigBus.gain.setValueAtTime(Math.max(0.0001, jigBus.gain.value), c.currentTime);
        jigBus.gain.linearRampToValueAtTime(1.0, c.currentTime + 2.0); // a slow swell in
        if (drone.length) { rampDrone(DRONE_BED, 1.5); return; }
        startDrone(c.currentTime + 0.05, DRONE_BED, 2.0);
      } catch { /* ignore */ }
    },
    // Start (or resume) the looping Scottish jig — splash + meet screens. On a
    // FRESH start one of the five jig phrases is picked at random; the bus fades
    // in over 1 second (and out over ~2s in fadeJig/stop).
    start() {
      try {
        const c = ac(); if (!c) return;
        wake(c);
        jigBus.gain.cancelScheduledValues(c.currentTime);
        jigBus.gain.setValueAtTime(Math.max(0.0001, jigBus.gain.value), c.currentTime);
        jigBus.gain.linearRampToValueAtTime(1.0, c.currentTime + 1.0); // 1s fade-in
        // A drone already sounding is the splash bed: swell it to full under the
        // melody rather than layering a second pair of oscillators on top of it.
        if (drone.length) rampDrone(DRONE_FULL, 0.8);
        if (running) return;
        running = true;
        // Chain THREE of the five phrases into one long set (~3× a single phrase),
        // so the opening jig — heard across several click-through screens — takes far
        // longer to come back around and never feels like a short loop. (Math.random
        // here is fine: this is audio, not the seeded game RNG.)
        const order = [...MELODIES].sort(() => Math.random() - 0.5).slice(0, 3);
        activeMelody = order.flat();
        idx = 0; // start the chosen set from its first bar
        nextBeat = Math.max(nextBeat, c.currentTime + 0.15);
        // Only if the splash bed isn't already holding one — otherwise the swell
        // above is joined by a second pair of sawtooths on the same two pitches,
        // which doubles the drone and puts a phasing beat under the opening.
        if (!drone.length) startDrone(c.currentTime + 0.1);
        if (!timer) timer = setInterval(schedule, 200);
        schedule();
      } catch { /* ignore */ }
    },
    // Fade the jig loop out (at the map) but keep the context + master alive so
    // the travel jig and country tunes can still play. A slow 4-second fade.
    fadeJig() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        stopDrone();
        if (jigBus) fadeOut(jigBus.gain);
      } catch { /* ignore */ }
    },
    // Full stop (leaving to the passport / music off): fade everything out over
    // 4 seconds rather than cutting abruptly.
    stop() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        this.stopCountry();
        stopDrone();
        if (jigBus) fadeOut(jigBus.gain);
        if (master) fadeOut(master.gain);
      } catch { /* ignore */ }
    },
    // Silence the country tune (leaving the country / the trip). Fades its bus
    // rather than cancelling anything, because by now every note is already on the
    // audio clock and will sound on schedule regardless — see the countryBus note
    // above. The fade is quick but not instant: snapping a sounding oscillator to
    // zero is a click. The bus is then let go of, and disconnected once the fade
    // has actually finished, so the notes still ringing through it have somewhere
    // to go until they're done.
    stopCountry() {
      countryActive = false;
      const bus = countryBus;
      countryBus = null;
      if (!ctx || !bus) return;
      try {
        const t = ctx.currentTime;
        const FADE = 0.18;
        bus.gain.cancelScheduledValues(t);
        bus.gain.setValueAtTime(bus.gain.value, t);
        bus.gain.linearRampToValueAtTime(0.0001, t + FADE);
        setTimeout(() => { try { bus.disconnect(); } catch { /* ignore */ } }, (FADE + 0.1) * 1000);
      } catch { /* ignore */ }
    },
    // Travel music over a flight: a lively jig that plays at full volume for the
    // whole 4-second flight, then keeps going for 2 more seconds as it fades to
    // silence — so the music carries you the whole way and eases out just after you
    // land, every flight. Routed through its own fade bus (independent of the
    // looping jig), so the fade never touches other one-shots.
    travelJig() {
      try {
        this.stopCountry(); // you're leaving the country — silence its tune
        const c = ac(); if (!c) return;
        wake(c);
        const t0 = c.currentTime + 0.04;
        // The tune outlasts the flight on purpose: the plane is down at 5s, and the
        // jig plays on over the first few seconds of the new continent before fading
        // away, so arriving feels like the end of a journey rather than a cut. Full
        // for 6s, then a 3s fade — 9s in total. Keep in step with FLIGHT_MS.
        const HOLD = 6.0, FADE = 3.0, TOTAL = HOLD + FADE;
        const fade = ctx.createGain();
        fade.gain.setValueAtTime(1, t0);
        fade.gain.setValueAtTime(1, t0 + HOLD);                      // hold full past touchdown
        fade.gain.linearRampToValueAtTime(0.0001, t0 + TOTAL);       // then fade out over 3s
        fade.connect(master);
        const n = Math.ceil(TOTAL / EIGHTH);
        // A TRAVEL tune, not the opening one. Flights used to reuse MELODY, so setting
        // off sounded like the menu you had just left. Re-picked every flight so a long
        // Grand Tour doesn't hear one tune a dozen times.
        const air = pickOne(TRAVEL_MELODIES);
        for (let i = 0; i < n; i++) {
          const f = air[i % air.length];
          if (f) voice(t0 + i * EIGHTH, f, i % 3 === 0 ? 0.12 : 0.085, EIGHTH * 0.95, "reed", fade);
        }
        // a light low pulse on the downbeats for lift
        for (let i = 0; i < n; i += 6) voice(t0 + i * EIGHTH, 146.83, 0.06, EIGHTH * 3, "reed", fade);
      } catch { /* ignore */ }
    },
    // The country's tune on arrival: TUNE_PASSES times through the melody, then
    // silence. Not a loop — it ends on its own and doesn't follow you around the
    // country map. Replaces any tune still sounding from a previous arrival.
    countryTune(country, continent) {
      try {
        const c = ac(); if (!c) return;   // before stopCountry: it needs ctx to fade
        this.stopCountry();               // fade out anything still sounding, and let its bus go
        wake(c);
        countryBus = c.createGain();      // a clean knob of our own for this arrival
        countryBus.gain.value = 1;
        countryBus.connect(master);
        countryActive = true;
        playTune(tuneKeyFor(country, continent));
      } catch { /* ignore */ }
    },
    // End-of-run flourish: stop the loop, then a brief celebratory jig run that
    // lands on a bright D-major chord. About 5 seconds, then silence.
    finale() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        this.stopCountry();
        stopDrone();
        const c = ac(); if (!c) return;
        wake(c);
        if (jigBus) jigBus.gain.setTargetAtTime(0.0001, c.currentTime, 0.2);
        const t0 = c.currentTime + 0.05;
        // A whole celebration jig, not a twelve-note flourish. Coming home having filed
        // the lot is the biggest moment in the game and it used to get about five
        // seconds; this plays a full 8-bar phrase from its own pool — pitched a register
        // above the opening and travel airs, so the finale is audibly the brightest
        // thing in the game — and lands on a ringing D-major chord an octave up.
        const tune = pickOne(CELEBRATE_MELODIES);
        // A shade quicker than the opening jig: celebration should feel like it's
        // running downhill.
        const STEP = EIGHTH * 0.94;
        tune.forEach((f, i) => {
          if (f) voice(t0 + i * STEP, f, i % 3 === 0 ? 0.14 : 0.1, STEP * 0.95, "reed", master);
        });
        // A low pulse on each bar's downbeat so it has some floor under it.
        for (let i = 0; i < tune.length; i += 6) voice(t0 + i * STEP, N.D4, 0.07, STEP * 3, "reed", master);
        const tc = t0 + tune.length * STEP;
        [N.D4, N.Fs4, N.A4, N.D5, N.Fs5].forEach((f) => voice(tc, f, 0.1, 2.1, "reed", master));
        master.gain.setTargetAtTime(0.0001, tc + 1.7, 0.5); // let it ring, then fade
      } catch { /* ignore */ }
    },
    // A short, slow, wistful Scottish air — played once when the traveler comes
    // home to Uncle's homecoming quiz. Gentle flute-like voice over a soft D
    // drone; nostalgic, not the lively jig. Ends by letting the last note ring.
    homecoming() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        this.stopCountry();
        stopDrone();
        const c = ac(); if (!c) return;
        wake(c);
        if (jigBus) jigBus.gain.setTargetAtTime(0.0001, c.currentTime, 0.3); // hush any jig loop
        const t0 = c.currentTime + 0.12;
        const beat = 0.52; // slow and tender
        // An original air in D major (public-domain idiom, not a quoted tune).
        const air = [
          ["A4", 1], ["D5", 1.5], ["A4", 0.5], ["G4", 1], ["F#4", 1],
          ["E4", 1], ["F#4", 1.5], ["D4", 0.5], ["E4", 1], ["D4", 2],
          ["F#4", 1], ["A4", 1.5], ["G4", 0.5], ["F#4", 1], ["E4", 1],
          ["D4", 1.5], ["E4", 0.5], ["F#4", 1], ["E4", 1], ["D4", 2.5],
        ];
        const total = air.reduce((s, [, b]) => s + b, 0) * beat;
        voice(t0, 146.83, 0.035, total + 1.2, "flute", master); // soft D drone under it
        let at = t0;
        for (const [name, b] of air) {
          const f = noteFreq(name);
          if (f) voice(at, f, 0.1, Math.max(0.22, b * beat * 0.95), "flute", master);
          at += b * beat;
        }
        master.gain.setTargetAtTime(0.0001, at + 0.7, 0.7); // let the last note ring, then rest
      } catch { /* music must never break gameplay */ }
    },
  };
})();

// ---- Spoken greetings (Web Speech API) — the browser says the greeting aloud in ----
// ---- the local language. No files, no network, no licensing. Maps each greeting  ----
// ---- language to a BCP-47 code so the browser picks a matching voice; languages  ----
// ---- without a code fall back to the default voice (still reads the Latin form).  ----
const SPEECH_LANG = {
  "Afrikaans": "af", "Amharic": "am", "Arabic": "ar", "Bengali": "bn", "Burmese": "my",
  "Cantonese": "zh-HK", "Hausa": "ha",
  "Croatian": "hr", "Czech": "cs", "Dutch": "nl", "English": "en", "English (Australian)": "en-AU",
  "Filipino": "fil", "French": "fr", "French (Québec)": "fr-CA", "German": "de",
  "German (Austrian)": "de-AT", "Greek": "el", "Hindi": "hi", "Icelandic": "is",
  "Indonesian": "id", "Italian": "it", "Japanese": "ja", "Khmer": "km", "Korean": "ko",
  "Malay": "ms", "Mandarin Chinese": "zh-CN", "Marathi": "mr", "Mongolian": "mn", "Māori": "mi",
  "Nepali": "ne", "Norwegian": "nb", "Persian": "fa", "Portuguese": "pt", "Punjabi": "pa",
  "Russian": "ru", "Sinhala": "si", "Spanish": "es", "Swahili": "sw", "Swiss German": "de-CH",
  "Tamil": "ta", "Telugu": "te", "Thai": "th", "Turkish": "tr",
  "Urdu": "ur", "Uzbek": "uz", "Vietnamese": "vi", "Xhosa": "xh",
  // Nigerian Pidgin has no BCP-47 voice in any browser; an English voice reads
  // "How far?" perfectly well, which is better than no sound at all.
  "Nigerian Pidgin": "en",
};
export const speechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;
// SpeechSynthesis output does not pass through the Web Audio graph, so none of the
// gain nodes above can duck it — its volume can only be set per-utterance, here. At
// the default 1.0 the announcement drowned the arrival music; this is the speech half
// of that rebalance (TUNE_PEAK above is the other half).
const SPEECH_VOLUME = 0.55;
// Build an utterance without touching the queue, so callers can decide whether this
// one interrupts what's speaking or follows it.
const utter = (text, opts = {}) => {
  const u = new SpeechSynthesisUtterance(String(text));
  u.lang = opts.lang || "en-US";
  u.rate = opts.rate ?? 0.95;
  if (opts.pitch != null) u.pitch = opts.pitch;
  u.volume = SPEECH_VOLUME;
  return u;
};
// Speak a short English announcement aloud ("France") — used on map arrivals.
// A nice-to-have; never breaks anything if speech is unavailable.
export function speakEn(text) {
  try {
    if (!speechAvailable || !text) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter(text, { pitch: 1.05 }));
  } catch { /* speech is optional */ }
}
function greetingUtterance(g) {
  // Speak the native-script form (before any "(romanization)"), a touch slowly.
  const native = String(g.text).split(" (")[0].trim();
  const code = SPEECH_LANG[g.language];
  return utter(native, { lang: code || "en-US", rate: 0.85 });
}
export function speakGreeting(g) {
  try {
    if (!speechAvailable || !g?.text) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(greetingUtterance(g));
  } catch { /* speech is a nice-to-have; never break gameplay */ }
}
// Arrival announcement: the country's name, a beat of silence, then hello in the
// local language. The pause is measured from when the NAME finishes rather than from
// when it starts — utterance length varies enormously ("Chad" against "the Democratic
// Republic of the Congo"), so a fixed timer would either overlap the name or leave a
// hole after it. Returns a cancel function; the caller must call it if the player
// leaves, or a queued greeting will speak over the next screen.
export function speakArrival(country, greeting, gapMs = 1000) {
  let timer = null, done = false;
  try {
    if (!speechAvailable) return () => {};
    window.speechSynthesis.cancel();
    const name = utter(country, { pitch: 1.05 });
    const sayHello = () => {
      if (done || !greeting?.text) return;
      try { window.speechSynthesis.speak(greetingUtterance(greeting)); } catch { /* optional */ }
    };
    // onend doesn't fire on every browser (and never fires if the utterance is
    // cancelled), so a timer backstops it — whichever lands first wins, and `done`
    // keeps the greeting from being spoken twice.
    name.onend = () => { if (!done) { clearTimeout(timer); timer = setTimeout(sayHello, gapMs); } };
    window.speechSynthesis.speak(name);
    timer = setTimeout(() => { name.onend = null; sayHello(); }, 4000 + gapMs);
  } catch { /* speech is optional */ }
  return () => { done = true; clearTimeout(timer); };
}
