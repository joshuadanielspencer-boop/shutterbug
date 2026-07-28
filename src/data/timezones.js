// ===========================================================================
// TIME ZONES — an IANA zone for every place in the game.
//
// This exists so the arrival card can say "it's 3 o'clock in the morning here"
// and mean it. Time zones are pure geography and completely absent from the game
// otherwise, and a child who arrives in Tokyo at nine in the morning Texas time
// and is told everyone there is asleep has learned something real.
//
// It is DATA, not arithmetic, on purpose. The tempting shortcut is to divide
// longitude by fifteen — and it is wrong nearly everywhere it matters. China runs
// one clock across five geographic zones. India and Nepal are on the half and the
// three-quarter hour. Spain is west of Greenwich and keeps Berlin's time. Arizona
// sits out daylight saving while the Navajo Nation inside it does not. Rule 2
// applies to a clock reading exactly as it applies to a fact, so every zone here
// is a real IANA name and the browser's own tz database does the conversion.
//
// Two tables:
//   COUNTRY_TZ    one zone per country — right for the ~90 countries that have one.
//   LOCATION_TZ   per-place, for the countries that genuinely span several.
//
// test/timezones.test.js checks that every location resolves to a zone the
// runtime accepts, that no override is redundant, and spot-checks a dozen offsets
// that would be wrong under the divide-by-fifteen shortcut.
// ===========================================================================

