// ===========================================================================
// SOUVENIR STALLS — what a child can buy for Uncle Jonah, in local money.
//
// Joshua's brief (2026-09-28): a stall where you buy something for Jonah in the
// country's own currency, so the child has to JUDGE whether 1,500 yen is a lot.
// Souvenirs collect into the passport. And the design rule that shapes every
// number here: MONEY IS NEVER A FAIL STATE. The game already has one resource
// that runs out (travel days); a second one you can go bankrupt in would make
// it punishing rather than curious. A souvenir costs points at most — the same
// leftover-money bonus the Grand Tour pays at the end — never a leg of the trip.
//
// WHAT IS A FACT HERE AND WHAT IS NOT (rule 2). The things for sale are real
// objects, and what each IS — where it comes from, what it is for — is verified
// against a source named on the entry. The PRICE is not a fact: it is a game
// price, chosen in dollars and shown in the local currency through the same
// exchange magnitude the culture card already uses (src/data/currency.js). No
// stall claims "a daruma costs ¥1,600 in Tokyo"; it claims "this one does", the
// way the $3,500 wallet does not claim to be a real budget. The teaching sits in
// the conversion, which IS verified, and in the comparison the stall draws for
// the countries that have a price anchor (src/data/price-anchors.js): "that is
// about four pounds of rice here", which is a real observed retail price.
//
// The colour word rule from the wardrobe applies to the object names too: one
// item is one real thing with one name, not a category. "A daruma doll", not
// "a lucky charm".
//
// ONE STALL for now — Tokyo, at the HND hub, because yen is the example in the
// brief and Japan is one of the fourteen countries with a verified price anchor.
// Adding a stall is adding an entry here; the stall component reads whichever
// hub the child has just landed at and shows nothing if there is no entry.
// ===========================================================================

// `usd` is the game price; the stall converts it with currency.js. `for` is the
// stall's own one-line description of what the thing is, verified against
// `source` — write it from the source, not from memory. `emoji` is the
// placeholder until the art batch lands (the same fallback pattern art.js uses).
export const SOUVENIR_STALLS = {
  // Sources checked 2026-09-30, Wikipedia intros via the MediaWiki API:
  //   Daruma doll — "a hollow, round, Japanese traditional doll modeled after
  //     Bodhidharma … regarded more as a talisman of good luck"
  //   Kokeshi — "Originally from the Tohoku region in northern Honshu, kokeshi
  //     are handmade from wood … a simple trunk and head with a few thin,
  //     painted lines to define the face"
  //   Maneki-neko — "depicts a cat, traditionally a calico Japanese Bobtail,
  //     with a paw raised in a beckoning gesture", displayed in shops
  //   Furoshiki — "traditional Japanese wrapping cloths traditionally used to
  //     wrap and/or transport goods"
  HND: {
    country: "Japan",
    city: "Tokyo",
    stall: "an airport gift counter at Haneda",
    items: [
      { id: "daruma", name: "Daruma doll", emoji: "🎯", usd: 10,
        about: "A hollow, round doll modelled after Bodhidharma, the monk who founded Zen. In Japan it is a good-luck charm: you paint in one eye when you set a goal and the other when you reach it.",
        source: "https://en.wikipedia.org/wiki/Daruma_doll" },
      { id: "kokeshi", name: "Kokeshi doll", emoji: "🪆", usd: 18,
        about: "A wooden doll from the Tōhoku region of northern Honshu — a simple trunk and head, with a few painted lines for the face.",
        source: "https://en.wikipedia.org/wiki/Kokeshi" },
      { id: "manekineko", name: "Maneki-neko", emoji: "🐈", usd: 6,
        about: "The beckoning cat: a figurine with one paw raised, traditionally a calico Japanese Bobtail, set in shop windows to bring in customers.",
        source: "https://en.wikipedia.org/wiki/Maneki-neko" },
      { id: "furoshiki", name: "Furoshiki cloth", emoji: "🧣", usd: 14,
        about: "A square wrapping cloth used to carry and wrap things — a lunch, a gift, a bottle — folded and knotted rather than bagged.",
        source: "https://en.wikipedia.org/wiki/Furoshiki" },
    ],
  },
};

// Every stall item, flattened, keyed for the passport: `HND/daruma`.
export const SOUVENIR_BY_KEY = Object.fromEntries(
  Object.entries(SOUVENIR_STALLS).flatMap(([hub, s]) =>
    s.items.map((it) => [`${hub}/${it.id}`, { ...it, hub, country: s.country, city: s.city }])),
);

// What Uncle Jonah says when a souvenir comes home to him. One line per item
// keeps it a gift and not a lecture; the fact is on the stall, not here.
export const SOUVENIR_THANKS = {
  "HND/daruma": "A daruma! Paint in one eye now, and the other when you've photographed the whole list. That's how they're used.",
  "HND/kokeshi": "A kokeshi from Tōhoku. I had one on the shelf for years — same painted smile. Thank you.",
  "HND/manekineko": "The beckoning cat! Every shop in Tokyo has one in the window. Mine will have to beckon in more trips.",
  "HND/furoshiki": "A furoshiki. I carried my lunch in one for a whole summer once, and my camera in it when it rained.",
};
