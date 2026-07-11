import React, { useState, useRef, useEffect, useMemo } from "react";
import { LOCATIONS } from "./data/locations.js";
import { WORLD_COUNTRIES, COUNTRY_CONTINENT } from "./data/worldmap.js";
import { WORLD_COUNTRIES_ROBINSON } from "./data/worldmap-robinson.js";
import { COUNTRY_INFO, COUNTRY_LAYER_CONTINENTS } from "./data/countries.js";
import { COUNTRY_PEOPLE, greetingMeaning } from "./data/culture.js";
import { categoryCountries, categoryMissionOK as missionOK } from "./missions.js";
import { robinson, eqToRobinson, ROBINSON_W, ROBINSON_H } from "./robinson.js";
import { CATEGORIES, CATEGORY_ORDER, KIND_META, kindOf } from "./data/categories.js";
import { ANECDOTES } from "./data/anecdotes.js";
import { GRANDPA, INTRO_BEATS, SENDOFF_BEATS, NOTE_HEADER, GUIDEBOOK,
  HOMECOMING_INTRO, WRONG_REACTIONS, ACHIEVEMENT_INTRO, DREAM_FULFILLED } from "./data/grandpa.js";
import { listProfiles, lastProfileName, getProfile, createProfile, setLastProfile,
  deleteProfile, setAvatar, setProfileFlag, recordGame, recordExplore, recordQuiz,
  weightedOrder, freshFirst, passportData, achievements, topScores, storageAvailable } from "./profiles.js";

// Base URL the app is served from ("/" at a domain root, "/<repo>/" on a GitHub
// Pages project site). Prefix runtime asset URLs with it so the relief map plates
// resolve wherever the build is hosted. Always ends with a slash.
const BASE = import.meta.env.BASE_URL;

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


// ---- Difficulty tiers. Each assignment is a two-step drill-down: pick the ----
// ---- right CONTINENT on the world map, then the right CITY among the target ----
// ---- plus `cityDecoys` same-continent decoys. `assignments` = how many. ----
// ---- Points per photo are HIGHER on Easy (younger players). `labels`: "all" ----
// ---- names every city, "smart" hides names until hover/focus. `clue` picks ----
// ---- the clue text.
// `catShare` = the chance each assignment is a "photograph any {category} in
// {continent}" mission instead of a specific-subject one (the rest are specific).
// `slack` = spare travel days baked into the budget on top of the clean-route
// cost (distance flights + one shot each); banking them at the end is the day
// bonus, and it shrinks with difficulty.
// `research` gates the ½-day Research hint by tier: "free" (Easy — a leg-up for
// young players, no day cost), "half" (Medium — costs SHOT_COST), "off" (Hard —
// no hand-holding). `blurb` is the one-line explainer on the start screen.
const MODES = {
  easy:   { label: "Easy",   assignments: 3, cityDecoys: 2, daysPer: 3, points: 150, slack: 5, labels: "all",   clue: "easy",   catShare: 0.4, countryOpts: 3, research: "free",
            blurb: "Clues spell out the place · fly straight to the city · all pins labelled · free Research hints." },
  medium: { label: "Medium", assignments: 5, cityDecoys: 3, daysPer: 3, points: 125, slack: 5, labels: "smart", clue: "medium", catShare: 0.5, countryOpts: 5, research: "half",
            blurb: "Clues name the continent but hide the country · pick the country, then the city · Research costs ½ day." },
  hard:   { label: "Hard",   assignments: 7, cityDecoys: 4, daysPer: 2, points: 100, slack: 4, labels: "smart", clue: "hard",   catShare: 0.5, countryOpts: 7, research: "off",
            blurb: "Pure-context clues — no place names · country names hidden on the map · no Research · more, tighter trips." },
};
const MODE_ORDER = ["easy", "medium", "hard"];

const modePlan = (key) => {
  const m = MODES[key];
  return { ...m, assignments: Math.min(m.assignments, LOCATIONS.length) };
};

// Taking a photo (right or wrong) costs half a travel day, so a snapshot is a
// real decision, not a free guess.
const SHOT_COST = 0.5;

// The traveller's home airport — where the very first flight departs from.
const HUB = { x: 106, y: 49 };

