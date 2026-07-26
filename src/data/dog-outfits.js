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
// BOTH are unlocked; if only one is unlocked, that one is worn. Home regions have a
// single signature outfit; the "gap" regions borrow a themed costume plus an
// alternate. Values are outfit ids = the file-name prefixes in dog-outfits/.
export const OUTFIT_REGIONS = {
  british_isles:              { primary: "scottish_highlands" },
  nordic_arctic:              { primary: "nordic_arctic" },
  alpine_europe:              { primary: "alpine_europe" },
  mediterranean:              { primary: "mediterranean" },
  mena:                       { primary: "desert_traveler" },
  safari_africa:              { primary: "safari_africa" },
  south_asian:                { primary: "south_asian" },
  east_asian:                 { primary: "east_asian" },
  southeast_asian_tropical:   { primary: "southeast_asian_tropical" },
  andean_highlands:           { primary: "andean_highlands" },
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
