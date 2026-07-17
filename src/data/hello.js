// ===========================================================================
// THE SPLASH GREETINGS — speech bubbles that say hello in eighteen languages.
//
// Three are picked at random each time the splash is shown, and hovering one
// speaks it aloud in that language (via speakGreeting, which maps `language` to
// a voice — so the name here must match a key in SPEECH_LANG in audio.js).
//
// Rule 2 applies to this file as much as to any fact: `text` is what the bubble
// ACTUALLY SAYS, read off each image, not what its filename claims. Two of the
// twenty delivered bubbles were mislabelled — 02_russian_privet.png and
// 12_hindi_namaste.png are both pictures of "¡Hola!" — so Russian and Hindi are
// absent here rather than wrong. A bubble reading ¡Hola! that a child hovers and
// hears "Привет" teaches them something false in the one place the game's whole
// promise is that it doesn't. Redraw those two and they can join the list.
//
// Note "Sannu" is filed as HAUSA, not "Nigerian": Nigeria has some five hundred
// languages, and naming one of them after the country would be its own small lie.
// ===========================================================================

export const HELLO_BUBBLES = [
  { file: "01_french_bonjour.png",        language: "French",           text: "Bonjour",     word: "Bonjour" },
  { file: "03_japanese_konnichiwa.png",   language: "Japanese",         text: "こんにちは",    word: "Konnichiwa" },
  { file: "04_korean_annyeonghaseyo.png", language: "Korean",           text: "안녕하세요",    word: "Annyeonghaseyo" },
  { file: "05_german_hallo.png",          language: "German",           text: "Hallo",       word: "Hallo" },
  { file: "06_italian_ciao.png",          language: "Italian",          text: "Ciao",        word: "Ciao" },
  { file: "07_turkish_merhaba.png",       language: "Turkish",          text: "Merhaba",     word: "Merhaba" },
  { file: "08_greek_geia_sou.png",        language: "Greek",            text: "Γεια σου",    word: "Geia sou" },
  { file: "09_portuguese_ola.png",        language: "Portuguese",       text: "Olá",         word: "Olá" },
  { file: "10_thai_sawasdee.png",         language: "Thai",             text: "สวัสดี",       word: "Sawasdee" },
  { file: "11_vietnamese_xin_chao.png",   language: "Vietnamese",       text: "Xin chào",    word: "Xin chào" },
  { file: "13_bengali_nomoskar.png",      language: "Bengali",          text: "নমস্কার",      word: "Nomoskar" },
  { file: "14_indonesian_halo.png",       language: "Indonesian",       text: "Halo",        word: "Halo" },
  { file: "15_urdu_salaam.png",           language: "Urdu",             text: "سلام",         word: "Salaam" },
  { file: "16_nigerian_sannu.png",        language: "Hausa",            text: "Sannu",       word: "Sannu" },
  { file: "17_english_hello.png",         language: "English",          text: "Hello",       word: "Hello" },
  { file: "18_spanish_hola.png",          language: "Spanish",          text: "¡Hola!",      word: "¡Hola!" },
  { file: "19_arabic_marhaba.png",        language: "Arabic",           text: "مرحبا",        word: "Marhaba" },
  { file: "20_chinese_nihao.png",         language: "Mandarin Chinese", text: "你好",         word: "Nǐ hǎo" },
];

// Where the three land on the splash art, as percentages of the image — the art
// scales with the viewport, so pixels would drift. This is the clear patch of sky
// left of the boy's head, under the two postage stamps and above the toucan;
// they overlap a little on purpose, like stickers stuck on in a hurry.
export const HELLO_SPOTS = [
  { x: 10.5, y: 41, w: 15, rot: -7 },
  { x: 20,   y: 33, w: 13, rot: 5 },
  { x: 7,    y: 55, w: 12.5, rot: 9 },
];
