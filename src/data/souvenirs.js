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
// objects, and what each IS — where it comes from, what it is for — is written
// from the source named on the entry, and an object whose source does not state
// the connection to the country is not here (a hockey puck's article never says
// Canada; the keffiyeh's never says Jordan; the makalani palm's says "south
// central Africa"). The PRICE is not a fact: it is a game price, chosen in
// dollars and shown in the local currency through the exchange rate the whole
// game uses (src/data/travel.js, which reads src/data/currency.js). No stall
// claims "a daruma costs ¥1,600 in Tokyo"; it claims "this one does", the way
// the $3,500 wallet does not claim to be a real budget. The teaching sits in the
// conversion, which IS verified, and in the comparison the stall draws for the
// countries that have a price anchor (src/data/price-anchors.js): "that is
// about four pounds of rice here", which is a real observed retail price.
//
// One item is one real thing with one name, not a category: "a daruma doll",
// not "a lucky charm".
//
// KEYED BY COUNTRY, and a stall opens in two ways (both once per country per
// run, both only when there is money in the wallet):
//   - landing at a hub airport in that country (Tokyo, Toronto, Cairo, Mexico
//     City, Istanbul), on the way in;
//   - arriving IN the country on the last leg of a Grand Tour, which is the
//     only way to reach the countries that have no hub. Joshua chose this
//     (2026-09-30) over inventing hubs for them: a child buying in rupees in
//     Nepal is the better lesson than buying them in Delhi.
//
// WHO IS HERE: every country with a verified price anchor, except two, for one
// reason worth keeping —
//   United States, Ecuador  the stall teaches judging FOREIGN money, and both
//                           price in dollars (Ecuador adopted the dollar in 2000).
// ===========================================================================

