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

  // ---- Africa (reviewed batch) ------------------------------------------
  "Egypt": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Egypt_(Luxor)_Another_Egyptian_man_with_traditional_dress_named_jellabiya_(26321884786).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Egypt_(Luxor)_Another_Egyptian_man_with_traditional_dress_named_jellabiya_(26321884786).jpg",
    credit: "Güldem Üstün", license: "CC BY 2.0",
    caption: "An Egyptian man in Luxor wears a jellabiya, Egypt's long loose robe",
  },
  "Morocco": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Women_group_in_Traditional_festival_in_Ouarzazate%2C_Morocco_1_by_Brahim_FARAJI.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Women_group_in_Traditional_festival_in_Ouarzazate%2C_Morocco_1_by_Brahim_FARAJI.jpg",
    credit: "Brahim FARAJI", license: "CC BY-SA 4.0",
    caption: "Moroccan women in bright traditional dress at a festival in Ouarzazate",
  },
  "Ethiopia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Habesha_woman-b.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Habesha_woman-b.jpg",
    credit: "msafari2425", license: "CC BY 2.0",
    caption: "An Ethiopian woman in a habesha kemis performs a cultural dance",
  },
  "Ghana": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghanaian_women_in_Kente_cloth_and_beads.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Ghanaian_women_in_Kente_cloth_and_beads.jpg",
    credit: "Pambelle12", license: "CC BY-SA 4.0",
    caption: "A woman in Ghana wears bright kente cloth and beads",
  },
  "South Africa": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ndebele_woman.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Ndebele_woman.jpg",
    credit: "Steve Evans", license: "CC BY 3.0",
    caption: "An Ndebele woman of South Africa in traditional beaded neck rings",
  },
  "Tanzania": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Two_women_wearing_Kangas.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Two_women_wearing_Kangas.jpg",
    credit: "Sophiestolle", license: "CC BY-SA 4.0",
    caption: "Two women in Tanzania wear colourful kanga cloths printed with Swahili sayings",
  },
  "Namibia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/A_proud_herero_woman.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:A_proud_herero_woman.jpg",
    credit: "Ngarii", license: "CC BY-SA 4.0",
    caption: "A Herero woman in Namibia in the Victorian-style dress and cow-horn headdress",
  },
  "Rwanda": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bride_in_Rwanda_traditional_wedding.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Bride_in_Rwanda_traditional_wedding.jpg",
    credit: "Claude Nizeyimana", license: "CC BY-SA 4.0",
    caption: "Women in Rwanda wear the mushanana, a sash draped over one shoulder, at a wedding",
  },
  "Mali": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tuareg_woman_from_Mali%2C_2007.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Tuareg_woman_from_Mali%2C_2007.jpg",
    credit: "Alain Elorza", license: "CC BY-SA 2.0",
    caption: "A young Tuareg woman in Mali in the traditional veil and headwrap of the Sahara",
  },
  "Algeria": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jeune_fille_en_tenue_traditionnelle_jouant_la_Darbouka.JPG?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Jeune_fille_en_tenue_traditionnelle_jouant_la_Darbouka.JPG",
    credit: "Louadfel", license: "CC BY-SA 4.0",
    caption: "A girl in a gold-embroidered Algerian karakou plays the darbouka at a festival",
  },
  "Botswana": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Folk_dance_troupe_3.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Folk_dance_troupe_3.jpg",
    credit: "Mompati Dikunwane", license: "CC BY-SA 4.0",
    caption: "Dancers in traditional Setswana dress at Botswana's Domboshaba Cultural Festival",
  },
  "Zimbabwe": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ibhetshu.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Ibhetshu.jpg",
    credit: "Sibusisiwe Gugu", license: "CC BY-SA 4.0",
    caption: "A young Zimbabwean woman in traditional beaded regalia called the ibhetshu",
  },
  "Madagascar": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hira_gasy_musicians_2008.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Hira_gasy_musicians_2008.jpg",
    credit: "Lemurbaby", license: "CC BY-SA 3.0",
    caption: "Malagasy hira gasy musicians in traditional dress with a lamba sash",
  },
  "Sudan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jellabiya_Sudan2008.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Jellabiya_Sudan2008.jpg",
    credit: "Maureen Lunn", license: "CC BY 2.0",
    caption: "Sudanese men in the jalabiya robe with a taqiyah cap and shawl",
  },

  // ---- Asia (reviewed batch; Japan & India in the pilot above) ----------
  "China": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20woman%20with%20Chinese%20clothes.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:A%20woman%20with%20Chinese%20clothes.jpg",
    credit: "Peachyeung316", license: "CC BY-SA 4.0",
    caption: "A woman in Hong Kong wearing a qipao (cheongsam), a fitted Chinese silk dress",
  },
  "South Korea": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hanbok%20(female%20and%20male).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Hanbok%20(female%20and%20male).jpg",
    credit: "Korea.net / KOCIS", license: "CC BY 2.0",
    caption: "A woman and man in hanbok, South Korea's colourful traditional clothing",
  },
  "Thailand": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/4%20Couple%20in%20traditional%20thai%20dress.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:4%20Couple%20in%20traditional%20thai%20dress.jpg",
    credit: "Helloerror", license: "CC BY-SA 4.0",
    caption: "A couple in chut thai, the woman's golden silk sabai draped across one shoulder",
  },
  "Vietnam": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vietnamese%20student%20girls%20in%20Temple%20of%20Literature.JPG?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Vietnamese%20student%20girls%20in%20Temple%20of%20Literature.JPG",
    credit: "Viethavvh", license: "CC BY-SA 4.0",
    caption: "Students in the áo dài, Vietnam's national dress, at Hanoi's Temple of Literature",
  },
  "Nepal": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20group%20of%20Nepalese%20Girls%20and%20Boys%20in%20cultural%20dress.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:A%20group%20of%20Nepalese%20Girls%20and%20Boys%20in%20cultural%20dress.jpg",
    credit: "Rojisha Pandit Chettri", license: "CC BY-SA 4.0",
    caption: "Children in Nepal dressed in traditional Nepali attire",
  },
  "Indonesia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Girls%20in%20traditional%20Hindu%20dress%20in%20Bali%20Indonesia.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Girls%20in%20traditional%20Hindu%20dress%20in%20Bali%20Indonesia.jpg",
    credit: "VasenkaPhotography", license: "CC BY 2.0",
    caption: "Girls in Bali in traditional Balinese dress for a Hindu ceremony",
  },
  "Cambodia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Siem-Reap%20Dance%20of%20Cambodia%20(1).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Siem-Reap%20Dance%20of%20Cambodia%20(1).jpg",
    credit: "Pierre André Leclercq", license: "CC BY-SA 4.0",
    caption: "A Khmer classical dancer in a golden Apsara crown and pleated silk sampot, Siem Reap",
  },
  "Myanmar": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/2016%20Rangun%2C%20Park%20Maha%20Bandula%2C%20Kobiety%20w%20tradycyjnych%20strojach.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:2016%20Rangun%2C%20Park%20Maha%20Bandula%2C%20Kobiety%20w%20tradycyjnych%20strojach.jpg",
    credit: "Marcin Konsek", license: "CC BY-SA 4.0",
    caption: "Women in Yangon wearing Myanmar's traditional wrap skirt, the longyi",
  },
  "Iran": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Qashqai%20nomad%20woman.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Qashqai%20nomad%20woman.jpg",
    credit: "ninara", license: "CC BY 2.0",
    caption: "A Qashqai nomad woman in the colourful layered skirts of her southern Iranian tribe",
  },
  "Jordan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jordanian%20Bedouin%20Arab%20Men.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Jordanian%20Bedouin%20Arab%20Men.jpg",
    credit: "Mr Masri", license: "CC0",
    caption: "Bedouin men in Jordan in the red-and-white shemagh headscarf and long robes",
  },
  "Pakistan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Schoolgirls%20in%20Shalwar%20Kameez%2C%20Abbotabad%20Pakistan%20-%20UK%20International%20Development.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Schoolgirls%20in%20Shalwar%20Kameez%2C%20Abbotabad%20Pakistan%20-%20UK%20International%20Development.jpg",
    credit: "Vicki Francis / UK DFID", license: "CC BY 2.0",
    caption: "Girls in Abbottabad in Pakistan's national dress: white shalwar trousers and blue kameez shirt",
  },
  "Philippines": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Groomsmen%20wearing%20barong%20tagalog%20at%20a%20wedding.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Groomsmen%20wearing%20barong%20tagalog%20at%20a%20wedding.jpg",
    credit: "Ron Bulovs", license: "CC BY 2.0",
    caption: "Men in the barong tagalog, an embroidered Filipino dress shirt, at a wedding",
  },
  "Russia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20Russian%20Folk%20Costumes%2001.JPG?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Traditional%20Russian%20Folk%20Costumes%2001.JPG",
    credit: "Ninaras", license: "CC BY 4.0",
    caption: "Performers in bright Russian folk dress with the sarafan jumper at a St Petersburg festival",
  },
  "Turkey": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Turkish%20folk%20dancers%20(1085290934).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Turkish%20folk%20dancers%20(1085290934).jpg",
    credit: "allen watkin", license: "CC BY-SA 2.0",
    caption: "Dancers perform a traditional Turkish folk dance in bright regional costumes",
  },
  "United Arab Emirates": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Girl%20with%20the%20falcon.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Girl%20with%20the%20falcon.jpg",
    credit: "Amarhabeeb", license: "CC BY-SA 4.0",
    caption: "A girl in Emirati traditional dress holds a falcon at a heritage festival in Abu Dhabi",
  },
  "Uzbekistan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uzbek%20girl%20in%20traditional%20clothing.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Uzbek%20girl%20in%20traditional%20clothing.jpg",
    credit: "Elamanovaelvina", license: "CC BY-SA 4.0",
    caption: "A girl in Uzbekistan in a chopon robe of adras silk and an embroidered do'ppi cap",
  },
  "Sri Lanka": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20Sri%20Lankan%20Kandyan%20dress.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Traditional%20Sri%20Lankan%20Kandyan%20dress.jpg",
    credit: "Rangani Kaushalya Meddepola", license: "CC BY-SA 4.0",
    caption: "A young woman in Sri Lanka's Kandyan osariya, a sari with a lacy blouse and waist frill",
  },
  "Taiwan": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ilisin%20-%20Women%20in%20Traditional%20Attire.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Ilisin%20-%20Women%20in%20Traditional%20Attire.jpg",
    credit: "Kevshen", license: "CC BY-SA 4.0",
    caption: "Amis women of eastern Taiwan in traditional dress for the Ilisin harvest festival",
  },
  "Singapore": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kebaya%201.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Kebaya%201.jpg",
    credit: "Jamieson Teo", license: "CC BY-SA 2.0",
    caption: "Peranakan (Nyonya) ladies in Singapore in the kebaya, an embroidered blouse over a batik sarong",
  },
};

// The English gloss for a greeting object (or null if none is known).
export const greetingMeaning = (greeting) =>
  (greeting && greeting.text && GREETING_MEANING[greeting.text]) || null;
