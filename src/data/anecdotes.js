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
  // --- South America wave (verified 2026-07-10) ---
  tiwanaku: "The Gate of the Sun is carved from a single huge block of stone, and above its doorway is chiseled a figure many believe is a staff-holding god.",
  cerrorico: "The mountain is so tied to the nation's story that it appears on Bolivia's coat of arms, and its silver was minted into coins that were spent all around the globe.",
  roraima: "Its dramatic cliffs and misty tabletop are often said to have inspired Sir Arthur Conan Doyle's 1912 novel 'The Lost World.'",
  medanoscoro: "The dunes sit just beside Coro, one of the first towns Spanish settlers founded in South America and today a UNESCO World Heritage Site.",
  stgeorges: "It is built largely from greenheart, an extremely tough hardwood that grows in Guyana's rainforests and resists rot and insects.",
  shellbeach: "The leatherback is the largest sea turtle on Earth, growing over two metres long and weighing more than half a tonne.",
  palaciosalvo: "It stands where the café La Giralda once stood — the very place where the famous tango 'La Cumparsita' was first performed in 1917.",
  lamano: "The artist meant the fingers as a warning about the danger of drowning in the rough surf, yet the hand has become the town's cheerful symbol.",
  palaciolopez: "It was begun in 1857 as a home for Francisco Solano López, but the great war of 1864 to 1870 interrupted the work, and it was only finished long afterward.",
  saltomonday: "They lie only about 10 kilometres from the far larger Iguazú Falls, yet stay much quieter and less crowded.",
  saltcathedral: "It was shaped from tunnels the miners left behind, and its main chamber holds a huge illuminated cross carved straight into the salt.",
  quitocentro: "Quito sits about 2,850 metres up in the Andes, making it one of the highest capital cities in the world, and it lies just a few kilometres from the equator.",
  // --- Oceania wave (verified 2026-07-10) ---
  mountrotui: "Moorea sits about 17 kilometres northwest of Tahiti, and a ferry crosses between the two islands in well under an hour.",
  rangiroa: "At the Tiputa Pass, where the ocean pours into the lagoon, wild bottlenose dolphins often surf and leap in the rushing current.",
  champagnebeach: "Espiritu Santo is the largest island in Vanuatu, and its calm eastern shore holds some of the most famous beaches in the whole South Pacific.",
  melecascades: "Port Vila, just down the road from the falls, is the capital of Vanuatu and sits on the island of Efate.",
  sigatokadunes: "Archaeologists have uncovered some of Fiji's oldest pottery and human burials in these dunes, a few of them more than 2,000 years old.",
  boumafalls: "The 180th meridian — the line halfway around the world from Greenwich — runs right across Taveuni, where a signpost lets you stand in two days at once.",
  kennedyisland: "Islanders also call it Kasolo, or 'Plum Pudding Island,' and Kennedy is said to have carved a rescue message onto a coconut that was carried to safety.",
  bonegibeach: "The two ships, the Hirokawa Maru and the Kinugawa Maru, were run aground here in 1942 while trying to land supplies during the long battle for Guadalcanal.",
  piscinedoro: "The British explorer Captain James Cook named the Isle of Pines in 1774 for its tall, straight pine trees, which look like green columns along the shore.",
  poulehienghene: "These jagged rocks are made of black limestone and rise straight out of the lagoon, making them one of the most photographed sights on the island's rugged east coast.",
  tavurvur: "Rabaul sits inside a giant flooded volcanic crater called a caldera, which forms Simpson Harbour — one of the finest natural harbours in the Pacific.",
  // --- usa wave (verified 2026-07-11) ---
  delicatearch: "Old-timers weren't always so poetic about it, my dear — before the pretty name stuck, ranchers called this arch things like 'the Chaps' and 'the Schoolmarm's Bloomers.'",
  brycecanyon: "The park's name comes from pioneer Ebenezer Bryce, who grazed cattle nearby and is remembered for grumbling that it was 'a hell of a place to lose a cow.'",
  craterlake: "The water is so vividly blue and clear because no streams feed it, my dear, it is filled almost entirely by rain and melting snow that carry little sediment.",
  gatewayarch: "Architect Eero Saarinen shaped it as a weighted catenary, the curve a hanging chain makes, and inside each hollow leg a little tram of pod-like cars carries you to the top.",
  cloudgate: "It weighs around 110 tons, my dear, and because its mirror surface catches the sky overhead, the artist named it 'Cloud Gate.'",
  spaceneedle: "It was engineered to stand up to strong earthquakes and high winds, and in 2018 it gained 'the Loupe,' the world's first revolving glass floor.",
  hollywoodsign: "It went up in 1923 as a billboard for a housing development and originally read 'HOLLYWOODLAND'; the final four letters were removed in 1949.",
  whitesands: "Unlike ordinary sand, gypsum doesn't hold the sun's heat well, my dear, so even on a scorching day the glittering dunes stay cool enough to walk on with bare feet.",
  smokymountains: "The 'smoke' is real but harmless, my dear: the trees give off airy chemicals called terpenes that scatter light into a blue haze, which the Cherokee named 'Shaconage,' place of blue smoke.",
  acadia: "Just up the island rises Cadillac Mountain, which for much of the year is one of the very first spots in the whole country to catch the morning sun.",
  glaciernp: "The park sits astride the Continental Divide, and the breathtaking Going-to-the-Sun Road climbs right over it at Logan Pass among these peaks.",
  devilstower: "Its steep sides are giant columns of igneous rock, and many Native American peoples know it as Bear Lodge, telling of a great bear that clawed those grooves into its flanks.",
  jacksonsquare: "The square began as a military parade ground called the Place d'Armes and was later renamed for Andrew Jackson, whose rearing bronze statue stands at its heart.",
  alamo: "After the mission's defenders fell, 'Remember the Alamo!' became a battle cry, and its distinctive humpbacked stone gable is one of the most recognized shapes in all of Texas.",
  mesaverde: "The Ancestral Puebloans fitted their stone-and-mortar homes snugly into natural alcoves in the canyon walls, and then, for reasons still debated, left the whole area around A.D. 1300.",
  americanfalls: "In 1969 engineers built a temporary dam and actually 'turned off' the American Falls for several months, leaving its rocky face dry so they could study the erosion.",
  manatee: "These gentle giants can top 1,000 pounds and are distant cousins of the elephant, my dear, and weary sailors of old sometimes mistook them for mermaids.",
  // --- china wave (verified 2026-07-11) ---
  forbiddencity: "For centuries ordinary people were forbidden to step inside, which is how it got its name. The last emperor, a boy called Puyi, went on living in its inner courts until 1924, long after the empire itself had ended.",
  templeofheaven: "The great round hall was raised entirely of wood, fitted together without a single nail. Its four inner pillars stand for the seasons, and the twelve outer ones for the months of the year.",
  potalapalace: "Its thirteen storeys hold more than a thousand rooms. The outer White Palace was for daily life and government, while the inner Red Palace was for prayer and study, and holds the jewelled tombs of past Dalai Lamas.",
  huangshan: "Its most famous tree, the Welcoming-Guest Pine, grows straight out of bare rock beside the path, with one long branch reaching out to the side as if offering a handshake to every climber who arrives.",
  westlakehangzhou: "The long Su Causeway across the water is named for the poet Su Dongpo, who as the city's governor nearly a thousand years ago had it built from mud dredged out of the lake.",
  zhangyedanxia: "Each colour comes from a different mineral, with iron giving the reds and yellows, and the stripes glow their brightest just after rain or in the low light of sunrise and sunset.",
  hukouwaterfall: "Its name means 'the spout of a teapot': upstream the river spreads hundreds of metres wide, then funnels into a rocky channel only about twenty metres across before it thunders down.",
  crescentlakedunhuang: "The dunes around it are called Mingsha Shan, the 'Singing Sands', because when the wind blows or you slide down the slopes the sand rumbles and hums.",
  longmengrottoes: "The largest figure, a serene Buddha some seventeen metres tall, was carved in the 600s with money donated by Empress Wu Zetian, and by tradition its calm face was modelled on her own.",
  fenghuangtown: "Its name means 'phoenix'. The riverside houses, called diaojiaolou, stand on tall wooden stilts above the water, and the town was the birthplace of the beloved writer Shen Congwen.",
  gulangyuisland: "It is nicknamed 'Piano Island' for the remarkable number of pianos among its households and the many musicians it has produced, and it even has a museum devoted to pianos.",
  changbaitianchi: "The crater that cradles it was blasted open by the 'Millennium Eruption' around the year 946, one of the largest volcanic eruptions of the last few thousand years, and the lake now feeds the mighty Songhua River.",
  // --- fritaly wave (verified 2026-07-11) ---
  versailles: "The Treaty of Versailles, which formally ended World War I, was signed in that Hall of Mirrors in June 1919.",
  arcdetriomphe: "Beneath the arch lies France's Tomb of the Unknown Soldier from World War I, where a memorial flame has been rekindled every evening since 1923.",
  montblanc: "Its first recorded ascent, in 1786 by Jacques Balmat and the doctor Michel Paccard, is often seen as the birth of modern mountaineering.",
  etretat: "The painter Claude Monet was captivated by these cliffs and painted their arches many times during the 1880s.",
  dunedupilat: "Driven by the wind, the dune creeps slowly inland by up to a few metres each year, gradually burying the forest and roads behind it.",
  verdongorge: "The river takes its name from its striking green colour, and its towering limestone walls draw rock climbers from around the world.",
  calanques: "In 1985 the diver Henri Cosquer discovered a cave here whose prehistoric paintings are reachable only through a long underwater tunnel.",
  florenceduomo: "Brunelleschi raised the dome without a wooden support frame, using a double shell and a self-supporting herringbone pattern of bricks.",
  vesuvius: "Its most recent eruption came in March 1944, during World War II, destroying nearby villages and a group of parked Allied warplanes.",
  pompeii: "Archaeologists poured plaster into hollows left in the ash by decayed victims, creating casts that capture people in their final moments.",
  trecime: "The Dolomites take their name from the mineral dolomite, identified by the 18th-century French geologist Déodat de Dolomieu.",
  positano: "The American writer John Steinbeck helped make Positano famous with a 1953 magazine essay praising the dreamlike little town.",
  trevifountain: "Visitors toss well over a million euros into the fountain each year, and the coins are collected and given to charity.",
  lakecomo: "The Roman writers Pliny the Elder and Pliny the Younger both kept villas on Lake Como nearly 2,000 years ago.",
  // --- grde wave (verified 2026-07-11) ---
  delphi: "The graceful round building in the photo is the Tholos, built about 2,400 years ago in the sanctuary of Athena Pronaia; three of its columns were raised again by archaeologists in the 20th century so visitors could picture its shape.",
  knossos: "The British archaeologist Sir Arthur Evans began digging out Knossos in 1900 and rebuilt parts of it in concrete, painting the columns red; it was he who named the ancient people 'Minoans' after the legendary King Minos.",
  sounion: "The English poet Lord Byron is said to have carved his name into one of the temple's marble columns in 1810, and the inscription can still be seen there today.",
  navagio: "The wreck is the MV Panagiotis, which ran aground during a storm on 5 October 1980; the cove had earlier been called Agios Georgios and was nicknamed 'Smugglers Cove' because the ship was rumoured to be carrying contraband cigarettes.",
  corinthcanal: "The canal is only about 24 metres wide at the water's surface, too narrow for most modern ships, so large vessels must be towed through by tugboats; the Roman emperor Nero had begun digging a canal here by hand in AD 67, nearly 1,800 years before it was finished.",
  melissani: "In ancient times the cave was a sanctuary of the god Pan and the nymphs, and archaeologists have found a clay figurine and disc depicting them there; the lake's water is brackish, a mix of sea water and fresh water flowing underground.",
  olympus: "Though people had lived in its shadow for thousands of years, the summit of Mytikas was not reached by recorded climbers until 1913, when two Swiss travellers and a Greek guide named Christos Kakkalos first stood on top.",
  reichstag: "In 1995 the artists Christo and Jeanne-Claude wrapped the entire Reichstag building in shimmering silver fabric for two weeks, and about five million people came to see it before the historic renovation began.",
  zugspitze: "The first gilded cross was carried up and raised on the summit in 1851; today cable cars and a cog railway bring visitors near the top, and Germany's only glacier ski area lies just below it.",
  koenigssee: "To keep the water pure, only electric-powered and rowing boats have been allowed on the lake since 1909; boat crews traditionally stop to play a trumpet toward the cliffs so passengers can hear the echo ring back.",
  heidelberg: "Inside the castle stands the Heidelberg Tun, one of the world's largest wine barrels, built in 1751 and able to hold about 220,000 litres; it is so vast that a dance floor was built on top of it.",
  bastei: "The stone Bastei Bridge is 76.5 metres long and its seven arches span a ravine about 40 metres deep; it replaced an earlier wooden bridge from the 1820s that could no longer handle the growing crowds of visitors.",
  frauenkirche: "Builders salvaged about 3,800 of the original blackened stones from the ruins and fitted them back into the new walls, where they still show as dark patches; the dome's new golden cross was crafted in Britain by a goldsmith whose father had flown in the wartime bombing raids.",
  wattenmeer: "The exposed flats are a vital resting stop for millions of migrating birds, and a local tradition called 'Wattwandern' lets guided groups walk barefoot across the seabed at low tide, sometimes all the way to offshore islands.",
  // --- ukruca wave (verified 2026-07-11) ---
  towerbridge: "On 30 December 1952 a driver named Albert Gunter felt his double-decker bus begin to rise as a bascule opened beneath it, so he hit the accelerator and leapt the gap to the far side — all twenty passengers were safe.",
  romanbaths: "Archaeologists have pulled about 130 Roman 'curse tablets' from the spring — sheets of lead on which angry bathers scratched pleas asking the goddess to punish whoever had stolen their clothes or coins.",
  durdledoor: "Its odd name comes from the old word 'thirl', meaning to pierce or drill; the arch stands on the privately owned Lulworth Estate but is open for everyone to visit.",
  oldmanofstorr: "Its eerie, otherworldly shape has drawn many film-makers; it appears in the opening sequence of Ridley Scott's 2012 science-fiction film 'Prometheus'.",
  bennevis: "From 1883 to 1904 a weather observatory stood right on the summit, staffed all year round; its twenty years of records are still the fullest set of mountain-weather data ever gathered in Great Britain.",
  peterhof: "The golden Samson fountain shows a strongman tearing open a lion's jaws, marking Russia's victory over Sweden; the Nazis looted the original statue during the Second World War, and it was recast in 1947.",
  kizhipogost: "Legend says a carpenter named Nestor built it using only a single axe, and when he had finished he threw the axe into the lake, declaring there had never been and never would be another church like it.",
  elbrus: "Its lower, eastern summit was first climbed back in 1829 by a local Circassian guide named Khillar Khashirov, decades before the taller western peak was reached by a British team in 1874.",
  putorana: "The plateau's rock was laid down by the Siberian Traps, one of the largest volcanic eruptions in Earth's history about 250 million years ago; today it shelters a huge migrating herd of wild reindeer and the endemic Putorana snow sheep.",
  lakelouise: "The Stoney Nakoda people called it the Lake of the Little Fishes; it was later renamed after Princess Louise Caroline Alberta, a daughter of Queen Victoria — the same princess the province of Alberta is named for.",
  parliamenthill: "The original Centre Block burned down in a dramatic fire on 3 February 1916; only the round Library of Parliament survived, saved by an iron door that was slammed shut just in time.",
  hopewellrocks: "At low tide you can walk on the sea floor right around the base of the towering 'flowerpots', but only a few hours later that same ground lies buried under many metres of seawater.",
  athabascafalls: "The river spills over a cap of very hard quartzite and has drilled deep circular 'potholes' into the softer rock below; much of its water comes from the glaciers of the Columbia Icefield.",
  // --- mxjpsa wave (verified 2026-07-11) ---
  palenque: "Pakal ruled Palenque for about 68 years (615–683 AD), one of the longest reigns in the ancient Americas, and he was buried wearing a mosaic death mask made of jade.",
  elarco: "Colonies of sea lions haul out on the rocks around the arch, and the two nearby beaches are nicknamed 'Lover's Beach' on the calm gulf side and 'Divorce Beach' on the rough Pacific side.",
  popocatepetl: "An old Nahuatl legend casts Popocatépetl as a warrior and the neighbouring dormant volcano Iztaccíhuatl — whose snowy ridge looks like a reclining figure — as his sleeping beloved, 'the White Woman.'",
  monarchs: "No single butterfly makes the whole round trip; it takes several generations to complete, yet each autumn a brand-new generation finds its way to the very same overwintering forests it has never seen.",
  bellasartes: "The theatre's stage curtain is a shimmering stained-glass mosaic made by Tiffany from nearly a million pieces of glass, depicting the two volcanoes Popocatépetl and Iztaccíhuatl over the Valley of Mexico.",
  sumidero: "The canyon's place on the state emblem recalls a 16th-century legend that Chiapa warriors, rather than surrender to the Spanish conquistadors, leapt to their deaths from its towering cliffs.",
  orizaba: "Its Nahuatl name Citlaltépetl means 'Star Mountain,' and its snowy summit is so high it can be seen from ships far out in the Gulf of Mexico.",
  itsukushima: "The gate only seems to float at high tide — when the sea recedes, visitors can walk out across the exposed sand right up to the base of its towering wooden pillars.",
  himeji: "The castle survived the heavy WWII firebombing that burned much of Himeji; a bomb is said to have landed on the keep but failed to explode, sparing the wooden fortress.",
  kamakura: "A wooden hall once housed the statue, but it was swept away by a tsunami in 1498, and the Great Buddha has sat out in the open air ever since; it is hollow, and visitors can step inside it.",
  sakurajima: "Sakurajima means 'Cherry Blossom Island,' and it truly was an island until its huge 1914 eruption poured out lava that filled the strait and joined it to the mainland peninsula.",
  nachifalls: "The waterfall has been worshipped as a Shinto deity since ancient times — the shrine here grew up out of the age-old veneration of the falls themselves rather than the other way around.",
  fushimiinari: "Each torii was donated by a person or business praying for success, with the donor's name painted on the back of the gate; foxes are believed to be Inari's messengers, and stone foxes guard the shrine.",
  hegra: "Its most striking tomb, Qasr al-Farid ('the Lonely Castle'), was carved from a single freestanding sandstone boulder and left unfinished — its lower half was never smoothed, so you can still see how the masons worked from the top down.",
  elephantrock: "Its Arabic name Jabal AlFil means 'Mountain of the Elephant,' and the red stone glows a deep amber at sunset, making it one of Al-'Ula's most-loved evening gathering spots.",
  masmak: "A spearhead thrown during that 1902 battle is still lodged in the thick wooden main door of the fortress, which today serves as a museum where visitors can see it.",

  // ---- Batch 2 (verified 2026-07-11, Wikipedia/Britannica/site authorities) ----
  // Belém Tower rhinoceros gargoyle (one of Europe's earliest rhino sculptures,
  // after Manuel I's 1515 rhino); St Vitus Cathedral 1344–1929; St Mark's outdoor
  // horses are replicas (originals kept inside); Thera/Santorini a candidate for
  // the Atlantis legend (Marinatos); Amsterdam frontage tax → narrow houses +
  // hoist beams + forward lean; Edinburgh One O'Clock Gun (since 1861); Matterhorn
  // on Toblerone (with the hidden Bern bear); Alhambra = Arabic "the red one";
  // Segovia aqueduct devil legend; Cliffs of Moher = "Cliffs of Insanity" (The
  // Princess Bride) + Harry Potter HBP; Budapest dome 96 m for 896/1896; Nyhavn's
  // former rowdy-sailor port; Meteora reached by rope nets/ladders; Cologne
  // Cathedral survived WWII as a pilot landmark; Nîmes aqueduct's ~12.6 m drop over
  // ~50 km; Giant's Causeway Finn McCool legend; Loch Ness 1934 "Surgeon's Photo"
  // hoax; Mozart at Schönbrunn (1762, age 6); Table Mountain has more plant species
  // than the UK; Koutoubia minaret modelled the Giralda & Hassan Tower; Lalibela's
  // 11 tunnel-linked churches ("New Jerusalem"); Kilimanjaro's climate-zone climb;
  // Abu Simbel's twice-yearly sun alignment; "Serengeti" = Maasai "siringet" endless
  // plains; Djenné's annual replastering festival; baobab "upside-down tree",
  // long-lived water-storers; Fez's centuries-old Chouara tanneries (mint offered);
  // Terracotta Army's unique faces + lost paint; Kinkaku-ji 1950 arson (Mishima's
  // novel); Ha Long dragon legend; Sigiriya's Mirror Wall graffiti; Everest still
  // rising ~a few mm/yr; Leshan Buddha's hidden drainage; Hawa Mahal's cooling
  // breezes; Twain on Varanasi's age; Baikal's nerpa seal + winter ice roads;
  // Borobudur rediscovered 1814 + clockwise ascent; Bagan's sunrise balloons;
  // Chocolate Hills giant's-tears legend; Zhangjiajie's Bailong glass elevator.
  lisbon: "Look low on one of its turrets and you'll spot a carved rhinoceros — a nod to a real rhino the king was given in 1515, one of the first ever seen in Europe!",
  prague: "The great cathedral standing inside the castle walls took almost six hundred years to finish — begun in 1344 and not completed until 1929!",
  venice: "The four proud bronze horses above the doorway are copies — the real ones, brought back from Constantinople long ago, are kept safe from the weather inside!",
  santorini: "Some people think this drowned volcano island inspired the ancient legend of Atlantis — the great city said to have vanished beneath the waves!",
  amsterdam: "The houses are skinny because owners were once taxed on how wide their canal frontage was — so they built tall and thin, and still hoist furniture up on a beam because the staircases are too narrow!",
  edinburgh: "The castle sits on the plug of a volcano that died about 350 million years ago — and a gun is still fired from its walls at one o'clock almost every day, a habit begun in 1861!",
  matterhorn: "That unmistakable pyramid is the very mountain pictured on the Toblerone chocolate bar — and hidden in the wrapper's logo is a little bear, the symbol of the city of Bern!",
  granada: "Its name comes from Arabic words meaning “the red one,” after the way its long walls glow red-gold in the light of the setting sun!",
  segovia: "Local legend says the devil himself built it in a single night to win a girl's soul — though the Roman engineers, of course, get the real credit!",
  cliffsmoher: "These dizzying cliffs played the “Cliffs of Insanity” in the film The Princess Bride — and a young wizard visited them on screen in a Harry Potter adventure too!",
  budapest: "Its dome stands exactly 96 metres tall on purpose — a nod to the year 896, when the Magyar people first arrived, and to 1896, a thousand years later!",
  copenhagen: "This picture-perfect harbour was once a rough, rowdy dock crowded with sailors, taverns and tattoo parlours — quite the change from the postcard spot it is today!",
  meteora: "For centuries the only way up to these clifftop monasteries was by long swaying ladders, or hauled up in a net on a rope — pulled up whenever danger threatened below!",
  cologne: "In the war, bombs flattened much of the city around it, yet the great cathedral kept standing — pilots even used its dark twin spires as a landmark from the air!",
  pontdugard: "The whole fifty-kilometre channel it belonged to sloped so gently that the water fell only about twelve metres along its entire length — a masterpiece of careful measuring!",
  giantscauseway: "Legend says a giant named Finn McCool laid these forty thousand stone steps as a causeway across the sea, to march over and challenge a rival giant in Scotland!",
  lochness: "The most famous photo of the “monster” turned out to be a clever hoax — really just a toy submarine with a model head, a trick finally confessed sixty years later!",
  vienna: "A six-year-old Mozart once played the piano for the empress in this very palace, back in 1762 — and, the story goes, cheekily clambered onto her lap afterwards!",
  capetown: "This one flat-topped mountain is home to more kinds of wild plant than the whole of the United Kingdom — and many of them grow nowhere else on Earth!",
  marrakesh: "Its tall minaret was so admired that it became the model for other famous towers built by the same rulers — the Giralda in Spain and the Hassan Tower in Rabat!",
  lalibela: "It's one of eleven churches here all carved down out of the solid rock, linked by a maze of tunnels and trenches — built long ago to be a “New Jerusalem”!",
  kilimanjaro: "Climbing it is like walking from the equator to the poles — you pass through steamy rainforest, open moorland and finally freezing, icy slopes, all on one mountain!",
  abusimbel: "Twice a year the dawn sun shoots straight down the temple's long hall to light up the statues of the gods deep inside — a trick its builders planned over three thousand years ago!",
  serengeti: "Its name comes from a Maasai word, “siringet,” meaning “the place where the land runs on forever” — and across those endless plains the great herds march!",
  djenne: "Once a year the whole town turns out for a grand festival to re-plaster the mosque's walls with fresh mud by hand, keeping the giant sandcastle standing for another year!",
  baobabs: "People call the baobab the “upside-down tree,” as if its roots wave in the air instead of its branches — and some live for over a thousand years, storing water in their fat trunks!",
  fes: "In its ancient tanneries, workers still dye leather by hand in stone pots of colour just as they have for centuries — and visitors are handed a sprig of mint to sniff against the smell!",
  xian: "No two of the clay soldiers share the same face — and each was once painted in bright colours, though the paint often flakes away within minutes of meeting the air after two thousand years underground!",
  kyoto: "The golden pavilion you see is a careful rebuild — a troubled young monk set fire to the original in 1950, a story so dramatic it inspired a famous Japanese novel!",
  halong: "Legend says the islands are jewels and jade spat out by a family of dragons sent from heaven, forming a wall of stone to guard the land against invaders from the sea!",
  sigiriya: "One wall was once polished so smooth the king could see his own reflection in it — and visitors long ago scribbled more than a thousand poems on it, some over a thousand years old!",
  everest: "It's still growing! The slow-motion crash of two great slabs of the Earth's crust pushes the mountain a few millimetres taller every single year.",
  leshan: "Hidden inside the giant Buddha's coils of hair and body is a clever drainage system that whisks rainwater away — and a single one of its toenails is big enough for a person to sit on!",
  jaipur: "All those hundreds of little windows aren't just for peeping out — they funnel cool breezes right through the palace, which is exactly how the “Palace of Winds” earned its name!",
  varanasi: "This city is so astonishingly ancient that a famous visiting writer once joked it looked older than history, older than tradition, older even than legend — all put together!",
  baikal: "It's the only home of the nerpa, the world's only seal that lives entirely in fresh water — and in winter its ice grows so thick and glass-clear that cars drive right across it!",
  borobudur: "For centuries it lay lost beneath volcanic ash and thick jungle, until it was uncovered again in 1814 — and pilgrims still climb it in a clockwise spiral, like a journey toward enlightenment!",
  bagan: "At dawn, hot-air balloons drift silently over its thousands of ancient spires — a whole sea of temples glowing gold in the first light of the sun!",
  chocolatehills: "Legend says the hills are the hardened tears of a heartbroken giant — though they're really ancient coral and limestone, worn by wind and rain into hundreds of neat cones!",
  zhangjiajie: "One towering pillar is climbed by a glass lift built right onto the cliff face — the tallest outdoor elevator in the world, whisking visitors more than three hundred metres up in a couple of minutes!",
};
