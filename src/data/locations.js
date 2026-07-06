// ===========================================================================
// SHUTTERBUG — GAME CONTENT (locations)
//
// This is the ONE file to edit when adding or correcting places. The game
// components read from it and render generically, so you can add a location
// by appending an object to the LOCATIONS array below — no code changes.
//
// ---------------------------------------------------------------------------
// LOCATION SCHEMA — every field a location object can have
// ---------------------------------------------------------------------------
//   id          string   Unique lowercase slug, no spaces (e.g. "paris").
//                         Used as a React key and to match assignments — must
//                         be unique across all locations.
//   city        string   City name shown to the player.
//   country     string   Country name shown to the player.
//   flag        string   Emoji flag for the country (e.g. "🇫🇷"). Optional
//                         but nice; shown next to the city name.
//   continent   string   One of: "Africa", "Asia", "Europe",
//                         "North America", "South America", "Oceania",
//                         "Antarctica". Named aloud in the EASY clue.
//
//   COORDINATES (position of the city pin on the stylized world map)
//   x           number   0..360  = longitude + 180  (0 = 180°W, 360 = 180°E).
//   y           number   0..180  = 90 − latitude    (0 = North Pole, 180 = South).
//                         Tip: x ≈ longitude + 180, y ≈ 90 − latitude.
//
//   subject     string   What the editor asks you to photograph
//                         (e.g. "The Eiffel Tower").
//   icon        string   Which hand-drawn placeholder drawing to show. Must be
//                         one of the known keys (see ICON KEYS below). Used only
//                         when `photo` is null.
//
//   CLUES
//   easy        string   Beginner clue. Names the CONTINENT out loud.
//   hard        string   Cryptic clue. No continent, no city name.
//
//   fact        string   The geography fact taught on a correct shot. MUST be
//                         accurate and verifiable against a reliable source
//                         before it ships (see CLAUDE.md, rule 2).
//
//   PLACEHOLDERS (leave as null until you have real, checked content)
//   photo       object | null
//                         A real, FREELY-LICENSED photo of the subject. When
//                         null, the game falls back to the hand-drawn `icon`.
//                         Only ever use images you can confirm are free to use
//                         (Wikimedia Commons / public domain / CC0 / CC BY /
//                         CC BY-SA / Unsplash) — never an unconfirmed license.
//                         The attribution is shown in-game, so it is required.
//                         Shape:
//                           {
//                             src: "https://commons.wikimedia.org/wiki/Special:FilePath/File.jpg?width=800",
//                             credit: "Photographer name",   // author, for attribution
//                             license: "CC BY-SA 4.0",       // license short name (or "Public domain")
//                             licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", // "" for PD
//                             source: "https://commons.wikimedia.org/wiki/File:File.jpg", // where it came from
//                           }
//   greeting    object | null
//                         A local-language greeting for this place. MUST be
//                         accurate and verifiable before it ships (rule 2) —
//                         keep null until checked (see SOURCES below). Shape:
//                           {
//                             text: "こんにちは (Konnichiwa)", // greeting in native script; add romanization in ( ) for non-Latin scripts
//                             language: "Japanese",           // language name, in English
//                             pronunciation: "kon-nee-chee-wah" // rough English "say it like this" (optional, may be null)
//                           }
//
// SOURCES — greetings verified 2026-07-05 against Wikipedia / Wiktionary and
//   language-dictionary references (e.g. As-salamu_alaykum, Jambo_(greeting),
//   Namaste on Wikipedia; Cambridge/Wiktionary for bonjour, olá, konnichiwa,
//   你好). Re-check before relying on them. Kenya: "Jambo" is the common
//   friendly/visitor greeting for "hello" (native speakers also use "Habari").
//   Egypt: "Marhaba" = an informal "hello/welcome"; "As-salamu alaykum" is the
//   more formal alternative. Australia: "G'day" is informal Australian English.
//
// PHOTOS — sourced from Wikimedia Commons and license-verified 2026-07-05 against
//   the Commons API (extmetadata). All are commercially-free (CC BY / CC BY-SA;
//   attribution shown in-game). Paris uses a DAYTIME Eiffel Tower shot on purpose
//   (the tower's night lighting is copyrighted in France). Rio (Christ the
//   Redeemer) is intentionally left without a photo — see the note on that entry.
//
// ICON KEYS (valid values for `icon`): "eiffel", "clocktower", "pyramid",
//   "lion", "fuji", "wall", "taj", "liberty", "christ", "opera". Any other
//   value draws a plain box. To add a new drawing, add a `case` in the
//   Landmark() switch in src/shutterbug-world.jsx (that is art, not content).
//
// ---------------------------------------------------------------------------
// COPY-PASTE TEMPLATE — duplicate this block, fill it in, add it to LOCATIONS
// ---------------------------------------------------------------------------
//   {
//     id: "",            // unique slug, e.g. "lima"
//     city: "",
//     country: "",
//     flag: "",          // emoji flag, e.g. "🇵🇪"
//     continent: "",     // e.g. "South America"
//     x: 0,              // longitude + 180  (0..360)
//     y: 0,              // 90 − latitude    (0..180)
//     subject: "",       // what to photograph
//     icon: "",          // an ICON KEY above (used until `photo` is set)
//     easy: "",          // clue that names the continent
//     hard: "",          // cryptic clue
//     fact: "",          // VERIFIED geography fact
//     photo: null,       // { src, credit, license, licenseUrl, source } once you have a CONFIRMED free image
//     greeting: null,    // { text, language, pronunciation } once verified
//   },
// ===========================================================================

