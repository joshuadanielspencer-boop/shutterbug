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
// FIVE STALLS: every price-anchor country that has a hub — Tokyo first (yen is
// the example in the brief), then Toronto, Cairo, Mexico City and Istanbul.
// Adding a stall is adding an entry here; the stall component reads whichever
// hub the child has just landed at and shows nothing if there is no entry. Why
// the other nine anchor countries have none, and why the US doesn't either, is
// under the HND entry below.
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

  // ---- The other anchor countries that have a hub, added 2026-09-30. ------
  // Same rule for every item: the description is written FROM the source's
  // intro, and an object whose intro did not state the connection was dropped
  // rather than asserted — a hockey puck (the article never says Canada),
  // hibiscus tea (never says Egypt), Talavera and İznik-by-that-spelling (empty
  // extracts; İznik verified under "Iznik pottery").
  //
  // The nine anchor countries WITHOUT a hub — Cameroon, Ecuador, Jordan,
  // Madagascar, Namibia, Nepal, the Philippines, Sri Lanka — cannot have a stall
  // as the game stands: the stall opens on landing at a hub, and there is none to
  // land at. That is a design decision for Joshua (a stall on arriving in the
  // country, or hubs in those countries), not a gap in this file. The United
  // States has three hubs and is left out on purpose: the stall exists to teach
  // judging FOREIGN money, and dollars in Atlanta teach nothing about that.

  YYZ: {
    country: "Canada",
    city: "Toronto",
    stall: "a gift shop at Pearson airport",
    // Maple syrup — "Almost all of the world's maple syrup is produced in Canada
    //   and the United States, with Quebec alone accounting for 72% of global output"
    // Butter tart — "butter, brown sugar, maple syrup, and egg, baked in a pastry
    //   shell … an iconic Canadian food"
    // Knit cap — "In Canadian English, a knit cap is known as a toque"
    items: [
      { id: "maplesyrup", name: "Maple syrup", emoji: "🍁", usd: 12,
        about: "Sweet syrup boiled down from the sap of maple trees. Almost all of the world's supply comes from Canada and the United States — Quebec alone makes about 72% of it.",
        source: "https://en.wikipedia.org/wiki/Maple_syrup" },
      { id: "buttertart", name: "Butter tarts", emoji: "🥧", usd: 3,
        about: "A small pastry with a filling of butter, brown sugar, maple syrup and egg, baked in a shell — an iconic Canadian food.",
        source: "https://en.wikipedia.org/wiki/Butter_tart" },
      { id: "toque", name: "Toque", emoji: "🧢", usd: 15,
        about: "A knitted cap for cold weather. In Canadian English it's a toque — the word itself is the souvenir.",
        source: "https://en.wikipedia.org/wiki/Knit_cap" },
    ],
  },

  CAI: {
    country: "Egypt",
    city: "Cairo",
    stall: "a bazaar stall at Cairo airport",
    // Papyrus — "a substance used in ancient times as a writing surface … first
    //   known to have been used in Egypt (at least as far back as the First Dynasty)"
    // Scarab — "amulets and impression seals shaped according to the eponymous
    //   beetles … widely popular throughout ancient Egypt"
    // Cartouche — "an oval with a line at one end … indicating that the text
    //   enclosed is a royal name … associated with pharaohs at the end of the
    //   Third Dynasty"
    items: [
      { id: "papyrus", name: "Papyrus painting", emoji: "📜", usd: 8,
        about: "A sheet of papyrus, the writing surface of the ancient world — first used in Egypt at least as far back as the First Dynasty — painted with a scene in the old style.",
        source: "https://en.wikipedia.org/wiki/Papyrus" },
      { id: "scarab", name: "Scarab amulet", emoji: "🪲", usd: 5,
        about: "A small charm shaped like the scarab beetle. Amulets and seals in this shape were popular throughout ancient Egypt.",
        source: "https://en.wikipedia.org/wiki/Scarab_(artifact)" },
      { id: "cartouche", name: "Cartouche pendant", emoji: "📿", usd: 12,
        about: "An oval with a line at one end — in hieroglyphic writing it marked the text inside as a royal name, from the pharaohs of the Third Dynasty on.",
        source: "https://en.wikipedia.org/wiki/Cartouche" },
    ],
  },

  MEX: {
    country: "Mexico",
    city: "Mexico City",
    stall: "an artesanía stand at Benito Juárez airport",
    // Alebrije — "brightly colored Mexican folk art sculptures of fantastical
    //   creatures … The art form originated in Mexico City in 1936"
    // Lucha libre — "characterized by colorful masks … originating in Mexico"
    // Papel picado — "a traditional Mexican decorative craft made by cutting
    //   elaborate designs into sheets of tissue paper"
    // Serape — "a long blanket-like shawl or cloak, often brightly colored and
    //   fringed at the ends, worn in Mexico"
    items: [
      { id: "alebrije", name: "Alebrije", emoji: "🐉", usd: 20,
        about: "A brightly painted folk-art sculpture of a fantastical creature. The art form began in Mexico City in 1936.",
        source: "https://en.wikipedia.org/wiki/Alebrije" },
      { id: "luchamask", name: "Lucha libre mask", emoji: "🎭", usd: 12,
        about: "The colourful mask of lucha libre, the style of professional wrestling that began in Mexico.",
        source: "https://en.wikipedia.org/wiki/Lucha_libre" },
      { id: "papelpicado", name: "Papel picado", emoji: "🎏", usd: 4,
        about: "Banners of tissue paper with elaborate designs cut into them — a traditional Mexican craft, strung up for celebrations.",
        source: "https://en.wikipedia.org/wiki/Papel_picado" },
      { id: "serape", name: "Serape", emoji: "🧶", usd: 25,
        about: "A long, blanket-like shawl, often brightly coloured and fringed at the ends, worn in Mexico.",
        source: "https://en.wikipedia.org/wiki/Serape" },
    ],
  },

  IST: {
    country: "Turkey",
    city: "Istanbul",
    stall: "a bazaar counter at Istanbul airport",
    // Nazar — "an eye-shaped amulet believed to protect against the evil eye …
    //   In Turkey, it is known by the name nazar boncuğu"
    // Turkish delight — "a family of confections based on a gel of starch and sugar"
    // Cezve — "a small long-handled pot with a pouring lip designed specifically
    //   to make Turkish coffee … traditionally made of brass or copper"
    // Iznik pottery — "named after the town of İznik in Anatolia where it was
    //   made, is a decorated ceramic that was produced from the last quarter of
    //   the 15th century until the end of the 17th century"
    items: [
      { id: "nazar", name: "Nazar boncuğu", emoji: "🧿", usd: 3,
        about: "The blue eye-shaped bead, believed to protect against the evil eye. In Turkey it's called nazar boncuğu — 'boncuk' means bead.",
        source: "https://en.wikipedia.org/wiki/Nazar_(amulet)" },
      { id: "lokum", name: "Turkish delight", emoji: "🍬", usd: 8,
        about: "A box of lokum — soft confections made from a gel of starch and sugar, dusted so they don't stick.",
        source: "https://en.wikipedia.org/wiki/Turkish_delight" },
      { id: "cezve", name: "Cezve", emoji: "☕", usd: 15,
        about: "A small, long-handled pot with a pouring lip, made specifically for brewing Turkish coffee — traditionally in brass or copper.",
        source: "https://en.wikipedia.org/wiki/Cezve" },
      { id: "izniktile", name: "İznik-style tile", emoji: "🔷", usd: 14,
        about: "A tile in the style of İznik ware, the decorated ceramic made in the town of İznik in Anatolia from the late 1400s to the end of the 1600s.",
        source: "https://en.wikipedia.org/wiki/Iznik_pottery" },
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
  "YYZ/maplesyrup": "Maple syrup — from Quebec, I'd wager. Most of the world's is. This goes on everything until it's gone.",
  "YYZ/buttertart": "Butter tarts! I ate one in Ontario once and thought about it for a year. Thank you.",
  "YYZ/toque": "A toque. Only a Canadian would call it that, and now so will I. Pickles is jealous.",
  "CAI/papyrus": "Papyrus. The first paper there was, and the Egyptians were writing on it five thousand years ago. Look at the colour of it.",
  "CAI/scarab": "A scarab! They carried these in ancient Egypt for luck. I shall keep it in the camera bag, where luck is needed most.",
  "CAI/cartouche": "A cartouche — the oval they drew around a pharaoh's name. Fancy that, my name in a frame fit for a king.",
  "MEX/alebrije": "An alebrije! Nobody paints a creature like Mexico City paints a creature. Look at the colours on it.",
  "MEX/luchamask": "A lucha libre mask. Don't tell anyone, but I'm going to wear it while I do the washing-up.",
  "MEX/papelpicado": "Papel picado — I'll string it across the window. Every fiesta I ever walked into had these overhead.",
  "MEX/serape": "A serape. Warm, bright, and it smells of the market. This chair just got a lot more comfortable.",
  "IST/nazar": "A nazar boncuğu! I'll hang it by the door. Half of Turkey has one there, and who am I to argue.",
  "IST/lokum": "Turkish delight. Pickles, no — these are for me. Well. One for you.",
  "IST/cezve": "A cezve! I learned to make coffee in one of these on a rooftop in Istanbul, and I've never got it quite right since.",
  "IST/izniktile": "An İznik tile. Those blues — they were trying to match Chinese porcelain, and I think they beat it.",
};
