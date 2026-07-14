# Shutterbug — A World Photo Safari

An educational geography photo game for kids (homeschool use). The player is a
travelling photographer: read the editor's clue, fly to the right city, and
photograph the right subject before the travel days run out. Every correct shot
teaches a verifiable geography fact. Built with **Vite + React**.

## Commands

```bash
npm install      # install dependencies (first time)
npm run dev      # start dev server with hot reload → http://localhost:5173/
npm run build    # production build to dist/ (also generates the PWA service worker)
npm run preview  # serve the production build locally → http://localhost:4173/
node scripts/gen-icons.mjs   # re-rasterize app/PWA icons from assets-src/icon.svg
node scripts/gen-geography.mjs           # rebuild src/data/geography.js from Natural Earth
node scripts/make-relief.mjs <NE1.tif> --width 8192 --out public/relief-world.jpg
```

```bash
npm test         # run the Vitest data-invariant checks (test/)
```

`npm test` guards content **shape** (unique ids, valid category, in-range
coords, freely-licensed photo URLs, each continent/category populated enough for
missions). It does **not** check whether facts or greetings are *true* — a human
must still verify those against a reliable source (rule 2).

Two exceptions, where a test *does* check a fact, because the failure mode was a
map that looked entirely plausible and was wrong:
- **Water features** (`test/data.test.js`) pin each big river to the basin it must
  lie in and a real city it must run past. Natural Earth names collide across
  continents (there is a Colorado in Argentina, a Mackenzie in Queensland) and it
  stores a long river under its *local* names, so a naive lookup silently produced
  a Nile that stopped in Sudan.
- **The Daily Expedition** (`test/daily.test.js`) pins the promise that everyone
  playing on the same day at the same level flies the *same* run. One stray
  `Math.random()` in the mission generator would break that invisibly.

### Deploy / install as an app

The game is a **PWA** (via `vite-plugin-pwa`): installable and offline-capable, so
it can run on an iPad or desktop without a dev server. On an iPad, open the hosted
URL in Safari → Share → **Add to Home Screen**; it launches full-screen and works
offline. The app shell, relief map plates, and icons are precached; landmark photos
from Wikimedia are cached on first view, so visited places work offline too.

Hosting options:
- **Any root-served static host** (Netlify drop, Cloudflare Pages, a
  `<user>.github.io` repo, a custom domain): just `npm run build` and serve `dist/`.
- **GitHub Pages** (project site under `/<repo>/`): push to GitHub and set
  Settings → Pages → Source = **GitHub Actions**. `.github/workflows/deploy.yml`
  then tests, builds with `BASE_PATH=/<repo>/`, and publishes on every push to main.

The app is **base-path aware**: `vite.config.js` reads `BASE_PATH` (default `/`) and
sets Vite `base` + the PWA scope/start_url; runtime asset URLs use
`import.meta.env.BASE_URL`, so the build works at a domain root or under a subpath.

## Folder structure

```
index.html                 # Vite entry HTML + PWA/iOS meta; mounts #root
vite.config.js             # Vite + plugin-react + vite-plugin-pwa (manifest, SW)
package.json               # scripts and dependencies
assets-src/icon.svg        # source art for the app icon (edit here, then gen-icons)
scripts/gen-icons.mjs      # rasterizes icon.svg → public/*.png (needs sharp)
scripts/gen-geography.mjs  # builds src/data/geography.js from Natural Earth vectors
scripts/make-relief.mjs    # builds the relief plates (keys the ocean to the game palette)
public/                    # static assets copied as-is + precached by the PWA
  relief-world.jpg         #   equirectangular shaded-relief plate (8192x4096, continent zooms)
  relief-antarctica.jpg    #   polar relief plate for the Antarctica map
  *.png / icon.svg         #   generated PWA + favicon + apple-touch icons
src/
  main.jsx                 # React entry; renders <ShutterbugWorld /> into #root
  index.css                # global reset / base styles
  shutterbug-world.jsx     # main game component (the whole game, for now)
  profiles.js              # localStorage profiles, bests, spaced-repetition, passport
  rng.js                   # the one swappable RNG — withSeed() makes a run reproducible
  daily.js                 # the Daily Expedition: day number, seed, share card
  robinson.js              # Robinson projection helpers for the world map
  data/
    locations.js           # game content: 144 places — clues, facts, photos, greetings, category
    categories.js          # the 14 subject categories + kinds + display metadata
    worldmap.js            # country outline paths + COUNTRY_CONTINENT colour map
    geography.js           # GENERATED — rivers, lakes, seas, oceans, bays, gulfs
.claude/                   # Claude Code project config (launch.json is shared)
claude-code-game-build-guide.md   # design/build notes
```

