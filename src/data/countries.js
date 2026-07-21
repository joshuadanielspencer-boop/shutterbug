// ===========================================================================
// COUNTRY-LEVEL CONTENT for the country-map layer.
//
// In Medium/Hard modes, after flying to the right continent the player picks the
// right COUNTRY, then the map zooms into it to choose the landmark. This file
// holds the human-written, fact-checked bits that can't be derived: each
// country's capital, its region within the continent, and a short kid-friendly
// BLURB that helps the player reason out which country a clue points to (and,
// once there, which of its landmarks fits). Flags, greetings and the list of a
// country's landmarks are derived from src/data/locations.js at runtime.
//
// Every country a player can reach has an entry (test/data.test.js enforces it).
// Antarctica is the only exception — it has no country, so no capital or blurb.
//
// `quizCapital: false` marks a country whose capital is NOT a single unambiguous
// city, so the "What is the capital of X?" quiz question skips it. Its `capital`
// field is then a readable phrase rather than one city name. That covers South
// Africa (three capitals, one per branch of government), Bolivia (constitutional
// capital vs seat of government), Sri Lanka (official vs largest city),
// Indonesia (Jakarta while Nusantara is built), and Taiwan (its political status
// is disputed; the entry stays strictly geographic and takes no position).
//
// Blurbs and capitals verified 2026-07 against Wikipedia, Britannica, UNESCO and
// official sources. Watch-outs already checked: the capital is NOT the largest
// city for Australia, Brazil, Canada, Ecuador, Morocco, Myanmar, Nigeria, the
// Philippines, Tanzania, Turkey, the UAE and the United States. Bern is
// Switzerland's de-facto ("federal city") capital. Russia and Turkey span Europe
// and Asia — their blurbs say so. Greenland (Denmark) and French Polynesia
// (France) are territories, not independent countries, and say so.
// ===========================================================================
export const COUNTRY_INFO = {
  // ---- Europe ----
  "United Kingdom": { capital: "London", region: "British Isles", blurb: "The United Kingdom sits in the British Isles off Europe's northwest coast, ruled from its capital London. This island nation of England, Scotland, Wales, and Northern Ireland is famous for rainy weather, red buses, and afternoon tea." },
  "Italy": { capital: "Rome", region: "Southern Europe", blurb: "Italy, in Southern Europe, is a long boot-shaped peninsula kicking out into the Mediterranean Sea, ruled from its capital Rome. It's the birthplace of pizza and pasta and the heart of the ancient Roman Empire." },
  "France": { capital: "Paris", region: "Western Europe", blurb: "France, in Western Europe, is famous for art, food, and fashion; from its capital of Paris to lavender fields and snowy Alps, it's one of the most-visited countries on Earth." },
  "Greece": { capital: "Athens", region: "Southern Europe", blurb: "Greece, in Southern Europe at the tip of the Balkan Peninsula, is ruled from Athens and sprinkled with thousands of sunny islands. It gave the world the first Olympic Games and many ancient myths." },
  "Russia": { capital: "Moscow", region: "Eastern Europe", blurb: "Russia stretches from Eastern Europe all the way across northern Asia, making it the largest country on Earth. Its capital, Moscow, lies on the European side, a land of long, snowy winters." },
  "Saudi Arabia": { capital: "Riyadh", region: "Middle East", blurb: "Saudi Arabia is the largest country in the Middle East, covering most of the Arabian Peninsula, and is ruled from its capital, Riyadh. Much of it is desert, including the Rub' al Khali, or 'Empty Quarter,' the largest continuous sand desert on Earth." },
  "Germany": { capital: "Berlin", region: "Central Europe", blurb: "Germany, in Central Europe, is governed from Berlin and sits at the crossroads of the continent. It's known for deep forests, the Rhine River, sausages and pretzels, and building lots of cars." },
  "Croatia": { capital: "Zagreb", region: "Balkans", blurb: "Croatia, in the Balkans along the sparkling Adriatic Sea, is ruled from its capital Zagreb. This crescent-shaped country has a long, sunny coastline dotted with more than a thousand islands." },
  "Iceland": { capital: "Reykjavík", region: "Northern Europe", blurb: "Iceland is a volcanic island in Northern Europe near the Arctic Circle, home to the capital Reykjavík. It bubbles with hot springs and geysers, is capped with glaciers, and enjoys long, bright summer days." },
  "Spain": { capital: "Madrid", region: "Iberia", blurb: "Spain fills most of the Iberian Peninsula in southwestern Europe and is ruled from Madrid in its sunny center. It's famous for flamenco dancing, afternoon siestas, and colorful festivals." },
  "Turkey": { capital: "Ankara", region: "Balkans", blurb: "Turkey bridges Europe and Asia. Its capital is Ankara, while its biggest city, Istanbul, sits partly in Europe across a narrow strait. It's known for busy bazaars, kebabs, and sweet, flaky baklava." },
  "Portugal": { capital: "Lisbon", region: "Iberia", blurb: "Portugal runs along the Iberian Peninsula's Atlantic edge in southwestern Europe, ruled from Lisbon. This sunny seafaring nation once launched famous ocean explorers and is the home of custard tarts and port wine." },
  "Czechia": { capital: "Prague", region: "Central Europe", blurb: "Czechia, a landlocked country in the heart of Central Europe, is ruled from its fairy-tale capital, Prague. It's famous for hilltop castles, puppet theaters, and hearty dumplings." },
  "Netherlands": { capital: "Amsterdam", region: "Western Europe", blurb: "The Netherlands, in Western Europe, is ruled from Amsterdam and sits so low and flat that much of its land was reclaimed from the sea. It's crisscrossed by canals and famous for tulips, windmills, and bicycles." },
  "Austria": { capital: "Vienna", region: "Central Europe", blurb: "Austria, a landlocked country in Central Europe, is governed from Vienna. Much of it is wrapped in the snowy Alps, making it a land of mountain villages, classical music, and skiing." },
  "Belgium": { capital: "Brussels", region: "Western Europe", blurb: "Belgium, in Western Europe, is ruled from Brussels, a city that also helps lead the European Union. This small country is famous for waffles, crispy fries, and some of the world's finest chocolate." },
  "Switzerland": { capital: "Bern", region: "Central Europe", blurb: "Switzerland, a landlocked country in Central Europe, is governed from Bern. It's wrapped in the snowy Alps and known for chocolate, cheese, mountain railways, and famously staying neutral in wars." },
  "Norway": { capital: "Oslo", region: "Scandinavia", blurb: "Norway, in Scandinavia in Northern Europe, is ruled from Oslo. Its long coastline is carved into deep, steep-sided fjords, and in the far north the winter sky glows with the northern lights." },
  "Finland": { capital: "Helsinki", region: "Northern Europe", blurb: "Finland is a Nordic country in Northern Europe, bordering Sweden, Norway, and Russia, with its capital at Helsinki. Nicknamed the land of a thousand lakes, it actually has over 180,000 of them, plus vast boreal forests." },
  "Ireland": { capital: "Dublin", region: "British Isles", blurb: "Ireland is an island country in the British Isles off Western Europe, and its capital is Dublin. Its rugged west coast is famous for the towering Cliffs of Moher, which rise straight up from the crashing Atlantic Ocean." },
  "Poland": { capital: "Warsaw", region: "Central Europe", blurb: "Poland is a country in Central Europe stretching from the Baltic Sea to mountains in the south, with its capital at Warsaw. Its Białowieża Forest is one of Europe's last ancient woodlands and home to over 800 European bison." },
  "Sweden": { capital: "Stockholm", region: "Scandinavia", blurb: "Sweden is a Scandinavian country in Northern Europe, and its capital, Stockholm, is spread across fourteen islands where a lake meets the Baltic Sea. Much of the country is blanketed in deep green forests." },

  // ---- Africa ----
  "Algeria": { capital: "Algiers", region: "North Africa", blurb: "Algeria is the largest country in all of Africa, stretched across North Africa with its capital, Algiers, on the sparkling Mediterranean coast. Most of the land is covered by the vast, sandy Sahara, the biggest hot desert on Earth." },
  "Botswana": { capital: "Gaborone", region: "Southern Africa", blurb: "Botswana is a mostly dry, sunny country in Southern Africa, and its capital is Gaborone. It is home to more elephants than any other country, and to the Okavango Delta, a huge maze of water and islands where wildlife gathers." },
  "Egypt": { capital: "Cairo", region: "North Africa", blurb: "Egypt sits in North Africa, where its capital, Cairo, bustles beside the mighty Nile River. Close by stand the ancient Pyramids of Giza, built more than 4,000 years ago and still among the most famous wonders in the world." },
  "Ethiopia": { capital: "Addis Ababa", region: "Horn of Africa", blurb: "Ethiopia rises across green highlands in the Horn of Africa, with its capital, Addis Ababa, perched high in the mountains. It is the birthplace of coffee, whose wild plants first grew in Ethiopia's forests in a region called Kaffa." },
  "Ghana": { capital: "Accra", region: "West Africa", blurb: "Ghana is a warm, friendly country in West Africa, with its capital, Accra, sitting on the Gulf of Guinea. It holds Lake Volta, the largest reservoir in the world by surface area, made by building a dam across a great river." },
  "Kenya": { capital: "Nairobi", region: "East Africa", blurb: "Kenya lies in East Africa, where its capital, Nairobi, even has a wildlife national park right on its edge. Across its grassy plains, huge herds of wildebeest and zebra thunder through the Maasai Mara during their great yearly migration." },
  "Madagascar": { capital: "Antananarivo", region: "Indian Ocean", blurb: "Madagascar is a giant island nation in the Indian Ocean, off Africa's southeast coast, with its capital at Antananarivo. Lemurs, playful animals found in the wild nowhere else on Earth, leap through its forests among towering baobab trees." },
  "Mali": { capital: "Bamako", region: "West Africa", blurb: "Mali is a landlocked country in West Africa, with its capital, Bamako, set on the Niger River. It is famous for the ancient trading city of Timbuktu and the Great Mosque of Djenné, the largest mud-brick building in the world." },
  "Morocco": { capital: "Rabat", region: "North Africa", blurb: "Morocco sits in the northwest corner of North Africa, and its capital is Rabat, not the bigger city of Casablanca. The snowy Atlas Mountains run across the land, while the golden dunes of the Sahara stretch away to the south." },
  "Namibia": { capital: "Windhoek", region: "Southern Africa", blurb: "Namibia lies along the Atlantic coast of Southern Africa, with its capital at Windhoek. It is home to the Namib, one of the oldest deserts on Earth, where rust-red sand dunes at Sossusvlei rise hundreds of meters high." },
  "Nigeria": { capital: "Abuja", region: "West Africa", blurb: "Nigeria is the most populous country in Africa, found in West Africa, with its capital at Abuja instead of the larger city of Lagos. The great Niger River, which gives the country its name, winds across it to the sea." },
  "Rwanda": { capital: "Kigali", region: "East Africa", blurb: "Rwanda is a small country in East Africa, nicknamed the 'Land of a Thousand Hills,' with its tidy capital at Kigali. In its misty mountain forests live rare mountain gorillas, gentle giants that visitors travel from far away to see." },
  "South Africa": { capital: "Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial)", region: "Southern Africa", quizCapital: false, blurb: "South Africa is at the very southern tip of Southern Africa and is unusual in having three capital cities, each for a different part of its government. Here the Atlantic and Indian Oceans meet, and flat-topped Table Mountain rises above the city of Cape Town." },
  "Sudan": { capital: "Khartoum", region: "North Africa", blurb: "Sudan lies in North Africa, where its capital, Khartoum, sits at the very place the Blue Nile and White Nile rivers join together. Long ago the kingdom of Kush built the pyramids of Meroë here, so Sudan holds even more ancient pyramids than Egypt." },
  "Tanzania": { capital: "Dodoma", region: "East Africa", blurb: "Tanzania is in East Africa, and its official capital is Dodoma, though the seaside city of Dar es Salaam is larger. Towering over the plains is Mount Kilimanjaro, the highest mountain in all of Africa and a snow-capped giant near the equator." },
  "Uganda": { capital: "Kampala", region: "East Africa", blurb: "Uganda lies in East Africa, a green, hilly country whose capital is Kampala. At the town of Jinja, the White Nile begins its long journey north, flowing out of Lake Victoria, the largest lake in all of Africa." },
  "Zimbabwe": { capital: "Harare", region: "Southern Africa", blurb: "Zimbabwe is a landlocked country in Southern Africa, with its capital at Harare. On its border thunders Victoria Falls, one of the largest waterfalls in the world, which local people call 'the Smoke that Thunders.'" },
  "Senegal": { capital: "Dakar", region: "West Africa", blurb: "Senegal, on the westernmost tip of West Africa, is ruled from its coastal capital Dakar, where the land juts furthest into the Atlantic. It's famous for lively music, peanut farms, and the pink waters of Lake Retba." },
  "Cameroon": { capital: "Yaoundé", region: "Central Africa", blurb: "Cameroon, on the Gulf of Guinea where West and Central Africa meet, is governed from its hilltop capital Yaoundé. Nicknamed 'Africa in miniature,' it packs in beaches, rainforest, savanna, and a towering volcano." },
  "Côte d'Ivoire": { capital: "Yamoussoukro", region: "West Africa", blurb: "Côte d'Ivoire, on the coast of West Africa, is governed from its inland capital Yamoussoukro, though the seaside city of Abidjan is its largest. It is the world's biggest grower of cocoa, the beans that become chocolate." },
  "Benin": { capital: "Porto-Novo", region: "West Africa", quizCapital: false, blurb: "Benin is a narrow country in West Africa whose official capital is Porto-Novo, while nearby Cotonou is the seat of government and its largest city. It was once the powerful Kingdom of Dahomey, famed for its royal palaces." },
  "Dem. Rep. Congo": { capital: "Kinshasa", region: "Central Africa", blurb: "The Democratic Republic of the Congo sprawls across the heart of Central Africa, ruled from its riverside capital Kinshasa. Cloaked in vast rainforest along the mighty Congo River, it is home to gorillas, okapi, and steaming volcanoes." },
  "Zambia": { capital: "Lusaka", region: "Southern Africa", blurb: "Zambia, a landlocked country in Southern Africa, is ruled from its central capital Lusaka. Threaded by the Zambezi River, it shares the thundering Victoria Falls and the huge man-made Lake Kariba with its neighbors." },

  // ---- Asia ----
  "Cambodia": { capital: "Phnom Penh", region: "Southeast Asia", blurb: "Cambodia is a country in Southeast Asia, with its capital at Phnom Penh where two great rivers meet. It is home to Angkor Wat, the largest religious monument in the world, whose towers even appear on the Cambodian flag." },
  "China": { capital: "Beijing", region: "East Asia", blurb: "China is a vast country in East Asia, and its capital is Beijing. The Great Wall of China winds for thousands of kilometers across its hills, and China's misty bamboo forests are the only wild home of the black-and-white giant panda." },
  "India": { capital: "New Delhi", region: "South Asia", blurb: "India is a large country in South Asia, and its capital is New Delhi. Its northern edge holds part of the towering Himalaya mountains, and India is famous for the Taj Mahal, a gleaming white marble tomb built over 350 years ago." },
  "Indonesia": { capital: "Jakarta", region: "Southeast Asia", quizCapital: false, blurb: "Indonesia is a country of many islands in Southeast Asia, with its capital at Jakarta while a new capital, Nusantara, is being built. Spread across thousands of islands, it is the only home of the Komodo dragon, the world's largest living lizard." },
  "Iran": { capital: "Tehran", region: "Middle East", blurb: "Iran is a country in the Middle East, and its capital is Tehran. Long ago it was the heart of the ancient Persian Empire, and the ruins of its grand city Persepolis, begun over 2,500 years ago, still stand today." },
  "Japan": { capital: "Tokyo", region: "East Asia", blurb: "Japan is an island nation in East Asia, and its capital is the huge city of Tokyo. Its most famous sight is Mount Fuji, a snow-capped volcano, and speedy bullet trains called shinkansen zip travelers across the country." },
  "Jordan": { capital: "Amman", region: "Middle East", blurb: "Jordan is a country in the Middle East, and its capital is Amman. It shares the shore of the Dead Sea, the lowest dry land on Earth, and hides Petra, an ancient city carved straight into rose-colored rock." },
  "Mongolia": { capital: "Ulaanbaatar", region: "East Asia", blurb: "Mongolia is a country in East Asia, and its capital is Ulaanbaatar. Much of it is wide, grassy steppe and the vast Gobi Desert, where many families still live in round felt tents called gers and herd animals on horseback." },
  "Myanmar": { capital: "Naypyidaw", region: "Southeast Asia", blurb: "Myanmar is a country in Southeast Asia, and since 2005 its capital has been the planned city of Naypyidaw. The ancient plains of Bagan are dotted with thousands of old Buddhist temples, and the long Irrawaddy River flows through the land." },
  "Nepal": { capital: "Kathmandu", region: "South Asia", blurb: "Nepal is a country in South Asia, and its capital is Kathmandu. Along its northern border rise the Himalaya mountains, including Mount Everest, the highest mountain on Earth at about 29,000 feet (8,849 m) above sea level." },
  "Pakistan": { capital: "Islamabad", region: "South Asia", blurb: "Pakistan is a country in South Asia, and its capital is Islamabad. The mighty Indus River flows the length of the land, and Pakistan's northern mountains include K2, the second-highest peak on Earth." },
  "Philippines": { capital: "Manila", region: "Southeast Asia", blurb: "The Philippines is a country in Southeast Asia, and its capital is Manila. It is made up of over 7,000 islands, and its forests shelter the tiny tarsier, a big-eyed primate small enough to fit in your hand." },
  "Singapore": { capital: "Singapore", region: "Southeast Asia", blurb: "Singapore is a tiny island city-state in Southeast Asia, so the whole country is really one big city. It is famous for its spotless streets and the Gardens by the Bay, where giant tree-shaped towers glow at night." },
  "South Korea": { capital: "Seoul", region: "East Asia", blurb: "South Korea is a country in East Asia, and its capital is Seoul. It sits on a mountainous peninsula, and its lively culture has spread worldwide through K-pop music and taekwondo, a martial art that grew up in Korea." },
  "Sri Lanka": { capital: "Sri Jayawardenepura Kotte (official) / Colombo (largest city)", region: "South Asia", quizCapital: false, blurb: "Sri Lanka is an island country in South Asia; its official capital is Sri Jayawardenepura Kotte, while nearby Colombo is the largest city. Shaped like a teardrop, it is famous for its 'Ceylon' tea and its herds of wild Asian elephants." },
  "Taiwan": { capital: "Taipei", region: "East Asia", quizCapital: false, blurb: "Taiwan is an island in East Asia, and its seat of government is Taipei. Green mountains run down its middle, the skyscraper Taipei 101 towers over the city, and Taiwan is the birthplace of sweet, chewy bubble tea." },
  "Thailand": { capital: "Bangkok", region: "Southeast Asia", blurb: "Thailand is a country in Southeast Asia, and its capital is Bangkok. It is dotted with glittering golden Buddhist temples, and the elephant is a national symbol treasured throughout Thai history and culture." },
  "United Arab Emirates": { capital: "Abu Dhabi", region: "Middle East", blurb: "The United Arab Emirates is a country in the Middle East, and its capital is Abu Dhabi, not its most famous city, Dubai. Rising from the desert in Dubai is the Burj Khalifa, the tallest building in the world at over 2,620 feet (800 m)." },
  "Uzbekistan": { capital: "Tashkent", region: "Central Asia", blurb: "Uzbekistan is a country in Central Asia, and its capital is Tashkent. Long ago the famous Silk Road trade route crossed it, and its city of Samarkand is known for the Registan, a plaza framed by dazzling blue-tiled buildings." },
  "Vietnam": { capital: "Hanoi", region: "Southeast Asia", blurb: "Vietnam is a long, narrow country in Southeast Asia, and its capital is Hanoi. Off its coast lies Ha Long Bay, where thousands of towering limestone islands rise straight out of the emerald-green sea." },

  // ---- North America ----
  "Canada": { capital: "Ottawa", region: "North America", blurb: "Canada fills the northern half of North America, reaching from the Atlantic to the Pacific, with its capital at Ottawa. It is the second-largest country in the world by area and has the longest coastline of any nation on Earth." },
  "Costa Rica": { capital: "San José", region: "Central America", blurb: "Costa Rica is a small country in Central America, home to the capital San José. It is famous for lush rainforests full of sloths, monkeys, and colorful frogs, and in 1948 it became one of the few nations to abolish its army altogether." },
  "Cuba": { capital: "Havana", region: "Caribbean", blurb: "Cuba is an island nation in the Caribbean Sea, with its capital at Havana. It is the largest island in the Caribbean, known for warm beaches, sugarcane and tobacco fields, and the colorful classic cars that still roll through Havana's streets." },
  "Greenland": { capital: "Nuuk", region: "the Arctic", blurb: "Greenland is a huge, icy island in the Arctic and an autonomous territory of the Kingdom of Denmark, not a separate country; its capital is Nuuk. It is the world's largest island, and a thick ice sheet covers about four-fifths of it." },
  "Guatemala": { capital: "Guatemala City", region: "Central America", blurb: "Guatemala is a country in Central America, home to the capital, Guatemala City. Its forests hide ancient Maya cities like Tikal, whose stone temples rise above the treetops, and even its money — the quetzal — is named after a brilliant green bird." },
  "Mexico": { capital: "Mexico City", region: "North America", blurb: "Mexico is a large country in North America, and its capital, Mexico City, is one of the biggest cities in the world. Long ago, great civilizations built stone pyramids here, like Teotihuacan and Chichén Itzá, which visitors still explore today." },
  "Panama": { capital: "Panama City", region: "Central America", blurb: "Panama is a narrow country in Central America that links North and South America, with its capital at Panama City. It is home to the Panama Canal, a famous waterway where ships sail between the Atlantic and Pacific Oceans." },
  "United States": { capital: "Washington, D.C.", region: "North America", blurb: "The United States spreads across North America, and its capital is Washington, D.C., not its largest city, New York. It is made up of 50 states and stretches from the Atlantic Ocean to the Pacific, with mountains, prairies, and deserts in between." },
  "Belize": { capital: "Belmopan", region: "Central America", blurb: "Belize sits on the Caribbean coast of Central America, with the small planned city of Belmopan as its capital. Just offshore lies the Belize Barrier Reef, the second-largest coral reef in the world, home to the famous deep-blue sinkhole called the Great Blue Hole." },
  "Haiti": { capital: "Port-au-Prince", region: "Caribbean", blurb: "Haiti covers the western third of the Caribbean island of Hispaniola, with Port-au-Prince as its capital. Its name is a Taíno word meaning 'land of high mountains,' and in 1804 it became the first nation founded by people who had freed themselves from slavery." },
  "Honduras": { capital: "Tegucigalpa", region: "Central America", blurb: "Honduras stretches across Central America between the Caribbean Sea and the Pacific Ocean, with Tegucigalpa as its capital. Deep in its jungles stand the ancient Maya ruins of Copán, famous for beautifully carved stone monuments and towering staircases covered in hieroglyphs." },
  "Jamaica": { capital: "Kingston", region: "Caribbean", blurb: "Jamaica is a lush Caribbean island south of Cuba, with the bustling port of Kingston as its capital. It is the birthplace of reggae music, made famous worldwide by Bob Marley, and its misty Blue Mountains grow some of the most prized coffee on Earth." },
  "Nicaragua": { capital: "Managua", region: "Central America", blurb: "Nicaragua lies in the heart of Central America, with Managua, set beside its own lake, as the capital. It is nicknamed the 'land of lakes and volcanoes,' and Lake Nicaragua — the region's largest lake — cradles Ometepe, an island formed by two volcanoes." },
  "Trinidad and Tobago": { capital: "Port of Spain", region: "Caribbean", blurb: "Trinidad and Tobago is a twin-island nation in the southern Caribbean, near Venezuela, with Port of Spain as its capital. It is the birthplace of the steelpan — a musical instrument made from oil drums — and hosts one of the world's most colorful Carnival celebrations." },

  // ---- South America ----
  "Argentina": { capital: "Buenos Aires", region: "Southern Cone", blurb: "Argentina stretches down the Southern Cone of South America to its capital, Buenos Aires. It holds the wide, grassy Pampas where gauchos ride, the wild lands of Patagonia, and Aconcagua, the highest mountain in all the Americas." },
  "Bolivia": { capital: "Sucre (constitutional); La Paz (seat of government)", region: "Andes", quizCapital: false, blurb: "Bolivia is a landlocked country high in the Andes; Sucre is its constitutional capital and La Paz is its seat of government. It holds the Salar de Uyuni, the largest salt flat on Earth, which turns into a giant mirror after rain." },
  "Brazil": { capital: "Brasília", region: "Amazonia", blurb: "Brazil is the largest country in South America, and its capital is Brasília, even though São Paulo and Rio de Janeiro are its biggest cities. Most of the Amazon, the world's largest tropical rainforest, spreads across Brazil, home to monkeys, macaws, and river dolphins." },
  "Chile": { capital: "Santiago", region: "Southern Cone", blurb: "Chile is a long, narrow ribbon of land running down the Southern Cone of South America, with its capital at Santiago. In its north lies the Atacama, the driest non-polar desert in the world, where some spots can go years without rain." },
  "Colombia": { capital: "Bogotá", region: "Andes", blurb: "Colombia sits in the Andes at the northwest corner of South America, and its capital, Bogotá, rises high in the mountains. It has more kinds of birds than any other country on Earth — nearly 2,000 species — from tiny hummingbirds to bright toucans." },
  "Ecuador": { capital: "Quito", region: "Andes", blurb: "Ecuador lies on the equator in the Andes of South America — that is how it got its name — and its capital is Quito, high in the mountains. Far offshore sit its Galápagos Islands, where giant tortoises and marine iguanas live almost nowhere else." },
  "Guyana": { capital: "Georgetown", region: "the Guianas", blurb: "Guyana sits on the northeast coast of South America in a region called the Guianas, with its capital at Georgetown. More than four-fifths of it is thick rainforest, home to Kaieteur Falls, one of the world's most powerful single-drop waterfalls." },
  "Peru": { capital: "Lima", region: "Andes", blurb: "Peru lies along the Andes on the Pacific coast of South America, and its capital is Lima. High in its mountains stands Machu Picchu, a stone city built by the Inca, whose empire once ruled from the city of Cusco." },
  "Venezuela": { capital: "Caracas", region: "Andes", blurb: "Venezuela sits in northern South America, where the Andes meet the warm Caribbean coast, and its capital is Caracas. Deep in its wild highlands plunges Angel Falls, the tallest waterfall in the world, dropping water almost a kilometer to the ground." },

  // ---- Oceania ----
  "Australia": { capital: "Canberra", region: "Australasia", blurb: "Australia is a huge island continent in Australasia, and its capital is Canberra, not the bigger cities of Sydney and Melbourne. Off its northeast coast lies the Great Barrier Reef, the world's largest coral reef, stretching more than 1,430 miles (2,300 km)." },
  "Fiji": { capital: "Suva", region: "Melanesia", blurb: "Fiji is an island nation in Melanesia in the South Pacific, and its capital, Suva, sits on the big island of Viti Levu. It is made up of more than 330 islands, though only about a third of them have people living on them." },
  "French Polynesia": { capital: "Papeete", region: "Polynesia", blurb: "French Polynesia is an overseas collectivity of France scattered across the South Pacific in Polynesia, with its capital, Papeete, on the island of Tahiti. Its more than 100 islands and atolls include Bora Bora, famous for turquoise lagoons." },
  "New Zealand": { capital: "Wellington", region: "Australasia", blurb: "New Zealand is an island country in Australasia in the South Pacific, made up of two main islands, with Wellington as its capital. Its national symbol is the kiwi, a small flightless bird that comes out at night." },
  "Vanuatu": { capital: "Port Vila", region: "Melanesia", blurb: "Vanuatu is an island nation in Melanesia in the South Pacific, and its capital, Port Vila, sits on the island of Efate. This chain of volcanic islands has several active volcanoes, including Mount Yasur, which glows red at night." },
  "New Caledonia": { capital: "Nouméa", region: "Melanesia", quizCapital: false, blurb: "New Caledonia is a French overseas territory in Melanesia, not an independent country, and its capital is Nouméa. It is wrapped by a giant coral lagoon so full of turtles, whales, and fish that it is a UNESCO World Heritage site." },
  "Papua New Guinea": { capital: "Port Moresby", region: "Melanesia", blurb: "Papua New Guinea is a rugged island country in Melanesia, and its capital is Port Moresby. It is the most language-rich place on Earth, where people speak over 800 different languages across its mountains, rainforests, and islands." },
  "Solomon Is.": { capital: "Honiara", region: "Melanesia", blurb: "The Solomon Islands is an island nation in Melanesia made up of hundreds of islands, with its capital at Honiara. Scattered across the blue Pacific, it has nearly a thousand islands ringed by coral reefs and rainforest." },

  // ---- Headline-countries batch (verified 2026-07) ----
  "Bangladesh": { capital: "Dhaka", region: "South Asia", blurb: "Bangladesh is a green, river-laced country in South Asia, and its busy capital, Dhaka, sits in the world's largest river delta. Along its coast grows the Sundarbans, the biggest mangrove forest on Earth and home of the Royal Bengal tiger." },
  "Denmark": { capital: "Copenhagen", region: "Scandinavia", blurb: "Denmark is a Scandinavian country of green islands and windy coasts, and its capital, Copenhagen, is famous for bicycles and colorful harbor houses. LEGO bricks were invented here — a Danish carpenter named the toy after the Danish words for 'play well.'" },
  "Hungary": { capital: "Budapest", region: "Central Europe", blurb: "Hungary is a landlocked country in Central Europe whose capital, Budapest, sits on both banks of the Danube River. Budapest is nicknamed the 'City of Spas' because naturally hot spring water bubbles up from underground to fill its famous thermal baths." },
  "Kazakhstan": { capital: "Astana", region: "Central Asia", blurb: "Kazakhstan is a giant country of grassy steppes in Central Asia, and its gleaming modern capital is Astana. It is the largest landlocked country in the world — the ninth-biggest country on Earth, stretching from the edge of Europe deep into Asia." },
  "Malaysia": { capital: "Kuala Lumpur", region: "Southeast Asia", quizCapital: false, blurb: "Malaysia stretches across the tip of Southeast Asia and the island of Borneo, with its capital at Kuala Lumpur (though the government works from nearby Putrajaya). Kuala Lumpur's Petronas Twin Towers are the tallest twin skyscrapers in the world." },
  "Paraguay": { capital: "Asunción", region: "Southern Cone", blurb: "Paraguay sits at the heart of South America's Southern Cone, a landlocked country whose riverside capital is Asunción. Together with Brazil it runs the mighty Itaipú Dam, one of the biggest hydroelectric dams on Earth, turning river water into electricity for millions." },
  "Romania": { capital: "Bucharest", region: "Eastern Europe", blurb: "Romania lies in Eastern Europe, where the Carpathian Mountains curve around the storied land of Transylvania, and its capital is Bucharest. Romania's wild Carpathian forests shelter more brown bears than anywhere else in Europe outside Russia." },
  "Tunisia": { capital: "Tunis", region: "North Africa", blurb: "Tunisia sits on the Mediterranean coast of North Africa, where Sahara sands meet olive groves, and its capital is Tunis. Just outside Tunis lie the ruins of Carthage, an ancient city that was once the mightiest trading power in the Mediterranean." },
  "Uruguay": { capital: "Montevideo", region: "Southern Cone", blurb: "Uruguay is a small, grassy country in South America's Southern Cone, with its capital, Montevideo, right on the coast. Rolling pastures cover most of the land, and cows famously outnumber people — more cows per person than any other country!" },
};

