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

// Art for the non-category achievements — the career ranks, kind mega-badges and
// special medals. Not drawn yet (docs/art-assets-needed.md §4, §6, §7), so these
// stay empty and those badges keep rendering their emoji until the art lands.
export const ACHIEVEMENT_ART = {};
