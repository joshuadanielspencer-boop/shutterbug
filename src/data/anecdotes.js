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
};
