// ===========================================================================
// PICKLES'S WARDROBE — the regional dog outfits.
//
// 18 outfits, each with the same six CELEBRATORY poses. Pickles only ever appears
// happy during gameplay (on the travel desk), so the upbeat set is all she needs
// there; beside Uncle Jonah on the menu/story screens she stays BASIC, where her
// full range of expressions (happy, sad, surprised…) lives. See DeskDog in
// shutterbug-world.jsx.
//
// This is DATA (rule 1): which outfit belongs to which region, and how a region's
// primary/alternate are weighted, live here; the component only renders.
// ===========================================================================

// DeskDog reacts with six SEMANTIC poses. Each maps onto one of an outfit's six
// files. The two downbeat desk reactions — a miss (`tilt`) and out-of-days
// (`lying`) — have no costumed sad pose, so they fall back to "calm": a dressed-up
// Pickles simply doesn't sulk (Joshua's call — gameplay Pickles is celebratory).
export const OUTFIT_POSE_FILE = {
  bow: "play_bow",              // the big celebration
  spin: "mid_jump_celebration", // pleased and bouncing
  sit: "seated_smile",          // a proud "well done, you"
  walk: "prancing_trot",        // trotting along mid-flight
  tilt: "calm",                 // (no costumed head-tilt) → calm
  lying: "calm",                // (no costumed lie-down)  → calm
};

// Region → its outfit(s). `primary` is worn ~2/3 of the time and `alt` ~1/3 when
// BOTH are unlocked; if only one is unlocked, that one is worn. Every region has a
// signature look plus an alternate: the 10 home regions wear their own costume with
// a themed second, the "gap" regions borrow two themed costumes.
// Values are outfit ids = the file-name prefixes in dog-outfits/.
//
// A home region's alternate is always one of the 8 milestone costumes, and each was
// picked because it is TRUE of that region, not just spare: the Himalaya really is
// where a hiker belongs, the monsoon really is Southeast Asia's weather. A side
// effect worth knowing: the milestone costume often unlocks BEFORE the home one, so
// Pickles now turns up dressed in a region a child has only just started exploring
// instead of undressed — the fallback below hands back whichever single outfit is
// unlocked.
export const OUTFIT_REGIONS = {
  british_isles:              { primary: "scottish_highlands",       alt: "detective" },          // London, and a certain deerstalker
  nordic_arctic:              { primary: "nordic_arctic",            alt: "photographer" },       // out shooting the northern lights
  alpine_europe:              { primary: "alpine_europe",            alt: "train_conductor" },    // the Swiss mountain railways
  mediterranean:              { primary: "mediterranean",            alt: "pirate_captain" },     // an old sea of sailors
  mena:                       { primary: "desert_traveler",          alt: "aviator" },            // the desert airmail routes
  safari_africa:              { primary: "safari_africa",            alt: "photographer" },       // the wildlife photographer
  south_asian:                { primary: "south_asian",              alt: "mountain_hiker" },     // the Himalaya
  east_asian:                 { primary: "east_asian",               alt: "train_conductor" },    // the bullet trains
  southeast_asian_tropical:   { primary: "southeast_asian_tropical", alt: "rainy_day_explorer" }, // the monsoon
  andean_highlands:           { primary: "andean_highlands",         alt: "mountain_hiker" },     // the Inca Trail
  united_states:              { primary: "aviator",            alt: "train_conductor" },
  western_europe:             { primary: "rainy_day_explorer", alt: "detective" },
  canada_pnw:                 { primary: "mountain_hiker",     alt: "rainy_day_explorer" },
  mexico_centam:              { primary: "mountain_hiker",     alt: "photographer" },
  caribbean:                  { primary: "pirate_captain",     alt: "photographer" },
  brazil_amazon:              { primary: "photographer",       alt: "rainy_day_explorer" },
  eastern_europe_balkans:     { primary: "mountain_hiker",     alt: "alpine_europe" },
  russia_siberia_centralasia: { primary: "train_conductor",    alt: "nordic_arctic" },
  oceania:                    { primary: "photographer",       alt: "pirate_captain" },
  antarctica:                 { primary: "nordic_arctic",      alt: "astronaut" },
};

