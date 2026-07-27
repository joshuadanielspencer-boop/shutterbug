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
  "Merħba": "Welcome / Hello",
  "Kaselehlie": "Hello",
  "Hallo": "Hello",
  "Maakye": "Good morning",
  "ሰላም (Selam)": "Hello (literally “peace”)",
  "السلام عليكم (As-salamu alaykum)": "Peace be upon you",
  "مرحبا (Marhaba)": "Hello / Welcome",
  "I ni ce": "Hello",
  "Halo": "Hello",
  "Wah gwaan": "“What's going on?” — a casual hello",
  "Gud maanin": "Good morning",
  "Bonjou": "Good day / Hello",
  "Wha happenin": "“What's happening?” — a casual hello",
  "Gude": "Hello (from English “good day”)",
  "Nanga def": "How are you? (literally “what are you doing?”)",
  "How now?": "How are you? / What's up?",
  "Akwaba": "Welcome",
  "A fɔ́n ganji?": "Good morning (literally “did you wake up well?”)",
  "Mbote": "Hello",
  "Muli shani": "How are you?",
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
  "Cześć": "Hi",
  "¡Pura vida!": "“Pure life!” — Costa Rica's cheerful all-purpose greeting",
  "Dia duit": "Hello (literally “God be with you”)",
  "Sannu": "Hello",
  "Hej": "Hi",
  "Bula": "Hello (literally “life”)",
  "Oli otya": "How are you? (a hello)",
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
  "Сәлем (Sälem)": "Hello",
  "Jó napot": "Good day",
  "Bună ziua": "Hello / Good day",
  "عسلامة (Aslema)": "Hello",
  "আসসালামু আলাইকুম (Assalamu alaikum)": "Peace be upon you",
  "Mba'éichapa": "How are you? (the everyday Guaraní hello)",
};

