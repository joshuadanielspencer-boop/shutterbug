// ===========================================================================
// THE "TAP TO LEARN" CURIOSITY LAYER
//
// The chrome of the game — the logo, the calendar, the compass, the guess-stage
// buttons — is quietly a curriculum. Tap any of them and a little FIELD-NOTE CARD
// opens with one verified fact; tap "another" and it deals the next card in that
// element's deck, reshuffled each visit so a revisit teaches something new.
//
// RULES THAT BIND THIS FILE:
//  • Rule 1 — all this content lives HERE, never inline in a component.
//  • Rule 2 — every fact is checked against a reliable source, and carries that
//    source so it can be re-checked. Anything that CHANGES over time (country
//    counts, the members of a bloc, this year's most-visited city) carries an
//    `asOf` year, and the card shows it, so a stale fact reads as dated rather
//    than wrong.
//  • Rule 3 — measurements read imperial first, metric in parentheses. The units
//    test walks these cards too.
//
// `narrator` themes the card: "trivia" is Mr O the editor; "story" is Grandpa.
// ===========================================================================

export const CURIOSITY_DECKS = [
  // -----------------------------------------------------------------------
  {
    id: "logo", label: "About the game", emoji: "📷", narrator: "story",
    cards: [
      {
        id: "logo-how",
        title: "How the game works",
        body: "You are a traveling photographer. Read the editor's clue, fly to the right city, "
          + "and photograph the right subject before your travel days run out. Every correct shot "
          + "teaches a real fact about a real place.",
        source: null,
      },
      {
        id: "logo-nigel",
        title: "Why you're doing this",
        body: "Your grandpa spent his whole life reading about the world and never got to see it. So you "
          + "took his old film camera to go and photograph it for him — every place he only ever read about, "
          + "brought home one picture at a time.",
        source: null,
      },
      {
        id: "logo-learn",
        title: "The whole point",
        body: "This is a geography game first. The clues, the map, the facts, the greetings in other "
          + "languages — all of it is real and checked, so the more you play, the more of the actual "
          + "world you carry around in your head.",
        source: null,
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    id: "calendar", label: "Travel & time", emoji: "📅", narrator: "trivia",
    cards: [
      {
        id: "cal-crossing",
        title: "Crossing the Atlantic",
        body: "In 1850 a sailing ship took four to six weeks to cross the Atlantic, at the mercy of the "
          + "wind. The new steamships did it in about two weeks, rain or shine. Today a jet does the same "
          + "crossing in about seven hours.",
        source: "https://en.wikipedia.org/wiki/Transatlantic_crossing",
      },
      {
        id: "cal-zones",
        title: "Why clocks change as you travel",
        body: "The Earth turns 15 degrees every hour, so the world is split into 24 time zones — noon "
          + "should be when the Sun is highest. Not all are neat hours: India runs half an hour off its "
          + "neighbors, and Nepal is 45 minutes off. China is wide enough for five zones but uses just one.",
        source: "https://en.wikipedia.org/wiki/Time_zone",
      },
      {
        id: "cal-dateline",
        title: "The day you lose at sea",
        body: "The International Date Line runs down the middle of the Pacific. Sail west across it and you "
          + "skip a whole day forward. Magellan's crew found this out the hard way in 1522: they came home "
          + "with their diary a day behind everyone on shore, because they had chased the Sun all the way "
          + "around the world.",
        source: "https://en.wikipedia.org/wiki/International_Date_Line",
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    id: "compass", label: "The compass", emoji: "🧭", narrator: "trivia",
    cards: [
      {
        id: "comp-cardinal",
        title: "North, East, South, West",
        body: "The four main directions go clockwise from the top: North, East, South, West. Sailors "
          + "remember the order with a saying — \"Never Eat Soggy Waffles.\" Halfway between each pair are "
          + "the in-between directions, like north-east and south-west.",
        source: "https://en.wikipedia.org/wiki/Cardinal_direction",
      },
      {
        id: "comp-north",
        title: "Two different norths",
        body: "A compass needle doesn't point to the top of the Earth. It points to the magnetic north "
          + "pole, which is a different spot — and it slowly wanders, so it's not even in the same place "
          + "your grandparents' compass pointed to. True north is the fixed one the map is drawn around.",
        source: "https://en.wikipedia.org/wiki/North_magnetic_pole",
      },
      {
        id: "comp-northup",
        title: "Why north is up",
        body: "There is no law of nature that says north goes at the top of a map — old maps often put east "
          + "or south up. We settled on north-up by habit, back when compasses and the North Star were how "
          + "everyone found their way. A map is just as correct upside down.",
        source: "https://en.wikipedia.org/wiki/North_is_up",
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    id: "continent", label: "Continents", emoji: "🗺️", narrator: "trivia",
    cards: [
      {
        id: "cont-count",
        title: "How many continents?",
        body: "It depends who is counting. In the United States children learn seven: North America, "
          + "South America, Europe, Asia, Africa, Australia and Antarctica. Other countries teach six — "
          + "some join Europe and Asia into \"Eurasia,\" others join the two Americas.",
        source: "https://en.wikipedia.org/wiki/Continent",
      },
      {
        id: "cont-plates",
        title: "The ground is floating",
        body: "The continents ride on giant slabs of the Earth's crust called tectonic plates, which drift "
          + "on the hot rock beneath. They move about an inch (2.5 cm) a year — roughly as fast as your "
          + "fingernails grow. Slow, but never stopping.",
        source: "https://en.wikipedia.org/wiki/Plate_tectonics",
      },
      {
        id: "cont-pangaea",
        title: "When it was all one",
        body: "About 300 million years ago every continent was jammed together into one giant landmass "
          + "called Pangaea. It slowly broke apart, and the pieces drifted to where they are now — which is "
          + "why the east coast of South America looks like it would fit into the west coast of Africa.",
        source: "https://en.wikipedia.org/wiki/Pangaea",
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    id: "country", label: "Countries", emoji: "🏳️", narrator: "trivia",
    cards: [
      {
        id: "ctry-count",
        title: "How many countries?",
        body: "Most people say about 195: the 193 members of the United Nations, plus two that watch from "
          + "the sidelines — Vatican City and Palestine. The reason it's \"about\" is that the world doesn't "
          + "fully agree on a few places, so the answer honestly depends on who you ask.",
        source: "https://en.wikipedia.org/wiki/List_of_sovereign_states",
        asOf: 2025,
      },
      {
        id: "ctry-blocs",
        title: "Clubs of countries",
        body: "Countries team up in groups. Nearly all of them belong to the United Nations (193). Twenty-"
          + "seven share the European Union. The three neighbors of North America — the United States, "
          + "Mexico and Canada — trade together under USMCA. And a bloc called BRICS grew to eleven members "
          + "in 2025.",
        source: "https://en.wikipedia.org/wiki/BRICS",
        asOf: 2025,
      },
      {
        id: "ctry-micro",
        title: "The smallest country",
        body: "The whole country of Vatican City, tucked inside the city of Rome, is only about 121 acres "
          + "(49 hectares) — small enough to fit inside many a city park. It has its own stamps, its own "
          + "flag, and the world's shortest railway.",
        source: "https://en.wikipedia.org/wiki/Vatican_City",
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    id: "destination", label: "Where people go", emoji: "🧳", narrator: "trivia",
    cards: [
      {
        id: "dest-country",
        title: "The most-visited country",
        body: "For more than thirty years the most-visited country on Earth has been France. In 2024 it "
          + "became the first country ever to welcome more than 100 million visitors in a single year — "
          + "about 102 million of them.",
        source: "https://en.wikipedia.org/wiki/World_Tourism_rankings",
        asOf: 2024,
      },
      {
        id: "dest-city",
        title: "The most-visited city",
        body: "The single most-visited city in 2024 wasn't Paris or London — it was Bangkok, in Thailand, "
          + "with around 32 million international visitors. Warm weather, famous food, and easy visas keep "
          + "it at the top.",
        source: "https://en.wikipedia.org/wiki/List_of_cities_by_international_visitors",
        asOf: 2024,
      },
      {
        id: "dest-overtourism",
        title: "When a place gets too popular",
        body: "Some places now get more visitors than they can hold. Venice, in Italy, has more tourists on "
          + "a busy day than it has residents, and has begun charging day-trippers to come in. Loving a "
          + "place to bits has a name now: over-tourism.",
        source: "https://en.wikipedia.org/wiki/Overtourism",
      },
    ],
  },

  // -----------------------------------------------------------------------
  {
    id: "photograph", label: "Photography", emoji: "📸", narrator: "story",
    cards: [
      {
        id: "photo-word",
        title: "Drawing with light",
        body: "The word \"photograph\" is Greek for \"drawing with light.\" That's exactly what a camera "
          + "does: it lets light in through a lens for a fraction of a second and captures the picture that "
          + "light paints — on film, the way your grandpa's camera does, or on a digital sensor.",
        source: "https://en.wikipedia.org/wiki/Photography",
      },
      {
        id: "photo-triangle",
        title: "The exposure triangle",
        body: "Three dials control every photo. Shutter speed is how long the light gets in — fast to freeze "
          + "a bird, slow to blur a waterfall. Aperture is how wide the opening is, which also decides how "
          + "much stays in focus. ISO is how sensitive the film or sensor is. Photographers balance all "
          + "three.",
        source: "https://en.wikipedia.org/wiki/Exposure_(photography)",
      },
      {
        id: "photo-thirds",
        title: "The rule of thirds",
        body: "Split the picture into a grid of nine, like a noughts-and-crosses board. Instead of parking "
          + "your subject dead center, place it along one of the lines or where two of them cross. Almost "
          + "every photo you love secretly does this.",
        source: "https://en.wikipedia.org/wiki/Rule_of_thirds",
      },
    ],
  },
];

export const CURIOSITY_DECK_BY_ID = Object.fromEntries(CURIOSITY_DECKS.map((d) => [d.id, d]));

// Every card id in the game, used for the "Curiosities found: X / Y" tracker.
export const ALL_CURIOSITY_IDS = CURIOSITY_DECKS.flatMap((d) => d.cards.map((c) => c.id));
export const CURIOSITY_TOTAL = ALL_CURIOSITY_IDS.length;
