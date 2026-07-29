// ===========================================================================
// TRAVELER AVATARS — the layered portrait and its editor.
//
// This module used to hold a procedural SVG face and its palettes. It now
// composites Joshua's painted plates: one <img> per part, absolutely positioned,
// no offsets and no per-layer scaling. That is possible because every plate is
// the same square canvas and — verified in scripts/build-avatar-layers.mjs —
// registered against the same drawing, so stacking them IS the assembly.
//
// Everything that isn't rendering lives in src/avatar-spec.js (which spec a name
// gets, how an old saved avatar is carried over) so it can be tested. Which
// plate is which lives in src/data/avatar.js, which is generated. Per CLAUDE.md
// rule 1, no content is named in this file.
// ===========================================================================
import React, { useState, useRef } from "react";
import { INK, OCEAN, CORAL, GREEN, PAPER, PAPER_LINE } from "../theme.js";
import { useModalFocus } from "./modal.jsx";
import {
  AVATAR_ROWS, PARTS, PORTRAIT, sexOf, stepSex, stepAxis,
  defaultAvatar, avatarFor, randomAvatar, normalizeAvatar, avatarLayers, focusStyle, fillHeightStyle,
} from "../avatar-spec.js";

// Below this, show the face rather than the whole bust. The plates are waist-up,
// which reads beautifully in the passport at 150px and as an unidentifiable blob
// in a 22px profile-list bullet.
const FACE_BELOW = 96;

// The circular plate the portrait sits on — the same paper-blue disc and ink
// rim the procedural avatar used, so every board it appears on is unchanged.
const DISC = { background: "#DCE9EC", border: `1.5px solid ${INK}`, borderRadius: "50%" };

// `fill` is for the customize/create previews only: it drops the plate's bottom
// margin so the jacket meets the rim of the disc instead of floating above it.
function Avatar({ spec, size = 24, title, face, fill }) {
  const layers = avatarLayers(spec);
  const crop = (face ?? size < FACE_BELOW) ? PORTRAIT : null;
  const cropCss = fill ? fillHeightStyle() : crop ? focusStyle(crop) : null;
  return (
    <div
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title || undefined}
      style={{ ...DISC, position: "relative", width: size, height: size, flex: "none",
               overflow: "hidden", display: "inline-block", verticalAlign: "middle" }}>
      {layers.map((l) => (
        <img key={l.part} src={l.src} alt="" draggable="false"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                   objectFit: "contain", ...cropCss }} />
      ))}
    </div>
  );
}

// Joshua asked for cycling rather than a grid of every option, and the grid does
// not survive the art growing anyway: five hair colours fit on one row, but the
// next delivery adds female styles and more garments, and a wall of forty boxes is
// not a choice a child can make. A stepper stays one row wide however much art
// lands.
const arrowStyle = {
  width: 38, height: 38, borderRadius: 10, border: `2px solid ${INK}`,
  background: "transparent", color: INK, fontWeight: 800, fontSize: 15,
  cursor: "pointer", flex: "0 0 auto", lineHeight: 1,
};

// Just ◀ SKIN ▶. No swatch, no option name, no "2 / 4".
//
// Joshua's call, and it is the right one for what this screen is: the child is
// looking at the BIG portrait above and pressing arrows until they like what they
// see. A thumbnail of a disembodied ear, the word "Tan", and a counter are three
// things competing with the only thing that matters, and none of them tells you
// anything the portrait doesn't show better.
//
// Rule 4 is still satisfied, and by a better route than before: the choice is
// announced to a screen reader through the portrait's own aria-label, which names
// every part, so the information is present without being clutter on screen. The
// arrows keep their own labels.
//
// `value` is the one exception, and it is shown for the SEX row alone. Every
// other row changes something you can see in the portrait; male/female is the one
// choice the picture does not fully announce on its own, and it is also the one
// that changes what the rows under it will offer, so it says which way it is set.
function PartRow({ label, value, onStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
                  padding: "7px 0", borderTop: `1px solid ${PAPER_LINE}` }}>
      <button type="button" onClick={() => onStep(-1)} style={arrowStyle}
        aria-label={`Previous ${label.toLowerCase()}`}>◀</button>
      {/* Wide enough for the longest label on one line. "OUTFIT STYLE" is twelve
          monospace characters with 0.18em of tracking and wrapped to two rows at
          the old 116, which made that row taller than its neighbours. */}
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, letterSpacing: "0.18em",
                     fontWeight: 800, color: INK, width: 152, textAlign: "center", whiteSpace: "nowrap" }}>
        {(value ?? label).toUpperCase()}
      </span>
      <button type="button" onClick={() => onStep(1)} style={arrowStyle}
        aria-label={`Next ${label.toLowerCase()}`}>▶</button>
    </div>
  );
}

