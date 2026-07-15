// ===========================================================================
// JOURNEYS — themed, ORDERED routes. You retrace a real expedition stop by stop,
// in the order it actually happened, and each stop teaches what happened there.
//
// Different from a Grand Tour (where the whole game is choosing the order) and
// from Assignments (where the game is deducing the place). Here the order is the
// story, and you can't skip ahead: the point is the shape of the journey.
//
// SOURCING (project rule 2). Every stop's coordinates come from that place's
// Wikipedia article via the MediaWiki API — not eyeballed off a map — and each
// stop carries the article it came from so it can be re-checked. Facts are kept
// to the plainly documented spine of the expedition (where they wintered, what
// they crossed, when), not the contested details.
//
// ⚠ A NOTE FOR FUTURE ROUTES: these four are safe because they are exhaustively
// documented and nobody disputes where Fort Mandan was, or where the Victoria
// came home to. Other routes on the wish list are NOT like that — the Exodus
// route and the location of Mount Sinai are genuinely contested, and Paul's
// journeys have some uncertain stops. When those are added, each stop needs a
// `certainty` of "documented" or "traditional", and the card must SAY which. Do
// not quietly present a traditional site as a fact.
//
// Marco Polo was on the wish list and is deliberately NOT here: whether he
// reached China at all is disputed by serious historians, so his itinerary is a
// claim about a book, not a documented route. It would need the same treatment.
//
// Coordinates are stored as real lat/lon AND as the game's map space
// (x = lon + 180, y = 90 − lat), the same space the relief plate uses.
//
// Optional per-journey display fields:
//   aspect — the shape of the map frame (default 1.7). A circumnavigation needs a
//            long, letterbox-shaped map; a wagon trail across Wyoming does not.
//   pad    — margin around the stops, as a fraction of the box (default 0.12).
// ===========================================================================

const at = (lat, lon) => ({ lat, lon, x: lon + 180, y: 90 - lat });