// Every country in the game → its wardrobe region. A few straddle two worlds and got
// a judgment call (flagged) — easy to move:
//   • Turkey → mediterranean (Aegean/Byzantine reads Med more than desert)
//   • Sudan → mena (Nile/Nubian pyramids read desert)
//   • Croatia → mediterranean (the Dalmatian coast)
//   • Greenland → nordic_arctic (Danish/Arctic, though it maps under North America)
//   • Russia → russia_siberia_centralasia on either continent layer
export const COUNTRY_REGION = {
  // British Isles
  "United Kingdom": "british_isles", "Ireland": "british_isles",
  // Nordic & Arctic
  "Norway": "nordic_arctic", "Sweden": "nordic_arctic", "Denmark": "nordic_arctic",
  "Finland": "nordic_arctic", "Iceland": "nordic_arctic", "Greenland": "nordic_arctic",
  // Central Europe / Alps
  "Switzerland": "alpine_europe", "Austria": "alpine_europe", "Germany": "alpine_europe",
  // Western Europe (gap)
  "France": "western_europe", "Belgium": "western_europe", "Netherlands": "western_europe",
  // Eastern Europe & Balkans (gap)
  "Poland": "eastern_europe_balkans", "Czechia": "eastern_europe_balkans",
  "Hungary": "eastern_europe_balkans", "Romania": "eastern_europe_balkans",
  // Southern Europe / Mediterranean
  "Italy": "mediterranean", "Greece": "mediterranean", "Spain": "mediterranean",
  "Portugal": "mediterranean", "Malta": "mediterranean", "Croatia": "mediterranean",
  "Turkey": "mediterranean",
  // Russia, Siberia & Central Asia (gap)
  "Russia": "russia_siberia_centralasia", "Kazakhstan": "russia_siberia_centralasia",
  "Uzbekistan": "russia_siberia_centralasia",
  // Middle East & North Africa
  "Egypt": "mena", "Morocco": "mena", "Tunisia": "mena", "Algeria": "mena", "Sudan": "mena",
  "Iran": "mena", "Jordan": "mena", "Saudi Arabia": "mena", "United Arab Emirates": "mena",
  // Sub-Saharan Africa
  "Kenya": "safari_africa", "Tanzania": "safari_africa", "Uganda": "safari_africa",
  "Rwanda": "safari_africa", "Ethiopia": "safari_africa", "Nigeria": "safari_africa",
  "Ghana": "safari_africa", "Senegal": "safari_africa", "Mali": "safari_africa",
  "Benin": "safari_africa", "Cameroon": "safari_africa", "Côte d'Ivoire": "safari_africa",
  "Dem. Rep. Congo": "safari_africa", "South Africa": "safari_africa",
  "Botswana": "safari_africa", "Namibia": "safari_africa", "Zambia": "safari_africa",
  "Zimbabwe": "safari_africa", "Madagascar": "safari_africa",
  // South Asia
  "India": "south_asian", "Pakistan": "south_asian", "Bangladesh": "south_asian",
  "Nepal": "south_asian", "Sri Lanka": "south_asian",
  // East Asia
  "China": "east_asian", "Japan": "east_asian", "South Korea": "east_asian",
  "Taiwan": "east_asian", "Mongolia": "east_asian",
  // Southeast Asia
  "Thailand": "southeast_asian_tropical", "Vietnam": "southeast_asian_tropical",
  "Cambodia": "southeast_asian_tropical", "Myanmar": "southeast_asian_tropical",
  "Malaysia": "southeast_asian_tropical", "Singapore": "southeast_asian_tropical",
  "Indonesia": "southeast_asian_tropical", "Philippines": "southeast_asian_tropical",
  // United States (gap)
  "United States": "united_states",
  // Canada, Alaska & Pacific NW (gap)
  "Canada": "canada_pnw",
  // Mexico & Central America (gap)
  "Mexico": "mexico_centam", "Guatemala": "mexico_centam", "Belize": "mexico_centam",
  "Honduras": "mexico_centam", "Costa Rica": "mexico_centam", "Panama": "mexico_centam",
  "Nicaragua": "mexico_centam",
  // Caribbean (gap)
  "Cuba": "caribbean", "Haiti": "caribbean", "Jamaica": "caribbean",
  "Trinidad and Tobago": "caribbean",
  // Andes / Western South America
  "Peru": "andean_highlands", "Bolivia": "andean_highlands", "Ecuador": "andean_highlands",
  "Colombia": "andean_highlands", "Chile": "andean_highlands", "Argentina": "andean_highlands",
  // Brazil / Amazon & the rest of South America (gap)
  "Brazil": "brazil_amazon", "Guyana": "brazil_amazon", "Venezuela": "brazil_amazon",
  "Paraguay": "brazil_amazon", "Uruguay": "brazil_amazon",
  // Oceania
  "Australia": "oceania", "New Zealand": "oceania", "Fiji": "oceania",
  "French Polynesia": "oceania", "Micronesia": "oceania", "New Caledonia": "oceania",
  "Papua New Guinea": "oceania", "Solomon Is.": "oceania", "Vanuatu": "oceania",
  // Antarctica
  "Antarctica": "antarctica",
};

