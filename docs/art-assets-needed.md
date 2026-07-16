# Shutterbug — art assets to generate

A hand-off list for generating game art (e.g. with ChatGPT), pulled from what the
game actually tracks and renders. Names and counts below are the *exact* in-game
values, so once the files land they wire straight in.

## Progress (2026-07-16)

**31 of 73 delivered, installed, and wired in.** §1 difficulty emblems (4), §2 game-mode
icons (6), §3 theme crests (7), §5 category badges (14). All on-spec: 512×512, genuinely
transparent, no baked-in text, and they map 1:1 onto the game's real keys.

They live in `public/assets/shutterbug-ui/{difficulty,modes,themes,badges}/`, are listed
in **`src/data/art.js`** (the one registry — add a batch by editing that file), and
`test/art.test.js` fails if a key has no file behind it or a file no key.

**Still needed — 42:** §4 ranks (6), §6 mega-badges (3), §7 medals (7), §8 roundels (7),
§9 rosettes (3), §10 unlock seal (1), §11 mastery marker (1), §12 transport (12 + 2).
Until those land, their badges keep rendering the greyscale emoji they use today — the
passport is deliberately mixed rather than blocked.

### Notes for the next batch

- **Keep the `category-<badge-name>-badge.png` naming convention** — it's what `art.js`
  already maps from, and it's consistent across all 31.
- **Ship one copy, not two.** The 1-5 drop had `batch-01`/`batch-02` folders that were
  byte-identical duplicates of the `-transparent-png` folders.
- **512×512 is right; don't go bigger.** The art arrives ~400 KB each and gets quantized
  to a 256-colour palette (~28% of the bytes, visually identical) by
  `node scripts/optimize-ui-art.mjs`. Run it after dropping a batch in — the PWA
  precaches every PNG, so each megabyte lands on the iPad at install time.
- **Per-place mastery: ONE generic marker**, NOT one per location — there are 437. See §11.
- **Country-stamp overlays** (mastered/visited) are still worth doing — see §8.

### The landscape "mode cards" — a good idea, incomplete

The drop also included `named-mode-difficulty-icons/`: a **second, different art style**
(flatter, softer, no gold rim) at off-spec sizes — circular difficulty badges at 1254²,
and landscape 3:2 mode "cards" at 1536×1024. Set aside for now, and the 512 sets used
instead, because that folder covers **only 4 of the 6 modes** (no Journeys, no Daily
Expedition) and mixing two styles on one screen looks like a mistake.

The landscape cards are genuinely promising — they'd fill the whole mode card rather than
sit as an icon on paper. **To use them: draw Journeys + Daily Expedition to match, at
1536×1024.** Then it's a straight swap in `MODE_ART`.

---

## Universal spec (applies to EVERY asset below)

- **Format:** PNG, **transparent background**.
- **Canvas:** **square**, **512×512 px** (crisp when scaled down to badge/icon size;
  never scaled up).