// Continents where the country-map layer is active (Medium/Hard only). Antarctica
// (polar, no countries) stays continent-only.
export const COUNTRY_LAYER_CONTINENTS = new Set(["North America", "South America", "Europe", "Africa", "Asia", "Oceania"]);

// ---- What a country is CALLED on screen -------------------------------------
// The keys used throughout the game are Natural Earth's, because that is what the
// map vectors, the borders and the continent lookup are all keyed by — and
// renaming a key means renaming it in six files at once and hoping none was
// missed. But Natural Earth abbreviates for cartographic fit, and "Solomon Is."
// is not how you say a country's name to a child learning it.
//
// So the key stays and the LABEL changes. Anything not listed here reads as-is.
export const COUNTRY_DISPLAY = {
  "Solomon Is.": "Solomon Islands",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
};
export const displayCountry = (name) => COUNTRY_DISPLAY[name] || name;

// Native country names (endonyms) — the name a country uses for itself.
// Shown alongside the English name, e.g. "Germany (Deutschland)".
//
// SOURCE: Wikipedia, "List of countries and dependencies and their capitals in
// native languages" (retrieved 2026-07). Where that table lists several
// languages, the country's primary/most-widely-used official language was
// chosen — no names were invented. Individually re-checked against each
// country's own Wikipedia article: India (Hindi भारत, not Bengali), Thailand,
// Morocco (al-Maghrib), Tunisia (Arabic, not Tifinagh), Taiwan (the geographic
// name 臺灣 — the entry takes no political position).
// Countries whose endonym is identical to the English name (Chile, Canada,
// Mali, the UK, the US, Nigeria, Ghana…) are omitted — there is nothing to show.
// `roman` is the romanization for non-Latin scripts.
export const COUNTRY_NATIVE = {
  "Algeria": { name: "الجزائر", roman: "Al-Jazā'ir" },
  "Austria": { name: "Österreich" },
  "Bangladesh": { name: "বাংলাদেশ", roman: "Bānglādesh" },
  "Belgium": { name: "België · Belgique · Belgien" },
  "Brazil": { name: "Brasil" },
  "Cambodia": { name: "កម្ពុជា", roman: "Kămpŭchéa" },
  "Cameroon": { name: "Cameroun" },
  "China": { name: "中国", roman: "Zhōngguó" },
  "Croatia": { name: "Hrvatska" },
  "Czechia": { name: "Česko" },
  "Dem. Rep. Congo": { name: "République démocratique du Congo" },
  "Denmark": { name: "Danmark" },
  "Egypt": { name: "مصر", roman: "Misr" },
  "Ethiopia": { name: "ኢትዮጵያ", roman: "Ityop'ia" },
  "Fiji": { name: "Viti" },
  "Finland": { name: "Suomi" },
  "French Polynesia": { name: "Polynésie française" },
  "Germany": { name: "Deutschland" },
  "Greece": { name: "Ελλάδα", roman: "Ellada" },
  "Greenland": { name: "Kalaallit Nunaat" },
  "Hungary": { name: "Magyarország" },
  "Iceland": { name: "Ísland" },
  "India": { name: "भारत", roman: "Bhārat" },
  "Iran": { name: "ایران", roman: "Īrān" },
  "Ireland": { name: "Éire" },
  "Italy": { name: "Italia" },
  "Japan": { name: "日本", roman: "Nihon" },
  "Jordan": { name: "الأردن", roman: "Al-’Urdun" },
  "Kazakhstan": { name: "Қазақстан", roman: "Qazaqstan" },
  "Madagascar": { name: "Madagasikara" },
  "Mongolia": { name: "Монгол Улс", roman: "Mongol Uls" },
  "Morocco": { name: "المغرب", roman: "al-Maghrib" },
  "Myanmar": { name: "မြန်မာ", roman: "Myanma" },
  "Nepal": { name: "नेपाल", roman: "Nepāl" },
  "Netherlands": { name: "Nederland" },
  "New Caledonia": { name: "Nouvelle-Calédonie" },
  "New Zealand": { name: "Aotearoa" },
  "Norway": { name: "Norge" },
  "Papua New Guinea": { name: "Papua Niugini" },
  "Philippines": { name: "Pilipinas" },
  "Poland": { name: "Polska" },
  "Russia": { name: "Россия", roman: "Rossiya" },
  "Saudi Arabia": { name: "المملكة العربية السعودية", roman: "Al-Mamlaka Al-‘Arabiyyah as Sa‘ūdiyyah" },
  "Singapore": { name: "Singapura" },
  "Solomon Is.": { name: "Solomon Aelan" },
  "South Africa": { name: "Suid-Afrika" },
  "South Korea": { name: "한국", roman: "Hanguk" },
  "Spain": { name: "España" },
  "Sri Lanka": { name: "ශ්‍රී ලංකාව", roman: "Sri Lankā" },
  "Sudan": { name: "السودان", roman: "As-Sudan" },
  "Sweden": { name: "Sverige" },
  "Switzerland": { name: "Schweiz · Suisse · Svizzera · Svizra" },
  "Taiwan": { name: "臺灣", roman: "Táiwān" },
  "Thailand": { name: "ไทย", roman: "Thai" },
  "Tunisia": { name: "تونس", roman: "Tūnis" },
  "Turkey": { name: "Türkiye" },
  "United Arab Emirates": { name: "الإمارات العربيّة المتّحدة", roman: "Al-’Imārat Al-‘Arabiyyah Al-Muttaḥidah" },
  "Uzbekistan": { name: "O‘zbekiston" },
};
