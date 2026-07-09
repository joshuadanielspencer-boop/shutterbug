// ===========================================================================
// COUNTRY CULTURE — the human, living side of each place: how people say hello,
// and (once verified + reviewed) a photo of people in traditional dress.
//
// TWO parts:
//   • GREETING_MEANING — a short ENGLISH gloss for each greeting already in
//     locations.js (keyed by the exact greeting text). The greeting text,
//     language, and pronunciation are the verified per-location values; this
//     only adds "what it means" so the culture card can teach it fully.
//   • COUNTRY_PEOPLE — a freely-licensed photo of people in that country's
//     traditional/cultural dress, keyed by country. Each entry is added only
//     after the photo's licence is verified on Wikimedia Commons AND the choice
//     is reviewed for respectful, accurate representation (CLAUDE.md rule 2).
//     Empty until reviewed — the culture card simply omits the photo meanwhile.
//
// Meanings verified 2026-07 against general language references. Many greetings
// are literal ("Guten Tag" = "Good day"); some are idiomatic and glossed as
// such ("Namaste" ≈ "I bow to you"; "As-salamu alaykum" = "Peace be upon you").
// ===========================================================================

// English gloss for each greeting, keyed by the exact `greeting.text` used in
// src/data/locations.js. Shared greetings (e.g. "Hola") need only one entry.
export const GREETING_MEANING = {
  "Hallo": "Hello",
  "Maakye": "Good morning",
  "ሰላም (Selam)": "Hello (literally “peace”)",
  "السلام عليكم (As-salamu alaykum)": "Peace be upon you",
  "مرحبا (Marhaba)": "Hello / Welcome",
  "I ni ce": "Hello",
  "Halo": "Hello",
  "မင်္ဂလာပါ (Mingalaba)": "Hello (literally “may you have blessings”)",
  "你好 (Nei hou)": "Hello (literally “you good”)",
  "Dobar dan": "Good day",
  "Dobrý den": "Good day",
  "Goedendag": "Good day",
  "G'day": "Good day / Hello",
  "Hello": "Hello",
  "Kumusta": "Hello / How are you?",
  "Bonjour": "Good day / Hello",
  "Grüß Gott": "Good day (literally “God greet you”)",
  "Guten Tag": "Good day",
  "Γεια σας (Yia sas)": "Hello (literally “health to you”)",
  "Γεια σου (Yia sou)": "Hello (literally “health to you”)",
  "Aluu": "Hello",
  "Aloha": "Hello (and also love and affection)",
  "नमस्ते (Namaste)": "Hello (a respectful “I bow to you”)",
  "Halló": "Hello",
  "Selamat siang": "Good day",
  "Buongiorno": "Good day",
  "こんにちは (Konnichiwa)": "Hello / Good afternoon",
  "ជម្រាបសួរ (Chumreap suor)": "Hello (a formal, respectful greeting)",
  "Muraho": "Hello",
  "안녕하세요 (Annyeonghaseyo)": "Hello (literally “are you at peace?”)",
  "Salama": "Hello (literally “peace”)",
  "Selamat pagi": "Good morning",
  "你好 (Nǐ hǎo)": "Hello (literally “you good”)",
  "Kia ora": "Hello (literally “be well”)",
  "Сайн байна уу (Sain baina uu)": "Hello (literally “are you well?”)",
  "Namaste": "Hello (a respectful “I bow to you”)",
  "Hei": "Hi",
  "سلام (Salaam)": "Hello (literally “peace”)",
  "Olá": "Hello",
  "Iorana": "Hello",
  "Здравствуйте (Zdravstvuyte)": "Hello (a formal, polite greeting)",
  "Dumela": "Hello",
  "Mhoro": "Hello",
  "ආයුබෝවන් (Āyubōwan)": "Hello (literally “may you live long”)",
  "Hola": "Hello",
  "Jambo": "Hello",
  "Grüezi": "Hello / Good day",
  "Ia ora na": "Hello",
  "สวัสดี (Sawasdee)": "Hello",
  "Merhaba": "Hello",
  "السلام علیکم (Assalam-o-Alaikum)": "Peace be upon you",
  "Assalomu alaykum": "Peace be upon you",
  "Xin chào": "Hello",
  "Molo": "Hello",
};

// Freely-licensed photo of people in traditional/cultural dress, keyed by
// country name (as used in locations.js `country`). Shape mirrors a location
// `photo` plus a caption:
//   { src, source, credit, license, caption }
// POPULATED ONLY AFTER licence verification + human review (rule 2). Each src is
// a Wikimedia Commons Special:FilePath URL (?width caps the download); licences
// were re-verified against the Commons API and the choices reviewed for
// respectful, accurate representation before being added here.
export const COUNTRY_PEOPLE = {
  "Japan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/NagoyaFestival.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:NagoyaFestival.jpg",
    credit: "Petr Vodička", license: "CC BY-SA 4.0",
    caption: "Women wearing kimono at the Nagoya Festival, Japan",
  },
  "India": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Banjara_women_in_traditional_dress_30.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Banjara_women_in_traditional_dress_30.jpg",
    credit: "Govt. of Telangana, Dept. of Language & Culture", license: "CC BY-SA 4.0",
    caption: "Banjara women in traditional dress, Telangana, India",
  },
  "Mexico": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jarabe_Tapat%C3%ADo.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Jarabe_Tapat%C3%ADo.jpg",
    credit: "Mike.isilra", license: "CC BY-SA 4.0",
    caption: "Dancers perform the Jarabe Tapatío, Mexico's national dance",
  },
  "Peru": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pollera_de_Pomabamba.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Pollera_de_Pomabamba.jpg",
    credit: "Cbrescia", license: "CC BY-SA 4.0",
    caption: "The pollera dress of Pomabamba, in Peru's Áncash region",
  },
  "Kenya": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Maasai_woman%2C_Kenya.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Maasai_woman,_Kenya.jpg",
    credit: "Dr. Ondřej Havelka", license: "CC BY 4.0",
    caption: "A Maasai woman in traditional dress and beaded jewellery, Kenya",
  },
  "New Zealand": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Maori_men%27s_cultural_performance_group_%28AM_78261-1%29.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Maori_men%27s_cultural_performance_group_(AM_78261-1).jpg",
    credit: "T. W. Collins / Auckland War Memorial Museum", license: "CC BY 4.0",
    caption: "Māori men perform a haka (Auckland Museum, 1943)",
  },
};

// The English gloss for a greeting object (or null if none is known).
export const greetingMeaning = (greeting) =>
  (greeting && greeting.text && GREETING_MEANING[greeting.text]) || null;
