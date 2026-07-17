# Shutterbug — remaining work

A handoff document. Everything here is written so a **new session with no memory of
the previous ones** can pick up a task and finish it. Read `CLAUDE.md` first (the
three project rules are hard requirements), then the task you're doing.

Last updated **2026-07-16**.

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
3. **The roguelike layer** (§3) — the biggest remaining build, nothing started. Begin
   with the **route-choice map** slice: it reuses the per-leg chooser pattern the
   travel-modes feature just proved.

**Then, in Joshua's stated order:** the graphics pass (§1 avatar redesign — §6 badges
are done) once his art lands, and the **desktop executable + final single-screen fit** (§8) as
the capstone. The Supabase backend (§7) sits off to the side whenever he wants it.

### Recently shipped

This session: **travel modes** (§9 — the big one), plus a small-fixes UI pass (flight
music plays the full 4s then fades over 2s; hover-only country/landmark labels; the
Aleutian wrap cut off the world map; Europe/UK/Asia map crops + vertical stretch; the
polaroid result layout; US-English spellings), CI action bumps, the Mr O riddle
catchphrase, **Mr O now appears only on arriving at a new continent** (no more
mid-country interruptions), **landmark pins de-overlap with leader lines to their true
spots**, **traveller selection moved off the splash to its own screen**, France
overseas-territory locator insets, the curiosity layer grown to **39 cards**,
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
- `npm test` → **79 tests, 4 files** (`test/data.test.js`, `test/daily.test.js`,
  `test/routes.test.js`, `test/art.test.js`). They must stay green; several of them guard *facts*, not
  just shapes, and exist because a plausible-looking wrong map shipped once already.
- **Every random choice must go through `src/rng.js`** (`rnd()`, `shuffled()`), never
  `Math.random()` — that's what makes the Daily Expedition identical for everyone, and
  a stray `Math.random()` breaks it *silently*. `test/daily.test.js` guards it.
- The deploy workflow uses `actions/upload-pages-artifact@v5` + `deploy-pages@v5`
  (bumped off the deprecated Node 20 in July 2025).
- **Game modes that exist:** Assignments, Daily Expedition, Grand Tour (route
  optimisation), Journeys, Themed Expeditions, Explore, Quiz.
- **The one big file:** `src/shutterbug-world.jsx` (~4,900 lines) is the whole game
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

## 1. Finish the avatar redesign (wiring)

**Status: PAUSED at Joshua's request.** He is regenerating the graphics from ChatGPT
first. **Do not start this until he says the new art has landed** — the current
sprite sheets are the ones he wants to replace.

When it unpauses, the work is:

- 74 transparent PNGs already sliced into `public/assets/shutterbug-ui/avatar/`,
  with a `manifest.json` giving each part's in-cell bbox. Sheets: heads 3×2 (skin),
  eyes 3×2 (3 colours × 2 lash styles), hats 4×3, hair-short 4×4 and hair-long 4×4
  (4 styles × 4 colours), outfits 6×3 (3 styles × 6 colours).
- The sheets are **not mutually registered** (different canvases and grids), so the
  real work is calibrating a per-layer anchor and scale so head, eyes, hair, hat and
  outfit stack into a correctly-assembled person.
- Rebuild `Avatar` in `src/shutterbug-world.jsx` (currently a procedural SVG) to
  composite the PNG layers; update `AvatarEditor` to offer skin, hat, hair style,
  hair colour, eye colour, outfit, outfit colour.
- Keep the saved-avatar spec compatible with `profiles.js`, or migrate it.
- A review page exists at `public/avatar-preview.html`.
- **Show Joshua a screenshot of assembled avatars before replacing the live one.**
  The avatar appears in the header, the passport and the profile list.

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

Spec'd in `docs/design-notes.md` §3. Not started. This is the largest remaining
build. Suggested order — each piece is playable on its own, so ship them separately:

1. **Route-choice map.** Instead of a fixed list, offer 2–3 destination nodes and let
   the player pick. Grand Tour's committed-route screen (`screen === "route"` in
   `shutterbug-world.jsx`) is the obvious place to grow this from.
2. **Camera-bag loadout** — run-scoped items: telephoto lens (shoot from a
   neighbouring country), fast film (a perfect shot refunds ½ day), press pass (free
   research), bush plane (cheap intra-continent hops), lucky fixer (negate one wrong
   guess).
3. **Run modifiers** — 1–2 per run ("Monsoon — flights to Asia +1 day").
4. **Push-your-luck on the shot** — safe shot vs. hold for the light.
5. **A boss "Cover Story" finale**, and a **debrief/renown end screen** so a failed
   run still feels like progress.

**Use `src/rng.js` for every random choice** (`rnd()`, `shuffled()`, `pickOne()`).
Never call `Math.random()` directly in generation code: `withSeed()` is what lets the
Daily Expedition hand every player the identical run, and a stray `Math.random()` in
the generator breaks that *silently* — nothing looks wrong until two kids compare
score cards and their clues don't match. `test/daily.test.js` guards this.

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
- **39 cards (2026-07-15), up from 21** — grew toward the ~40 target, every new fact
  source-cited and `asOf`-dated where it can drift. Adding more is just more objects in
  the deck's `cards` array; the reshuffle, counter and `CURIOSITY_TOTAL` tracker all
  scale automatically.
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

This one decision unlocks both cross-device sync and friend competition. Do it *after*
the Daily Expedition has proved out, since the Daily deliberately needs no server.

---

## 8. Optionally package a desktop app

**Needs Joshua's decision.** The game already installs as a PWA (Chrome/Edge/Safari →
Install) with zero work, which may well be enough. For a real double-click
`.app`/`.exe`, wrap it with Tauri.

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
- **Flavour-transport tags** — `destinationContexts` in travel.js decides which modes fit
  a place. Growing it is rule-2 work (a mode may only appear where it *truly* exists), not
  a mechanical edit.
- ~~Real transport icons~~ — ✅ done 2026-07-16; 12 top-down icons at 46px in the chooser.
- **A lighter hub-only version in Assignments** — deferred: choosing transport to a named
  landmark would spoil that mode's deduction game.