## What's left to build

`docs/remaining-work.md` is the handoff list — every outstanding task, written so a
fresh session can pick one up cold. Read it before starting anything new. Two items
in it are **paused pending Joshua's artwork** (the avatar wiring, the award badges)
and two **need his decision** (the Supabase backend, the Tauri desktop wrapper).

## Rules

These are hard requirements for this project. Follow them in every change.

### 1. All game content lives in a separate data file — never hard-coded in components

Locations, clues, geography facts, greetings, and any other player-facing content
must live in a dedicated data module under `src/data/`, imported by the
components. Components hold presentation and logic only. This keeps content
reviewable, correctable, and expandable without touching UI code.

> **Current state:** every place (city, clues, fact, photo + license, local
> greeting, and subject `category`/`tags`) lives in `src/data/locations.js`; the
> category registry is `src/data/categories.js` and the map/continent data is
> `src/data/worldmap.js`. Add or correct content there, never inline in a component.
>
> `src/data/geography.js` (rivers, lakes, seas, oceans, bays, gulfs) is **generated**
> — don't hand-edit it. Curate *which* features appear, and their display names, in
> `scripts/gen-geography.mjs`, then re-run it.

### 2. Every fact and foreign-language greeting must be accurate and verifiable

This is a teaching tool for children — correctness is non-negotiable. Every
geography fact and every foreign-language greeting must be checked against a
reliable source before it ships. Do not invent, approximate, or guess. If a claim
cannot be verified, do not include it. When adding content, cite or note the
source so it can be re-checked later.

### 3. Measurements are imperial first, metric in parentheses

The game teaches American homeschoolers, so every player-facing measurement reads
**imperial first with metric in brackets** — "12,388 feet (3,776 m)", "6.8 miles
(11 km)". `npm test` fails any clue, fact or blurb that gives a metric figure with
no imperial equivalent, or that leads with the metric one.

The conversions were done once, from one formula (`scripts/imperial-first.mjs`),
rather than by hand: 166 conversions typed out by hand is how a teaching tool ends
up with one wrong number in it. Exact figures convert exactly; a *hedged* figure
("about 11 km") converts to significant figures, because "about 6.84 miles" would
claim a precision the "about" already disclaimed.

One deliberate exception, marked in the test: the Bayterek Tower's cryptic clue
keeps "ninety-seven metres" first, because that number IS the riddle — the tower's
deck marks 1997, the year Astana became Kazakhstan's capital.

### 4. Accessibility is required, not optional

- **Colorblind-safe UI:** never rely on color alone to convey meaning; pair color
  with text, shape, icons, or patterns. Maintain sufficient contrast.
- **Full keyboard navigation:** every interactive element must be reachable and
  operable by keyboard, with visible focus states and a sensible tab order.
- **Works on a phone:** responsive layout, touch-friendly targets, and readable
  text on small screens. Test at narrow viewport widths.

## Notes

- The world map is a real Robinson-projected vector map with colour-coded
  continents; continent zooms use shaded-relief plates. Rivers, lakes and the
  named seas/oceans/bays are drawn over the relief as **vectors** (Natural Earth,
  public domain) — the relief raster contains no lakes at all, and vectors stay
  crisp at every zoom where a baked-in raster lake would blur. Landmarks use real,
  freely-licensed photos (Wikimedia Commons; attribution shown in-game), with the
  hand-drawn `icon` only as a fallback when a photo is missing.
- No backend. Player profiles, scores, best times, stamps, and achievements
  persist in the browser's `localStorage` (see `src/profiles.js`).
