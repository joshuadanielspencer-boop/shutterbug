// ===========================================================================
// MYSTERY PHOTOS — the screen. Uncle Jonah's unsorted archive.
//
// The inversion of every other mode: the photograph comes FIRST and you say
// where on Earth it was taken. See src/mystery.js for why, and for the pure
// slide-picking and scoring this file draws.
//
// Two things in here are load-bearing rather than decorative:
//
//  1. THE PHOTO CARRIES NO CAPTION UNTIL YOU HAVE GUESSED. Every other screen
//     shows subject, city and country under the picture; here that text IS the
//     answer. The credit is held back with it and shown in full on the reveal —
//     CC BY needs attribution when the image is presented to the viewer, and it
//     is, one beat later, on the same screen.
//
//  2. THE MAP IS FULLY OPERABLE WITHOUT A MOUSE (rule 4). Pointing at a map is
//     the one interaction in this game that has no natural keyboard form, so
//     there are two: arrow keys nudge a crosshair (Shift for a fine step) and
//     Enter drops the pin, AND there is a plain country list that drops the pin
//     on a country's centre. The list holds every country the world map draws,
//     not just the ones the game visits, so it is no easier than aiming.
// ===========================================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { ROBINSON_W, ROBINSON_H, eqToRobinson, robinsonToEq } from "../robinson.js";
import { COUNTRY_CONTINENT } from "../data/worldmap.js";
import { WC_ALIAS } from "../map-geometry.js";
import { INK, PAPER, PAPER_LINE, SEA, SEA_LINE, GOLD, CORAL, GREEN, OCEAN } from "../theme.js";
import { pickSlides, scorePin, roundVerdict, MAX_POINTS, SLIDES_PER_ROUND } from "../mystery.js";
import { withWidth } from "./media.jsx";

const STEP = 5;        // degrees per arrow press
const FINE = 1;        // …with Shift held

// The projected outline of the graticule, drawn once.
const grid = { v: [...Array(11)].map((_, i) => ((i + 1) * ROBINSON_W) / 12),
  h: [...Array(5)].map((_, i) => ((i + 1) * ROBINSON_H) / 6) };