// Antarctica has no time zone in any meaningful sense: a station keeps whatever
// clock its supply base keeps, and at the Pole the sun neither rises nor sets for
// months, so "what time is it" has no local answer to give. null is the honest
// value, and the arrival card says the interesting true thing instead of a number.
export const COUNTRY_TZ = {
  "Algeria": "Africa/Algiers",
  "Antarctica": null,
  "Argentina": "America/Argentina/Buenos_Aires",
  "Austria": "Europe/Vienna",
  "Bangladesh": "Asia/Dhaka",
  "Belgium": "Europe/Brussels",
  "Belize": "America/Belize",
  "Benin": "Africa/Porto-Novo",
  "Bolivia": "America/La_Paz",
  "Botswana": "Africa/Gaborone",
  "Cambodia": "Asia/Phnom_Penh",
  "Cameroon": "Africa/Douala",
  "China": "Asia/Shanghai",
  "Colombia": "America/Bogota",
  "Costa Rica": "America/Costa_Rica",
  "Croatia": "Europe/Zagreb",
  "Cuba": "America/Havana",
  "Czechia": "Europe/Prague",
  "Côte d'Ivoire": "Africa/Abidjan",
  "Denmark": "Europe/Copenhagen",
  "Egypt": "Africa/Cairo",
  "Ethiopia": "Africa/Addis_Ababa",
  "Fiji": "Pacific/Fiji",
  "Finland": "Europe/Helsinki",
  "France": "Europe/Paris",
  "French Polynesia": "Pacific/Tahiti",
  "Germany": "Europe/Berlin",
  "Ghana": "Africa/Accra",
  "Greece": "Europe/Athens",
  "Greenland": "America/Nuuk",
  "Guatemala": "America/Guatemala",
  "Guyana": "America/Guyana",
  "Haiti": "America/Port-au-Prince",
  "Honduras": "America/Tegucigalpa",
  "Hungary": "Europe/Budapest",
  "Iceland": "Atlantic/Reykjavik",
  "India": "Asia/Kolkata",
  "Iran": "Asia/Tehran",
  "Ireland": "Europe/Dublin",
  "Italy": "Europe/Rome",
  "Jamaica": "America/Jamaica",
  "Japan": "Asia/Tokyo",
  "Jordan": "Asia/Amman",
  // Kazakhstan spans two geographic zones but has run a SINGLE clock (UTC+5) since
  // March 2024, so it needs no per-place override.
  "Kazakhstan": "Asia/Almaty",
  "Kenya": "Africa/Nairobi",
  "Madagascar": "Indian/Antananarivo",
  "Malaysia": "Asia/Kuala_Lumpur",
  "Mali": "Africa/Bamako",
  "Malta": "Europe/Malta",
  "Mongolia": "Asia/Ulaanbaatar",
  "Morocco": "Africa/Casablanca",
  "Myanmar": "Asia/Yangon",
  "Namibia": "Africa/Windhoek",
  "Nepal": "Asia/Kathmandu",
  "Netherlands": "Europe/Amsterdam",
  "New Caledonia": "Pacific/Noumea",
  "New Zealand": "Pacific/Auckland",
  "Nicaragua": "America/Managua",
  "Nigeria": "Africa/Lagos",
  "Norway": "Europe/Oslo",
  "Pakistan": "Asia/Karachi",
  "Panama": "America/Panama",
  "Papua New Guinea": "Pacific/Port_Moresby",
  "Paraguay": "America/Asuncion",
  "Peru": "America/Lima",
  "Philippines": "Asia/Manila",
  "Poland": "Europe/Warsaw",
  "Portugal": "Europe/Lisbon",
  "Romania": "Europe/Bucharest",
  "Rwanda": "Africa/Kigali",
  "Saudi Arabia": "Asia/Riyadh",
  "Senegal": "Africa/Dakar",
  "Singapore": "Asia/Singapore",
  "Solomon Is.": "Pacific/Guadalcanal",
  "South Africa": "Africa/Johannesburg",
  "South Korea": "Asia/Seoul",
  "Spain": "Europe/Madrid",
  "Sri Lanka": "Asia/Colombo",
  "Sudan": "Africa/Khartoum",
  "Sweden": "Europe/Stockholm",
  "Switzerland": "Europe/Zurich",
  "Taiwan": "Asia/Taipei",
  "Tanzania": "Africa/Dar_es_Salaam",
  "Thailand": "Asia/Bangkok",
  "Trinidad and Tobago": "America/Port_of_Spain",
  "Tunisia": "Africa/Tunis",
  "Turkey": "Europe/Istanbul",
  "Uganda": "Africa/Kampala",
  "United Arab Emirates": "Asia/Dubai",
  "United Kingdom": "Europe/London",
  "Uruguay": "America/Montevideo",
  "Uzbekistan": "Asia/Tashkent",
  "Vanuatu": "Pacific/Efate",
  "Venezuela": "America/Caracas",
  "Vietnam": "Asia/Ho_Chi_Minh",
  "Zambia": "Africa/Lusaka",
  "Zimbabwe": "Africa/Harare",

  // ---- Countries that span zones: a default here, exceptions in LOCATION_TZ ----
  "Australia": "Australia/Sydney",
  "Brazil": "America/Sao_Paulo",
  "Canada": "America/Toronto",
  "Chile": "America/Santiago",
  "Dem. Rep. Congo": "Africa/Kinshasa",
  "Ecuador": "America/Guayaquil",
  "Indonesia": "Asia/Jakarta",
  "Mexico": "America/Mexico_City",
  "Micronesia": "Pacific/Pohnpei",
  "Russia": "Europe/Moscow",
  "United States": "America/New_York",
};

