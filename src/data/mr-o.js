// ===========================================================================
// MR. O — the young geography enthusiast who pops up now and then with an
// "Oh! Did you know…?" fact. He's the eager-kid foil to Grandpa Nigel's old-sage
// voice: he appears briefly (a non-blocking bubble) when you touch down on a new
// continent and shares one surprising, TRUE geography fact.
//
// FACT RULE (CLAUDE.md rule 2): every fact below is a well-established, verifiable
// piece of geography — no invented numbers, no approximations dressed as facts.
// The wonder is in the delivery, never in made-up claims. Grow this list freely.
//
// A stand-in emoji (🧒) stands in for art the user will drop in later.
// ===========================================================================

export const MR_O = {
  name: "Mr. O",
  emoji: "🧒",
  lead: "Oh! Did you know…",
  riddleLead: "Riddle me this…",
};

// ---- Mr. O's DOUBLE-POINTS RIDDLES ---------------------------------------
// Now and then Mr. O bursts in with a hard travel riddle — geography, language
// or culture — for DOUBLE points. Each is a multiple-choice question; the
// component shuffles the choices and marks the one matching `correct`.
//
// FACT RULE (rule 2): every riddle and its answer is a verified, well-established
// fact. Sources (verified 2026-07-11, Wikipedia/Britannica/standard references):
// Sargasso Sea = only sea with no land coastline (bounded by ocean currents);
// Swahili greetings "Jambo/Habari" (Kenya/East Africa); La Paz, Bolivia = world's
// highest administrative capital (~3,640 m); Japan "Nippon" = origin of the sun;
// Danube flows through 10 countries (most of any river); India drives on the left;
// China uses one official time zone despite its width; Thailand's currency = baht;
// Istanbul straddles Europe & Asia across the Bosphorus; "safari" = "journey" in
// Swahili; Norway = fjords, flag is a blue-white cross on red; flamenco is a
// Spanish (Andalusian) art form; the "hongi" is a Māori nose-press greeting (New
// Zealand); Lesotho is an enclave entirely surrounded by South Africa.
export const MR_O_RIDDLES = [
  { q: "I'm the only sea on Earth with no land coastline at all — ocean currents make my edges instead. Which sea am I?",
    choices: ["The Sargasso Sea", "The Caspian Sea", "The Coral Sea", "The Sea of Japan"], correct: "The Sargasso Sea",
    explain: "The Sargasso Sea, in the North Atlantic, is bounded by ocean currents rather than land — the only sea on Earth without a coastline." },
  { q: "In which country would a local welcome you with the Swahili greeting “Jambo!”?",
    choices: ["Kenya", "Morocco", "Peru", "Thailand"], correct: "Kenya",
    explain: "“Jambo” and “Habari” are Swahili greetings, spoken in Kenya and across East Africa." },
  { q: "Which is the world's highest capital, with its government seat over 3,600 m up in the Andes?",
    choices: ["La Paz, Bolivia", "Kathmandu, Nepal", "Quito, Ecuador", "Bogotá, Colombia"], correct: "La Paz, Bolivia",
    explain: "La Paz, Bolivia's seat of government, sits about 3,640 m above sea level — the highest capital in the world." },
  { q: "One big country's own name, “Nippon,” means “origin of the sun” — the Land of the Rising Sun. Which is it?",
    choices: ["Japan", "China", "South Korea", "Thailand"], correct: "Japan",
    explain: "“Nippon” (or “Nihon”) means “origin of the sun” — that's why Japan is called the Land of the Rising Sun." },
  { q: "Which river flows through more countries than any other — ten of them — before reaching the Black Sea?",
    choices: ["The Danube", "The Nile", "The Rhine", "The Amazon"], correct: "The Danube",
    explain: "The Danube passes through 10 countries — more than any other river on Earth." },
  { q: "You land at an airport and everyone is driving on the LEFT. Which of these countries could you be in?",
    choices: ["India", "France", "Brazil", "Germany"], correct: "India",
    explain: "India drives on the left (like the UK and Australia); France, Brazil and Germany all drive on the right." },
  { q: "Which country is about as wide as the whole United States, yet keeps just ONE official time zone?",
    choices: ["China", "Russia", "Canada", "Brazil"], correct: "China",
    explain: "China spans five geographic time zones but officially runs on a single one — Beijing time." },
  { q: "You're haggling in a market in Thailand. What money are you spending?",
    choices: ["The baht", "The ringgit", "The dong", "The rupee"], correct: "The baht",
    explain: "Thailand's currency is the baht; the ringgit is Malaysia's, the dong is Vietnam's." },
  { q: "Which great city is split between TWO continents, with a strait running right through its middle?",
    choices: ["Istanbul", "Cairo", "Athens", "Dubai"], correct: "Istanbul",
    explain: "Istanbul straddles Europe and Asia across the Bosphorus strait." },
  { q: "The word “safari,” for a wildlife journey, means simply “journey” in which language?",
    choices: ["Swahili", "Zulu", "Hindi", "Arabic"], correct: "Swahili",
    explain: "“Safari” is the Swahili word for “journey.”" },
  { q: "Which country is famous for its deep coastal fjords and a flag that's a blue-and-white cross on red?",
    choices: ["Norway", "Sweden", "Finland", "Denmark"], correct: "Norway",
    explain: "Norway is carved with fjords; its flag is a blue Scandinavian cross outlined in white on a red field." },
  { q: "Where might you watch a fiery flamenco dance and be greeted with “¡Hola!” in its homeland?",
    choices: ["Spain", "Portugal", "Italy", "Greece"], correct: "Spain",
    explain: "Flamenco is a traditional art form of Andalusia in Spain, where people greet you with “¡Hola!”" },
  { q: "In which country might you be greeted with a “hongi” — a gentle press of noses and foreheads?",
    choices: ["New Zealand", "Fiji", "Japan", "Norway"], correct: "New Zealand",
    explain: "The hongi is a traditional Māori greeting in New Zealand — pressing noses and foreheads together." },
  { q: "Which small mountain kingdom is completely surrounded by just one country, South Africa?",
    choices: ["Lesotho", "Eswatini", "Botswana", "Namibia"], correct: "Lesotho",
    explain: "Lesotho is an enclave — a whole country entirely encircled by South Africa." },
];

