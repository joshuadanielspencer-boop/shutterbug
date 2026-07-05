# Shutterbug — A World Photo Safari

An educational geography photo game for kids (homeschool use). The player is a
travelling photographer: read the editor's clue, fly to the right city, and
photograph the right subject before the travel days run out. Every correct shot
teaches a verifiable geography fact. Built with **Vite + React**.

## Commands

```bash
npm install      # install dependencies (first time)
npm run dev      # start dev server with hot reload → http://localhost:5173/
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

There is **no test runner configured yet.** When adding one, prefer Vitest
(integrates with Vite) and wire it up as `npm test`, then document it here.

## Folder structure

```
index.html                 # Vite entry HTML, mounts #root
vite.config.js             # Vite + @vitejs/plugin-react config
package.json               # scripts and dependencies
src/
  main.jsx                 # React entry; renders <ShutterbugWorld /> into #root
  index.css                # global reset / base styles
  shutterbug-world.jsx     # main game component (the whole game, for now)
  data/
    locations.js           # game content: locations, clues, geography facts
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

> **Current state:** locations, clues, and geography facts live in
> `src/data/locations.js`. There are no greetings yet — when added, they belong
> in `src/data/` too (e.g. `src/data/greetings.js`), never inline in a component.

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

- The current map is a stylized vector (not geographically exact) and landmarks
  are hand-drawn icons standing in for real photos — deliberate demo placeholders.
- Everything runs in-memory; there is no persistence or backend.
