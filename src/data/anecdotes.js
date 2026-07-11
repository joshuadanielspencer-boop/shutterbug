// ===========================================================================
// GRANDPA'S ANECDOTES — one verified "did you know" per famous landmark.
//
// Spoken by Grandpa Nigel when a child answers a homecoming-quiz question
// correctly. Each is a REAL, verified extra detail (rule 2) that the location's
// `fact` field does not already state — the humour is in his delivery, never in
// invented facts. Keyed by location id; the game falls back to the location's
// verified `fact` for any place without an anecdote here, so this can grow over
// time (e.g. alongside each continent's content pass).
//
// Sources (verified 2026-07-10, Wikipedia/Britannica/park authorities unless
// noted): Eiffel thermal expansion; Big Ben penny-on-pendulum timing; Great
// Pyramid tallest ~3,800 yrs (until Lincoln Cathedral); Fuji 1707 Hōei
// eruption; Great Wall sticky-rice lime mortar (Zhang et al. 2010 — commonly
// attributed, hedged below); Taj cenotaph asymmetry; Statue of Liberty copper
// patina; Christ the Redeemer lightning strikes; Opera House Swedish tiles
// (~1.06M); Colosseum velarium awning; Parthenon optical entasis; Pisa built in
// stages, pauses let soil settle; Gaudí buried in Sagrada crypt; St Basil's nine
// chapels; Al-Khazneh urn legend + bullet marks; Angkor Wat Hindu→Buddhist;
// Machu Picchu mortarless ashlar; Chichen Itza equinox serpent shadow;
// Stonehenge Heel Stone solstice; Golden Gate longest span 1937–1964; Rushmore
// ~90% dynamited; Grand Canyon ~1.7–1.8 Ga basement rock; Neuschwanstein
// inspired Disney's castle; Uluru continues underground; Niagara headward
// erosion retreat; Victoria Falls "Mosi-oa-Tunya"; Brandenburg Quadriga taken
// by Napoleon 1806, returned 1814; Hagia Sophia largest cathedral ~1,000 yrs.
// ===========================================================================

