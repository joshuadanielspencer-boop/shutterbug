// ===========================================================================
// MODAL INFRASTRUCTURE — the popup plumbing that thirteen dialogs share.
//
// useModalFocus is the load-bearing part and the reason this is a module rather
// than three loose helpers: every popup in the game claims `aria-modal="true"`,
// which is a promise to assistive tech that the rest of the page is inert. Making
// that promise and not keeping it is worse than not making it, so the hook keeps
// it — it moves focus in, cycles Tab within the dialog, and restores focus to
// whatever opened it. Anything that renders a dialog must use it.
//
// ModalShell and OpenBook are the two shells built on top: a plain paper card, and
// the illustrated open-book frame with content laid on its left and right pages.
// ===========================================================================
import React, { useRef, useEffect } from "react";
import { BASE, INK, OCEAN, PAPER } from "../theme.js";

const UI = `${BASE}assets/shutterbug-ui/`;

// ---- What `aria-modal="true"` is supposed to mean ----------------------------
// Every popup in this game already claimed to be a modal. None of them behaved
// like one: with the passport open, Tab walked through all seven controls on the
// screen BEHIND it before ever reaching the passport's own Close button, and
// closing it dropped focus back to <body> instead of the button you opened it
// from. aria-modal is a promise to assistive tech that the rest of the page is
// inert — making that promise and not keeping it is worse than not making it.
//
// This hook keeps it. Three jobs, which are the same three jobs at all thirteen
// call sites, which is why it's a hook and not thirteen bits of copied code:
//   1. move focus into the dialog on open (unless an autoFocus already did),
//   2. cycle Tab / Shift-Tab within it and never out of it,
//   3. put focus back on whatever opened it when it closes.
//
// `escape: false` is for the popups a child is meant to READ, not dismiss — a
// result card and Mr O's riddle. Escaping past those skips a fact nobody saw,
// which is the same reason Enter completes a typing line before it presses
// anything (see the Enter handler up top).
function useModalFocus(ref, onClose, { escape = true } = {}) {
  // onClose is usually an inline arrow, so it's a new function every render.
  // Depending on it directly would re-run the effect constantly and yank focus
  // back to the first control while the player was tabbing.
  // Both of these go through refs for the same reason: the effect must run ONCE
  // per open. If `escape` were a dependency, a popup that flips it mid-life (the
  // arrival card, which refuses Escape until its dwell timer is up) would tear the
  // effect down and rebuild it — and the teardown restores focus to the opener,
  // yanking the player out of a dialog that's still on screen.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const escapeRef = useRef(escape);
  escapeRef.current = escape;
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement;
    // `:not([tabindex="-1"])` on EVERY branch, not just the last one. Without it
    // this matched the passport's deliberately-untabbable 1×1 file input, decided
    // that was the last focusable thing in the dialog, and so never intercepted
    // the Tab off the real last button — focus escaped to the screen behind on
    // every lap. A selector that disagrees with the browser about what's tabbable
    // is a trap with a hole in it.
    const T = ':not([tabindex="-1"])';
    const SEL = `button:not([disabled])${T}, a[href]${T}, input:not([disabled])${T}, select:not([disabled])${T}, textarea:not([disabled])${T}, [tabindex]${T}`;
    // Recomputed on every Tab rather than cached: these dialogs enable and
    // disable controls as you use them (the bag fills, a quiz answer locks), and
    // a stale list would trap focus on a button that no longer takes it.
    const items = () => [...node.querySelectorAll(SEL)]
      .filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!node.contains(document.activeElement)) {
      const first = items()[0];
      if (first) first.focus();
      else { node.setAttribute("tabindex", "-1"); node.focus(); }
    }
    const onKey = (e) => {
      if (e.key === "Escape" && escapeRef.current) { e.stopPropagation(); closeRef.current?.(); return; }
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (!node.contains(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    // A second, reactive guard: if focus lands outside the dialog by any route,
    // put it back. The keydown handler above predicts the boundary and makes the
    // cycle feel natural; this one holds the invariant even when the prediction is
    // wrong — which it was, until the selector above learned to agree with the
    // browser about what counts as tabbable.
    const onFocusIn = (e) => {
      if (node.contains(e.target)) return;
      const list = items();
      if (list.length) list[0].focus();
    };
    // Capture phase so the trap sees Tab before anything downstream can act on it.
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocusIn, true);
      // isConnected: the thing that opened this may have unmounted while it was
      // open (a mode button that got replaced), and focusing a detached node
      // silently sends focus to <body> — the very bug this is here to fix.
      if (opener && opener.isConnected && typeof opener.focus === "function") opener.focus();
    };
  }, [ref]);
}

// A dim backdrop shared by the two tool popups; closes on Escape or backdrop click.
function ModalShell({ label, onClose, maxWidth, accent = OCEAN, children }) {
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", background: PAPER, borderRadius: 16, border: `3px solid ${accent}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: maxWidth || 620, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "22px 22px 24px" }}>
        <button onClick={onClose} aria-label="Close" title="Close"
          style={{ position: "absolute", top: 10, right: 12, background: "transparent", border: "none", fontSize: 24, lineHeight: 1, color: INK, cursor: "pointer", opacity: 0.6 }}>×</button>
        {children}
      </div>
    </div>
  );
}

// A shared open-book popup: the book art fills a 3:2 frame and content is laid
// on the left and right cream pages. Closes on Escape / backdrop click.
function OpenBook({ img, label, onClose, left, right, footer }) {
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  // Content is inset well clear of the printed page edges (was hugging them).
  const pageBase = { position: "absolute", top: "17%", height: "64%", display: "flex", flexDirection: "column" };
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.66)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, zIndex: 56 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "min(900px, 95vw)", aspectRatio: "3 / 2",
          backgroundImage: `url("${UI}${img}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
          filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.5))" }}>
        <button onClick={onClose} aria-label="Close" title="Close"
          style={{ position: "absolute", top: "1%", right: "3%", background: "rgba(16,38,46,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 18, lineHeight: 1, cursor: "pointer", zIndex: 3 }}>×</button>
        <div style={{ ...pageBase, left: "15.5%", width: "29%" }}>{left}</div>
        <div style={{ ...pageBase, left: "55.5%", width: "29%" }}>{right}</div>
      </div>
      {footer}
    </div>
  );
}

export { useModalFocus, ModalShell, OpenBook };
