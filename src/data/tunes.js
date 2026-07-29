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
  //
  // These are ORIGINAL phrases written for this game — they claim to evoke a region's
  // scale and instrument, never to BE any real melody, which is why they can be
  // lengthened freely where the six tunes above cannot (rule 2: a real tune's notes
  // have to come off a score, not out of a guess).
  //
  // Each is now a two-phrase, call-and-response melody rather than the short figure it
  // used to be. That is the whole reason a country tune no longer plays twice: the
  // repeat existed to pad a phrase too short to stand on its own, and a longer phrase
  // is the honest fix. Phrase one opens and leaves the ear hanging; phrase two answers
  // it and settles onto the tonic.
  //
  // East Asia — koto, major pentatonic (C D E G A).
  eastasia: { timbre: "koto", spb: 0.3, seq: [
    ["A4",1],["G4",0.5],["E4",1.5],["G4",1],["A4",1],["C5",2],["A4",1],["G4",1],["E4",2],["D4",1],["E4",2],["r",1],
    ["C5",1],["D5",0.5],["E5",1.5],["D5",1],["C5",1],["A4",2],["G4",1],["E4",1],["G4",1],["A4",1],["G4",1],["E4",3],
  ] },
  // South Asia — sitar-ish, over a drone (the engine adds a low drone for this one).
  southasia: { timbre: "sitar", spb: 0.28, seq: [
    ["D4",1],["E4",0.5],["F4",1.5],["E4",0.5],["F4",0.5],["A4",2],["G4",1],["F4",1],["E4",1],["D4",2],["r",1],
    ["A4",1],["Bb4",0.5],["C5",1.5],["Bb4",0.5],["A4",0.5],["G4",2],["F4",1],["E4",1],["F4",1],["E4",1],["D4",3],
  ] },
  // ---- The Arab world and Turkey, four ways --------------------------------
  //
  // These were ONE motif until 2026-07-28, when Joshua said the Islamic countries
  // all sounded the same. They did: eight of the game's nineteen Muslim-majority
  // countries — Morocco, Algeria, Tunisia, Egypt, Jordan, Saudi Arabia, the UAE and
  // Sudan — shared `mideast`, and Turkey was lumped in with Iran on `persian`,
  // which is a different musical tradition entirely.
  //
  // What is claimed here, and what is not. Each motif is written in a named MAQAM,
  // and the scale content of a maqam is a checkable fact (rule 2) — Hijaz really is
  // D Eb F# G A Bb C, Kurd really is Phrygian, Nahawand really is the natural minor.
  // What is NOT claimed is that any of these is a particular song: they are style
  // motifs in a mode, the same footing as the koto pentatonic for East Asia.
  //
  // The honest caveat, worth knowing before anyone "corrects" these: real maqam
  // practice uses quarter tones that 12-tone equal temperament cannot play. Saba's
  // third and Bayati's second both sit between our notes. These are 12-TET
  // approximations of a modal COLOUR, not transcriptions, and the synth has no way
  // to be otherwise.
  //
  // Naming a real public-domain folk melody for each country would be better still —
  // Turkey's "Kâtibim" is 19th-century and long out of copyright — but writing one
  // down from memory in a teaching tool is exactly the way a wrong note ships, so
  // that wants a score in hand rather than a confident guess.

  // The Levant — oud, maqam Hijaz (D Eb F# G A Bb C). The original motif, now
  // carrying only the countries it fits closest.
  mideast: { timbre: "oud", spb: 0.3, seq: [
    ["D4",1],["Eb4",0.5],["F#4",1.5],["G4",1],["F#4",0.5],["Eb4",1.5],["D4",2],["A4",1],["G4",1],["F#4",1],["Eb4",1],["D4",2],["r",1],
    ["A4",1],["Bb4",0.5],["C5",1.5],["Bb4",1],["A4",1],["G4",2],["F#4",1],["Eb4",1],["F#4",1],["G4",1],["F#4",1],["D4",3],
  ] },
  // The Maghreb — maqam Kurd on D (D Eb F G A Bb C: Phrygian), the mode that runs
  // through the Andalusian nūba repertoire of Morocco, Algeria and Tunisia. Lighter
  // and quicker on its feet than the Hijaz above.
  maghreb: { timbre: "oud", spb: 0.27, seq: [
    ["D4",1],["Eb4",0.5],["F4",0.5],["G4",1],["F4",0.5],["Eb4",0.5],["D4",1.5],["r",0.5],
    ["A4",1],["Bb4",0.5],["A4",0.5],["G4",1],["F4",1],["Eb4",0.5],["F4",0.5],["D4",2],["r",0.5],
    ["F4",0.5],["G4",0.5],["A4",1],["Bb4",0.5],["A4",0.5],["G4",1],["F4",0.5],["Eb4",0.5],["D4",2.5],
  ] },
  // The Gulf — maqam Nahawand on C (the natural minor), taken slowly and squarely.
  // Statelier than the Maghreb motif and a whole tone lower, so the two never read
  // as the same phrase transposed.
  gulf: { timbre: "oud", spb: 0.34, seq: [
    ["C4",1],["D4",0.5],["Eb4",1],["F4",0.5],["G4",1.5],["F4",0.5],["Eb4",1],["D4",1],["C4",1.5],["r",0.5],
    ["G4",1],["Ab4",0.5],["G4",0.5],["F4",1],["Eb4",1],["F4",0.5],["D4",0.5],["C4",2.5],
  ] },
  // The Nile — maqam Saba on D, the mode Egyptian and Sudanese music reaches for
  // when it wants to sound wistful. Its third is a quarter-flat in practice; Gb is
  // the nearest thing 12-TET has, and the drooping shape survives the compromise.
  // On a reed, standing in for the ney.
  nile: { timbre: "reed", spb: 0.32, seq: [
    ["D4",1],["Eb4",0.5],["F4",0.5],["Gb4",1.5],["F4",0.5],["Eb4",1],["D4",1.5],["r",0.5],
    ["F4",1],["Gb4",0.5],["A4",1],["Bb4",1],["A4",0.5],["Gb4",1],["F4",1],["Eb4",0.5],["D4",2.5],
  ] },
  // Turkey — maqam Hicaz on A (A Bb C# D E F G), the Turkish spelling of the same
  // family the Levant motif uses but a fifth up and on a plucked string, for the
  // bağlama. Turkey had been sharing Iran's motif, which is a different tradition:
  // Ottoman/Turkish makam and Persian dastgāh are related but not interchangeable.
  anatolia: { timbre: "sitar", spb: 0.25, seq: [
    ["A4",1],["Bb4",0.5],["C#5",1],["D5",1],["C#5",0.5],["Bb4",1],["A4",1.5],["r",0.5],
    ["E5",1],["F5",0.5],["E5",0.5],["D5",1],["C#5",1],["Bb4",0.5],["C#5",0.5],["A4",2],["r",0.5],
    ["D5",0.5],["C#5",0.5],["Bb4",1],["A4",1],["G4",0.5],["A4",0.5],["Bb4",1],["A4",2.5],
  ] },
  // Latin America — bright guitar, major with a lilt.
  latin: { timbre: "guitar", spb: 0.26, seq: [
    ["G4",0.5],["A4",0.5],["B4",1],["D5",1],["B4",1],["G4",1],["A4",1],["D4",1],["G4",2],["B4",1],["A4",1],["G4",2],["r",1],
    ["D5",0.5],["E5",0.5],["D5",1],["B4",1],["G4",1],["A4",1],["B4",1],["A4",1],["G4",1],["F#4",1],["E4",1],["D4",1],["G4",3],
  ] },
  // Caribbean — steel-drum, bright major arpeggios.
  caribbean: { timbre: "steel", spb: 0.24, seq: [
    ["C4",0.5],["E4",0.5],["G4",0.5],["C5",1],["G4",0.5],["E4",1],["F4",0.5],["A4",0.5],["C5",1.5],["G4",1],["E4",1],["C4",2],["r",1],
    ["E5",0.5],["D5",0.5],["C5",1],["G4",1],["A4",0.5],["G4",0.5],["F4",1],["E4",1],["D4",0.5],["E4",0.5],["F4",1],["E4",1],["C4",3],
  ] },
  // Sub-Saharan Africa — kalimba/marimba, warm pentatonic.
  africa: { timbre: "kalimba", spb: 0.26, seq: [
    ["G4",0.5],["E4",0.5],["D4",0.5],["E4",0.5],["G4",1],["A4",0.5],["G4",0.5],["E4",1],["D4",0.5],["C4",0.5],["D4",1],["E4",0.5],["G4",1.5],["r",1],
    ["C5",0.5],["A4",0.5],["G4",0.5],["A4",0.5],["C5",1],["D5",0.5],["C5",0.5],["A4",1],["G4",0.5],["E4",0.5],["G4",1],["D4",0.5],["C4",2.5],
  ] },
  // Andes — pan flute, airy minor pentatonic.
  andes: { timbre: "flute", spb: 0.34, seq: [
    ["A4",1.5],["C5",1],["D5",1.5],["E5",2],["D5",1],["C5",1],["A4",2],["G4",1],["A4",2],["r",1],
    ["E5",1.5],["G5",1],["E5",1.5],["D5",2],["C5",1],["D5",1],["C5",2],["A4",1],["G4",1],["A4",3],
  ] },
  // Slavic / Eastern Europe — brisk minor (balalaika-ish).
  slavic: { timbre: "pluck", spb: 0.22, seq: [
    ["A4",0.5],["B4",0.5],["C5",0.5],["A4",0.5],["B4",1],["E4",1],["A4",0.5],["B4",0.5],["C5",1],["B4",0.5],["A4",0.5],["G#4",1],["A4",2],["r",1],
    ["E5",0.5],["D5",0.5],["C5",0.5],["B4",0.5],["C5",1],["A4",1],["D5",0.5],["C5",0.5],["B4",1],["A4",0.5],["G#4",0.5],["B4",1],["A4",3],
  ] },
  // Mediterranean — bouzouki/Greek-ish minor.
  mediterranean: { timbre: "pluck", spb: 0.24, seq: [
    ["E4",0.5],["F4",0.5],["G4",1],["A4",0.5],["G4",0.5],["F4",1],["E4",1],["D4",0.5],["E4",0.5],["F4",1],["E4",2],["r",1],
    ["A4",0.5],["B4",0.5],["C5",1],["B4",0.5],["A4",0.5],["G4",1],["F4",1],["G4",0.5],["F4",0.5],["E4",1],["D4",1],["E4",3],
  ] },
  // The Pacific STRING BAND — the small high-strung ukulele and guitar line-up that
  // is the everyday popular music of Tahiti and of Fiji alike, and the continent's
  // fallback bed. It used to carry all eight of the game's Oceanian countries; the
  // three beds below took the Melanesian, Micronesian and Māori ones off it.
  tropical: { timbre: "uke", spb: 0.3, seq: [
    ["C4",0.5],["E4",0.5],["G4",1],["A4",1],["G4",1],["E4",1],["F4",0.5],["A4",0.5],["G4",1.5],["C4",1],["E4",2],["r",1],
    ["G4",0.5],["A4",0.5],["C5",1],["A4",1],["G4",1],["E4",1],["D4",0.5],["F4",0.5],["E4",1.5],["G4",1],["C4",2.5],
  ] },
  // ---- The four crowded beds, split (added 2026-07-28) -----------------------
  //
  // The same complaint Joshua made about the Islamic countries, applied to the four
  // beds that were left carrying seven or eight countries each:
  //
  //   southeastasia  8  Thailand Cambodia Myanmar Vietnam Malaysia Singapore Indonesia Philippines
  //   tropical       8  New Zealand French Polynesia Fiji Vanuatu PNG Solomon Is. New Caledonia Micronesia
  //   latin          7  Brazil Argentina Uruguay Paraguay Colombia Venezuela Guyana
  //   westafrica     7  Mali Senegal Ghana Côte d'Ivoire Nigeria Benin Cameroon
  //
  // Each of those is not a musical region, it is a shape on a map. A gamelan and a
  // Filipino rondalla have nothing in common; a Māori waiata and a Tahitian string
  // band have nothing in common; a tango and a joropo have nothing in common. A child
  // who flies Bangkok → Manila → Jakarta and hears one tune three times learns that
  // "over there" is one place, which is the opposite of what this game is for.
  //
  // The same discipline as the maqam block above: every bed names a real tradition and
  // a real instrument, and the SCALE and RHYTHM it is written in are checkable facts —
  // the kundiman really does turn from minor to its parallel major, the standard bell
  // of Ewe and Yoruba drumming really is the seven-stroke 12/8 pattern, tango really is
  // built on the habanera cell. What is NOT claimed is that any of these is a
  // particular song. They are original phrases evoking a mode and a timbre, which is
  // exactly why they can be written here at all: a real national melody would need
  // notation in hand (rule 2), and this project has already declined to reconstruct
  // two of those from memory.
  //
  // Two caveats worth keeping, both the same shape as the maqam quarter-tone one:
  // Thai and Khmer classical tuning is seven near-EQUIDISTANT steps to the octave,
  // which 12-TET cannot play at all, and traditional Māori waiata move through
  // intervals smaller than a semitone. Both are approximations of a colour.

  // Mainland South-East Asia — Thailand, Cambodia, Myanmar: the three Theravada court
  // ensembles (Thai piphat, Khmer pinpeat, Burmese hsaing waing), all built around a
  // tuned gong-circle and a hardwood xylophone (ranat ek / roneat ek / pattala). The
  // ranat's voice is continuous rapid motion in a high register, which is what this
  // is: an unbroken running line, no rests until the phrase ends.
  piphat: { timbre: "kalimba", spb: 0.18, seq: [
    ["C5",1],["D5",1],["F5",1],["D5",1],["C5",1],["A4",1],["G4",1],["A4",1],
    ["C5",1],["A4",1],["G4",1],["F4",1],["G4",1],["A4",1],["C5",2],["r",1],
    ["F5",1],["D5",1],["C5",1],["D5",1],["F5",1],["G5",1],["F5",1],["D5",1],
    ["C5",1],["A4",1],["G4",1],["A4",1],["C5",1],["A4",1],["G4",1],["F4",2],
  ] },
  // Vietnam — the one mainland South-East Asian country whose court music (nhã nhạc)
  // was modelled on Chinese practice rather than on the Indianized ensembles above,
  // and whose instruments are Sinitic: the đàn tranh zither and the đàn bầu monochord.
  // A zither timbre, and a MINOR pentatonic (A C D E G) where the East Asian bed is
  // major, so Vietnam and China don't collapse into each other either. The 0.5-beat
  // neighbours stand in for the pitch-bending ornament the real instruments live on
  // and a fixed-pitch synth cannot do.
  vietnam: { timbre: "koto", spb: 0.3, seq: [
    ["A4",1],["C5",0.5],["D5",1.5],["C5",0.5],["A4",1.5],["G4",1],["A4",2],["r",0.5],
    ["E5",1],["D5",0.5],["C5",1.5],["D5",1],["C5",0.5],["A4",1.5],["G4",1],["E4",1],["G4",1],["A4",2.5],
  ] },
  // The Malay world — Malaysia and Singapore. The thread is the GAMBUS, a lute
  // descended from the Arab oud and carried into the archipelago by Hadhrami traders,
  // and the zapin it accompanies: a brisk duple dance. Written on a major scale with a
  // flattened seventh, which keeps it clearly apart from the four Arab beds above
  // (Hijaz, Kurd, Nahawand and Saba are all minor-coloured) while owning the lineage.
  // Singapore's population is majority Chinese; Malay is still its national language
  // and the Malay world is the one both countries sit in, which is what this evokes.
  nusantara: { timbre: "oud", spb: 0.22, seq: [
    ["G4",0.5],["A4",0.5],["B4",1],["D5",1],["B4",0.5],["A4",0.5],["G4",1],["F4",1],["G4",1.5],["r",0.5],
    ["D5",0.5],["E5",0.5],["D5",1],["C5",1],["B4",0.5],["C5",0.5],["D5",1],["B4",1],
    ["A4",0.5],["G4",0.5],["F4",1],["G4",2],
    ["A4",1],["G4",1],["F4",1],["G4",2.5],
  ] },
  // The Philippines — the RONDALLA, the plucked-string ensemble (bandurria, laúd,
  // octavina, guitar) the country inherited from three centuries of Spanish rule, and
  // with it European harmony rather than any of the modes around it.
  //
  // The structure is the KUNDIMAN's: the form's defining trait is that it opens in a
  // minor key and turns into the parallel major. Phrase one is D minor, phrase two is
  // D major on the same tonic. That turn is the tune's whole identity, and it is a
  // documented fact about the form rather than a flourish.
  rondalla: { timbre: "guitar", spb: 0.3, seq: [
    ["D4",1],["F4",1],["A4",1],["Bb4",1.5],["A4",0.5],["G4",1],
    ["F4",1],["E4",1],["D4",1],["E4",2],["r",0.5],
    ["D5",1],["A4",1],["F#4",1],["G4",1.5],["A4",0.5],["B4",1],
    ["A4",1],["F#4",1],["E4",1],["D4",2.5],
  ] },
  // Melanesia — Papua New Guinea, the Solomon Islands, Vanuatu, New Caledonia. The
  // sound is interlocking BAMBOO: the 'Are'are panpipe ensembles of Malaita, the
  // stamping tubes of Vanuatu and Kanak New Caledonia, the slit gongs everywhere. The
  // technique is hocket — a melody nobody plays, assembled from parts that alternate —
  // which is why this leaps between two registers instead of walking through one.
  // Nothing like the long single breath of the Andean pan flute, on the same timbre.
  melanesia: { timbre: "flute", spb: 0.26, seq: [
    ["G4",0.5],["D5",0.5],["G4",0.5],["D5",0.5],["A4",0.5],["E5",0.5],["A4",0.5],["E5",0.5],
    ["B4",0.5],["G5",0.5],["B4",0.5],["G5",0.5],["A4",1],["G4",1],["r",0.5],
    ["D5",0.5],["G4",0.5],["E5",0.5],["A4",0.5],["D5",0.5],["G4",0.5],["B4",1],
    ["A4",0.5],["G4",0.5],["E4",0.5],["G4",0.5],["A4",1],["G4",2],
  ] },
  // Micronesia — chant, not song. The traditional music of the Caroline Islands is
  // overwhelmingly vocal: stick-dance and sitting chants that move through a very
  // narrow band of pitch, with the rhythm carrying what melody does elsewhere. So this
  // is four notes inside a fourth, held long, with air between them. Writing Micronesia
  // a tune with a tune in it would be inventing one.
  micronesia: { timbre: "flute", spb: 0.5, seq: [
    ["D4",2],["E4",1],["D4",2],["r",1],["F4",2],["E4",1],["D4",2],
    ["E4",1],["F4",1],["G4",2],["F4",1],["E4",2],["D4",3],
  ] },
  // Aotearoa New Zealand — Māori waiata. The documented trait is the narrow compass:
  // a waiata moves around a central tone within a few steps, and its expression is in
  // rhythm and in intervals finer than a semitone rather than in melodic range. This
  // sits inside a sixth and keeps a firm tread. The reed stands in for the pūtōrino,
  // whose voice is buzzy rather than airy — which is also what keeps it off the flute
  // the Pacific beds above use.
  maori: { timbre: "reed", spb: 0.32, seq: [
    ["A4",1],["A4",0.5],["G4",0.5],["A4",1],["B4",1],["A4",1.5],["G4",0.5],["E4",2],["r",0.5],
    ["G4",1],["A4",0.5],["B4",0.5],["A4",1],["G4",1],["E4",1],["G4",0.5],["A4",0.5],["G4",1],["E4",2.5],
  ] },
  // Brazil — nylon-string violão, and the 3+3+2 division of the bar that runs under
  // samba, choro and everything descended from them. Every bar here is a dotted
  // quarter, a dotted quarter and a quarter; minor, with the choro's chromatic
  // passing note. Portuguese-speaking, and it should not sound like its neighbours.
  brazil: { timbre: "guitar", spb: 0.24, seq: [
    ["A4",1.5],["C5",1.5],["B4",1],["A4",1.5],["G4",1.5],["E4",1],
    ["F4",1.5],["E4",1.5],["D4",1],["E4",2],["r",1],
    ["E5",1.5],["D5",1.5],["C5",1],["B4",1.5],["A4",1.5],["G#4",1],
    ["A4",1.5],["C5",1.5],["B4",1],["A4",3],
  ] },
  // The Río de la Plata — Argentina and Uruguay. TANGO, which UNESCO inscribed in 2009
  // as the shared heritage of both countries, not of one. The bandoneón is a free-reed
  // instrument, so the reed timbre is the literal one; the rhythm is the habanera cell
  // (dotted quarter, eighth, quarter, quarter) that every bar here is built on; minor,
  // with the raised seventh of the harmonic minor leaning on the cadence.
  riodelaplata: { timbre: "reed", spb: 0.28, seq: [
    ["A4",1.5],["A4",0.5],["C5",1],["B4",1],["A4",1.5],["G#4",0.5],["B4",1],["A4",1],
    ["F4",1.5],["E4",0.5],["D4",1],["E4",1],["A4",2],["r",1],
    ["E5",1.5],["E5",0.5],["D5",1],["C5",1],["B4",1.5],["A4",0.5],["G#4",1],["A4",1],
    ["C5",1.5],["B4",0.5],["A4",1],["G#4",1],["A4",3],
  ] },
  // The Llanos — Colombia and Venezuela. The JOROPO of the Orinoco plains, which is
  // the music of a region that straddles the border rather than of either country:
  // arpa llanera (a diatonic harp), cuatro and maracas, fast, and built on the
  // sesquiáltera — six beats heard first as 3+3 and then as 2+2+2, in the same phrase.
  // Both groupings are written out below; that flip is the whole feel of it.
  llanero: { timbre: "pluck", spb: 0.22, seq: [
    ["D5",0.5],["C#5",0.5],["B4",0.5],["A4",0.5],["G4",0.5],["F#4",0.5],
    ["E4",1],["G4",1],["B4",1],["A4",1.5],["r",0.5],
    ["A4",0.5],["B4",0.5],["C#5",0.5],["D5",0.5],["E5",0.5],["F#5",0.5],
    ["E5",1],["C#5",1],["A4",1],["B4",1],["A4",1],["G4",1],
    ["F#4",1.5],["E4",0.5],["D4",2],
  ] },
  // Paraguay — the Paraguayan HARP and the polca paraguaya, which carries the same
  // 6/8-against-3/4 cross-rhythm as the joropo above but at a lyrical walk instead of
  // a gallop, and in a warmer major. The two are cousins; taken at the same speed on
  // the same timbre they would be indistinguishable, which is why they aren't.
  paraguay: { timbre: "music", spb: 0.3, seq: [
    ["D5",1.5],["B4",0.5],["G4",1],["A4",1.5],["B4",0.5],["C5",1],
    ["B4",1],["A4",1],["G4",1],["A4",2],["r",0.5],
    ["B4",1.5],["D5",0.5],["G5",1],["F#5",1.5],["E5",0.5],["D5",1],
    ["C5",1],["B4",1],["A4",1],["G4",3],
  ] },
  // The Gulf of Guinea — Ghana and Côte d'Ivoire. Balafon country: the gyil of northern
  // Ghana, the Senufo and Baule balafons across the border, low and wooden where the
  // Mande kora is high and bright.
  //
  // The rhythm is the thing. Every four bars below place their notes on the SEVEN-STROKE
  // STANDARD BELL — the 12/8 timeline (onsets on eighths 1, 3, 5, 6, 8, 10, 12) that
  // Ewe and Akan drumming is organised around, and that crossed the Atlantic to become
  // the bembé bell. It is a documented pattern, not a feel, so it can be written down
  // exactly: the durations here are that pattern and nothing else.
  guineacoast: { timbre: "kalimba", spb: 0.2, seq: [
    ["E3",1],["G3",1],["A3",0.5],["B3",1],["A3",1],["G3",1],["E3",0.5],
    ["B3",1],["D4",1],["B3",0.5],["A3",1],["G3",1],["A3",1],["B3",0.5],
    ["D4",1],["E4",1],["D4",0.5],["B3",1],["A3",1],["G3",1],["E3",0.5],
    ["G3",1],["A3",1],["B3",0.5],["D4",1],["B3",1],["A3",1],["E3",0.5],
  ] },
  // Yorubaland — Nigeria and Benin, which is one culture across a colonial border
  // (Yoruba in south-western Nigeria and south-eastern Benin, Fon beside it). The
  // AGOGÔ is an iron double bell, so the bell timbre is the literal instrument, and
  // the two alternating pitches at the top and tail are what a double bell does.
  // Between them the line moves the way the dùndún talking drum does — in small steps
  // around a repeated tone, because it is imitating the tones of speech, which is also
  // why it stays inside a fifth.
  yoruba: { timbre: "bell", spb: 0.28, seq: [
    ["G4",0.5],["C5",0.5],["G4",0.5],["C5",1],["G4",0.5],["C5",0.5],["C5",0.5],["G4",1],["r",0.5],
    ["A4",0.5],["A4",0.5],["C5",1],["A4",0.5],["G4",0.5],["A4",1],
    ["C5",0.5],["D5",0.5],["C5",1],["A4",0.5],["G4",0.5],["A4",1.5],
    ["G4",0.5],["C5",0.5],["G4",0.5],["C5",1],["A4",0.5],["G4",0.5],["A4",0.5],["G4",2],
  ] },
  // ---- Finer regional beds (added 2026-07-20) --------------------------------
  // Four buckets were doing far too much work: one "africa" bed covered nineteen
  // countries from Senegal to Madagascar, one "mideast" bed covered twelve from
  // Morocco to Kazakhstan, and "generic" covered eighteen including all of
  // Scandinavia and Central America. A child flying Cairo → Tashkent → Marrakesh
  // heard the same eight bars three times and learned that "over there" all sounds
  // alike, which is the opposite of what this game is for.
  //
  // Every one of these is an ORIGINAL phrase evoking a region's scale and its
  // characteristic instrument. None claims to be a real tune — that distinction is
  // what lets them be written freely, where a national melody would need notation
  // off a score (rule 2).

  // The Mande world — Mali and Senegal, and the kora/balafon of the jeli (griot)
  // tradition that runs through Mali, Senegal, the Gambia and Guinea. Bright major
  // pentatonic with an off-beat lilt.
  //
  // This bed used to be called `westafrica` and carried seven countries — the whole
  // coast from Senegal to Cameroon. It now carries the two it actually describes; see
  // the block below TUNES.tropical for the Gulf-of-Guinea beds that took the rest.
  mande: { timbre: "kalimba", spb: 0.24, seq: [
    ["C5",0.5],["G4",0.5],["A4",0.5],["C5",0.5],["D5",1],["C5",0.5],["A4",0.5],["G4",1],
    ["A4",0.5],["C5",0.5],["D5",0.5],["E5",0.5],["D5",1],["C5",0.5],["A4",0.5],["G4",1.5],["r",0.5],
    ["G5",0.5],["E5",0.5],["D5",0.5],["C5",0.5],["A4",1],["G4",0.5],["A4",0.5],["C5",1],
    ["D5",0.5],["C5",0.5],["A4",0.5],["G4",0.5],["E4",1],["G4",0.5],["A4",0.5],["C5",2],
  ] },
  // East Africa — the wistful pentatonic colour of an Ethiopian tizita, on a lyre-
  // like pluck. Minor-leaning, unhurried.
  eastafrica: { timbre: "pluck", spb: 0.3, seq: [
    ["D4",1],["F4",0.5],["G4",1.5],["A4",1],["G4",0.5],["F4",1.5],["D4",2],
    ["F4",1],["G4",0.5],["A4",1.5],["C5",1],["A4",1],["G4",2],["r",0.5],
    ["A4",1],["C5",0.5],["D5",1.5],["C5",1],["A4",1],["G4",1],["F4",1],
    ["G4",0.5],["F4",0.5],["D4",1],["F4",1],["D4",2.5],
  ] },
  // Southern Africa — warm, hymn-like major thirds, the mbira's ringing overtones.
  southernafrica: { timbre: "bell", spb: 0.28, seq: [
    ["G4",1],["B4",1],["D5",1],["B4",1],["G4",1],["A4",1],["B4",2],
    ["C5",1],["B4",1],["A4",1],["G4",1],["E4",1],["G4",1],["A4",2],["r",0.5],
    ["D5",1],["B4",1],["G4",1],["A4",1],["B4",1],["G4",1],["E4",2],
    ["G4",1],["A4",1],["B4",1],["A4",1],["G4",3],
  ] },
  // Nordic — a modal fiddle air, minor with a raised sixth; open and cold.
  nordic: { timbre: "reed", spb: 0.26, seq: [
    ["D4",1],["E4",0.5],["F4",1.5],["A4",1],["G4",0.5],["F4",0.5],["E4",1],
    ["D4",1],["F4",1],["A4",1],["Bb4",1],["A4",1],["G4",1],["F4",1.5],["r",0.5],
    ["A4",1],["Bb4",0.5],["C5",1.5],["Bb4",1],["A4",1],["G4",2],
    ["F4",1],["E4",1],["D4",1],["E4",1],["D4",2.5],
  ] },
  // Alpine — a lilting three-four waltz, major and open, with a horn-ish reed.
  alpine: { timbre: "brass", spb: 0.3, seq: [
    ["G4",1],["B4",1],["D5",1],["G5",1.5],["D5",0.5],["B4",1],
    ["C5",1],["E5",1],["C5",1],["A4",1.5],["F#4",0.5],["A4",1],
    ["B4",1],["D5",1],["G5",1],["F#5",1.5],["E5",0.5],["D5",1],["r",0.5],
    ["E5",1],["D5",1],["C5",1],["B4",1],["A4",1],["G4",2.5],
  ] },
  // Ireland — a REEL, even-time and driving, deliberately unlike the 6/8 Scottish
  // jigs the rest of the game is scored to, so Ireland doesn't sound like the menu.
  celtic: { timbre: "reed", spb: 0.19, seq: [
    ["D4",1],["E4",1],["F#4",1],["G4",1],["A4",1],["B4",1],["A4",1],["F#4",1],
    ["G4",1],["E4",1],["D4",1],["E4",1],["F#4",1],["G4",1],["A4",2],
    ["B4",1],["C#5",1],["D5",1],["E5",1],["D5",1],["B4",1],["A4",1],["F#4",1],
    ["G4",1],["A4",1],["B4",1],["A4",1],["F#4",1],["E4",1],["D4",2],
  ] },
  // Central America — marimba, bright and rolling in parallel thirds.
  centralamerica: { timbre: "kalimba", spb: 0.26, seq: [
    ["C5",0.5],["E5",0.5],["G5",1],["E5",0.5],["C5",0.5],["D5",1],
    ["F5",0.5],["A5",0.5],["G5",1],["E5",0.5],["C5",0.5],["D5",1],
    ["E5",0.5],["D5",0.5],["C5",1],["A4",0.5],["G4",0.5],["A4",1],["r",0.5],
    ["G4",0.5],["C5",0.5],["E5",1],["G5",0.5],["E5",0.5],["C5",1],
    ["D5",0.5],["F5",0.5],["A5",1],["G5",1],["E5",0.5],["C5",0.5],["G4",1],["C5",2],
  ] },
  // Japan — koto in a hirajoshi-flavoured scale (the semitone steps are the whole
  // character of it), sparse and deliberate.
  japan: { timbre: "koto", spb: 0.34, seq: [
    ["D4",1.5],["Eb4",0.5],["G4",2],["A4",1],["Bb4",1.5],["A4",0.5],["G4",2],
    ["A4",1],["Bb4",1],["D5",2],["Bb4",1],["A4",1],["G4",1.5],["r",0.5],
    ["D5",1.5],["Bb4",0.5],["A4",2],["G4",1],["Eb4",1],["D4",3],
  ] },
  // South-East Asia — the bell-metal shimmer of a gamelan; a slendro-ish spacing.
  southeastasia: { timbre: "bell", spb: 0.3, seq: [
    ["D4",1],["E4",1],["G4",1.5],["A4",0.5],["C5",2],["A4",1],["G4",1],["E4",1.5],["r",0.5],
    ["G4",1],["A4",1],["C5",1.5],["D5",0.5],["E5",2],["D5",1],["C5",1],["A4",1.5],["r",0.5],
    ["C5",1],["A4",1],["G4",1],["E4",1],["D4",2.5],
  ] },
  // Central Asia — a dombra's open fifths under a stepping modal line.
  centralasia: { timbre: "pluck", spb: 0.22, seq: [
    ["D4",0.5],["A4",0.5],["D4",0.5],["A4",0.5],["G4",1],["F4",1],["E4",1],["D4",1],
    ["F4",0.5],["A4",0.5],["F4",0.5],["A4",0.5],["Bb4",1],["A4",1],["G4",1],["F4",1],
    ["A4",0.5],["D5",0.5],["A4",0.5],["D5",0.5],["C5",1],["Bb4",1],["A4",1],["G4",1],["r",0.5],
    ["F4",1],["E4",1],["D4",1],["E4",1],["D4",2.5],
  ] },
  // Persia — the shimmer of a santur, with the augmented step that colours the mode.
  persian: { timbre: "sitar", spb: 0.26, seq: [
    ["D4",1],["Eb4",0.5],["F#4",1],["G4",1],["A4",1.5],["G4",0.5],["F#4",1],["Eb4",1],
    ["D4",1.5],["r",0.5],["A4",1],["Bb4",0.5],["C5",1],["D5",1.5],["C5",0.5],["Bb4",1],
    ["A4",1],["G4",1],["F#4",1],["Eb4",1],["D4",2.5],
  ] },
  // The polar bed — Antarctica and Greenland. Almost nothing: three slow bell tones
  // and a lot of air. There is no folk music of the ice, and inventing one would be
  // a lie about a place nobody is from; emptiness is the honest evocation.
  polar: { timbre: "bell", spb: 0.5, seq: [
    ["D5",3],["A4",2],["r",1],["F5",3],["D5",2],["r",1],["A4",2],["D5",4],
  ] },
  // Fallback — a gentle music-box major.
  // Canada — the last country of any size still landing on `generic`, and with ten
  // places it was easily the biggest hole in the map's sound: a child could photograph
  // Banff, Niagara and the Bay of Fundy and hear the same neutral music box each time.
  //
  // This is an ORIGINAL bed, like every other one here, not a national tune. That is
  // deliberate. The obvious "Canadian melody" is a French-Canadian voyageur song, and
  // the ones a child would know are exactly the ones this project has already refused
  // to reconstruct from memory (see the note on La Cucaracha). Writing our own costs
  // nothing and is honest.
  //
  // It is a PADDLING song: a rolling, two-beat lilt in G, the shape of the canoe
  // songs the voyageurs actually sang to keep a stroke rate — call in the low
  // register, answer up an octave, the way a work song trades between a leader and
  // the boat. Fiddle-ish reed, but slower and rounder than the Irish reel, so Canada
  // and Ireland can't be mistaken for one another.
  canada: { timbre: "reed", spb: 0.25, seq: [
    ["G4",1],["G4",0.5],["A4",0.5],["B4",1],["D5",1],["B4",1],["A4",1],["G4",1.5],["r",0.5],
    ["A4",1],["A4",0.5],["B4",0.5],["C5",1],["E5",1],["C5",1],["B4",1],["A4",1.5],["r",0.5],
    ["D5",1],["D5",0.5],["C5",0.5],["B4",1],["G4",1],["B4",1],["C5",1],["D5",2],
    ["B4",1],["A4",1],["G4",1],["E4",1],["D4",1],["G4",1],["G4",2.5],
  ] },
  generic: { timbre: "music", spb: 0.3, seq: [
    ["C4",1],["E4",1],["G4",1],["C5",1],["B4",1],["G4",1],["A4",1],["F4",1],["G4",2],["r",1],
    ["E5",1],["D5",1],["C5",1],["A4",1],["G4",1],["E4",1],["F4",1],["D4",1],["C4",3],
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
  // East Asia — split apart in 2026-07. One "eastasia" koto bed used to cover
  // eleven countries from Japan to Myanmar; Japan, China and mainland South-East
  // Asia don't sound remotely alike and shouldn't here either.
  "Japan": "japan",
  "China": "eastasia", "Taiwan": "eastasia", "South Korea": "eastasia",
  // South-East Asia — one gamelan bed used to cover all eight of these. Five now.
  // `southeastasia` IS the gamelan bed, so it keeps the country gamelan is from.
  "Indonesia": "southeastasia",                                               // gamelan
  "Thailand": "piphat", "Cambodia": "piphat", "Myanmar": "piphat",            // gong-circle + xylophone
  "Vietnam": "vietnam",                                                       // zither, Sinitic sphere
  "Malaysia": "nusantara", "Singapore": "nusantara",                          // gambus + zapin
  "Philippines": "rondalla",                                                  // plucked strings, kundiman
  "Mongolia": "centralasia",
  // South Asia
  "India": "southasia", "Nepal": "southasia", "Pakistan": "southasia", "Sri Lanka": "southasia",
  "Bangladesh": "southasia",
  // Arabic-speaking North Africa and the Gulf keep the hijaz oud bed. Turkey, Iran
  // and the Central Asian republics get their own: lumping a Kazakh dombra in with a
  // Moroccan oud was the clearest case of "everything over there sounds the same".
  // Four motifs across the Arab world instead of one — see the block above TUNES.mideast.
  "Jordan": "mideast",                                                        // Levant, Hijaz
  "Morocco": "maghreb", "Algeria": "maghreb", "Tunisia": "maghreb",           // Andalusian, Kurd
  "Saudi Arabia": "gulf", "United Arab Emirates": "gulf",                     // Khaliji, Nahawand
  "Egypt": "nile", "Sudan": "nile",                                           // Saba, on a ney
  "Iran": "persian", "Turkey": "anatolia",                                    // NOT the same tradition
  "Uzbekistan": "centralasia", "Kazakhstan": "centralasia",
  // Mediterranean Europe
  "Greece": "mediterranean", "Italy": "mediterranean", "Spain": "mediterranean", "Portugal": "mediterranean",
  "Croatia": "mediterranean",
  // Malta was falling through to `generic` — an island in the middle of the
  // Mediterranean playing a neutral music box. Its own folk singing, għana, sits
  // squarely between Sicily and North Africa, which is what this bed already is.
  "Malta": "mediterranean",
  // Slavic / Eastern Europe
  "Russia": "slavic", "Poland": "slavic", "Czechia": "slavic", "Hungary": "slavic", "Romania": "slavic",
  // Northern and Alpine Europe — these were all falling through to "generic".
  "Norway": "nordic", "Sweden": "nordic", "Denmark": "nordic", "Finland": "nordic", "Iceland": "nordic",
  "Austria": "alpine", "Switzerland": "alpine",
  "Ireland": "celtic",
  "Netherlands": "alpine", "Belgium": "alpine",
  // Africa — one bed for nineteen countries became four in 2026-07, and six now. The
  // old `westafrica` bed ran from Senegal to Cameroon, which is three musical worlds
  // and one UN sub-region. Cameroon is Middle Africa in the UN geoscheme and a CEMAC
  // member, and it goes to the central bed where it belongs; Madagascar and DR Congo
  // were already there.
  "Mali": "mande", "Senegal": "mande",                                        // kora/balafon, jeli
  "Ghana": "guineacoast", "Côte d'Ivoire": "guineacoast",                     // gyil, the 12/8 bell
  "Nigeria": "yoruba", "Benin": "yoruba",                                     // agogô, talking drum
  "Cameroon": "africa",
  "Ethiopia": "eastafrica", "Kenya": "eastafrica", "Tanzania": "eastafrica",
  "Uganda": "eastafrica", "Rwanda": "eastafrica",
  "South Africa": "southernafrica", "Namibia": "southernafrica", "Botswana": "southernafrica",
  "Zimbabwe": "southernafrica", "Zambia": "southernafrica",
  // Andes
  "Peru": "andes", "Bolivia": "andes", "Ecuador": "andes", "Chile": "andes",
  // The rest of South America — the `latin` bed carried these seven and is now the
  // continent's fallback only. Brazil is its own language and its own music; the tango
  // belongs to two countries and the joropo to two others; Paraguay's harp is neither.
  "Brazil": "brazil",                                                         // violão, 3+3+2
  "Argentina": "riodelaplata", "Uruguay": "riodelaplata",                     // tango, habanera cell
  "Colombia": "llanero", "Venezuela": "llanero",                              // joropo, arpa llanera
  "Paraguay": "paraguay",                                                     // Paraguayan harp
  // Caribbean. Guyana is on the South American mainland and in the Caribbean
  // everywhere else that counts — English-speaking, CARICOM, and its music is
  // calypso, soca and chutney. It was on the Latin bed, which fits it worst of all.
  "Cuba": "caribbean", "Jamaica": "caribbean", "Haiti": "caribbean", "Trinidad and Tobago": "caribbean",
  "Belize": "caribbean", "Guyana": "caribbean",
  // Central America — marimba country, and nothing like the Caribbean steel drum.
  "Guatemala": "centralamerica", "Honduras": "centralamerica", "Nicaragua": "centralamerica",
  "Costa Rica": "centralamerica", "Panama": "centralamerica",
  // Oceania — the continent fallback (`tropical`, the string band) was carrying all
  // eight countries. The three cultural regions of the Pacific are not a judgement
  // call, they are the standard division of it, and they do not sound alike.
  "Papua New Guinea": "melanesia", "Solomon Is.": "melanesia",                // Melanesia
  "Vanuatu": "melanesia", "New Caledonia": "melanesia",
  "Micronesia": "micronesia",                                                 // Micronesia
  "New Zealand": "maori",                                                     // Aotearoa
  // French Polynesia and Fiji stay on the string band, which is genuinely the
  // everyday music of both. Fiji is Melanesian by geography and long Polynesian by
  // contact; the panpipe-and-stamping-tube bed above is the Solomons and Vanuatu, not
  // Fiji, so putting it there to tidy the map would have been the wrong claim.
  // The ice. See the note on the `polar` bed.
  "Antarctica": "polar", "Greenland": "polar",
  // Canada gets its own paddling bed rather than the continent's fallback.
  "Canada": "canada",
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