// The stack of part rows plus a randomize button. Shared by the editor and the
// create-traveler popup, which used to carry two copies of the same layout.
//
// SEX comes first because it narrows what the rows under it will offer: the eyes
// and the hair are drawn per sex, the skin and the outfits are the same paintings
// for everybody. Every arrow steps inside that sex's own set (stepAxis), so a
// boy's arrows never walk into the girls' hairstyles, and switching sex carries
// each choice to its nearest equivalent rather than resetting the face.
//
// The rows themselves come from AVATAR_ROWS, which splits each part into its
// STYLE and its COLOUR wherever there is more than one style to choose. One row
// per part walked the two together — stepping "Hair" went through cut 1 in six
// colours, then cut 2 in six colours — so landing on the cut you wanted in the
// colour you wanted took up to 24 presses and knowing the order.
function AvatarControls({ spec, setSpec }) {
  const sex = sexOf(spec);
  return (
    <>
      <PartRow label="Sex" value={sex} onStep={(d) => setSpec((s) => stepSex(s, d))} />
      {AVATAR_ROWS.map((r) => (
        <PartRow key={r.key} label={r.label}
          onStep={(delta) => setSpec((s) => stepAxis(s, r.part, r.axis, delta))} />
      ))}
    </>
  );
}

// The "Customize Traveler" modal: rename the traveler, restyle their avatar, or
// remove them. Everything is a real button/field, so it is keyboard-operable.
function AvatarEditor({ name, initial, onSave, onClose, onRename, onRemove }) {
  const [spec, setSpec] = useState(() => normalizeAvatar(initial, name));
  const [renameTo, setRenameTo] = useState(name);
  const [renameErr, setRenameErr] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  const doRename = () => {
    const want = renameTo.trim();
    setRenameErr("");
    if (!want || want === name) return;
    const ok = onRename && onRename(want);
    if (!ok) setRenameErr("That name is taken — pick another.");
  };
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`Customize ${name}'s traveler`}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }}>
      <div className="sbw-pop" style={{ background: PAPER, borderRadius: 12, padding: 20, width: "min(92vw, 420px)", maxHeight: "92vh", overflowY: "auto", textAlign: "center", border: `1px solid ${PAPER_LINE}` }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL }}>🧳 CUSTOMIZE TRAVELER</div>
        {/* The preview is the point of this screen — a child is deciding what they
            look like, and the steppers below only make sense if the thing they
            change is big enough to read. Above FACE_BELOW, so this shows the whole
            bust: the jacket is one of the four things being chosen. */}
        <div style={{ margin: "12px 0 4px" }}><Avatar spec={spec} size={230} fill title={`${name}'s traveler`} /></div>
        {/* Rename */}
        {onRename && (
          <div style={{ margin: "8px 0 4px", textAlign: "left" }}>
            <label htmlFor="sbw-rename" style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.14em", color: INK, opacity: 0.6 }}>NAME</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input id="sbw-rename" value={renameTo} maxLength={20}
                onChange={(e) => { setRenameTo(e.target.value); setRenameErr(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doRename(); } }}
                style={{ flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, fontSize: 14, background: "#fff", color: INK }} />
              <button onClick={doRename} disabled={!renameTo.trim() || renameTo.trim() === name}
                style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13, cursor: renameTo.trim() && renameTo.trim() !== name ? "pointer" : "default", opacity: renameTo.trim() && renameTo.trim() !== name ? 1 : 0.5 }}>
                Rename
              </button>
            </div>
            {renameErr && <p role="alert" style={{ color: CORAL, fontSize: 12, fontWeight: 700, margin: "5px 0 0" }}>{renameErr}</p>}
          </div>
        )}
        <AvatarControls spec={spec} setSpec={setSpec} />
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={() => setSpec(randomAvatar())} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>🎲 Surprise me</button>
          <button onClick={() => onSave(spec)} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: GREEN, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Save</button>
          <button onClick={onClose} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        </div>
        {/* Remove traveler — two-step so it can't be clicked by accident. */}
        {onRemove && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${PAPER_LINE}` }}>
            {confirmRemove ? (
              <div>
                <p style={{ color: INK, fontSize: 12.5, opacity: 0.8, margin: "0 0 8px" }}>Remove <b>{name}</b> and erase all their stamps, scores, and best times? This can't be undone.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={onRemove} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: CORAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Yes, remove</button>
                  <button onClick={() => setConfirmRemove(false)} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmRemove(true)}
                style={{ background: "none", border: "none", color: CORAL, opacity: 0.85, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                🗑 Remove this traveler…
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { AVATAR_ROWS, PARTS, defaultAvatar, avatarFor, randomAvatar, normalizeAvatar,
  Avatar, AvatarControls, AvatarEditor };
