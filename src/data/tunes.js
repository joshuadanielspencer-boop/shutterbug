// ===========================================================================
// COUNTRY-ARRIVAL MUSIC — short melodies played (synthesized, no files) for a
// few seconds when the traveler lands in a country. Two kinds:
//   1. A handful of RECOGNIZABLE public-domain folk/traditional melodies for
//      countries that have a famous one (Ode to Joy, Frère Jacques, …). These
//      are all long-out-of-copyright compositions, played as original synthesis
//      (no recordings), so there is nothing to license.
//   2. REGIONAL STYLE MOTIFS — a short evocative riff in a scale/timbre
//      associated with a region (koto pentatonic for East Asia, a hijaz motif
//      for the Middle East, pan-flute for the Andes, …) — used for every
//      country without a specific tune, so every arrival plays *something*
//      fitting.
//
// Each tune is { timbre, spb (seconds-per-beat), seq: [[note, beats], …] } where
// `note` is a scientific-pitch name ("C4", "F#5", "Eb4") or "r" for a rest. A beat
// is a quarter note, so an eighth is 0.5 and a dotted quarter is 1.5. There is no
// key signature: every note is absolute, so write "E4" for E natural and "Eb4" for
// E flat regardless of what key the melody is in. The synth engine (src/audio.js →
// MUSIC.countryTune) converts names to frequencies and renders them with the timbre.
//
// One entry is ONE PASS of the melody — a single phrase, ~5–9 s. The engine plays
// each arrival's tune through several times with a rest between (see TUNE_PASSES in
// src/audio.js), so don't pad a tune out by typing the phrase twice here; that's the
// engine's job, and this file stays a list of melodies you can check against a score.
//
// This is DATA (CLAUDE.md rule 1): melodies + the country→tune mapping live here,
// never inline in the component. Grow the recognizable-tune list over time.
// ===========================================================================

