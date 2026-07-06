import React, { useState, useRef, useEffect } from "react";
import { LOCATIONS } from "./data/locations.js";
import { WORLD_COUNTRIES } from "./data/worldmap.js";
import { listProfiles, lastProfileName, getProfile, createProfile, setLastProfile,
  recordGame, weightedOrder, passportData, storageAvailable } from "./profiles.js";

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

// ---- Tiny synthesized sound effects (Web Audio) — no files, nothing to      ----
// ---- license, and no network. The context is created lazily on first use     ----
// ---- (always inside a click), satisfying browser autoplay rules.             ----
const SFX = (() => {
  let ctx = null;
  const ac = () => {
    if (typeof window === "undefined") return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
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
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t); src.stop(t + dur);
    return { f, g };
  };
  return {
    // Camera shutter: two quick noise clicks (mirror up, shutter close).
    shutter() {
      const c = ac(); if (!c) return; const t = c.currentTime;
      burst(c, t, 0.045, "highpass", 1800, 0.32);
      burst(c, t + 0.06, 0.05, "highpass", 1300, 0.26);
    },
    // Airplane fly-by: filtered noise whose band sweeps up then down (~0.8s).
    plane() {
      const c = ac(); if (!c) return; const t = c.currentTime;
      const { f } = burst(c, t, 0.8, "bandpass", 500, 0.11);
      f.Q.value = 0.9;
      f.frequency.setValueAtTime(300, t);
      f.frequency.linearRampToValueAtTime(1150, t + 0.4);
      f.frequency.linearRampToValueAtTime(380, t + 0.8);
    },
    // Success: two soft rising sine blips.
    ding() {
      const c = ac(); if (!c) return; const t = c.currentTime;
      [880, 1320].forEach((freq, i) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.type = "sine"; o.frequency.value = freq;
        const s = t + i * 0.09;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.22, s + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.22);
        o.connect(g); g.connect(c.destination);
        o.start(s); o.stop(s + 0.24);
      });
    },
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
  const [msg, setMsg] = useState(null); // {type, text}
  const [flying, setFlying] = useState(null); // {fromX, fromY, toX, toY}
  const [revealed, setRevealed] = useState(false); // has the current city's photo been shot?
  const [flashKey, setFlashKey] = useState(0); // bump to replay the shutter flash
  const [soundOn, setSoundOn] = useState(true);

  // Player profiles (localStorage). profileName === null means "Guest — no saving".
  const [canSave] = useState(() => storageAvailable());
  const [profiles, setProfiles] = useState(() => (canSave ? listProfiles() : []));
  const [profileName, setProfileName] = useState(() => (canSave ? lastProfileName() : null));
  const [newName, setNewName] = useState("");
  const [lastResult, setLastResult] = useState(null); // {isBest} after a recorded game
  const recorded = useRef(false);
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
    // often (a plain shuffle for guests). The most-weighted become this game's
    // shown pins; the top of those become the targets, the rest are decoys.
    const order = weightedOrder(profileName ? getProfile(profileName) : null);
    const shown = order.slice(0, mode.options);
    const targets = shown.slice(0, mode.assignments);
    setVisible(shown);
    setAssignments(targets);
    setStep(0);
    setCurrent(null);
    setDays(mode.assignments * mode.daysPer);
    setScore(0);
    setAlbum([]);
    setVisitedIds([]);
    setRevealed(false);
    setLastResult(null);
    recorded.current = false;
    setMsg({ type: "info", text: "Wire received from your editor. Read the clue, then fly." });
    setFlying(null);
    setScreen("play");
  }

  // When a game ends, record its outcome once against the active profile.
  useEffect(() => {
    if (screen === "end" && !recorded.current) {
      recorded.current = true;
      if (profileName) {
        const correctIds = album.map((p) => p.id);
        const missedIds = assignments.filter((id) => !correctIds.includes(id));
        const res = recordGame(profileName, { difficulty, score, visitedIds, correctIds, missedIds });
        setLastResult(res);
        refreshProfiles();
      }
    }
    if (screen === "start") recorded.current = false;
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  function travelTo(id) {
    if (id === current || flying || days <= 0) return;
    const from = current ? loc(current) : { x: 106, y: 49 }; // depart from NYC hub if at airport
    const to = loc(id);
    sfx("plane");
    const finalize = () => {
      const nd = Math.round((days - 1) * 10) / 10; // a flight costs one day
      setCurrent(id);
      setDays(nd);
      setRevealed(false); // a fresh city — nothing shot yet
      setVisitedIds((v) => (v.includes(id) ? v : [...v, id]));
      setFlying(null);
      if (nd <= 0) {
        setMsg({ type: "lose", text: `Touched down in ${to.city} ${to.flag} — but your travel days are spent.` });
        timer.current = setTimeout(() => setScreen("end"), 1100);
      } else {
        setMsg({ type: "info", text: `Arrived in ${to.city}, ${to.country} ${to.flag}` });
      }
    };
    if (prefersReduced) { finalize(); return; }
    setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
    timer.current = setTimeout(finalize, 850);
  }

  function takePhoto() {
    if (!currentLoc || flying || revealed || days <= 0) return;
    sfx("shutter");
    if (!prefersReduced) setFlashKey((k) => k + 1);
    setRevealed(true); // reveal the photo now that the shutter fired
    const d = Math.round((days - SHOT_COST) * 10) / 10; // a shot costs half a day
    setDays(d);
    if (currentLoc.id === target.id) {
      sfx("ding");
      const gain = MODES[difficulty].points;
      setAlbum((a) => [...a, { id: target.id, subject: target.subject, flag: target.flag, city: target.city, country: target.country, fact: target.fact, icon: target.icon, photo: target.photo }]);
      const done = step + 1 >= assignments.length;
      if (done) {
        const bonus = Math.max(0, d) * 50;
        setScore((s) => s + gain + Math.round(bonus));
        setMsg({ type: "win", text: `Perfect shot! +${gain}, plus ${Math.round(bonus)} for ${d} day${d === 1 ? "" : "s"} to spare.` });
        timer.current = setTimeout(() => setScreen("end"), 1100);
      } else if (d <= 0) {
        setScore((s) => s + gain);
        setMsg({ type: "lose", text: `Got the shot (+${gain}) — but that spent your last day. The roll's done.` });
        timer.current = setTimeout(() => setScreen("end"), 1100);
      } else {
        setScore((s) => s + gain);
        setStep((n) => n + 1);
        setMsg({ type: "win", text: `Got it! +${gain}. New wire from the editor — next assignment.` });
      }
    } else {
      if (d <= 0) {
        setMsg({ type: "lose", text: `That's ${currentLoc.subject}, not what the editor wanted — and you're out of days.` });
        timer.current = setTimeout(() => setScreen("end"), 1100);
      } else {
        setMsg({ type: "warn", text: `That's ${currentLoc.subject} — not the assignment. Half a day gone; check the clue and fly on.` });
      }
    }
  }

  // ---------- SCREENS ----------
  if (screen === "start") {
    return (
      <Frame>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", padding: "8px 4px" }}>
          <Stamp>Est. Vertical Slice</Stamp>
          <h1 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 40, color: INK, margin: "10px 0 2px" }}>Shutterbug</h1>
          <p style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: 12, color: CORAL, margin: 0 }}>A World Photo Safari</p>
          <p style={{ color: INK, opacity: 0.85, marginTop: 18, lineHeight: 1.5 }}>
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
                <button onClick={() => setScreen("passport")}
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
              {(() => {
                const p = modePlan(difficulty);
                return (
                  <>
                    <p style={{ fontSize: 13, color: INK, opacity: 0.75, margin: "10px auto 0", maxWidth: 440, lineHeight: 1.5 }}>{MODES[difficulty].blurb}</p>
                    <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: CORAL, margin: "8px 0 0", letterSpacing: "0.04em" }}>
                      {p.assignments} assignment{p.assignments === 1 ? "" : "s"} · {p.options} cities on the map · {p.assignments * p.daysPer} travel days
                    </p>
                  </>
                );
              })()}
            </Field>
          </div>

          <button onClick={startGame} style={primaryBtn}>Begin the assignment ✈</button>
          <p style={{ fontSize: 11, color: INK, opacity: 0.5, marginTop: 18, lineHeight: 1.5 }}>
            Real map (Natural Earth) · freely-licensed landmark photos · {LOCATIONS.length} locations to explore
          </p>
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
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: CORAL, fontWeight: 700, margin: "6px 0" }}>{score} pts</p>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.6, margin: "0 0 6px", letterSpacing: "0.06em" }}>{mode.label} · {Math.round(pct * 100)}% of a perfect run</p>
          <p style={{ color: INK, fontWeight: 700, marginTop: 6 }}>{r.title}</p>
          <p style={{ color: INK, opacity: 0.7, marginTop: 2 }}>{r.note}</p>

          {profileName && lastResult?.isBest && (
            <p style={{ marginTop: 10, display: "inline-block", background: GOLD, color: INK, fontWeight: 800, fontSize: 14, padding: "6px 14px", borderRadius: 20 }}>
              ★ New personal best for {profileName}!
            </p>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 22 }}>
            {album.map((p) => (<Polaroid key={p.id} p={p} />))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
            <button onClick={() => setScreen("start")} style={primaryBtn}>New assignment</button>
            {profileName && (
              <button onClick={() => setScreen("passport")} style={{ ...primaryBtn, background: "transparent", color: CORAL, border: `2px solid ${CORAL}`, boxShadow: "none" }}>
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
    return (
      <Frame>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
            <div>
              <Stamp>Passport</Stamp>
              <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 28, color: INK, margin: "8px 0 0" }}>🧳 {profile.name}</h2>
            </div>
            <button onClick={() => setScreen("start")} style={{ padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <StatCard label="Stamps earned" value={`${pp.masteredCount} / ${pp.totalCountries}`} />
            <StatCard label="Countries visited" value={`${pp.visitedCount}`} />
            <StatCard label="Trips taken" value={`${profile.games || 0}`} />
            <StatCard label="Best · Easy" value={best.easy ? String(best.easy) : "—"} />
            <StatCard label="Best · Medium" value={best.medium ? String(best.medium) : "—"} />
            <StatCard label="Best · Hard" value={best.hard ? String(best.hard) : "—"} />
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
          {currentLoc ? (
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

          {/* Album strip */}
          {album.length > 0 && (
            <div style={{ marginTop: 14 }}>
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
        @media (prefers-reduced-motion: reduce){
          .sbw-ping{ animation: none } .sbw-plane-group{ display: none } .sbw-flash{ animation: none; opacity: 0 }
        }
      `}</style>
    </Frame>
  );
}

// ---------- small presentational helpers ----------
function Frame({ children }) {
  return (
    <div style={{ minHeight: "100%", background: OCEAN_DEEP, padding: 18, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", background: PAPER, borderRadius: 14, padding: 22, border: `1px solid ${PAPER_LINE}`,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${PAPER_LINE}55 27px, ${PAPER_LINE}55 28px)` }}>
        {children}
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
