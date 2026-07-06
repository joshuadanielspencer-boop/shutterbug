import React, { useState, useRef, useEffect } from "react";
import { LOCATIONS } from "./data/locations.js";
import { WORLD_COUNTRIES } from "./data/worldmap.js";
import { listProfiles, lastProfileName, getProfile, createProfile, setLastProfile,
  deleteProfile, recordGame, weightedOrder, passportData, storageAvailable } from "./profiles.js";

/*
  SHUTTERBUG — A World Photo Safari  (working vertical slice)
  A spiritual successor to "Nigel's World: Adventures in Geography" (1991).
  Loop: read your editor's clue -> fly to the right city -> photograph the right
  subject before your days run out. Every correct shot teaches a geography fact.

  The world map is a real vector map (Natural Earth country outlines, public
  domain) in src/data/worldmap.js, drawn in the same lon/lat projection as the
  city pins so they line up. Landmarks use freely-licensed photos from
  src/data/locations.js, falling back to hand-drawn icons where a photo is
  missing. Ten sample locations for now; grow the data file (optionally from
  REST Countries) without touching this component. Map geometry is bundled as
  data, so it runs in-memory; only the landmark photos load over the network.
*/

// ---- Palette (airmail / vintage travel poster; deliberately not the cream+terracotta default) ----
const OCEAN = "#15606E";
const OCEAN_DEEP = "#0E4A56";
const LAND = "#E7D3A1";
const LAND_EDGE = "#C9B074";
const INK = "#10262E";
const GOLD = "#F0A500";
const CORAL = "#E15C42";
const GREEN = "#3E9B6E";
const PAPER = "#F4ECD8";
const PAPER_LINE = "#D8C79E";

// ---- Simple hand-drawn landmark icons (placeholders for real photos) ----
function Landmark({ icon, size = 96 }) {
  const s = { width: size, height: size };
  const stroke = INK;
  switch (icon) {
    case "eiffel":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M24 4 L16 44 M24 4 L32 44" /><path d="M18 24 L30 24 M14 44 L34 44 M20 14 L28 14" /><circle cx="24" cy="6" r="1.5" fill={stroke} /></g></svg>);
    case "clocktower":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M24 4 L30 12 L30 44 L18 44 L18 12 Z" /><circle cx="24" cy="20" r="4.5" /><path d="M24 20 L24 17 M24 20 L26 20" /></g></svg>);
    case "pyramid":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M6 40 L20 12 L34 40 Z" /><path d="M20 12 L26 40" opacity="0.5" /><path d="M30 40 L38 26 L44 40 Z" /></g></svg>);
    case "lion":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><circle cx="24" cy="24" r="8" /><g strokeWidth="1.6">{[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={24 + Math.cos(a) * 9} y1={24 + Math.sin(a) * 9} x2={24 + Math.cos(a) * 15} y2={24 + Math.sin(a) * 15} />; })}</g><circle cx="21" cy="23" r="1" fill={stroke} /><circle cx="27" cy="23" r="1" fill={stroke} /><path d="M22 27 Q24 29 26 27" /></g></svg>);
    case "fuji":
      return (<svg style={s} viewBox="0 0 48 48"><g strokeLinejoin="round"><path d="M6 40 L24 10 L42 40 Z" fill="none" stroke={stroke} strokeWidth="2" /><path d="M18 18 L24 10 L30 18 L27 20 L24 16 L21 20 Z" fill={stroke} opacity="0.85" /><path d="M8 40 Q12 37 16 40 T24 40 T32 40 T40 40" fill="none" stroke={stroke} strokeWidth="1.4" opacity="0.5" /></g></svg>);
    case "wall":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M4 34 L12 22 L22 30 L32 18 L44 26" /><path d="M8 31 L8 27 M16 26 L16 22 M27 27 L27 23 L31 22 M37 24 L37 20" /></g></svg>);
    case "taj":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M18 40 L18 26 Q24 16 30 26 L30 40 Z" /><path d="M24 16 L24 12" /><line x1="12" y1="20" x2="12" y2="40" /><line x1="36" y1="20" x2="36" y2="40" /><line x1="10" y1="40" x2="38" y2="40" /></g></svg>);
    case "liberty":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><circle cx="24" cy="14" r="3.5" /><path d="M24 17 L24 34 M24 22 L20 30 M24 20 L30 12" /><path d="M30 12 L30 9 M30 12 L28 12" /><path d="M20 30 L18 34 M24 34 L20 40 L28 40 L24 34" /><path d="M21 11 L24 8 L27 11" /></g></svg>);
    case "christ":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><circle cx="24" cy="12" r="3" /><path d="M24 15 L24 34 M10 22 L38 22" /><path d="M24 34 L20 42 M24 34 L28 42" /><path d="M12 40 Q24 44 36 40" strokeWidth="1.4" opacity="0.5" /></g></svg>);
    case "opera":
      return (<svg style={s} viewBox="0 0 48 48"><g fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M8 36 Q12 20 18 36 Z" /><path d="M16 36 Q22 16 28 36 Z" /><path d="M26 36 Q32 22 38 36 Z" /><path d="M6 38 L42 38" /></g></svg>);
    default:
      return <svg style={s} viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" fill="none" stroke={stroke} strokeWidth="2" /></svg>;
  }
}

// ---- The photo shown for a subject: a real `photo` (object with a `src`) if ----
// ---- the data has one, otherwise the hand-drawn `icon` placeholder.        ----
function Photo({ photo, icon, alt = "", size = 96, full = false }) {
  if (photo?.src) {
    return (
      <img
        src={photo.src}
        alt={alt}
        width={full ? undefined : size}
        height={size}
        loading="lazy"
        style={{ width: full ? "100%" : size, height: size, objectFit: "cover", display: "block", borderRadius: 4 }}
      />
    );
  }
  return <Landmark icon={icon} size={size} />;
}

// ---- Photo attribution line. Renders only for real photos; the icon ----
// ---- placeholders need no credit. Links to the source when we have it. ----
function PhotoCredit({ photo, style }) {
  if (!photo?.src) return null;
  const parts = [photo.credit, photo.license].filter(Boolean).join(" · ");
  const label = parts || "Source";
  return (
    <div style={{ fontSize: 10, color: INK, opacity: 0.55, marginTop: 4, lineHeight: 1.3, ...style }}>
      <span aria-hidden="true">📷 </span>
      {photo.source ? (
        <a href={photo.source} target="_blank" rel="noreferrer" style={{ color: OCEAN }}>{label}</a>
      ) : label}
    </div>
  );
}