// Per-place zones, for the countries above whose landmarks are NOT all on the
// country's default clock. Only the exceptions are listed; anything not here takes
// its country's zone.
export const LOCATION_TZ = {
  // ---- United States ----
  // Eastern is the default, so only the other five zones appear.
  cloudgate: "America/Chicago",        // Chicago
  gatewayarch: "America/Chicago",      // St. Louis
  jacksonsquare: "America/Chicago",    // New Orleans
  mississippi: "America/Chicago",      // Lake Itasca, Minnesota
  cahokia: "America/Chicago",          // Cahokia Mounds, Illinois
  alamo: "America/Chicago",            // San Antonio
  mountrushmore: "America/Denver",     // Keystone, western South Dakota
  devilstower: "America/Denver",       // Wyoming
  yellowstone: "America/Denver",       // Wyoming
  usbison: "America/Denver",           // Yellowstone
  glaciernp: "America/Denver",         // Montana
  whitesands: "America/Denver",        // New Mexico
  delicatearch: "America/Denver",      // Moab, Utah
  brycecanyon: "America/Denver",       // Utah
  mesaverde: "America/Denver",         // Colorado
  // Monument Valley is inside the Navajo Nation, which DOES keep daylight saving
  // while the rest of Arizona does not — so it is Denver's clock, not Phoenix's.
  // This is the single best argument in the file against deriving zones from
  // longitude: these two are 100 miles apart and an hour different for half the year.
  monumentvalley: "America/Denver",
  grandcanyon: "America/Phoenix",      // Arizona proper: no daylight saving
  sanfrancisco: "America/Los_Angeles",
  yosemite: "America/Los_Angeles",
  hollywoodsign: "America/Los_Angeles",
  craterlake: "America/Los_Angeles",   // Oregon
  spaceneedle: "America/Los_Angeles",  // Seattle
  denali: "America/Anchorage",
  kilauea: "Pacific/Honolulu",

  // ---- Canada ---- (Toronto is the default; Quebec keeps the same clock)
  morainelake: "America/Edmonton",     // Banff, Alberta
  lakelouise: "America/Edmonton",      // Alberta
  athabascafalls: "America/Edmonton",  // Jasper, Alberta
  aurora: "America/Edmonton",          // Yellowknife
  nahanni: "America/Edmonton",         // Northwest Territories
  hopewellrocks: "America/Halifax",    // New Brunswick

  // ---- Russia ---- (Moscow is the default: Kazan and Elbrus keep it too)
  baikal: "Asia/Irkutsk",
  kamchatka: "Asia/Kamchatka",
  lenapillars: "Asia/Yakutsk",         // Sakha
  putorana: "Asia/Krasnoyarsk",        // Norilsk

  // ---- Brazil ---- (São Paulo is the default)
  amazon: "America/Manaus",
  meetingwaters: "America/Manaus",
  jaguar: "America/Campo_Grande",      // the Pantanal

  // ---- Australia ---- (Sydney is the default)
  uluru: "Australia/Darwin",           // Northern Territory
  ubirr: "Australia/Darwin",           // Kakadu
  redkangaroo: "Australia/Darwin",     // central Australia
  simpson: "Australia/Darwin",         // Simpson Desert
  greatbarrierreef: "Australia/Brisbane", // Cairns
  wallaman: "Australia/Brisbane",      // Queensland
  twelveapostles: "Australia/Melbourne", // Victoria
  purnululu: "Australia/Perth",        // Western Australia

  // ---- Mexico ---- (Mexico City is the default)
  elarco: "America/Mazatlan",          // Cabo San Lucas, Baja California Sur
  chichenitza: "America/Merida",       // Yucatán

  // ---- Indonesia ---- (Jakarta is the default)
  tanahlot: "Asia/Makassar",           // Bali
  komodo: "Asia/Makassar",

  // ---- Chile ---- (Santiago is the default)
  easterisland: "Pacific/Easter",

  // ---- Ecuador ---- (Guayaquil is the default)
  galapagos: "Pacific/Galapagos",

  // ---- Dem. Rep. Congo ---- (Kinshasa is the default)
  okapi: "Africa/Lubumbashi",          // the east keeps UTC+2
  nyiragongo: "Africa/Lubumbashi",     // Virunga

  // ---- Micronesia ---- (Pohnpei is the default)
  chuuklagoon: "Pacific/Chuuk",
};

// The zone for a location, or null where there honestly isn't one (Antarctica).
export const zoneFor = (loc) =>
  (loc && LOCATION_TZ[loc.id]) || (loc ? COUNTRY_TZ[loc.country] ?? null : null);
