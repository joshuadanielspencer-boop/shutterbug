// ===========================================================================
// SUBJECT CATEGORIES — every location carries a `category` (its defining type)
// and optional `tags` (cross-cutting facts). Categories drive:
//   • the passport "Collections" (photograph all the volcanoes, etc.), and
//   • category missions ("bring me a photo of any waterfall in South America").
//
// Each location has exactly ONE primary category — its most defining type — plus
// `tags` for the rest (e.g. Mount Fuji is category "mountain", tags ["volcano",
// "sacred"]). Keep this list and the tag vocabulary stable; content references it.
//
// `noun` is the word used in an easy category clue ("photograph any WATERFALL");
// `plural` titles a collection ("Waterfalls"); `kind` groups the three families
// used by the Human-Made / Natural / Living achievements.
// ===========================================================================

export const CATEGORIES = {
  ruins:     { name: "Ancient Wonder",   plural: "Ancient Wonders",   noun: "ancient wonder",     emoji: "🏛️", kind: "built",   color: "#B08D57" },
  temple:    { name: "Sacred Place",     plural: "Sacred Places",     noun: "sacred place",       emoji: "⛪", kind: "built",   color: "#C0576A" },
  palace:    { name: "Castle & Palace",  plural: "Castles & Palaces", noun: "castle or palace",   emoji: "🏰", kind: "built",   color: "#8E6BB0" },
  monument:  { name: "Landmark & Icon",  plural: "Landmarks & Icons", noun: "famous landmark",    emoji: "🗽", kind: "built",   color: "#E15C42" },
  cityscape: { name: "City View",        plural: "City Views",        noun: "city view",          emoji: "🏙️", kind: "built",   color: "#4A7BA6" },
  mountain:  { name: "Mountain",         plural: "Mountains",         noun: "mountain",           emoji: "🏔️", kind: "natural", color: "#6B7A8F" },
  volcano:   { name: "Volcano & Geyser", plural: "Volcanoes & Geysers", noun: "volcano or hot spring", emoji: "🌋", kind: "natural", color: "#C1440E" },
  waterfall: { name: "Waterfall",        plural: "Waterfalls",        noun: "waterfall",          emoji: "💦", kind: "natural", color: "#2E9BB5" },
  waterway:  { name: "River & Lake",     plural: "Rivers & Lakes",    noun: "river or lake",      emoji: "🏞️", kind: "natural", color: "#3E9B6E" },
  desert:    { name: "Desert",           plural: "Deserts",           noun: "desert",             emoji: "🏜️", kind: "natural", color: "#E0A030" },
  ice:       { name: "Frozen Wonder",    plural: "Frozen Wonders",    noun: "frozen wonder",      emoji: "🧊", kind: "natural", color: "#7FB2CE" },
  coast:     { name: "Coast & Island",   plural: "Coasts & Islands",  noun: "coast or island",    emoji: "🏝️", kind: "natural", color: "#12A4A4" },
  rock:      { name: "Rock Formation",   plural: "Rock Formations",   noun: "rock formation",     emoji: "🪨", kind: "natural", color: "#A9744F" },
  wildlife:  { name: "Wildlife & Wild Places", plural: "Wildlife & Wild Places", noun: "wild place or animal", emoji: "🦁", kind: "living", color: "#D98A29" },
};

// Display order (used by the passport Collections grid and any category legend).
export const CATEGORY_ORDER = [
  "mountain", "volcano", "waterfall", "waterway", "desert", "ice", "coast", "rock", "wildlife",
  "ruins", "temple", "palace", "monument", "cityscape",
];

// The three families, for Human-Made vs Natural vs Living achievements.
export const KIND_META = {
  built:   { name: "Human-Made",    emoji: "🏛️" },
  natural: { name: "Natural Wonder", emoji: "⛰️" },
  living:  { name: "Living World",   emoji: "🦁" },
};

export const kindOf = (category) => (CATEGORIES[category] ? CATEGORIES[category].kind : "natural");