// ---- Camera viewfinder shown before the shutter is pressed (the photo is ----
// ---- hidden until you shoot). Corner ticks + a prompt, sized like the photo. ----
function Viewfinder() {
  const tick = { position: "absolute", width: 18, height: 18, borderColor: GOLD, borderStyle: "solid" };
  return (
    <div style={{ height: 230, borderRadius: 4, background: OCEAN_DEEP, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...tick, top: 12, left: 12, borderWidth: "2px 0 0 2px" }} />
      <div style={{ ...tick, top: 12, right: 12, borderWidth: "2px 2px 0 0" }} />
      <div style={{ ...tick, bottom: 12, left: 12, borderWidth: "0 0 2px 2px" }} />
      <div style={{ ...tick, bottom: 12, right: 12, borderWidth: "0 2px 2px 0" }} />
      <div style={{ position: "absolute", width: 22, height: 22, border: `2px solid ${CORAL}`, borderRadius: "50%", opacity: 0.7 }} />
      <div style={{ textAlign: "center", color: PAPER, padding: "0 16px" }}>
        <div style={{ fontSize: 34 }} aria-hidden="true">📷</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", opacity: 0.75, marginTop: 6 }}>VIEWFINDER</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Press the shutter to take the shot</div>
      </div>
    </div>
  );
}

// ---- Difficulty tiers. Each game shows `options` city pins on the map, of ----
// ---- which `assignments` are the real targets; the rest are decoys. Points ----
// ---- per photo are HIGHER on Easy (younger players) than Hard, on purpose. ----
// ---- `labels`: "all" = every city named; "smart" = names hidden until you  ----
// ---- hover/focus a pin (plus the city you're in). `clue`: which clue text.  ----
const MODES = {
  easy:   { label: "Easy",   assignments: 3, options: 9,  daysPer: 3, points: 150, labels: "all",   clue: "easy",
            blurb: "For new explorers: the clue names the continent, every city is labelled, few decoy cities, and plenty of travel days." },
  medium: { label: "Medium", assignments: 5, options: 15, daysPer: 3, points: 125, labels: "smart", clue: "hard",
            blurb: "A step up: cryptic clues, city names hidden until you hover or focus a pin, and more decoy cities to sort through." },
  hard:   { label: "Hard",   assignments: 7, options: 21, daysPer: 2, points: 100, labels: "smart", clue: "hard",
            blurb: "For seasoned globe-trotters: cryptic clues, no free labels, the most decoy cities, and the fewest travel days." },
};
const MODE_ORDER = ["easy", "medium", "hard"];

// How many pins/targets a mode actually uses given the available locations.
const modePlan = (key) => {
  const m = MODES[key];
  const options = Math.min(m.options, LOCATIONS.length);
  const assignments = Math.min(m.assignments, options);
  return { ...m, options, assignments };
};

// Taking a photo (right or wrong) costs half a travel day, so a snapshot is a
// real decision, not a free guess.
const SHOT_COST = 0.5;

const BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
// Minimum distance (in map units, with the 1.5x vertical stretch applied) that
// must separate any two shown pins, so their circles never overlap into an
// unclickable clump. Verified to still place all 21 Hard-mode pins.
const PIN_MIN_SEP = 14;
const pinsFarEnough = (a, chosen) =>
  chosen.every((b) => {
    const dx = a.x - b.x;
    const dy = 1.5 * (a.y - b.y);
    return dx * dx + dy * dy >= PIN_MIN_SEP * PIN_MIN_SEP;
  });

// The best score a game could reach: every photo landed, and every travel day
// beyond the minimum banked as bonus. The minimum is one flight (1 day) plus one
// shot (SHOT_COST) per assignment.
const maxScoreFor = (nAssign, mode) => nAssign * mode.points + nAssign * (mode.daysPer - 1 - SHOT_COST) * 50;

// Rank on the FRACTION of the achievable max, so a perfect Easy run and a
// perfect Hard run both earn the top title regardless of raw points.
const rankFor = (pct) => {
  if (pct >= 0.9) return { title: "Pulitzer-Winning Photojournalist", note: "Flawless work in the field." };
  if (pct >= 0.7) return { title: "Senior Photojournalist", note: "Sharp eye, sharp instincts." };
  if (pct >= 0.5) return { title: "Staff Photographer", note: "Solid, dependable coverage." };
  if (pct >= 0.25) return { title: "Field Intern", note: "You got the shots that counted." };
  return { title: "Trainee", note: "Read the editor's clues more closely next time." };
};

// Milliseconds → "m:ss".
const fmtTime = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// ---- Tiny synthesized sound effects (Web Audio) — no files, nothing to      ----
// ---- license, and no network. The context is created lazily on first use     ----
// ---- (always inside a click), satisfying browser autoplay rules.             ----
const SFX = (() => {
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
  // Every effect is wrapped so an audio hiccup can never break gameplay.
  const safe = (fn) => { try { const c = ac(); if (c) fn(c); } catch { /* ignore */ } };
  return {
    // Camera shutter: two quick noise clicks (mirror up, shutter close).
    shutter() { safe((c) => { const t = c.currentTime; burst(c, t, 0.045, "highpass", 1800, 0.32); burst(c, t + 0.06, 0.05, "highpass", 1300, 0.26); }); },
    // Airplane fly-by: filtered noise whose band sweeps up then down (~0.8s).
    plane() { safe((c) => { const t = c.currentTime; const { f } = burst(c, t, 0.8, "bandpass", 500, 0.11); f.Q.value = 0.9; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1150, t + 0.4); f.frequency.linearRampToValueAtTime(380, t + 0.8); }); },
    // Correct shot: bright rising three-note chime (C–E–G).
    success() { safe((c) => notes(c, [523.25, 659.25, 783.99], 0.085, 0.22, 0.3, "triangle")); },
    // Trip complete: a longer four-note fanfare up to the octave.
    win() { safe((c) => notes(c, [523.25, 659.25, 783.99, 1046.5], 0.11, 0.34, 0.32, "triangle")); },
    // Wrong subject: low descending two-note buzz.
    fail() { safe((c) => { const t = c.currentTime; tone(c, t, 196, 0.18, 0.26, "square"); tone(c, t + 0.13, 155.56, 0.3, 0.24, "square"); }); },
    // Out of days: slow sad descending minor line.
    lose() { safe((c) => notes(c, [440, 349.23, 261.63], 0.17, 0.42, 0.26, "sine")); },
    // Passport stamp / new record: quick high sparkle.
    stamp() { safe((c) => { const t = c.currentTime; tone(c, t, 1568, 0.12, 0.22, "triangle"); tone(c, t + 0.07, 2093, 0.16, 0.2, "triangle"); }); },
  };
})();

