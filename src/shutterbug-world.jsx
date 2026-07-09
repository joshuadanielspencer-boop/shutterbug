import React, { useState, useRef, useEffect } from "react";
import { LOCATIONS } from "./data/locations.js";
import { WORLD_COUNTRIES, COUNTRY_CONTINENT } from "./data/worldmap.js";
import { WORLD_COUNTRIES_ROBINSON } from "./data/worldmap-robinson.js";
import { COUNTRY_INFO, COUNTRY_LAYER_CONTINENTS } from "./data/countries.js";
import { COUNTRY_PEOPLE, greetingMeaning } from "./data/culture.js";
import { robinson, eqToRobinson, ROBINSON_W, ROBINSON_H } from "./robinson.js";
import { CATEGORIES, CATEGORY_ORDER, KIND_META, kindOf } from "./data/categories.js";
import { listProfiles, lastProfileName, getProfile, createProfile, setLastProfile,
  deleteProfile, recordGame, recordExplore, weightedOrder, freshFirst, passportData, achievements, topScores, storageAvailable } from "./profiles.js";

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
    const side = Math.min(360, Math.max(40, Math.max(maxX - minX, maxY - minY) * 1.35));
    meta[c] = { mode: wrap ? "wrap" : "equirect", box: { x: cx - side / 2, y: cy - side / 2, w: side, h: side }, cx, cy };
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
const usesCountryLayer = (mode, continent) =>
  mode.clue !== "easy" && COUNTRY_LAYER_CONTINENTS.has(continent);
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
const categoryMissionOK = (category, continent) =>
  continent !== "Antarctica" && ((CAT_LOCS[category] && CAT_LOCS[category][continent]) || []).length >= 2;

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
  return { title: "Trainee", note: "Read the editor's clues more closely next time." };
};

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
  // Every effect is wrapped so an audio hiccup can never break gameplay.
  const safe = (fn) => { try { const c = ac(); if (c) fn(c); } catch { /* ignore */ } };
  return {
    // Camera shutter: two quick noise clicks (mirror up, shutter close).
    shutter() { safe((c) => { const t = c.currentTime; burst(c, t, 0.045, "highpass", 1800, 0.32); burst(c, t + 0.06, 0.05, "highpass", 1300, 0.26); }); },
    // Airplane fly-by: filtered noise whose band sweeps up then down (~0.8s).
    plane() { safe((c) => { const t = c.currentTime; const { f } = burst(c, t, 0.8, "bandpass", 500, 0.11); f.Q.value = 0.9; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1150, t + 0.4); f.frequency.linearRampToValueAtTime(380, t + 0.8); }); },
    // Correct shot: bright rising three-note chime (C–E–G).
    success() { safe((c) => notes(c, [523.25, 659.25, 783.99], 0.085, 0.22, 0.3, "triangle")); },
    // Trip complete: a longer four-note fanfare up to the octave.
    win() { safe((c) => notes(c, [523.25, 659.25, 783.99, 1046.5], 0.11, 0.34, 0.32, "triangle")); },
    // Wrong subject: low descending two-note buzz.
    fail() { safe((c) => { const t = c.currentTime; tone(c, t, 196, 0.18, 0.26, "square"); tone(c, t + 0.13, 155.56, 0.3, 0.24, "square"); }); },
    // Out of days: slow sad descending minor line.
    lose() { safe((c) => notes(c, [440, 349.23, 261.63], 0.17, 0.42, 0.26, "sine")); },
    // Passport stamp / new record: quick high sparkle.
    stamp() { safe((c) => { const t = c.currentTime; tone(c, t, 1568, 0.12, 0.22, "triangle"); tone(c, t + 0.07, 2093, 0.16, 0.2, "triangle"); }); },
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
  const [difficulty, setDifficulty] = useState("easy");

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
  const [researched, setResearched] = useState({}); // assignment step -> revealed research note (Research button)
  const [cityPlan, setCityPlan] = useState(null); // country-layer city step: { ids, wide } (wide = continent view for thin countries)
  const recorded = useRef(false);
  const startRef = useRef(0); // ms timestamp the current game began
  const timer = useRef(null);
  const refreshProfiles = () => setProfiles(listProfiles());

  const prefersReduced = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  const sfx = (name) => { if (soundOn && SFX[name]) SFX[name](); };

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

  function startGame() {
    const mode = modePlan(difficulty);
    const profile = profileName ? getProfile(profileName) : null;
    // Weighted order surfaces the active player's missed/unmastered places more
    // often (a plain shuffle for guests). Used to fill the non-fresh anchor slots
    // and to pick same-continent city decoys.
    const order = weightedOrder(profile).map((id) => BY_ID[id]);
    const want = mode.cityDecoys + 1;

    // City choices for an anchor: the anchor + cityDecoys same-continent decoys,
    // spaced for the continent zoom, shuffled. Shared by both mission types.
    const buildOptions = (anchor) => {
      const far = spacedFor(CONTINENT_META[anchor.continent].box);
      const chosen = [anchor];
      for (const l of order) { if (chosen.length >= want) break; if (l.continent === anchor.continent && !chosen.includes(l) && far(l, chosen)) chosen.push(l); }
      for (const l of order) { if (chosen.length >= want) break; if (l.continent === anchor.continent && !chosen.includes(l)) chosen.push(l); }
      return chosen.map((l) => l.id).sort(() => Math.random() - 0.5);
    };
    // Country-layer options: the anchor + up to cityDecoys OTHER landmarks in the
    // SAME country (a country may have fewer, which is fine — the deduction was
    // choosing the country). Shuffled.
    const buildCountryOptions = (anchor) => {
      const chosen = [anchor];
      for (const l of order) { if (chosen.length >= want) break; if (l.country === anchor.country && l.continent === anchor.continent && !chosen.includes(l)) chosen.push(l); }
      return chosen.map((l) => l.id).sort(() => Math.random() - 0.5);
    };
    // Which countries to show in the country step: the correct one(s) plus decoys,
    // capped at mode.countryOpts so crowded continents (Asia) aren't overwhelming.
    const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);
    const pickCountries = (continent, mustInclude) => {
      const all = LAYER_COUNTRY_LIST[continent] || [];
      const chosen = mustInclude.filter((c) => all.includes(c));
      const pool = shuffle(all.filter((c) => !chosen.includes(c)));
      while (chosen.length < mode.countryOpts && pool.length) chosen.push(pool.pop());
      return shuffle(chosen);
    };
    // ---- Pick the anchors FIRST, all DISTINCT, at least 40% genuinely NEW -----
    // Choosing anchors up front (rather than per-mission) guarantees no location is
    // used twice in one playthrough (fixes the duplicate bug) and lets us reserve a
    // share of never-/least-recently-seen places. `freshFirst` orders places by how
    // long ago the player last saw them (never-seen first); once everything's been
    // seen, oldest visits resurface — so review continues forever.
    const n = mode.assignments;
    const needFresh = Math.ceil(0.4 * n);
    const anchorIds = [];
    const used = new Set();
    const take = (id) => { if (id && !used.has(id)) { used.add(id); anchorIds.push(id); } };
    freshFirst(profile).forEach((id) => { if (anchorIds.length < needFresh) take(id); });
    order.forEach((l) => { if (anchorIds.length < n) take(l.id); });        // fill the rest, weighted
    freshFirst(profile).forEach((id) => { if (anchorIds.length < n) take(id); }); // safety net (tiny catalogs)
    const anchors = anchorIds.slice(0, n).map((id) => BY_ID[id]).sort(() => Math.random() - 0.5);

    const assignmentObjs = [];
    const options = [];
    for (const anchor of anchors) {
      const continent = anchor.continent;
      if (Math.random() < mode.catShare && categoryMissionOK(anchor.category, continent)) {
        // Category mission built AROUND this anchor: bring back any <category> on
        // this continent. The anchor (its own country has the category) teaches on
        // a hit; its country is guaranteed to appear among the country choices.
        const category = anchor.category;
        assignmentObjs.push({ type: "category", category, continent, anchorId: anchor.id, countries: usesCountryLayer(mode, continent) ? pickCountries(continent, [anchor.country]) : null });
        options.push(buildOptions(anchor));
      } else {
        // Specific mission: photograph exactly this place.
        assignmentObjs.push({ type: "specific", targetId: anchor.id, continent, countries: usesCountryLayer(mode, continent) ? pickCountries(continent, countriesOf(anchor)) : null });
        options.push(usesCountryLayer(mode, continent) ? buildCountryOptions(anchor) : buildOptions(anchor));
      }
    }
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
    setMsg({ type: "info", text: "Read the editor's clue, then pick the right continent on the map." });
    setFlying(null);
    setGameMode("assignments");
    setScreen("play");
  }

  // ---- Grand Tour: build an itinerary of targets across continents on one shared ----
  // ---- day budget, fulfilled in any order. ----
  function startTour() {
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

    setGameMode("tour");
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
    setGameMode("explore");
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
      setScreen("end");
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
        if (res.isBest || res.isBestTime || earnedNow.length) sfx("stamp");
        refreshProfiles();
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
        subtitle: `The editor's subject isn't in ${cont}. A wasted flight there and back cost you ${cost} day${cost === 1 ? "" : "s"} — read the clue and try again.`,
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
      // Build the city-step plan. A country with 3+ of its own landmarks zooms in
      // tight and shows just those. A thinner country (fewer than 3) would leave
      // too few choices, so we keep a continent-wide view and pad with the nearest
      // neighbours — always at least 3 pins to choose among (the highlighted
      // country border still shows where you are). Fills back to the tight zoom as
      // that country gains landmarks.
      const own = (COUNTRY_LOCS[pickedContinent] && COUNTRY_LOCS[pickedContinent][country]) || [];
      let plan;
      if (own.length >= 3) {
        plan = { ids: own.slice().sort(() => Math.random() - 0.5), wide: false };
      } else {
        const far = spacedFor(CONTINENT_META[pickedContinent].box);
        const near = LOCATIONS
          .filter((l) => l.continent === pickedContinent && !own.includes(l.id))
          .sort((x, y) => kmBetween(target, x) - kmBetween(target, y));
        const chosen = own.map((id) => BY_ID[id]);
        for (const l of near) { if (chosen.length >= 3) break; if (far(l, chosen)) chosen.push(l); }
        for (const l of near) { if (chosen.length >= 3) break; if (!chosen.includes(l)) chosen.push(l); }
        plan = { ids: chosen.map((l) => l.id).sort(() => Math.random() - 0.5), wide: true };
      }
      setCityPlan(plan);
      setPickedCountry(country);
      setPhase("city");
      setCurrent(null);
      setRevealed(false);
      setMsg({ type: "info", text: `Arrived in ${country}. Now photograph the editor's subject.` });
    } else {
      const nd = Math.round((days - 0.5) * 10) / 10; // a wrong country costs half a day
      setDays(nd);
      sfx("fail");
      const why = a && a.type === "category"
        ? `We don't have a ${CATEGORIES[a.category].noun} on file to photograph in ${country} — try another country.`
        : `The editor's subject isn't in ${country}.`;
      if (nd <= 0) outOfDays(`${country} wasn't right, and that was your last day.`);
      else setPending({ kind: "wrongcountry", tone: "bad", emoji: "❌", title: "Not that country",
        subtitle: `${why} Half a day gone — read the clue and the country notes, then try again.`,
        buttonLabel: "Try again" });
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
      ? `The newsroom suggests ${t.city}, ${t.country} ${t.flag} in ${t.continent} — its ${catNoun}, ${t.subject}, would be a perfect shot.`
      : `The editor's subject is ${t.subject} — in ${t.city}, ${t.country} ${t.flag} (${t.continent}).`;
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
      if (d <= 0) outOfDays(`That's ${clicked.subject}, not ${wantTxt} — and the trip's over.`);
      else {
        sfx("fail");
        setPending({ kind: "wrong", tone: "bad", emoji: "❌", title: "Not the assignment",
          subtitle: `That's ${clicked.subject}${a.type === "category" ? ` — a ${CATEGORIES[clicked.category].name}` : ""}. The editor wants ${wantTxt}. Half a day gone — pick another city.`,
          buttonLabel: "Keep looking 🔍" });
      }
    }
  }

  // ---------- SCREENS ----------
  if (screen === "start") {
    return (
      <Frame>
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center", padding: "8px 4px" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <Stamp>Field Edition · Pack your bags ✈</Stamp>
          <h1 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "clamp(24px, 7vw, 40px)", color: INK, margin: "10px 0 2px" }}>Shutterbug</h1>
          <p style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: 12, color: CORAL, margin: 0 }}>A World Photo Safari</p>
          <TravelCollage />
          <p style={{ color: INK, opacity: 0.85, marginTop: 6, lineHeight: 1.5 }}>
            You're a travelling photographer. Your editor wires an assignment; you read the clue,
            fly to the right city, and photograph the right subject before your travel days run out.
            Every correct shot teaches a bit of world geography.
          </p>
          </div>

          {/* Two columns on wide screens: the setup controls on the left, the
              high-score board on the right so it's visible without scrolling.
              Stacks on narrow screens (flexWrap). */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap", marginTop: 8, textAlign: "center" }}>
            <div style={{ flex: "1 1 440px", maxWidth: 560, minWidth: 300 }}>

          <div style={{ marginTop: 22 }}>
            <Field label="Traveller">
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 460, margin: "0 auto" }}>
                {profiles.map((p) => {
                  const active = p.name === profileName;
                  return (
                    <button key={p.name} onClick={() => { setProfileName(p.name); setLastProfile(p.name); }} aria-pressed={active}
                      style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        border: `1.5px solid ${INK}`, background: active ? INK : "transparent", color: active ? PAPER : INK }}>
                      {active ? "🧳 " : ""}{p.name}
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
                <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={20} placeholder="New traveller's name" aria-label="New traveller's name"
                  disabled={!canSave}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${PAPER_LINE}`, fontSize: 14, width: 180, background: "#fff", color: INK }} />
                <button type="submit" disabled={!newName.trim() || !canSave}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: newName.trim() && canSave ? "pointer" : "default", fontWeight: 700, fontSize: 14, background: GREEN, color: "#fff", opacity: newName.trim() && canSave ? 1 : 0.5 }}>
                  ＋ Add
                </button>
              </form>
              {profileName ? (
                <button onClick={() => { setConfirmRemove(false); setScreen("passport"); }}
                  style={{ marginTop: 10, padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${CORAL}`, background: "transparent", color: CORAL, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  📕 {profileName}'s passport
                </button>
              ) : (
                <p style={{ fontSize: 12, color: INK, opacity: 0.6, margin: "8px 2px 0" }}>
                  {canSave ? "Guest games aren't saved. Add a name to keep scores and stamps." : "This browser can't save progress, so games won't be recorded."}
                </p>
              )}
            </Field>
          </div>

          <div style={{ marginTop: 22 }}>
            <Field label="Mode">
              <Toggle options={[["assignments", "Assignments"], ["tour", "Grand Tour"], ["explore", "Explore 🧭"]]} value={gameMode} onChange={setGameMode} />
            </Field>
            <p style={{ fontSize: 12, color: INK, opacity: 0.7, margin: "8px auto 0", maxWidth: 430, lineHeight: 1.45 }}>
              {gameMode === "explore"
                ? "Explore: no timer, no score — roam the whole world, drill into any country, and click any place to read its story, culture card, and clues. Everywhere you visit is stamped in your passport."
                : gameMode === "tour"
                ? "Grand Tour: a whole itinerary of targets across continents on one shared day budget — plan an efficient route and photograph them in any order."
                : "Assignments: one editor's clue at a time — fly to the right place and photograph the right subject before your days run out."}
            </p>
          </div>

          {gameMode !== "explore" && (
          <div style={{ marginTop: 22 }}>
            <Field label="Difficulty">
              <Toggle options={MODE_ORDER.map((k) => [k, MODES[k].label])} value={difficulty} onChange={setDifficulty} />
            </Field>
            <p style={{ fontSize: 12, color: INK, opacity: 0.7, margin: "8px auto 0", maxWidth: 430, lineHeight: 1.45 }}>{MODES[difficulty].blurb}</p>
          </div>
          )}

          <button onClick={gameMode === "explore" ? startExplore : gameMode === "tour" ? startTour : startGame} style={primaryBtn}>{gameMode === "explore" ? "Start exploring 🧭" : gameMode === "tour" ? "Start the Grand Tour ✈" : "Begin the assignment ✈"}</button>
            </div>

            <div style={{ flex: "0 1 340px", minWidth: 260, marginTop: 22 }}>
          {canSave && (() => {
            const leaders = topScores(5);
            if (!leaders.length) return null;
            return (
              <div style={{ maxWidth: 400, marginInline: "auto", background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 10, padding: "14px 16px", textAlign: "left" }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.2em", color: CORAL, marginBottom: 8, textAlign: "center" }}><span aria-hidden="true" style={{ fontSize: 15 }}>🏆</span> HIGH SCORES</div>
                {leaders.map((r, i) => {
                  // Second line: the editor-rank earned on that run · difficulty (and
                  // mode, if Grand Tour) · completion time.
                  const bits = [];
                  if (r.rank) bits.push(r.rank);
                  bits.push((MODES[r.difficulty]?.label || r.difficulty || "") + (r.mode === "tour" ? " · Grand Tour" : ""));
                  if (r.timeMs > 0) bits.push("⏱ " + fmtTime(r.timeMs));
                  return (
                  <div key={r.name + i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 2px", borderTop: i ? `1px solid ${PAPER_LINE}` : "none" }}>
                    <span style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, fontSize: 14, color: i === 0 ? GOLD : INK, opacity: i === 0 ? 1 : 0.6, width: 16, textAlign: "right", flex: "none" }}>{i + 1}</span>
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
          </div>
        </div>
      </Frame>
    );
  }

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
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Stamp>Roll Developed</Stamp>
          <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, letterSpacing: "0.08em", fontSize: 30, color: INK, margin: "10px 0 4px" }}>{album.length} / {totalTargets} shots filed</h2>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: CORAL, fontWeight: 700, margin: "6px 0" }}>{score} pts · ⏱ {fmtTime(elapsedMs)}</p>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: INK, opacity: 0.6, margin: "0 0 6px", letterSpacing: "0.06em" }}>{isTourEnd ? "Grand Tour" : mode.label} · {mode.label} · {Math.round(pct * 100)}% of a perfect run</p>
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
            </div>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 22 }}>
            {album.map((p, i) => (<Polaroid key={`${p.id}-${i}`} p={p} />))}
          </div>

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

  if (screen === "passport") {
    const profile = getProfile(profileName);
    if (!profile) {
      return (
        <Frame>
          <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: INK }}>No traveller selected yet.</p>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
            <div>
              <Stamp>Passport</Stamp>
              <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 28, color: INK, margin: "8px 0 0" }}>🧳 {profile.name}</h2>
            </div>
            <button onClick={() => { setConfirmRemove(false); setScreen("start"); }} style={{ padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${INK}`, background: "transparent", color: INK, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
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

          {/* Collections — one card per subject category, with progress. */}
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, margin: "22px 0 10px" }}>COLLECTIONS</div>
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

          {/* Achievements — long-term badges earned across games. */}
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, margin: "22px 0 10px" }}>ACHIEVEMENTS <span style={{ opacity: 0.7 }}>— {earnedBadges}/{badges.length}</span></div>
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

          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", color: INK, opacity: 0.6, margin: "22px 0 10px" }}>STAMPS</div>
          {pp.countries.length === 0 ? (
            <p style={{ color: INK, opacity: 0.7 }}>No stamps yet — fly out and photograph a landmark to earn your first!</p>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {pp.countries.map((c) => (
                <div key={c.country} style={{ width: 184, background: "#fff", border: `2px ${c.mastered ? "solid" : "dashed"} ${c.mastered ? CORAL : PAPER_LINE}`, borderRadius: 8, padding: 12, transform: `rotate(${(c.country.charCodeAt(0) % 5) - 2}deg)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 34 }} aria-hidden="true">{c.flag}</span>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em", color: c.mastered ? CORAL : INK, opacity: c.mastered ? 1 : 0.55 }}>{c.mastered ? "★ MASTERED" : "✓ VISITED"}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: INK, marginTop: 6 }}>{c.country}</div>
                  <div style={{ fontSize: 11, color: INK, opacity: 0.6 }}>{c.continent}{c.mastered ? ` · ${c.correct} shot${c.correct === 1 ? "" : "s"}` : ""}</div>
                  {c.mastered && c.facts[0] && (
                    <div style={{ fontSize: 11, color: INK, opacity: 0.75, lineHeight: 1.35, marginTop: 6 }}>{c.facts[0].fact}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Remove traveller — two-step so it can't be clicked by accident. */}
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${PAPER_LINE}`, textAlign: "center" }}>
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
                Remove this traveller…
              </button>
            )}
          </div>
        </div>
      </Frame>
    );
  }

  // play screen
  const mode = MODES[difficulty];
  const isTour = gameMode === "tour";
  const isExplore = gameMode === "explore";
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
  const clue = isTour ? "" : (isCatAsg
    ? `In ${asg.continent.toUpperCase()}, find any ${catMeta.noun} and photograph it — you pick which one!`
    : (target ? (target[tier] || target.hard) : ""));
  const inCountry = phase === "country";
  const inCity = phase === "city";
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
  // The map always fills a SQUARE frame (preserveAspectRatio="none"): the world map
  // is stretched to fill it; each continent box is already square so it fills
  // cleanly. Pins are ellipses whose radii scale with the box (rx∝box.w, ry∝box.h),
  // so they stay perfectly ROUND and a steady on-screen size at every zoom level.
  const pinR = (k) => ({ rx: k * box.w, ry: k * box.h });
  const busy = !!flying || !!pending || (!isExplore && days <= 0);
  return (
    <Frame>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Field journal panel */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.18em", color: INK, opacity: 0.7 }}>{isExplore ? "🧭 EXPLORE" : isTour ? `GRAND TOUR · ${tourReqs.filter((r) => r.done).length}/${tourReqs.length} filed` : `ASSIGNMENT ${step + 1}/${assignments.length}`}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSoundOn((s) => !s)} aria-label={soundOn ? "Turn sound off" : "Turn sound on"} aria-pressed={soundOn} title={soundOn ? "Sound on" : "Sound off"}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 2, color: INK, opacity: 0.75 }}>
                {soundOn ? "🔊" : "🔇"}
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
            <Itinerary reqs={tourReqs} here={inCity ? pickedContinent : null} />
          ) : (
          <div style={{ background: PAPER, border: `1px dashed ${CORAL}`, borderRadius: 6, padding: "14px 16px", position: "relative" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", color: CORAL, marginBottom: 8 }}>✎ TELEGRAM — FROM THE EDITOR</div>
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
              <b style={{ color: OCEAN }}>🔎 Research notes:</b> {researched[step]}
            </div>
          ) : (() => {
            const disabled = busy || days <= researchCost;
            return (
            <button onClick={doResearch} disabled={disabled}
              title={researchCost > 0 ? "Spend half a travel day for the newsroom to pin down the editor's subject" : "Ask the newsroom to pin down the editor's subject — free on Easy"}
              style={{ marginTop: 10, padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${OCEAN}`, background: "transparent", color: OCEAN, fontWeight: 700, fontSize: 13,
                cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>
              🔎 Research the subject <span style={{ opacity: 0.75, fontWeight: 600 }}>({researchCost > 0 ? "½ day" : "free"})</span>
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
                <Photo photo={currentLoc.photo} icon={currentLoc.icon} alt={currentLoc.subject} size={230} full />
                {flashKey > 0 && !prefersReduced && <div key={flashKey} className="sbw-flash" />}
              </div>
              <PhotoCredit photo={currentLoc.photo} style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }} />
              <div style={{ fontWeight: 700, color: INK }}><span style={{ fontSize: "1.5em", verticalAlign: "-0.08em" }}>{currentLoc.flag}</span> {currentLoc.city}, {currentLoc.country}</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.7, marginTop: 2 }}>{currentLoc.subject}</div>
              {currentLoc.greeting?.text && (
                <div style={{ fontSize: 13, color: OCEAN, marginTop: 6 }}>
                  <span aria-hidden="true">💬 </span>Local greeting: “{currentLoc.greeting.text}”
                  {currentLoc.greeting.language ? ` — ${currentLoc.greeting.language}` : ""}
                  {currentLoc.greeting.pronunciation ? ` (${currentLoc.greeting.pronunciation})` : ""}
                  {greetingMeaning(currentLoc.greeting) ? `, “${greetingMeaning(currentLoc.greeting)}”` : ""}
                  <SpeakButton greeting={currentLoc.greeting} />
                </div>
              )}
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
              <div style={{ fontWeight: 800, color: INK, marginTop: 4 }}><span style={{ fontSize: "1.3em", verticalAlign: "-0.08em" }}>{pickedCountry ? COUNTRY_FLAG[pickedCountry] : ""}</span> You're in {pickedCountry || pickedContinent}!</div>
              <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 6, lineHeight: 1.45 }}>
                {isTour ? "Photograph any target on your itinerary that's here, then fly on." : "Click the right city on the map to photograph the editor's subject."}
              </div>
              {pickedCountry && COUNTRY_INFO[pickedCountry] && (
                <div style={{ marginTop: 10, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, color: INK, lineHeight: 1.45, textAlign: "left" }}>
                  <span aria-hidden="true">📖 </span>{COUNTRY_INFO[pickedCountry].blurb}
                </div>
              )}
              {/* Culture card: how people here say hello (+ a reviewed photo of
                  people in traditional dress, once one is added to COUNTRY_PEOPLE). */}
              {pickedCountry && (COUNTRY_GREETING[pickedCountry] || COUNTRY_PEOPLE[pickedCountry]) && (
                <div style={{ marginTop: 10, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 6, padding: 10, textAlign: "left" }}>
                  {COUNTRY_PEOPLE[pickedCountry] && (
                    <figure style={{ margin: "0 0 8px" }}>
                      <img src={COUNTRY_PEOPLE[pickedCountry].src} alt={COUNTRY_PEOPLE[pickedCountry].caption}
                        style={{ width: "100%", borderRadius: 4, display: "block" }} loading="lazy" />
                      <figcaption style={{ fontSize: 11, color: INK, opacity: 0.7, marginTop: 4, lineHeight: 1.4 }}>
                        {COUNTRY_PEOPLE[pickedCountry].caption} · {COUNTRY_PEOPLE[pickedCountry].credit} ({COUNTRY_PEOPLE[pickedCountry].license})
                      </figcaption>
                    </figure>
                  )}
                  {COUNTRY_GREETING[pickedCountry] && (() => {
                    const g = COUNTRY_GREETING[pickedCountry]; const mean = greetingMeaning(g);
                    return (
                      <div style={{ fontSize: 13, color: OCEAN, lineHeight: 1.5 }}>
                        <span aria-hidden="true">💬 </span>Here they say <b>“{g.text}”</b>
                        {g.pronunciation ? ` (${g.pronunciation})` : ""} in {g.language}
                        {mean ? ` — it means “${mean}.”` : "."}
                        <SpeakButton greeting={g} />
                      </div>
                    );
                  })()}
                </div>
              )}
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
        <div style={{ flex: "2 1 520px", minWidth: 400 }}>
          <div style={{ position: "relative", aspectRatio: "1 / 1", maxWidth: 620, marginInline: "auto", borderRadius: 10, overflow: "hidden", border: `2px solid ${INK}`, boxShadow: "0 6px 0 rgba(16,38,46,0.15)" }}>
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
              {inCountry && ((asg && asg.countries) || LAYER_COUNTRY_LIST[pickedContinent] || []).map((country) => {
                const cm = COUNTRY_META[countryKey(pickedContinent, country)];
                if (!cm) return null;
                // On a Pacific-wrapped continent (Oceania) the equirectangular country
                // outlines don't line up with the plate (and many "countries" are one
                // tiny island), so show a clickable marker + label instead of an outline.
                const wrapPlate = plateMode === "wrap";
                const d = wcPath(country);
                // Hard mode hides the names on outline continents — tell them apart by
                // shape + the hover highlight. Marker (Oceania) steps keep labels, as
                // there's no country shape to recognise there.
                const showLabel = wrapPlate || mode.clue !== "hard";
                return (
                  <g key={country} className="sbw-country" role="button" tabIndex={busy ? -1 : 0}
                     aria-label={`Choose ${country}`} onClick={() => pickCountry(country)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickCountry(country); } }}
                     style={{ cursor: busy ? "default" : "pointer" }}>
                    {(!wrapPlate && d)
                      ? <path d={d} fillRule="evenodd" fill="rgba(244,236,216,0.16)" stroke={PAPER} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                      : <ellipse cx={cm.cx} cy={cm.cy} {...pinR(0.028)} fill="rgba(240,165,0,0.55)" stroke={PAPER} strokeWidth="1" vectorEffect="non-scaling-stroke" />}
                    {showLabel && <text x={cm.cx} y={cm.cy + (wrapPlate ? -0.03 * box.h : 0)} fontSize={0.03 * box.h} fontFamily="ui-monospace, monospace" fontWeight="800" fill={INK} textAnchor="middle"
                      style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 0.012 * box.h }}>{country}</text>}
                  </g>
                );
              })}

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

              {/* flight to the chosen continent (Robinson coords) */}
              {flying && (() => {
                const a = eqToRobinson(flying.fromX, flying.fromY), b = eqToRobinson(flying.toX, flying.toY);
                return (
                <g className="sbw-plane-group">
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={CORAL} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                  <g style={{ animation: "sbw-fly 0.85s ease-in-out forwards", offsetPath: `path('M${a.x} ${a.y} L${b.x} ${b.y}')` }}>
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
          <p style={{ fontSize: 11, color: INK, opacity: 0.55, marginTop: 8, fontFamily: "ui-monospace, monospace", letterSpacing: "0.06em" }}>
            {isTour
              ? (inCity ? "Click a target on your itinerary that's here." : "Each continent has its own colour — pick where to fly next.")
              : (inCity ? "Click the right city — read the clue and reason it out."
                : inCountry ? "Click the country the clue points to — its notes will help."
                : "Each continent has its own colour — click the one the clue points to.")}
          </p>

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
        @media (prefers-reduced-motion: reduce){
          .sbw-ping{ animation: none } .sbw-plane-group{ display: none } .sbw-flash{ animation: none; opacity: 0 } .sbw-pop{ animation: none }
        }
      `}</style>
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
      <SepiaMapBackground />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", background: PAPER, borderRadius: 14, padding: 22, border: `1px solid ${PAPER_LINE}`,
        boxShadow: "0 12px 34px rgba(74,50,20,0.32)",
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${PAPER_LINE}55 27px, ${PAPER_LINE}55 28px)` }}>
        {children}
      </div>
    </div>
  );
}
// Hand-drawn travel collage for the start screen (globe, camera, suitcase,
// compass, a postage stamp and a dashed flight path with a little plane).
function TravelCollage() {
  const ink = INK, gold = GOLD, coral = CORAL, green = GREEN, paper = PAPER;
  return (
    <svg viewBox="0 0 440 132" role="img"
      aria-label="A collage of travel things: a globe, a camera, a suitcase, a compass and a postage stamp, with a plane tracing a dashed path"
      style={{ width: "100%", maxWidth: 470, display: "block", margin: "10px auto 4px" }}>
      {/* dashed flight path across the top */}
      <path d="M16 46 Q220 2 424 50" fill="none" stroke={coral} strokeWidth="1.6" strokeDasharray="5 5" opacity="0.7" />
      <g transform="translate(322 12) rotate(20)">
        <path d="M-2 6 L18 6 L26 1 L21 8 L26 15 L18 9 L-2 9 L-6 7.5 Z" fill={ink} />
      </g>

      {/* GLOBE */}
      <g transform="translate(58 84)">
        <circle r="34" fill={paper} stroke={ink} strokeWidth="2.4" />
        <path d="M-24 -12 q10 -6 20 -2 q7 4 1 10 q-10 5 -20 0 q-6 -4 -1 -8 Z" fill={green} opacity="0.75" />
        <path d="M6 6 q11 -3 16 4 q3 6 -4 9 q-10 3 -15 -4 q-3 -6 3 -9 Z" fill={green} opacity="0.75" />
        <ellipse rx="34" ry="11" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.5" />
        <ellipse rx="13" ry="34" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.5" />
        <ellipse rx="27" ry="34" fill="none" stroke={ink} strokeWidth="1" opacity="0.32" />
        <g transform="translate(12 -8)">
          <path d="M0 0 C-6 -8 -6 -15 0 -15 C6 -15 6 -8 0 0 Z" fill={coral} stroke={ink} strokeWidth="0.9" />
          <circle cy="-9" r="2.2" fill={paper} />
        </g>
      </g>

      {/* CAMERA */}
      <g transform="translate(146 46)">
        <rect x="0" y="12" width="72" height="46" rx="7" fill={paper} stroke={ink} strokeWidth="2.4" />
        <rect x="18" y="3" width="22" height="11" rx="2.5" fill={paper} stroke={ink} strokeWidth="2" />
        <circle cx="36" cy="36" r="15.5" fill={paper} stroke={ink} strokeWidth="2.4" />
        <circle cx="36" cy="36" r="8.5" fill="none" stroke={ink} strokeWidth="1.6" />
        <circle cx="36" cy="36" r="3" fill={ink} />
        <circle cx="60" cy="22" r="3.2" fill={gold} stroke={ink} strokeWidth="1" />
        <rect x="7" y="4" width="10" height="7" rx="1.5" fill={coral} stroke={ink} strokeWidth="1.2" />
      </g>

      {/* SUITCASE */}
      <g transform="translate(232 58)">
        <path d="M15 6 q8 -11 18 0" fill="none" stroke={ink} strokeWidth="2.4" />
        <rect x="0" y="6" width="48" height="42" rx="6" fill={paper} stroke={ink} strokeWidth="2.4" />
        <line x1="12" y1="6" x2="12" y2="48" stroke={ink} strokeWidth="1.4" opacity="0.7" />
        <line x1="36" y1="6" x2="36" y2="48" stroke={ink} strokeWidth="1.4" opacity="0.7" />
        <rect x="9" y="22" width="6" height="8" rx="1" fill={gold} stroke={ink} strokeWidth="0.8" />
        <circle cx="26" cy="18" r="5" fill={coral} opacity="0.85" stroke={ink} strokeWidth="0.8" />
        <circle cx="30" cy="34" r="4" fill={green} opacity="0.85" stroke={ink} strokeWidth="0.8" />
      </g>

      {/* COMPASS */}
      <g transform="translate(324 80)">
        <circle r="30" fill={paper} stroke={ink} strokeWidth="2.4" />
        <circle r="24" fill="none" stroke={ink} strokeWidth="1" opacity="0.5" />
        {[...Array(8)].map((_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 24} y1={Math.sin(a) * 24} x2={Math.cos(a) * 29} y2={Math.sin(a) * 29} stroke={ink} strokeWidth="1.2" />; })}
        <path d="M0 -20 L5 0 L0 4 L-5 0 Z" fill={coral} stroke={ink} strokeWidth="0.8" />
        <path d="M0 20 L5 0 L0 -4 L-5 0 Z" fill={paper} stroke={ink} strokeWidth="0.8" />
        <circle r="2.6" fill={ink} />
        <text x="0" y="-14" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={ink}>N</text>
      </g>

      {/* POSTAGE STAMP */}
      <g transform="translate(392 46) rotate(8)">
        <rect x="-2" y="-2" width="44" height="52" fill={gold} opacity="0.9" />
        <rect x="2" y="2" width="36" height="44" fill={paper} stroke={ink} strokeWidth="1" />
        <g transform="translate(20 30)" stroke={ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
          <path d="M0 -16 L-6 14 M0 -16 L6 14 M-4 3 L4 3 M-7 14 L7 14 M-2.6 -6 L2.6 -6" />
        </g>
        <path d="M14 -8 l1.2 2.6 l2.8 .2 l-2.1 1.9 l.7 2.8 l-2.6 -1.5 l-2.6 1.5 l.7 -2.8 l-2.1 -1.9 l2.8 -.2 Z" fill={coral} opacity="0.85" />
      </g>
    </svg>
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
        style={{ background: PAPER, borderRadius: 16, border: `3px solid ${accent}`, boxShadow: "0 14px 44px rgba(0,0,0,0.35)", maxWidth: 420, width: "100%", padding: "26px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden="true">{data.emoji}</div>
        <h2 style={{ fontFamily: "ui-sans-serif, system-ui", fontWeight: 900, fontSize: 26, color: accent, margin: "10px 0 6px" }}>{data.title}</h2>
        {data.category && <div style={{ marginBottom: 10 }}><CategoryBadge category={data.category} /></div>}
        {data.photo?.src && (
          <div style={{ margin: "0 auto 10px", maxWidth: 300, borderRadius: 8, overflow: "hidden", border: `2px solid ${accent}` }}>
            <img src={data.photo.src} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
          </div>
        )}
        <p style={{ color: INK, fontSize: 15, lineHeight: 1.5, margin: "0 auto", maxWidth: 340 }}>{data.subtitle}</p>
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
            {greetingMeaning(p.greeting) ? `, “${greetingMeaning(p.greeting)}”` : ""}
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
function Stamp({ children }) {
  return <span style={{ display: "inline-block", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: CORAL, border: `1.5px solid ${CORAL}`, borderRadius: 4, padding: "3px 8px", transform: "rotate(-2deg)" }}>{children}</span>;
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