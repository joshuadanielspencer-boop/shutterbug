// ===========================================================================
// TEXT & EFFECTS — small presentational components: reading-speed typing
// (GradualText blocks its buttons until done; TypeLine never blocks), the
// results Confetti, and the Stamp chip.
//
// These reach for SFX so the typing can click as it goes; the sound module
// self-mutes off the game's Sound toggle, so there is nothing to thread through.
// Otherwise: React + theme only.
// ===========================================================================
import { useState, useRef, useEffect, useMemo } from "react";
import { OCEAN, CORAL, GOLD, GREEN, PAPER, PAPER_LINE, INK } from "../theme.js";
import { SFX } from "../audio.js";

// One typebar per letter revealed — but not literally per letter. A click every
// 24ms is a buzz saw, not a typewriter. So: skip whitespace (a space bar is a
// different, quieter action anyway) and never fire twice inside a minimum gap.
// What a child hears is fast, uneven, mechanical typing.
//
// The gap TRACKS the typing speed rather than being a fixed number of ms, so
// that character survives a change of speed. It's the ratio that makes the sound
// uneven: at ~2.4 reveals per click, roughly one letter in three sounds, and
// which one drifts. Pin the gap at a constant instead and a slower speed walks it
// toward one click per letter — that's a metronome, which is the one thing the
// effect is meant not to be. The floor keeps the fastest speeds from buzzing.
const MIN_GAP = 55;
const gapFor = (tick) => Math.max(MIN_GAP, Math.round(tick * 2.4));
function typeTick(ref, ch, minGap, mute) {
  if (mute || !ch || /\s/.test(ch)) return;
  const now = Date.now();
  if (now - ref.current < minGap) return;
  ref.current = now;
  SFX.type();
}