export const JOURNEYS = [
  {
    id: "lewis-clark",
    title: "Lewis & Clark",
    emoji: "🛶",
    era: "1804–1806",
    region: "North America",
    blurb: "Up the Missouri and over the Rockies, looking for a river to the Pacific.",
    // The lesson shown before the first stop.
    intro: "In 1804 the United States had just bought a vast territory it had never seen. "
      + "Meriwether Lewis and William Clark were sent to walk and paddle across it — up the "
      + "Missouri River, over the Rocky Mountains, and on to the Pacific — and to write down "
      + "everything. They were looking for a river route across the continent. There isn't one. "
      + "Follow their trail west, stop by stop.",
    // The lesson shown at the end. Content lives here, not in the component (rule 1).
    outro: "Lewis and Clark went looking for a river route across the continent. There isn't one — "
      + "and proving that was the journey's real result.",
    source: "https://en.wikipedia.org/wiki/Lewis_and_Clark_Expedition",
    stops: [
      {
        id: "camp-dubois", name: "Camp Dubois", place: "Wood River, Illinois", when: "Winter 1803–04",
        ...at(38.80272, -90.10125),
        prompt: "Where the journey began: the camp where the expedition spent the winter training, waiting for the river ice to break.",
        fact: "Camp Dubois, on the Illinois bank opposite the mouth of the Missouri, was the expedition's winter camp and its launch point. They spent the winter drilling, gathering supplies, and waiting for spring.",
        source: "https://en.wikipedia.org/wiki/Camp_Dubois",
      },
      {
        id: "fort-mandan", name: "Fort Mandan", place: "North Dakota", when: "Winter 1804–05",
        ...at(47.29806, -101.08722),
        prompt: "A winter fort beside Mandan and Hidatsa villages, where the expedition sat out months of deep cold — and where a young Shoshone woman joined them.",
        fact: "The expedition built Fort Mandan to winter over in 1804–05, beside the Mandan and Hidatsa villages. Here they hired the interpreter Toussaint Charbonneau, and with him came his wife Sacagawea, a Shoshone woman whose knowledge and presence would prove vital.",
        source: "https://en.wikipedia.org/wiki/Fort_Mandan",
      },
      {
        id: "great-falls", name: "The Great Falls", place: "Montana", when: "Summer 1805",
        ...at(47.57, -111.12306),
        prompt: "A staircase of waterfalls on the Missouri. They expected a half-day carry around it. It took a month.",
        fact: "At the Great Falls of the Missouri the river drops over a series of waterfalls. The expedition had to carry its boats and cargo roughly 18 miles (29 km) overland around them — a portage they thought would take a day, and which took nearly a month.",
        source: "https://en.wikipedia.org/wiki/Great_Falls_(Missouri_River)",
      },
      {
        id: "lemhi-pass", name: "Lemhi Pass", place: "Idaho / Montana", when: "August 1805",
        ...at(44.97417, -113.445),
        prompt: "The crest of the continent. They climbed it hoping to look down on a river running west to the sea.",
        fact: "At Lemhi Pass, about 7,373 feet (2,247 m) up in the Bitterroot Range, the expedition crossed the Continental Divide. They had hoped to find an easy water route to the Pacific on the far side. Instead they saw more mountains — proof that no such river crossing exists.",
        source: "https://en.wikipedia.org/wiki/Lemhi_Pass",
      },
      {
        id: "lolo-pass", name: "Lolo Pass", place: "Idaho / Montana", when: "September 1805",
        ...at(46.635, -114.58),
        prompt: "The hardest miles of the whole journey: a snowbound crossing of the Bitterroots, on the edge of starvation.",
        fact: "Crossing the Bitterroot Mountains by the Lolo Pass route in September 1805 nearly destroyed the expedition. Caught in early snow with almost nothing to eat, they came down the far side starving, and were fed by the Nez Perce.",
        source: "https://en.wikipedia.org/wiki/Lolo_Pass_(Idaho%E2%80%93Montana)",
      },
      {
        id: "cape-disappointment", name: "Cape Disappointment", place: "Washington", when: "November 1805",
        ...at(46.28972, -124.06056),
        prompt: "The end of the westward road — a headland where the great river finally meets the open ocean.",
        fact: "In November 1805 the expedition reached the Pacific at the mouth of the Columbia River, near Cape Disappointment — the goal of the whole journey, and roughly 4,000 miles (6,400 km) from where they set out. They wintered nearby at Fort Clatsop and turned for home in the spring, having proved there is no river route across the continent.",
        source: "https://en.wikipedia.org/wiki/Cape_Disappointment_(Washington)",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // THE OREGON TRAIL. Not an expedition but a migration: the same road, walked
  // by hundreds of thousands of ordinary people over about twenty-five years.
  // -------------------------------------------------------------------------
  {
    id: "oregon-trail",
    title: "The Oregon Trail",
    emoji: "🐂",
    era: "1843–1869",
    region: "North America",
    blurb: "2,170 miles on foot beside a wagon, from Missouri to the Willamette Valley.",
    intro: "This is not an expedition — it is a road. Around 400,000 emigrants walked the Oregon "
      + "Trail and its branches: whole families who sold the farm, bought oxen, and set out to walk "
      + "2,170 miles (3,490 km) across the continent. Most of them walked the entire way, beside the "
      + "wagon rather than in it, to spare the animals. You had to leave in spring, when the grass "
      + "was tall enough to feed the oxen, and you had to be through the mountains before the snow. "
      + "Follow the road west.",
    outro: "The trail was not a road anyone built. It was worn into the ground by feet, hooves and "
      + "wheels, until the ruts were deep enough that you can still find them today. Then the "
      + "railroad was finished in 1869, the same journey took a week instead of half a year, and "
      + "almost overnight nobody walked it any more.",
    source: "https://en.wikipedia.org/wiki/Oregon_Trail",
    stops: [
      {
        id: "independence", name: "Independence", place: "Missouri", when: "Spring — the start",
        ...at(39.0925, -94.41388889),
        prompt: "A jumping-off town on the Missouri River, where families sold their farms, bought oxen, and waited for the grass to grow.",
        fact: "Independence was one of the great 'jumping-off' towns. Families gathered here each spring, bought their wagon and their oxen, and waited — because leaving too early meant no grass on the prairie to feed the animals, and leaving too late meant snow in the mountains at the far end. Ahead of them lay about 2,170 miles (3,490 km).",
        source: "https://en.wikipedia.org/wiki/Independence,_Missouri",
      },
      {
        id: "fort-kearny", name: "Fort Kearny", place: "Nebraska", when: "Early summer",
        ...at(40.65, -99),
        prompt: "Where every road west became one road: the wagon trains converged here, in the broad flat valley of the Platte.",
        fact: "Emigrants started from many different towns, but all the routes funnelled into a single road along the valley of the Platte River, near Fort Kearny. The army built the fort in 1848 to guard the emigrant road. From here to the Rockies, the Platte was the trail: follow the river, and you cannot get lost.",
        source: "https://en.wikipedia.org/wiki/Fort_Kearny",
      },
      {
        id: "chimney-rock", name: "Chimney Rock", place: "Nebraska", when: "Summer",
        ...at(41.70361111, -103.34833333),
        prompt: "A rock spire on the North Platte you could see for days before you reached it — and for days after you passed it.",
        fact: "Chimney Rock rises more than 300 feet (91 m) above the North Platte River valley, and it appears in more emigrant diaries than almost any other landmark on the trail. On flat prairie it was visible for days ahead — proof you were making progress, in a country where nothing else seemed to change.",
        source: "https://en.wikipedia.org/wiki/Chimney_Rock_National_Historic_Site",
      },
      {
        id: "fort-laramie", name: "Fort Laramie", place: "Wyoming", when: "Summer",
        ...at(42.20916667, -104.53586111),
        prompt: "A fur-trade post turned army fort: the last real chance to mend a wagon or post a letter home before the mountains.",
        fact: "Fort Laramie began as a fur-trading post and was bought by the army in 1849. For emigrants it was the last proper resupply — a place to repair a wagon, shoe an ox, buy flour at a shocking price, and send a letter back east. It sits roughly a third of the way to Oregon.",
        source: "https://en.wikipedia.org/wiki/Fort_Laramie_National_Historic_Site",
      },
      {
        id: "independence-rock", name: "Independence Rock", place: "Wyoming", when: "By the Fourth of July",
        ...at(42.494, -107.133),
        prompt: "A granite whaleback covered in carved names. If you were not here by the Fourth of July, you were running late — and the snow was coming.",
        fact: "Independence Rock is a granite dome about 130 feet (40 m) high, covered in the names emigrants carved as they passed. A missionary called it the Register of the Desert in 1840. Wagon trains aimed to reach it by the Fourth of July: arrive much later than that, and the passes ahead could be closed by snow before you got through them.",
        source: "https://en.wikipedia.org/wiki/Independence_Rock",
      },
      {
        id: "south-pass", name: "South Pass", place: "Wyoming", when: "High summer",
        ...at(42.3303, -108.9738),
        prompt: "The gate through the Rocky Mountains — a saddle so wide and gentle that many crossed the Continental Divide without noticing they had done it.",
        fact: "South Pass is the reason the Oregon Trail exists. At 7,412 feet (2,259 m), it is the lowest crossing of the Continental Divide between the central and southern Rockies, and it is so broad and gradual that emigrants often could not tell where the crest was. A loaded wagon cannot climb a mountain. It can climb this.",
        source: "https://en.wikipedia.org/wiki/South_Pass_(Wyoming)",
      },
      {
        id: "fort-hall", name: "Fort Hall", place: "Idaho", when: "Late summer",
        ...at(43.0201, -112.6347),
        prompt: "A trading post on the Snake River where the road forked: California to the left, Oregon to the right.",
        fact: "At Fort Hall the road split — the California Trail turned away to the southwest, and the Oregon Trail carried on northwest along the Snake River. Families who had walked roughly 1,300 miles (2,100 km) together had to choose here, and some wagon trains parted company for good.",
        source: "https://en.wikipedia.org/wiki/Fort_Hall",
      },
      {
        id: "the-dalles", name: "The Dalles", place: "Oregon", when: "Autumn",
        ...at(45.60166667, -121.175),
        prompt: "The end of the wagon road. From here the last miles went by river — or, later, over a toll road around a volcano.",
        fact: "For years The Dalles was where the wagon road simply stopped. The Columbia River cuts through the Cascade Range here, and emigrants had to take their wagons apart and raft the last stretch down a dangerous river — until the Barlow Road opened in 1846, a toll route around the south side of Mount Hood.",
        source: "https://en.wikipedia.org/wiki/The_Dalles,_Oregon",
      },
      {
        id: "oregon-city", name: "Oregon City", place: "Oregon", when: "Journey's end",
        ...at(45.3569, -122.6067),
        prompt: "Journey's end: the falls where the land office stood, and where a family finally stopped walking.",
        fact: "Oregon City, at the falls of the Willamette, was the official end of the Oregon Trail and the place where a family filed its land claim. The walk took four to six months. A family that left Missouri in April, if all went well, stopped walking here in the autumn.",
        source: "https://en.wikipedia.org/wiki/Oregon_City,_Oregon",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // THE BEAGLE. A circumnavigation: the trail crosses the antimeridian, so the
  // map has to be unrolled (see unrolledX). Britain appears at BOTH ends of the
  // map — which is not a bug, it is the whole point of going round.
  // -------------------------------------------------------------------------
  {
    id: "beagle",
    title: "Darwin's Beagle",
    emoji: "🐢",
    era: "1831–1836",
    region: "Around the world",
    aspect: 2.2,
    pad: 0.04,
    blurb: "Five years around the world with a 22-year-old who was told it would take two.",
    intro: "HMS Beagle was sent to chart the coasts of South America. She carried, as an extra, an "
      + "unpaid 22-year-old naturalist named Charles Darwin, who was told the voyage would last two "
      + "years. It lasted almost five, and went all the way around the world. He came home with "
      + "crates of rocks, bones and birds — and with a question he could not put down. Follow the "
      + "Beagle west around the globe.",
    outro: "Darwin did not sail home with a theory. He sailed home with a problem: too many things "
      + "he had seen only made sense if living creatures change. It took him more than twenty years "
      + "to publish the answer — and every one of the pieces came from this voyage.",
    source: "https://en.wikipedia.org/wiki/Second_voyage_of_HMS_Beagle",
    stops: [
      {
        id: "plymouth", name: "Plymouth", place: "England", when: "27 December 1831",
        ...at(50.37139, -4.14222),
        prompt: "A survey ship leaves an English harbor two days after Christmas, carrying a young man with no job, no pay, and no idea what he is starting.",
        fact: "HMS Beagle sailed from Plymouth on 27 December 1831 under Captain Robert FitzRoy, to survey the coasts of South America. Charles Darwin, aged 22, came aboard as an unpaid naturalist and gentleman companion. He very nearly did not come at all: his father thought the whole thing a waste of a career.",
        source: "https://en.wikipedia.org/wiki/Second_voyage_of_HMS_Beagle",
      },
      {
        id: "praia", name: "Praia", place: "Cape Verde", when: "January 1832",
        ...at(14.918, -23.509),
        prompt: "First landfall. In the black volcanic cliffs of a tropical island, a white line of seashells — high above the waves.",
        fact: "On the volcanic island of Santiago, Darwin found a white band of crushed coral and shells running horizontally through black volcanic rock, about 40 feet (12 m) above the sea. Those shells had lived on the sea floor. Something had lifted them, slowly, out of the water. Reading Lyell's geology in his cabin, he began to think about land that rises and falls.",
        source: "https://en.wikipedia.org/wiki/Praia",
      },
      {
        id: "bahia-blanca", name: "Bahía Blanca", place: "Argentina", when: "September 1832",
        ...at(-38.71667, -62.26667),
        prompt: "Argentine cliffs full of the bones of giants — and the giants look oddly like the small animals living there today.",
        fact: "In the cliffs near Bahía Blanca, Darwin dug out the bones of huge extinct animals, among them Megatherium, a ground sloth the size of an elephant. What nagged at him was the family resemblance: the vanished giants of South America looked like enormous versions of the sloths and armadillos still living in the same country. Why should the dead animals of a place look like its living ones?",
        source: "https://en.wikipedia.org/wiki/Bah%C3%ADa_Blanca",
      },
      {
        id: "tierra-del-fuego", name: "Tierra del Fuego", place: "Chile / Argentina", when: "December 1832",
        ...at(-54, -70),
        prompt: "The cold end of the Americas — where the ship brings back three young people it had taken to England, and tries to plant a mission.",
        fact: "On its previous voyage the Beagle had taken three Fuegian people to England. Now FitzRoy brought them home, with a missionary and a cargo of English goods, meaning to found a mission. Within days of the ship sailing on, the mission had collapsed and the missionary was taken off. Darwin never forgot the meeting; he wrote about it for the rest of his life.",
        source: "https://en.wikipedia.org/wiki/Tierra_del_Fuego",
      },
      {
        id: "concepcion", name: "Concepción", place: "Chile", when: "February–March 1835",
        ...at(-36.82819, -73.05137),
        prompt: "A city shaken to rubble — and along the shore, beds of mussels left standing high and dry above the tide.",
        fact: "Darwin was lying in a wood ashore when a great earthquake shook southern Chile on 20 February 1835. When the Beagle reached Concepción the city was in ruins, and on the coast the crew found mussel beds stranded above the high-tide line: the land itself had risen about 9 feet (2.7 m) in a matter of minutes. Here was the answer to the shells in the cliff at Cape Verde. Mountains go up — a jolt at a time.",
        source: "https://en.wikipedia.org/wiki/1835_Concepci%C3%B3n_earthquake",
      },
      {
        id: "galapagos", name: "The Galápagos", place: "Ecuador", when: "September–October 1835",
        ...at(-0.5, -90.5),
        prompt: "Volcanic islands on the equator, where the birds have no fear of people — and are not quite the same from one island to the next.",
        fact: "Everyone remembers the finches, but Darwin did not label his finches by island and nearly missed the point. It was the mockingbirds he caught: he noticed that the ones from different islands were different, and from then on he recorded which island each came from. The islands' governor also told him he could name the island a giant tortoise came from just by the shape of its shell. Same sea, same weather, a few miles apart — different animals on each.",
        source: "https://en.wikipedia.org/wiki/Gal%C3%A1pagos_Islands",
      },
      {
        id: "sydney", name: "Sydney", place: "Australia", when: "January 1836",
        ...at(-33.86778, 151.21),
        prompt: "A young colony on the far side of the world, where the animals look as though they were designed by somebody else entirely.",
        fact: "By the time he reached New South Wales, Darwin had been away four years. He watched a platypus in a river and wrote that a disbeliever might well conclude two separate Creators had been at work — one for Australia and one for the rest of the world. Then he watched an Australian insect trap its prey in exactly the way a European one does, and decided against it: one set of rules must run through the whole Earth.",
        source: "https://en.wikipedia.org/wiki/Sydney",
      },
      {
        id: "cocos", name: "Cocos (Keeling) Islands", place: "Indian Ocean", when: "April 1836",
        ...at(-12.1175, 96.895),
        prompt: "A ring of coral in the open ocean, with nothing but a lagoon in the middle. Why would coral grow in a circle?",
        fact: "Darwin worked out the answer before he ever saw an atoll: the island in the middle is sinking. Coral grows upward as fast as the island sinks, so when the island has finally disappeared beneath the sea, the ring of living coral is still there at the surface, with a lagoon where the mountain used to be. He came to the Keeling Islands to test it, and the ship's soundings fitted. Drilling proved him right more than a century later.",
        source: "https://en.wikipedia.org/wiki/Cocos_(Keeling)_Islands",
      },
      {
        id: "falmouth", name: "Falmouth", place: "England", when: "2 October 1836",
        ...at(50.15, -5.07),
        prompt: "England again — reached from the other side of the world, by a ship that never turned round.",
        fact: "The Beagle came home to Falmouth on 2 October 1836, four years and nine months after she left. Darwin had spent three years and three months of that ashore and about 18 months at sea. Look at the map: he left Britain on one edge of it and came back to Britain on the other, because he had gone all the way round.",
        source: "https://en.wikipedia.org/wiki/Falmouth,_Cornwall",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MAGELLAN–ELCANO. The first circumnavigation. Also unrolled; Spain appears at
  // both ends of the map, which is exactly what the voyage proved you could do.
  // -------------------------------------------------------------------------
  {
    id: "magellan",
    title: "Magellan & Elcano",
    emoji: "⛵",
    era: "1519–1522",
    region: "Around the world",
    aspect: 2.3,
    pad: 0.03,
    blurb: "Five ships sail west to reach the East. Three years later, one comes home.",
    intro: "In 1519 five Spanish ships sailed west to reach the Spice Islands of the East. Nobody had "
      + "ever sailed around the world. Nobody knew whether there was a way through the Americas, or "
      + "how wide the ocean on the other side might be — and the answer to that second question was "
      + "far, far worse than anyone imagined. Follow them west, and keep going west, until they end "
      + "up back where they started.",
    outro: "One ship came home out of five, and 18 men out of about 270 — among them Juan Sebastián "
      + "Elcano, who finished what Magellan started. Educated Europeans already knew the Earth was a "
      + "sphere. What nobody knew was how big it was, that its oceans all join up, and that if you "
      + "sail west long enough you arrive home from the east. Now they knew.",
    source: "https://en.wikipedia.org/wiki/Magellan_expedition",
    stops: [
      {
        id: "sanlucar", name: "Sanlúcar de Barrameda", place: "Spain", when: "20 September 1519",
        ...at(36.76667, -6.35),
        prompt: "A Spanish river mouth. Five ships, about 270 men, and a plan to reach the East by sailing west.",
        fact: "Five ships and about 270 men sailed from Sanlúcar de Barrameda on 20 September 1519 under Ferdinand Magellan, to look for a western sea route to the Spice Islands. It was a trading voyage, not an attempt to circle the world — that came later, and only because there was no other way home.",
        source: "https://en.wikipedia.org/wiki/Sanl%C3%BAcar_de_Barrameda",
      },
      {
        id: "rio", name: "Guanabara Bay", place: "Brazil", when: "December 1519",
        ...at(-22.91111, -43.20556),
        prompt: "A vast sheltered bay on the coast of Brazil — water, food, and then south, hunting for a way through the continent.",
        fact: "The fleet crossed the Atlantic and anchored in the great bay where Rio de Janeiro now stands, taking on fresh water and food. Then it turned south to follow the coast of South America, feeling its way into every inlet, looking for a passage through — because Magellan was convinced one existed, and nobody had ever found it.",
        source: "https://en.wikipedia.org/wiki/Rio_de_Janeiro",
      },
      {
        // Port St Julian, where the fleet wintered and the captains mutinied, is only
        // 5.7° from here — on a map of the whole world that is a dozen pixels, and two
        // pins that close cannot be told apart, let alone clicked. So the winter and
        // the mutiny are told here instead, on the stop they lead directly into.
        id: "strait", name: "The Strait of Magellan", place: "Chile", when: "November 1520",
        ...at(-54, -71),
        prompt: "The passage he was certain of turns out to be real — a freezing maze of channels at the bottom of the world.",
        fact: "First they had to survive the winter: the fleet sheltered at Port St Julian up the coast, on cut rations, where three of Magellan's captains mutinied against him and lost. Then they found the strait — a twisting channel roughly 350 miles (570 km) long between the mainland and the islands of Tierra del Fuego. They entered on 1 November 1520 and came out the far side four weeks later, minus one ship, whose crew deserted and sailed home to Spain. The ocean beyond was so calm after the strait that Magellan named it the Pacific: the peaceful sea.",
        source: "https://en.wikipedia.org/wiki/Strait_of_Magellan",
      },
      {
        id: "guam", name: "Guam", place: "Mariana Islands", when: "6 March 1521",
        ...at(13.5, 144.8),
        prompt: "Land, at last. The crossing they thought would take four days has taken three months and twenty days.",
        fact: "Magellan expected the sea between the Americas and the Spice Islands to take three or four days to cross. It took three months and twenty days. The men ate biscuit dust, leather and rats, and many died of scurvy. Sighting Guam on 6 March 1521 they had crossed the largest ocean on Earth — and found out, the hard way, how large it is.",
        source: "https://en.wikipedia.org/wiki/Guam",
      },
      {
        id: "mactan", name: "Mactan", place: "Philippines", when: "27 April 1521",
        ...at(10.3, 123.96667),
        prompt: "The commander is killed here, in the shallows off a small island, halfway round the world — and the voyage goes on without him.",
        fact: "In the Philippines Magellan took a side in a local quarrel and attacked the island of Mactan. On 27 April 1521 the chieftain Lapulapu and his warriors met the Spanish in the shallow water and beat them, and Magellan was killed. The man whose name the voyage carries never completed it. It was finished by Juan Sebastián Elcano.",
        source: "https://en.wikipedia.org/wiki/Battle_of_Mactan",
      },
      {
        id: "tidore", name: "Tidore", place: "Moluccas, Indonesia", when: "8 November 1521",
        ...at(0.68333, 127.4),
        prompt: "The Spice Islands — the actual destination. A handful of small islands growing something the whole world wanted.",
        fact: "On 8 November 1521 the survivors finally reached the Moluccas and anchored at Tidore. This was the entire point of the voyage: cloves grew on these few islands and almost nowhere else on Earth, and in Europe they were worth a fortune. They filled the holds with them. By now only one ship, the Victoria, was fit to attempt the journey home.",
        source: "https://en.wikipedia.org/wiki/Tidore",
      },
      {
        id: "cape-verde", name: "Cape Verde", place: "Atlantic Ocean", when: "9 July 1522",
        ...at(15.3, -23.7),
        prompt: "The crew's careful calendar says one date. The people on shore say another. Somebody has lost a day.",
        fact: "Starving, having crossed the Indian Ocean and rounded Africa, the crew put in at Cape Verde and discovered something impossible. Their log said 9 July 1522. The islanders said 10 July. They had written down every single day for three years without missing one — and they were still a day behind. Sailing west, right around the world, they had chased the sun and lost a day to it. This is why the world now has a Date Line.",
        source: "https://en.wikipedia.org/wiki/Cape_Verde",
      },
      {
        id: "sanlucar-home", name: "Sanlúcar, again", place: "Spain", when: "6 September 1522",
        ...at(36.76667, -6.35),
        prompt: "The same port they left. The same ship. Eighteen of the men. Find it at the other end of the map — because that is what going round the world looks like.",
        fact: "On 6 September 1522 the Victoria came back into Sanlúcar de Barrameda, the port she had left almost exactly three years before — reached by sailing west and never turning back. Of about 270 men who set out, 18 came home aboard her. They had sailed some 37,560 miles (60,440 km), and they were the first people known to have gone all the way around the world.",
        source: "https://en.wikipedia.org/wiki/Magellan_expedition",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // THE TRANSCONTINENTAL RAILROAD. Two companies building toward each other,
  // east-to-west here; the wide box needs the letterbox aspect.
  // -------------------------------------------------------------------------
  {
    id: "transcontinental",
    title: "The Transcontinental Railroad",
    emoji: "🚂",
    era: "1863–1869",
    region: "North America",
    blurb: "Two railroads race toward each other to tie the country together with iron rails.",
    intro: "Before 1869, crossing America meant months by wagon or a long sail around South America. "
      + "Then two companies began laying track toward each other — the Union Pacific building west from "
      + "the Missouri River, the Central Pacific blasting east through the Sierra Nevada. Follow the "
      + "rails from Omaha to the Pacific.",
    outro: "When the two lines met, a journey that once took months could be made in about a week. For "
      + "the first time, the whole country was tied together by rail.",
    source: "https://en.wikipedia.org/wiki/First_transcontinental_railroad",
    aspect: 2.3,
    pad: 0.06,
    stops: [
      {
        id: "omaha", name: "Omaha", place: "Nebraska", when: "Building began 1863",
        ...at(41.25861, -95.93750),
        prompt: "The eastern starting point, on the Missouri River, where the Union Pacific began laying track west.",
        fact: "Omaha, on the Missouri River, was the eastern end of the Union Pacific Railroad. From here crews laid track westward across the plains of Nebraska and Wyoming, mile after mile toward the mountains.",
        source: "https://en.wikipedia.org/wiki/Omaha,_Nebraska",
      },
      {
        id: "cheyenne", name: "Cheyenne", place: "Wyoming", when: "1867",
        ...at(41.14000, -104.82028),
        prompt: "A town the railroad conjured almost overnight as the tracks climbed toward the Rockies.",
        fact: "Cheyenne sprang up in 1867 as a Union Pacific railhead and grew so fast it was nicknamed the \"Magic City of the Plains.\" From here the line climbed toward the highest ground on the whole route.",
        source: "https://en.wikipedia.org/wiki/Cheyenne,_Wyoming",
      },
      {
        id: "promontory", name: "Promontory Summit", place: "Utah", when: "10 May 1869",
        ...at(41.61861, -112.54750),
        prompt: "The meeting place — where the two railroads finally joined, and a golden spike was driven.",
        fact: "At Promontory Summit on May 10, 1869, the Union Pacific and Central Pacific rails met, and a ceremonial golden spike was driven to mark the finished line. The country could now be crossed by train.",
        source: "https://en.wikipedia.org/wiki/Promontory,_Utah",
      },
      {
        id: "donner-pass", name: "Donner Pass", place: "California", when: "Tunneled 1866–67",
        ...at(39.31444, -120.32694),
        prompt: "The hardest stretch of all: a crossing of the Sierra Nevada, blasted through solid granite.",
        fact: "To cross the Sierra Nevada, Central Pacific crews — most of them Chinese immigrants — bored tunnels through granite near Donner Pass, about 7,000 feet (2,100 m) up, working through winters of tremendous snow.",
        source: "https://en.wikipedia.org/wiki/Donner_Pass",
      },
      {
        id: "sacramento", name: "Sacramento", place: "California", when: "Building began 1863",
        ...at(38.58167, -121.49444),
        prompt: "The western end of the line, where the Central Pacific started building east toward the mountains.",
        fact: "Sacramento was the western terminus, where the Central Pacific began laying track eastward in 1863. With the rails joined, people and goods could cross the entire country in about a week instead of months.",
        source: "https://en.wikipedia.org/wiki/Sacramento,_California",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // ROUTE 66. The Mother Road, Chicago to the Pacific. Wide east-west box.
  // -------------------------------------------------------------------------
  {
    id: "route66",
    title: "Route 66",
    emoji: "🚗",
    era: "1926–1985",
    region: "North America",
    blurb: "The \"Mother Road\" — about 2,400 miles of highway from Chicago to the California coast.",
    intro: "In 1926 a new highway strung together towns from the Midwest to the Pacific: U.S. Route 66. "
      + "For decades it carried families west — Dust Bowl migrants first, then road-trippers chasing "
      + "diners, motels and the open road. Drive it from Chicago to the sea.",
    outro: "Newer interstate highways eventually bypassed Route 66, and it was taken off the map in 1985. "
      + "But the \"Mother Road\" lives on in song and story, and in the towns it once fed.",
    source: "https://en.wikipedia.org/wiki/U.S._Route_66",
    aspect: 2.2,
    pad: 0.05,
    stops: [
      {
        id: "chicago", name: "Chicago", place: "Illinois", when: "The start",
        ...at(41.88194, -87.62778),
        prompt: "The eastern end of the road, on the shore of a Great Lake.",
        fact: "Route 66 began in downtown Chicago, on the shore of Lake Michigan, and ran southwest — the start of a road that stretched about 2,400 miles (3,900 km) to the Pacific Ocean.",
        source: "https://en.wikipedia.org/wiki/Chicago",
      },
      {
        id: "st-louis", name: "St. Louis", place: "Missouri", when: "Gateway to the West",
        ...at(38.62722, -90.19778),
        prompt: "The Gateway to the West, where the road crossed a mighty river.",
        fact: "At St. Louis the highway crossed the Mississippi River — long thought of as the gateway between the settled East and the western frontier.",
        source: "https://en.wikipedia.org/wiki/St._Louis",
      },
      {
        id: "oklahoma-city", name: "Oklahoma City", place: "Oklahoma", when: "The southern plains",
        ...at(35.46861, -97.52139),
        prompt: "Near the middle of the route, out on the southern plains.",
        fact: "Oklahoma City sits close to the middle of Route 66. Oklahoma was hit hard by the 1930s Dust Bowl, and many families packed up and followed this very road west, hoping for work in California.",
        source: "https://en.wikipedia.org/wiki/Oklahoma_City",
      },
      {
        id: "amarillo", name: "Amarillo", place: "Texas", when: "The Texas Panhandle",
        ...at(35.19917, -101.84528),
        prompt: "A dead-straight run across the flat Texas Panhandle.",
        fact: "Route 66 crossed only a short slice of Texas, through the flat, wide Panhandle around Amarillo — high-plains cattle country under an enormous sky.",
        source: "https://en.wikipedia.org/wiki/Amarillo,_Texas",
      },
      {
        id: "albuquerque", name: "Albuquerque", place: "New Mexico", when: "The high desert",
        ...at(35.08440, -106.65030),
        prompt: "Where the road ran straight down the main street of an old Spanish city.",
        fact: "In Albuquerque, Route 66 ran right through town along Central Avenue, past neon-lit motels. The city was founded by Spanish colonists in 1706, more than two centuries before the highway arrived.",
        source: "https://en.wikipedia.org/wiki/Albuquerque,_New_Mexico",
      },
      {
        id: "flagstaff", name: "Flagstaff", place: "Arizona", when: "The Arizona pines",
        ...at(35.18056, -111.62000),
        prompt: "A cool, high mountain town in the pines — the nearest big stop to the Grand Canyon.",
        fact: "Flagstaff sits at about 7,000 feet (2,100 m) among ponderosa pines, a cool break on the desert route and the closest large town to the Grand Canyon.",
        source: "https://en.wikipedia.org/wiki/Flagstaff,_Arizona",
      },
      {
        id: "santa-monica", name: "Santa Monica", place: "California", when: "Journey's end",
        ...at(34.02194, -118.48139),
        prompt: "The end of the road, at a pier on the Pacific Ocean.",
        fact: "Route 66 ended near the Santa Monica Pier, on the Pacific coast just west of Los Angeles — the end of the road, about 2,400 miles (3,900 km) from where it began in Chicago.",
        source: "https://en.wikipedia.org/wiki/Santa_Monica,_California",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // THE THIRTEEN COLONIES. Not one expedition but a tour down the seaboard,
  // north to south — a tall box, so a near-square aspect.
  // -------------------------------------------------------------------------
  {
    id: "thirteen-colonies",
    title: "The Thirteen Colonies",
    emoji: "📜",
    era: "1607–1776",
    region: "North America",
    blurb: "The thirteen British colonies that became the United States, north to south down the Atlantic coast.",
    intro: "Before there was a United States, there were thirteen British colonies strung along the "
      + "Atlantic coast of North America. Travel down the seaboard from New Hampshire to Georgia and meet "
      + "each one — the colonies that in 1776 declared their independence and became a new nation.",
    outro: "In 1776 these thirteen colonies declared independence, and after the Revolutionary War they "
      + "became the first states of the United States of America. Their thirteen stripes are still on the flag.",
    source: "https://en.wikipedia.org/wiki/Thirteen_Colonies",
    aspect: 1.0,
    pad: 0.08,
    stops: [
      {
        id: "new-hampshire", name: "New Hampshire", place: "Portsmouth", when: "Settled 1623",
        ...at(43.05806, -70.78250),
        prompt: "The northernmost colony — a coast of fishing, shipbuilding, and tall pines.",
        fact: "The Province of New Hampshire was the northernmost of the thirteen colonies. Its main port, Portsmouth, lived by fishing and shipbuilding, and its tall pines were cut for masts for the Royal Navy.",
        source: "https://en.wikipedia.org/wiki/Portsmouth,_New_Hampshire",
      },
      {
        id: "massachusetts", name: "Massachusetts", place: "Boston", when: "Settled 1620",
        ...at(42.36028, -71.05778),
        prompt: "Home of the Pilgrims and the Puritans — and later the spark of the Revolution.",
        fact: "Massachusetts began with the Pilgrims at Plymouth in 1620 and the Puritans at Boston soon after. A century and a half later, Boston's Tea Party and the battles at Lexington and Concord helped start the American Revolution.",
        source: "https://en.wikipedia.org/wiki/Boston",
      },
      {
        id: "rhode-island", name: "Rhode Island", place: "Providence", when: "Founded 1636",
        ...at(41.82361, -71.42222),
        prompt: "The smallest colony, founded as a refuge for freedom of religion.",
        fact: "Rhode Island, the smallest colony, was founded in 1636 by Roger Williams after he was banished from Massachusetts. He built it as a place of religious freedom, welcoming those other colonies turned away.",
        source: "https://en.wikipedia.org/wiki/Providence,_Rhode_Island",
      },
      {
        id: "connecticut", name: "Connecticut", place: "Hartford", when: "Founded 1636",
        ...at(41.76250, -72.67417),
        prompt: "A colony of river towns, with one of the earliest written frameworks of government.",
        fact: "Connecticut grew from Puritan towns along the Connecticut River, with Hartford at its heart. Its Fundamental Orders of 1639 were among the earliest documents to lay out how a government should work.",
        source: "https://en.wikipedia.org/wiki/Hartford,_Connecticut",
      },
      {
        id: "new-york", name: "New York", place: "New York City", when: "Dutch 1624; English 1664",
        ...at(40.71280, -74.00610),
        prompt: "A colony that began as a Dutch trading post before the English took it over.",
        fact: "New York began as the Dutch colony of New Netherland, with its port New Amsterdam on Manhattan. In 1664 the English took it and renamed both the colony and the city New York.",
        source: "https://en.wikipedia.org/wiki/New_York_City",
      },
      {
        id: "new-jersey", name: "New Jersey", place: "Trenton", when: "English from 1664",
        ...at(40.22028, -74.76583),
        prompt: "A small colony between two big rivers — and later a Revolutionary battlefield.",
        fact: "New Jersey lay between the Hudson and Delaware rivers, farmland dotted with towns. In the winter of 1776 Washington crossed the icy Delaware to win a crucial battle at Trenton.",
        source: "https://en.wikipedia.org/wiki/Trenton,_New_Jersey",
      },
      {
        id: "pennsylvania", name: "Pennsylvania", place: "Philadelphia", when: "Founded 1681",
        ...at(39.95280, -75.16360),
        prompt: "William Penn's colony — a haven for Quakers, and the city where independence was declared.",
        fact: "Pennsylvania was founded in 1681 by William Penn as a haven for Quakers, known for tolerance. Its city Philadelphia became the largest in the colonies, and there in 1776 the Declaration of Independence was signed.",
        source: "https://en.wikipedia.org/wiki/Philadelphia",
      },
      {
        id: "delaware", name: "Delaware", place: "Dover", when: "Settled 1638",
        ...at(39.15806, -75.52444),
        prompt: "A tiny colony first settled by Swedes — and, later, the first state to ratify the Constitution.",
        fact: "Delaware began in 1638 as New Sweden, the first Swedish colony in America, before passing to the Dutch and then the English. In 1787 it would become the first state to ratify the U.S. Constitution.",
        source: "https://en.wikipedia.org/wiki/Dover,_Delaware",
      },
      {
        id: "maryland", name: "Maryland", place: "Annapolis", when: "Founded 1632",
        ...at(38.97306, -76.50111),
        prompt: "A colony founded as a refuge for Catholics, around a great tidal bay.",
        fact: "Maryland was founded in 1632 under a charter to Lord Baltimore, partly as a refuge for English Catholics. It grew tobacco along the shores of the Chesapeake Bay, with Annapolis as its capital.",
        source: "https://en.wikipedia.org/wiki/Annapolis,_Maryland",
      },
      {
        id: "virginia", name: "Virginia", place: "Williamsburg", when: "Settled 1607",
        ...at(37.27083, -76.70694),
        prompt: "The oldest colony, begun at Jamestown — the largest and most populous of the thirteen.",
        fact: "Virginia was the first permanent English colony, begun at Jamestown in 1607. It grew rich on tobacco and became the largest colony; its capital moved to Williamsburg, and many early U.S. presidents came from here.",
        source: "https://en.wikipedia.org/wiki/Williamsburg,_Virginia",
      },
      {
        id: "north-carolina", name: "North Carolina", place: "New Bern", when: "Carolina 1663",
        ...at(35.09583, -77.07222),
        prompt: "A colony of scattered farms and pine forests tapped for the navy's tar and pitch.",
        fact: "North Carolina was part of the Province of Carolina from 1663 before becoming its own colony. Its pine forests were tapped for the tar, pitch and turpentine that sealed wooden ships; New Bern served as its colonial capital.",
        source: "https://en.wikipedia.org/wiki/New_Bern,_North_Carolina",
      },
      {
        id: "south-carolina", name: "South Carolina", place: "Charleston", when: "Settled 1670",
        ...at(32.81389, -79.93194),
        prompt: "A wealthy colony of rice and indigo plantations around a busy southern port.",
        fact: "South Carolina, settled from 1670, grew wealthy on rice and indigo worked by enslaved Africans. Its port, Charleston, was one of the busiest in the colonies and the largest city in the American South.",
        source: "https://en.wikipedia.org/wiki/Charleston,_South_Carolina",
      },
      {
        id: "georgia", name: "Georgia", place: "Savannah", when: "Founded 1732",
        ...at(32.08111, -81.09111),
        prompt: "The last and southernmost colony, planned street by street around its first city.",
        fact: "Georgia, founded in 1732 by James Oglethorpe, was the last of the thirteen colonies. Its first city, Savannah, was carefully laid out around a grid of open squares that still shape the city today.",
        source: "https://en.wikipedia.org/wiki/Savannah,_Georgia",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PAUL'S FIRST MISSIONARY JOURNEY. A CONTESTED route (see the file header):
  // this is the TRADITIONAL path traced from the Book of Acts. The big cities
  // are well documented; a couple of small towns are located only by tradition
  // and archaeology, and the intro + those stops SAY so (never a guess as fact).
  // Each stop carries `certainty` — "documented" or "traditional".
  // -------------------------------------------------------------------------
  {
    id: "paul-first-journey",
    title: "Paul's First Journey",
    emoji: "⛵",
    era: "c. AD 46–48",
    region: "Asia",
    blurb: "The traditionally acknowledged route of the apostle Paul's first missionary journey, from Antioch across Cyprus and Asia Minor.",
    intro: "According to the Book of Acts, the apostle Paul set out from Antioch around AD 46 on the first "
      + "of his missionary journeys — by ship to Cyprus, then up into the mountains of Asia Minor (modern "
      + "Turkey). This is the route as it has traditionally been traced. Scholars broadly agree on the "
      + "larger cities; the exact sites of a couple of small towns are known only from later inscriptions "
      + "and archaeology, so those are the popularly acknowledged locations rather than certainties.",
    outro: "Paul returned the way he had come, back to Antioch. His later journeys would carry him across "
      + "the Aegean into Greece, and at last all the way to Rome.",
    source: "https://en.wikipedia.org/wiki/Paul_the_Apostle",
    aspect: 1.5,
    pad: 0.09,
    stops: [
      {
        id: "antioch", name: "Antioch", place: "Syria (Antakya, Turkey)", when: "Setting out, c. AD 46",
        ...at(36.20250, 36.16056), certainty: "documented",
        prompt: "The home church on the Orontes River, where the journey began.",
        fact: "Paul set out from Antioch in Syria, then one of the largest cities of the Roman Empire and the base of the early church that sent him and Barnabas on their way.",
        source: "https://en.wikipedia.org/wiki/Antioch",
      },
      {
        id: "salamis", name: "Salamis", place: "Cyprus", when: "c. AD 46", certainty: "documented",
        ...at(35.18333, 33.90000),
        prompt: "The first landfall across the sea, a great port on the island of Cyprus.",
        fact: "Sailing to Cyprus, Paul and Barnabas landed at Salamis, a large port on the island's east coast, and began teaching there. Its ruins can still be visited today.",
        source: "https://en.wikipedia.org/wiki/Salamis,_Cyprus",
      },
      {
        id: "paphos", name: "Paphos", place: "Cyprus", when: "c. AD 46", certainty: "documented",
        ...at(34.76667, 32.41667),
        prompt: "Right across the island, to the Roman governor's capital.",
        fact: "At Paphos, the Roman capital of Cyprus, Acts says Paul met the island's governor. It was the westernmost point of the journey's leg across Cyprus before the party turned back to the mainland.",
        source: "https://en.wikipedia.org/wiki/Paphos",
      },
      {
        id: "perga", name: "Perga", place: "Pamphylia (Turkey)", when: "c. AD 46", certainty: "documented",
        ...at(36.96139, 30.85389),
        prompt: "Back on the mainland, a city on the coastal plain before the climb into the highlands.",
        fact: "Landing in Pamphylia on the southern coast of Asia Minor, Paul's party stopped at Perga before heading up into the mountains. Its Roman ruins still stand.",
        source: "https://en.wikipedia.org/wiki/Perga",
      },
      {
        id: "pisidian-antioch", name: "Pisidian Antioch", place: "Anatolia (Turkey)", when: "c. AD 47", certainty: "documented",
        ...at(38.30611, 31.18917),
        prompt: "A hard climb up into the highlands, to a Roman colony that shared its name with the starting city.",
        fact: "Pisidian Antioch, high in the mountains of central Anatolia, was a Roman colony where Paul is said to have preached in the synagogue. Its site is a known archaeological ruin near modern Yalvaç.",
        source: "https://en.wikipedia.org/wiki/Antioch_of_Pisidia",
      },
      {
        id: "iconium", name: "Iconium", place: "Konya (Turkey)", when: "c. AD 47", certainty: "documented",
        ...at(37.87444, 32.49306),
        prompt: "An ancient city, and unlike some stops on this route, one still lived in today.",
        fact: "Iconium — the modern city of Konya — was the next stop. Unlike several small towns on the route, it has been continuously inhabited ever since, so there is no doubt where it is.",
        source: "https://en.wikipedia.org/wiki/Konya",
      },
      {
        id: "lystra", name: "Lystra", place: "Anatolia (Turkey)", when: "c. AD 47", certainty: "traditional",
        ...at(37.60194, 32.33833),
        prompt: "A small town whose place on the map rests on an old inscription, not certainty.",
        fact: "Lystra was a small Roman town. Its location was pinned down only in 1885, from an inscribed stone found near the village of Hatunsaray, so its spot on the map comes from archaeology rather than certainty.",
        source: "https://en.wikipedia.org/wiki/Lystra",
      },
      {
        id: "derbe", name: "Derbe", place: "Anatolia (Turkey)", when: "c. AD 47 — the turning point", certainty: "traditional",
        ...at(37.34927, 33.36171),
        prompt: "The farthest point of the journey, after which Paul turned back for home.",
        fact: "Derbe was the turning point: from here Paul retraced his steps toward Antioch. Its exact site is identified from inscriptions and is still debated by scholars, so it is placed here by the best available evidence.",
        source: "https://en.wikipedia.org/wiki/Derbe",
      },
    ],
  },
];

export const JOURNEY_BY_ID = Object.fromEntries(JOURNEYS.map((j) => [j.id, j]));

// ---------------------------------------------------------------------------
// UNROLLED LONGITUDE. The map is a cylinder cut open at the antimeridian, so a
// place has not one x but infinitely many: x, x±360, x±720… A route that stays
// in one hemisphere never notices. A route that sails round the world does:
// drawn naively, the Victoria's leg from the Strait of Magellan (x = 109) to
// Guam (x = 325) is a straight line running EAST, back across the Atlantic and
// Africa — the exact opposite of the way she went. It would look perfectly
// plausible and be completely wrong.
//
// So each stop is placed at whichever copy of itself is nearest the previous
// stop, i.e. the shorter sail. The route can then run off the edge of the world
// and keep going, and the map is tiled to follow it — which is why Spain shows
// up at both ends of the Magellan map. That is not a rendering artifact. That is
// the lesson.
//
// (This assumes no single leg jumps more than 180° of longitude. None does — the
// longest is the Pacific crossing, at about 144°. A route with a longer leg would
// need to say explicitly which way round it went.)
// ---------------------------------------------------------------------------
export function unrolledX(journey) {
  const xs = [];
  for (const s of journey.stops) {
    if (!xs.length) { xs.push(s.x); continue; }
    const prev = xs[xs.length - 1];
    let best = s.x;
    for (let k = -2; k <= 2; k++) {
      const cand = s.x + k * 360;
      if (Math.abs(cand - prev) < Math.abs(best - prev)) best = cand;
    }
    xs.push(best);
  }
  return xs;
}

// The map window for a journey: the box holding every stop, with a margin so no
// pin sits on the frame's edge. Sized to the journey's preferred aspect ratio —
// and the caller must then shape the frame to `box.w / box.h`, because an SVG
// clips to its viewport and not to its viewBox: a box whose shape doesn't match
// the frame gets letterboxed, and the relief plate spills into the letterbox,
// showing a chunk of map that isn't part of the journey at all.
//
// Height is capped at 180° and slid back inside the world, because there is no
// map beyond the poles — an over-tall box would hang open sea below Antarctica.
// Width is NOT capped: a circumnavigation is 360° wide by definition, and the
// world is tiled sideways to fill it.
export function journeyBox(journey, aspect = journey.aspect ?? 1.7, pad = journey.pad ?? 0.12) {
  const xs = unrolledX(journey), ys = journey.stops.map((s) => s.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const w = Math.max(x1 - x0, (y1 - y0) * aspect) * (1 + 2 * pad);
  const h = Math.min(w / aspect, 180);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const y = Math.min(Math.max(cy - h / 2, 0), 180 - h);
  return { x: cx - w / 2, y, w, h };
}

// The closest two stops on a route, in degrees — measured where they are actually
// DRAWN (unrolled), because that's what decides whether a player can click the pin
// they mean. A route whose stops sit on top of one another is unplayable, so this
// is asserted in the tests rather than left to be discovered on the map.
//
// Note the consequence: Sanlúcar at the start and Sanlúcar at the end are the same
// port, but they are drawn 360° apart, so they don't collide — correctly, since on
// screen they are at opposite ends of the map.
export function closestStops(journey) {
  const xs = unrolledX(journey);
  let min = Infinity;
  for (let i = 0; i < journey.stops.length; i++)
    for (let k = i + 1; k < journey.stops.length; k++) {
      min = Math.min(min, Math.hypot(xs[i] - xs[k], journey.stops[i].y - journey.stops[k].y));
    }
  return min;
}