// Great-circle distance (km) between two MAP points. Our coords are x = lon+180
// (0..360) and y = 90-lat (0..180); the haversine below is inherently
// longitude-wrap-safe, so Pacific hops measure the short way round.
const kmBetween = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = toRad(90 - a.y), lat2 = toRad(90 - b.y);
  const h = Math.sin(toRad(a.y - b.y) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(toRad(b.x - a.x) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
};
// A flight's cost in travel DAYS: the great-circle distance scaled and rounded to
// the nearest HALF day, with a floor (even a short hop is half a day) and a cap so
// no single leg is ruinous. Long hauls really do cost more than short ones.
const FLIGHT_KM_PER_DAY = 6000;
const flightDays = (from, to) => Math.max(0.5, Math.min(3, Math.round((kmBetween(from, to) / FLIGHT_KM_PER_DAY) * 2) / 2));

// ---- Grand Tour mode: instead of one assignment at a time, you get a whole ----
// ---- itinerary of targets across several continents on ONE shared day budget, ----
// ---- fulfilled in ANY order. Flying to a new continent costs a distance-based ----
// ---- number of days (see flightDays); photographing another target on the ----
// ---- continent you're already on is just the SHOT_COST — so grouping ----
// ---- same-continent targets and planning an efficient route saves days. ----
// ---- `reqs` = itinerary length; `slack` = spare days. ----
const TOUR_MODES = {
  easy:   { reqs: 4, catShare: 0.4, labels: "all",   clue: "easy",   points: 150, slack: 3 },
  medium: { reqs: 5, catShare: 0.5, labels: "smart", clue: "medium", points: 125, slack: 2 },
  hard:   { reqs: 6, catShare: 0.6, labels: "smart", clue: "hard",   points: 100, slack: 1 },
};
// Best achievable Grand Tour score: every target filed, plus the day-bonus for the
// most days a perfectly efficient route could bank (the buffer built into the budget).
const tourMaxScore = (nReqs, difficulty) => nReqs * TOUR_MODES[difficulty].points + (nReqs + TOUR_MODES[difficulty].slack) * 50;

// ---- Themed Expeditions: guided, curated Grand Tours around a single learning ----
// theme (all wildlife, all volcanoes…). Each is a Grand Tour whose specific targets
// are drawn from the theme, with an intro "lesson". `pick` selects the theme's
// members; the itinerary favours one target per continent for a round-the-world feel.
const EXPEDITIONS = [
  { id: "wildlife", title: "Wildlife Safari", emoji: "🦁", lesson: "Photograph the world's most amazing animals — each a star of its own home. From pandas to penguins, every stop is a creature found in one special place.", pick: (l) => l.category === "wildlife" },
  { id: "volcano", title: "Ring of Fire", emoji: "🌋", lesson: "Chase the planet's volcanoes and hot springs. Most ring the Pacific Ocean, along the cracks where Earth's giant plates grind together.", pick: (l) => l.category === "volcano" },
  { id: "mountain", title: "Roof of the World", emoji: "🏔️", lesson: "Climb to the highest places on Earth. Mountains rise over millions of years where the ground is slowly pushed and folded upward.", pick: (l) => l.category === "mountain" },
  { id: "waterfall", title: "Chasing Waterfalls", emoji: "💦", lesson: "Follow rivers to the edge and over it! Waterfalls form where a river crosses from hard rock to soft rock that wears away faster.", pick: (l) => l.category === "waterfall" },
  { id: "ruins", title: "Ancient Wonders", emoji: "🏛️", lesson: "Visit the ruins of long-ago peoples and see the astonishing things they built — all without a single modern machine.", pick: (l) => l.category === "ruins" },
  { id: "heritage", title: "World Heritage", emoji: "🌐", lesson: "Tour places so special that the whole world agreed to protect them: UNESCO World Heritage Sites, treasures for everyone.", pick: (l) => (l.tags || []).includes("unesco") },
];

const BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
// Each continent gets its own colour on the world map — the player picks a
// continent by its colour/shape, with no text labels (the easy clue names it,
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
// this tall, with the ~182.6-tall map centred in it — so it fills the square frame
// with a gentle stretch and blank margins top/bottom (and rounded blank corners).
const WORLD_VBH = 262;
const WORLD_BOX = { x: 0, y: (ROBINSON_H - WORLD_VBH) / 2, w: ROBINSON_W, h: WORLD_VBH };

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
// contain every location on the continent (plus breathing room) and centred on
// them. For a wide, scattered continent (Oceania, Antarctica) the square can spill
// past the map edges into open ocean — that's fine, the frame just shows more sea.
// Antarctica is drawn on a south-polar relief image (a square plate), not the
// equirectangular projection — so it shows the true round continent, not a sliver.
const ANT_PLATE = 200; // the polar plate is a 200x200 square in its own units
const CONTINENT_META = (() => {
  const meta = {};
  for (const c of CONTINENTS) {
    if (c === "Antarctica") { meta[c] = { mode: "polar", box: { x: 0, y: 0, w: ANT_PLATE, h: ANT_PLATE } }; continue; }
    // Oceania is Pacific-centred: pull its eastern-Pacific points (Hawaiʻi, Bora
    // Bora, Easter I., x<180) across the antimeridian so the region reads as one
    // block instead of being split to opposite edges of a world map.
    const wrap = c === "Oceania";
    const locs = LOCATIONS.filter((l) => l.continent === c);
    const xs = locs.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = locs.map((l) => l.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    if (c === "Asia") {
      // Asia's landmarks span ~132° of longitude but only ~65° of latitude, so a
      // square box showed the Arctic, half of Africa and all of Australia just to
      // fit. Hug the content tightly: the west edge lands ~27°E (Europe/Africa just
      // at the margin), the north trims into Russia, and the south stops above
      // Australia while still keeping Indonesia in frame.
      const w = Math.max(40, (maxX - minX) * 1.03);
      const h = Math.max(40, (maxY - minY) * 1.05);
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
// continent — including countries the traveller hasn't touched yet, so the empty
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
const countryKey = (continent, country) => `${continent}|${country}`;
// A landmark usually sits in one country, but a few straddle a border (e.g.
// Niagara Falls on the Canada–US line). `countries` lists every country it can be
// reached from; `country` stays the primary (for its flag/greeting). Picking ANY
// of its countries in the country layer counts as correct.
const countriesOf = (l) => (l.countries && l.countries.length ? l.countries : [l.country]);
(() => {
  for (const cont of COUNTRY_LAYER_CONTINENTS) {
    const wrap = CONTINENT_META[cont] && CONTINENT_META[cont].mode === "wrap"; // Oceania: Pacific-centred
    const byC = {};
    for (const l of LOCATIONS) if (l.continent === cont) for (const c of countriesOf(l)) (byC[c] = byC[c] || []).push(l);
    LAYER_COUNTRY_LIST[cont] = Object.keys(byC);
    COUNTRY_LOCS[cont] = {};
    for (const [country, ls] of Object.entries(byC)) {
      COUNTRY_LOCS[cont][country] = ls.map((l) => l.id);
      const xs = ls.map((l) => (wrap && l.x < 180 ? l.x + 360 : l.x)), ys = ls.map((l) => l.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      const side = Math.min(120, Math.max(16, Math.max(maxX - minX, maxY - minY) * 1.9));
      COUNTRY_META[countryKey(cont, country)] = { box: { x: cx - side / 2, y: cy - side / 2, w: side, h: side }, cx, cy };
    }
  }
})();
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
// (azimuthal: distance from the centred pole grows with distance from the pole;
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
  const want = mode.cityDecoys + 1;
  // The anchor + cityDecoys same-continent decoys, spaced for the continent zoom.
  const buildOptions = (anchor) => {
    const far = spacedFor(CONTINENT_META[anchor.continent].box);
    const chosen = [anchor];
    for (const l of order) { if (chosen.length >= want) break; if (l.continent === anchor.continent && !chosen.includes(l) && far(l, chosen)) chosen.push(l); }
    for (const l of order) { if (chosen.length >= want) break; if (l.continent === anchor.continent && !chosen.includes(l)) chosen.push(l); }
    return chosen.map((l) => l.id).sort(() => Math.random() - 0.5);
  };
  // Country-layer options: the anchor + other landmarks in the SAME country.
  const buildCountryOptions = (anchor) => {
    const chosen = [anchor];
    for (const l of order) { if (chosen.length >= want) break; if (l.country === anchor.country && l.continent === anchor.continent && !chosen.includes(l)) chosen.push(l); }
    return chosen.map((l) => l.id).sort(() => Math.random() - 0.5);
  };
  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);
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
    if (Math.random() < mode.catShare && categoryMissionOK(anchor.category, continent, mode)) {
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

// FNV-1a string hash — used to derive a traveller's stable default avatar.
const hashStr = (str) => { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

// Pick n DISTINCT anchor locations, at least 40% of them genuinely NEW to this
// player. Choosing anchors up front guarantees no place is used twice in one run.
// `freshFirst` orders places by how long ago the player last saw them (never-seen
// first); once everything's been seen, the oldest visits resurface, so review
// continues forever.
function pickAnchors(profile, order, n) {
  const needFresh = Math.ceil(0.4 * n);
  const anchorIds = [];
  const used = new Set();
  const take = (id) => { if (id && !used.has(id)) { used.add(id); anchorIds.push(id); } };
  freshFirst(profile).forEach((id) => { if (anchorIds.length < needFresh) take(id); });
  order.forEach((l) => { if (anchorIds.length < n) take(l.id); });            // fill the rest, weighted
  freshFirst(profile).forEach((id) => { if (anchorIds.length < n) take(id); }); // safety net (tiny catalogs)
  return anchorIds.slice(0, n).map((id) => BY_ID[id]).sort(() => Math.random() - 0.5);
}

// Pick one value from [{ v, w }] weighted by w.
const weightedPick = (items) => {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of items) { r -= x.w; if (r <= 0) return x.v; }
  return items[items.length - 1].v;
};

// Keep decoy pins from stacking, scaled to whatever continent box is on screen.
const spacedFor = (box) => {
  const minSep = Math.max(4, box.w * 0.05);
  return (a, chosen) => chosen.every((b) => {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy >= minSep * minSep;
  });
};

// The best score a game could reach: every photo landed (points each) plus the
// full day bonus for banking all the slack days (a perfect clean route spends only
// the flights + shots, leaving exactly `slack` days at 50 pts apiece).
const maxScoreFor = (nAssign, mode) => nAssign * mode.points + mode.slack * 50;

// Rank on the FRACTION of the achievable max, so a perfect Easy run and a
// perfect Hard run both earn the top title regardless of raw points.
const rankFor = (pct) => {
  if (pct >= 0.9) return { title: "Pulitzer-Winning Photojournalist", note: "Flawless work in the field." };
  if (pct >= 0.7) return { title: "Senior Photojournalist", note: "Sharp eye, sharp instincts." };
  if (pct >= 0.5) return { title: "Staff Photographer", note: "Solid, dependable coverage." };
  if (pct >= 0.25) return { title: "Field Intern", note: "You got the shots that counted." };
  return { title: "Trainee", note: "Read Grandpa's notes more closely next time." };
};

// ===========================================================================
// QUIZ ENGINE — multiple-choice geography questions generated ENTIRELY from the
// verified location data (continent, country, category, subject, photo, fact).
// Nothing invented, so it stays rule-2 safe. Used by Quiz mode (and, later,
// inside Education mode).
// ===========================================================================
const QUIZ_CONTINENTS = Object.keys(CONTINENT_PIN);
const shuffleArr = (a) => a.slice().sort(() => Math.random() - 0.5);
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
      explain: `In ${l.country} they say “${g.text}” (${g.language})${mean ? ` — it means ${quoteGloss(mean)}` : "."}` };
  }
  if (kind === "capital") {
    const answer = CAPITAL_OF[l.country];
    // Distractors from the same continent read as plausible; top up worldwide.
    const near = pickN(capitalsOn(l.continent), 3, new Set([answer]));
    const filled = near.length >= 3 ? near : [...near, ...pickN(ALL_CAPITALS, 3 - near.length, new Set([answer, ...near]))];
    const opts = shuffleArr([answer, ...filled]);
    return { kind, prompt: `What is the capital of ${l.country}?`, photo: null,
      options: opts.map((o) => ({ label: o, correct: o === answer })),
      explain: `${answer} is the capital of ${l.country}. ${COUNTRY_INFO[l.country].blurb}` };
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
// Grandpa's anecdote for that place.
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
const SFX = (() => {
  let ctx = null;
  let master = null;
  const ac = () => {
    try {
      if (typeof window === "undefined") return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5; // one master level so overlapping sounds don't clip
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch {
      return null;
    }
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
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur);
    return { f, g };
  };
  const tone = (c, t, freq, dur, peak, type = "sine") => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  };
  const notes = (c, list, step, dur, peak, type) => {
    const t = c.currentTime;
    list.forEach((f, i) => tone(c, t + i * step, f, dur, peak, type));
  };
  // A tone with a pitch glide — the workhorse for anything that should feel alive.
  const slide = (c, t, f0, f1, dur, peak, type = "sine") => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  };
  // Every effect is wrapped so an audio hiccup can never break gameplay.
  const safe = (fn) => { try { const c = ac(); if (c) fn(c); } catch { /* ignore */ } };
  return {
    // Camera shutter: mirror-slap click, shutter close, then the soft rising
    // whirr of the film advance — the full "kerchunk-zzip" of an old SLR.
    shutter() { safe((c) => { const t = c.currentTime;
      burst(c, t, 0.03, "highpass", 2400, 0.34);
      burst(c, t + 0.045, 0.05, "highpass", 1400, 0.3);
      const { f } = burst(c, t + 0.12, 0.22, "bandpass", 900, 0.1);
      f.Q.value = 3; f.frequency.setValueAtTime(700, t + 0.12); f.frequency.linearRampToValueAtTime(1900, t + 0.34);
    }); },
    // Airplane: a low engine rumble under a swept jet whoosh that passes by.
    plane() { safe((c) => { const t = c.currentTime;
      const lo = burst(c, t, 0.9, "lowpass", 220, 0.1);
      lo.f.frequency.setValueAtTime(160, t); lo.f.frequency.linearRampToValueAtTime(90, t + 0.9);
      const { f } = burst(c, t, 0.85, "bandpass", 500, 0.12);
      f.Q.value = 0.9; f.frequency.setValueAtTime(320, t);
      f.frequency.linearRampToValueAtTime(1300, t + 0.4); f.frequency.linearRampToValueAtTime(380, t + 0.85);
    }); },
    // Correct shot: rising C–E–G chime with a bell-like octave shimmer on top.
    success() { safe((c) => { const t = c.currentTime;
      notes(c, [523.25, 659.25, 783.99], 0.085, 0.22, 0.28, "triangle");
      tone(c, t + 0.17, 1567.98, 0.3, 0.1, "sine");
    }); },
    // Trip complete: a four-note fanfare that lands on a held C-major chord.
    win() { safe((c) => { const t = c.currentTime;
      notes(c, [523.25, 659.25, 783.99, 1046.5], 0.11, 0.3, 0.3, "triangle");
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(c, t + 0.44, f, 0.7, 0.09, "sine"));
    }); },
    // Wrong subject: a soft two-note "wah-wah" slide — clearly wrong, never harsh.
    fail() { safe((c) => { const t = c.currentTime;
      slide(c, t, 220, 185, 0.2, 0.22, "sawtooth");
      slide(c, t + 0.16, 185, 140, 0.32, 0.2, "sawtooth");
    }); },
    // Out of days: slow sad descending minor line.
    lose() { safe((c) => notes(c, [440, 349.23, 261.63], 0.17, 0.42, 0.26, "sine")); },
    // Passport stamp / new record: a felt-pad THUNK, then the ink sparkle.
    stamp() { safe((c) => { const t = c.currentTime;
      slide(c, t, 180, 70, 0.14, 0.4, "sine");
      burst(c, t, 0.05, "lowpass", 400, 0.22);
      tone(c, t + 0.1, 1568, 0.12, 0.2, "triangle");
      tone(c, t + 0.17, 2093, 0.16, 0.18, "triangle");
    }); },
    // New badge: a bright bugle-style flourish, distinct from the stamp.
    badge() { safe((c) => { const t = c.currentTime;
      notes(c, [587.33, 587.33, 880], 0.09, 0.16, 0.26, "triangle");
      [880, 1108.73, 1318.51].forEach((f) => tone(c, t + 0.3, f, 0.55, 0.1, "sine"));
    }); },
  };
})();

// The start screen's mode cards. Each card wears a real landmark photo from
// the game's own (verified, freely-licensed) collection; blurbs appear only
// when a card's ⓘ is tapped, keeping the screen picture-first.
const MODE_CARDS = [
  { id: "assignments", name: "Assignments", emoji: "📸", photoId: "paris",
    blurb: "One of Grandpa's dreams at a time — fly to the right place and photograph the right subject before your travel days run out." },
  { id: "tour", name: "Grand Tour", emoji: "🧳", photoId: "beijing",
    blurb: "A whole itinerary of targets across continents on one shared day budget — plan an efficient route and shoot them in any order." },
  { id: "explore", name: "Explore", emoji: "🧭", photoId: "galapagos",
    blurb: "No timer, no score — roam the world, drill into any country, and read every place's story, culture card, and clues. Everywhere you visit is stamped in your passport." },
  { id: "quiz", name: "Quiz", emoji: "🧠", photoId: "xian",
    blurb: "Ten fast multiple-choice questions — name the landmark from its photo, place it on the map, or know the capital. Build a streak for bonus points." },
];
// The Grand Tour's itinerary choices: a classic random tour, or one of the themed
// expeditions (each a curated tour with a lesson). Shown as chips under the cards
// when the Grand Tour card is selected — themed tours are a flavour of Grand Tour,
// not a separate mode.
const TOUR_THEMES = [{ id: "classic", title: "Classic", emoji: "🎲", lesson: "A round-the-world itinerary drawn fresh from the whole collection — targets across the continents on one shared day budget." }, ...EXPEDITIONS];
const cardThumb = (id) => { const l = BY_ID[id]; if (!l?.photo?.src) return null; const src = l.photo.src; return src.includes("?") ? src : src + "?width=480"; };

// ---- Generative background music (Web Audio) -------------------------------
// A quiet, kalimba-like pattern in C-major pentatonic over a slow bass root,
// composed live by a look-ahead scheduler — so it never audibly loops, ships
// no audio files, and works offline. It has its own context and mute toggle,
// separate from the sound effects. start() must be called from a user gesture
// (a click handler) to satisfy autoplay rules, especially on iPad Safari.
const MUSIC = (() => {
  let ctx = null, master = null, timer = null, nextBeat = 0, running = false;
  const ac = () => {
    try {
      if (typeof window === "undefined") return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.0001;
        const soften = ctx.createBiquadFilter();
        soften.type = "lowpass"; soften.frequency.value = 2400; // rounds off the pluck edges
        master.connect(soften); soften.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch { return null; }
  };
  const PENT = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C'
  const pluck = (t, f, peak) => {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2; // soft octave partial
    const g = ctx.createGain(); const g2 = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(peak * 0.25, t + 0.012);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(master); o2.connect(g2); g2.connect(master);
    o.start(t); o.stop(t + 1.2); o2.start(t); o2.stop(t + 0.6);
  };
  const bass = (t, f) => {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 2.8);
  };
  let lastIdx = -1;
  const schedule = () => {
    try {
      if (!running || !ctx) return;
      const spb = 60 / 76 / 2;                 // eighth notes at 76 bpm
      const ahead = ctx.currentTime + 0.7;
      while (nextBeat < ahead) {
        const beat = Math.round(nextBeat / spb);
        if (beat % 16 === 0) bass(nextBeat, [130.81, 98.0, 110.0][Math.floor(Math.random() * 3)]);
        // Sparse melody: rests are what keep it calm. Never repeat a note.
        if (Math.random() < 0.5) {
          let i; do { i = Math.floor(Math.random() * PENT.length); } while (i === lastIdx);
          lastIdx = i;
          pluck(nextBeat, PENT[i], 0.07 + Math.random() * 0.05);
        }
        nextBeat += spb;
      }
    } catch { /* music must never break gameplay */ }
  };
  return {
    start() {
      try {
        const c = ac(); if (!c || running) return;
        running = true;
        master.gain.setTargetAtTime(0.16, c.currentTime, 0.4); // fade in
        nextBeat = Math.max(nextBeat, c.currentTime + 0.15);
        if (!timer) timer = setInterval(schedule, 250);
        schedule();
      } catch { /* ignore */ }
    },
    stop() {
      try {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        if (ctx && master) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25); // fade out
      } catch { /* ignore */ }
    },
  };
})();

// ---- Spoken greetings (Web Speech API) — the browser says the greeting aloud in ----
// ---- the local language. No files, no network, no licensing. Maps each greeting  ----
// ---- language to a BCP-47 code so the browser picks a matching voice; languages  ----
// ---- without a code fall back to the default voice (still reads the Latin form).  ----
const SPEECH_LANG = {
  "Afrikaans": "af", "Amharic": "am", "Arabic": "ar", "Burmese": "my", "Cantonese": "zh-HK",
  "Croatian": "hr", "Czech": "cs", "Dutch": "nl", "English": "en", "English (Australian)": "en-AU",
  "Filipino": "fil", "French": "fr", "French (Québec)": "fr-CA", "German": "de",
  "German (Austrian)": "de-AT", "Greek": "el", "Hindi": "hi", "Icelandic": "is",
  "Indonesian": "id", "Italian": "it", "Japanese": "ja", "Khmer": "km", "Korean": "ko",
  "Malay": "ms", "Mandarin Chinese": "zh-CN", "Mongolian": "mn", "Māori": "mi", "Nepali": "ne",
  "Norwegian": "nb", "Persian": "fa", "Portuguese": "pt", "Russian": "ru", "Sinhala": "si",
  "Spanish": "es", "Swahili": "sw", "Swiss German": "de-CH", "Thai": "th", "Turkish": "tr",
  "Urdu": "ur", "Uzbek": "uz", "Vietnamese": "vi", "Xhosa": "xh",
};
const speechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;
function speakGreeting(g) {
  try {
    if (!speechAvailable || !g?.text) return;
    // Speak the native-script form (before any "(romanization)"), a touch slowly.
    const native = String(g.text).split(" (")[0].trim();
    const u = new SpeechSynthesisUtterance(native);
    const code = SPEECH_LANG[g.language];
    if (code) u.lang = code;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* speech is a nice-to-have; never break gameplay */ }
}
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
  const [musicOn, setMusicOn] = useState(() => { try { return localStorage.getItem("shutterbug.music") !== "off"; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem("shutterbug.music", musicOn ? "on" : "off"); } catch { /* ignore */ } }, [musicOn]);
  // Leaving for the start/passport screens ends the ambient loop.
  useEffect(() => { if (screen === "start" || screen === "passport") MUSIC.stop(); }, [screen]);
  const [pending, setPending] = useState(null); // result popup that pauses play until dismissed
  const [elapsedMs, setElapsedMs] = useState(0); // final game time, shown on the results screen
  const [liveNow, setLiveNow] = useState(0); // ticks while playing so the on-screen timer updates
  const [albumView, setAlbumView] = useState(null); // album photo opened into a big popup
  const [gameMode, setGameMode] = useState("assignments"); // "assignments" | "tour" (Grand Tour)
  const [tourReqs, setTourReqs] = useState([]); // Grand Tour itinerary: [{key,kind,continent,category?,targetId?,anchorId,label,done,filedId?}]
  const [tourOptions, setTourOptions] = useState({}); // Grand Tour: continent -> [city ids to show there]

  // Player profiles (localStorage). profileName === null means "Guest — no saving".
  const [canSave] = useState(() => storageAvailable());
  const [profiles, setProfiles] = useState(() => (canSave ? listProfiles() : []));
  const [profileName, setProfileName] = useState(() => (canSave ? lastProfileName() : null));
  const [newName, setNewName] = useState("");
  const [lastResult, setLastResult] = useState(null); // {isBest, isBestTime} after a recorded game
  const [newBadges, setNewBadges] = useState([]); // achievements newly earned this game
  const [confirmRemove, setConfirmRemove] = useState(false); // passport delete confirmation
  const [passportPage, setPassportPage] = useState("id"); // passport booklet page: id | stamps | collections | badges
  const [avatarEdit, setAvatarEdit] = useState(false);        // avatar editor open (start screen)
  const [modeInfo, setModeInfo] = useState(null);             // which start-screen ⓘ is open
  const [showScores, setShowScores] = useState(false);        // high-scores reveal
  const [researched, setResearched] = useState({}); // assignment step -> revealed research note (Research button)
  const [cityPlan, setCityPlan] = useState(null); // country-layer city step: { ids, wide } (wide = continent view for thin countries)
  const [quiz, setQuiz] = useState(null); // Quiz mode: { questions, i, answeredIdx, score, correctCount, streak, done, best }
  const [expedition, setExpedition] = useState(null); // active themed expedition {id,title,emoji,lesson} (a curated Grand Tour)
  const [guestMet, setGuestMet] = useState(false); // has a guest (no profile) met Grandpa Nigel this session?
  const [dreamPending, setDreamPending] = useState(false); // Grandpa's dream just fulfilled — show the win scene
  const pendingRunRef = useRef(null); // start action to run after the intro story
  const recorded = useRef(false);
  const startRef = useRef(0); // ms timestamp the current game began
  const timer = useRef(null);
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

  const sfx = (name, ...args) => { if (soundOn && SFX[name]) SFX[name](...args); };

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
  const cityOptions = gameMode === "tour" ? (tourOptions[pickedContinent] || [])
    : gameMode === "explore"
      ? (pickedCountry ? ((COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][pickedCountry]) || [])
                       : LOCATIONS.filter((l) => l.continent === pickedContinent).map((l) => l.id))
    : (pickedCountry && cityPlan) ? cityPlan.ids
    : (pickedCountry && COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][pickedCountry]) ? COUNTRY_LOCS[pickedContinent][pickedCountry]
    : (optionsByStep[step] || []);

  // --- Story frame: the very first expedition a traveller sets out on opens
  // with Grandpa Nigel's story (once per profile / once per guest session).
  // Afterward the chosen expedition launches straight away. ----
  const hasMetNigel = () => (profileName ? !!getProfile(profileName)?.metNigel : guestMet);
  // Grandpa's dream is "fulfilled" once you've brought him the world: a stamp on
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

  function startGame() {
    if (musicOn) MUSIC.start();
    const mode = modePlan(difficulty);
    const profile = profileName ? getProfile(profileName) : null;
    // Weighted order surfaces the active player's missed/unmastered places more
    // often (a plain shuffle for guests). Used to fill the non-fresh anchor slots
    // and to pick same-continent city decoys.
    const order = weightedOrder(profile).map((id) => BY_ID[id]);
    const anchors = pickAnchors(profile, order, mode.assignments);
    const { assignmentObjs, options } = makeAssignmentPlan(mode, anchors, order);
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
    setDays(Math.round((cleanCost + mode.slack) * 10) / 10);
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
    startRef.current = Date.now();
    recorded.current = false;
    setMsg({ type: "info", text: "Read Grandpa's note, then pick the right continent on the map." });
    setFlying(null);
    setGameMode("assignments"); setExpedition(null);
    setScreen("play");
  }

  // ---- Grand Tour: build an itinerary of targets across continents on one shared ----
  // ---- day budget, fulfilled in any order. ----
  function startTour() {
    if (musicOn) MUSIC.start();
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
    // continent — real chained routes are usually shorter) + one shot per target,
    // plus buffer for wrong guesses and detours.
    const routeCost = contsUsed.reduce((s, c) => s + flightDays(HUB, CONTINENT_PIN[c]), 0);
    const budget = Math.ceil(routeCost + SHOT_COST * reqs.length + reqs.length + tm.slack);

    setGameMode("tour"); setExpedition(null);
    setTourReqs(reqs);
    setTourOptions(opts);
    setAssignments([]); setOptionsByStep([]); setStep(0);
    setPhase("continent"); setPickedContinent(null); setCurrent(null);
    setDays(budget); setScore(0); setAlbum([]); setVisitedIds([]);
    setRevealed(false); setLastResult(null); setNewBadges([]); setPending(null);
    setElapsedMs(0); startRef.current = Date.now(); recorded.current = false;
    setMsg({ type: "info", text: "Plan your route! Fly to a continent, photograph its targets, then fly on." });
    setFlying(null);
    setScreen("play");
  }

  // ---- Explore mode: no timer, no score, no losing. Fly anywhere, drill into any
  // country, click any place to read its full story (fact, culture card, all three
  // clue tiers). Everywhere you visit is stamped into the passport. ----
  function startExplore() {
    if (musicOn) MUSIC.start();
    setGameMode("explore"); setExpedition(null);
    setTourReqs([]); setTourOptions({});
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
    const routeCost = contsUsed.reduce((s, c) => s + flightDays(HUB, CONTINENT_PIN[c]), 0);
    const budget = Math.ceil(routeCost + SHOT_COST * reqs.length + reqs.length + tm.slack + 2); // a touch more generous — expeditions are for learning
    setExpedition(exp);
    setGameMode("tour");
    setTourReqs(reqs); setTourOptions(opts);
    setAssignments([]); setOptionsByStep([]); setStep(0);
    setPhase("continent"); setPickedContinent(null); setPickedCountry(null); setCityPlan(null); setCurrent(null);
    setDays(budget); setScore(0); setAlbum([]); setVisitedIds([]);
    setRevealed(false); setLastResult(null); setNewBadges([]); setPending(null);
    setElapsedMs(0); setResearched({}); startRef.current = Date.now(); recorded.current = false;
    setMsg({ type: "info", text: `${exp.emoji} ${exp.title}: ${exp.lesson}` });
    setFlying(null); setScreen("play");
  }

  // ---- Quiz mode: 10 multiple-choice geography questions built from the data. ----
  function startQuiz() {
    if (musicOn) MUSIC.start();
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
    const gain = correct ? 100 + Math.max(0, streak - 1) * 20 : 0; // consecutive-correct bonus
    sfx(correct ? "success" : "fail");
    setQuiz({ ...quiz, answeredIdx: idx, score: quiz.score + gain, correctCount: quiz.correctCount + (correct ? 1 : 0), streak, lastGain: gain });
  }
  function nextQuiz() {
    if (!quiz || quiz.answeredIdx === null) return;
    if (quiz.i + 1 >= quiz.questions.length) {
      // The homecoming visit is part of an expedition, not a standalone Quiz —
      // it isn't scored on the quiz leaderboard; it hands off to the results.
      if (quiz.homecoming) { setQuiz(null); setScreen("end"); return; }
      setElapsedMs(Date.now() - startRef.current);
      let best = null;
      if (profileName) { best = recordQuiz(profileName, { score: quiz.score, correct: quiz.correctCount, total: quiz.questions.length }); refreshProfiles(); }
      sfx(quiz.correctCount >= quiz.questions.length * 0.5 ? "win" : "lose");
      setQuiz({ ...quiz, done: true, best });
    } else {
      setQuiz({ ...quiz, i: quiz.i + 1, answeredIdx: null });
    }
  }

  // The homecoming: back from an expedition, Grandpa asks about the places you
  // photographed this trip (seeded from the album), then it hands off to the
  // results screen. Anecdote on a right answer; a gentle line on a wrong one.
  function startHomecoming() {
    const ids = album.map((p) => p.id);
    if (!ids.length) { setScreen("end"); return; }
    const questions = buildQuiz(ids, Math.min(5, ids.length));
    setQuiz({ questions, i: 0, answeredIdx: null, score: 0, correctCount: 0, streak: 0, lastGain: 0, done: false, best: null, homecoming: true });
    setScreen("homecoming");
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
      setMsg({ type: "info", text: "New assignment! Read the clue and pick the continent." });
    } else if (kind === "win" || kind === "lose" || kind === "tour-win" || kind === "tour-lose") {
      startHomecoming();   // visit Grandpa first; the homecoming hands off to the results
    } else if (kind === "wrong" && phase === "city") {
      setCurrent(null);    // clear the wrong shot; back to "pick a city"
      setRevealed(false);
    } else if (kind === "tour-correct" || kind === "tour-wrong") {
      setCurrent(null);    // stay on THIS continent to shoot its other targets, or fly on
      setRevealed(false);
    }
    // wrong continent just closes and leaves you on the world map to try again.
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
        // First time the dream is complete, queue Grandpa's triumphant scene.
        const updated = getProfile(profileName);
        if (updated && !updated.dreamDone && dreamFulfilled(updated)) setDreamPending(true);
      }
    }
    if (screen === "start") recorded.current = false;
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const outOfDays = (subtitle) => {
    setElapsedMs(Date.now() - startRef.current);
    sfx("lose");
    setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Out of travel days!", subtitle, buttonLabel: "See my results" });
  };

  // ---- Continent phase: pick a continent on the world map ----
  function pickContinent(cont) {
    if (phase !== "continent" || flying || pending || (gameMode !== "explore" && days <= 0)) return;
    if (gameMode === "explore") {
      // Free flight; drill into countries where the layer exists, else straight to
      // the places. No wrong answers.
      const from = current ? loc(current) : (pickedContinent ? CONTINENT_PIN[pickedContinent] : HUB);
      const to = CONTINENT_PIN[cont];
      const useCountry = COUNTRY_LAYER_CONTINENTS.has(cont);
      sfx("plane");
      const finalize = () => {
        setFlying(null); setPickedContinent(cont); setPickedCountry(null); setCityPlan(null);
        setPhase(useCountry ? "country" : "city"); setCurrent(null); setRevealed(false);
        setMsg({ type: "info", text: useCountry ? `Welcome to ${cont}! Pick a country to explore.` : `Welcome to ${cont}! Click any place to learn about it.` });
      };
      if (prefersReduced) { finalize(); return; }
      setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
      timer.current = setTimeout(finalize, 850);
      return;
    }
    if (gameMode === "tour") {
      // Grand Tour: fly anywhere you like — it just costs a flight. No "wrong
      // continent"; going somewhere with no targets is simply a wasted trip.
      const from = current ? loc(current) : (pickedContinent ? CONTINENT_PIN[pickedContinent] : HUB);
      const to = CONTINENT_PIN[cont];
      const cost = flightDays(from, to); // distance-based: group nearby continents to save days
      sfx("plane");
      const finalize = () => {
        const nd = Math.round((days - cost) * 10) / 10;
        setDays(nd);
        setFlying(null); setPickedContinent(cont); setPhase("city"); setCurrent(null); setRevealed(false);
        const costTxt = `−${cost} day${cost === 1 ? "" : "s"}`;
        if (nd <= 0) return outOfDays(`You reached ${cont}, but the trip's budget is spent.`);
        const here = tourReqs.filter((r) => !r.done && r.continent === cont).length;
        setMsg(here
          ? { type: "info", text: `Touched down in ${cont} (${costTxt}). ${here} target${here === 1 ? "" : "s"} on your list ${here === 1 ? "is" : "are"} here.` }
          : { type: "warn", text: `Touched down in ${cont} (${costTxt}) — but nothing on your list is here. Fly on when ready.` });
      };
      if (prefersReduced) { finalize(); return; }
      setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
      timer.current = setTimeout(finalize, 850);
      return;
    }
    if (!target) return;
    const from = current ? loc(current) : HUB; // first flight departs from the home hub
    const to = CONTINENT_PIN[cont];
    const cost = flightDays(from, to); // distance-based: farther continents cost more
    const costTxt = `−${cost} day${cost === 1 ? "" : "s"}`;
    if (cont === target.continent) {
      const useCountry = usesCountryLayer(MODES[difficulty], cont);
      sfx("plane");
      const finalize = () => {
        const nd = Math.round((days - cost) * 10) / 10;
        setDays(nd);
        setFlying(null);
        setPickedContinent(cont);
        setPickedCountry(null);
        setPhase(useCountry ? "country" : "city"); // Medium/Hard Europe: pick the country first
        setCurrent(null);   // arrived on the continent; no city picked yet
        setRevealed(false);
        if (nd <= 0) outOfDays(`You reached ${cont}, but the trip's budget is spent.`);
        else setMsg({ type: "info", text: `Touched down in ${cont} (${costTxt}). ${useCountry ? "Now pick the right country." : "Now pick the right city."}` });
      };
      if (prefersReduced) { finalize(); return; }
      setFlying({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
      timer.current = setTimeout(finalize, 850);
    } else {
      const nd = Math.round((days - cost) * 10) / 10; // a wrong continent is a wasted flight
      setDays(nd);
      sfx("fail");
      if (nd <= 0) outOfDays(`${cont} wasn't right, and that was your last day.`);
      else setPending({ kind: "wrong", tone: "bad", emoji: "❌", title: "Not that continent",
        subtitle: `Grandpa's subject isn't in ${cont}. A wasted flight there and back cost you ${cost} day${cost === 1 ? "" : "s"} — read his note and try again.`,
        hint: `Try looking ${compass(CONTINENT_PIN[cont], CONTINENT_PIN[target.continent])} of ${cont}.`,
        buttonLabel: "Try again" });
    }
  }

  // ---- Country phase (Medium/Hard): pick the target's country on the continent ----
  function pickCountry(country) {
    if (phase !== "country" || flying || pending) return;
    if (gameMode === "explore") {
      setPickedCountry(country);
      setCityPlan({ ids: ((COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][country]) || []).slice().sort(() => Math.random() - 0.5), wide: false });
      setPhase("city"); setCurrent(null); setRevealed(false);
      setMsg({ type: "info", text: `${country} — click any place to learn about it.` });
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
      // You picked this country, so the city step shows ONLY its own landmarks —
      // never neighbours from other countries (that made the card say "You're in
      // Austria" while showing German pins). A country with 3+ landmarks zooms in
      // tight; a thinner one keeps the continent view (so the lone pin isn't lost
      // in a hard zoom) but still shows only that country's own places. Countries
      // fill toward 3+ as content is added.
      const own = (COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][country]) || [];
      // Zoom into the country you picked whenever it has a map box; only fall back
      // to the continent view if it doesn't (safety — keeps a lone pin visible).
      const hasBox = !!COUNTRY_META[countryKey(pickedContinent, country)];
      const plan = { ids: own.slice().sort(() => Math.random() - 0.5), wide: !hasBox };
      setCityPlan(plan);
      setPickedCountry(country);
      setPhase("city");
      setCurrent(null);
      setRevealed(false);
      setMsg({ type: "info", text: `Arrived in ${country}. Now photograph Grandpa's subject.` });
    } else {
      const nd = Math.round((days - 0.5) * 10) / 10; // a wrong country costs half a day
      setDays(nd);
      sfx("fail");
      const why = a && a.type === "category"
        ? `We don't have a ${CATEGORIES[a.category].noun} on file to photograph in ${country} — try another country.`
        : `Grandpa's subject isn't in ${country}.`;
      if (nd <= 0) outOfDays(`${country} wasn't right, and that was your last day.`);
      else {
        // Gentle nudge: the first letter of a country that IS right.
        const goal = a && a.type === "category" ? (a.countries || [])[0] : (countriesOf(target)[0]);
        setPending({ kind: "wrongcountry", tone: "bad", emoji: "❌", title: "Not that country",
          subtitle: `${why} Half a day gone — read the clue and the country notes, then try again.`,
          hint: goal ? `The country you're after starts with “${goal[0]}”.` : null,
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
    if (researched[step] || days <= researchCost) return;
    const a = assignments[step];
    if (!a) return;
    const t = a.type === "category" ? loc(a.anchorId) : loc(a.targetId);
    const catNoun = CATEGORIES[t.category].noun;
    const text = a.type === "category"
      ? `Grandpa's guidebook suggests ${t.city}, ${t.country} ${t.flag} in ${t.continent} — its ${catNoun}, ${t.subject}, would be a perfect shot.`
      : `Grandpa's after ${t.subject} — in ${t.city}, ${t.country} ${t.flag} (${t.continent}).`;
    setResearched((r) => ({ ...r, [step]: text }));
    if (researchCost > 0) setDays((d) => Math.round((d - researchCost) * 10) / 10);
    sfx("success");
    setMsg({ type: "info", text: `🔎 Research: ${text}` });
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


    const d = Math.round((days - SHOT_COST) * 10) / 10; // a shot costs half a day
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
          const bonus = Math.round(Math.max(0, d) * 50);
          setScore((s) => s + gain + bonus);
          setElapsedMs(Date.now() - startRef.current);
          sfx("win");
          setPending({ kind: "tour-win", tone: "good", emoji: "🏆", title: "Grand Tour complete!",
            subtitle: `${found} Every target on your itinerary is filed! +${gain}${bonus ? `, plus ${bonus} for ${d} day${d === 1 ? "" : "s"} to spare` : ""}.`,
            fact: clicked.fact, photo: clicked.photo, category: clicked.category, buttonLabel: "See my results 📸" });
        } else if (d <= 0) {
          setScore((s) => s + gain);
          setElapsedMs(Date.now() - startRef.current);
          sfx("lose");
          setPending({ kind: "tour-lose", tone: "bad", emoji: "⏳", title: "Got it — but out of days!",
            subtitle: `${found} (+${gain}) — but that was your last travel day, with ${remaining} still on the list.`,
            fact: clicked.fact, buttonLabel: "See my results" });
        } else {
          setScore((s) => s + gain);
          sfx("success");
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
      const gain = MODES[difficulty].points;
      setAlbum((al) => (al.some((x) => x.id === clicked.id) ? al : [...al, { id: clicked.id, subject: clicked.subject, flag: clicked.flag, city: clicked.city, country: clicked.country, continent: clicked.continent, category: clicked.category, fact: clicked.fact, icon: clicked.icon, photo: clicked.photo, greeting: clicked.greeting }]));
      const found = a.type === "category" ? `You found a ${CATEGORIES[a.category].noun} — ${clicked.subject}!` : `You photographed ${clicked.subject}.`;
      const done = step + 1 >= assignments.length;
      if (done) {
        const bonus = Math.round(Math.max(0, d) * 50);
        setScore((s) => s + gain + bonus);
        setElapsedMs(Date.now() - startRef.current);
        sfx("win");
        setPending({ kind: "win", tone: "good", emoji: "🏆", title: "Trip complete!",
          subtitle: `${found} +${gain}${bonus ? `, plus ${bonus} for ${d} day${d === 1 ? "" : "s"} to spare` : ""}.`,
          fact: clicked.fact, photo: clicked.photo, category: clicked.category, buttonLabel: "See my results 📸" });
      } else if (d <= 0) {
        setScore((s) => s + gain);
        setElapsedMs(Date.now() - startRef.current);
        sfx("lose");
        setPending({ kind: "lose", tone: "bad", emoji: "⏳", title: "Got the shot — but out of days!",
          subtitle: `${found} (+${gain}) — but that spent your last travel day.`,
          fact: clicked.fact, buttonLabel: "See my results" });
      } else {
        setScore((s) => s + gain);
        sfx("success");
        setPending({ kind: "correct", tone: "good", emoji: "✅", title: "Perfect shot!",
          subtitle: `${found} +${gain} points!`,
          fact: clicked.fact, photo: clicked.photo, category: clicked.category, buttonLabel: "Next assignment ✈" });
      }
    } else {
      const wantTxt = a.type === "category" ? `a ${CATEGORIES[a.category].noun}` : target.subject;
      const km = a.type === "specific" ? kmBetween(clicked, target) : null;
      const warmth = km === null ? null
        : km < 400 ? "You're very warm — the right pin is close to where you just shot!"
        : km < 1500 ? "You're warm — the right pin isn't far from there."
        : "You're cold — look at a different part of the map.";
      if (d <= 0) outOfDays(`That's ${clicked.subject}, not ${wantTxt} — and the trip's over.`);
      else {
        sfx("fail");
        setPending({ kind: "wrong", tone: "bad", emoji: "❌", title: "Not the assignment", hint: warmth,
          subtitle: `That's ${clicked.subject}${a.type === "category" ? ` — a ${CATEGORIES[clicked.category].name}` : ""}. The editor wants ${wantTxt}. Half a day gone — pick another city.`,
          buttonLabel: "Keep looking 🔍" });
      }
    }
  }

  // ---------- SCREENS ----------
  const isTour = gameMode === "tour";
  const isExplore = gameMode === "explore";

  // ---------- STORY / INTRO SCREEN (Grandpa Nigel's send-off) ----------
  if (screen === "intro") {
    return <StoryScreen beats={INTRO_BEATS} reduced={prefersReduced} ctaLabel="Take the camera 📷" onDone={finishStory} />;
  }

  // ---------- DREAM FULFILLED (one-time win scene; game continues after) ----------
  if (screen === "dream") {
    return <StoryScreen beats={DREAM_FULFILLED} reduced={prefersReduced} ctaLabel="Keep exploring the world 🌍"
      onDone={() => { if (profileName) setProfileFlag(profileName, "dreamDone", true); setDreamPending(false); refreshProfiles(); setScreen("start"); }} />;
  }

  if (screen === "start") {
    return (
      <Frame>
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center", padding: "8px 4px" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
          {/* Hand-illustrated splash — the title and tagline live in the artwork,
              so no text heading is needed here. */}
          <img src={`${BASE}splash.jpg`} alt="Shutterbug — A World Photo Safari"
            style={{ width: "100%", maxWidth: 620, height: "auto", display: "block", margin: "4px auto 0", borderRadius: 14, boxShadow: "0 4px 16px rgba(74,50,20,0.28)" }} />
          </div>

          {/* One centred column: traveller, then a picture-first grid of mode cards
              (each wearing a landmark photo from the game's own collection), then
              difficulty stamps and one big launch button. Long explanations live
              behind each card's ⓘ. */}
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

          <div style={{ marginTop: 22 }}>
            <Field label="Traveler">
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 460, margin: "0 auto" }}>
                {profiles.map((p) => {
                  const active = p.name === profileName;
                  return (
                    <button key={p.name} onClick={() => { setProfileName(p.name); setLastProfile(p.name); }} aria-pressed={active}
                      style={{ padding: "5px 14px 5px 6px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        display: "inline-flex", alignItems: "center", gap: 7,
                        border: `1.5px solid ${INK}`, background: active ? INK : "transparent", color: active ? PAPER : INK }}>
                      <Avatar spec={avatarFor(p)} size={22} />{p.name}
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
                <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={20} placeholder="New traveler's name" aria-label="New traveler's name"
                  disabled={!canSave}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, fontSize: 14, width: 180, background: "#fff", color: INK }} />
                <button type="submit" disabled={!newName.trim() || !canSave}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: newName.trim() && canSave ? "pointer" : "default", fontWeight: 700, fontSize: 14, background: GREEN, color: "#fff", opacity: newName.trim() && canSave ? 1 : 0.5 }}>
                  ＋ Add
                </button>
              </form>
              {profileName ? (
                <span style={{ display: "inline-flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <button onClick={() => { setConfirmRemove(false); setScreen("passport"); }}
                    style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${CORAL}`, background: "transparent", color: CORAL, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    📕 {profileName}'s passport
                  </button>
                  <button onClick={() => setAvatarEdit(true)}
                    style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    🎨 Style my traveler
                  </button>
                </span>
              ) : (
                <p style={{ fontSize: 12, color: INK, opacity: 0.6, margin: "8px 2px 0" }}>
                  {canSave ? "Guest games aren't saved. Add a name to keep scores and stamps." : "This browser can't save progress, so games won't be recorded."}
                </p>
              )}
            </Field>
          </div>


          {/* ---- Pick a way to play: photo cards ---- */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: INK, opacity: 0.65, marginBottom: 10 }}>PICK A WAY TO PLAY</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(146px, 1fr))", gap: 10 }}>
              {MODE_CARDS.map((c) => {
                const active = gameMode === c.id;
                const src = cardThumb(c.photoId);
                return (
                  <div key={c.id} style={{ position: "relative" }}>
                    <button onClick={() => { setGameMode(c.id); setModeInfo(null); }} aria-pressed={active}
                      style={{ position: "relative", display: "block", width: "100%", height: 108, borderRadius: 12, overflow: "hidden", cursor: "pointer",
                        border: active ? `3px solid ${CORAL}` : `1.5px solid ${PAPER_LINE}`, padding: 0, background: "#20343B", textAlign: "left",
                        boxShadow: active ? "0 4px 14px rgba(233,106,76,0.35)" : "0 2px 8px rgba(74,50,20,0.18)" }}>
                      {src && <img src={src} alt="" aria-hidden="true" loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: active ? 1 : 0.88 }} />}
                      <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(16,38,46,0) 35%, rgba(16,38,46,0.82) 100%)" }} />
                      <span style={{ position: "absolute", left: 9, bottom: 7, color: "#fff", fontWeight: 800, fontSize: 14, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                        <span aria-hidden="true" style={{ fontSize: "1.25em", marginRight: 5, verticalAlign: "-0.1em" }}>{c.emoji}</span>{c.name}
                      </span>
                      {active && <span aria-hidden="true" style={{ position: "absolute", top: 6, left: 8, background: CORAL, color: "#fff", fontWeight: 900, fontSize: 12, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                    </button>
                    <button onClick={() => setModeInfo((m) => (m === c.id ? null : c.id))} aria-expanded={modeInfo === c.id} aria-label={`About ${c.name}`}
                      style={{ position: "absolute", top: 5, right: 5, width: 21, height: 21, borderRadius: "50%", border: "none", cursor: "pointer",
                        background: "rgba(255,255,255,0.9)", color: INK, fontWeight: 900, fontSize: 12, lineHeight: 1 }}>
                      ?
                    </button>
                  </div>
                );
              })}
            </div>
            {modeInfo && (
              <p role="status" style={{ fontSize: 13, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "9px 12px", margin: "10px auto 0", maxWidth: 560, lineHeight: 1.5, textAlign: "left" }}>
                <b>{MODE_CARDS.find((c) => c.id === modeInfo)?.emoji} {MODE_CARDS.find((c) => c.id === modeInfo)?.name}:</b>{" "}
                {MODE_CARDS.find((c) => c.id === modeInfo)?.blurb}
              </p>
            )}
          </div>

          {/* ---- Grand Tour itinerary: classic, or one of the themed expeditions. ---- */}
          {gameMode === "tour" && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: INK, opacity: 0.65, marginBottom: 8 }}>ITINERARY</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
                {TOUR_THEMES.map((t) => {
                  const on = tourTheme === t.id;
                  return (
                    <button key={t.id} onClick={() => setTourTheme(t.id)} aria-pressed={on}
                      style={{ padding: "6px 13px", borderRadius: 16, cursor: "pointer", fontWeight: 700, fontSize: 12.5,
                        border: `1.5px solid ${on ? CORAL : INK}`, background: on ? CORAL : "transparent", color: on ? "#fff" : INK }}>
                      <span aria-hidden="true">{t.emoji} </span>{t.title}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12.5, color: INK, opacity: 0.75, margin: "9px auto 0", maxWidth: 520, lineHeight: 1.45 }}>
                {TOUR_THEMES.find((t) => t.id === tourTheme)?.lesson}
              </p>
            </div>
          )}

          {/* ---- Difficulty stamps (only for the modes that use them) ---- */}
          {(gameMode === "assignments" || gameMode === "tour") && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: INK, opacity: 0.65, marginBottom: 8 }}>
                DIFFICULTY
                <button onClick={() => setModeInfo((m) => (m === "difficulty" ? null : "difficulty"))} aria-expanded={modeInfo === "difficulty"} aria-label="About the difficulty levels"
                  style={{ marginLeft: 7, width: 18, height: 18, borderRadius: "50%", border: `1px solid ${INK}`, background: "transparent", color: INK, fontWeight: 900, fontSize: 10, lineHeight: 1, cursor: "pointer", verticalAlign: "-3px" }}>?</button>
              </div>
              <Toggle options={MODE_ORDER.map((k) => [k, MODES[k].label])} value={difficulty} onChange={setDifficulty} />
              {modeInfo === "difficulty" && (
                <p role="status" style={{ fontSize: 13, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "9px 12px", margin: "10px auto 0", maxWidth: 560, lineHeight: 1.5, textAlign: "left" }}>
                  <b>{MODES[difficulty].label}:</b> {MODES[difficulty].blurb}
                </p>
              )}
            </div>
          )}

          {/* ---- One launch button, labelled for the chosen card ---- */}
          <button
            onClick={gameMode === "quiz" ? startQuiz : gameMode === "explore" ? startExplore
              : gameMode === "tour" ? () => beginWithStory(() => (tourTheme === "classic" ? startTour() : startExpedition(EXPEDITIONS.find((e) => e.id === tourTheme))))
              : () => beginWithStory(startGame)}
            style={primaryBtn}>
            {gameMode === "quiz" ? "Start the quiz 🧠" : gameMode === "explore" ? "Start exploring 🧭"
              : gameMode === "tour" ? (tourTheme === "classic" ? "Start the Grand Tour ✈" : `Start the ${TOUR_THEMES.find((t) => t.id === tourTheme)?.title} 🗺️`)
              : "Begin the assignment ✈"}
          </button>

          {/* ---- High scores, tucked behind a toggle ---- */}
          {canSave && topScores(1).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setShowScores((v) => !v)} aria-expanded={showScores}
                style={{ padding: "8px 18px", borderRadius: 10, border: `1.5px solid ${GOLD}`, background: showScores ? GOLD : "transparent", color: showScores ? INK : "#8A6A14", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                🏆 High scores{showScores ? " ▴" : " ▾"}
              </button>
              {showScores && (() => {
                const leaders = topScores(5);
                return (
                  <div style={{ maxWidth: 400, margin: "12px auto 0", background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 10, padding: "14px 16px", textAlign: "left" }}>
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
                );
              })()}
            </div>
          )}
          </div>
        </div>
        {avatarEdit && profileName && (
          <AvatarEditor name={profileName} initial={getProfile(profileName)?.avatar}
            onSave={(spec) => { setAvatar(profileName, spec); setAvatarEdit(false); refreshProfiles(); sfx("stamp"); }}
            onClose={() => setAvatarEdit(false)} />
        )}
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
            {quiz.best?.isBest && <div style={{ marginTop: 10 }}><span style={{ background: GOLD, color: INK, fontWeight: 800, fontSize: 14, padding: "6px 14px", borderRadius: 20 }}>★ New best quiz score!</span></div>}
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
    return (
      <Frame>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {home && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
              <div aria-hidden="true" style={{ width: 52, height: 52, flex: "none", borderRadius: "50%", background: "radial-gradient(circle at 50% 38%, #F3E4C6, #D8B98A)", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{GRANDPA.emoji}</div>
              <div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.16em", color: CORAL }}>HOME AGAIN · {GRANDPA.name.toUpperCase()}</div>
                <div style={{ color: INK, fontSize: 13.5, lineHeight: 1.4, marginTop: 2 }}>{quiz.i === 0 ? HOMECOMING_INTRO : "And this one — do you remember?"}</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.18em", color: INK, opacity: 0.7 }}>{home ? "🖼" : "🧠"} QUESTION {quiz.i + 1}/{quiz.questions.length}</span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: CORAL }}>{home ? `${quiz.correctCount} right` : `${quiz.score} pts${quiz.streak > 1 ? ` · 🔥${quiz.streak}` : ""}`}</span>
          </div>
          {q.photo && (
            <div style={{ margin: "0 auto 14px", maxWidth: 380, borderRadius: 8, overflow: "hidden", border: `1px solid ${PAPER_LINE}` }}>
              <Photo photo={q.photo} alt="Quiz landmark" size={360} full />
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
                <button key={idx} onClick={() => answerQuiz(idx)} disabled={answered}
                  style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: `2px solid ${bd}`, background: bg, color: INK, fontWeight: 700, fontSize: 15, cursor: answered ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span>{o.label}</span>
                  {answered && isCorrect && <span aria-hidden="true">✅</span>}
                  {answered && isChosen && !isCorrect && <span aria-hidden="true">❌</span>}
                </button>
              );
            })}
          </div>
          {answered && (() => {
            const wasCorrect = q.options[quiz.answeredIdx].correct;
            if (home) {
              const tidbit = (loc && ANECDOTES[loc.id]) || (loc && loc.fact) || "";
              const wrongLine = WRONG_REACTIONS[quiz.i % WRONG_REACTIONS.length];
              return (
                <div style={{ marginTop: 14, background: wasCorrect ? "#EAF6EF" : PAPER, border: `1px solid ${wasCorrect ? GREEN : PAPER_LINE}`, borderRadius: 10, padding: "12px 14px", fontSize: 13.5, color: INK, lineHeight: 1.55 }}>
                  <span aria-hidden="true" style={{ marginRight: 6 }}>{GRANDPA.emoji}</span>
                  <b style={{ color: wasCorrect ? GREEN : CORAL }}>{wasCorrect ? "That's the one!" : wrongLine}</b>{" "}
                  {wasCorrect ? tidbit : q.explain}
                </div>
              );
            }
            return (
              <div style={{ marginTop: 14, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: INK, lineHeight: 1.5 }}>
                <b style={{ color: wasCorrect ? GREEN : CORAL }}>{wasCorrect ? `Correct!${quiz.lastGain ? ` +${quiz.lastGain}` : ""}` : "Not quite."}</b> {q.explain}
              </div>
            );
          })()}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            {home
              ? <button onClick={() => { setQuiz(null); setScreen("end"); }} style={{ background: "none", border: "none", color: INK, opacity: 0.6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Skip to results →</button>
              : <button onClick={() => { setQuiz(null); setGameMode("assignments"); setScreen("start"); }} style={{ background: "none", border: "none", color: INK, opacity: 0.6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Quit</button>}
            {answered && <button onClick={nextQuiz} style={{ ...primaryBtn, margin: 0, padding: "10px 22px" }}>{quiz.i + 1 >= quiz.questions.length ? (home ? "Show him the rest →" : "See results") : "Next question →"}</button>}
          </div>
        </div>
      </Frame>
    );
  }

  // ---------- STREAK RESULTS ----------

  if (screen === "end") {
    const mode = MODES[difficulty];
    const isTourEnd = gameMode === "tour";
    const totalTargets = isTourEnd ? tourReqs.length : assignments.length;
    const maxScore = isTourEnd ? tourMaxScore(tourReqs.length, difficulty) : maxScoreFor(assignments.length, mode);
    // Clamp at 1: distance flights vary slightly by the exact cities visited, so a
    // very efficient route can bank a shade more than the nominal max — never > 100%.
    const pct = maxScore > 0 ? Math.min(1, score / maxScore) : 0;
    const r = rankFor(pct);
    return (
      <Frame>
        {totalTargets > 0 && album.length >= totalTargets && <Confetti reduced={prefersReduced} />}
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Stamp>Roll Developed</Stamp>
          <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.08em", fontSize: 30, color: INK, margin: "10px 0 4px" }}>{album.length} / {totalTargets} shots filed</h2>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: CORAL, fontWeight: 700, margin: "6px 0" }}>{score} pts · ⏱ {fmtTime(elapsedMs)}</p>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.6, margin: "0 0 6px", letterSpacing: "0.06em" }}>{isTourEnd ? "Grand Tour" : "Assignments"} · {mode.label} · {Math.round(pct * 100)}% of a perfect run</p>
          <p style={{ color: INK, fontWeight: 700, marginTop: 6 }}>{r.title}</p>
          <p style={{ color: INK, opacity: 0.7, marginTop: 2 }}>{r.note}</p>

          {profileName && (lastResult?.isBest || lastResult?.isBestTime) && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {lastResult.isBest && (
                <span style={{ background: GOLD, color: INK, fontWeight: 800, fontSize: 14, padding: "6px 14px", borderRadius: 20 }}>★ New best score!</span>
              )}
              {lastResult.isBestTime && (
                <span style={{ background: GREEN, color: "#fff", fontWeight: 800, fontSize: 14, padding: "6px 14px", borderRadius: 20 }}>⏱ New best time!</span>
              )}
            </div>
          )}


          {profileName && newBadges.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: CORAL, marginBottom: 6 }}>🏅 ACHIEVEMENT{newBadges.length > 1 ? "S" : ""} UNLOCKED!</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {newBadges.map((b) => (
                  <span key={b.id} style={{ background: INK, color: PAPER, fontWeight: 800, fontSize: 14, padding: "7px 14px", borderRadius: 20 }}>
                    <span aria-hidden="true" style={{ fontSize: 19 }}>{b.emoji}</span> {b.name}
                  </span>
                ))}
              </div>
              <p style={{ color: INK, fontSize: 13.5, lineHeight: 1.5, margin: "10px auto 0", maxWidth: 420, fontStyle: "italic", opacity: 0.9 }}>
                <span aria-hidden="true">{GRANDPA.emoji} </span>{ACHIEVEMENT_INTRO} {newBadges.length > 1 ? `you've gone and earned ${newBadges.length} keepsakes! I'm putting every one in the album.` : `"${newBadges[0].name}" — that's going straight in the album, that is.`}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 22 }}>
            {album.map((p, i) => (<Polaroid key={`${p.id}-${i}`} p={p} />))}
          </div>

          {dreamPending && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ background: "linear-gradient(160deg, #1C3A5E, #16324E)", color: "#F4E3B8", borderRadius: 12, padding: "14px 18px", maxWidth: 460, margin: "0 auto" }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", marginBottom: 6 }}>🌍 YOU'VE BROUGHT HIM THE WORLD</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#fff" }}>Grandpa Nigel has something to say to you…</p>
                <button onClick={() => setScreen("dream")} style={{ ...primaryBtn, marginTop: 14, background: GOLD, color: INK, boxShadow: "0 4px 0 #A9861E" }}>Go and see Grandpa →</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
            <button onClick={() => setScreen("start")} style={primaryBtn}>New assignment</button>
            {profileName && (
              <button onClick={() => { setConfirmRemove(false); setScreen("passport"); }} style={{ ...primaryBtn, background: "transparent", color: CORAL, border: `2px solid ${CORAL}`, boxShadow: "none" }}>
                📕 View passport
              </button>
            )}
          </div>
        </div>
      </Frame>
    );
  }

  // ---------- THEMED EXPEDITIONS PICKER ----------

  if (screen === "passport") {
    const profile = getProfile(profileName);
    if (!profile) {
      return (
        <Frame>
          <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: INK }}>No traveler selected yet.</p>
            <button onClick={() => setScreen("start")} style={primaryBtn}>Back to start</button>
          </div>
        </Frame>
      );
    }
    const pp = passportData(profile);
    const best = profile.best || {};
    const bt = profile.bestTime || {};
    const badges = achievements(profile);
    const earnedBadges = badges.filter((b) => b.earned).length;
    return (
      <Frame>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div className="sbw-noprint" style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => { setConfirmRemove(false); setScreen("start"); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          </div>

          {/* ---- The passport, as a real booklet: navy cover band + an identity
               "photo page", then tabbed pages for stamps, collections, keepsakes. ---- */}
          <div style={{ background: "linear-gradient(160deg, #1C3A5E, #16324E)", borderRadius: "14px 14px 4px 4px", padding: "18px 22px 16px", color: "#F4E3B8", boxShadow: "0 6px 20px rgba(0,0,0,0.28)", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.3em", fontSize: 13, fontWeight: 700 }}>PASSPORT</div>
              <div aria-hidden="true" style={{ fontSize: 26 }}>🌐</div>
            </div>
            <div style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.16em", fontSize: 10, opacity: 0.7, marginTop: 2 }}>SHUTTERBUG · A WORLD PHOTO SAFARI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, background: "rgba(244,227,184,0.08)", border: "1px solid rgba(244,227,184,0.25)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ background: "#F4E3B8", borderRadius: 6, padding: 3, flex: "none" }}><Avatar spec={avatarFor(profile)} size={48} title={`${profile.name}'s traveler`} /></div>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, letterSpacing: "0.16em", opacity: 0.65 }}>TRAVELER</div>
                <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name}</div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, opacity: 0.8, marginTop: 3 }}>Stamps {pp.masteredCount}/{pp.totalCountries} · Trips {profile.games || 0}</div>
              </div>
              {earnedBadges > 0 && <div style={{ marginLeft: "auto", textAlign: "center", flex: "none" }}><div style={{ fontSize: 24 }}>🏅</div><div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, opacity: 0.85 }}>{earnedBadges}</div></div>}
            </div>
          </div>

          {/* Page tabs */}
          <div className="sbw-noprint" role="tablist" aria-label="Passport pages" style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "12px 0 14px" }}>
            {[["id", "🪪 Identity"], ["stamps", "📖 Stamps"], ["collections", "🗂 Collections"], ["badges", "🏅 Keepsakes"]].map(([id, label]) => {
              const on = passportPage === id;
              return (
                <button key={id} role="tab" aria-selected={on} onClick={() => setPassportPage(id)}
                  style={{ padding: "8px 14px", borderRadius: "9px 9px 0 0", border: `1.5px solid ${on ? CORAL : PAPER_LINE}`, borderBottomWidth: on ? 3 : 1.5, borderBottomColor: on ? CORAL : PAPER_LINE, background: on ? CORAL : "transparent", color: on ? "#fff" : INK, fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
                  {label}
                </button>
              );
            })}
          </div>

          {passportPage === "id" && (<>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard label="Stamps earned" value={`${pp.masteredCount} / ${pp.totalCountries}`} />
            <StatCard label="Countries visited" value={`${pp.visitedCount}`} />
            <StatCard label="Trips taken" value={`${profile.games || 0}`} />
            <StatCard label="Best · Easy" value={best.easy ? String(best.easy) : "—"} />
            <StatCard label="Best · Medium" value={best.medium ? String(best.medium) : "—"} />
            <StatCard label="Best · Hard" value={best.hard ? String(best.hard) : "—"} />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.12em", color: INK, opacity: 0.6 }}>⏱ BEST TIMES</span>
            {MODE_ORDER.map((k) => (
              <span key={k} style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 14, padding: "4px 10px" }}>
                {MODES[k].label}: {bt[k] ? fmtTime(bt[k]) : "—"}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(pp.continents).sort().map(([k, v]) => (
              <span key={k} style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 14, padding: "4px 10px" }}>
                {k}: {v.mastered}/{v.total}
              </span>
            ))}
          </div>

          </>)}

          {passportPage === "collections" && (<>
          {/* Collections — one card per subject category, with progress. */}
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, margin: "4px 0 10px" }}>COLLECTIONS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.entries(KIND_META).map(([k, meta]) => {
              const kk = pp.kinds[k] || { mastered: 0, total: 0 };
              return (
                <span key={k} style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 700, color: INK, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 14, padding: "5px 12px" }}>
                  <span aria-hidden="true" style={{ fontSize: 17 }}>{meta.emoji}</span> {meta.name}: {kk.mastered}/{kk.total}
                </span>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            {CATEGORY_ORDER.map((cat) => {
              const c = CATEGORIES[cat];
              const col = pp.collections.find((x) => x.category === cat) || { mastered: 0, total: 0 };
              const done = col.total > 0 && col.mastered === col.total;
              const pct = col.total ? Math.round((col.mastered / col.total) * 100) : 0;
              return (
                <div key={cat} style={{ background: "#fff", border: `2px solid ${done ? c.color : PAPER_LINE}`, borderRadius: 8, padding: "10px 12px", opacity: col.mastered ? 1 : 0.7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                    <span style={{ fontWeight: 800, color: INK, fontSize: 13, lineHeight: 1.2 }}><span aria-hidden="true" style={{ fontSize: 18 }}>{c.emoji}</span> {c.name}</span>
                    {done && <span title="Collection complete!" aria-label="complete" style={{ fontSize: 13 }}>⭐</span>}
                  </div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.7, marginTop: 5 }}>{col.mastered} / {col.total}{done ? "" : ""}</div>
                  <div style={{ height: 6, background: PAPER, borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.color, transition: "width .3s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          </>)}

          {passportPage === "badges" && (<>
          {/* Achievements — long-term keepsakes earned across games. */}
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, margin: "4px 0 10px" }}>KEEPSAKES <span style={{ opacity: 0.7 }}>— {earnedBadges}/{badges.length}</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.slice().sort((a, b) => (b.earned - a.earned) || (b.have / b.need - a.have / a.need)).map((b) => (
              <div key={b.id} title={b.earned ? "Earned!" : `${b.have} / ${b.need}`}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 20,
                  background: b.earned ? GOLD : PAPER, border: `1.5px solid ${b.earned ? GOLD : PAPER_LINE}`,
                  color: INK, opacity: b.earned ? 1 : 0.75 }}>
                <span aria-hidden="true" style={{ fontSize: 22, filter: b.earned ? "none" : "grayscale(1)" }}>{b.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{b.name}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, opacity: 0.7 }}>{b.earned ? "★" : `${b.have}/${b.need}`}</span>
              </div>
            ))}
          </div>

          </>)}

          {passportPage === "stamps" && (<>
          {/* ---- STICKER BOOK: one page per continent, one slot per country. ----
               A mastered country's slot fills with the photo the traveller actually
               earned there — the gaps are the invitation to keep flying. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 4px", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6 }}>STICKER BOOK</span>
            <button onClick={() => window.print()} className="sbw-noprint"
              style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              🖨 Print passport
            </button>
          </div>
          {STICKER_PAGES.map(({ continent, countries }) => {
            const done = countries.filter((c) => pp.byCountry[c.country]?.mastered).length;
            return (
              <section key={continent} style={{ marginTop: 14, breakInside: "avoid" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontWeight: 900, color: INK, fontSize: 16 }}>{continent}</span>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: done === countries.length ? GREEN : INK, opacity: done === countries.length ? 1 : 0.6 }}>
                    {done}/{countries.length} countries{done === countries.length ? " · page complete! ⭐" : ""}
                  </span>
                  <span aria-hidden="true" style={{ flex: 1, borderBottom: `1px dashed ${PAPER_LINE}` }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 10, alignItems: "start" }}>
                  {countries.map((slot) => {
                    const st = pp.byCountry[slot.country];
                    const total = pp.countryLocTotals[slot.country] || 0;
                    const state = st?.mastered ? "mastered" : st?.visited ? "visited" : "locked";
                    return (
                      <div key={slot.country} style={{
                        background: "#fff", borderRadius: 8, padding: 9, minHeight: 92,
                        border: state === "mastered" ? `2px solid ${CORAL}` : `2px dashed ${PAPER_LINE}`,
                        opacity: state === "locked" ? 0.55 : 1,
                        transform: state === "mastered" ? `rotate(${(slot.country.charCodeAt(0) % 5) - 2}deg)` : "none",
                        breakInside: "avoid" }}>
                        {state === "mastered" && st.photo && (
                          <div style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 4, overflow: "hidden", background: "#DCE9EC", marginBottom: 6 }}>
                            <img src={st.photo.src} alt={st.photo.subject} decoding="async"
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span aria-hidden="true" style={{ fontSize: 22, filter: state === "locked" ? "grayscale(1)" : "none" }}>{slot.flag}</span>
                          <span style={{ fontWeight: 800, color: INK, fontSize: 12.5, lineHeight: 1.15 }}>{slot.country}</span>
                        </div>
                        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.06em", marginTop: 4,
                          color: state === "mastered" ? CORAL : INK, opacity: state === "mastered" ? 1 : 0.55 }}>
                          {state === "mastered" ? `★ ${st.locsMastered}/${total} place${total === 1 ? "" : "s"} shot`
                            : state === "visited" ? "✓ visited — no shot yet"
                            : `${total} place${total === 1 ? "" : "s"} to find`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          </>)}

          {/* Remove traveller — two-step so it can't be clicked by accident. */}
          <div className="sbw-noprint" style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${PAPER_LINE}`, textAlign: "center" }}>
            {confirmRemove ? (
              <div>
                <p style={{ color: INK, fontWeight: 700, margin: "0 0 4px" }}>Remove {profile.name}?</p>
                <p style={{ color: INK, opacity: 0.7, fontSize: 13, margin: "0 0 12px" }}>This permanently erases {profile.name}'s stamps, scores, and best times. This can't be undone.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => { deleteProfile(profile.name); setConfirmRemove(false); setProfileName(null); refreshProfiles(); setScreen("start"); }}
                    style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: CORAL, color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 3px 0 #A93A28" }}>
                    Yes, remove
                  </button>
                  <button onClick={() => setConfirmRemove(false)}
                    style={{ padding: "10px 18px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmRemove(true)}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, background: "transparent", color: INK, opacity: 0.7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Remove this traveler…
              </button>
            )}
          </div>
        </div>
      </Frame>
    );
  }

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
        : `In ${asg.continent.toUpperCase()}, find any ${catMeta.noun} on Grandpa's list and photograph it — you pick which one!`)
    : (target ? (target[tier] || target.hard) : ""));
  const inCountry = phase === "country";
  const inCity = phase === "city";
  // Which country the traveller is "in" right now, for the country card. Easy
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
  // Where a location's pin sits on the current plate (polar for Antarctica, shifted
  // across the antimeridian for Pacific-centred Oceania, else the plain map coords).
  const pinXY = (l) => plateMode === "polar" ? antPlate(l.id)
    : { x: (plateMode === "wrap" && l.x < 180) ? l.x + 360 : l.x, y: l.y };
  // The world map fills a SQUARE frame (preserveAspectRatio="none"), stretched to
  // fit. Zoomed in, the frame instead takes the BOX's aspect ratio, so a continent
  // whose content isn't square (Oceania) is shown undistorted rather than padded
  // out with ocean. Square boxes — every other continent, and every country zoom —
  // are unaffected: their aspect is 1.
  const aspect = zoomed ? box.w / box.h : 1;
  const frameAspect = zoomed ? `${box.w} / ${box.h}` : "1 / 1";
  // Pins are ellipses sized so they render as perfect CIRCLES of a steady on-screen
  // size at every zoom. On-screen rx = rx_user·(W/box.w) and ry = ry_user·(H/box.h);
  // setting ry_user = k·box.h·(W/H) makes both equal k·W. W/H is the frame aspect.
  const pinR = (k) => ({ rx: k * box.w, ry: k * box.h * aspect });
  const busy = !!flying || !!pending || (!isExplore && days <= 0);
  return (
    <Frame>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Field journal panel */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.18em", color: INK, opacity: 0.7, display: "inline-flex", alignItems: "center", gap: 7 }}>{profileName && <Avatar spec={avatarFor(getProfile(profileName))} size={22} />}{isExplore ? "🧭 EXPLORE" : isTour ? `GRAND TOUR · ${tourReqs.filter((r) => r.done).length}/${tourReqs.length} filed` : `ASSIGNMENT ${step + 1}/${assignments.length}`}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSoundOn((s) => !s)} aria-label={soundOn ? "Turn sound off" : "Turn sound on"} aria-pressed={soundOn} title={soundOn ? "Sound on" : "Sound off"}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 2, color: INK, opacity: 0.75 }}>
                {soundOn ? "🔊" : "🔇"}
              </button>
              <button onClick={() => setMusicOn((m) => { const v = !m; if (v) MUSIC.start(); else MUSIC.stop(); return v; })}
                aria-label={musicOn ? "Turn music off" : "Turn music on"} aria-pressed={musicOn} title={musicOn ? "Music on" : "Music off"}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 2, color: INK, opacity: musicOn ? 0.75 : 0.45 }}>
                {musicOn ? "🎵" : <span style={{ textDecoration: "line-through" }}>🎵</span>}
              </button>
              <button onClick={() => setAnimOn((v) => !v)}
                aria-label={animOn ? "Turn animations off" : "Turn animations on"} aria-pressed={animOn} title={animOn ? "Animations on" : "Animations off"}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 2, color: INK, opacity: animOn ? 0.75 : 0.45 }}>
                {animOn ? "✨" : <span style={{ textDecoration: "line-through" }}>✨</span>}
              </button>
              {isExplore ? (
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: OCEAN }} title="Places you've discovered">📸 {album.length} discovered</span>
              ) : (<>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: INK, opacity: 0.75 }} title="Time on this trip">⏱ {fmtTime(Math.max(0, liveNow - startRef.current))}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: days <= 1 ? CORAL : INK }}>◷ {days} day{days === 1 ? "" : "s"} left</span>
              </>)}
            </div>
          </div>

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
            </>
          ) : (
          <div style={{ background: PAPER, border: `1px dashed ${CORAL}`, borderRadius: 6, padding: "14px 16px", position: "relative" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: CORAL, marginBottom: 8 }}>{NOTE_HEADER}</div>
            {(isCatAsg || namesSubject) ? (
              <>
                <p style={{ margin: 0, color: INK, lineHeight: 1.5, fontSize: 15 }}>Bring me a photo of <b>{promptSubject}</b>.{showTypeBadge && badgeCat && <> <CategoryBadge category={badgeCat} size="sm" style={{ verticalAlign: "middle" }} /></>}</p>
                <p style={{ margin: "8px 0 0", color: INK, opacity: 0.85, lineHeight: 1.5, fontSize: 14, fontStyle: "italic" }}>{clue}</p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, color: INK, lineHeight: 1.5, fontSize: 15 }}>{clue}</p>
                {showTypeBadge && badgeCat && <div style={{ marginTop: 10 }}><CategoryBadge category={badgeCat} size="sm" style={{ verticalAlign: "middle" }} /></div>}
              </>
            )}
          </div>
          )}

          {/* Research: buy the answer (assignments only). Free on Easy, ½ day on
              Medium, unavailable on Hard. */}
          {!isTour && !isExplore && mode.research !== "off" && (researched[step] ? (
            <div style={{ marginTop: 10, background: "#EAF1F2", border: `1px solid ${OCEAN}`, borderRadius: 6, padding: "10px 12px", fontSize: 13, color: INK, lineHeight: 1.45 }}>
              <b style={{ color: OCEAN }}>📖 {GUIDEBOOK.notesLabel}</b> {researched[step]}
            </div>
          ) : (() => {
            const disabled = busy || days <= researchCost;
            return (
            <button onClick={doResearch} disabled={disabled}
              title={researchCost > 0 ? GUIDEBOOK.tipCost : GUIDEBOOK.tipFree}
              style={{ marginTop: 10, padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13,
                cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>
              📖 {GUIDEBOOK.button} <span style={{ opacity: 0.75, fontWeight: 600 }}>({researchCost > 0 ? "½ day" : "free"})</span>
            </button>
            );
          })())}

          {msg && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 6, fontSize: 14, lineHeight: 1.4,
              background: msg.type === "win" ? "#EAF6EF" : msg.type === "lose" ? "#FBEAE6" : msg.type === "warn" ? "#FCF3E0" : "#EAF1F2",
              color: INK, border: `1px solid ${msg.type === "win" ? GREEN : msg.type === "lose" ? CORAL : msg.type === "warn" ? GOLD : OCEAN}` }}>
              {msg.text}
            </div>
          )}

          {/* Context card by phase */}
          {inCity && currentLoc && revealed ? (
            <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6 }}>YOUR SHOT</div>
              <div style={{ margin: "8px 0", position: "relative", overflow: "hidden", borderRadius: 4 }}>
                {/* The film "develops": washed-out and grey at first, colour blooming in.
                    Shown at the image's own aspect ratio — cover-cropping cut wide
                    subjects (all of Victoria Falls) down to a slice. */}
                <div key={`dev${flashKey}`} className={prefersReduced ? undefined : "sbw-develop"}>
                  <img src={withWidth(currentLoc.photo?.src, 1600)} alt={currentLoc.subject}
                    style={{ width: "100%", maxHeight: 560, objectFit: "contain", display: "block", borderRadius: 4, background: "#10262E" }} />
                </div>
                {flashKey > 0 && !prefersReduced && <div key={flashKey} className="sbw-flash" />}
              </div>
              <PhotoCredit photo={currentLoc.photo} style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }} />
              <div style={{ fontWeight: 700, color: INK }}><span style={{ fontSize: "1.5em", verticalAlign: "-0.08em" }}>{currentLoc.flag}</span> {currentLoc.city}, {currentLoc.country}</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.7, marginTop: 2 }}>{currentLoc.subject}</div>
              <CountryCard country={currentLoc.country} />
              {isExplore && (
                <div style={{ marginTop: 10, textAlign: "left" }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}><CategoryBadge category={currentLoc.category} size="sm" /></div>
                  <div style={{ background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 6, padding: "9px 11px", fontSize: 13, color: INK, lineHeight: 1.5 }}>
                    <b style={{ color: CORAL }}>Did you know?</b> {currentLoc.fact}
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
          ) : inCity ? (
            <div style={{ marginTop: 12, background: "#fff", border: `1px dashed ${CORAL}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28 }} aria-hidden="true">📸</div>
              <div style={{ fontWeight: 800, color: INK, marginTop: 4 }}><span style={{ fontSize: "1.3em", verticalAlign: "-0.08em" }}>{ctxCountry ? COUNTRY_FLAG[ctxCountry] : ""}</span> You're in {ctxCountry || pickedContinent}!</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 6, lineHeight: 1.45 }}>
                {isTour ? "Photograph any target on your itinerary that's here, then fly on." : "Click the right city on the map to photograph Grandpa's subject."}
              </div>
              <CountryCard country={ctxCountry} />
              {isTour && (
                <button onClick={() => { if (!busy) { setPhase("continent"); setRevealed(false); setMsg({ type: "info", text: "Pick the next continent to fly to." }); } }} disabled={busy}
                  style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer" }}>
                  ✈ Fly to another continent
                </button>
              )}
            </div>
          ) : inCountry ? (
            <div style={{ marginTop: 12, background: "#fff", border: `1px dashed ${CORAL}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28 }} aria-hidden="true">🗺️</div>
              <div style={{ fontWeight: 800, color: INK, marginTop: 4 }}>You're in {pickedContinent}!</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 6, lineHeight: 1.45 }}>
                Which country does the clue point to? Click it on the map.
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12, background: "#fff", border: `1px dashed ${CORAL}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28 }} aria-hidden="true">🌍</div>
              <div style={{ fontWeight: 800, color: INK, marginTop: 4 }}>{isTour ? "Where to next?" : "Which continent?"}</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 6, lineHeight: 1.45 }}>
                {isTour
                  ? "Pick a continent to fly to — farther flights cost more days. Group nearby targets to save days!"
                  : `${current ? `Departing ${currentLoc.flag} ${currentLoc.city}. ` : ""}Read the clue, then click the continent it points to — farther flights cost more travel days.`}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: "3 1 620px", minWidth: 440 }}>
          {/* Desktop-first: the map is the star, so let it grow to ~840px wide. */}
          <div style={{ position: "relative", aspectRatio: frameAspect, maxWidth: 840, marginInline: "auto", borderRadius: 10, overflow: "hidden", border: `2px solid ${INK}`, boxShadow: "0 6px 0 rgba(16,38,46,0.15)" }}>
            <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", background: zoomed ? "#0b1a2e" : PAPER }}>
              <defs>
                <pattern id="sea" width="360" height="180" patternUnits="userSpaceOnUse">
                  <rect width="360" height="180" fill={OCEAN} />
                  {[...Array(7)].map((_, i) => <line key={i} x1="0" y1={i * 30} x2="360" y2={i * 30} stroke={OCEAN_DEEP} strokeWidth="0.4" />)}
                  {[...Array(13)].map((_, i) => <line key={"v" + i} x1={i * 30} y1="0" x2={i * 30} y2="180" stroke={OCEAN_DEEP} strokeWidth="0.4" />)}
                </pattern>
              </defs>
              {/* World step: stylised ocean band (0..180) with blank letterbox margins
                  top/bottom. City step: a topographic relief plate for the chosen
                  continent — the equirectangular Blue Marble (cropped by the viewBox),
                  drawn twice for Pacific-centred Oceania, or the south-polar image for
                  Antarctica so it shows the true round continent. */}
              {zoomed ? (
                plateMode === "polar" ? (
                  <image href={`${BASE}relief-antarctica.jpg`} xlinkHref={`${BASE}relief-antarctica.jpg`} x="0" y="0" width={ANT_PLATE} height={ANT_PLATE} preserveAspectRatio="none" />
                ) : plateMode === "wrap" ? (
                  <g>
                    <image href={`${BASE}relief-world.jpg`} xlinkHref={`${BASE}relief-world.jpg`} x="0" y="0" width="360" height="180" preserveAspectRatio="none" />
                    <image href={`${BASE}relief-world.jpg`} xlinkHref={`${BASE}relief-world.jpg`} x="360" y="0" width="360" height="180" preserveAspectRatio="none" />
                  </g>
                ) : (
                  <image href={`${BASE}relief-world.jpg`} xlinkHref={`${BASE}relief-world.jpg`} x="0" y="0" width="360" height="180" preserveAspectRatio="none" />
                )
              ) : (
                <>
                {/* Robinson world map: the ocean outline, a light graticule, then each
                    continent as one clickable colour-coded region. */}
                <path d={ROBINSON_OUTLINE} fill={OCEAN} stroke={OCEAN_DEEP} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                <g stroke={OCEAN_DEEP} strokeWidth="0.4" fill="none" opacity="0.5" vectorEffect="non-scaling-stroke">
                  {ROBINSON_GRATICULE.map((d, i) => <path key={i} d={d} />)}
                </g>
                {CONTINENTS.map((cont) => (
                  <g key={cont} className="sbw-cont" role="button" tabIndex={busy ? -1 : 0}
                     aria-label={`Choose ${cont}`} onClick={() => pickContinent(cont)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickContinent(cont); } }}
                     style={{ cursor: busy ? "default" : "pointer" }}>
                    {WORLD_COUNTRIES_ROBINSON.filter((c) => COUNTRY_CONTINENT[c.name] === cont).map((c) => (
                      <path key={c.name} d={c.d} fill={CONTINENT_COLOR[cont]} fillRule="evenodd" stroke={INK} strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                    ))}
                  </g>
                ))}
                </>
              )}

              {/* Country step (Medium/Hard): clickable country regions over the
                  continent relief, each labelled — pick the one the clue points to. */}
              {inCountry && (() => {
                const list = (asg && asg.countries) || LAYER_COUNTRY_LIST[pickedContinent] || [];
                // Melanesia's markers sit a few degrees apart, so their labels used to
                // print on top of one another. Walk them left-to-right and lift each
                // label just far enough to clear the labels already placed — testing
                // the real rectangles, so a distant country (New Zealand, far south)
                // never gets bumped up merely for sharing a column with Fiji.
                // Lay out every country label so none overlaps. Each label wants to
                // sit just above its country; if that spot is taken it steps up, then
                // down, then further up/down (alternating, so the stack stays compact
                // and near the country and doesn't run off the top of the plate). Size
                // estimates err GENEROUS — monospace advance + the paint-order stroke
                // halo + a gap — so what the layout thinks fits really does.
                const CHAR_W = 0.0195, STEP = 0.05, PAD = 0.006 * box.w; // box.w / box.h units
                const topLim = box.y + 0.018 * box.h, botLim = box.y + box.h - 0.018 * box.h;
                const placed = [];
                const yOf = {};              // country -> chosen text baseline y
                const baseY = (cm) => cm.cy - 0.032 * box.h; // its preferred spot
                for (const country of [...list].sort((a, b) => {
                  const A = COUNTRY_META[countryKey(pickedContinent, a)], B = COUNTRY_META[countryKey(pickedContinent, b)];
                  return (A ? A.cx : 0) - (B ? B.cx : 0);
                })) {
                  const cm = COUNTRY_META[countryKey(pickedContinent, country)];
                  if (!cm) continue;
                  const halfW = (country.length * CHAR_W * box.w) / 2 + PAD;
                  const top = (y) => y - 0.034 * box.h, bot = (y) => y + 0.010 * box.h; // label's visual box
                  const hits = (y) => placed.some((q) => cm.cx - halfW < q.r && cm.cx + halfW > q.l && top(y) < q.b && bot(y) > q.t);
                  const within = (y) => top(y) >= topLim && bot(y) <= botLim;
                  const cands = [baseY(cm)];
                  for (let k = 1; k <= 9; k++) { cands.push(cm.cy - (0.032 + k * STEP) * box.h); cands.push(cm.cy + (0.030 + (k - 1) * STEP) * box.h); }
                  let y = cands.find((c) => within(c) && !hits(c));
                  if (y === undefined) y = cands.find((c) => !hits(c)) ?? baseY(cm); // last resort
                  placed.push({ l: cm.cx - halfW, r: cm.cx + halfW, t: top(y), b: bot(y) });
                  yOf[country] = y;
                }
                const wrapPlate = plateMode === "wrap";
                // Hard mode hides the names on outline continents — tell them apart by
                // shape + the hover highlight. Marker (Oceania) steps keep labels.
                const showLabels = wrapPlate || mode.clue !== "hard";
                // First pass: the clickable country region (outline or marker), no
                // text — labels come in a second pass so no region can cover a label.
                const regions = list.map((country) => {
                  const cm = COUNTRY_META[countryKey(pickedContinent, country)];
                  if (!cm) return null;
                  const d = wcPath(country);
                  return (
                    <g key={country} className="sbw-country" role="button" tabIndex={busy ? -1 : 0}
                       aria-label={`Choose ${country}`} onClick={() => pickCountry(country)}
                       onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickCountry(country); } }}
                       style={{ cursor: busy ? "default" : "pointer" }}>
                      {(!wrapPlate && d)
                        ? <path d={d} fillRule="evenodd" fill="rgba(244,236,216,0.16)" stroke={PAPER} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        : <ellipse cx={cm.cx} cy={cm.cy} {...pinR(0.028)} fill="rgba(240,165,0,0.55)" stroke={PAPER} strokeWidth="1" vectorEffect="non-scaling-stroke" />}
                    </g>
                  );
                });
                // Second pass, EVERY continent: labels lifted into collision-free
                // lanes (computed above) with a hairline leader back to the country,
                // so no two country names ever overlap on any continent map.
                const labels = showLabels ? list.map((country) => {
                  const cm = COUNTRY_META[countryKey(pickedContinent, country)];
                  if (!cm) return null;
                  const y = yOf[country] ?? baseY(cm);
                  const moved = Math.abs(y - baseY(cm)) > 0.006 * box.h; // needs a leader?
                  const above = y < cm.cy;
                  return (
                    <g key={"lbl" + country} style={{ pointerEvents: "none" }}>
                      {moved && (
                        <line x1={cm.cx} y1={above ? cm.cy - 0.03 * box.h : cm.cy + 0.02 * box.h}
                          x2={cm.cx} y2={above ? y + 0.006 * box.h : y - 0.026 * box.h}
                          stroke={PAPER} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.8" />
                      )}
                      <text x={cm.cx} y={y} fontSize={0.03 * box.h} fontFamily="ui-monospace, monospace" fontWeight="800" fill={INK} textAnchor="middle"
                        style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 0.012 * box.h }}>{country}</text>
                    </g>
                  );
                }) : [];
                return regions.concat(labels);
              })()}

              {/* departure city marker on the world map (Robinson coords) */}
              {!zoomed && currentLoc && (() => {
                const d = eqToRobinson(currentLoc.x, currentLoc.y);
                return (
                <g>
                  <ellipse cx={d.x} cy={d.y} {...pinR(0.008)} fill={CORAL} stroke={INK} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <ellipse cx={d.x} cy={d.y} {...pinR(0.014)} fill="none" stroke={CORAL} strokeWidth="1" vectorEffect="non-scaling-stroke" className="sbw-ping" />
                </g>
                );
              })()}

              {/* flight to the chosen continent (Robinson coords): a great-circle-ish
                  arc — the route bows toward the pole like a real flight path, and the
                  plane banks along it (offset-rotate defaults to auto). */}
              {flying && (() => {
                const a = eqToRobinson(flying.fromX, flying.fromY), b = eqToRobinson(flying.toX, flying.toY);
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
                  <path d={d} fill="none" stroke={CORAL} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                  <g style={{ animation: "sbw-fly 0.85s ease-in-out forwards", offsetPath: `path('${d}')` }}>
                    {/* scaleY cancels the map's vertical stretch so the plane isn't squished tall */}
                    <text fontSize="9" fill={CORAL} transform={`scale(1 ${(box.h / box.w).toFixed(3)})`}>✈</text>
                  </g>
                </g>
                );
              })()}

              {/* Highlight the country you're standing in (city step): its coral
                  border teaches the player the country's shape and where it sits on
                  the continent. Only outline continents have a usable shape. */}
              {inCity && pickedCountry && plateMode !== "wrap" && wcPath(pickedCountry) && (
                <path d={wcPath(pickedCountry)} fillRule="evenodd" fill="rgba(240,165,0,0.12)" stroke={CORAL} strokeWidth="1.8" vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }} />
              )}

              {/* city pins (city phase): the target + same-continent decoys. Each pin
                  carries its subject's CATEGORY EMOJI on a light disc — a colour-blind-
                  safe, at-a-glance clue to what kind of place it is (mountain, temple…),
                  so the player can match it against the editor's clue. */}
              {inCity && cityOptions.map((id) => {
                const l = loc(id);
                const { x: px, y: py } = pinXY(l);
                const isCurrent = id === current;
                const alwaysLabel = mode.labels === "all" || isCurrent;
                const emoji = (CATEGORIES[l.category] || {}).emoji || "📍";
                return (
                  <g key={id} className={`sbw-pin${alwaysLabel ? "" : " sbw-pin--hide"}`}
                     role="button" tabIndex={busy ? -1 : 0}
                     aria-label={`Photograph ${l.city}, ${l.country} (${(CATEGORIES[l.category] || {}).name || "place"})`}
                     onClick={() => photographCity(id)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photographCity(id); } }}
                     style={{ cursor: busy ? "default" : "pointer" }}>
                    <ellipse cx={px} cy={py} {...pinR(0.026)} fill="transparent" />
                    <ellipse cx={px} cy={py} {...pinR(isCurrent ? 0.02 : 0.017)} fill={isCurrent ? "rgba(233,92,66,0.22)" : "rgba(255,255,255,0.78)"} stroke={isCurrent ? CORAL : INK} strokeWidth={isCurrent ? "1.4" : "1"} vectorEffect="non-scaling-stroke" />
                    {isCurrent && <ellipse cx={px} cy={py} {...pinR(0.026)} fill="none" stroke={CORAL} strokeWidth="1" vectorEffect="non-scaling-stroke" className="sbw-ping" />}
                    <text x={px} y={py} fontSize={0.028 * box.h} textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: "none" }}>{emoji}</text>
                    <text className="sbw-label" x={px + 0.022 * box.w} y={py - 0.02 * box.h} fontSize={0.02 * box.h} fontFamily="ui-monospace, monospace" fill={INK} style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 0.006 * box.h }}>{l.city}</text>
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
                const sz = (zoomed ? 0.032 : 0.024) * box.h;
                return (
                  <text key={"star" + p.id} x={pos.x} y={pos.y} fontSize={sz} textAnchor="middle" dominantBaseline="central"
                    fill="#2E6FC9" style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: sz * 0.26, pointerEvents: "none" }}>★</text>
                );
              })}
            </svg>

          </div>
          {/* Album strip — under the map so the layout is symmetric. */}
          {album.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, marginBottom: 6 }}>ALBUM <span style={{ opacity: 0.7, letterSpacing: 0 }}>— tap a photo to revisit it</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {album.map((p, i) => (
                  <button key={`${p.id}-${i}`} onClick={() => setAlbumView(p)} title={`${p.subject} — ${p.city}`} aria-label={`Revisit ${p.subject}, ${p.city}`}
                    style={{ width: 46, height: 52, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)", cursor: "pointer" }}>
                    <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={34} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


      {pending && <ResultModal data={pending} onContinue={continueFromResult} reduced={prefersReduced} />}
      {albumView && <LandmarkModal p={albumView} onClose={() => setAlbumView(null)} reduced={prefersReduced} />}
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
function Frame({ children }) {
  return (
    <div style={{ minHeight: "100%", position: "relative", padding: 18, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <style>{`
        /* Whole-continent highlight when hovering or keyboard-focusing a region. */
        .sbw-cont{ outline: none; }
        .sbw-cont path{ transition: filter .12s ease; }
        .sbw-cont:hover path,
        .sbw-cont:focus-visible path{ filter: brightness(1.15) saturate(1.15); stroke-width: 0.8; }
        .sbw-country{ outline: none; }
        .sbw-country path, .sbw-country ellipse{ transition: fill .12s ease; }
        .sbw-country:hover path,
        .sbw-country:focus-visible path{ fill: rgba(240,165,0,0.42); }
        .sbw-country:hover ellipse,
        .sbw-country:focus-visible ellipse{ fill: rgba(240,165,0,0.92); }
        .sbw-pin{ outline: none; }
        .sbw-pin ellipse:nth-child(2){ transition: transform .12s ease; transform-box: fill-box; transform-origin: center; }
        .sbw-pin:hover ellipse:nth-child(2){ transform: scale(1.45); }
        /* Visible keyboard-focus state on the pin dot. */
        .sbw-pin:focus-visible ellipse:nth-child(2){ transform: scale(1.45); stroke: ${CORAL}; stroke-width: 2; }
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
        /* Result popup pop-in. */
        .sbw-pop{ animation: sbw-pop 0.22s cubic-bezier(.2,.8,.3,1.2); }
        @keyframes sbw-pop{ 0%{ transform: scale(0.82); opacity: 0 } 100%{ transform: scale(1); opacity: 1 } }
        /* Photo develops like film: washed-out grey blooming into full colour. */
        .sbw-develop{ animation: sbw-develop 1.5s ease-out both; }
        @keyframes sbw-develop{
          0%{ filter: brightness(2.1) saturate(0) contrast(0.75) sepia(0.35) }
          40%{ filter: brightness(1.35) saturate(0.4) contrast(0.9) sepia(0.25) }
          100%{ filter: none }
        }
        .sbw-confetti{ position: absolute; top: -4vh; opacity: 0; animation-name: sbw-confetti-fall; animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes sbw-confetti-fall{
          0%{ opacity: 1; transform: translateY(0) rotate(0deg) }
          85%{ opacity: 1 }
          100%{ opacity: 0; transform: translateY(108vh) rotate(var(--spin, 540deg)) }
        }
        /* Print: the passport doubles as a homeschool record. Hide the chrome,
           keep the colours, and don't split a sticker across two pages. */
        @media print {
          .sbw-noprint { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        /* Animations off (in-game ✨ toggle; defaults to the OS reduce-motion
           preference but can be overridden either way). */
        body.sbw-no-anim .sbw-ping{ animation: none }
        body.sbw-no-anim .sbw-plane-group{ display: none }
        body.sbw-no-anim .sbw-flash{ animation: none; opacity: 0 }
        body.sbw-no-anim .sbw-pop{ animation: none }
        body.sbw-no-anim .sbw-develop{ animation: none }
        body.sbw-no-anim .sbw-confetti{ animation: none; opacity: 0 }
      `}</style>
      <SepiaMapBackground />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", background: PAPER, borderRadius: 14, padding: 22, border: `1px solid ${PAPER_LINE}`,
        boxShadow: "0 12px 34px rgba(74,50,20,0.32)",
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${PAPER_LINE}55 27px, ${PAPER_LINE}55 28px)` }}>
        {children}
      </div>
    </div>
  );
}
// Big obvious success/failure popup that pauses play until the player clicks on.
// Pick readable text (ink or white) for a coloured pill background.
const textOn = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150 ? INK : "#fff";
};
// Little coloured pill naming a subject's category (🌋 Volcano, 💦 Waterfall…).
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
function ResultModal({ data, onContinue, reduced }) {
  const good = data.tone === "good";
  const accent = good ? GREEN : CORAL;
  return (
    <div role="dialog" aria-modal="true" aria-label={data.title}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div className={reduced ? "" : "sbw-pop"}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${accent}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 560, width: "100%", padding: "26px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden="true">{data.emoji}</div>
        <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 26, color: accent, margin: "10px 0 6px" }}>{data.title}</h2>
        {data.category && <div style={{ marginBottom: 10 }}><CategoryBadge category={data.category} /></div>}
        {data.photo?.src && (
          <div style={{ margin: "0 auto 10px", maxWidth: 500, borderRadius: 8, overflow: "hidden", border: `2px solid ${accent}`, background: "#10262E" }}>
            <img src={withWidth(data.photo.src, 1600)} alt="" style={{ width: "100%", maxHeight: 440, objectFit: "contain", display: "block" }} />
          </div>
        )}
        <p style={{ color: INK, fontSize: 15, lineHeight: 1.5, margin: "0 auto", maxWidth: 340 }}>{data.subtitle}</p>
        {data.hint && (
          <p style={{ color: OCEAN, fontSize: 14, fontWeight: 700, lineHeight: 1.45, margin: "10px auto 0", maxWidth: 340 }}>
            <span aria-hidden="true">💡 </span>{data.hint}
          </p>
        )}
        {data.fact && (
          <div style={{ marginTop: 14, background: "#fff", border: `1px dashed ${accent}`, borderRadius: 10, padding: "10px 12px", textAlign: "left" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: accent, marginBottom: 4 }}>📖 DID YOU KNOW?</div>
            <div style={{ color: INK, fontSize: 13, lineHeight: 1.45 }}>{data.fact}</div>
          </div>
        )}
        <button autoFocus onClick={onContinue}
          style={{ ...primaryBtn, marginTop: 20, background: accent, boxShadow: `0 4px 0 ${good ? "#2E7A55" : "#A93A28"}` }}>
          {data.buttonLabel}
        </button>
      </div>
    </div>
  );
}
// Big popup for an album photo: the full-size shot plus everything the player
// learned about that landmark. Opened by tapping a thumbnail in the album strip.
function LandmarkModal({ p, onClose, reduced }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={p.subject} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}>
      <div className={reduced ? "" : "sbw-pop"} onClick={(e) => e.stopPropagation()}
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${GOLD}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "22px", textAlign: "center", position: "relative" }}>
        <button onClick={onClose} aria-label="Close" autoFocus
          style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 22, lineHeight: 1, cursor: "pointer", color: INK, opacity: 0.6 }}>×</button>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL, marginBottom: 8 }}>FROM YOUR ALBUM</div>
        <div style={{ margin: "0 auto 10px", maxWidth: 380, borderRadius: 8, overflow: "hidden", border: `2px solid ${GOLD}` }}>
          <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={240} full />
        </div>
        <PhotoCredit photo={p.photo} style={{ textAlign: "center", marginTop: 0, marginBottom: 8 }} />
        <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 24, color: INK, margin: "4px 0 2px" }}>{p.subject}</h2>
        <div style={{ fontWeight: 700, color: INK }}><span style={{ fontSize: "1.5em", verticalAlign: "-0.08em" }}>{p.flag}</span> {p.city}, {p.country}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
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
          <div style={{ marginTop: 14, background: "#fff", border: `1px dashed ${GOLD}`, borderRadius: 10, padding: "10px 12px", textAlign: "left" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: CORAL, marginBottom: 4 }}>📖 DID YOU KNOW?</div>
            <div style={{ color: INK, fontSize: 13, lineHeight: 1.45 }}>{p.fact}</div>
          </div>
        )}
        <button onClick={onClose} style={{ ...primaryBtn, marginTop: 18, background: GOLD, color: INK, boxShadow: "0 4px 0 #B87C00" }}>Close</button>
      </div>
    </div>
  );
}
// ===========================================================================
// TRAVELLER AVATARS — a layered SVG portrait built from a tiny spec object
// { skin, hair, hairColor, hat, shirt } (all indices), stored per profile in
// localStorage. Profiles that never opened the editor get a stable default
// derived from their name, so every board shows a face from day one.
// ===========================================================================
const AVATAR_SKIN = ["#F7D7C4", "#EFC3A4", "#D9A184", "#B97F5E", "#8E5B3F", "#6A4430"];
const AVATAR_HAIRC = ["#2B2118", "#5C4030", "#8A6238", "#C99C4F", "#C4483F", "#9AA0A3"];
const AVATAR_SHIRT = ["#E96A4C", "#2E6E75", "#3E8E5A", "#D9A036", "#8E6FC1"];
const AVATAR_HAIR = ["none", "short", "buzz", "curly", "long"];
const AVATAR_HAT = ["none", "safari", "cap", "beret", "beanie"];
const AVATAR_DIMS = [
  { key: "skin", label: "Skin", n: AVATAR_SKIN.length, swatch: (i) => AVATAR_SKIN[i] },
  { key: "hair", label: "Hair", n: AVATAR_HAIR.length, name: (i) => AVATAR_HAIR[i] },
  { key: "hairColor", label: "Hair colour", n: AVATAR_HAIRC.length, swatch: (i) => AVATAR_HAIRC[i] },
  { key: "hat", label: "Hat", n: AVATAR_HAT.length, name: (i) => AVATAR_HAT[i] },
  { key: "shirt", label: "Shirt", n: AVATAR_SHIRT.length, swatch: (i) => AVATAR_SHIRT[i] },
];
function defaultAvatar(name) {
  // hashStr is unsigned 32-bit — shifts must be >>> or big hashes go negative.
  const h = hashStr("av:" + String(name || "?"));
  return { skin: h % 6, hair: 1 + ((h >>> 3) % 4), hairColor: (h >>> 6) % 6, hat: (h >>> 10) % 5, shirt: (h >>> 13) % 5 };
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
  const clip = `sbw-av-${size}-${v.skin}${v.hair}${v.hairColor}${v.hat}${v.shirt}`;
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
        {/* long hair falls BEHIND the head */}
        {hair === "long" && (<g fill={hairC}>
          <rect x="16.5" y="22" width="8" height="24" rx="4" />
          <rect x="39.5" y="22" width="8" height="24" rx="4" />
        </g>)}
        {/* head */}
        <circle cx="32" cy="28" r="13" fill={skin} />
        {/* hair caps over the head */}
        {(hair === "short" || hair === "long") && <path d="M19.6,24 A13,13 0 0 1 44.4,24 Z" fill={hairC} />}
        {hair === "buzz" && <path d="M21.1,21 A13,13 0 0 1 42.9,21 Z" fill={hairC} />}
        {hair === "curly" && (<g fill={hairC}>
          <path d="M19.6,24 A13,13 0 0 1 44.4,24 Z" />
          <circle cx="22" cy="19" r="4.4" /><circle cx="32" cy="14.5" r="5" /><circle cx="42" cy="19" r="4.4" />
        </g>)}
        {/* face */}
        <circle cx="27" cy="28.5" r="1.4" fill="#10262E" />
        <circle cx="37" cy="28.5" r="1.4" fill="#10262E" />
        <path d="M27,33 Q32,37 37,33" fill="none" stroke="#10262E" strokeWidth="1.6" strokeLinecap="round" />
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
      </g>
    </svg>
  );
}

