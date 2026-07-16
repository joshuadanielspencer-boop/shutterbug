# Shutterbug — art assets to generate

A hand-off list for generating game art (e.g. with ChatGPT), pulled from what the
game actually tracks and renders. Names and counts below are the *exact* in-game
values, so once the files land they wire straight in.

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

## What's placeholder today (these are what this batch replaces)

- **Badges & medals** currently render as **greyscale emoji** in the passport — every
  item in §4–§10 above replaces an emoji.
- **Game-mode cards** currently show a **location photo**; §2 gives them real icons.
- **Difficulty tiers** have **no art** today; §1 adds it.
- **Career ranks** show as **text only**; §4 adds insignia.

---

## Totals

≈ **58 new assets**: 4 difficulty + 6 modes + 7 themes + 6 ranks + 14 category badges
+ 3 mega-badges + 7 medals + 7 roundels + 3 rosettes + 1 seal. All square transparent
PNGs, no baked-in text, colour version only.

Drop them in `public/assets/shutterbug-ui/` (I can sort them into subfolders like
`badges/`, `modes/`, `ranks/` when wiring). Once any subset lands, I wire it in and
auto-generate the locked/greyed states.
