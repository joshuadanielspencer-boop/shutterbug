# Shutterbug — remaining work

A handoff document. Everything here is written so a **new session with no memory of
the previous ones** can pick up a task and finish it. Read `CLAUDE.md` first (the
three project rules are hard requirements), then the task you're doing.

Last updated **2026-07-28**.

> ### ⚠ 2026-07-28 (evening): the rest of the tune-sameness pass, and four questions
>
> **Shipped:** the four beds still carrying 7–8 countries each — `southeastasia`,
> `tropical`, `latin`, `westafrica` — plus `mediterranean`, which was carrying six
> and was the worst of the lot for what it flattened (a Greek bouzouki standing in
> for flamenco, fado and a tarantella). Seventeen new beds. §11 has the recount:
> **11 regional beds became 43, and the biggest is now 6, down from 19.** The last
> one at six is `caribbean`, and the ceiling in `test/tunes.test.js` stays there
> until it's split. Also: `MUSIC.timbres` now exists purely so a test can catch a
> tune naming a timbre the synth doesn't have — the one failure mode here that
> neither throws nor falls silent, it just plays the wrong instrument.
>
> **Nobody has heard any of them but a synthesizer.** See §11 item 2.
>
> **Four things need Joshua and were not started:**
> 1. **`Images/Avatar designs/eyes_female_brown.png.png`** is 1024×1024 where every
>    other plate is 1200×1200 (and has a doubled `.png`). The build SKIPS it with a
>    named warning rather than ship it crooked. Needs a re-export at 1200×1200 with
>    the character in the same position. The frame is NOT the registration reference
>    — it is stripped and identical on every plate. Canvas size and character
>    position are the whole contract.
> 2. ~~**Currency PRICE anchors**~~ **BUILT, and it reaches 10 countries, not 55.**
>    Joshua asked for all of them. See §12 for why that is not available at any
>    price — the short version is that there is no authoritative global source of
>    everyday retail prices, and the one good free source measures refugee camps.
> 3. ~~**Trinidad and Tobago's map.**~~ **DONE 2026-07-29.** Joshua's call: only
>    small islands get a lower floor, so nothing trades sharpness away where it
>    isn't buying visible shape. `boxFloorFor` in `src/map-geometry.js` — a mainland
>    country backed off to the floor fills its frame with real neighbouring ground,
>    an island fills it with empty sea, and the island floor is set by how many
>    source pixels are left rather than by taste. Trinidad 28% → 78%, Jamaica 33% →
>    92%, Fiji 46% → 93%; no mainland country moved.
> 4. **Mr O's "checkered background"** could not be reproduced: all ten shipped images
>    have genuine alpha, live and local are byte-identical, and no UI asset contains a
>    checkerboard. BUT four of the ORIGINALS in `Images/Mr O complete/` (considering,
>    explaining, sharing, teaching) are fully opaque with a white-and-grey
>    checkerboard baked in, which is almost certainly what he is looking at. Ask which
>    SCREEN he sees it on before touching files that measure correct.

> ### ⚠ 2026-07-28: the speech voice, and what would actually fix it
>
> Joshua: *"The voice pronouncing some of the countries is the old school atrocious
> pre-Siri voice."* He was right, and the cause is not our code choosing badly — it
> was our code not choosing at all.
>
> `utterance.lang = "en-US"` hands the pick to the browser, and the browser hands it
> to its oldest voice. On macOS that is **Samantha**, the pre-Siri one. Measured on
> Joshua's Mac: 180 voices installed, **zero** Enhanced/Premium/Siri among them.
>
> Worse than the default: macOS ships *Bad News, Bahh, Bells, Boing, Bubbles, Cellos,
> Jester, Organ, Superstar, Trinoids, Whisper, Wobble* and *Zarvox* as ordinary en-US
> voices, and for French, German, Japanese, Spanish and Chinese the list is DOMINATED
> by the character voices (Grandma, Grandpa, Rocko…). The game says foreign words
> aloud to teach a child how they sound, so a comedy voice doing it is worse than
> silence. `rankVoices()` in `src/audio.js` now scores the list and sets `u.voice`
> explicitly; joke voices are never eligible, and a language whose ONLY match is a
> joke voice counts as having no voice, which makes the greeting layer fall back to
> reading the romanization plainly in English.
>
> Measured result: French now gets Jacques (was liable to be Grandpa), Japanese Kyoko,
> German Anna, Spanish Mónica, Chinese Tingting, Russian Milena, Korean Yuna, Greek
> Melina, Turkish Yelda. Persian, Swahili and Māori correctly report no voice.
>
> **English is still Samantha, because on that machine she is genuinely the best there
> is.** Ways forward:
>
> 1. ~~**Install a better system voice.**~~ **RULED OUT by Joshua, 2026-07-28:** *"I only
>    want us to utilize things that can be done in-game. If someone is playing this game
>    on their browser or downloads an app, I won't be having them search their computer
>    to download a new voice."* This is a product constraint, not a preference — the
>    game ships to players who will never be told to configure anything. Do not
>    re-propose it. It also retires the whole category: nothing that depends on what
>    the player's device happens to have installed counts as a fix. `rankVoices()` in
>    src/audio.js stays as the graceful fallback for whatever voice IS there, but it
>    can never be the plan.
> 2. **Pre-rendered audio, human.** Wikimedia's **Lingua Libre** holds tens of
>    thousands of free-licensed recordings of real speakers saying single words,
>    including country names and greetings, under CC BY-SA / CC0 — the same licensing
>    lane and the same API the photo work already uses. Best possible quality, and it
>    removes the dependence on the player's device entirely. Cost is a coverage audit
>    (108 country names + ~100 greetings) and about 5–10 MB of audio in the PWA.
> 3. **Pre-rendered audio, synthesized.** **Piper** (rhasspy/piper) is MIT-licensed
>    neural TTS that runs offline; output is licence-clean to redistribute. Better than
>    any browser voice, worse than a human, and a build-step dependency. Only worth it
>    if Lingua Libre's coverage turns out to be thin.
>
> Recommendation: (2) is the only real path, treated as a content project of the same
> shape as the culture-photo audit. Everything the game says aloud that is NOT a
> country name — Mr O's facts, the Scout read-aloud, hover labels, every greeting —
> is still on the device synthesizer, and bundling audio is the only way to change
> that for a player who configures nothing.
>
> **UPDATE, same day: (2) is DONE for the country names.** The audit came back far
> better than expected — see below — so it was built rather than filed.
>
> ### The audit result
>
> | | coverage | verdict |
> |---|---|---|
> | **Country names (English)** | **106 / 108** | built |
> | **Greetings (right language)** | **16 / 79** | not built, and shouldn't be |
>
> Country names: one speaker, "Soundguys", had recorded 102 of them, which mattered
> more than the coverage number — 106 different volunteers would have sounded like a
> ransom note. Two more speakers fill the gaps. **All 106 are CC0.** Commons
> auto-generates MP3 transcodes, so no encoder was needed and the set is 2.3 MB.
> Only French Polynesia and New Caledonia have nothing, and they fall back to
> synthesis. `node scripts/gen-voices.mjs` rebuilds the set.
>
> Greetings: 16 of 79 in the RIGHT language. Another 19 exist with the same spelling
> recorded in some OTHER language — "Hola" by a Polish speaker, "Bonjour" by a
> Malagasy one — which would teach exactly the wrong sound, which is the thing this
> whole exercise is about. Not worth a pipeline at 16/79, and half human / half robot
> on the same UI element would be worse than either. They stay on synthesis, now with
> the voice ranking picking the plain voice rather than a character one.
>
> If greetings are wanted later, the route is Lingua Libre's own recording studio —
> it takes requests, and a speaker of a given language can record a word list in one
> sitting. That is a community ask, not a code change.