export default function ShutterbugWorld() {
  const [screen, setScreen] = useState("start"); // start | play | end | passport
  const [difficulty, setDifficulty] = useState("easy");

  const [assignments, setAssignments] = useState([]); // target location ids (the photos to file)
  const [visible, setVisible] = useState([]); // location ids shown as pins (targets + decoys)
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState(null); // current location id (null = at airport)
  const [days, setDays] = useState(0);
  const [score, setScore] = useState(0);
  const [album, setAlbum] = useState([]); // collected {id, subject, flag, fact}
  const [visitedIds, setVisitedIds] = useState([]); // cities flown to this game
  const [awaitingFlight, setAwaitingFlight] = useState(false); // assignment filed; still at last city, waiting to fly on
  const [msg, setMsg] = useState(null); // {type, text}
  const [flying, setFlying] = useState(null); // {fromX, fromY, toX, toY}
  const [revealed, setRevealed] = useState(false); // has the current city's photo been shot?
  const [flashKey, setFlashKey] = useState(0); // bump to replay the shutter flash
  const [soundOn, setSoundOn] = useState(true);
  const [pending, setPending] = useState(null); // result popup that pauses play until dismissed
  const [elapsedMs, setElapsedMs] = useState(0); // final game time, shown on the results screen

  // Player profiles (localStorage). profileName === null means "Guest — no saving".
  const [canSave] = useState(() => storageAvailable());
  const [profiles, setProfiles] = useState(() => (canSave ? listProfiles() : []));
  const [profileName, setProfileName] = useState(() => (canSave ? lastProfileName() : null));
  const [newName, setNewName] = useState("");
  const [lastResult, setLastResult] = useState(null); // {isBest, isBestTime} after a recorded game
  const [confirmRemove, setConfirmRemove] = useState(false); // passport delete confirmation
  const recorded = useRef(false);
  const startRef = useRef(0); // ms timestamp the current game began
  const timer = useRef(null);
  const refreshProfiles = () => setProfiles(listProfiles());

  const prefersReduced = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  const sfx = (name) => { if (soundOn && SFX[name]) SFX[name](); };

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const loc = (id) => LOCATIONS.find((l) => l.id === id);
  const target = assignments.length ? loc(assignments[step]) : null;
  const currentLoc = current ? loc(current) : null;

  function startGame() {
    const mode = modePlan(difficulty);
    // Weighted order surfaces the active player's missed/unmastered places more
    // often (a plain shuffle for guests).
    const order = weightedOrder(profileName ? getProfile(profileName) : null).map((id) => BY_ID[id]);
    // 1) Pick the targets from the weighted order, keeping pins spaced apart.
    const targets = [];
    for (const l of order) {
      if (targets.length >= mode.assignments) break;
      if (pinsFarEnough(l, targets)) targets.push(l);
    }
    const chosen = [...targets];
    // 2) Every target gets at least one same-continent companion pin, so the
    // continent named in an Easy clue is never the only pin of its continent.
    for (const t of targets) {
      if (chosen.some((l) => l !== t && l.continent === t.continent)) continue;
      const cand = order.find((l) => l.continent === t.continent && !chosen.includes(l) && pinsFarEnough(l, chosen));
      if (cand) chosen.push(cand);
    }
    // 3) Fill the rest of the map with spaced-out decoys.
    for (const l of order) {
      if (chosen.length >= mode.options) break;
      if (!chosen.includes(l) && pinsFarEnough(l, chosen)) chosen.push(l);
    }
    setVisible(chosen.map((l) => l.id));
    setAssignments(targets.map((l) => l.id));
    setStep(0);
    setCurrent(null);
    setDays(mode.assignments * mode.daysPer);
    setScore(0);
    setAlbum([]);
    setVisitedIds([]);
    setRevealed(false);
    setAwaitingFlight(false);
    setLastResult(null);
    setPending(null);
    setElapsedMs(0);
    startRef.current = Date.now();
    recorded.current = false;
    setMsg({ type: "info", text: "Wire received from your editor. Read the clue, then fly." });
    setFlying(null);
    setScreen("play");
  }

  // Dismiss the result popup and do what its button promised.
  function continueFromResult() {
    const kind = pending?.kind;
    setPending(null);
    if (kind === "correct") {
      setStep((n) => n + 1);
      setRevealed(false);      // clear the photo just taken...
      setAwaitingFlight(true); // ...but stay put so the next flight departs from here
      setMsg({ type: "info", text: "New assignment! Read the editor's clue and fly to the next city." });
    } else if (kind === "win" || kind === "lose") {
      setScreen("end");
    }
    // "wrong" just closes and leaves you in the city to fly on.
  }

  // When a game ends, record its outcome once against the active profile.
  useEffect(() => {
    if (screen === "end" && !recorded.current) {
      recorded.current = true;
      if (profileName) {
        const correctIds = album.map((p) => p.id);
        const missedIds = assignments.filter((id) => !correctIds.includes(id));
        const won = assignments.length > 0 && correctIds.length === assignments.length;
        const res = recordGame(profileName, { difficulty, score, timeMs: elapsedMs, won, visitedIds, correctIds, missedIds });
        setLastResult(res);
        if (res.isBest || res.isBestTime) sfx("stamp");
        refreshProfiles();
      }
    }
    if (screen === "start") recorded.current = false;
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  function travelTo(id) {
    if (id === current || flying || days <= 0 || pending) return;
    const from = current ? loc(current) : { x: 106, y: 49 }; // depart from NYC hub if at airport
    const to = loc(id);
    sfx("plane");
    const finalize = () => {
      const nd = Math.round((days - 1) * 10) / 10; // a flight costs one day
      setCurrent(id);
      setDays(nd);
      setRevealed(false); // a fresh city — nothing shot yet
      setAwaitingFlight(false); // arrived; you can shoot here now
      setVisitedIds((v) => (v.includes(id) ? v : [...v, id]));
      setFlying(null);
      if (nd <= 0) {
        setElapsedMs(Date.now() - startRef.current);
        sfx("lose");
        setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Out of travel days!",
          subtitle: `You landed in ${to.city} ${to.flag}, but the trip's budget is spent.`,
          buttonLabel: "See my results" });
      } else {
        setMsg({ type: "info", text: `Arrived in ${to.city}, ${to.country} ${to.flag}. Is the editor's subject here?` });
      }
    };
    if (prefersReduced) { finalize(); return; }
    setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
    timer.current = setTimeout(finalize, 850);
  }

  function takePhoto() {
    if (!currentLoc || flying || revealed || days <= 0 || pending || awaitingFlight) return;
    sfx("shutter");
    if (!prefersReduced) setFlashKey((k) => k + 1);
    setRevealed(true); // reveal the photo now that the shutter fired
    const d = Math.round((days - SHOT_COST) * 10) / 10; // a shot costs half a day
    setDays(d);

    if (currentLoc.id === target.id) {
      const gain = MODES[difficulty].points;
      setAlbum((a) => [...a, { id: target.id, subject: target.subject, flag: target.flag, city: target.city, country: target.country, fact: target.fact, icon: target.icon, photo: target.photo }]);
      const done = step + 1 >= assignments.length;
      if (done) {
        const bonus = Math.round(Math.max(0, d) * 50);
        setScore((s) => s + gain + bonus);
        setElapsedMs(Date.now() - startRef.current);
        sfx("win");
        setPending({ kind: "win", tone: "good", emoji: "🏆", title: "Trip complete!",
          subtitle: `A perfect shot of ${target.subject}! +${gain}${bonus ? `, plus ${bonus} for ${d} day${d === 1 ? "" : "s"} to spare` : ""}.`,
          fact: target.fact, buttonLabel: "See my results 📸" });
      } else if (d <= 0) {
        setScore((s) => s + gain);
        setElapsedMs(Date.now() - startRef.current);
        sfx("lose");
        setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Got the shot — but out of days!",
          subtitle: `You filed ${target.subject} (+${gain}), but that spent your last travel day.`,
          fact: target.fact, buttonLabel: "See my results" });
      } else {
        setScore((s) => s + gain);
        sfx("success");
        setPending({ kind: "correct", tone: "good", emoji: "✅", title: "Perfect shot!",
          subtitle: `You photographed ${target.subject}. +${gain} points!`,
          fact: target.fact, buttonLabel: "Next assignment ✈" });
      }
    } else {
      if (d <= 0) {
        setElapsedMs(Date.now() - startRef.current);
        sfx("lose");
        setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Out of travel days!",
          subtitle: `That's ${currentLoc.subject}, not what the editor wanted — and the trip's over.`,
          buttonLabel: "See my results" });
      } else {
        sfx("fail");
        setPending({ kind: "wrong", tone: "bad", emoji: "❌", title: "Not the assignment",
          subtitle: `That's ${currentLoc.subject}. The editor wants ${target.subject}. Half a day gone — read the clue and fly on.`,
          buttonLabel: "Keep looking 🔍" });
      }
    }
  }

  // ---------- SCREENS ----------
  if (screen === "start") {
    return (
      <Frame>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", padding: "8px 4px" }}>
          <Stamp>Field Edition · Pack your bags ✈</Stamp>
          <h1 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "clamp(24px, 7vw, 40px)", color: INK, margin: "10px 0 2px" }}>Shutterbug</h1>
          <p style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: 12, color: CORAL, margin: 0 }}>A World Photo Safari</p>
          <TravelCollage />
          <p style={{ color: INK, opacity: 0.85, marginTop: 6, lineHeight: 1.5 }}>
            You're a travelling photographer. Your editor wires an assignment; you read the clue,
            fly to the right city, and photograph the right subject before your travel days run out.
            Every correct shot teaches a bit of world geography.
          </p>

          <div style={{ marginTop: 22 }}>
            <Field label="Traveller">
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 460, margin: "0 auto" }}>
                {profiles.map((p) => {
                  const active = p.name === profileName;
                  return (
                    <button key={p.name} onClick={() => { setProfileName(p.name); setLastProfile(p.name); }} aria-pressed={active}
                      style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        border: `1.5px solid ${INK}`, background: active ? INK : "transparent", color: active ? PAPER : INK }}>
                      {active ? "🧳 " : ""}{p.name}
                    </button>
                  );
                })}
                <button onClick={() => { setProfileName(null); setLastProfile(null); }} aria-pressed={profileName === null}
                  style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                    border: `1.5px dashed ${INK}`, background: profileName === null ? INK : "transparent", color: profileName === null ? PAPER : INK }}>
                  Guest
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const p = createProfile(newName); if (p) { setProfileName(p.name); setNewName(""); refreshProfiles(); } }}
                style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={20} placeholder="New traveller's name" aria-label="New traveller's name"
                  disabled={!canSave}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, fontSize: 14, width: 180, background: "#fff", color: INK }} />
                <button type="submit" disabled={!newName.trim() || !canSave}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: newName.trim() && canSave ? "pointer" : "default", fontWeight: 700, fontSize: 14, background: GREEN, color: "#fff", opacity: newName.trim() && canSave ? 1 : 0.5 }}>
                  ＋ Add
                </button>
              </form>
              {profileName ? (
                <button onClick={() => { setConfirmRemove(false); setScreen("passport"); }}
                  style={{ marginTop: 10, padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${CORAL}`, background: "transparent", color: CORAL, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  📕 {profileName}'s passport
                </button>
              ) : (
                <p style={{ fontSize: 12, color: INK, opacity: 0.6, margin: "8px 2px 0" }}>
                  {canSave ? "Guest games aren't saved. Add a name to keep scores and stamps." : "This browser can't save progress, so games won't be recorded."}
                </p>
              )}
            </Field>
          </div>

          <div style={{ marginTop: 22 }}>
            <Field label="Difficulty">
              <Toggle options={MODE_ORDER.map((k) => [k, MODES[k].label])} value={difficulty} onChange={setDifficulty} />
            </Field>
          </div>

          <button onClick={startGame} style={primaryBtn}>Begin the assignment ✈</button>
        </div>
      </Frame>
    );
  }

  if (screen === "end") {
    const mode = MODES[difficulty];
    const maxScore = maxScoreFor(assignments.length, mode);
    const pct = maxScore > 0 ? score / maxScore : 0;
    const r = rankFor(pct);
    return (
      <Frame>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Stamp>Roll Developed</Stamp>
          <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.08em", fontSize: 30, color: INK, margin: "10px 0 4px" }}>{album.length} / {assignments.length} shots filed</h2>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: CORAL, fontWeight: 700, margin: "6px 0" }}>{score} pts · ⏱ {fmtTime(elapsedMs)}</p>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.6, margin: "0 0 6px", letterSpacing: "0.06em" }}>{mode.label} · {Math.round(pct * 100)}% of a perfect run</p>
          <p style={{ color: INK, fontWeight: 700, marginTop: 6 }}>{r.title}</p>
          <p style={{ color: INK, opacity: 0.7, marginTop: 2 }}>{r.note}</p>

          {profileName && (lastResult?.isBest || lastResult?.isBestTime) && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {lastResult.isBest && (
                <span style={{ background: GOLD, color: INK, fontWeight: 800, fontSize: 14, padding: "6px 14px", borderRadius: 20 }}>★ New best score!</span>
              )}
              {lastResult.isBestTime && (
                <span style={{ background: GREEN, color: "#fff", fontWeight: 800, fontSize: 14, padding: "6px 14px", borderRadius: 20 }}>⏱ New best time!</span>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 22 }}>
            {album.map((p) => (<Polaroid key={p.id} p={p} />))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
            <button onClick={() => setScreen("start")} style={primaryBtn}>New assignment</button>
            {profileName && (
              <button onClick={() => { setConfirmRemove(false); setScreen("passport"); }} style={{ ...primaryBtn, background: "transparent", color: CORAL, border: `2px solid ${CORAL}`, boxShadow: "none" }}>
                📕 View passport
              </button>
            )}
          </div>
        </div>
      </Frame>
    );
  }

  if (screen === "passport") {
    const profile = getProfile(profileName);
    if (!profile) {
      return (
        <Frame>
          <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: INK }}>No traveller selected yet.</p>
            <button onClick={() => setScreen("start")} style={primaryBtn}>Back to start</button>
          </div>
        </Frame>
      );
    }
    const pp = passportData(profile);
    const best = profile.best || {};
    const bt = profile.bestTime || {};
    return (
      <Frame>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
            <div>
              <Stamp>Passport</Stamp>
              <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 28, color: INK, margin: "8px 0 0" }}>🧳 {profile.name}</h2>
            </div>
            <button onClick={() => { setConfirmRemove(false); setScreen("start"); }} style={{ padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <StatCard label="Stamps earned" value={`${pp.masteredCount} / ${pp.totalCountries}`} />
            <StatCard label="Countries visited" value={`${pp.visitedCount}`} />
            <StatCard label="Trips taken" value={`${profile.games || 0}`} />
            <StatCard label="Best · Easy" value={best.easy ? String(best.easy) : "—"} />
            <StatCard label="Best · Medium" value={best.medium ? String(best.medium) : "—"} />
            <StatCard label="Best · Hard" value={best.hard ? String(best.hard) : "—"} />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.12em", color: INK, opacity: 0.6 }}>⏱ BEST TIMES</span>
            {MODE_ORDER.map((k) => (
              <span key={k} style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 14, padding: "4px 10px" }}>
                {MODES[k].label}: {bt[k] ? fmtTime(bt[k]) : "—"}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(pp.continents).sort().map(([k, v]) => (
              <span key={k} style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 14, padding: "4px 10px" }}>
                {k}: {v.mastered}/{v.total}
              </span>
            ))}
          </div>

          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, margin: "22px 0 10px" }}>STAMPS</div>
          {pp.countries.length === 0 ? (
            <p style={{ color: INK, opacity: 0.7 }}>No stamps yet — fly out and photograph a landmark to earn your first!</p>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {pp.countries.map((c) => (
                <div key={c.country} style={{ width: 184, background: "#fff", border: `2px ${c.mastered ? "solid" : "dashed"} ${c.mastered ? CORAL : PAPER_LINE}`, borderRadius: 8, padding: 12, transform: `rotate(${(c.country.charCodeAt(0) % 5) - 2}deg)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 26 }} aria-hidden="true">{c.flag}</span>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em", color: c.mastered ? CORAL : INK, opacity: c.mastered ? 1 : 0.55 }}>{c.mastered ? "★ MASTERED" : "✓ VISITED"}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: INK, marginTop: 6 }}>{c.country}</div>
                  <div style={{ fontSize: 11, color: INK, opacity: 0.6 }}>{c.continent}{c.mastered ? ` · ${c.correct} shot${c.correct === 1 ? "" : "s"}` : ""}</div>
                  {c.mastered && c.facts[0] && (
                    <div style={{ fontSize: 11, color: INK, opacity: 0.75, lineHeight: 1.35, marginTop: 6 }}>{c.facts[0].fact}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Remove traveller — two-step so it can't be clicked by accident. */}
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${PAPER_LINE}`, textAlign: "center" }}>
            {confirmRemove ? (
              <div>
                <p style={{ color: INK, fontWeight: 700, margin: "0 0 4px" }}>Remove {profile.name}?</p>
                <p style={{ color: INK, opacity: 0.7, fontSize: 13, margin: "0 0 12px" }}>This permanently erases {profile.name}'s stamps, scores, and best times. This can't be undone.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => { deleteProfile(profile.name); setConfirmRemove(false); setProfileName(null); refreshProfiles(); setScreen("start"); }}
                    style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: CORAL, color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 3px 0 #A93A28" }}>
                    Yes, remove
                  </button>
                  <button onClick={() => setConfirmRemove(false)}
                    style={{ padding: "10px 18px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmRemove(true)}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, background: "transparent", color: INK, opacity: 0.7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Remove this traveller…
              </button>
            )}
          </div>
        </div>
      </Frame>
    );
  }

  // play screen
  const mode = MODES[difficulty];
  const clue = mode.clue === "easy" ? target.easy : target.hard;
  const smallPins = visible.length > 12;
  // Stretch the map taller so cities get vertical breathing room. Land geometry
  // is scaled vertically; pins are placed at y*VS but drawn with normal radii so
  // they stay round (not ovals).
  const MAP_VS = 1.5;
  const MAP_H = 180 * MAP_VS;
  return (
    <Frame>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Field journal panel */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.18em", color: INK, opacity: 0.7 }}>ASSIGNMENT {step + 1}/{assignments.length}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSoundOn((s) => !s)} aria-label={soundOn ? "Turn sound off" : "Turn sound on"} aria-pressed={soundOn} title={soundOn ? "Sound on" : "Sound off"}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 2, color: INK, opacity: 0.75 }}>
                {soundOn ? "🔊" : "🔇"}
              </button>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: days <= 1 ? CORAL : INK }}>◷ {days} day{days === 1 ? "" : "s"} left</span>
            </div>
          </div>

          <div style={{ background: PAPER, border: `1px dashed ${CORAL}`, borderRadius: 6, padding: "14px 16px", position: "relative" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: CORAL, marginBottom: 8 }}>✎ TELEGRAM — FROM THE EDITOR</div>
            <p style={{ margin: 0, color: INK, lineHeight: 1.5, fontSize: 15 }}>Bring me a photo of <b>{target.subject}</b>.</p>
            <p style={{ margin: "8px 0 0", color: INK, opacity: 0.85, lineHeight: 1.5, fontSize: 14, fontStyle: "italic" }}>{clue}</p>
          </div>

          {msg && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 6, fontSize: 14, lineHeight: 1.4,
              background: msg.type === "win" ? "#EAF6EF" : msg.type === "lose" ? "#FBEAE6" : msg.type === "warn" ? "#FCF3E0" : "#EAF1F2",
              color: INK, border: `1px solid ${msg.type === "win" ? GREEN : msg.type === "lose" ? CORAL : msg.type === "warn" ? GOLD : OCEAN}` }}>
              {msg.text}
            </div>
          )}

          {/* On-location card */}
          {currentLoc && awaitingFlight ? (
            <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${GREEN}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 30 }} aria-hidden="true">✅</div>
              <div style={{ fontWeight: 800, color: GREEN, marginTop: 4 }}>Assignment filed!</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 6, lineHeight: 1.45 }}>
                You're still in {currentLoc.flag} {currentLoc.city}. Read the editor's new clue and tap the next city to fly there.
              </div>
            </div>
          ) : currentLoc ? (
            <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6 }}>YOU ARE HERE</div>
              <div style={{ margin: "8px 0", position: "relative", overflow: "hidden", borderRadius: 4 }}>
                {revealed
                  ? <Photo photo={currentLoc.photo} icon={currentLoc.icon} alt={currentLoc.subject} size={230} full />
                  : <Viewfinder />}
                {flashKey > 0 && !prefersReduced && <div key={flashKey} className="sbw-flash" />}
              </div>
              {revealed && <PhotoCredit photo={currentLoc.photo} style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }} />}
              <div style={{ fontWeight: 700, color: INK }}>{currentLoc.flag} {currentLoc.city}, {currentLoc.country}</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.7, marginTop: 2 }}>Subject in view: {currentLoc.subject}</div>
              {currentLoc.greeting?.text && (
                <div style={{ fontSize: 13, color: OCEAN, marginTop: 6 }}>
                  <span aria-hidden="true">💬 </span>Local greeting: “{currentLoc.greeting.text}”
                  {currentLoc.greeting.language ? ` — ${currentLoc.greeting.language}` : ""}
                  {currentLoc.greeting.pronunciation ? ` (${currentLoc.greeting.pronunciation})` : ""}
                </div>
              )}
              {revealed ? (
                <div style={{ marginTop: 12, fontSize: 13, color: INK, opacity: 0.7 }}>Shot filed. Tap another city to fly on.</div>
              ) : (
                <button onClick={takePhoto} disabled={!!flying || days <= 0} style={{ ...cameraBtn, opacity: flying || days <= 0 ? 0.5 : 1 }}>
                  📷 Take the photo <span style={{ fontWeight: 500, opacity: 0.85 }}>· ½ day</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 12, background: "#fff", border: `1px dashed ${PAPER_LINE}`, borderRadius: 8, padding: 14, textAlign: "center", color: INK, opacity: 0.7, fontSize: 14 }}>
              Tap a city on the map to fly there.
            </div>
          )}

        </div>

        {/* Map */}
        <div style={{ flex: "2 1 520px", minWidth: 400 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `2px solid ${INK}`, boxShadow: "0 6px 0 rgba(16,38,46,0.15)" }}>
            <svg viewBox={`0 0 360 ${MAP_H}`} style={{ width: "100%", display: "block", background: OCEAN }}>
              <defs>
                <pattern id="sea" width="360" height={MAP_H} patternUnits="userSpaceOnUse">
                  <rect width="360" height={MAP_H} fill={OCEAN} />
                  {[...Array(Math.ceil(MAP_H / 30) + 1)].map((_, i) => <line key={i} x1="0" y1={i * 30} x2="360" y2={i * 30} stroke={OCEAN_DEEP} strokeWidth="0.4" />)}
                  {[...Array(13)].map((_, i) => <line key={"v" + i} x1={i * 30} y1="0" x2={i * 30} y2={MAP_H} stroke={OCEAN_DEEP} strokeWidth="0.4" />)}
                </pattern>
              </defs>
              <rect width="360" height={MAP_H} fill="url(#sea)" />
              {/* Land stretched vertically; strokes kept crisp with non-scaling-stroke. */}
              <g transform={`scale(1 ${MAP_VS})`} stroke={LAND_EDGE} strokeWidth="0.25" strokeLinejoin="round">
                {WORLD_COUNTRIES.map((c) => (
                  <path key={c.name} d={c.d} fill={LAND} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
                ))}
              </g>

              {/* animated flight path (y scaled to the stretched map) */}
              {flying && (
                <g className="sbw-plane-group">
                  <line x1={flying.fromX} y1={flying.fromY * MAP_VS} x2={flying.toX} y2={flying.toY * MAP_VS} stroke={CORAL} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                  <g style={{ animation: "sbw-fly 0.85s ease-in-out forwards", offsetPath: `path('M${flying.fromX} ${flying.fromY * MAP_VS} L${flying.toX} ${flying.toY * MAP_VS}')` }}>
                    <text fontSize="9" fill={CORAL}>✈</text>
                  </g>
                </g>
              )}

              {/* city pins — the visible options (targets + decoys) */}
              {visible.map((id) => {
                const l = loc(id);
                const isCurrent = id === current;
                const alwaysLabel = mode.labels === "all" || isCurrent;
                const disabled = !!flying || days <= 0;
                const r = isCurrent ? 3.2 : (smallPins ? 1.9 : 2.4);
                const cy = l.y * MAP_VS;
                return (
                  <g key={id} className={`sbw-pin${alwaysLabel ? "" : " sbw-pin--hide"}`}
                     role="button" tabIndex={disabled ? -1 : 0}
                     aria-label={`Fly to ${l.city}, ${l.country}`}
                     onClick={() => travelTo(id)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); travelTo(id); } }}
                     style={{ cursor: disabled ? "default" : "pointer" }}>
                    <circle cx={l.x} cy={cy} r="5.5" fill="transparent" />
                    <circle cx={l.x} cy={cy} r={r} fill={isCurrent ? CORAL : GOLD} stroke={INK} strokeWidth="0.7" />
                    {isCurrent && <circle cx={l.x} cy={cy} r="5" fill="none" stroke={CORAL} strokeWidth="0.8" className="sbw-ping" />}
                    <text className="sbw-label" x={l.x + 4} y={cy - 4} fontSize="6" fontFamily="ui-monospace, monospace" fill={INK} style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 1.4 }}>{l.city}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p style={{ fontSize: 11, color: INK, opacity: 0.55, marginTop: 8, fontFamily: "ui-monospace, monospace", letterSpacing: "0.06em" }}>
            {mode.labels === "all" ? "Gold = a city you can fly to.  Coral = where you are now." : "City names hidden — hover or tab to a pin to peek. Read the clue and reason it out."}
          </p>

          {/* Album strip — under the map so the layout is symmetric. */}
          {album.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, marginBottom: 6 }}>ALBUM</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {album.map((p) => (
                  <div key={p.id} title={`${p.subject} — ${p.city}`} style={{ width: 46, height: 52, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
                    <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={34} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sbw-pin{ outline: none; }
        .sbw-pin circle:nth-child(2){ transition: r .12s ease; }
        .sbw-pin:hover circle:nth-child(2){ r: 4; }
        /* Visible keyboard-focus state on the pin dot. */
        .sbw-pin:focus-visible circle:nth-child(2){ r: 4; stroke: ${CORAL}; stroke-width: 1.6; }
        /* Smart labels: hidden until the pin is hovered or keyboard-focused;
           the current city and Easy mode keep their labels always on. */
        .sbw-pin--hide .sbw-label{ opacity: 0; transition: opacity .12s ease; }
        .sbw-pin--hide:hover .sbw-label,
        .sbw-pin--hide:focus .sbw-label,
        .sbw-pin--hide:focus-within .sbw-label,
        .sbw-pin--hide:focus-visible .sbw-label{ opacity: 1; }
        .sbw-ping{ transform-box: fill-box; transform-origin: center; animation: sbw-ping 1.6s ease-out infinite; }
        @keyframes sbw-ping{ 0%{ transform: scale(0.6); opacity:.9 } 100%{ transform: scale(1.9); opacity:0 } }
        @keyframes sbw-fly{ 0%{ offset-distance: 0% } 100%{ offset-distance: 100% } }
        /* White shutter flash over the photo when you take a shot. */
        .sbw-flash{ position: absolute; inset: 0; background: #fff; border-radius: 4px; pointer-events: none; opacity: 0; animation: sbw-flash 0.42s ease-out; }
        @keyframes sbw-flash{ 0%{ opacity: 0 } 10%{ opacity: 0.95 } 100%{ opacity: 0 } }
        /* Result popup pop-in. */
        .sbw-pop{ animation: sbw-pop 0.22s cubic-bezier(.2,.8,.3,1.2); }
        @keyframes sbw-pop{ 0%{ transform: scale(0.82); opacity: 0 } 100%{ transform: scale(1); opacity: 1 } }
        @media (prefers-reduced-motion: reduce){
          .sbw-ping{ animation: none } .sbw-plane-group{ display: none } .sbw-flash{ animation: none; opacity: 0 } .sbw-pop{ animation: none }
        }
      `}</style>
      {pending && <ResultModal data={pending} onContinue={continueFromResult} reduced={prefersReduced} />}
    </Frame>
  );
}

// ---------- small presentational helpers ----------
// Very faded sepia world map filling the whole window, behind everything.
function SepiaMapBackground() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none",
      background: "radial-gradient(125% 125% at 50% 28%, #E6D8B6 0%, #CDB98F 55%, #B09669 100%)" }}>
      <svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
        {WORLD_COUNTRIES.map((c) => (<path key={c.name} d={c.d} fill="#7A5C31" fillRule="evenodd" />))}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(125% 125% at 50% 38%, transparent 55%, rgba(74,50,20,0.4) 100%)" }} />
    </div>
  );
}
function Frame({ children }) {
  return (
    <div style={{ minHeight: "100%", position: "relative", padding: 18, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <SepiaMapBackground />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", background: PAPER, borderRadius: 14, padding: 22, border: `1px solid ${PAPER_LINE}`,
        boxShadow: "0 12px 34px rgba(74,50,20,0.32)",
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${PAPER_LINE}55 27px, ${PAPER_LINE}55 28px)` }}>
        {children}
      </div>
    </div>
  );
}
// Hand-drawn travel collage for the start screen (globe, camera, suitcase,
// compass, a postage stamp and a dashed flight path with a little plane).
function TravelCollage() {
  const ink = INK, gold = GOLD, coral = CORAL, green = GREEN, paper = PAPER;
  return (
    <svg viewBox="0 0 440 132" role="img"
      aria-label="A collage of travel things: a globe, a camera, a suitcase, a compass and a postage stamp, with a plane tracing a dashed path"
      style={{ width: "100%", maxWidth: 470, display: "block", margin: "10px auto 4px" }}>
      {/* dashed flight path across the top */}
      <path d="M16 46 Q220 2 424 50" fill="none" stroke={coral} strokeWidth="1.6" strokeDasharray="5 5" opacity="0.7" />
      <g transform="translate(322 12) rotate(20)">
        <path d="M-2 6 L18 6 L26 1 L21 8 L26 15 L18 9 L-2 9 L-6 7.5 Z" fill={ink} />
      </g>

      {/* GLOBE */}
      <g transform="translate(58 84)">
        <circle r="34" fill={paper} stroke={ink} strokeWidth="2.4" />
        <path d="M-24 -12 q10 -6 20 -2 q7 4 1 10 q-10 5 -20 0 q-6 -4 -1 -8 Z" fill={green} opacity="0.75" />
        <path d="M6 6 q11 -3 16 4 q3 6 -4 9 q-10 3 -15 -4 q-3 -6 3 -9 Z" fill={green} opacity="0.75" />
        <ellipse rx="34" ry="11" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.5" />
        <ellipse rx="13" ry="34" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.5" />
        <ellipse rx="27" ry="34" fill="none" stroke={ink} strokeWidth="1" opacity="0.32" />
        <g transform="translate(12 -8)">
          <path d="M0 0 C-6 -8 -6 -15 0 -15 C6 -15 6 -8 0 0 Z" fill={coral} stroke={ink} strokeWidth="0.9" />
          <circle cy="-9" r="2.2" fill={paper} />
        </g>
      </g>

      {/* CAMERA */}
      <g transform="translate(146 46)">
        <rect x="0" y="12" width="72" height="46" rx="7" fill={paper} stroke={ink} strokeWidth="2.4" />
        <rect x="18" y="3" width="22" height="11" rx="2.5" fill={paper} stroke={ink} strokeWidth="2" />
        <circle cx="36" cy="36" r="15.5" fill={paper} stroke={ink} strokeWidth="2.4" />
        <circle cx="36" cy="36" r="8.5" fill="none" stroke={ink} strokeWidth="1.6" />
        <circle cx="36" cy="36" r="3" fill={ink} />
        <circle cx="60" cy="22" r="3.2" fill={gold} stroke={ink} strokeWidth="1" />
        <rect x="7" y="4" width="10" height="7" rx="1.5" fill={coral} stroke={ink} strokeWidth="1.2" />
      </g>

      {/* SUITCASE */}
      <g transform="translate(232 58)">
        <path d="M15 6 q8 -11 18 0" fill="none" stroke={ink} strokeWidth="2.4" />
        <rect x="0" y="6" width="48" height="42" rx="6" fill={paper} stroke={ink} strokeWidth="2.4" />
        <line x1="12" y1="6" x2="12" y2="48" stroke={ink} strokeWidth="1.4" opacity="0.7" />
        <line x1="36" y1="6" x2="36" y2="48" stroke={ink} strokeWidth="1.4" opacity="0.7" />
        <rect x="9" y="22" width="6" height="8" rx="1" fill={gold} stroke={ink} strokeWidth="0.8" />
        <circle cx="26" cy="18" r="5" fill={coral} opacity="0.85" stroke={ink} strokeWidth="0.8" />
        <circle cx="30" cy="34" r="4" fill={green} opacity="0.85" stroke={ink} strokeWidth="0.8" />
      </g>

      {/* COMPASS */}
      <g transform="translate(324 80)">
        <circle r="30" fill={paper} stroke={ink} strokeWidth="2.4" />
        <circle r="24" fill="none" stroke={ink} strokeWidth="1" opacity="0.5" />
        {[...Array(8)].map((_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 24} y1={Math.sin(a) * 24} x2={Math.cos(a) * 29} y2={Math.sin(a) * 29} stroke={ink} strokeWidth="1.2" />; })}
        <path d="M0 -20 L5 0 L0 4 L-5 0 Z" fill={coral} stroke={ink} strokeWidth="0.8" />
        <path d="M0 20 L5 0 L0 -4 L-5 0 Z" fill={paper} stroke={ink} strokeWidth="0.8" />
        <circle r="2.6" fill={ink} />
        <text x="0" y="-14" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={ink}>N</text>
      </g>

      {/* POSTAGE STAMP */}
      <g transform="translate(392 46) rotate(8)">
        <rect x="-2" y="-2" width="44" height="52" fill={gold} opacity="0.9" />
        <rect x="2" y="2" width="36" height="44" fill={paper} stroke={ink} strokeWidth="1" />
        <g transform="translate(20 30)" stroke={ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
          <path d="M0 -16 L-6 14 M0 -16 L6 14 M-4 3 L4 3 M-7 14 L7 14 M-2.6 -6 L2.6 -6" />
        </g>
        <path d="M14 -8 l1.2 2.6 l2.8 .2 l-2.1 1.9 l.7 2.8 l-2.6 -1.5 l-2.6 1.5 l.7 -2.8 l-2.1 -1.9 l2.8 -.2 Z" fill={coral} opacity="0.85" />
      </g>
    </svg>
  );
}
// Big obvious success/failure popup that pauses play until the player clicks on.
function ResultModal({ data, onContinue, reduced }) {
  const good = data.tone === "good";
  const accent = good ? GREEN : CORAL;
  return (
    <div role="dialog" aria-modal="true" aria-label={data.title}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div className={reduced ? "" : "sbw-pop"}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${accent}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 420, width: "100%", padding: "26px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden="true">{data.emoji}</div>
        <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 26, color: accent, margin: "10px 0 6px" }}>{data.title}</h2>
        <p style={{ color: INK, fontSize: 15, lineHeight: 1.5, margin: "0 auto", maxWidth: 340 }}>{data.subtitle}</p>
        {data.fact && (
          <div style={{ marginTop: 14, background: "#fff", border: `1px dashed ${accent}`, borderRadius: 10, padding: "10px 12px", textAlign: "left" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: accent, marginBottom: 4 }}>📖 DID YOU KNOW?</div>
            <div style={{ color: INK, fontSize: 13, lineHeight: 1.45 }}>{data.fact}</div>
          </div>
        )}
        <button autoFocus onClick={onContinue}
          style={{ ...primaryBtn, marginTop: 20, background: accent, boxShadow: `0 4px 0 ${good ? "#2E7A55" : "#A93A28"}` }}>
          {data.buttonLabel}
        </button>
      </div>
    </div>
  );
}
function Stamp({ children }) {
  return <span style={{ display: "inline-block", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: CORAL, border: `1.5px solid ${CORAL}`, borderRadius: 4, padding: "3px 8px", transform: "rotate(-2deg)" }}>{children}</span>;
}
function StatCard({ label, value }) {
  return (
    <div style={{ flex: "1 1 120px", minWidth: 110, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 20, fontWeight: 800, color: CORAL }}>{value}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em", color: INK, opacity: 0.65, marginTop: 2, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: INK, opacity: 0.6, marginBottom: 8 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}
function Toggle({ options, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", border: `1.5px solid ${INK}`, borderRadius: 8, overflow: "hidden" }}>
      {options.map(([v, l]) => (
        <button key={String(v)} onClick={() => onChange(v)} style={{ padding: "8px 18px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
          background: value === v ? INK : "transparent", color: value === v ? PAPER : INK }}>{l}</button>
      ))}
    </div>
  );
}
function Polaroid({ p }) {
  return (
    <div style={{ width: 168, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, padding: 8, transform: `rotate(${(p.id.charCodeAt(0) % 5) - 2}deg)`, boxShadow: "0 3px 8px rgba(16,38,46,0.18)" }}>
      <div style={{ background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", height: 110, borderRadius: 2, overflow: "hidden" }}>
        <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={82} />
      </div>
      <div style={{ fontWeight: 700, color: INK, fontSize: 13, marginTop: 8 }}>{p.flag} {p.subject}</div>
      <div style={{ fontSize: 11, color: INK, opacity: 0.65, lineHeight: 1.35, marginTop: 4 }}>{p.fact}</div>
      <PhotoCredit photo={p.photo} />
    </div>
  );
}

const primaryBtn = { marginTop: 26, background: CORAL, color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 800, letterSpacing: "0.03em", cursor: "pointer", boxShadow: "0 4px 0 #A93A28" };
const cameraBtn = { marginTop: 12, background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 0 #2E7A55" };
