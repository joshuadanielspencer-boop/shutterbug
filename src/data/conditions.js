// ===========================================================================
// TRAVEL CONDITIONS — the weather and the state of the world on a Long Trip.
//
// Roguelike slice 2. One condition is drawn per run and announced by Jonah before
// you pack. Its whole job is to make two runs feel different: the same bag and the
// same map play differently when flights to Asia cost an extra day, or when every
// mountain you photograph pays double.
//
// This is DATA (rule 1). The `effect` id is the contract — shutterbug-world.jsx
// looks for exactly these ids at the matching site, so a condition added here
// without a handler there does nothing at all, silently. A test pins that.
//
// Rules these follow, inherited from the camera bag:
//   * A condition may cost TIME or pay POINTS. None may make a wrong answer pay,
//     and none may hide information — the child's job is still to know where the
//     place is, and nothing here interferes with finding out.
//   * Every one is a single sentence a child can act on. "Flights to Asia cost an
//     extra day" changes how you plan; "the weather is bad" changes nothing.
//   * Roughly half help and half hinder, so drawing one isn't dreaded.
// ===========================================================================

export const CONDITIONS = [
  {
    id: "monsoon",
    name: "Monsoon season",
    emoji: "🌧️",
    kind: "hard",
    effect: "slowContinent",
    continent: "Asia",
    blurb: "Storms across Asia. Every flight to Asia costs one extra day.",
    jonah: "The rains have come early in Asia. You'll not get anywhere fast out there.",
  },
  {
    id: "tailwinds",
    name: "Fair tailwinds",
    emoji: "💨",
    kind: "good",
    effect: "fastFlights",
    blurb: "The wind is behind you. Every flight between continents costs half a day less.",
    jonah: "The winds are with you this week. You'll make good time — use it.",
  },
  {
    id: "peakseason",
    name: "Peak season",
    emoji: "🎪",
    kind: "hard",
    effect: "costlyResearch",
    blurb: "Everywhere is busy. Reading the Field Guide costs a whole day instead of half.",
    jonah: "Half the world's on holiday. The libraries and the guides will all be full.",
  },
  {
    id: "clearskies",
    name: "Clear skies",
    emoji: "☀️",
    kind: "good",
    effect: "bonusPerfect",
    blurb: "Beautiful light everywhere. Every perfect first-try shot is worth one extra point.",
    jonah: "Not a cloud anywhere. Get it right first time and the picture will sing.",
  },
  {
    id: "summitfever",
    name: "Summit fever",
    emoji: "⛰️",
    kind: "good",
    effect: "bonusCategory",
    category: "mountain",
    blurb: "The high country is calling. Every mountain you photograph is worth two extra points.",
    jonah: "The mountains are showing themselves this month. Get up high if you can.",
  },
  {
    id: "longhaul",
    name: "The long way round",
    emoji: "🧭",
    kind: "hard",
    effect: "costlyShots",
    blurb: "Nothing is close to anything. Taking a photograph costs a whole day instead of half.",
    jonah: "Everything's further apart than it looks on the map. Don't waste a frame.",
  },
];

export const CONDITION_BY_ID = Object.fromEntries(CONDITIONS.map((c) => [c.id, c]));