> ### ⚠ 2026-07-27: a sixth mode landed
>
> **Mystery Photos** is in — Uncle Jonah's unsorted archive. It shows one of the 464
> existing landmark photographs with no caption and asks the child to put a pin on
> the world map; scoring is by distance with the right continent as a floor, and
> nothing scores zero. It is the only mode in the game that runs place → knowledge
> instead of clue → place, which was the largest pedagogical gap in the loop.
>
> - Pure logic (slide choice, distance scoring, the player-facing strings):
>   `src/mystery.js`, tested in `test/mystery.test.js` (23 tests).
> - Screen: `src/components/mystery.jsx`. Its own file deliberately —
>   `shutterbug-world.jsx` is the engineering debt named below, and this did not
>   have to add to it.
> - It has **no badge art yet** (it falls back to the 📷 emoji, the same way The
>   Long Trip does). `MODE_ART` in `src/data/art.js` and `MODE_KEYS` in
>   `test/art.test.js` both still list the two dead modes (`quiz`, `daily`) and
>   neither lists `longtrip` or `mystery`. Worth a tidy when the next art batch lands.
>
> Two things learned building it that the next map feature will want:
> - A country's centre is NOT its path's bounding-box centre. France's box takes in
>   French Guiana and Réunion and centres on **Mali**; the USA's centres on southern
>   **France**. The mode derives centres from the game's own landmark coordinates
>   with a circular mean for longitude (Fiji straddles the antimeridian and a plain
>   mean puts it in the Gulf of Guinea), then snaps to the nearest real landmark.
> - `SVGGeometryElement.isPointInFill` answers "which country is this point in"
>   exactly, against the real geometry. But a country's centre is usually a coastal
>   city, and against these simplified outlines 16 of 177 hit-test as open sea — so
>   where the country is already known, pass it rather than hit-testing it.


> ### ⚠ Read this before anything below
>
> A long session on 2026-07-17/18 changed things this document still describes the
> old way. Where they disagree, **this box wins**:
>
> - **Grandpa Nigel is now Uncle Jonah** — a Vietnamese man who DID travel widely when
>   young (with the camera he lends you) and is too old to travel now. Not a man who
>   never went. Art in `public/assets/shutterbug-ui/jonah2/`; words still in
>   `src/data/grandpa.js` (filename and `GRANDPA`/`NIGEL_*` identifiers are
>   pre-rebrand and intentionally left alone — internal only).
> - **Quiz mode and Daily Expedition mode were REMOVED.** The review quiz now runs at
>   the end of every scored run (the homecoming). There is no once-a-day mode, no
>   share card, no daily streak. Four modes remain: Assignments, Grand Tour, Explore,
>   Journeys. §7 below says to do Supabase "after the Daily has proved out" — that
>   condition no longer exists and is not a reason to wait.
> - **The passport is always the booklet popup**, never its own screen.
> - **Target device is a DESKTOP window.** Phones are explicitly not a target; iPad is
>   secondary. §8's "final single-screen pixel fit" should be tuned to a desktop
>   window. See the amended rule 4 in `CLAUDE.md`.
> - **The desktop executable (§8) is NOT recommended.** The PWA already installs on
>   desktop; signing costs $99/yr and unsigned builds throw OS warnings at parents.
>   Do it only if a real double-click icon is worth that.
> - **Recommended next build:** export/import the passport as a file. Today a cleared
>   cache erases months of progress, and that work is the same serialization Supabase
>   (§7) would reuse.

> ### ⚠ 2026-07-19 supersedes parts of the box above
>
> The **passport export/import** recommended above is **DONE** — "Save a copy" /
> "Restore from a file" under the passport, serialization in `src/profiles.js`
> (`exportPassport` / `importPassport`), tests in `test/passport-file.test.js`.
> §7's Supabase work would reuse that envelope as-is.
>
> Also landed: teach-on-miss, Mr O's intro fixed to fire once at assignment 2, the
> homecoming quiz scaled to one question per assignment, the results and quiz screens
> fitted to one widescreen, Chile/USA/UK map crops, circular pins, a splash drone that
> swells into the jig, single-pass country tunes, and the music/voice balance. See
> "Recently shipped" and `git log 8b8a738..HEAD`.
>
> **Still open from that session's list** (Joshua asked for these; they are not done):
> 1. **A Progress page in the passport** — mastery by continent and a "keeps getting
>    missed" list. All the data already exists (`passportData`, `profile.loc`,
>    `weightFor`); it needs a view. Highest value per line of code of anything left.
> 2. **Tint mastered countries on the world map** — `passportData()` returns a
>    `mastered` flag per country and `WORLD_COUNTRIES` has the paths. The satisfying
>    "watch the map fill in" feedback the game currently has no version of.
> 3. **Content for the thin continents** — South America 34, Oceania 30, Antarctica 6
>    against Europe's 107. Chile is the ONLY country in the game with fewer than three
>    landmarks on a continent layer (2 on the mainland, plus Easter Island filed under
>    Oceania); a code-level floor now borrows nearest neighbours so no map shows fewer
>    than three pins, but Chile still wants real mainland places. Joshua's steer: add
>    genuinely notable places, don't pad to hit a number, and Europe/Asia/North America
>    may still gain places of real cultural or geographic interest.
> 4. **A rewards/progression layer** — earning an achievement currently grants a chip
>    on the results screen and nothing else. See §10 (new) for the brainstorm.
> 5. **The dog** — art is in `public/assets/shutterbug-ui/dog/` (6 poses) and already
>    appears beside Jonah in his scenes. No gameplay role yet; see §10.

> ### ⚠ 2026-07-21 — two new lists live in their own files
>
> This session produced two documents that supersede the priorities below:
>
> - **[`playtest-2026-07-21.md`](playtest-2026-07-21.md)** — Joshua's playtest pass.
>   Fifteen items, triaged and sized: map crops, the airplane-only travel decision,
>   the Long Trip rail, and the ancient-ruins content gaps. **Item A in that file
>   (returning players are served a stale build) should go first — it means every
>   other playtester may be reporting bugs against days-old code.**
> - **[`keyboard-audit.md`](keyboard-audit.md)** — the rule-4 keyboard pass, finally
>   done, and *measured* in the running game rather than assumed. The core loop is
>   keyboard-operable and every control has a focus ring; the two real findings are
>   that the gold ring fails contrast on every light surface (1.7–2.1:1 against a
>   3:1 requirement) and that none of the 13 `aria-modal` dialogs traps or restores
>   focus. Order to fix is at the bottom of that file.
>
> Also corrected there: this repo now holds **447 locations across 106 countries**,
> not the 144 `CLAUDE.md` still claims.

> ### ⚠ 2026-07-27 — several items below were ALREADY DONE. Check before you start.
>
> An overnight session picked up six tasks from this file and found three of them
> finished months ago. The counts in this document are the least trustworthy thing
> in it. **Verify against the shipped data before believing any number here.**
>
> - **The Progress page is DONE** (and so are the Trophy Shelf and the Journals).
>   `PassportModal` has had `PROGRESS_PAGE = 1` with `progressByContinent` and
>   `troubleSpots` since "Show what the child actually knows". The list of "still
>   open" items further down still asks for it.
> - **"18 countries on the generic music bed" was TWO** — Canada and Malta — and both
>   now have their own. An earlier session added the Nordic, Alpine, Celtic, Slavic
>   and African beds and never updated the note. `test/audio.test.js` now asserts no
>   country can reach `generic` again, so this particular number can't go stale.
> - **Chile's mainland is fine** (6 places), and South America is 41, not 34.
> - **Oceania was the real gap** and is now 37, up from 30 — but the useful number was
>   never the total: 13 of those 30 were `coast`, and the continent had no ice, no
>   river, no sacred place and no rock art at all. Seven places fixed the spread.
>
> **Landed this session:** the Credits & Legal page (reachable from the copyright
> line in the splash corner); three Journeys (Pony Express, Shackleton's Endurance,
> the Exodus); the `certainty` warning that contested journey stops were carrying in
> data but never showing; Canada's and Malta's music; seven Oceania places; and the
> first slice of the big-file split (`src/components/media.jsx`).
>
> **Two things worth knowing:**
> - **Amundsen's polar route is blocked on a polar projection.** The journey map is
>   equirectangular, where the South Pole is the entire bottom edge and every meridian
>   meets there, so a route ending at 90°S draws its last leg sideways along the foot
>   of the world. Shackleton's story stays between 54°S and 69°S, which is why it was
>   the polar route that could be built. Amundsen needs projection work first.
> - **`nextMrOImage` calls `Math.random()` directly**, which the "every random choice
>   goes through src/rng.js" rule forbids. It only picks which portrait of Mr O to
>   show, so nothing about a run's outcome depends on it — but it is a real exception
>   to a rule this project treats as absolute, and it should either be fixed or the
>   rule should say "except art selection".