// The region for a place, by its country (the outfit is the country's, not the
// continent's — a Scottish dog in the UK, an alpine one in Switzerland).
export const outfitRegionFor = (country) => COUNTRY_REGION[country] || null;

// ---- Earning (phase 2) -----------------------------------------------------
import { LOCATIONS } from "./locations.js";

// Friendly names for the beat and the wardrobe.
export const REGION_NAME = {
  british_isles: "the British Isles", nordic_arctic: "Scandinavia & the Arctic",
  alpine_europe: "Central Europe & the Alps", mediterranean: "the Mediterranean",
  mena: "the Middle East & North Africa", safari_africa: "Sub-Saharan Africa",
  south_asian: "South Asia", east_asian: "East Asia",
  southeast_asian_tropical: "Southeast Asia", andean_highlands: "the Andes",
  united_states: "the United States", western_europe: "Western Europe",
  canada_pnw: "Canada & the Pacific NW", mexico_centam: "Mexico & Central America",
  caribbean: "the Caribbean", brazil_amazon: "Brazil & the Amazon",
  eastern_europe_balkans: "Eastern Europe & the Balkans",
  russia_siberia_centralasia: "Russia, Siberia & Central Asia",
  oceania: "Oceania", antarctica: "Antarctica",
};
export const OUTFIT_NAME = {
  scottish_highlands: "the Highlands kit", nordic_arctic: "the Arctic parka",
  alpine_europe: "the Alpine outfit", mediterranean: "the Mediterranean look",
  desert_traveler: "the Desert Traveler", safari_africa: "the Safari kit",
  south_asian: "the South Asian outfit", east_asian: "the East Asian outfit",
  southeast_asian_tropical: "the Tropical outfit", andean_highlands: "the Andean outfit",
  aviator: "the Aviator", train_conductor: "the Train Conductor",
  detective: "the Detective", rainy_day_explorer: "the Rainy-Day Explorer",
  mountain_hiker: "the Mountain Hiker", photographer: "the Photographer",
  pirate_captain: "the Pirate Captain", astronaut: "the Astronaut",
};

// The place ids in each region, for the "master N here" thresholds.
const REGION_PLACE_IDS = {};
for (const l of LOCATIONS) {
  const r = COUNTRY_REGION[l.country];
  if (r) (REGION_PLACE_IDS[r] = REGION_PLACE_IDS[r] || []).push(l.id);
}