export default function MysteryPhotos({ locations, profile, onExit, reduced, sfx = () => {} }) {
  const [slides] = useState(() => pickSlides(locations, profile, SLIDES_PER_ROUND));
  const [i, setI] = useState(0);
  const [pin, setPin] = useState(null);          // { x, y } in game coords
  // Set only when the pin came from the country list, where the country is KNOWN
  // rather than hit-tested. It has to be, because a country's centre is a real
  // city and a real city is usually on the coast: hit-testing the pin for
  // Copenhagen, Montevideo, Tunis or Nuuk against these simplified outlines lands
  // it a hair offshore, and the player who correctly answered "Denmark" would be
  // told their pin was in open water. 16 of the 177 countries do this.
  const [pinCountry, setPinCountry] = useState(null);
  const [result, setResult] = useState(null);    // scorePin(…) once committed
  const [tally, setTally] = useState([]);        // one result per finished slide
  const [countries, setCountries] = useState(null);
  // What the screen reader is told. React state rather than an imperative write
  // into a ref: writing textContent by hand puts a text node React doesn't know
  // about into a node React owns, and the next reconcile can reuse that node for
  // something else and carry the stray text with it. (It did — the announcement
  // reappeared at the top of the summary panel.)
  const [live, setLive] = useState("");
  const mapRef = useRef(null);

  // The 177 country outlines live in their own chunk (the main map lazy-loads the
  // same one, so this is usually already in cache by the time anyone gets here).
  useEffect(() => {
    let ok = true;
    import("../data/worldmap-robinson.js").then((m) => { if (ok) setCountries(m.WORLD_COUNTRIES_ROBINSON); });
    return () => { ok = false; };
  }, []);

  const slide = slides[i];
  const done = i >= slides.length;

  // Which country a point falls in. The browser already knows how to answer this
  // — isPointInFill is exact against the real path geometry — so there is no
  // point-in-polygon of our own to get wrong.
  const countryAt = (eq) => {
    const svg = mapRef.current;
    if (!svg || !svg.createSVGPoint) return null;
    const p = eqToRobinson(eq.x, eq.y);
    const pt = svg.createSVGPoint();
    pt.x = p.x; pt.y = p.y;
    for (const path of svg.querySelectorAll("path[data-country]")) {
      try { if (path.isPointInFill(pt)) return path.getAttribute("data-country"); } catch { /* older engines */ }
    }
    return null;
  };

  // Country centres, for the keyboard/list route.
  //
  // The obvious version of this — bounding box of the whole outline — is WRONG in
  // exactly the way CLAUDE.md rule 5 warns about, and wrong badly enough to make
  // the list unusable: France's box takes in French Guiana and Réunion and centres
  // on MALI; the USA's takes in Alaska and Hawaiʻi and centres on southern FRANCE;
  // the Netherlands lands in the mid-Atlantic and Chile in the open Pacific.
  //
  // So, in order:
  //   1. If the game visits the country, use the mean of its own landmark
  //      coordinates. Those are real, verified city positions already in the data,
  //      and they cover every country a child is at all likely to name.
  //   2. Otherwise use the bounding box of the country's LARGEST SUBPATH — its
  //      mainland — rather than of all its scattered pieces at once.
  const centres = useMemo(() => {
    if (!countries) return [];

    // 1. The country's landmarks, grouped. Two traps in averaging them:
    //      • Longitude wraps. Fiji's places sit at 177°E and 178°W, and a plain
    //        mean of those is 0°E — the Gulf of Guinea. So the mean direction is
    //        taken as a VECTOR (cos/sin) the way you average any angle.
    //      • Outliers. Chile's mean is dragged into the Pacific by Easter Island,
    //        the USA's toward the Arctic by Denali.
    //    Both are settled by snapping the mean to the NEAREST REAL LANDMARK, so
    //    the pin always lands on a place that exists rather than on an average of
    //    places that may be nowhere.
    const byCountry = {};
    for (const l of locations) {
      const k = WC_ALIAS[l.country] || l.country;
      (byCountry[k] || (byCountry[k] = [])).push(l);
    }
    const RAD = Math.PI / 180;
    const gameCentre = (ls) => {
      let cx = 0, cy = 0, lat = 0;
      for (const l of ls) { const lon = (l.x - 180) * RAD; cx += Math.cos(lon); cy += Math.sin(lon); lat += l.y; }
      const meanX = (Math.atan2(cy, cx) / RAD) + 180;
      const mean = { x: ((meanX % 360) + 360) % 360, y: lat / ls.length };
      // Snap: shortest wrap-aware separation, no need for a true great circle here.
      let best = ls[0], bestD = Infinity;
      for (const l of ls) {
        const dx = Math.abs(((l.x - mean.x + 540) % 360) - 180), dy = Math.abs(l.y - mean.y);
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = l; }
      }
      return { x: best.x, y: best.y };
    };

    // 2. Bounding-box centre of the biggest piece of an outline. Subpaths start at
    //    an "M"; the one with the most points is the mainland in every case here.
    const mainlandCentre = (d) => {
      let best = null, bestN = 0;
      for (const part of d.split(/(?=M)/)) {
        const nums = part.match(/-?\d+(?:\.\d+)?/g);
        if (!nums || nums.length < 4 || nums.length <= bestN) continue;
        bestN = nums.length;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let k = 0; k + 1 < nums.length; k += 2) {
          const x = +nums[k], y = +nums[k + 1];
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        best = robinsonToEq((minX + maxX) / 2, (minY + maxY) / 2);
      }
      return best;
    };

    return countries.map((c) => {
      const ls = byCountry[c.name];
      const eq = ls && ls.length ? gameCentre(ls) : mainlandCentre(c.d);
      return eq ? { name: c.name, eq } : null;
    }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  }, [countries, locations]);

  const announce = setLive;

  const dropPin = (eq, spoken, known = null) => {
    if (result) return;                       // the slide is already committed
    const clamped = { x: ((eq.x % 360) + 360) % 360, y: Math.max(0, Math.min(180, eq.y)) };
    setPin(clamped); setPinCountry(known);
    const c = known || countryAt(clamped);
    announce(spoken || `Pin ${c ? `on ${c}` : "on open water"}, ${Math.abs(Math.round(90 - clamped.y))}° ${clamped.y <= 90 ? "north" : "south"}, ${Math.abs(Math.round(clamped.x - 180))}° ${clamped.x >= 180 ? "east" : "west"}.`);
  };

  const onMapClick = (e) => {
    const svg = mapRef.current;
    if (!svg || result) return;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    dropPin(robinsonToEq(p.x, p.y));
  };

  const onMapKey = (e) => {
    if (result) return;
    const step = e.shiftKey ? FINE : STEP;
    const here = pin || { x: 180, y: 90 };     // first press starts at the map's centre
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      dropPin({ x: here.x + moves[e.key][0], y: here.y + moves[e.key][1] });
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && pin) { e.preventDefault(); commit(); }
  };

  function commit() {
    if (!pin || result || !slide) return;
    const country = pinCountry || countryAt(pin);
    const r = scorePin(pin, slide, country ? COUNTRY_CONTINENT[country] || null : null);
    setResult({ ...r, country });
    sfx(r.points >= 4 ? "right" : r.points >= 2 ? "stamp" : "wrong");
    announce(`${r.verdict} ${r.lesson} You scored ${r.points} of ${MAX_POINTS}.`);
  }

  function next() {
    setTally((t) => [...t, { id: slide.id, subject: slide.subject, points: result.points }]);
    setResult(null); setPin(null); setPinCountry(null); setLive(""); setI((n) => n + 1);
  }

  // ---- The summary ---------------------------------------------------------
  if (done) {
    const total = tally.reduce((s, t) => s + t.points, 0);
    return (
      <div style={wrap}>
        <div style={{ ...panel, maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <div style={eyebrow}>📷 THE ARCHIVE, SORTED</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: INK, margin: "10px 0 2px" }}>
            {total} <span style={{ fontSize: 20, opacity: 0.55 }}>/ {tally.length * MAX_POINTS}</span>
          </div>
          <p style={{ color: OCEAN, fontSize: 15, lineHeight: 1.55, margin: "6px 0 16px" }}>{roundVerdict(total, tally.length)}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", textAlign: "left" }}>
            {tally.map((t) => (
              <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderBottom: `1px solid ${PAPER_LINE}` }}>
                <span aria-hidden="true" style={{ fontSize: 15 }}>{t.points === MAX_POINTS ? "🎯" : t.points >= 3 ? "📍" : t.points === 2 ? "🧭" : "🗺️"}</span>
                {/* ::first-letter, not text-transform: capitalize — the latter
                    would also give "Christ The Redeemer". */}
                <span style={{ flex: 1, color: INK, fontWeight: 700, fontSize: 14 }} className="sbw-cap">{t.subject}</span>
                <span style={{ color: OCEAN, fontSize: 13, fontWeight: 700 }}>{t.points} / {MAX_POINTS}</span>
              </li>
            ))}
          </ul>
          <button onClick={onExit} style={btn}>Back to the desk 🧭</button>
        </div>
      </div>
    );
  }

  if (!slide) {
    return (
      <div style={wrap}>
        <div style={{ ...panel, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: INK }}>Jonah can't find the box. Try again in a moment.</p>
          <button onClick={onExit} style={btn}>Back to the desk 🧭</button>
        </div>
      </div>
    );
  }

  const truePt = eqToRobinson(slide.x, slide.y);
  const pinPt = pin ? eqToRobinson(pin.x, pin.y) : null;

  return (
    <div style={wrap}>
      {/* Announcements for a player who can't see the map move. */}
      <div aria-live="polite" style={srOnly}>{live}</div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, maxWidth: 1180, margin: "0 auto 10px" }}>
        <div style={eyebrow}>📷 UNCLE JONAH'S UNSORTED ARCHIVE</div>
        <div style={{ marginLeft: "auto", color: INK, fontSize: 13, fontWeight: 700 }}>
          Slide {i + 1} of {slides.length} · {tally.reduce((s, t) => s + t.points, 0)} pts
        </div>
        <button onClick={onExit} style={{ background: "none", border: "none", color: INK, opacity: 0.7, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Quit</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 4fr) minmax(360px, 6fr)", gap: 14, maxWidth: 1180, margin: "0 auto", alignItems: "start" }}>

        {/* ---- The slide ---- */}
        <div style={panel}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 6, overflow: "hidden", background: "#10262E" }}>
            <img src={withWidth(slide.photo.src, 900)} alt={result ? slide.subject : "An unlabelled photograph from Uncle Jonah's archive"}
              decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>

          {!result ? (
            <p style={{ color: OCEAN, fontSize: 13.5, lineHeight: 1.5, margin: "10px 2px 0" }}>
              No label, no note on the back. <b>Where in the world was this taken?</b>
            </p>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 900, color: INK, fontSize: 17 }}>{slide.flag} {slide.subject}</div>
              <div style={{ color: OCEAN, fontSize: 13.5, fontWeight: 700, marginTop: 1 }}>{slide.city}, {slide.country} · {slide.continent}</div>
              <p style={{ color: INK, fontSize: 13.5, lineHeight: 1.55, margin: "8px 0 0" }}>{slide.fact}</p>
              {/* Held back with the caption, then shown in full — CC BY wants the
                  credit wherever the picture is presented, and this is that place. */}
              <p style={{ color: INK, opacity: 0.55, fontSize: 11, margin: "8px 0 0" }}>
                Photo: {slide.photo.credit} · {slide.photo.license}
                {slide.photo.source && <> · <a href={slide.photo.source} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>source</a></>}
              </p>
            </div>
          )}
        </div>

        {/* ---- The map ---- */}
        <div style={panel}>
          <svg ref={mapRef} viewBox={`0 0 ${ROBINSON_W} ${ROBINSON_H}`}
            role="application" tabIndex={0} onKeyDown={onMapKey} onClick={onMapClick}
            aria-label="World map. Click to place your pin, or use the arrow keys to move it and Enter to place it."
            style={{ width: "100%", display: "block", borderRadius: 6, background: SEA, cursor: result ? "default" : "crosshair", outlineOffset: 2 }}>
            <g stroke={SEA_LINE} strokeWidth="0.4" fill="none" opacity="0.35" vectorEffect="non-scaling-stroke">
              {grid.v.map((x) => <line key={"v" + x} x1={x} y1={0} x2={x} y2={ROBINSON_H} />)}
              {grid.h.map((y) => <line key={"h" + y} x1={0} y1={y} x2={ROBINSON_W} y2={y} />)}
            </g>
            {countries ? countries.map((c) => (
              <path key={c.name} data-country={c.name} d={c.d} fillRule="evenodd"
                fill="#E7D3A1" stroke={INK} strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
            )) : (
              <text x={ROBINSON_W / 2} y={ROBINSON_H / 2} textAnchor="middle" dominantBaseline="central"
                fontFamily="ui-monospace, monospace" fontSize="7" fill={SEA_LINE}>Unrolling the map…</text>
            )}

            {/* The line between guess and truth is the lesson, so it is drawn
                before both pins and sits under them. */}
            {result && pinPt && (
              <line x1={pinPt.x} y1={pinPt.y} x2={truePt.x} y2={truePt.y}
                stroke={INK} strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" opacity="0.8" />
            )}
            {pinPt && (
              <g className={reduced || result ? "" : "sbw-pop"}>
                <circle cx={pinPt.x} cy={pinPt.y} r="3.2" fill={GOLD} stroke={INK} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                {/* Shape as well as colour, so the two pins stay distinguishable
                    without relying on hue (rule 4). */}
                <circle cx={pinPt.x} cy={pinPt.y} r="1.1" fill={INK} />
              </g>
            )}
            {result && (
              <g>
                <circle cx={truePt.x} cy={truePt.y} r="3.6" fill={CORAL} stroke="#FFF" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <path d={`M${truePt.x - 2} ${truePt.y} L${truePt.x + 2} ${truePt.y} M${truePt.x} ${truePt.y - 2} L${truePt.x} ${truePt.y + 2}`}
                  stroke="#FFF" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
              </g>
            )}
          </svg>

          {/* The non-pointer route. Present always, not just for keyboard users —
              a child who knows the answer shouldn't have to aim at Luxembourg. */}
          {!result && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <label htmlFor="mystery-country" style={{ color: OCEAN, fontSize: 13, fontWeight: 700 }}>…or name the country:</label>
              <select id="mystery-country" value=""
                onChange={(e) => { const c = centres.find((x) => x.name === e.target.value); if (c) dropPin(c.eq, `Pin placed on ${c.name}.`, c.name); }}
                style={{ flex: "1 1 180px", minWidth: 160, padding: "7px 9px", borderRadius: 6, border: `1px solid ${PAPER_LINE}`, background: "#FFF", color: INK, fontSize: 13, fontWeight: 700 }}>
                <option value="">Choose a country…</option>
                {centres.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* ---- Verdict / commit ---- */}
          {!result ? (
            <button onClick={commit} disabled={!pin} data-primary
              style={{ ...btn, width: "100%", marginTop: 10, opacity: pin ? 1 : 0.45, cursor: pin ? "pointer" : "default" }}>
              {pin ? "That's my guess 📍" : "Put a pin on the map first"}
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 900, color: result.points >= 4 ? GREEN : result.points >= 2 ? GOLD : CORAL, fontSize: 16 }}>{result.verdict}</span>
                <span style={{ marginLeft: "auto", fontWeight: 900, color: INK, fontSize: 15 }}>+{result.points}</span>
              </div>
              <p style={{ color: INK, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>
                Your pin was <b>{result.distance}</b> away. {result.lesson}
              </p>
              <button onClick={next} data-primary style={{ ...btn, width: "100%", marginTop: 12 }}>
                {i + 1 >= slides.length ? "See how you did →" : "Next slide →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Local styles ---------------------------------------------------------
const wrap = { minHeight: "100%", padding: "18px 16px 26px" };
const panel = { background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 10, padding: 12, textAlign: "left" };
const eyebrow = { fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL, fontWeight: 700 };
const btn = { padding: "11px 22px", borderRadius: 9, border: "none", background: CORAL, color: "#FFF",
  fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 0 #B4472F" };
const srOnly = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };
