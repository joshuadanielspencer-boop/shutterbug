// ===========================================================================
// COUNTRY-ARRIVAL MUSIC — short melodies played (synthesized, no files) for a
// few seconds when the traveller lands in a country. Two kinds:
//   1. A handful of RECOGNISABLE public-domain folk/traditional melodies for
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
// `note` is a scientific-pitch name ("C4", "F#5", "Eb4") or "r" for a rest. The
// synth engine (src/shutterbug-world.jsx → MUSIC.countryTune) converts names to
// frequencies and renders them with the named timbre. Keep each tune ~5–9 s.
//
// This is DATA (CLAUDE.md rule 1): melodies + the country→tune mapping live here,
// never inline in the component. Grow the recognisable-tune list over time.
// ===========================================================================

export const TUNES = {
  // ---- Recognisable public-domain melodies (opening phrase) ----
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
  // United States — "When the Saints Go Marching In" (traditional; public domain).
  saints: { timbre: "brass", spb: 0.3, seq: [
    ["C4",1],["E4",1],["F4",1],["G4",2.5],["r",0.5],["C4",1],["E4",1],["F4",1],["G4",2.5],["r",0.5],
    ["C4",1],["E4",1],["F4",1],["G4",1],["E4",1],["C4",1],["E4",1],["D4",2],
  ] },
  // United Kingdom — the Westminster ("Big Ben") chime, bell timbre; public domain.
  westminster: { timbre: "bell", spb: 0.5, seq: [
    ["E4",1],["D4",1],["C4",1],["G3",2],["r",0.5],
    ["C4",1],["E4",1],["D4",1],["G3",2],["r",0.5],
    ["G3",1],["D4",1],["E4",1],["C4",2],
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

// Specific recognisable tunes, by country.
export const COUNTRY_TUNE = {
  "Germany": "odeToJoy",
  "France": "frereJacques",
  "United States": "saints",
  "United Kingdom": "westminster",
  "Mexico": "cucaracha",
  "Australia": "matilda",
};

// Regional motif, by country — gives a country a fitting regional flavour when it
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