export const TUNES = {
  // ---- Recognizable public-domain melodies (opening phrase) ----
  // Germany — "Ode to Joy" (Beethoven, 1824; public domain).
  odeToJoy: { timbre: "reed", spb: 0.34, seq: [
    ["E4",1],["E4",1],["F4",1],["G4",1],["G4",1],["F4",1],["E4",1],["D4",1],
    ["C4",1],["C4",1],["D4",1],["E4",1],["E4",1.5],["D4",0.5],["D4",2],
  ] },
  // France — "Frère Jacques" (traditional; public domain).
  frereJacques: { timbre: "music", spb: 0.32, seq: [
    ["C4",1],["D4",1],["E4",1],["C4",1],["C4",1],["D4",1],["E4",1],["C4",1],
    ["E4",1],["F4",1],["G4",2],["E4",1],["F4",1],["G4",2],
  ] },
  // United States — "The Star-Spangled Banner" (melody: John Stafford Smith, c.1780,
  // "To Anacreon in Heaven"; words: Francis Scott Key, 1814 — both long public
  // domain). The opening line only: "O say can you see, by the dawn's early light".
  //
  // In Bb major, 3/4, Maestoso, transcribed note-for-note from the lead sheet at
  // samuelstokesmusic.com/banner/Star-Spangled-Banner-Bb.pdf (which credits Smith
  // and Key and matches the fife setting of the same tune in the John Chambers ABC
  // collection at abcnotation.com). Bar lines, for anyone checking it against a score:
  //   pickup | Bb3 D4 F4 | Bb4 D5 C5 | Bb4 D4 E4 | F4 |
  //
  // "dawn's ear-ly light" is Bb4 → D4 → E4 → F4: a drop of a sixth onto "ear",
  // then the rising mi–fi–sol that is the tune's signature. The E4 on "-ly" is a
  // NATURAL — the raised fourth of Bb major, the single most recognizable interval
  // in the anthem. It is spelled "E4" (not Eb) because this format has no key
  // signature: every note is absolute, so E4 already means E natural.
  starSpangled: { timbre: "brass", spb: 0.5, seq: [
    ["F4",0.75],["D4",0.25],                    // O
    ["Bb3",1],["D4",1],["F4",1],                // say, can you
    ["Bb4",2],["D5",0.75],["C5",0.25],          // see — by the
    ["Bb4",1],["D4",1],["E4",1],                // dawn's ear-ly
    ["F4",3],                                   // light
  ] },
  // United Kingdom — "Rule, Britannia!" (Thomas Arne, 1740; public domain). The
  // opening phrase of the melody, in D major, played on a regal brass timbre.
  // Transcribed from the D-major score at abcnotation.com (Arne march setting).
  ruleBritannia: { timbre: "brass", spb: 0.4, seq: [
    ["A4",0.5],
    ["D5",1],["D5",1],["D5",0.25],["E5",0.25],["F#5",0.25],["G5",0.25],["A5",0.5],["D5",0.5],
    ["E5",1.5],["F#5",0.25],["G5",0.25],["F#5",1],["r",0.5],["A4",0.5],
    ["D5",0.25],["E5",0.25],["D5",0.25],["E5",0.25],["F#5",0.25],["G5",0.25],["F#5",0.25],["G5",0.25],["A5",0.5],["E5",0.5],["F#5",0.5],["E5",0.5],
    ["D5",0.5],["E5",0.25],["F#5",0.25],["E5",0.5],["D5",0.5],["C#5",1.5],["A4",0.5],
    ["D5",2],
  ] },
  // Mexico — "La Cucaracha" (traditional; public domain).
  cucaracha: { timbre: "guitar", spb: 0.26, seq: [
    ["C4",1],["C4",1],["C4",1],["F4",1.5],["A4",0.5],["r",0.5],["C4",1],["C4",1],["C4",1],["F4",1.5],["A4",0.5],["r",0.5],
    ["A4",1],["G4",1],["F4",1],["E4",1],["D4",1],["C4",2],
  ] },
  // Australia — "Waltzing Matilda" (traditional, 1895; public domain) opening.
  matilda: { timbre: "music", spb: 0.3, seq: [
    ["G4",1],["E4",0.5],["E4",0.5],["D4",1],["E4",1],["G4",1],["G4",1],["A4",1],["B4",2],
    ["A4",1],["G4",0.5],["G4",0.5],["E4",1],["G4",1],["A4",2],["G4",2],
  ] },

  // ---- Regional style motifs (evocative, not a specific tune) ----
  // East Asia — koto, major pentatonic (C D E G A).
  eastasia: { timbre: "koto", spb: 0.3, seq: [
    ["A4",1],["G4",0.5],["E4",1.5],["G4",1],["A4",1],["C5",2],["A4",1],["G4",1],["E4",2],["D4",1],["E4",3],
  ] },
  // South Asia — sitar-ish, over a drone (the engine adds a low drone for this one).
  southasia: { timbre: "sitar", spb: 0.28, seq: [
    ["D4",1],["E4",0.5],["F4",1.5],["E4",0.5],["F4",0.5],["A4",2],["G4",1],["F4",1],["E4",1],["D4",3],
  ] },
  // Middle East / North Africa — oud, hijaz scale (D Eb F# G A Bb C).
  mideast: { timbre: "oud", spb: 0.3, seq: [
    ["D4",1],["Eb4",0.5],["F#4",1.5],["G4",1],["F#4",0.5],["Eb4",1.5],["D4",2],["A4",1],["G4",1],["F#4",1],["Eb4",1],["D4",3],
  ] },
  // Latin America — bright guitar, major with a lilt.
  latin: { timbre: "guitar", spb: 0.26, seq: [
    ["G4",0.5],["A4",0.5],["B4",1],["D5",1],["B4",1],["G4",1],["A4",1],["D4",1],["G4",2],["B4",1],["A4",1],["G4",2],
  ] },
  // Caribbean — steel-drum, bright major arpeggios.
  caribbean: { timbre: "steel", spb: 0.24, seq: [
    ["C4",0.5],["E4",0.5],["G4",0.5],["C5",1],["G4",0.5],["E4",1],["F4",0.5],["A4",0.5],["C5",1.5],["G4",1],["E4",1],["C4",2],
  ] },
  // Sub-Saharan Africa — kalimba/marimba, warm pentatonic.
  africa: { timbre: "kalimba", spb: 0.26, seq: [
    ["G4",0.5],["E4",0.5],["D4",0.5],["E4",0.5],["G4",1],["A4",0.5],["G4",0.5],["E4",1],["D4",0.5],["C4",0.5],["D4",1],["E4",0.5],["G4",1.5],
  ] },
  // Andes — pan flute, airy minor pentatonic.
  andes: { timbre: "flute", spb: 0.34, seq: [
    ["A4",1.5],["C5",1],["D5",1.5],["E5",2],["D5",1],["C5",1],["A4",2],["G4",1],["A4",3],
  ] },
  // Slavic / Eastern Europe — brisk minor (balalaika-ish).
  slavic: { timbre: "pluck", spb: 0.22, seq: [
    ["A4",0.5],["B4",0.5],["C5",0.5],["A4",0.5],["B4",1],["E4",1],["A4",0.5],["B4",0.5],["C5",1],["B4",0.5],["A4",0.5],["G#4",1],["A4",2],
  ] },
  // Mediterranean — bouzouki/Greek-ish minor.
  mediterranean: { timbre: "pluck", spb: 0.24, seq: [
    ["E4",0.5],["F4",0.5],["G4",1],["A4",0.5],["G4",0.5],["F4",1],["E4",1],["D4",0.5],["E4",0.5],["F4",1],["E4",2],
  ] },
  // Pacific / island — mellow ukulele major.
  tropical: { timbre: "uke", spb: 0.3, seq: [
    ["C4",0.5],["E4",0.5],["G4",1],["A4",1],["G4",1],["E4",1],["F4",0.5],["A4",0.5],["G4",1.5],["C4",1],["E4",2],
  ] },
  // Fallback — a gentle music-box major.
  generic: { timbre: "music", spb: 0.3, seq: [
    ["C4",1],["E4",1],["G4",1],["C5",1],["B4",1],["G4",1],["A4",1],["F4",1],["G4",2],
  ] },
};

