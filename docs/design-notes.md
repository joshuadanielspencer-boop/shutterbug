# Shutterbug — Design Notes

Living design document. Captures the analysis and brainstorming behind gameplay
decisions so they aren't lost in chat history. Nothing here is implemented unless
it says so.

---

## 1. Difficulty ↔ grade-level mapping

### What each tier demands

| Tier | Player load | Scaffolding | Cognitive level |
|---|---|---|---|
| **Scout** (3 shots, 1 decoy, no real time pressure) | Clue names the country; every pin labelled; read-aloud on; wrong guess flashes the right answer | Maximum | **Recognition with help** |
| **Explorer** (5 shots, 2 decoys) | Clue **names the country**; every pin labelled; category badge; warm/cold hints; cheap research | Very high | **Recognition** — match a named place on the map |
| **Adventurer** (9 shots, 3 decoys) | Clue **names the country but hides the continent** — you must know where in the world it sits; labels on hover only | Medium | **Inference** — country → continent, recognise shapes/positions |
| **Expert** (14 shots, 4 decoys, 2 days each) | **Pure-context clues** — no place names, no labels, no badge, no hints, no research; time pressure | None | **Recall + synthesis** under a clock |

### Grade-band fit (US homeschool, approximate)
- **Scout** → K–2 (ages ~5–7)
- **Explorer** → grades 3–5 (ages ~8–10)
- **Adventurer** → grades 6–8 (ages ~11–13)
- **Expert** → high school and up

### The reveal ladder (enforced by a test)
- easy clue: names country **and** continent
- medium clue: names the **country**, hides the **continent**
- hard clue: names **neither** (nor the city)

`test/data.test.js` enforces this across all 437 locations, so the ladder can't
silently regress.

### Open refinements
- **Expert conflates knowledge with time pressure.** Consider making the day
  budget an independent toggle so "cryptic but relaxed" is possible.
- Consider surfacing the age bands in the UI so parents can pick confidently.
- Expert relies on a broad location pool; keep adding places so it isn't just
  memorising the same set.

---

## 2. Game-progression brainstorm

