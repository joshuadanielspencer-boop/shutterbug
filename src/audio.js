// ===========================================================================
// AUDIO — synthesized sound effects, background music, and spoken greetings.
//
// All three are self-contained Web Audio / Web Speech engines: they ship no
// audio files, work offline, and never touch the game state or React. Moved out
// of the main component verbatim so the game logic reads cleanly; behaviour is
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
  const safe = (fn) => { try { const c = ac(); if (c) fn(c); } catch { /* ignore */ } };
  return {
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
  };
})();

// ---- Background music (Web Audio): a Scottish jig ---------------------------
// A lilting 6/8 folk jig over a bagpipe-style drone (tonic + fifth), composed
// live by a look-ahead scheduler and looping a fixed melody in D Mixolydian
// (the natural-7th that gives Scottish and Irish tunes their colour). Ships no
// audio files and works offline. It has its own context and mute toggle,
// separate from the sound effects. start() must be called from a user gesture
// (a click handler) to satisfy autoplay rules, especially on iPad Safari.
// finale() ends the loop and plays a short, jaunty flourish for the results.
export const MUSIC = (() => {
  // Two buses share one context: `master` is the overall level for everything;
  // `jigBus` carries ONLY the looping Scottish jig (drone + melody) so it can
  // fade out on its own when the player reaches the map, while one-shots (the
  // 4-second travel jig, the country-arrival tunes, the results flourish) keep
  // playing through `master`.
  let ctx = null, master = null, jigBus = null, timer = null, nextBeat = 0, running = false;
  let drone = []; // sustained bagpipe drone oscillators, torn down on stop()
  let countryTimer = null, countryActive = false; // the looping country-arrival tune
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
  // Play a country/region tune (from src/data/tunes.js) once, onto `master`.
  const playTune = (key) => {
    const t = TUNES[key] || TUNES.generic;
    const start = ctx.currentTime + 0.06;
    let at = start;
    if (key === "southasia") { // a low tonic drone under the sitar line
      for (const f of [146.83, 220.0]) voice(start, f, 0.05, 6.5, "reed", master);
    }
    for (const [name, beats] of t.seq) {
      const dur = beats * t.spb;
      const f = noteFreq(name);
      if (f) voice(at, f, 0.14, Math.max(0.12, dur * 0.95), t.timbre, master);
      at += dur;
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
        const f = MELODY[idx % MELODY.length];
        const onDownbeat = (idx % 3) === 0;
        if (f) voice(nextBeat, f, (onDownbeat ? 0.13 : 0.09), onDownbeat ? EIGHTH * 1.1 : EIGHTH * 0.85, "reed", jigBus);
        idx += 1;
        nextBeat += EIGHTH;
      }
    } catch { /* music must never break gameplay */ }
  };
  const startDrone = (t) => {
    for (const f of [73.42, 110.0]) { // D2 + A2 — the pipe's tonic and fifth
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.5);
      o.connect(lp); lp.connect(g); g.connect(jigBus); o.start(t);
      drone.push({ o, g });
    }
  };
  const stopDrone = () => { const t = ctx ? ctx.currentTime : 0; for (const d of drone) { try { d.g.gain.setTargetAtTime(0.0001, t, 0.15); d.o.stop(t + 0.5); } catch { /* ignore */ } } drone = []; };
  // Bring master up to the audible level (one-shots need it even when the jig
  // loop is faded out at the map).
  const wake = (c) => { master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(0.16, c.currentTime, 0.3); };
  return {
    // Start (or resume) the looping Scottish jig — splash + meet screens.
    start() {
      try {
        const c = ac(); if (!c) return;
        wake(c);
        jigBus.gain.cancelScheduledValues(c.currentTime);
        jigBus.gain.setTargetAtTime(1.0, c.currentTime, 0.5); // fade the jig in
        if (running) return;
        running = true;
        nextBeat = Math.max(nextBeat, c.currentTime + 0.15);
        startDrone(c.currentTime + 0.1);
        if (!timer) timer = setInterval(schedule, 200);
        schedule();
      } catch { /* ignore */ }
    },
    // Fade the jig loop out (at the map) but keep the context + master alive so
    // the travel jig and country tunes can still play.
    fadeJig() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        stopDrone();
        if (ctx && jigBus) jigBus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6);
      } catch { /* ignore */ }
    },
    // Full stop (leaving to the passport): silence everything.
    stop() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        this.stopCountry();
        stopDrone();
        if (ctx && jigBus) jigBus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
        if (ctx && master) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
      } catch { /* ignore */ }
    },
    // Stop the looping country tune (leaving the country / the trip).
    stopCountry() {
      countryActive = false;
      if (countryTimer) { clearTimeout(countryTimer); countryTimer = null; }
    },
    // ~4-second lively jig over a flight, on master (independent of the loop).
    travelJig() {
      try {
        this.stopCountry(); // you're leaving the country — silence its tune
        const c = ac(); if (!c) return;
        wake(c);
        const t0 = c.currentTime + 0.04;
        const n = Math.floor(4.0 / EIGHTH);
        for (let i = 0; i < n; i++) {
          const f = MELODY[i % MELODY.length];
          if (f) voice(t0 + i * EIGHTH, f, i % 3 === 0 ? 0.12 : 0.085, EIGHTH * 0.95, "reed", master);
        }
        // a light low pulse on the downbeats for lift
        for (let i = 0; i < n; i += 6) voice(t0 + i * EIGHTH, 146.83, 0.06, EIGHTH * 3, "reed", master);
      } catch { /* ignore */ }
    },
    // The country's tune, LOOPED while the player is in that country (a gap
    // between repeats so it doesn't fatigue). Replaces any previous country loop.
    countryTune(country, continent) {
      try {
        this.stopCountry();
        const c = ac(); if (!c) return;
        wake(c);
        const key = tuneKeyFor(country, continent);
        countryActive = true;
        const loop = () => {
          if (!countryActive || !ctx) return;
          const dur = playTune(key);
          countryTimer = setTimeout(loop, Math.max(3000, (dur + 3) * 1000));
        };
        loop();
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
        const run = [N.D4, N.E4, N.Fs4, N.G4, N.A4, N.B4, N.A4, N.D5, N.Cn5, N.B4, N.A4, N.Fs4];
        run.forEach((f, i) => voice(t0 + i * 0.13, f, i % 3 === 0 ? 0.14 : 0.1, 0.14, "reed", master));
        const tc = t0 + run.length * 0.13; // final D-major chord
        [N.D4, N.Fs4, N.A4, N.D5].forEach((f) => voice(tc, f, 0.11, 1.8, "reed", master));
        master.gain.setTargetAtTime(0.0001, tc + 1.4, 0.5); // let it ring, then fade
      } catch { /* ignore */ }
    },
    // A short, slow, wistful Scottish air — played once when the traveller comes
    // home to Grandpa's homecoming quiz. Gentle flute-like voice over a soft D
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
  "Afrikaans": "af", "Amharic": "am", "Arabic": "ar", "Burmese": "my", "Cantonese": "zh-HK",
  "Croatian": "hr", "Czech": "cs", "Dutch": "nl", "English": "en", "English (Australian)": "en-AU",
  "Filipino": "fil", "French": "fr", "French (Québec)": "fr-CA", "German": "de",
  "German (Austrian)": "de-AT", "Greek": "el", "Hindi": "hi", "Icelandic": "is",
  "Indonesian": "id", "Italian": "it", "Japanese": "ja", "Khmer": "km", "Korean": "ko",
  "Malay": "ms", "Mandarin Chinese": "zh-CN", "Mongolian": "mn", "Māori": "mi", "Nepali": "ne",
  "Norwegian": "nb", "Persian": "fa", "Portuguese": "pt", "Russian": "ru", "Sinhala": "si",
  "Spanish": "es", "Swahili": "sw", "Swiss German": "de-CH", "Thai": "th", "Turkish": "tr",
  "Urdu": "ur", "Uzbek": "uz", "Vietnamese": "vi", "Xhosa": "xh",
};
export const speechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;
// Speak a short English announcement aloud ("Welcome to France!") — used on map
// arrivals. A nice-to-have; never breaks anything if speech is unavailable.
export function speakEn(text) {
  try {
    if (!speechAvailable || !text) return;
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = "en-US"; u.rate = 0.95; u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* speech is optional */ }
}
export function speakGreeting(g) {
  try {
    if (!speechAvailable || !g?.text) return;
    // Speak the native-script form (before any "(romanization)"), a touch slowly.
    const native = String(g.text).split(" (")[0].trim();
    const u = new SpeechSynthesisUtterance(native);
    const code = SPEECH_LANG[g.language];
    if (code) u.lang = code;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* speech is a nice-to-have; never break gameplay */ }
}
