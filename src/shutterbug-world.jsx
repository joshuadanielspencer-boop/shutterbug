import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { LOCATIONS } from "./data/locations.js";
import { WORLD_COUNTRIES, COUNTRY_CONTINENT } from "./data/worldmap.js";
// WORLD_COUNTRIES_ROBINSON (the ~290 KB Robinson-projected country outlines) is
// only used by the world map, so it's loaded lazily (see the effect below) to
// keep it out of the first paint. worldmap.js stays eager — its outlines feed the
// sepia background on every screen and the quiz's shape questions.
import { COUNTRY_INFO, COUNTRY_LAYER_CONTINENTS, COUNTRY_NATIVE, ALWAYS_RING, displayCountry } from "./data/countries.js";
import { RIVERS, LAKES, MARINE } from "./data/geography.js";
import { JOURNEYS, JOURNEY_BY_ID, journeyBox, unrolledX, closestStops } from "./data/journeys.js";
import { HUBS, TRANSPORT_BY_ID, transportOptionsFor, countryTransport, money as fmtMoney, currencyFor } from "./data/travel.js";
import { COUNTRY_PEOPLE, peopleCards, greetingMeaning } from "./data/culture.js";
import { categoryCountries, categoryMissionOK as missionOK } from "./missions.js";
import { robinson, eqToRobinson, robinsonToEq, ROBINSON_W, ROBINSON_H } from "./robinson.js";
// The pure map geometry — bounding boxes, the two antimeridian cutters, frame-aspect
// fitting, the scale-bar arithmetic. Extracted from this file (it was ~7,900 lines and
// this layer had three untested bugs in one session); tested in test/map-geometry.test.js.
import { FRAME_AR, countryKey, pathBBox, pathBBoxCached as PATH_BBOX_CACHE, isSpeckIn,
  wrapPathPacific, trimWrappedSubpaths, trimFarSubpaths, toFrameAspect, fitBox,
  eqPointFromEvent, milesPerLonDegree, niceScaleMiles } from "./map-geometry.js";
import { rnd, shuffled, withSeed, randInt } from "./rng.js";
import { flightDays, kmBetween, tourPar as par, routeCost as legCost } from "./routes.js";
import { dayNumber, dailySeed, dailyKey, shareText, DAILY_ASSIGNMENTS } from "./daily.js";
import { CATEGORIES, CATEGORY_ORDER, KIND_META, kindOf } from "./data/categories.js";
import { ANECDOTES } from "./data/anecdotes.js";
import { TUNES, tuneKeyFor } from "./data/tunes.js";
import { GRANDPA, INTRO_BEATS, SENDOFF_BEATS, NOTE_HEADER, GUIDEBOOK,
  HOMECOMING_INTRO, WRONG_REACTIONS, ACHIEVEMENT_INTRO, DREAM_FULFILLED,
  END_WIN, END_LOSE, MEET_LINES, MEET_RUN, MEET_ASK, UNLOCK_LINES, RANKUP_LINE,
  GRANDPA_WANTS, WANT_LINES, nigelFace } from "./data/grandpa.js";
import { dailyResult, recordDaily, dailyStreak } from "./profiles.js";
import { listProfiles, lastProfileName, getProfile, createProfile, setLastProfile,
  deleteProfile, renameProfile, setAvatar, setProfileFlag, recordGame, recordExplore, recordQuiz,
  weightedOrder, freshFirst, passportData, achievements, topScores, storageAvailable,
  careerRank, unlocks, UNLOCK_REQ, markCuriositySeen, curiositiesSeen, nextGoal,
  exportPassport, passportFilename, importPassportText,
  progressByContinent, troubleSpots } from "./profiles.js";
import { CURIOSITY_DECK_BY_ID, CURIOSITY_TOTAL } from "./data/curiosities.js";
import { KIT_ITEMS, KIT_BY_ID, KIT_OFFERED, KIT_TAKEN } from "./data/kit.js";
import { CONDITIONS } from "./data/conditions.js";
import { cityMissLesson, categoryMissLesson, continentMissLesson } from "./data/misses.js";
import { DIFFICULTY_ART, MODE_ART, THEME_ART, CATEGORY_ART, ACHIEVEMENT_ART,
  RANK_ART, RECORD_ART, ROUNDEL_ART, TRANSPORT_ART, SEAL_UNLOCKED, MARKER_MASTERED } from "./data/art.js";
import { HELLO_BUBBLES, HELLO_SPOTS } from "./data/hello.js";
import { MR_O, MR_O_FACTS, MR_O_RIDDLES } from "./data/mr-o.js";
import { SFX, MUSIC, speakEn, speakGreeting, speakArrival, speechAvailable } from "./audio.js";
import { BASE, OCEAN, OCEAN_DEEP, SEA, SEA_DEEP, SEA_LINE, LAND, LAND_EDGE, INK, GOLD, CORAL, GREEN, PAPER, PAPER_LINE } from "./theme.js";
import { Confetti, Stamp, GradualText, TypeLine, TALKING_CPS } from "./components/text.jsx";

// Travel-journal UI art (ChatGPT-generated PNGs) lives here; base-path aware so
// it resolves at a domain root or under a GitHub Pages subpath. Decorative only —
// every dynamic label, map region, and control stays code-rendered (see the
// asset guide). `UI + "name.png"` builds a URL for an <img> or CSS background.
const UI = `${BASE}assets/shutterbug-ui/`;

// The build this bundle came from — date and commit, stamped in by vite.config.js
// and printed faintly in the splash's corner. Guarded so the dev server (and tests,
// which don't run through Vite's define) still render something sensible.
const BUILD_ID = typeof __BUILD_ID__ === "string" ? __BUILD_ID__ : "dev";

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

// The surface every pop-up and card sits on: the atlas ink-wash multiplied over
// the paper tan, so a panel reads as a page torn from the atlas rather than a flat
// swatch. Leather was the other candidate and it's the wrong one — it's dark and
// busy, and these cards are read, not decorated; the ink the text is set in has to
// win. Spread this instead of `background: PAPER` on anything panel-shaped.
const CARD_SURFACE = {
  background: `url("${UI}map-ink-distress.png") center / cover, ${PAPER}`,
  backgroundBlendMode: "multiply, normal",
};

// Handwriting stack for Jonah's note — a bundled webfont would make this
// identical everywhere, but this degrades gracefully across Mac/Win/Linux.
const HAND = '"Caveat", "Patrick Hand", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
// The slab/typewriter face of the splash's "A World Photo Safari" sign, for UI that
// should feel like it belongs to the same artwork. All system fonts, no webfont:
// the game is an offline-capable PWA, and a font that arrives over the network is a
// font that isn't there on the iPad on a plane. American Typewriter leads because
// it ships on macOS and iPadOS, which is where this is actually played; Rockwell
// covers Windows; the Courier/monospace tail is the honest fallback everywhere else.
const TYPEWRITER = '"American Typewriter", "Rockwell", "Courier New", ui-monospace, monospace';
// Mr. O has five looks; hand them out in a reshuffled cycle so he never repeats
// until all five have appeared, and looks different each time he pops up.
const MR_O_IMAGES = ["mr-o-1.png", "mr-o-2.png", "mr-o-3.png", "mr-o-4.png", "mr-o-5.png"];
// The fewest arrivals between two Mr O appearances — his "no more than once every
// five stops" speed limit. See maybeMrO.
const MRO_MIN_GAP = 5;
// Shown on the first run and every 5th after: how to research a clue.
// Worded so it reads naturally after Mr O's "Oh! Did you know…" lead.
const MR_O_FIELDGUIDE_TIP = "if a clue's got you stumped, you can tap the Field Guide on the right and I'll research it for you? It costs half a travel day (free on a Scout trip!).";
let _mrOQueue = [];
function nextMrOImage() {
  if (_mrOQueue.length === 0) {
    _mrOQueue = [...MR_O_IMAGES];
    for (let i = _mrOQueue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [_mrOQueue[i], _mrOQueue[j]] = [_mrOQueue[j], _mrOQueue[i]]; }
  }
  return _mrOQueue.pop();
}


/*
  SHUTTERBUG — A World Photo Safari  (working vertical slice)
  A spiritual successor to "Jonah's World: Adventures in Geography" (1991).
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


// ---- Difficulty tiers. Each assignment is a two-step drill-down: pick the ----
// ---- right CONTINENT on the world map, then the right CITY among the target ----
// ---- plus `cityDecoys` same-continent decoys. `assignments` = how many. ----
// ---- Points per photo are HIGHER on Easy (younger players). `labels`: "all" ----
// ---- names every city, "smart" hides names until hover/focus. `clue` picks ----
// ---- the clue text.
// `catShare` = the chance each assignment is an open "photograph any {category}
// in {continent}" mission instead of a specific-subject one. Kept LOW on purpose
// and rarer as difficulty rises (Easy an occasional change of pace; Medium/Hard
// almost always specific), so the game is mostly about piecing together a real
// clue to a real place rather than "find one of many." The specific missions use
// each location's easy/medium/hard clue ladder (spelled out → cryptic).
// `slack` = spare travel days baked into the budget on top of the clean-route
// cost (distance flights + one shot each); banking them at the end is the day
// bonus, and it shrinks with difficulty.
// `research` gates the ½-day Research hint by tier: "free" (Easy — a leg-up for
// young players, no day cost), "half" (Medium — costs SHOT_COST), "off" (Hard —
// no hand-holding). `blurb` is the one-line explainer on the start screen.
// Scoring is deliberately SMALL and legible (no inflated "750 points!"). Each
// filed shot is worth a few points; harder tiers pay LESS per shot but ask for
// more shots, so a young player on Easy and an adult on Hard land on similar
// totals — the leaderboard prints the difficulty, so that's where the bragging
// rights live. `points` = points per filed shot. On top: a small day-bonus for
// efficient routes and ½-point extra credit per correct homecoming review
// question (see dayBonus / QUIZ_BONUS below).
// Difficulty tiers, mapped to age/grade bands. Internal keys stay easy/medium/hard
// (so saved best scores keep working); `scout` is the new gentlest tier. The
// player-facing names are Scout / Explorer / Adventurer / Expert.
const MODES = {
  scout:  { label: "Scout",    ages: "K–2 · ages 5–7",    assignments: 3, cityDecoys: 1, daysPer: 5, points: 3, slack: 10, labels: "all", clue: "easy",   catShare: 0.12, countryOpts: 4, research: "free", hints: true, readAloud: true, flashOnWrong: true, sayOnHover: true,
            blurb: "A gentle 3-shot outing for the youngest travelers. Clues name the country, every pin is labelled, clues are read aloud, wrong guesses gently flash the right answer, and there's no real time pressure." },
  easy:   { label: "Explorer", ages: "grades 3–5 · ages 8–10", assignments: 5, cityDecoys: 2, daysPer: 3, points: 3, slack: 6, labels: "all",   clue: "easy",   catShare: 0.10, countryOpts: 5, research: "half", hints: true, sayOnHover: true,
            blurb: "A short 5-shot trip. Clues name the country, every pin is labelled, a category badge tells you what kind of place it is, wrong guesses get warm/cold hints, and Research for a Clue costs just ½ a day." },
  medium: { label: "Adventurer", ages: "grades 6–8 · ages 11–13", assignments: 9, cityDecoys: 3, daysPer: 3, points: 2, slack: 6, labels: "smart", clue: "medium", catShare: 0.05, countryOpts: 5, research: "half", hints: true,
            blurb: "A 9-shot expedition. Clues name the country but hide the continent, so you must know where in the world it sits; labels appear on hover; a category badge still helps; Research costs ½ a day." },
  hard:   { label: "Expert",   ages: "high school & up", assignments: 14, cityDecoys: 4, daysPer: 2, points: 1, slack: 5, labels: "smart", clue: "hard",   catShare: 0.03, countryOpts: 7, research: "off",  hints: false,
            blurb: "A long 14-shot grand expedition for experts. Pure-context clues — no place names, no country labels on the map, no category badge, no warm/cold hints, and no Research. You're on your own." },
};
// The flight across the world map, in milliseconds, and how long the plane token
// spends growing out of its origin (and shrinking onto its destination) at each
// end. Read by the flight timers, the landing sound, and the CSS keyframes — all
// three have to agree or the plane lands at a different moment than the map says.
const FLIGHT_MS = 5000;
const PLANE_SCALE_MS = 2000;
// The same number in the units each consumer wants. The takeoff/landing sounds
// take their length from PLANE_SCALE_SEC and the sbw-hop keyframes take their
// percentages from PLANE_SCALE_PCT, so "how long does the plane take to grow"
// is answered in exactly one place. Everything below is derived — don't hand-
// write a percentage into the keyframes again.
const PLANE_SCALE_SEC = PLANE_SCALE_MS / 1000;
const PLANE_SCALE_PCT = (100 * PLANE_SCALE_MS) / FLIGHT_MS;

// A small efficiency reward: +1 point per 2 full travel days you bank, capped so
// it never dominates the shot points. QUIZ_BONUS is the ½-point extra credit each
// correct homecoming review question adds to the trip score.
const DAY_BONUS_CAP = 3;
const dayBonus = (days) => Math.min(DAY_BONUS_CAP, Math.floor(Math.max(0, days) / 2));
// A "perfect shot" is one filed on the FIRST subject-click at the destination — no
// wrong guess (the same first-try notion the passport marks "first" and the Daily
// share card counts). It earns a small flat bonus on top of the shot's points, so
// precision is rewarded — worth proportionally the most on Expert, where a shot is
// only 1 point to begin with. Wrong-guess shots still score, just without this.
const PERFECT_BONUS = 1;
const QUIZ_BONUS = 0.5;
// Round a score to at most one decimal place (quiz extra credit is in halves).
const tidyScore = (n) => Math.round(n * 10) / 10;
// "1 point", "2 points" — never "+1 points". A child reading the screen aloud hears
// the mistake immediately, and this is a teaching tool. Half-points from the review
// quiz take the plural ("0.5 points"), which is correct: only exactly one is singular.
const pts = (n) => `${tidyScore(n)} point${Math.abs(n) === 1 ? "" : "s"}`;
const MODE_ORDER = ["scout", "easy", "medium", "hard"];
// Uncle's face reacts to the difficulty you pick on the meet screen — warmer and
// gentler at the bottom, more impressed / wide-eyed as it climbs (see NIGEL_MOOD).
const DIFFICULTY_MOOD = { scout: "diffScout", easy: "diffEasy", medium: "diffMedium", hard: "diffHard" };

const modePlan = (key) => {
  const m = MODES[key];
  return { ...m, assignments: Math.min(m.assignments, LOCATIONS.length) };
};

// Taking a photo (right or wrong) costs half a travel day, so a snapshot is a
// real decision, not a free guess.
const SHOT_COST = 0.5;

// The traveler's home airport — where the very first flight departs from.
const HUB = { x: 106, y: 49 };

// Flight costs and the Grand Tour's par live in src/routes.js, so `npm test` can
// exercise the real routing rules (see the note there on why par must be exact).

// ---- Grand Tour mode: instead of one assignment at a time, you get a whole ----
// ---- itinerary of targets across several continents on ONE shared day budget, ----
// ---- fulfilled in ANY order. Flying to a new continent costs a distance-based ----
// ---- number of days (see flightDays); photographing another target on the ----
// ---- continent you're already on is just the SHOT_COST — so grouping ----
// ---- same-continent targets and planning an efficient route saves days. ----
// ---- `reqs` = itinerary length; `slack` = spare days. ----
// The Grand Tour is the ROUTE mode. Assignments is the deduction game — one clue
// at a time, the next one hidden. Here you're told everything up front: what, and
// where. The only question left is the ORDER, so that's the whole game.
//
// Which means the day budget has to be tight enough that ordering actually
// decides the outcome. `slack` is spare days on top of a PERFECT route (see
// tourPar): fly the best possible circuit and you bank `slack` days; fly a lazy
// one — Asia, then South America, then back to Asia — and you run out.
//
// `points` = per target filed. `dayPoints` = per whole day you bring home. On the
// harder tiers a banked day is worth as much as a photograph, which is the whole
// argument of the mode: an efficient route IS the achievement.
const TOUR_MODES = {
  scout:  { reqs: 3, catShare: 0.12, labels: "all",   clue: "easy",   points: 2, dayPoints: 1, slack: 5 },
  easy:   { reqs: 4, catShare: 0.10, labels: "all",   clue: "easy",   points: 2, dayPoints: 1, slack: 4 },
  medium: { reqs: 5, catShare: 0.05, labels: "smart", clue: "medium", points: 2, dayPoints: 1, slack: 3 },
  hard:   { reqs: 6, catShare: 0.03, labels: "smart", clue: "hard",   points: 1, dayPoints: 2, slack: 2 },
};
// Leaving the route you committed to costs a day. You may still do it — sometimes
// you must — but it's a real price, so the plan is a decision and not a formality.
const DEVIATION_COST = 1;

// PAR — the cheapest possible flight cost for a set of continents, starting from
// the home airport. This is the number the player is playing against, so it has to
// be the TRUE optimum, not a greedy guess: a nearest-neighbor route is often
// beatable, and a "par" you can beat by simply thinking about it is worse than no
// par at all. At most six continents, so all 720 orders are checked exactly.
const tourPar = (conts) => par(conts, CONTINENT_PIN, HUB);
const routeCost = (order) => legCost(order, CONTINENT_PIN, HUB);

// Best achievable Grand Tour score: every target filed, every slack day brought
// home (which needs a par route AND no wrong shots), and full marks on the quiz.
const tourMaxScore = (nReqs, difficulty) => {
  const tm = TOUR_MODES[difficulty];
  // The review now asks one question per photo brought home, so the quiz ceiling is
  // nReqs, not a flat 5. Left at 5 this under-reported a long perfect run as short of
  // 100% (the score includes bonuses the max didn't count).
  return nReqs * tm.points + tm.slack * tm.dayPoints + nReqs * QUIZ_BONUS;
};

// ---- Themed Expeditions: guided, curated Grand Tours around a single learning ----
// theme (all wildlife, all volcanoes…). Each is a Grand Tour whose specific targets
// are drawn from the theme, with an intro "lesson". `pick` selects the theme's
// members; the itinerary favors one target per continent for a round-the-world feel.
const EXPEDITIONS = [
  { id: "wildlife", title: "Wildlife Safari", emoji: "🦁", lesson: "Photograph the world's most amazing animals — each a star of its own home. From pandas to penguins, every stop is a creature found in one special place.", pick: (l) => l.category === "wildlife" },
  { id: "volcano", title: "Ring of Fire", emoji: "🌋", lesson: "Chase the planet's volcanoes and hot springs. Most ring the Pacific Ocean, along the cracks where Earth's giant plates grind together.", pick: (l) => l.category === "volcano" },
  { id: "mountain", title: "Roof of the World", emoji: "🏔️", lesson: "Climb to the highest places on Earth. Mountains rise over millions of years where the ground is slowly pushed and folded upward.", pick: (l) => l.category === "mountain" },
  { id: "waterfall", title: "Chasing Waterfalls", emoji: "💦", lesson: "Follow rivers to the edge and over it! Waterfalls form where a river crosses from hard rock to soft rock that wears away faster.", pick: (l) => l.category === "waterfall" },
  { id: "ruins", title: "Ancient Wonders", emoji: "🏛️", lesson: "Visit the ruins of long-ago peoples and see the astonishing things they built — all without a single modern machine.", pick: (l) => l.category === "ruins" },
  { id: "heritage", title: "World Heritage", emoji: "🌐", lesson: "Tour places so special that the whole world agreed to protect them: UNESCO World Heritage Sites, treasures for everyone.", pick: (l) => (l.tags || []).includes("unesco") },
];

const BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
// Each continent gets its own color on the world map — the player picks a
// continent by its color/shape, with no text labels (the easy clue names it,
// and every clickable region carries an aria-label for screen readers).
const CONTINENT_COLOR = {
  "North America": "#3B76C9", // blue
  "South America": "#4CA362", // green
  "Africa": "#E39A3E",        // orange
  "Europe": "#8E6BB0",        // purple
  "Asia": "#D2564B",          // red
  "Oceania": "#E9C33F",       // yellow
  "Antarctica": "#EDEDE6",    // white
};
// The world (continent-selection) map is a Robinson projection. Its viewBox is
// this tall, with the ~182.6-tall map centerd in it — so it fills the square frame
// with a gentle stretch and blank margins top/bottom (and rounded blank corners).
// A taller viewBox scales the map DOWN vertically within the square frame: 262→288
// compresses it ~10% so the world reads less stretched/elongated.
// The world-map crop, computed in Robinson space so the framing is exact:
//  • left edge sits at Hawaii's longitude (Hawaii flush left),
//  • bottom edge at the South Pole (Antarctica flush with the bottom),
//  • the northernmost land (~83.7°N, Greenland/Russia) sits ~10% down from the top.
// Left edge a touch EAST of Hawaiʻi, trimming the empty east-Pacific margin (Hawaiʻi
// itself is a speck and may sit right on the edge — that's fine).
const _LEFT_X = eqToRobinson(24.5, 70.1).x + 14;
const _NORTH_LAND_Y = eqToRobinson(180, 6.3).y;    // ~83.7°N — northernmost land
// Bottom edge clips Antarctica's deepest ice (~81°S) so the continent's coastline
// sits FLUSH along the frame bottom (a real shape, blue ocean on either side) rather
// than floating with its single southern tip touching.
const _ANT_SOUTH = eqToRobinson(180, 171).y;       // ~81°S
const _WORLD_TOP = (_NORTH_LAND_Y - 0.05 * _ANT_SOUTH) / 0.95; // 5% ocean margin above the northernmost land
// Right edge at New Zealand's east coast — the map's rightmost land in this
// re-centerd projection (NZ sits at lower latitude than Russia's far east, so it
// projects a little further right). Russia stays a hair inside the edge; Oceania is
// no longer clipped.
const _RIGHT_X = eqToRobinson(357, 127).x + 3;
const WORLD_BOX = { x: _LEFT_X, y: _WORLD_TOP, w: _RIGHT_X - _LEFT_X, h: _ANT_SOUTH - _WORLD_TOP };


// The Robinson map outline (filled as ocean) and a light graticule, both static.
const ROBINSON_OUTLINE = (() => {
  const pts = [];
  for (let lat = 90; lat >= -90; lat -= 5) pts.push(robinson(180, lat));  // right meridian, top→bottom
  for (let lat = -90; lat <= 90; lat += 5) pts.push(robinson(-180, lat)); // left meridian, bottom→top
  return "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L") + "Z";
})();
const ROBINSON_GRATICULE = (() => {
  const lines = [];
  for (let lon = -150; lon <= 150; lon += 30) { // curved meridians
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 5) pts.push(robinson(lon, lat));
    lines.push("M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L"));
  }
  for (let lat = -60; lat <= 60; lat += 30) { // straight parallels
    const a = robinson(-180, lat), b = robinson(180, lat);
    lines.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
  }
  return lines;
})();


const CONTINENT_ORDER = ["North America", "South America", "Europe", "Africa", "Asia", "Oceania", "Antarctica"];
// Only offer continents that actually have locations, so a continent added to the
// data later (e.g. Antarctica) lights up automatically once it has content.
const CONTINENTS = CONTINENT_ORDER.filter((c) => LOCATIONS.some((l) => l.continent === c));

// Per-continent zoom box (SVG viewBox), derived from that continent's locations.
// It is a SQUARE so it fills the square map frame with no distortion, sized to
// contain every location on the continent (plus breathing room) and centerd on
// them. For a wide, scattered continent (Oceania, Antarctica) the square can spill
// past the map edges into open ocean — that's fine, the frame just shows more sea.
// Antarctica is drawn on a south-polar relief image (a square plate), not the
// equirectangular projection — so it shows the true round continent, not a sliver.
const ANT_PLATE = 200; // the polar plate is a 200x200 square in its own units
const CONTINENT_META = (() => {
  const meta = {};
  for (const c of CONTINENTS) {
    if (c === "Antarctica") { meta[c] = { mode: "polar", box: { x: 0, y: 0, w: ANT_PLATE, h: ANT_PLATE } }; continue; }
    // Oceania is Pacific-centerd: pull its eastern-Pacific points (Hawaiʻi, Bora
    // Bora, Easter I., x<180) across the antimeridian so the region reads as one
    // block instead of being split to opposite edges of a world map.
    const wrap = c === "Oceania";
    const locs = LOCATIONS.filter((l) => l.continent === c);
    const xs = locs.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = locs.map((l) => l.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    if (c === "Asia") {
      // Asia's landmarks span far more longitude than latitude. The old box was
      // wider than the atlas frame, so it letterboxed top/bottom and the relief
      // plate spilled into the bands — showing Africa and Australia to the south and
      // Africa/Europe to the west. Set the height FROM the frame's own aspect (like
      // North America) so the box fills the frame with no letterbox and no spill; the
      // vertical stretch (mapStretchY) then un-smushes the high-latitude squish.
      const w = Math.max(40, (maxX - minX) * 1.0);
      const h = w / FRAME_AR;
      // The frame-aspect box is taller than Asia's content, so anchor its SOUTH edge
      // just below the southernmost landmark (Indonesia): the surplus height then
      // falls into the empty Arctic to the north instead of dragging Australia and the
      // Horn of Africa into the bottom corners.
      const yTop = (maxY + 0.05 * (maxY - minY)) - h;
      meta[c] = { mode: "equirect", box: { x: cx - w / 2, y: yTop, w, h }, cx, cy };
      continue;
    }
    if (c === "Europe") {
      // Europe's landmarks span ~72° of longitude (Iceland → Kazan) but only ~34°
      // of latitude, so the old square box padded huge margins of ocean top and
      // bottom — pulling Greenland, half of Africa and a slab of Asia into frame.
      // Hug the content instead (a wide, short box); the frame takes the box's
      // aspect ratio, so nothing distorts.
      const w = Math.max(40, (maxX - minX) * 1.04);
      const h = Math.max(40, (maxY - minY) * 1.28); // some headroom for the country labels
      // Europe is the one continent whose surplus is not symmetrical in VALUE: the
      // frame is wider than the content, so latitude gets padded either way — but
      // padding NORTH costs empty Arctic ocean while padding SOUTH costs a band of
      // the Sahara and the Middle East, which look like clickable continents and
      // aren't. Bias the whole view north and the surplus lands where nothing is.
      const northBias = 1.5;
      // And the same trick east-west. Padding WEST costs open Atlantic; padding EAST
      // costs the Caucasus, Kazakhstan and the top of the Middle East, which read as
      // clickable continents and aren't. Biasing west puts the right edge just past
      // the Turkish border and the surplus out over empty ocean.
      //
      // This does push Kazan (lon 49) off the frame — but nothing breaks, because the
      // continent map is where you pick a COUNTRY, not a city, and Russia still fills
      // the whole north-east corner. Kazan's own pin lives on Russia's country map,
      // which is a different box entirely.
      const westBias = 5.5;
      meta[c] = { mode: "equirect", box: { x: cx - w / 2 - westBias, y: cy - h / 2 - northBias, w, h }, cx, cy, pad: 0.02 };
      continue;
    }
    if (c === "South America") {
      // Tall and narrow: 47° of longitude against 62° of latitude. The default
      // square box padded that to 84° and then the viewBox pad widened it again, so
      // the continent floated in a third of a hemisphere of empty ocean. Hug the
      // latitude (the constrained axis) and let the width fall where it likes — the
      // frame is wider than any tall continent, so the flanking ocean is inherent;
      // what was fixable was the room above Colombia and below Patagonia.
      const w = Math.max(40, (maxX - minX) * 1.06);
      const h = Math.max(40, (maxY - minY) * 1.28);
      meta[c] = { mode: "equirect", box: { x: cx - w / 2, y: cy - h / 2, w, h }, cx, cy, pad: 0.03 };
      continue;
    }
    if (c === "Africa") {
      // Africa is TALLER than it is wide, so the old square box padded wide margins
      // of Atlantic and Indian ocean and let ~12° of Europe/Mediterranean creep in
      // up north. Hug the content: a near-square box tight to the landmarks — and
      // tighter still than the first pass, which still left a rim of empty ocean.
      const w = Math.max(40, (maxX - minX) * 1.04);
      const h = Math.max(40, (maxY - minY) * 1.06);
      meta[c] = { mode: "equirect", box: { x: cx - w / 2, y: cy - h / 2, w, h }, cx, cy };
      continue;
    }
    if (c === "North America") {
      // The default square padded a ~100°-wide span to a ~135° square, floating the
      // continent in a sea of ocean and sky. Hug the content instead, and set the
      // height to the frame's own aspect so the relief plate fills the frame with no
      // letterboxed band. Hawaiʻi (a US state, filed here with North America) sits
      // just inside the western edge, so it stays on-map and clickable.
      const w = Math.max(40, (maxX - minX) * 1.06);
      const h = w / FRAME_AR;
      meta[c] = { mode: "equirect", box: { x: cx - w / 2, y: cy - h / 2, w, h }, cx, cy };
      continue;
    }
    if (wrap) {
      // Oceania sprawls ~120° of longitude (Australia to Rapa Nui) but only ~64° of
      // latitude. Forcing it into a SQUARE — as every other continent is — made the
      // square as tall as it was wide, so the map had to show the north Pacific rim
      // and the Antarctic coast just to fit, and squeezed the country labels into
      // the middle. Its box hugs the content instead; the frame takes the box's
      // aspect ratio, so nothing is distorted.
      const w = Math.max(40, (maxX - minX) * 1.10);
      const h = Math.max(40, (maxY - minY) * 1.28);
      meta[c] = { mode: "wrap", box: { x: cx - w / 2, y: cy - h / 2, w, h }, cx, cy };
      continue;
    }
    const side = Math.min(360, Math.max(40, Math.max(maxX - minX, maxY - minY) * 1.35));
    meta[c] = { mode: "equirect", box: { x: cx - side / 2, y: cy - side / 2, w: side, h: side }, cx, cy };
  }
  return meta;
})();

// ---- Country-map layer (Medium/Hard): after the continent, pick the COUNTRY, ----
// ---- then the map zooms into it to choose the landmark. Derived from the data: ----
// ---- which countries each layer-continent has, each country's outline path, and ----
// ---- a square zoom box around that country's landmarks. ----
const WC_BY_NAME = Object.fromEntries(WORLD_COUNTRIES.map((c) => [c.name, c.d]));
// A few location country names differ from the world-map polygon names; map them
// so the country outline/border can still be drawn. (Singapore has no polygon — a
// tiny island — so it simply shows a marker with no border, which is fine.)
const WC_ALIAS = { "United States": "United States of America" };
const wcPath = (country) => WC_BY_NAME[country] || WC_BY_NAME[WC_ALIAS[country]];



// The sticker book's fixed page layout: every country in the game, grouped by
// continent — including countries the traveler hasn't touched yet, so the empty
// slots show what's left to collect.
const STICKER_PAGES = (() => {
  const seen = {};
  for (const l of LOCATIONS) {
    if (!seen[l.country]) seen[l.country] = { country: l.country, flag: l.flag, continent: l.continent };
  }
  const pages = CONTINENTS.map((cont) => ({
    continent: cont,
    countries: Object.values(seen).filter((c) => c.continent === cont).sort((a, b) => a.country.localeCompare(b.country)),
  })).filter((p) => p.countries.length);
  return pages;
})();

const COUNTRY_FLAG = {}; // country -> flag emoji (first landmark's flag)
for (const l of LOCATIONS) if (!COUNTRY_FLAG[l.country]) COUNTRY_FLAG[l.country] = l.flag;
// country -> a representative local greeting (first landmark that has one), so the
// culture card can teach "how they say hello" even before you pick a city.
const COUNTRY_GREETING = {};
for (const l of LOCATIONS) if (!COUNTRY_GREETING[l.country] && l.greeting && l.greeting.text) COUNTRY_GREETING[l.country] = l.greeting;
const LAYER_COUNTRY_LIST = {}; // continent -> [country names that have landmarks]
const COUNTRY_LOCS = {};       // continent -> { country -> [location ids] }
const COUNTRY_META = {};       // "continent|country" -> { box, cx, cy }  (keyed per
// continent so a transcontinental country — e.g. Russia, with landmarks in both
// Europe and Asia — zooms to the right region for whichever continent you're on).

// A landmark usually sits in one country, but a few straddle a border (e.g.
// Niagara Falls on the Canada–US line). `countries` lists every country it can be
// reached from; `country` stays the primary (for its flag/greeting). Picking ANY
// of its countries in the country layer counts as correct.
const countriesOf = (l) => (l.countries && l.countries.length ? l.countries : [l.country]);

(() => {
  for (const cont of COUNTRY_LAYER_CONTINENTS) {
    const wrap = CONTINENT_META[cont] && CONTINENT_META[cont].mode === "wrap"; // Oceania: Pacific-centerd
    const byC = {};
    for (const l of LOCATIONS) if (l.continent === cont) for (const c of countriesOf(l)) (byC[c] = byC[c] || []).push(l);
    LAYER_COUNTRY_LIST[cont] = Object.keys(byC);
    COUNTRY_LOCS[cont] = {};
    for (const [country, ls] of Object.entries(byC)) {
      COUNTRY_LOCS[cont][country] = ls.map((l) => l.id);
      const xs = ls.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = ls.map((l) => l.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2; // landmark center — for the country label
      // Zoom box: size it to the country's real BORDER extent (unioned with its
      // landmarks) so small countries — Rwanda, etc. — fill the frame and show
      // their shape, instead of floating tiny in a fixed 16° box. The wrap
      // continent (Oceania) crosses the antimeridian, so keep its landmark box.
      let bx0 = minX, bx1 = maxX, by0 = minY, by1 = maxY;
      const bpath = !wrap && (WC_BY_NAME[country] || WC_BY_NAME[WC_ALIAS[country]]);
      // Only measure the border NEAR the landmarks: a country's overseas territories
      // (France's French Guiana/Réunion, Portugal's Azores/Madeira) sit thousands of
      // miles from its mainland and would otherwise stretch the zoom box across the
      // whole world. The clip scales with how spread the landmarks are — a big country
      // with far-flung landmarks (Russia) keeps a wide window; a compact one stays tight.
      const landSpan = Math.max(maxX - minX, maxY - minY);
      const clip = Math.max(7, landSpan * 2.5);
      const bb = bpath && pathBBox(bpath, cx, cy, clip);
      if (bb) { bx0 = Math.min(bx0, bb.minX); bx1 = Math.max(bx1, bb.maxX); by0 = Math.min(by0, bb.minY); by1 = Math.max(by1, bb.maxY); }
      const bcx = (bx0 + bx1) / 2, bcy = (by0 + by1) / 2; // center on the country itself
      // ---- Fill the frame (rule 5) ------------------------------------------
      // This box used to be a SQUARE of side = extent * 1.5. Two things were
      // wrong with that, and they compounded:
      //
      //   1. The atlas frame is 1.45:1 landscape and the fit is `meet`, so a
      //      square box is fitted by HEIGHT and ~31% of the frame's width is
      //      dead before any margin exists. Every country in the game — Russia,
      //      Italy, Peru, all of them — occupied exactly 38% of the frame width,
      //      because the shape of the country never entered into it.
      //   2. The * 1.5 then added 50% margin on top, and VB_PAD another 10% a
      //      side after that.
      //
      // Net: a country map showed the country at about a fifth of the frame,
      // which is why it read as barely more informative than the continent map.
      // Build the box at the FRAME'S OWN ASPECT instead, sized to whichever
      // dimension is binding, with a small honest margin. A country shaped like
      // the frame now nearly fills it; a tall country like Chile still can't
      // fill a wide frame, but it fills the height instead of a fifth of it.
      // fitBox carries the margin, the microstate floor (below which the relief has
      // no detail left to show) and the cap. See src/map-geometry.js.
      const box = fitBox(bcx, bcy, bx1 - bx0, by1 - by0);
      COUNTRY_META[countryKey(cont, country)] = { box, cx, cy };
    }
  }
  // A few countries are so far-flung that a box holding ALL their landmarks spans a
  // hemisphere — the USA's Denali (Alaska) and Kīlauea (Hawaii) blew its box out to
  // 120°, so its "country map" showed the Arctic, both oceans and half of South
  // America. Override those with a hand-set box hugging the part that reads as the
  // country, at the atlas frame's own 1.45 aspect so it fills the frame. Landmarks
  // that fall OUTSIDE the override (Denali, Kīlauea) still work: when a run's options
  // include one, optionsFitCountry() below sends that run to the continent view.
  //   USA: contiguous 48, lon −125…−66 (x 55…114), lat 24…50 (y 40…66).
  const box145 = (cx, cy, w) => ({ x: cx - w / 2, y: cy - (w / FRAME_AR) / 2, w, h: w / FRAME_AR });
  const OVERRIDE = {
    // Trimmed east to the real Atlantic coast (lon −66, x 114) and re-centred a
    // degree south: the old 64°-wide box ran to lon −52.5, so a third of the frame
    // was open Atlantic with Hudson Bay in the top corner.
    "North America|United States": box145(84.5, 51.5, 59),
    // Chile is the one country the clip heuristic above cannot size. Its border path
    // includes Easter Island (lon −109, x 71) — 2,200 miles off the coast, but still
    // INSIDE the 70° clip that its own widely-spread landmarks earn it. So the border
    // bbox ran x 70.5…113.5 and Chile's "country map" was really a map of the south
    // Pacific with South America down one edge. Hand-set to the mainland: lon −84…−58,
    // lat −14…−58. Easter Island keeps working — it is filed under Oceania, and any
    // run whose options fall outside this box goes wide via optionsFitCountry().
    "South America|Chile": { x: 96, y: 104, w: 26, h: 44 },
    // The UK's derived box carried ~5° of margin on every side, so the islands sat
    // small in a lot of North Sea and Atlantic. Hug them instead.
    "Europe|United Kingdom": { x: 171, y: 29.5, w: 12, h: 12 },
    // Spain is Chile's problem again: its border path carries the CANARY ISLANDS
    // (lon −16, lat 28), which sit just inside the ~15.8° clip its three landmarks
    // earn it, so the derived box stretched south-west into the Atlantic and the
    // mainland ended up small in a corner. Hand-set to the peninsula — lon −9.4…3.9,
    // lat 35.6…44.2 — at the atlas frame's own aspect so it fills the frame.
    "Europe|Spain": box145(177, 50.2, 13.4),
  };
  // Every hand-set box goes through the same frame-aspect normalisation the derived
  // ones do (rule 5). These predate that change and several were square or portrait —
  // and a box narrower than the frame is not just "a bit letterboxed": under
  // preserveAspectRatio="meet" the map is fitted by the BINDING axis, so the plate
  // spills sideways well beyond the declared box. The UK's 12x12 showed 45% more map
  // than it declared and Chile's 26x44 showed 145% more.
  //
  // Nothing about what you SEE changes much — the spill was already on screen. What
  // changes is that everything positioned from `box` (the scale bar, the locator
  // insets, the label) is now placed against the area actually being drawn instead of
  // a rectangle two-thirds its size, which is what put the scale bar off in the
  // margin and the insets somewhere odd.
  for (const [key, box] of Object.entries(OVERRIDE)) if (COUNTRY_META[key]) COUNTRY_META[key].box = toFrameAspect(box);
})();
// True when every one of this run's city options sits inside the country's zoom box.
// A country with a tight override box (the USA) returns false for a run whose options
// include an out-of-box landmark (Denali/Kīlauea), so that run falls back to the wider
// continent view where those pins are on-map. Other countries contain all their own
// landmarks, so this is always true for them and nothing changes.
const optionsFitCountry = (ids, continent, country) => {
  const m = COUNTRY_META[countryKey(continent, country)];
  if (!m) return false;
  const b = m.box, mx = 0.03 * b.w;
  return (ids || []).every((id) => { const l = BY_ID[id]; return l && l.x >= b.x - mx && l.x <= b.x + b.w + mx && l.y >= b.y - mx && l.y <= b.y + b.h + mx; });
};

// ---- Scale bar -------------------------------------------------------------
// A distance legend for the zoomed maps, so "how big is this country actually?"
// has an answer on the page rather than in a caption somewhere.
//
// The honest caveat, and why the bar carries a latitude: these plates are
// equirectangular, so a degree of LONGITUDE shrinks as you go north or south while
// a degree of latitude doesn't. One bar cannot be right for a whole map of Canada.
// So it is measured across the middle of the frame — where most of the country the
// map is about actually sits — and says so. That's a real thing to teach: a flat
// map cannot keep every distance true at once.
//
// Rule 3: miles first, kilometres in brackets.
function ScaleBar({ box, wOverS }) {
  const midLat = 90 - (box.y + box.h / 2);
  const miPerDeg = milesPerLonDegree(midLat);
  const miles = niceScaleMiles(box.w, midLat);
  const km = Math.round(miles * 1.609344);
  const barDeg = miles / miPerDeg;
  const h = 0.014 * box.h;
  const fs = 0.028 * box.h;
  // Sits above the bottom-left brass corner, and the label clears the bar rather
  // than printing across it (it was reading as "200 m(322 km)" with the ruler
  // straight through the text).
  // Clear of the compass rose, which is pinned to the map's bottom-left as a DOM
  // element over the frame — the same gutter the locator insets have to leave.
  const x0 = box.x + box.w * 0.19;
  const y0 = box.y + box.h * 0.915;
  return (
    <g style={{ pointerEvents: "none" }} aria-hidden="true">
      {/* Two segments, the way a real map ruler is drawn — it reads as a scale even
          before you read the number. */}
      <rect x={x0} y={y0} width={barDeg / 2} height={h} fill="#FFFFFF" stroke={INK} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      <rect x={x0 + barDeg / 2} y={y0} width={barDeg / 2} height={h} fill={INK} stroke={INK} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      <text x={x0} y={y0 - h * 1.15} fontSize={fs} fontFamily="ui-monospace, monospace" fontWeight="800"
        fill={INK} style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: fs * 0.42 }}>
        {miles.toLocaleString("en-US")} mi ({km.toLocaleString("en-US")} km)
      </text>
    </g>
  );
}

// ---- Overseas-territory locator insets ------------------------------------
// A country's zoom box hugs its mainland (France's would otherwise have to span
// the whole globe to include French Guiana AND Réunion), so its far-flung
// territories fall off-frame. These small LOCATOR insets put each back: a tiny
// silhouette of the region it sits in, with a marker + name, so a child still
// learns "France reaches all the way over here too". lon/lat in degrees; the
// equirectangular plate is x = lon+180, y = 90−lat.
const OVERSEAS_INSETS = {
  // Rule 5's far-territory case. A country map fills its frame with the landmass
  // that reads as the country; anything thousands of miles offshore gets a locator
  // window instead of dragging the whole map out to sea to include it.
  //
  // These are LOCATORS, not playable maps — they show a child where the territory
  // sits, and they don't take clicks. An assignment whose target falls outside the
  // country box still routes to the continent view (see optionsFitCountry).
  "United States": [
    { name: "Alaska", cLon: -152, cLat: 63,   w: 44, dots: [[-151, 63.1]] },
    { name: "Hawaiʻi", cLon: -157, cLat: 20.2, w: 16, dots: [[-155.3, 19.4]] },
  ],
  // Rapa Nui is 2,200 miles off the Chilean coast — the one pin that used to drag
  // Chile's map into the open Pacific (and Oceania's with it, before the move).
  // A wide window on purpose: the island is a speck at any scale that fits it, so
  // what the inset can usefully show is the SPACE — the mainland coast at one edge
  // and the marker alone in the middle of it. The remoteness is the fact.
  Chile: [
    { name: "Easter Island", cLon: -95, cLat: -27.1, w: 62, dots: [[-109.4, -27.1]] },
  ],
  France: [
    { name: "French Guiana",           cLon: -53,   cLat: 3.5,   w: 26, dots: [[-53, 4]] },
    { name: "Guadeloupe & Martinique", cLon: -61.4, cLat: 15.4,  w: 13, dots: [[-61.5, 16.2], [-61, 14.6]] },
    { name: "Réunion",                 cLon: 53,    cLat: -21,   w: 20, dots: [[55.5, -21.1]] },
    { name: "Mayotte",                 cLon: 45.5,  cLat: -12.8, w: 15, dots: [[45.2, -12.8]] },
  ],
};
// Each world-country's plate bounding box, computed once, so an inset draws only
// the handful of silhouettes that fall inside its little window (not all ~200
// every time the map re-renders on hover).
const WC_BBOXES = WORLD_COUNTRIES.map((c) => ({ d: c.d, bb: pathBBox(c.d, null) })).filter((c) => c.bb);
// Does this assignment use the country layer? Medium/Hard on a layer-continent —
// both specific missions (pick the target's country) and category missions (pick
// any country on the continent that has a member of the wanted category).
// 8-way compass direction from one map point to another (for gentle hints).
const compass = (from, to) => {
  let dx = to.x - from.x; if (dx > 180) dx -= 360; if (dx < -180) dx += 360;
  const ang = Math.atan2(-(to.y - from.y), dx) * 180 / Math.PI; // 0=east, 90=north
  const dirs = ["east", "north-east", "north", "north-west", "west", "south-west", "south", "south-east"];
  return dirs[Math.round(((ang + 360) % 360) / 45) % 8];
};

// EVERY location routes through the country step now, on all difficulties:
// world map → pick continent → continent map → pick country → country map →
// pick the city. (Antarctica has no countries, so it stays continent→city.)
const usesCountryLayer = (mode, continent) =>
  COUNTRY_LAYER_CONTINENTS.has(continent);
// For a category mission: does this country (on this continent) hold a member of
// the wanted category?
const countryHasCategory = (continent, country, category) =>
  (COUNTRY_LOCS[continent]?.[country] || []).some((id) => BY_ID[id].category === category);

// Real lon/lat of each Antarctic subject → a position on the polar relief plate
// (azimuthal: distance from the centerd pole grows with distance from the pole;
// longitude sets the bearing). ANT_ROT/ANT_DIR orient it to match the image.
// lon/lat are kept roughly real for bearing/distance, but a few are nudged within
// their region (Ross Sea / Victoria Land) so the pins don't overlap on the plate.
const ANT_LONLAT = {
  vinson: { lon: -85.6, lat: -78.5 },
  lemaire: { lon: -63.8, lat: -65.1 },
  southpole: { lon: 0, lat: -89.99 },
  emperorpenguins: { lon: 150, lat: -71 },
  dryvalleys: { lon: 130, lat: -75 },
  erebus: { lon: 167, lat: -77.6 },
  deception: { lon: -60.65, lat: -62.97 },
  bloodfalls: { lon: 162.27, lat: -77.72 },
};
const ANT_ROT = 0, ANT_DIR = 1, ANT_EDGE = 60; // edge latitude of the plate image
const antPlate = (id) => {
  const g = ANT_LONLAT[id];
  if (!g) return { x: ANT_PLATE / 2, y: ANT_PLATE / 2 };
  const r = ((90 + g.lat) / (90 - ANT_EDGE)) * (ANT_PLATE / 2 * 0.9);
  const th = (g.lon * ANT_DIR + ANT_ROT) * Math.PI / 180;
  return { x: ANT_PLATE / 2 + r * Math.sin(th), y: ANT_PLATE / 2 - r * Math.cos(th) };
};

// Where each continent's button sits on the world map and where the plane flies
// to (hand-placed so Oceania lands on Australia rather than the mid-Pacific
// centroid of its scattered islands, and Antarctica sits along the bottom edge).
// Coords in world-map units (x 0..360, y 0..180).
const CONTINENT_PIN = {
  "North America": { x: 72, y: 46 },
  "South America": { x: 122, y: 116 },
  "Europe": { x: 191, y: 38 },
  "Africa": { x: 199, y: 92 },
  "Asia": { x: 291, y: 55 },
  "Oceania": { x: 326, y: 122 },
  "Antarctica": { x: 180, y: 171 },
};

// category -> continent -> [location ids]. Used to build category missions and to
// tally collections; every category has members on 3–7 continents (see Phase A).
const CAT_LOCS = (() => {
  const m = {};
  for (const l of LOCATIONS) {
    (m[l.category] = m[l.category] || {});
    (m[l.category][l.continent] = m[l.category][l.continent] || []).push(l.id);
  }
  return m;
})();

// A "photograph any {category} in {continent}" mission is only FAIR when the
// continent genuinely has MORE THAN ONE of that category — otherwise "any" is a
// lie with a single right answer, and same-continent decoys the player thinks
// qualify get rejected (frustrating). Antarctica is excluded from category
// missions entirely: nearly everything there reads as a "frozen wonder",
// "mountain" or "desert" at a glance, so the category framing there is
// inherently confusing (playtest feedback). Category missions on Antarctica
// become specific "photograph <this place>" missions instead.
const NUMWORD = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
// Some greeting glosses already open with a curly quote ("Wah gwaan" → “What's going
// on?” — a casual hello). Wrapping those again printed ““What's going on?” …”, so quote
// only when the gloss doesn't quote itself, and don't add a period after one.
const quoteGloss = (mean) => {
  if (!mean) return "";
  const selfQuoted = mean.trimStart().startsWith("\u201C");
  if (selfQuoted) return mean.replace(/\.$/, "");
  return `\u201C${mean.replace(/\.$/, "")}.\u201D`;
};
// Is the gloss worth printing at all? Where a country's greeting is already in
// English the meaning IS the word, and the card read: \u201CHere they say \u201CHello\u201D in
// English \u2014 it means \u201CHello.\u201D\u201D \u2014 a sentence that teaches nothing and sounds like
// the game is being funny at the child's expense. Compared loosely (case, accents,
// punctuation and any parenthesised romanisation stripped) so "\u00A1Hola!"/"hola"
// counts as the same word too.
const sameWord = (a, b) => {
  const norm = (s) => String(s || "").split(" (")[0]
    .normalize("NFD").replace(/[\u0300-\u036F]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
  return !!a && !!b && norm(a) === norm(b);
};
const usefulGloss = (g, mean) => (mean && !sameWord(mean, g?.text) && !sameWord(mean, g?.word) ? mean : null);
// How to print a greeting: the native words, and ONE guide to saying them.
//
// A greeting carries up to two romanizations. `text` may hold a scholarly
// transliteration in parentheses \u2014 "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 (As-salamu alaykum)" \u2014 and
// `pronunciation` holds a sounded-out respelling \u2014 "as-sa-LAAM a-LAY-kum".
// Printing both gave a seven-year-old two spellings of a word they cannot read,
// one after the other, and neither was helped by the other's company.
//
// The respelling wins wherever there is one. It's the only one that says where
// the stress lands, and saying it out loud is the whole point of the line \u2014 the
// transliteration is a librarian's tool for writing the word down. Where there's
// no respelling, `text` is kept whole, parentheses and all, so a greeting in an
// unfamiliar script is never left with no way in at all.
const greetingSaid = (g) => {
  const full = String(g.text).trim();
  const native = full.split(" (")[0].trim();
  return g.pronunciation ? { words: native, say: g.pronunciation } : { words: full, say: null };
};
// Thin wrapper over the shared rule in src/missions.js (which `npm test` exercises):
// a category mission is fair only if this continent has 2+ members of the category,
// and — when the country step is in play — 2+ countries that actually hold one.
const categoryMissionOK = (category, continent, mode = null) =>
  missionOK(category, continent, !!(mode && usesCountryLayer(mode, continent)));

// Turn a list of anchor locations into mission objects + per-step city options.
// Each anchor becomes either a category mission ("any X on this continent") or a
// specific one. `order` is the weighted
// resurfacing order, used to pick plausible same-continent decoys.
function makeAssignmentPlan(mode, anchors, order) {
  const want = Math.max(MIN_CITY_PINS, mode.cityDecoys + 1);
  // The anchor + cityDecoys same-continent decoys, spaced for the continent zoom.
  const buildOptions = (anchor) => {
    const far = spacedFor(CONTINENT_META[anchor.continent].box);
    const chosen = [anchor];
    for (const l of order) { if (chosen.length >= want) break; if (l.continent === anchor.continent && !chosen.includes(l) && far(l, chosen)) chosen.push(l); }
    for (const l of order) { if (chosen.length >= want) break; if (l.continent === anchor.continent && !chosen.includes(l)) chosen.push(l); }
    return shuffled(chosen.map((l) => l.id));
  };
  // Country-layer options: the anchor + other landmarks in the SAME country.
  const buildCountryOptions = (anchor) => {
    const chosen = [anchor];
    for (const l of order) { if (chosen.length >= want) break; if (l.country === anchor.country && l.continent === anchor.continent && !chosen.includes(l)) chosen.push(l); }
    return shuffled(chosen.map((l) => l.id));
  };
  const shuffle = shuffled;
  // Countries shown in the country step: the correct one(s) plus decoys, capped.
  const pickCountries = (continent, mustInclude) => {
    const all = LAYER_COUNTRY_LIST[continent] || [];
    const chosen = mustInclude.filter((c) => all.includes(c));
    const pool = shuffle(all.filter((c) => !chosen.includes(c)));
    while (chosen.length < mode.countryOpts && pool.length) chosen.push(pool.pop());
    return shuffle(chosen);
  };
  const assignmentObjs = [], options = [];
  for (const anchor of anchors) {
    const continent = anchor.continent;
    if (rnd() < mode.catShare && categoryMissionOK(anchor.category, continent, mode)) {
      // Every offered country really has one of these — no plausible-but-rejected decoys.
      const valid = categoryCountries(continent, anchor.category);
      const countries = usesCountryLayer(mode, continent)
        ? shuffle(valid).slice(0, Math.max(2, Math.min(mode.countryOpts, valid.length)))
        : null;
      assignmentObjs.push({ type: "category", category: anchor.category, continent, anchorId: anchor.id, countries });
      options.push(buildOptions(anchor));
    } else {
      assignmentObjs.push({ type: "specific", targetId: anchor.id, continent, countries: usesCountryLayer(mode, continent) ? pickCountries(continent, countriesOf(anchor)) : null });
      options.push(usesCountryLayer(mode, continent) ? buildCountryOptions(anchor) : buildOptions(anchor));
    }
  }
  return { assignmentObjs, options };
}

// FNV-1a string hash — used to derive a traveler's stable default avatar.
const hashStr = (str) => { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

// Pick n DISTINCT anchor locations, at least 40% of them genuinely NEW to this
// player. Choosing anchors up front guarantees no place is used twice in one run.
// `freshFirst` orders places by how long ago the player last saw them (never-seen
// first); once everything's been seen, the oldest visits resurface, so review
// continues forever.
function pickAnchors(profile, order, n, wish = null) {
  const needFresh = Math.ceil(0.4 * n);
  const anchorIds = [];
  const used = new Set();
  const take = (id) => { if (id && !used.has(id)) { used.add(id); anchorIds.push(id); } };
  freshFirst(profile).forEach((id) => { if (anchorIds.length < needFresh) take(id); });
  order.forEach((l) => { if (anchorIds.length < n) take(l.id); });            // fill the rest, weighted
  freshFirst(profile).forEach((id) => { if (anchorIds.length < n) take(id); }); // safety net (tiny catalogs)
  let ids = anchorIds.slice(0, n);

  // Spread the trip across the map: every run should span at least THREE continents
  // (or as many as it's long, for a 1–2 shot outing), so the weighting can't clump a
  // whole trip on one continent. This is fully deterministic given `ids` + `order`
  // (no fresh randomness), so the seeded Daily still hands everyone the identical run.
  const target = Math.min(3, n);
  const contsOf = (list) => new Set(list.map((id) => BY_ID[id].continent));
  if (contsOf(ids).size < target) {
    const have = contsOf(ids);
    for (const cand of order) {
      if (have.size >= target) break;
      const cont = BY_ID[cand.id].continent;
      if (have.has(cont) || ids.includes(cand.id)) continue;
      // Replace one anchor from the most-represented continent (never its last).
      const counts = {};
      ids.forEach((id) => { const c = BY_ID[id].continent; counts[c] = (counts[c] || 0) + 1; });
      const victimCont = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      const victimIdx = ids.findIndex((id) => BY_ID[id].continent === victimCont);
      if (victimIdx >= 0) { ids[victimIdx] = cand.id; have.add(cont); }
    }
  }

  // Jonah's wish: if he asked for a kind of place, quietly make sure ONE is on the
  // itinerary so bringing it home answers him. Just one, and only if the run doesn't
  // already include the category — a nudge, not a theme. Done AFTER the continent
  // spread and made to preserve it: the anchor it replaces is chosen from a continent
  // that still has another anchor, so the three-continent guarantee holds.
  if (wish && !ids.some((id) => BY_ID[id].category === wish)) {
    const cand = order.find((l) => l.category === wish && !ids.includes(l.id));
    if (cand) {
      const counts = {};
      ids.forEach((id) => { const c = BY_ID[id].continent; counts[c] = (counts[c] || 0) + 1; });
      let victimIdx = ids.findIndex((id) => counts[BY_ID[id].continent] > 1);
      if (victimIdx < 0) victimIdx = ids.length - 1; // a run too small to spare one; take the last
      if (victimIdx >= 0) ids[victimIdx] = cand.id;
    }
  }
  return shuffled(ids.map((id) => BY_ID[id]));
}

// Pick one value from [{ v, w }] weighted by w.
const weightedPick = (items) => {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = rnd() * total;
  for (const x of items) { r -= x.w; if (r <= 0) return x.v; }
  return items[items.length - 1].v;
};

// The destination step must always offer a real choice. Three is the floor: two pins
// is a coin-flip and one is no question at all. Difficulty still decides how far ABOVE
// three a map goes (Scout sits at the floor; Expert shows five).
const MIN_CITY_PINS = 3;
// Keep decoy pins from stacking, scaled to whatever continent box is on screen.
const spacedFor = (box) => {
  const minSep = Math.max(4, box.w * 0.05);
  return (a, chosen) => chosen.every((b) => {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy >= minSep * minSep;
  });
};

// A country can hold far more landmarks than a single run should show (the USA has
// 30). Pick a manageable, well-SPREAD subset for the city map: always the required
// place(s), then spaced decoys from the rest, capped at `cap`. Guarantees the
// target is present and reduces pin/label overlap. `wrap` shifts eastern-Pacific
// points so Oceania spacing is measured correctly.
const pickCountryCityIds = (continent, country, mustInclude, cap) => {
  const own = (COUNTRY_LOCS[continent] && COUNTRY_LOCS[continent][country]) || [];
  // A destination step with one or two pins isn't a choice — the answer is whichever
  // one isn't obviously wrong, and on a single-pin map it's simply handed over. So a
  // country that can't field MIN_CITY_PINS of its own borrows its NEAREST neighbours
  // on the same continent to make up the number. Those pins fall outside the country's
  // zoom box, which makes optionsFitCountry() false and sends the run to the wider
  // continent view — where a pin in the next country along is honestly placed and
  // readable as being outside the coral border.
  const all = own.length >= MIN_CITY_PINS ? own : (() => {
    const wrapC = CONTINENT_META[continent] && CONTINENT_META[continent].mode === "wrap";
    const px = (l) => (wrapC && l.x < 180 ? l.x + 360 : l.x);
    const anchor = own.length ? BY_ID[own[0]] : null;
    if (!anchor) return own;
    const near = LOCATIONS
      .filter((l) => l.continent === continent && !own.includes(l.id))
      .map((l) => ({ id: l.id, d: Math.hypot(px(l) - px(anchor), l.y - anchor.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, MIN_CITY_PINS - own.length)
      .map((n) => n.id);
    return own.concat(near);
  })();
  if (all.length <= cap) return shuffleArr(all);
  const meta = COUNTRY_META[countryKey(continent, country)];
  const wrap = CONTINENT_META[continent] && CONTINENT_META[continent].mode === "wrap";
  const xy = (l) => ({ x: wrap && l.x < 180 ? l.x + 360 : l.x, y: l.y });
  const far = spacedFor(meta ? meta.box : { w: 30 });
  const chosen = mustInclude.filter((id) => all.includes(id)).slice(0, cap);
  const chosenXY = chosen.map((id) => xy(BY_ID[id]));
  const pool = shuffleArr(all.filter((id) => !chosen.includes(id)));
  for (const id of pool) { if (chosen.length >= cap) break; const p = xy(BY_ID[id]); if (far(p, chosenXY)) { chosen.push(id); chosenXY.push(p); } }
  for (const id of pool) { if (chosen.length >= cap) break; if (!chosen.includes(id)) chosen.push(id); } // top up if spacing was too strict
  return shuffleArr(chosen);
};

// The best score a game could reach: every photo landed (points each), the small
// efficient-route day bonus, and full marks on the homecoming review quiz.
// One review question per assignment (see startHomecoming), so the quiz ceiling
// scales with the run rather than sitting at a flat 5.
const maxScoreFor = (nAssign, mode) =>
  nAssign * mode.points + dayBonus(mode.slack) + nAssign * QUIZ_BONUS;

// Rank on the FRACTION of the achievable max, so a perfect Easy run and a
// perfect Hard run both earn the top title regardless of raw points.
const rankFor = (pct) => {
  if (pct >= 0.9) return { title: "Pulitzer-Winning Photojournalist", note: "Flawless work in the field." };
  if (pct >= 0.7) return { title: "Senior Photojournalist", note: "Sharp eye, sharp instincts." };
  if (pct >= 0.5) return { title: "Staff Photographer", note: "Solid, dependable coverage." };
  if (pct >= 0.25) return { title: "Field Intern", note: "You got the shots that counted." };
  return { title: "Trainee", note: "Read Jonah's notes more closely next time." };
};

// ===========================================================================
// QUIZ ENGINE — multiple-choice geography questions generated ENTIRELY from the
// verified location data (continent, country, category, subject, photo, fact).
// Nothing invented, so it stays rule-2 safe. Used by Quiz mode (and, later,
// inside Education mode).
// ===========================================================================
const QUIZ_CONTINENTS = Object.keys(CONTINENT_PIN);
const shuffleArr = shuffled;
const pickN = (pool, n, exclude = new Set()) => shuffleArr(pool.filter((x) => !exclude.has(x))).slice(0, n);
// Countries whose capital is a single unambiguous city, so "what is the capital
// of X?" has one right answer. Multi-seated capitals (South Africa, Bolivia,
// Sri Lanka…) carry quizCapital: false in the data and sit this question out —
// but their capital still shows on the country card.
const CAPITAL_OF = {};
const CONTINENT_OF_COUNTRY = {};
for (const l of LOCATIONS) if (!CONTINENT_OF_COUNTRY[l.country]) CONTINENT_OF_COUNTRY[l.country] = l.continent;
for (const [country, info] of Object.entries(COUNTRY_INFO)) {
  if (info.capital && info.quizCapital !== false) CAPITAL_OF[country] = info.capital;
}
const capitalsOn = (continent) =>
  Object.keys(CAPITAL_OF).filter((c) => CONTINENT_OF_COUNTRY[c] === continent).map((c) => CAPITAL_OF[c]);
const ALL_CAPITALS = Object.values(CAPITAL_OF);
// Build one question for a given location, choosing among the applicable types.
function quizQuestionFor(l) {
  const cat = CATEGORIES[l.category];
  const types = ["continent", "category", "photo"];        // always available
  const border = l.countries && l.countries.length > 1;    // Niagara-style: two right answers
  if (!border) types.push("country");
  if (CAPITAL_OF[l.country]) types.push("capital");
  if (!border && COUNTRY_FLAG[l.country]) types.push("flag");
  // Countries whose polygon crosses the antimeridian draw as a smear when boxed
  // (far-east Russia, the Aleutians, Fiji's split), so they sit the shape quiz out.
  if (!border && wcPath(l.country) && !["Russia", "United States", "Fiji"].includes(l.country)) types.push("shape");
  if (!border && COUNTRY_GREETING[l.country]) types.push("greeting");
  const kind = types[Math.floor(Math.random() * types.length)];
  if (kind === "continent") {
    const opts = shuffleArr([l.continent, ...pickN(QUIZ_CONTINENTS, 3, new Set([l.continent]))]);
    return { kind, prompt: `Which continent is ${l.subject} in?`, photo: null,
      options: opts.map((o) => ({ label: o, correct: o === l.continent })),
      explain: `${l.subject} is in ${l.continent}.` };
  }
  if (kind === "country") {
    const sameCont = [...new Set(LOCATIONS.filter((x) => x.continent === l.continent).map((x) => x.country))];
    const others = pickN(sameCont, 3, new Set([l.country]));
    const filled = others.length >= 3 ? others : [...others, ...pickN([...new Set(LOCATIONS.map((x) => x.country))], 3 - others.length, new Set([l.country, ...others]))];
    const opts = shuffleArr([l.country, ...filled]);
    return { kind, prompt: `Which country is ${l.subject} in?`, photo: null,
      options: opts.map((o) => ({ label: o, correct: o === l.country })),
      explain: `${l.subject} is in ${l.country}.` };
  }
  if (kind === "flag") {
    // Show the flag big; name the country. Same-continent distractors.
    const sameCont = [...new Set(LOCATIONS.filter((x) => x.continent === l.continent).map((x) => x.country))];
    const others = pickN(sameCont, 3, new Set([l.country]));
    const filled = others.length >= 3 ? others : [...others, ...pickN([...new Set(LOCATIONS.map((x) => x.country))], 3 - others.length, new Set([l.country, ...others]))];
    const opts = shuffleArr([l.country, ...filled]);
    return { kind, prompt: "Which country does this flag belong to?", photo: null, bigEmoji: COUNTRY_FLAG[l.country],
      options: opts.map((o) => ({ label: o, correct: o === l.country })),
      explain: `${COUNTRY_FLAG[l.country]} is the flag of ${l.country}.` };
  }
  if (kind === "shape") {
    // The country's outline, drawn as a mystery silhouette.
    const withShape = [...new Set(LOCATIONS.filter((x) => x.continent === l.continent).map((x) => x.country))];
    const others = pickN(withShape, 3, new Set([l.country]));
    const filled = others.length >= 3 ? others : [...others, ...pickN([...new Set(LOCATIONS.map((x) => x.country))], 3 - others.length, new Set([l.country, ...others]))];
    const opts = shuffleArr([l.country, ...filled]);
    return { kind, prompt: "Which country is this shape?", photo: null, shape: wcPath(l.country),
      options: opts.map((o) => ({ label: o, correct: o === l.country })),
      explain: `That's the shape of ${l.country} — ${l.subject} is there.` };
  }
  if (kind === "greeting") {
    const g = COUNTRY_GREETING[l.country];
    // Distractor greetings from other countries, never the same word (many
    // countries share "Hola") and each text offered once.
    const pool = [...new Set(Object.entries(COUNTRY_GREETING)
      .filter(([c, v]) => c !== l.country && v.text !== g.text)
      .map(([, v]) => v.text))];
    const opts = shuffleArr([g.text, ...pickN(pool, 3)]);
    const mean = greetingMeaning(g);
    return { kind, prompt: `How do people say hello in ${l.country}?`, photo: null,
      options: opts.map((o) => ({ label: o, correct: o === g.text })),
      explain: (() => { const gloss = usefulGloss(g, mean);
        return `In ${l.country} they say “${g.text}” (${g.language})${gloss ? ` — it means ${quoteGloss(gloss)}` : "."}`; })() };
  }
  if (kind === "capital") {
    const answer = CAPITAL_OF[l.country];
    // Distractors from the same continent read as plausible; top up worldwide.
    const near = pickN(capitalsOn(l.continent), 3, new Set([answer]));
    const filled = near.length >= 3 ? near : [...near, ...pickN(ALL_CAPITALS, 3 - near.length, new Set([answer, ...near]))];
    const opts = shuffleArr([answer, ...filled]);
    return { kind, prompt: `What is the capital of ${l.country}?`, photo: null,
      options: opts.map((o) => ({ label: o, correct: o === answer })),
      explain: `${answer} is the capital of ${l.country}.${COUNTRY_INFO[l.country] ? ` ${COUNTRY_INFO[l.country].blurb}` : ""}` };
  }
  if (kind === "category") {
    const names = CATEGORY_ORDER.map((c) => CATEGORIES[c].name);
    const opts = shuffleArr([cat.name, ...pickN(names, 3, new Set([cat.name]))]);
    return { kind, prompt: `What kind of place is ${l.subject}?`, photo: l.photo,
      options: opts.map((o) => ({ label: o, correct: o === cat.name })),
      explain: `${l.subject} is a ${cat.name.toLowerCase()}.` };
  }
  // photo → subject: show the photo, name the landmark. Distractors prefer the
  // same category (harder, more meaningful) then any.
  const sameCat = LOCATIONS.filter((x) => x.id !== l.id && x.category === l.category).map((x) => x.subject);
  const distract = sameCat.length >= 3 ? pickN(sameCat, 3) : [...pickN(sameCat, sameCat.length), ...pickN(LOCATIONS.filter((x) => x.id !== l.id).map((x) => x.subject), 3 - sameCat.length, new Set([l.subject, ...sameCat]))];
  const opts = shuffleArr([l.subject, ...distract]);
  return { kind: "photo", prompt: "Which landmark is this?", photo: l.photo,
    options: opts.map((o) => ({ label: o, correct: o === l.subject })),
    explain: `This is ${l.subject}, in ${l.country} (${l.continent}). ${l.fact}` };
}
// A quiz = n questions from n distinct locations (freshest first for variety).
// Each question carries its location id so the homecoming visit can look up
// Jonah's anecdote for that place.
function buildQuiz(order, n = 10) {
  const chosen = order.slice(0, Math.min(n, order.length)).map((id) => BY_ID[id]).filter(Boolean);
  return chosen.map((l) => ({ ...quizQuestionFor(l), id: l.id }));
}

// Milliseconds → "m:ss".
const fmtTime = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// ---- Tiny synthesized sound effects (Web Audio) — no files, nothing to      ----
// ---- license, and no network. The context is created lazily on first use     ----
// ---- (always inside a click), satisfying browser autoplay rules.             ----

// The start screen's mode cards. Each card wears its own illustrated icon (see
// data/art.js) on atlas paper; blurbs appear only when a card's ⓘ is tapped,
// keeping the screen picture-first. `emoji` is the fallback if the art 404s.
const MODE_CARDS = [
  { id: "assignments", name: "Assignments", emoji: "📸",
    blurb: "One of Jonah's dreams at a time — fly to the right place and photograph the right subject before your travel days run out." },
  { id: "tour", name: "Grand Tour", emoji: "🧳",
    blurb: "The route-planning game. You're told every target and exactly where it is — no deduction, no research, no hints. The whole challenge is the ORDER: sequence your stops up front against a par day-count, commit to the route, then fly it. Straying costs a day, and every day you bring home is worth points." },
  { id: "explore", name: "Explore", emoji: "🧭",
    blurb: "No timer, no score — roam the world, drill into any country, and read every place's story, culture card, and clues. Everywhere you visit is stamped in your passport." },
  { id: "longtrip", name: "The Long Trip", emoji: "🎒",
    blurb: "One trip that keeps going. There's no list to finish — assignments arrive one after another until your travel days run out, and how far you got IS the score. Before you leave, Jonah digs through his old bag and offers you three things; you can only carry two, and which two you take changes the whole trip." },
  { id: "journey", name: "Journeys", emoji: "🛶",
    blurb: "Retrace a real expedition, stop by stop, in the order it actually happened. No day budget and no score to chase — the order IS the story, and you can't skip ahead. Start with Lewis and Clark's crossing of North America." },
];
// Quiz and the Daily Expedition are no longer modes you pick. The review quiz now
// happens on its own at the END of every scored run (the homecoming — see
// startHomecoming), so it needs no menu slot; and the daily's job — a short shared
// outing that pulled kids back each day — was turning geography practice into a
// login streak. Every run is just a run now. The quiz/daily art keys stay in
// data/art.js (and their test) so nothing else has to change; they're simply not
// offered here.
// The Grand Tour's itinerary choices: a classic random tour, or one of the themed
// expeditions (each a curated tour with a lesson). Shown as chips under the cards
// when the Grand Tour card is selected — themed tours are a flavor of Grand Tour,
// not a separate mode.
const TOUR_THEMES = [{ id: "classic", title: "Classic", emoji: "🎲", lesson: "A round-the-world itinerary drawn fresh from the whole collection — targets across the continents on one shared day budget." }, ...EXPEDITIONS];


// A mystery-country silhouette for the shape quiz. The outline paths are complex,
// so the viewBox is fitted at mount from the browser's own getBBox measurement.
function ShapeView({ d }) {
  const ref = useRef(null);
  useEffect(() => {
    const path = ref.current;
    if (!path) return;
    try {
      const b = path.getBBox();
      const pad = Math.max(b.width, b.height) * 0.07;
      path.ownerSVGElement.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`);
    } catch { /* ignore */ }
  }, [d]);
  return (
    <svg role="img" aria-label="A mystery country's outline" style={{ width: "100%", maxWidth: 300, height: 190, display: "block", margin: "0 auto" }}>
      <path ref={ref} d={d} fillRule="evenodd" fill={OCEAN} stroke={INK} strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
// A row of small LOCATOR insets along the bottom of a country plate, one per
// overseas territory (see OVERSEAS_INSETS). Each is its own little equirectangular
// window onto the region the territory sits in — nearby land drawn as a tan
// silhouette, a coral marker on the territory, its name on a banner. All in the
// plate's coordinate space, so it rides inside the same map <svg>.
function OverseasInsets({ specs, box }) {
  const n = specs.length;
  const gap = 0.012 * box.w;
  // Cap the width per inset. This used to divide 96% of the map between however
  // many insets there were, which was fine for France's four and absurd for one:
  // Chile's single Easter Island window covered most of the country map. An inset
  // is a locator in the corner of the page, never the page.
  const iw = Math.min((box.w * 0.96 - gap * (n - 1)) / n, box.w * 0.26);
  const ih = iw * 0.72;
  const rowW = iw * n + gap * (n - 1);
  // Rule 5: put the row on the side of the frame the territory actually lies
  // towards, so the inset points the right way — Hawaiʻi and Alaska off the USA's
  // west, Rapa Nui off Chile's west, France's Caribbean and Indian Ocean holdings
  // spread along the bottom as before.
  const meanX = specs.reduce((a, s) => a + (s.cLon + 180), 0) / n;
  const westward = meanX < box.x + box.w / 2;
  const inset = 0.02 * box.w;
  // The compass rose is pinned to the map's bottom-LEFT (it's a DOM element over
  // the frame, not part of this svg), so a westward row has to start clear of it
  // or Alaska lands under the compass — which is exactly what it did.
  const compassGutter = westward ? 0.17 * box.w : 0;
  const x0 = westward ? box.x + inset + compassGutter : box.x + box.w - inset - rowW;
  // Clear of the bottom edge AND of the brass corner art. Measured, not guessed:
  // at 0.055 the name banner rendered 11px below the svg's visible bottom and the
  // labels were simply gone — an inset whose caption you can't read is decoration.
  const y0 = box.y + box.h - ih - 0.12 * box.h;
  const bandH = 0.03 * box.h;
  return (
    <g style={{ pointerEvents: "none" }}>
      {specs.map((s, i) => {
        const ix = x0 + i * (iw + gap), iy = y0;
        const cx = s.cLon + 180, cy = 90 - s.cLat;     // window centre, plate coords
        const sc = iw / s.w;                            // plate units → inset units
        const halfWx = s.w / 2, halfWy = (ih / sc) / 2; // window half-extents (degrees)
        const cxi = ix + iw / 2, cyi = iy + ih / 2;
        const T = `translate(${(cxi - sc * cx).toFixed(2)} ${(cyi - sc * cy).toFixed(2)}) scale(${sc.toFixed(3)})`;
        const near = WC_BBOXES.filter(({ bb }) => bb.maxX >= cx - halfWx && bb.minX <= cx + halfWx && bb.maxY >= cy - halfWy && bb.minY <= cy + halfWy);
        const clip = `sbw-inset-${i}`;
        const r = 0.012 * box.w;
        // Shrink the name to fit the inset width (so "Guadeloupe & Martinique" isn't cut).
        const fs = Math.min(0.019 * box.h, (iw * 0.92) / (s.name.length * 0.52));
        return (
          <g key={s.name}>
            <defs><clipPath id={clip}><rect x={ix} y={iy} width={iw} height={ih} rx={r} /></clipPath></defs>
            <rect x={ix} y={iy} width={iw} height={ih} rx={r} fill={SEA_DEEP} stroke={PAPER} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            {/* Regional land silhouette + territory marker, clipped to the inset window. */}
            <g clipPath={`url(#${clip})`}>
              <g transform={T}>
                {near.map(({ d }, j) => <path key={j} d={d} fill="#E8D6A2" fillRule="evenodd" stroke="#7A6438" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />)}
              </g>
              {s.dots.map(([lon, lat], j) => {
                const dx = cxi + sc * (lon + 180 - cx), dy = cyi + sc * (90 - lat - cy);
                return <g key={j}>
                  <circle cx={dx} cy={dy} r={0.14 * ih} fill="none" stroke="#fff" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
                  <circle cx={dx} cy={dy} r={0.095 * ih} fill={CORAL} stroke={INK} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </g>;
              })}
            </g>
            {/* Name banner — OUTSIDE the clip so a long label is never truncated. */}
            <rect x={ix} y={iy + ih - bandH} width={iw} height={bandH} fill="rgba(16,38,46,0.86)" />
            <text x={cxi} y={iy + ih - bandH * 0.3} textAnchor="middle" fontSize={fs} fontFamily="ui-sans-serif, system-ui" fontWeight="800" fill="#fff">{s.name}</text>
          </g>
        );
      })}
    </g>
  );
}

// ===========================================================================
// WATER FEATURES — rivers, lakes, seas, oceans, bays and gulfs (data/geography.js,
// all of it Natural Earth). The relief plate paints terrain and open ocean but NO
// lakes at all, so these vectors are what put Baikal, Victoria and the Great Lakes
// back on the map — and being vectors, they stay crisp at any zoom.
// ===========================================================================
// How far in you must be before a feature is drawn. Zooming in reveals more, the
// way a real atlas does: oceans on the world map, big rivers on a continent, the
// Thames only once you're over Britain.
const waterTier = (boxW) => (boxW > 150 ? 1 : boxW > 30 ? 2 : 3);
// Does the feature's bounding box touch what's on screen? (Cheap cull — a Rwanda
// zoom shouldn't hand the browser 40 rivers' worth of path data to clip away.)
const inView = (b, box) => b[0] <= box.x + box.w && b[2] >= box.x && b[1] <= box.y + box.h && b[3] >= box.y;

// A water label. Dark blue with a pale halo, so it stays legible on BOTH the dark
// sea and the pale land — never relying on color alone to be readable (rule 3).
// `stretch` undoes the world map's non-uniform squash so glyphs aren't distorted.
// A label whose anchor is only just off the edge is nudged back in (the Pacific's
// anchor sits near the antimeridian, which IS the world map's edge). Anything
// anchored further out than that is not drawn at all — never dragged into frame.
function WaterLabel({ f, size, stretch, upper, box, avoid }) {
  const text = upper ? f.name.toUpperCase() : f.name;
  // Rough half-width of the rendered string, in user units. A serif italic runs a
  // bit over half the font size per glyph; ocean names are also letter-spaced, and
  // forgetting to count THAT is what left "NORTH PACIFIC OCEAN" missing its N.
  const halfW = 0.5 * text.length * size * (upper ? 0.62 + 0.12 : 0.5) * stretch;
  let lx = Math.min(Math.max(f.lx, box.x + halfW), box.x + box.w - halfW);
  const ly = Math.min(Math.max(f.ly, box.y + size), box.y + box.h - size);
  if (Math.abs(lx - f.lx) > halfW || Math.abs(ly - f.ly) > size) return null;
  // The compass rose sits in the map's bottom-left corner. A name landing under it
  // is unreadable, so slide it clear along its own line of latitude — for an ocean
  // that spans every longitude (the Southern Ocean does) any longitude is equally
  // true, so this moves the label without moving the fact.
  if (avoid && lx - halfW < avoid.x1 && lx + halfW > avoid.x0 && ly > avoid.y0) {
    const shifted = avoid.x1 + halfW;
    if (shifted + halfW > box.x + box.w) return null;   // nowhere clear to put it
    lx = shifted;
  }
  return (
    <text x={0} y={0} transform={`translate(${lx} ${ly}) scale(${stretch} 1)`}
      textAnchor="middle" dominantBaseline="middle" fontSize={size}
      fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic"
      letterSpacing={upper ? size * 0.12 : 0}
      fill={SEA_DEEP} stroke={PAPER} strokeWidth="3" strokeOpacity="0.75"
      vectorEffect="non-scaling-stroke" paintOrder="stroke"
      style={{ pointerEvents: "none" }}>
      {text}
    </text>
  );
}

// The whole layer, drawn straight over the relief plate. Pointer-events are off
// throughout — the map underneath stays clickable, labels never steal a tap.
// `labels` is turned off for the country-picking step: that map is already carpeted
// with country name chips, and a second layer of text under them just reads as mess.
// The rivers and lakes themselves stay — they're the terrain, not the clutter.
function WaterFeatures({ box, vbW, vbH, zoomed, frameAR, labels = true }) {
  const max = waterTier(box.w);
  // Font size in USER units, picked so a label always lands at ~1.6% of the frame's
  // width on screen — the same apparent size at every zoom, and it scales down with
  // the map on a phone. A zoomed plate is fitted with preserveAspectRatio="meet", so
  // whichever of width/height is the tighter fit sets the scale (for a square
  // continent box in a 1.45:1 frame that's the HEIGHT, not the width — getting this
  // wrong is what made the first cut's labels come out half-size). The world map
  // stretches instead of fitting, so its size keys off the height and its glyphs get
  // counter-stretched back to the right shape.
  const size = 0.016 * (zoomed ? Math.max(vbW, frameAR * vbH) : frameAR * box.h);
  const stretch = zoomed ? 1 : box.w / (frameAR * box.h);
  // Where the compass rose sits, as a fraction of the frame (see the atlas furniture
  // below the map) — labels give it a wide berth. Kept in step with the button's own
  // size/offset: it was shrunk into the corner so it stops covering Hawaii, which
  // frees this much water back up for labels too.
  const avoid = { x0: box.x, x1: box.x + 0.14 * box.w, y0: box.y + 0.82 * box.h };
  const shown = (f) => f.tier <= max;
  const lakes = zoomed ? LAKES.filter((f) => shown(f) && inView(f.b, box)) : [];
  const rivers = zoomed ? RIVERS.filter((f) => shown(f) && inView(f.b, box)) : [];
  // On the world map only the seas and oceans are named — rivers there would be
  // hair-thin clutter over the continent buttons the player is trying to click.
  // That map is Robinson-projected, so their anchors get projected to match; the
  // relief plates are equirectangular, where the anchors already live.
  const marine = MARINE.filter(shown)
    .filter((f) => !zoomed || (f.lx >= box.x && f.lx <= box.x + box.w && f.ly >= box.y && f.ly <= box.y + box.h))
    .map((f) => (zoomed ? f : { ...f, ...(({ x, y }) => ({ lx: x, ly: y }))(eqToRobinson(f.lx, f.ly)) }));
  return (
    <g style={{ pointerEvents: "none" }} aria-hidden="true">
      {lakes.map((f) => (
        <path key={f.id} d={f.d} fill={SEA} stroke={SEA_DEEP} strokeWidth="0.7"
          vectorEffect="non-scaling-stroke" fillRule="evenodd" />
      ))}
      {rivers.map((f) => (
        <path key={f.id} d={f.d} fill="none" stroke={SEA} strokeWidth={f.tier === 1 ? 2.4 : 1.7}
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
      {labels && [...rivers, ...lakes, ...marine].map((f) => (
        <WaterLabel key={"l" + f.id} f={f} size={f.kind === "ocean" ? size * 1.02 : size}
          stretch={stretch} upper={f.kind === "ocean"} box={box} avoid={avoid} />
      ))}
    </g>
  );
}

// ---- The Daily's result card -----------------------------------------------
// Shown on the results screen after a Daily Expedition. The share text is
// deliberately SPOILER-FREE — it says how you did, never where you went — so a
// child can paste it to a cousin without ruining their run.
function DailyShare({ banked, thisRun }) {
  const [copied, setCopied] = useState(false);
  const official = banked && banked.wasFirst;
  const show = (banked && banked.banked) || thisRun;
  const text = shareText(show);
  const copy = () => {
    // The clipboard API needs a secure context and can be refused outright, so
    // there's always the textarea below to select from by hand.
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => {});
    else done();
  };
  return (
    <div style={{ marginTop: 18, background: PAPER, border: `2px solid ${OCEAN}`, borderRadius: 14,
      padding: "14px 16px", maxWidth: 520, margin: "18px auto 0", textAlign: "left" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.16em", color: OCEAN, marginBottom: 8 }}>
        📅 DAY {show.day} · {show.label.toUpperCase()}
      </div>
      <pre style={{ margin: 0, fontFamily: "ui-monospace, monospace", fontSize: 14, lineHeight: 1.6,
        color: INK, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</pre>
      {!official && banked && (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: INK, opacity: 0.75, lineHeight: 1.45 }}>
          That was a practice run — your official Day {show.day} result was already filed, so it stands.
        </p>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={copy}
          style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${OCEAN}`, background: OCEAN,
            color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          {copied ? "Copied! ✓" : "Copy my result 📋"}
        </button>
        <span aria-live="polite" style={{ fontSize: 12.5, color: INK, opacity: 0.7 }}>
          {copied ? "Paste it to whoever you're racing." : "Everyone playing today at this level flew the same five."}
        </span>
      </div>
    </div>
  );
}

// Little 🔊 button that speaks a greeting aloud; hidden if speech is unavailable.
function SpeakButton({ greeting }) {
  if (!speechAvailable || !greeting?.text) return null;
  return (
    <button onClick={(e) => { e.stopPropagation(); speakGreeting(greeting); }}
      aria-label={`Hear the ${greeting.language || "local"} greeting`} title="Hear it"
      style={{ marginLeft: 6, verticalAlign: "middle", background: "none", border: "none", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px", color: OCEAN }}>
      🔊
    </button>
  );
}

export default function ShutterbugWorld() {
  const [screen, setScreen] = useState("start"); // start | play | end | passport
  const [difficulty, setDifficulty] = useState(() => {
    try { const v = localStorage.getItem("shutterbug.diff"); if (v && MODES[v]) return v; } catch { /* ignore */ }
    return "easy";
  });
  useEffect(() => { try { localStorage.setItem("shutterbug.diff", difficulty); } catch { /* ignore */ } }, [difficulty]);
  const [tourTheme, setTourTheme] = useState("classic"); // Grand Tour itinerary choice

  const [assignments, setAssignments] = useState([]); // target location ids (the photos to file)
  const [optionsByStep, setOptionsByStep] = useState([]); // per assignment: [targetId, ...decoyIds] on its continent
  const [phase, setPhase] = useState("continent"); // "continent" (world map) | "country" (pick country) | "city" (zoomed)
  const [pickedContinent, setPickedContinent] = useState(null); // continent chosen this assignment
  const [pickedCountry, setPickedCountry] = useState(null); // country chosen (country-layer assignments)
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
  const [flashHint, setFlashHint] = useState(null); // Scout: {type, key} of the correct answer to gently flash after a wrong pick
  const [howToPlay, setHowToPlay] = useState(false); // the splash's how-to-play card
  // The results screen's reasons to go again — the nearest unfinished collection,
  // something Uncle wants, and the rank within reach. Fixed when the screen opens.
  const [nextUp, setNextUp] = useState(null);
  const [grandpaWant, setGrandpaWant] = useState(null);
  const [rankNear, setRankNear] = useState(null);
  // Three greetings for the splash sky, redrawn every time the splash is entered.
  // shuffled() (not Math.random) because that's the rule, and it's safe here: the
  // Daily Expedition scopes its own generator with withSeed(), which restores the
  // previous one afterwards, so a reshuffle out here can't shift a daily's stream.
  // Three bubbles, never two that READ the same. Persian and Urdu both greet with
  // سلام, and Marathi and Hindi share नमस्कार/नमस्ते roots — two identical words side
  // by side, labelled as different languages, reads as a bug rather than as the
  // (true, and rather nice) fact that neighbours share their greetings.
  const pickHellos = () => {
    const out = [], seen = new Set();
    for (const b of shuffled(HELLO_BUBBLES)) {
      if (seen.has(b.text)) continue;
      seen.add(b.text);
      out.push(b);
      if (out.length === 3) break;
    }
    return out;
  };
  const [helloPicks, setHelloPicks] = useState(pickHellos);
  useEffect(() => { if (screen === "start") setHelloPicks(pickHellos()); }, [screen]);
  // Which bubble is being pointed at, so the splash can name its language and say
  // what the word actually means — the sound alone taught the pronunciation but
  // never what was being said.
  const [helloHover, setHelloHover] = useState(null);
  const sayHello = (b) => { if (soundOn) speakGreeting(b); };
  const [musicOn, setMusicOn] = useState(() => { try { return localStorage.getItem("shutterbug.music") !== "off"; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem("shutterbug.music", musicOn ? "on" : "off"); } catch { /* ignore */ } }, [musicOn]);
  // Music by screen: the results end the jig loop and play a flourish — or the
  // wistful air, if the trip came up short. The start screen keeps the jig going if
  // it's already playing (start-screen clicks kick it off).
  //
  // The passport used to silence the music because it was a whole screen; it's a
  // popup now, opened over whatever you were doing, so the music plays on.
  useEffect(() => {
    if (screen === "play") MUSIC.fadeJig();               // reach the map → the jig fades out
    // The results earn their tune. The homecoming air is a sad one, which is right
    // for a trip that didn't get finished and wrong for one that did — and the
    // celebratory flourish was playing over BOTH.
    else if (screen === "end") {
      if (!musicOn) MUSIC.stop();
      else if (endWon()) MUSIC.finale();
      else MUSIC.homecoming();
    }
    // Coming home to Uncle is a warm moment, not a mournful one — he's about to
    // ask you about everything you saw. Keep the jig under it.
    else if (screen === "homecoming") { MUSIC.stopCountry(); if (musicOn) MUSIC.start(); else MUSIC.stop(); }
    // The SPLASH holds only the quiet drone — the piper stood ready. The lively jig
    // must NOT play here: it begins when the player clicks "Begin your adventure"
    // (that button calls MUSIC.start()), swelling up out of the drone. On a first
    // load nothing has started, so hushToDrone is a no-op and the splash effect below
    // brings the drone; on a RETURN to the splash it drops the still-running jig back
    // to the bed.
    else if (screen === "start") { MUSIC.stopCountry(); if (musicOn) MUSIC.hushToDrone(); else MUSIC.stop(); }
    // meet / travelers / intro / dream / quiz: the jig plays from the moment you leave
    // the splash through meeting Uncle (it only fades at the world map), and resumes
    // here on a return trip so every playthrough is scored to it.
    else { MUSIC.stopCountry(); if (musicOn) MUSIC.start(); }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps
  // The country's looping tune belongs to the country map (the "city" step). The
  // screen-level effect above only fires when the whole SCREEN changes, so leaving
  // the country a different way — stepping back, flying on, finishing the trip —
  // used to leave its tune playing. Stop it whenever we're not on the country map.
  useEffect(() => { if (phase !== "city") MUSIC.stopCountry(); }, [phase]);
  // Start the splash jig on the player's first interaction (autoplay rules need a
  // gesture, so we can't begin it on load — the first tap does it).
  const startMusicMaybe = () => { if (musicOn) MUSIC.start(); };
  // The world map's Robinson country outlines load as a separate chunk right after
  // first paint (not part of the splash bundle); null until they arrive.
  const [robinsonCountries, setRobinsonCountries] = useState(null);
  useEffect(() => {
    let ok = true;
    import("./data/worldmap-robinson.js").then((m) => { if (ok) setRobinsonCountries(m.WORLD_COUNTRIES_ROBINSON); });
    return () => { ok = false; };
  }, []);
  const [pending, setPending] = useState(null); // result popup that pauses play until dismissed
  // How the dog on the desk is reacting: "good" | "bad" | null. Set when a shot
  // resolves and cleared on a timer, so her reaction outlives the result popup that
  // covers her while it's open (see DeskDog).
  // ---- The dog's job -----------------------------------------------------------
  // Three PERFECT shots in a row — right first time, no wrong guess in between —
  // and he digs something out of the camera bag: one of Uncle Jonah's own stories
  // about a place you've just been. src/data/anecdotes.js is full of them and until
  // now only the homecoming quiz ever showed one, so most were never read at all.
  //
  // Why a streak of perfect shots and not simply "a correct shot": a correct shot
  // already pays points, and rewarding it again teaches nothing. Getting it right
  // FIRST TIME is the thing this game wants and had no growing reward for — the
  // dog is what makes that streak visible and worth keeping.
  //
  // The reward is deliberately not mechanical. A bonus travel day would make a good
  // player's runs measurably easier and quietly reshape the difficulty Joshua tunes
  // by feel; a story costs nothing and is more of what the child already likes.
  // He VISITS — he isn't stationed anywhere. { find } when he's brought a story,
  // { pose } when he's just popped in to be pleased with you. null the rest of the
  // time, which is most of the time; that's what keeps him an event.
  // ---- The camera bag (Long Trip) --------------------------------------------
  // What Jonah packed, and what's left of it: { [itemId]: chargesRemaining }. The
  // offer is drawn through rng.js (never Math.random) so a seeded run deals the same
  // hand to everyone — the same rule the assignment planner follows.
  const [kit, setKit] = useState({});            // itemId -> charges left this run
  const [kitOffer, setKitOffer] = useState(null); // the hand Jonah is holding out
  const [kitPicked, setKitPicked] = useState([]);  // which of the offer you've chosen
  // The weather and the state of the world for THIS Long Trip — one drawn per run
  // (see src/data/conditions.js). Null in every other mode.
  const [condition, setCondition] = useState(null);
  const hasCond = (effect) => !!condition && condition.effect === effect;
  const [kitNote, setKitNote] = useState(null);   // "Fast film — half a day back!"
  const kitNoteTimer = useRef(null);
  // Does the bag hold a live charge of this effect? Spending one is a separate step,
  // because most cost sites need to ASK before they decide what to charge.
  const kitHas = (effect) => KIT_ITEMS.some((i) => i.effect === effect && (kit[i.id] || 0) > 0);
  // Spend one charge of `effect`. Returns the item that paid, or null if the bag has
  // none — so a caller can write `const paid = spendKit("freeFlight")` and branch.
  // Say that an item just paid for something. Separate from spending it, because the
  // moment a charge is DEDUCTED and the moment its effect is FELT aren't always the
  // same: the bush plane is spent when you choose the continent but only saves you
  // days when the plane lands five seconds later, and a toast shown at the click had
  // already faded by then — the player saw a charge disappear and nothing happen.
  const noteKit = (item) => {
    if (!item) return;
    sfx("stamp");
    clearTimeout(kitNoteTimer.current);
    setKitNote(item);
    kitNoteTimer.current = setTimeout(() => setKitNote(null), 4200);
  };
  // Spend one charge of `effect`. Announces immediately unless { silent }, for the
  // callers that need to announce later (see noteKit).
  const spendKit = (effect, opts = {}) => {
    const item = KIT_ITEMS.find((i) => i.effect === effect && (kit[i.id] || 0) > 0);
    if (!item) return null;
    setKit((k) => ({ ...k, [item.id]: (k[item.id] || 0) - 1 }));
    if (!opts.silent) noteKit(item);
    return item;
  };
  useEffect(() => () => clearTimeout(kitNoteTimer.current), []);
  const perfectStreakRef = useRef(0);
  // Which cheer Pickles rides in with on THIS result card, or null for none. She only
  // ever reacts to a perfect (first-try) shot, and she gets louder as the streak runs:
  // one is a wag, two is a paw up, three is the full bouncing play-bow. Returned
  // rather than set on a timer, because she is drawn INSIDE the result card and has
  // to be decided before that card is built.
  const pickForShot = (perfect) => {
    if (!perfect) { perfectStreakRef.current = 0; return null; }
    perfectStreakRef.current += 1;
    const n = perfectStreakRef.current;
    if (n % 3 === 0) return "streak";
    if (n % 3 === 2) return "two";
    return "perfect";
  };
  // Mr. O's double-points riddle: a blocking popup that appears at least once every
  // five shots (at a random shot within each window). { data, choices, answeredIdx }.
  const [riddle, setRiddle] = useState(null);
  const riddleSeen = useRef([]);            // riddle indices shown this session
  const shotsSinceRiddleRef = useRef(0);    // shots taken since the last riddle
  const riddleEveryRef = useRef(1 + Math.floor(Math.random() * 5)); // next trigger: a random 1–5
  const riddleSeedRef = useRef(null);   // set on a Daily, so its riddle cadence is shared
  // Per-assignment shot record, for the Daily share card: how many wrong city
  // shots were taken on each one before it was filed. index -> misses.
  const missesRef = useRef({});
  const riddleCountRef = useRef(0);
  // The kind of place Uncle asked for on the last results screen. The NEXT run
  // quietly works one of them onto the itinerary, so bringing it home actually
  // answers him. Consumed once (cleared when a run starts), and never on a Daily —
  // that run must stay identical for everyone, wish or no wish.
  const grandpaWishRef = useRef(null);
  const riddleDueRef = useRef(false);       // a riddle is queued to open once the shot result is dismissed
  const [elapsedMs, setElapsedMs] = useState(0); // final game time, shown on the results screen
  const [liveNow, setLiveNow] = useState(0); // ticks while playing so the on-screen timer updates
  const [albumView, setAlbumView] = useState(null); // album photo opened into a big popup
  const [gameMode, setGameMode] = useState("assignments"); // "assignments" | "tour" | "explore" | "journey"
  const [dailyDay, setDailyDay] = useState(null);          // the day number, when this run IS the Daily
  const [dailyBanked, setDailyBanked] = useState(null);    // {result, wasFirst} once a Daily is filed
  const [tourReqs, setTourReqs] = useState([]); // Grand Tour itinerary: [{key,kind,continent,category?,targetId?,anchorId,label,done,filedId?}]
  const [tourOptions, setTourOptions] = useState({}); // Grand Tour: continent -> [city ids to show there]
  // Grand Tour route plan: the stops, the order you committed to, PAR (the cheapest
  // possible circuit), the budget derived from it, and how often you left the plan.
  const [tourPlan, setTourPlan] = useState(null);
  // Travel-modes layer (Grand Tour, Adventurer/Expert): a money budget alongside the
  // day budget, and a pending "getting there" chooser (pick a hub + last-leg transport).
  const [money, setMoney] = useState(0);
  const [travelChoice, setTravelChoice] = useState(null); // { cont, from, to, penalty, target, hubs } | null
  const [journeyId, setJourneyId] = useState(JOURNEYS[0].id);   // which route is picked on the meet screen
  const [journey, setJourney] = useState(null);                 // live run: { id, at, wrong, done, reveal }
  const journeyMapRef = useRef(null);

  // Player profiles (localStorage). profileName === null means "Guest — no saving".
  // Nobody is auto-selected at launch (hasChosen === false) so a player can't
  // accidentally continue someone else's saved game; they must pick a traveler
  // (or Guest) first. hasChosen distinguishes "Guest picked" from "nothing picked".
  const [canSave] = useState(() => storageAvailable());
  const [profiles, setProfiles] = useState(() => (canSave ? listProfiles() : []));
  const [profileName, setProfileName] = useState(null);
  const [hasChosen, setHasChosen] = useState(false);
  const [promptTraveler, setPromptTraveler] = useState(false); // nudge to pick a traveler
  const [newName, setNewName] = useState("");
  const [lastResult, setLastResult] = useState(null); // {isBest, isBestTime} after a recorded game
  // Countries this traveler has photographed something in, EVER — not just this run.
  // The world map washes them gold, so the map visibly fills in across a whole term of
  // playing; it's the one place the collection reads as a shape rather than a number.
  // Recomputed when a run is recorded (lastResult) or a different traveler is picked —
  // the only two ways the set can change.
  const collectedCountries = useMemo(() => {
    const p = profileName ? getProfile(profileName) : null;
    if (!p) return new Set();
    const out = new Set();
    for (const c of passportData(p).countries) {
      if (!c.mastered) continue;
      // The world map's paths carry the Robinson dataset's names, which are not always
      // the names in locations.js — it says "United States of America". Without the
      // alias the single most-visited country in the game never lit up at all.
      out.add(c.country);
      if (WC_ALIAS[c.country]) out.add(WC_ALIAS[c.country]);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileName, lastResult]);
  const [newBadges, setNewBadges] = useState([]); // achievements newly earned this game
  const [confirmRemove, setConfirmRemove] = useState(false); // passport delete confirmation
  const [passportPage, setPassportPage] = useState("id"); // passport booklet page: id | stamps | collections | badges
  const [avatarEdit, setAvatarEdit] = useState(false);        // avatar editor open (start screen)
  const [gearOpen, setGearOpen] = useState(false);            // play-screen settings (gear) popover open
  const [curioDeck, setCurioDeck] = useState(null);           // tap-to-learn: id of the open field-note deck, or null
  const [curioTick, setCurioTick] = useState(0);              // bumps when a card is read, to refresh the "X / Y" count
  const [albumOpen, setAlbumOpen] = useState(false);          // Photo Album tool: full-run photo gallery popup
  const [guideOpen, setGuideOpen] = useState(false);          // Field Guide tool: clue-research popup
  const [guideFresh, setGuideFresh] = useState(false);        // did this Field Guide open just spend the research day?
  const [passportOpen, setPassportOpen] = useState(false);    // Passport tool: multi-page booklet popup
  const [toolNote, setToolNote] = useState(null);             // why a greyed-out tool isn't usable this mode
  const [createOpen, setCreateOpen] = useState(false);        // "Create New Traveler" modal open
  const [meetInfo, setMeetInfo] = useState(null);             // { line, comment } shown on the meet-Uncle screen
  const [meetTyped, setMeetTyped] = useState(0);              // how many of Jonah's meet lines have finished typing (gates the controls)
  const [modeInfo, setModeInfo] = useState(null);             // which mode-select ⓘ is open
  const [researched, setResearched] = useState({}); // assignment step -> revealed research note (Research button)
  const [cityPlan, setCityPlan] = useState(null); // country-layer city step: { ids, wide } (wide = continent view for thin countries)
  const [quiz, setQuiz] = useState(null); // Quiz mode: { questions, i, answeredIdx, score, correctCount, streak, done, best }
  const [quizBonus, setQuizBonus] = useState(0); // ½-pt-per-correct homecoming review extra credit folded into the trip score
  const [homeTypedI, setHomeTypedI] = useState(-1); // homecoming: index of the question whose Uncle intro has finished typing (gates the answers)
  const [endLine, setEndLine] = useState(""); // Jonah's one random line on the results screen (picked once per results view)
  const [expedition, setExpedition] = useState(null); // active themed expedition {id,title,emoji,lesson} (a curated Grand Tour)
  const [guestMet, setGuestMet] = useState(false); // has a guest (no profile) met Uncle Jonah this session?
  const [countryPopup, setCountryPopup] = useState(null); // culture card popup shown on arrival in a country
  // Which map pin / country the mouse (or keyboard focus) is over. Names hide until
  // hovered, and a hovered pin is repainted last so its icon rides on top.
  const [hoverPin, setHoverPin] = useState(null);
  const [hoverCountry, setHoverCountry] = useState(null);
  const [mrO, setMrO] = useState(null); // Mr. O's "Oh, did you know?" bubble (a fact string, or null)
  const [mrOBeats, setMrOBeats] = useState(null); // his first-time introduction (a multi-beat bubble, or null)
  const mrOSeen = useRef([]); // indices shown this session, so he doesn't repeat
  const guestMetMrORef = useRef(false); // a guest (no profile) met Mr O this session
  // First-time-only intro, mirroring metNigel: a saved traveler remembers meeting him
  // across sessions; a guest just for this one.
  const hasMetMrO = () => (profileName ? !!getProfile(profileName)?.metMrO : guestMetMrORef.current);
  const introduceMrO = () => {
    if (profileName) setProfileFlag(profileName, "metMrO", true); else guestMetMrORef.current = true;
    setMrOBeats([MR_O.intro, MR_O.fieldGuide]);
  };
  // Mr. O pops up ~30% of the time on touching down at a new continent, with a
  // fresh geography fact ABOUT that continent (plus globally-true facts), so his
  // "did you know" matches the map you just landed on. Non-blocking; auto-dismisses.
  const arrivalRollRef = useRef(0); // counts continent arrivals, for the Daily's seeded riddle cadence
  const mrOGapRef = useRef(MRO_MIN_GAP); // arrivals since Mr O last appeared (starts eligible)
  const tipPendingRef = useRef(false);   // Field-Guide coaching tip, queued until assignment 2
  // Show a "did you know?" bubble. He leads with somewhere you've actually BEEN this
  // trip — a country you photographed, told in the very words that used to sit on its
  // arrival card (the blurb was moved OFF that card to here, so a child meets the fact
  // when it can land rather than while trying to get past the arrival). When there's
  // nowhere seen yet to draw on, he falls back to a fact about the continent underfoot.
  const showMrOFact = (continent) => {
    // His "did you know" stays on the map you're standing on. His recall of a place
    // you've been is restricted to THIS continent too — "remember Peru?" while you're
    // in Peru, never while you're in Japan. Off-continent recall was the main way he
    // talked about somewhere that wasn't where you were.
    const seenHere = [...new Set(album.filter((p) => BY_ID[p.id]?.continent === continent).map((p) => p.country))]
      .filter((c) => COUNTRY_INFO[c]?.blurb);
    if (seenHere.length && Math.random() < 0.5) {
      const c = seenHere[Math.floor(Math.random() * seenHere.length)];
      setMrO(`Remember ${c}? ${COUNTRY_INFO[c].blurb}`);
      return;
    }
    // Facts ABOUT this continent only. Every continent has at least five, so the
    // globally-true facts are just a safety net if a continent's set ever emptied —
    // they are not mixed in by default any more, which is what let him deliver a fact
    // about the Sahara while the player was in Asia.
    let onCont = MR_O_FACTS.map((_, i) => i).filter((i) => MR_O_FACTS[i].where === continent);
    if (!onCont.length) onCont = MR_O_FACTS.map((_, i) => i).filter((i) => MR_O_FACTS[i].where == null);
    let pool = onCont.filter((i) => !mrOSeen.current.includes(i));
    if (!pool.length) { mrOSeen.current = mrOSeen.current.filter((i) => !onCont.includes(i)); pool = onCont; } // seen them all here — reshuffle just this continent
    const i = pool[Math.floor(Math.random() * pool.length)];
    mrOSeen.current.push(i);
    setMrO(MR_O_FACTS[i].text);
  };
  // Open a double-points riddle (seeded on a Daily so every player gets the same chances).
  const openArrivalRiddle = (ix, continent) => {
    // His riddles stay on the map you're standing on, the same way his facts already
    // did. Untagged before, so he'd ask about a safari while you stood in the
    // Philippines — the one thing that made him feel like a quiz machine rather than
    // someone riding along with you.
    //
    // The fallbacks matter and are ordered: this continent's unseen riddles, then this
    // continent's seen ones (repeat a local question rather than ask a foreign one),
    // and only if a continent somehow has none at all does anything else get used.
    const onCont = (i) => {
      const w = MR_O_RIDDLES[i].where;
      return !continent || w === continent || w === null;
    };
    const all = MR_O_RIDDLES.map((_, i) => i);
    let pool = all.filter((i) => onCont(i) && !riddleSeen.current.includes(i));
    if (!pool.length) pool = all.filter(onCont);
    if (!pool.length) pool = all;
    const seed = riddleSeedRef.current;
    const pick = seed ? withSeed(seed + "|rq|" + ix, () => pool[randInt(pool.length)]) : pool[Math.floor(Math.random() * pool.length)];
    riddleSeen.current.push(pick);
    const data = MR_O_RIDDLES[pick];
    const choices = seed ? withSeed(seed + "|rs|" + ix, () => shuffled(data.choices)) : shuffleArr(data.choices);
    setRiddle({ data, choices, answeredIdx: null });
  };
  // Mr O ONLY shows up on arriving at a NEW place — never while you're choosing within
  // a country. He rides no more than once every MRO_MIN_GAP arrivals: a bus that
  // stops too often stops being a treat and starts being an interruption a child taps
  // through. The gap is a hard floor; WHEN he appears inside an eligible window is a
  // coin-flip, so the timing stays random rather than clockwork on every fifth stop.
  // When he does appear it's a double-points riddle (~40% of the time) or a "did you
  // know?" about somewhere you've been (~60%).
  const maybeMrO = (continent) => {
    const ix = arrivalRollRef.current++;
    mrOGapRef.current += 1;
    if (mrOGapRef.current < MRO_MIN_GAP) return;      // too soon since he last rode
    // Nobody rides along on the FIRST assignment. A player opening a run is taking in
    // the whole board — the note, the map, the itinerary, the tools — and Mr O landing
    // on top of that is one thing too many. He waits for assignment 2.
    //
    // Gated on `step`, the assignment number, NOT on the arrival counter: a player who
    // guesses the wrong continent first has already "arrived" twice by the time they
    // reach the right one, and an arrival-counted gate let him through while the note
    // still read ASSIGNMENT 1.
    if (step < 1) return;
    // His INTRODUCTION is not rolled for here — it is fired once, deterministically,
    // by the effect below. Leaving it in the roll meant it competed with riddles for
    // the same slot, so one player met him at assignment 2 and another at assignment 7
    // (and a player could see the same "hello, I'm Mr O" beats twice, since only the
    // fact branch set the flag). From here on he only ever brings a fact or a riddle.
    const seed = riddleSeedRef.current;
    const roll = seed ? withSeed(seed + "|arr|" + ix, () => rnd()) : Math.random();
    if (roll < 0.5) {
      mrOGapRef.current = 0;
      sfx("bwooop");                                   // his cheerful pop-in, every time
      if (roll < 0.4) openArrivalRiddle(ix, continent);
      else showMrOFact(continent);
    }
  };
  // Mr O introduces himself ONCE EVER, at the same moment for every player: the
  // instant assignment 1 is filed and the note turns over to ASSIGNMENT 2. He explains
  // who he is and what the Field Guide does, and never says either again — `metMrO`
  // persists on the profile (a guest remembers for the session).
  useEffect(() => {
    if (screen !== "play" || step < 1 || hasMetMrO()) return;
    const t = setTimeout(() => {
      sfx("bwooop");
      introduceMrO();
      mrOGapRef.current = 0;   // he just rode; don't let him ride again next arrival
      tipPendingRef.current = false; // his intro already covers the Field Guide
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, screen]);
  // The queued Field-Guide coaching tip, released once the player is past their first
  // assignment (see startGame). Fires on the step change rather than a timer from the
  // start of the run, so it can't land while assignment 1 is still being read.
  useEffect(() => {
    // Stand down if he hasn't introduced himself yet — the intro carries the same
    // Field-Guide explanation, and the two firing together would say it twice.
    if (screen !== "play" || step < 1 || !tipPendingRef.current || !hasMetMrO()) return;
    tipPendingRef.current = false;
    const t = setTimeout(() => { sfx("bwooop"); setMrO(MR_O_FIELDGUIDE_TIP); }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, screen]);
  // ---- Dev-only screen jump ---------------------------------------------------
  // Reaching the Chile map (or the homecoming quiz, or the results screen) through
  // the UI takes a dozen correct clicks, which makes checking a layout change slow
  // enough that it tends not to get checked. In `npm run dev` only, hang the state
  // setters off window so a screen can be jumped to directly:
  //   __sbw.country("South America", "Chile")   __sbw.go("end")
  // import.meta.env.DEV is false in `npm run build`, so this whole block is dropped
  // from the shipped bundle — it can never be reached by a player.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__sbw = {
      go: setScreen,
      phase: setPhase,
      difficulty: setDifficulty,
      country: (continent, country, ids) => {
        setScreen("play"); setPickedContinent(continent); setPickedCountry(country);
        setCityPlan({ ids: ids || (COUNTRY_LOCS[continent] || {})[country] || [], wide: false });
        setPhase("city");
      },
      continent: (c) => { setScreen("play"); setPickedContinent(c); setPickedCountry(null); setPhase("country"); },
      mode: (m) => setGameMode(m),
      gameMode: () => gameMode,
      kit: () => kit,
      kitPicked: () => kitPicked,
      // Fill the album with real places, then jump to the review or the results —
      // the two screens whose layout is hardest to reach and easiest to break.
      album: (ids) => setAlbum((ids || []).map((id) => {
        const l = BY_ID[id];
        return { id, subject: l.subject, city: l.city, country: l.country, flag: l.flag, fact: l.fact, photo: l.photo };
      })),
      homecoming: () => startHomecoming(),
      mrO: (t) => setMrO(t || "the Sahara is nearly the size of the whole United States?"),  // the bubble adds his "Oh! Did you know…" lead
      mrOIntro: () => setMrOBeats([MR_O.intro, MR_O.fieldGuide]),
      pending: (p) => { setScreen("play"); setPending(p); },
      profile: (n) => setProfileName(n),
      days: (n) => setDays(n),
      passport: () => setPassportOpen(true),
      // A snapshot of the run's bookkeeping. Added while chasing "clicking a
      // landmark does nothing": the answer was in the relationship between `step`
      // and `assignments.length`, which nothing on screen shows.
      state: () => ({ screen, phase, gameMode, difficulty, step, assignments: assignments.length,
        options: optionsByStep.length, days, album: album.length, current, pickedContinent, pickedCountry }),
      // The country arrival card, with an optional local-transport still on it:
      //   __sbw.card("Thailand", "tuktuk")
      // Reaching this through the UI needs a live assignment and a 4s flight.
      card: (country, modeId) => { setArrivalRide(modeId ? TRANSPORT_BY_ID[modeId] : null); setCountryPopup(country); },
    };
    return () => { delete window.__sbw; };
    // No dep array on purpose: re-registering every render keeps these bound to the
    // CURRENT closures, so `homecoming()` sees the album a previous call just set.
  });
  // ---- The splash bed ---------------------------------------------------------
  // On the splash the pipes hold a quiet drone — the sound of a piper stood ready —
  // and clicking "Begin your adventure" starts the melody over the top of it. Both
  // are D Mixolydian over the same D2+A2 drone, so that transition is a swell into
  // the tune rather than one piece of music being cut off by another.
  //
  // A browser will not let audio sound before the user has interacted with the page,
  // and arriving at a splash screen is not an interaction. So this tries immediately
  // (which works on a soft navigation, where the context is already unlocked) and
  // otherwise waits for the first pointer or key event and tries once more.
  useEffect(() => {
    if (!musicOn || screen !== "start") return;
    let done = false;
    const go = () => { if (done) return; done = true; MUSIC.droneBed(); off(); };
    const off = () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("pointermove", go);
      window.removeEventListener("keydown", go);
    };
    MUSIC.droneBed();
    window.addEventListener("pointerdown", go);
    window.addEventListener("pointermove", go, { once: false });
    window.addEventListener("keydown", go);
    return off;
  }, [musicOn, screen]);
  // ---- Enter as "the obvious next thing" --------------------------------------
  // One key that always does whatever the screen is plainly waiting for: finish the
  // line that's still typing, or press the main button. A child playing with one hand
  // on the keyboard shouldn't have to hunt for the mouse to get on, and the tab order
  // is long on screens with a map full of countries in it.
  //
  // Deliberately NOT advertised anywhere on screen: a visible "press Enter to skip"
  // teaches that the words are something to get past, which is the same reason the
  // "tap to read faster" hint came out of Jonah's story.
  //
  // Order matters. Typing first: if something is mid-reveal, Enter completes it and
  // stops there, so one press never both finishes a sentence and dismisses the card
  // it's sitting in — that would skip a fact a child never saw.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onKey = (e) => {
      if (e.key !== "Enter") return;
      // Never hijack Enter inside a text field or off a focused control — the name
      // box, and any button the player has actually tabbed to, keep their own meaning.
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable)) return;
      if (tag === "BUTTON" || tag === "A") return;
      const typing = document.querySelectorAll('[data-typing="1"]');
      if (typing.length) {
        e.preventDefault();
        typing.forEach((el) => el.click());
        return;
      }
      // Otherwise press the screen's primary action, if it has offered one — but
      // SCOPED to the topmost dialog when one is open. Without that, Enter on Mr O's
      // bubble would reach past him and press the button on the card underneath,
      // dismissing a result the player hasn't looked at. A dialog with no primary of
      // its own (Mr O's bubble) simply gets nothing from here and is left to its own
      // Enter handler.
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const scope = dialogs.length ? dialogs[dialogs.length - 1] : document;
      const btn = scope.querySelector('button[data-primary]:not([disabled])');
      if (btn) { e.preventDefault(); btn.click(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const poppedCountryRef = useRef(null); // country whose arrival popup already showed this leg
  const [dreamPending, setDreamPending] = useState(false); // Jonah's dream just fulfilled — show the win scene
  const pendingRunRef = useRef(null); // start action to run after the intro story
  const recorded = useRef(false);
  const startRef = useRef(0); // ms timestamp the current game began
  const timer = useRef(null);
  const flightFinalizeRef = useRef(null); // the pending "land the plane" fn
  const landingSfxRef = useRef(null);     // the queued landing sound
  // Send the plane. Every flight goes through here: the engines spool up as the
  // token grows out of the airport, and throttle back over the last 1.5s as it
  // shrinks onto its destination. The sound, the CSS keyframes and this timer all
  // read FLIGHT_MS — they were three separate 4s literals before, which is the
  // kind of thing that silently drifts the first time one of them is tuned.
  // ---- The overland hop -------------------------------------------------------
  // Picking a country used to teleport you into it. Now the country's own way of
  // getting about carries you there across the continent map first — a tuk-tuk into
  // Thailand, a camel across Morocco, the cog railway up into Switzerland. It is the
  // one mechanic in the game that teaches how people actually move around a place,
  // and it reuses the twelve transport tokens that were previously only ever seen on
  // a Grand Tour's inter-continent legs (so most players never saw them at all).
  // ---- Every leg flies -------------------------------------------------------
  // The overland vehicles used to drive themselves across the continent map — a
  // tuk-tuk into Thailand, a camel across Morocco. Joshua's call, and it's the right
  // one: at the distances this game actually covers you would fly, and a camel
  // crossing a country border claimed a journey nobody takes.
  //
  // The teaching survives without the animation. `rideLegFor` still works out which
  // way people get about in that country; it now rides on the ARRIVAL CARD as a
  // still, where it reads as "this is how you'd get around here" rather than "this
  // is how you crossed a continent". One plane, one 4s flight, one music cue,
  // everywhere.
  const [arrivalRide, setArrivalRide] = useState(null);   // the local way-of-getting-about to show on the country card
  const launchFlight = (from, to, finalize) => {
    sfx("takeoff", PLANE_SCALE_SEC);
    landingSfxRef.current = setTimeout(() => { landingSfxRef.current = null; sfx("landing", PLANE_SCALE_SEC); }, FLIGHT_MS - PLANE_SCALE_MS);
    flightFinalizeRef.current = finalize;
    setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
    // Land the plane HERE, not in the caller's finalize. The continent finalizers
    // each cleared `flying` themselves, which was fine while they were the only
    // callers — then the country hop started flying too (it used to drive an
    // overland vehicle, which cleared its own state), and its arrival callbacks
    // had no reason to know about `flying`. It stayed set for the rest of the run,
    // `busy` stayed true, and every click afterwards was silently swallowed: the
    // player could still see the map and hover the pins, but photographing did
    // nothing at all. Clearing it in the one place every flight goes through means
    // a future caller cannot forget.
    timer.current = setTimeout(() => {
      flightFinalizeRef.current = null;
      setFlying(null);
      finalize();
    }, FLIGHT_MS);
  };
  useEffect(() => () => { if (landingSfxRef.current) clearTimeout(landingSfxRef.current); }, []);
  const refreshProfiles = () => setProfiles(listProfiles());

  // Animations: on/off is a game setting. It defaults to the OS "reduce
  // motion" preference but the ✨ toggle can override in either direction
  // (persisted). prefersReduced drives every JS animation path.
  const [animOn, setAnimOn] = useState(() => {
    try { const v = localStorage.getItem("shutterbug.anim"); if (v) return v === "on"; } catch { /* ignore */ }
    return !(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  });
  useEffect(() => {
    try { localStorage.setItem("shutterbug.anim", animOn ? "on" : "off"); } catch { /* ignore */ }
    if (typeof document !== "undefined") document.body.classList.toggle("sbw-no-anim", !animOn);
  }, [animOn]);
  const prefersReduced = !animOn;

  // A world-spanning route is wider than a phone, so its map pans inside its frame
  // (see the journey screen). Keep the stop you're looking for in view: otherwise the
  // map opens on its left edge and the pin the player is being asked to find is off
  // the side of it. Declared after prefersReduced because it reads it.
  useEffect(() => {
    const el = journeyMapRef.current;
    if (!el || !journey || el.scrollWidth <= el.clientWidth) return;
    const j = JOURNEY_BY_ID[journey.id];
    const i = Math.min(journey.reveal !== null ? journey.reveal : journey.at, j.stops.length - 1);
    const box = journeyBox(j);
    const frac = (unrolledX(j)[i] - box.x) / box.w;
    // Instant, not smooth: a smooth scroll here is unreliable (some engines drop it),
    // and jumping straight to the stop orients the player without a distracting slide.
    el.scrollTo({ left: Math.max(0, frac * el.scrollWidth - el.clientWidth / 2), behavior: "auto" });
  }, [journey?.id, journey?.at, journey?.reveal]);

  const sfx = (name, ...args) => { if (soundOn && SFX[name]) SFX[name](...args); };
  // A shot's REWARD sound lands after the photo finishes developing, not at the
  // click — so what you hear when you press the shutter is the shutter, and the
  // happy chime arrives a beat later as the picture blooms into colour. The delay
  // matches the .sbw-develop animation (1.5s); reduced motion shows the photo whole
  // and immediately, so the sound plays at once too.
  const DEVELOP_MS = 1900;
  const rewardSfx = (name) => { if (prefersReduced) sfx(name); else setTimeout(() => sfx(name), DEVELOP_MS); };
  // The typing components call SFX.type() straight from their per-character tick,
  // so the sound module needs to know about the toggle on its own.
  useEffect(() => { SFX.setMuted(!soundOn); }, [soundOn]);

  // A soft ping when the pointer finds something clickable. One delegated listener
  // rather than an onMouseEnter on every button in a 5,000-line component — and it
  // catches anything added later for free.
  //
  // `(hover: hover)` keeps it off touchscreens, where a tap fires a synthetic
  // mouseover and every press would ping before it clicked. The last-element guard
  // is what stops a button with an icon and a label inside it from firing three
  // times as the pointer crosses its children.
  useEffect(() => {
    if (!soundOn) return;
    if (typeof window === "undefined" || !window.matchMedia?.("(hover: hover)")?.matches) return;
    let last = null;
    const onOver = (e) => {
      const el = e.target?.closest?.('button, a[href], [role="button"], summary');
      if (!el || el === last) { if (!el) last = null; return; }
      last = el;
      if (el.disabled || el.getAttribute("aria-disabled") === "true") return;
      SFX.hover();
    };
    document.addEventListener("mouseover", onOver, true);
    return () => document.removeEventListener("mouseover", onOver, true);
  }, [soundOn]);
  // A quiet wooden "thunk" under every button press, delegated the same way as the
  // hover ping above — one capture-phase listener so every button in the app gets
  // it, including any added later, without threading a handler through each one.
  // Capture phase means it fires before the button's own onClick, so a button that
  // also plays its own sound (the shutter, a stamp) layers the thunk underneath.
  useEffect(() => {
    if (!soundOn || typeof document === "undefined") return;
    const onClick = (e) => {
      const el = e.target?.closest?.('button, a[href], [role="button"], summary');
      if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
      SFX.click();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [soundOn]);
  const music = (name, ...args) => { if (musicOn && MUSIC[name]) MUSIC[name](...args); };
  // Tap-to-learn: open a field-note deck, and record each card a saved traveler reads
  // so poking around counts toward "Curiosities found". Guests just don't persist.
  const openCurio = (deckId) => { if (CURIOSITY_DECK_BY_ID[deckId]) { setCurioDeck(deckId); } };
  const onCurioSeen = useCallback((cardId) => {
    if (profileName) markCuriositySeen(profileName, cardId);
    setCurioTick((t) => t + 1);
  }, [profileName]);
  const curioFound = profileName ? Object.keys(curiositiesSeen(getProfile(profileName))).length : 0;
  // Spoken map-arrival announcements — held back 1.5s so the voice lands after the
  // plane has settled and the landing engines have died away, rather than talking
  // over them.
  const say = (text) => { if (soundOn) setTimeout(() => { if (soundOn) speakEn(text); }, 1500); };
  // Arriving in a COUNTRY says its name, waits a beat, then says hello in the local
  // language — the greeting the culture card is showing on screen at that moment, so
  // the child hears the words they're looking at. Cancelled if they leave first.
  const sayArrivalRef = useRef(null);
  const sayCountry = (country) => {
    if (!soundOn) return;
    if (sayArrivalRef.current) sayArrivalRef.current();
    const t = setTimeout(() => {
      if (!soundOn) return;
      sayArrivalRef.current = speakArrival(country, COUNTRY_GREETING[country]);
    }, 1500);
    sayArrivalRef.current = () => clearTimeout(t);
  };
  useEffect(() => () => { if (sayArrivalRef.current) sayArrivalRef.current(); }, []);
  // On the two gentlest tiers, the map reads itself aloud: hover a continent or a
  // country and hear its name. It's how a five-year-old who can't read "Madagascar"
  // still learns to find it.
  //
  // Debounced, because a pointer dragged across the world crosses a dozen regions
  // on the way to the one it wants, and speakEn cancels whatever is mid-sentence —
  // without the wait you'd hear twelve first syllables instead of one name.
  const hoverSayRef = useRef(null);
  const sayOnHover = (text) => {
    if (!soundOn || !text || !MODES[difficulty]?.sayOnHover) return;
    if (hoverSayRef.current) clearTimeout(hoverSayRef.current);
    hoverSayRef.current = setTimeout(() => speakEn(text), 260);
  };
  useEffect(() => () => { if (hoverSayRef.current) clearTimeout(hoverSayRef.current); }, []);
  // Scout tier only: after a wrong pick, gently flash the CORRECT answer's region
  // or pin so the youngest players can find it. Clears once they pick correctly.
  const flashRight = (type, key) => { if (key && MODES[difficulty] && MODES[difficulty].flashOnWrong) setFlashHint({ type, key }); };

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  // Tick the on-screen play timer once a second (only while actually playing).
  useEffect(() => {
    if (screen !== "play") return;
    setLiveNow(Date.now());
    const id = setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [screen]);

  const loc = (id) => LOCATIONS.find((l) => l.id === id);
  // An assignment is either { type:"specific", targetId, continent } or
  // { type:"category", category, continent, anchorId }. `target` is the specific
  // subject, or (for a category mission) a representative anchor on that continent.
  const asg = assignments.length ? assignments[step] : null;
  const isCatAsg = asg?.type === "category";
  const target = asg ? loc(isCatAsg ? asg.anchorId : asg.targetId) : null;
  const currentLoc = current ? loc(current) : null;

  // Which city pins to show on the zoomed continent: the current assignment's
  // options, or (in Grand Tour) the options for the continent you're standing on.
  // In the country layer, the city choices are the picked country's own landmarks
  // (computed at pick-time, so it works for category missions where the country is
  // the player's free choice). Otherwise the pre-built per-step options.
  const cityOptions = gameMode === "tour"
      // Grand Tour now routes through the country map too: once a country is
      // picked, the city step shows that country's own landmarks; on a country-
      // less continent (Antarctica) it falls back to the continent's targets.
      ? ((pickedCountry && cityPlan) ? cityPlan.ids : (tourOptions[pickedContinent] || []))
    : gameMode === "explore"
      ? (pickedCountry ? ((COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][pickedCountry]) || [])
                       : LOCATIONS.filter((l) => l.continent === pickedContinent).map((l) => l.id))
    : (pickedCountry && cityPlan) ? cityPlan.ids
    : (pickedCountry && COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][pickedCountry]) ? COUNTRY_LOCS[pickedContinent][pickedCountry]
    : (optionsByStep[step] || []);

  // --- Story frame: the very first expedition a traveler sets out on opens
  // with Uncle Jonah's story (once per profile / once per guest session).
  // Afterward the chosen expedition launches straight away. ----
  const hasMetNigel = () => (profileName ? !!getProfile(profileName)?.metNigel : guestMet);
  // Jonah's dream is "fulfilled" once you've brought him the world: a stamp on
  // at least 6 of the 7 continents and 30+ countries mastered. A one-time
  // triumphant scene plays; everything stays playable afterward.
  function dreamFulfilled(profile) {
    if (!profile) return false;
    const pp = passportData(profile);
    const touched = Object.values(pp.continents).filter((v) => v.mastered > 0).length;
    return touched >= 6 && pp.masteredCount >= 30;
  }
  function beginWithStory(run) {
    if (hasMetNigel()) { run(); return; }
    pendingRunRef.current = run;
    setScreen("intro");
  }
  function finishStory() {
    if (profileName) setProfileFlag(profileName, "metNigel", true); else setGuestMet(true);
    const run = pendingRunRef.current;
    pendingRunRef.current = null;
    if (run) run(); else setScreen("start");
  }
  // From the splash "Continue/Begin your adventure" button: go to the meet-Uncle
  // screen (where the mode + difficulty are chosen). A brand-new traveler sees
  // Jonah's one-time intro story first, then lands on the meet screen.
  function enterMeetScreen() {
    // Pick Jonah's line + his nod to the last trip once, so they don't reshuffle
    // as the player fiddles with mode/difficulty.
    const line = MEET_LINES[Math.floor(Math.random() * MEET_LINES.length)];
    const profile = profileName ? getProfile(profileName) : null;
    const lr = profile && profile.lastRun;
    // The pool and the face he wears travel together — the pool IS the attitude
    // (great = proud of you, rough = comforting you), so pick them at the same time.
    let pool, mood;
    if (!lr || !(profile.games > 0)) { pool = MEET_RUN.firstTime; mood = "meetFirst"; }
    else if (lr.won) {
      if (Math.random() < 0.4) { pool = MEET_RUN.great; mood = "meetGreat"; }
      else { pool = MEET_RUN.good; mood = "meetGood"; }
    } else { pool = MEET_RUN.rough; mood = "meetRough"; }
    const comment = pool[Math.floor(Math.random() * pool.length)];

    // Rank-up + newly-unlocked news (saved travelers only). On the very first
    // meet we baseline silently; after that, Uncle announces what's new.
    const news = [];
    if (profile) {
      const u = unlocks(profile);
      const rank = careerRank(profile);
      // "quiz" is intentionally not here: it's no longer a mode to announce as
      // unlocked (the review quiz just happens at the end of every run now).
      const ANN = ["medium", "tour", "hard", "expeditions"];
      const nowUnlocked = ANN.filter((k) => u[k]);
      const seen = profile.seenUnlocks;
      const seenRank = typeof profile.seenRank === "number" ? profile.seenRank : rank.tier;
      if (Array.isArray(seen)) {
        if (rank.tier > seenRank) news.push(RANKUP_LINE(rank.title));
        for (const k of nowUnlocked) if (!seen.includes(k) && UNLOCK_LINES[k]) news.push(UNLOCK_LINES[k]);
      }
      setProfileFlag(profile.name, "seenUnlocks", nowUnlocked);
      setProfileFlag(profile.name, "seenRank", rank.tier);
      // Don't leave a locked mode/difficulty selected from a previous session.
      if (!u[gameMode]) setGameMode("assignments");
      if (!u[difficulty]) setDifficulty("easy");
    }
    setMeetInfo({ line, comment, news, mood });
    setMeetTyped(0); // Uncle starts talking; controls stay grayed until he's done
    setScreen("meet");
  }
  function goToMeet() {
    if (!hasChosen) { setPromptTraveler(true); return; }
    startMusicMaybe();
    if (hasMetNigel()) { enterMeetScreen(); return; }
    pendingRunRef.current = enterMeetScreen; // after the intro story, land on the meet screen
    setScreen("intro");
  }
  // Create a brand-new traveler and set off in one go (from the Create modal).
  // Uses the created name directly so it doesn't depend on not-yet-flushed state.
  // A new profile can't have met Uncle, so the intro story always plays first,
  // then the meet screen. Returns false if the name is blank or already taken.
  function createAndBegin(name, spec) {
    const p = createProfile(name);
    if (!p) return false;
    if (spec) setAvatar(p.name, spec);
    setProfileName(p.name); setLastProfile(p.name); setHasChosen(true); setPromptTraveler(false);
    refreshProfiles(); sfx("stamp");
    setCreateOpen(false); startMusicMaybe();
    pendingRunRef.current = enterMeetScreen; // after the one-time intro, land on the meet screen
    setScreen("intro");
    return true;
  }
  // The meet screen's "Set off" — launch whatever mode/difficulty were chosen
  // there. The intro story (if any) already played on the way in, so these start
  // the run directly.
  function setOff() {
    const u = unlocks(profileName ? getProfile(profileName) : null);
    if (gameMode === "journey") return startJourney(journeyId);
    if (gameMode === "explore") return startExplore();
    if (gameMode === "tour" && u.tour) {
      const themed = tourTheme !== "classic" && u.expeditions;
      return themed ? startExpedition(EXPEDITIONS.find((e) => e.id === tourTheme)) : startTour();
    }
    // The Long Trip stops at Jonah's bag first: he deals a hand of kit, you take two,
    // and only then does the trip start. The hand is dealt through rng.js so a seeded
    // run gives everyone the same offer.
    if (gameMode === "longtrip") { setKitPicked([]); setCondition(shuffled(CONDITIONS)[0]); setKitOffer(shuffled(KIT_ITEMS).slice(0, KIT_OFFERED)); setScreen("kit"); return; }
    return startGame(); // assignments (always unlocked) — also the safe fallback
  }

  // Leaving the bag screen: remember what was taken (id -> charges) and set off.
  function startLongTrip(chosenIds) {
    const packed = {};
    for (const id of chosenIds) if (KIT_BY_ID[id]) packed[id] = KIT_BY_ID[id].charges;
    setKit(packed);
    setKitOffer(null);
    setKitNote(null);
    setScreen("play");
    startGame();
  }

  // `daily` (a day number) turns this into the Daily Expedition: the whole plan is
  // built inside withSeed, so every player on this day and tier gets the identical
  // run — and it's built from a NULL profile, because the usual spaced-repetition
  // ordering would otherwise tailor the run to whoever is playing, which is exactly
  // what a shared daily must not do.
  function startGame(daily = null) {
    // music continues from the splash/meet screen and fades out at the map
    // The Long Trip is endless, so it queues a deep list rather than a fixed one:
    // the run ends when the days do, and 40 assignments is far past what any day
    // budget survives. Generating more mid-run would be the alternative, but this
    // costs one planning pass and can never hand `assignments[step]` an undefined.
    const LONG_TRIP_DEPTH = 40;
    const mode = daily ? { ...modePlan(difficulty), assignments: DAILY_ASSIGNMENTS }
      : gameMode === "longtrip" ? { ...modePlan(difficulty), assignments: LONG_TRIP_DEPTH }
      : modePlan(difficulty);
    const profile = profileName ? getProfile(profileName) : null;
    // Weighted order surfaces the active player's missed/unmastered places more
    // often (a plain shuffle for guests). Used to fill the non-fresh anchor slots
    // and to pick same-continent city decoys.
    // Jonah's wish biases only a NORMAL run — never the Daily, which must be the
    // same for everyone. Read once here; the ref is cleared just below so it colours
    // exactly one trip.
    const wish = daily ? null : grandpaWishRef.current;
    const plan = () => {
      const order = weightedOrder(daily ? null : profile).map((id) => BY_ID[id]);
      const anchors = pickAnchors(daily ? null : profile, order, mode.assignments, wish);
      return makeAssignmentPlan(mode, anchors, order);
    };
    const { assignmentObjs, options } = daily ? withSeed(dailySeed(daily, difficulty), plan) : plan();
    grandpaWishRef.current = null; // spent — it colours only the one trip that follows
    setAssignments(assignmentObjs);
    setOptionsByStep(options);
    setStep(0);
    setPhase("continent");
    setPickedContinent(null);
    setPickedCountry(null);
    setCurrent(null);
    // Budget = the clean-route cost (distance flight + one shot per assignment,
    // hopping hub → continent → continent) plus the difficulty's slack days.
    let cleanCost = 0, fromXY = HUB;
    for (const a of assignmentObjs) { const to = CONTINENT_PIN[a.continent]; cleanCost += flightDays(fromXY, to) + SHOT_COST; fromXY = to; }
    // The Long Trip gets a FLAT purse instead, because its list is 40 deep and
    // budgeting the whole list would hand out a fortune. This is the number the mode
    // turns on: enough for roughly five or six clean legs, so a wasted flight really
    // is felt, and the bag is what buys you the extra ones.
    const LONG_TRIP_DAYS = { scout: 17, easy: 15, medium: 13, hard: 11 };
    setDays(gameMode === "longtrip"
      ? (LONG_TRIP_DAYS[difficulty] ?? 13)
      : Math.round((cleanCost + mode.slack) * 10) / 10);
    setScore(0);
    setAlbum([]);
    setVisitedIds([]);
    setRevealed(false);
    setLastResult(null);
    setNewBadges([]);
    setPending(null);
    setElapsedMs(0);
    setResearched({});
    setCityPlan(null);
    setTourPlan(null);
    missesRef.current = {};
    riddleCountRef.current = 0;
    startRef.current = Date.now();
    recorded.current = false;
    setMsg({ type: "info", text: daily
      ? `Day ${daily} — the same expedition everyone else is flying today. Good luck!`
      : "Read Jonah's note, then pick the right continent on the map." });
    setFlying(null);
    // Riddles carry a small score bonus, so on a daily the cadence is seeded too —
    // otherwise two players on the "identical" run would be offered a different
    // number of chances to earn it.
    resetRiddles(daily ? dailySeed(daily, difficulty) + "|riddles" : null);
    setDailyDay(daily);
    // startGame() is shared by Assignments, the Daily and the Long Trip, so it must
    // not stamp the mode over the top of a caller that already set one — that reset
    // was silently turning a Long Trip into a plain Assignments run the instant it
    // began (the bag was packed, the days were right, and nothing else in the mode
    // was reachable because every check on gameMode had already gone false).
    setGameMode(daily ? "daily" : gameMode === "longtrip" ? "longtrip" : "assignments"); setExpedition(null);
    if (gameMode !== "longtrip") setCondition(null);
    setScreen("play");
    // Coaching: every 5th run, Mr O reminds the player they can research a clue via
    // the Field Guide (only where research applies). The first run is skipped — his
    // first-time introduction (see introduceMrO) already explains the Field Guide.
    //
    // QUEUED, not fired: this used to pop 1.6s after the map appeared, which put him
    // on screen while the player was still reading their first assignment. Like every
    // other appearance he now waits for assignment 2 (see the effect on `step`).
    const gamesPlayed = profile ? (profile.games || 0) : 0;
    tipPendingRef.current = !daily && mode.research !== "off" && gamesPlayed > 0 && gamesPlayed % 5 === 0;
  }

  // ---- Grand Tour: build an itinerary of targets across continents on one shared ----
  // ---- day budget, fulfilled in any order. ----
  function startTour() {
    // music continues from the splash/meet screen and fades out at the map
    const tm = TOUR_MODES[difficulty];
    const profile = profileName ? getProfile(profileName) : null;
    const order = weightedOrder(profile).map((id) => BY_ID[id]);
    const masteredSet = new Set(profile && profile.loc ? Object.keys(profile.loc).filter((id) => profile.loc[id].c > 0) : []);

    // Choose the continents to visit: (reqs-1) distinct, then repeat one — so at
    // least one continent holds two targets, making route-grouping worthwhile.
    const distinct = Math.max(1, Math.min(tm.reqs - 1, CONTINENTS.length));
    const picked = CONTINENTS.slice().sort(() => Math.random() - 0.5).slice(0, distinct);
    const slots = picked.slice();
    while (slots.length < tm.reqs) slots.push(picked[Math.floor(Math.random() * picked.length)]);
    slots.sort(() => Math.random() - 0.5);

    const usedAnchors = new Set(), usedCatCont = new Set(), reqs = [];
    for (const cont of slots) {
      // The Grand Tour flies straight to the city step, so no country-layer check.
      const catsHere = CATEGORY_ORDER.filter((c) => categoryMissionOK(c, cont)
        && CAT_LOCS[c][cont].some((id) => !usedAnchors.has(id)) && !usedCatCont.has(c + "|" + cont));
      let req = null;
      if (Math.random() < tm.catShare && catsHere.length) {
        const category = catsHere[Math.floor(Math.random() * catsHere.length)];
        const members = CAT_LOCS[category][cont].filter((id) => !usedAnchors.has(id));
        const fresh = members.filter((id) => !masteredSet.has(id));
        const anchorId = (fresh.length ? fresh : members)[Math.floor(Math.random() * (fresh.length ? fresh.length : members.length))];
        usedCatCont.add(category + "|" + cont);
        req = { kind: "category", continent: cont, category, anchorId, label: `any ${CATEGORIES[category].noun} in ${cont}` };
      } else {
        const pick = order.find((l) => l.continent === cont && !usedAnchors.has(l.id))
          || LOCATIONS.find((l) => l.continent === cont && !usedAnchors.has(l.id));
        if (!pick) continue;
        req = { kind: "specific", continent: cont, targetId: pick.id, anchorId: pick.id, label: `${pick.subject} — ${cont}` };
      }
      usedAnchors.add(req.anchorId);
      req.key = "r" + reqs.length; req.done = false;
      reqs.push(req);
    }

    // City options per visited continent: every target anchor there + a couple of
    // spaced decoys, shuffled (so a category target isn't obvious by elimination).
    const opts = {};
    const contsUsed = [...new Set(reqs.map((r) => r.continent))];
    for (const cont of contsUsed) {
      const anchors = reqs.filter((r) => r.continent === cont).map((r) => BY_ID[r.anchorId]);
      const far = spacedFor(CONTINENT_META[cont].box);
      const chosen = [...anchors];
      const total = Math.max(tm.labels === "all" ? 4 : 5, anchors.length + 2);
      for (const l of order) { if (chosen.length >= total) break; if (l.continent === cont && !chosen.includes(l) && far(l, chosen)) chosen.push(l); }
      for (const l of order) { if (chosen.length >= total) break; if (l.continent === cont && !chosen.includes(l)) chosen.push(l); }
      opts[cont] = chosen.map((l) => l.id).sort(() => Math.random() - 0.5);
    }

    // Budget: a generous route allowance (a distance-based flight to each visited
    // Budget = a PERFECT route + one shot per target + the tier's slack. The old
    // budget assumed you flew home to the hub between every continent and then
    // handed you a spare day per target on top, which made the route free — you
    // could visit the continents in any order at all and still coast home. Now the
    // only spare days you get are the slack, so the order is the game.
    const par = tourPar(contsUsed);
    // Travel-modes runs also pay TIME on each last leg, so add ~1 day of budget per
    // stop to cover it (the money budget is the tighter of the two resources there).
    const legSlack = (difficulty === "medium" || difficulty === "hard") ? reqs.length : 0;
    const budget = Math.round((par.cost + SHOT_COST * reqs.length + tm.slack + legSlack) * 10) / 10;

    setGameMode("tour"); setExpedition(null);
    setTourReqs(reqs);
    setTourOptions(opts);
    setTourPlan({ conts: contsUsed, order: contsUsed.slice(), par, budget, committed: false, deviations: 0 });
    setAssignments([]); setOptionsByStep([]); setStep(0);
    setPhase("continent"); setPickedContinent(null); setPickedCountry(null); setCityPlan(null); setCurrent(null);
    poppedCountryRef.current = null;
    setDays(budget); setScore(0); setAlbum([]); setVisitedIds([]);
    // Travel money — only the higher tiers budget cash for hubs + local transport.
    setMoney((difficulty === "medium" || difficulty === "hard") ? (difficulty === "hard" ? 2500 : 3500) : 0);
    setTravelChoice(null);
    setRevealed(false); setLastResult(null); setNewBadges([]); setPending(null);
    setElapsedMs(0); startRef.current = Date.now(); recorded.current = false;
    setMsg({ type: "info", text: "Fly your route. Straying from it costs a day." });
    setFlying(null);
    resetRiddles();
    setScreen("route");            // sequence the stops BEFORE you fly anywhere
  }

  // ---- Explore mode: no timer, no score, no losing. Fly anywhere, drill into any
  // country, click any place to read its full story (fact, culture card, all three
  // clue tiers). Everywhere you visit is stamped into the passport. ----
  function startExplore() {
    // music continues from the splash/meet screen and fades out at the map
    setGameMode("explore"); setExpedition(null);
    setTourReqs([]); setTourOptions({}); setTourPlan(null);
    setAssignments([]); setOptionsByStep([]); setStep(0);
    setPhase("continent"); setPickedContinent(null); setPickedCountry(null); setCityPlan(null);
    setCurrent(null); setDays(0); setScore(0); setAlbum([]); setVisitedIds([]);
    setRevealed(false); setLastResult(null); setNewBadges([]); setPending(null);
    setResearched({}); setElapsedMs(0);
    startRef.current = Date.now(); recorded.current = false;
    setMsg({ type: "info", text: "Explore freely — click any continent to begin. No timer, no score." });
    setFlying(null);
    setScreen("play");
  }
  // Explore: step back up one level (place → country/continent → world).
  function exploreBack() {
    if (flying || pending) return;
    setCurrent(null); setRevealed(false);
    if (phase === "city") {
      setCityPlan(null);
      if (pickedCountry && COUNTRY_LAYER_CONTINENTS.has(pickedContinent)) {
        setPickedCountry(null); setPhase("country");
        setMsg({ type: "info", text: `${pickedContinent} — pick a country to explore.` });
      } else {
        setPickedCountry(null); setPickedContinent(null); setPhase("continent");
        setMsg({ type: "info", text: "Pick a continent to explore." });
      }
    } else if (phase === "country") {
      setPickedContinent(null); setPhase("continent");
      setMsg({ type: "info", text: "Pick a continent to explore." });
    }
  }
  // Explore: finish and stamp everywhere visited into the passport.
  function doneExplore() {
    if (profileName && visitedIds.length) recordExplore(profileName, visitedIds);
    refreshProfiles();
    setScreen("start");
  }


  // ---- Themed Expedition: a curated Grand Tour around one theme, with a lesson. ----
  function startExpedition(exp) {
    const tm = TOUR_MODES[difficulty];
    const profile = profileName ? getProfile(profileName) : null;
    const order = weightedOrder(profile).map((id) => BY_ID[id]);
    // Gather the theme's members, then pick a round-the-world set: one per continent
    // first (up to reqs), then fill. Prefer fresh/unmastered via the weighted order.
    const members = order.filter(exp.pick);
    const byCont = {};
    for (const l of members) (byCont[l.continent] = byCont[l.continent] || []).push(l);
    const conts = shuffleArr(Object.keys(byCont));
    const picks = [];
    let ci = 0;
    while (picks.length < tm.reqs && conts.some((c) => byCont[c].length)) {
      const c = conts[ci % conts.length];
      if (byCont[c].length) picks.push(byCont[c].shift());
      ci++;
    }
    const reqs = picks.map((l, i) => ({ key: "r" + i, kind: "specific", continent: l.continent, targetId: l.id, anchorId: l.id, label: `${l.subject} — ${l.continent}`, done: false }));
    // City options per visited continent: the targets there + spaced decoys.
    const opts = {};
    const contsUsed = [...new Set(reqs.map((r) => r.continent))];
    for (const cont of contsUsed) {
      const anchors = reqs.filter((r) => r.continent === cont).map((r) => BY_ID[r.anchorId]);
      const far = spacedFor(CONTINENT_META[cont].box);
      const chosen = [...anchors];
      const total = Math.max(tm.labels === "all" ? 4 : 5, anchors.length + 2);
      for (const l of order) { if (chosen.length >= total) break; if (l.continent === cont && !chosen.includes(l) && far(l, chosen)) chosen.push(l); }
      for (const l of order) { if (chosen.length >= total) break; if (l.continent === cont && !chosen.includes(l)) chosen.push(l); }
      opts[cont] = chosen.map((l) => l.id).sort(() => Math.random() - 0.5);
    }
    const legs = contsUsed.reduce((s, c) => s + flightDays(HUB, CONTINENT_PIN[c]), 0);
    const budget = Math.ceil(legs + SHOT_COST * reqs.length + reqs.length + tm.slack + 2); // a touch more generous — expeditions are for learning
    setExpedition(exp);
    setGameMode("tour");
    // A themed Expedition is a GUIDED tour, not the route game: its stops are the
    // theme's, in the order the theme gives them, so there is no route to commit to
    // and no deviation to punish. Clearing the plan matters — a stale one left over
    // from a real Grand Tour would silently start charging detour days here.
    setTourPlan(null);
    setTourReqs(reqs); setTourOptions(opts);
    setAssignments([]); setOptionsByStep([]); setStep(0);
    setPhase("continent"); setPickedContinent(null); setPickedCountry(null); setCityPlan(null); setCurrent(null);
    setDays(budget); setScore(0); setAlbum([]); setVisitedIds([]);
    setRevealed(false); setLastResult(null); setNewBadges([]); setPending(null);
    setElapsedMs(0); setResearched({}); startRef.current = Date.now(); recorded.current = false;
    setMsg({ type: "info", text: `${exp.emoji} ${exp.title}: ${exp.lesson}` });
    setFlying(null); resetRiddles(); setScreen("play");
  }

  // ---- Journeys: retrace a real expedition, in the order it happened. ----------
  // Not a Grand Tour (there the ORDER is the puzzle) and not an Assignment (there
  // the PLACE is the puzzle). Here the order is the story, so it's fixed and you
  // can't skip ahead — clicking stop 5 before stop 4 tells you it comes later.
  // No travel-day budget: a route you're retracing shouldn't be a race.
  function startJourney(id) {
    const j = JOURNEY_BY_ID[id];
    if (!j) return;
    setJourney({ id, at: 0, wrong: 0, firstTry: 0, reveal: null, done: false });
    setGameMode("journey"); setExpedition(null); setTourPlan(null);
    setAssignments([]); setTourReqs([]); setAlbum([]);
    setElapsedMs(0); startRef.current = Date.now();
    setScreen("journey");
  }
  // Clicking a stop on the journey map. Only the NEXT one counts.
  function pickJourneyStop(i) {
    if (!journey || journey.reveal !== null || journey.done) return;
    const j = JOURNEY_BY_ID[journey.id];
    if (i === journey.at) {
      sfx("success");
      setJourney((s) => ({ ...s, reveal: i, firstTry: s.missedHere ? s.firstTry : s.firstTry + 1, missedHere: false }));
    } else {
      sfx("fail");
      setJourney((s) => ({ ...s, wrong: s.wrong + 1, missedHere: true }));
      setMsg({ type: "warn", text: i < journey.at
        ? `${j.stops[i].name} is behind you — you've already been there. Look further along the trail.`
        : `${j.stops[i].name} comes later on the journey. They didn't get there yet.` });
    }
  }
  // Dismiss a stop's card and move on down the trail.
  function nextJourneyStop() {
    const j = JOURNEY_BY_ID[journey.id];
    const at = journey.at + 1;
    const done = at >= j.stops.length;
    if (done) { sfx("win"); setElapsedMs(Date.now() - startRef.current); }
    setJourney((s) => ({ ...s, at, reveal: null, done }));
    setMsg(null);
  }

  // ---- Quiz mode: 10 multiple-choice geography questions built from the data. ----
  function startQuiz() {
    // music continues from the splash/meet screen and fades out at the map
    const profile = profileName ? getProfile(profileName) : null;
    const questions = buildQuiz(freshFirst(profile), 10); // freshest places first, for variety
    setQuiz({ questions, i: 0, answeredIdx: null, score: 0, correctCount: 0, streak: 0, lastGain: 0, done: false, best: null });
    setGameMode("quiz"); setExpedition(null);
    startRef.current = Date.now();
    setScreen("quiz");
  }
  function answerQuiz(idx) {
    if (!quiz || quiz.answeredIdx !== null || quiz.done) return;
    const correct = quiz.questions[quiz.i].options[idx].correct;
    const streak = correct ? quiz.streak + 1 : 0;
    // Small, legible scoring: 1 point per correct answer, +1 more once you're on a
    // 3-in-a-row streak (so a flawless 10 lands around 15, not 1,000+).
    const gain = correct ? 1 + (streak >= 3 ? 1 : 0) : 0;
    sfx(correct ? "success" : "fail");
    setQuiz({ ...quiz, answeredIdx: idx, score: quiz.score + gain, correctCount: quiz.correctCount + (correct ? 1 : 0), streak, lastGain: gain });
  }
  function nextQuiz() {
    if (!quiz || quiz.answeredIdx === null) return;
    if (quiz.i + 1 >= quiz.questions.length) {
      // The homecoming visit is part of an expedition, not a standalone Quiz —
      // it isn't scored on the quiz leaderboard; it hands off to the results.
      if (quiz.homecoming) { endHomecoming(); return; }
      setElapsedMs(Date.now() - startRef.current);
      let best = null;
      if (profileName) { best = recordQuiz(profileName, { score: quiz.score, correct: quiz.correctCount, total: quiz.questions.length }); refreshProfiles(); }
      sfx(quiz.correctCount >= quiz.questions.length * 0.5 ? "win" : "lose");
      setQuiz({ ...quiz, done: true, best });
    } else {
      setQuiz({ ...quiz, i: quiz.i + 1, answeredIdx: null });
    }
  }

  // The homecoming: back from an expedition, Uncle asks about the places you
  // photographed this trip (seeded from the album), then it hands off to the
  // results screen. Anecdote on a right answer; a gentle line on a wrong one.
  function startHomecoming() {
    const ids = album.map((p) => p.id);
    setQuizBonus(0);
    if (!ids.length) { setScreen("end"); return; }
    // One question per photo brought home, so the review scales with the trip: a
    // three-assignment Scout run is asked three, a fourteen-assignment Expert run
    // fourteen. It used to be capped at five regardless, which meant a long run's
    // last nine places were never reviewed at all — and buildQuiz takes the FIRST n
    // in album order, so it was always the same early five.
    const questions = buildQuiz(ids, ids.length);
    setQuiz({ questions, i: 0, answeredIdx: null, score: 0, correctCount: 0, streak: 0, lastGain: 0, done: false, best: null, homecoming: true });
    setScreen("homecoming");
  }
  // Leaving the homecoming for the results: each correct review answer adds ½ a
  // point of extra credit to the trip score (folded in BEFORE the results screen
  // records the run, so the recorded score and leaderboard include it).
  function endHomecoming() {
    const correct = quiz?.correctCount || 0;
    const bonus = correct * QUIZ_BONUS;
    setQuizBonus(bonus);
    if (bonus) setScore((s) => tidyScore(s + bonus));
    setQuiz(null);
    setScreen("end");
  }

  // ---- Mr. O's double-points riddle ----------------------------------------
  // Fresh riddle cadence at the start of each scored run. A daily passes a seed so
  // the cadence — and so the number of bonus chances — is the same for everyone.
  function resetRiddles(seed = null) {
    setRiddle(null);
    shotsSinceRiddleRef.current = 0;
    riddleSeedRef.current = seed;
    riddleEveryRef.current = seed ? withSeed(seed, () => 1 + randInt(5)) : 1 + Math.floor(Math.random() * 5);
    riddleDueRef.current = false;
    arrivalRollRef.current = 0; // riddles/facts are now rolled per continent arrival
    mrOGapRef.current = MRO_MIN_GAP; // eligible from the first arrival (the coin-flip still gates)
  }
  // Answer the riddle: a correct answer is worth DOUBLE a normal shot's points.
  function answerRiddle(idx) {
    if (!riddle || riddle.answeredIdx !== null) return;
    const correct = riddle.choices[idx] === riddle.data.correct;
    if (correct) {
      const base = gameMode === "tour" ? TOUR_MODES[difficulty].points : MODES[difficulty].points;
      setScore((s) => tidyScore(s + base * 2));
      sfx("success");
    } else sfx("fail");
    setRiddle((r) => ({ ...r, answeredIdx: idx }));
  }

  // Dismiss the result popup and do what its button promised.
  function continueFromResult() {
    const kind = pending?.kind;
    setPending(null);
    if (kind === "correct") {
      setStep((n) => n + 1);
      setRevealed(false);          // clear the photo just taken...
      setPhase("continent");       // ...back to the world map for the next continent
      setPickedContinent(null);    // current stays = the city just shot, so the next flight departs from there
      setPickedCountry(null);
      poppedCountryRef.current = null; // let the next leg's country pop its card
      setMsg({ type: "info", text: "New assignment! Read the clue and pick the continent." });
    } else if (kind === "win" || kind === "lose" || kind === "tour-win" || kind === "tour-lose") {
      startHomecoming();   // visit Uncle first; the homecoming hands off to the results
    } else if (kind === "wrong" && phase === "city") {
      setCurrent(null);    // clear the wrong shot; back to "pick a city"
      setRevealed(false);
    } else if (kind === "tour-correct" || kind === "tour-wrong") {
      setCurrent(null);    // stay on THIS continent to shoot its other targets, or fly on
      setRevealed(false);
    }
    // wrong continent just closes and leaves you on the world map to try again.
    // (Riddles now fire on continent arrival, not after a shot — see maybeMrO.)
  }

  // When a game ends, record its outcome once against the active profile.
  useEffect(() => {
    if (screen === "end" && !recorded.current) {
      recorded.current = true;
      if (profileName) {
        const beforeEarned = new Set(achievements(getProfile(profileName)).filter((a) => a.earned).map((a) => a.id));
        const correctIds = album.map((p) => p.id);
        const missedIds = [];
        let won;
        if (gameMode === "tour") {
          // Grand Tour: a requirement is met when its checkbox got ticked.
          for (const r of tourReqs) if (!r.done) missedIds.push(r.anchorId);
          won = tourReqs.length > 0 && missedIds.length === 0;
        } else {
          // A specific assignment is satisfied if its subject was filed; a category
          // assignment if any photo of that category on that continent was filed.
          for (const a of assignments) {
            const ok = a.type === "category"
              ? album.some((p) => p.category === a.category && p.continent === a.continent)
              : correctIds.includes(a.targetId);
            if (!ok) missedIds.push(a.type === "category" ? a.anchorId : a.targetId);
          }
          won = assignments.length > 0 && missedIds.length === 0;
        }
        // Rank earned this run (same computation the results screen shows), stored
        // with the best score for the leaderboard.
        const maxScore = gameMode === "tour" ? tourMaxScore(tourReqs.length, difficulty) : maxScoreFor(assignments.length, MODES[difficulty]);
        const runRank = rankFor(maxScore > 0 ? Math.min(1, score / maxScore) : 0).title;
        const res = recordGame(profileName, { difficulty, score, timeMs: elapsedMs, won, rank: runRank, mode: gameMode, visitedIds, correctIds, missedIds });
        setLastResult(res);
        const earnedNow = achievements(getProfile(profileName)).filter((a) => a.earned && !beforeEarned.has(a.id));
        setNewBadges(earnedNow);
        if (earnedNow.length) sfx("badge"); else if (res.isBest || res.isBestTime) sfx("stamp");
        refreshProfiles();
        // First time the dream is complete, queue Jonah's triumphant scene.
        const updated = getProfile(profileName);
        if (updated && !updated.dreamDone && dreamFulfilled(updated)) setDreamPending(true);
      }
      // The Daily's shareable result. Built OUTSIDE the profile check: a guest flew
      // the same expedition as everybody else and should still get a card to paste —
      // they just have nowhere to bank it. WITH a profile, only the first completed
      // run of the day counts at this tier, and recordDaily hands back whatever is
      // already on record, so a replay can be told apart from the official attempt.
      if (dailyDay) {
        const filedIds = album.map((p) => p.id);
        const marks = assignments.map((a, i) => {
          const filed = a.type === "category"
            ? album.some((p) => p.category === a.category && p.continent === a.continent)
            : filedIds.includes(a.targetId);
          return !filed ? "missed" : (missesRef.current[i] ? "second" : "first");
        });
        const result = { day: dailyDay, difficulty, label: MODES[difficulty].label,
          score: tidyScore(score), marks, daysLeft: days };
        setDailyBanked(profileName
          ? recordDaily(profileName, dailyKey(dailyDay, difficulty), result)
          : { banked: result, wasFirst: true });
      }
    }
    if (screen === "start") recorded.current = false;
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Jonah's send-you-off line on the results screen: proud on a clean sweep,
  // encouraging when the days ran out. Picked ONCE when the screen opens so it
  // doesn't reshuffle on every re-render.
  // Did the trip bring home everything the editor asked for? Jonah's closing
  // line and the results music both hang off this, so it's computed in one place.
  // A function declaration, not a const: the music effect above calls it, and by
  // the time any effect runs the state it reads is initialized.
  function endWon() {
    const totalTargets = gameMode === "tour" ? tourReqs.length : assignments.length;
    return totalTargets > 0 && album.length >= totalTargets;
  }
  useEffect(() => {
    if (screen !== "end") return;
    const pool = endWon() ? END_WIN : END_LOSE;
    setEndLine(pool[Math.floor(Math.random() * pool.length)]);

    // The three reasons to go again, fixed when the screen opens so they don't
    // reshuffle under the player's eyes while they read.
    const prof = profileName ? getProfile(profileName) : null;
    setNextUp(nextGoal(prof));
    const rank = prof ? careerRank(prof) : null;
    // Only worth saying when the next rank is genuinely in reach — "94 more places
    // to Globe Editor" is not encouragement, it's a wall.
    setRankNear(rank && rank.next && rank.nextNeed - rank.have <= 12 ? rank : null);
    // Uncle asks for a KIND of place he hasn't got yet. If he has one of
    // everything, he asks for nothing rather than for something he already has.
    const pp = prof ? passportData(prof) : null;
    const missing = pp ? GRANDPA_WANTS.filter((w) => {
      const col = pp.collections.find((c) => c.category === w.category);
      return col && col.mastered === 0;
    }) : [];
    if (missing.length) {
      const pick = missing[Math.floor(Math.random() * missing.length)];
      setGrandpaWant(WANT_LINES[Math.floor(Math.random() * WANT_LINES.length)].replace("%", pick.want));
      grandpaWishRef.current = pick.category; // the next run leans toward this
    } else {
      setGrandpaWant(null);
      grandpaWishRef.current = null;
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const outOfDays = (subtitle) => {
    setElapsedMs(Date.now() - startRef.current);
    sfx("lose");
    setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Out of travel days!", subtitle, buttonLabel: "See my results" });
  };

  // ---- Continent phase: pick a continent on the world map ----
  // `at` is where on the map the player actually pointed, in the game's
  // equirectangular coords — see eqPointFromEvent. It changes ONLY where the plane
  // lands, never which continent was chosen or whether that was right: a click
  // anywhere in Africa is the same answer, and lands in the same place it was
  // clicked. Knowing roughly where a country sits is rewarded with a plane that
  // goes there, and a vague guess still costs nothing extra.
  //
  // Undefined from the keyboard (Enter on a focused continent has no point), and
  // the flight falls back to the continent's canonical pin — which is right: a
  // keyboard player picked the continent, not a spot.
  function pickContinent(cont, at) {
    if (phase !== "continent" || flying || pending || (gameMode !== "explore" && days <= 0)) return;
    const landAt = at || CONTINENT_PIN[cont];
    if (gameMode === "explore") {
      // Free flight; drill into countries where the layer exists, else straight to
      // the places. No wrong answers.
      const from = current ? loc(current) : (pickedContinent ? CONTINENT_PIN[pickedContinent] : HUB);
      const to = landAt;
      const useCountry = COUNTRY_LAYER_CONTINENTS.has(cont);
      const sameHere = !!current && loc(current).continent === cont; // already here — no flight
      const finalize = () => {
        setFlying(null); setPickedContinent(cont); setPickedCountry(null); setCityPlan(null);
        setPhase(useCountry ? "country" : "city"); setCurrent(null); setRevealed(false);
        setMsg({ type: "info", text: useCountry ? `Welcome to ${cont}! Pick a country to explore.` : `Welcome to ${cont}! Click any place to learn about it.` });
        say(cont); // spoken arrival: just the continent's name
        if (!sameHere) maybeMrO(cont);
      };
      if (prefersReduced || sameHere) { finalize(); return; }
      music("travelJig");
      launchFlight(from, to, finalize);
      return;
    }
    if (gameMode === "tour") {
      // Grand Tour: you may still fly anywhere — but you committed to an order, and
      // leaving it costs a day on top of the flight. The "next stop" is the first
      // continent on your plan that still has an unphotographed target, so finishing
      // a continent early and moving on is never punished; skipping ahead is.
      const from = current ? loc(current) : (pickedContinent ? CONTINENT_PIN[pickedContinent] : HUB);
      const to = landAt;
      // Already on this continent? No real flight — skip animation/music/cost.
      const sameHere = !!current && loc(current).continent === cont;
      const nextStop = tourPlan && tourPlan.order.find((c) => tourReqs.some((r) => !r.done && r.continent === c));
      const offPlan = !sameHere && nextStop && cont !== nextStop && pickedContinent !== cont;
      const penalty = offPlan ? DEVIATION_COST : 0;
      const cost = sameHere ? 0 : flightDays(from, to) + penalty; // distance-based: group nearby continents to save days
      const useCountry = COUNTRY_LAYER_CONTINENTS.has(cont); // every mode visits the country map
      // Travel modes (Adventurer/Expert): a real flight opens the "getting there"
      // chooser — pick a hub airport + a last-leg transport — instead of flying free.
      // confirmTravel() then runs the actual flight with the chosen money/day cost.
      if ((difficulty === "medium" || difficulty === "hard") && !sameHere && (HUBS[cont] || []).length) {
        const nextReq = tourReqs.find((r) => !r.done && r.continent === cont);
        const target = nextReq ? (BY_ID[nextReq.targetId] || BY_ID[nextReq.anchorId] || null) : null;
        setTravelChoice({ cont, from, to, penalty, baseDays: cost, useCountry, target, hubs: HUBS[cont] });
        return;
      }
      const finalize = () => {
        const nd = Math.round((days - cost) * 10) / 10;
        setDays(nd);
        setFlying(null); setPickedContinent(cont); setPickedCountry(null); setCityPlan(null);
        setPhase(useCountry ? "country" : "city"); setCurrent(null); setRevealed(false);
        poppedCountryRef.current = null; // let this continent's countries pop their card
        if (penalty) setTourPlan((p) => ({ ...p, deviations: p.deviations + 1 }));
        const costTxt = sameHere ? "no days lost"
          : `−${cost} day${cost === 1 ? "" : "s"}${penalty ? ` (${penalty} of them for leaving your route)` : ""}`;
        if (nd <= 0) return outOfDays(`You reached ${cont}, but the trip's budget is spent.`);
        const here = tourReqs.filter((r) => !r.done && r.continent === cont).length;
        const where = useCountry ? "Pick the country your next target is in." : "Photograph a target on your list.";
        setMsg(here
          ? { type: "info", text: `${sameHere ? "Still in" : "Touched down in"} ${cont} (${costTxt}). ${here} target${here === 1 ? "" : "s"} on your list ${here === 1 ? "is" : "are"} here. ${where}` }
          : { type: "warn", text: `${sameHere ? "Still in" : "Touched down in"} ${cont} (${costTxt}) — but nothing on your list is here. Fly on when ready.` });
        say(cont); // spoken arrival: just the continent's name
        if (!sameHere) maybeMrO(cont);
      };
      if (prefersReduced || sameHere) { finalize(); return; }
      music("travelJig");
      launchFlight(from, to, finalize);
      return;
    }
    if (!target) return;
    const from = current ? loc(current) : HUB; // first flight departs from the home hub
    const to = landAt;
    // Already standing on this continent (e.g. the next assignment is here too)?
    // Then there's no real flight — skip the animation, music and day cost, and
    // just drop back onto its map.
    const sameHere = !!current && loc(current).continent === cont;
    // The run's condition bends the price of getting about: a monsoon over one
    // continent adds a day to every flight there, fair winds take half a day off
    // every crossing. Never below half a day — a free flight would make the day
    // budget, which is the whole game, stop mattering.
    const condFlight = sameHere ? 0
      : (hasCond("slowContinent") && cont === condition.continent ? 1 : 0)
      + (hasCond("fastFlights") ? -0.5 : 0);
    const cost = sameHere ? 0 : Math.max(0.5, Math.round((flightDays(from, to) + condFlight) * 10) / 10);
    const costTxt = `−${cost} day${cost === 1 ? "" : "s"}`;
    if (cont === target.continent) {
      setFlashHint(null); // right continent — stop any Scout hint flash
      const useCountry = usesCountryLayer(MODES[difficulty], cont);
      // Bush plane ticket: one inter-continent hop on the house. Only spent on a hop
      // that would actually have cost something — never burned on "you're already
      // here", which would waste the ticket on nothing.
      const flownFree = cost > 0 ? spendKit("freeFlight", { silent: true }) : null;
      const finalize = () => {
        if (flownFree) noteKit(flownFree);   // announce on landing, when the saving shows
        const nd = Math.round((days - (flownFree ? 0 : cost)) * 10) / 10;
        setDays(nd);
        setFlying(null);
        setPickedContinent(cont);
        setPickedCountry(null);
        setPhase(useCountry ? "country" : "city"); // Medium/Hard Europe: pick the country first
        setCurrent(null);   // arrived on the continent; no city picked yet
        setRevealed(false);
        if (nd <= 0) outOfDays(`You reached ${cont}, but the trip's budget is spent.`);
        else { setMsg({ type: "info", text: sameHere ? `Still in ${cont} — ${useCountry ? "pick the right country." : "pick the right city."}` : `Touched down in ${cont} (${costTxt}). ${useCountry ? "Now pick the right country." : "Now pick the right city."}` }); say(cont); if (!sameHere) maybeMrO(cont); }
      };
      if (prefersReduced || sameHere) { finalize(); return; }
      music("travelJig");
      launchFlight(from, to, finalize);
    } else {
      // A friend in town: the first wrong continent is free. The mistake still
      // HAPPENS — you're told where you should have gone, and the lesson still runs —
      // it just doesn't cost the day. Nothing in the bag makes a wrong answer pay.
      const forgiven = !!spendKit("forgiveContinent");
      const nd = Math.round((days - (forgiven ? 0 : cost)) * 10) / 10; // a wrong continent is a wasted flight
      setDays(nd);
      sfx("fail");
      flashRight("continent", target.continent); // Scout: glow the right continent
      if (nd <= 0) outOfDays(`${cont} wasn't right, and that was your last day.`);
      else setPending({ kind: "wrong", tone: "bad", emoji: "❌", title: sameHere ? "Still the wrong continent" : "Not that continent",
        subtitle: sameHere
          ? `Read his note again and pick the continent it points to.`
          : forgiven
            ? `A wasted flight there and back — but a friend of Jonah's sorted you out, so it cost you nothing. Read his note and try again.`
            : `A wasted flight there and back cost you ${cost} day${cost === 1 ? "" : "s"} — read his note and try again.`,
        // Named outright, on every tier: which continent it IS, and what lies between
        // the two. "West of Africa" teaches nothing on its own; "across the Atlantic"
        // is the thing worth carrying away from a wrong guess.
        lesson: continentMissLesson({
          from: cont, to: target.continent, alreadyHere: sameHere,
          bearing: compass(CONTINENT_PIN[cont], CONTINENT_PIN[target.continent]),
        }),
        hint: MODES[difficulty].hints ? `Try looking ${compass(CONTINENT_PIN[cont], CONTINENT_PIN[target.continent])} of ${cont}.` : null,
        buttonLabel: "Try again" });
    }
  }

  // Grand Tour travel modes: the chooser confirmed a hub + last-leg transport. Deduct
  // the money, then run the real flight with the combined day cost.
  function confirmTravel(hub, transport, flightMoney) {
    const tc = travelChoice; if (!tc) return;
    const cont = tc.cont;
    const totalMoney = Math.round(flightMoney + (transport ? transport.usd : 0));
    const totalDays = Math.round((tc.baseDays + (transport ? transport.days : 0)) * 10) / 10;
    setMoney((m) => Math.max(0, Math.round(m - totalMoney)));
    setTravelChoice(null);
    const finalize = () => {
      const nd = Math.round((days - totalDays) * 10) / 10;
      setDays(nd);
      setFlying(null); setPickedContinent(cont); setPickedCountry(null); setCityPlan(null);
      setPhase(tc.useCountry ? "country" : "city"); setCurrent(null); setRevealed(false);
      poppedCountryRef.current = null;
      if (tc.penalty) setTourPlan((p) => ({ ...p, deviations: p.deviations + 1 }));
      if (nd <= 0) return outOfDays(`You reached ${cont}, but the trip's day budget is spent.`);
      const here = tourReqs.filter((r) => !r.done && r.continent === cont).length;
      const where = tc.useCountry ? "Pick the country your next target is in." : "Photograph a target on your list.";
      const legTxt = transport ? `${hub.code} + ${transport.name.toLowerCase()}` : hub.code;
      setMsg(here
        ? { type: "info", text: `Touched down in ${cont} via ${legTxt} (−${totalDays} day${totalDays === 1 ? "" : "s"}, −$${totalMoney}). ${here} target${here === 1 ? "" : "s"} here. ${where}` }
        : { type: "warn", text: `Touched down in ${cont} via ${legTxt} — nothing on your list is here. Fly on when ready.` });
      say(cont);
      maybeMrO(cont);
    };
    if (prefersReduced) { finalize(); return; }
    music("travelJig");
    launchFlight(tc.from, tc.to, finalize);
  }

  // ---- Country phase (Medium/Hard): pick the target's country on the continent ----
  // Where the overland hop starts and ends on the continent plate, and what carries
  // you. Start: wherever you're standing (the last place photographed), or the
  // continent's own arrival pin on your first hop here. End: the country's landmark
  // centre — the same point its label sits on.
  const rideLegFor = (country) => {
    const cm = COUNTRY_META[countryKey(pickedContinent, country)];
    if (!cm) return null;
    const here = current ? loc(current) : null;
    const from = here && here.continent === pickedContinent
      ? { x: here.x, y: here.y }
      : (CONTINENT_PIN[pickedContinent] || { x: cm.cx, y: cm.cy });
    const to = { x: cm.cx, y: cm.cy };
    const legDeg = Math.hypot(to.x - from.x, to.y - from.y);
    const ownIds = (COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][country]) || [];
    const mode = countryTransport(ownIds.map((id) => BY_ID[id]).filter(Boolean), legDeg);
    return { from, to, mode };
  };
  function pickCountry(country) {
    if (phase !== "country" || flying || pending) return;
    if (gameMode === "explore") {
      const exploreIds = pickCountryCityIds(pickedContinent, country, [], 7);
      // `wide` was hardcoded false here, alone among the three modes — so any pin
      // outside the country's zoom box was simply drawn off-frame and the map showed
      // fewer places than it had chosen. That is the "only 2 landmarks showed up in
      // the USA" report: Explore can pick Alaska or Hawai'i, and the USA's box is the
      // contiguous 48. Tightening every country's framing made it easier to hit.
      // Same rule as Tour and Assignments now: if the chosen places don't all fit,
      // show the wider continent view where they honestly do.
      const exploreHasBox = !!COUNTRY_META[countryKey(pickedContinent, country)];
      const arrive = () => {
        setPickedCountry(country);
        setCityPlan({ ids: exploreIds, wide: !exploreHasBox || !optionsFitCountry(exploreIds, pickedContinent, country) });
        setPhase("city"); setCurrent(null); setRevealed(false);
        music("countryTune", country, pickedContinent); // a few seconds of local music on arrival
        sayCountry(country); // spoken arrival: the country, a beat, then hello in its language
        setMsg({ type: "info", text: `${displayCountry(country)} — click any place to learn about it.` });
      };
      const legE = rideLegFor(country);
      setArrivalRide(legE ? legE.mode : null);
      if (legE) launchFlight(legE.from, legE.to, arrive); else arrive();
      return;
    }
    if (gameMode === "tour") {
      // Land in the chosen country; the city step shows only ITS landmarks. Free
      // to change your mind — no penalty for picking a country (unlike the timed
      // Assignments), so exploring the map is encouraged.
      const hasBox = !!COUNTRY_META[countryKey(pickedContinent, country)];
      const ownIds = (COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][country]) || [];
      const tourMust = tourReqs.filter((r) => !r.done && ownIds.includes(r.anchorId)).map((r) => r.anchorId);
      const tourIds = pickCountryCityIds(pickedContinent, country, tourMust, 5);
      const arriveT = () => {
        setCityPlan({ ids: tourIds, wide: !hasBox || !optionsFitCountry(tourIds, pickedContinent, country) });
        setPickedCountry(country);
        setPhase("city"); setCurrent(null); setRevealed(false);
        if (COUNTRY_INFO[country] && poppedCountryRef.current !== country) { poppedCountryRef.current = country; setCountryPopup(country); }
        music("countryTune", country, pickedContinent); // a few seconds of local music on arrival
        sayCountry(country); // spoken arrival: the country, a beat, then hello in its language
        const targetHere = tourReqs.some((r) => !r.done && (COUNTRY_LOCS[pickedContinent]?.[country] || []).some((id) => r.kind === "category" ? BY_ID[id].category === r.category : r.targetId === id));
        setMsg({ type: targetHere ? "info" : "warn", text: targetHere ? `Arrived in ${displayCountry(country)}. Photograph your target here!` : `Arrived in ${displayCountry(country)} — but no target on your list is here. Pick another country, or fly on.` });
      };
      const legT = rideLegFor(country);
      setArrivalRide(legT ? legT.mode : null);
      if (legT) launchFlight(legT.from, legT.to, arriveT); else arriveT();
      return;
    }
    if (days <= 0 || !target) return;
    const a = assignments[step];
    // Category missions: any country on the continent holding a member of the
    // wanted category is correct. Specific missions: the target's own country.
    const ok = a && a.type === "category"
      ? countryHasCategory(pickedContinent, country, a.category)
      : countriesOf(target).includes(country); // border landmarks accept either country
    if (ok) {
      setFlashHint(null); // right country — stop any Scout hint flash
      // You picked this country, so the city step shows ONLY its own landmarks —
      // never neighbors from other countries (that made the card say "You're in
      // Austria" while showing German pins). A country with 3+ landmarks zooms in
      // tight; a thinner one keeps the continent view (so the lone pin isn't lost
      // in a hard zoom) but still shows only that country's own places. Countries
      // fill toward 3+ as content is added.
      const ownIds = (COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][country]) || [];
      // Zoom into the country you picked whenever it has a map box; only fall back
      // to the continent view if it doesn't (safety — keeps a lone pin visible).
      const hasBox = !!COUNTRY_META[countryKey(pickedContinent, country)];
      // Show only a manageable, spread-out subset (cap by difficulty: Easy 3 →
      // Hard 5), always including this assignment's target(s) — so a big country
      // like the USA never floods the map with 30 overlapping pins.
      const mustInc = a.type === "specific" ? [a.targetId]
        : ownIds.filter((id) => BY_ID[id].category === a.category).slice(0, 2);
      const cap = Math.max(MIN_CITY_PINS, MODES[difficulty].cityDecoys + 1);
      // On a Daily this is picked from a seed derived from the country itself, not
      // from the run's RNG stream: the player might reach this country in any order,
      // or after any number of riddles, and the pins must still match everyone else's.
      const pins = () => pickCountryCityIds(pickedContinent, country, mustInc, cap);
      const planIds = dailyDay
        ? withSeed(dailySeed(dailyDay, difficulty) + "|pins|" + pickedContinent + "|" + country, pins)
        : pins();
      const plan = { ids: planIds, wide: !hasBox || !optionsFitCountry(planIds, pickedContinent, country) };
      const arriveA = () => {
        setCityPlan(plan);
        setPickedCountry(country);
        setPhase("city");
        setCurrent(null);
        setRevealed(false);
        // Pop the culture card the moment you land in the country.
        if (COUNTRY_INFO[country] && poppedCountryRef.current !== country) { poppedCountryRef.current = country; setCountryPopup(country); }
        music("countryTune", country, pickedContinent); // a few seconds of local music on arrival
        sayCountry(country); // spoken arrival: the country, a beat, then hello in its language
        setMsg({ type: "info", text: `Arrived in ${displayCountry(country)}. Now photograph Jonah's subject.` });
      };
      const legA = rideLegFor(country);
      setArrivalRide(legA ? legA.mode : null);
      if (legA) launchFlight(legA.from, legA.to, arriveA); else arriveA();
    } else {
      // Telephoto lens: the first wrong country is free — you were close enough to
      // shoot it from where you stood.
      const forgivenC = !!spendKit("forgiveCountry");
      const nd = Math.round((days - (forgivenC ? 0 : 0.5)) * 10) / 10; // a wrong country costs half a day
      setDays(nd);
      sfx("fail");
      const why = a && a.type === "category"
        ? `We don't have a ${CATEGORIES[a.category].noun} on file to photograph in ${displayCountry(country)} — try another country.`
        : `Jonah's subject isn't in ${displayCountry(country)}.`;
      if (nd <= 0) outOfDays(`${displayCountry(country)} wasn't right, and that was your last day.`);
      else {
        // Gentle nudge: the first letter of a country that IS right.
        const goal = a && a.type === "category" ? (a.countries || [])[0] : (countriesOf(target)[0]);
        flashRight("country", goal); // Scout: glow the right country
        setPending({ kind: "wrongcountry", tone: "bad", emoji: "❌", title: "Not that country",
          subtitle: `${why} Half a day gone — read the clue and the country notes, then try again.`,
          hint: (MODES[difficulty].hints && goal) ? `The country you're after starts with “${goal[0]}”.` : null,
          buttonLabel: "Try again" });
      }
    }
  }

  // ---- Research: spend half a travel day to have the newsroom look up exactly ----
  // where the editor's subject is. It all but hands the player the answer (naming
  // the place a hard clue withholds) — the cost is the trade-off. Once per
  // assignment; the note stays pinned under the telegram for the rest of the trip.
  const researchCost = MODES[difficulty].research === "free" ? 0 : SHOT_COST; // Easy: free
  function doResearch() {
    if (gameMode === "tour" || flying || pending) return;
    if (MODES[difficulty].research === "off") return;            // Hard: no Research
    // Press pass: research costs nothing all trip. Checked BEFORE the affordability
    // guard, so a player down to their last half-day can still read the guide.
    const freeRead = kitHas("freeResearch");
    // Peak season doubles what a look at the guide costs.
    const readCost = hasCond("costlyResearch") ? researchCost * 2 : researchCost;
    if (researched[step] || (!freeRead && days <= readCost)) return;
    const a = assignments[step];
    if (!a) return;
    const t = a.type === "category" ? loc(a.anchorId) : loc(a.targetId);
    const catNoun = CATEGORIES[t.category].noun;
    const text = a.type === "category"
      ? `Jonah's guidebook suggests ${t.city}, ${t.country} ${t.flag} in ${t.continent} — its ${catNoun}, ${t.subject}, would be a perfect shot.`
      : `Jonah's after ${t.subject} — in ${t.city}, ${t.country} ${t.flag} (${t.continent}).`;
    setResearched((r) => ({ ...r, [step]: text }));
    if (readCost > 0 && !freeRead) setDays((d) => Math.round((d - readCost) * 10) / 10);
    sfx("success");
    // The note pins itself under the telegram (and persists across the flight);
    // don't ALSO echo it into the message banner — that read as the hint
    // appearing twice. Just nudge the player toward the map.
    setMsg({ type: "info", text: "Jonah's guidebook has the answer — pinned above. Now pick the continent on the map." });
  }

  // ---- City phase: click a city on the zoomed continent to photograph it ----
  function photographCity(id) {
    if (phase !== "city" || flying || pending || (gameMode !== "explore" && days <= 0)) return;
    const clicked = loc(id);
    setCurrent(id);
    setVisitedIds((v) => (v.includes(id) ? v : [...v, id]));
    sfx("shutter");
    if (!prefersReduced) setFlashKey((k) => k + 1);
    setRevealed(true);

    if (gameMode === "explore") {
      // Just reveal the place and file it into the album — no cost, no scoring.
      // The rich info panel (fact, culture card, clue tiers) renders from `currentLoc`.
      setAlbum((al) => (al.some((x) => x.id === clicked.id) ? al
        : [...al, { id: clicked.id, subject: clicked.subject, flag: clicked.flag, city: clicked.city, country: clicked.country, continent: clicked.continent, category: clicked.category, fact: clicked.fact, icon: clicked.icon, photo: clicked.photo, greeting: clicked.greeting }]));
      return;
    }


    // "The long way round" makes every frame cost a whole day instead of half.
    const shotCost = hasCond("costlyShots") ? SHOT_COST * 2 : SHOT_COST;
    const d = Math.round((days - shotCost) * 10) / 10; // a shot costs half a day
    setDays(d);

    if (gameMode === "tour") {
      // Does this city tick off a still-pending itinerary requirement here?
      const idx = tourReqs.findIndex((r) => !r.done && r.continent === clicked.continent
        && (r.kind === "category" ? clicked.category === r.category : r.targetId === id));
      if (idx >= 0) {
        const req = tourReqs[idx];
        const gain = TOUR_MODES[difficulty].points;
        const nextReqs = tourReqs.map((r, i) => (i === idx ? { ...r, done: true, filedId: id } : r));
        setTourReqs(nextReqs);
        setAlbum((al) => [...al, { id: clicked.id, subject: clicked.subject, flag: clicked.flag, city: clicked.city, country: clicked.country, continent: clicked.continent, category: clicked.category, fact: clicked.fact, icon: clicked.icon, photo: clicked.photo, greeting: clicked.greeting }]);
        const remaining = nextReqs.filter((r) => !r.done).length;
        const found = req.kind === "category" ? `You found a ${CATEGORIES[req.category].noun} — ${clicked.subject}!` : `You bagged ${clicked.subject}!`;
        if (remaining === 0) {
          // The route IS the score here: every whole day you bring home pays, and on
          // Expert a banked day is worth twice a photograph. There's no cap — beating
          // par by three days should feel like beating par by three days.
          const banked = Math.max(0, Math.floor(d));
          const dayBonus = banked * TOUR_MODES[difficulty].dayPoints;
          // Travel modes: unspent travel money pays too — a point per $500 left in the
          // wallet — so thrifty routing (cheaper hubs + slower transport) is rewarded.
          const cashBonus = (difficulty === "medium" || difficulty === "hard") ? Math.floor(money / 500) : 0;
          const bonus = dayBonus + cashBonus;
          setScore((s) => s + gain + bonus);
          setElapsedMs(Date.now() - startRef.current);
          rewardSfx("win");
          setPending({ kind: "tour-win", tone: "good", emoji: "🏆", title: "Grand Tour complete!",
            subtitle: `${found} Every target filed! +${gain}${dayBonus ? `, +${dayBonus} for ${banked} day${banked === 1 ? "" : "s"} home` : ""}${cashBonus ? `, +${cashBonus} for $${money.toLocaleString("en-US")} unspent` : ""}.`,
            fact: clicked.fact, photo: clicked.photo, category: clicked.category, buttonLabel: "See my results 📸" });
        } else if (d <= 0) {
          setScore((s) => s + gain);
          setElapsedMs(Date.now() - startRef.current);
          rewardSfx("lose");
          setPending({ kind: "tour-lose", tone: "bad", emoji: "⏳", title: "Got it — but out of days!",
            subtitle: `${found} (+${gain}) — but that was your last travel day, with ${remaining} still on the list.`,
            fact: clicked.fact, buttonLabel: "See my results" });
        } else {
          setScore((s) => s + gain);
          rewardSfx("success");
          setPending({ kind: "tour-correct", tone: "good", emoji: "✅", title: "Ticked off the list!",
            subtitle: `${found} +${gain}. ${remaining} target${remaining === 1 ? "" : "s"} to go — shoot another here or fly on.`,
            fact: clicked.fact, photo: clicked.photo, category: clicked.category, buttonLabel: "Keep exploring 🗺" });
        }
      } else {
        if (d <= 0) outOfDays(`That's ${clicked.subject}, not on your list — and the trip's over.`);
        else {
          sfx("fail");
          setPending({ kind: "tour-wrong", tone: "bad", emoji: "❌", title: "Not on your list",
            subtitle: `${clicked.subject} isn't one of your remaining targets here. Half a day gone — check your itinerary.`,
            buttonLabel: "Keep looking 🔍" });
        }
      }
      return;
    }

    const a = assignments[step];
    // A click that reaches here with no assignment behind it used to throw on
    // `a.type` — and a throw inside an onClick is INVISIBLE to a player: the shot
    // is charged, nothing opens, and the game looks like it ignored them. Whatever
    // put the run in that state is a bug worth fixing on its own, but the shutter
    // must never be the thing that swallows it. Fail loudly in dev, and hand the
    // player an honest card instead of a dead click.
    if (!a) {
      if (import.meta.env.DEV) console.error("photographCity: no assignment at step", step, "of", assignments.length);
      setPending({ kind: "wrong", tone: "bad", emoji: "🤔", title: "Let's start a fresh assignment",
        subtitle: "Something went adrift with that one — Jonah's sending a new note.",
        buttonLabel: "Read the new note 📩" });
      return;
    }
    // Win by category for a category mission; by exact subject for a specific one.
    const win = a.type === "category" ? clicked.category === a.category : id === a.targetId;
    // Never file the same place twice in one trip. A category mission lets the
    // player roam, so they could pick a subject already in the album from an
    // earlier assignment — nudge them to a fresh one instead of double-counting.
    // (A specific target already filed earlier still counts as done, below.)
    const already = album.some((x) => x.id === id);
    if (already && !(win && a.type === "specific")) {
      if (d <= 0) { outOfDays(`You already photographed ${clicked.subject} — and the trip's over.`); return; }
      sfx("fail");
      setPending({ kind: "dup", tone: "bad", emoji: "📸", title: "Already in your album",
        subtitle: `You've already photographed ${clicked.subject} on this trip. Find a different ${a.type === "category" ? CATEGORIES[a.category].noun : "subject"} — half a day gone.`,
        buttonLabel: "Keep looking 🔍" });
      return;
    }
    if (win) {
      setFlashHint(null); // right shot — stop any Scout hint flash
      const gain = MODES[difficulty].points;
      // Perfect = the correct subject on the first click here (no wrong guess).
      const perfect = !missesRef.current[step];
      // Clear skies pay an extra point for a first-try shot; summit fever pays for
      // the CATEGORY it favours. Both reward knowing the answer, never guessing.
      const condPerfect = perfect && hasCond("bonusPerfect") ? 1 : 0;
      const condCat = hasCond("bonusCategory") && clicked.category === condition.category ? 2 : 0;
      const pBonus = (perfect ? PERFECT_BONUS : 0) + condPerfect + condCat;
      // Fast film: a first-try shot hands back half a day. Only spends a charge on a
      // shot that was actually perfect, so it rewards knowing the answer — never a
      // lucky guess that took three tries.
      const filmBack = perfect && spendKit("refundPerfect") ? 0.5 : 0;
      if (filmBack) setDays((d) => Math.round((d + filmBack) * 10) / 10);
      const perfectTxt = pBonus ? ` (+${pts(pBonus)} for a perfect first-try shot!)` : "";
      setAlbum((al) => (al.some((x) => x.id === clicked.id) ? al : [...al, { id: clicked.id, subject: clicked.subject, flag: clicked.flag, city: clicked.city, country: clicked.country, continent: clicked.continent, category: clicked.category, fact: clicked.fact, icon: clicked.icon, photo: clicked.photo, greeting: clicked.greeting }]));
      const found = a.type === "category" ? `You found a ${CATEGORIES[a.category].noun} — ${clicked.subject}!` : `You photographed ${clicked.subject}.`;
      // The Long Trip never "completes" — the assignments keep coming and the trip
      // ends only when the days do. That's the whole shape of the mode: not "did you
      // finish the list" but "how far did you get before the clock beat you".
      const done = !isLongTrip && step + 1 >= assignments.length;
      if (done) {
        const bonus = dayBonus(d);
        setScore((s) => s + gain + bonus + pBonus);
        setElapsedMs(Date.now() - startRef.current);
        rewardSfx("win");
        setPending({ kind: "win", tone: "good", emoji: "🏆", title: "Trip complete!",
          subtitle: `${found} +${gain}${perfectTxt}${bonus ? `, plus ${bonus} for ${d} day${d === 1 ? "" : "s"} to spare` : ""}.`,
          fact: clicked.fact, photo: clicked.photo, category: clicked.category, buttonLabel: "See my results 📸" });
      } else if (d <= 0) {
        setScore((s) => s + gain + pBonus);
        setElapsedMs(Date.now() - startRef.current);
        rewardSfx("lose");
        setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Got the shot — but out of days!",
          subtitle: `${found} (+${gain}${perfectTxt}) — but that spent your last travel day.`,
          fact: clicked.fact, buttonLabel: "See my results" });
      } else {
        setScore((s) => s + gain + pBonus);
        rewardSfx(perfect ? "perfect" : "success");
        const cheer = pickForShot(perfect);
        // "Perfect shot!" is now earned — a first-try shot. A shot filed after a
        // wrong guess still counts, but it's a plainer "Nice shot!".
        setPending({ kind: "correct", tone: "good", emoji: perfect ? "🎯" : "✅",
          title: perfect ? "Perfect shot!" : "Nice shot!",
          subtitle: perfect ? `${found} +${gain}${perfectTxt}` : `${found} +${pts(gain)}.`,
          fact: clicked.fact, photo: clicked.photo, category: clicked.category, cheer, buttonLabel: "Next assignment ✈" });
      }
    } else {
      const wantTxt = a.type === "category" ? `a ${CATEGORIES[a.category].noun}` : target.subject;
      // The lesson is given on EVERY tier, not just the ones with hints on. Warm/cold
      // was a hint — it helped you find the pin and taught nothing — so it was fair to
      // withhold on the harder tiers. A sentence about where the place you clicked
      // actually sits is the teaching this game exists to do, and an Expert player
      // has no less use for it than a Scout. What the higher tiers still lose is the
      // glowing pin and the warm/cold steer.
      const lesson = a.type === "specific"
        ? cityMissLesson({ clicked, target, km: kmBetween(clicked, target), bearing: compass(clicked, target) })
        : categoryMissLesson({ clicked, wantNoun: wantTxt, clickedKindName: (CATEGORIES[clicked.category] || {}).name });
      const km = (MODES[difficulty].hints && a.type === "specific") ? kmBetween(clicked, target) : null;
      const warmth = km === null ? null
        : km < 400 ? "You're very warm — the right pin is close to where you just shot!"
        : km < 1500 ? "You're warm — the right pin isn't far from there."
        : "You're cold — look at a different part of the map.";
      if (d <= 0) outOfDays(`That's ${clicked.subject}, not ${wantTxt} — and the trip's over.`);
      else {
        sfx("fail");
        pickForShot(false);
        missesRef.current[step] = (missesRef.current[step] || 0) + 1;
        const rightId = a.type === "specific" ? a.targetId : (cityPlan?.ids || []).find((oid) => BY_ID[oid] && BY_ID[oid].category === a.category);
        flashRight("city", rightId); // Scout: glow the right pin
        setPending({ kind: "wrong", tone: "bad", emoji: "❌", title: "Not the assignment",
          hint: warmth, lesson,
          subtitle: `The editor wants ${wantTxt}. Half a day gone — pick another city.`,
          buttonLabel: "Keep looking 🔍" });
      }
    }
  }

  // ---------- SCREENS ----------
  const isTour = gameMode === "tour";
  const isExplore = gameMode === "explore";
  // The Long Trip: assignments keep coming until the days run out. Same play as
  // Assignments, but there is no target count to finish — the score IS how far you
  // got — and you set off with a bag Jonah packed (see src/data/kit.js).
  const isLongTrip = gameMode === "longtrip";
  // Travel modes (hubs + last-leg transport + a money budget) run on the two higher
  // Grand Tour tiers only.
  const travelModes = isTour && (difficulty === "medium" || difficulty === "hard");

  // ---------- STORY / INTRO SCREEN (Uncle Jonah's send-off) ----------
  if (screen === "intro") {
    return <StoryScreen beats={INTRO_BEATS} reduced={prefersReduced} mood="intro" cta="bag"
      ctaLabel="Take the camera" onDone={finishStory} />;
  }

  // ---------- DREAM FULFILLED (one-time win scene; game continues after) ----------
  if (screen === "dream") {
    return <StoryScreen beats={DREAM_FULFILLED} reduced={prefersReduced} mood="dream" ctaLabel="Keep exploring the world 🌍"
      onDone={() => { if (profileName) setProfileFlag(profileName, "dreamDone", true); setDreamPending(false); refreshProfiles(); setScreen("start"); }} />;
  }

  // ---------- MEET GRANDPA (pre-game): he says something, nods to your last trip,
  // then asks what adventure you're after — where the mode + difficulty are chosen.
  // ---------- THE CAMERA BAG (Long Trip loadout) ----------
  // Jonah holds out three things and you take two. The choice is the mode's texture:
  // the same run played with fast film and a press pass is a different run from one
  // played with a bush plane and a long lens. Deliberately BEFORE the trip and never
  // during it — a child choosing kit mid-assignment would be choosing under pressure,
  // and the pressure is meant to be the map, not the menu.
  if (screen === "kit" && kitOffer) {
    return (
      <Frame>
        <DeskBoard>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 22, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 440px", minWidth: 320 }}>
              <Stamp>Pack the bag</Stamp>
              <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 26, color: INK, margin: "12px 0 6px" }}>
                Take {NUMWORD[KIT_TAKEN] || KIT_TAKEN} things
              </h2>
              <p style={{ color: INK, opacity: 0.8, fontSize: 15, lineHeight: 1.5, margin: "0 0 14px" }}>
                This trip runs until your days do — there's no list to finish, so go as far as
                you can. Jonah's rummaged in the old bag and found three things. You can't
                carry them all.
              </p>
              {/* The condition is shown BEFORE the choice, not after it. Drawing the
                  weather and then asking what to pack is the decision; telling you
                  afterwards would just be a thing that happened to you. */}
              {condition && (
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 14,
                  background: condition.kind === "good" ? "#EAF6EF" : "#FFF8E6",
                  border: `2px solid ${condition.kind === "good" ? GREEN : GOLD}`, borderRadius: 12, padding: "11px 14px" }}>
                  <span aria-hidden="true" style={{ fontSize: 27, lineHeight: 1 }}>{condition.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.14em",
                      color: condition.kind === "good" ? GREEN : CORAL, fontWeight: 800, marginBottom: 3 }}>
                      {condition.kind === "good" ? "IN YOUR FAVOUR" : "AGAINST YOU"}
                    </div>
                    <div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>{condition.name}</div>
                    <div style={{ color: INK, opacity: 0.85, fontSize: 13.5, lineHeight: 1.45 }}>{condition.blurb}</div>
                    <div style={{ color: OCEAN, fontSize: 13, fontStyle: "italic", marginTop: 5 }}>&ldquo;{condition.jonah}&rdquo;</div>
                  </div>
                </div>
              )}
              <div role="group" aria-label={`Choose ${KIT_TAKEN} of ${kitOffer.length} things to pack`} style={{ display: "grid", gap: 10 }}>
                {kitOffer.map((item) => {
                  const on = kitPicked.includes(item.id);
                  const full = kitPicked.length >= KIT_TAKEN && !on;
                  return (
                    // aria-disabled rather than `disabled`: a disabled button drops
                    // out of the tab order entirely, so the moment the bag filled,
                    // the item you DIDN'T take silently vanished for a keyboard
                    // player — no way to tab to it and find out why it greyed out.
                    // This way it stays reachable and announces itself as
                    // unavailable, and the click is guarded instead.
                    <button key={item.id} aria-pressed={on} aria-disabled={full}
                      onClick={() => { if (full) return; setKitPicked((p) => p.includes(item.id) ? p.filter((x) => x !== item.id) : [...p, item.id]); }}
                      style={{ textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start",
                        padding: "13px 15px", borderRadius: 12, cursor: full ? "default" : "pointer",
                        border: `2.5px solid ${on ? CORAL : PAPER_LINE}`, background: on ? "#FBEAE6" : "#fff",
                        opacity: full ? 0.5 : 1 }}>
                      <span aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>{item.emoji}</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 800, color: INK, fontSize: 16 }}>
                          {item.name}{on ? " ✓" : ""}
                        </span>
                        <span style={{ display: "block", color: INK, opacity: 0.8, fontSize: 13.5, lineHeight: 1.45, marginTop: 2 }}>
                          {item.blurb}
                        </span>
                        <span style={{ display: "block", color: OCEAN, fontSize: 13, fontStyle: "italic", marginTop: 6 }}>
                          &ldquo;{item.jonah}&rdquo;
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
                <button data-primary onClick={() => startLongTrip(kitPicked)} disabled={kitPicked.length !== KIT_TAKEN}
                  style={{ ...primaryBtn, marginTop: 0, opacity: kitPicked.length === KIT_TAKEN ? 1 : 0.45,
                    cursor: kitPicked.length === KIT_TAKEN ? "pointer" : "default" }}>
                  Set off ✈
                </button>
                {/* role="status" — picking the second item changes three things at
                    once (the counter, "Set off" going live, the third item greying
                    out) and none of them were announced. This is the one line that
                    says what just happened, and it reads as a sentence rather than
                    a bare tally so it's worth hearing. */}
                <span role="status" style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: INK, opacity: 0.7 }}>
                  {kitPicked.length} of {KIT_TAKEN} packed
                  {kitPicked.length === KIT_TAKEN ? " — the rest stays behind" : ""}
                </span>
                <button onClick={() => { setKitOffer(null); setKitPicked([]); setScreen("meet"); }}
                  style={{ background: "none", border: "none", color: INK, opacity: 0.6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  ← Back
                </button>
              </div>
            </div>
            <NigelScene mood="packBag" style={{ flex: "1 1 380px", minWidth: 300 }} />
          </div>
        </DeskBoard>
      </Frame>
    );
  }

  if (screen === "meet") {
    const prof = profileName ? getProfile(profileName) : null;
    const showRunNote = !!(prof && prof.games > 0 && meetInfo?.comment);
    // Jonah's greeting types out first; his choices stay grayed and non-clickable
    // until every line of his has finished (tap the text to hurry it along).
    const meetReady = meetTyped >= (1 + (showRunNote ? 1 : 0));
    const u = unlocks(prof);
    const news = meetInfo?.news || [];
    // Difficulty applies to the two SCORED modes. Explore and Journeys don't race,
    // so difficulty stays on screen but greyed — tapping it says why, rather than
    // vanishing and leaving a child wondering where the setting went (rule 4).
    const needsDifficulty = gameMode === "assignments" || gameMode === "tour";
    const DIFF_NA_WHY = {
      explore: "Explore has no timer and no score — you just roam and read, so there's no difficulty to set.",
      journey: "A Journey retraces a real expedition stop by stop, in the order it happened — there's no day budget to make harder or easier.",
    };
    return (
      <Frame>
        <DeskBoard>
          {/* Uncle greets you. He gets the bigger half of the screen and sits on
              the RIGHT; what you read and click stays left, in one column, so the
              eye isn't crossing him to get from his question to the answer. The
              order flips on a narrow screen (he stacks under the words) because a
              scene that wide leaves nothing for the text beside it. */}
          {/* flex-start, not center: centring re-positions Uncle every time the
              left column changes height, so he drifted as the card filled. Pinned to
              the top he stays exactly where a child last looked at him. */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            {/* LEFT COLUMN — Jonah's words, then everything you choose. Bringing the
                choices up here fills the space beside his portrait instead of stranding
                them in a long scroll below it, so difficulty is on screen without
                hunting for it. */}
            <div style={{ flex: "1 1 420px", minWidth: 300 }}>
            <div style={{ ...CARD_SURFACE, textAlign: "left",
              border: `2px solid ${GOLD}`, borderRadius: 16, padding: "18px 20px" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 24, fontWeight: 800, letterSpacing: "0.14em", color: CORAL, marginBottom: 10 }}>{GRANDPA.name.toUpperCase()}</div>
              {/* One line at a time: the follow-up note waits for the greeting to
                  finish, and the question waits for both. It is all one man talking,
                  so it is all one voice on the page — same face, same size, same
                  weight, and every line TYPED at his speaking speed. The closing
                  question used to be bold and to appear all at once, which made the
                  card read as two different voices and gave the moment a jolt the
                  rest of his speech doesn't have. */}
              {(() => {
                const said = { color: INK, fontSize: 17, lineHeight: 1.5 };
                // Each line he hasn't reached yet is laid out INVISIBLY rather than
                // left unmounted, so the card is its final size from the first paint.
                // Mounting them as he got to them grew the card line by line, which
                // pushed the mode cards down the page mid-read and slid Uncle about.
                const ghost = (text, style) => <p aria-hidden="true" style={{ ...style, visibility: "hidden" }}>{text}</p>;
                // Uncle keeps TALKING_CPS while the game's information text types at
                // half that. He isn't information — he's a person talking, and a person
                // who speaks at reading speed sounds like he's struggling to get it out.
                return (<>
                  <TypeLine text={meetInfo?.line} cps={TALKING_CPS} reduced={prefersReduced} onDone={() => setMeetTyped((n) => n + 1)} style={{ ...said, margin: 0 }} />
                  {showRunNote && (meetTyped >= 1
                    ? <TypeLine text={meetInfo.comment} cps={TALKING_CPS} reduced={prefersReduced} onDone={() => setMeetTyped((n) => n + 1)} style={{ ...said, margin: "10px 0 0" }} />
                    : ghost(meetInfo.comment, { ...said, margin: "10px 0 0" }))}
                  {meetReady
                    ? <TypeLine text={MEET_ASK} cps={TALKING_CPS} reduced={prefersReduced} style={{ ...said, margin: "12px 0 0" }} />
                    : ghost(MEET_ASK, { ...said, margin: "12px 0 0" })}
                </>);
              })()}
            </div>

          {/* Newly unlocked! — Jonah's announcements, under the wax seal. */}
          {news.length > 0 && (
            <div style={{ marginTop: 12, background: "#EAF6EF", border: `2px solid ${GREEN}`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left" }}>
              <ArtBadge art={SEAL_UNLOCKED} emoji="🔓" size={54} style={{ marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.16em", color: GREEN, fontWeight: 700, marginBottom: 6 }}>NEWLY UNLOCKED!</div>
                {news.map((n, i) => (
                  <p key={i} style={{ margin: i ? "6px 0 0" : 0, color: INK, fontSize: 14.5, lineHeight: 1.45 }}>
                    <span aria-hidden="true">{GRANDPA.emoji} </span>{n}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Jonah's choices — grayed out and non-interactive until he's finished
              talking, so nobody clicks past his greeting before it's on screen. */}
          <div style={{ opacity: meetReady ? 1 : 0.5, pointerEvents: meetReady ? "auto" : "none", transition: "opacity .25s" }}>
          {/* Pick a way to play */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 700, letterSpacing: "0.16em", color: INK, opacity: 0.75, marginBottom: 10 }}>PICK A WAY TO PLAY</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {MODE_CARDS.map((c) => {
                const active = gameMode === c.id;
                const locked = !u[c.id];
                return (
                  <div key={c.id} style={{ position: "relative" }}>
                    <button onClick={() => { if (locked) { setModeInfo(c.id); return; } setGameMode(c.id); setModeInfo(null); }} aria-pressed={active}
                      aria-label={locked ? `${c.name} — locked. ${UNLOCK_REQ[c.id] || ""}` : c.name}
                      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                        width: "100%", height: 132, borderRadius: 12, overflow: "hidden", cursor: "pointer",
                        border: active ? `3px solid ${CORAL}` : `1.5px solid ${PAPER_LINE}`, padding: 0, textAlign: "center",
                        background: `url("${UI}atlas-paper-texture.png") center / cover, ${PAPER}`,
                        boxShadow: active ? "0 4px 14px rgba(233,106,76,0.35)" : "0 2px 8px rgba(74,50,20,0.18)" }}>
                      <ArtBadge art={MODE_ART[c.id]} emoji={c.emoji} size={80} dim={locked} style={{ marginTop: locked ? 0 : 2 }} />
                      {!locked && <span style={{ color: INK, fontWeight: 800, fontSize: 13.5, lineHeight: 1.1, padding: "0 6px" }}>{c.name}</span>}
                      {active && !locked && <span aria-hidden="true" style={{ position: "absolute", top: 6, left: 8, background: CORAL, color: "#fff", fontWeight: 900, fontSize: 12, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                      {locked && (
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", color: INK, textAlign: "center", padding: "0 8px" }}>
                          <span style={{ fontWeight: 800, fontSize: 12.5, lineHeight: 1.1 }}><span aria-hidden="true">🔒 </span>{c.name}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2, marginTop: 2, opacity: 0.75 }}>{UNLOCK_REQ[c.id]}</span>
                        </span>
                      )}
                    </button>
                    {!locked && (
                      <button onClick={() => setModeInfo((m) => (m === c.id ? null : c.id))} aria-expanded={modeInfo === c.id} aria-label={`About ${c.name}`}
                        style={{ position: "absolute", top: 5, right: 5, width: 21, height: 21, borderRadius: "50%", border: "none", cursor: "pointer",
                          background: "rgba(255,255,255,0.9)", color: INK, fontWeight: 900, fontSize: 12, lineHeight: 1 }}>?</button>
                    )}
                  </div>
                );
              })}
            </div>
            {modeInfo && MODE_CARDS.find((c) => c.id === modeInfo) && (() => {
              const c = MODE_CARDS.find((x) => x.id === modeInfo);
              const locked = !u[c.id];
              return (
                <p role="status" style={{ fontSize: 13, color: INK, background: PAPER, border: `1px solid ${locked ? CORAL : PAPER_LINE}`, borderRadius: 8, padding: "9px 12px", margin: "10px auto 0", maxWidth: 560, lineHeight: 1.5, textAlign: "left" }}>
                  <b>{c.emoji} {c.name}:</b> {locked ? `🔒 Locked — ${UNLOCK_REQ[c.id]} to unlock it.` : c.blurb}
                </p>
              );
            })()}
          </div>

          {/* Grand Tour itinerary */}
          {gameMode === "tour" && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: INK, opacity: 0.65, marginBottom: 8 }}>ITINERARY</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
                {TOUR_THEMES.map((t) => {
                  const on = tourTheme === t.id;
                  const locked = t.id !== "classic" && !u.expeditions; // themed expeditions unlock at 25 places
                  return (
                    <button key={t.id} onClick={() => { if (locked) return; setTourTheme(t.id); }} aria-pressed={on}
                      aria-label={locked ? `${t.title} — locked. ${UNLOCK_REQ.expeditions}` : t.title} title={locked ? `🔒 ${UNLOCK_REQ.expeditions} to unlock` : ""}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px 5px 6px", borderRadius: 18, cursor: locked ? "default" : "pointer",
                        fontWeight: 700, fontSize: 12.5, opacity: locked ? 0.55 : 1,
                        border: `1.5px solid ${on ? CORAL : INK}`, background: on ? CORAL : "transparent", color: on ? "#fff" : INK }}>
                      <ArtBadge art={THEME_ART[t.id]} emoji={t.emoji} size={26} dim={locked} />
                      {locked && <span aria-hidden="true">🔒</span>}{t.title}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12.5, color: INK, opacity: 0.75, margin: "9px auto 0", maxWidth: 520, lineHeight: 1.45 }}>
                {!u.expeditions && <span style={{ color: CORAL, fontWeight: 700 }}>🔒 Themed expeditions unlock once you've photographed 25 places. </span>}
                {TOUR_THEMES.find((t) => t.id === tourTheme)?.lesson}
              </p>
            </div>
          )}

          {/* Which journey. No difficulty here: a route you're retracing isn't a race. */}
          {gameMode === "journey" && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: INK, opacity: 0.65, marginBottom: 8 }}>THE ROUTE</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
                {JOURNEYS.map((jr) => {
                  const on = journeyId === jr.id;
                  return (
                    <button key={jr.id} onClick={() => setJourneyId(jr.id)} aria-pressed={on}
                      aria-label={`${jr.title}, ${jr.era}, ${jr.region}`}
                      style={{ padding: "6px 13px", borderRadius: 16, cursor: "pointer", fontWeight: 700, fontSize: 12.5,
                        border: `1.5px solid ${on ? CORAL : INK}`, background: on ? CORAL : "transparent", color: on ? "#fff" : INK }}>
                      <span aria-hidden="true">{jr.emoji} </span>{jr.title}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12.5, color: INK, opacity: 0.75, margin: "9px auto 0", maxWidth: 520, lineHeight: 1.45 }}>
                <b>{JOURNEY_BY_ID[journeyId].era} · {JOURNEY_BY_ID[journeyId].region}.</b>{" "}
                {JOURNEY_BY_ID[journeyId].blurb}
              </p>
            </div>
          )}

          {/* Difficulty — always shown, but greyed and inert for the modes that don't
              use it. The box runs the full width of this column so its four emblems are
              big and legible. A tap anywhere on it while it's greyed explains why. */}
          <div style={{ marginTop: 18, opacity: needsDifficulty ? 1 : 0.5 }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 700, letterSpacing: "0.16em", color: INK, opacity: 0.75, marginBottom: 8 }}>
              DIFFICULTY
              <button onClick={() => setModeInfo((m) => (m === "difficulty" ? null : "difficulty"))} aria-expanded={modeInfo === "difficulty"} aria-label="About the difficulty levels"
                style={{ marginLeft: 7, width: 20, height: 20, borderRadius: "50%", border: `1px solid ${INK}`, background: "transparent", color: INK, fontWeight: 900, fontSize: 11, lineHeight: 1, cursor: "pointer", verticalAlign: "-4px" }}>?</button>
            </div>
            <div style={{ display: "flex", width: "100%", border: `1.5px solid ${INK}`, borderRadius: 8, overflow: "hidden" }}>
              {MODE_ORDER.map((k) => {
                const locked = !u[k];
                const on = difficulty === k;
                return (
                  <button key={k}
                    onClick={() => {
                      if (!needsDifficulty) { setModeInfo("difficulty-na"); return; }
                      if (locked) { setModeInfo("difficulty"); return; }
                      setDifficulty(k);
                    }}
                    aria-pressed={needsDifficulty && on} aria-label={!needsDifficulty ? `${MODES[k].label} — difficulty isn't used in this mode` : locked ? `${MODES[k].label} — locked. ${UNLOCK_REQ[k] || ""}` : MODES[k].label}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 6px 8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
                      background: needsDifficulty && on && !locked ? INK : "transparent", color: locked ? "#9A8E77" : (needsDifficulty && on ? PAPER : INK) }}>
                    <ArtBadge art={DIFFICULTY_ART[k]} emoji="🎖️" size={52} dim={locked || !needsDifficulty} />
                    <span>{locked && <span aria-hidden="true">🔒 </span>}{MODES[k].label}</span>
                  </button>
                );
              })}
            </div>
            {modeInfo === "difficulty-na" && (
              <p role="status" style={{ fontSize: 13, color: INK, background: PAPER, border: `1px solid ${CORAL}`, borderRadius: 8, padding: "9px 12px", marginTop: 10, lineHeight: 1.5, textAlign: "left" }}>
                <b>No difficulty for this trip.</b> {DIFF_NA_WHY[gameMode] || "This mode doesn't use difficulty."}
              </p>
            )}
            {modeInfo === "difficulty" && (
              <p role="status" style={{ fontSize: 13, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "9px 12px", marginTop: 10, lineHeight: 1.5, textAlign: "left" }}>
                {MODE_ORDER.filter((k) => !u[k]).length > 0 && (
                  <span style={{ display: "block", color: CORAL, fontWeight: 700, marginBottom: 6 }}>
                    🔒 {MODE_ORDER.filter((k) => !u[k]).map((k) => `${MODES[k].label}: ${UNLOCK_REQ[k]}`).join(" · ")}
                  </span>
                )}
                <b>{MODES[difficulty].label}:</b> {MODES[difficulty].blurb}
              </p>
            )}
          </div>

          </div>
          </div>{/* end LEFT COLUMN */}
          {/* His face follows the conversation: the mood of the run he's nodding to
              while he's nodding to it, then amused once he gets to the question. It
              sticks in view as the choices scroll past on a short screen. */}
          {/* Jonah, and under him the bag. Setting off is the same gesture as the very
              first playthrough — he holds out his old camera bag and you take it — so
              it wears the same art, in the same place, instead of a text button parked
              under the settings in the other column. It only bobs once the run is
              actually configured; before that it sits still and greyed, which is the
              screen's answer to "what am I waiting for?". */}
          <div style={{ flex: "1.35 1 420px", minWidth: 300, position: "sticky", top: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <NigelScene mood={!meetReady ? (meetInfo?.mood || "meetLine")
                : (gameMode === "assignments" || gameMode === "tour") ? DIFFICULTY_MOOD[difficulty]
                : gameMode === "explore" ? "modeExplore"
                : gameMode === "journey" ? "modeJourney"
                : "meetAsk"}
              style={{ width: "100%" }} />
            {/* Sits well clear of the portrait above it: at a small gap the bag read as
                part of the picture rather than as the thing to press, and its bob kept
                knocking against the frame. */}
            <button data-primary onClick={setOff} disabled={!meetReady} aria-disabled={!meetReady}
              className={meetReady ? "sbw-bob" : undefined}
              style={{ background: "none", border: "none", padding: 0, marginTop: 46, width: 210, maxWidth: "62%",
                cursor: meetReady ? "pointer" : "default", opacity: meetReady ? 1 : 0.45,
                filter: meetReady ? "none" : "grayscale(0.7)", transition: "opacity .2s ease, filter .2s ease" }}>
              <img src={`${UI}camera-bag.png`} alt="" aria-hidden="true"
                style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 7px 12px rgba(16,38,46,0.42))" }} />
              <span style={{ display: "block", marginTop: 2, fontFamily: HAND, fontWeight: 700, fontSize: 23, color: INK, lineHeight: 1.15 }}>
                {gameMode === "journey" ? `Set out: ${JOURNEY_BY_ID[journeyId].title}` : gameMode === "explore" ? "Start exploring"
                  : gameMode === "tour" ? (tourTheme === "classic" ? "Set off on the Grand Tour" : `Set off: ${TOUR_THEMES.find((t) => t.id === tourTheme)?.title}`)
                  : "Take the camera"}
              </span>
            </button>
          </div>
          </div>{/* end flex row */}
          <button onClick={() => setScreen("start")}
            style={{ marginTop: 14, background: "none", border: "none", color: INK, opacity: 0.6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ← Back to travelers
          </button>
        </DeskBoard>
      </Frame>
    );
  }

  if (screen === "start") {
    return (
      <Frame>
        <div style={{ maxWidth: 1720, margin: "0 auto", textAlign: "center", padding: "8px 4px" }}>
          {/* The splash runs nearly the full width of the screen. Everything on it is
              positioned in PERCENTAGES of the artwork, never pixels — the art scales
              with the viewport, and a pixel offset that looked right on a desktop puts
              the title through the globe on an iPad. */}
          <div style={{ position: "relative", width: "100%", margin: "0 auto" }}>
            <img src={`${BASE}splash-wide.jpg`} alt="Shutterbug — A World Photo Safari"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 14, boxShadow: "0 4px 16px rgba(74,50,20,0.28)" }} />

            {/* Title + subtitle, centred on the sky a quarter of the way down — above
                the globe, which starts around 38%. One button: hovering wiggles the
                pair, clicking opens the how-to-play card. */}
            <button onClick={() => setHowToPlay(true)} className="sbw-wiggle" aria-label="How to play Shutterbug"
              style={{ position: "absolute", left: "50%", top: "25%", transform: "translate(-50%, -50%)",
                width: "48.4%", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6vw",
                background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              {/* The TIGHT logo, not the shared one: that copy is half transparent
                  padding (700x350 around 657x153 of art), which the game header wants
                  and this doesn't — here it inflated the pair until the subtitle sat
                  on the globe instead of in the sky above it. */}
              <img src={`${UI}shutterbug-logo-tight.png`} alt="" aria-hidden="true"
                style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))" }} />
              <img src={`${UI}shutterbug-subtitle.png`} alt="" aria-hidden="true"
                style={{ width: "78%", height: "auto", display: "block", filter: "drop-shadow(0 3px 7px rgba(0,0,0,0.4))" }} />
            </button>

            {/* Three greetings in the clear sky left of the boy's head, reshuffled on
                every visit to the splash. Pointing at one speaks it AND names the
                language and what the word literally means — the sound on its own
                taught a child how to say it but never what they were saying. */}
            {helloPicks.map((b, i) => (
              <button key={b.file}
                onMouseEnter={() => { sayHello(b); setHelloHover(i); }}
                onMouseLeave={() => setHelloHover((h) => (h === i ? null : h))}
                onFocus={() => { sayHello(b); setHelloHover(i); }}
                onBlur={() => setHelloHover((h) => (h === i ? null : h))}
                onClick={() => { sayHello(b); setHelloHover(i); }}
                aria-label={`Hear “${b.word}” — ${b.language} for hello; it means “${b.means}”`}
                style={{ position: "absolute", left: `${HELLO_SPOTS[i].x}%`, top: `${HELLO_SPOTS[i].y}%`,
                  width: `${HELLO_SPOTS[i].w}%`, transform: `translate(-50%, -50%) rotate(${HELLO_SPOTS[i].rot}deg)`,
                  background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                <img src={`${UI}hello/${b.file}`} alt="" aria-hidden="true"
                  style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }} />
              </button>
            ))}
            {/* The caption for whichever bubble is being pointed at. Sits just under
                that bubble so it reads as belonging to it, on a dark pill because the
                sky behind it is a painting and plain text on it is unreadable.
                aria-live is deliberately off: the button's own label already carries
                all of this, and announcing it twice is worse than not at all. */}
            {helloHover !== null && helloPicks[helloHover] && (() => {
              const b = helloPicks[helloHover], s = HELLO_SPOTS[helloHover];
              return (
                <div aria-hidden="true" style={{ position: "absolute", left: `${s.x}%`, top: `${s.y + 8.5}%`,
                  transform: "translate(-50%, 0)", maxWidth: "26%", textAlign: "center",
                  background: "rgba(16,38,46,0.88)", color: "#F4ECD8", borderRadius: 9,
                  padding: "clamp(4px, 0.5vw, 8px) clamp(7px, 0.9vw, 13px)", pointerEvents: "none",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.35)", lineHeight: 1.35 }}>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "clamp(8px, 0.82vw, 12px)",
                    letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, fontWeight: 700 }}>{b.language}</div>
                  <div style={{ fontSize: "clamp(10px, 1vw, 14px)", fontWeight: 600 }}>“{b.means}”</div>
                </div>
              );
            })()}

            <div style={{ position: "absolute", left: 0, right: 0, bottom: "4%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 12px" }}>
              {(() => {
                const prof = profileName ? getProfile(profileName) : null;
                const returning = !!prof && (prof.metNigel || (prof.games || 0) > 0);
                const label = returning ? "Continue your adventure ✈" : "Begin your adventure ✈";
                return (
                  <button data-primary onClick={() => { startMusicMaybe(); setPromptTraveler(false); setScreen("travelers"); }}
                    className="sbw-beckon"
                    // Sized and lettered to read as a sibling of the sign above it, not
                    // as generic chrome: the splash's one job is to be clicked.
                    style={{ ...primaryBtn, marginTop: 0, fontFamily: TYPEWRITER,
                      fontSize: "clamp(18px, 2.07vw, 28px)", padding: "clamp(13px, 1.35vw, 20px) clamp(27px, 3.6vw, 54px)",
                      fontWeight: 700, letterSpacing: "0.06em", borderRadius: 12 }}>
                    {label}
                  </button>
                );
              })()}
            </div>

            {/* Build stamp. Faint, in the corner, deliberately easy to ignore — it
                exists to answer "is this actually the latest version, or is a stale
                service worker still feeding me an old one?" without guesswork.
                Left selectable so it can be read out or copied when something looks
                wrong; it sits clear of everything clickable on the splash. */}
            <div title="Build version" style={{ position: "absolute", right: "1.6%", bottom: "1.4%",
              fontFamily: "ui-monospace, monospace", fontSize: "clamp(8px, 0.8vw, 11px)",
              letterSpacing: "0.05em", color: "#fff", opacity: 0.38,
              textShadow: "0 1px 2px rgba(0,0,0,0.55)" }}>
              {BUILD_ID}
            </div>
          </div>
        </div>
        {howToPlay && <HowToPlayModal onClose={() => setHowToPlay(false)} />}
        {createOpen && (
          <CreateTravelerModal onSubmit={createAndBegin} onClose={() => setCreateOpen(false)} />
        )}
      </Frame>
    );
  }

  // ---------- CHOOSE TRAVELER — its own screen between the splash and Uncle.
  // The main jig keeps playing here (only fades at the world map). ----------
  if (screen === "travelers") {
    return (
      <Frame>
        {(() => {
        const selected = profileName ? getProfile(profileName) : null;
        const leaders = canSave ? topScores(5) : [];
        return (
        <div style={{ position: "relative", minHeight: "min(90vh, 820px)", width: "100%", maxWidth: 1200, margin: "0 auto",
          backgroundImage: `url("${UI}traveling-bg.jpg")`, backgroundSize: "cover", backgroundPosition: "center",
          borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 26px rgba(0,0,0,0.32)" }}>
          <button onClick={() => setScreen("start")} style={{ position: "absolute", top: 14, left: 14, zIndex: 3, padding: "8px 14px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.88)", color: INK, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>← Back</button>

          {/* Everything sits within the aged-map paper in the centre of the flat-lay. */}
          <div style={{ position: "relative", zIndex: 2, minHeight: "inherit", display: "flex", flexDirection: "column", alignItems: "center",
            maxWidth: 900, margin: "0 auto", padding: "clamp(16px, 3.5vw, 40px) clamp(20px, 6vw, 76px) clamp(20px, 3vw, 36px)", textAlign: "center" }}>
            <img src={`${UI}whos-traveling-title.png`} alt="Who's traveling? Pick a traveler, play as a guest, or start a new one."
              style={{ width: "min(90%, 470px)", height: "auto", display: "block" }} />

            {promptTraveler && (
              <p role="alert" style={{ color: CORAL, fontWeight: 800, fontSize: 14, margin: "6px auto 0", maxWidth: 360, background: "rgba(255,255,255,0.94)", border: `1.5px solid ${CORAL}`, borderRadius: 10, padding: "6px 12px" }}>
                ☝️ Pick a traveler (or tap <b>Guest</b>) to continue!
              </p>
            )}

            <div style={{ display: "flex", gap: "clamp(16px, 3vw, 34px)", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", marginTop: 14, width: "100%" }}>
              {/* LEFT: pick a traveler, and the chosen one shown large. */}
              <div style={{ flex: "1.25 1 320px", minWidth: 272 }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {profiles.map((p) => {
                    const active = p.name === profileName;
                    return (
                      <button key={p.name} onClick={() => { startMusicMaybe(); setProfileName(p.name); setLastProfile(p.name); setHasChosen(true); setPromptTraveler(false); }} aria-pressed={active}
                        style={{ padding: "5px 14px 5px 6px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                          display: "inline-flex", alignItems: "center", gap: 7,
                          border: `1.5px solid ${INK}`, background: active ? INK : "rgba(255,255,255,0.72)", color: active ? PAPER : INK }}>
                        <Avatar spec={avatarFor(p)} size={22} />{p.name}
                      </button>
                    );
                  })}
                  <button onClick={() => { startMusicMaybe(); setProfileName(null); setLastProfile(null); setHasChosen(true); setPromptTraveler(false); }} aria-pressed={hasChosen && profileName === null}
                    style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                      border: `1.5px dashed ${INK}`, background: (hasChosen && profileName === null) ? INK : "rgba(255,255,255,0.72)", color: (hasChosen && profileName === null) ? PAPER : INK }}>
                    Guest
                  </button>
                  <button onClick={() => { startMusicMaybe(); setCreateOpen(true); }} disabled={!canSave} title={canSave ? "Create a new traveler" : "This browser can't save progress"}
                    style={{ padding: "7px 14px", borderRadius: 20, cursor: canSave ? "pointer" : "default", fontWeight: 800, fontSize: 13,
                      border: `1.5px solid ${GREEN}`, background: "rgba(255,255,255,0.72)", color: GREEN, opacity: canSave ? 1 : 0.5 }}>
                    ＋ New traveler
                  </button>
                </div>

                {/* The selected traveler, shown full-size. */}
                {selected && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ background: "rgba(255,255,255,0.62)", borderRadius: "50%", padding: 8, boxShadow: "0 4px 14px rgba(0,0,0,0.24)" }}>
                      <Avatar spec={avatarFor(selected)} size={140} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: INK }}>{selected.name}</div>
                    <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                      <button onClick={() => setPassportOpen(true)}
                        style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${CORAL}`, background: "rgba(255,255,255,0.8)", color: CORAL, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        📕 {selected.name}'s passport
                      </button>
                      <button onClick={() => setAvatarEdit(true)}
                        style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "rgba(255,255,255,0.8)", color: OCEAN, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        🧳 Customize
                      </button>
                    </span>
                  </div>
                )}
                {!selected && hasChosen && profileName === null && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ background: "rgba(255,255,255,0.62)", borderRadius: "50%", width: 156, height: 156, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.24)" }}>
                      <span aria-hidden="true" style={{ fontSize: 92 }}>🧳</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: INK }}>Guest</div>
                  </div>
                )}
                {!canSave && (
                  <p style={{ fontSize: 12, color: INK, opacity: 0.7, margin: "10px 2px 0", background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "5px 10px" }}>
                    This browser can't save progress, so games won't be recorded.
                  </p>
                )}
              </div>

              {/* RIGHT: the leaderboard, always on show. */}
              {leaders.length > 0 && (
                <div style={{ flex: "1 1 244px", minWidth: 238, maxWidth: 340 }}>
                  <div style={{ background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 12, padding: "14px 16px", textAlign: "left", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.16em", color: "#8A6A14", fontWeight: 800, marginBottom: 8 }}>🏆 TOP TRAVELERS</div>
                    {leaders.map((r, i) => {
                      const bits = [];
                      if (r.rank) bits.push(r.rank);
                      bits.push((MODES[r.difficulty]?.label || r.difficulty || "") + (r.mode === "tour" ? " · Grand Tour" : ""));
                      if (r.timeMs > 0) bits.push("⏱ " + fmtTime(r.timeMs));
                      return (
                      <div key={r.name + i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 2px", borderTop: i ? `1px solid ${PAPER_LINE}` : "none" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, fontSize: 14, color: i === 0 ? GOLD : INK, opacity: i === 0 ? 1 : 0.6, width: 16, textAlign: "right", flex: "none" }}>{i + 1}</span>
                          <Avatar spec={r.avatar || defaultAvatar(r.name)} size={28} />
                          <span style={{ minWidth: 0 }}>
                            <span style={{ fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.name}</span>
                            <span style={{ fontSize: 11, color: INK, opacity: 0.6, lineHeight: 1.3 }}>{bits.join(" · ")}</span>
                          </span>
                        </span>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, color: CORAL, flex: "none" }}>{r.score}</span>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* On to meet Uncle. goToMeet nudges to pick a traveler first if none is chosen. */}
            <button onClick={goToMeet} style={{ ...primaryBtn, marginTop: "auto", fontSize: 17, padding: "13px 34px" }}>
              Continue ✈
            </button>
          </div>
        </div>
        );
        })()}
        {avatarEdit && profileName && (
          <AvatarEditor name={profileName} initial={getProfile(profileName)?.avatar}
            onSave={(spec) => { setAvatar(profileName, spec); setAvatarEdit(false); refreshProfiles(); sfx("stamp"); }}
            onRename={(want) => {
              const nn = renameProfile(profileName, want);
              if (nn) { setProfileName(nn); setLastProfile(nn); refreshProfiles(); sfx("stamp"); return true; }
              return false;
            }}
            onRemove={() => { deleteProfile(profileName); setAvatarEdit(false); setProfileName(null); setHasChosen(false); refreshProfiles(); }}
            onClose={() => setAvatarEdit(false)} />
        )}
        {createOpen && (
          <CreateTravelerModal onSubmit={createAndBegin} onClose={() => setCreateOpen(false)} />
        )}
        {/* The passport is ALWAYS the booklet popup — never its own screen — so it
            looks and behaves identically wherever it's opened from. */}
        {passportOpen && <PassportModal profile={profileName ? getProfile(profileName) : null} onClose={() => setPassportOpen(false)} />}
      </Frame>
    );
  }

  // ---------- QUIZ SCREEN (also the homecoming visit) ----------
  if ((screen === "quiz" || screen === "homecoming") && quiz) {
    const home = !!quiz.homecoming;
    if (quiz.done) {
      const pct = quiz.questions.length ? quiz.correctCount / quiz.questions.length : 0;
      const r = rankFor(pct);
      return (
        <Frame>
          {pct >= 1 && <Confetti reduced={prefersReduced} />}
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <Stamp>Quiz complete</Stamp>
            <div style={{ fontSize: 52, margin: "10px 0" }} aria-hidden="true">{pct >= 0.9 ? "🏆" : pct >= 0.5 ? "🎉" : "📚"}</div>
            <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 30, color: INK, margin: "0 0 4px" }}>{quiz.correctCount} / {quiz.questions.length} correct</h2>
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: CORAL, fontWeight: 700, margin: "6px 0" }}>{quiz.score} pts</p>
            <p style={{ color: INK, fontWeight: 700, marginTop: 6 }}>{r.title}</p>
            {quiz.best?.isBest && <div style={{ marginTop: 10 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: GOLD, color: INK, fontWeight: 800, fontSize: 14, padding: "5px 14px 5px 6px", borderRadius: 22 }}><ArtBadge art={RECORD_ART.quiz} emoji="★" size={30} /> New best quiz score!</span></div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
              <button onClick={startQuiz} style={primaryBtn}>Play again 🧠</button>
              <button onClick={() => { setQuiz(null); setGameMode("assignments"); setScreen("start"); }} style={{ ...primaryBtn, background: "transparent", color: INK, border: `2px solid ${INK}`, boxShadow: "none" }}>Back to start</button>
            </div>
          </div>
        </Frame>
      );
    }
    const q = quiz.questions[quiz.i];
    const answered = quiz.answeredIdx !== null;
    const loc = home ? BY_ID[q.id] : null;
    // Homecoming: keep the answer buttons grayed until Jonah's line has finished
    // typing, so the child reads his question before picking (only gates homecoming).
    const homeReady = !home || homeTypedI === quiz.i;
    return (
      <Frame>
        <DeskBoard>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Homecoming: Uncle on the LEFT, the quiz on the RIGHT (no scrolling). */}
            {home && (
              <div style={{ flex: "1 1 300px", minWidth: 260, background: PAPER, border: `2px solid ${GOLD}`, borderRadius: 16, padding: "20px 18px", textAlign: "center" }}>
                {/* beat = the question number, so each mood POOL rotates through his
                    expressions across the five questions instead of repeating one. */}
                <NigelScene beat={quiz.i} mood={!answered ? "homecoming" : (q.options[quiz.answeredIdx].correct ? "quizRight" : "quizWrong")} style={{ margin: "0 auto 12px" }} />
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, letterSpacing: "0.06em", color: CORAL, fontWeight: 800, marginBottom: 12 }}>{GRANDPA.name.toUpperCase()}</div>
                {/* key by quiz.i so the line remounts every question — otherwise, when
                    two questions share the same intro text ("And this one…"), TypeLine's
                    effect wouldn't re-run, onDone wouldn't fire, and the answers would
                    stay grayed out forever (the player couldn't continue). */}
                <TypeLine key={quiz.i} text={quiz.i === 0 ? HOMECOMING_INTRO : "And this one — do you remember?"} reduced={prefersReduced}
                  onDone={() => setHomeTypedI(quiz.i)}
                  style={{ color: INK, fontSize: 16, lineHeight: 1.5, textAlign: "left", margin: 0 }} />
                {answered && (() => {
                  const wasCorrect = q.options[quiz.answeredIdx].correct;
                  const tidbit = (loc && ANECDOTES[loc.id]) || (loc && loc.fact) || "";
                  const wrongLine = WRONG_REACTIONS[quiz.i % WRONG_REACTIONS.length];
                  const lead = wasCorrect ? "That's the one!" : wrongLine;
                  const body = wasCorrect ? tidbit : q.explain;
                  return (
                    <div style={{ marginTop: 12, background: wasCorrect ? "#EAF6EF" : "#fff", border: `1px solid ${wasCorrect ? GREEN : PAPER_LINE}`, borderRadius: 10, padding: "12px 14px", fontSize: 15.5, color: INK, lineHeight: 1.55, textAlign: "left" }}>
                      {/* The box is its FINAL size from the first frame. TypeLine's
                          `inline` mode reserves no space, so this panel used to grow
                          line by line as Jonah talked — which shoved the button below
                          it down the page and off the bottom of the screen mid-
                          sentence. A hidden full-text layer holds the height open and
                          the animated copy is laid over it. */}
                      <span style={{ display: "grid" }}>
                        <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}><b>{lead}</b>{" "}{body}</span>
                        <span style={{ gridArea: "1 / 1" }}>
                          <b style={{ color: wasCorrect ? GREEN : CORAL }}>{lead}</b>{" "}
                          <TypeLine text={body} reduced={prefersReduced} inline style={{ display: "inline" }} />
                        </span>
                      </span>
                    </div>
                  );
                })()}
                {/* The onward button lives directly under Jonah's own text box, so a
                    child who has just finished reading his answer doesn't have to look
                    across the page (or scroll) to find how to go on. */}
                {answered && (
                  <button data-primary onClick={nextQuiz} style={{ ...primaryBtn, margin: "14px 0 0", padding: "10px 22px", width: "100%" }}>
                    {quiz.i + 1 >= quiz.questions.length ? "Show him the rest →" : "Next question →"}
                  </button>
                )}
              </div>
            )}

            {/* The question + answers */}
            <div style={{ flex: home ? "1.5 1 360px" : "1 1 100%", minWidth: 300, width: home ? undefined : "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.18em", color: INK, opacity: 0.7 }}>{home ? "🖼" : "🧠"} QUESTION {quiz.i + 1}/{quiz.questions.length}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: CORAL }}>{home ? `${quiz.correctCount} right` : `${quiz.score} pts${quiz.streak > 1 ? ` · 🔥${quiz.streak}` : ""}`}</span>
              </div>
              {q.photo && (
                // Height-capped, not just width-capped. A tall portrait shot at 380px
                // wide ran to ~450px and pushed the answer buttons off the bottom of a
                // 720px-high window — the child then had to scroll to find the options.
                <div style={{ margin: "0 auto 12px", maxWidth: 300, maxHeight: "30vh", borderRadius: 8, overflow: "hidden", border: `1px solid ${PAPER_LINE}`, display: "flex", justifyContent: "center" }}>
                  <Photo photo={q.photo} alt="Quiz landmark" size={300} full />
                </div>
              )}
              {q.bigEmoji && (
                <div aria-hidden="true" style={{ textAlign: "center", fontSize: 96, lineHeight: 1.1, margin: "0 0 10px" }}>{q.bigEmoji}</div>
              )}
              {q.shape && (
                <div style={{ margin: "0 auto 12px", background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: 10, maxWidth: 340 }}>
                  <ShapeView d={q.shape} />
                </div>
              )}
              <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 800, fontSize: 20, color: INK, textAlign: "center", margin: "0 0 16px", lineHeight: 1.35 }}>{q.prompt}</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {q.options.map((o, idx) => {
                  const isCorrect = o.correct, isChosen = quiz.answeredIdx === idx;
                  const bg = !answered ? "#fff" : isCorrect ? "#EAF6EF" : isChosen ? "#FBEAE6" : "#fff";
                  const bd = !answered ? PAPER_LINE : isCorrect ? GREEN : isChosen ? CORAL : PAPER_LINE;
                  return (
                    <button key={idx} onClick={() => answerQuiz(idx)} disabled={answered || !homeReady} aria-disabled={answered || !homeReady}
                      style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: `2px solid ${bd}`, background: bg, color: INK, fontWeight: 700, fontSize: 15, cursor: (answered || !homeReady) ? "default" : "pointer", opacity: homeReady ? 1 : 0.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span>{o.label}</span>
                      {answered && isCorrect && <span aria-hidden="true">✅</span>}
                      {answered && isChosen && !isCorrect && <span aria-hidden="true">❌</span>}
                    </button>
                  );
                })}
              </div>
              {answered && !home && (() => {
                const wasCorrect = q.options[quiz.answeredIdx].correct;
                return (
                  <div style={{ marginTop: 14, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: INK, lineHeight: 1.5 }}>
                    <b style={{ color: wasCorrect ? GREEN : CORAL }}>{wasCorrect ? `Correct!${quiz.lastGain ? ` +${quiz.lastGain}` : ""}` : "Not quite."}</b> {q.explain}
                  </div>
                );
              })()}
              {/* On the homecoming the onward button sits under Jonah's text instead
                  (see above), so this footer is only the standalone quiz's. */}
              {!home && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                  <button onClick={() => { setQuiz(null); setGameMode("assignments"); setScreen("start"); }} style={{ background: "none", border: "none", color: INK, opacity: 0.6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Quit</button>
                  {answered && <button data-primary onClick={nextQuiz} style={{ ...primaryBtn, margin: 0, padding: "10px 22px" }}>{quiz.i + 1 >= quiz.questions.length ? "See results" : "Next question →"}</button>}
                </div>
              )}
            </div>
          </div>
        </DeskBoard>
      </Frame>
    );
  }

  // ---------- STREAK RESULTS ----------

  // ---------- JOURNEY (retrace a real expedition) ----------
  if (screen === "journey" && journey) {
    const j = JOURNEY_BY_ID[journey.id];
    const box = journeyBox(j);
    // The frame takes its shape FROM the box (rather than the box being cut to a fixed
    // frame), because a round-the-world route needs a long letterbox map and a wagon
    // trail across Wyoming does not. Matching them exactly is what stops the plate
    // spilling into a letterbox band — an SVG clips to its viewport, not its viewBox.
    const JOURNEY_AR = box.w / box.h;
    const stops = j.stops;
    // Stops are DRAWN at their unrolled longitude, so a westward leg goes west even
    // when it crosses the antimeridian. See unrolledX() — this is the difference
    // between a map of Magellan's voyage and a map of a voyage he didn't make.
    const ux = unrolledX(j);
    const cur = journey.reveal !== null ? stops[journey.reveal] : stops[journey.at];
    // Which copies of the world the box can see. A route that sails off the left edge
    // keeps going into the tile before it, so the plate is repeated to meet it.
    const tiles = [];
    for (let k = Math.floor(box.x / 360); k <= Math.floor((box.x + box.w) / 360); k++) tiles.push(k);
    // The box is cut to the frame's own aspect, so the plate scales uniformly and a
    // plain circle stays a circle — no ellipse trick needed here.
    //
    // Pin size is 1.6% of the map width, EXCEPT where that would make two pins
    // overlap: on a route spanning the whole globe, two stops a few hundred miles
    // apart are only a few pixels apart, and a pin you can't click is worse than a
    // small one. So the radius also caps at 0.42 × the closest pair, which keeps a
    // visible gap between every pair of circles on every route.
    const PIN_R = Math.min(0.016 * box.w, 0.42 * closestStops(j));
    const pin = (k) => (k / 0.016) * PIN_R;   // ring, label offset etc. scale with the pin
    const reached = (i) => i < journey.at || (journey.reveal !== null && i <= journey.reveal);
    return (
      <Frame>
        {/* A route that circles the globe gets a wider page than a wagon trail does:
            the pins on a world map are small enough already without squeezing them
            into 900px. Everything still centers, and narrow screens just cap out. */}
        <div style={{ maxWidth: JOURNEY_AR >= 2 ? 1200 : 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <Stamp>{j.title}</Stamp>
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.16em", color: OCEAN, margin: "10px 0 2px" }}>
              {j.era.toUpperCase()} · STOP {Math.min(journey.at + 1, stops.length)} OF {stops.length}
            </p>
          </div>
          {journey.done ? (
            <div style={{ background: PAPER, border: `2px solid ${GOLD}`, borderRadius: 14, padding: "18px 20px", marginTop: 12, textAlign: "center" }}>
              <h2 style={{ margin: "0 0 6px", color: INK, fontSize: 24, fontWeight: 900 }}>You retraced the whole journey.</h2>
              <p style={{ margin: "0 0 4px", color: INK, opacity: 0.8, lineHeight: 1.5 }}>
                All {stops.length} stops, in the order they happened — {journey.firstTry} of them found first try.
              </p>
              <p style={{ margin: "8px 0 0", color: INK, opacity: 0.7, fontSize: 13.5, lineHeight: 1.5 }}>
                {j.outro}
              </p>
              <button onClick={() => { setJourney(null); setGameMode("assignments"); setScreen("start"); }}
                style={{ ...primaryBtn, marginTop: 16 }}>Back to the desk 🧭</button>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: INK, fontSize: 15, lineHeight: 1.55, margin: "4px auto 10px", maxWidth: 620 }}>
              {journey.at === 0 && journey.reveal === null ? j.intro : cur.prompt}
            </p>
          )}
          {msg && msg.type === "warn" && !journey.done && (
            <p role="status" style={{ textAlign: "center", color: CORAL, fontWeight: 700, fontSize: 13.5, margin: "0 0 8px" }}>{msg.text}</p>
          )}

          {/* The trail. The route line is drawn only as far as they had actually got,
              so the map fills in westward as the story does.

              The map has a minimum width and pans sideways inside its own frame on a
              small screen. Squeezed to fit a 375px phone, a map of the whole world
              gives you a 6-pixel pin — no child is tapping that. Better to keep the
              pins a real size and let the map be dragged. (The page itself never
              scrolls sideways; only this box does.) */}
          <div ref={journeyMapRef} style={{ position: "relative", borderRadius: 12, overflowX: "auto", overflowY: "hidden",
            border: `3px solid ${OCEAN_DEEP}`, background: SEA, WebkitOverflowScrolling: "touch" }}>
            <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} preserveAspectRatio="xMidYMid meet"
              style={JOURNEY_AR < 1.6
                // A tall route (a north–south run like the Thirteen Colonies) is driven
                // by HEIGHT and capped, so the whole map fits one screen with every stop
                // visible, instead of running off the bottom. A wide route fills the
                // width and pans sideways as before.
                ? { height: "min(calc(100vh - 300px), 560px)", width: "auto", maxWidth: "100%", margin: "0 auto", display: "block", aspectRatio: String(JOURNEY_AR) }
                : { width: "100%", minWidth: JOURNEY_AR >= 2 ? 1000 : 620, display: "block", aspectRatio: String(JOURNEY_AR) }}>
              {/* One copy of the world per tile the box crosses. For every route that
                  stays put this is a single tile and nothing changes; for a
                  circumnavigation it is what lets the trail keep sailing west. */}
              {tiles.map((k) => (
                <g key={k} transform={`translate(${k * 360} 0)`}>
                  <image href={`${BASE}relief-world-hyp.jpg`} xlinkHref={`${BASE}relief-world-hyp.jpg`}
                    x="0" y="0" width="360.4" height="180" preserveAspectRatio="none" />
                  {WORLD_COUNTRIES.map((c) => (
                    <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  ))}
                  <WaterFeatures box={{ ...box, x: box.x - k * 360 }} vbW={box.w} vbH={box.h} zoomed frameAR={1} />
                </g>
              ))}
              {/* the trail so far */}
              <path d={"M" + ux.slice(0, Math.max(1, journey.at + (journey.reveal !== null ? 1 : 0)))
                .map((x, i) => `${x} ${stops[i].y}`).join("L")}
                fill="none" stroke={CORAL} strokeWidth="2.5" strokeDasharray="5 4"
                strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {stops.map((s2, i) => {
                const done = reached(i);
                const isNext = i === journey.at && journey.reveal === null;
                const x = ux[i];
                return (
                  <g key={s2.id} role="button" tabIndex={0} aria-label={`${s2.name}, ${s2.place}`}
                    onClick={() => pickJourneyStop(i)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickJourneyStop(i); } }}
                    style={{ cursor: "pointer" }}>
                    <circle cx={x} cy={s2.y} r={pin(0.016)} fill={done ? GREEN : PAPER}
                      stroke={INK} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    {/* the number is the point — this is an ORDERED route, and a pin you
                        can only tell apart by color tells a colorblind child nothing. */}
                    <text x={x} y={s2.y} textAnchor="middle" dominantBaseline="central"
                      fontSize={PIN_R * 1.19} fontFamily="ui-monospace, monospace" fontWeight="800"
                      fill={done ? "#fff" : INK} style={{ pointerEvents: "none" }}>{i + 1}</text>
                    {isNext && (
                      <circle cx={x} cy={s2.y} r={pin(0.026)} fill="none" stroke={CORAL}
                        strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }}>
                        {!prefersReduced && <animate attributeName="stroke-opacity" values="1;0.15;1" dur="1.6s" repeatCount="indefinite" />}
                      </circle>
                    )}
                    {done && (() => {
                      // A centerd label on a pin near the frame's edge runs off it and gets
                      // cut in half ("Sanlúcar de Bar"). The stops at the two ends of a
                      // round-the-world route are ALWAYS at the edge, so those labels turn
                      // and read inward instead.
                      const nearRight = x > box.x + box.w * 0.85, nearLeft = x < box.x + box.w * 0.15;
                      const anchor = nearRight ? "end" : nearLeft ? "start" : "middle";
                      // A label sits above its pin unless another pin is sitting up there —
                      // Tidore's label would otherwise print straight across Mactan, 600
                      // miles north of it.
                      const crowdedAbove = stops.some((o, k) => k !== i
                        && Math.abs(ux[k] - x) < PIN_R * 3.2
                        && s2.y - o.y > 0 && s2.y - o.y < PIN_R * 3.2);
                      // And where stops come in a tight chain — most of the Oregon Trail —
                      // even side-by-side labels collide, so they alternate above and below.
                      const inChain = stops.some((o, k) => k !== i
                        && Math.abs(ux[k] - x) < PIN_R * 6 && Math.abs(o.y - s2.y) < PIN_R * 4);
                      const below = crowdedAbove || (inChain && i % 2 === 1);
                      const dy = below ? PIN_R * 2.6 : -PIN_R * 1.8;
                      return (
                        <text x={x + (nearRight ? -PIN_R : nearLeft ? PIN_R : 0)} y={s2.y + dy}
                          textAnchor={anchor} fontSize={PIN_R * 1.13}
                          fontFamily="ui-sans-serif, system-ui" fontWeight="700" fill={INK} stroke={PAPER}
                          strokeWidth="3" strokeOpacity="0.8" paintOrder="stroke" vectorEffect="non-scaling-stroke"
                          style={{ pointerEvents: "none" }}>{s2.name}</text>
                      );
                    })()}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* The card for the stop you just found. */}
          {journey.reveal !== null && (
            <div style={{ background: PAPER, border: `2px solid ${GOLD}`, borderRadius: 14, padding: "14px 18px", marginTop: 12 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.16em", color: CORAL, marginBottom: 4 }}>
                {cur.when.toUpperCase()} · {cur.place.toUpperCase()}
              </div>
              <h3 style={{ margin: "0 0 6px", color: INK, fontSize: 20, fontWeight: 900 }}>{cur.name}</h3>
              <p style={{ margin: 0, color: INK, fontSize: 14.5, lineHeight: 1.55 }}>{cur.fact}</p>
              <a href={cur.source} target="_blank" rel="noreferrer"
                style={{ display: "inline-block", marginTop: 8, fontSize: 11.5, color: OCEAN }}>
                Source: {new URL(cur.source).hostname}
              </a>
              <button onClick={nextJourneyStop} style={{ ...primaryBtn, marginTop: 12, width: "100%", padding: "11px 0" }}>
                {journey.at + 1 >= stops.length ? "Finish the journey 🏁" : "On to the next stop →"}
              </button>
            </div>
          )}
          {!journey.done && journey.reveal === null && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => { setJourney(null); setGameMode("assignments"); setScreen("start"); }}
                style={{ background: "none", border: "none", color: INK, opacity: 0.6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                ← Leave the trail
              </button>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  // ---------- ROUTE PLANNER (Grand Tour) ----------
  // The step that makes Grand Tour a different game from Assignments. There you're
  // told one thing at a time and must deduce the rest. Here you're told everything
  // up front — every target, and where it is — so the only question left is the
  // ORDER, and you have to answer it before you fly, with the day-cost of your
  // choice updating as you shuffle it. Par is the cheapest circuit that exists; the
  // budget is par plus a few slack days, so a lazy order genuinely strands you.
  if (screen === "route" && tourPlan) {
    const order = tourPlan.order;
    const cost = routeCost(order);
    const over = Math.round((cost - tourPlan.par.cost) * 10) / 10;
    const move = (i, d) => {
      const j = i + d;
      if (j < 0 || j >= order.length) return;
      const next = order.slice();
      [next[i], next[j]] = [next[j], next[i]];
      setTourPlan((p) => ({ ...p, order: next }));
    };
    const legs = order.map((c, i) => ({
      c, from: i ? order[i - 1] : "Home", days: flightDays(i ? CONTINENT_PIN[order[i - 1]] : HUB, CONTINENT_PIN[c]),
      targets: tourReqs.filter((r) => r.continent === c).length,
    }));
    return (
      <Frame>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <Stamp>Plan the Route</Stamp>
          {/* "Sequence your stops" was a verb no nine-year-old uses and a noun that
              could mean anything. What the screen actually asks is: which continent
              first? Say that. */}
          <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.06em", fontSize: 26, color: INK, margin: "12px 0 4px", textAlign: "center" }}>
            What order will you visit them in?
          </h2>
          <p style={{ color: INK, opacity: 0.75, fontSize: 14.5, lineHeight: 1.5, textAlign: "center", margin: "0 0 4px" }}>
            You know where you're going — now pick the order. A zig-zag route burns
            travel days, so drag the stops around until the trip is short, then lock it in.
          </p>
          <div style={{ background: PAPER, border: `2px solid ${OCEAN}`, borderRadius: 14, padding: "14px 16px", marginTop: 14 }}>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {legs.map((leg, i) => (
                <li key={leg.c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: i < legs.length - 1 ? `1px dashed ${PAPER_LINE}` : "none" }}>
                  <span aria-hidden="true" style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, color: OCEAN, width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 800, color: INK, fontSize: 15 }}>{leg.c}</span>
                    <span style={{ display: "block", fontSize: 12, color: INK, opacity: 0.65 }}>
                      from {leg.from} · {leg.days} day{leg.days === 1 ? "" : "s"} · {leg.targets} target{leg.targets === 1 ? "" : "s"} here
                    </span>
                  </span>
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${leg.c} earlier`}
                    style={{ ...routeBtn, opacity: i === 0 ? 0.3 : 1, cursor: i === 0 ? "default" : "pointer" }}>▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === legs.length - 1} aria-label={`Move ${leg.c} later`}
                    style={{ ...routeBtn, opacity: i === legs.length - 1 ? 0.3 : 1, cursor: i === legs.length - 1 ? "default" : "pointer" }}>▼</button>
                </li>
              ))}
            </ol>
            {/* Cost against par. Never color alone: the verdict is spelled out. */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `2px solid ${PAPER_LINE}`, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}>
              <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 20, color: over <= 0 ? GREEN : over <= 1 ? INK : CORAL }}>
                {cost} days
              </span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.65 }}>
                PAR {tourPar(tourPlan.conts).cost} · your budget {tourPlan.budget}
              </span>
              <span aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: over <= 0 ? GREEN : CORAL, marginLeft: "auto" }}>
                {over <= 0 ? "✓ A perfect circuit — nothing wasted." : `${over} day${over === 1 ? "" : "s"} longer than the best route`}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: INK, opacity: 0.65, lineHeight: 1.5, marginTop: 10 }}>
            Once you commit, straying from this order costs an extra day each time — so
            plan for the whole trip, not just the next hop. Shots cost half a day each,
            and every whole day you bring home is worth points.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            {/* Solving the route FOR the player is the whole game handed over, so the
                button only exists on the two scaffolded tiers — the same reveal ladder
                the clues follow. Adventurer and Expert plan it themselves. */}
            {TOUR_MODES[difficulty].labels === "all" && (
              <button onClick={() => setTourPlan((p) => ({ ...p, order: tourPar(p.conts).order }))}
                style={{ padding: "10px 18px", borderRadius: 10, border: `2px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}>
                Show me the best route
              </button>
            )}
            <button onClick={() => { setTourPlan((p) => ({ ...p, committed: true })); setScreen("play"); }}
              style={{ ...primaryBtn, margin: 0, padding: "11px 24px" }}>
              Commit to this route ✈
            </button>
          </div>
        </div>
      </Frame>
    );
  }

  if (screen === "end") {
    const mode = MODES[difficulty];
    const isTourEnd = gameMode === "tour";
    const isDailyEnd = gameMode === "daily";
    const isLongEnd = gameMode === "longtrip";
    const totalTargets = isTourEnd ? tourReqs.length : assignments.length;
    const maxScore = isTourEnd ? tourMaxScore(tourReqs.length, difficulty) : maxScoreFor(assignments.length, mode);
    // Clamp at 1: distance flights vary slightly by the exact cities visited, so a
    // very efficient route can bank a shade more than the nominal max — never > 100%.
    // The Long Trip has no denominator — its list is 40 deep and nobody is meant to
    // reach the end of it — so "% of a perfect run" is meaningless there and the rank
    // is read off how far you actually got instead.
    const pct = isLongEnd
      ? Math.min(1, album.length / 12)
      : (maxScore > 0 ? Math.min(1, score / maxScore) : 0);
    const r = rankFor(pct);
    return (
      <Frame>
        {totalTargets > 0 && album.length >= totalTargets && <Confetti reduced={prefersReduced} />}
        <DeskBoard>
          {/* The tally reads as ONE compact banner across the top rather than six
              centred lines. Those lines were what pushed the roll and Uncle below the
              fold — the two things the screen exists to show — so the score is stated
              once, in a row, and the rest of the height goes to the pictures. */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "clamp(10px, 2vw, 22px)",
            flexWrap: "wrap", textAlign: "center", marginBottom: 4 }}>
            <Stamp>Roll Developed</Stamp>
            <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.06em", fontSize: "clamp(19px, 2.3vw, 26px)", color: INK, margin: 0 }}>
              {isLongEnd ? `${album.length} place${album.length === 1 ? "" : "s"} before the days ran out` : `${album.length} / ${totalTargets} shots filed`}
            </h2>
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "clamp(15px, 1.7vw, 20px)", color: CORAL, fontWeight: 700, margin: 0 }}>{score} pts · ⏱ {fmtTime(elapsedMs)}</p>
            <p style={{ color: INK, fontWeight: 700, margin: 0, fontSize: 15 }}>{r.title}</p>
          </div>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: INK, opacity: 0.6, margin: "0 0 2px", letterSpacing: "0.06em", textAlign: "center" }}>
            {isDailyEnd ? `Daily Expedition · Day ${dailyDay}` : isTourEnd ? "Grand Tour" : isLongEnd ? "The Long Trip" : "Assignments"} · {mode.label}
            {isLongEnd ? "" : ` · ${Math.round(pct * 100)}% of a perfect run`}
            {quizBonus > 0 && <span style={{ color: GREEN, fontWeight: 700 }}>{"  ·  "}+{tidyScore(quizBonus)} review extra credit ✔</span>}
          </p>

          {/* Jonah's word on the trip — proud on a clean sweep, encouraging when
              the days ran out. He is the emotional bookend to every expedition, so
              he gets the room to be one: the whole scene, in the face that matches
              what he's saying. Under it, the reason to go again. */}
          {/* The developed roll on the LEFT, Uncle's word on the RIGHT — the pictures
              you brought back beside the man you brought them back to. */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 22, margin: "12px auto 0", maxWidth: 1180, flexWrap: "wrap", justifyContent: "center" }}>
            {album.length > 0 && (
              <div style={{ flex: "1.5 1 440px", minWidth: 300 }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL, marginBottom: 8, textAlign: "left" }}>📸 YOUR ROLL, DEVELOPED</div>
                <div style={{ display: "flex", gap: Math.max(8, Math.round(14 * polaroidWidth(album.length) / 172)), flexWrap: "wrap", justifyContent: "flex-start" }}>
                  {album.map((p, i) => (<Polaroid key={`${p.id}-${i}`} p={p} w={polaroidWidth(album.length)} />))}
                </div>
              </div>
            )}
            {/* The right-hand column carries EVERYTHING that isn't the roll: Jonah,
                his word on the trip, the record chips, any badge earned, and the way
                onward. All of that used to stack down the page under both columns,
                which is what put the buttons below the fold on a widescreen — the
                left column is tall (it's photographs), so the page was as tall as the
                photos PLUS all of this. Beside them, it costs no height at all. */}
            <div style={{ flex: "1 1 330px", minWidth: 300, maxWidth: 460, display: "flex", flexDirection: "column", gap: 12 }}>
              {endLine && <NigelScene mood={endWon() ? "endWin" : "endLose"} style={{ width: "100%" }} />}
              {endLine && (
                <div style={{ ...CARD_SURFACE, border: `2px solid ${GOLD}`, borderRadius: 14, padding: "16px 18px", textAlign: "left" }}>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.16em", color: CORAL, marginBottom: 5 }}>{GRANDPA.name.toUpperCase()}</div>
                  <p style={{ margin: 0, color: INK, fontSize: 17, lineHeight: 1.5 }}>{endLine}</p>
                  {/* ---- Why you'd go again. This is the whole point of the screen. ---- */}
                  {nextUp && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${PAPER_LINE}` }}>
                      <ArtBadge art={nextUp.art} emoji={nextUp.emoji} size={40} dim />
                      <div>
                        <div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>
                          {nextUp.name} — {nextUp.have} of {nextUp.need}
                        </div>
                        <div style={{ color: CORAL, fontWeight: 700, fontSize: 14 }}>
                          {nextUp.left === 1 ? "Just one more." : `Only ${nextUp.left} to go.`}
                        </div>
                      </div>
                    </div>
                  )}
                  {grandpaWant && (
                    <p style={{ margin: "12px 0 0", color: INK, fontSize: 15, lineHeight: 1.5, fontStyle: "italic", opacity: 0.9 }}>
                      {grandpaWant}
                    </p>
                  )}
                  {rankNear && (
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12 }}>
                      <ArtBadge art={RANK_ART[rankNear.tier + 1]} emoji="★" size={30} dim />
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5, color: INK, opacity: 0.85 }}>
                        {rankNear.nextNeed - rankNear.have} more place{rankNear.nextNeed - rankNear.have === 1 ? "" : "s"} to <b>{rankNear.next}</b>
                      </span>
                    </div>
                  )}
                </div>
              )}

          {isDailyEnd && dailyBanked && <DailyShare banked={dailyBanked} />}

          {profileName && (lastResult?.isBest || lastResult?.isBestTime) && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {lastResult.isBest && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: GOLD, color: INK, fontWeight: 800, fontSize: 14, padding: "5px 14px 5px 6px", borderRadius: 22 }}>
                  <ArtBadge art={RECORD_ART.bestScore} emoji="★" size={30} /> New best score!
                </span>
              )}
              {lastResult.isBestTime && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: GREEN, color: "#fff", fontWeight: 800, fontSize: 14, padding: "5px 14px 5px 6px", borderRadius: 22 }}>
                  <ArtBadge art={RECORD_ART.bestTime} emoji="⏱" size={30} /> New best time!
                </span>
              )}
            </div>
          )}


          {profileName && newBadges.length > 0 && (
            <div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL, marginBottom: 6 }}>🏅 ACHIEVEMENT{newBadges.length > 1 ? "S" : ""} UNLOCKED!</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {newBadges.map((b) => (
                  <span key={b.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: INK, color: PAPER, fontWeight: 800, fontSize: 14, padding: "6px 14px 6px 7px", borderRadius: 22 }}>
                    <ArtBadge art={b.art} emoji={b.emoji} size={32} /> {b.name}
                  </span>
                ))}
              </div>
              <p style={{ color: INK, fontSize: 13.5, lineHeight: 1.5, margin: "10px auto 0", maxWidth: 420, fontStyle: "italic", opacity: 0.9 }}>
                <span aria-hidden="true">{GRANDPA.emoji} </span>{ACHIEVEMENT_INTRO} {newBadges.length > 1 ? `you've gone and earned ${newBadges.length} keepsakes! I'm putting every one in the album.` : `"${newBadges[0].name}" — that's going straight in the album, that is.`}
              </p>
            </div>
          )}

          {dreamPending && (
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "linear-gradient(160deg, #1C3A5E, #16324E)", color: "#F4E3B8", borderRadius: 12, padding: "14px 18px", maxWidth: 460, margin: "0 auto" }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", marginBottom: 6 }}>🌍 YOU'VE BROUGHT HIM THE WORLD</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#fff" }}>Uncle Jonah has something to say to you…</p>
                <button onClick={() => setScreen("dream")} style={{ ...primaryBtn, marginTop: 14, background: GOLD, color: INK, boxShadow: "0 4px 0 #A9861E" }}>Go and see Uncle Jonah →</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 4 }}>
            <button onClick={() => { startMusicMaybe(); enterMeetScreen(); }} style={{ ...primaryBtn, marginTop: 0, padding: "12px 22px", fontSize: 15 }}>Continue your adventure ✈</button>
            <button onClick={() => { startMusicMaybe(); setScreen("start"); }} style={{ ...primaryBtn, marginTop: 0, padding: "12px 22px", fontSize: 15, background: "transparent", color: INK, border: `2px solid ${INK}`, boxShadow: "none" }}>
              🏠 Main screen
            </button>
            {profileName && (
              <button onClick={() => setPassportOpen(true)} style={{ ...primaryBtn, marginTop: 0, padding: "12px 22px", fontSize: 15, background: "transparent", color: CORAL, border: `2px solid ${CORAL}`, boxShadow: "none" }}>
                📕 Passport
              </button>
            )}
          </div>
            </div>
          </div>
        </DeskBoard>
        {passportOpen && <PassportModal profile={profileName ? getProfile(profileName) : null} onClose={() => setPassportOpen(false)} />}
      </Frame>
    );
  }

  // ---------- THEMED EXPEDITIONS PICKER ----------


  // play screen
  const mode = MODES[difficulty];
  // The editor's telegram adapts to the mission type: a specific subject, or
  // "any {category} in {continent}" for a category mission (the player chooses).
  // In Grand Tour there's no single clue — the itinerary panel replaces it.
  const catMeta = (!isTour && isCatAsg) ? CATEGORIES[asg.category] : null;
  const promptSubject = isTour ? "" : (isCatAsg ? `any ${catMeta.noun}` : (target ? target.subject : ""));
  const tier = mode.clue; // "easy" | "medium" | "hard"
  // Reveal ladder: easy spells the subject out; medium/hard hide it so the player
  // deduces it from the clue. The category badge is a gentle "what kind of place"
  // nudge on easy/medium, withheld on hard.
  const namesSubject = !isTour && !isCatAsg && tier === "easy";
  const showTypeBadge = !isTour && (isCatAsg || tier !== "hard");
  const badgeCat = isCatAsg ? asg.category : (target ? target.category : null);
  // Category clue. When the country step is in play we say exactly how many countries
  // on the map qualify, because only those are offered — a player shouldn't have to
  // guess whether the game counts, say, Algeria's stretch of the Sahara as "a desert".
  const catCount = isCatAsg && asg.countries ? asg.countries.length : 0;
  const clue = isTour ? "" : (isCatAsg
    ? (catCount
        ? `In ${asg.continent.toUpperCase()}, ${NUMWORD[catCount] || catCount} countries on your map have a ${catMeta.noun}. Fly to any of them and photograph it — you pick which one!`
        : `In ${asg.continent.toUpperCase()}, find any ${catMeta.noun} on Jonah's list and photograph it — you pick which one!`)
    : (target ? (target[tier] || target.hard) : ""));
  const inCountry = phase === "country";
  const inCity = phase === "city";
  // Which country the traveler is "in" right now, for the country card. Easy
  // mode has no country step, but a specific mission's country is known as soon
  // as you land on the continent (the easy clue names it anyway); category
  // missions and tours span countries, so theirs appears after the shot instead.
  const ctxCountry = pickedCountry || (inCity && !isTour && asg && asg.type === "specific" && target ? target.country : null);
  const zoomed = inCountry || inCity; // both steps show a topographic relief plate
  // Country step + city step: the continent's square relief box, but the city step
  // of a country-layer assignment zooms further into the picked country. World step:
  // the whole map, letterboxed so it isn't stretched to square.
  const contMeta = pickedContinent ? CONTINENT_META[pickedContinent] : null;
  const countryBox = inCity && pickedCountry && !(cityPlan && cityPlan.wide) && COUNTRY_META[countryKey(pickedContinent, pickedCountry)] ? COUNTRY_META[countryKey(pickedContinent, pickedCountry)].box : null;
  const plateMode = zoomed ? (contMeta ? contMeta.mode : "equirect") : "world";
  const box = !zoomed ? WORLD_BOX : (countryBox || (contMeta ? contMeta.box : WORLD_BOX));
  // A couple of maps read too "vertically smushed" at true equirect scale (high
  // latitudes stretch horizontally), so those get a gentle vertical exaggeration:
  // the whole plate is scaled taller about the box center. Europe, Asia and Africa
  // (their continent maps) and the United Kingdom (its country map) opt in.
  // North America's continent zoom sat South America in the bottom of the frame and
  // read vertically smushed (the continent is wide at these latitudes, so equirect
  // squishes it). Stretch it taller and — unlike the others — pivot on the TOP edge,
  // so the exaggeration pushes the surplus DOWNWARD, cropping most of South America
  // off the bottom rather than trimming the Arctic off the top.
  const naContinentView = zoomed && pickedContinent === "North America" && !countryBox;
  // South America's continent zoom gets a gentle vertical exaggeration too — a 15%
  // taller plate about its centre, to un-squish it — but NOT the top-anchored crop the
  // Americas' wide-and-short maps use; there's nothing to push off the bottom here.
  const saContinentView = zoomed && pickedContinent === "South America" && !countryBox;
  // The USA's own country map is wide-and-short like the NA continent, so it gets the
  // same top-anchored stretch to keep Mexico/Central America and the oceans out of the
  // bottom of the frame.
  const usCountryView = inCity && pickedCountry === "United States" && !!countryBox;
  // The USA pivots on its CENTRE now, not its top. Top-anchoring pushed the surplus
  // height downward, which meant the frame kept everything to the north — Hudson Bay
  // and the Labrador coast — and cropped the Gulf instead. Centre-pivot trims both
  // ends, which is what leaves the lower 48 filling the frame.
  const topCrop = naContinentView;
  // These are not arbitrary "looks nicer" numbers: equirectangular squashes a map
  // vertically by cos(latitude), so the stretch that restores true proportions is
  // 1/cos(lat) at the map's centre. USA ≈ 39°N → 1.29; UK ≈ 55°N → 1.74. Both are
  // set below the true figure deliberately — a full correction reads as a caricature
  // — but nearer it than they were.
  const mapStretchY = naContinentView ? 1.2
    : usCountryView ? 1.22
    : saContinentView ? 1.15
    // Europe carries the most stretch of any continent map. At 1.15 it still read
    // squashed: it sits at the highest latitudes of any populated continent here, so
    // equirect flattens it hardest (1/cos(55°) ≈ 1.74 would be the true correction).
    : (inCountry && pickedContinent === "Europe") ? 1.31
    : (inCountry && pickedContinent === "Asia") ? 1.10
    : (inCountry && pickedContinent === "Africa") ? 1.10
    : (inCity && pickedCountry === "United Kingdom") ? 1.27
    : 1;
  const mapPivotY = topCrop ? box.y : box.y + box.h / 2;
  const mapTransform = mapStretchY === 1 ? undefined
    : `translate(0 ${(mapPivotY * (1 - mapStretchY)).toFixed(3)}) scale(1 ${mapStretchY})`;
  // Where a location's pin sits on the current plate (polar for Antarctica, shifted
  // across the antimeridian for Pacific-centerd Oceania, else the plain map coords).
  const pinXY = (l) => plateMode === "polar" ? antPlate(l.id)
    : { x: (plateMode === "wrap" && l.x < 180) ? l.x + 360 : l.x, y: l.y };
  // The atlas frame is a FIXED rectangle (never changes size/aspect across maps).
  // The world map FILLS it (stretched, straight grid — deliberately not a true
  // Robinson globe); every continent/country zoom instead FITS inside it,
  // undistorted, with ~10% margin (letterboxed over blue ocean).
  // FRAME_AR is module-scope now (see its declaration) — the country boxes are
  // built against the same number at module load, and a local copy here is how
  // the two would silently drift apart.
  const VB_PAD = 0.1;                   // default margin around a fitted zoom
  // A continent may ask for a TIGHTER margin than the default. 10% of the box on every
  // side is a lot once the box is 75° wide — on Europe it was ~9° of extra map in each
  // direction, which is the whole of the Sahara coast at the bottom and a slab of the
  // Middle East at the right. A country zoom keeps the roomier default; those boxes are
  // small enough that the pad is a few degrees, and it is what keeps a coastline off
  // the frame edge. Only applies to a CONTINENT view (a country box overrides it).
  // A COUNTRY box already carries its own margin, built in at the frame's aspect
  // (rule 5). Adding VB_PAD's 10% a side on top of it is what turned a tight box
  // back into a loose one — so country views take almost none, and the continent
  // views keep the behaviour they were tuned with.
  const vbPad = !zoomed ? VB_PAD
    : countryBox ? 0.01
    : (contMeta && contMeta.pad != null) ? contMeta.pad
    : VB_PAD;
  const frameAspect = String(FRAME_AR);
  const par = zoomed ? "xMidYMid meet" : "none";
  const viewBox = zoomed
    ? `${box.x - vbPad * box.w} ${box.y - vbPad * box.h} ${box.w * (1 + 2 * vbPad)} ${box.h * (1 + 2 * vbPad)}`
    : `${box.x} ${box.y} ${box.w} ${box.h}`;
  // How many plate units the frame's WIDTH spans. Under `meet` the fit is uniform and
  // limited by whichever dimension is proportionally larger, so this is the one honest
  // "screen unit" — every pin, glyph and label is sized as a fraction of it. Sizing off
  // box.w (or box.h) instead is what made pins wildly different sizes between countries:
  // Chile's box is 26×44 and the USA's is 59×41, so the same k meant a pin less than
  // half as wide in Chile as in the USA. Under `none` (the world map) the frame width
  // simply spans box.w.
  const WoverS = !zoomed ? box.w
    : (box.w / box.h) > FRAME_AR ? (1 + 2 * vbPad) * box.w
    : FRAME_AR * (1 + 2 * vbPad) * box.h;
  // Pins render as perfect CIRCLES of a steady on-screen size at every zoom. A fitted
  // zoom scales uniformly, so equal user-unit radii ARE a circle. The world map fills
  // the frame non-uniformly (par="none"), so there ry must be scaled by the frame
  // aspect to come out round.
  const pinR = (k) => zoomed
    ? { rx: k * WoverS, ry: k * WoverS }
    : { rx: k * box.w, ry: k * box.h * FRAME_AR };
  // The vertical exaggeration above is applied to the map PLATE, and a pin has to sit
  // at the stretched position of its landmark — but must not itself come out as an
  // ellipse. So each pin is drawn inside a group that undoes the stretch about its own
  // centre: net identity for the shape, while the parent transform still places it.
  // Without this the whole <g> was scaled together and every pin on the USA and UK maps
  // was ~15–25% taller than it was wide.
  const unstretchAt = (cy) => mapStretchY === 1 ? undefined
    : `translate(0 ${(cy * (1 - 1 / mapStretchY)).toFixed(4)}) scale(1 ${(1 / mapStretchY).toFixed(4)})`;
  // ---- De-overlapped landmark pins --------------------------------------------
  // Two landmarks close together (Singapore's, the small Gulf states, Vatican vs
  // Rome…) render as overlapping discs a child can't tell apart or tap. So the pins
  // are nudged off their exact spot just enough that their borders only slightly
  // overlap — approximately in the right place, but always distinguishable. A pin
  // that had to move draws a hairline leader back to its TRUE location. On-screen a
  // pin is a circle of radius ≈ PIN_K × frame-width, in the same WoverS plate units
  // the pin radii themselves are built from (defined above).
  // PIN_K matches the radius actually drawn for the CURRENT pin, so the solver spaces
  // pins for the size they really are.
  const PIN_K = 0.033;
  const pinOverlapDist = 2 * PIN_K * WoverS;   // closer than this on screen = overlapping
  const pinTargetDist = 1.8 * PIN_K * WoverS;  // push apart to here: borders just kissing
  const cityPinLayout = (() => {
    if (!inCity) return { pos: {}, moved: {} };
    const pts = cityOptions.map((id) => { const p = pinXY(loc(id)); return { id, x: p.x, y: p.y, tx: p.x, ty: p.y }; });
    for (let iter = 0; iter < 24; iter++) {
      let any = false;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y, d = Math.hypot(dx, dy);
        if (d >= pinOverlapDist) continue;
        if (d < 1e-6) { const a = i * 2.399963 + j; dx = Math.cos(a); dy = Math.sin(a); d = 1; } // coincident → deterministic split
        const push = (pinTargetDist - d) / 2, ux = dx / d, uy = dy / d;
        pts[i].x -= ux * push; pts[i].y -= uy * push;
        pts[j].x += ux * push; pts[j].y += uy * push;
        any = true;
      }
      if (!any) break;
    }
    const pos = {}, moved = {};
    for (const p of pts) {
      pos[p.id] = { x: p.x, y: p.y };
      if (Math.hypot(p.x - p.tx, p.y - p.ty) > 0.25 * PIN_K * WoverS) moved[p.id] = { x: p.tx, y: p.ty };
    }
    return { pos, moved };
  })();
  const busy = !!flying || !!pending || !!riddle || !!mrO || !!mrOBeats || (!isExplore && days <= 0);
  // Whose typewriter is it? When Mr O (or a riddle) is on screen, HIS text is the one
  // that should click; the assignment clue and the arrival fact under him fall silent,
  // so the player hears one typewriter, not two racing. Only these blocking overlays
  // count — the non-blocking dog popup has no typing sound of its own.
  const typingElsewhere = !!mrO || !!mrOBeats || !!riddle;
  // Journey-tracker step, derived from phase (continent → country → destination → shot).
  const stepIdx = phase === "continent" ? 0 : phase === "country" ? 1 : (revealed ? 3 : 2);
  // Cap the atlas so the whole desk (header + map + ribbon) fits one screen with NO
  // scrolling — the game is meant to lock to a fixed window (a desktop app), never
  // scroll. The 560px cap holds on tall screens; on shorter ones the map shrinks.
  const MAP_CAP = "min(calc(100vh - 262px), 560px)";
  // A short live instruction for the bottom ribbon, matched to the current phase.
  // It used to name the vehicle while an overland hop was running; that hop is gone
  // and the naming moved to the arrival card, where the same sentence does the same
  // job without a camel crossing a border to introduce it.
  const ribbonText = inCity
    ? (isExplore ? "Click any pin to read a place's story." : "Click the right city on the map to take Jonah's photo.")
    : inCountry ? "Which country does the clue point to? Click it on the map."
    : (isTour ? "Follow your route. Going out of order costs a day."
              : "Choose the continent that matches Jonah's clue.");
  const gearItem = { textAlign: "left", background: "transparent", border: "none", borderRadius: 6, padding: "7px 9px", fontSize: 13, fontWeight: 700, color: INK, cursor: "pointer", whiteSpace: "nowrap" };
  return (
    <Frame desk>
      {/* The play screen is a full-height column: header up top, then the desk grid.
          The instruction ribbon now sits inside the desk grid, under the atlas — so
          the 78px of bottom padding that used to reserve room for a fixed bar is
          gone with it. */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 40px)", boxSizing: "border-box" }}>
      {/* ===== Desk header bar (teal leather chrome) ===== */}
      {/* sbw-dark: the focus ring's ink band is invisible on this teal, so the
          class swaps that band for white for everything inside the bar. */}
      <header className="sbw-dark" style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, flexWrap: "nowrap",
        background: `linear-gradient(${OCEAN}, ${OCEAN_DEEP})`, border: `2px solid ${INK}`, borderRadius: 12,
        padding: "6px 20px", marginBottom: 14, boxShadow: "0 6px 0 rgba(16,38,46,0.28)", color: "#F4ECD8",
        minHeight: 60, overflow: "visible" }}>
        {/* Logo — extra large, allowed to overrun the teal top/bottom. Also a
            tap-to-learn target (what the game is / how to play). */}
        <button onClick={() => openCurio("logo")} title="About the game" aria-label="About the game"
          style={{ background: "transparent", border: "none", padding: 0, margin: 0, cursor: "help", flex: "0 0 auto", lineHeight: 0 }}>
          <img src={`${UI}shutterbug-logo.png`} alt="Shutterbug" style={{ height: 184, width: "auto",
            marginTop: -60, marginBottom: -60, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.4))" }} />
        </button>
        <div style={{ flex: 1, minWidth: 8 }} />
        {/* Travel-days calendar — centered over the bar, oversized, overruns the teal. */}
        {!isExplore ? (
          <button onClick={() => openCurio("calendar")} title="Travel & time" aria-label="Travel and time — a fact to learn"
            style={{ position: "absolute", left: "50%", top: "54%", transform: "translate(-50%, -50%)", zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 176, height: 168,
            background: "transparent", border: "none", cursor: "help",
            backgroundImage: `url("${UI}days-calendar-blank-no-clock.png")`, backgroundSize: "contain",
            backgroundRepeat: "no-repeat", backgroundPosition: "center", filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.35))" }}>
            {/* A half-day reading ("2.5") is three glyphs wide and used to crowd the
                calendar's edges, so tuck the tracking in (and trim the size a hair)
                only when there's a fractional ".5"; whole numbers keep their size. */}
            <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900,
              fontSize: Number.isInteger(days) ? 38 : 34, lineHeight: 1,
              letterSpacing: Number.isInteger(days) ? 0 : "-0.06em",
              color: days <= 1 ? CORAL : days <= 2.5 ? "#B8860B" : INK }}>{days}</span>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: INK }}>DAYS LEFT</span>
          </button>
        ) : null}
        {travelModes && (
          <div title="Travel money — spend it on flights and local transport" style={{ position: "absolute", left: "50%", top: "54%", transform: "translate(104px, -50%)", zIndex: 3,
            display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(244,236,216,0.96)", border: `2px solid ${GOLD}`, borderRadius: 10, padding: "4px 12px", boxShadow: "0 3px 0 rgba(16,38,46,0.22)" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 22, lineHeight: 1, color: money <= 200 ? CORAL : "#2E7A55" }}>${money.toLocaleString("en-US")}</span>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: INK }}>WALLET</span>
          </div>
        )}
        {isExplore && (
          <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            fontFamily: "ui-monospace, monospace", fontSize: 16, fontWeight: 800 }} title="Places discovered">📸 {album.length} discovered</span>
        )}
        {/* Avatar + greeting — doubled in size; marginRight keeps it clear of the gear.
            A saved traveler's avatar is a button: tapping it opens the Customize
            Traveler editor (a guest has no saved avatar to customise). */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginRight: 18 }}>
          {profileName ? (
            <button onClick={() => setAvatarEdit(true)} title="Customize traveler" aria-label="Customize traveler"
              style={{ width: 84, height: 84, borderRadius: "50%", border: `4px solid ${GOLD}`, background: PAPER,
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
                padding: 0, cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
              <Avatar spec={avatarFor(getProfile(profileName))} size={76} />
            </button>
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: "50%", border: `4px solid ${GOLD}`, background: PAPER,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
              boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
              <img src={`${UI}player-portrait.png`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "0.03em" }}>HI, {(profileName || "EXPLORER").toUpperCase()}!</div>
            <div style={{ fontSize: 15, opacity: 0.8 }}>Let's capture the world.</div>
          </div>
        </div>
        {/* Settings gear — large, borderless. */}
        <div style={{ position: "relative", flex: "0 0 auto" }}>
          <button onClick={() => setGearOpen((v) => !v)} aria-label="Settings" aria-expanded={gearOpen} title="Settings"
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={`${UI}settings-icon.png`} alt="" style={{ width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }} />
          </button>
          {gearOpen && (
            <div role="menu" style={{ position: "absolute", right: 0, top: 76, zIndex: 30, background: PAPER, color: INK,
              border: `2px solid ${INK}`, borderRadius: 10, padding: 8, minWidth: 176, boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
              display: "flex", flexDirection: "column", gap: 4 }}>
              <button onClick={() => setSoundOn((s) => !s)} role="menuitemcheckbox" aria-checked={soundOn} style={gearItem}>{soundOn ? "🔊" : "🔇"} Sound: {soundOn ? "On" : "Off"}</button>
              <button onClick={() => setMusicOn((m) => { const v = !m; if (v) MUSIC.start(); else MUSIC.stop(); return v; })} role="menuitemcheckbox" aria-checked={musicOn} style={gearItem}>🎵 Music: {musicOn ? "On" : "Off"}</button>
              <button onClick={() => setAnimOn((v) => !v)} role="menuitemcheckbox" aria-checked={animOn} style={gearItem}>✨ Animations: {animOn ? "On" : "Off"}</button>
            </div>
          )}
        </div>
      </header>
      {/* ===== Desk grid: letter panel | atlas map | tool rail ===== */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", flex: "1 1 auto", minHeight: 0 }}>
        {/* Field journal panel */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          {/* The mode + counter now live in the desk header; the panel opens
              straight into the assignment letter / itinerary. */}
          {isExplore ? (
            <div style={{ background: PAPER, border: `1px dashed ${OCEAN}`, borderRadius: 6, padding: "12px 14px" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: OCEAN, marginBottom: 6 }}>
                🧭 {["World", pickedContinent, pickedCountry].filter(Boolean).join(" › ")}
              </div>
              <p style={{ margin: 0, color: INK, opacity: 0.8, fontSize: 13, lineHeight: 1.45 }}>
                {inCity && revealed ? "Read all about this place below — then click another pin, or step back to roam." : inCity ? "Click any pin to learn its story." : inCountry ? "Pick a country to explore." : "Pick a continent to begin."}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {phase !== "continent" && (
                  <button onClick={exploreBack} disabled={busy}
                    style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, fontSize: 12, cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1 }}>
                    ↑ Back
                  </button>
                )}
                <button onClick={doneExplore}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${CORAL}`, background: "transparent", color: CORAL, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  ✓ Done exploring
                </button>
              </div>
            </div>
          ) : isTour ? (
            <>
              {expedition && (
                <div style={{ background: PAPER, border: `1px dashed ${OCEAN}`, borderRadius: 6, padding: "10px 14px", marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>{expedition.emoji} {expedition.title}</div>
                  <p style={{ margin: "4px 0 0", color: INK, opacity: 0.8, fontSize: 12.5, lineHeight: 1.45 }}>{expedition.lesson}</p>
                </div>
              )}
              <Itinerary reqs={tourReqs} here={inCity ? pickedContinent : null} />
              {tourPlan && tourPlan.committed && <RouteStrip plan={tourPlan} reqs={tourReqs} here={pickedContinent} />}
            </>
          ) : (
          <div style={{ position: "relative", padding: "18px 18px 12px",
            background: PAPER,
            // The airmail stripes render as a real border (border-image), so the
            // red/blue edge stays vivid while the note's center is clean cream.
            border: "15px solid transparent",
            borderImage: `url("${UI}airmail-paper-texture.png") 84 stretch`,
            boxShadow: "0 4px 0 rgba(16,38,46,0.18)" }}>
            <img src={`${UI}paperclip.png`} alt="" aria-hidden="true"
              style={{ position: "absolute", top: -15, left: 16, width: 34, height: "auto", filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.35))" }} />
            <div style={{ textAlign: "center", marginBottom: 8, color: CORAL }}>
              <span style={{ display: "block", fontFamily: HAND, fontWeight: 700, fontSize: 33, lineHeight: 1.05 }}>A Note from Jonah</span>
              <span style={{ display: "block", fontFamily: "ui-monospace, monospace", fontSize: 18, letterSpacing: "0.1em", fontWeight: 800, whiteSpace: "nowrap" }}>
                {/* The Long Trip has no denominator to show. Its list is 40 deep only so
                    the run can't run out of assignments before it runs out of days, and
                    printing "1 / 40" both spoils that plumbing and sets a target nobody
                    is meant to reach. */}
                ASSIGNMENT {step + 1}{isLongTrip ? "" : ` / ${assignments.length}`}
              </span>
            </div>
            <div style={{ borderTop: `1px dashed ${INK}`, opacity: 0.35, margin: "0 0 12px" }} />
            {(isCatAsg || namesSubject) ? (
              <>
                <p style={{ margin: 0, color: INK, fontFamily: HAND, lineHeight: 1.35, fontSize: 18 }}>Bring me a photo of <b>{promptSubject}</b>.</p>
                <TypeLine text={clue} reduced={prefersReduced} mute={typingElsewhere} style={{ margin: "6px 0 0", color: INK, opacity: 0.9, fontFamily: HAND, lineHeight: 1.35, fontSize: 16.5 }} />
              </>
            ) : (
              <TypeLine text={clue} reduced={prefersReduced} mute={typingElsewhere} style={{ margin: 0, color: INK, fontFamily: HAND, lineHeight: 1.35, fontSize: 18 }} />
            )}
            {/* The landmark-type marker rides at the very END of Jonah's note (just
                above his signature), not mid-note. */}
            {showTypeBadge && badgeCat && <div style={{ marginTop: 10 }}><CategoryBadge category={badgeCat} size="sm" style={{ verticalAlign: "middle" }} /></div>}
            <img src={`${UI}jonah-signature.png`} alt={`— ${GRANDPA.name}`}
              style={{ display: "block", width: 150, maxWidth: "72%", marginTop: 6, marginLeft: "auto", opacity: 0.92 }} />
          </div>
          )}
          {/* Journey tracker (assignments): reflects continent → country →
              destination → photograph progress. Tour uses its own itinerary above. */}
          {!isTour && !isExplore && <PhaseTracker stepIdx={stepIdx} onCurio={openCurio}
            continentName={pickedContinent} countryName={ctxCountry}
            onCountryInfo={(c) => { if (COUNTRY_INFO[c]) setCountryPopup(c); }} />}

          {/* Tap-to-learn tracker: poking at the chrome (logo, calendar, compass, the
              step markers) is its own kind of progress. Saved travelers only — guests
              don't persist, so a counter would be stuck at zero. */}
          {profileName && (
            <p style={{ margin: "10px 2px 0", fontSize: 11.5, fontWeight: 700, color: INK, opacity: 0.7,
              display: "flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true">🔎</span>
              Curiosities found: {curioFound} / {CURIOSITY_TOTAL}
              {curioFound >= CURIOSITY_TOTAL && <span style={{ color: GREEN }}>· all found! 🎉</span>}
            </p>
          )}


          {/* The research clue no longer persists in the panel — the player taps the
              Field Guide tool again to re-read it (free after the first look). */}

          {/* Only consequential feedback (win / miss / low-days warning) shows here;
              routine "touched down / pick a country" info now lives in the ribbon. */}
          {msg && msg.type !== "info" && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 6, fontSize: 14, lineHeight: 1.4,
              background: msg.type === "win" ? "#EAF6EF" : msg.type === "lose" ? "#FBEAE6" : msg.type === "warn" ? "#FCF3E0" : "#EAF1F2",
              color: INK, border: `1px solid ${msg.type === "win" ? GREEN : msg.type === "lose" ? CORAL : msg.type === "warn" ? GOLD : OCEAN}` }}>
              {msg.text}
            </div>
          )}

          {/* The developed shot after a successful photograph — the reward card.
              Arrival/instruction prompts now live in the ribbon + phase tracker. */}
          {inCity && currentLoc && revealed && (
            <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6 }}>YOUR SHOT</div>
              <div style={{ margin: "8px 0", position: "relative", overflow: "hidden", borderRadius: 4 }}>
                {/* The film "develops": washed-out and gray at first, color blooming in.
                    Shown at the image's own aspect ratio — cover-cropping cut wide
                    subjects (all of Victoria Falls) down to a slice. */}
                <DevelopImg key={`dev${flashKey}`} src={withWidth(currentLoc.photo?.src, 1600)} alt={currentLoc.subject} reduced={prefersReduced}
                  imgStyle={{ width: "100%", maxHeight: 560, objectFit: "contain", display: "block", borderRadius: 4, background: "#10262E" }} />
                {flashKey > 0 && !prefersReduced && <div key={flashKey} className="sbw-flash" />}
              </div>
              <PhotoCredit photo={currentLoc.photo} style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }} />
              <div style={{ fontWeight: 700, color: INK }}><span style={{ fontSize: "4em", verticalAlign: "-0.34em" }}>{currentLoc.flag}</span> {currentLoc.city}, {currentLoc.country}</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.7, marginTop: 2 }}>{currentLoc.subject}</div>
              {/* Country-layer arrivals already saw the culture card as a popup;
                  easy mode (no country step) and Explore show it here with the shot. */}
              {(!pickedCountry || isExplore) && <CountryCard country={currentLoc.country} />}
              {isExplore && (
                <div style={{ marginTop: 10, textAlign: "left" }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}><CategoryBadge category={currentLoc.category} size="sm" /></div>
                  <div style={{ background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 6, padding: "9px 11px", fontSize: 13, color: INK, lineHeight: 1.5 }}>
                    <b style={{ color: CORAL }}>Did you know?</b> <TypeLine text={currentLoc.fact} reduced={prefersReduced} mute={typingElsewhere} inline style={{ display: "inline" }} />
                  </div>
                  <details style={{ marginTop: 8, fontSize: 12, color: INK }}>
                    <summary style={{ cursor: "pointer", color: OCEAN, fontWeight: 700 }}>How the editor might clue this place</summary>
                    <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                      <div><b>Easy:</b> {currentLoc.easy}</div>
                      <div style={{ marginTop: 4 }}><b>Medium:</b> {currentLoc.medium}</div>
                      <div style={{ marginTop: 4 }}><b>Hard:</b> {currentLoc.hard}</div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
          {/* The bag, on the panel, all trip. A charge you've forgotten about is a
              charge you won't plan around, and the whole mode is planning around
              them. Spent items stay listed but greyed — seeing "0 left" is what
              teaches that it was a limited thing, where quietly vanishing would just
              look like a bug. */}
          {isLongTrip && condition && (
            <div style={{ marginTop: 12, display: "flex", gap: 9, alignItems: "center",
              background: condition.kind === "good" ? "#EAF6EF" : "#FFF8E6",
              border: `1px solid ${condition.kind === "good" ? GREEN : GOLD}`, borderRadius: 10, padding: "8px 11px" }}>
              <span aria-hidden="true" style={{ fontSize: 19 }}>{condition.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: INK, fontSize: 12.5 }}>{condition.name}</div>
                <div style={{ color: INK, opacity: 0.8, fontSize: 11.5, lineHeight: 1.35 }}>{condition.blurb}</div>
              </div>
            </div>
          )}
          {isLongTrip && Object.keys(kit).length > 0 && (
            <div style={{ marginTop: 12, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: CORAL, fontWeight: 800, marginBottom: 7 }}>🎒 IN YOUR BAG</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.keys(kit).map((id) => {
                  const item = KIT_BY_ID[id]; if (!item) return null;
                  const left = kit[id] || 0;
                  const spent = left <= 0;
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5,
                      opacity: spent ? 0.45 : 1, color: INK }}>
                      <span aria-hidden="true" style={{ fontSize: 17, filter: spent ? "grayscale(1)" : "none" }}>{item.emoji}</span>
                      <span style={{ fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      <span style={{ marginLeft: "auto", fontFamily: "ui-monospace, monospace", fontSize: 11,
                        color: spent ? INK : GREEN, fontWeight: 800, whiteSpace: "nowrap" }}>
                        {item.charges >= 99 ? (spent ? "spent" : "all trip") : `${left} left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grand Tour, standing on a continent and choosing a country: it has no
              single target, so leaving again has to be possible from HERE too. Without
              this the only way back to the world map was to enter a country first,
              which meant a wasted hop every time you changed your mind. */}
          {isTour && inCountry && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <button onClick={() => { if (!busy) { setPickedCountry(null); setCityPlan(null); setPhase("continent"); setRevealed(false); setMsg({ type: "info", text: "Pick the next continent to fly to." }); } }} disabled={busy}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer" }}>
                ✈ Fly to another continent
              </button>
            </div>
          )}

          {/* Grand Tour keeps its arrival controls (fly on / pick another country)
              — it has no single target, so it needs on-panel navigation. */}
          {isTour && inCity && !revealed && (
            <div style={{ marginTop: 12, background: "#fff", border: `1px dashed ${CORAL}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
              {ctxCountry && COUNTRY_FLAG[ctxCountry]
                ? <div style={{ fontSize: "5.4em", lineHeight: 1 }} aria-hidden="true">{COUNTRY_FLAG[ctxCountry]}</div>
                : <div style={{ fontSize: 28 }} aria-hidden="true">📸</div>}
              <div style={{ fontWeight: 800, color: INK, marginTop: 4 }}>You're in {ctxCountry || pickedContinent}!</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 6, lineHeight: 1.45 }}>
                Photograph any target on your itinerary that's here, then fly on.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
                {pickedCountry && COUNTRY_LAYER_CONTINENTS.has(pickedContinent) && (
                  <button onClick={() => { if (!busy) { setPickedCountry(null); setCityPlan(null); setPhase("country"); setCurrent(null); setRevealed(false); setMsg({ type: "info", text: `${pickedContinent} — pick the country your next target is in.` }); } }} disabled={busy}
                    style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer" }}>
                    ↑ Pick another country
                  </button>
                )}
                <button onClick={() => { if (!busy) { setPickedCountry(null); setCityPlan(null); setPhase("continent"); setRevealed(false); setMsg({ type: "info", text: "Pick the next continent to fly to." }); } }} disabled={busy}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer" }}>
                  ✈ Fly to another continent
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: "3 1 640px", minWidth: 440, display: "flex", flexDirection: "column" }}>
          {/* Atlas plate: the code-rendered map, framed as an adventure-atlas page
              with brass corners, a compass rose, and a faint ink-distress wash.
              All the decoration is pointer-events:none so the map stays clickable.
              The wide world map fills the plate; zoomed square maps stay height-capped. */}
          <div style={{ position: "relative", width: "100%", maxWidth: 940, margin: "0 auto", padding: 12, borderRadius: 16,
            border: `4px solid ${OCEAN_DEEP}`, boxShadow: "0 8px 0 rgba(16,38,46,0.22)",
            background: `url("${UI}atlas-paper-texture.png") center / cover, ${PAPER}` }}>
          <div style={{ position: "relative", aspectRatio: frameAspect, width: "100%", maxWidth: "100%", maxHeight: MAP_CAP, margin: "0 auto", borderRadius: 8, overflow: "hidden", border: `2px solid ${INK}` }}>
            <svg viewBox={viewBox} preserveAspectRatio={par} style={{ width: "100%", height: "100%", display: "block", background: SEA }}>
              <defs>
                <pattern id="sea" width="360" height="180" patternUnits="userSpaceOnUse">
                  <rect width="360" height="180" fill={SEA} />
                  {[...Array(7)].map((_, i) => <line key={i} x1="0" y1={i * 30} x2="360" y2={i * 30} stroke={SEA_DEEP} strokeWidth="0.4" />)}
                  {[...Array(13)].map((_, i) => <line key={"v" + i} x1={i * 30} y1="0" x2={i * 30} y2="180" stroke={SEA_DEEP} strokeWidth="0.4" />)}
                </pattern>
                {/* Paper grain for the flat world map. Four octaves of fractal noise,
                    desaturated, laid over the finished map on multiply — so the ocean
                    and every continent pick up the mottling of printed atlas paper
                    instead of reading as six flat swatches of colour.
                    It is a DRAWN layer, not a new map: the continents underneath keep
                    their exact shapes, their hit areas and their hover states, and the
                    grain is pointer-transparent so it can never intercept a click. */}
                <filter id="mapGrain" x="0" y="0" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="11" result="n" />
                  <feColorMatrix in="n" type="saturate" values="0" />
                </filter>
              </defs>
              {/* Everything is drawn inside one group so a whole map can be given the
                  gentle vertical exaggeration (Europe / UK); it's the identity transform
                  for every other view. */}
              <g transform={mapTransform}>
              {/* World step: the flat color-coded continent map. Country/City step: a
                  PHYSICAL SHADED-RELIEF plate (mountains, deserts, plains, lakes) with
                  the country borders drawn over it. The relief image is equirectangular
                  and the zoomed maps use the same lon/lat space (x = lon+180, y = 90−lat),
                  so it lines up exactly with the country paths and the city pins.
                  Antarctica keeps its own south-polar plate (it has no countries). */}
              {zoomed ? (
                plateMode === "polar" ? (
                  <image href={`${BASE}relief-antarctica.jpg`} xlinkHref={`${BASE}relief-antarctica.jpg`} x="0" y="0" width={ANT_PLATE} height={ANT_PLATE} preserveAspectRatio="none" />
                ) : (
                  <g shapeRendering="geometricPrecision">
                    {/* the relief plate (drawn a second time, shifted +360°, for the
                        Pacific-centerd Oceania view that crosses the antimeridian) */}
                    {(plateMode === "wrap" ? [0, 360] : [0]).map((off) => (
                      // width is a hair over 360 so the two plates overlap and the
                      // antimeridian join doesn't show as a seam
                      <image key={"relief" + off} href={`${BASE}relief-world-hyp.jpg`} xlinkHref={`${BASE}relief-world-hyp.jpg`}
                        x={off} y="0" width="360.4" height="180" preserveAspectRatio="none" />
                    ))}
                    {/* country borders over the relief */}
                    {(plateMode === "wrap" ? [0, 360] : [0]).map((off) => (
                      <g key={off} transform={off ? `translate(${off} 0)` : undefined}>
                        {WORLD_COUNTRIES.map((c) => (
                          <path key={c.name} d={c.d} fill="none" fillRule="evenodd" stroke={INK} strokeOpacity="0.5" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        ))}
                      </g>
                    ))}
                    {/* rivers, lakes and sea names on top of the terrain. The plate
                        is drawn twice for the Pacific-centerd view, so these are too —
                        each copy culled against the box shifted back into its own space. */}
                    {(plateMode === "wrap" ? [0, 360] : [0]).map((off) => (
                      <g key={"w" + off} transform={off ? `translate(${off} 0)` : undefined}>
                        <WaterFeatures box={{ ...box, x: box.x - off }} vbW={box.w * (1 + 2 * vbPad)}
                          vbH={box.h * (1 + 2 * vbPad)} zoomed frameAR={FRAME_AR} labels={!inCountry} />
                      </g>
                    ))}
                  </g>
                )
              ) : (
                <>
                {/* World map: the whole frame is filled deep blue (no globe oval),
                    overlaid with a straight lat/long grid, then each continent as
                    one color-coded region. Deliberately a flat rectangle map. */}
                <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={SEA} />
                <g stroke={SEA_LINE} strokeWidth="0.4" fill="none" opacity="0.4" vectorEffect="non-scaling-stroke">
                  {[...Array(11)].map((_, i) => { const x = box.x + (box.w * (i + 1)) / 12; return <line key={"v" + i} x1={x} y1={box.y} x2={x} y2={box.y + box.h} />; })}
                  {[...Array(5)].map((_, i) => { const y = box.y + (box.h * (i + 1)) / 6; return <line key={"h" + i} x1={box.x} y1={y} x2={box.x + box.w} y2={y} />; })}
                </g>
                {robinsonCountries ? CONTINENTS.map((cont) => (
                  <g key={cont} className={`sbw-cont${flashHint && flashHint.type === "continent" && flashHint.key === cont ? " sbw-flash-hint" : ""}`} role="button" tabIndex={busy ? -1 : 0}
                     aria-label={`Choose ${cont}`} onClick={(e) => pickContinent(cont, eqPointFromEvent(e))}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickContinent(cont); } }}
                     onMouseEnter={() => sayOnHover(cont)}
                     style={{ cursor: busy ? "default" : "pointer" }}>
                    {robinsonCountries.filter((c) => COUNTRY_CONTINENT[c.name] === cont).map((c) => {
                      const d = cont === "North America" ? trimWrappedSubpaths(c.d) : c.d;
                      const got = collectedCountries.has(c.name);
                      return (
                        <g key={c.name}>
                          <path d={d} fill={CONTINENT_COLOR[cont]} fillRule="evenodd" stroke={INK} strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                          {/* The map fills IN as you travel. A country you haven't
                              reached is washed out; photographing it restores its
                              continent's full colour, so a long trip is something you
                              can watch happen to the map. (This is the inverse of the
                              first version, where arriving BLEACHED a country — the
                              same information, but it read as taking colour away from
                              the places you'd been.)
                              Lightness, not hue, still carries "been there", which is
                              what keeps it legible to a colour-blind child (rule 4): a
                              value difference survives every kind of colour vision. The
                              white edge moves to the VISITED country for the same
                              reason it existed before — an outline is a cue that
                              doesn't depend on colour at all.
                              The wash is deliberately lighter than a half-white: at 0.5
                              the untouched world looked bleached and the sea read as
                              the livelier thing on the page. */}
                          {!got && <path d={d} fill="#FFFFFF" fillOpacity="0.34" fillRule="evenodd" style={{ pointerEvents: "none" }} />}
                          {got && <path d={d} fill="none" fillRule="evenodd" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="0.7" vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }} />}
                        </g>
                      );
                    })}
                  </g>
                )) : (
                  // Chunk still in flight (rare — it loads right after first paint). Show
                  // a brief note so the map area never looks broken.
                  <text x={box.x + box.w / 2} y={box.y + box.h / 2} textAnchor="middle" dominantBaseline="central"
                    fontFamily="ui-monospace, monospace" fontSize="9" fill={PAPER} opacity="0.9">Unrolling the map…</text>
                )}
                {/* The oceans and the great seas, named — drawn last so they sit over
                    the water, but pointer-transparent so every continent stays clickable. */}
                {/* No water NAMES on the world map — the seas/oceans are places to
                    photograph, not text over the continents you're trying to click.
                    (Labels stay on the zoomed continent/country maps.) */}
                <WaterFeatures box={box} vbW={box.w} vbH={box.h} zoomed={false} frameAR={FRAME_AR} labels={false} />
                {/* The paper grain, over the whole finished map. pointer-events:none is
                    load-bearing — this rect covers every continent, and without it the
                    map would look right and be entirely unclickable. */}
                <rect x={box.x} y={box.y} width={box.w} height={box.h} filter="url(#mapGrain)"
                  opacity="0.3" style={{ mixBlendMode: "multiply", pointerEvents: "none" }} />
                </>
              )}

              {/* Country step (Medium/Hard): clickable country regions over the
                  continent relief, each labelled — pick the one the clue points to. */}
              {inCountry && (() => {
                const list = (asg && asg.countries) || LAYER_COUNTRY_LIST[pickedContinent] || [];
                // Only ONE country name is ever on screen (the hovered one), so the
                // old collision-avoidance layout is gone — a label simply sits just
                // above its own country. No two can overlap because no two show at once.
                const baseY = (cm) => cm.cy - 0.032 * box.h; // just above the country
                const wrapPlate = plateMode === "wrap";
                // Hard mode hides the names entirely (tell countries apart by shape +
                // the hover highlight). Every other mode CAN show a name — but only for
                // the country the mouse/keyboard is currently on, so no two ever overlap
                // and the map invites you to explore each country to read it.
                const showLabels = wrapPlate || mode.clue !== "hard";
                // First pass: the clickable country region (outline or marker), no
                // text — labels come in a second pass so no region can cover a label.
                const regions = list.map((country) => {
                  const cm = COUNTRY_META[countryKey(pickedContinent, country)];
                  if (!cm) return null;
                  // A wrap plate (Oceania) is drawn with the Pacific in the middle, so a
                  // raw Natural Earth outline lands a whole world to the left. That is
                  // the ONLY reason Oceania used to draw every country as a disc — not
                  // size. Put the outline on the plate and the real borders come back:
                  // Australia is Australia again, and an island nation is its own
                  // scatter of islands rather than a counter parked on top of them.
                  const raw = wcPath(country);
                  // Two different antimeridian problems, two different fixes. On a
                  // PACIFIC-centred plate every outline has to move onto the plate. On
                  // an ordinary plate only the countries that cross the line are wrong
                  // — the USA reaches past 180 with the Aleutians, Russia with
                  // Chukotka — and their raw outlines span the whole world. Measured,
                  // the USA's clickable region was 270% of the frame, so almost any
                  // click on the North America map selected it.
                  let d = raw;
                  if (raw) {
                    d = wrapPlate ? wrapPathPacific(raw) : raw;
                    const span = PATH_BBOX_CACHE(d);
                    if (!wrapPlate && span && span.maxX - span.minX > 180) d = trimFarSubpaths(d, cm.cx);
                  }
                  const pb = d ? PATH_BBOX_CACHE(d) : null;
                  // How much of the frame does this country actually cover? AREA, not
                  // span: the Solomon Islands are 5° wide and almost nothing, and a span
                  // test calls them big while a child still can't hit one. Below ~1% of
                  // the frame there is nothing to aim at, so those get a generous
                  // invisible target and a pulse that says "there IS something here".
                  // Which countries get the "there IS something here" ring.
                  //
                  // The first pass used 1% of the frame's AREA, which was far too
                  // generous — it caught Jamaica, Uruguay and Guyana, which Joshua
                  // rightly says are perfectly clickable. His rule is about countries
                  // that are "basically invisible", so the test is now a LINEAR floor:
                  // the country's longer side against the frame's, which is what "can
                  // I see it / can I hit it" actually depends on.
                  //
                  // 1.2% of the frame width is roughly nine screen pixels in a desktop
                  // window — genuinely too small to aim at. Jamaica sits around 1.5%
                  // and keeps its own shape as the target; Vatican City, Monaco, San
                  // Marino, Liechtenstein and Singapore fall well under it.
                  //
                  // ALWAYS_RING covers the judgement a measurement can't make:
                  // Montenegro is no smaller than Jamaica but sits shoulder to shoulder
                  // with its neighbours, where an island has clear water round it. That
                  // is a content decision, so it lives in data (rule 1).
                  const spanFrac = pb ? Math.max((pb.maxX - pb.minX) / box.w, (pb.maxY - pb.minY) / box.h) : 0;
                  const tiny = !d || spanFrac < 0.012 || ALWAYS_RING.has(country);
                  return (
                    <g key={country} className={`sbw-country${tiny ? " sbw-country--tiny" : ""}${flashHint && flashHint.type === "country" && flashHint.key === country ? " sbw-flash-hint" : ""}`} role="button" tabIndex={busy ? -1 : 0}
                       aria-label={`Choose ${displayCountry(country)}`} onClick={() => pickCountry(country)}
                       onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickCountry(country); } }}
                       onMouseEnter={() => { setHoverCountry(country); sayOnHover(country); }} onMouseLeave={() => setHoverCountry((c) => (c === country ? null : c))}
                       onFocus={() => setHoverCountry(country)} onBlur={() => setHoverCountry((c) => (c === country ? null : c))}
                       style={{ cursor: busy ? "default" : "pointer" }}>
                      {/* The generous target, first and invisible, so a near-miss on a
                          speck of an island still counts. Drawn BEFORE the shape so the
                          shape sits on top and the highlight still reads as the country,
                          not as a circle over it. */}
                      {tiny && (
                        <g transform={unstretchAt(cm.cy)}>
                          {/* Wider when there's no outline at all (French Polynesia has
                              no vector in Natural Earth's set), so the ring sits clear
                              of the fallback disc instead of hiding behind it. */}
                          <ellipse className="sbw-halo" cx={cm.cx} cy={cm.cy} {...pinR(d ? 0.030 : 0.042)}
                            fill={CONTINENT_COLOR[pickedContinent]} fillOpacity="0.001"
                            stroke={CONTINENT_COLOR[pickedContinent]} strokeOpacity="0.85" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                        </g>
                      )}
                      {/* Selectable countries wear their CONTINENT's color (purple
                          Europe, red Asia…) so they read at a glance as part of it,
                          not a generic green blob. */}
                      {d
                        ? <path d={d} fillRule="evenodd" fill={CONTINENT_COLOR[pickedContinent]} fillOpacity="0.30" stroke={INK} strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
                        : <g transform={unstretchAt(cm.cy)}><ellipse cx={cm.cx} cy={cm.cy} {...pinR(0.022)} fill={CONTINENT_COLOR[pickedContinent]} fillOpacity="0.9" stroke={PAPER} strokeWidth="1" vectorEffect="non-scaling-stroke" /></g>}
                    </g>
                  );
                });
                // Second pass: the ONE hovered/focused country's name, drawn on top of
                // every region so nothing can cover it. Hidden entirely in Hard mode.
                const hov = showLabels && hoverCountry && list.includes(hoverCountry)
                  ? COUNTRY_META[countryKey(pickedContinent, hoverCountry)] : null;
                const labels = hov ? [(
                  <g key={"lbl" + hoverCountry} style={{ pointerEvents: "none" }}>
                    <text x={hov.cx} y={baseY(hov)} fontSize={0.055 * box.h} fontFamily="ui-monospace, monospace" fontWeight="800" fill={INK} textAnchor="middle"
                      style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 0.02 * box.h }}>{hoverCountry}</text>
                  </g>
                )] : [];
                return regions.concat(labels);
              })()}

              {/* departure city marker on the world map (Robinson coords) */}
              {!zoomed && currentLoc && (() => {
                const d = eqToRobinson(currentLoc.x, currentLoc.y);
                return (
                <g>
                  <ellipse cx={d.x} cy={d.y} {...pinR(0.008)} fill={CORAL} stroke={INK} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <ellipse cx={d.x} cy={d.y} {...pinR(0.014)} fill="none" stroke="#FFFFFF" strokeWidth="2.4" vectorEffect="non-scaling-stroke" className="sbw-ping" />
                </g>
                );
              })()}

              {/* flight to the chosen continent (Robinson coords): a great-circle-ish
                  arc — the route bows toward the pole like a real flight path, and the
                  plane banks along it (offset-rotate defaults to auto). */}
              {flying && (() => {
                // The world map is a TRIMMED Robinson box (WORLD_BOX cuts the empty
                // ocean off both edges), and five Oceania places fall outside it:
                // Bora Bora, Moorea and Rangiroa sit west of the left edge, Taveuni
                // east of the right one. A flight departing one of them therefore
                // began off-screen — the plane was drawn beyond the frame and only
                // appeared once it had crossed onto the map, which is exactly the
                // "flight from Oceania happens off map" this fixes. Clamp both ends
                // into the visible box: the arc then starts at the edge nearest where
                // the place really is, which reads as flying in from off the map
                // rather than as nothing happening.
                const inset = 6;
                const clampX = (v) => Math.min(Math.max(v, WORLD_BOX.x + inset), WORLD_BOX.x + WORLD_BOX.w - inset);
                const clampY = (v) => Math.min(Math.max(v, WORLD_BOX.y + inset), WORLD_BOX.y + WORLD_BOX.h - inset);
                const raw0 = eqToRobinson(flying.fromX, flying.fromY), raw1 = eqToRobinson(flying.toX, flying.toY);
                const a = { x: clampX(raw0.x), y: clampY(raw0.y) };
                const b = { x: clampX(raw1.x), y: clampY(raw1.y) };
                const dx = b.x - a.x, dy = b.y - a.y;
                const dist = Math.hypot(dx, dy) || 1;
                // Perpendicular that points map-north, scaled to the hop length.
                let nx = -dy / dist, ny = dx / dist;
                if (ny > 0) { nx = -nx; ny = -ny; }
                const lift = Math.min(38, dist * 0.22);
                const cx = (a.x + b.x) / 2 + nx * lift, cy = (a.y + b.y) / 2 + ny * lift;
                const d = `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`;
                return (
                <g className="sbw-plane-group">
                  <path d={d} fill="none" stroke="#D8DEE3" strokeWidth="1" strokeDasharray="3 3" opacity="0.85" />
                  <g style={{ animation: `sbw-fly ${FLIGHT_MS}ms ease-in-out forwards`, offsetPath: `path('${d}')`, offsetRotate: "auto 90deg" }}>
                    {/* The illustrated 777 token. offset-rotate "auto 90deg" turns the
                        nose (which points up in the art) to follow the flight path. */}
                    <g style={{ animation: `sbw-hop ${FLIGHT_MS}ms ease-in-out forwards` }}>
                      <image href={`${UI}passenger-aircraft-777-token.png`} width="26" height="26" x="-13" y="-13"
                        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }} />
                    </g>
                  </g>
                </g>
                );
              })()}



              {/* Outline the country you're standing in (city step) with a bold border
                  and normally NO fill, so the relief inside shows through — the player
                  sees the country's real mountains, rivers and coasts. Its name rides
                  in a banner across the top. */}
              {inCity && pickedCountry && wcPath(pickedCountry) && (() => {
                // `plateMode !== "wrap"` used to gate this, so no Oceania country ever
                // got a border on its own map at all — the same Pacific-plate gap that
                // made the continent layer draw discs. wrapPathPacific is the fix here
                // too: shift the outline onto the plate and the border comes back.
                const d = plateMode === "wrap" ? wrapPathPacific(wcPath(pickedCountry)) : wcPath(pickedCountry);
                // Is there enough LAND in this frame for the relief to show? Measured,
                // not listed — and it has to be area, because a bounding box gets this
                // exactly backwards. French Polynesia's islands are scattered across
                // its whole frame, so its bbox fills it while the land is about 1%;
                // New Caledonia is one island filling two thirds of its frame. A bbox
                // test calls them the same and they need opposite treatment.
                //
                // Under ~2% the plate has essentially nothing at that scale and an
                // unfilled outline is a few hairlines on open blue, so the vector gets
                // painted in — it is the only thing that can show the land. Above it,
                // no fill: the relief is the whole point of a country map.
                const speck = isSpeckIn(d, box);
                return (
                  <path d={d} fillRule="evenodd"
                    fill={speck ? LAND : "none"} fillOpacity={speck ? 0.95 : 0}
                    // A speck gets a THIN edge, because a 3.4px non-scaling stroke on an
                    // island a few pixels across is wider than the island — it swallowed
                    // the land tint whole and the atolls came out as red dots. Here the
                    // fill carries "this is land" and the edge only defines it.
                    stroke={speck ? LAND_EDGE : CORAL} strokeWidth={speck ? 0.9 : 3.4} strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }} />
                );
              })()}
              {inCity && (ctxCountry || pickedCountry) && (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={box.x + box.w * 0.5 - (String(ctxCountry || pickedCountry).length * 0.0125 + 0.03) * box.w} y={box.y + 0.02 * box.h}
                    width={(String(ctxCountry || pickedCountry).length * 0.025 + 0.06) * box.w} height={0.075 * box.h} rx={0.02 * box.h}
                    fill="rgba(16,38,46,0.82)" />
                  <text x={box.x + box.w * 0.5} y={box.y + 0.073 * box.h} fontSize={0.045 * box.h} fontFamily="ui-sans-serif, system-ui" fontWeight="900"
                    fill="#fff" textAnchor="middle">{displayCountry(ctxCountry || pickedCountry)}</text>
                </g>
              )}

              {/* city pins (city phase): the target + same-continent decoys. Each pin
                  carries its subject's CATEGORY EMOJI on a light disc — a color-blind-
                  safe, at-a-glance clue to what kind of place it is (mountain, temple…),
                  so the player can match it against the editor's clue. */}
              {/* Hairline leaders from any nudged pin back to its TRUE spot, drawn
                  UNDER the pins so the disc always sits on top of its own line.

                  White, and CASED: a dark line is drawn under a white one, slightly
                  wider, so the leader shows up as white-with-an-outline. A leader has
                  to cross whatever terrain is under it — snow, desert, forest, ocean —
                  and any single colour disappears against something. Plain dark ink
                  was invisible on relief and is what this replaces; plain white would
                  just move the problem onto the pale half of the map. The casing is
                  the standard cartographic answer, and it's the only version that
                  holds contrast everywhere (rule 4). Same for the dot at the true
                  spot: white centre, dark rim. */}
              {inCity && cityOptions.map((id) => {
                const t = cityPinLayout.moved[id]; if (!t) return null;
                const p = cityPinLayout.pos[id];
                return <g key={"lead" + id} style={{ pointerEvents: "none" }}>
                  <line x1={p.x} y1={p.y} x2={t.x} y2={t.y} stroke={INK} strokeWidth="3" strokeOpacity="0.45" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  <line x1={p.x} y1={p.y} x2={t.x} y2={t.y} stroke="#FFFFFF" strokeWidth="1.4" strokeOpacity="0.95" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  {/* the leader LINE may stay stretched (a line is a line), but the
                      dot marking the true spot has to stay a dot */}
                  <g transform={unstretchAt(t.y)}>
                    <ellipse cx={t.x} cy={t.y} {...pinR(0.013)} fill="#FFFFFF" fillOpacity="0.95" stroke={INK} strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  </g>
                </g>;
              })}
              {/* Draw the hovered/focused pin LAST so its icon (and revealed name) ride
                  on top of every neighbor. */}
              {inCity && (hoverPin && cityOptions.includes(hoverPin)
                ? [...cityOptions.filter((x) => x !== hoverPin), hoverPin]
                : cityOptions).map((id) => {
                const l = loc(id);
                const { x: px, y: py } = cityPinLayout.pos[id] || pinXY(l);
                const isCurrent = id === current;
                const emoji = (CATEGORIES[l.category] || {}).emoji || "📍";
                return (
                  <g key={id} className={`sbw-pin sbw-pin--hide${flashHint && flashHint.type === "city" && flashHint.key === id ? " sbw-flash-hint" : ""}`}
                     role="button" tabIndex={busy ? -1 : 0}
                     aria-label={`Photograph ${l.city}, ${l.country} (${(CATEGORIES[l.category] || {}).name || "place"})`}
                     onClick={() => photographCity(id)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photographCity(id); } }}
                     onMouseEnter={() => setHoverPin(id)} onMouseLeave={() => setHoverPin((p) => (p === id ? null : p))}
                     onFocus={() => setHoverPin(id)} onBlur={() => setHoverPin((p) => (p === id ? null : p))}
                     style={{ cursor: busy ? "default" : "pointer" }}>
                    {/* Undo the plate's vertical exaggeration about this pin's own
                        centre — the disc stays a disc, the emoji stays upright, and
                        the pin still sits where the stretched map puts its landmark.
                        Every size here is a fraction of WoverS (the frame width in
                        plate units), so a pin is the same size on every country map. */}
                    <g transform={unstretchAt(py)}>
                    <ellipse cx={px} cy={py} {...pinR(0.046)} fill="transparent" />
                    <ellipse cx={px} cy={py} {...pinR(isCurrent ? 0.033 : 0.028)} fill={isCurrent ? "rgba(233,92,66,0.22)" : "rgba(255,255,255,0.82)"} stroke={isCurrent ? CORAL : INK} strokeWidth={isCurrent ? "1.1" : "0.8"} vectorEffect="non-scaling-stroke" />
                    {isCurrent && <ellipse cx={px} cy={py} {...pinR(0.043)} fill="none" stroke="#FFFFFF" strokeWidth="2" vectorEffect="non-scaling-stroke" className="sbw-ping" />}
                    <text x={px} y={py} fontSize={0.044 * WoverS} textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: "none" }}>{emoji}</text>
                    <text className="sbw-label" x={px + 0.033 * WoverS} y={py - 0.024 * WoverS} fontSize={0.017 * WoverS} fontFamily="ui-monospace, monospace" fill={INK} style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 0.0048 * WoverS }}>{l.city}</text>
                    </g>
                  </g>
                );
              })}

              {/* Blue stars mark every place you've already photographed THIS game —
                  shown on the world map (all of them) and on a continent zoom (that
                  continent's). */}
              {album.map((p) => {
                const l = BY_ID[p.id];
                if (!l || (zoomed && l.continent !== pickedContinent)) return null;
                const pos = zoomed ? pinXY(l) : eqToRobinson(l.x, l.y);
                const sz = (zoomed ? 0.032 : 0.024) * WoverS;
                return (
                  <g key={"star" + p.id} transform={zoomed ? unstretchAt(pos.y) : undefined}>
                  <text x={pos.x} y={pos.y} fontSize={sz} textAnchor="middle" dominantBaseline="central"
                    fill="#2E6FC9" style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: sz * 0.26, pointerEvents: "none" }}>★</text>
                  </g>
                );
              })}

              {/* Overseas-territory locator insets — only on a country plate that has
                  far-flung territories off-frame (France: Guiana, the Antilles, Réunion,
                  Mayotte). */}
              {zoomed && <ScaleBar box={box} wOverS={WoverS} />}
              {countryBox && pickedCountry && OVERSEAS_INSETS[pickedCountry] && (
                <OverseasInsets specs={OVERSEAS_INSETS[pickedCountry]} box={box} />
              )}
              </g>
              {/* The overland hop is drawn OUTSIDE the map's vertical-stretch group
                  (see the closing </g> below) and its endpoints are pre-transformed by
                  the same stretch instead. That's what lets the token both ROTATE to
                  face its direction of travel and stay undistorted: a counter-scale
                  applied inside a rotated frame skews the art, and Europe's plate is
                  scaled 1.31 vertically. Pre-transforming the two points puts the
                  track exactly where the stretched map wants it while the vehicle on
                  top of it is drawn in honest, unstretched screen space. */}
            </svg>
            {/* The flight used to be skippable by tapping the map. It isn't any more:
                the flight is the beat where the travel jig plays and the plane crosses
                the world, and a child who taps everywhere skipped it every time without
                ever deciding to. It is five seconds. */}

          </div>
            {/* Decorative atlas furniture (non-interactive, over the map plate). */}
            <img src={`${UI}map-ink-distress.png`} alt="" aria-hidden="true"
              style={{ position: "absolute", inset: 12, width: "calc(100% - 24px)", height: "calc(100% - 24px)", objectFit: "cover", opacity: 0.16, mixBlendMode: "multiply", pointerEvents: "none", borderRadius: 8 }} />
            {/* The compass rose is also a tap-to-learn target — the ONLY furniture that
                takes clicks, which makes its footprint a real hazard: anything under it
                cannot be tapped. It sat big and well inside the plate, and on North
                America that put it squarely over Hawaii, which was effectively
                unclickable.
                Every corner of every continent has SOMETHING near it (Oceania's Milford
                Sound sits 3% from its bottom-right), so moving it to another corner just
                moves the problem. Instead it's smaller and tucked right into the corner,
                inside the viewBox's 10% padding margin — the ring of empty ocean the map
                already leaves around the land — so it overlaps frame, not targets.
                It's also off during a flight, so it can never steal a continent tap. */}
            <button onClick={() => openCurio("compass")} title="About the compass" aria-label="About the compass"
              disabled={flying}
              style={{ position: "absolute", left: 40, bottom: 36, width: "clamp(78px, 11vw, 132px)", height: "clamp(78px, 11vw, 132px)",
                padding: 0, border: "none", background: "transparent", cursor: flying ? "default" : "help", zIndex: 4 }}>
              <img src={`${UI}compass-rose.png`} alt="" aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.92, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }} />
            </button>
            {[["cornerTL", { top: 2, left: 2 }, "rotate(0deg)"], ["cornerTR", { top: 2, right: 2 }, "rotate(90deg)"],
              ["cornerBR", { bottom: 2, right: 2 }, "rotate(180deg)"], ["cornerBL", { bottom: 2, left: 2 }, "rotate(270deg)"]].map(([k, pos, rot]) => (
              <img key={k} src={`${UI}atlas-corner.png`} alt="" aria-hidden="true"
                style={{ position: "absolute", ...pos, width: "clamp(48px, 8vw, 82px)", transform: rot, pointerEvents: "none" }} />
            ))}
          </div>
          {/* ===== Instruction ribbon — directly under the atlas and matching its
                  width, so it reads as part of the map rather than a floating bar.
                  It used to be position:fixed across the whole screen bottom, which
                  meant it sat under the step rail and needed the column to reserve
                  78px of padding for it. ===== */}
          {/* The ribbon rides up close under the atlas (small top margin) and is kept
              short, so its BOTTOM edge lands about level with the last itinerary step
              on the left and the passport on the right. Its text is sized down and
              held to a single line — a wrapped clue broke the hand-drawn ribbon art. */}
          <div style={{ width: "100%", maxWidth: 940, margin: "8px auto 0", minHeight: 132, display: "flex",
            alignItems: "center", justifyContent: "center", textAlign: "center", padding: "22px 78px", boxSizing: "border-box",
            background: `url("${UI}instruction-ribbon.png") center / 100% 100% no-repeat` }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: HAND, fontWeight: 700, fontSize: "clamp(15px, 1.9vw, 21px)", lineHeight: 1.2, color: INK, whiteSpace: "nowrap" }}>
              <span aria-hidden="true" style={{ fontSize: "1.1em" }}>🌍</span>{ribbonText}
            </span>
          </div>
        </div>
        {/* ===== Right tool rail — evenly spaced over the desk height, no labels ===== */}
        {/* space-between with equal-height tiles (all three PNGs are square), so the
            two gaps are always identical. The bottom padding lifts the passport off
            the very edge of the desk — flush looked like it had slid off — and because
            space-between shares out whatever height is left, both gaps close by the
            same amount, so lifting it keeps the rail evenly spaced. */}
        <div style={{ flex: "0 0 210px", alignSelf: "stretch", display: "flex", flexDirection: "column",
          justifyContent: "space-between", alignItems: "center", padding: "4px 0 26px" }}>
          {/* All three tools show in every mode. The Field Guide researches a CLUE, so
              it only works where there is one to solve — greyed (not gone) on the Grand
              Tour, on Explore, and on Expert, with a tap explaining why. Keeping the
              rail identical across modes means a child always knows where each tool is. */}
          {(() => {
            const guideReason = isTour ? "The Grand Tour shows you every place up front — there's no clue to research, so the Field Guide sits this trip out."
              : isExplore ? "You're free to roam — there's no clue to solve here, so the Field Guide isn't needed."
              : mode.research === "off" ? "On Expert you're on your own: no research. Try an easier tier to use the Field Guide."
              : null;
            const guideUsable = !guideReason;
            return (
              <ToolButton img="field-guide.png" dim={!guideUsable}
                label={guideUsable ? "Field Guide — research the clue" : "Field Guide — not used in this mode"}
                onClick={guideUsable
                  ? () => { setGearOpen(false); const fresh = !researched[step] && mode.research !== "off"; if (fresh) doResearch(); setGuideFresh(fresh); setGuideOpen(true); }
                  : () => setToolNote({ tool: "Field Guide", why: guideReason })}
                disabled={guideUsable && busy} />
            );
          })()}
          <ToolButton img="photo-album.png" label="Photo Album" onClick={() => setAlbumOpen(true)} />
          <ToolButton img="passport.png" label="Passport" onClick={() => { setGearOpen(false); setPassportOpen(true); }} />
        </div>
      </div>

      </div>{/* /full-height column */}

      {toolNote && <ToolNoteModal note={toolNote} onClose={() => setToolNote(null)} />}
      {passportOpen && <PassportModal profile={profileName ? getProfile(profileName) : null} onClose={() => setPassportOpen(false)} />}
      {albumOpen && <AlbumModal album={album} onPick={(p) => { setAlbumOpen(false); setAlbumView(p); }} onClose={() => setAlbumOpen(false)} />}
      {guideOpen && <FieldGuideModal note={researched[step]} spent={guideFresh && researchCost > 0} onClose={() => setGuideOpen(false)} />}
      {pending && <ResultModal data={pending} onContinue={continueFromResult} reduced={prefersReduced} />}
      {/* A photo is only ever opened FROM the album, so closing it returns there
          (not to the map behind it). */}
      {albumView && <LandmarkModal p={albumView} onClose={() => { setAlbumView(null); setAlbumOpen(true); }} reduced={prefersReduced} />}
      {countryPopup && <CountryPopup country={countryPopup} ride={arrivalRide} onClose={() => setCountryPopup(null)} reduced={prefersReduced} />}
      {travelChoice && <TravelChooser choice={travelChoice} money={money} onConfirm={confirmTravel} onCancel={() => setTravelChoice(null)} />}
      {/* Customize Traveler, reachable mid-trip by tapping the header avatar. No
          remove option here (deleting the traveler you're playing as would end the
          run); that lives on the start screen. */}
      {avatarEdit && profileName && (
        <AvatarEditor name={profileName} initial={getProfile(profileName)?.avatar}
          onSave={(spec) => { setAvatar(profileName, spec); setAvatarEdit(false); refreshProfiles(); sfx("stamp"); }}
          onRename={(want) => {
            const nn = renameProfile(profileName, want);
            if (nn) { setProfileName(nn); setLastProfile(nn); refreshProfiles(); sfx("stamp"); return true; }
            return false;
          }}
          onClose={() => setAvatarEdit(false)} />
      )}
      {curioDeck && CURIOSITY_DECK_BY_ID[curioDeck] && (
        <CuriosityCard deck={CURIOSITY_DECK_BY_ID[curioDeck]}
          seen={profileName ? curiositiesSeen(getProfile(profileName)) : {}}
          onSeen={onCurioSeen} onClose={() => setCurioDeck(null)} reduced={prefersReduced} />
      )}
      {/* Something in the bag just paid for you. A silent saving is invisible — the
          day cost simply doesn't appear — so it has to SAY so, or the item feels like
          it did nothing. Non-blocking; it fades on its own. */}
      {kitNote && (
        <div role="status" style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)",
          zIndex: 60, background: INK, color: PAPER, borderRadius: 999, padding: "9px 18px",
          display: "flex", alignItems: "center", gap: 9, boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          fontWeight: 800, fontSize: 14, pointerEvents: "none" }}>
          <span aria-hidden="true" style={{ fontSize: 19 }}>{kitNote.emoji}</span>
          {kitNote.name} — used!
        </div>
      )}
      {mrO && <MrOBubble fact={mrO} onClose={() => setMrO(null)} reduced={prefersReduced} />}
      {mrOBeats && <MrOBubble beats={mrOBeats} onClose={() => setMrOBeats(null)} reduced={prefersReduced} />}
      {riddle && <RiddleModal riddle={riddle} onAnswer={answerRiddle} onClose={() => setRiddle(null)}
        gain={gameMode === "tour" ? TOUR_MODES[difficulty].points * 2 : MODES[difficulty].points * 2} reduced={prefersReduced} />}
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
// The shared "desk" backdrop for every screen where Uncle Jonah appears — his
// intro, the meet screen, the homecoming quiz and the final roll. It's the same
// flat-lay the traveler picker uses: aged map paper on a wooden desk, ringed by a
// passport, stamps, a compass and a few leaves.
//
// The art's props crowd the edges, so the content sits in the blank tan middle:
// the horizontal inset is the generous one (the passport and compass eat into the
// left and right), and it's expressed in vw so the margin scales with the picture
// rather than drifting over the props on a small screen.
function DeskBoard({ children, maxWidth = 1180, pad }) {
  return (
    <div style={{ position: "relative", minHeight: "min(90vh, 820px)", width: "100%", maxWidth, margin: "0 auto",
      backgroundImage: `url("${UI}main-screen-bg.jpg")`, backgroundSize: "cover", backgroundPosition: "center",
      borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 26px rgba(0,0,0,0.32)" }}>
      <div style={{ position: "relative", zIndex: 2, minHeight: "inherit",
        padding: pad || "clamp(16px, 3.2vw, 40px) clamp(24px, 6.5vw, 92px) clamp(18px, 3vw, 40px)" }}>
        {children}
      </div>
    </div>
  );
}

function Frame({ children, desk = false }) {
  return (
    <div style={{ minHeight: "100%", position: "relative", padding: 18, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <style>{`
        /* ---- Keyboard focus, everywhere ------------------------------------
           A visible focus state is a hard requirement (rule 4), and the browser
           default is a 1px hairline that vanishes against this game's painted
           backgrounds.

           This ring is TWO bands, and it has to be. The gold ring this used to be
           was picked against the dark chrome, where it's excellent — but most of
           this game's buttons sit on cream paper, and gold on cream measures
           1.77:1 where WCAG 2.2 SC 1.4.11 wants 3:1 for a focus indicator. Ink is
           the exact mirror: 13:1 on paper, 1.3:1 on the wood. No single colour
           clears 3:1 on both, so the ring carries one of each and whichever band
           the background swallows, the other one shows.

             gold inner band  — 5.7:1 on wood, 4.4:1 on the teal header
             ink outer band   — 13:1 on cream paper, 15:1 on white

           box-shadow draws the inner band and outline the outer one, so the pair
           needs no extra element and can't be clipped apart.

           :where() so it carries ZERO specificity: the map's own, louder focus
           treatments (.sbw-pin, .sbw-cont, .sbw-country each set outline:none and
           light the shape itself instead) still win, and any future control that
           styles its own focus wins too. This is a floor, not a ceiling. */
        :where(button, a[href], input, select, textarea, summary, [role="button"]):focus-visible{
          outline: 3px solid var(--sbw-focus-outer, ${INK}); outline-offset: 3px;
          box-shadow: 0 0 0 3px var(--sbw-focus-inner, ${GOLD});
          border-radius: 6px;
        }
        /* On the dark chrome the ink band is the one that disappears, so swap it
           for white there. Both orderings clear 3:1 on their own — this is about
           the ring looking deliberate rather than muddy. The variable inherits, so
           marking the container is enough. */
        .sbw-dark{ --sbw-focus-outer: #FFFFFF; }
        /* Whole-continent highlight when hovering or keyboard-focusing a region. */
        /* Right-rail tool props lift on hover / keyboard focus. */
        .sbw-tool img{ transition: transform .14s ease, filter .14s ease; }
        .sbw-tool:hover img, .sbw-tool:focus-visible img{ transform: translateY(-3px) rotate(-1.5deg); filter: drop-shadow(0 9px 11px rgba(0,0,0,0.5)); }
        /* The tool rail props sit on the dark wood desk, so their ring takes the
           white outer band rather than the ink one (see the two-tone note above). */
        .sbw-tool:focus-visible{
          outline: 3px solid #FFFFFF; outline-offset: 3px;
          box-shadow: 0 0 0 3px ${GOLD}; border-radius: 10px;
        }
        /* Scout hint: pulse a bright white glow around the correct answer. */
        .sbw-flash-hint{ animation: sbw-hint 0.9s ease-in-out infinite; }
        @keyframes sbw-hint{ 0%,100%{ filter: drop-shadow(0 0 0.5px #fff) } 50%{ filter: drop-shadow(0 0 2.5px #fff) drop-shadow(0 0 2.5px #fff) brightness(1.25) } }
        body.sbw-no-anim .sbw-flash-hint{ animation: none; filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 2px #fff) }
        .sbw-cont{ outline: none; transition: filter .12s ease; }
        .sbw-cont path{ transition: filter .12s ease; }
        .sbw-cont:hover path,
        .sbw-cont:focus-visible path{ filter: brightness(1.12) saturate(1.1); }
        /* Thick white halo around the whole continent's OUTER edge on hover/focus. */
        .sbw-cont:hover,
        .sbw-cont:focus-visible{ filter: drop-shadow(0 0 1.4px #fff) drop-shadow(0 0 1.4px #fff) drop-shadow(0 0 1px #fff); }
        /* The selectable-country wash was 0.62, which was the right number over the
           old flat relief and the wrong one now: the hypsometric plate carries real
           information — green lowlands, brown highlands — and a 62% coral wash was
           painting over the very thing the map upgrade was for. It is 0.30 now, with
           a heavier border doing the work the fill used to.
           Colour is still never the only signal (rule 4): the border, the hover and
           focus highlights, and the country's name on hover all say "clickable"
           without depending on the wash. */
        .sbw-country{ outline: none; }
        /* Island nations that come out a pixel wide. The ring breathes so a child can
           SEE there's something to aim at, and it's a big invisible target so they
           don't have to hit the pixel. Colour is never the only signal (rule 4) — the
           motion is what says "here", and the name still appears on hover/focus. */
        .sbw-country--tiny .sbw-halo{ animation: sbw-isle 2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes sbw-isle{ 0%,100%{ transform: scale(0.82); stroke-opacity: 0.9 } 50%{ transform: scale(1.06); stroke-opacity: 0.45 } }
        body.sbw-no-anim .sbw-country--tiny .sbw-halo{ animation: none; stroke-opacity: 0.85; }
        .sbw-country--tiny:hover .sbw-halo,
        .sbw-country--tiny:focus-visible .sbw-halo{ animation: none; stroke-opacity: 1; stroke-width: 2.6px; fill-opacity: 0.28; }
        .sbw-country path, .sbw-country ellipse{ transition: fill .12s ease; }
        .sbw-country:hover path,
        .sbw-country:focus-visible path{ fill: rgba(240,165,0,0.42); }
        .sbw-country:hover ellipse,
        .sbw-country:focus-visible ellipse{ fill: rgba(240,165,0,0.92); }
        .sbw-pin{ outline: none; }
        .sbw-pin ellipse:nth-child(2){ transition: transform .12s ease; transform-box: fill-box; transform-origin: center; }
        .sbw-pin:hover ellipse:nth-child(2){ transform: scale(1.14); }
        /* Visible keyboard-focus state on the pin dot. */
        .sbw-pin:focus-visible ellipse:nth-child(2){ transform: scale(1.14); stroke: ${CORAL}; stroke-width: 2.5; }
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
        /* The overland hop. Same motion-path trick as the flight, but it starts and
           ends at a standstill — a bus pulls away and pulls in; it doesn't cruise
           past the destination. */
        @keyframes sbw-ride{ 0%{ offset-distance: 0% } 100%{ offset-distance: 100% } }
        /* Takeoff and landing, sold with scale: the token grows out of the airport
           over the first PLANE_SCALE_MS and shrinks onto the far one over the last.
           These percentages are COMPUTED from FLIGHT_MS / PLANE_SCALE_MS rather
           than typed — they were literals with a comment asking the next person to
           keep them in step by hand, which is a request that gets forgotten once. */
        @keyframes sbw-hop{
          0%{ transform: scale(0.14) } ${PLANE_SCALE_PCT}%{ transform: scale(1) }
          ${100 - PLANE_SCALE_PCT}%{ transform: scale(1) } 100%{ transform: scale(0.14) }
        }
        /* White shutter flash over the photo when you take a shot. */
        .sbw-flash{ position: absolute; inset: 0; background: #fff; border-radius: 4px; pointer-events: none; opacity: 0; animation: sbw-flash 0.42s ease-out; }
        @keyframes sbw-flash{ 0%{ opacity: 0 } 10%{ opacity: 0.95 } 100%{ opacity: 0 } }
        /* Polaroid eject — the print slides up and settles as it develops. */
        .sbw-polaroid{ animation: sbw-polaroid 0.6s cubic-bezier(.2,.8,.3,1.05) both; }
        @keyframes sbw-polaroid{ 0%{ transform: translateY(46px) rotate(-1.6deg) scale(0.95); opacity: 0 } 60%{ opacity: 1 } 100%{ transform: translateY(0) rotate(-1.6deg) scale(1); opacity: 1 } }
        /* Result popup pop-in. */
        /* The dog trots in from off-screen left, then settles. He is an event, so he
           arrives rather than appearing. */
        .sbw-trot{ animation: sbw-trot 0.42s cubic-bezier(.2,.8,.3,1.05); }
        @keyframes sbw-trot{ 0%{ transform: translateX(-120%) } 70%{ transform: translateX(6%) } 100%{ transform: translateX(0) } }
        .sbw-pop{ animation: sbw-pop 0.22s cubic-bezier(.2,.8,.3,1.2); }
        @keyframes sbw-pop{ 0%{ transform: scale(0.82); opacity: 0 } 100%{ transform: scale(1); opacity: 1 } }
        /* The splash's one button, breathing so a first-time player sees where to
           go. A glow that swells and fades rather than a hard blink — this is the
           first thing a child meets, and it should beckon, not nag. The button
           itself never fades below full opacity, so the label stays readable. */
        /* The glow never fully goes out — it breathes between a warm resting halo and
           a bright one. Pulsing from zero made the button look like it was switching
           on and off; a floor keeps it lit and lets the pulse read as invitation. */
        .sbw-beckon{ animation: sbw-beckon 2.2s ease-in-out infinite; }
        @keyframes sbw-beckon{
          0%,100%{ box-shadow: 0 6px 0 #A93A28, 0 8px 22px rgba(0,0,0,0.4), 0 0 22px 8px rgba(240,165,0,0.45); transform: scale(1) }
          50%{ box-shadow: 0 6px 0 #A93A28, 0 8px 22px rgba(0,0,0,0.4), 0 0 46px 20px rgba(240,165,0,0.95); transform: scale(1.05) }
        }
        /* Someone who set "reduce motion" still gets the cue, without the pulsing. */
        @media (prefers-reduced-motion: reduce){
          .sbw-beckon{ animation: none; box-shadow: 0 6px 0 #A93A28, 0 8px 22px rgba(0,0,0,0.4), 0 0 34px 14px rgba(240,165,0,0.8) }
        }
        /* The splash title, wiggling when you point at it — the only hint that it's
           worth clicking. The centring translate is repeated in every frame because
           the element is centred with it; a bare rotate would fling it off-centre. */
        .sbw-wiggle:hover, .sbw-wiggle:focus-visible{ animation: sbw-wiggle 0.5s ease-in-out infinite }
        @keyframes sbw-wiggle{
          0%,100%{ transform: translate(-50%,-50%) rotate(-1.1deg) }
          50%{ transform: translate(-50%,-50%) rotate(1.1deg) }
        }
        /* The camera bag Uncle hands you: bobbing so a child knows to take it. */
        .sbw-bob{ animation: sbw-bob 1.5s ease-in-out infinite }
        @keyframes sbw-bob{ 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-9px) } }
        /* Uncle changing expression — a cross-fade, not a cut. */
        .sbw-fade{ animation: sbw-fade 0.45s ease-out }
        @keyframes sbw-fade{ 0%{ opacity: 0.25 } 100%{ opacity: 1 } }
        @media (prefers-reduced-motion: reduce){ .sbw-wiggle:hover, .sbw-bob, .sbw-fade{ animation: none } }
        /* Photo develops like film: washed-out gray blooming into full color. */
        /* Film develops: a washed-out grey chemical bath that HOLDS for a beat,
           then blooms into full colour. It starts only once the photo has actually
           loaded (the .sbw-develop class is added on the img's onLoad) — a remote
           Wikimedia photo often finished decoding after the old mount-time animation
           had already run, so the bloom happened on an empty box and you saw nothing. */
        .sbw-develop{ animation: sbw-develop 1.9s ease-out both; }
        @keyframes sbw-develop{
          0%{ filter: brightness(2.5) saturate(0) contrast(0.6) sepia(0.55) }
          22%{ filter: brightness(2.0) saturate(0) contrast(0.68) sepia(0.5) }
          55%{ filter: brightness(1.3) saturate(0.35) contrast(0.9) sepia(0.22) }
          100%{ filter: none }
        }
        .sbw-confetti{ position: absolute; top: -4vh; opacity: 0; animation-name: sbw-confetti-fall; animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes sbw-confetti-fall{
          0%{ opacity: 1; transform: translateY(0) rotate(0deg) }
          85%{ opacity: 1 }
          100%{ opacity: 0; transform: translateY(108vh) rotate(var(--spin, 540deg)) }
        }
        /* Print: the passport doubles as a homeschool record. Hide the chrome,
           keep the colors, and don't split a sticker across two pages. */
        @media print {
          .sbw-noprint { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        /* Animations off (in-game ✨ toggle; defaults to the OS reduce-motion
           preference but can be overridden either way). */
        body.sbw-no-anim .sbw-ping{ animation: none }
        body.sbw-no-anim .sbw-plane-group{ display: none }
        body.sbw-no-anim .sbw-flash{ animation: none; opacity: 0 }
        body.sbw-no-anim .sbw-pop, body.sbw-no-anim .sbw-trot{ animation: none }
        body.sbw-no-anim .sbw-polaroid{ animation: none }
        body.sbw-no-anim .sbw-develop{ animation: none }
        body.sbw-no-anim .sbw-confetti{ animation: none; opacity: 0 }
      `}</style>
      {desk ? (
        // Play screen: an illustrated desk — wood-grain surface (photo texture over
        // a warm gradient fallback) with the atlas, letter, and tools laid on top.
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `radial-gradient(120% 120% at 50% 0%, #6b4423 0%, #4a2e18 60%, #2f1d0f 100%)`,
          backgroundImage: `radial-gradient(120% 120% at 50% -10%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%), url("${UI}desk-wood-texture.png")`,
          backgroundSize: "cover, cover", backgroundPosition: "center, center" }} />
      ) : (
        <SepiaMapBackground />
      )}
      {desk ? (
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1360, margin: "0 auto" }}>
          {children}
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", background: PAPER, borderRadius: 14, padding: 22, border: `1px solid ${PAPER_LINE}`,
          boxShadow: "0 12px 34px rgba(74,50,20,0.32)",
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${PAPER_LINE}55 27px, ${PAPER_LINE}55 28px)` }}>
          {children}
        </div>
      )}
    </div>
  );
}
// Big obvious success/failure popup that pauses play until the player clicks on.
// Pick readable text (ink or white) for a colored pill background.
const textOn = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150 ? INK : "#fff";
};
// Little colored pill naming a subject's category (🌋 Volcano, 💦 Waterfall…).
function CategoryBadge({ category, size = "md", style }) {
  const c = CATEGORIES[category];
  if (!c) return null;
  const sm = size === "sm";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.color, color: textOn(c.color),
      fontWeight: 800, fontSize: sm ? 11 : 13, lineHeight: 1.3, letterSpacing: "0.02em",
      padding: sm ? "3px 9px" : "4px 12px", borderRadius: 20, whiteSpace: "nowrap", ...style }}>
      <span aria-hidden="true" style={{ fontSize: sm ? 16 : 19 }}>{c.emoji}</span>{c.name}
    </span>
  );
}
// Grand Tour itinerary: the editor's checklist of targets. Ticks off as you file
// each one; targets on the continent you're standing on are flagged "here now".
// The route you committed to, on screen for the whole trip — because you're being
// scored against it, and a plan you can't see is a plan you can't fly. The stop
// you're due at next is marked in words as well as color (rule 3): a child who
// can't tell teal from gray still needs to know where they're supposed to be.
function RouteStrip({ plan, reqs, here }) {
  const nextStop = plan.order.find((c) => reqs.some((r) => !r.done && r.continent === c));
  return (
    <div style={{ background: PAPER, border: `1px dashed ${OCEAN}`, borderRadius: 6, padding: "10px 14px", marginTop: 10 }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: OCEAN, marginBottom: 7 }}>
        ✈ THE ROUTE YOU COMMITTED TO
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {plan.order.map((c, i) => {
          const done = !reqs.some((r) => !r.done && r.continent === c);
          const next = c === nextStop;
          return (
            <li key={c} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5,
              fontWeight: next ? 800 : 600, color: done ? GREEN : next ? OCEAN : INK, opacity: done || next ? 1 : 0.6 }}>
              {i > 0 && <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>}
              <span>{done ? "✓ " : ""}{c}{next ? " (next)" : ""}</span>
            </li>
          );
        })}
      </ol>
      <div style={{ fontSize: 11.5, color: INK, opacity: 0.7, marginTop: 7, lineHeight: 1.45 }}>
        Par {plan.par.cost} days · you planned {routeCost(plan.order)}
        {plan.deviations > 0 && ` · ${plan.deviations} detour${plan.deviations === 1 ? "" : "s"} off the route, ${plan.deviations * DEVIATION_COST} day${plan.deviations * DEVIATION_COST === 1 ? "" : "s"} lost`}
      </div>
    </div>
  );
}

function Itinerary({ reqs, here }) {
  const doneN = reqs.filter((r) => r.done).length;
  return (
    <div style={{ background: PAPER, border: `1px dashed ${CORAL}`, borderRadius: 6, padding: "14px 16px" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: CORAL, marginBottom: 10 }}>✎ THE EDITOR'S ITINERARY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {reqs.map((r) => {
          const onHere = here && r.continent === here && !r.done;
          return (
            <div key={r.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, lineHeight: 1.35, color: INK, opacity: r.done ? 0.5 : 1 }}>
              <span aria-hidden="true" style={{ fontSize: 19 }}>{r.done ? "✅" : onHere ? "📸" : "⬜"}</span>
              <span>
                <span style={{ fontWeight: 700, textDecoration: r.done ? "line-through" : "none" }}>{r.label}</span>
                {onHere && <span style={{ color: CORAL, fontWeight: 800 }}> — here now!</span>}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: INK, opacity: 0.7, lineHeight: 1.4 }}>
        {doneN}/{reqs.length} filed · fly between continents; group nearby targets to save days.
      </div>
    </div>
  );
}
// Right-rail tool prop (passport / photo album / field guide). The PNG is the
// tactile object; the label under it is live text. Functional button, so it
// carries a real aria-label and a visible focus/hover lift.
// `disabled` truly blocks the button (busy). `dim` greys it but keeps it clickable —
// used for a tool that doesn't apply to this mode, whose tap opens an explanation
// rather than the tool. A dimmed image plus its "not used in this mode" label carry
// the state without relying on colour alone (rule 4).
function ToolButton({ img, label, onClick, disabled, dim }) {
  const faded = disabled || dim;
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="sbw-tool"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent",
        border: "none", padding: 0, cursor: disabled ? "default" : "pointer", opacity: faded ? 0.4 : 1, width: "100%" }}>
      <img src={`${UI}${img}`} alt="" style={{ width: "100%", maxWidth: 200, display: "block",
        filter: dim ? "grayscale(1) drop-shadow(0 5px 7px rgba(0,0,0,0.45))" : "drop-shadow(0 5px 7px rgba(0,0,0,0.45))" }} />
    </button>
  );
}
// The four-step journey tracker (Continent → Country → Destination → Photograph).
// Purely reflects `phase` progress; the icons are art, the labels/numbers live.
const PHASE_STEPS = [
  { key: "continent", label: "Continent", hint: "Pick the correct continent.", icon: "itinerary-continent.png" },
  { key: "country", label: "Country", hint: "Find the right country.", icon: "itinerary-country.png" },
  { key: "destination", label: "Destination", hint: "Narrow it down.", icon: "itinerary-destination.png" },
  { key: "photograph", label: "Photograph", hint: "Take the perfect shot!", icon: "itinerary-photograph.png" },
];
function PhaseTracker({ stepIdx, onCurio, continentName, countryName, onCountryInfo }) {
  return (
    <ol style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
      {PHASE_STEPS.map((s, i) => {
        const active = i === stepIdx, done = i < stepIdx;
        // Once a step is completed, its sub-line stops nagging ("Pick the correct
        // continent") and simply names the place chosen — the continent you flew to,
        // the country you found.
        let hint = s.hint;
        if (s.key === "continent" && done && continentName) hint = continentName;
        if (s.key === "country" && done && countryName) hint = countryName;
        // Once the right country is located, its step opens that country's culture
        // card (flag, greeting, people) on click — distinct from the ⓘ, which
        // explains what a country IS.
        const infoable = s.key === "country" && done && !!countryName && !!onCountryInfo;
        const LabelTag = infoable ? "button" : "span";
        // Each step is also a tap-to-learn card (what a continent / country /
        // destination is; how a photograph works). The ⓘ makes that discoverable
        // without competing with the step's job of showing where you are.
        return (
          <li key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
            background: active ? "#FBE7DF" : PAPER, border: `2px solid ${active ? CORAL : PAPER_LINE}`,
            opacity: done ? 0.62 : 1 }}>
            <span aria-hidden="true" style={{ flex: "0 0 auto", width: 26, height: 26, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13,
              background: active ? CORAL : done ? GREEN : "transparent", color: active || done ? "#fff" : INK,
              border: active || done ? "none" : `2px solid ${INK}` }}>{done ? "✓" : i + 1}</span>
            <img src={`${UI}${s.icon}`} alt="" style={{ width: 30, height: 30, objectFit: "contain", flex: "0 0 auto" }} />
            <LabelTag {...(infoable ? { type: "button", onClick: () => onCountryInfo(countryName), title: `About ${countryName}` } : {})}
              style={{ lineHeight: 1.2, flex: 1, minWidth: 0, textAlign: "left",
                ...(infoable ? { cursor: "pointer", background: "transparent", border: "none", padding: 0, font: "inherit" } : {}) }}>
              <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, letterSpacing: "0.04em",
                color: active ? CORAL : INK, textTransform: "uppercase" }}>{s.label}</span>
              <span style={{ display: "block", fontSize: 11.5, color: infoable ? OCEAN : INK, opacity: infoable ? 0.9 : 0.7, fontWeight: infoable ? 700 : 400 }}>
                {hint}{infoable && <span aria-hidden="true"> · tap for its card 🪪</span>}
              </span>
            </LabelTag>
            <button onClick={() => onCurio(s.key)} aria-label={`Learn: what is a ${s.label.toLowerCase()}?`}
              title={`What is a ${s.label.toLowerCase()}?`}
              style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${OCEAN}`,
                background: "rgba(30,86,102,0.08)", color: OCEAN, fontWeight: 900, fontSize: 15, lineHeight: 1, cursor: "help",
                display: "flex", alignItems: "center", justifyContent: "center" }}>ⓘ</button>
          </li>
        );
      })}
    </ol>
  );
}
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

// "That tool isn't used in this mode." Lifted out of the main component's JSX so
// it mounts and unmounts as a unit — useModalFocus runs on mount, and a hook can't
// be called from inside a `{cond && ...}` branch.
function ToolNoteModal({ note, onClose }) {
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`${note.tool} — not used in this mode`} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${GOLD}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 380, width: "100%", padding: "20px 22px", textAlign: "center" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL, marginBottom: 8 }}>{note.tool.toUpperCase()}</div>
        <p style={{ color: INK, fontSize: 14.5, lineHeight: 1.5, margin: "0 0 16px" }}>{note.why}</p>
        <button onClick={onClose} style={{ ...primaryBtn, margin: 0, background: GOLD, color: INK, boxShadow: "0 4px 0 #B87C00" }}>Got it ✈</button>
      </div>
    </div>
  );
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
// Photo Album — every shot filed on the current run, laid out in an open album.
function AlbumModal({ album, onPick, onClose }) {
  const [page, setPage] = useState(0);
  const PER = 8, spreads = Math.max(1, Math.ceil(album.length / PER));
  const slice = album.slice(page * PER, page * PER + PER);
  const thumb = (p, i) => (
    <button key={`${p.id}-${i}`} onClick={() => onPick(p)} title={`${p.subject} — ${p.city}`} aria-label={`Revisit ${p.subject}, ${p.city}`}
      style={{ background: "#fff", border: "none", borderRadius: 2, padding: "4px 4px 12px", cursor: "pointer", boxShadow: "0 3px 7px rgba(0,0,0,0.28)", transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#10262E" }}>
        <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={62} />
      </div>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 13.5, color: INK, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.flag} {p.city}</div>
    </button>
  );
  const grid = (list) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", alignContent: "start" }}>{list.map(thumb)}</div>
  );
  const footer = spreads > 1 && (
    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 14, color: "#F4ECD8" }}>
      <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page" style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(244,236,216,0.5)", color: "#F4ECD8", borderRadius: 8, width: 40, height: 34, fontSize: 18, cursor: page === 0 ? "default" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>‹</button>
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, minWidth: 110, textAlign: "center" }}>Page {page + 1} of {spreads}</span>
      <button onClick={() => setPage((p) => Math.min(spreads - 1, p + 1))} disabled={page >= spreads - 1} aria-label="Next page" style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(244,236,216,0.5)", color: "#F4ECD8", borderRadius: 8, width: 40, height: 34, fontSize: 18, cursor: page >= spreads - 1 ? "default" : "pointer", opacity: page >= spreads - 1 ? 0.4 : 1 }}>›</button>
    </div>
  );
  return (
    <OpenBook img="photo-album-open-blank.png" label="Photo album" onClose={onClose} footer={footer}
      left={<>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL, fontWeight: 800, marginBottom: 8 }}>📷 PHOTO ALBUM</div>
        {album.length ? grid(slice.slice(0, 4)) : <div style={{ fontSize: 13, color: INK, opacity: 0.7 }}>No photos yet — take your first shot to start the album!</div>}
      </>}
      right={<div style={{ paddingTop: 24 }}>{grid(slice.slice(4))}</div>} />
  );
}
// Field Guide — spends the research half-day (once per assignment) and reveals
// Jonah's clue tip; re-opening later just re-reads it, no extra time lost.
// The splash's how-to-play card, opened by clicking the title. Deliberately short:
// a child who wants to play should not have to read a manual, and everything here
// is re-taught in context by Uncle, Mr O and the step rail. It exists so a parent
// (or a kid who clicked the shiny title) can see the shape of the game in ten
// seconds and get out.
function HowToPlayModal({ onClose }) {
  const STEPS = [
    ["itinerary-continent.png", "Read the editor's clue", "Jonah's note tells you about a place — but not its name. Work out where in the world it is."],
    ["itinerary-country.png", "Fly there", "Pick the continent, then the country. Every flight costs travel days, so guessing wildly is expensive."],
    ["itinerary-photograph.png", "Take the photograph", "Find the right subject and shoot it. Every correct shot teaches you something true about a real place."],
    ["passport.png", "Fill your passport", "Stamps, badges and keepsakes pile up across every trip. The more you travel, the more of the world you keep."],
  ];
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="How to play" onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ ...CARD_SURFACE, borderRadius: 16, border: `3px solid ${OCEAN}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)",
          maxWidth: 560, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "22px 24px" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: OCEAN, fontWeight: 700 }}>HOW TO PLAY</div>
        <h2 style={{ margin: "4px 0 14px", color: INK, fontSize: 24, fontWeight: 900 }}>You're a travelling photographer.</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {STEPS.map(([img, title, body], i) => (
            <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left" }}>
              <img src={`${UI}${img}`} alt="" aria-hidden="true" style={{ width: 42, height: 42, objectFit: "contain", flex: "0 0 auto", marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>{i + 1}. {title}</div>
                <div style={{ color: INK, opacity: 0.85, fontSize: 13.5, lineHeight: 1.45 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 13, color: INK, opacity: 0.8, lineHeight: 1.5, textAlign: "left" }}>
          Pick a difficulty to match the traveller: <b>Scout</b> reads the clues aloud and names the country;
          <b> Expert</b> tells you nothing but the place itself.
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button onClick={onClose} style={{ ...primaryBtn, margin: 0 }}>Got it ✈</button>
        </div>
      </div>
    </div>
  );
}

function FieldGuideModal({ note, spent, onClose }) {
  const line = spent ? "You spend half a travel day poring over the field guide." : "You open the field guide again — no travel time lost.";
  return (
    <OpenBook img="field-guide-open-blank.png" label="Field guide" onClose={onClose}
      left={<>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: GREEN, fontWeight: 800, marginBottom: 10 }}>📗 FIELD GUIDE</div>
        <p style={{ margin: "0 0 10px", color: INK, opacity: 0.9, fontFamily: HAND, fontSize: 18, lineHeight: 1.35 }}>{line} It yields:</p>
      </>}
      right={<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
        <div style={{ color: INK, fontFamily: HAND, fontSize: 19, lineHeight: 1.4 }}>{note || "Nothing new this time — read Jonah's note and trust your map sense!"}</div>
      </div>} />
  );
}
// The passport as an openable booklet popup: page 0 is the identity/profile
// spread (avatar in the photo frame + traveler stats); pages 1..N are the
// accomplishment spreads (country stamps + keepsakes), paged with arrows.
function PassportModal({ profile, onClose }) {
  const [page, setPage] = useState(0);
  const ref = useRef(null);
  useModalFocus(ref, onClose);   // Escape now lives in the hook, with the trap
  useEffect(() => {
    const onKey = (e) => { if (e.key === "ArrowRight") setPage((p) => p + 1); if (e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1)); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const pp = profile ? passportData(profile) : null;
  const rank = profile ? careerRank(profile) : null;
  const earned = profile ? achievements(profile).filter((b) => b.earned) : [];
  const stamps = pp ? pp.countries.filter((c) => c.mastered) : [];
  const items = [
    ...stamps.map((c) => ({ kind: "stamp", icon: COUNTRY_FLAG[c.country] || "🏳️", label: c.country })),
    ...earned.map((b) => ({ kind: "keepsake", icon: b.emoji, art: b.art, label: b.name })),
  ];
  const PER = 12; // items per two-page spread (6 a page)
  const spreads = Math.max(1, Math.ceil(items.length / PER));
  // page 0 = profile, page 1 = PROGRESS, 2..(spreads+1) = accomplishments.
  // Progress sits second on purpose: it's the page a parent opens the passport FOR,
  // and burying it behind the stamp spreads would make it the page nobody finds.
  const PROGRESS_PAGE = 1;
  const lastPage = spreads + 1;
  const isProfile = page === 0;
  const isProgress = page === PROGRESS_PAGE;
  const bookImg = isProfile ? "passport-open-profile-blank.png" : "passport-open-pages-blank.png";
  const spreadItems = (isProfile || isProgress) ? [] : items.slice((page - 2) * PER, (page - 1) * PER);
  const leftItems = spreadItems.slice(0, PER / 2), rightItems = spreadItems.slice(PER / 2);
  const byCont = profile ? progressByContinent(profile) : [];
  const trouble = profile ? troubleSpots(profile, 6) : [];
  const bestPairs = profile ? Object.entries(profile.best || {}).filter(([, v]) => typeof v === "number") : [];
  // A country stamp shows its flag emoji; an earned keepsake shows its badge art
  // where that badge has been drawn (ArtBadge falls back to `icon` if not).
  const Cell = ({ it }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
      <ArtBadge art={it.art} emoji={it.icon} size={26} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
    </div>
  );
  const pageCol = (list) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, overflow: "hidden" }}>
      {list.map((it, i) => <Cell key={i} it={it} />)}
    </div>
  );
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Passport" onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.66)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, zIndex: 56 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "min(880px, 94vw)", aspectRatio: "3 / 2",
          backgroundImage: `url("${UI}${bookImg}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
          filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.5))" }}>
        <button onClick={onClose} aria-label="Close passport" title="Close"
          style={{ position: "absolute", top: "2%", right: "4%", background: "rgba(16,38,46,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 18, lineHeight: 1, cursor: "pointer", zIndex: 3 }}>×</button>
        {!profile ? (
          <div style={{ position: "absolute", left: "54%", top: "34%", width: "34%", textAlign: "center", color: INK }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>No traveler yet</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>Create a traveler to earn a passport of stamps and keepsakes.</div>
          </div>
        ) : isProfile ? (
          <>
            {/* Avatar in the photo frame (left page) */}
            <div style={{ position: "absolute", left: "20.5%", top: "20%", width: "22.5%", aspectRatio: "1 / 1",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Avatar spec={avatarFor(profile)} size={150} />
            </div>
            {/* Identity details (right page) */}
            <div style={{ position: "absolute", left: "53%", top: "17%", width: "37%", color: INK, textAlign: "left" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: OCEAN, opacity: 0.8 }}>TRAVELER</div>
              <div style={{ fontWeight: 900, fontSize: 24, lineHeight: 1.1, color: INK, overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 14, color: CORAL, marginTop: 3 }}>
                <ArtBadge art={RANK_ART[rank.tier]} emoji="★" size={30} /> {rank.title}
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 12.5 }}>
                <div><b style={{ fontSize: 18 }}>{pp.masteredCount}</b><span style={{ opacity: 0.7 }}>/{pp.totalCountries}</span><div style={{ opacity: 0.7, fontSize: 11 }}>stamps</div></div>
                <div><b style={{ fontSize: 18 }}>{rank.have}</b><div style={{ opacity: 0.7, fontSize: 11 }}>places shot</div></div>
                <div><b style={{ fontSize: 18 }}>{profile.games || 0}</b><div style={{ opacity: 0.7, fontSize: 11 }}>trips filed</div></div>
                <div><b style={{ fontSize: 18 }}>{earned.length}</b><div style={{ opacity: 0.7, fontSize: 11 }}>keepsakes</div></div>
              </div>
              {bestPairs.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11.5, opacity: 0.85, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <ArtBadge art={RECORD_ART.bestScore} emoji="🏆" size={34} style={{ marginTop: 1 }} />
                  <div>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.14em", color: OCEAN, marginBottom: 3 }}>BEST SCORES</div>
                    {bestPairs.slice(0, 4).map(([k, v]) => <div key={k} style={{ textTransform: "capitalize" }}>{k}: <b>{v}</b></div>)}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : isProgress ? (
          <>
            {/* LEFT: how much of each continent has actually been photographed, at
                PLACE level. The country-level number flatters a big country — one
                photo in Brazil marks it "mastered" while 90% of South America is
                unseen — and "14 of 34 places" is the number you can teach from. */}
            <div style={{ position: "absolute", left: "15.5%", top: "13%", width: "27%", bottom: "14%", color: INK }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: OCEAN, fontWeight: 700, marginBottom: 8 }}>🌍 HOW THE WORLD IS GOING</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {byCont.map((c) => {
                  const pct = c.total ? c.mastered / c.total : 0;
                  return (
                    <div key={c.continent}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, marginBottom: 2 }}>
                        <span>{c.continent}</span>
                        <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.85 }}>{c.mastered}/{c.total}</span>
                      </div>
                      {/* The bar is paired with its own number, never colour alone. */}
                      <div style={{ height: 7, background: "rgba(16,38,46,0.13)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round(pct * 100)}%`, height: "100%", background: pct >= 0.99 ? GREEN : GOLD, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* RIGHT: the places he's been given and never yet got right. This is the
                same signal the spaced-repetition weighting already uses to resurface
                a place (its highest weight) — it just wasn't visible to anyone. */}
            <div style={{ position: "absolute", right: "15.5%", top: "13%", width: "27%", bottom: "14%", color: INK, overflow: "hidden" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: CORAL, fontWeight: 700, marginBottom: 8 }}>🔁 WORTH ANOTHER LOOK</div>
              {trouble.length === 0 ? (
                <div style={{ fontSize: 12.5, opacity: 0.75, lineHeight: 1.5 }}>
                  Nothing outstanding — every place {profile.name} has been given, {profile.name} has photographed.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* Two lines per entry rather than one. A subject like "the Inca
                      citadel of Machu Picchu" plus its country plus the count does not
                      fit one line of a passport page, and squeezing it produced an
                      ellipsis exactly where the useful word was. */}
                  {trouble.map((t) => (
                    <div key={t.id} style={{ fontSize: 11.5, lineHeight: 1.3 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span aria-hidden="true">{t.flag}</span>
                        <span style={{ fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, opacity: 0.75, paddingLeft: 18 }}>
                        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.country}</span>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: CORAL, fontWeight: 700, whiteSpace: "nowrap" }}>missed {t.misses}×</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 14%, not 11%: the book art's printed page starts inside its cover, and
                at 11% the first column of flags sat on the spine and the heading ran
                off the left edge of the paper. */}
            <div style={{ position: "absolute", left: "15.5%", top: "13%", width: "27%", bottom: "14%" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: OCEAN, fontWeight: 700, marginBottom: 8 }}>📖 STAMPS & KEEPSAKES</div>
              {pageCol(leftItems)}
            </div>
            <div style={{ position: "absolute", right: "15.5%", top: "13%", width: "27%", bottom: "14%" }}>
              <div style={{ height: 18, marginBottom: 8 }} />
              {pageCol(rightItems)}
              {spreadItems.length === 0 && <div style={{ fontSize: 13, color: INK, opacity: 0.7 }}>No stamps yet — photograph places to fill your passport!</div>}
            </div>
          </>
        )}
      </div>
      {/* Pager */}
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 14, color: "#F4ECD8" }}>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page"
          style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(244,236,216,0.5)", color: "#F4ECD8", borderRadius: 8, width: 40, height: 34, fontSize: 18, cursor: page === 0 ? "default" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>‹</button>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, minWidth: 150, textAlign: "center" }}>
          {isProfile ? "Profile" : isProgress ? "Progress" : `Page ${page - 1} of ${spreads}`}
        </span>
        <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage} aria-label="Next page"
          style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(244,236,216,0.5)", color: "#F4ECD8", borderRadius: 8, width: 40, height: 34, fontSize: 18, cursor: page >= lastPage ? "default" : "pointer", opacity: page >= lastPage ? 0.4 : 1 }}>›</button>
      </div>
      {profile && <PassportBackup profile={profile} />}
    </div>
  );
}

// ---- Keeping a passport safe --------------------------------------------------
// All the progress lives in one localStorage key, so clearing site data — or a new
// laptop, or Safari deciding to evict storage it hasn't seen used lately — takes
// months of it with no warning. With no backend and no accounts, a file the family
// keeps somewhere is the only restore there is. Both halves sit under the passport
// because that's where a parent goes looking for "the record".
function PassportBackup({ profile }) {
  const [note, setNote] = useState(null);
  const fileRef = useRef(null);
  const save = () => {
    const at = Date.now();
    const data = exportPassport(profile.name, at);
    if (!data) { setNote({ bad: true, text: "Couldn't read that traveler." }); return; }
    // Object URL rather than a data: URI — a long passport exceeds what some
    // browsers will accept in a data: URL, and it fails silently when it does.
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = passportFilename(profile.name, at);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNote({ bad: false, text: `Saved ${passportFilename(profile.name, at)}` });
  };
  const load = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = ""; // so picking the same file twice still fires onChange
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const res = importPassportText(String(r.result));
      setNote(res.ok
        ? { bad: false, text: `Loaded "${res.name}" — pick them on the travelers screen.` }
        : { bad: true, text: res.error });
    };
    r.onerror = () => setNote({ bad: true, text: "Couldn't read that file." });
    r.readAsText(f);
  };
  const btn = {
    background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(244,236,216,0.5)", color: "#F4ECD8",
    borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
  };
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, marginTop: 4 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={save} style={btn} title="Save this passport to a file you can keep">⬇ Save a copy</button>
        <button onClick={() => fileRef.current?.click()} style={btn} title="Load a passport from a file">⬆ Restore from a file</button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={load}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} tabIndex={-1} aria-hidden="true" />
      </div>
      {note && (
        <p role="status" style={{ margin: 0, fontSize: 12, fontWeight: 700, maxWidth: 460, textAlign: "center", lineHeight: 1.4,
          color: note.bad ? "#F6B0A0" : "#BFE6CB" }}>{note.text}</p>
      )}
    </div>
  );
}
// Grand Tour "getting there" chooser (Adventurer/Expert travel modes): pick a hub
// airport to fly into, then a last-leg transport, trading time against money — with
// each cost shown in dollars and the local currency. Real budgeting practice.
function TravelChooser({ choice, money, onConfirm, onCancel }) {
  const { cont, from, target, hubs, baseDays } = choice;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const hubList = hubs
    .map((h) => ({ ...h, d: dist(from, h), flightUsd: Math.max(20, Math.round(dist(from, h) * 3 / 10) * 10) }))
    .sort((a, b) => a.d - b.d);
  const [hub, setHub] = useState(hubList[0]);
  const [tid, setTid] = useState(null);
  const ref = useRef(null);
  useModalFocus(ref, onCancel);   // Escape == Cancel: this is a choice, not a gate
  const destCountry = target ? target.country : hub.country;
  const legDeg = target ? dist(hub, target) : 8;
  const options = transportOptionsFor(target || { category: "cityscape", country: hub.country, tags: [] }, legDeg);
  const transport = options.find((o) => o.id === tid) || options[0];
  const totalUsd = hub.flightUsd + (transport ? transport.usd : 0);
  const totalDays = Math.round((baseDays + (transport ? transport.days : 0)) * 10) / 10;
  const broke = totalUsd > money;
  const pill = (on) => ({ textAlign: "left", padding: "9px 12px", borderRadius: 10, border: `2px solid ${on ? CORAL : PAPER_LINE}`, background: on ? "#FBE7DF" : "#fff", color: INK, cursor: "pointer", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13.5 });
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`Getting to ${cont}`}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 55 }}>
      <div style={{ background: PAPER, borderRadius: 16, border: `3px solid ${OCEAN}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 560, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "20px 22px" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.16em", color: OCEAN, fontWeight: 700 }}>✈ GETTING TO {cont.toUpperCase()}</div>
        {target && <p style={{ margin: "4px 0 2px", color: INK, fontWeight: 700 }}>Next on your list: {target.subject} <span style={{ opacity: 0.7, fontWeight: 400 }}>· {target.country}</span></p>}
        <p style={{ margin: "0 0 10px", fontSize: 13, color: INK, opacity: 0.8 }}>Wallet: <b>${money.toLocaleString("en-US")}</b> · pick a hub and a way to reach it. Faster costs more.</p>

        <div style={{ fontWeight: 800, fontSize: 13, color: OCEAN, margin: "6px 0 6px" }}>1 · Fly into which hub?</div>
        <div style={{ display: "grid", gap: 7 }}>
          {hubList.map((h) => {
            const on = h.code === hub.code;
            return (
              <button key={h.code} onClick={() => { setHub(h); setTid(null); }} aria-pressed={on} style={pill(on)}>
                <span><b>{h.name}</b> <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.7 }}>({h.code})</span> · {h.country}</span>
                <span style={{ fontWeight: 800, color: CORAL, whiteSpace: "nowrap" }}>{fmtMoney(h.flightUsd, h.country)}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontWeight: 800, fontSize: 13, color: OCEAN, margin: "14px 0 6px" }}>2 · Last leg from {hub.name}</div>
        <div style={{ display: "grid", gap: 7 }}>
          {options.map((o) => {
            const on = o.id === (transport ? transport.id : null);
            return (
              <button key={o.id} onClick={() => setTid(o.id)} aria-pressed={on} style={pill(on)}>
                {/* 46px, not the 16 the emoji used: these are drawn top-down at a
                    common length, so a train is ~6× narrower than the plane's
                    wingspan and needs the room to be anything but a thread. The
                    name carries the meaning either way. */}
                <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <ArtBadge art={TRANSPORT_ART[o.id]} emoji={o.emoji} size={46} />
                  <span><b>{o.name}</b> <span style={{ opacity: 0.65, fontSize: 12 }}>— {o.blurb}</span></span>
                </span>
                <span style={{ fontWeight: 800, color: CORAL, whiteSpace: "nowrap" }}>{o.days}d · {fmtMoney(o.usd, destCountry)}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: broke ? "#FBEAE6" : "#EAF6EF", border: `1px solid ${broke ? CORAL : GREEN}`, fontSize: 13.5, color: INK }}>
          <b>Total:</b> {totalDays} day{totalDays === 1 ? "" : "s"} · <b>{fmtMoney(totalUsd, destCountry)}</b>
          {broke && <span style={{ color: CORAL, fontWeight: 700 }}> — more than you have! You'll spend your last dollar. A cheaper way saves cash for later.</span>}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={onCancel} style={{ padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>Back</button>
          <button onClick={() => onConfirm(hub, transport, hub.flightUsd)}
            style={{ ...primaryBtn, marginTop: 0 }}>Go ✈</button>
        </div>
      </div>
    </div>
  );
}
function ResultModal({ data, onContinue, reduced }) {
  const good = data.tone === "good";
  const accent = good ? GREEN : CORAL;
  const hasPhoto = !!data.photo?.src;
  // The way forward stays greyed until the place-fact has finished typing (or there
  // was none, or it was clicked to complete), so a child reads the thing they just
  // earned instead of clicking straight past it. Reset per result — the same modal
  // instance is reused for the next one. Under reduced motion the fact appears whole
  // and onDone fires at once, so the button is live immediately.
  const [factDone, setFactDone] = useState(false);
  useEffect(() => { setFactDone(false); }, [data]);
  // escape:false — the whole point of this card is the fact on it. Letting Escape
  // dismiss it hands back the skip that `factDone` above exists to prevent.
  const ref = useRef(null);
  useModalFocus(ref, null, { escape: false });
  const ready = !data.fact || factDone;
  // With both a photo and a fact, they sit side by side (the fact reads as a
  // caption next to the shot); they stack on narrow screens via flex-wrap.
  const sideBySide = hasPhoto && !!data.fact;
  // A true polaroid: white frame with a deep bottom lip; the print ejects and the
  // image "develops" (gray → color) under a white shutter flash. The polaroid
  // FRAME is static (always shown); only the eject/develop/flash are motion.
  const photoEl = hasPhoto && (
    <div className={reduced ? undefined : "sbw-polaroid"} key={`pol-${data.photo.src}`}
      style={{ background: "#fff", padding: "9px 9px 30px", borderRadius: 3, transform: "rotate(-1.6deg)",
        boxShadow: "0 10px 22px rgba(0,0,0,0.34)", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ position: "relative", overflow: "hidden", background: "#10262E" }}>
        <DevelopImg key={`dev-${data.photo.src}`} src={withWidth(data.photo.src, 1600)} alt="" reduced={reduced}
          imgStyle={{ width: "100%", maxHeight: 400, objectFit: "contain", display: "block" }} />
        {!reduced && <div className="sbw-flash" key={`fl-${data.photo.src}`} />}
      </div>
    </div>
  );
  // The place fact, presented plainly — no Mr O here. He's reserved for his own
  // big, screen-dimming random appearance; the result card just teaches the fact
  // about the shot you just took.
  const factEl = data.fact && (
    <div style={{ background: "#fff", border: `1px dashed ${OCEAN}`, borderRadius: 10, padding: "12px 14px", textAlign: "left" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", color: OCEAN, fontWeight: 700, marginBottom: 4 }}>📌 ABOUT THIS PLACE</div>
      <TypeLine text={data.fact} reduced={reduced} onDone={() => setFactDone(true)} style={{ color: INK, fontSize: 13.5, lineHeight: 1.5 }} />
    </div>
  );
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={data.title}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      {data.cheer && <PicklesCheer kind={data.cheer} reduced={reduced} />}
      <div className={reduced ? "" : "sbw-pop"}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${accent}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: sideBySide ? 840 : 620, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "34px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden="true">{data.emoji}</div>
        <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 26, color: accent, margin: "10px 0 6px" }}>{data.title}</h2>
        {/* Extra breathing room below the "Ancient Wonder" badge so the header
            doesn't crowd the photo. */}
        {data.category && <div style={{ marginBottom: 20 }}><CategoryBadge category={data.category} /></div>}
        {sideBySide ? (
          // Photo on the left; the ABOUT box, the outcome line, and the Next button
          // all stack in a column to its right — so the whole card stays compact.
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", margin: "0 0 4px", textAlign: "left" }}>
            <div style={{ flex: "1 1 300px", minWidth: 240 }}>{photoEl}</div>
            <div style={{ flex: "1 1 240px", minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
              {factEl}
              {/* Game-mechanic text (what you shot, points) appears INSTANTLY. */}
              {data.lesson && <MissLesson text={data.lesson} />}
              <p style={{ color: INK, fontSize: 15, lineHeight: 1.5, margin: 0 }}>{data.subtitle}</p>
              {data.hint && (
                <p style={{ color: OCEAN, fontSize: 14, fontWeight: 700, lineHeight: 1.45, margin: 0 }}>
                  <span aria-hidden="true">💡 </span>{data.hint}
                </p>
              )}
              <button data-primary autoFocus={ready} onClick={onContinue} disabled={!ready} aria-disabled={!ready}
                style={{ ...primaryBtn, alignSelf: "flex-start", background: accent, boxShadow: `0 4px 0 ${good ? "#2E7A55" : "#A93A28"}`,
                  opacity: ready ? 1 : 0.45, cursor: ready ? "pointer" : "default", transition: "opacity .3s" }}>
                {data.buttonLabel}
              </button>
            </div>
          </div>
        ) : (
          <>
            {hasPhoto && <div style={{ margin: "0 auto 10px", maxWidth: 500 }}>{photoEl}</div>}
            {data.lesson && <div style={{ maxWidth: 380, margin: "0 auto 12px" }}><MissLesson text={data.lesson} /></div>}
            <p style={{ color: INK, fontSize: 15, lineHeight: 1.5, margin: "0 auto", maxWidth: 340 }}>{data.subtitle}</p>
            {data.hint && (
              <p style={{ color: OCEAN, fontSize: 14, fontWeight: 700, lineHeight: 1.45, margin: "10px auto 0", maxWidth: 340 }}>
                <span aria-hidden="true">💡 </span>{data.hint}
              </p>
            )}
            {/* Fact with no photo (e.g. the out-of-days screen) still shows below. */}
            {factEl && <div style={{ marginTop: 14 }}>{factEl}</div>}
            <button data-primary autoFocus={ready} onClick={onContinue} disabled={!ready} aria-disabled={!ready}
              style={{ ...primaryBtn, marginTop: 20, background: accent, boxShadow: `0 4px 0 ${good ? "#2E7A55" : "#A93A28"}`,
                opacity: ready ? 1 : 0.45, cursor: ready ? "pointer" : "default", transition: "opacity .3s" }}>
              {data.buttonLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
// Big popup for an album photo: the full-size shot plus everything the player
// learned about that landmark. Opened by tapping a thumbnail in the album strip.
function LandmarkModal({ p, onClose, reduced }) {
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={p.subject} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}>
      {/* Photo on the LEFT, everything learned about the place stacked to its RIGHT,
          so the whole card fits without a vertical scroll — the details used to run
          off the bottom of the box in one tall column. The two halves wrap to a
          stack only on a genuinely narrow (phone) screen. */}
      <div className={reduced ? "" : "sbw-pop"} onClick={(e) => e.stopPropagation()}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${GOLD}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 820, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "22px 24px", position: "relative" }}>
        <button onClick={onClose} aria-label="Close" autoFocus
          style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 22, lineHeight: 1, cursor: "pointer", color: INK, opacity: 0.6, zIndex: 1 }}>×</button>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Left: the shot + its credit */}
          <div style={{ flex: "1 1 300px", minWidth: 240 }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL, marginBottom: 8 }}>FROM YOUR ALBUM</div>
            <div style={{ borderRadius: 8, overflow: "hidden", border: `2px solid ${GOLD}` }}>
              <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={240} full />
            </div>
            <PhotoCredit photo={p.photo} style={{ textAlign: "left", marginTop: 6 }} />
          </div>
          {/* Right: title, place, badges, greeting, fact */}
          <div style={{ flex: "1 1 280px", minWidth: 240, textAlign: "left" }}>
            <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 24, color: INK, margin: "22px 0 2px" }}>{p.subject}</h2>
            <div style={{ fontWeight: 700, color: INK }}><span style={{ fontSize: "2.4em", verticalAlign: "-0.22em" }}>{p.flag}</span> {p.city}, {p.country}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {p.category && <CategoryBadge category={p.category} />}
              {p.continent && <span style={{ fontSize: 12, color: INK, opacity: 0.6 }}>{p.continent}</span>}
            </div>
            {p.greeting?.text && (
              <div style={{ fontSize: 14, color: OCEAN, marginTop: 10 }}>
                <span aria-hidden="true">💬 </span>Local greeting: “{p.greeting.text}”
                {p.greeting.language ? ` — ${p.greeting.language}` : ""}
                {p.greeting.pronunciation ? ` (${p.greeting.pronunciation})` : ""}
                {greetingMeaning(p.greeting) ? `, ${quoteGloss(p.greeting && greetingMeaning(p.greeting))}` : ""}
                <SpeakButton greeting={p.greeting} />
              </div>
            )}
            {p.fact && (
              <div style={{ marginTop: 14, background: "#fff", border: `1px dashed ${GOLD}`, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: CORAL, marginBottom: 4 }}>📖 DID YOU KNOW?</div>
                <div style={{ color: INK, fontSize: 13, lineHeight: 1.45 }}>{p.fact}</div>
              </div>
            )}
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 18, background: GOLD, color: INK, boxShadow: "0 4px 0 #B87C00" }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
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

// "Create New Traveler" — name the traveler, design their avatar, and set off,
// all from one popup. onCreate(name, spec) saves the profile (returns false if
// the name is blank or taken); onBegin() launches straight into the adventure.
function CreateTravelerModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const ref = useRef(null);
  useModalFocus(ref, onClose);
  const [spec, setSpec] = useState(() => defaultAvatar(String(Math.random())));
  const bump = (key, n, dir) => setSpec((sp) => ({ ...sp, [key]: (((sp[key] || 0) + dir) % n + n) % n }));
  const roll = () => setSpec({
    skin: Math.floor(Math.random() * AVATAR_SKIN.length), hair: Math.floor(Math.random() * AVATAR_HAIR.length),
    hairColor: Math.floor(Math.random() * AVATAR_HAIRC.length), glasses: Math.floor(Math.random() * AVATAR_GLASSES.length),
    hat: Math.floor(Math.random() * AVATAR_HAT.length), shirt: Math.floor(Math.random() * AVATAR_SHIRT.length),
  });
  const arrow = (label, onClick) => (
    <button onClick={onClick} aria-label={label}
      style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
      {label.startsWith("Previous") ? "◀" : "▶"}
    </button>
  );
  const begin = () => {
    if (!name.trim()) { setErr("Give your traveler a name first."); return; }
    const ok = onSubmit(name.trim(), spec);
    if (!ok) { setErr("That name is taken — pick another."); return; }
  };
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Create a new traveler"
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }}>
      <div className="sbw-pop" style={{ background: PAPER, borderRadius: 12, padding: 20, width: "min(92vw, 380px)", maxHeight: "92vh", overflowY: "auto", textAlign: "center", border: `1px solid ${PAPER_LINE}` }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL }}>🧳 CREATE NEW TRAVELER</div>
        <div style={{ margin: "12px 0 4px" }}><Avatar spec={spec} size={104} title="Your new traveler" /></div>
        <div style={{ margin: "6px 0 8px", textAlign: "left" }}>
          <label htmlFor="sbw-newname" style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.14em", color: INK, opacity: 0.6 }}>NAME</label>
          <input id="sbw-newname" value={name} maxLength={20} autoFocus placeholder="Traveler's name"
            onChange={(e) => { setName(e.target.value); setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); begin(); } }}
            style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 4, padding: "9px 11px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, fontSize: 15, background: "#fff", color: INK }} />
          {err && <p role="alert" style={{ color: CORAL, fontSize: 12, fontWeight: 700, margin: "5px 0 0" }}>{err}</p>}
        </div>
        {AVATAR_DIMS.map((d) => (
          <div key={d.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 0", borderTop: `1px solid ${PAPER_LINE}` }}>
            <span style={{ fontWeight: 700, color: INK, fontSize: 13, width: 86, textAlign: "left" }}>{d.label}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {arrow(`Previous ${d.label.toLowerCase()}`, () => bump(d.key, d.n, -1))}
              <span style={{ width: 58, fontSize: 12, color: INK, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                {d.swatch && <span aria-hidden="true" style={{ width: 15, height: 15, borderRadius: "50%", background: d.swatch(((spec[d.key] || 0) % d.n + d.n) % d.n), border: `1px solid ${INK}` }} />}
                {d.name ? d.name(((spec[d.key] || 0) % d.n + d.n) % d.n) : `${((spec[d.key] || 0) % d.n + d.n) % d.n + 1}/${d.n}`}
              </span>
              {arrow(`Next ${d.label.toLowerCase()}`, () => bump(d.key, d.n, 1))}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={roll} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>🎲 Surprise me</button>
          <button onClick={onClose} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        </div>
        <button onClick={begin} style={{ ...primaryBtn, marginTop: 14, width: "100%" }}>Begin your adventure ✈</button>
      </div>
    </div>
  );
}

// The culture card's photo of people in traditional dress. It renders in a fixed
// landscape frame (16:9) so a portrait source can never push the rest of the card
// off-screen. Sources are landscape wherever one could be found; `object-position`
// biases the crop upward so faces survive on the few that aren't.
// Countries with several peoples carry several cards (see COUNTRY_PEOPLE). ONE of
// them is picked at random per arrival and that's what you meet — there's no
// stepping through the set. The card is a moment on the way to a photograph, not a
// gallery to work through, and a "1 of 3" counter invites a child to clear all
// three before moving on. Coming back to a country still shows someone new, which
// was the point of having several; it just happens by chance rather than by chore.
function PeoplePhoto({ country }) {
  const cards = peopleCards(country);
  // Chosen once per mount. The card is remounted per country (key={country}), so a
  // new arrival re-rolls, while a re-render of the same card keeps the same face.
  const [i] = useState(() => Math.floor(Math.random() * Math.max(1, cards.length)));
  // Is the caption/credit panel showing? Hover reveals it; the ⓘ button latches it
  // open for anyone who can't hover. See the note on the frame below.
  const [creditOpen, setCreditOpen] = useState(false);
  if (!cards.length) return null;
  const people = cards[Math.min(i, cards.length - 1)];
  return (
    <figure style={{ margin: "10px 0 0", textAlign: "left" }}>
      {/* Fixed landscape frame, so a culture card can never push the page into a
          scroll. Landscape sources fill it (cropped a little, biased upward to keep
          faces). The handful of countries whose only acceptable freely-licensed
          photo is portrait carry `portrait: true` and are shown WHOLE inside the
          frame — cropping a full-body shot to 16:9 would cut away the very dress
          the card exists to teach.

          NOT loading="lazy": the image sits inside this overflow:hidden frame, and a
          lazy image clipped by its container never intersects the viewport, so it
          never loads — the card showed an empty gray box. It's one image, and the
          player has already flown here, so eager is right anyway.

          The caption and credit used to sit under the photo as a permanent line of
          small print; they now live ON the photo and appear when you point at it, which
          is what a caption is for and keeps the card down to the things a child is
          meant to read.

          They are NOT hover-only, though, and that isn't fussiness: nearly every one
          of these photos is CC BY or CC BY-SA, where naming the photographer is a
          condition of the licence, not a courtesy — and this game's main device is an
          iPad, which has no hover at all. Hover alone would quietly drop attribution
          on the platform it's mostly played on. So the ⓘ is a real button: it shows
          on every device, opens the same panel on tap or keyboard focus, and the
          panel credits the photographer with a link to the source. */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 4, overflow: "hidden", background: "#DCE9EC" }}
        onMouseEnter={() => setCreditOpen(true)} onMouseLeave={() => setCreditOpen(false)}>
        <img src={people.src} alt={people.caption} decoding="async"
          style={{ width: "100%", height: "100%", display: "block",
            objectFit: people.portrait ? "contain" : "cover",
            objectPosition: people.portrait ? "50% 50%" : "50% 30%" }} />
        <button onClick={() => setCreditOpen((v) => !v)} onFocus={() => setCreditOpen(true)} onBlur={() => setCreditOpen(false)}
          aria-expanded={creditOpen} aria-label={creditOpen ? "Hide photo details" : "Show photo details and credit"}
          style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%",
            border: "none", cursor: "pointer", background: "rgba(16,38,46,0.62)", color: "#fff",
            fontWeight: 900, fontSize: 12, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>ⓘ</button>
        {/* The panel is always in the DOM (only its opacity moves) so screen readers
            and Find-in-page reach the credit whether or not it's on screen. */}
        <figcaption aria-hidden={creditOpen ? undefined : "true"}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "6px 8px",
            background: "linear-gradient(to top, rgba(16,38,46,0.92), rgba(16,38,46,0.72))",
            color: "#F4ECD8", fontSize: 10.5, lineHeight: 1.35,
            opacity: creditOpen ? 1 : 0, transition: "opacity .18s", pointerEvents: creditOpen ? "auto" : "none" }}>
          {people.caption}
          <span style={{ opacity: 0.85 }}>
            {" · "}
            {people.source
              ? <a href={people.source} target="_blank" rel="noreferrer" style={{ color: "#9AD1E8" }}>{people.credit}</a>
              : people.credit}
            {` (${people.license})`}
          </span>
        </figcaption>
      </div>
      {/* Who you're looking at, when the entry names them. No counter and no arrows:
          there's nothing to step through — one of this country's peoples was chosen
          at random for this visit. */}
      {people.people && (
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: OCEAN, fontWeight: 700, marginTop: 6 }}>
          {people.people}
        </div>
      )}
    </figure>
  );
}

const routeBtn = { background: "transparent", border: `1.5px solid ${OCEAN}`, color: OCEAN,
  borderRadius: 6, fontSize: 12, lineHeight: 1, padding: "6px 9px", fontWeight: 800, cursor: "pointer" };

// The country card — the game's cultural centerpiece, shown the moment you're
// in a country in ANY mode: the country and its flag, a photo of its people in
// traditional dress, how they say hello, then the capital and a short story.
// How people actually get about in this country, as a STILL on the arrival card.
//
// This is what's left of the overland-vehicle mechanic, and deliberately so: the
// twelve transport tokens taught something real, but animating one across a
// continent claimed a journey nobody takes. Here the tuk-tuk sits on Thailand's
// card as a picture with a sentence, which is the honest version of the same
// lesson — and rule 4 means the meaning has to be in the sentence anyway, never in
// the picture alone.
function LocalTransport({ mode }) {
  if (!mode) return null;
  const art = TRANSPORT_ART[mode.id];
  return (
    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12,
      background: "#FFF8E6", border: `1px solid ${GOLD}`, borderLeft: `4px solid ${GOLD}`,
      borderRadius: 8, padding: "10px 12px", textAlign: "left" }}>
      {art
        ? <img src={`${UI}${art}`} alt="" aria-hidden="true" style={{ width: 58, height: 58, objectFit: "contain", flex: "none" }} />
        : <span aria-hidden="true" style={{ fontSize: 40, lineHeight: 1, flex: "none" }}>{mode.emoji}</span>}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", color: CORAL, fontWeight: 800, marginBottom: 3 }}>GETTING ABOUT</div>
        <p style={{ margin: 0, color: INK, fontSize: 14.5, lineHeight: 1.45 }}>
          <b>{mode.name}.</b> {mode.blurb}
        </p>
      </div>
    </div>
  );
}

function CountryCard({ country }) {
  if (!country || country === "Antarctica") return null;
  const info = COUNTRY_INFO[country], g = COUNTRY_GREETING[country];
  const people = peopleCards(country);
  if (!info && !g && !people.length) return null;
  const mean = g ? greetingMeaning(g) : null;
  return (
    <div style={{ marginTop: 10, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: 12, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span aria-hidden="true" style={{ fontSize: 92, lineHeight: 1 }}>{COUNTRY_FLAG[country] || "🏳️"}</span>
        <span>
          <span style={{ display: "block", fontWeight: 900, color: INK, fontSize: 19 }}>{displayCountry(country)}</span>
          {/* The endonym — what the country calls itself (see COUNTRY_NATIVE). */}
          {COUNTRY_NATIVE[country] && (
            <span style={{ display: "block", color: OCEAN, fontSize: 14, fontWeight: 700, marginTop: 1 }}>
              {COUNTRY_NATIVE[country].name}
              {COUNTRY_NATIVE[country].roman && (
                <span style={{ fontWeight: 600, opacity: 0.75 }}> · {COUNTRY_NATIVE[country].roman}</span>
              )}
            </span>
          )}
        </span>
        {info && <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: INK, opacity: 0.55, marginLeft: "auto" }}>{info.region}</span>}
      </div>
      <PeoplePhoto key={country} country={country} />
      {g && (() => {
        const { words, say } = greetingSaid(g);
        const gloss = usefulGloss(g, mean);
        return (
          <div style={{ fontSize: 13.5, color: OCEAN, lineHeight: 1.55, marginTop: 8 }}>
            <span aria-hidden="true">💬 </span>Here they say <b>“{words}”</b>
            {say ? ` (${say})` : ""} in {g.language}
            {gloss ? ` — it means ${quoteGloss(gloss)}` : "."}
            <SpeakButton greeting={g} />
          </div>
        );
      })()}
      {/* The capital stays. The country's blurb deliberately does NOT appear here.
          It hasn't been deleted — it's been moved to where a child will actually take
          it in: Mr O brings it up about a place you've already been, and it comes back
          as a bonus question at the homecoming. On this card it was a paragraph of
          prose stapled to the bottom of an arrival a child is trying to get past, and
          the way you read a paragraph like that is: you don't. See COUNTRY_INFO.blurb
          in src/data/countries.js for the text itself. */}
      {info && (
        <div style={{ marginTop: 8, fontSize: 12, color: INK, lineHeight: 1.5 }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.06em", color: GREEN, fontWeight: 700 }}>
            <span aria-hidden="true">★ </span>Capital: {info.capital}
          </div>
        </div>
      )}
    </div>
  );
}

// Shown the moment you arrive in a country: the culture card (people, flag,
// greeting, capital) pops up, and dismisses on the button or a tap outside — both
// of which wait out COUNTRY_CARD_DWELL_MS first. Nothing auto-dismisses it; the
// player decides when they've finished looking.
// How long the arrival card holds the player before the way out is clickable. The
// card is the one moment the game stops and shows a child a country's people, and a
// button that is live on arrival gets hit reflexively on the way to the next thing,
// often before the photo has even painted. Three seconds is enough to look up.
const COUNTRY_CARD_DWELL_MS = 3000;

function CountryPopup({ country, ride, onClose, reduced }) {
  // Deliberately NOT keyed off `country`: the timer belongs to this popup opening,
  // and the popup is mounted fresh per arrival.
  const [canGo, setCanGo] = useState(false);
  useEffect(() => {
    setCanGo(false);
    const id = setTimeout(() => setCanGo(true), COUNTRY_CARD_DWELL_MS);
    return () => clearTimeout(id);
  }, [country]);
  // Escape stays shut until the dwell is over, for the same reason the backdrop
  // does: it would hand back the very skip the dwell exists to prevent.
  const ref = useRef(null);
  useModalFocus(ref, onClose, { escape: canGo });
  if (!country) return null;
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`You've arrived in ${displayCountry(country)}`}
      // The backdrop only dismisses once the button does. Leaving it live would hand
      // back the very skip the dwell exists to prevent, to anyone who taps the edge.
      onClick={canGo ? onClose : undefined}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}>
      <div className={reduced ? "" : "sbw-pop"} onClick={(e) => e.stopPropagation()}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${CORAL}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 420, width: "100%", padding: "16px 18px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL }}>✈ YOU'VE ARRIVED IN…</div>
        <CountryCard country={country} />
        {ride && <LocalTransport mode={ride} />}
        {/* Greyed rather than absent, and it keeps its size and its words the whole
            time: a button that appears late moves the layout under a thumb already on
            its way down, and a child who can see where it will be waits for it. */}
        <button onClick={onClose} disabled={!canGo} aria-disabled={!canGo}
          style={{ ...primaryBtn, marginTop: 14, width: "100%", padding: "11px 0",
            opacity: canGo ? 1 : 0.45, cursor: canGo ? "pointer" : "default",
            transition: "opacity .3s" }}>
          Fantastic! On to the photo →
        </button>
      </div>
    </div>
  );
}

// Mr. O — the eager geography kid. A small, NON-blocking bubble that slides in at
// the bottom-left with an "Oh! Did you know…?" fact, then dismisses itself after a
// few seconds (or on tap). It never covers the map controls or steals a click.
// Mr. O pops up BIG, over a dimmed screen that freezes play until the player
// clicks (or presses a key) to dismiss him. No auto-dismiss.
// Mr O's non-blocking bubble. Usually a single line ("Oh! Did you know… <fact>"),
// but it also drives his first-time introduction as a multi-BEAT sequence: pass
// `beats` (an array of whole lines) and each click advances to the next, and — since
// he's the sort to strike a new pose every time he opens his mouth — he changes his
// picture on each beat. A plain `fact` is just the one-beat case.
function MrOBubble({ fact, beats, onClose, reduced }) {
  const lines = beats && beats.length ? beats : [`${MR_O.lead} ${fact}`];
  const [beat, setBeat] = useState(0);
  const [img, setImg] = useState(nextMrOImage);
  const [imgOk, setImgOk] = useState(true);
  const last = beat >= lines.length - 1;
  const advance = () => {
    if (last) { onClose(); return; }
    setBeat((b) => b + 1);
    setImg(nextMrOImage());       // a new pose for the next thing he says
    setImgOk(true);
  };
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, lines.length]);
  // escape:false because the handler above already maps Escape onto advance —
  // the hook is here for the trap and for putting focus back afterwards. He has
  // no focusable children, so the trap makes the dialog itself the focus holder,
  // which is what lets those key presses land while he's up.
  const ref = useRef(null);
  useModalFocus(ref, null, { escape: false });
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`${MR_O.name} says`} onClick={advance}
      style={{ position: "fixed", inset: 0, zIndex: 58, background: "rgba(8,20,24,0.66)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0, padding: "0 20px", cursor: "pointer" }}>
      <div className={reduced ? "" : "sbw-pop"} key={beat} style={{ display: "flex", alignItems: "flex-end", gap: 6, maxWidth: 1120, width: "100%", justifyContent: "center" }}>
        {imgOk ? (
          // Taller, and pinned to the very bottom of the screen (the overlay has no
          // bottom padding and the row is flex-end), so Mr O stands ON the floor of
          // the frame instead of floating mid-air with his legs cropped off. He is
          // drawn head-to-shins, so "bigger + bottom-anchored" is what makes him read
          // as a person leaning in rather than a portrait pasted on.
          <img src={`${UI}${img}`} alt="" onError={() => setImgOk(false)}
            // ~30% down from min(94vh, 900px) / 52vw. He was filling the screen when
            // he popped in, which read as the game stopping rather than someone
            // leaning in; this still reads as "Mr O is here" without taking the desk.
            style={{ height: "min(66vh, 630px)", width: "auto", maxWidth: "37vw", flex: "none", objectFit: "contain", objectPosition: "bottom", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }} />
        ) : (
          <div aria-hidden="true" style={{ fontSize: 112, lineHeight: 1, flex: "none" }}>{MR_O.emoji}</div>
        )}
        <div style={{ background: "#fff", border: `4px solid ${OCEAN}`, borderRadius: "22px 22px 22px 6px", padding: "22px 26px", boxShadow: "0 10px 30px rgba(16,38,46,0.4)", marginBottom: "20vh", maxWidth: 460 }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, letterSpacing: "0.12em", color: OCEAN, fontWeight: 800, marginBottom: 10 }}>{MR_O.name.toUpperCase()}</div>
          {/* For a plain fact the catchphrase already leads the line ("Oh! Did you
              know… <fact>"); intro beats are whole self-contained lines. */}
          <TypeLine key={beat} text={lines[beat]} reduced={reduced} style={{ color: INK, fontSize: 22, lineHeight: 1.5 }} />
          <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: INK, opacity: 0.55 }}>{last ? "click to continue ▸" : "click for more ▸"}</div>
        </div>
      </div>
    </div>
  );
}

// The "tap to learn" FIELD-NOTE CARD. Tapping a piece of chrome (logo, calendar,
// compass, a guess-stage button) opens the matching deck from src/data/curiosities.js
// here. It deals one verified fact at a time; "Another" reshuffles onward through the
// deck so a revisit teaches something new, with a "2 of 3" counter. Every card read
// is reported up via onSeen so poking around counts toward "Curiosities found".
//
// The card order is shuffled with Math.random on purpose: this is presentation, never
// mission generation, so it must NOT touch the seedable RNG that the Daily depends on.
function CuriosityCard({ deck, seen, onSeen, onClose, reduced }) {
  const narratorTrivia = deck.narrator === "trivia";
  const accent = narratorTrivia ? OCEAN : GOLD;
  const [order] = useState(() => {
    const idx = deck.cards.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  });
  const [pos, setPos] = useState(0);
  const card = deck.cards[order[pos]];
  // Was this card new to the player when it first appeared? Snapshot at open time so
  // the "NEW" flag doesn't flicker off the instant we record it as seen.
  const wasNew = !seen[card.id];
  useEffect(() => { onSeen(card.id); }, [card.id, onSeen]);

  return (
    <ModalShell label={`${deck.label} — field note`} onClose={onClose} accent={accent} maxWidth={520}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span aria-hidden="true" style={{ fontSize: 26 }}>{deck.emoji}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.14em",
          color: accent, fontWeight: 800 }}>
          {narratorTrivia ? "MR O · THE EDITOR" : "UNCLE JONAH"}
        </span>
        {wasNew && (
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", color: "#fff",
            background: GREEN, borderRadius: 10, padding: "2px 8px" }}>NEW</span>
        )}
      </div>
      <h2 style={{ margin: "0 0 8px", color: INK, fontSize: 21, fontWeight: 900, lineHeight: 1.25 }}>{card.title}</h2>
      <p style={{ margin: 0, color: INK, fontSize: 15.5, lineHeight: 1.6 }}>{card.body}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        {card.asOf && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: INK, opacity: 0.6 }}>as of {card.asOf}</span>
        )}
        {card.source && (
          <a href={card.source} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: OCEAN }}>
            Source: {(() => { try { return new URL(card.source).hostname.replace(/^www\./, ""); } catch { return "source"; } })()}
          </a>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.6, fontWeight: 700 }}>
          {pos + 1} of {deck.cards.length}
        </span>
        {deck.cards.length > 1 && (
          <button onClick={() => setPos((p) => (p + 1) % deck.cards.length)}
            className={reduced ? "" : ""}
            style={{ background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px",
              fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            Another ↻
          </button>
        )}
      </div>
    </ModalShell>
  );
}

// Mr. O's DOUBLE-POINTS riddle — a blocking popup. He poses a hard travel-trivia
// question; a correct answer is worth double a normal shot. After answering, the
// right answer and a short explanation show, then a Continue button dismisses it.
function RiddleModal({ riddle, onAnswer, onClose, gain, reduced }) {
  const [imgOk, setImgOk] = useState(true);
  const [img] = useState(nextMrOImage);
  const { data, choices, answeredIdx } = riddle;
  const answered = answeredIdx !== null;
  const wasCorrect = answered && choices[answeredIdx] === data.correct;
  // escape:false — a riddle is a question to answer, not a card to dismiss.
  const ref = useRef(null);
  useModalFocus(ref, onClose, { escape: false });
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Mr. O's riddle"
      style={{ position: "fixed", inset: 0, background: "rgba(8,20,24,0.66)", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, padding: "0 20px", zIndex: 58 }}>
      {/* Mr O stands OUTSIDE the card, at the size he introduces himself at. He used
          to be a 180px thumbnail tucked into the corner of a box, which made the
          riddle read as a form to fill in rather than a boy leaning in to ask you
          something. Same staging as his fact bubble now: he floats over a dimmed
          desk, and the question is a card beside him. */}
      {imgOk
        ? <img src={`${UI}${img}`} alt="" onError={() => setImgOk(false)}
            style={{ height: "min(66vh, 630px)", width: "auto", maxWidth: "37vw", flex: "none", objectFit: "contain", objectPosition: "bottom", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }} />
        : <div aria-hidden="true" style={{ fontSize: 112, lineHeight: 1, flex: "none" }}>{MR_O.emoji}</div>}
      <div className={reduced ? "" : "sbw-pop"}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${OCEAN}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 560, width: "100%", padding: "22px 22px 24px", textAlign: "center", marginBottom: "12vh" }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", color: OCEAN, fontWeight: 700 }}>{MR_O.name.toUpperCase()}</div>
          <div style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 18, color: INK }}>{MR_O.riddleLead}</div>
          <div style={{ display: "inline-block", marginTop: 4, background: GOLD, color: INK, fontWeight: 800, fontSize: 12, padding: "2px 9px", borderRadius: 20 }}>★ Double points: +{gain}</div>
        </div>
        <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 800, fontSize: 19, color: INK, margin: "8px auto 16px", lineHeight: 1.35, maxWidth: 460 }}>{data.q}</h2>
        <div style={{ display: "grid", gap: 9 }}>
          {choices.map((c, idx) => {
            const isCorrect = c === data.correct, isChosen = answeredIdx === idx;
            const bg = !answered ? "#fff" : isCorrect ? "#EAF6EF" : isChosen ? "#FBEAE6" : "#fff";
            const bd = !answered ? PAPER_LINE : isCorrect ? GREEN : isChosen ? CORAL : PAPER_LINE;
            return (
              <button key={idx} onClick={() => onAnswer(idx)} disabled={answered} aria-disabled={answered}
                style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: `2px solid ${bd}`, background: bg, color: INK, fontWeight: 700, fontSize: 15, cursor: answered ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span>{c}</span>
                {answered && isCorrect && <span aria-hidden="true">✅</span>}
                {answered && isChosen && !isCorrect && <span aria-hidden="true">❌</span>}
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{ marginTop: 14, background: "#fff", border: `1px dashed ${wasCorrect ? GREEN : CORAL}`, borderRadius: 10, padding: "11px 13px", textAlign: "left" }}>
            <b style={{ color: wasCorrect ? GREEN : CORAL }}>{wasCorrect ? `Spot on! +${pts(gain)}.` : "Not quite —"}</b>{" "}
            <span style={{ color: INK, fontSize: 14, lineHeight: 1.5 }}>{data.explain}</span>
          </div>
        )}
        {answered && (
          <button autoFocus onClick={onClose}
            style={{ ...primaryBtn, marginTop: 18, background: OCEAN, boxShadow: "0 4px 0 #1C5560" }}>
            Back to the trip →
          </button>
        )}
      </div>
    </div>
  );
}


// Uncle, wearing whichever of his ten painted expressions fits what he is
// saying (the mapping is content, and lives in data/grandpa.js).
//
// These are whole SCENES of his study — the fire, the thistle, the Scotland books,
// the dog asleep on the rug — so they're framed like a picture on the wall rather
// than masked into a little circular avatar. That's the point of having ten of
// them: at 108px in a circle you cannot tell proud from worried.
//
// The frame holds a fixed 4:3 box and the picture fills it, so HE NEVER MOVES: not
// when his face changes, and not on the first paint before the image has loaded
// (height:auto is 0 until then, which made the whole column jump). Every scene is
// the same 1000x750, so nothing is cropped by the cover.
//
// `key` on the img forces a remount when the mood changes, which replays the fade;
// without it React reuses the element and his face hard-cuts.
function NigelScene({ mood, beat = 0, style }) {
  const src = `${UI}${nigelFace(mood, beat)}`;
  return (
    <div aria-hidden="true" style={{ borderRadius: 16, overflow: "hidden", border: `4px solid ${GOLD}`,
      background: "#2A1B0E", boxShadow: "0 8px 26px rgba(74,50,20,0.38)", lineHeight: 0,
      aspectRatio: "4 / 3", ...style }}>
      <img key={src} src={src} alt="" className="sbw-fade"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// The old circular bust, kept for the few places that want a small chip of him
// rather than the whole room (the results header, the traveler list).
function NigelPortrait({ size = 108, style }) {
  return (
    <div aria-hidden="true" style={{ width: size, height: size, flex: "none", borderRadius: "50%", overflow: "hidden", border: `3px solid ${GOLD}`, background: "#F3E4C6", boxShadow: "0 4px 14px rgba(74,50,20,0.3)", ...style }}>
      <img src={`${BASE}jonah2.png`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// The story screen: Uncle Jonah speaks his beats one at a time at reading speed
// and his face moves with them, beat by beat (see NIGEL_MOOD.intro) — he welcomes
// you in, remembers never having gone, then brightens as he hands you the camera.
// The bag stays un-takeable until he has finished talking.
//
// `mood` names which sequence in the mood map this screen's beats belong to.
function StoryScreen({ beats, reduced, ctaLabel, onDone, onSkip, mood = "intro", cta = "button" }) {
  const [revealed, setRevealed] = useState(reduced ? beats.length : 0);
  const ready = revealed >= beats.length;
  return (
    <Frame>
      <DeskBoard>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          {/* Words and the way out on the left; Uncle, large, on the right. He is
              pinned to the top of the row rather than centred in it — centring means
              he slides every time anything on the left resizes. */}
          <div style={{ flex: "1 1 340px", minWidth: 280, textAlign: "left" }}>
            {/* EVERY beat is laid out from the first paint — the ones he hasn't got
                to yet are just invisible. They used to be mounted one at a time, so
                the card grew with each line and shoved everything under it down the
                page while a child was still reading. The box is the size of his whole
                speech before he says a word of it.

                His name sits INSIDE the card, exactly as it does on the mode-select
                screen — one card with his name at the top of it, the same object on
                both screens. It used to float above the card, which pushed the card's
                top edge below the top of his portrait and left the two columns
                visibly out of step. */}
            <div style={{ ...CARD_SURFACE, border: `1px solid ${PAPER_LINE}`, borderRadius: 12, padding: "18px 20px", textAlign: "left" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 24, fontWeight: 800, letterSpacing: "0.14em", color: CORAL, marginBottom: 10 }}>{GRANDPA.name.toUpperCase()}</div>
              {beats.map((b, i) => {
                const line = { margin: i ? "12px 0 0" : 0, color: INK, fontSize: 16, lineHeight: 1.55 };
                if (i < revealed) return <p key={i} style={line}>{b}</p>;
                if (i === revealed) {
                  return <GradualText key={i} text={b} reduced={reduced} onDone={() => setRevealed((r) => r + 1)} style={line} />;
                }
                return <p key={i} aria-hidden="true" style={{ ...line, visibility: "hidden" }}>{b}</p>;
              })}
            </div>

            {/* No "tap to read faster" prompt. Tapping still completes a line — that
                stays, for a child who has read it and is waiting — but ADVERTISING it
                turns Jonah's story into something to click past, and his story is
                where the whole game is explained. The bag moved to sit under HIM
                (right column) for the same reason: nothing under the words invites
                skipping them. */}
          </div>
          {/* RIGHT: his face, tracking the beat he's on, and directly beneath it the
              bag he's offering. The slot below him is reserved at full height from the
              first paint, so the bag can APPEAR when he's finished — rather than sit
              there greyed out telegraphing the end of a story a child hasn't heard yet
              — without its arrival changing the height of the page. */}
          <div style={{ flex: "1.35 1 420px", minWidth: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <NigelScene mood={mood} beat={Math.min(revealed, beats.length - 1)} style={{ width: "100%" }} />
            <div style={{ marginTop: 52, minHeight: cta === "bag" ? 250 : 76, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 8 }}>
              {ready && (cta === "bag" ? (
                // The camera bag IS the button: he holds out his old bag and a child
                // takes it. It bobs so there's no mistaking what to do.
                <button data-primary onClick={onDone} aria-label={ctaLabel} className="sbw-bob"
                  style={{ background: "none", border: "none", padding: 0, width: 246, maxWidth: "74%", cursor: "pointer" }}>
                  <img src={`${UI}camera-bag.png`} alt="" aria-hidden="true"
                    style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 7px 12px rgba(16,38,46,0.42))" }} />
                  <span style={{ display: "block", marginTop: 4, fontFamily: HAND, fontWeight: 700, fontSize: 25, color: INK }}>{ctaLabel}</span>
                </button>
              ) : (
                <button data-primary onClick={onDone} style={{ ...primaryBtn, margin: 0 }}>{ctaLabel}</button>
              ))}
              {onSkip && (
                <button onClick={onSkip} style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </DeskBoard>
    </Frame>
  );
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
// A landmark's `subject` is often a whole descriptive phrase — "Murchison Falls,
// where the Nile bursts through a narrow gorge". For a keepsake caption we want just
// the NAME: everything up to the first comma or dash clause. Names without one (Big
// Ben, The Great Wall) pass through untouched.
const shortSubject = (s) => String(s || "").split(/\s*[,—–]\s*/)[0].trim();

// One developed keepsake on the "roll" screen: a plain polaroid — the photo and its
// name in Uncle's handwriting, nothing else. The blurb and photo credit that used to
// crowd underneath now live only on the place's own card, so the roll reads as a wall
// of pictures a child took, not a page of captions.
// How wide each print is, given how many came home. A three-shot Scout roll gets big
// keepsake prints; a fourteen-shot Expert roll shrinks them so the whole roll still
// fits beside Uncle Jonah without the results screen growing a scrollbar. Everything
// inside scales off `w`, so a print stays a print at every size.
// Sized so the tallest case still clears a 720px-high window — the shortest screen
// the game is meant to run in (rule 4: a desktop window, no scrolling). A print's
// height is about 0.74w plus its caption, so each step down buys ~3 rows x 6px.
function polaroidWidth(n) {
  if (n <= 4) return 168;
  if (n <= 6) return 142;
  if (n <= 9) return 114;
  if (n <= 12) return 98;
  return 86;
}
// ---- Pickles, Uncle Jonah's dog ----------------------------------------------
// Six poses. She is a REWARD, not furniture: she turns up when the player has done
// something worth celebrating, fills the screen, and leaves when they click.
const DOG_POSES = {
  bow: "dog_pose_03_play_bow.png",       // the big celebration — a play bow
  spin: "dog_pose_01_standing.png",      // pleased and bouncing
  tilt: "dog_pose_05_head_tilt_sit.png", // a curious head tilt
  walk: "dog_pose_04_walking.png",
  lying: "dog_pose_06_lying_down.png",
  sit: "dog_pose_02_sitting_paw_up.png", // a paw up — "well done, you"
};
// What she is feeling, in words. Her face does the work, but a child shouldn't have
// to INFER why she turned up, and rule 4 forbids leaving meaning to the picture alone
// — so every visit says out loud what she's excited about.
//
// She does NOT carry facts. That was Mr O's job as well, and two characters both
// arriving to tell you something true made her feel like a second editor rather than
// a dog. She reacts to the shot and nothing else; the pride IS the payload.
const DOG_LINES = {
  two: { pose: "sit", line: "Two in a row! Pickles is sat bolt upright, one paw up." },
  streak: { pose: "bow", line: "Three perfect shots! Pickles is bowing and bouncing and can hardly stand it." },
  perfect: { pose: "spin", line: "Pickles saw that one. Tail going like anything." },
};
// Pickles, celebrating alongside the shot you just took. She rides IN the result card
// rather than arriving as her own screen: a second full-screen popup after the
// perfect-shot card meant two things to click through for one good moment, and the
// celebration landed after the thing it was celebrating had already gone.
//
// Her line is not typed. She isn't speaking — it's a description of a dog — so
// revealing it letter by letter would be pretending she's talking.
// She FLOATS beside the result card rather than sitting in a bordered box inside
// it — a box inside the perfect-shot box read as a widget, not a dog. Same staging
// idea as Mr O: the figure stands over the dimmed desk at a size you can actually
// see her at, and her line sits under her as plain text on the dim.
//
// pointerEvents: none throughout, because she is celebration, not a control: she
// must never intercept a click meant for the card behind her.
function PicklesCheer({ kind, reduced }) {
  const copy = DOG_LINES[kind] || DOG_LINES.perfect;
  return (
    <div className={reduced ? "" : "sbw-pop"} aria-hidden="true"
      // Anchored to the CARD's edge, not the viewport's. Positioning her from the
      // left meant her overlap depended entirely on window width: measured against
      // the 840px photo card she cleared it at 1920 and buried 112px of it at 1280
      // — and the photo sits on that card's left, so she was covering the picture
      // the player just earned.
      //
      // `right` measured from the centre line fixes that: the card is centred and
      // at most 840 wide, so 50% + 420 is exactly its left edge and the 60px back
      // off that is a deliberate, CONSTANT lean at every window size. Joshua asked
      // for a little overlap, not none. On the narrower 620px card (no photo) she
      // clears it entirely, which is right — there's more gutter to sit in.
      //
      // The width cap keeps her on screen when the gutter runs out.
      style={{ position: "absolute", right: "calc(50% + 360px)", bottom: "2vh", zIndex: 2, pointerEvents: "none",
        width: "min(260px, calc(50vw - 360px))", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <img src={`${UI}dog/${DOG_POSES[copy.pose]}`} alt=""
        style={{ width: "100%", height: "auto", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))" }} />
      <p style={{ margin: 0, color: "#FFF3D6", fontSize: 15, lineHeight: 1.4, textAlign: "center", fontWeight: 600,
        textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)" }}>
        <span style={{ display: "block", fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", color: GOLD, fontWeight: 800, marginBottom: 3 }}>🐾 PICKLES</span>
        {copy.line}
      </p>
    </div>
  );
}

// The one true thing a wrong answer leaves behind. Styled as a small map note rather
// than an error: it is the same visual weight as the fact box on a CORRECT shot,
// because a missed guess is meant to be worth as much to learn from as a right one.
function MissLesson({ text }) {
  return (
    <div style={{ background: "#FFF8E6", border: `1px solid ${GOLD}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 8, padding: "10px 12px", textAlign: "left" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: CORAL, marginBottom: 4 }}>🧭 WHERE YOU ARE</div>
      <p style={{ margin: 0, color: INK, fontSize: 14.5, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function Polaroid({ p, w = 172 }) {
  const s = w / 172; // everything below is the 172px design, scaled
  return (
    <div style={{ width: w, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, padding: `${Math.round(8 * s)}px ${Math.round(8 * s)}px ${Math.round(14 * s)}px`, transform: `rotate(${(p.id.charCodeAt(0) % 5) - 2}deg)`, boxShadow: "0 4px 10px rgba(16,38,46,0.22)" }}>
      {/* The print FILLS the window. It used to be a fixed 96px square floating in a
          156px-wide frame, which left a cream band down either side and made a
          developed photograph look like a postage stamp someone had centred. An
          icon placeholder still sits in the middle at its own size. */}
      <div style={{ background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", height: Math.round(128 * s), borderRadius: 2, overflow: "hidden" }}>
        {p.photo?.src
          ? <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={Math.round(128 * s)} full />
          : <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={Math.round(96 * s)} />}
      </div>
      <div style={{ fontFamily: HAND, fontWeight: 700, color: INK, fontSize: Math.max(14, Math.round(21 * s)), lineHeight: 1.08, marginTop: Math.round(9 * s), textAlign: "center" }}>
        <span style={{ fontSize: "1.3em", verticalAlign: "-0.1em" }}>{p.flag}</span> {shortSubject(p.subject)}
      </div>
    </div>
  );
}

const primaryBtn = { marginTop: 26, background: CORAL, color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 800, letterSpacing: "0.03em", cursor: "pointer", boxShadow: "0 4px 0 #A93A28" };