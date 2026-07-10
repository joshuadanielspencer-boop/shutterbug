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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pollera_de_Pomabamba.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Pollera_de_Pomabamba.jpg",
    credit: "Cbrescia", license: "CC BY-SA 4.0",
    caption: "The pollera dress of Pomabamba, in Peru's Áncash region",
  },
  "Kenya": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20Kikuyu%20Women%20Dancers.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Traditional_Kikuyu_Women_Dancers.jpg",
    credit: "Isiyekala", license: "CC BY-SA 4.0",
    caption: "Kikuyu women dancers in traditional dress with cowrie-shell headbands, Kenya",
  },
  "New Zealand": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Maori_men%27s_cultural_performance_group_%28AM_78261-1%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Maori_men%27s_cultural_performance_group_(AM_78261-1).jpg",
    credit: "T. W. Collins / Auckland War Memorial Museum", license: "CC BY 4.0",
    caption: "Māori men perform a haka (Auckland Museum, 1943)",
  },

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
  "South Africa": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ndebele_woman.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Ndebele_woman.jpg",
    credit: "Steve Evans", license: "CC BY 3.0",
    caption: "An Ndebele woman of South Africa in traditional beaded neck rings",
  },
  "Tanzania": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Two_women_wearing_Kangas.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Two_women_wearing_Kangas.jpg",
    credit: "Sophiestolle", license: "CC BY-SA 4.0",
    caption: "Two women in Tanzania wear colourful kanga cloths printed with Swahili sayings",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hira_gasy_musicians_2008.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Hira_gasy_musicians_2008.jpg",
    credit: "Lemurbaby", license: "CC BY-SA 3.0",
    caption: "Malagasy hira gasy musicians in traditional dress with a lamba sash",
  },
  "Sudan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/%C2%A9SUD2018-Sari%20Omer%20-0061.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:%C2%A9SUD2018-Sari_Omer_-0061.jpg",
    credit: "Sari Omer", license: "CC BY-SA 4.0",
    caption: "Sudanese women in colourful toub celebrating together, Darfur, Sudan",
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
    caption: "Women in colourful hanbok at the Insadong hanbok parade in Seoul, South Korea",
  },
  "Thailand": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/4%20Couple%20in%20traditional%20thai%20dress.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:4%20Couple%20in%20traditional%20thai%20dress.jpg",
    credit: "Helloerror", license: "CC BY-SA 4.0",
    caption: "A couple in chut thai, the woman's golden silk sabai draped across one shoulder",
  },
  "Vietnam": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vietnamese%20student%20girls%20in%20Temple%20of%20Literature.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Vietnamese%20student%20girls%20in%20Temple%20of%20Literature.JPG",
    credit: "Viethavvh", license: "CC BY-SA 4.0",
    caption: "Students in the áo dài, Vietnam's national dress, at Hanoi's Temple of Literature",
  },
  "Nepal": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20group%20of%20Nepalese%20Girls%20and%20Boys%20in%20cultural%20dress.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:A%20group%20of%20Nepalese%20Girls%20and%20Boys%20in%20cultural%20dress.jpg",
    credit: "Rojisha Pandit Chettri", license: "CC BY-SA 4.0",
    caption: "Children in Nepal dressed in traditional Nepali attire",
  },
  "Indonesia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Girls%20in%20traditional%20Hindu%20dress%20in%20Bali%20Indonesia.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Girls%20in%20traditional%20Hindu%20dress%20in%20Bali%20Indonesia.jpg",
    credit: "VasenkaPhotography", license: "CC BY 2.0",
    caption: "Girls in Bali in traditional Balinese dress for a Hindu ceremony",
  },
  "Cambodia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Siem-Reap%20Dance%20of%20Cambodia%20(1).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Siem-Reap%20Dance%20of%20Cambodia%20(1).jpg",
    credit: "Pierre André Leclercq", license: "CC BY-SA 4.0",
    caption: "A Khmer classical dancer in a golden Apsara crown and pleated silk sampot, Siem Reap",
  },
  "Myanmar": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mandalay%20Thingyan%20Rehearsal%202012.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Mandalay_Thingyan_Rehearsal_2012.JPG",
    credit: "Htoo Tay Zar", license: "CC BY-SA 3.0",
    caption: "Dancers in Burmese dress rehearse a traditional dance for the Thingyan water festival in Mandalay",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Water%20Carrier%20Dancers.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Water_Carrier_Dancers.jpg",
    credit: "Iamironviper", license: "CC BY-SA 4.0",
    caption: "Performers of the traditional Water Carrier Dance (Kothala Paliya) at a Sri Lankan perahera festival",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Northern%20Constabulary%20Pipe%20Band%20at%20Cowal%20Highland%20Games%20Dunoon%20Scotland%20(4949923566).jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Northern%20Constabulary%20Pipe%20Band%20at%20Cowal%20Highland%20Games%20Dunoon%20Scotland%20(4949923566).jpg",
    credit: "Dave Conner", license: "CC BY 2.0",
    caption: "A Scottish pipe band in full Highland dress, kilts and bagpipes, at the Cowal Highland Gathering",
  },
  "France": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/2016%20Festo%20Vierginenco%2001.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:2016%20Festo%20Vierginenco%2001.jpg",
    credit: "Finoskov", license: "CC BY-SA 4.0",
    caption: "Young women of the Pays d'Arles in traditional Arlésienne dress at a festival in Provence",
  },
  "Italy": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Women%20of%20sardinia.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Women%20of%20sardinia.jpg",
    credit: "Cristiano Cani", license: "CC BY 2.0",
    caption: "Women of Sardinia in their bright, hand-embroidered village costumes for a festival",
  },
  "Greece": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Evzones%20wearing%20the%20traditional%20Fustanella.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Evzones%20wearing%20the%20traditional%20Fustanella.jpg",
    credit: "George E. Koronaios", license: "CC BY-SA 4.0",
    caption: "Greek Evzone guards in the pleated fustanella at the Tomb of the Unknown Soldier, Athens",
  },
  "Germany": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/005%20Trachtenumzug%20Feldmoching.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:005%20Trachtenumzug%20Feldmoching.JPG",
    credit: "Usien", license: "CC BY-SA 3.0",
    caption: "A Bavarian folk group at the Munich costume parade, men in lederhosen and a woman in a dirndl",
  },
  "Spain": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Feria%20abril%202011%200001.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Feria%20abril%202011%200001.jpg",
    credit: "Sevilla Congress & Convention Bureau", license: "CC BY-SA 4.0",
    caption: "Women in colourful ruffled flamenco dresses at Seville's April Fair",
  },
  "Portugal": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pa%C3%A7os%20do%20Concelho%20de%20Angra%20do%20Hero%C3%ADsmo%20-%20Folclore.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Paços_do_Concelho_de_Angra_do_Heroísmo_-_Folclore.jpg",
    credit: "Concierge.2C", license: "CC BY-SA 3.0",
    caption: "Folk dancers in traditional dress on the Praça Velha at the Azores folklore festival, Angra do Heroísmo, Portugal",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/PosavinaGirls.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:PosavinaGirls.jpg",
    credit: "Veronikablg", license: "CC BY-SA 4.0",
    caption: "Two young women in the red-and-white folk costume of Croatia's Posavina region by Sisak fortress",
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
    caption: "A young Ixil Maya woman in her people's colourful ceremonial dress, in Guatemala's highlands",
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
  "Canada": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dancer%20on%20Pow-Wow%202016%20in%20Wendake%2C%20Quebec%2C%20Canada.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Dancer%20on%20Pow-Wow%202016%20in%20Wendake%2C%20Quebec%2C%20Canada.jpg",
    credit: "Marc Lautenbacher", license: "CC BY-SA 4.0",
    caption: "A First Nations dancer in traditional regalia at the powwow in Wendake, Quebec",
    portrait: true, // no free landscape photo of this dress exists — show it whole
  },
  "United States": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Assiniboine%20Sioux%20Jingle%20Dress%20Girls.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Assiniboine%20Sioux%20Jingle%20Dress%20Girls.jpg",
    credit: "Thayne Tuason", license: "CC BY-SA 4.0",
    caption: "Assiniboine Sioux dancers in jingle dresses trimmed with metal cones that chime as they dance",
  },
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
  "Brazil": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Baiana%20em%20desfile%20de%202%20de%20Julho%20em%20S%C3%A3o%20F%C3%A9lix.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Baiana%20em%20desfile%20de%202%20de%20Julho%20em%20S%C3%A3o%20F%C3%A9lix.jpg",
    credit: "ExpressaoSAMPA", license: "CC BY-SA 4.0",
    caption: "A woman in the Baiana dress of Bahia — white lace blouse, headwrap and full floral skirt",
    portrait: true, // no free landscape photo of this dress exists — show it whole
  },
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
  "Australia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Boigu%20dance.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Boigu%20dance.jpg",
    credit: "u-turn77", license: "CC BY 2.0",
    caption: "A Torres Strait Islander dancer in a feathered dhari headdress and woven grass cape",
    portrait: true, // no free landscape photo of this dress exists — show it whole
  },
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
    caption: "Young folk dancers in colourful traje típico at Tortuguero, Costa Rica",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Torovenado%20de%20Masaya.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Torovenado_de_Masaya.jpg",
    credit: "Jorge Mejía Peralta", license: "CC BY 2.0",
    caption: "A masked dancer in the traditional Torovenado folk festival in Masaya, Nicaragua",
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
  "Nigeria": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mounted%20female%20member%20of%20Sallah%20procession%2C%20Durbar%2C%20Bida%2C%20Nigeria.png?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Mounted_female_member_of_Sallah_procession,_Durbar,_Bida,_Nigeria.png",
    credit: "Jean Borgatti (Smithsonian NMAfA)", license: "Public domain",
    caption: "A woman in traditional dress rides in the Sallah Durbar procession in Bida, Nigeria",
  },
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Danses%20kanak%20%C3%A0%20Canala%203.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Danses_kanak_à_Canala_3.jpg",
    credit: "Monofruit", license: "CC0",
    caption: "Kanak dancers in grass costumes perform at a festival in Canala, New Caledonia",
  },
  "Papua New Guinea": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/DPAA%2025-4PG%20Team%20celebrates%20PNG%2050th%20Independence%20Day%20%289332993%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:DPAA_25-4PG_Team_celebrates_PNG_50th_Independence_Day_(9332993).jpg",
    credit: "U.S. Air Force / Staff Sgt. Matthew Angulo", license: "Public domain",
    caption: "Tolai masked dancers in leaf costumes perform the Kinavai dawn dance for Papua New Guinea's Independence Day",
  },
  "Solomon Is.": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pacific%20Partnership%202022%20visits%20Francis%20Primary%20School%20%287408289%29.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Pacific_Partnership_2022_visits_Francis_Primary_School_(7408289).jpg",
    credit: "U.S. Navy / Petty Officer 3rd Class Raphael McCorey", license: "Public domain",
    caption: "Students perform a traditional dance in grass skirts at a school in the Solomon Islands",
  },
};

// The English gloss for a greeting object (or null if none is known).
export const greetingMeaning = (greeting) =>
  (greeting && greeting.text && GREETING_MEANING[greeting.text]) || null;
