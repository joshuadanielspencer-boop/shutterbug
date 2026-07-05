import React, { useState, useRef, useEffect } from "react";
import { LOCATIONS } from "./data/locations.js";

/*
  SHUTTERBUG — A World Photo Safari  (working vertical slice)
  A spiritual successor to "Nigel's World: Adventures in Geography" (1991).
  Loop: read your editor's clue -> fly to the right city -> photograph the right
  subject before your days run out. Every correct shot teaches a geography fact.

  This is a DEMO base, not the finished game. Deliberate placeholders:
    - The world map is a STYLIZED vector, not geographically exact. The real
      build swaps in a true vector map (D3-geo + world-atlas TopoJSON, or Leaflet).
    - Landmarks are simple hand-drawn icons, not real photographs. The real build
      slots in freely-licensed photos (Wikimedia Commons / Unsplash / public domain).
    - Ten locations, hard-coded. The real build loads a larger data file + REST Countries.
  Everything runs in-memory (no storage), single file, no external calls.
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

// ---- Stylized continent polygons (0..360 x, 0..180 y). Approximate, on purpose. ----
const CONTINENTS = [
  "M40 28 L70 18 L105 20 L125 30 L128 40 L112 44 L118 55 L100 72 L80 78 L62 70 L55 58 L40 52 L30 40 L34 32 Z", // N America
  "M150 15 L170 12 L178 22 L168 34 L152 30 Z", // Greenland
  "M118 80 L130 82 L142 92 L140 105 L132 122 L122 140 L114 146 L110 128 L116 108 L108 92 L112 84 Z", // S America
  "M172 30 L188 22 L205 24 L218 30 L214 40 L200 42 L205 50 L190 52 L182 44 L172 42 Z", // Europe
  "M178 52 L205 50 L222 56 L232 72 L228 92 L214 112 L200 126 L190 120 L186 100 L176 82 L168 66 Z", // Africa
  "M214 40 L240 28 L280 20 L320 22 L350 30 L358 44 L345 58 L320 70 L300 66 L278 72 L258 66 L238 58 L220 50 Z", // Asia
  "M256 66 L262 78 L256 86 L251 76 L250 66 Z", // India peninsula
  "M300 104 L322 100 L334 110 L332 122 L318 130 L302 126 L296 114 Z", // Australia
];

const rankFor = (score) => {
  if (score >= 550) return { title: "Pulitzer-Winning Photojournalist", note: "Flawless work in the field." };
  if (score >= 400) return { title: "Senior Photojournalist", note: "Sharp eye, sharp instincts." };
  if (score >= 250) return { title: "Staff Photographer", note: "Solid, dependable coverage." };
  if (score >= 100) return { title: "Field Intern", note: "You got the shots that counted." };
  return { title: "Trainee", note: "Read the editor's clues more closely next time." };
};

export default function ShutterbugWorld() {
  const [screen, setScreen] = useState("start"); // start | play | end
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(3);

  const [assignments, setAssignments] = useState([]); // array of location ids
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState(null); // current location id (null = at airport)
  const [days, setDays] = useState(0);
  const [score, setScore] = useState(0);
  const [album, setAlbum] = useState([]); // collected {id, subject, flag, fact}
  const [msg, setMsg] = useState(null); // {type, text}
  const [flying, setFlying] = useState(null); // {fromX, fromY, toX, toY}
  const timer = useRef(null);

  const prefersReduced = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const loc = (id) => LOCATIONS.find((l) => l.id === id);
  const target = assignments.length ? loc(assignments[step]) : null;
  const currentLoc = current ? loc(current) : null;

  function startGame() {
    const shuffled = [...LOCATIONS].sort(() => Math.random() - 0.5).slice(0, count);
    setAssignments(shuffled.map((l) => l.id));
    setStep(0);
    setCurrent(null);
    setDays(difficulty === "easy" ? count * 3 : count * 2);
    setScore(0);
    setAlbum([]);
    setMsg({ type: "info", text: "Wire received from your editor. Read the clue, then fly." });
    setFlying(null);
    setScreen("play");
  }

  function travelTo(id) {
    if (id === current || flying || days <= 0) return;
    const from = current ? loc(current) : { x: 106, y: 49 }; // depart from NYC hub if at airport
    const to = loc(id);
    const finalize = () => {
      setCurrent(id);
      setDays((d) => d - 1);
      setFlying(null);
      setMsg({ type: "info", text: `Arrived in ${to.city}, ${to.country} ${to.flag}` });
    };
    if (prefersReduced) { finalize(); return; }
    setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
    timer.current = setTimeout(finalize, 850);
  }

  function takePhoto() {
    if (!currentLoc || flying) return;
    if (currentLoc.id === target.id) {
      const gain = difficulty === "easy" ? 100 : 150;
      const nextAlbum = [...album, { id: target.id, subject: target.subject, flag: target.flag, city: target.city, country: target.country, fact: target.fact, icon: target.icon }];
      setAlbum(nextAlbum);
      const done = step + 1 >= assignments.length;
      if (done) {
        const bonus = days * 50;
        setScore((s) => s + gain + bonus);
        setMsg({ type: "win", text: `Perfect shot! +${gain}, plus ${bonus} for ${days} days to spare.` });
        timer.current = setTimeout(() => setScreen("end"), 900);
      } else {
        setScore((s) => s + gain);
        setStep((n) => n + 1);
        setMsg({ type: "win", text: `Got it! +${gain}. New wire from the editor — next assignment.` });
      }
    } else {
      if (days <= 0) {
        setMsg({ type: "lose", text: `That's ${currentLoc.subject}, not what the editor wanted — and you're out of days.` });
        timer.current = setTimeout(() => setScreen("end"), 900);
      } else {
        setMsg({ type: "warn", text: `That's ${currentLoc.subject} — not the assignment. Check the clue and fly on.` });
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

          <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
            <Field label="Difficulty">
              <Toggle options={[["easy", "Easy"], ["hard", "Hard"]]} value={difficulty} onChange={setDifficulty} />
              <p style={{ fontSize: 12, color: INK, opacity: 0.6, margin: "8px 2px 0", maxWidth: 220 }}>
                {difficulty === "easy" ? "Continent named in the clue, city labels shown, more days." : "Cryptic clues, hidden city labels, fewer days."}
              </p>
            </Field>
            <Field label="Assignments">
              <Toggle options={[[3, "3"], [5, "5"]]} value={count} onChange={setCount} />
              <p style={{ fontSize: 12, color: INK, opacity: 0.6, margin: "8px 2px 0", maxWidth: 200 }}>How many photos to complete the trip.</p>
            </Field>
          </div>

          <button onClick={startGame} style={primaryBtn}>Begin the assignment ✈</button>
          <p style={{ fontSize: 11, color: INK, opacity: 0.5, marginTop: 18, lineHeight: 1.5 }}>
            Demo base · stylized map (not exact) · icons stand in for real photos · 10 sample locations
          </p>
        </div>
      </Frame>
    );
  }

  if (screen === "end") {
    const r = rankFor(score);
    return (
      <Frame>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Stamp>Roll Developed</Stamp>
          <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.08em", fontSize: 30, color: INK, margin: "10px 0 4px" }}>{album.length} / {assignments.length} shots filed</h2>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: CORAL, fontWeight: 700, margin: "6px 0" }}>{score} pts</p>
          <p style={{ color: INK, fontWeight: 700, marginTop: 6 }}>{r.title}</p>
          <p style={{ color: INK, opacity: 0.7, marginTop: 2 }}>{r.note}</p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 22 }}>
            {album.map((p) => (<Polaroid key={p.id} p={p} />))}
          </div>

          <button onClick={() => setScreen("start")} style={{ ...primaryBtn, marginTop: 26 }}>New assignment</button>
        </div>
      </Frame>
    );
  }

  // play screen
  const clue = difficulty === "easy" ? target.easy : target.hard;
  return (
    <Frame>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Field journal panel */}
        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.18em", color: INK, opacity: 0.7 }}>ASSIGNMENT {step + 1}/{assignments.length}</span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: days <= 1 ? CORAL : INK }}>◷ {days} day{days === 1 ? "" : "s"} left</span>
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
              <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}><Landmark icon={currentLoc.icon} size={78} /></div>
              <div style={{ fontWeight: 700, color: INK }}>{currentLoc.flag} {currentLoc.city}, {currentLoc.country}</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.7, marginTop: 2 }}>Subject in view: {currentLoc.subject}</div>
              <button onClick={takePhoto} disabled={!!flying} style={{ ...cameraBtn, opacity: flying ? 0.5 : 1 }}>📷 Take the photo</button>
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
                    <Landmark icon={p.icon} size={34} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: "2 1 440px", minWidth: 320 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `2px solid ${INK}`, boxShadow: "0 6px 0 rgba(16,38,46,0.15)" }}>
            <svg viewBox="0 0 360 180" style={{ width: "100%", display: "block", background: OCEAN }}>
              <defs>
                <pattern id="sea" width="360" height="180" patternUnits="userSpaceOnUse">
                  <rect width="360" height="180" fill={OCEAN} />
                  {[...Array(9)].map((_, i) => <line key={i} x1="0" y1={i * 20} x2="360" y2={i * 20} stroke={OCEAN_DEEP} strokeWidth="0.4" />)}
                  {[...Array(13)].map((_, i) => <line key={"v" + i} x1={i * 30} y1="0" x2={i * 30} y2="180" stroke={OCEAN_DEEP} strokeWidth="0.4" />)}
                </pattern>
              </defs>
              <rect width="360" height="180" fill="url(#sea)" />
              {CONTINENTS.map((d, i) => <path key={i} d={d} fill={LAND} stroke={LAND_EDGE} strokeWidth="0.8" strokeLinejoin="round" />)}

              {/* animated flight path */}
              {flying && (
                <g className="sbw-plane-group">
                  <line x1={flying.fromX} y1={flying.fromY} x2={flying.toX} y2={flying.toY} stroke={CORAL} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                  <g style={{ animation: "sbw-fly 0.85s ease-in-out forwards", offsetPath: `path('M${flying.fromX} ${flying.fromY} L${flying.toX} ${flying.toY}')` }}>
                    <text fontSize="9" fill={CORAL}>✈</text>
                  </g>
                </g>
              )}

              {/* city pins */}
              {LOCATIONS.map((l) => {
                const isCurrent = l.id === current;
                const showLabel = difficulty === "easy" || isCurrent;
                return (
                  <g key={l.id} className="sbw-pin" onClick={() => travelTo(l.id)} style={{ cursor: flying || days <= 0 ? "default" : "pointer" }}>
                    <circle cx={l.x} cy={l.y} r="5.5" fill="transparent" />
                    <circle cx={l.x} cy={l.y} r={isCurrent ? 3.2 : 2.4} fill={isCurrent ? CORAL : GOLD} stroke={INK} strokeWidth="0.7" />
                    {isCurrent && <circle cx={l.x} cy={l.y} r="5" fill="none" stroke={CORAL} strokeWidth="0.8" className="sbw-ping" />}
                    {showLabel && (
                      <text x={l.x + 4} y={l.y - 4} fontSize="6" fontFamily="ui-monospace, monospace" fill={INK} style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 1.4 }}>{l.city}</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <p style={{ fontSize: 11, color: INK, opacity: 0.55, marginTop: 8, fontFamily: "ui-monospace, monospace", letterSpacing: "0.06em" }}>
            {difficulty === "hard" ? "City names hidden — read the clue and reason it out." : "Gold = a city you can fly to.  Coral = where you are now."}
          </p>
        </div>
      </div>

      <style>{`
        .sbw-pin circle:nth-child(2){ transition: r .12s ease; }
        .sbw-pin:hover circle:nth-child(2){ r: 4; }
        .sbw-ping{ transform-box: fill-box; transform-origin: center; animation: sbw-ping 1.6s ease-out infinite; }
        @keyframes sbw-ping{ 0%{ transform: scale(0.6); opacity:.9 } 100%{ transform: scale(1.9); opacity:0 } }
        @keyframes sbw-fly{ 0%{ offset-distance: 0% } 100%{ offset-distance: 100% } }
        @media (prefers-reduced-motion: reduce){
          .sbw-ping{ animation: none } .sbw-plane-group{ display: none }
        }
      `}</style>
    </Frame>
  );
}

// ---------- small presentational helpers ----------
function Frame({ children }) {
  return (
    <div style={{ minHeight: "100%", background: OCEAN_DEEP, padding: 18, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: PAPER, borderRadius: 14, padding: 22, border: `1px solid ${PAPER_LINE}`,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${PAPER_LINE}55 27px, ${PAPER_LINE}55 28px)` }}>
        {children}
      </div>
    </div>
  );
}
function Stamp({ children }) {
  return <span style={{ display: "inline-block", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: CORAL, border: `1.5px solid ${CORAL}`, borderRadius: 4, padding: "3px 8px", transform: "rotate(-2deg)" }}>{children}</span>;
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
      <div style={{ background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", height: 110, borderRadius: 2 }}>
        <Landmark icon={p.icon} size={82} />
      </div>
      <div style={{ fontWeight: 700, color: INK, fontSize: 13, marginTop: 8 }}>{p.flag} {p.subject}</div>
      <div style={{ fontSize: 11, color: INK, opacity: 0.65, lineHeight: 1.35, marginTop: 4 }}>{p.fact}</div>
    </div>
  );
}

const primaryBtn = { marginTop: 26, background: CORAL, color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 800, letterSpacing: "0.03em", cursor: "pointer", boxShadow: "0 4px 0 #A93A28" };
const cameraBtn = { marginTop: 12, background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 0 #2E7A55" };
