# Shutterbug — remaining work

A handoff document. Everything here is written so a **new session with no memory of
the previous ones** can pick up a task and finish it. Read `CLAUDE.md` first (the
five project rules are hard requirements), then "Start here", then the section for
the task you're doing.

Last updated **2026-10-03** — a consolidation pass, not new work.

> **What this pass did, and where the old text went.** This file had grown to 1,665
> lines by a habit that looked safe and wasn't: each session put a dated ⚠ box at the
> top and left the sections underneath as they were. Fourteen boxes later the body
> said the badge art was blocked (it shipped in July), that there were four modes
> (six), that the dog had no name (she is Pickles), and that 55 of 106 countries had
> a currency (107 of 108). Every number below was **re-counted from the shipped data
> on 2026-10-03**, and each box's content now lives in the section it was about.
>
> Nothing was thrown away: the full narrative — what was tried, what failed, the
> measured before-and-afters — is one command away, and most of it is also in the
> code comments and commit messages it describes.
>
> ```bash
> git show 191c589:docs/remaining-work.md
> ```
>
> **To keep it from drifting again:** change the section the work belongs to, and add
> one line to the [Log](#log) at the bottom. Don't add a box at the top.

## Contents

| § | | status |
|---|---|---|
| — | [Start here](#start-here) | state, what is left, standing decisions, traps, tools |
| [1](#1-the-avatar) | The avatar | ✅ shipped; adding a garment is a pipeline, not a build |
| [2](#2-rotating-people-cards) | Rotating people cards | ✅ done |
| [3](#3-the-long-trip-the-roguelike-layer) | The Long Trip (the roguelike layer) | ✅ all five slices shipped; balance only |
| [4](#4-the-curiosity-layer) | The curiosity layer | ✅ done; dated cards want re-checking |
| [5](#5-more-journeys) | More Journeys | **buildable** — pure data, 11 routes ship |
| [6](#6-award-graphics) | Award graphics | ✅ done, 71 of 73 |
| [7](#7-the-supabase-backend) | The Supabase backend | built and inert; **needs Joshua** |
| [8](#8-a-desktop-app) | A desktop app | recommended against; **Joshua's decision** |
| [9](#9-travel-modes) | Travel modes | built; **balance wants Joshua's play** |
| [10](#10-rewards-progression-and-pickles) | Rewards, progression, and Pickles | **decision needed** — five options, and the wardrobe already pays out |
| [11](#11-the-music) | The music | built; **waiting on Joshua's ear** |
| [12](#12-currency-price-anchors) | Currency price anchors | 14 countries; the cheap sources are spent |
| [13](#13-souvenir-stalls) | Souvenir stalls | 12 stalls; thank-yous unreviewed; Cameroon wants a third object |
| [14](#14-maps) | Maps | overseas insets, the relief raster, the island floor |
| [15](#15-speech) | Speech | country names are human recordings; the rest is the device |
| [16](#16-install-size-and-updates) | Install size and updates | 59.9 MB precache, guarded |
| — | [Log](#log) | what shipped, newest first |

---

## Start here

### State, verified 2026-10-03

- **Live** at <https://joshuadanielspencer-boop.github.io/shutterbug/>. `git push` to
  `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes.
  There is no separate deploy step. Working tree clean and deployed through `191c589`.
- **`npm test` → 397 tests in 23 files**, and they must stay green. Several guard
  *facts*, not shapes, because a plausible-looking wrong map shipped once. Several
  pin *decisions* — `test/souvenirs.test.js` asserts the only price-anchor countries
  without a stall are the two priced in dollars. When a test like that fails, the
  answer is usually "a decision changed", not "loosen the test".
- **Content:** 464 places in 108 countries — Europe 110, Asia 109, North America 85,
  Africa 74, South America 41, Oceania 37, Antarctica 8.
- **Six modes:** Assignments, Grand Tour (with the itinerary picker: classic plus six
  themed expeditions), Explore, The Long Trip, Journeys, Mystery Photos. Quiz and the
  Daily Expedition were removed as modes in July; the review quiz runs at the end of
  every scored run (the homecoming).
- **Counts a section below relies on:** 11 Journeys · 12 souvenir stalls holding 38
  objects · 14 price anchors covering 95 places · 42 curiosity cards in 7 decks of 6 ·
  24 achievements · 55 tunes, of which 6 are real melodies and no regional bed
  carries more than five countries · 30 hub airports · currency for 107 of 108
  countries (Antarctica has none, on purpose).
- **The one big file:** `src/shutterbug-world.jsx` is **9,895 lines** and is the
  whole game component. Newer screens have gone into `src/components/` instead
  (`mystery.jsx`, `avatar.jsx`, `media.jsx`, `modal.jsx`, `text.jsx`) precisely so
  as not to add to it. Everything else is data, rules pulled out for testability, or
  generators under `scripts/`.
- **A run in progress is saved nowhere.** The passport is written at the **end** of a
  run — `recordGame` writes every stamp in one go from the results screen, and
  Explore writes on "Done exploring". A trip abandoned halfway leaves no trace, and
  that includes souvenirs. Changing it is not small: the stamp counts and the
  spaced-repetition schedule are both derived from that single write.

> **The counts in this file are the least trustworthy thing in it.** A July session
> picked up six tasks from here and found three already finished. Re-count from the
> shipped data before believing a number, and check whether a thing is done before
> starting it.

### What is left

**Buildable without Joshua:**

1. **More Journeys** (§5) — pure data; every stop verified under rule 2. National
   Parks is the obvious next one.
2. **A third object for Cameroon's stall** (§13). It has two. The third must verify
   from a source that *states* the Cameroon connection.
3. **Re-verify the dated curiosity cards** (§4) — BRICS membership, most-visited
   country and city. They carry `asOf` years and drift.
4. **The loose ends below.** Each is small and none is urgent.

**Not a build, but the next thing Joshua is likely to react to:** Jonah's 38 souvenir
thank-yous (`SOUVENIR_THANKS` in `src/data/souvenirs.js`) are an AI's drafts in his
voice, and he has not reviewed them.

**Needs Joshua — don't build these, they are decisions:**

| | what he decides | § |
|---|---|---|
| The exchange-fee purse | his note: *"hub airports are where you change money, and whatever you don't spend before leaving is lost to exchange fees"* — a per-currency purse that changes how the wallet works everywhere | 13 |
| Hubs in The Long Trip | hubs exist only in Grand Tour on Adventurer/Expert | 9 |
| What an achievement is worth | five options written up; recommendation was (a) then (c), written before Pickles's wardrobe became a payout | 10 |
| Travel balance | he plays a Grand Tour and a Long Trip and says what feels wrong | 9, 3 |
| The arrival music | he listens at `/tune-lab.html` | 11 |
| Supabase | whether a project exists and the migration has run; then the join screen is buildable | 7 |
| A desktop app | recommendation: don't | 8 |

**Blocked on something outside the repo:**

- **Amundsen's polar journey** — needs a polar projection for the journey map (§5).
- **Widening any country's map** — needs the Natural Earth raster, which is not on
  this machine (§14).
- **Badge art for The Long Trip and Mystery Photos** — the two modes fall back to
  an emoji. `test/art.test.js` pins the set of modes *missing* art as exactly those
  two, so wiring the key is what makes the test pass again when the art lands.
- **More price anchors** — every reachable free source is taken (§12).

**Loose ends, found or confirmed on 2026-10-03.** None was fixed in this pass; they
are written down so they stop being rediscovered.

- **`startTour` and `startExpedition` build their plans with `Math.random()`** —
  seven lines in `startTour` (2849–2889 of `shutterbug-world.jsx`: which continents,
  which categories, which anchors, the option order) and one in `startExpedition`
  (3027). The standing rule is that every random choice in
  *generation* code goes through `src/rng.js`, because a stray `Math.random()` makes
  a seeded run silently non-reproducible. The earlier note recorded only
  `nextMrOImage` (which portrait of Mr O to show) as the exception; this one is in
  the generator itself. Nothing seeds a Grand Tour today, so nothing is broken — but
  either the calls move to `rnd()`/`shuffled()` or the rule gets its exception
  written down. The other direct calls (confetti, meet-screen lines, audio noise) are
  presentation and are fine.
- **`UNLOCK_KEYS` and `UNLOCK_REQ` in `src/profiles.js` still carry `daily` and
  `quiz`.** The mode art for both was removed in September; the unlock keys were not.
  Harmless, and `recordDaily`/`dailyResult`/`dailyStreak`/`recordQuiz` are still
  exported beside them. Check for stored profiles that carry those fields before
  deleting anything.
- **Five currencies the project once refused to quote now have a rate.** §9 used to
  say Venezuela, Zimbabwe, Sudan, Iran and Cuba were deliberately left on the dollar
  because none has a single honest rate (hyperinflation, or an official rate and a
  street rate that differ by multiples). The generated `src/data/currency.js` gives
  all five one — Iran at 1,333,900 rials to the dollar, Cuba at 24 pesos — and since
  the exchange tables were unified on 2026-09-30, the game prints prices through
  them. That reversed a rule-2 decision without anyone deciding to. **Joshua's
  call:** print the central-bank reference rate (what the source says) or go back to
  dollars for those five.
- **Chile will not open from the automated browser in Explore** — three real clicks
  inside its outline did nothing while every other country opened. Its single
  overseas inset was therefore reasoned from the code, never seen. Worth a human
  look.
- **The compass's tap target overlaps the corner of the continent-selection map.**
  It owns only its own ~104px, every continent stays selectable elsewhere, and it is
  disabled during a flight. Move its trigger or lower its stacking if it should be
  zero-conflict.
- **San Francisco's pin touches the corner of the Alaska inset box** on the USA map.
  A 5px matter that predates the inset rework.
- **`src/sync.js` says "the 6,345-line component"** in its header, and `CLAUDE.md`
  says the music is "6 real melodies + 45 regional beds" (`TUNES` holds 55 entries: 6
  melodies and 49 beds, of which `latin` and `generic` are carried by no country).
- **`docs/playtest-2026-07-21.md`** lists four items as not done — the Long Trip
  rail (N), ten ancient-ruins candidates (O), the full country-framing sweep, and
  plates for New Caledonia and French Polynesia. Its status box is dated 2026-07-21
  and was **not** re-verified in this pass; the game has gained 17 places since, so
  check O against `locations.js` before researching any of them.
- **`docs/people-photo-audit.md`** — 40 of 51 failing culture photos replaced; 11
  remain, each with what was searched and why nothing beat what is there, plus one
  relabelling decision that is Joshua's.

### Standing decisions — do not re-propose

Each of these was decided, usually by Joshua, usually after the alternative was
tried. They are collected here because a fresh session reliably proposes them again.

- **Nothing may depend on what the player's device has installed.** Joshua, on the
  speech voice: *"I won't be having them search their computer to download a new
  voice."* That retires the whole category, not just voices (§15).
- **Do not "fix" the Chicago photo.** The US grants freedom of panorama to buildings
  only, so every photograph of Cloud Gate is a derivative of a copyrighted sculpture.
  Chicago photographs Buckingham Fountain; a comment on the entry says why.
- **Money is never a fail state.** A souvenir costs only the leftover-cash bonus, an
  empty wallet gets no stall rather than a stall that says no, and the travel
  chooser's Go button is never disabled — a broke player would soft-lock.
- **No estimates for prices.** Joshua asked for them when a source wanted an API key;
  rule 2 forbids inventing player-facing teaching content. (The website turned out
  not to need the key — §12.)
- **No stall in a country priced in dollars.** The United States and Ecuador have
  price anchors and no stall; the stall exists to teach judging *foreign* money.
- **Stalls for countries without a price anchor are possible and were not built, on
  purpose.** The stall works without the "pounds of rice" line but teaches less.
- **Marco Polo stays out of Journeys** — it is a claim about a book, not a documented
  route. Contested routes that *are* included carry `certainty` (§5).
- **Greetings stay on the device synthesizer.** Lingua Libre has 16 of 79 in the
  right language; half human and half robot on one UI element is worse than either.
- **No transport chooser in Assignments.** Choosing how to reach a named landmark
  would spoil that mode's deduction.
- **Pickles's sprites never go on Uncle Jonah's screens.** She is already *painted
  into* every one of his scenes, lying by the fire; a cut-out beside a painted dog
  reads as a bug.
- **The avatar wardrobe builds at `--size 400`.** The script still defaults to 600,
  and a rebuild without the flag silently puts 7 MB back into every install (§1).
- **Phones are not a target** (rule 4). Don't spend effort on narrow layouts.
- **Germany's price anchor is a dead end** — Destatis publishes indices only. Do not
  register for GENESIS on this account.
- **Game content is Joshua's.** Subjects, clues, facts and Jonah's words change with
  his say-so, not a coder's. New culture photos are shown to him before commit.

### How to work here

- **Verify in the running app, not by reasoning.** `.claude/launch.json` has
  `shutterbug-dev`. Twice in one week the tests were green and the browser caught the
  bug: a stall priced Japan in dollars because a re-key dropped a field the component
  read, and a focus box that would have zoomed every hair thumbnail *out*.
- The game's country shapes ignore synthetic clicks (`dispatchEvent`) in places. Use
  real clicks or the keyboard.
- Jonah's intro has a typewriter; "Take the camera" appears only when it finishes.
- **Some screens need a tall window.** The meet screen needs a viewport ≥882px at
  1280 wide, the desk ≥872px. Below that the board shrinks and the content does not.
- The codebase carries long comments about *why* a thing is the way it is, including
  what was tried and failed. Match that, especially when reversing an earlier
  decision.
- Every stall object, journey stop and curiosity card carries its source. When
  Wikipedia's intro won't state the connection, read the full article; when that
  fails, go to the country's own press (§13).

### Traps that have already bitten

The first three are referred to by number from the code and the tests. Don't renumber.

1. **A plausible map is not a correct map.** Natural Earth has a "Colorado" in
   Argentina and a "Mackenzie" in Queensland; long rivers are stored under local
   names, so a lookup for "Nile" gave a Nile that stopped in Sudan. Both looked fine
   on screen. If you add geographic data, add a test that pins it to an *independent*
   fact (a basin it must lie in, a city it must pass).
2. **An SVG clips to its viewport, not its viewBox.** A map box whose aspect ratio
   doesn't match its frame gets letterboxed, and the relief plate spills into the
   letterbox.
3. **Wikimedia URLs are percent-encoded.** "Belém" contains `%C3%A9m`, whose "9m"
   reads as a measurement. Any regex sweep over the data files must skip URLs.
4. **A country's centre is not its path's bounding-box centre.** France's box takes
   in French Guiana and Réunion and centres on Mali; the USA's centres on southern
   France. Derive centres from the game's own landmark coordinates, with a circular
   mean for longitude (Fiji straddles the antimeridian). And
   `SVGGeometryElement.isPointInFill` is exact against the real geometry, but 16 of
   177 country centres hit-test as open sea against the simplified outlines — where
   the country is already known, pass it rather than hit-testing.
5. **A source that publishes a number is not a source for *your* number.** WFP
   publishes retail prices for 72 countries and its Kenyan markets are refugee camps
   (§12). Wikidata's `P38` put Zimbabwe on the Indian rupee. Check what the row is a
   measurement *of*.
6. **Before recording a source as blocked on an API key, check what its website
   serves.** Japan and Mexico were both written off that way, and both were open.
7. **Comparing raw RGBA scores art with alpha far too harshly** — the anti-aliased
   fringe has near-zero alpha and meaningless RGB. Flatten onto the paper first.
   If you touch `optimize-ui-art.mjs`'s comparison, recalibrate its threshold.
8. **Check whether the file you're measuring is a delivery or a shipped asset.** Mr
   O's "checkered background" could never be reproduced in the game because it was in
   four of the *originals* under `Images/`, not in anything that ships.
9. **An event can fire without the thing it seems to mean.** `onMouseEnter` doesn't
   need the pointer to move — a map mounting under a resting cursor counts — which is
   how the world map once spoke aloud a continent nobody had pointed at, and it read
   as the answer to the clue. Same family: state that is set for exactly as long as
   a full-screen popup is open cannot drive anything the popup covers.

### Tools

| Script | What it does |
|---|---|
| `node scripts/commons.mjs search "…"` / `cat "Category:…"` / `verify "File:…"` | Search Wikimedia Commons and **verify a file's licence, author and size**. Never add a photo without running `verify`. |
| `node scripts/gen-geography.mjs` | Rebuilds `src/data/geography.js` (rivers, lakes, seas) from Natural Earth. |
| `node scripts/gen-currency.mjs` | Rebuilds `src/data/currency.js` from the ISO 4217 register and central-bank reference rates. Every price the game prints goes through it. |
| `node scripts/gen-price-anchors.mjs` | Rebuilds `src/data/price-anchors.js` from WFP plus four national statistics offices. `--csv a.csv b.csv` for local copies. **Read the warning at its top before adding a country** (§12). |
| `node scripts/gen-voices.mjs` | Re-fetches the spoken country names from Lingua Libre (§15). |
| `node scripts/imperial-first.mjs --dry` | Finds or rewrites metric-only measurements. Always `--dry` first. |
| `node scripts/optimize-ui-art.mjs` | Shrinks new UI art to the size it is drawn at. Run after an art batch lands (§16). |
| `node scripts/outfit-lab.mjs` → `/outfit-lab.html` | Fits a garment or hair delivery onto the avatar body so the alignment can be judged. Writes only to `public/outfit-lab/` (§1). |
| `node scripts/register-avatar-batch.mjs` | Bakes the approved plates onto the delivery template (§1). |
| `node scripts/build-avatar-layers.mjs --also "Images/Avatar designs-registered" --size 400` | The real avatar build. **Always with `--size 400`.** |
| `npm run dev` → `/tune-lab.html` | Every arrival bed, played by the game's own synth (§11). |
| `npm run dev` → `/avatar-lab.html` | The avatar art, layer by layer (§1). |
| `node scripts/make-relief.mjs`, `make-country-relief.mjs` | The relief plates. **Cannot be run on this machine** — see §14. |

---

## 1. The avatar

**Shipped.** Joshua's painted plates replaced the procedural SVG on 2026-07-28; the
colour range became generated on 2026-07-29; the September batch took the wardrobe
from 5 outfits and 8 hairstyles to 28 and 23, split boy/girl, on 2026-09-28.

**How it fits together:**

- **`Images/Avatar designs/*.png`** — Joshua's deliveries, outside the build and
  gitignored. One plate per *shape*, each in a single colour. The filenames are the
  content spec.
- **`scripts/avatar-recolour.mjs`** generates the colour range: 6 skins, 6 eye
  colours × 2 sexes, 6 hair colours, 7 cloth colours. Adding a colour is one line in
  a palette. **Read the top of that script before touching it** — the recolour is
  easy and the *masks* are the work, each there because a naive version shipped
  something wrong (the eyelid crease is the same brown as the iris and is excluded on
  shape, or a blue-eyed child gets blue eyeliner).
- **`scripts/avatar-brows.mjs`** lifts the eyebrows out of the head plates and
  recolours them to the hair.
- **`scripts/build-avatar-layers.mjs`** writes WebP to
  `public/assets/shutterbug-ui/avatar-v2/` and generates `src/data/avatar.js`.
- **`src/avatar-spec.js`** is the pure logic (tested); **`src/components/avatar.jsx`**
  is `<Avatar>`, `<AvatarControls>`, `<AvatarEditor>`.

The wardrobe is **358 layers**: 196 outfits (35 unisex, 84 boys', 77 girls'), 138
hairstyles, 6 skins, 12 eyes, 6 brows. The first five outfits stay unisex; a girl
never sees a boys' plate and the reverse.

**Adding a garment or hairstyle is three steps, deliberately separate:**

1. `node scripts/outfit-lab.mjs` → judge at `/outfit-lab.html`. Garments are fitted
   against the shipped shoulders, hair against the shipped crown. The lab is allowed
   to be wrong, flagged, nudged and re-run.
2. Add the item's line to `SPLIT` in `scripts/register-avatar-batch.mjs` (boy, girl —
   Joshua's assignment), then run it. It bakes each approved plate at its fitted
   transform onto the first delivery's own 1200×1200 template, into
   `Images/Avatar designs-registered/`. No fitting logic of its own: if the lab is
   wrong, fix the lab.
3. `node scripts/build-avatar-layers.mjs --also "Images/Avatar designs-registered" --size 400`.

**What the lab cannot do alone, so look:**

- **A high collar or a raised hood** fits at about half size — shrinking it until it
  nests inside the shoulder band genuinely scores better. A low score doesn't
  identify these; the *scale* does, and the script flags anything far outside its
  peers' median.
- **An asymmetric hairstyle** (a side ponytail, a pair of buns) drags the crown fit
  sideways. Nothing numeric catches this; only looking does.
- Both kinds are placed by hand in the script's `MANUAL` block, by a ladder rendered
  **at the real canvas size under the real head plate**. A first attempt judged at a
  400px preview came out visibly off to one side.

**Three things a future session should know:**

- **Saved avatars are migrated on read, not in storage.** An old-scheme spec is
  detected by its legacy-only keys and matched to the nearest new plate by colour.
  `hair` is the one key both schemes use, meaning different things.
- **The plates are waist-up busts.** Under 96px the component renders a face crop
  (`FACE_BELOW`).
- **Each part's `FOCUS` is a per-edge median, not a union.** One braid reaching the
  bottom of the plate made the union the whole canvas and zoomed every thumbnail out.

**Still welcome from Joshua, nothing blocked:** more shapes — each arrives in the
whole colour range for free.

---

## 2. Rotating people cards

**Done (2026-07-15).** The six multi-ethnic countries rotate two or three
licence-verified cards on arrival: Brazil, South Africa, Malaysia, Canada, Australia,
New Zealand. `COUNTRY_PEOPLE` in `src/data/culture.js` takes a card or a list of up
to three; `test/data.test.js` enforces the limit, a named `people` on each, no
duplicates and a free licence.

**Optional depth:** the United States is a floor, not a full account. To add any
card: `node scripts/commons.mjs verify "File:…"` (it must come back `✓`; copy its
`src`/`source` verbatim), add it with `people/caption/credit/license`, `npm test`,
and **show Joshua the photo first**. The wider photo audit is
`docs/people-photo-audit.md`.

---

## 3. The Long Trip (the roguelike layer)

**Feature-complete** — all five slices shipped by 2026-07-25. Spec in
`docs/design-notes.md` §3.

| slice | where |
|---|---|
| Camera-bag loadout — Jonah deals three, you take two | `src/data/kit.js` (5 items) |
| Run conditions — one drawn per run | `src/data/conditions.js` (6); the `effect` id is the contract and a test pins that each has a handler |
| Route-choice board — three briefs per leg, never naming the continent | `RouteBoard`, `offerRouteChoice`, `takeRoute` |
| Renown debrief — accumulates across runs, climbs a newsroom ladder | `recordLongTrip`, `renownGain`, `renownRank` in `src/profiles.js`; `test/longtrip.test.js` |
| Hold for the light, and the Cover Story finale | `GambleModal`, `resolveGamble`, `offerNextRoute` |

Two design points that must survive any rework: the route board withholds the
continent name because choosing a brief must never hand the child the geography the
shot teaches; and holding for the light gambles the *reward*, never the geography —
the base points bank first, so a bust never takes what knowing the answer earned.

**What is open is feel, and it is Joshua's.** The knobs, as they stand:

| knob | value |
|---|---|
| `LONG_TRIP_DAYS` | Scout 17 · Explorer 15 · Adventurer 13 · Expert 11 |
| `COVER_MIN_CAPTURES` / `COVER_DAYS` | 3 / 5 |
| `COVER_POINTS_MULT` / `COVER_RENOWN` | ×2 / +10 |
| `HOLD_ELIGIBLE_CHANCE` / `HOLD_WIN_CHANCE` / `HOLD_BONUS` | 0.34 / 0.55 / +2 |

**Optional:** the cover is the pool's next specific assignment framed as marquee, not
hand-curated. For a front page that is always an Eiffel-Tower-tier place, add a
curated id set and prefer it in `offerNextRoute`. And if a future tier should tease
*less* on the route board, `assignmentBrief` is the one place to change.

Guests can play it (fixed 2026-09-23 — the guest branch of `unlocks()` is derived
from `UNLOCK_KEYS` now, and a test pins that both branches answer the same keys).

---

## 4. The curiosity layer

**Done.** Spec in `docs/design-notes.md` §6. Cards live in `src/data/curiosities.js`
as decks; each card is `{ id, title, body, source, asOf? }`. Seven decks hang off the
chrome — the logo, the days calendar, the compass rose and the four guess-stage
markers — and tapping a saved traveler's header avatar opens the customize editor.

- **42 cards, 6 per deck.** Equal decks are the number that matters: a deck
  reshuffles on each visit, so a short one repeats sooner than its neighbours.
  **Keep the decks equal** if you add more.
- **Re-verify the dated cards periodically** (rule 2). When they were written: BRICS
  grew to 11 in 2025, France passed 100M visitors in 2024, Bangkok was the
  most-visited city in 2024. When one changes, update the body and bump `asOf`.

---

## 5. More Journeys

The engine is built and proven (`src/data/journeys.js` plus the `journey` mode).
**Adding a route is data.** Eleven ship:

| route | stops | note |
|---|---|---|
| Lewis & Clark | 6 | the original |
| The Oregon Trail | 9 | |
| Darwin's *Beagle* | 9 | circumnavigation. The Galápagos card teaches that it was the **mockingbirds**, not the finches, Darwin noted island by island |
| Magellan & Elcano | 8 | circumnavigation, ending on the lost day |
| The Transcontinental Railroad | 5 | |
| Route 66 | 7 | |
| The Thirteen Colonies | 13 | the first tall north–south route |
| Paul's First Journey | 8 | the first **contested** route, and the worked example for one |
| The Pony Express | | added 2026-07-27 |
| Shackleton's *Endurance* | | added 2026-07-27 |
| The Exodus | | added 2026-07-27; contested, carries `certainty` |

**Wish list:** National Parks (the obvious next). **Amundsen is blocked** — the
journey map is equirectangular, where the South Pole is the whole bottom edge, so a
route ending at 90°S draws its last leg sideways along the foot of the world.
Shackleton stays between 54°S and 69°S, which is why his was the polar route that
could be built. **Marco Polo stays excluded.**

**How to add one:**

- Get each stop's coordinates from its Wikipedia article through the MediaWiki API.
  Do **not** eyeball them off a map.
  `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates|extracts&exintro=1&explaintext=1&titles=Fort+Mandan`
- Record the article URL in the stop's `source`. Add an `outro` for the win screen.
- Keep facts on the plainly documented spine of the story.
- Measurements imperial first, metric in brackets; the units test covers journeys.
- `npm test` enforces: ≥4 stops, coordinates in range, `x`/`y` derived from
  `lat`/`lon`, a source per stop, **no leg drawn the long way round**,
  circumnavigations that really span the globe, and **no two stops closer than 2.4%
  of the map width** — a fraction, because 1.2° is a comfortable gap on a map of
  Wyoming and four pixels on a map of the world.

> ⚠ **A contested route needs the `certainty` treatment.** Its intro says it is the
> traditionally acknowledged path, and each stop carries `"documented"` or
> `"traditional"`. Do not quietly present a traditional site as a fact. This is a
> rule-2 issue, not polish. Copy Paul's First Journey.

**What the engine already handles,** so a new route need not: a westward leg across
the antimeridian is drawn going west (`unrolledX`, with the map tiled sideways —
without it Magellan's Pacific crossing ran back east across Africa, trap 1 exactly);
the frame is shaped from the route's own `aspect`/`pad`; a route with aspect under
1.6 is height-capped so a tall route fits one screen; pins shrink and labels turn
inward on a globe-wide map.

---

## 6. Award graphics

**Done — 71 of 73 delivered and wired** (2026-07-16). `docs/art-assets-needed.md`
tracks the set; the two outstanding are optional (`travel-wallet.png` is one). New
art wires in by editing `src/data/art.js` alone — see that doc's "How to land the
next batch", and run `node scripts/optimize-ui-art.mjs` afterwards.

The passport has a Progress page (mastery by continent, a "keeps getting missed"
list), a Trophy Shelf and the Journals; mastered countries wash gold on the world
map. All four were on this file's to-do list long after they shipped.

---

## 7. The Supabase backend

**Built, inert, and waiting on Joshua.** Everything lives in `localStorage` today
(`src/profiles.js`) — per browser, never synced.

What exists:

- **`supabase/migrations/20260719120000_passports.sql`** — the schema, with row-level
  security on every table and no permissive "for testing" policy. Households are
  sets of devices that share travelers; a device joins with a server-generated code.
  The data is children's: a first name and geography scores, with nowhere in the
  schema to put anything else.
- **`src/sync.js`** — local-first. `localStorage` stays the only read path, so
  `profiles.js` stays synchronous and no call site changes; sync is a background
  reconciliation. Anonymous auth, no email, no password. **Inert until
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set** (`.env.example`), and
  the client library is a dynamic import, so an unconfigured build doesn't ship it.
- **`src/passport-merge.js`** — the merge, tested in `test/passport-merge.test.js`.
- **The passport file** — "Save a copy" / "Restore from a file" under the passport
  (`exportPassport` / `importPassport`). This already ships and is the durability
  win on its own; sync reuses its envelope.

What is not there: **nothing in the game imports `sync.js`** (verified 2026-10-03 —
the only mention outside the file is a comment in `profiles.js`). There is no screen
to create or join a household, so the module is unreachable whether or not it is
configured. That UI is the remaining build.

**Ask Joshua where the project stands before assuming it doesn't exist.** The deploy
workflow already passes both variables from repository secrets, and `.env.local` on
this machine has `VITE_SUPABASE_URL` set — so a project may well have been created.
Whether the migration has been run against it is not something the repo can say.
The anon key is public by design; the `service_role` key must never appear in the
repo or a bundle.

For kids: anonymous accounts and a shareable code. No passwords, no PII, no open chat.

---

## 8. A desktop app

**Joshua's decision, and the standing recommendation (2026-07-18) is don't.** The
game installs as a PWA from Chrome, Edge or Safari with no work, and the target
device is a desktop where that install works. Tauri adds a real double-click icon
and costs $99 a year to sign; unsigned, it throws OS security warnings at whoever
opens it. Don't start without his agreeing to that.

Tied to it: the final single-screen pixel fit (map cap, header, phase tracker) is
best tuned to a locked window size, which only an executable has.

---

## 9. Travel modes

**Built (2026-07-15), Grand Tour on Adventurer and Expert only.** Clicking a
continent opens the "Getting there" chooser: pick a real regional hub airport, then
the last-leg transport — a genuine time ↔ money tradeoff. A wallet sits beside the
day calendar; leftover money pays **1 point per $500** at the win.

- **Data:** `src/data/travel.js` — `HUBS` (30 real IATA hubs: five per continent,
  six in Asia, four in Oceania, none in Antarctica, which flies the old way),
  `TRANSPORT_MODES`, `transportOptionsFor()`, `money()`. Transport prices are
  deliberately **abstract** — a tradeoff, not a real fare that would need sourcing.
- **One exchange table (since 2026-09-30).** `CURRENCIES` is built from the
  generated `src/data/currency.js`. `travel.js` keeps only what a generator can't
  know: the eight **pegged** currencies, derived from their anchor's rate so 655.957
  CFA to the euro stays exact, and their child-readable names. See the loose end in
  "Start here" about the five unstable currencies this brought in.
- **Component:** `TravelChooser`; `confirmTravel()` deducts money and days, then runs
  the flight.
- **Which transport is offered where is a correctness matter, not flavour.** The
  category-derived rules were quietly false: `desert` offered a camel at the Dune du
  Pilat near Bordeaux and in the McMurdo Dry Valleys; `mountain` offered a cable car
  up Everest and Kilimanjaro. Camels are gated on a verified country list, cable
  cars and cog railways on explicit per-place lists, riverboats on `waterway` *and*
  the `river` tag. Absence means not offered. **To add a mode somewhere, verify it
  and add the id to the set in `travel.js`.**

**What is open is balance, and it is Joshua's.** He plays a Grand Tour on Adventurer
and says "money too tight", "last legs cost too many days", "the bonus is weak". The
dials: `transportOptionsFor` (the `usd`/`days` formulas), the starting wallet in
`startTour` (**$3,500** Adventurer, **$2,500** Expert), and `legSlack` (one extra day
per stop on those two tiers).

**His decision:** whether The Long Trip gets hubs too.

---

## 10. Rewards, progression, and Pickles

Joshua's report, 2026-07-19: *"I recently accomplished something (maybe visiting all
7 continents) and there was the option to go see Jonah — and he said congratulations
and then that was it. If there was a stamp awarded or a game mode unlocked, it wasn't
clear."*

He was right when he said it. **Earning an achievement still grants nothing of its
own.** `achievements()` in `profiles.js` derives 24 badges live from the profile on
every call — nothing is persisted, nothing awarded. The consequence is a chip and a
line from Jonah in the end screen's "What you earned" popup. Separately,
`UNLOCK_REQ` holds the real gates (Adventurer, Grand Tour, Expert, Expeditions, The
Long Trip).

**Two things have landed since that report, and the options below should be read
against them** — this section described neither until 2026-10-03:

- **Pickles's wardrobe is a real payout.** Her 18 outfits are *earned*
  (`OUTFIT_UNLOCK` in `src/data/dog-outfits.js`): master three places in a region,
  earn a stamp in one, photograph N places or N of a category — and photographing
  on **all seven continents** unlocks the astronaut, which is the very thing Joshua
  had just done when nothing happened. Newly earned outfits are announced with the
  other unlock news. It is derived live from `profile.loc`, like the achievements.
- **The gates are staged.** Unlock news is a popup over the meet screen
  (`UnlockNewsModal`, 2026-07-30), The Long Trip has its own unlock line from Jonah,
  and the meet and results screens read one list (`UNLOCK_BEAT_KEYS`) so an unlock
  announces itself once rather than never or forever.

So the question for Joshua has narrowed from "nothing pays out" to "is the wardrobe
enough, or should the 24 badges pay something too". The options as first written,
cheapest first:

- **a. Make the gates land properly** — a full-screen "Uncle Jonah has something for
  you", the badge drawn large, what it unlocked named, the new mode's card lighting
  up. Partly done, as above.
- **b. Give achievements a home worth filling** — the 24 as empty silhouettes from
  the start. The passport's Trophy Shelf now exists; check what it shows before
  building this.
- **c. Tie unlocks to Jonah's anecdotes.** `src/data/anecdotes.js` holds his stories
  and the homecoming quiz is the only thing that shows one. A continent badge could
  unlock the story of *his* trip there — more of what the child already likes, no
  new art.
- **d. Themed expeditions as the unlock currency** — "photograph all seven summits →
  the Roof of the World expedition".
- **e. A first-time-only bonus** on each newly photographed place, rewarding breadth.

**Recommendation: (a) then (c)** — staging and content rather than new systems. It
needs his pick, then it is buildable.

### Pickles

The dog is **Pickles**, a West Highland terrier, and she came along on the trip. She
reacts only to a **perfect** shot — right first time — and gets louder as the streak
runs: a wag, a paw up, the full play-bow. She rides in on the result card
(`PicklesCheer`), dressed for the country when that region's outfit is unlocked;
"Pickles's wardrobe" (the gear menu and the meet screen) sets whether she dresses
automatically, never, or always in one favourite. Her lines are descriptions of a
dog, never speech — read the note on voice at the top of `src/data/pickles.js`
before adding any. Beside Jonah on the menu and story screens she is the painted
dog, not a sprite.

The older account in this file — an unnamed dog who dug one of Jonah's stories out
of the camera bag after three perfect shots — no longer describes the game. Comments
in the code still say `DeskDog`, a component that no longer exists under that name.
`pickles.js` and `dog-outfits.js` are the truth.

**Ideas raised and never built,** none conflicting with what shipped: a "sniff it
out" hint that points to the right continent (close to what the Field Guide already
does — ask Joshua whether a second hint tool helps or muddies), and Pickles as
Explore's companion, since that mode has no clock and no Mr O.

---

## 11. The music

**Blocked on Joshua's ear and nothing else.** `npm run dev`, then
<http://localhost:5173/tune-lab.html>: every bed with the countries it carries,
played by the game's own `MUSIC.countryTune()`. Tap **N** to walk the list, which is
how you hear whether two beds are too alike. The lab drives the real synth on
purpose — the question is "does it sound right", so the one unacceptable answer is a
sound the game does not make. Everything testable about these tunes passes; whether
they sound good has been checked by no human.

**Where it stands:**

| | 2026-07-19 | now |
|---|---|---|
| Countries with their own real melody | 6 | 6 |
| Biggest single regional bed | 19 countries | **5** |
| Countries on the flavourless `generic` bed | 18 | **0** |

The six: Germany (Ode to Joy), France (Frère Jacques), the United States (The
Star-Spangled Banner), the United Kingdom (Rule, Britannia!), Mexico (La Cucaracha),
Australia (Waltzing Matilda).

The complaint this answered was Joshua saying *the Islamic countries all sound the
same* — about how much of the world one bed carried, not how many countries have a
tune of their own. That has a cheap fix, because a regional bed is an *original*
phrase and can be written freely. `test/tunes.test.js` holds the ceiling at five,
and `test/audio.test.js` asserts no country can reach `generic`. The six beds at five
(`eastafrica`, `southasia`, `slavic`, `southernafrica`, `centralamerica`, `nordic`)
are each a real musical region; tighten further only with a reason of that kind.
`MUSIC.timbres` exists so a test can catch a tune naming a timbre the synth lacks —
the one failure here that neither throws nor falls silent.

**More real melodies is the expensive direction.** The engine is a note-name
sequencer, so a tune is ~20 lines of data. The cost is sourcing, bound by rule 2 and
copyright: the melody must be **public domain**, and the notes must come **off a
score**, not from memory. A session that tried to lengthen La Cucaracha and Waltzing
Matilda could not reach usable notation and left them alone, which is the correct
outcome. The Star-Spangled Banner carries its source and a bar-by-bar note because an
earlier pass shipped a wrong note in it. Estimate: 30–40 more countries is a day's
work given a good source (IMSLP, the Wikimedia anthem collection, abcnotation.com),
most of it verification. All 108 is not sensible — a well-chosen regional bed beats a
badly-sourced "national tune".

---

## 12. Currency price anchors

Joshua's spec: *"a loaf of bread costs about 45 córdobas"*. The culture card says
what money a country uses and roughly how many a dollar buys — the **rate**. The
anchor teaches what the money **buys**, the half a child can feel. He asked for all
countries. **All of them is not available** — not slow, unavailable — and this
section is worth reading before anyone tries again.

### What was built

- `scripts/gen-price-anchors.mjs` writes `src/data/price-anchors.js`: one staple per
  country, converted to imperial, rounded to two significant figures, each carrying
  the `source` that published it.
- `PriceAnchorLine` under the money line on the culture card: *"🛒 In Kathmandu, a
  pound (0.45 kg) of rice cost about 40 NPR — about 27¢. (June 2026)"*
- `test/price-anchors.test.js`. The test with teeth cross-checks each price against
  the exchange rate beside it: they come from different sources, and if they disagree
  about what a pound of food costs in dollars, one is wrong.

**14 countries covering 95 of the 464 places:**

| source | countries |
|---|---|
| WFP Global Food Prices (HDX, CC BY-IGO) | Cameroon, Ecuador, Egypt, Jordan, Madagascar, Namibia, Nepal, the Philippines, Sri Lanka, Turkey |
| BLS Average Price Data, series `APU0000702111` | United States — a pound of white bread, already per pound |
| Statistics Canada, table 18-10-0245 | Canada — white bread, 675 g loaf, converted once |
| Statistics Bureau of Japan, Retail Price Survey `00200571` | Japan — rice in Tokyo's wards |
| INEGI *Precios promedio*, genérico 014 | Mexico — tortillas in Mexico City |

A national office beats WFP for the same country. Japan and Mexico name a **city**,
because neither office publishes a national average and averaging their cities would
be a number this project computed. Rice for Japan and tortillas for Mexico, not
bread: the line is a shopping trip a child can picture, not a like-for-like row.

### Why not more

**WFP monitors the markets WFP operates in.** Its 72 countries are food-security
monitoring sites, not national price surveys:

| country | every monitored market is… |
|---|---|
| Kenya | Kakuma and Dadaab — refugee camps |
| Uganda | refugee settlements |
| Algeria | the Sahrawi camps and Western Sahara |
| Zimbabwe | includes Tongogara Refugee Camp |
| Nigeria | the north-eastern conflict markets |
| Guatemala | one market, selling only **fuel** |
| Ethiopia | one market, quoting only an **unofficial exchange rate** |

Each yields a well-formed, plausible number that would be flatly false on a card
reading "in Kenya". So the generator takes an explicit allowlist, each entry naming
one market that is the country's published national average or in its capital. Of
17, seven fall out: **Nicaragua** (WFP quotes it in USD — Joshua's own example
country), **Bolivia** (our rate and WFP's disagree by 60%, so the cross-check refuses
both), **Ethiopia** and **Guatemala** (above), **Iran** and **Sudan** (no single
honest exchange rate, so no honest price), **Zambia** (newest observation 13 months
old).

**The national offices, each a specific wall, checked rather than assumed:**

| country (places) | wall |
|---|---|
| United Kingdom (11) | ONS retired its timeseries API in Nov 2024. The raw price quotes still published hold 394 items and no staple foods — groceries moved to retailer scanner data. |
| China (21) | `data.stats.gov.cn` returns 403 to non-Chinese IPs. |
| Australia (9) | The ABS average-retail-price series was discontinued; what remains is CPI indices. |
| France, Italy, Greece, Spain (10 each) | Eurostat's detailed average prices are gone (404 on every dataset), so each needs its own office. |
| Germany (10) | **Dead end.** Destatis publishes indices only. |

There is **no authoritative global source of everyday retail prices.** Eurostat's
`prc_dap15`/`prc_dap16` are discontinued. The World Bank ICP publishes PPP factors,
and a price derived from one is a model, not a source. Numbeo is crowd-sourced and
unverified. FAO is producer prices. That leaves national statistics offices one at a
time — the four here took a session apiece and no two shared a line of code (a JSON
API, a cube endpoint, a spreadsheet, a session-bound ASP.NET form). **The cheap wins
are spent**; anything further is a content project, not a task. Adding a reachable
country is one entry in `NATIONAL` in the generator plus its fetch.

**Two traps recorded because both cost real time:**

1. **There is no Mexican `series` id.** For CSV/XLS the INEGI app posts `series=`
   empty and takes the selection from ASP.NET session state. The working sequence:
   GET the app for a cookie → POST `ObtieneCountReg` with the 3-digit genérico and
   the city list (**this writes the session**) → POST `Exportacion.aspx`.
2. **Japan publishes this as a spreadsheet and nothing else,** so the generator
   carries ~60 lines of `node:zlib` that read an .xlsx directly. Furigana (`<rPh>`)
   must be stripped from the shared strings or 札幌市 comes out as 札幌市サッポロシ.

---

## 13. Souvenir stalls

Joshua's brief: *"buy something for Uncle Jonah in local money. The child has to
judge whether 1,500 yen is a lot. Souvenirs collect into the passport. Money is never
a fail state."* Built 2026-09-30.

- **Two doors.** A stall opens 1.4 s after landing at a **hub** that has one (Grand
  Tour on Adventurer/Expert, the tiers with a wallet), and also on **arriving in a
  stall country on a Grand Tour's last leg**, waiting behind the country arrival
  card because two popups at once is worse than none. Once per country per run,
  shared between the doors — Haneda then Japan is one stall. Assignments has no
  wallet and no stall: a shop on the way would tax a child still learning to answer
  a clue.
- **What it costs:** the leftover-cash bonus, nothing else. `test/souvenirs.test.js`
  pins every stall's total under $100, so buying everything can never be a choice
  about reaching the next target.
- **What is a fact and what is not (rule 2).** The *objects* are real and each
  carries its source. The *prices* are game prices in dollars, shown in local money
  through the live rate. The stall never claims "a daruma costs ¥1,500 in Tokyo"; it
  claims "this one does". The one verified number on the screen is the line under
  each price — *"that's about 3.5 pounds of rice at a Tokyo market"* — from §12's
  anchors, which is why every stall is in an anchor country and, for the seven that
  aren't hub countries, in the city its anchor was measured in.
- **Persistence:** written with the stamps at the end of the run. Shown on the
  passport's profile page under "FOR UNCLE JONAH", newest first.
- **Keyed by country.** The first two days' `HND/daruma`-style keys still resolve, so
  nobody's daruma vanishes.

**Twelve stalls, 38 objects:** Japan (4), Canada (3), Egypt (3), Mexico (4), Turkey
(4), Nepal (3), the Philippines (3), Sri Lanka (3), Madagascar (3), Jordan (3),
Namibia (3), **Cameroon (2)**.

**Adding a stall or an object** is an entry in `SOUVENIR_STALLS` in
`src/data/souvenirs.js`: `name`, `about` (written from the source, not from memory),
`source`, `usd`, `emoji` (until art lands), and a thank-you in `SOUVENIR_THANKS`.

**Sourcing, and the lesson Namibia taught.** Wikipedia's intro often does not state
the country connection. The Herero dress verified from the *full* Herero people
article where the intro had nothing. The makalani carving did not verify from
Wikipedia at all — the palm's article puts it in Namibia and calls the nut vegetable
ivory, the vegetable-ivory article says the material is carved, and neither says the
nuts are carved in Namibia. The source that does is **The Namibian**, the national
newspaper (Absalom Shigwedha, 23 Aug 2007). **When Wikipedia won't say it in one
sentence, go to the country's own press.** If no source states it, the object is
dropped — which is why Cameroon has two.

**Open:**

- **Cameroon's third object** — buildable; verify first.
- **Jonah's 38 thank-yous are unreviewed drafts.** They are the only content on the
  stall that is his voice rather than a sourced fact.
- **The exchange-fee purse** — Joshua's decision, not started.

---

## 14. Maps

- **The relief scripts cannot run on this machine.** `make-relief.mjs` and
  `make-country-relief.mjs` want the Natural Earth source raster (`NE1_HR_LR.tif` /
  `HYP_HR_SR_W.tif`), which is a ~200 MB download, deliberately not committed, and
  not on disk. `test/relief-plates.test.js` asserts every country's plate covers the
  ground its zoom box draws, so **making a country's box bigger breaks the test and
  needs the raster; making one smaller is free.** Check this first before touching
  `fitBox`. It is also why Joshua's "zoom out a little" on France was not available.
- **Small islands get a lower zoom floor** (`boxFloorFor` in `src/map-geometry.js`,
  Joshua's call 2026-07-29). A mainland country backed off to the floor fills its
  frame with neighbouring ground; an island fills it with empty sea. Trinidad went
  28% → 78% of its frame, Jamaica 33% → 92%, Fiji 46% → 93%; no mainland moved.
- **Overseas-territory insets choose their own corner** (`OverseasInsets`,
  2026-09-28). France's row of four had sat over five of its ten pins. The component
  now splits territories by the side they lie towards (rule 5, literally), scores
  four placements per group by how many pins each would cover, falls back to a
  compact size only when every standard placement hits something, and works in
  display space — the insets render inside the map's vertical-stretch group, so "5%
  from the top" in plate coordinates was above the frame on France. Measured: France
  0 pins covered and 0 boxes off-frame (was 5 and 1); the USA unchanged. **No test
  covers it** — it lives in the component, which the suite deliberately does not
  import. Chile is unseen (see the loose ends).
- **French Polynesia has no vector outline in Natural Earth's set**, so it cannot get
  a country map the way every other country does. Needs a decision.
- The 2026-07-21 playtest's map items are in `docs/playtest-2026-07-21.md`.

---

## 15. Speech

Joshua: *"The voice pronouncing some of the countries is the old school atrocious
pre-Siri voice."* The cause was the code not choosing at all: `utterance.lang =
"en-US"` hands the pick to the browser, which on macOS hands it to Samantha. Worse,
macOS ships *Bad News, Bahh, Bells, Boing, Zarvox* and others as ordinary en-US
voices, and for French, German, Japanese and Spanish the list is dominated by
character voices.

- **`rankVoices()` in `src/audio.js`** scores the list and sets `u.voice`
  explicitly. Joke voices are never eligible, and a language whose only match is a
  joke voice counts as having none, so the greeting falls back to reading the
  romanization in English. It is the graceful fallback and can never be the plan.
- **Country names are human recordings** — 106 of 108, from Lingua Libre, all CC0,
  2.3 MB, 102 of them by one speaker (which mattered more than the coverage: 106
  volunteers would have sounded like a ransom note). French Polynesia and New
  Caledonia fall back to synthesis. `node scripts/gen-voices.mjs` rebuilds the set.
- **Everything else is still the device synthesizer** — Mr O's facts, the Scout
  read-aloud, hover labels, every greeting. Bundled audio is the only thing that
  changes that for a player who configures nothing.

**If greetings are ever wanted as recordings,** the route is Lingua Libre's own
recording studio, which takes requests — a community ask, not a code change. Piper
(MIT-licensed neural TTS, offline, output clean to redistribute) is the synthesized
alternative and a build-step dependency.

---

## 16. Install size and updates

- **A deploy no longer restarts a game in progress.** `main.jsx` used to reload the
  page the instant a new service worker claimed it, and since a run is saved nowhere,
  every `git push` cost whoever was mid-trip their trip. The reload goes through
  `src/app-update.js`, which holds it until the player is on the splash, the traveler
  picker or the meet screen. Anything not on that list counts as unsafe on purpose: a
  screen added later has to be named before it can ever be interrupted.
  `test/app-update.test.js` covers it.
- **The precache is 59.9 MB** (it was once 326 MB, 305 of it the dog's wardrobe at
  1254px for a sprite drawn at 390). `test/precache-size.test.js` walks what is
  actually on disk — so a folder nobody thought about is checked anyway — with a
  per-file cap of **1000 KB** and a total cap of **70 MB**.
- **`scripts/optimize-ui-art.mjs` has three policies:** palette PNG for small
  emblems, resize-to-webp for big character art, and for the loose files at the root
  of `shutterbug-ui/` a measured one — quantize, compare against the original
  flattened onto paper, keep only if the difference is invisible. The root can't go
  on a list because it also holds the gradient-heavy textures quantizing would band.
- **What is left above 500 KB** is four textures and two open-book plates, all
  already palette PNGs. Going further means webp or jpeg, which changes the filenames
  they are referenced by — a real change, not a re-encode.

---

## Log

What shipped, newest first. One line each; the commit has the reasoning.

| date | | commit |
|---|---|---|
| 2026-10-03 | This file consolidated, 1,665 lines to about 960, every count re-counted | — |
| 2026-09-30 | Makalani carving sourced from The Namibian | `191c589` |
| 2026-09-30 | Namibia's stall | `a9d1795` |
| 2026-09-30 | Stalls keyed by country, the second door, six more stalls; one exchange table | `4f03c22` |
| 2026-09-30 | Toronto, Cairo, Mexico City, Istanbul stalls | `41f30e0` |
| 2026-09-30 | Wardrobe rebuilt at `--size 400`: 7 MB off the precache | `2bc8d95` |
| 2026-09-30 | The first souvenir stall, at Haneda | `3b58703` |
| 2026-09-28 | The September avatar batch: 28 outfits, 23 hairstyles, split boy/girl | `9ae49d8` |
| 2026-09-28 | Overseas-territory insets choose their own corner | `fbb0fc7` |
| 2026-09-24 | Two off-centre garments fixed; the Long Trip unlock fires once | `e1d255d` |
| 2026-09-24 | `optimize-ui-art.mjs` third policy; four Mr O plates and `splash.jpg`: −4.4 MB | `52e17e3` |
| 2026-09-24 | Guests get The Long Trip; dead quiz/daily mode art removed; splash tab order | `2dd44b9` |
| 2026-09-24 | The outfit lab | `c9c3120` |
| 2026-08-03 | Chicago photographs Buckingham Fountain | `a3a2f6e` |
| 2026-08-03 | Hover speech on a resting cursor; hold-for-the-light timing; the arrival card in two columns; end-screen earnings in a popup | `4656a79` |
| 2026-07-30 | `/tune-lab.html` | `ca74ebb` |
| 2026-07-30 | Japan and Mexico price anchors | `ee9eb52`, `bfbbc98` |
| 2026-07-30 | Unlock news becomes a popup | `68f3d08` |
| 2026-07-30 | Deploys stop restarting a game; precache 326 MB → 59 MB | `f05ffc8` |
| 2026-07-29 | The meet screen fits its board in all six modes | `4681eb7` |
| 2026-07-29 | US and Canada price anchors | `b887067` |
| 2026-07-29 | The Caribbean split; no bed carries more than five | `bc317d1` |
| 2026-07-29 | The generated avatar colour range; a traveler picks a sex | `5e9f4be`, `8e39e3b` |
| 2026-07-28 | The painted avatar ships; the maqam and Mediterranean bed splits; voice ranking and recorded country names | |
| 2026-07-27 | Mystery Photos; Credits & Legal; three Journeys; seven Oceania places; the people-photo audit | |
| 2026-07-25 | The Long Trip's last three slices | |
| 2026-07-21 | Joshua's playtest pass (13 of 15 items) and the keyboard audit | |
| 2026-07-19 | Passport export/import; the Supabase schema and merge; Pickles joins the trip | |
| 2026-07-17/18 | Grandpa Nigel becomes Uncle Jonah; Quiz and Daily removed as modes; the passport becomes popup-only | |
| 2026-07-15/16 | Travel modes; rotating people cards; the curiosity layer to 42 cards; the badge art; four Journeys | |
