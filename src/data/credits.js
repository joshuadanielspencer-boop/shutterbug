// ===========================================================================
// CREDITS & LEGAL — what this game is made of, and who owns which part.
//
// This is DATA (rule 1): the component renders it and holds no wording of its own.
//
// It exists because most of what makes Shutterbug good is other people's work used
// under licences that REQUIRE credit. Wikimedia's CC BY and CC BY-SA photographs
// are not free-as-in-do-whatever: naming the photographer and the licence is a
// condition of using them at all. The per-photo ⓘ button already does that at the
// point of use; this page is the whole list in one place, which is what a licence
// audit, a school, or a parent would actually ask for.
//
// Every licence below was read off the shipped file rather than remembered — the
// software licences came from each package's own package.json.
//
// The photo COUNTS are computed from the data at load, never typed. The first draft
// of this file said "457 landmark photographs" and was wrong within the hour,
// because the same session went on to add seven places to Oceania. A number that
// has to be remembered is a number that will be wrong.
// ===========================================================================
import { LOCATIONS } from "./locations.js";
import { COUNTRY_PEOPLE } from "./culture.js";

const LANDMARK_PHOTOS = LOCATIONS.filter((l) => l.photo && l.photo.src).length;
const CULTURE_PHOTOS = Object.values(COUNTRY_PEOPLE)
  .flatMap((v) => (Array.isArray(v) ? v : [v]))
  .filter((p) => p && p.src).length;

// Kept as a constant so the footer, the page heading and any future export all
// say the same thing.
export const COPYRIGHT_HOLDER = "Lotus Creative Studios";
export const COPYRIGHT_YEAR = 2026;
export const COPYRIGHT_LINE = `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}`;

export const CREDIT_SECTIONS = [
  {
    id: "game",
    title: "The game itself",
    body:
      `Shutterbug — A World Photo Safari, and everything written or drawn for it, is ` +
      `${COPYRIGHT_LINE}. That covers the code, the characters — Uncle Jonah, Mr O and ` +
      `Pickles — the illustrated artwork, and every clue, fact and story written for the game.`,
    items: [],
  },
  {
    id: "maps",
    title: "Maps and geography",
    body:
      "Every coastline, border, river, lake and mountain in this game comes from Natural Earth, " +
      "a public-domain map dataset built by volunteer cartographers. It asks for no credit at " +
      "all; it gets this one anyway, because there would be no game without it.",
    items: [
      { name: "Natural Earth vector map data", detail: "country outlines, rivers, lakes, seas",
        license: "Public domain", url: "https://www.naturalearthdata.com/" },
      { name: "Natural Earth Cross-Blended Hypsometric Tints with Shaded Relief",
        detail: "the physical terrain on every continent and country map",
        license: "Public domain", url: "https://www.naturalearthdata.com/downloads/10m-raster-data/10m-cross-blend-hypso/" },
    ],
  },
  {
    id: "photos",
    title: "Photographs",
    body:
      "The landmark and culture photographs are the work of hundreds of photographers who " +
      "published them on Wikimedia Commons. Most are licensed CC BY or CC BY-SA, which means " +
      "crediting the photographer is a condition of use, not a courtesy — so every photograph " +
      "in the game carries an ⓘ button naming its photographer, its licence and a link to the " +
      "original. Photographs shared under a share-alike licence remain under that licence; they " +
      "are used here alongside this game's own work, not absorbed into it.",
    items: [
      { name: `${LANDMARK_PHOTOS} landmark photographs`, detail: "Wikimedia Commons contributors",
        license: "CC BY · CC BY-SA · CC0 · public domain", url: "https://commons.wikimedia.org/" },
      { name: `${CULTURE_PHOTOS} culture and traditional-dress photographs`, detail: "Wikimedia Commons contributors",
        license: "CC BY · CC BY-SA · CC0 · public domain", url: "https://commons.wikimedia.org/" },
    ],
  },
  {
    id: "money",
    title: "Money",
    body:
      "Which currency each country uses comes from the ISO 4217 register — the official list, " +
      "maintained by SIX Financial Information on behalf of the International Organization for " +
      "Standardization. The approximate exchange rates are a dated snapshot, not a live " +
      "converter: each one is rounded hard and the card says which month it was taken.",
    items: [
      { name: "ISO 4217 currency register", detail: "country, currency name and code",
        license: "Reference data", url: "https://www.six-group.com/en/products-services/financial-information/data-standards.html" },
      { name: "ExchangeRate-API (open.er-api.com)", detail: "approximate rates against the US dollar",
        license: "Free public endpoint", url: "https://www.exchangerate-api.com/" },
    ],
  },
  {
    id: "music",
    title: "Music",
    body:
      "Nearly all the music in Shutterbug was written for it — the opening jig, the homecoming " +
      "air, and the regional beds that play when you land somewhere. Six countries instead play " +
      "a real melody of their own, and every one of those is out of copyright. Where a tune could " +
      "not be sourced from a score it was left alone rather than reconstructed from memory.",
    items: [
      { name: "Ode to Joy", detail: "Germany · Ludwig van Beethoven, 1824", license: "Public domain" },
      { name: "Frère Jacques", detail: "France · traditional", license: "Public domain" },
      { name: "The Star-Spangled Banner", detail: "United States · John Stafford Smith, c. 1773", license: "Public domain" },
      { name: "Rule, Britannia!", detail: "United Kingdom · Thomas Arne, 1740", license: "Public domain" },
      { name: "La Cucaracha", detail: "Mexico · traditional", license: "Public domain" },
      { name: "Waltzing Matilda", detail: "Australia · traditional, 1895", license: "Public domain" },
    ],
  },
  {
    id: "software",
    title: "Software",
    body:
      "Shutterbug is built with open-source tools, each used under its own licence.",
    items: [
      { name: "React", detail: "the interface library", license: "MIT", url: "https://react.dev/" },
      { name: "Vite", detail: "the build tool", license: "MIT", url: "https://vitejs.dev/" },
      { name: "vite-plugin-pwa", detail: "makes the game installable and offline-capable", license: "MIT", url: "https://vite-pwa-org.netlify.app/" },
      { name: "Vitest", detail: "the test runner that guards the facts", license: "MIT", url: "https://vitest.dev/" },
      { name: "sharp", detail: "builds the map plates and the artwork", license: "Apache-2.0", url: "https://sharp.pixelplumbing.com/" },
      { name: "supabase-js", detail: "optional passport sync", license: "MIT", url: "https://supabase.com/" },
    ],
  },
  {
    id: "accuracy",
    title: "If something here is wrong",
    body:
      "This is a teaching game, so every fact and every foreign-language greeting in it was " +
      "checked against a source before it shipped, and anything that could not be verified was " +
      "left out rather than guessed. That is a standard, not a guarantee — if you find a mistake, " +
      "it is a bug worth reporting, and it will be fixed.",
    items: [],
  },
];