- **NO baked-in text.** Names, numbers, "X / Y", and locked/greyed states all render
  live in code. A badge shows a *motif*, not a word. (One exception: a wax-seal style
  emblem may include a short generic word like "UNLOCKED" if it's part of the art.)
- **Only the earned / full-colour version is needed.** The locked (greyed / desaturated)
  state is generated in code from the colour art.
- **One subject, centred, generous padding** so nothing clips when masked into a circle
  or rounded square.

### House style (so everything reads as one set)

Warm **vintage adventure-atlas / mid-century press-photographer scrapbook** look —
the same world as the passport stamps, airmail borders, brass map corners and
Grandpa Nigel's Scottish study already in the game. Hand-illustrated, slightly worn,
friendly (it's for kids). Use the game palette:

| Role | Hex |
|---|---|
| Cream paper | `#F4ECD8` |
| Paper line / tan | `#D8C79E` |
| Ink (near-black) | `#10262E` |
| Teal (ocean) | `#15606E` / deep `#0E4A56` |
| Coral (accent) | `#E15C42` |
| Gold | `#F0A500` |
| Green | `#3E9B6E` |
| Sea blue | `#1E4E82` |

Motif conventions that already exist in-game and should carry through: **enamel
lapel pins** for collectible badges, **rubber-stamp / passport-stamp** ink for
travel marks, **embroidered scout patches** for difficulty, **wax seals** for
unlocks, **prize rosettes / medals** for records.

---

## 1. Difficulty tier emblems — 4

Little **embroidered-patch / rank-insignia** style, one per tier, reading as a clear
progression (e.g. rising number of pips, chevrons, or star tier). Shown on the
difficulty selector.

| # | Name (in game) | Audience | Suggested motif | Filename |
|---|---|---|---|---|
| 1 | **Scout** | ages 5–7 | one pip / a single compass star | `difficulty-scout.png` |
| 2 | **Explorer** | ages 8–10 | two pips / a map-and-magnifier | `difficulty-explorer.png` |
| 3 | **Adventurer** | ages 11–13 | three pips / a mountain-and-flag | `difficulty-adventurer.png` |
| 4 | **Expert** | high-school+ | four pips / a laurel or globe crest | `difficulty-expert.png` |

## 2. Game-mode icons — 6

An illustrated icon/emblem per mode (today the mode cards use a location photo + an
emoji; dedicated icons look far better). Roughly circular or badge-shaped.

| Mode | What it is | Suggested motif | Filename |
|---|---|---|---|
| **Assignments** | the core deduce-the-place game | a camera + editor's telegram/letter | `mode-assignments.png` |
| **Grand Tour** | plan the most efficient round-the-world route | a suitcase + dotted flight path | `mode-grand-tour.png` |
| **Explore** | free-roam, no timer | a compass rose | `mode-explore.png` |
| **Quiz** | geography quiz | a brain / question-card | `mode-quiz.png` |
| **Journeys** | retrace a real expedition, stop by stop | a canoe / trail map | `mode-journeys.png` |
| **Daily Expedition** | one shared seeded run per day | a wall calendar / "today" page | `mode-daily.png` |

## 3. Themed Expedition emblems — 7

The Grand Tour's theme picker. Small round crests.

| Theme | Motif | Filename |
|---|---|---|
| **Classic** (whole world) | a globe / die | `theme-classic.png` |
| **Wildlife Safari** | a lion / animal | `theme-wildlife.png` |
| **Ring of Fire** (volcanoes) | a volcano | `theme-volcano.png` |
| **Roof of the World** (mountains) | a peak | `theme-mountain.png` |
| **Chasing Waterfalls** | a waterfall | `theme-waterfall.png` |
| **Ancient Wonders** (ruins) | a classical column/temple | `theme-ruins.png` |
| **World Heritage** | the UNESCO-style globe-and-shield | `theme-heritage.png` |

---

## 4. Career-rank insignia — 6

An **escalating press-pass / press-badge** series (the player's overall career
level, shown on the passport ID page). Each grander than the last.

| Tier | Rank (earned at N mastered places) | Filename |
|---|---|---|
| 1 | **Cub Reporter** (0) | `rank-1-cub-reporter.png` |
| 2 | **Field Stringer** (10) | `rank-2-field-stringer.png` |
| 3 | **Roving Correspondent** (25) | `rank-3-roving-correspondent.png` |
| 4 | **Bureau Chief** (50) | `rank-4-bureau-chief.png` |
| 5 | **Globe Editor** (100) | `rank-5-globe-editor.png` |
| 6 | **Photographer Laureate** (200) | `rank-6-photographer-laureate.png` |

## 5. Category badges — 14 (enamel-pin style, shared frame, distinct motif)

Earned by photographing every place of that category. Each is an **enamel lapel pin**
sharing one frame shape, with a distinct central motif. (These map 1:1 to the game's
14 subject categories.)

| Badge name | Category it's for | Motif | Filename |
|---|---|---|---|
| **Peak Bagger** | Mountains | mountain peak | `badge-mountain.png` |
| **Volcano Hunter** | Volcanoes & Geysers | volcano | `badge-volcano.png` |
| **Waterfall Chaser** | Waterfalls | waterfall | `badge-waterfall.png` |
| **River Runner** | Rivers & Lakes | river bend / lake | `badge-waterway.png` |
| **Desert Wanderer** | Deserts | dune + sun | `badge-desert.png` |
| **Polar Explorer** | Frozen Wonders | iceberg / snowflake | `badge-ice.png` |
| **Island Hopper** | Coasts & Islands | palm island | `badge-coast.png` |
| **Rockhound** | Rock Formations | rock arch / boulder | `badge-rock.png` |
| **Safari Ranger** | Wildlife | lion / paw | `badge-wildlife.png` |
| **Time Traveler** | Ancient Wonders (ruins) | classical column | `badge-ruins.png` |
| **Pilgrim** | Sacred Places (temples) | temple / shrine | `badge-temple.png` |
| **Royal Guest** | Castles & Palaces | castle | `badge-palace.png` |
| **Monument Hunter** | Landmarks & Icons | a Statue-of-Liberty-ish icon | `badge-monument.png` |
| **City Slicker** | City Views | skyline | `badge-cityscape.png` |

## 6. Kind mega-badges — 3 (grander, for whole families)

Earned by completing every category within a "kind." Bigger, more ornate than the
category pins.

| Badge | Covers | Filename |
|---|---|---|
| **Master Builder** | all *built* categories (ruins, temples, palaces, monuments, cities) | `mega-built.png` |
| **Force of Nature** | all *natural* categories (mountains, volcanoes, waterfalls, rivers, deserts, ice, coasts, rocks) | `mega-natural.png` |
| **Life Lister** | all *living* categories (wildlife) | `mega-living.png` |

## 7. Special medals — 7

Milestones and superlatives. **Medal / medallion** style (ribbon + disc).

| Medal | Earned for | Filename |
|---|---|---|
| **Continental Giants** | every continent's highest peak | `medal-continental-giants.png` |
| **World Heritage** | 20 UNESCO World Heritage sites | `medal-world-heritage.png` |
| **Globetrotter** | set foot on all 7 continents | `medal-globetrotter.png` |
| **Record Breaker** | 8 "world's -est" superlative places (tallest, deepest…) | `medal-record-breaker.png` |
| **Shutterbug** | 25 places mastered | `medal-shutterbug-25.png` |
| **Seasoned Traveler** | 50 places mastered | `medal-seasoned-50.png` |
| **Around the World** | 100 places mastered | `medal-around-the-world-100.png` |

## 8. Continent roundels — 7

Small round emblems, one per continent (fills in as you visit). Coordinate the
colours with the game's continent palette (NA blue, SA green, Europe purple, Africa
gold, Asia red, Oceania yellow, Antarctica white).

`roundel-north-america.png`, `roundel-south-america.png`, `roundel-europe.png`,
`roundel-africa.png`, `roundel-asia.png`, `roundel-oceania.png`,
`roundel-antarctica.png`

## 9. Records & quiz rosettes — 3

Prize-ribbon style, for the local records board.

| Asset | For | Filename |
|---|---|---|
| **Best-score rosette** | best score per difficulty | `rosette-best-score.png` |
| **Speed medal** | best time per difficulty | `medal-best-time.png` |
| **Quiz rosette** | best quiz score | `rosette-quiz.png` |

## 10. Unlock seal — 1

A single reusable **wax-seal / "UNLOCKED" stamp** shown when a mode or difficulty is
newly unlocked. `seal-unlocked.png`

## 11. Per-place mastery marker — 1 (⚠ ONE generic, not per-place)

A single **"mastered" ornament** — a small star / rosette / gold ring — overlaid on a
place once it's fully mastered (photographed enough times). **Do NOT generate one per
location:** there are 437 places; the game reuses one marker for all of them, with the
place name rendered live. (A plain "completed" marker already exists; this is the
grander *mastered* version.) `marker-mastered.png`

## 12. Transport-mode icons — 12 (+2 flourishes)

For the **Grand Tour travel-modes layer** (higher difficulties): the "getting there"
chooser and the header wallet currently use plain emoji (🛺 🐪 🚠 …). Real icons in
the house style would lift it a lot. **Little illustrated transport tokens** — clean,
friendly, one vehicle each, readable at ~28 px. These map 1:1 to the game's transport
modes (`src/data/travel.js`).

| Mode (in game) | Motif | Filename |
|---|---|---|
| Domestic flight | a small prop/regional plane | `transport-flight.png` |
| Train | a train engine | `transport-train.png` |
| Bus | a coach / bus | `transport-bus.png` |
| Taxi | a taxi cab | `transport-taxi.png` |
| Ferry | a passenger ferry | `transport-ferry.png` |
| Riverboat | a small motor riverboat | `transport-riverboat.png` |
| Dugout canoe | a paddled canoe | `transport-canoe.png` |
| Gondola (Venice) | a Venetian gondola | `transport-gondola.png` |
| Cable car | a mountain cable car | `transport-cablecar.png` |
| Cog railway | a cog/rack mountain train | `transport-cograil.png` |
| Tuk-tuk | a three-wheeled auto-rickshaw | `transport-tuktuk.png` |
| Camel | a saddled camel | `transport-camel.png` |

Two small **flourishes** for the same layer (optional but nice):

| Asset | For | Filename |
|---|---|---|
| **Wallet / coins** | the header money counter | `travel-wallet.png` |
| **Hub airport tag** | the hub-picker rows (a control-tower / luggage-tag look) | `travel-hub.png` |

---

## Already in the game (do NOT regenerate)

These exist in `public/assets/shutterbug-ui/` and are fine:

- **Passport stamp frames** — 4 shapes: `passport-stamp-circle/oval/rectangle/shield.png`
  (used for country "visited/mastered" stamps). *Optional nice-to-have:* a few more
  frame shapes for variety, and a small "MASTERED" overlay ornament.
- The passport booklet pages, the calendar, compass, field guide, photo album, map
  furniture (brass corners, pushpin), Mr O, the logo, the airmail/atlas textures, the
  itinerary step icons.
- The **avatar** sprite parts live under `avatar/` and are a *separate* task (the avatar
  redesign) — not part of this badge/mode/difficulty batch.

## What's placeholder today

Still emoji, waiting on art:

- **Ranks, mega-badges, medals, roundels, rosettes** (§4, §6–§9) render as **greyscale
  emoji** in the passport. The keepsakes page is deliberately mixed right now: the 14
  category badges show real art, the other 10 show emoji.
- **Career ranks** show as **text only**; §4 adds insignia.
- **Transport modes** (§12) use plain emoji (🛺 🐪 🚠) in the Grand Tour travel layer.

Already done, for reference: **game-mode cards** used to show a location photo and now
wear their §2 icon; **difficulty tiers** had no art and now wear their §1 emblem.

---

## Totals

≈ **73 new assets**: 4 difficulty + 6 modes + 7 themes + 6 ranks + 14 category badges
+ 3 mega-badges + 7 medals + 7 roundels + 3 rosettes + 1 seal + 1 mastery marker + 12
transport icons + 2 travel flourishes (+ optional country-stamp overlays). All square
transparent PNGs, no baked-in text, colour version only.

**Done: 31/73** — 14 category badges, 4 difficulty emblems, 6 mode icons, 7 theme crests.

### How to land the next batch

0. Put the raw drop anywhere — `art-drops/` and `Shutterbug new image assets*/` are both
   gitignored, so the ~400 KB originals never reach the repo. Only the quantized copies
   under `public/` get tracked. (Worth being deliberate about: a `git add -A` in 89bcd9f
   put 30 MB of raw drop into history permanently.)
1. Copy the PNGs into `public/assets/shutterbug-ui/<folder>/` (`ranks/`, `medals/`… — one
   folder per family).
2. `node scripts/optimize-ui-art.mjs <folder>` to quantize them (add the folder to
   `ART_DIRS` in that script).
3. Add the keys to `src/data/art.js` — for §4/§6/§7 that means filling in
   `ACHIEVEMENT_ART`, keyed by achievement id (`kind_built`, `summits`, `m25`…; see
   `achievements()` in `src/profiles.js`). The render sites already prefer art over
   emoji, so nothing else needs touching.
4. `npm test` — `test/art.test.js` catches a typo'd path or an unclaimed file.

The locked/greyed states are generated in code from the colour art (`<ArtBadge dim>`),
so only the earned/full-colour version is ever needed.