// Freely-licensed photo of people in traditional/cultural dress, keyed by
// country name (as used in locations.js `country`). Shape mirrors a location
// `photo` plus a caption:
//   { src, source, credit, license, caption }
// POPULATED ONLY AFTER licence verification + human review (rule 2). Each src is
// a Wikimedia Commons Special:FilePath URL (?width caps the download); licences
// were re-verified against the Commons API and the choices reviewed for
// respectful, accurate representation before being added here.
// A country's entry is EITHER one card, or a LIST of up to three.
//
// Many countries are home to several peoples, and showing only one of them tells
// a child something false by omission — the United States is not only its Native
// nations, nor only its European or African-descended communities. Where that's
// true, the entry is a list and the arrival card rotates: a different people each
// time you land there, with the others a tap away. Where a country really is
// close to homogeneous (China is ~90% Han), one card is the honest answer, and
// the entry stays a single object.
//
// Read entries through peopleCards() below, never directly — it normalises both
// shapes to an array so callers don't have to care which they got.
export const COUNTRY_PEOPLE = {
  "Malta": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Maltese lady in vintage Ghonnella.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Maltese lady in vintage Ghonnella.jpg",
    credit: "Renata Apan", license: "CC BY-SA 4.0",
    caption: "A Maltese woman in the traditional għonnella, a hooded cloak once worn across Malta",
    // 5105x7369 — the tallest photo in the set, and the għonnella is a HOOD, so the
    // 16:9 crop cut off the very thing the picture is of. Same fix as Nicaragua; found
    // by auditing all 118 culture photos against their real dimensions, where these
    // two were the only portrait-orientation images missing the flag.
    portrait: true },
  "Micronesia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Folk Micronesian dance.png?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Folk Micronesian dance.png",
    credit: "Bruce Elias Robert", license: "CC BY 4.0",
    caption: "Dancers in traditional dress at a folk celebration in Micronesia" },

  "Japan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/NagoyaFestival.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:NagoyaFestival.jpg",
    credit: "Petr Vodička", license: "CC BY-SA 4.0",
    caption: "Women wearing kimono at the Nagoya Festival, Japan",
  },
  "India": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Banjara_women_in_traditional_dress_30.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Banjara_women_in_traditional_dress_30.jpg",
    credit: "Govt. of Telangana, Dept. of Language & Culture", license: "CC BY-SA 4.0",
    caption: "Banjara women in traditional dress, Telangana, India",
  },
  "Mexico": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jarabe_Tapat%C3%ADo.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Jarabe_Tapat%C3%ADo.jpg",
    credit: "Mike.isilra", license: "CC BY-SA 4.0",
    caption: "Dancers perform the Jarabe Tapatío, Mexico's national dance",
  },
  "Peru": {
    // Was a pollera skirt hanging on a washing line — a garment, with nobody in it.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Amerindian_girl_in_her_traditional_clothes.png?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Amerindian_girl_in_her_traditional_clothes.png",
    credit: "Rafael Estrella", license: "CC BY-SA 2.5",
    caption: "A girl in traditional Andean dress — an embroidered hat and a woven shawl — with llamas in Peru",
  },
  "Kenya": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20Kikuyu%20Women%20Dancers.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Traditional_Kikuyu_Women_Dancers.jpg",
    credit: "Isiyekala", license: "CC BY-SA 4.0",
    caption: "Kikuyu women dancers in traditional dress with cowrie-shell headbands, Kenya",
  },
  "New Zealand": [
    {
      // Was a 1943 black-and-white group shot taken from so far back that no face
      // read at all — the exact thing this card exists to show. This one is close
      // enough to see the performer's tā moko.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Maori_performer.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Maori_performer.jpg",
      credit: "Unknown", license: "Public domain",
      people: "Māori",
      caption: "A Māori performer in a piupiu and feather cloak, near Rotorua, New Zealand",
      portrait: true,
    },
    {
      // Was the same Polyfest photographed from the back of the hall. Same
      // photographer, same 2015 festival, one dancer close enough to see.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/St_Cuthbert's_College_at_ASB_Polyfest._(POLY-D-2015-318).jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:St_Cuthbert's_College_at_ASB_Polyfest._(POLY-D-2015-318).jpg",
      credit: "Smita Biswas", license: "CC BY 4.0",
      people: "Samoan New Zealander",
      caption: "A student dances the Samoan taualuga at Auckland's ASB Polyfest, wearing the tuiga headdress",
    },
  ],

  // ---- Africa (reviewed batch) ------------------------------------------
  "Egypt": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D8%B1%D9%82%D8%B5%20%D9%81%D9%84%D9%83%D9%84%D9%88%D8%B1%20%D9%86%D9%88%D8%A8%D9%89%20-%20%D9%85%D8%B5%D8%B1.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%D8%B1%D9%82%D8%B5_%D9%81%D9%84%D9%83%D9%84%D9%88%D8%B1_%D9%86%D9%88%D8%A8%D9%89_-_%D9%85%D8%B5%D8%B1.jpg",
    credit: "Mohamed kamal 1984", license: "CC BY-SA 4.0",
    caption: "Nubian folk dancers in traditional dress, Egypt",
  },
  "Morocco": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Women_group_in_Traditional_festival_in_Ouarzazate%2C_Morocco_1_by_Brahim_FARAJI.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Women_group_in_Traditional_festival_in_Ouarzazate%2C_Morocco_1_by_Brahim_FARAJI.jpg",
    credit: "Brahim FARAJI", license: "CC BY-SA 4.0",
    caption: "Moroccan women in bright traditional dress at a festival in Ouarzazate",
  },
  "Ethiopia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Habesha_woman-b.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Habesha_woman-b.jpg",
    credit: "msafari2425", license: "CC BY 2.0",
    caption: "An Ethiopian woman in a habesha kemis performs a cultural dance",
  },
  "Ghana": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghanaian_women_in_Kente_cloth_and_beads.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Ghanaian_women_in_Kente_cloth_and_beads.jpg",
    credit: "Pambelle12", license: "CC BY-SA 4.0",
    caption: "A woman in Ghana wears bright kente cloth and beads",
  },
  "South Africa": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ndebele_woman.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Ndebele_woman.jpg",
      credit: "Steve Evans", license: "CC BY 3.0",
      people: "Ndebele",
      caption: "An Ndebele woman of South Africa in traditional beaded neck rings",
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Xhosa_traditionally_dressed_women.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Xhosa_traditionally_dressed_women.jpg",
      credit: "Mike Barwood", license: "CC BY-SA 2.0",
      people: "Xhosa",
      caption: "Xhosa women in traditional dress, one wearing a head-scarf of indigo shweshwe cloth",
    },
    {
      // Was a distant group. Smaller source than most here (604px), but it is the
      // closest free photo of Zulu beadwork with faces in it, and the card renders
      // well under 604px wide.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Song_and_Dance_2.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Song_and_Dance_2.jpg",
      credit: "MduKhanyile", license: "CC BY-SA 4.0",
      people: "Zulu",
      caption: "Zulu women in beaded dress and isicholo hats at a song and dance gathering, South Africa",
    },
  ],
  "Tanzania": {
    // Was one person photographed from behind. Losing the kanga is a real loss — the
    // Swahili sayings printed on them are a good fact — but every freely-licensed kanga
    // photo on Commons is either a market stall of folded cloth or a distant figure.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/2005-04-20_Masai_(Maasai)_youths.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:2005-04-20_Masai_(Maasai)_youths.jpg",
    credit: "Kevin Walsh", license: "CC BY 2.0",
    caption: "Maasai young men in red shúkà cloth and beaded collars at the rim of the Ngorongoro Crater, Tanzania",
  },
  "Namibia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Herero%20lady%20%285%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Herero_lady_(5).jpg",
    credit: "Ji-Elle", license: "CC BY-SA 4.0",
    caption: "A Herero woman in the traditional horn-shaped headdress (otjikaiva) and Victorian-style dress, Namibia",
  },
  "Rwanda": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bride_in_Rwanda_traditional_wedding.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Bride_in_Rwanda_traditional_wedding.jpg",
    credit: "Claude Nizeyimana", license: "CC BY-SA 4.0",
    caption: "Women in Rwanda wear the mushanana, a sash draped over one shoulder, at a wedding",
  },
  "Mali": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/ASC%20Leiden%20-%20F.%20van%20der%20Kraaij%20Collection%20-%2019%20-%20032%20-%20Huit%20chanteuses%20traditionnelles%20v%C3%AAtues%20de%20blanc%20r%C3%A9pr%C3%A9sentent%20S%C3%A9gou%20-%201%20-%20Tominian%2C%20R%C3%A9gion%20de%20S%C3%A9gou%2C%20Mali%2C%201972.tiff?width=800",
    source: "https://commons.wikimedia.org/wiki/File:ASC_Leiden_-_F._van_der_Kraaij_Collection_-_19_-_032_-_Huit_chanteuses_traditionnelles_v%C3%AAtues_de_blanc_r%C3%A9pr%C3%A9sentent_S%C3%A9gou_-_1_-_Tominian,_R%C3%A9gion_de_S%C3%A9gou,_Mali,_1972.tiff",
    credit: "Fred van der Kraaij", license: "CC BY-SA 4.0",
    caption: "Women singers in white traditional dress at a gathering in the Ségou region, Mali (1972)",
  },
  "Algeria": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dance%20naili%20a%20Bousaada%20%283%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Dance_naili_a_Bousaada_(3).jpg",
    credit: "Dezedien", license: "CC BY-SA 4.0",
    caption: "Musicians in traditional robes and turbans at a folk dance celebration in Bou Saâda, Algeria",
  },
  "Botswana": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Folk_dance_troupe_3.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Folk_dance_troupe_3.jpg",
    credit: "Mompati Dikunwane", license: "CC BY-SA 4.0",
    caption: "Dancers in traditional Setswana dress at Botswana's Domboshaba Cultural Festival",
  },
  "Zimbabwe": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mbende%20Dance.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Mbende_Dance.jpg",
    credit: "Fidelis Manyange", license: "CC BY-SA 4.0",
    caption: "Dancers performing the Mbende Jerusarema, a traditional Shona dance, in Murewa, Zimbabwe",
  },
  "Madagascar": {
    // Was a hira gasy troupe shot from across the crowd. Losing the hira gasy is a
    // pity, but no close free photo of one exists; this is the Antandroy of the south.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Antandroy_tribu_au_Sud_de_Madagascar.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Antandroy_tribu_au_Sud_de_Madagascar.jpg",
    credit: "Tojosoa Raherinirainy", license: "CC BY-SA 4.0",
    caption: "Women in traditional Antandroy dress at a festival in southern Madagascar",
  },
  "Sudan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%C2%A9SUD2018-Sari%20Omer%20-0061.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%C2%A9SUD2018-Sari_Omer_-0061.jpg",
    credit: "Sari Omer", license: "CC BY-SA 4.0",
    caption: "Sudanese women in colorful toub celebrating together, Darfur, Sudan",
  },

  // ---- Asia (reviewed batch; Japan & India in the pilot above) ----------
  "China": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%E6%9B%B2%E9%98%9C%E5%B8%AB%E7%AF%84%E5%A4%A7%E5%AD%A6%E3%81%AE%E7%8C%97%E8%98%AD%E9%83%A8%E3%81%AE%E8%8A%B1%E6%9C%9D%E7%A5%AD%E3%82%8A%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E9%83%A8%E6%B4%BB.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%E6%9B%B2%E9%98%9C%E5%B8%AB%E7%AF%84%E5%A4%A7%E5%AD%A6%E3%81%AE%E7%8C%97%E8%98%AD%E9%83%A8%E3%81%AE%E8%8A%B1%E6%9C%9D%E7%A5%AD%E3%82%8A%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E9%83%A8%E6%B4%BB.jpg",
    credit: "Allervous", license: "CC BY-SA 4.0",
    caption: "Young people wearing hanfu at a Huazhao (Flower Festival) gathering in China",
  },
  "South Korea": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Korea%20Spring%20of%20Insadong%2010%20%2813326749133%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Korea_Spring_of_Insadong_10_(13326749133).jpg",
    credit: "Korea.net / Korean Culture and Information Service (Jeon Han)", license: "CC BY-SA 2.0",
    caption: "Women in colorful hanbok at the Insadong hanbok parade in Seoul, South Korea",
  },
  "Thailand": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/4%20Couple%20in%20traditional%20thai%20dress.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:4%20Couple%20in%20traditional%20thai%20dress.jpg",
    credit: "Helloerror", license: "CC BY-SA 4.0",
    caption: "A couple in chut thai, the woman's golden silk sabai draped across one shoulder",
  },
  "Vietnam": {
    // Was a line of women photographed from too far back to read a face.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%81o_d%C3%A0i_(26282428400)_(cropped).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%C3%81o_d%C3%A0i_(26282428400)_(cropped).jpg",
    credit: "Joe Le Merou", license: "CC BY 2.0",
    caption: "A woman in the áo dài, Vietnam's national dress, in Ho Chi Minh City",
  },
  "Nepal": {
    // Was a line-up photographed end-on, every face a smudge.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Messe-85.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Messe-85.JPG",
    credit: "Sigismund von Dobschütz", license: "CC BY-SA 3.0",
    caption: "Dancers in Nepal in red and gold festival dress and jewelled headpieces",
  },
  "Indonesia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Girls%20in%20traditional%20Hindu%20dress%20in%20Bali%20Indonesia.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Girls%20in%20traditional%20Hindu%20dress%20in%20Bali%20Indonesia.jpg",
    credit: "VasenkaPhotography", license: "CC BY 2.0",
    caption: "Girls in Bali in traditional Balinese dress for a Hindu ceremony",
  },
  "Cambodia": {
    // Was the same dance in Siem Reap, small in the frame and lit from behind.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Apsara_dancers_Siem_Reap_20091118_03.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Apsara_dancers_Siem_Reap_20091118_03.jpg",
    credit: "Viguent", license: "CC BY-SA 4.0",
    caption: "A Khmer classical dancer in a golden Apsara crown, Siem Reap, Cambodia",
  },
  "Myanmar": {
    // Was a stadium mass-display: thousands of dancers, each about four pixels tall.
    // Same photographer, same Thingyan in Mandalay, one dancer close enough to meet.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Burma_Dance.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Burma_Dance.JPG",
    credit: "Htoo Tay Zar", license: "CC BY-SA 3.0",
    caption: "A student in Burmese dress dances at the opening of the Thingyan water festival, Mandalay",
  },
  "Iran": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Iran%20IMG%209821%20Iran%20%2816778393900%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Iran_IMG_9821_Iran_(16778393900).jpg",
    credit: "Ninara", license: "CC BY 2.0",
    caption: "Qashqai men performing a traditional stick dance at a celebration, Iran",
  },
  "Jordan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jordanian%20Bedouin%20Arab%20Men.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Jordanian%20Bedouin%20Arab%20Men.jpg",
    credit: "Mr Masri", license: "CC0",
    caption: "Bedouin men in Jordan in the red-and-white shemagh headscarf and long robes",
  },
  "Pakistan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Schoolgirls%20in%20Shalwar%20Kameez%2C%20Abbotabad%20Pakistan%20-%20UK%20International%20Development.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Schoolgirls%20in%20Shalwar%20Kameez%2C%20Abbotabad%20Pakistan%20-%20UK%20International%20Development.jpg",
    credit: "Vicki Francis / UK DFID", license: "CC BY 2.0",
    caption: "Girls in Abbottabad in Pakistan's national dress: white shalwar trousers and blue kameez shirt",
  },
  "Philippines": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Groomsmen%20wearing%20barong%20tagalog%20at%20a%20wedding.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Groomsmen%20wearing%20barong%20tagalog%20at%20a%20wedding.jpg",
    credit: "Ron Bulovs", license: "CC BY 2.0",
    caption: "Men in the barong tagalog, an embroidered Filipino dress shirt, at a wedding",
  },
  "Russia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Russian%20folk%20folkloric%20ensemble%20RASPEV%20%28chant%29%20will%20be%20performing%20in%202021%20in%20the%20Museum-Reservation%20of%20the%20Manor%20%22Muranovo%22%2C%20named%20after%20Fyodor%20Ivanovich%20Tyutchev.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:The_Russian_folk_folkloric_ensemble_RASPEV_(chant)_will_be_performing_in_2021_in_the_Museum-Reservation_of_the_Manor_%22Muranovo%22,_named_after_Fyodor_Ivanovich_Tyutchev.jpg",
    credit: "WikiMaxChe", license: "CC BY-SA 4.0",
    caption: "The RASPEV folk ensemble in sarafans and headscarves at a folk festival near Moscow",
  },
  "Saudi Arabia": {
    // Was the same dance shot from far enough back that the picture was really of the
    // At-Turaif fort at night, with figures the size of pixels along the bottom.
    // Freely-licensed close-up Saudi photos are thin on Commons; this is a 2014 Saudi
    // Press Agency frame, so the row includes King Salman — see the audit doc.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D8%A7%D9%84%D9%85%D9%84%D9%83_%D8%B3%D9%84%D9%85%D8%A7%D9%86_%D8%A8%D9%86_%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2_%D8%A2%D9%84_%D8%B3%D8%B9%D9%88%D8%AF_%D9%8A%D8%A4%D8%AF%D9%8A_%D8%A7%D9%84%D8%B9%D8%B1%D8%B6%D8%A9_%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%D8%A7%D9%84%D9%85%D9%84%D9%83_%D8%B3%D9%84%D9%85%D8%A7%D9%86_%D8%A8%D9%86_%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2_%D8%A2%D9%84_%D8%B3%D8%B9%D9%88%D8%AF_%D9%8A%D8%A4%D8%AF%D9%8A_%D8%A7%D9%84%D8%B9%D8%B1%D8%B6%D8%A9_%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9.jpg",
    credit: "Saudi Press Agency", license: "CC BY-SA 4.0",
    caption: "Men in thobe and ghutra, swords in hand, performing the Ardha — the Najdi sword dance of Saudi Arabia",
  },
  "Turkey": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Turkish%20folk%20dancers%20(1085290934).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Turkish%20folk%20dancers%20(1085290934).jpg",
    credit: "allen watkin", license: "CC BY-SA 2.0",
    caption: "Dancers perform a traditional Turkish folk dance in bright regional costumes",
  },
  "United Arab Emirates": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ayyala.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Ayyala.jpg",
    credit: "Rashed AlSumaiti", license: "CC BY-SA 4.0",
    caption: "Emirati men in kandura performing Al Ayyala, a traditional stick dance, in the UAE",
  },
  "Uzbekistan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Navruz%20Dance%20in%20the%20Spring%20Whirlwind.png?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Navruz_Dance_in_the_Spring_Whirlwind.png",
    credit: "Canontsigan", license: "CC BY-SA 4.0",
    caption: "Women in atlas silk ikat dress dancing and playing doira drums at a Navruz celebration in Bukhara",
  },
  "Sri Lanka": {
    // Was the same kind of dancers, all facing away from the camera.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kandy_Dance_(6493011161).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Kandy_Dance_(6493011161).jpg",
    credit: "Arian Zwegers", license: "CC BY 2.0",
    caption: "A Kandyan dancer in the silver headdress and beaded breastplate of the ves costume, Kandy, Sri Lanka",
  },
  "Taiwan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ilisin%20-%20Young%20Girls%20Singing.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Ilisin_-_Young_Girls_Singing.jpg",
    credit: "Kevshen", license: "CC BY-SA 4.0",
    caption: "Young Amis women in traditional dress sing at the Ilisin harvest festival in eastern Taiwan",
  },
  "Singapore": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kebaya%201.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Kebaya%201.jpg",
    credit: "Jamieson Teo", license: "CC BY-SA 2.0",
    caption: "Peranakan (Nyonya) ladies in Singapore in the kebaya, an embroidered blouse over a batik sarong",
  },
  "Mongolia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Przed%20rozpocz%C4%99ciem%20lokalnego%20festiwalu%20Naadam%20(06).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Przed%20rozpocz%C4%99ciem%20lokalnego%20festiwalu%20Naadam%20(06).jpg",
    credit: "Marcin Konsek", license: "CC BY-SA 4.0",
    caption: "Men wearing the deel — Mongolia's traditional robe — before a Naadam festival",
  },

  // ---- Europe (reviewed batch; Russia & Turkey are in the Asia batch above) ----
  "United Kingdom": {
    // Was a pipe band photographed entirely from behind — a wall of backs and bonnets.
    // Same subject, marching towards the camera this time.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bagpiper_march_in_Edinburgh_-_geograph.org.uk_-_8282339.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Bagpiper_march_in_Edinburgh_-_geograph.org.uk_-_8282339.jpg",
    credit: "Lucas Kendall", license: "CC BY-SA 2.0",
    caption: "A Scottish pipe band in kilts and blue balmorals marching through Edinburgh",
  },
  "France": {
    // Was the same festival shot from the back of a very large crowd on stadium steps.
    // Same photographer, same Pays d'Arles costume, two faces instead of two hundred.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/2014_F%C3%AAte_des_Gardians_14.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:2014_F%C3%AAte_des_Gardians_14.jpg",
    credit: "Finoskov", license: "CC BY-SA 4.0",
    caption: "Women of the Pays d'Arles in traditional Arlésienne dress at the Fête des Gardians, Arles, Provence",
  },
  "Italy": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Women%20of%20sardinia.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Women%20of%20sardinia.jpg",
    credit: "Cristiano Cani", license: "CC BY 2.0",
    caption: "Women of Sardinia in their bright, hand-embroidered village costumes for a festival",
  },
  "Greece": {
    // Was Evzone guards at the Tomb of the Unknown Soldier, faces small and in
    // profile under the fez. A tall source (4480x6720), but the 16:9 crop lands on
    // the face, so it does NOT set `portrait: true` — the crop IS the close-up.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Young_Greek_Folk_Dancer_in_Traditional_Costume_Studio_Portrait.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Young_Greek_Folk_Dancer_in_Traditional_Costume_Studio_Portrait.jpg",
    credit: "Redhatstudiophotography", license: "CC BY-SA 4.0",
    caption: "A young Greek folk dancer in traditional costume, photographed at a Greek festival",
  },
  "Germany": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/005%20Trachtenumzug%20Feldmoching.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:005%20Trachtenumzug%20Feldmoching.JPG",
    credit: "Usien", license: "CC BY-SA 3.0",
    caption: "A Bavarian folk group at the Munich costume parade, men in lederhosen and a woman in a dirndl",
  },
  "Spain": {
    // Was the same Feria, same photographer, but every woman had her back to the lens.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/19683460325_d6db6d6cc0_o_feria_abril_2011.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:19683460325_d6db6d6cc0_o_feria_abril_2011.jpg",
    credit: "Sevilla Congress & Convention Bureau", license: "CC BY-SA 2.0",
    caption: "Women in the ruffled traje de flamenca, flowers in their hair, at Seville's April Fair",
  },
  "Portugal": {
    // Was a night shot of a square full of figures the size of grains of rice.
    // Filename is a camera default; the photo's own coordinates put it in Braga.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/00100dPORTRAIT_00100_BURST20181118161200471_COVER.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:00100dPORTRAIT_00100_BURST20181118161200471_COVER.jpg",
    credit: "PolinaSol", license: "CC BY-SA 4.0",
    caption: "Musicians in traditional costume at a November chestnut festival in Braga, northern Portugal",
  },
  "Netherlands": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marken%20Klederdracht%20IMG0022.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Marken%20Klederdracht%20IMG0022.jpg",
    credit: "Hnapel", license: "CC BY-SA 4.0",
    caption: "A man and woman from Marken in traditional Easter klederdracht, with a white lace cap",
    portrait: true, // no free landscape photo of this dress exists — show it whole
  },
  "Belgium": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/0%20Binche%20-%20Les%20Gilles%20le%20jour%20du%20mardi%20gras%20(1).JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:0%20Binche%20-%20Les%20Gilles%20le%20jour%20du%20mardi%20gras%20(1).JPG",
    credit: "Jean-Pol GRANDMONT", license: "CC BY-SA 3.0",
    caption: "Gilles of Binche in tall ostrich-feather hats on the last day of their famous carnival",
  },
  "Switzerland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/March%C3%A9-Concours%202019%2C%20Bild%203.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:March%C3%A9-Concours%202019%2C%20Bild%203.jpg",
    credit: "PaterMcFly", license: "CC BY 4.0",
    caption: "A Swiss folk group in the red-and-yellow Appenzell Tracht at a festival",
  },
  "Austria": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Lindwurm%20Klagenfurt%2C%20Volkstanzgruppe%20aus%20K%C3%A4rnten.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Lindwurm%20Klagenfurt%2C%20Volkstanzgruppe%20aus%20K%C3%A4rnten.jpg",
    credit: "Naturpuur", license: "CC BY 4.0",
    caption: "A Carinthian folk-dance group in traditional dirndls and Tracht in Klagenfurt",
  },
  "Czechia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hor%C3%A1cko%20national%20costumes%20of%20Baudy%C5%A1%20group%20in%20T%C5%99eb%C3%AD%C4%8D%2C%20T%C5%99eb%C3%AD%C4%8D%20District.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Hor%C3%A1cko_national_costumes_of_Baudy%C5%A1_group_in_T%C5%99eb%C3%AD%C4%8D%2C_T%C5%99eb%C3%AD%C4%8D_District.jpg",
    credit: "Frettie", license: "CC BY-SA 3.0",
    caption: "Dancers of the Baudyš group in Horácko folk costume (kroj) at Třebíč, Czechia",
  },
  "Croatia": {
    // Was a long brick wall of Sisak fortress with three figures the size of thumbnails
    // at the foot of it. Same photographer, same Posavina costume, faces this time.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/PosavinaCostumes.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:PosavinaCostumes.jpg",
    credit: "Veronikablg", license: "CC BY-SA 4.0",
    caption: "A young man and woman in the red-and-white folk costume of Croatia's Posavina region",
  },
  "Iceland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/All%20Dressed%20Up%20(5847023926).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:All%20Dressed%20Up%20(5847023926).jpg",
    credit: "Helgi Halldórsson", license: "CC BY-SA 2.0",
    caption: "A woman in Iceland's national costume, the þjóðbúningur, on National Day",
  },
  "Norway": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Trondheim%20bunad%20May%2017.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Trondheim%20bunad%20May%2017.jpg",
    credit: "Sigmund", license: "CC BY 2.0",
    caption: "Two friends wear their Trøndelag bunad to celebrate Norway's National Day, 17 May",
  },

  // ---- Americas & Oceania (reviewed batch; Mexico/Peru/New Zealand in the pilot) ----
  "Guatemala": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ixil%20young%20woman%20with%20ceremonial%20dress.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Ixil%20young%20woman%20with%20ceremonial%20dress.jpg",
    credit: "Sigrid Marisol Aguilar Jocol", license: "CC BY-SA 4.0",
    caption: "A young Ixil Maya woman in her people's colorful ceremonial dress, in Guatemala's highlands",
    portrait: true, // no free landscape photo of this dress exists — show it whole
  },
  "Panama": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Empollerada%20de%20Panam%C3%A1.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Empollerada%20de%20Panam%C3%A1.jpg",
    credit: "Ayaita", license: "CC BY-SA 3.0",
    caption: "A woman wears Panama's national dress, the pollera, at a folk festival",
  },
  "Cuba": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bailarines%20de%20rumba%20cubana%20en%20la%20plaza%20de%20los%20trabajadores%20de%20Camag%C3%BCey%2C%20Cuba.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Bailarines%20de%20rumba%20cubana%20en%20la%20plaza%20de%20los%20trabajadores%20de%20Camag%C3%BCey%2C%20Cuba.jpg",
    credit: "Manuel Díaz Reyes", license: "CC BY-SA 4.0",
    caption: "Dancers perform Cuba's lively rumba in a public square in Camagüey",
  },
  "Greenland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Greenland%201999%20(01).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Greenland%201999%20(01).jpg",
    credit: "Vadeve", license: "Public domain",
    caption: "Young women in Greenland's kalaallisuut, with beaded collars and tall white sealskin boots",
  },
  "Canada": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dancer%20on%20Pow-Wow%202016%20in%20Wendake%2C%20Quebec%2C%20Canada.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Dancer%20on%20Pow-Wow%202016%20in%20Wendake%2C%20Quebec%2C%20Canada.jpg",
      credit: "Marc Lautenbacher", license: "CC BY-SA 4.0",
      people: "First Nations",
      caption: "A First Nations dancer in traditional regalia at the powwow in Wendake, Quebec",
      portrait: true, // no free landscape photo of this dress exists — show it whole
    },
    {
      // Was dark and blurred. Same tradition, daylight, faces readable.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Drumdance_Meliadine_3_1995-06-22.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Drumdance_Meliadine_3_1995-06-22.jpg",
      credit: "Ansgar Walk", license: "CC BY-SA 2.5",
      people: "Inuit",
      caption: "Inuit drum dancers in parka and amauti by the Meliadine River, Nunavut, Canada",
    },
  ],
  // The United States is the clearest case for rotating cards: a single photo of
  // any one of its peoples would misrepresent the country. These three are a floor,
  // not a full account — Hispanic/Latino and Asian American communities are each
  // larger than several of the countries in this game, and belong here too.
  // All three files licence-checked via the Commons API (scripts/commons.mjs).
  "United States": [
    {
      // Was jingle dancers photographed from behind. The jingle dress goes with them —
      // every free front-on jingle photo was distant or in a museum case — so the
      // caption follows the new photo: Lakota shawl dancers, not Assiniboine Sioux.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Lakota_girl.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Lakota_girl.jpg",
      credit: "Neeta Lind", license: "CC BY 2.0",
      people: "Native American",
      caption: "A young Lakota shawl dancer in a beaded breastplate, taking a break at a powwow",
    },
    {
      // Was a marching band too far down the street to see anyone. This one is from
      // Galveston, which is where the holiday itself comes from.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Galveston_Juneteenth_Parade_and_Celebration_6-19-25_-_13.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Galveston_Juneteenth_Parade_and_Celebration_6-19-25_-_13.jpg",
      credit: "2C2KPhotography", license: "CC BY 4.0",
      people: "African American",
      caption: "The Juneteenth parade in Galveston, Texas — the city where, on 19 June 1865, the order freeing the state's enslaved people was read out",
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/2005_Tacoma_Highland_Games.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:2005_Tacoma_Highland_Games.jpg",
      credit: "James F. Perry", license: "CC BY-SA 3.0",
      people: "Scottish American",
      caption: "The parade of clans at the Tacoma Highland Games in Washington — one of many festivals where Americans of European descent keep an old country's dress and music alive",
    },
  ],
  "Argentina": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/San%20Antonio%20de%20Areco-Fiesta%20de%20la%20Tradici%C3%B3n%2011.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:San%20Antonio%20de%20Areco-Fiesta%20de%20la%20Tradici%C3%B3n%2011.jpg",
    credit: "AnselmoesMaciel", license: "CC BY-SA 4.0",
    caption: "Argentine gauchos in hats, ponchos and boots ride at the yearly Festival of Tradition",
  },
  "Bolivia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Aymara%20Women%2C%20El%20Alto%2C%20Bolivia%20(2173402729).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Aymara%20Women%2C%20El%20Alto%2C%20Bolivia%20(2173402729).jpg",
    credit: "Pedro Szekely", license: "CC BY 2.0",
    caption: "Aymara women in El Alto in the traditional pollera skirt and bowler hat",
    portrait: true, // no free landscape photo of this dress exists — show it whole
  },
  "Brazil": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Baiana%20em%20desfile%20de%202%20de%20Julho%20em%20S%C3%A3o%20F%C3%A9lix.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Baiana%20em%20desfile%20de%202%20de%20Julho%20em%20S%C3%A3o%20F%C3%A9lix.jpg",
      credit: "ExpressaoSAMPA", license: "CC BY-SA 4.0",
      people: "Afro-Brazilian",
      caption: "A woman in the Baiana dress of Bahia — white lace blouse, headwrap and full floral skirt",
      portrait: true, // no free landscape photo of this dress exists — show it whole
    },
    {
      // Was the CONFERENCE BANNER behind him — a sheet of printed text, not a face.
      // Same man, photographed close: chief Akiaboro in the Kayapó feather headdress.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Cacique_Caiap%C3%B3_Akiaboro.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Cacique_Caiap%C3%B3_Akiaboro.jpg",
      credit: "Renato Araújo / Agência Brasil", license: "CC BY 3.0 BR",
      people: "Indigenous (Kayapó)",
      caption: "Chief Akiaboro, a leader of the Kayapó people, in the feather headdress of his village",
    },
  ],
  "Chile": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20dress%20of%20the%20Chilean%20cueca%2C%20a%20national%20dance.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Traditional%20dress%20of%20the%20Chilean%20cueca%2C%20a%20national%20dance.jpg",
    credit: "Quilicura", license: "CC BY-SA 4.0",
    caption: "Dancers in huaso and china dress perform the cueca, Chile's national dance",
  },
  "Colombia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bailadoras%20de%20Cumbia.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Bailadoras%20de%20Cumbia.jpg",
    credit: "Luis Pérez", license: "CC BY 2.0",
    caption: "Women dance the cumbia in flowing pollera skirts at a folk festival in San Pelayo",
  },
  "Ecuador": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Otavalo%20%2867829745%29.jpeg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Otavalo_(67829745).jpeg",
    credit: "Miguel Murillo", license: "CC BY 3.0",
    caption: "A Kichwa Otavalo woman in a traditional shawl and coral beads, Ecuador",
  },
  "Venezuela": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pareja%20bailando%20joropo%20llanero%20(Puro).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Pareja%20bailando%20joropo%20llanero%20(Puro).jpg",
    credit: "Simplemente Venezuela", license: "CC BY-SA 4.0",
    caption: "A couple dances the joropo as harp, cuatro and maracas play",
  },
  "Guyana": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Guyana%20dance%202002%2011%2023.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Guyana%20dance%202002%2011%2023.jpg",
    credit: "EsAvila", license: "CC BY-SA 4.0",
    caption: "Macushi people of Guyana dance in fibre skirts and feathered headdresses",
  },
  "Australia": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Boigu%20dance.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Boigu%20dance.jpg",
      credit: "u-turn77", license: "CC BY 2.0",
      people: "Torres Strait Islander",
      caption: "A Torres Strait Islander dancer in a feathered dhari headdress and woven grass cape",
      portrait: true, // no free landscape photo of this dress exists — show it whole
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/1st_Brigade_welcomes_Marines_to_Australia_150422-M-BL930-533.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:1st_Brigade_welcomes_Marines_to_Australia_150422-M-BL930-533.jpg",
      credit: "Cpl. Angel Serna", license: "Public domain",
      people: "Aboriginal Australian",
      caption: "Aboriginal Australian men perform traditional music and dance at a Welcome to Country ceremony near Darwin",
    },
  ],
  "French Polynesia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Danse%20Heiva%202014-3424.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Danse%20Heiva%202014-3424.jpg",
    credit: "Anne-Laure Lépine", license: "CC BY-SA 4.0",
    caption: "A dance troupe performs in grass skirts and feathered headdresses at the Heiva i Tahiti festival",
  },
  "Vanuatu": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vanuatu-humans-of-vanuatu-2.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Vanuatu-humans-of-vanuatu-2.jpg",
    credit: "Graham Crumb / Imagicity.com", license: "CC BY-SA 3.0",
    caption: "Ni-Vanuatu women dance in woven fibre tops and grass skirts, tapping bamboo poles to the beat",
  },

  // ---- Countries added after the original pipeline (landscape, reviewed) ----
  "Belize": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Garifuna%20dancers%20in%20Dangriga%2C%20Belize.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Garifuna_dancers_in_Dangriga,_Belize.jpg",
    credit: "Rick Goldman", license: "CC BY-SA 2.0",
    caption: "Garifuna women dancing in traditional dress in Dangriga, Belize",
  },
  "Costa Rica": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dances%20-%20Tortuguero%20-%20Costa%20Rica.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Dances_-_Tortuguero_-_Costa_Rica.jpg",
    credit: "Mimostralia", license: "CC BY-SA 4.0",
    caption: "Young folk dancers in colorful traje típico at Tortuguero, Costa Rica",
  },
  "Haiti": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kanaval%20in%20Jacmel%20Haiti%202014%2018.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Kanaval_in_Jacmel_Haiti_2014_18.jpg",
    credit: "HOPE Art", license: "CC BY 2.0",
    caption: "Costumed masqueraders in papier-mâché animal masks and satin robes at the Jacmel Kanaval, Haiti",
  },
  "Honduras": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mujeres%20traje%20t%C3%ADpico%20Honduras.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Mujeres_traje_típico_Honduras.jpg",
    credit: "HDickerman79", license: "CC BY-SA 4.0",
    caption: "Dancers in Honduran folk dress (traje típico) at a festival",
  },
  "Jamaica": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/John%20Canoe%20Dancers%20Jamaica%201975%20Dec%20ver06.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:John_Canoe_Dancers_Jamaica_1975_Dec_ver06.jpg",
    credit: "WikiPedant (Gary J. Wood)", license: "CC BY-SA 4.0",
    caption: "Jonkonnu (John Canoe) masqueraders in costume at Christmas in Kingston, Jamaica",
  },
  "Nicaragua": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Young_Woman_in_Traditional_Dress_-_Granada_-_Nicaragua_(31572131030)_(2).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Young_Woman_in_Traditional_Dress_-_Granada_-_Nicaragua_(31572131030)_(2).jpg",
    credit: "Adam Jones", license: "CC BY-SA 2.0",
    caption: "A young woman in traditional Nicaraguan folk dress in Granada, Nicaragua",
    // A 2736x3648 portrait. Without this flag the 16:9 card cropped a horizontal band
    // across her eyes — the flower crown and her chin both fell outside it, which is
    // what "it doesn't even show a full face" was. Commons has no better option: the
    // only free landscape photos of Nicaraguan folk dress are either MASKED dancers
    // (baile de negras, Toro Huaco — no face at all) or Nicaraguan-diaspora troupes
    // photographed at festivals in Canada, which a caption can't honestly call Nicaragua.
    // This one is the real thing, shot in Granada. So show it whole.
    portrait: true,
  },
  "Trinidad and Tobago": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/MoKo%20Jumbie.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:MoKo_Jumbie.jpg",
    credit: "Abreauna", license: "CC BY 4.0",
    caption: "Moko jumbie stilt-dancers in flowing costume at a street festival in Trinidad",
  },

  // ---- Countries added after the original pipeline (landscape, reviewed) ----
  "Benin": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/DANSE%20EGUNGUN%20AU%20BENIN%2001.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:DANSE_EGUNGUN_AU_BENIN_01.jpg",
    credit: "Ahya ATINDEHOU", license: "CC BY-SA 4.0",
    caption: "Egungun masqueraders in full sequined ancestral costumes at a festival in Benin",
  },
  "Cameroon": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Danse%20Folklorique%20en%20Pays%20Bamilek%C3%A9.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Danse_Folklorique_en_Pays_Bamilek%C3%A9.jpg",
    credit: "Sidoine Mbogni", license: "CC BY-SA 4.0",
    caption: "Dancers in traditional Bamileke dress at an open-air folk dance in Dschang, western Cameroon",
  },
  "Côte d'Ivoire": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Zahouli.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Zahouli.jpg",
    credit: "MKwadyo", license: "CC BY-SA 4.0",
    caption: "A Zaouli dancer in a carved mask and raffia costume, a Guro tradition of Côte d'Ivoire",
  },
  "Dem. Rep. Congo": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Justin%20makangara%20RDC%20%2821%29.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Justin_makangara_RDC_(21).JPG",
    credit: "Justin Makangara", license: "CC BY-SA 4.0",
    caption: "Performers in cowrie-shell ceremonial costumes and feather headdresses in Kinshasa, DR Congo",
  },
  // Nigeria is not one people. The Sallah Durbar card is a northern, largely
  // Hausa-Fulani scene; showing only that left the Yoruba of the southwest — one
  // of the country's three largest peoples — out of a country of 200 million.
  "Nigeria": [
    {
      people: "Nupe & Hausa-Fulani",
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mounted%20female%20member%20of%20Sallah%20procession%2C%20Durbar%2C%20Bida%2C%20Nigeria.png?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Mounted_female_member_of_Sallah_procession,_Durbar,_Bida,_Nigeria.png",
      credit: "Jean Borgatti (Smithsonian NMAfA)", license: "Public domain",
      caption: "A woman in traditional dress rides in the Sallah Durbar procession in Bida, Nigeria",
    },
    {
      people: "Yoruba",
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dancing_in_a_Yoruba_attire%2C_Nigeria.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Dancing_in_a_Yoruba_attire,_Nigeria.jpg",
      credit: "Petrafy", license: "CC BY 4.0",
      caption: "Dancing in Yoruba attire at a traditional wedding celebration, Nigeria",
    },
  ],
  "Senegal": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%22Ndawrabine%22%20%28S%C3%A9n%C3%A9gal%29%20Wiki%20Loves%20Africa%202026%20au%20S%C3%A9n%C3%A9gal.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%22Ndawrabine%22_(S%C3%A9n%C3%A9gal)_Wiki_Loves_Africa_2026_au_S%C3%A9n%C3%A9gal.jpg",
    credit: "Général Abdoulaye Fall", license: "CC BY-SA 4.0",
    caption: "A woman in a grand boubou and headwrap at a Ndawrabine dance performance, Senegal",
  },
  "Uganda": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Performers%20dancing%20and%20singing%20at%20the%20Kabaka%20Coronation%20Anniversary%2C%20Buganda%20Kingdom%2002.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Performers_dancing_and_singing_at_the_Kabaka_Coronation_Anniversary,_Buganda_Kingdom_02.jpg",
    credit: "Ssemmanda will", license: "CC BY-SA 4.0",
    caption: "Performers in bark-cloth (olubugo) regalia at the Kabaka's coronation-anniversary celebration, Uganda",
  },
  "Zambia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/HH%20at%20the%20Kuomboka%20ceremony.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:HH_at_the_Kuomboka_ceremony.jpg",
    credit: "Jae zambia", license: "CC BY-SA 4.0",
    caption: "Men in Lozi ceremonial dress at the Kuomboka ceremony in Zambia's Western Province",
  },

  // ---- Countries added after the original pipeline (landscape, reviewed) ----
  "Finland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Finnish%20folk%20dancers%201964%20%28JOKAMT2Ku-40%29.tif?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Finnish_folk_dancers_1964_(JOKAMT2Ku-40).tif",
    credit: "Erkki Voutilainen", license: "CC BY 4.0",
    caption: "People dancing Finnish folk dances in national costume on Midsummer's Eve, 1964",
  },
  "Ireland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/18th%20International%20Folklore%20Festival%202012%2C%20Plovdiv%20%28Bulgaria%29%20-%20Irish%20dance%20group%2001.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:18th_International_Folklore_Festival_2012,_Plovdiv_(Bulgaria)_-_Irish_dance_group_01.jpg",
    credit: "BrankaVV", license: "CC BY-SA 4.0",
    caption: "An Irish dance group in traditional embroidered dresses and hard shoes",
  },
  "Poland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Zesp%C3%B3%C5%82%20Pie%C5%9Bni%20i%20Ta%C5%84ca%20%22Kielce%22.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Zespół_Pieśni_i_Tańca_\"Kielce\".JPG",
    credit: "Mike.drummer007", license: "CC BY-SA 3.0",
    caption: "The Kielce Song and Dance Ensemble in Polish regional folk costume (strój)",
  },
  "Sweden": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Folkdans%20Skansen%202019%20DSCN6294.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Folkdans_Skansen_2019_DSCN6294.jpg",
    credit: "Zquid", license: "CC BY-SA 4.0",
    caption: "Dancers in Swedish folk dress (folkdräkt) perform a folk dance at Skansen, Stockholm",
  },
  "Fiji": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Fiji%20dancing%20-%202009%200806PC55.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Fiji_dancing_-_2009_0806PC55.jpg",
    credit: "Peace Corps", license: "Public domain",
    caption: "Women perform a traditional dance in grass skirts and floral tops in Fiji",
  },
  "New Caledonia": {
    // Was a distant field with a stage at the far end of it. This one is a portrait
    // source, but the 16:9 crop at 50%/30% lands square on the three dancers' faces,
    // so it needs no `portrait: true` — the crop is the close-up.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kanak_Dance_Group_(31010343777).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Kanak_Dance_Group_(31010343777).jpg",
    credit: "David Stanley", license: "CC BY 2.0",
    caption: "A Kanak dance group performs in the garden of the Tjibaou Cultural Centre, Nouméa, New Caledonia",
  },
  "Papua New Guinea": {
    // Was two masked figures walking AWAY down a beach.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Adorable_(48875248593).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Adorable_(48875248593).jpg",
    credit: "gailhampshire", license: "CC BY 2.0",
    caption: "Children in face paint, shell headbands and leaf costume at the Mount Hagen Show, Western Highlands, Papua New Guinea",
  },
  "Solomon Is.": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pacific%20Partnership%202022%20visits%20Francis%20Primary%20School%20%287408289%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Pacific_Partnership_2022_visits_Francis_Primary_School_(7408289).jpg",
    credit: "U.S. Navy / Petty Officer 3rd Class Raphael McCorey", license: "Public domain",
    caption: "Students perform a traditional dance in grass skirts at a school in the Solomon Islands",
  },

  // ---- Headline-countries batch (landscape, reviewed) ----
  "Malaysia": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Malaysian%20Muslim%20dance%20%2829161038635%29.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Malaysian_Muslim_dance_(29161038635).jpg",
      credit: "Thomas Quine", license: "CC BY 2.0",
      people: "Malay",
      caption: "Dancers in traditional Malay dress performing at the Sarawak Cultural Village",
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/HUMAN_INTEREST_(8414586118).jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:HUMAN_INTEREST_(8414586118).jpg",
      credit: "Firdaus Latif", license: "CC BY-SA 2.0",
      people: "Chinese Malaysian",
      caption: "A lion dance for Chinese New Year at a shopping district in Kuala Lumpur",
    },
    {
      // Was a night crowd at Batu Caves with no readable face. The Commons page for this
      // one has no infobox, so the API reports no author — the wikitext credits Flickr
      // user "tajai / June" (flickr.com/photos/cayce/104676396), which is the attribution
      // CC BY-2.0 requires.
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Thaipusam3.jpg?width=800",
      source: "https://commons.wikimedia.org/wiki/File:Thaipusam3.jpg",
      credit: "tajai", license: "CC BY 2.0",
      people: "Indian Malaysian",
      caption: "Worshippers carry milk pots on their heads in a Thaipusam procession, Malaysia",
    },
  ],
  "Kazakhstan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Nauryz%20celebration.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Nauryz_celebration.jpg",
    credit: "Talgat Orynbayev", license: "CC BY-SA 4.0",
    caption: "Girls in Kazakh traditional dress at a Nauryz new-year celebration",
  },
  "Hungary": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/MatyoFotoThalerTamas.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:MatyoFotoThalerTamas.jpg",
    credit: "Thaler Tamas", license: "CC BY-SA 4.0",
    caption: "A festival procession in embroidered Matyó folk dress, Hungary",
  },
  "Romania": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Romanian%20teens%20in%20traditional%20clothes%20are%20dancing.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Romanian_teens_in_traditional_clothes_are_dancing.jpg",
    credit: "ShadowNighy", license: "CC BY-SA 4.0",
    caption: "Teenagers dancing in Romanian folk costume with embroidered blouses",
  },
  "Denmark": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Keld%20Gydum-IMG%204003%20%C3%A5benthus%20frederikshavn%20havn%20cropped.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Keld_Gydum-IMG_4003_%C3%A5benthus_frederikshavn_havn_cropped.JPG",
    credit: "Keld Gydum", license: "CC BY-SA 2.5 dk",
    caption: "Danish folk dancers in traditional dress at a harbor festival in Frederikshavn",
  },
  "Tunisia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Fille%20mariage%20Djerba.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Fille_mariage_Djerba.jpg",
    credit: "Souad Anane Lesina", license: "CC BY-SA 3.0",
    caption: "A girl in traditional Tunisian dress and gold jewelry at a wedding celebration on Djerba",
  },
  "Bangladesh": {
    // Was an aerial shot of a crowd — no face in it larger than a full stop.
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bangladeshi_girls_celebrating_Pohela_Falgun_festival_at_DC_Hill_(01).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Bangladeshi_girls_celebrating_Pohela_Falgun_festival_at_DC_Hill_(01).jpg",
    credit: "Moheen Reeyad", license: "CC BY-SA 4.0",
    caption: "Young women in saris at Pohela Falgun, the first day of spring in the Bengali calendar, Chattogram, Bangladesh",
  },
  "Uruguay": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Desfile%20de%20Llamadas%202020%20-%20Barrio%20Sur%20-%20Montevideo%20-%20Uruguay%20200214-1020898-jikatu%20%2849538521121%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Desfile_de_Llamadas_2020_-_Barrio_Sur_-_Montevideo_-_Uruguay_200214-1020898-jikatu_(49538521121).jpg",
    credit: "Jimmy Baikovicius", license: "CC BY-SA 2.0",
    caption: "Candombe drummers in comparsa dress at the Llamadas parade in Montevideo",
  },
  "Paraguay": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Danza%20de%20la%20botella.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Danza_de_la_botella.jpg",
    credit: "Overkill53", license: "CC BY-SA 4.0",
    caption: "Dancers balancing bottles on their heads in Paraguay's traditional bottle dance",
  },
};

// The English gloss for a greeting object (or null if none is known).
export const greetingMeaning = (greeting) =>
  (greeting && greeting.text && GREETING_MEANING[greeting.text]) || null;

// A country's people cards, always as an array (empty if we have none yet).
// Single-object entries are wrapped, so every caller can just map over the result.
export function peopleCards(country) {
  const e = COUNTRY_PEOPLE[country];
  if (!e) return [];
  return Array.isArray(e) ? e : [e];
}