// The editor: one row of ◀ ▶ steppers per dimension, live preview, randomize.
// Everything is a real button, so it is fully keyboard-operable.
function AvatarEditor({ name, initial, onSave, onClose }) {
  const [spec, setSpec] = useState(() => {
    const raw = { ...defaultAvatar(name), ...(initial || {}) };
    for (const d of AVATAR_DIMS) raw[d.key] = (((raw[d.key] || 0) % d.n) + d.n) % d.n; // negative-safe
    return raw;
  });
  const bump = (key, n, dir) => setSpec((sp) => ({ ...sp, [key]: (sp[key] + dir + n) % n }));
  const roll = () => setSpec({
    skin: Math.floor(Math.random() * AVATAR_SKIN.length),
    hair: Math.floor(Math.random() * AVATAR_HAIR.length),
    hairColor: Math.floor(Math.random() * AVATAR_HAIRC.length),
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
    <div role="dialog" aria-modal="true" aria-label={`Style ${name}'s traveler`}
      style={{ position: "fixed", inset: 0, background: "rgba(16,38,46,0.62)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }}>
      <div className="sbw-pop" style={{ background: PAPER, borderRadius: 12, padding: 20, width: "min(92vw, 380px)", maxHeight: "90vh", overflowY: "auto", textAlign: "center", border: `1px solid ${PAPER_LINE}` }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL }}>🎨 STYLE YOUR TRAVELLER</div>
        <div style={{ margin: "12px 0 4px" }}><Avatar spec={spec} size={104} title={`${name}'s traveler`} /></div>
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
      </div>
    </div>
  );
}

// The culture card's photo of people in traditional dress. It renders in a fixed
// landscape frame (16:9) so a portrait source can never push the rest of the card
// off-screen. Sources are landscape wherever one could be found; `object-position`
// biases the crop upward so faces survive on the few that aren't.
function PeoplePhoto({ people }) {
  if (!people) return null;
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
          never loads — the card showed an empty grey box. It's one image, and the
          player has already flown here, so eager is right anyway. */}
      <div style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 4, overflow: "hidden", background: "#DCE9EC" }}>
        <img src={people.src} alt={people.caption} decoding="async"
          style={{ width: "100%", height: "100%", display: "block",
            objectFit: people.portrait ? "contain" : "cover",
            objectPosition: people.portrait ? "50% 50%" : "50% 30%" }} />
      </div>
      <figcaption style={{ fontSize: 11, color: INK, opacity: 0.7, marginTop: 4, lineHeight: 1.4 }}>
        {people.caption} · {people.credit} ({people.license})
      </figcaption>
    </figure>
  );
}