export const ANECDOTES = {
  paris: "On a hot day the iron soaks up the sun and the whole tower can grow about fifteen centimetres taller — then it shrinks back once the weather cools!",
  london: "For over a century the keepers kept perfect time by balancing old penny coins on the giant pendulum — adding one nudges the clock a touch faster!",
  cairo: "For nearly four thousand years the Great Pyramid was the tallest thing anyone had ever built — no structure stood taller until a cathedral rose in England!",
  tokyo: "Though it sleeps quietly now, Fuji last blew its top back in 1707, dusting faraway Tokyo with ash — so it's only napping, not gone for good!",
  beijing: "The clever builders of long ago are said to have mixed sticky rice into their mortar, and that gluey rice porridge helped hold the wall's great stones together!",
  agra: "Everything about the Taj is perfectly matched and mirror-balanced — except the emperor's own tomb, added later beside his wife's, the one thing that breaks the symmetry!",
  nyc: "When she first arrived she was shiny brown like a new penny — the salty sea air slowly turned her copper skin that famous minty green!",
  rio: "Standing on his stormy mountaintop, the great statue is struck by lightning several times a year — one bolt once chipped a piece right off his thumb!",
  sydney: "Look closely at those gleaming white sails and you'll find over a million small ceramic tiles — all specially made far away in Sweden and shipped across the world!",
  rome: "On scorching days, sailors would unfurl a giant cloth awning called the velarium high over the crowd, shading tens of thousands of spectators from the blazing sun!",
  athens: "There's barely a truly straight line in it — the clever builders gently curved the columns and floor so that, to our eyes, everything looks perfectly straight!",
  pisa: "It took almost two hundred years to finish, with long pauses between — and those very pauses let the soft soil settle, which may be why it never toppled!",
  barcelona: "The visionary architect who dreamed it up is buried right inside, in the crypt beneath the floor — still keeping watch over the church he never saw finished!",
  moscow: "It looks like one swirling storybook church, but it's really nine little chapels clustered together around a taller central one — like a whole bouquet of buildings!",
  petra: "Long ago people believed a ruler had hidden treasure inside the stone urn at the very top, and hopeful hunters shot at it — you can still spot the marks!",
  angkor: "It began life as a grand Hindu temple to the god Vishnu, then later became a Buddhist one — so two great faiths have prayed within the very same walls!",
  machupicchu: "The Inca builders fit the stones together so snugly, without any mortar at all, that even today you can't slide a knife blade between them!",
  chichenitza: "Twice a year, when day and night are equal, the afternoon sun casts a shadow that slithers down the staircase like a great serpent creeping to the ground!",
  stonehenge: "The stones line up with the sun: on the longest day of summer, sunrise peeks right over the special Heel Stone — it's an ancient calendar made of rock!",
  sanfrancisco: "When it opened in 1937 its great orange span was the longest of any suspension bridge on Earth, and it kept that record for twenty-seven whole years!",
  mountrushmore: "The carvers didn't chip those giant faces out by hand — they blasted most of the mountain away with dynamite, then carefully smoothed the presidents' features!",
  grandcanyon: "If you hike all the way down to the river, the dark rocks at the very bottom are nearly two billion years old — some of the oldest stone you'll ever touch!",
  neuschwanstein: "This dreamy hilltop castle so enchanted a certain American cartoonist that it helped inspire the fairy-tale palace at his very first Disneyland!",
  uluru: "The giant red rock you see is only the tip — most of Uluru keeps going underground, plunging down for kilometres beneath the desert like a hidden iceberg!",
  niagara: "The rushing water is slowly nibbling the rock away, so the falls are very gradually creeping upstream — over thousands of years they've marched several kilometres backward!",
  victoriafalls: "The local name is Mosi-oa-Tunya — 'the smoke that thunders' — because the mighty spray rises like a cloud you can spot from dozens of kilometres away!",
  berlin: "Long ago Napoleon carted the bronze chariot off the top of the gate all the way to Paris as a war prize — but a few years later it was brought proudly home!",
  istanbul: "For almost a thousand years its vast dome made it the largest cathedral in the whole world — no one could build a bigger enclosed space for centuries!",
  // --- Africa wave (verified 2026-07-10) ---
  greatzimbabwe: "Zimbabwe took its very name from this place — it means 'houses of stone' — and the soapstone birds discovered in its ruins now perch proudly on the national flag.",
  matobohills: "These granite hills shelter one of the world's densest gatherings of the mighty black eagle, which builds its huge nest among the balancing boulders.",
  southluangwa: "A giraffe found nowhere else on Earth lives here — the Thornicroft's giraffe — grazing only in this one green valley and no other place in the world.",
  kalambofalls: "Diggers here uncovered the oldest known wooden structure on Earth — logs shaped and joined nearly half a million years ago, long before our own species even existed.",
  tsingybemaraha: "Nimble white lemurs called sifakas bound right across the razor-sharp pinnacles, while a maze of shadowy caves and slot canyons hides in the cool depths below.",
  olumorock: "Today an elevator carries visitors up the giant stone, and from the breezy summit you can gaze out over almost the whole red-roofed city of Abeokuta below.",
  osunosogbo: "Many of the grove's dreamlike, swirling sculptures were shaped by Susanne Wenger, an Austrian artist who moved to Nigeria, became a priestess of Osun, and spent decades rebuilding its shrines.",
  abomeypalaces: "The kings of Dahomey were famously guarded by an all-female army of warriors so fierce that European visitors nicknamed them the 'Amazons.'",
  pendjari: "Its lions are among the very last in West Africa — and, surprisingly, they are closer cousins to the lions of India than to the ones roaming eastern Africa.",
  grandbassam: "The town lost its crown after a yellow-fever epidemic struck in 1899, so the French packed up and moved the capital inland to breezier Bingerville.",
  tainationalpark: "Taï's chimpanzees crack rock-hard nuts using stones as hammers and tree roots as anvils — a tricky skill young chimps spend years learning by watching their mothers.",
  mountkenya: "The whole country of Kenya most likely took its name from this mountain, which the Kikuyu people called Kirinyaga and once believed to be the earthly home of their creator god.",
  amboseli: "Scientists here have watched Amboseli's elephants for over thirty years, following one clever matriarch named Echo so closely that she became one of the best-known wild elephants in the world.",
  lakekivu: "Rather than fearing that trapped gas, engineers now pump methane up from the lake's depths and burn it to make electricity for thousands of Rwandan homes.",
  nyungwe: "High in Nyungwe's treetops hangs a swaying suspension bridge — a canopy walkway that lets visitors stroll level with the birds and monkeys, far above the forest floor.",
  simien: "These highlands are home to the gelada, the only monkey on Earth that lives mostly on grass, easy to spot by the bright red patch on its chest shaped like a bleeding heart.",
  nkrumahmausoleum: "Out front, a bronze statue of Nkrumah stands with one arm flung forward, and a single black star — the very star that shines on Ghana's flag — crowns the peak of the roof.",
  larabangamosque: "Legend says a Muslim trader named Ayuba dreamed he should build a mosque on this very spot, and a baobab tree believed to mark his grave still grows beside it.",
  djinguereber: "The emperor who ordered it, Mansa Musa, is often called the richest person in history; on his pilgrimage to Mecca he handed out so much gold that its value dropped across the region for years.",
  bandiagara: "High up the cliff cling little mud houses built long ago by an earlier people, the Tellem, who tucked their dead away in the caves to keep them safe from flash floods.",
  toubamosque: "The city's name means 'bliss,' and its great central minaret has a name all its own — Lamp Fall — honouring one of the founder's most devoted followers.",
  faidherbebridge: "The old town balances on a slip of island between the river and the sea, and each Christmas its streets glow with 'fanals' — big paper lanterns carried through the town after dark.",
  lobefalls: "Local Batanga and Bagyeli communities treat the falls as sacred — healers guide people beneath the rushing water to be purified, and traditional kings are crowned right beside the spray.",
  foumbanpalace: "One Bamoun king, Ibrahim Njoya, invented an entire writing system — the Bamum script — around 1900 so his kingdom's history could be written down.",
  nyiragongo: "Nyiragongo's lava is unusually runny, so when the crater walls broke in 1977 the molten rock poured downhill at up to about 100 kilometres an hour — some of the fastest lava flows ever recorded.",
  bonobo: "Bonobo groups are led by the females, and they're famous for being peaceful — they tend to settle arguments with play and sharing instead of fights.",
  murchisonfalls: "In 1954 the writer Ernest Hemingway was sightseeing over these falls when his plane crashed nearby — then the rescue plane sent to fetch him crashed too, yet he survived both.",
  nilesource: "When Mahatma Gandhi died in 1948, some of his ashes were scattered here at the Nile's source, and a bronze memorial by the water now marks the spot.",
  timgad: "In the old forum, one stone slab is carved with a Roman board game and a cheerful motto that translates as 'To hunt, to bathe, to play, to laugh — this is to live!'",
  ghardaia: "The valley's cool, clever desert design so impressed the famous architect Le Corbusier when he visited in 1931 that it helped shape his ideas about modern city planning.",
  sidibousaid: "The painter Paul Klee arrived here on Easter Monday in 1914, and was so dazzled by the town's colour and light that the visit transformed the way he painted forever.",
  dougga: "A tall pointed tomb here, the Libyco-Punic Mausoleum, once carried a two-language inscription that helped scholars finally crack the ancient Libyan alphabet.",
  nileconfluence: "The two rivers carry different sediments, so where they meet you can often see the paler White Nile and the darker Blue Nile flowing side by side before they finally blend together.",
  jebelbarkal: "A slender pinnacle juts from one corner of the mountain, and some scholars think the ancient Kushites saw it as a giant rearing cobra wearing a royal crown — a guardian of the hidden god.",
  blyderivercanyon: "The canyon's river is named 'Blyde' — 'glad' in old Dutch — given in 1844 by pioneers overjoyed to reunite with friends who had feared them lost.",
  krugerpark: "Kruger's protected heart, the old Sabi Game Reserve, was set aside back in 1898 — years before the park itself was officially born in 1926.",
  fishrivercanyon: "Adventurers can hike a famous 90-kilometre trail along the canyon floor, usually about five days — one of the most popular wilderness treks in southern Africa.",
  etoshapan: "Its name comes from the Oshindonga language and means 'Great White Place' — a fitting description of the shimmering, dusty salt flat.",
  chobe: "The very river that draws these herds flows on to join the mighty Zambezi and then thunder over Victoria Falls, just downstream to the east.",
  makgadikgadi: "When rare rains flood the pans, they host one of only two greater-flamingo breeding colonies in southern Africa, turning the white flats pink with birds.",
  // --- North America wave (verified 2026-07-10) ---
  portobelo: "When the English raider Francis Drake died of fever near here in 1596, his crew sealed him in a lead coffin and lowered him into the bay.",
  volcanbaru: "It is the only volcano in the entire country, and climbers hike through the freezing night so they can stand on the summit just as the sun rises.",
  nuuk: "The city's National Museum guards the eight Qilakitsoq mummies, Inuit people, including a baby, so dried by the cold that their clothing survived about five hundred years.",
  uummannaq: "No road connects the island to the rest of Greenland, so people travel by boat, dog sled, or helicopter while icebergs as big as buildings drift slowly past the houses.",
  argylefalls: "At each of its three levels, the water has carved natural rock tubs into the limestone, so climbers can bathe in a private pool on the way up.",
  nylonpool: "Britain's Princess Margaret named it in 1962, saying the water was so clear and pale it reminded her of a nylon stocking.",
  xunantunich: "Its modern name means 'Maiden of the Rock,' after a local legend of a ghostly stone woman seen climbing the pyramid before vanishing into it.",
  altunha: "Archaeologists here uncovered a carved jade head of a Maya sun god weighing nearly 4.4 kg (about 10 lb), among the largest jade objects known from the ancient Maya world.",
  arenalvolcano: "For years, visitors gathered after dark to watch red-hot rocks and glowing lava tumble down its slopes, until the volcano quietened in 2010.",
  riocelestefalls: "The blue appears suddenly at a spot called 'Los Teñideros' ('the dyers'), where two clear, colourless rivers join and the water instantly turns turquoise.",
  antiguaguatemala: "One of the three volcanoes watching over the town, Volcán de Fuego, is so restless it puffs out gas and ash every few minutes.",
  atitlan: "Writer Aldous Huxley said it outshone Italy's Lake Como, adding immense volcanoes and calling it 'too much of a good thing.'",
  roatan: "Three centuries ago, English, French and Dutch pirates hid among these islands to ambush Spanish ships loaded with treasure.",
  yojoa: "On its northern shore rise the earthen pyramids of Los Naranjos, raised by Lenca people around 2,800 years ago.",
  leoncathedral: "Nicaragua's beloved poet Rubén Darío is buried inside, resting beneath a marble lion carved to watch over his tomb.",
  ometepe: "People carved spiral petroglyphs into the island's boulders more than 2,000 years ago, and many can still be found there today.",
  trinidadcuba: "Just outside town rises the 45-metre Manaca Iznaga tower, built in 1816 — a lookout over the sugar plantations and one of Cuba's tallest colonial-era structures.",
  vinalesvalley: "Cuba's bee hummingbird lives here too: the smallest bird on Earth, so tiny and light it weighs less than a coin and is often mistaken for a bee.",
  rosehall: "The house is famous for the legend of a 'White Witch,' Annie Palmer — though historians who investigated the tale concluded it was pure invention.",
  ysfalls: "The spring-fed YS River flows on into the Black River, whose vast swampy wetlands shelter shy American crocodiles.",
  jacmel: "Every year Jacmel's artists parade in enormous, brightly painted papier-mâché masks — animals, spirits and heroes — for one of Haiti's most colourful carnivals.",
  sautdeau: "The pilgrimage began after villagers reported seeing an image of the Virgin Mary on a palm tree beside the falls in 1849.",
};
