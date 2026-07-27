// ===========================================================================
// MEDIA COMPONENTS — the small, purely presentational pieces that put a picture
// on the screen. Extracted from shutterbug-world.jsx, which had grown past 9,000
// lines with every one of these sitting at the top of it.
//
// The test for what belongs here: it takes props, it renders, and it knows
// nothing whatsoever about the game. None of these touch a profile, a run, a
// score or the map — so none of them can break gameplay by being moved, and all
// of them can be read without holding the rest of the game in your head.
// ===========================================================================
import React, { useState, useRef, useEffect } from "react";
import { BASE, INK, OCEAN } from "../theme.js";

const UI = `${BASE}assets/shutterbug-ui/`;

// An illustrated badge/icon/crest from the art registry (data/art.js), with the
// emoji it replaced as the fallback. Two states come from the one colour file:
// `dim` greys it (locked / not yet earned), which is why no locked art exists.
//
// Greying is never the ONLY signal — every caller pairs it with a 🔒, a count, or
// text, because colour alone can't carry meaning (project rule 4). Always
// aria-hidden: the art repeats a name the caller has already put in real text.
function ArtBadge({ art, emoji, size, dim = false, style }) {
  const [failed, setFailed] = useState(false);
  if (!art || failed) {
    return (
      <span aria-hidden="true" style={{ fontSize: Math.round(size * 0.86), lineHeight: 1, filter: dim ? "grayscale(1)" : "none", opacity: dim ? 0.55 : 1, ...style }}>
        {emoji}
      </span>
    );
  }
  return (
    <img src={`${UI}${art}`} alt="" aria-hidden="true" loading="lazy" onError={() => setFailed(true)}
      style={{ width: size, height: size, objectFit: "contain", flex: "0 0 auto",
        filter: dim ? "grayscale(1) opacity(0.5)" : "drop-shadow(0 1px 2px rgba(16,38,46,0.28))", ...style }} />
  );
}


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
// Ask Commons for a specific render width (adds or replaces ?width=…).
const withWidth = (src, w) => src ? (src.includes("?width=") ? src.replace(/\?width=\d+/, `?width=${w}`) : src + `?width=${w}`) : src;

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

// A photo that "develops" from washed-out grey into full colour. The bloom is
// triggered on the image's OWN onLoad, not when this mounts — a remote Wikimedia
// photo frequently finished decoding after a mount-time animation had already run,
// so the effect played on an empty box and nothing was seen. Here the .sbw-develop
// class is added only once the pixels are present (and immediately for a cached
// image that's already `complete`), so the grey→colour bloom always plays over the
// real photo. Under reduced motion it's just the plain image.
function DevelopImg({ src, alt = "", reduced, imgStyle }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setLoaded(false);
    if (ref.current && ref.current.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);
  return (
    <div className={!reduced && loaded ? "sbw-develop" : undefined}>
      <img ref={ref} src={src} alt={alt} onLoad={() => setLoaded(true)} style={imgStyle} />
    </div>
  );
}

export { ArtBadge, Landmark, withWidth, Photo, PhotoCredit, DevelopImg };
