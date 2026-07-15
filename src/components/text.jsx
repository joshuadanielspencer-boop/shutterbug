// ===========================================================================
// TEXT & EFFECTS — small presentational components: reading-speed typing
// (GradualText blocks its buttons until done; TypeLine never blocks), the
// results Confetti, and the Stamp chip. Pure — React + theme only.
// ===========================================================================
import { useState, useRef, useEffect, useMemo } from "react";
import { OCEAN, CORAL, GOLD, GREEN, PAPER, PAPER_LINE, INK } from "../theme.js";

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
      if (i >= text.length) { clearInterval(idRef.current); idRef.current = null; if (!doneRef.current) { doneRef.current = true; if (onDone) onDone(); } }
    }, Math.max(8, Math.round(1000 / cps)));
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
      aria-label={busy ? text : undefined}
      style={{ cursor: busy ? "pointer" : "default", display: "grid", ...style }}>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{text}</span>
      <span style={{ gridArea: "1 / 1" }}>
        <span aria-hidden={busy ? "true" : undefined}>{text.slice(0, n)}</span>
        {busy && <span aria-hidden="true" style={{ opacity: 0.35 }}>▌</span>}
      </span>
    </p>
  );
}

// A lighter typing effect for in-game prose (clues, facts, dialogue, Mr. O…):
// reveals the text at reading speed, but — unlike GradualText — it never blocks
// or disables anything around it, so the player can read and act at once. Click
// (or reduced-motion) completes it instantly; the full text is exposed to screen
// readers via aria-label while typing. Generic display text isn't wrapped in this.
export function TypeLine({ text, reduced, style, inline = false, cps = 45, onDone }) {
  const str = text == null ? "" : String(text);
  const [n, setN] = useState(reduced ? str.length : 0);
  const idRef = useRef(null);
  useEffect(() => {
    if (idRef.current) { clearInterval(idRef.current); idRef.current = null; }
    if (reduced) { setN(str.length); if (onDone) onDone(); return; }
    setN(0);
    let i = 0;
    idRef.current = setInterval(() => {
      i += 1; setN(i);
      if (i >= str.length) { clearInterval(idRef.current); idRef.current = null; if (onDone) onDone(); }
    }, Math.max(8, Math.round(1000 / cps)));
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
        style={{ cursor: busy ? "pointer" : "inherit", ...style }}>
        <span aria-hidden={busy ? "true" : undefined}>{str.slice(0, n)}</span>
        {busy && <span aria-hidden="true" style={{ opacity: 0.4 }}>▌</span>}
      </span>
    );
  }
  return (
    <p onClick={busy ? complete : undefined} aria-label={busy ? str : undefined}
      style={{ cursor: busy ? "pointer" : "inherit", margin: 0, display: "grid", ...style }}>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{str}</span>
      <span style={{ gridArea: "1 / 1" }}>
        <span aria-hidden={busy ? "true" : undefined}>{str.slice(0, n)}</span>
        {busy && <span aria-hidden="true" style={{ opacity: 0.4 }}>▌</span>}
      </span>
    </p>
  );
}
