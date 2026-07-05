// ---------------------------------------------------------------------------
// Game content — locations, clues, and geography facts.
//
// Per the project rules (see CLAUDE.md): all player-facing game content lives
// here, never hard-coded into components. Components import from this module.
//
// Every `fact` and any foreign-language text MUST be accurate and verifiable
// against a reliable source before it ships. Do not guess or approximate.
//
// Coordinate system: mapX in 0..360 (longitude + 180), mapY in 0..180 (90 - latitude).
// ---------------------------------------------------------------------------

export const LOCATIONS = [
  { id: "paris", city: "Paris", country: "France", flag: "🇫🇷", continent: "Europe",
    subject: "The Eiffel Tower", icon: "eiffel", x: 182.4, y: 41.2,
    easy: "In EUROPE, find the iron lattice tower in the French capital — the City of Light.",
    hard: "A wrought-iron giant, raised for a World's Fair, now marks a city of light.",
    fact: "The Eiffel Tower (1889) is ~330 m tall and was the world's tallest structure for 41 years. Paris is the capital of France." },
  { id: "london", city: "London", country: "United Kingdom", flag: "🇬🇧", continent: "Europe",
    subject: "Big Ben", icon: "clocktower", x: 174.0, y: 36.0,
    easy: "In EUROPE, photograph the great clock tower beside the river in the UK capital.",
    hard: "A famous bell tolls the hours above a grey river in a northern capital.",
    fact: "'Big Ben' is the bell; the tower is the Elizabeth Tower (1859). London is the capital of the United Kingdom." },
  { id: "cairo", city: "Cairo", country: "Egypt", flag: "🇪🇬", continent: "Africa",
    subject: "The Pyramids of Giza", icon: "pyramid", x: 211.2, y: 60.0,
    easy: "In AFRICA, capture the ancient stone tombs beside Egypt's capital, on the Nile.",
    hard: "Four-sided stone tombs of god-kings rise from desert sands beside a great river.",
    fact: "The Great Pyramid (~2560 BC) is the last surviving Wonder of the Ancient World. Cairo sits on the Nile, the longest river in Africa." },
  { id: "nairobi", city: "Nairobi", country: "Kenya", flag: "🇰🇪", continent: "Africa",
    subject: "A lion on safari", icon: "lion", x: 216.8, y: 91.3,
    easy: "In AFRICA, photograph the big cat on the savanna near Kenya's capital.",
    hard: "The 'king of beasts' prowls the East African grasslands.",
    fact: "Lions live in prides on the African savanna. Nairobi is Kenya's capital and borders a national park." },
  { id: "tokyo", city: "Tokyo", country: "Japan", flag: "🇯🇵", continent: "Asia",
    subject: "Mount Fuji", icon: "fuji", x: 319.7, y: 54.3,
    easy: "In ASIA, capture the snow-capped volcano southwest of Japan's capital.",
    hard: "A near-perfect snow-topped cone, sacred in an island nation, seen from the world's largest city.",
    fact: "Mount Fuji (3,776 m) is Japan's highest peak and an active volcano. Tokyo is the most populous metro area on Earth." },
  { id: "beijing", city: "Beijing", country: "China", flag: "🇨🇳", continent: "Asia",
    subject: "The Great Wall", icon: "wall", x: 296.4, y: 50.1,
    easy: "In ASIA, find the ancient defensive wall winding through hills north of China's capital.",
    hard: "A stone serpent thousands of miles long guards the north of an ancient empire.",
    fact: "The Great Wall stretches over 21,000 km in total. Beijing is the capital of China, one of the two most populous countries." },
  { id: "agra", city: "Agra", country: "India", flag: "🇮🇳", continent: "Asia",
    subject: "The Taj Mahal", icon: "taj", x: 258.0, y: 62.8,
    easy: "In ASIA, photograph the white marble tomb built for a queen, in northern India.",
    hard: "A grieving emperor's white-domed marble monument to lost love.",
    fact: "The Taj Mahal (completed 1653) is a marble mausoleum built by Shah Jahan. It stands in Agra, India." },
  { id: "nyc", city: "New York", country: "United States", flag: "🇺🇸", continent: "North America",
    subject: "The Statue of Liberty", icon: "liberty", x: 106.0, y: 49.3,
    easy: "In NORTH AMERICA, capture the copper statue in the harbour of the largest US city.",
    hard: "A gift from France: a green-copper figure lifts a torch over a busy harbour.",
    fact: "The Statue of Liberty (1886) was a gift from France and stands ~93 m from base to torch." },
  { id: "rio", city: "Rio de Janeiro", country: "Brazil", flag: "🇧🇷", continent: "South America",
    subject: "Christ the Redeemer", icon: "christ", x: 136.8, y: 112.9,
    easy: "In SOUTH AMERICA, photograph the mountaintop statue above Brazil's famous coastal city.",
    hard: "Arms outstretched atop a peak, a stone figure watches a southern bay.",
    fact: "Christ the Redeemer (1931) is 30 m tall atop Corcovado. Brazil is the largest country in South America." },
  { id: "sydney", city: "Sydney", country: "Australia", flag: "🇦🇺", continent: "Oceania",
    subject: "The Sydney Opera House", icon: "opera", x: 331.2, y: 123.9,
    easy: "In OCEANIA, find the sail-shaped concert hall on the harbour of Australia's largest city.",
    hard: "White shells rise from a southern harbour in a nation that is also a continent.",
    fact: "The Sydney Opera House (1973) is a UNESCO World Heritage Site. Australia is both a country and a continent." },
];
