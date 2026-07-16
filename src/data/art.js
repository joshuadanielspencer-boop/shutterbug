// ===========================================================================
// UI ART REGISTRY — maps game keys to the illustrated art that represents them.
//
// One registry, so a new batch of art wires in by editing this file and nothing
// else. Paths are relative to `public/assets/shutterbug-ui/`; components prefix
// them with the `UI` base (see shutterbug-world.jsx) to build a real URL.
//
// Every entry is a 512x512 transparent PNG with NO baked-in text — names,
// counts and locked/greyed states are all rendered live in code, so one colour
// file serves every state. See docs/art-assets-needed.md for the full spec and
// for what has not been drawn yet.
//
// A missing key is not a bug: art lands in batches, and every render site falls
// back to the emoji it used before. Only add a key once the file really exists
// in the folder — a key here with no file behind it renders a broken image.
// ===========================================================================

// The four difficulty tiers (embroidered patches). Keys are the INTERNAL tier
// names, which differ from the player-facing labels: easy is "Explorer",
// medium is "Adventurer", hard is "Expert".
export const DIFFICULTY_ART = {
  scout:  "difficulty/difficulty-scout-emblem.png",
  easy:   "difficulty/difficulty-explorer-emblem.png",
  medium: "difficulty/difficulty-adventurer-emblem.png",
  hard:   "difficulty/difficulty-expert-emblem.png",
};

// The six ways to play, keyed by MODE_CARDS id.
export const MODE_ART = {
  assignments: "modes/mode-assignments-icon.png",
  tour:        "modes/mode-grand-tour-icon.png",
  explore:     "modes/mode-explore-icon.png",
  quiz:        "modes/mode-quiz-icon.png",
  journey:     "modes/mode-journeys-icon.png",
  daily:       "modes/mode-daily-expedition-icon.png",
};

// The Grand Tour's itinerary crests, keyed by TOUR_THEMES id (classic + the six
// themed expeditions).
export const THEME_ART = {
  classic:   "themes/theme-classic-crest.png",
  wildlife:  "themes/theme-wildlife-safari-crest.png",
  volcano:   "themes/theme-ring-of-fire-crest.png",
  mountain:  "themes/theme-roof-of-the-world-crest.png",
  waterfall: "themes/theme-chasing-waterfalls-crest.png",
  ruins:     "themes/theme-ancient-wonders-crest.png",
  heritage:  "themes/theme-world-heritage-crest.png",
};

// The collection badge for each of the 14 subject categories, earned by
// photographing every place of that category. Keyed by the category key from
// categories.js; the badge's own name (Peak Bagger…) lives with the achievement
// in profiles.js. The artist named the files after the badge, not the category,
// which is why the two sides of each line look unrelated.
export const CATEGORY_ART = {
  mountain:  "badges/category-peak-bagger-badge.png",
  volcano:   "badges/category-volcano-hunter-badge.png",
  waterfall: "badges/category-waterfall-chaser-badge.png",
  waterway:  "badges/category-river-runner-badge.png",
  desert:    "badges/category-desert-wanderer-badge.png",
  ice:       "badges/category-polar-explorer-badge.png",
  coast:     "badges/category-island-hopper-badge.png",
  rock:      "badges/category-rockhound-badge.png",
  wildlife:  "badges/category-safari-ranger-badge.png",
  ruins:     "badges/category-time-traveler-badge.png",
  temple:    "badges/category-pilgrim-badge.png",
  palace:    "badges/category-royal-guest-badge.png",
  monument:  "badges/category-monument-hunter-badge.png",
  cityscape: "badges/category-city-slicker-badge.png",
};

// The non-category achievements, keyed by the ids `achievements()` builds in
// profiles.js. Two families share this map because they share that id space: the
// three kind mega-badges (earned by completing a whole family of categories) and
// the seven special medals (milestones and superlatives).
export const ACHIEVEMENT_ART = {
  kind_built:   "medals/mega-master-builder-badge.png",
  kind_natural: "medals/mega-force-of-nature-badge.png",
  kind_living:  "medals/mega-life-lister-badge.png",
  summits:      "medals/medal-continental-giants.png",
  unesco:       "medals/medal-world-heritage.png",
  globe:        "medals/medal-globetrotter.png",
  record:       "medals/medal-record-breaker.png",
  m25:          "medals/medal-shutterbug-25.png",
  m50:          "medals/medal-seasoned-traveler-50.png",
  m100:         "medals/medal-around-the-world-100.png",
};

// The six career ranks, keyed by the `tier` index careerRank() returns (0–5,
// matching PRESS_RANKS in profiles.js). Not an achievement id — the rank is a
// single escalating title, not a badge you collect, so it gets its own map.
export const RANK_ART = [
  "ranks/rank-1-cub-reporter-insignia.png",
  "ranks/rank-2-field-stringer-insignia.png",
  "ranks/rank-3-roving-correspondent-insignia.png",
  "ranks/rank-4-bureau-chief-insignia.png",
  "ranks/rank-5-globe-editor-insignia.png",
  "ranks/rank-6-photographer-laureate-insignia.png",
];

// One roundel per continent, keyed by the continent names LOCATIONS uses.
// NOTE: these are deliberately uniform teal-and-gold — the continent is read from
// the landmass shape, NOT from a colour. They do not match the game's continent
// palette on the world map (North America blue, Africa gold…). See
// docs/art-assets-needed.md §8 before pairing one with a coloured map region.
export const ROUNDEL_ART = {
  "North America": "roundels/roundel-north-america.png",
  "South America": "roundels/roundel-south-america.png",
  "Europe":        "roundels/roundel-europe.png",
  "Africa":        "roundels/roundel-africa.png",
  "Asia":          "roundels/roundel-asia.png",
  "Oceania":       "roundels/roundel-oceania.png",
  "Antarctica":    "roundels/roundel-antarctica.png",
};

// One-off ornaments. `bestScore`/`bestTime`/`quiz` mark the records board;
// `unlocked` is the wax seal for a newly opened mode or difficulty; `mastered`
// is the single generic marker reused for every fully-mastered place (there are
// 437 — never one per location).
export const RECORD_ART = {
  bestScore: "medals/rosette-best-score.png",
  bestTime:  "medals/medal-best-time.png",
  quiz:      "medals/rosette-quiz.png",
};
export const SEAL_UNLOCKED = "medals/seal-unlocked.png";
export const MARKER_MASTERED = "medals/marker-mastered.png";
