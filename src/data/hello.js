// ===========================================================================
// THE SPLASH GREETINGS — speech bubbles that say hello in many languages.
//
// Three are picked at random each time the splash is shown. Pointing at one
// speaks it aloud in that language (via speakGreeting, which maps `language` to
// a voice — so the name here must match a key in SPEECH_LANG in audio.js) and
// shows what language it is and what the word literally means.
//
// Rule 2 applies to this file as much as to any fact: `text` is what the bubble
// ACTUALLY SAYS, read off each image, not what its filename claims. Two of the
// first twenty delivered bubbles were mislabelled — the original
// 02_russian_privet.png and 12_hindi_namaste.png were both pictures of "¡Hola!"
// — so those two were left out until corrected art arrived (it since has, as
// 21_russian_privet and 22_hindi_namaste; both were re-read before being added).
// A bubble reading ¡Hola! that a child hovers and hears "Привет" teaches them
// something false in the one place the game's whole promise is that it doesn't.
//
// `means` is the LITERAL sense, not a second translation of "hello". Where a
// greeting's literal origin is genuinely contested, it gives the plain everyday
// meaning instead of picking a side — an honest gloss beats a clever one.
//
// Note "Sannu" is filed as HAUSA, not "Nigerian": Nigeria has some five hundred
// languages, and naming one of them after the country would be its own small lie.
// The same care is why "How far?" is filed as Nigerian Pidgin — a real language
// with millions of speakers — rather than as English.
// ===========================================================================

export const HELLO_BUBBLES = [
  { file: "01_french_bonjour.png",        language: "French",           text: "Bonjour",     word: "Bonjour",         means: "good day" },
  { file: "03_japanese_konnichiwa.png",   language: "Japanese",         text: "こんにちは",    word: "Konnichiwa",      means: "good afternoon" },
  { file: "04_korean_annyeonghaseyo.png", language: "Korean",           text: "안녕하세요",    word: "Annyeonghaseyo",  means: "are you at peace?" },
  { file: "05_german_hallo.png",          language: "German",           text: "Hallo",       word: "Hallo",           means: "hello" },
  { file: "06_italian_ciao.png",          language: "Italian",          text: "Ciao",        word: "Ciao",            means: "hi — and goodbye too" },
  { file: "07_turkish_merhaba.png",       language: "Turkish",          text: "Merhaba",     word: "Merhaba",         means: "welcome" },
  { file: "08_greek_geia_sou.png",        language: "Greek",            text: "Γεια σου",    word: "Geia sou",        means: "health to you" },
  { file: "09_portuguese_ola.png",        language: "Portuguese",       text: "Olá",         word: "Olá",             means: "hello" },
  { file: "10_thai_sawasdee.png",         language: "Thai",             text: "สวัสดี",       word: "Sawasdee",        means: "well-being" },
  { file: "11_vietnamese_xin_chao.png",   language: "Vietnamese",       text: "Xin chào",    word: "Xin chào",        means: "I greet you" },
  { file: "13_bengali_nomoskar.png",      language: "Bengali",          text: "নমস্কার",      word: "Nomoskar",        means: "I bow to you" },
  { file: "14_indonesian_halo.png",       language: "Indonesian",       text: "Halo",        word: "Halo",            means: "hello" },
  { file: "15_urdu_salaam.png",           language: "Urdu",             text: "سلام",         word: "Salaam",          means: "peace" },
  { file: "16_nigerian_sannu.png",        language: "Hausa",            text: "Sannu",       word: "Sannu",           means: "hello — take it gently" },
  { file: "17_english_hello.png",         language: "English",          text: "Hello",       word: "Hello",           means: "hello" },
  { file: "18_spanish_hola.png",          language: "Spanish",          text: "¡Hola!",      word: "¡Hola!",          means: "hello" },
  { file: "19_arabic_marhaba.png",        language: "Arabic",           text: "مرحبا",        word: "Marhaba",         means: "welcome" },
  { file: "20_chinese_nihao.png",         language: "Mandarin Chinese", text: "你好",         word: "Nǐ hǎo",          means: "you — good" },

  // ---- Second set. Every one re-read off the art before being listed here. ----
  { file: "21_russian_privet.png",        language: "Russian",          text: "Привет",      word: "Privet",          means: "hi (to a friend)" },
  { file: "22_hindi_namaste.png",         language: "Hindi",            text: "नमस्ते",       word: "Namaste",         means: "I bow to you" },
  { file: "23_pidgin_how_far.png",        language: "Nigerian Pidgin",  text: "How far?",    word: "How far?",        means: "how's it going?" },
  { file: "24_marathi_namaskar.png",      language: "Marathi",          text: "नमस्कार",      word: "Namaskar",        means: "I bow to you" },
  { file: "25_telugu_namaskaram.png",     language: "Telugu",           text: "నమస్కారం",     word: "Namaskaram",      means: "I bow to you" },
  { file: "26_swahili_jambo.png",         language: "Swahili",          text: "Jambo",       word: "Jambo",           means: "matters — as in “how are things?”" },
  { file: "27_tagalog_kumusta.png",       language: "Filipino",         text: "Kumusta",     word: "Kumusta",         means: "how are you?" },
  { file: "28_tamil_vanakkam.png",        language: "Tamil",            text: "வணக்கம்",      word: "Vanakkam",        means: "greetings, with respect" },
  { file: "29_persian_salaam.png",        language: "Persian",          text: "سلام",         word: "Salaam",          means: "peace" },
  { file: "30_amharic_selam.png",         language: "Amharic",          text: "ሰላም",         word: "Selam",           means: "peace" },
];

// Where the three land on the splash art, as percentages of the image — the art
// scales with the viewport, so pixels would drift. This is the clear patch of sky
// left of the boy's head, under the two postage stamps and above the toucan;
// they overlap a little on purpose, like stickers stuck on in a hurry.
//
// Widths are 20% smaller than the original 15 / 13 / 12.5 — the bubbles were
// crowding the boy's head. Centred with translate(-50%,-50%), so shrinking `w`
// keeps each one pinned to the same spot in the sky.
export const HELLO_SPOTS = [
  { x: 10.5, y: 41, w: 12,  rot: -7 },
  { x: 20,   y: 33, w: 10.4, rot: 5 },
  { x: 7,    y: 55, w: 10,  rot: 9 },
];