// The country card — the game's cultural centrepiece, shown the moment you're
// in a country in ANY mode: the country and its flag, a photo of its people in
// traditional dress, how they say hello, then the capital and a short story.
function CountryCard({ country }) {
  if (!country || country === "Antarctica") return null;
  const info = COUNTRY_INFO[country], g = COUNTRY_GREETING[country], people = COUNTRY_PEOPLE[country];
  if (!info && !g && !people) return null;
  const mean = g ? greetingMeaning(g) : null;
  return (
    <div style={{ marginTop: 10, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: 12, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span aria-hidden="true" style={{ fontSize: 32, lineHeight: 1 }}>{COUNTRY_FLAG[country] || "🏳️"}</span>
        <span style={{ fontWeight: 900, color: INK, fontSize: 17 }}>{country}</span>
        {info && <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: INK, opacity: 0.55, marginLeft: "auto" }}>{info.region}</span>}
      </div>
      <PeoplePhoto people={people} />
      {g && (
        <div style={{ fontSize: 13.5, color: OCEAN, lineHeight: 1.55, marginTop: 8 }}>
          <span aria-hidden="true">💬 </span>Here they say <b>“{g.text}”</b>
          {g.pronunciation ? ` (${g.pronunciation})` : ""} in {g.language}
          {mean ? ` — it means ${quoteGloss(mean)}` : "."}
          <SpeakButton greeting={g} />
        </div>
      )}
      {info && (
        <div style={{ marginTop: 8, fontSize: 12, color: INK, lineHeight: 1.5 }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.06em", color: GREEN, fontWeight: 700, marginBottom: 3 }}>
            <span aria-hidden="true">★ </span>Capital: {info.capital}
          </div>
          <span aria-hidden="true">📖 </span>{info.blurb}
        </div>
      )}
    </div>
  );
}

// Celebration confetti for a flawless result: paper pieces in the game's
// palette tumble down once and fade out. Not rendered under reduced motion.
function Confetti({ reduced }) {
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

function Stamp({ children }) {
  return <span style={{ display: "inline-block", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: CORAL, border: `1.5px solid ${CORAL}`, borderRadius: 4, padding: "3px 8px", transform: "rotate(-2deg)" }}>{children}</span>;
}

// Reveals its text at reading speed to encourage kids to actually read rather
// than click through. Clicking (or Enter/Space) completes the current line
// instantly, and reduced-motion users get it whole at once — so no keyboard or
// screen-reader user is ever trapped behind the animation. The full text is
// always present for assistive tech; only the visible copy animates.
function GradualText({ text, reduced, onDone, cps = 42, style }) {
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
  return (
    <p onClick={busy ? finish : undefined}
      onKeyDown={busy ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } } : undefined}
      role={busy ? "button" : undefined} tabIndex={busy ? 0 : undefined}
      aria-label={busy ? text : undefined}
      style={{ cursor: busy ? "pointer" : "default", ...style }}>
      <span aria-hidden={busy ? "true" : undefined}>{text.slice(0, n)}</span>
      {busy && <span aria-hidden="true" style={{ opacity: 0.35 }}>▌</span>}
    </p>
  );
}