// Mr. O's "Oh! Did you know…" facts, tagged with the continent they're about so
// the bubble matches the map the player just landed on. `where: null` facts are
// globally true and can appear on any continent. All verified (rule 2). Continent
// names match the game's CONTINENTS list exactly.
export const MR_O_FACTS = [
  // ---- Africa ----
  { where: "Africa", text: "The Sahara in northern Africa is the largest hot desert — roughly the size of the whole United States." },
  { where: "Africa", text: "Africa is the only continent with land in all four hemispheres — north, south, east and west." },
  { where: "Africa", text: "The Nile flows north, which surprises people who expect rivers to run 'down' the map." },
  { where: "Africa", text: "Mount Kilimanjaro in Tanzania has snow at its top even though it stands near the equator." },
  { where: "Africa", text: "Africa has 54 countries — more than any other continent." },
  // ---- Asia ----
  { where: "Asia", text: "Asia is the biggest continent, covering about a third of all the land on Earth." },
  { where: "Asia", text: "Mount Everest, on the border of Nepal and China, is the highest mountain above sea level." },
  { where: "Asia", text: "Lake Baikal in Russia is the deepest lake on Earth and holds around a fifth of the world's unfrozen fresh water." },
  { where: "Asia", text: "The Caspian Sea is really the largest lake on Earth, even though its name says 'sea.'" },
  { where: "Asia", text: "Japan is made up of thousands of islands — more than 14,000 of them!" },
  { where: "Asia", text: "The Dead Sea, on the edge of Jordan, is so salty that you float on top without even trying." },
  { where: "Asia", text: "Indonesia is spread over more than 17,000 islands, strung along the equator." },
  // ---- Europe ----
  { where: "Europe", text: "Iceland sits right on the crack between two of Earth's giant plates, which is why it has so many volcanoes." },
  { where: "Europe", text: "Vatican City is the smallest country in the world — you can walk all the way across it in minutes." },
  { where: "Europe", text: "The Alps arc across eight countries, and are still slowly rising as two of Earth's plates squeeze together." },
  { where: "Europe", text: "The Danube flows through ten countries on its way to the Black Sea — more than any other river on Earth." },
  { where: "Europe", text: "Mount Etna, on the Italian island of Sicily, is one of the world's most active volcanoes." },
  { where: "Europe", text: "The Volga is the longest river in Europe, winding some 2,200 miles (3,500 km) across Russia." },
  // ---- North America ----
  { where: "North America", text: "Canada has more lakes than every other country in the world combined." },
  { where: "North America", text: "Greenland is the world's largest island — Australia is bigger, but it counts as a continent instead." },
  { where: "North America", text: "Denali in Alaska is the highest peak in North America, at about 20,300 feet (6,190 metres)." },
  { where: "North America", text: "The Great Lakes together hold about a fifth of all the fresh surface water on Earth." },
  { where: "North America", text: "Death Valley in California is North America's hottest, lowest spot — it dips below sea level." },
  { where: "North America", text: "Mexico City is slowly sinking, because it's built on the soft bed of a drained lake." },
  // ---- South America ----
  { where: "South America", text: "The Andes in South America are the longest mountain range on land — about 4,300 miles (7,000 km)!" },
  { where: "South America", text: "Chile is one of the longest, thinnest countries — over 2,500 miles (4,000 km) long but rarely 125 miles (200 km) wide." },
  { where: "South America", text: "The Amazon carries more water than the next several biggest rivers on Earth combined." },
  { where: "South America", text: "The Atacama Desert in Chile is the driest place on Earth — parts may go years, even decades, without rain." },
  { where: "South America", text: "Angel Falls in Venezuela is the world's tallest waterfall, plunging more than 3,000 feet (about 980 metres)." },
  // ---- Oceania ----
  { where: "Oceania", text: "The Pacific is the biggest ocean, larger than all the land on Earth put together." },
  { where: "Oceania", text: "Australia is the only country that is also a whole continent all by itself." },
  { where: "Oceania", text: "The Great Barrier Reef off Australia is the largest living structure on Earth — you can spot it from space." },
  { where: "Oceania", text: "Point Nemo, in the Pacific, is the spot on the ocean farthest from any land in every direction." },
  { where: "Oceania", text: "Australia is home to more kinds of venomous snake than any other country on Earth." },
  // ---- Antarctica ----
  { where: "Antarctica", text: "Antarctica is the coldest, windiest and driest continent — it's actually counted as a desert." },
  { where: "Antarctica", text: "Antarctica holds about 90% of all the ice on Earth, and most of the world's fresh water is frozen there." },
  { where: "Antarctica", text: "Nobody lives in Antarctica for good — only scientists visiting its research stations." },
  { where: "Antarctica", text: "The coldest temperature ever measured on Earth, around −128°F (−89°C), was recorded in Antarctica." },
  { where: "Antarctica", text: "Hidden beneath Antarctica's ice are mountains and valleys — and Lake Vostok, sealed under the ice for millions of years." },
  // ---- Anywhere (globally true) ----
  { where: null, text: "Russia is so wide it spreads across 11 time zones — when it's breakfast on one side, it's bedtime on the other!" },
  { where: null, text: "There are nearly 200 countries in the world today." },
  { where: null, text: "The equator is an imaginary line around the middle of the Earth, where it stays warm all year round." },
  { where: null, text: "Earth has five oceans; the Southern Ocean around Antarctica was the last to be recognised." },
  { where: null, text: "A compass needle points to the magnetic north pole, which slowly drifts and isn't quite at the true North Pole." },
];
