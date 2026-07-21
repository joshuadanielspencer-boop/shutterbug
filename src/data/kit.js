// ===========================================================================
// THE CAMERA BAG — what Jonah packs for you on a Long Trip.
//
// The Long Trip is the run-based mode: assignments keep coming until the days run
// out, and how far you get is the score. Before you leave, Jonah offers you a few
// things out of his old bag and you choose which to take. That choice is the whole
// texture of the mode — two runs with different kit play differently.
//
// This is DATA (rule 1): the items, their words, and how many uses they hold live
// here; the component only spends charges and renders. An item's `effect` id is the
// contract — shutterbug-world.jsx looks for exactly these ids at the matching cost
// site, so adding an item here without adding its effect there does nothing at all.
//
// Design rules these follow, learned from the rest of the game:
//   * Nothing here rewards GUESSING. Every item either buys back time or forgives a
//     single honest mistake — none of them makes a wrong answer pay, because the
//     game teaches geography and the reward has to track what the child knows.
//   * Every item is legible to a child in one sentence, and its name says what it
//     does. "Fast film" is a real thing a photographer carries, and it makes you
//     faster; the fiction and the mechanic agree.
//   * Charges are small (1–2). An item you can lean on all run stops being a choice
//     and becomes the way the mode is played.
// ===========================================================================

export const KIT_ITEMS = [
  {
    id: "telephoto",
    name: "Telephoto lens",
    emoji: "🔭",
    charges: 1,
    effect: "forgiveCountry",
    blurb: "Shoot from a long way off. Your first wrong country costs you nothing.",
    // Jonah's voice, shown when he offers it.
    jonah: "The long lens. Heavy as a brick, but it'll save you a walk.",
  },
  {
    id: "fastfilm",
    name: "Fast film",
    emoji: "🎞️",
    charges: 3,
    effect: "refundPerfect",
    blurb: "Quick to shoot: each of your first three perfect shots gives you back half a day.",
    jonah: "Fast film. You won't need to set up so careful — get it right first time and you'll save yourself an afternoon.",
  },
  {
    id: "presspass",
    name: "Press pass",
    emoji: "🪪",
    charges: 99,
    effect: "freeResearch",
    blurb: "Doors open for you. Reading the Field Guide is free all trip.",
    jonah: "My old press pass. Still works, somehow. They'll let you read anything with that.",
  },
  {
    id: "bushplane",
    name: "Bush plane ticket",
    emoji: "🛩️",
    charges: 1,
    effect: "freeFlight",
    blurb: "One flight between continents costs you no days at all.",
    jonah: "A favour from a pilot friend. One hop, anywhere, on the house.",
  },
  {
    id: "fixer",
    name: "A friend in town",
    emoji: "🤝",
    charges: 1,
    effect: "forgiveContinent",
    blurb: "Someone who knows the way. Your first wrong continent costs you nothing.",
    jonah: "I've friends in most places. Get properly lost and one of them will sort you out — once.",
  },
];

export const KIT_BY_ID = Object.fromEntries(KIT_ITEMS.map((i) => [i.id, i]));

// How many Jonah offers, and how many you may take. Offering more than you can take
// is the point: the choice is what's interesting, not the items themselves.
export const KIT_OFFERED = 3;
export const KIT_TAKEN = 2;