// Celebration confetti for a flawless result: paper pieces in the game's
// palette tumble down once and fade out. Not rendered under reduced motion.
export function Confetti({ reduced }) {
  const pieces = useMemo(() => {
    if (reduced) return [];
    const COLORS = [CORAL, GOLD, GREEN, OCEAN, "#8E6FC1"];
    return Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.9,
      dur: 2.4 + Math.random() * 1.6,
      size: 7 + Math.random() * 7,
      color: COLORS[i % COLORS.length],
      spin: (Math.random() < 0.5 ? -1 : 1) * Math.round(360 + Math.random() * 540),
      round: Math.random() < 0.3,
    }));
  }, [reduced]);
  if (!pieces.length) return null;
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 60 }}>
      {pieces.map((c, i) => (
        <span key={i} className="sbw-confetti" style={{
          left: `${c.left}%`, width: c.size, height: c.size * (c.round ? 1 : 0.6),
          background: c.color, borderRadius: c.round ? "50%" : 1,
          animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`,
          "--spin": `${c.spin}deg` }} />
      ))}
    </div>
  );
}

export function Stamp({ children }) {
  return <span style={{ display: "inline-block", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: CORAL, border: `1.5px solid ${CORAL}`, borderRadius: 4, padding: "3px 8px", transform: "rotate(-2deg)" }}>{children}</span>;
}

// Reveals its text at reading speed to encourage kids to actually read rather
// than click through. Clicking (or Enter/Space) completes the current line
// instantly, and reduced-motion users get it whole at once — so no keyboard or
// screen-reader user is ever trapped behind the animation. The full text is
// always present for assistive tech; only the visible copy animates.
export function GradualText({ text, reduced, onDone, cps = 42, style }) {
  const [n, setN] = useState(reduced ? text.length : 0);
  const doneRef = useRef(false);
  const idRef = useRef(null);
  const lastTick = useRef(0);
  const tick = Math.max(8, Math.round(1000 / cps));
  const gap = gapFor(tick);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (idRef.current) { clearInterval(idRef.current); idRef.current = null; }
    setN(text.length);
    if (onDone) onDone();
  };
  useEffect(() => {
    doneRef.current = false;
    if (reduced) { setN(text.length); doneRef.current = true; if (onDone) onDone(); return; }
    setN(0);
    let i = 0;
    idRef.current = setInterval(() => {
      i += 1;
      setN(i);
      typeTick(lastTick, text[i - 1], gap);
      if (i >= text.length) { clearInterval(idRef.current); idRef.current = null; if (!doneRef.current) { doneRef.current = true; if (onDone) onDone(); } }
    }, tick);
    return () => { if (idRef.current) clearInterval(idRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced]);
  const busy = n < text.length;
  // The full text is laid out invisibly underneath so the box takes its FINAL size
  // from the start and never grows as the words type in (both layers share one grid
  // cell). The visible layer stacks on top and reveals gradually.
  return (
    <p onClick={busy ? finish : undefined}
      onKeyDown={busy ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } } : undefined}
      role={busy ? "button" : undefined} tabIndex={busy ? 0 : undefined}
      aria-label={busy ? text : undefined} data-typing={busy ? "1" : undefined}
      style={{ cursor: busy ? "pointer" : "default", display: "grid", ...style }}>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{text}</span>
      <span style={{ gridArea: "1 / 1" }}>
        <span aria-hidden={busy ? "true" : undefined}>{text.slice(0, n)}</span>
        {busy && <span aria-hidden="true" style={{ opacity: 0.35 }}>▌</span>}
      </span>
    </p>
  );
}

// Conversation speed — the pace Uncle talks at, and the pace this component
// used to run everything at. It reads as speech, which is right for a person
// talking to you and too brisk for a fact you're meant to take in, so it's now
// the opt-IN exception rather than the default (see TALKING_CPS's callers).
export const TALKING_CPS = 45;

// A lighter typing effect for in-game prose (clues, facts, dialogue, Mr. O…):
// reveals the text at reading speed, but — unlike GradualText — it never blocks
// or disables anything around it, so the player can read and act at once. Click
// (or reduced-motion) completes it instantly; the full text is exposed to screen
// readers via aria-label while typing. Generic display text isn't wrapped in this.
//
// The default is half conversation speed, because most of what types through here
// is INFORMATION — a clue, a fact, a place's story — and a child is meant to read
// it, not watch it arrive. Dialogue should pass cps={TALKING_CPS} to opt back out.
// The default is deliberately the slow one: a new call site that forgets to choose
// is far likelier to be a fact than a line of speech, so forgetting reads too slow
// rather than too fast, and too slow is the recoverable mistake (you can click to
// finish a line; you cannot click to un-miss one).
export function TypeLine({ text, reduced, style, inline = false, cps = Math.round(TALKING_CPS / 2), onDone, mute = false }) {
  const str = text == null ? "" : String(text);
  const [n, setN] = useState(reduced ? str.length : 0);
  const idRef = useRef(null);
  const lastTick = useRef(0);
  // Read the live mute value from inside the interval (rather than closing over the
  // prop) so a bubble opening MID-line silences this line's remaining clicks without
  // restarting the reveal. This is how the assignment clue goes quiet the instant Mr
  // O pops up, instead of two typewriters racing.
  const muteRef = useRef(mute);
  muteRef.current = mute;
  const tick = Math.max(8, Math.round(1000 / cps));
  const gap = gapFor(tick);
  useEffect(() => {
    if (idRef.current) { clearInterval(idRef.current); idRef.current = null; }
    if (reduced) { setN(str.length); if (onDone) onDone(); return; }
    setN(0);
    let i = 0;
    idRef.current = setInterval(() => {
      i += 1; setN(i);
      typeTick(lastTick, str[i - 1], gap, muteRef.current);
      if (i >= str.length) { clearInterval(idRef.current); idRef.current = null; if (onDone) onDone(); }
    }, tick);
    return () => { if (idRef.current) clearInterval(idRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str, reduced]);
  const busy = n < str.length;
  const complete = () => { if (idRef.current) { clearInterval(idRef.current); idRef.current = null; } setN(str.length); if (onDone) onDone(); };
  // Block usage reserves its FINAL size up front (a hidden full-text layer under the
  // visible one, sharing a grid cell) so the box never grows as the text types in.
  // Inline usage stays in normal flow (it lives inside an already-sized sentence).
  if (inline) {
    return (
      <span onClick={busy ? complete : undefined} aria-label={busy ? str : undefined}
        data-typing={busy ? "1" : undefined}
        style={{ cursor: busy ? "pointer" : "inherit", ...style }}>
        <span aria-hidden={busy ? "true" : undefined}>{str.slice(0, n)}</span>
        {busy && <span aria-hidden="true" style={{ opacity: 0.4 }}>▌</span>}
      </span>
    );
  }
  return (
    <p onClick={busy ? complete : undefined} aria-label={busy ? str : undefined}
      data-typing={busy ? "1" : undefined}
      style={{ cursor: busy ? "pointer" : "inherit", margin: 0, display: "grid", ...style }}>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{str}</span>
      <span style={{ gridArea: "1 / 1" }}>
        <span aria-hidden={busy ? "true" : undefined}>{str.slice(0, n)}</span>
        {busy && <span aria-hidden="true" style={{ opacity: 0.4 }}>▌</span>}
      </span>
    </p>
  );
}