### Contents

This document is long enough that things get lost in it. Every section, in order:

| § | | |
|---|---|---|
| [1](#1-the-avatar-redesign--done-2026-07-28) | Avatar redesign | ✅ done |
| [2](#2-rotating-people-cards--done-2026-07-15) | Rotating people cards | ✅ done |
| [3](#3-the-roguelike-layer) | The roguelike layer | biggest unstarted build |
| [4](#4-the-tap-to-learn-curiosity-layer) | Curiosity layer | ✅ done |
| [5](#5-more-journeys) | More Journeys | ongoing content |
| [6](#6-wire-the-awardprogression-graphics-into-the-passport) | Award graphics into the passport | ✅ done |
| [7](#7-backend-for-cross-device-profiles-and-friend-leaderboards) | **Supabase backend** | schema + merge built 2026-07-19; needs the migration run |
| [8](#8-optionally-package-a-desktop-app) | Desktop app | recommended against |
| [9](#9-travel-modes--built-2026-07-15-balance-wants-a-playtest) | Travel modes | built; balance wants Joshua's feel |
| [10](#10-rewards-progression-and-the-dog-brainstorm-2026-07-19) | **Rewards, progression, and the dog** | brainstorm — decisions needed |
| [11](#11-the-music-honestly-2026-07-19-recounted-2026-07-28) | **The music, honestly** | recounted 2026-07-28 — 11 regional beds became 43; `caribbean` is the last one left at six |
| [12](#12-currency-price-anchors--built-2026-07-29-and-it-stops-at-10-countries) | **Currency price anchors** | built 2026-07-29 — 10 countries, and why "all of them" isn't available |

### THE THREE THINGS TO DO NEXT (start here)

1. **Travel-modes balance playtest.** The feature is built and live (see §9); its
   *numbers* want Joshua's feel. He plays a Grand Tour on Adventurer and says "money
   too tight/loose", "last legs cost too many days", "the bonus is weak". Dial in
   `src/data/travel.js` (`transportOptionsFor` — the `usd`/`days` formulas), the
   starting wallet in `startTour` ($3,500 Adventurer / $2,500 Expert), and `legSlack`
   (the extra day budget per stop). Leftover-money bonus = 1 pt per $500, in the
   `photographCity` tour-win branch.
2. **Badge art — ✅ essentially DONE (71/73, 2026-07-16).** Every tracked value in the
   game renders its own art; no placeholder emoji remain anywhere. Only two optional
   flourishes are left (`travel-wallet.png`, `travel-hub.png`) and neither blocks
   anything. If more art ever lands it's a one-file job: drop the PNGs in
   `public/assets/shutterbug-ui/<folder>/`, run `node scripts/optimize-ui-art.mjs`, add
   the keys to **`src/data/art.js`**, `npm test`. Every render site prefers art and falls
   back to emoji, and `<ArtBadge dim>` generates the greyed/locked state from the colour
   file. See `docs/art-assets-needed.md`.
3. **The roguelike layer** (§3) — **all five slices now shipped** (camera bag, run
   modifiers, route-choice map, debrief/renown, push-your-luck + Cover Story finale).
   The Long Trip is feature-complete; what's left is playtest and feel — dial the
   balance knobs (`LONG_TRIP_DAYS`, `renownGain`/`renownRank`, `COVER_DAYS`, the
   hold-for-the-light odds, condition/kit strengths), and decide whether guests should
   be able to reach the mode at all.

**Then, in Joshua's stated order:** the graphics pass is now done — §1 avatar redesign
landed 2026-07-28 and §6 badges before it — leaving the **desktop executable + final
single-screen fit** (§8) as the capstone. The Supabase backend (§7) sits off to the
side whenever he wants it.

### Recently shipped

**2026-07-17/18 — the recast + a long polish run.** Grandpa Nigel became **Uncle
Jonah** (new art, new signature, backstory reworked from "never went" to "went young,
passing it on"); his expression set grew to 17 faces mapped per mood, including a
difficulty ladder that climbs to wide-eyed astonishment on Expert. **Quiz and Daily
modes removed.** Uncle Jonah's screens (intro, meet, homecoming, results) share one
desk backdrop; the results screen fits without scrolling, roll left and Jonah right,
polaroids title-only in a handwritten face. **Mr O** got a first-time introduction, a
"bwooop", and now stays away for the whole of assignment 1. Audio: the Star-Spangled
Banner replaced "When the Saints" (and had a wrong note fixed), country tunes play
twice at double volume, a 4-second music fade, a shutter at capture with the reward
chime held until the photo develops, and a quiet thunk under every button. Maps:
Russia's NE coast regenerated, relief re-rendered at 12288px, North/South America and
the USA re-cropped, paper grain over the world map, and the compass shrunk out of
Hawaii's way. Ten new greeting bubbles (with the corrected Russian and Hindi) that now
tell you the language and what the word means. The passport became popup-only. A build
stamp sits in the splash corner so you can tell which build you're on.

Earlier this month: **travel modes** (§9 — the big one), plus a small-fixes UI pass (flight
music plays the full 4s then fades over 2s; hover-only country/landmark labels; the
Aleutian wrap cut off the world map; Europe/UK/Asia map crops + vertical stretch; the
polaroid result layout; US-English spellings), CI action bumps, the Mr O riddle
catchphrase, **Mr O now appears only on arriving at a new continent** (no more
mid-country interruptions), **landmark pins de-overlap with leader lines to their true
spots**, **traveller selection moved off the splash to its own screen**, France
overseas-territory locator insets, the curiosity layer grown to **42 cards**,
**rotating people cards** for the six multi-ethnic countries (§2 — DONE), and **four
more Journeys** (now 8 routes) with a height cap so tall north–south routes fit.

Earlier sessions: the Natural Earth water layer, the sharper relief plates, the Seeded
Daily Expedition, the imperial-first units pass, the Grand Tour rework, the first
Journeys, and the Grandpa Nigel story frame.

---

## Where things stand

- **Live** at `joshuadanielspencer-boop.github.io/shutterbug/`. `git push` to `main`
  triggers `.github/workflows/deploy.yml`, which tests, builds and publishes. There
  is no separate deploy step.
- `npm test` → **120 tests, 7 files** (`data`, `daily`, `routes`, `art`, `audio`,
  `passport-file`, `passport-merge`). They must stay green; several of them guard
  *facts*, not just shapes, and exist because a plausible-looking wrong map shipped
  once already. Three caught real bugs on their first run: a second bagpipe drone
  stacking over the splash bed, three missing continent-crossing pairs, and the
  world-map tint never matching "United States" because the map data calls it
  "United States of America".
- **Every random choice must go through `src/rng.js`** (`rnd()`, `shuffled()`), never
  `Math.random()` — a stray `Math.random()` breaks reproducibility *silently*.
  `test/daily.test.js` guards the primitives. (It was written for the Daily
  Expedition; that mode is gone but the primitives are still load-bearing.)
- The deploy workflow uses `actions/upload-pages-artifact@v5` + `deploy-pages@v5`
  (bumped off the deprecated Node 20 in July 2025).
- **Game modes that exist:** Assignments, Grand Tour (route optimisation), Journeys,
  Themed Expeditions, Explore. **Quiz and Daily Expedition were removed** — the review
  quiz now runs at the end of every scored run (the homecoming).
- **The one big file:** `src/shutterbug-world.jsx` (~6,500 lines) is the whole game
  component. Everything else is data, rules pulled out for testability
  (`missions.js`, `routes.js`, `rng.js`, `daily.js`, `profiles.js`), or generators
  under `scripts/`.

### Tools you will want

| Script | What it does |
|---|---|
| `node scripts/commons.mjs search "…"` / `cat "Category:…"` / `verify "File:…"` | Search Wikimedia Commons and **verify a file's licence, author and size**. Never add a photo without running `verify` on it. |
| `node scripts/gen-geography.mjs` | Rebuilds `src/data/geography.js` (rivers/lakes/seas) from Natural Earth. |
| `node scripts/make-relief.mjs <NE1.tif> --width 8192 --out public/relief-world.jpg` | Rebuilds the relief plates. |
| `node scripts/imperial-first.mjs --dry` | Finds/rewrites metric-only measurements. Always `--dry` first. |

### Three traps that have already bitten, and will again

1. **A plausible map is not a correct map.** Natural Earth has a "Colorado" in
   Argentina and a "Mackenzie" in Queensland; long rivers are stored under local
   names, so a lookup for "Nile" gave a Nile that stopped in Sudan. Both looked
   completely fine on screen. If you add geographic data, add a test that pins it to
   an *independent* fact (a basin it must lie in, a city it must pass).
2. **An SVG clips to its viewport, not its viewBox.** A map box whose aspect ratio
   doesn't match its frame gets letterboxed, and the relief plate spills into the
   letterbox showing map that shouldn't be there.
3. **Wikimedia URLs are percent-encoded.** "Belém" contains `%C3%A9m`, whose "9m"
   reads as a measurement. Any regex sweep over the data files must skip lines
   containing URLs.

---

## 1. The avatar redesign — ✅ DONE (2026-07-28)

Joshua's painted plates replaced the procedural SVG everywhere it appeared: the
header, the passport photo frame, the traveler picker, the leaderboard rows, the
customize popup and the create-traveler popup.

The old sprite sheets are **gone** (`public/assets/shutterbug-ui/avatar/`,
`public/avatar-preview.html`, `scripts/slice-avatar.mjs`, 2.5 MB), and with them
the hard part of this task. The old brief was to calibrate a per-layer anchor and
scale because the sheets were not mutually registered. The new delivery needs
none of it: every plate is the same 1200×1200 canvas and, verified by comparing
alpha masks, they are recolours of one drawing. Stacking them IS the assembly —
no offsets, no scaling.

**How it fits together now:**

- **`Images/Avatar designs/*.png`** — Joshua's deliveries. Outside the build.
- **`node scripts/build-avatar-layers.mjs`** — de-frames, scales, writes WebP to
  `public/assets/shutterbug-ui/avatar-v2/` **and** generates `src/data/avatar.js`.
  10.7 MB of PNG becomes 610 KB. A new colour or garment is a correctly-named
  file plus a re-run; a new *kind* of part (a hat) is one line in `PARTS`.
- **`scripts/avatar-brows.mjs`** — the eyebrows are painted into the head plates
  in one fixed brown, so they are lifted out and recoloured to match the hair.
  Five small files cover every combination. Hand-drawn `brow_<colour>.png` in a
  future delivery would win outright and switch the synthesis off.
- **`src/avatar-spec.js`** — the pure logic, tested in `test/avatar.test.js`.
- **`src/components/avatar.jsx`** — `<Avatar>`, `<AvatarControls>`, `<AvatarEditor>`.
- **`public/avatar-lab.html`** — the standalone review page, still live. It reads
  the generated manifest, so a new art batch shows up there with no code change.

**Two things a future session should know:**

- **Saved avatars are migrated on read, not in storage.** A spec written by the
  old scheme is detected by its legacy-only keys and matched onto the nearest new
  plate by colour, so a child's dark skin stays dark and their blonde hair stays
  blonde. `hair` is the one key BOTH schemes use, meaning different things, which
  is exactly the trap the detection is written around. Hat, glasses and hair
  style have no successor and are dropped; the old fantasy hair colours land on
  whichever real colour is nearest.
- **The plates are waist-up busts.** Anything under 96px renders a face crop
  (`FACE_BELOW` in the component) or the face is a few pixels across.

**Still to come from Joshua:** male/female variants (different eyelashes and hair
options — the filename grammar already parses a `male`/`female` token) and more
garment kinds in the same colour range.

---

## 2. Rotating people cards — ✅ DONE (2026-07-15)

The six multi-ethnic countries that showed a single community now rotate 2–3
licence-verified cards on arrival, each user-approved before commit:
Brazil (+Kayapó), South Africa (+Xhosa +Zulu), Malaysia (+Chinese +Indian),
Canada (+Inuit), Australia (+Aboriginal), New Zealand (+Samoan). Every existing
single card gained a `people:` field so the rotation names each one.

The mechanism: `COUNTRY_PEOPLE` in `src/data/culture.js` accepts either a single
card or a list of up to three; `peopleCards(country)` normalises both; the arrival
card rotates between visits with prev/next buttons. `test/data.test.js` enforces
≤3 cards, a named `people` on each, no duplicate peoples, and a free licence.

**Optional future depth** (not required): the US itself is a floor, not a full
account — Hispanic/Latino and Asian American communities could each be added. To
add any card: `node scripts/commons.mjs verify "File:…"` (must come back `✓`; copy
its `src`/`source` verbatim), add to the country's array with `people/caption/
credit/license`, `npm test`, and **show Joshua the photo first**.

---

## 3. The roguelike layer

Spec'd in `docs/design-notes.md` §3. This is **The Long Trip** — the fifth mode.
**Four of the five slices have shipped**; each was built to be playable on its own.

1. **Camera-bag loadout** — ✅ SHIPPED (`src/data/kit.js`). Run-scoped items: telephoto
   lens (first wrong country free), fast film (a perfect shot refunds ½ day), bush
   plane (one free continent hop), a friend in town (first wrong continent free)…
   Jonah deals a hand of three at the bag screen; you take two.
2. **Run modifiers** — ✅ SHIPPED (`src/data/conditions.js`). One condition drawn per
   run ("Monsoon — flights to Asia +1 day", "Clear skies — perfect shots pay extra"),
   announced by Jonah on the kit screen and shown on the route board. The `effect` id
   is the contract; a test pins that every one has a handler.
3. **Route-choice map** — ✅ SHIPPED (2026-07-25). At the start of every leg the editor
   wires THREE briefs (`RouteBoard` in `shutterbug-world.jsx`, offered from
   `offerRouteChoice`/`routeWindow`, taken via `takeRoute`). Each card shows the kind
   of place, a tier-appropriate clue teaser, and the real day-cost to reach it (same
   formula `chooseContinent` charges, run modifier included) — but NEVER the continent
   name, so choosing a brief never hands a child the geography the shot teaches. The
   pick is swapped into `assignments[step]`, so the rest of the play loop is untouched;
   briefs you pass over reappear in later windows (the road not taken stays out there).
4. **Debrief / renown end screen** — ✅ SHIPPED (2026-07-25). Running out of days is the
   expected ending, so the results screen banks **renown**: two per photo brought home,
   plus a five-point scoop the first time a run beats your own distance record. It
   accumulates across every Long Trip (`profile.longtrip.{renown,bestDistance,runs}`,
   `recordLongTrip`) and climbs a newsroom ladder (`renownRank`: Unknown → Local
   Stringer → … → Living Legend). The "📡 PRESS DEBRIEF" card on the end screen shows
   the run's renown, the standing + bar to the next, and the farthest run. Guests see
   the run tally without the persistent totals. Pure formulas in `src/profiles.js`,
   tested in `test/longtrip.test.js`; the sync merge takes renown/distance to the MAX.
5. **Push-your-luck + the boss "Cover Story" finale** — ✅ SHIPPED (2026-07-25). Two
   climactic beats:
   - **Hold for the light** (`GambleModal` / `resolveGamble`): after a PERFECT shot
     (~1 in 3, and always on the cover) the child may gamble the reward — win and the
     light breaks golden for +points, bust and a cloud costs half a day. It's a coin
     flip on the REWARD, never on the geography (the place is already found), so it
     rewards nerve without ever paying for a wrong guess. The base points bank first,
     so a bust never takes what knowing the answer earned.
     `HOLD_ELIGIBLE_CHANCE`/`HOLD_WIN_CHANCE`/`HOLD_BONUS` are the knobs.
   - **Cover Story** (`offerNextRoute` / `coverStepRef` / `coverLandedRef`): once per
     run, after `COVER_MIN_CAPTURES` places and once `days <= COVER_DAYS`, the route
     board floats a gold "★ COVER STORY" brief among the choices — a marquee front-page
     landmark worth `COVER_POINTS_MULT`× points and `+COVER_RENOWN` renown. Chasing it
     is a strategic gamble (it may cost the days that end the run); landing it stamps
     "You made the cover!" and shows the cover bonus on the debrief. `recordLongTrip`
     takes a `coverBonus`, `renownGain` folds it in, and `profile.longtrip.covers`
     counts them — all pinned in `test/longtrip.test.js`.

**The Long Trip is now feature-complete — all five roguelike slices are in.** Open
threads are all playtest/feel, not build:
- Balance: `LONG_TRIP_DAYS`, the `renownGain`/`renownRank` numbers, `COVER_DAYS`/
  `COVER_MIN_CAPTURES` (how often the cover appears), and the hold-for-the-light odds.
- Guests can't reach the Long Trip at all — `unlocks(null)` (profiles.js) predates the
  mode and omits its key, so `longtrip` is undefined→locked for guests. A named
  traveler unlocks it at 20 mastered places. Decide whether guests should get it.
- The cover is drawn from the pool's next SPECIFIC assignment and framed as marquee;
  it isn't hand-curated to the world's most iconic landmarks. If you want the front
  page to always be an Eiffel-Tower-tier place, add a curated id set and prefer it in
  `offerNextRoute`.

**Notes for slices 3 & 4 (feedback welcome):**
- The debrief adds a card to the results screen's right column. For a short run the
  left roll is short, so at a 1280×720 window the right column can run a touch past the
  fold before the `DeskBoard` scrolls. Worth a glance if the no-scroll fit matters —
  making the debrief more compact, or moving it under the score banner, are both easy.
- The route board withholds the continent name deliberately (teaching), but the easy
  tier's clue text still names the place, exactly as the note does — that's consistent,
  not a leak. If a future tier wanted the board to tease *less*, `assignmentBrief` is
  the one place to change it.

**Use `src/rng.js` for every random choice** (`rnd()`, `shuffled()`, `pickOne()`).
Never call `Math.random()` directly in generation code: `withSeed()` is what makes a
run reproducible from a seed, and a stray `Math.random()` in the generator breaks that
*silently* — nothing looks wrong until a run that should replay identically doesn't.
`test/daily.test.js` guards this. (It was written when the Daily Expedition needed
every player to get the same run; that mode is gone, but seeded reproducibility is
still what any future shared/replayable run would be built on.)

---

## 4. The "tap to learn" curiosity layer

**A first slice SHIPPED** (spec'd in `docs/design-notes.md` §6). The engine is built and
data-driven, so adding cards is now pure content work.

- **Cards** live in `src/data/curiosities.js` as decks (rule 1). Each card is
  `{ id, title, body, source, asOf? }`; anything time-sensitive carries `asOf` and the
  card shows "as of YYYY". `npm test` walks the cards: unique ids, a source on every
  external fact, imperial-first measurements, and an `asOf` on the four known
  time-sensitive cards (country count, blocs, most-visited country/city).
- **The card UI** is `CuriosityCard` (a `ModalShell`): title + fact + source + "as of",
  a "2 of 3" counter, and an **Another ↻** button that reshuffles onward. `narrator:
  "trivia"` themes it as Mr O the editor (teal); `"story"` as Grandpa (gold).
- **Wired chrome (7 of 8 elements):** the **logo** (about the game), the **days
  calendar** (travel & time), the **compass rose** on the map, and the four **guess-stage
  markers** each carry an ⓘ (continent, country, destination, photograph). Every card a
  saved traveller reads is recorded via `markCuriositySeen`, and a **"Curiosities found:
  X / 21"** line shows in the field-journal panel.

**What's left on this item:**
- **42 cards (2026-07-16), up from 21** — the ~40 target is met, and every deck now holds
  exactly 6, which is the number that actually matters: the deck reshuffles on each visit,
  so a short deck repeats sooner than its neighbours. `logo` was on 4 and `calendar` on 5.
  Every fact is source-cited and `asOf`-dated where it can drift. Adding more is just more
  objects in the deck's `cards` array; the reshuffle, counter and `CURIOSITY_TOTAL` tracker
  all scale automatically — **keep the decks equal** if you grow it again.
- **The avatar → "customise traveller" jump is now WIRED (2026-07-15):** tapping a saved
  traveller's header avatar opens the Customize Traveler editor (mid-run too).
- **The compass tap-target overlaps the corner of the continent-selection map.** It only
  owns its own ~104px footprint (verified: every continent stays selectable elsewhere,
  and it's disabled during a flight), but if you ever want it truly zero-conflict, move
  the compass deck's trigger off the world map or lower its stacking below the continent
  hit-layer.
- **Re-verify the dated cards periodically** (rule 2): BRICS grew to 11 in 2025, France
  passed 100M visitors in 2024, Bangkok was the most-visited city in 2024. When these
  change, update the body and bump `asOf`.

---

## 5. More Journeys

The engine is **built and proven** (`src/data/journeys.js` + the `journey` mode).
**Eight routes now ship** and a **picker** lets the player choose between them on the
meet screen. **Adding a route is now just data.**

- **Lewis & Clark** (6 stops) — the original flagship.
- **The Oregon Trail** (9 stops) — a migration, not an expedition; a tight chain of
  landmarks across the plains.
- **Darwin's *Beagle*** (9 stops) — the first **circumnavigation** in the set. Note the
  Galápagos card deliberately teaches that it was the **mockingbirds**, not the finches,
  that Darwin noted island-by-island (the finch story is a later myth — rule 2).
- **Magellan & Elcano** (8 stops) — the second circumnavigation, ending on the lost day
  at Cape Verde and the Date Line.
- **The Transcontinental Railroad** (5 stops) — Omaha → Promontory → Sacramento.
- **Route 66** (7 stops) — Chicago → Santa Monica.
- **The Thirteen Colonies** (13 stops) — New Hampshire → Georgia down the seaboard. The
  first **tall (north–south) route**, which needed the height cap below.
- **Paul's First Journey** (8 stops) — the first **contested** route done right: the
  intro + the two archaeological stops (Lystra, Derbe) plainly say it's the
  traditionally/popularly acknowledged path, and each stop carries a `certainty` of
  `"documented"` or `"traditional"` (the pattern the ⚠ note below asked for).

**A tall route needed a layout fix (2026-07-15, done):** the journey map was
width-driven, so a north–south route (the 13 Colonies) ran off the bottom of the
screen. Routes with aspect `< 1.6` are now driven by a **capped height** and centred, so
the whole map — every stop — fits one screen; wide routes still fill the width and pan
sideways. See the `JOURNEY_AR < 1.6` branch in `shutterbug-world.jsx`.

**Circumnavigations needed real engine work** (all done, all tested):
- `unrolledX(journey)` places each stop at whichever copy of its longitude (x, x±360…)
  is *nearest the previous stop*, so a westward leg is drawn going **west** even across
  the antimeridian. Without this, Magellan's Pacific crossing renders as a line running
  back **east** across Africa — a plausible map that is exactly wrong (trap 1). The map
  is **tiled sideways** to follow it, which is why Spain shows at both ends of the frame.
- `journeyBox` now takes the route's own `aspect`/`pad` (a round-the-world route wants a
  long letterbox; a wagon trail does not), and the **frame is shaped from the box**, not
  the reverse.
- Pins **shrink** so they can't overlap on a globe-wide map, edge labels turn inward,
  chain labels alternate above/below, and on a phone the map **pans inside its frame and
  auto-scrolls to the active stop** (a whole-world map squeezed to 375px gives a 6px pin).

**Still on the wish list:** the Exodus route (⚠ contested — see below), National Parks,
the Pony Express, Amundsen's/Shackleton's polar routes. Marco Polo stays **excluded**
(serious historians dispute whether he reached China; it's a claim about a book, not a
documented route). **Paul's First Journey (done) is the worked example** for a contested
route — copy its `certainty` + "traditionally acknowledged" framing.

**How to add one:**
- Get each stop's coordinates from its Wikipedia article via the MediaWiki API — do
  **not** eyeball them off a map:
  `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates|extracts&exintro=1&explaintext=1&titles=Fort+Mandan`
- Record the article URL in the stop's `source`. Add an `outro` (shown on the win
  screen) — it lives in the data now, not the component.
- Keep facts on the plainly documented spine of the story.
- Measurements must be **imperial first, metric in brackets** — the units test covers
  journey facts and prompts.
- `npm test` enforces: ≥4 stops, coordinates in range, `x`/`y` derived from `lat`/`lon`,
  a source per stop, **no leg drawn the long way round**, circumnavigations that really
  span the globe, and **no two stops closer than 2.4% of the map width** — a fraction,
  not a fixed 1.2°, because 1.2° is a comfortable gap on a map of Wyoming and four pixels
  on a map of the world. (Port St Julian sits 5.7° from the Strait of Magellan and still
  had to be folded into the Strait's card.)

> ⚠ **Contested routes need the `certainty` treatment — Paul's First Journey now shows
> how.** The seven documented routes are safe (nobody disputes where Fort Mandan or
> Promontory Summit was). Paul's route was the first contested one shipped: its intro
> says it's the traditionally acknowledged path, and each stop carries a `certainty` of
> `"documented"` or `"traditional"` (Lystra and Derbe are `"traditional"`, located only
> by later inscriptions). The Exodus route and the site of Mount Sinai are the next
> contested candidates — copy Paul's framing. Do not quietly present a traditional site
> as a fact. This is a rule-2 issue, not polish.

---

## 6. Wire the award/progression graphics into the passport

**BLOCKED on Joshua's art.** He has the spec (career-rank insignia ×6, 14 category
badges, 3 kind mega-badges, special medals, record rosettes, continent roundels, extra
stamp frames) and will drop the files into `public/assets/shutterbug-ui/`.

When they land: wire each to its tracked value and auto-grey the unearned ones. What's
already tracked is listed in `docs/design-notes.md` §7. The passport booklet lives in
`shutterbug-world.jsx` (search `passportPage`); badges currently render as greyscale
emoji, which is the pattern to replace.

---

## 7. Backend for cross-device profiles and friend leaderboards

**Needs Joshua's input before any code:** he must create the Supabase project, and
decide the family-code scheme.

Everything currently lives in `localStorage` (`src/profiles.js`) — per-browser, never
syncs. The plan: adopt Supabase (the free tier covers this comfortably), move
`profiles.js` storage to the cloud **with an offline fallback**, and add a
passcode/"family code" shared group so everyone with the code sees one leaderboard.
Async — no live networking needed.

**For kids: anonymous accounts + a shareable code. No passwords, no PII, no open chat.**

This one decision unlocks both cross-device sync and friend competition.

**Sequencing (updated 2026-07-18).** This used to say "do it after the Daily Expedition
has proved out" — the Daily mode is gone, so that condition no longer exists and is not
a reason to wait. Two things that DO matter:

- **Build it local-first.** Keep `localStorage` as the read path and sync to Supabase in
  the background, so `profiles.js` stays synchronous and no call site changes. That is
  also simply correct for an offline-capable PWA. The alternative — `await`ing cloud
  reads — turns all ~25 exported functions async and touches call sites throughout the
  6.5k-line component, which WILL collide with any feature work happening in parallel.
  Done local-first, this can proceed alongside everything else.
- **Sync the profile as a JSON blob**, not a normalised schema. Profile fields are still
  being added (`metNigel`, `metMrO`, `grandpaWant`…) and a blob makes that churn free.
  Keep a few denormalised columns beside it (name, best score, difficulty, rank) purely
  so the leaderboard query stays cheap.

**Do the file export/import first** (see the box at the top). It ships the durability
win on its own, needs no backend, and produces exactly the serialization this reuses.

---

## 8. Optionally package a desktop app

**Needs Joshua's decision — and the standing recommendation (2026-07-18) is DON'T.**
The game already installs as a PWA (Chrome/Edge/Safari → Install) with zero work, and
the target device is a desktop where that install works fine. The only thing Tauri adds
is a real double-click icon, and it costs $99/yr to sign; unsigned, it throws OS
security warnings at whoever opens it. Revisit only if that icon is genuinely wanted.

For a real double-click `.app`/`.exe`, wrap it with Tauri.

⚠ Unsigned apps trigger OS security warnings, and code signing costs money (Apple
$99/yr). Don't start this without him agreeing to that.

⚠ Also tied to this: the **final single-screen pixel fit** (map cap, header, phase
tracker) should be tuned to the executable's *locked window size* once he picks it —
doing it before that is guesswork. The desk already fits a normal browser window.

---

## 9. Travel modes — ✅ BUILT (2026-07-15); balance wants a playtest

The higher Grand Tour tiers (**Adventurer/Expert only**) now travel for real. Clicking
a continent opens a **"Getting there" chooser**: pick which real **regional hub
airport** to fly into (sorted nearest-first, each with its flight cost), then pick the
**last-leg transport** to your next target — a genuine **time ↔ money** tradeoff. Every
price shows **dollars first, local currency in parentheses** (rule 3 style). A money
**wallet** sits beside the day calendar; both resources are spent as you travel, and
**leftover money pays 1 point per $500** at the win, alongside banked days.

- **Data:** `src/data/travel.js` — `HUBS` (4–6 real IATA hubs per continent with real
  coords), `TRANSPORT_MODES` (bus/train/taxi/domestic flight + ferry/riverboat/canoe,
  cable car/cog railway, tuk-tuk, camel, and Venice's gondola), `transportOptionsFor()`
  (offers only the 2–3 modes that genuinely fit the place — rule 2 — with concrete
  day/dollar costs), `CURRENCIES` + `COUNTRY_CURRENCY` + `money()`. Prices are
  deliberately **abstract** (a tradeoff, not a real fare we'd have to source and keep
  current); exchange rates carry `CURRENCY_AS_OF`.
- **Component:** `TravelChooser` in `shutterbug-world.jsx`; `confirmTravel()` deducts
  money + days then runs the real flight; gate is `travelModes` (tour + medium/hard).
  Antarctica has no hub, so it flies the old way. Money floors at $0 — **never disable
  the Go button** or a broke player soft-locks.
- **6 tests** guard it (hubs in range with derived map coords, ≥3 per continent, every
  landmark reachable with a real cheap↔fast spread, currencies well-formed, `money()`
  leads with dollars).

**What's open:** the **balance** (see "the three things to do next"). Optional later:

- **Currency coverage — 55/106 countries (281/437 locations).** 2026-07-16 added every
  currency whose rate is a *structural fact*: the two CFA francs, the CFP franc, the
  Danish krone, and the riyal/dinar/Belize/Namibian dollar pegs, plus the Belgium and
  Finland Eurozone gaps and the two dollarized countries. Those are DERIVED from their
  anchor in `PEGGED` (travel.js) so refreshing the euro carries them along, and
  `test/data.test.js` pins each published parity.
  **The remaining ~50 are floating rates and deliberately not guessed** (rule 2). Several
  — Venezuela, Zimbabwe, Sudan, Iran, Cuba — have no single honest rate to quote
  (hyperinflation, or official vs. street rates that differ by multiples), so they want a
  sourced decision rather than a number from memory. The USD fallback is not wrong, just
  silent.
- **Flavour-transport tags — ✅ done 2026-07-16, and it was a correctness pass, not flavour.**
  The category-derived rules were quietly false: `category === "desert"` offered a camel at
  the Dune du Pilat near Bordeaux, at White Sands, on the Uyuni salt flats and in the McMurdo
  Dry Valleys; `category === "mountain"` offered a cable car up Everest, Denali, Aconcagua and
  Kilimanjaro (whose cable car was announced in 2019 and never built). Camels are now gated on
  a verified country list, and cable cars / cog railways on explicit per-place lists — absence
  means not offered, which is the safe default. Riverboat needs `waterway` + the `river` tag
  (both halves: the category alone put a boat on the Dead Sea, the tag alone put one at Taroko
  Gorge); the dugout is limited to the Okavango's mokoro, the Amazon and Caño Cristales.
  Every waterway now carries `river`/`lake`/`canal`. `test/data.test.js` pins all of it.
  **To add a mode somewhere new, verify it and add the id to the set in travel.js.**
- ~~Real transport icons~~ — ✅ done 2026-07-16; 12 top-down icons at 46px in the chooser.
- **A lighter hub-only version in Assignments** — deferred: choosing transport to a named
  landmark would spoil that mode's deduction game.

---

## 10. Rewards, progression, and the dog (brainstorm, 2026-07-19)

Joshua's report: *"I recently accomplished something (maybe visiting all 7 continents)
and there was the option to go see Jonah — and he said congratulations and then that
was it. If there was a stamp awarded or a game mode unlocked, it wasn't clear."*

He is right, and the code confirms it. **Earning an achievement grants nothing.**
`achievements()` in `profiles.js` derives 24 badges live from `profile.loc` on every
call — nothing about them is persisted, nothing is awarded, and the only consequence
is a chip on the results screen plus a line from Jonah. Separately, `UNLOCK_REQ` has
five real gates (Adventurer, Grand Tour, Expert, Expeditions) but they unlock quietly
and are announced only in passing.

So there are two systems that both *look* like progression and neither of which pays
out. Options, cheapest first:

**a. Make the existing gates land properly.** The unlock moment is the strongest beat
the game already has and it's thrown away in a sentence. A full-screen "Uncle Jonah
has something for you" — the badge drawn large, what it unlocked named explicitly,
and the new mode's card visibly lighting up on the meet screen next time. No new
systems, just staging what already happens.

**b. Give achievements a home worth filling.** They already appear in the passport as
"keepsakes", but the passport is a list. A shelf/case where the 24 sit as visible
empty silhouettes from the start would do what the map-tinting idea does: show the
child the shape of what they haven't done yet. Pairs naturally with the Progress page.

**c. Tie unlocks to Jonah's anecdotes.** `src/data/anecdotes.js` has 300 lines of his
stories. Earning a continent badge could unlock the story of *his* trip there — a
reward that is more of the thing the child already likes, costs no new art, and
reinforces the frame (he went young, you go now).

**d. Themed expeditions as the unlock currency.** Expeditions already exist and are
already gated. Making specific ones unlock from specific achievements ("photograph
all 7 summits → the Roof of the World expedition") gives badges a concrete payout
without inventing a new reward type.

**e. A "first time only" bonus** on each newly photographed place, so a child who
ranges wide is scored differently from one who replays the same five. Cheap, and it
pushes toward the breadth the content is there to teach.

Recommendation: **(a) then (c)**. Both are staging and content rather than new
systems, and (a) fixes the specific thing that felt hollow.

### The dog

Art is in `public/assets/shutterbug-ui/dog/` — six poses (standing, sitting with paw
up, play bow, walking, head-tilt sit, lying down). He already appears *in* Jonah's
painted scenes, lying by the fire, so he is established as his dog and the player
has met him without being told anything about him.

Ideas, best first:

1. **He stays home with Jonah and reacts.** Cheapest and most in keeping with what's
   already on screen: the pose changes with the result — play bow on a perfect shot,
   head tilt on a miss, lying down when the days run out. A second emotional channel
   on the screens Jonah already owns, no new mechanic, no new writing, and it uses
   all six poses. A young child reads a dog's posture faster than a sentence.
2. **He finds things.** A "sniff it out" tool alongside the Field Guide: once per
   run he points to the right continent (not the country, not the pin) for a cost.
   The play-bow and standing poses are exactly the vocabulary for that. Note this is
   close to what the Field Guide already does — worth checking with Joshua whether a
   second hint tool helps or muddies.
3. **He travels with you as a streak keeper.** He rides along and appears on the
   map after N correct shots in a row, and goes back to Jonah when the streak breaks.
   Makes an invisible stat visible, but it does add a mechanic.
4. **He is the Explore-mode companion.** Explore has no pressure and no Mr O; a dog
   trotting along the bottom of the map would give that mode its own character.

> **✅ SHIPPED 2026-07-19 — but NOT as option (1). Read this before acting on the
> list above.**
>
> Option (1) said to put him on Jonah's screens. That was written before I opened the
> art files, and it is **wrong**: he is already *painted into* every one of Jonah's
> scenes, lying by the fire. A cut-out sprite next to a painted dog reads as a bug,
> not as a feature. The sprites have to go somewhere Jonah isn't.
>
> What shipped instead: **he came along on the trip.** He sits on the travel desk
> under the itinerary column and his pose tracks the run — play bow after a good
> shot, head tilt after a miss, walking mid-flight, lying down when the days have
> nearly run out, standing on Explore where there's no clock. `DeskDog` in
> `shutterbug-world.jsx`.
>
> One trap worth remembering if this is ever reworked: reacting to `pending` (the
> result popup) is invisible, because `pending` is set for exactly as long as a
> full-screen popup is covering him. His mood is its own state (`dogBeat`), set when
> a shot resolves and cleared seven seconds later, so the reaction survives the popup.
>
> **UPDATE — he now has a JOB (2026-07-19, Joshua's call).** Reacting to the run was
> tone, not function. Three PERFECT shots in a row — right first time, no wrong guess
> between them — and he digs one of Uncle Jonah's own stories out of the camera bag,
> about a place you've just been. `src/data/anecdotes.js` was full of these and only
> the homecoming quiz ever showed one, so most were never read at all.
>
> Why a streak of PERFECT shots rather than plain correct ones: a correct shot already
> pays points, and paying it twice teaches nothing. Getting it right first time is what
> the game wants and had no growing reward for.
>
> Why a story and not a bonus travel day (the other option on the table): a mechanical
> reward would make a strong player's runs measurably easier and quietly reshape the
> difficulty curve Joshua tunes by feel. A story costs nothing and is more of what the
> child already likes. `DOG_FIND_EVERY` in shutterbug-world.jsx is the dial.
>
> Options (2), (3) and (4) are all still open and none of them conflict with what
> shipped. **His name is still unwritten** — that's Joshua's call, and naming him is
> what would turn him from set-dressing into a character.

## 11. The music, honestly (2026-07-19, recounted 2026-07-28)

> ### ⚠ 2026-07-28 — the numbers below are stale. These are the current ones.
>
> The section as written counts how many countries have their OWN MELODY, and by
> that measure nothing has changed: still six, still Germany, France, the USA, the
> UK, Mexico and Australia, and everything under "cost of doing dozens properly" is
> still true and still the reason. **Read it for that. Ignore its second number.**
>
> What changed is the shape of the other 102. The complaint was never really "not
> enough countries have their own tune" — it was Joshua saying *the Islamic
> countries all sound the same*, which was a complaint about how much of the world
> one bed was carrying. That is a different problem with a much cheaper fix, because
> a regional bed is an ORIGINAL phrase and can be written freely, where a national
> melody needs notation in hand (rule 2).
>
> | | 2026-07-19 | now |
> |---|---|---|
> | Countries with their own real melody | 6 | 6 |
> | Countries on a regional bed | 100 | 102 |
> | **How many distinct beds those are spread across** | **11** | **43** |
> | Biggest single bed | 19 countries | **6** |
> | Countries on the flavourless `generic` bed | 18 | **0** |
>
> Three passes got there, all the same shape: 2026-07-20 (Africa, the Middle East
> and `generic` broken up), 2026-07-28 morning (the maqam split — four Arab beds
> plus Turkey, after Joshua's report), 2026-07-28 evening (the four beds still at
> 7–8, plus the Mediterranean). The median bed now carries **two** countries.
>
> **What is left of this, in order:**
> 1. **`caribbean` is the last bed at six** — Cuba, Jamaica, Haiti, Trinidad, Belize
>    and Guyana on one steel drum, when a Cuban tres, a Haitian méringue and a
>    Garifuna punta are four traditions and three languages. `test/tunes.test.js`
>    holds the ceiling at 6 and names this as the reason; tighten it to 4 when it's
>    done. Five beds are at five (`eastafrica`, `southasia`, `slavic`,
>    `southernafrica`, `centralamerica`, `nordic`) and none is as indefensible.
> 2. **Nobody has heard these but a synthesizer.** Every bed is checked by test for
>    note grammar, playable range, length, timbre and how many countries it carries
>    — and none of that says whether it sounds good. That is Joshua's ear and only
>    his. `scripts/` has no renderer; a session that wants to hand him something to
>    listen to can render the tunes offline (naive oscillators + an RBJ lowpass
>    matching `TIMBRE` in src/audio.js gets close enough to compare beds).
> 3. **The six real melodies are still the ceiling on authenticity**, and the section
>    below is still the honest account of what more would cost.


Joshua asked which countries have their own tune, and what it would cost to write
"dozens" more. The numbers, counted by resolving every country in `locations.js`
through `tuneKeyFor`:

| | count | share |
|---|---|---|
| Countries in the game | 106 | |
| With their **own real melody** | **6** | 5.7% |
| On a **regional style bed** | 100 | 94.3% |

The six: **Germany** (Ode to Joy), **France** (Frère Jacques), **United States**
(The Star-Spangled Banner), **United Kingdom** (Rule, Britannia!), **Mexico**
(La Cucaracha), **Australia** (Waltzing Matilda).

The other 100 fall through `COUNTRY_MOTIF` (49 named) or `CONTINENT_MOTIF` (51) onto
one of eleven original regional beds — koto pentatonic for East Asia, oud in hijaz
for the Middle East, kalimba for sub-Saharan Africa, and so on. **18 countries** (in
North America and Europe, not otherwise mapped) get the neutral music-box `generic`
bed with no regional flavour at all — those are the weakest case and the ones worth
fixing first.

**Cost of doing dozens properly.** The engine is not the problem: it is a note-name
sequencer (`["E4", 1]`), so adding a tune is adding ~20 lines of data — call it 15
minutes each once you have the notes. The cost is entirely **sourcing and verifying
the notes**, and that is bound by rule 2 and by copyright:

- The melody must be **public domain**. Most national anthems are; most 20th-century
  folk arrangements are not, and many countries' best-known tunes are recent enough
  to still be in copyright.
- The notes must come **off a score**, not from memory. This session tried to lengthen
  La Cucaracha and Waltzing Matilda, could not reach usable notation for either, and
  so **left them alone** rather than guess — which is the correct outcome under rule 2
  and also the reason this is slow. The Star-Spangled Banner in `tunes.js` carries its
  source and a bar-by-bar note explaining the raised fourth, because a previous pass
  shipped a wrong note in it.

Realistic estimate: **30–40 more countries is a day of focused work** given a good
public-domain source (IMSLP, the Wikimedia national-anthem collection, abcnotation.com),
with most of the time in verification rather than transcription. All 106 is not
sensible — plenty of countries have no single melody that a child would recognise, and
a well-chosen regional bed is honestly better than a badly-sourced "national tune".

Suggested order if Joshua wants it: **the 18 `generic` countries first** (they have no
regional character at all), then the largest countries on regional beds, then anthem
openings for countries whose anthem is genuinely famous.

Note the tunes now play **once, not twice** — the eleven regional beds were rewritten
as two-phrase call-and-response melodies (4.7–9.9s) so a single pass stands alone.

## 12. Currency price anchors — built 2026-07-29, and it stops at 10 countries

Joshua's spec: *"a loaf of bread costs about 45 córdobas"*. The culture card already
says what money a country uses and roughly how many of it a dollar buys; that teaches
the **rate**. The price anchor teaches what the money **buys**, which is the half a
child can actually feel. Asked whether he wanted a handful first or all of them, he
said all of them.

**All of them is not available.** Not slow — unavailable. This is the finding, and it
is worth reading before anyone tries again.

### What was built

- `scripts/gen-price-anchors.mjs` — pulls WFP's Global Food Prices from the
  Humanitarian Data Exchange (CC BY-IGO, updated monthly), picks one staple per
  country, converts to imperial, rounds to two significant figures, writes
  `src/data/price-anchors.js`. The yearly CSVs are 20–55 MB and HDX drops the big
  one part-way through often enough that it retries and also accepts local copies
  (`--csv a.csv b.csv`).
- `src/data/price-anchors.js` — generated, 10 countries.
- `PriceAnchorLine` in `shutterbug-world.jsx`, under the money line on the culture
  card: *"🛒 In Kathmandu, a pound (0.45 kg) of rice cost about 40 NPR — about 27¢.
  (June 2026)"*
- `test/price-anchors.test.js` — 7 tests. The one with teeth cross-checks each price
  against the exchange rate beside it, because they come from different sources and
  if they disagree about what a pound of food costs in dollars, one of them is wrong.

Cameroon, Ecuador, Egypt, Jordan, Madagascar, Namibia, Nepal, the Philippines,
Sri Lanka, Turkey.

### Why not more — the trap, in detail

**WFP monitors the markets WFP OPERATES IN.** It publishes retail prices for 72
countries and that number is a trap, because those are food-security monitoring
sites, not national price surveys:

| country | every monitored market is… |
|---|---|
| Kenya | Kakuma and Dadaab — refugee camps |
| Uganda | refugee settlements |
| Algeria | Tindouf, Smara, Dakhla, Laayoun — the Sahrawi camps and Western Sahara |
| Zimbabwe | includes Tongogara Refugee Camp |
| Nigeria | the north-eastern conflict markets |
| Guatemala | one market, and it sells nothing but **fuel** |
| Ethiopia | one market, and it quotes nothing but an **unofficial exchange rate** |

Every one of those yields a well-formed, plausible number that would be flatly false
on a card reading "in Kenya" — the same shape as the Nile that stopped in Sudan. So
the generator does **not** take WFP's country list. It takes an explicit allowlist,
and each entry names ONE market that is either the country's own published national
average or a market in its capital, verified against the row's own admin1 region.
That allowlist is 17 countries and seven of them then fall out:

- **Nicaragua** — WFP quotes its national average in **USD**, not córdobas. Joshua's
  own example country, and the data cannot serve it.
- **Bolivia** — our exchange rate and WFP's disagree by 60%, so the cross-check
  refuses both.
- **Ethiopia, Guatemala** — no staple food in the one monitored market (above).
- **Iran, Sudan** — no single honest exchange rate (hyperinflation, or official vs.
  street differing by multiples), so no honest price either. `travel.js` already
  refuses to publish a rate for these; a price is the same claim wearing a hat.
- **Zambia** — newest observation is 13 months old.

### What it would take to finish, honestly

There is **no authoritative global source of everyday retail prices.** Checked:

- **Eurostat's detailed average prices** (`prc_dap15`/`prc_dap16`) — the obvious way
  to get ~15 European countries in one integration. **Discontinued**; the API returns
  404 for all of them.
- **World Bank ICP** — publishes PPP conversion factors, not item prices. A price
  derived from a PPP factor is a model, not a source, and rule 2 forbids it.
- **Numbeo** — crowd-sourced with no verification. Not a source for a teaching tool.
- **FAO** — producer prices, not retail.

That leaves **national statistics offices, one at a time**: BLS for the US, ONS for
the UK, e-Stat for Japan, INEGI for Mexico, and so on — roughly 90 separate
integrations in as many formats and languages. Each is genuinely authoritative and
each is a day's work. That is the real price of "all of them", and it is a content
project of the same shape as the culture-photo audit rather than a task.

**A cheaper path that would double the coverage:** the ~15 biggest economies by
themselves would cover most of the countries a child actually visits in a run (the
USA has 32 places, China 21, the UK 11, France/Germany/Italy/Greece/Japan/Mexico/
Canada 10 each). Fifteen national statistics offices is a week, not a quarter, and
it would take the card from 10 countries to 25 while covering perhaps half of all
arrivals. That is the recommendation if Joshua wants this pushed further.