export const LOCATIONS = [
  { id: "paris", city: "Paris", country: "France", flag: "🇫🇷", continent: "Europe",
    x: 182.4, y: 41.2,
    subject: "The Eiffel Tower", icon: "eiffel",
    easy: "In EUROPE, find the iron lattice tower in the French capital — the City of Light.",
    hard: "A wrought-iron giant, raised for a World's Fair, now marks a city of light.",
    fact: "The Eiffel Tower (1889) is ~330 m tall and was the world's tallest structure for 41 years. Paris is the capital of France.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=800",
      credit: "Benh Lieu Song", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons.jpg" },
    greeting: { text: "Bonjour", language: "French", pronunciation: "bohn-ZHOOR" } },
  { id: "london", city: "London", country: "United Kingdom", flag: "🇬🇧", continent: "Europe",
    x: 174.0, y: 36.0,
    subject: "Big Ben", icon: "clocktower",
    easy: "In EUROPE, photograph the great clock tower beside the river in the UK capital.",
    hard: "A famous bell tolls the hours above a grey river in a northern capital.",
    fact: "'Big Ben' is the bell; the tower is the Elizabeth Tower (1859). London is the capital of the United Kingdom.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Big_Ben_Elizabeth_Tower_London_2023_01.jpg?width=800",
      credit: "Julian Herzog", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Big_Ben_Elizabeth_Tower_London_2023_01.jpg" },
    greeting: { text: "Hello", language: "English", pronunciation: null } },
  { id: "cairo", city: "Cairo", country: "Egypt", flag: "🇪🇬", continent: "Africa",
    x: 211.2, y: 60.0,
    subject: "The Pyramids of Giza", icon: "pyramid",
    easy: "In AFRICA, capture the ancient stone tombs beside Egypt's capital, on the Nile.",
    hard: "Four-sided stone tombs of god-kings rise from desert sands beside a great river.",
    fact: "The Great Pyramid (~2560 BC) is the last surviving Wonder of the Ancient World. Cairo sits on the Nile, the longest river in Africa.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/All_Gizah_Pyramids.jpg?width=800",
      credit: "Ricardo Liberato", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg" },
    greeting: { text: "مرحبا (Marhaba)", language: "Arabic", pronunciation: "MAR-ha-ba" } },
  { id: "nairobi", city: "Nairobi", country: "Kenya", flag: "🇰🇪", continent: "Africa",
    x: 216.8, y: 91.3,
    subject: "A lion on safari", icon: "lion",
    easy: "In AFRICA, photograph the big cat on the savanna near Kenya's capital.",
    hard: "The 'king of beasts' prowls the East African grasslands.",
    fact: "Lions live in prides on the African savanna. Nairobi is Kenya's capital and borders a national park.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Lion,_Masai_Mara,_Kenya_(52465732340).jpg?width=800",
      credit: "flowcomm", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:Lion,_Masai_Mara,_Kenya_(52465732340).jpg" },
    greeting: { text: "Jambo", language: "Swahili", pronunciation: "JAM-boh" } },
  { id: "tokyo", city: "Tokyo", country: "Japan", flag: "🇯🇵", continent: "Asia",
    x: 319.7, y: 54.3,
    subject: "Mount Fuji", icon: "fuji",
    easy: "In ASIA, capture the snow-capped volcano southwest of Japan's capital.",
    hard: "A near-perfect snow-topped cone, sacred in an island nation, seen from the world's largest city.",
    fact: "Mount Fuji (3,776 m) is Japan's highest peak and an active volcano. Tokyo is the most populous metro area on Earth.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Fuji_from_Nihondaira.JPG?width=800",
      credit: "Alpsdake", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Mount_Fuji_from_Nihondaira.JPG" },
    greeting: { text: "こんにちは (Konnichiwa)", language: "Japanese", pronunciation: "kon-nee-chee-wah" } },
  { id: "beijing", city: "Beijing", country: "China", flag: "🇨🇳", continent: "Asia",
    x: 296.4, y: 50.1,
    subject: "The Great Wall", icon: "wall",
    easy: "In ASIA, find the ancient defensive wall winding through hills north of China's capital.",
    hard: "A stone serpent thousands of miles long guards the north of an ancient empire.",
    fact: "The Great Wall stretches over 21,000 km in total. Beijing is the capital of China, one of the two most populous countries.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Great_Wall_of_China_at_Jinshanling-edit.jpg?width=800",
      credit: "Severin.stalder", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:The_Great_Wall_of_China_at_Jinshanling-edit.jpg" },
    greeting: { text: "你好 (Nǐ hǎo)", language: "Mandarin Chinese", pronunciation: "nee-HOW" } },
  { id: "agra", city: "Agra", country: "India", flag: "🇮🇳", continent: "Asia",
    x: 258.0, y: 62.8,
    subject: "The Taj Mahal", icon: "taj",
    easy: "In ASIA, photograph the white marble tomb built for a queen, in northern India.",
    hard: "A grieving emperor's white-domed marble monument to lost love.",
    fact: "The Taj Mahal (completed 1653) is a marble mausoleum built by Shah Jahan. It stands in Agra, India.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal,_Agra,_India.jpg?width=800",
      credit: "Yann Forget", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India.jpg" },
    greeting: { text: "नमस्ते (Namaste)", language: "Hindi", pronunciation: "nuh-muh-STAY" } },
  { id: "nyc", city: "New York", country: "United States", flag: "🇺🇸", continent: "North America",
    x: 106.0, y: 49.3,
    subject: "The Statue of Liberty", icon: "liberty",
    easy: "In NORTH AMERICA, capture the copper statue in the harbour of the largest US city.",
    hard: "A gift from France: a green-copper figure lifts a torch over a busy harbour.",
    fact: "The Statue of Liberty (1886) was a gift from France and stands ~93 m from base to torch.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Liberty,_NY.jpg?width=800",
      credit: "William Warby", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:Statue_of_Liberty,_NY.jpg" },
    greeting: { text: "Hello", language: "English", pronunciation: null } },
  { id: "rio", city: "Rio de Janeiro", country: "Brazil", flag: "🇧🇷", continent: "South America",
    x: 136.8, y: 112.9,
    subject: "Christ the Redeemer", icon: "christ",
    easy: "In SOUTH AMERICA, photograph the mountaintop statue above Brazil's famous coastal city.",
    hard: "Arms outstretched atop a peak, a stone figure watches a southern bay.",
    fact: "Christ the Redeemer (1931) is 30 m tall atop Corcovado. Brazil is the largest country in South America.",
    // photo: LEFT NULL ON PURPOSE — flagged for your decision. Freely-licensed
    // photos exist (e.g. Arne Müseler, CC BY-SA 3.0 DE), but the statue itself is
    // still under copyright (sculptor Paul Landowski, d. 1961; ~2032) and Brazil's
    // freedom of panorama is legally contested, so a photo centering the statue is
    // not a clear-cut free use. Falls back to the hand-drawn icon until resolved.
    photo: null,
    greeting: { text: "Olá", language: "Portuguese", pronunciation: "oh-LAH" } },
  { id: "sydney", city: "Sydney", country: "Australia", flag: "🇦🇺", continent: "Oceania",
    x: 331.2, y: 123.9,
    subject: "The Sydney Opera House", icon: "opera",
    easy: "In OCEANIA, find the sail-shaped concert hall on the harbour of Australia's largest city.",
    hard: "White shells rise from a southern harbour in a nation that is also a continent.",
    fact: "The Sydney Opera House (1973) is a UNESCO World Heritage Site. Australia is both a country and a continent.",
    photo: { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Opera_House_-_Dec_2008.jpg?width=800",
      credit: "David Iliff", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_-_Dec_2008.jpg" },
    greeting: { text: "G'day", language: "English (Australian)", pronunciation: "g-DAY" } },
];