export const SOUVENIR_STALLS = {
  // ---- Japan — HND ---------------------------------------------------------
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
  Japan: {
    city: "Tokyo", hub: "HND",
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

  // ---- Canada — YYZ --------------------------------------------------------
  //   Maple syrup — "Almost all of the world's maple syrup is produced in Canada
  //     and the United States, with Quebec alone accounting for 72% of global output"
  //   Butter tart — "butter, brown sugar, maple syrup, and egg, baked in a pastry
  //     shell … an iconic Canadian food"
  //   Knit cap — "In Canadian English, a knit cap is known as a toque"
  Canada: {
    city: "Toronto", hub: "YYZ",
    stall: "a gift shop at Pearson airport",
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

  // ---- Egypt — CAI ---------------------------------------------------------
  //   Papyrus — "a substance used in ancient times as a writing surface … first
  //     known to have been used in Egypt (at least as far back as the First Dynasty)"
  //   Scarab — "amulets and impression seals shaped according to the eponymous
  //     beetles … widely popular throughout ancient Egypt"
  //   Cartouche — "an oval with a line at one end … indicating that the text
  //     enclosed is a royal name … associated with pharaohs at the end of the
  //     Third Dynasty"
  Egypt: {
    city: "Cairo", hub: "CAI",
    stall: "a bazaar stall at Cairo airport",
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

  // ---- Mexico — MEX --------------------------------------------------------
  //   Alebrije — "brightly colored Mexican folk art sculptures of fantastical
  //     creatures … The art form originated in Mexico City in 1936"
  //   Lucha libre — "characterized by colorful masks … originating in Mexico"
  //   Papel picado — "a traditional Mexican decorative craft made by cutting
  //     elaborate designs into sheets of tissue paper"
  //   Serape — "a long blanket-like shawl or cloak, often brightly colored and
  //     fringed at the ends, worn in Mexico"
  Mexico: {
    city: "Mexico City", hub: "MEX",
    stall: "an artesanía stand at Benito Juárez airport",
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

  // ---- Turkey — IST --------------------------------------------------------
  //   Nazar — "an eye-shaped amulet believed to protect against the evil eye …
  //     In Turkey, it is known by the name nazar boncuğu"
  //   Turkish delight — "a family of confections based on a gel of starch and sugar"
  //   Cezve — "a small long-handled pot with a pouring lip designed specifically
  //     to make Turkish coffee … traditionally made of brass or copper"
  //   Iznik pottery — "named after the town of İznik in Anatolia where it was
  //     made, is a decorated ceramic that was produced from the last quarter of
  //     the 15th century until the end of the 17th century"
  Turkey: {
    city: "Istanbul", hub: "IST",
    stall: "a bazaar counter at Istanbul airport",
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

  // ---- The countries with no hub, reached on the last leg. Each stall sits
  // in the city its price anchor was measured in, so the "pounds of rice"
  // line and the shop are the same place. Sources checked 2026-09-30. ----

  //   Kukri — "a type of knife or short sword with a distinct recurve in its
  //     blade … the national weapon of Nepal, traditionally serving the role of
  //     a basic utility knife"
  //   Dhaka topi — "a traditional Nepalese cloth hat which forms part of
  //     Nepalese national dress … worn by men on a daily basis in the hilly regions"
  //   Lokta paper — "a wildcrafted, handmade artisan paper … made in Nepal from
  //     the bark of two of the species of the shrub Daphne"
  Nepal: {
    city: "Kathmandu",
    stall: "a stall in the old market in Kathmandu",
    items: [
      { id: "dhakatopi", name: "Dhaka topi", emoji: "🎩", usd: 6,
        about: "The traditional Nepalese cloth hat, part of the national dress — worn every day by men in the hill regions.",
        source: "https://en.wikipedia.org/wiki/Dhaka_topi" },
      { id: "loktapaper", name: "Lokta paper notebook", emoji: "📔", usd: 9,
        about: "Handmade paper from Nepal, made from the bark of two species of the Daphne shrub, gathered wild.",
        source: "https://en.wikipedia.org/wiki/Lokta_paper" },
      { id: "kukri", name: "Kukri letter-opener", emoji: "🗡️", usd: 16,
        about: "A small copy of the kukri, the knife with the curved blade that is Nepal's national weapon and, traditionally, its everyday utility tool.",
        source: "https://en.wikipedia.org/wiki/Kukri" },
    ],
  },

  //   Barong tagalog — "an embroidered long-sleeved formal shirt for men and a
  //     national dress of the Philippines"
  //   Banig — "traditional handwoven mats of the Philippines predominantly used
  //     as a sleeping mat or a floor mat"
  //   Windowpane oyster — "In the Philippines, the shell is known as the capiz
  //     shell", a translucent shell used as a glass substitute
  Philippines: {
    city: "Manila",
    stall: "a handicraft stall in Manila",
    items: [
      { id: "banig", name: "Banig mat", emoji: "🧺", usd: 12,
        about: "A handwoven mat of the Philippines, used for sleeping on or as a floor mat.",
        source: "https://en.wikipedia.org/wiki/Banig" },
      { id: "capizlamp", name: "Capiz shell lantern", emoji: "🏮", usd: 18,
        about: "A lantern of capiz — the translucent shell of the windowpane oyster, which in the Philippines has long stood in for glass.",
        source: "https://en.wikipedia.org/wiki/Windowpane_oyster" },
      { id: "barong", name: "Barong tagalog", emoji: "👔", usd: 30,
        about: "The embroidered, long-sleeved formal shirt for men that is a national dress of the Philippines.",
        source: "https://en.wikipedia.org/wiki/Barong_tagalog" },
    ],
  },

  //   Ceylon tea — "both the brand of tea which is produced in Sri Lanka and a
  //     historic term describing black tea from that land … a pillar of Sri
  //     Lankan culture, heritage, and identity"
  //   Cinnamomum verum — the tree whose inner bark is cinnamon, "native to Sri Lanka"
  //   Ambalangoda — "a coastal town in Galle District … famous for the hand
  //     crafting of traditional demon masks"
  "Sri Lanka": {
    city: "Colombo",
    stall: "a market stall in Colombo",
    items: [
      { id: "ceylontea", name: "Ceylon tea", emoji: "🍵", usd: 7,
        about: "Black tea grown in Sri Lanka, sold under the island's old name — described as a pillar of Sri Lankan culture and identity.",
        source: "https://en.wikipedia.org/wiki/Ceylon_tea" },
      { id: "cinnamon", name: "Cinnamon quills", emoji: "🌿", usd: 5,
        about: "Rolled inner bark of the cinnamon tree, Cinnamomum verum, which is native to Sri Lanka.",
        source: "https://en.wikipedia.org/wiki/Cinnamomum_verum" },
      { id: "ambalangodamask", name: "Ambalangoda mask", emoji: "👺", usd: 20,
        about: "A hand-carved, painted mask in the tradition of Ambalangoda, the coastal town famous for its demon masks and devil dancers.",
        source: "https://en.wikipedia.org/wiki/Ambalangoda" },
    ],
  },

  //   Vanilla — "Madagascar's and Indonesia's cultivations produce two-thirds of
  //     the world's supply of vanilla"
  //   Raffia palm — "Native to tropical regions of Africa, and especially Madagascar"
  //   Lamba — "The traditional garment worn by men and women who live in
  //     Madagascar … highly emblematic of Malagasy culture"
  Madagascar: {
    city: "Antananarivo",
    stall: "a market stall in Antananarivo",
    items: [
      { id: "vanilla", name: "Vanilla pods", emoji: "🫘", usd: 8,
        about: "Cured pods of the vanilla orchid. Madagascar and Indonesia between them grow two-thirds of the world's vanilla.",
        source: "https://en.wikipedia.org/wiki/Vanilla" },
      { id: "raffiabasket", name: "Raffia basket", emoji: "🧺", usd: 10,
        about: "A basket woven from raffia, the palm with extraordinarily long leaves that is native to tropical Africa and especially to Madagascar.",
        source: "https://en.wikipedia.org/wiki/Raffia_palm" },
      { id: "lamba", name: "Lamba", emoji: "🧣", usd: 15,
        about: "The traditional wrapped cloth worn by men and women in Madagascar — a rectangle of fabric, and an emblem of Malagasy culture.",
        source: "https://en.wikipedia.org/wiki/Lamba_(garment)" },
    ],
  },

  //   Madaba Map — "part of a floor mosaic in the early Byzantine church of Saint
  //     George in Madaba, Jordan … the oldest surviving original cartographic
  //     depiction of the Holy Land"
  //   Za'atar — "The blend of spices called za'atar contains a common local herb
  //     called sumac that grows wild in Jordan"
  //   Dead Sea — "a landlocked salt lake bordered by Jordan to the east";
  //     Dead Sea salt — "salt and other mineral deposits extracted or taken
  //     from the Dead Sea"
  Jordan: {
    city: "Amman",
    stall: "a souk stall in Amman",
    items: [
      { id: "madabamosaic", name: "Mosaic tile", emoji: "🪨", usd: 14,
        about: "A small mosaic in the tradition of Madaba, the Jordanian town whose sixth-century church floor holds the oldest surviving map of the Holy Land.",
        source: "https://en.wikipedia.org/wiki/Madaba_Map" },
      { id: "zaatar", name: "Za'atar", emoji: "🌿", usd: 4,
        about: "A blend of dried herbs and spices, with sumac — a herb that grows wild in Jordan — and sesame, for dipping bread into with oil.",
        source: "https://en.wikipedia.org/wiki/Za%27atar" },
      { id: "deadseasalt", name: "Dead Sea salt", emoji: "🧂", usd: 6,
        about: "Salt and minerals taken from the Dead Sea, the salt lake on Jordan's western border.",
        source: "https://en.wikipedia.org/wiki/Dead_Sea_salt" },
    ],
  },

  //   Herero people — "Herero women adopted the floor-length gowns worn by German
  //     missionaries in the late 19th century, but now make them in vivid colors
  //     and prints … locally known as ohorokova … The most distinctive feature of
  //     Herero women's dress is their horizontal horned headdress, the otjikaiva,
  //     which is a symbol of respect, worn to pay homage to the cows that have
  //     historically sustained the Herero … In urban Windhoek, fashion designers
  //     and models are updating Herero dress" (full article, not the intro — the
  //     intro says only that 178,987 Namibians identified as Ovaherero in 2023)
  //   Makalani — The Namibian (the national newspaper), "Namibia: our trees of
  //     national importance", Absalom Shigwedha, 23 Aug 2007: "Often called
  //     vegetable ivory, the nuts are often carved into small ornaments and
  //     trinkets to adorn key rings, necklaces or charms"; the palm is "a
  //     prominent feature of the oshana landscape … of the Omusati, Oshana and
  //     western Oshikoto regions" and "protected in Namibia". That is the one
  //     sentence the two Wikipedia articles could not supply between them
  //     (Hyphaene petersiana: in Namibia, nut core "known as vegetable ivory";
  //     Vegetable ivory: lists the makalani palm as a source, "commonly used in
  //     buttons, jewelry, and artistic carving"). Joshua asked for a third source
  //     that says it outright, and this is it.
  //   Karakul sheep — "Karakul are also raised in large numbers in Namibia,
  //     having first been brought there by German colonists in the early 20th century"
  Namibia: {
    city: "Windhoek",
    stall: "a craft market stall in Windhoek",
    items: [
      { id: "hererodoll", name: "Herero dress doll", emoji: "👗", usd: 18,
        about: "A doll in the dress Herero women wear: the ohorokova, a floor-length gown in vivid prints adopted from German missionaries' clothes in the 1800s, under the otjikaiva — a horned headdress worn in respect for the cattle that have sustained the Herero.",
        source: "https://en.wikipedia.org/wiki/Herero_people" },
      { id: "makalani", name: "Makalani nut carving", emoji: "🥥", usd: 8,
        about: "A nut of the makalani palm of northern Namibia, carved. Under the husk its core is 'vegetable ivory', hard and white, and it is carved into small ornaments for key rings, necklaces and charms.",
        source: "https://www.namibian.com.na/namibia-our-trees-of-national-importance/" },
      { id: "karakulwool", name: "Karakul wool beanie", emoji: "🐑", usd: 15,
        about: "Knitted from the wool of Karakul sheep, which are raised in large numbers in Namibia — first brought there by German colonists in the early 1900s.",
        source: "https://en.wikipedia.org/wiki/Karakul_sheep" },
    ],
  },

  //   Penja pepper — "a type of pepper (Piper nigrum) grown in the volcanic soil
  //     of the Penja Valley in Cameroon"
  //   Bamum script — "an evolutionary series of six scripts created for the Bamum
  //     language by Ibrahim Njoya, King of Bamum", in western Cameroon; Foumban
  //     "is home to a museum of traditional arts and culture"
  Cameroon: {
    city: "Yaoundé",
    stall: "a market stall in Yaoundé",
    items: [
      { id: "penjapepper", name: "Penja pepper", emoji: "🌶️", usd: 6,
        about: "Peppercorns grown in the volcanic soil of the Penja Valley in Cameroon.",
        source: "https://en.wikipedia.org/wiki/Penja_pepper" },
      { id: "bamumprint", name: "Bamum script print", emoji: "🖋️", usd: 9,
        about: "A print of writing in the Bamum script — a set of scripts invented for the Bamum language by King Ibrahim Njoya in western Cameroon, whose palace at Foumban keeps a museum of it.",
        source: "https://en.wikipedia.org/wiki/Bamum_script" },
    ],
  },
};

// Every stall item, flattened, keyed for the passport: `Japan/daruma`.
export const SOUVENIR_BY_KEY = Object.fromEntries(
  Object.entries(SOUVENIR_STALLS).flatMap(([country, s]) =>
    s.items.map((it) => [`${country}/${it.id}`, { ...it, country, city: s.city }])),
);
// The first stalls (2026-09-28/30) were keyed by hub code — `HND/daruma` — and a
// passport written in those two days holds those keys. They resolve here to the
// same object rather than to nothing, so nobody's daruma vanishes from the shelf.
for (const [country, s] of Object.entries(SOUVENIR_STALLS)) {
  if (!s.hub) continue;
  for (const it of s.items) SOUVENIR_BY_KEY[`${s.hub}/${it.id}`] = SOUVENIR_BY_KEY[`${country}/${it.id}`];
}

// What Uncle Jonah says when a souvenir comes home to him. One line per item
// keeps it a gift and not a lecture; the fact is on the stall, not here.
export const SOUVENIR_THANKS = {
  "Japan/daruma": "A daruma! Paint in one eye now, and the other when you've photographed the whole list. That's how they're used.",
  "Japan/kokeshi": "A kokeshi from Tōhoku. I had one on the shelf for years — same painted smile. Thank you.",
  "Japan/manekineko": "The beckoning cat! Every shop in Tokyo has one in the window. Mine will have to beckon in more trips.",
  "Japan/furoshiki": "A furoshiki. I carried my lunch in one for a whole summer once, and my camera in it when it rained.",
  "Canada/maplesyrup": "Maple syrup — from Quebec, I'd wager. Most of the world's is. This goes on everything until it's gone.",
  "Canada/buttertart": "Butter tarts! I ate one in Ontario once and thought about it for a year. Thank you.",
  "Canada/toque": "A toque. Only a Canadian would call it that, and now so will I. Pickles is jealous.",
  "Egypt/papyrus": "Papyrus. The first paper there was, and the Egyptians were writing on it five thousand years ago. Look at the colour of it.",
  "Egypt/scarab": "A scarab! They carried these in ancient Egypt for luck. I shall keep it in the camera bag, where luck is needed most.",
  "Egypt/cartouche": "A cartouche — the oval they drew around a pharaoh's name. Fancy that, my name in a frame fit for a king.",
  "Mexico/alebrije": "An alebrije! Nobody paints a creature like Mexico City paints a creature. Look at the colours on it.",
  "Mexico/luchamask": "A lucha libre mask. Don't tell anyone, but I'm going to wear it while I do the washing-up.",
  "Mexico/papelpicado": "Papel picado — I'll string it across the window. Every fiesta I ever walked into had these overhead.",
  "Mexico/serape": "A serape. Warm, bright, and it smells of the market. This chair just got a lot more comfortable.",
  "Turkey/nazar": "A nazar boncuğu! I'll hang it by the door. Half of Turkey has one there, and who am I to argue.",
  "Turkey/lokum": "Turkish delight. Pickles, no — these are for me. Well. One for you.",
  "Turkey/cezve": "A cezve! I learned to make coffee in one of these on a rooftop in Istanbul, and I've never got it quite right since.",
  "Turkey/izniktile": "An İznik tile. Those blues — they were trying to match Chinese porcelain, and I think they beat it.",
  "Nepal/dhakatopi": "A dhaka topi! I'll wear it to the shops and see who asks. Thank you, truly.",
  "Nepal/loktapaper": "Lokta paper. Made from a shrub that grows up in the hills — you can feel it in the page. My next journal, this.",
  "Nepal/kukri": "A kukri, in miniature. Every Gurkha I ever met carried the real one. This one opens my letters.",
  "Philippines/banig": "A banig! Cool to lie on in the heat — I slept on one in Cebu once and slept better than I have since.",
  "Philippines/capizlamp": "Capiz shell. Windows made of seashell, and now a lamp made of it. The light through this is like being underwater.",
  "Philippines/barong": "A barong tagalog! I shall have to find an occasion. The embroidery on this — someone's hours went into it.",
  "Sri Lanka/ceylontea": "Ceylon tea. The hills it grows on are the greenest place I ever stood. Put the kettle on.",
  "Sri Lanka/cinnamon": "Real cinnamon, from the tree it comes from. Smell that. The stuff in the shops here isn't the same thing.",
  "Sri Lanka/ambalangodamask": "An Ambalangoda mask! Those go on the wall and keep the bad dreams out — that's what they told me, anyway.",
  "Madagascar/vanilla": "Vanilla pods, from where most of the world's vanilla grows. The whole room smells of them already.",
  "Madagascar/raffiabasket": "A raffia basket. That palm grows nowhere like it grows in Madagascar. I'll keep the lens cloths in it.",
  "Madagascar/lamba": "A lamba! Everyone on the island wears one and now so shall I. Over the shoulder, like so.",
  "Jordan/madabamosaic": "A mosaic — like the map on the church floor at Madaba. Fifteen hundred years old, that map, and it still shows you the way.",
  "Jordan/zaatar": "Za'atar! Bread, oil, za'atar — that's breakfast in Amman, and it's breakfast here tomorrow.",
  "Jordan/deadseasalt": "Dead Sea salt. You float in that water whether you want to or not. I have a photograph of my feet sticking up to prove it.",
  "Namibia/hererodoll": "A Herero doll! That headdress is for the cattle, you know — a whole way of life in a hat. She'll stand by the window.",
  "Namibia/makalani": "A makalani nut, carved. Ivory that grows on a palm tree — I remember turning one over in my hand in Windhoek and not believing it.",
  "Namibia/karakulwool": "Karakul wool. Warm as anything. The desert gets cold at night, and so does this house.",
  "Cameroon/penjapepper": "Penja pepper! Grown in volcanic soil — you can taste it. This is going on everything.",
  "Cameroon/bamumprint": "The Bamum script! A king invented a whole alphabet for his people. I'll frame this and think about that every time I pass it.",
};
