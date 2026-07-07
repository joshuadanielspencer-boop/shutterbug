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
```

```bash
npm test         # run the Vitest data-invariant checks (test/data.test.js)
```

`npm test` guards content **shape** (unique ids, valid category, in-range
coords, freely-licensed photo URLs, each continent/category populated enough for
missions). It does **not** check whether facts or greetings are *true* — a human
must still verify those against a reliable source (rule 2).

### Deploy / install as an app

The game is a **PWA** (via `vite-plugin-pwa`): installable and offline-capable, so
it can run on an iPad or desktop without a dev server. To ship it, run
`npm run build` and host the static `dist/` folder anywhere (Netlify drop, GitHub
Pages, any static host). On an iPad, open the hosted URL in Safari → Share → **Add
to Home Screen**; it then launches full-screen and works offline. The app shell,
the relief map plates, and the icons are precached; landmark photos from Wikimedia
are cached on first view, so places you've already visited work offline too.
(For a GitHub Pages *project* site served under a subpath, set Vite's `base`.)

## Folder structure

```
index.html                 # Vite entry HTML + PWA/iOS meta; mounts #root
vite.config.js             # Vite + plugin-react + vite-plugin-pwa (manifest, SW)
package.json               # scripts and dependencies
assets-src/icon.svg        # source art for the app icon (edit here, then gen-icons)
scripts/gen-icons.mjs      # rasterizes icon.svg → public/*.png (needs sharp)
public/                    # static assets copied as-is + precached by the PWA
  relief-world.jpg         #   equirectangular shaded-relief plate (continent zooms)
  relief-antarctica.jpg    #   polar relief plate for the Antarctica map
  *.png / icon.svg         #   generated PWA + favicon + apple-touch icons
src/
  main.jsx                 # React entry; renders <ShutterbugWorld /> into #root
  index.css                # global reset / base styles
  shutterbug-world.jsx     # main game component (the whole game, for now)
  profiles.js              # localStorage profiles, bests, spaced-repetition, passport
  robinson.js              # Robinson projection helpers for the world map
  data/
    locations.js           # game content: 144 places — clues, facts, photos, greetings, category
    categories.js          # the 14 subject categories + kinds + display metadata
    worldmap.js            # country outline paths + COUNTRY_CONTINENT colour map
.claude/                   # Claude Code project config (launch.json is shared)
claude-code-game-build-guide.md   # design/build notes
```

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

### 2. Every fact and foreign-language greeting must be accurate and verifiable

This is a teaching tool for children — correctness is non-negotiable. Every
geography fact and every foreign-language greeting must be checked against a
reliable source before it ships. Do not invent, approximate, or guess. If a claim
cannot be verified, do not include it. When adding content, cite or note the
source so it can be re-checked later.

### 3. Accessibility is required, not optional

- **Colorblind-safe UI:** never rely on color alone to convey meaning; pair color
  with text, shape, icons, or patterns. Maintain sufficient contrast.
- **Full keyboard navigation:** every interactive element must be reachable and
  operable by keyboard, with visible focus states and a sensible tab order.
- **Works on a phone:** responsive layout, touch-friendly targets, and readable
  text on small screens. Test at narrow viewport widths.

## Notes

- The world map is a real Robinson-projected vector map with colour-coded
  continents; continent zooms use shaded-relief plates. Landmarks use real,
  freely-licensed photos (Wikimedia Commons; attribution shown in-game), with the
  hand-drawn `icon` only as a fallback when a photo is missing.
- No backend. Player profiles, scores, best times, stamps, and achievements
  persist in the browser's `localStorage` (see `src/profiles.js`).
