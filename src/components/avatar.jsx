// ===========================================================================
// TRAVELER AVATARS — the layered SVG portrait, its palettes, and its editor.
//
// Pulled out of shutterbug-world.jsx as its own module for a specific reason:
// this is the piece most likely to be REPLACED. The plan is to swap the procedural
// SVG below for layered PNG art once that art exists, and doing that inside a
// 9,000-line file means reading 9,000 lines to find the seams. Here the seams are
// the exports, and the contract is small: a spec object of indices in, a portrait
// out.
//
// The spec is `{ skin, hair, hairColor, glasses, hat, shirt }`, all INDICES into
// the palettes below, stored per profile in localStorage. Keeping them as indices
// rather than colours is what lets the palettes grow without migrating saved
// profiles — and it is the same reason a PNG swap can keep every existing avatar.
//
// A profile that never opened the editor still gets a face, derived from a hash of
// its name, so every board shows a portrait from day one.
// ===========================================================================
import React, { useState, useRef, useEffect } from "react";
import { INK, OCEAN, CORAL, GREEN, PAPER, PAPER_LINE } from "../theme.js";
import { useModalFocus } from "./modal.jsx";

// FNV-1a. Only the avatar uses it — it came along from the main file rather than
// being left behind as a lone helper with one caller in another module.
const hashStr = (str) => { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

// ===========================================================================
// TRAVELER AVATARS — a layered SVG portrait built from a tiny spec object
// { skin, hair, hairColor, hat, shirt } (all indices), stored per profile in
// localStorage. Profiles that never opened the editor get a stable default
// derived from their name, so every board shows a face from day one.
// ===========================================================================
// Skin was already a good range; the rest gained a lot more variety (more hair
// styles, a much wider color wheel for hair and shirts, and an optional pair of
// glasses) so two travelers rarely look alike.
const AVATAR_SKIN = ["#F7D7C4", "#EFC3A4", "#E7B48F", "#D9A184", "#B97F5E", "#8E5B3F", "#6A4430", "#4A2E1E"];
const AVATAR_HAIRC = ["#2B2118", "#4A3325", "#5C4030", "#8A6238", "#C99C4F", "#E6CE8A", "#8A3B24", "#C4483F", "#E4873C", "#9AA0A3", "#E9E6E1", "#3E73B0", "#C25FA0", "#5FA36B", "#8E6FC1"];
const AVATAR_SHIRT = ["#E96A4C", "#2E6E75", "#3E8E5A", "#D9A036", "#8E6FC1", "#1F3D66", "#C25FA0", "#4FA6C4", "#7A8A3A", "#B23A48", "#2B2B2B", "#EDE6D2"];
const AVATAR_HAIR = ["none", "short", "buzz", "curly", "long", "afro", "ponytail", "bun", "pigtails", "mohawk", "bob", "spiky", "wavy"];
const AVATAR_HAT = ["none", "safari", "cap", "beret", "beanie", "bucket", "sunhat", "bandana", "earflap"];
const AVATAR_GLASSES = ["none", "round", "square", "sunglasses"];
const AVATAR_DIMS = [
  { key: "skin", label: "Skin", n: AVATAR_SKIN.length, swatch: (i) => AVATAR_SKIN[i] },
  { key: "hair", label: "Hair", n: AVATAR_HAIR.length, name: (i) => AVATAR_HAIR[i] },
  { key: "hairColor", label: "Hair color", n: AVATAR_HAIRC.length, swatch: (i) => AVATAR_HAIRC[i] },
  { key: "glasses", label: "Glasses", n: AVATAR_GLASSES.length, name: (i) => AVATAR_GLASSES[i] },
  { key: "hat", label: "Hat", n: AVATAR_HAT.length, name: (i) => AVATAR_HAT[i] },
  { key: "shirt", label: "Shirt", n: AVATAR_SHIRT.length, swatch: (i) => AVATAR_SHIRT[i] },
];
function defaultAvatar(name) {
  // hashStr is unsigned 32-bit — shifts must be >>> or big hashes go negative.
  // Derive every field from the array lengths so new options are reachable by
  // default, and keep hair on a real style (index ≥ 1, never "none").
  const h = hashStr("av:" + String(name || "?"));
  return {
    skin: h % AVATAR_SKIN.length,
    hair: 1 + ((h >>> 3) % (AVATAR_HAIR.length - 1)),
    hairColor: (h >>> 6) % AVATAR_HAIRC.length,
    glasses: (h >>> 9) % AVATAR_GLASSES.length === 0 ? 0 : ((h >>> 9) % 2 === 0 ? 0 : (h >>> 11) % AVATAR_GLASSES.length),
    hat: (h >>> 12) % AVATAR_HAT.length,
    shirt: (h >>> 15) % AVATAR_SHIRT.length,
  };
}
const avatarFor = (profile) => (profile && profile.avatar) || defaultAvatar(profile && profile.name);

function Avatar({ spec, size = 24, title }) {
  const v = { ...defaultAvatar("?"), ...(spec || {}) };
  const pick = (arr, i) => arr[(((i || 0) % arr.length) + arr.length) % arr.length]; // negative-safe
  const skin = pick(AVATAR_SKIN, v.skin);
  const hairC = pick(AVATAR_HAIRC, v.hairColor);
  const shirt = pick(AVATAR_SHIRT, v.shirt);
  const hair = pick(AVATAR_HAIR, v.hair);
  const hat = pick(AVATAR_HAT, v.hat);
  const glasses = pick(AVATAR_GLASSES, v.glasses);
  const clip = `sbw-av-${size}-${v.skin}${v.hair}${v.hairColor}${v.glasses}${v.hat}${v.shirt}`;
  // A hat covers the crown, so any hair that piles ON TOP of the head is hidden
  // under it (side/back hair still shows). Keeps hat + big-hair combos tidy.
  const crownHidden = hat !== "none";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"} style={{ flex: "none", verticalAlign: "middle" }}>
      {title && <title>{title}</title>}
      <defs><clipPath id={clip}><circle cx="32" cy="32" r="31" /></clipPath></defs>
      <circle cx="32" cy="32" r="31" fill="#DCE9EC" stroke="#10262E" strokeWidth="1.5" />
      <g clipPath={`url(#${clip})`}>
        {/* shoulders + shirt */}
        <path d="M12,64 C12,47 23,43 32,43 C41,43 52,47 52,64 Z" fill={shirt} />
        {/* camera on the chest — they are a photographer, after all */}
        <rect x="26" y="50" width="12" height="9" rx="2" fill="#3A3A3A" />
        <rect x="26" y="50" width="12" height="2.6" rx="1.3" fill="#C9C9C9" />
        <circle cx="32" cy="55" r="2.8" fill="#222" />
        <circle cx="32" cy="55" r="1.5" fill="#6FA8B8" />
        {/* hair that falls BEHIND the head (drawn before the head) */}
        {(hair === "long" || hair === "bob") && (<g fill={hairC}>
          <rect x="16.5" y="22" width="8" height={hair === "bob" ? 15 : 24} rx="4" />
          <rect x="39.5" y="22" width="8" height={hair === "bob" ? 15 : 24} rx="4" />
        </g>)}
        {hair === "wavy" && (<g fill={hairC}>
          <path d="M17,24 Q14,34 18,44 Q22,40 21,30 Z" />
          <path d="M47,24 Q50,34 46,44 Q42,40 43,30 Z" />
        </g>)}
        {hair === "ponytail" && (<g fill={hairC}>
          <ellipse cx="47" cy="30" rx="4.5" ry="9" transform="rotate(14 47 30)" />
        </g>)}
        {hair === "pigtails" && (<g fill={hairC}>
          <circle cx="18" cy="30" r="5" /><circle cx="46" cy="30" r="5" />
        </g>)}
        {hair === "afro" && <circle cx="32" cy="24" r="17" fill={hairC} />}
        {/* head */}
        <circle cx="32" cy="28" r="13" fill={skin} />
        {/* hair that caps OVER the head (hidden under a hat's crown) */}
        {!crownHidden && (<>
        {(hair === "short" || hair === "long" || hair === "bob" || hair === "wavy" || hair === "ponytail" || hair === "pigtails") && <path d="M19.6,24 A13,13 0 0 1 44.4,24 Z" fill={hairC} />}
        {hair === "buzz" && <path d="M21.1,21 A13,13 0 0 1 42.9,21 Z" fill={hairC} />}
        {hair === "afro" && <path d="M19.6,24 A13,13 0 0 1 44.4,24 Z" fill={hairC} />}
        {hair === "curly" && (<g fill={hairC}>
          <path d="M19.6,24 A13,13 0 0 1 44.4,24 Z" />
          <circle cx="22" cy="19" r="4.4" /><circle cx="32" cy="14.5" r="5" /><circle cx="42" cy="19" r="4.4" />
        </g>)}
        {hair === "mohawk" && <path d="M29,10 L35,10 L34,24 L30,24 Z" fill={hairC} />}
        {hair === "spiky" && (<g fill={hairC}>
          <path d="M20,24 L22,13 L26,23 Z" /><path d="M27,23 L30,11 L34,23 Z" /><path d="M35,23 L38,12 L42,24 Z" />
          <path d="M19.6,24 A13,13 0 0 1 44.4,24 Z" />
        </g>)}
        </>)}
        {/* face */}
        <circle cx="27" cy="28.5" r="1.4" fill="#10262E" />
        <circle cx="37" cy="28.5" r="1.4" fill="#10262E" />
        <path d="M27,33 Q32,37 37,33" fill="none" stroke="#10262E" strokeWidth="1.6" strokeLinecap="round" />
        {/* glasses sit over the eyes */}
        {glasses === "round" && (<g fill="none" stroke="#10262E" strokeWidth="1.3">
          <circle cx="27" cy="28.5" r="3.4" /><circle cx="37" cy="28.5" r="3.4" /><path d="M30.4,28.5 L33.6,28.5" />
        </g>)}
        {glasses === "square" && (<g fill="none" stroke="#10262E" strokeWidth="1.3">
          <rect x="23.4" y="25.6" width="7" height="5.6" rx="1.2" /><rect x="33.6" y="25.6" width="7" height="5.6" rx="1.2" /><path d="M30.4,28.4 L33.6,28.4" />
        </g>)}
        {glasses === "sunglasses" && (<g stroke="#10262E" strokeWidth="1.2">
          <rect x="23.2" y="25.4" width="7.4" height="5.6" rx="2.4" fill="#20303A" /><rect x="33.4" y="25.4" width="7.4" height="5.6" rx="2.4" fill="#20303A" /><path d="M30.6,27 L33.4,27" fill="none" />
        </g>)}
        {/* hat sits on top of everything */}
        {hat === "safari" && (<g>
          <path d="M23,18.5 Q23,9.5 32,9.5 Q41,9.5 41,18.5 Z" fill="#C8A96A" />
          <rect x="23" y="15.8" width="18" height="2.7" fill="#7A5A34" />
          <ellipse cx="32" cy="18.7" rx="16" ry="3.4" fill="#C8A96A" />
        </g>)}
        {hat === "cap" && (<g>
          <path d="M20.5,18.5 A11.5,11.5 0 0 1 43.5,18.5 Z" fill="#E96A4C" />
          <ellipse cx="42" cy="18.6" rx="8.5" ry="2.2" fill="#C24E33" />
          <circle cx="32" cy="10" r="1.4" fill="#C24E33" />
        </g>)}
        {hat === "beret" && (<g transform="rotate(-8 31 15.5)">
          <ellipse cx="31" cy="15.5" rx="11.5" ry="4.8" fill="#2E6E75" />
          <circle cx="31" cy="10.5" r="1.4" fill="#2E6E75" />
        </g>)}
        {hat === "beanie" && (<g>
          <path d="M20.5,19.5 A11.5,11.5 0 0 1 43.5,19.5 Z" fill="#3E8E5A" />
          <rect x="20.5" y="17.4" width="23" height="4.2" rx="2.1" fill="#2F6E46" />
          <circle cx="32" cy="8.8" r="2.6" fill="#2F6E46" />
        </g>)}
        {hat === "bucket" && (<g>
          <path d="M22,18.5 A10,10 0 0 1 42,18.5 Z" fill="#6E8E4C" />
          <ellipse cx="32" cy="18.7" rx="14.5" ry="3.6" fill="#5C7A3C" />
        </g>)}
        {hat === "sunhat" && (<g>
          <ellipse cx="32" cy="18.5" rx="18" ry="4.6" fill="#E7C15A" />
          <path d="M24,17.5 Q24,9 32,9 Q40,9 40,17.5 Z" fill="#F0D27A" />
          <rect x="24" y="15" width="16" height="2.6" fill="#C89A3A" />
        </g>)}
        {hat === "bandana" && (<g>
          <path d="M19.6,23 A13,13 0 0 1 44.4,23 L44,18 A13,13 0 0 0 20,18 Z" fill="#C4483F" />
          <circle cx="24" cy="20.5" r="0.9" fill="#F4ECD8" /><circle cx="32" cy="18.6" r="0.9" fill="#F4ECD8" /><circle cx="40" cy="20.5" r="0.9" fill="#F4ECD8" />
        </g>)}
        {hat === "earflap" && (<g>
          <path d="M20.5,19.5 A11.5,11.5 0 0 1 43.5,19.5 Z" fill="#4F7CA8" />
          <rect x="20.5" y="17.4" width="23" height="4.6" rx="2.3" fill="#E9E6E1" />
          <ellipse cx="21.5" cy="27" rx="3" ry="4.6" fill="#4F7CA8" /><ellipse cx="42.5" cy="27" rx="3" ry="4.6" fill="#4F7CA8" />
          <circle cx="32" cy="8.6" r="2.6" fill="#E9E6E1" />
        </g>)}
      </g>
    </svg>
  );
}