// Specific recognizable tunes, by country.
export const COUNTRY_TUNE = {
  "Germany": "odeToJoy",
  "France": "frereJacques",
  "United States": "starSpangled",
  "United Kingdom": "ruleBritannia",
  "Mexico": "cucaracha",
  "Australia": "matilda",
};

// Regional motif, by country — gives a country a fitting regional flavor when it
// has no specific tune. (Only countries whose *region* differs from a plain
// continent default need listing; everything else falls back to CONTINENT_MOTIF.)
export const COUNTRY_MOTIF = {
  // East Asia
  "China": "eastasia", "Japan": "eastasia", "South Korea": "eastasia", "Taiwan": "eastasia",
  "Mongolia": "eastasia", "Vietnam": "eastasia", "Thailand": "eastasia", "Cambodia": "eastasia",
  "Myanmar": "eastasia", "Malaysia": "eastasia", "Singapore": "eastasia", "Indonesia": "tropical",
  "Philippines": "tropical",
  // South Asia
  "India": "southasia", "Nepal": "southasia", "Pakistan": "southasia", "Sri Lanka": "southasia",
  "Bangladesh": "southasia",
  // Middle East / North Africa
  "Saudi Arabia": "mideast", "United Arab Emirates": "mideast", "Iran": "mideast", "Jordan": "mideast",
  "Turkey": "mideast", "Uzbekistan": "mideast", "Kazakhstan": "mideast",
  "Egypt": "mideast", "Morocco": "mideast", "Tunisia": "mideast", "Algeria": "mideast", "Sudan": "mideast",
  // Mediterranean Europe
  "Greece": "mediterranean", "Italy": "mediterranean", "Spain": "mediterranean", "Portugal": "mediterranean",
  "Croatia": "mediterranean",
  // Slavic / Eastern Europe
  "Russia": "slavic", "Poland": "slavic", "Czechia": "slavic", "Hungary": "slavic", "Romania": "slavic",
  // Andes
  "Peru": "andes", "Bolivia": "andes", "Ecuador": "andes", "Chile": "andes",
  // Caribbean
  "Cuba": "caribbean", "Jamaica": "caribbean", "Haiti": "caribbean", "Trinidad and Tobago": "caribbean",
  "Belize": "caribbean",
};

// Broad fallback by continent.
export const CONTINENT_MOTIF = {
  "North America": "generic",
  "South America": "latin",
  "Europe": "generic",
  "Africa": "africa",
  "Asia": "eastasia",
  "Oceania": "tropical",
  "Antarctica": "generic",
};

// Resolve which tune to play when arriving in a country.
export function tuneKeyFor(country, continent) {
  return COUNTRY_TUNE[country] || COUNTRY_MOTIF[country] || CONTINENT_MOTIF[continent] || "generic";
}
