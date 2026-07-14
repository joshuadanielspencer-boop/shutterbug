# Shutterbug — remaining work

A handoff document. Everything here is written so a **new session with no memory of
the previous ones** can pick up a task and finish it. Read `CLAUDE.md` first (the
three project rules are hard requirements), then the task you're doing.

Last updated after the session that shipped: the Natural Earth water layer, the
sharper relief plates, the Seeded Daily Expedition, rotating people cards, the
imperial-first units pass, the Grand Tour rework, and the Lewis & Clark Journey.

---

## Where things stand

- **Live** at `joshuadanielspencer-boop.github.io/shutterbug/`. `git push` to `main`
  triggers `.github/workflows/deploy.yml`, which tests, builds and publishes. There
  is no separate deploy step.
- `npm test` → **54 tests, 3 files** (`test/data.test.js`, `test/daily.test.js`,
  `test/routes.test.js`). They must stay green; several of them guard *facts*, not
  just shapes, and exist because a plausible-looking wrong map shipped once already.
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

## 2. Rotating people cards — the remaining countries

**Needs Joshua's review, by his own request** — deciding which peoples represent a
country is an editorial call he wants to make, and Commons' categories for ethnic
groups skew heavily toward colonial-era imagery that shouldn't go in front of a
child unreviewed.

The **mechanism is built and working**. `COUNTRY_PEOPLE` in `src/data/culture.js`
accepts either a single card or a list of up to three; `peopleCards(country)`
normalises both. The arrival card rotates between visits ("African American · 2 of
3") with prev/next buttons. The United States ships with three, all licence-verified.

**What's left:** these countries are multi-ethnic but still on one card each —
Brazil (currently Afro-Brazilian only), South Africa (Ndebele only), Malaysia (Malay
only — it is explicitly a three-community country), Canada (First Nations only),
Australia (Torres Strait Islander only — mainland Aboriginal peoples are distinct
and missing), New Zealand (Māori only — Pasifika communities are large). The US
itself is a floor, not a full account: Hispanic/Latino and Asian American
communities each outnumber several whole countries in this game.

**How to do one:**
1. `node scripts/commons.mjs cat "Category:<something>"` — categories beat free-text
   search, which returns scanned books. Look for contemporary cultural events, not
   19th-century ethnography.
2. `node scripts/commons.mjs verify "File:…"` on the candidate. It must come back
   `✓` (free licence), and be landscape and reasonably large. Copy the `src` and
   `source` URLs it prints — do not hand-write them.
3. Add to the country's array with `people:` (who it shows), `caption:`, `credit:`,
   `license:`.
4. `npm test` — the licence test walks **every** card, not just the first, and the
   rotating-card test requires each card to name its people and forbids duplicates.
5. **Show Joshua the photos before committing.**

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

Spec'd in `docs/design-notes.md` §6. Not started. **This is mostly sourcing work, not
code** — roughly 40 cards, each needing a verified fact (rule 2). Budget accordingly.

Make the UI chrome tappable; each element opens a small rotating "field-note card"
(reshuffled cycle, so revisits teach something new, with a "3 of 8" counter). Mr O
narrates trivia, Grandpa narrates story.

Elements and their topics:
- **logo** → about the game / how to play
- **calendar** → travel times by sail vs steam vs jet, time zones, the Date Line
- **avatar** → jump to customise traveller
- **compass** → cardinal directions, true vs magnetic north, why maps are north-up
- **Continent button** → how continents are defined, why the count is 5/6/7, plates
- **Country button** → how many countries and why "it depends"; UN/EU/OPEC/BRICS/USMCA
- **Destination button** → most-visited places, over-tourism
- **Photograph button** → shutter speed, ISO, aperture, rule of thirds

Store all cards in `src/data/` (rule 1 — never inline in a component). **Date-stamp
anything time-sensitive** (country counts, visitor numbers, membership lists), and
cite a source per card. Add a "Curiosities found: 14/40" tracker so poking around
counts as progress.

---

## 5. More Journeys

The engine is **built and proven** (`src/data/journeys.js` + the `journey` mode).
Lewis & Clark ships as the flagship. **Adding a route is now just data.**

Wish list: Marco Polo's Silk Road, Magellan, Darwin's *Beagle*, the Oregon Trail, the
Exodus route, the 13 Colonies, National Parks, Paul's first missionary journey.

**How to add one:**
- Get each stop's coordinates from its Wikipedia article via the MediaWiki API — do
  **not** eyeball them off a map:
  `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates|extracts&exintro=1&explaintext=1&titles=Fort+Mandan`
- Record the article URL in the stop's `source`.
- Keep facts on the plainly documented spine of the story.
- Measurements must be **imperial first, metric in brackets** — the units test covers
  journey facts and prompts.
- `npm test` enforces: ≥4 stops, coordinates in range, `x`/`y` derived from `lat`/`lon`,
  a source per stop, and **no two stops within 1.2°** (Fort Clatsop and Cape
  Disappointment are 12 miles apart and rendered as one unclickable pin — that's why
  the route carries only one of them).

> ⚠ **Lewis & Clark was the safe one.** Nobody disputes where Fort Mandan was. The
> Exodus route and the site of Mount Sinai are **genuinely contested**, and several of
> Paul's stops are uncertain. Before adding those, add a `certainty` field
> (`"documented"` vs `"traditional"`) and make the card **say which**. Do not quietly
> present a traditional site as a fact. This is a rule-2 issue, not a polish issue.

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