// The "Customize Traveler" modal: rename the traveler, restyle their avatar
// (one row of ◀ ▶ steppers per dimension, live preview, randomize), or remove
// them. Everything is a real button/field, so it is fully keyboard-operable.
function AvatarEditor({ name, initial, onSave, onClose, onRename, onRemove }) {
  const [spec, setSpec] = useState(() => {
    const raw = { ...defaultAvatar(name), ...(initial || {}) };
    for (const d of AVATAR_DIMS) raw[d.key] = (((raw[d.key] || 0) % d.n) + d.n) % d.n; // negative-safe
    return raw;
  });
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
  const bump = (key, n, dir) => setSpec((sp) => ({ ...sp, [key]: (sp[key] + dir + n) % n }));
  const roll = () => setSpec({
    skin: Math.floor(Math.random() * AVATAR_SKIN.length),
    hair: Math.floor(Math.random() * AVATAR_HAIR.length),
    hairColor: Math.floor(Math.random() * AVATAR_HAIRC.length),
    glasses: Math.floor(Math.random() * AVATAR_GLASSES.length),
    hat: Math.floor(Math.random() * AVATAR_HAT.length),
    shirt: Math.floor(Math.random() * AVATAR_SHIRT.length),
  });
  const arrow = (label, onClick) => (
    <button onClick={onClick} aria-label={label}
      style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
      {label.startsWith("Previous") ? "◀" : "▶"}
    </button>
  );
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`Customize ${name}'s traveler`}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }}>
      <div className="sbw-pop" style={{ background: PAPER, borderRadius: 12, padding: 20, width: "min(92vw, 380px)", maxHeight: "90vh", overflowY: "auto", textAlign: "center", border: `1px solid ${PAPER_LINE}` }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL }}>🧳 CUSTOMIZE TRAVELER</div>
        <div style={{ margin: "12px 0 4px" }}><Avatar spec={spec} size={104} title={`${name}'s traveler`} /></div>
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
        {AVATAR_DIMS.map((d) => (
          <div key={d.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 0", borderTop: `1px solid ${PAPER_LINE}` }}>
            <span style={{ fontWeight: 700, color: INK, fontSize: 13, width: 86, textAlign: "left" }}>{d.label}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {arrow(`Previous ${d.label.toLowerCase()}`, () => bump(d.key, d.n, -1))}
              <span style={{ width: 58, fontSize: 12, color: INK, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                {d.swatch && <span aria-hidden="true" style={{ width: 15, height: 15, borderRadius: "50%", background: d.swatch(spec[d.key] % d.n), border: `1px solid ${INK}` }} />}
                {d.name ? d.name(spec[d.key] % d.n) : `${(spec[d.key] % d.n) + 1}/${d.n}`}
              </span>
              {arrow(`Next ${d.label.toLowerCase()}`, () => bump(d.key, d.n, 1))}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={roll} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>🎲 Surprise me</button>
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

// AVATAR_DIMS is exported because CreateTravelerModal (still in the main file)
// builds the same row of steppers the editor does. That duplication predates this
// split and is worth collapsing one day — a shared <AvatarControls> would do it —
// but exporting the table is the honest small step rather than a speculative one.
export { AVATAR_SKIN, AVATAR_HAIRC, AVATAR_SHIRT, AVATAR_HAIR, AVATAR_HAT, AVATAR_GLASSES, AVATAR_DIMS,
  defaultAvatar, avatarFor, Avatar, AvatarEditor };
