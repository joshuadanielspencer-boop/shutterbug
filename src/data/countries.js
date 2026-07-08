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
// Blurbs verified 2026-07 against general references (capitals, regions, a hook).
// Note: Bern is Switzerland's de-facto ("federal city") capital; Russia and
// Turkey span Europe and Asia — their blurbs say so and name the European city.
//
// PILOT: Europe only. Other continents are added as the layer expands.
// ===========================================================================
export const COUNTRY_INFO = {
  "United Kingdom": { capital: "London", region: "British Isles", blurb: "The United Kingdom sits in the British Isles off Europe's northwest coast, ruled from its capital London. This island nation of England, Scotland, Wales, and Northern Ireland is famous for rainy weather, red buses, and afternoon tea." },
  "Italy": { capital: "Rome", region: "Southern Europe", blurb: "Italy, in Southern Europe, is a long boot-shaped peninsula kicking out into the Mediterranean Sea, ruled from its capital Rome. It's the birthplace of pizza and pasta and the heart of the ancient Roman Empire." },
  "France": { capital: "Paris", region: "Western Europe", blurb: "France, in Western Europe, is famous for art, food, and fashion; from its capital of Paris to lavender fields and snowy Alps, it's one of the most-visited countries on Earth." },
  "Greece": { capital: "Athens", region: "Southern Europe", blurb: "Greece, in Southern Europe at the tip of the Balkan Peninsula, is ruled from Athens and sprinkled with thousands of sunny islands. It gave the world the first Olympic Games and many ancient myths." },
  "Russia": { capital: "Moscow", region: "Eastern Europe", blurb: "Russia stretches from Eastern Europe all the way across northern Asia, making it the largest country on Earth. Its capital, Moscow, lies on the European side, a land of long, snowy winters." },
  "Germany": { capital: "Berlin", region: "Central Europe", blurb: "Germany, in Central Europe, is governed from Berlin and sits at the crossroads of the continent. It's known for deep forests, the Rhine River, sausages and pretzels, and building lots of cars." },
  "Croatia": { capital: "Zagreb", region: "Balkans", blurb: "Croatia, in the Balkans along the sparkling Adriatic Sea, is ruled from its capital Zagreb. This crescent-shaped country has a long, sunny coastline dotted with more than a thousand islands." },
  "Iceland": { capital: "Reykjavík", region: "Northern Europe", blurb: "Iceland is a volcanic island in Northern Europe near the Arctic Circle, home to the capital Reykjavík. It bubbles with hot springs and geysers, is capped with glaciers, and enjoys long, bright summer days." },
  "Spain": { capital: "Madrid", region: "Iberia", blurb: "Spain fills most of the Iberian Peninsula in southwestern Europe and is ruled from Madrid in its sunny center. It's famous for flamenco dancing, afternoon siestas, and colourful festivals." },
  "Turkey": { capital: "Ankara", region: "Balkans", blurb: "Turkey bridges Europe and Asia. Its capital is Ankara, while its biggest city, Istanbul, sits partly in Europe across a narrow strait. It's known for busy bazaars, kebabs, and sweet, flaky baklava." },
  "Portugal": { capital: "Lisbon", region: "Iberia", blurb: "Portugal runs along the Iberian Peninsula's Atlantic edge in southwestern Europe, ruled from Lisbon. This sunny seafaring nation once launched famous ocean explorers and is the home of custard tarts and port wine." },
  "Czechia": { capital: "Prague", region: "Central Europe", blurb: "Czechia, a landlocked country in the heart of Central Europe, is ruled from its fairy-tale capital, Prague. It's famous for hilltop castles, puppet theatres, and hearty dumplings." },
  "Netherlands": { capital: "Amsterdam", region: "Western Europe", blurb: "The Netherlands, in Western Europe, is ruled from Amsterdam and sits so low and flat that much of its land was reclaimed from the sea. It's crisscrossed by canals and famous for tulips, windmills, and bicycles." },
  "Austria": { capital: "Vienna", region: "Central Europe", blurb: "Austria, a landlocked country in Central Europe, is governed from Vienna. Much of it is wrapped in the snowy Alps, making it a land of mountain villages, classical music, and skiing." },
  "Belgium": { capital: "Brussels", region: "Western Europe", blurb: "Belgium, in Western Europe, is ruled from Brussels, a city that also helps lead the European Union. This small country is famous for waffles, crispy fries, and some of the world's finest chocolate." },
  "Switzerland": { capital: "Bern", region: "Central Europe", blurb: "Switzerland, a landlocked country in Central Europe, is governed from Bern. It's wrapped in the snowy Alps and known for chocolate, cheese, mountain railways, and famously staying neutral in wars." },
  "Norway": { capital: "Oslo", region: "Scandinavia", blurb: "Norway, in Scandinavia in Northern Europe, is ruled from Oslo. Its long coastline is carved into deep, steep-sided fjords, and in the far north the winter sky glows with the northern lights." },
};

// Continents where the country-map layer is active (Medium/Hard only). The five
// equirectangular-plate continents; Oceania (Pacific-wrapped) and Antarctica
// (polar, no countries) stay continent-only. Blurbs so far exist only for Europe
// (see COUNTRY_INFO) — other continents show the country map + zoom without the
// paragraph until their blurbs are written.
export const COUNTRY_LAYER_CONTINENTS = new Set(["North America", "South America", "Europe", "Africa", "Asia"]);