### Progression (reasons to come back)
- **Visible career ladder.** The career rank already exists — surface it as a
  *track* with the next unlock always in view ("2 more African stamps → unlocks
  the Silk Road journey").
- **Completion meters.** "Atlas 38% filled", per-continent %, per-category
  collections ("all 14 volcanoes").
- **Two currencies.** Per-run *travel days*; permanent *renown* earned for
  **learning** (facts, spaced-repetition reviews), spent between runs on
  gear/cosmetics/regions. Ties progression to the curriculum.
- **Cosmetic prestige.** Avatar outfits, camera skins, passport-cover upgrades,
  a trophy shelf of best "cover shots".

### Competitive
- **Seeded Daily Expedition** — ✅ **BUILT** (`src/daily.js`, `src/rng.js`). One
  fixed 5-shot run per day, seeded by day **and tier** (a Scout and an Expert
  can't share one run, so each tier gets its own fixed run and the share card
  names the tier). Generated from a *null* profile, or spaced repetition would
  tailor "the same run" to each player. First completed run of the day is the one
  that counts; replays are practice. Share text is spoiler-free by design.
- **Beat-your-ghost**: race your own personal-best par days/score.
- **Family board** on one device (multiple local profiles).
- **Send-a-challenge**: share a seed code; both play the identical run.
- True online friend leaderboards need a backend — see §5.

### Fun for 10–12
- Keep leaning on existing juice (polaroid, Mr O, sound) — well matched to the age.
- **Short runs, big rewards** (a 5-shot run ending in a keepsake).
- **Surprise**: more Mr O gems, rare "golden" locations, a boss "Cover Story".
- **Collect & customise**: stamps, cover-shot cards, avatar/camera personalisation.
- **The Grandpa hook** — the emotional frame is the game's best asset; develop it.

### Challenging for adults
- **Optimisation depth**: commit-your-route Grand Tour, efficiency scoring, the
  daily seed leaderboard.
- **Ironman mode**: one wrong guess ends the run.
- **Cryptic tier**: lateral clues (culture/history/language rather than geography).
- **Deep cuts**: an obscure-locations pool so experts aren't re-shooting the same places.

**Unifying principle:** make the highest-scoring play *also* the most educational
play, so depth and learning never fight.

---

## 3. Roguelike direction

The travel-day budget is already a roguelike resource and the world is already the
run map. What's missing is **choice, variety, and build** inside a run.

1. **Route-choice, not a fixed list.** Pick your next destination from 2–3 offered
   nodes, each showing its clue + tag + distance cost. Turns a checklist into decisions.
2. **Camera-bag loadout** (the "relics"): telephoto lens (shoot from a neighbouring
   country), fast film (a perfect shot refunds ½ day), press pass (free research),
   bush plane (cheap intra-continent hops), lucky fixer (negate one wrong guess).
3. **Run modifiers**: "Monsoon — flights to Asia +1 day", "Festival — culture facts
   score double", "Film shortage — 6 shots, each worth more".
4. **Push-your-luck on the shot**: safe shot vs. hold for the light (bonus or bust).
5. **A boss beat**: end each run with a marquee "Cover Story" assignment.
6. **Failure that teaches**: running out of days ends the run, but stamps persist
   and you bank renown; the end screen is a *debrief*.

**Smallest satisfying version:** route-choice map + 3–4 camera-bag items + one run
modifier + a debrief/renown end screen.

---

## 4. Mode differentiation

**Grand Tour — ✅ BUILT (the route-optimisation mode).**

Assignments is the *deduction* game: one clue at a time, the next one hidden.
Grand Tour is now the *route* game: you're told every target and exactly where it
is — no research, no hints, nothing to deduce — so the only question left is the
ORDER, and that's the whole game.

- **Par** (`src/routes.js`) is the cheapest circuit that exists, solved exactly by
  branch-and-bound over every ordering, not greedily. A par you can beat by
  accident is worse than no par at all — and the day budget is derived *from* par,
  so a loose par silently makes the ordering stop mattering. A test proves par
  equals brute force.
- **The budget is tight**: par + half a day per shot + a few slack days. (The old
  budget assumed you flew home to the hub between every continent and then added a
  spare day per target, which made the route effectively free.)
- **Commit your route up front** on a planning screen: shuffle the stops with a
  live running day-cost against par, then commit. Leaving that order later costs
  an extra day each time — you may still do it, but it's a real price.
- **Score on efficiency**: points per target filed, plus points per whole day you
  bring home. On Expert a banked day is worth twice a photograph.
- "Show me the best route" exists only on Scout/Explorer — the same reveal ladder
  the clues follow. Adventurer and Expert plan it themselves.

Themed Expeditions stay *guided* tours (a fixed thematic list, no route commit).

## 5. Infrastructure feasibility

- **Cross-device profiles + leaderboards** — needs a small cloud DB. Supabase or
  Firebase; free tiers cover a homeschool-scale audience. Moderate work: swap
  `profiles.js` storage for cloud + offline fallback. For kids: anonymous accounts
  + a shareable code, **no passwords, no PII**.
- **Desktop app** — already installable as a **PWA** (zero work). For a real
  `.app`/`.exe`, wrap with **Tauri** (small binaries) or Electron. ⚠️ Unsigned apps
  trigger OS warnings; code signing costs money.
- **Compete with friends via a passcode** — model it as a **shared group/room**:
  a family/club code groups everyone's Daily-Expedition scores on one cloud
  leaderboard. **Async, no live networking** — 90% of the fun, a fraction of the
  complexity. Real-time racing is possible but not worth it.

**One decision unlocks two:** adopting a backend gives cross-device sync *and*
passcode leaderboards. Ship the **no-backend seeded Daily Expedition first** to
test whether anyone cares.

---

## 6. "Tap to learn" curiosity layer

Turn the UI chrome into an optional curriculum. Every tappable element opens the
same small **field-note card** (title + 1–3 sentence verified fact + ↻ "another"),
served in a reshuffled cycle so revisits teach something new. Mr O narrates the
trivia; Grandpa narrates the story.

| Element | Content |
|---|---|
| **Logo** | About the game / the *Nigel's World* inspiration / how to play. ⚠️ Frame as personal inspiration, not an official successor (trademark). |
| **Calendar** | Travel times by sail vs steam vs jet; time zones; the Date Line. Best when tied to the current run ("12 days — a 1900s steamship would've spent all of them crossing the Atlantic"). |
| **Avatar** | → Customise traveller (don't duplicate the Passport tool). |
| **Compass** | Cardinal directions; true vs magnetic vs grid north; why maps are north-up; lat/long. |
| **Continent** | How continents are defined; why the count is 5/6/7; tectonic plates; Pangaea. |
| **Country** | How many countries (~195, and why "it depends"); UN/EU/OPEC/BRICS/USMCA; borders; microstates. |
| **Destination** | Most-visited countries/cities; over-tourism; capital vs largest city. |
| **Photograph** | The exposure triangle (shutter/ISO/aperture); rule of thirds; how a camera works. |
| *(bonus)* | Category badge → what is this kind of place; country flag → its meaning. |

Also: reward the curiosity ("Curiosities found: 14/40") so poking around *is*
progress. Store all cards in `src/data/` (rule 1); verify every fact (rule 2) and
date-stamp anything time-sensitive (blocs change).

---

## 7. Awards & progression currently tracked

For asset generation. All emblems: **transparent PNG, square canvas, no baked-in
text** (names/numbers render live); only the earned/colour version is needed — the
locked/greyed state is generated in code.

- **Career rank (6 tiers)** — Cub Reporter (0) → Field Stringer (10) → Roving
  Correspondent (25) → Bureau Chief (50) → Globe Editor (100) → Photographer
  Laureate (200). *Art: an escalating press-pass insignia series.*
- **Country stamps** — visited vs mastered, per country. *Art: existing 4 stamp
  frames + a "mastered" overlay; a few more frame shapes for variety.*
- **Continents** — 7 roundels + a Globetrotter medal.
- **Category badges (14)** — Peak Bagger, Volcano Hunter, Waterfall Chaser, River
  Runner, Desert Wanderer, Polar Explorer, Island Hopper, Rockhound, Safari Ranger,
  Time Traveler, Pilgrim, Royal Guest, Monument Hunter, City Slicker. *Art: enamel
  pins, shared frame, distinct motif.*
- **Kind mega-badges (3)** — Master Builder, Force of Nature, Life Lister.
- **Special medals** — Continental Giants, World Heritage (20), Record Breaker (8),
  Globetrotter, and the milestones Shutterbug (25) / Seasoned Traveller (50) /
  Around the World (100).
- **Records** — best score & best time per difficulty; local leaderboard. *Art: a
  prize rosette + a speed medal.*
- **Quiz** — best quiz score. *Art: a quiz rosette.*
- **Unlock gates** — Adventurer, Quiz, Tour, Expert, Expeditions. *Art: one reusable
  "UNLOCKED" wax seal.*
</content>### Themed Journey ideas — ✅ Lewis & Clark BUILT

`src/data/journeys.js` + the `journey` mode. A Journey is neither of the other two
games: in Assignments the puzzle is the PLACE, in Grand Tour the puzzle is the
ORDER — here the order IS the story, so it's fixed and you can't skip ahead
(clicking a later stop tells you they hadn't got there yet). No day budget: a
route you're retracing shouldn't be a race.

Lewis & Clark (1804–06) is the flagship, in six stops from Camp Dubois to the
Pacific. Every stop's coordinates come from that place's Wikipedia article via the
MediaWiki API — not eyeballed off a map — and each stop carries its source.

Adding a route is now just data. Two things the tests enforce, both learned the
hard way here:
- **No two stops within 1.2°.** Fort Clatsop and Cape Disappointment are 12 miles
  apart and rendered as a single pin you couldn't click. The route carries one.
- **The map box matches the frame's aspect.** An SVG clips to its viewport, not
  its viewBox, so a mismatched box letterboxes and the relief plate spills into
  the gap, showing map that isn't part of the journey.

⚠ **Before adding the contested routes.** Lewis & Clark is safe because nobody
disputes where Fort Mandan was. The Exodus route and the site of Mount Sinai are
genuinely contested, and some of Paul's stops are uncertain. Those need a
`certainty` field ("documented" vs "traditional") and the card must SAY which.
Do not quietly present a traditional site as a fact.

# Shutterbug — Design Notes

Living design document. Captures the analysis and brainstorming behind gameplay
decisions so they aren't lost in chat history. Nothing here is implemented unless
it says so.

---

## 1. Difficulty ↔ grade-level mapping

### What each tier demands

| Tier | Player load | Scaffolding | Cognitive level |
|---|---|---|---|
| **Scout** (3 shots, 1 decoy, no real time pressure) | Clue names the country; every pin labelled; read-aloud on; wrong guess flashes the right answer | Maximum | **Recognition with help** |
| **Explorer** (5 shots, 2 decoys) | Clue **names the country**; every pin labelled; category badge; warm/cold hints; cheap research | Very high | **Recognition** — match a named place on the map |
| **Adventurer** (9 shots, 3 decoys) | Clue **names the country but hides the continent** — you must know where in the world it sits; labels on hover only | Medium | **Inference** — country → continent, recognise shapes/positions |
| **Expert** (14 shots, 4 decoys, 2 days each) | **Pure-context clues** — no place names, no labels, no badge, no hints, no research; time pressure | None | **Recall + synthesis** under a clock |

### Grade-band fit (US homeschool, approximate)
- **Scout** → K–2 (ages ~5–7)
- **Explorer** → grades 3–5 (ages ~8–10)
- **Adventurer** → grades 6–8 (ages ~11–13)
- **Expert** → high school and up

### The reveal ladder (enforced by a test)
- easy clue: names country **and** continent
- medium clue: names the **country**, hides the **continent**
- hard clue: names **neither** (nor the city)

`test/data.test.js` enforces this across all 437 locations, so the ladder can't
silently regress.

### Open refinements
- **Expert conflates knowledge with time pressure.** Consider making the day
  budget an independent toggle so "cryptic but relaxed" is possible.
- Consider surfacing the age bands in the UI so parents can pick confidently.
- Expert relies on a broad location pool; keep adding places so it isn't just
  memorising the same set.

---

## 2. Game-progression brainstorm

### Progression (reasons to come back)
- **Visible career ladder.** The career rank already exists — surface it as a
  *track* with the next unlock always in view ("2 more African stamps → unlocks
  the Silk Road journey").
- **Completion meters.** "Atlas 38% filled", per-continent %, per-category
  collections ("all 14 volcanoes").
- **Two currencies.** Per-run *travel days*; permanent *renown* earned for
  **learning** (facts, spaced-repetition reviews), spent between runs on
  gear/cosmetics/regions. Ties progression to the curriculum.
- **Cosmetic prestige.** Avatar outfits, camera skins, passport-cover upgrades,
  a trophy shelf of best "cover shots".

### Competitive
- **Seeded Daily Expedition** — ✅ **BUILT** (`src/daily.js`, `src/rng.js`). One
  fixed 5-shot run per day, seeded by day **and tier** (a Scout and an Expert
  can't share one run, so each tier gets its own fixed run and the share card
  names the tier). Generated from a *null* profile, or spaced repetition would
  tailor "the same run" to each player. First completed run of the day is the one
  that counts; replays are practice. Share text is spoiler-free by design.
- **Beat-your-ghost**: race your own personal-best par days/score.
- **Family board** on one device (multiple local profiles).
- **Send-a-challenge**: share a seed code; both play the identical run.
- True online friend leaderboards need a backend — see §5.

### Fun for 10–12
- Keep leaning on existing juice (polaroid, Mr O, sound) — well matched to the age.
- **Short runs, big rewards** (a 5-shot run ending in a keepsake).
- **Surprise**: more Mr O gems, rare "golden" locations, a boss "Cover Story".
- **Collect & customise**: stamps, cover-shot cards, avatar/camera personalisation.
- **The Grandpa hook** — the emotional frame is the game's best asset; develop it.

### Challenging for adults
- **Optimisation depth**: commit-your-route Grand Tour, efficiency scoring, the
  daily seed leaderboard.
- **Ironman mode**: one wrong guess ends the run.
- **Cryptic tier**: lateral clues (culture/history/language rather than geography).
- **Deep cuts**: an obscure-locations pool so experts aren't re-shooting the same places.

**Unifying principle:** make the highest-scoring play *also* the most educational
play, so depth and learning never fight.

---

## 3. Roguelike direction

The travel-day budget is already a roguelike resource and the world is already the
run map. What's missing is **choice, variety, and build** inside a run.

1. **Route-choice, not a fixed list.** Pick your next destination from 2–3 offered
   nodes, each showing its clue + tag + distance cost. Turns a checklist into decisions.
2. **Camera-bag loadout** (the "relics"): telephoto lens (shoot from a neighbouring
   country), fast film (a perfect shot refunds ½ day), press pass (free research),
   bush plane (cheap intra-continent hops), lucky fixer (negate one wrong guess).
3. **Run modifiers**: "Monsoon — flights to Asia +1 day", "Festival — culture facts
   score double", "Film shortage — 6 shots, each worth more".
4. **Push-your-luck on the shot**: safe shot vs. hold for the light (bonus or bust).
5. **A boss beat**: end each run with a marquee "Cover Story" assignment.
6. **Failure that teaches**: running out of days ends the run, but stamps persist
   and you bank renown; the end screen is a *debrief*.

**Smallest satisfying version:** route-choice map + 3–4 camera-bag items + one run
modifier + a debrief/renown end screen.

---

## 4. Mode differentiation

**Grand Tour — ✅ BUILT (the route-optimisation mode).**

Assignments is the *deduction* game: one clue at a time, the next one hidden.
Grand Tour is now the *route* game: you're told every target and exactly where it
is — no research, no hints, nothing to deduce — so the only question left is the
ORDER, and that's the whole game.

- **Par** (`src/routes.js`) is the cheapest circuit that exists, solved exactly by
  branch-and-bound over every ordering, not greedily. A par you can beat by
  accident is worse than no par at all — and the day budget is derived *from* par,
  so a loose par silently makes the ordering stop mattering. A test proves par
  equals brute force.
- **The budget is tight**: par + half a day per shot + a few slack days. (The old
  budget assumed you flew home to the hub between every continent and then added a
  spare day per target, which made the route effectively free.)
- **Commit your route up front** on a planning screen: shuffle the stops with a
  live running day-cost against par, then commit. Leaving that order later costs
  an extra day each time — you may still do it, but it's a real price.
- **Score on efficiency**: points per target filed, plus points per whole day you
  bring home. On Expert a banked day is worth twice a photograph.
- "Show me the best route" exists only on Scout/Explorer — the same reveal ladder
  the clues follow. Adventurer and Expert plan it themselves.

Themed Expeditions stay *guided* tours (a fixed thematic list, no route commit).

## 5. Infrastructure feasibility

- **Cross-device profiles + leaderboards** — needs a small cloud DB. Supabase or
  Firebase; free tiers cover a homeschool-scale audience. Moderate work: swap
  `profiles.js` storage for cloud + offline fallback. For kids: anonymous accounts
  + a shareable code, **no passwords, no PII**.
- **Desktop app** — already installable as a **PWA** (zero work). For a real
  `.app`/`.exe`, wrap with **Tauri** (small binaries) or Electron. ⚠️ Unsigned apps
  trigger OS warnings; code signing costs money.
- **Compete with friends via a passcode** — model it as a **shared group/room**:
  a family/club code groups everyone's Daily-Expedition scores on one cloud
  leaderboard. **Async, no live networking** — 90% of the fun, a fraction of the
  complexity. Real-time racing is possible but not worth it.

**One decision unlocks two:** adopting a backend gives cross-device sync *and*
passcode leaderboards. Ship the **no-backend seeded Daily Expedition first** to
test whether anyone cares.

---

## 6. "Tap to learn" curiosity layer

Turn the UI chrome into an optional curriculum. Every tappable element opens the
same small **field-note card** (title + 1–3 sentence verified fact + ↻ "another"),
served in a reshuffled cycle so revisits teach something new. Mr O narrates the
trivia; Grandpa narrates the story.

| Element | Content |
|---|---|
| **Logo** | About the game / the *Nigel's World* inspiration / how to play. ⚠️ Frame as personal inspiration, not an official successor (trademark). |
| **Calendar** | Travel times by sail vs steam vs jet; time zones; the Date Line. Best when tied to the current run ("12 days — a 1900s steamship would've spent all of them crossing the Atlantic"). |
| **Avatar** | → Customise traveller (don't duplicate the Passport tool). |
| **Compass** | Cardinal directions; true vs magnetic vs grid north; why maps are north-up; lat/long. |
| **Continent** | How continents are defined; why the count is 5/6/7; tectonic plates; Pangaea. |
| **Country** | How many countries (~195, and why "it depends"); UN/EU/OPEC/BRICS/USMCA; borders; microstates. |
| **Destination** | Most-visited countries/cities; over-tourism; capital vs largest city. |
| **Photograph** | The exposure triangle (shutter/ISO/aperture); rule of thirds; how a camera works. |
| *(bonus)* | Category badge → what is this kind of place; country flag → its meaning. |

Also: reward the curiosity ("Curiosities found: 14/40") so poking around *is*
progress. Store all cards in `src/data/` (rule 1); verify every fact (rule 2) and
date-stamp anything time-sensitive (blocs change).

---

## 7. Awards & progression currently tracked

For asset generation. All emblems: **transparent PNG, square canvas, no baked-in
text** (names/numbers render live); only the earned/colour version is needed — the
locked/greyed state is generated in code.

- **Career rank (6 tiers)** — Cub Reporter (0) → Field Stringer (10) → Roving
  Correspondent (25) → Bureau Chief (50) → Globe Editor (100) → Photographer
  Laureate (200). *Art: an escalating press-pass insignia series.*
- **Country stamps** — visited vs mastered, per country. *Art: existing 4 stamp
  frames + a "mastered" overlay; a few more frame shapes for variety.*
- **Continents** — 7 roundels + a Globetrotter medal.
- **Category badges (14)** — Peak Bagger, Volcano Hunter, Waterfall Chaser, River
  Runner, Desert Wanderer, Polar Explorer, Island Hopper, Rockhound, Safari Ranger,
  Time Traveler, Pilgrim, Royal Guest, Monument Hunter, City Slicker. *Art: enamel
  pins, shared frame, distinct motif.*
- **Kind mega-badges (3)** — Master Builder, Force of Nature, Life Lister.
- **Special medals** — Continental Giants, World Heritage (20), Record Breaker (8),
  Globetrotter, and the milestones Shutterbug (25) / Seasoned Traveller (50) /
  Around the World (100).
- **Records** — best score & best time per difficulty; local leaderboard. *Art: a
  prize rosette + a speed medal.*
- **Quiz** — best quiz score. *Art: a quiz rosette.*
- **Unlock gates** — Adventurer, Quiz, Tour, Expert, Expeditions. *Art: one reusable
  "UNLOCKED" wax seal.*
</content>
