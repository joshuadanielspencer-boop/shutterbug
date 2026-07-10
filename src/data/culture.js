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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mandalay%20Thingyan%20Rehearsal%202012.JPG?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Mandalay_Thingyan_Rehearsal_2012.JPG",
    credit: "Htoo Tay Zar", license: "CC BY-SA 3.0",
    caption: "Dancers in Burmese dress rehearse a traditional dance for the Thingyan water festival in Mandalay",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Russian%20folk%20folkloric%20ensemble%20RASPEV%20%28chant%29%20will%20be%20performing%20in%202021%20in%20the%20Museum-Reservation%20of%20the%20Manor%20%22Muranovo%22%2C%20named%20after%20Fyodor%20Ivanovich%20Tyutchev.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:The_Russian_folk_folkloric_ensemble_RASPEV_(chant)_will_be_performing_in_2021_in_the_Museum-Reservation_of_the_Manor_%22Muranovo%22,_named_after_Fyodor_Ivanovich_Tyutchev.jpg",
    credit: "WikiMaxChe", license: "CC BY-SA 4.0",
    caption: "The RASPEV folk ensemble in sarafans and headscarves at a folk festival near Moscow",
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
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kebaya%201.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Kebaya%201.jpg",
    credit: "Jamieson Teo", license: "CC BY-SA 2.0",
    caption: "Peranakan (Nyonya) ladies in Singapore in the kebaya, an embroidered blouse over a batik sarong",
  },
  "Mongolia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Przed%20rozpocz%C4%99ciem%20lokalnego%20festiwalu%20Naadam%20(06).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Przed%20rozpocz%C4%99ciem%20lokalnego%20festiwalu%20Naadam%20(06).jpg",
    credit: "Marcin Konsek", license: "CC BY-SA 4.0",
    caption: "Men wearing the deel — Mongolia's traditional robe — before a Naadam festival",
  },

  // ---- Europe (reviewed batch; Russia & Turkey are in the Asia batch above) ----
  "United Kingdom": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Northern%20Constabulary%20Pipe%20Band%20at%20Cowal%20Highland%20Games%20Dunoon%20Scotland%20(4949923566).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Northern%20Constabulary%20Pipe%20Band%20at%20Cowal%20Highland%20Games%20Dunoon%20Scotland%20(4949923566).jpg",
    credit: "Dave Conner", license: "CC BY 2.0",
    caption: "A Scottish pipe band in full Highland dress, kilts and bagpipes, at the Cowal Highland Gathering",
  },
  "France": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/2016%20Festo%20Vierginenco%2001.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:2016%20Festo%20Vierginenco%2001.jpg",
    credit: "Finoskov", license: "CC BY-SA 4.0",
    caption: "Young women of the Pays d'Arles in traditional Arlésienne dress at a festival in Provence",
  },
  "Italy": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Women%20of%20sardinia.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Women%20of%20sardinia.jpg",
    credit: "Cristiano Cani", license: "CC BY 2.0",
    caption: "Women of Sardinia in their bright, hand-embroidered village costumes for a festival",
  },
  "Greece": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Evzones%20wearing%20the%20traditional%20Fustanella.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Evzones%20wearing%20the%20traditional%20Fustanella.jpg",
    credit: "George E. Koronaios", license: "CC BY-SA 4.0",
    caption: "Greek Evzone guards in the pleated fustanella at the Tomb of the Unknown Soldier, Athens",
  },
  "Germany": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/005%20Trachtenumzug%20Feldmoching.JPG?width=500",
    source: "https://commons.wikimedia.org/wiki/File:005%20Trachtenumzug%20Feldmoching.JPG",
    credit: "Usien", license: "CC BY-SA 3.0",
    caption: "A Bavarian folk group at the Munich costume parade, men in lederhosen and a woman in a dirndl",
  },
  "Spain": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Feria%20abril%202011%200001.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Feria%20abril%202011%200001.jpg",
    credit: "Sevilla Congress & Convention Bureau", license: "CC BY-SA 4.0",
    caption: "Women in colourful ruffled flamenco dresses at Seville's April Fair",
  },
  "Portugal": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Romaria%20da%20Senhora%20d'Agonia%20-%20Viana%20do%20Castelo.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Romaria%20da%20Senhora%20d'Agonia%20-%20Viana%20do%20Castelo.jpg",
    credit: "Rosino", license: "CC BY-SA 2.0",
    caption: "Women in the red-and-gold lavradeira dress of Viana do Castelo at a festival in northern Portugal",
  },
  "Netherlands": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marken%20Klederdracht%20IMG0022.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Marken%20Klederdracht%20IMG0022.jpg",
    credit: "Hnapel", license: "CC BY-SA 4.0",
    caption: "A man and woman from Marken in traditional Easter klederdracht, with a white lace cap",
  },
  "Belgium": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/0%20Binche%20-%20Les%20Gilles%20le%20jour%20du%20mardi%20gras%20(1).JPG?width=500",
    source: "https://commons.wikimedia.org/wiki/File:0%20Binche%20-%20Les%20Gilles%20le%20jour%20du%20mardi%20gras%20(1).JPG",
    credit: "Jean-Pol GRANDMONT", license: "CC BY-SA 3.0",
    caption: "Gilles of Binche in tall ostrich-feather hats on the last day of their famous carnival",
  },
  "Switzerland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/March%C3%A9-Concours%202019%2C%20Bild%203.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:March%C3%A9-Concours%202019%2C%20Bild%203.jpg",
    credit: "PaterMcFly", license: "CC BY 4.0",
    caption: "A Swiss folk group in the red-and-yellow Appenzell Tracht at a festival",
  },
  "Austria": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Lindwurm%20Klagenfurt%2C%20Volkstanzgruppe%20aus%20K%C3%A4rnten.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Lindwurm%20Klagenfurt%2C%20Volkstanzgruppe%20aus%20K%C3%A4rnten.jpg",
    credit: "Naturpuur", license: "CC BY 4.0",
    caption: "A Carinthian folk-dance group in traditional dirndls and Tracht in Klagenfurt",
  },
  "Czechia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Moravian%20Slovak%20Costumes%20during%20Jizda%20Kralu.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Moravian%20Slovak%20Costumes%20during%20Jizda%20Kralu.jpg",
    credit: "Jialiang Gao", license: "CC BY-SA 3.0",
    caption: "Children in bright Moravian folk costumes (kroj) at the Ride of the Kings festival in Vlčnov",
  },
  "Croatia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/PosavinaGirls.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:PosavinaGirls.jpg",
    credit: "Veronikablg", license: "CC BY-SA 4.0",
    caption: "Two young women in the red-and-white folk costume of Croatia's Posavina region by Sisak fortress",
  },
  "Iceland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/All%20Dressed%20Up%20(5847023926).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:All%20Dressed%20Up%20(5847023926).jpg",
    credit: "Helgi Halldórsson", license: "CC BY-SA 2.0",
    caption: "A woman in Iceland's national costume, the þjóðbúningur, on National Day",
  },
  "Norway": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Trondheim%20bunad%20May%2017.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Trondheim%20bunad%20May%2017.jpg",
    credit: "Sigmund", license: "CC BY 2.0",
    caption: "Two friends wear their Trøndelag bunad to celebrate Norway's National Day, 17 May",
  },

  // ---- Americas & Oceania (reviewed batch; Mexico/Peru/New Zealand in the pilot) ----
  "Guatemala": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ixil%20young%20woman%20with%20ceremonial%20dress.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Ixil%20young%20woman%20with%20ceremonial%20dress.jpg",
    credit: "Sigrid Marisol Aguilar Jocol", license: "CC BY-SA 4.0",
    caption: "A young Ixil Maya woman in her people's colourful ceremonial dress, in Guatemala's highlands",
  },
  "Panama": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Empollerada%20de%20Panam%C3%A1.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Empollerada%20de%20Panam%C3%A1.jpg",
    credit: "Ayaita", license: "CC BY-SA 3.0",
    caption: "A woman wears Panama's national dress, the pollera, at a folk festival",
  },
  "Cuba": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bailarines%20de%20rumba%20cubana%20en%20la%20plaza%20de%20los%20trabajadores%20de%20Camag%C3%BCey%2C%20Cuba.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Bailarines%20de%20rumba%20cubana%20en%20la%20plaza%20de%20los%20trabajadores%20de%20Camag%C3%BCey%2C%20Cuba.jpg",
    credit: "Manuel Díaz Reyes", license: "CC BY-SA 4.0",
    caption: "Dancers perform Cuba's lively rumba in a public square in Camagüey",
  },
  "Greenland": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Greenland%201999%20(01).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Greenland%201999%20(01).jpg",
    credit: "Vadeve", license: "Public domain",
    caption: "Young women in Greenland's kalaallisuut, with beaded collars and tall white sealskin boots",
  },
  "Canada": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dancer%20on%20Pow-Wow%202016%20in%20Wendake%2C%20Quebec%2C%20Canada.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Dancer%20on%20Pow-Wow%202016%20in%20Wendake%2C%20Quebec%2C%20Canada.jpg",
    credit: "Marc Lautenbacher", license: "CC BY-SA 4.0",
    caption: "A First Nations dancer in traditional regalia at the powwow in Wendake, Quebec",
  },
  "United States": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Assiniboine%20Sioux%20Jingle%20Dress%20Girls.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Assiniboine%20Sioux%20Jingle%20Dress%20Girls.jpg",
    credit: "Thayne Tuason", license: "CC BY-SA 4.0",
    caption: "Assiniboine Sioux dancers in jingle dresses trimmed with metal cones that chime as they dance",
  },
  "Argentina": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/San%20Antonio%20de%20Areco-Fiesta%20de%20la%20Tradici%C3%B3n%2011.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:San%20Antonio%20de%20Areco-Fiesta%20de%20la%20Tradici%C3%B3n%2011.jpg",
    credit: "AnselmoesMaciel", license: "CC BY-SA 4.0",
    caption: "Argentine gauchos in hats, ponchos and boots ride at the yearly Festival of Tradition",
  },
  "Bolivia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Aymara%20Women%2C%20El%20Alto%2C%20Bolivia%20(2173402729).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Aymara%20Women%2C%20El%20Alto%2C%20Bolivia%20(2173402729).jpg",
    credit: "Pedro Szekely", license: "CC BY 2.0",
    caption: "Aymara women in El Alto in the traditional pollera skirt and bowler hat",
  },
  "Brazil": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Baiana%20em%20desfile%20de%202%20de%20Julho%20em%20S%C3%A3o%20F%C3%A9lix.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Baiana%20em%20desfile%20de%202%20de%20Julho%20em%20S%C3%A3o%20F%C3%A9lix.jpg",
    credit: "ExpressaoSAMPA", license: "CC BY-SA 4.0",
    caption: "A woman in the Baiana dress of Bahia — white lace blouse, headwrap and full floral skirt",
  },
  "Chile": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20dress%20of%20the%20Chilean%20cueca%2C%20a%20national%20dance.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Traditional%20dress%20of%20the%20Chilean%20cueca%2C%20a%20national%20dance.jpg",
    credit: "Quilicura", license: "CC BY-SA 4.0",
    caption: "Dancers in huaso and china dress perform the cueca, Chile's national dance",
  },
  "Colombia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bailadoras%20de%20Cumbia.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Bailadoras%20de%20Cumbia.jpg",
    credit: "Luis Pérez", license: "CC BY 2.0",
    caption: "Women dance the cumbia in flowing pollera skirts at a folk festival in San Pelayo",
  },
  "Ecuador": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional%20dress%20in%20otavalo%20market%20with%20customer.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Traditional%20dress%20in%20otavalo%20market%20with%20customer.jpg",
    credit: "DickClarkMises", license: "CC0",
    caption: "An Otavalo woman in a white embroidered blouse at Ecuador's famous Otavalo market",
  },
  "Venezuela": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pareja%20bailando%20joropo%20llanero%20(Puro).jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Pareja%20bailando%20joropo%20llanero%20(Puro).jpg",
    credit: "Simplemente Venezuela", license: "CC BY-SA 4.0",
    caption: "A couple dances the joropo as harp, cuatro and maracas play",
  },
  "Guyana": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Guyana%20dance%202002%2011%2023.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Guyana%20dance%202002%2011%2023.jpg",
    credit: "EsAvila", license: "CC BY-SA 4.0",
    caption: "Macushi people of Guyana dance in fibre skirts and feathered headdresses",
  },
  "Australia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Boigu%20dance.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Boigu%20dance.jpg",
    credit: "u-turn77", license: "CC BY 2.0",
    caption: "A Torres Strait Islander dancer in a feathered dhari headdress and woven grass cape",
  },
  "French Polynesia": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Danse%20Heiva%202014-3424.jpg?width=500",
    source: "https://commons.wikimedia.org/wiki/File:Danse%20Heiva%202014-3424.jpg",
    credit: "Anne-Laure Lépine", license: "CC BY-SA 4.0",
    caption: "A dance troupe performs in grass skirts and feathered headdresses at the Heiva i Tahiti festival",
  },
  "Vanuatu": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vanuatu-humans-of-vanuatu-2.jpg?width=500",
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
};

// The English gloss for a greeting object (or null if none is known).
export const greetingMeaning = (greeting) =>
  (greeting && greeting.text && GREETING_MEANING[greeting.text]) || null;