// The story screen: Grandpa Nigel speaks his beats one at a time at reading
// speed; the "camera" button stays disabled until he has finished. A stand-in
// portrait sits in for art the user will drop in later (public/grandpa.png).
function StoryScreen({ beats, reduced, ctaLabel, onDone, onSkip }) {
  const [revealed, setRevealed] = useState(reduced ? beats.length : 0);
  const ready = revealed >= beats.length;
  return (
    <Frame>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "6px 4px", textAlign: "center" }}>
        {/* Stand-in portrait — replace with public/grandpa.png when the art is ready. */}
        <div aria-hidden="true" style={{ width: 108, height: 108, margin: "0 auto 4px", borderRadius: "50%", background: "radial-gradient(circle at 50% 38%, #F3E4C6, #D8B98A)", border: `3px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, boxShadow: "0 4px 14px rgba(74,50,20,0.3)" }}>
          {GRANDPA.emoji}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL, marginBottom: 14 }}>{GRANDPA.name.toUpperCase()}</div>

        <div style={{ background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 12, padding: "18px 20px", textAlign: "left", minHeight: 180 }}>
          {beats.slice(0, revealed + 1).map((b, i) => (
            i < revealed
              ? <p key={i} style={{ margin: i ? "12px 0 0" : 0, color: INK, fontSize: 16, lineHeight: 1.55 }}>{b}</p>
              : <GradualText key={i} text={b} reduced={reduced} onDone={() => setRevealed((r) => r + 1)}
                  style={{ margin: i ? "12px 0 0" : 0, color: INK, fontSize: 16, lineHeight: 1.55 }} />
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={ready ? onDone : undefined} disabled={!ready}
            aria-disabled={!ready}
            style={{ ...primaryBtn, margin: 0, opacity: ready ? 1 : 0.45, cursor: ready ? "pointer" : "default" }}>
            {ctaLabel}
          </button>
          {onSkip && (
            <button onClick={onSkip} style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Skip
            </button>
          )}
        </div>
        {!ready && (
          <p role="status" style={{ fontSize: 12, color: INK, opacity: 0.5, marginTop: 8 }}>
            (tap the text to read faster)
          </p>
        )}
      </div>
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
function Polaroid({ p }) {
  return (
    <div style={{ width: 168, background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, padding: 8, transform: `rotate(${(p.id.charCodeAt(0) % 5) - 2}deg)`, boxShadow: "0 3px 8px rgba(16,38,46,0.18)" }}>
      <div style={{ background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", height: 110, borderRadius: 2, overflow: "hidden" }}>
        <Photo photo={p.photo} icon={p.icon} alt={p.subject} size={82} />
      </div>
      <div style={{ fontWeight: 700, color: INK, fontSize: 13, marginTop: 8 }}><span style={{ fontSize: "1.5em", verticalAlign: "-0.08em" }}>{p.flag}</span> {p.subject}</div>
      {p.category && <div style={{ marginTop: 5 }}><CategoryBadge category={p.category} size="sm" /></div>}
      <div style={{ fontSize: 11, color: INK, opacity: 0.65, lineHeight: 1.35, marginTop: 5 }}>{p.fact}</div>
      <PhotoCredit photo={p.photo} />
    </div>
  );
}

const primaryBtn = { marginTop: 26, background: CORAL, color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 800, letterSpacing: "0.03em", cursor: "pointer", boxShadow: "0 4px 0 #A93A28" };