// How each outfit is earned. The 10 home outfits open by exploring their home region
// (master 3 places there, or all of them if the region is smaller); the 8 "gap"
// costumes are milestone rewards, so the wardrobe fills as you travel wider.
//   region     — master min(3, size) places in `region`
//   region1    — earn a single stamp in `region`
//   places     — master `n` distinct places anywhere
//   category   — master `n` places of a given category
//   continents — master a place on `n` of the 7 continents
export const OUTFIT_UNLOCK = {
  scottish_highlands:       { type: "region", region: "british_isles" },
  nordic_arctic:            { type: "region", region: "nordic_arctic" },
  alpine_europe:            { type: "region", region: "alpine_europe" },
  mediterranean:            { type: "region", region: "mediterranean" },
  desert_traveler:          { type: "region", region: "mena" },
  safari_africa:            { type: "region", region: "safari_africa" },
  south_asian:              { type: "region", region: "south_asian" },
  east_asian:               { type: "region", region: "east_asian" },
  southeast_asian_tropical: { type: "region", region: "southeast_asian_tropical" },
  andean_highlands:         { type: "region", region: "andean_highlands" },
  photographer:             { type: "places", n: 10 },
  aviator:                  { type: "places", n: 25 },
  detective:                { type: "places", n: 40 },
  mountain_hiker:           { type: "category", category: "mountain", n: 5 },
  pirate_captain:           { type: "region1", region: "caribbean" },
  train_conductor:          { type: "region1", region: "russia_siberia_centralasia" },
  rainy_day_explorer:       { type: "region1", region: "western_europe" },
  astronaut:                { type: "continents", n: 7 },
};

export const ALL_OUTFITS = Object.keys(OUTFIT_UNLOCK);
const catOf = Object.fromEntries(LOCATIONS.map((l) => [l.id, l.category]));
const contOf = Object.fromEntries(LOCATIONS.map((l) => [l.id, l.continent]));

// A one-line "how to earn it" for a locked outfit, for the wardrobe.
export function outfitUnlockLabel(outfit) {
  const u = OUTFIT_UNLOCK[outfit]; if (!u) return "";
  if (u.type === "region") { const need = Math.min(3, (REGION_PLACE_IDS[u.region] || []).length || 3); return `Master ${need} place${need === 1 ? "" : "s"} in ${REGION_NAME[u.region]}`; }
  if (u.type === "region1") return `Earn a stamp in ${REGION_NAME[u.region]}`;
  if (u.type === "places") return `Photograph ${u.n} places`;
  if (u.type === "category") return `Photograph ${u.n} ${u.category}s`;
  if (u.type === "continents") return `Photograph on all ${u.n} continents`;
  return "";
}

// Which outfits a profile has earned. Reads profile.loc (mastered = c > 0), so it's
// live — no new tracking. Returns a Set of outfit ids.
export function unlockedOutfits(profile) {
  const loc = (profile && profile.loc) || {};
  const has = (id) => !!(loc[id] && loc[id].c > 0);
  const inRegion = (r) => (REGION_PLACE_IDS[r] || []).filter(has).length;
  const distinct = Object.keys(loc).filter((id) => loc[id] && loc[id].c > 0);
  const conts = new Set(distinct.map((id) => contOf[id]).filter(Boolean));
  const catCount = (c) => distinct.filter((id) => catOf[id] === c).length;
  const out = new Set();
  for (const [outfit, u] of Object.entries(OUTFIT_UNLOCK)) {
    let ok = false;
    if (u.type === "region") ok = inRegion(u.region) >= Math.min(3, (REGION_PLACE_IDS[u.region] || []).length || 3);
    else if (u.type === "region1") ok = inRegion(u.region) >= 1;
    else if (u.type === "places") ok = distinct.length >= u.n;
    else if (u.type === "category") ok = catCount(u.category) >= u.n;
    else if (u.type === "continents") ok = conts.size >= u.n;
    if (ok) out.add(outfit);
  }
  return out;
}
