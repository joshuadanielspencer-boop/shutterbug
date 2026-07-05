# Building the Full Game with Claude Code — A First-Timer's Guide

A step-by-step path from the single component you have now to a complete, deployable geography game for your kids. Written assuming you've never used Claude Code or set up a web project. Copy-pasteable prompts are in code blocks; paste them into the **Code** tab of the Claude desktop app.

Source for all product facts below: Anthropic's official docs — https://code.claude.com/docs/en/desktop-quickstart (verified current).

---

## 0. Orientation (read once)

- **Claude Code** is an AI agent that edits real files on your computer and runs commands. In the desktop app it has a graphical interface — **no terminal required**.
- The `shutterbug-world.jsx` file you have is **one React component**, not a runnable app. Phase 1 wraps it in a real project. This is the most common beginner stumble — don't skip it.
- This is a **multi-session project** (days/weeks of short sittings), not one afternoon. That's normal.
- **Review every change.** By default Claude proposes edits and waits for your approval — use that. Commit working versions to Git so you can always undo.

---

## 1. Prerequisites

1. **A paid Claude plan** (Pro, Max, Team, or Enterprise). The free tier does **not** include Claude Code. Pro is enough to start; Max helps if a long build hits usage limits.
2. **Windows only:** install Git first — https://git-scm.com/downloads/win. Local coding sessions won't work without it. **Mac** usually has Git already.
3. **Optional but recommended:** a free GitHub account (for backup and easy deployment later).

**Cost note:** heavy or long sessions consume plan usage quickly. If you get cut off mid-build, that's the limit, not a bug — resume later or consider Max.

---

## 2. Install and open (5 minutes)

1. Download the desktop app: macOS/Windows/Linux from https://claude.com/download.
2. Run the installer, launch the app, sign in with your Anthropic account.
3. Click the **Code** tab at the top center.
   - If it prompts you to **upgrade**, you're on the free tier — subscribe to a paid plan.
   - If it prompts you to **sign in online**, complete that and restart the app.

The desktop app has three tabs — **Chat** (like claude.ai, no file access), **Cowork** (autonomous background agent), and **Code** (interactive, edits your local files with your approval). You want **Code**.

---

## 3. Set up your project folder

1. Create an empty folder somewhere obvious, e.g. `Documents/shutterbug-world`.
2. Put your `shutterbug-world.jsx` file inside it (for reference — Claude will use it).
3. In the **Code** tab: choose **Local** → **Select folder** → pick that folder.
4. **Choose a model** from the dropdown next to the send button. Use the most capable model (Opus) for planning and hard problems; you can switch to a faster one (Sonnet) for routine edits later. You can change it anytime from the same dropdown.

You're now ready to give Claude instructions.

---

## 4. Phase 1 — Get it running and set guardrails

**4a. Scaffold a real app around your component.** Paste:

```
I have a single React component file called shutterbug-world.jsx in this folder.
It's an educational geography game, but it's just one component, not a runnable app.
Set up a minimal runnable web app around it: scaffold a Vite + React project in this
folder, move my component into src/ as the main screen, install dependencies, and start
the dev server so I can preview it. Don't change the game's logic or design yet — just
get it running. When it's working, tell me the exact preview URL.
```

Approve the changes as they come up. When it's running, click the **Preview** dropdown in the app to play it right there.

**4b. Save a checkpoint to Git.** Paste:

```
Initialize a Git repository here and make a first commit with the working project.
Then briefly explain how I commit again after each future change, in plain terms.
```

**4c. Create the project's memory file.** Paste:

```
Create a CLAUDE.md for this project. It's an educational geography photo game for my
kids (homeschool), built in Vite + React. Document: the run/build/test commands, the
folder structure, the rule that all game content (locations, clues, facts, greetings)
must live in a separate data file and never be hard-coded into components, the rule that
every geography fact and foreign-language greeting must be accurate and verifiable, and
the rule that accessibility (colorblind-safe UI, full keyboard navigation, works on a
phone) is required. Keep it under ~100 lines.
```

**Why CLAUDE.md matters:** Claude Code reads it at the start of every session, so these rules stick without you repeating them. Whenever Claude does something wrong and you correct it, ask it to add a rule to CLAUDE.md so the mistake doesn't recur.

---

## 5. Phase 2 — Real, accurate map (your priority #1)

The stylized map is the weakest part for a *geography* tool. Replace it first. Paste:

```
Replace the stylized hand-drawn SVG world map with a geographically accurate one.
Use a real vector world map (e.g., react-simple-maps with world-atlas TopoJSON, or
D3-geo) rendered with an equirectangular projection so my existing city pins — which
are positioned by longitude/latitude — still line up. Keep all current gameplay, the
pin interactions, the difficulty modes, and the airmail visual style. Add zoom and pan
if it's straightforward. Show me a plan first before changing any files.
```

Tip: for a change this large, switch to **Plan mode** first (Claude maps the approach without touching files), review the plan, then let it build. Test in Preview, then commit.

---

## 6. Phase 3 — Move content into an editable data file (your priority #2)

This is what lets you (and your kids) add places without touching code. Paste:

```
Refactor so every piece of game content lives in one editable data file, separate from
the game logic. Each location should have: city, country, continent, coordinates,
subject, clue (easy + hard versions), a geography fact, and placeholders for a photo and
a local-language greeting. Document the schema at the top of the file in a comment, and
give me a copy-paste template for adding a new location. The game components should read
from this file so I can add places without editing any game code.
```

Optional enrichment:

```
Where useful, auto-populate country facts (capital, currency, languages) from the free
REST Countries API, but keep the game playable offline with the data already in the file.
```

---

## 7. Phase 4 — Real photographs (your priority #3)

The original's whole appeal was real photos. Paste:

```
Replace the placeholder landmark icons with real photographs for each location. Pull
only freely-licensed images (Wikimedia Commons, public domain, or Unsplash). Store each
image URL plus its attribution and license in the data file, display the attribution
where appropriate, and fall back to the existing icon if an image is missing. Do NOT use
any image whose license you can't confirm — flag anything uncertain and let me decide.
```

**Your responsibility:** image licensing is on you, not the tool. Spot-check that attributions are real before you share the game.

---

## 8. Phase 5 — Features (from what we discussed)

Add these one at a time, testing and committing between each. Order them by what your kids need most.

**Persistence note (important):** in this real app, use `localStorage` for anything saved on one device — it works here (it did **not** work in the earlier chat artifact). A shared, cross-device family leaderboard needs a small backend; that prompt below asks Claude to explain the options first.

**Read-aloud (highest value if any kid isn't a fluent reader):**
```
Add a read-aloud button that speaks the editor's clue and the geography fact using the
browser's Web Speech API. Make it optional and respect a mute setting. Tell me which
languages the browser can't reliably pronounce.
```

**Local greeting + passport (combines language learning and engagement):**
```
Add a "local greeting" step: on arriving in a city, show and — if audio is available —
speak a real greeting in that country's main language before the player can photograph.
Add a "passport" screen that stamps each country visited and greeting learned. Verify
every greeting and transliteration is correct; keep it to greetings and single words
only, not sentences or grammar.
```

**Per-child profiles + personal best:**
```
Add simple per-child profiles and a personal-best tracker using localStorage (do not use
window.storage — this is a standalone app). Record which continents and countries each
child has answered correctly and resurface missed ones more often. No login — just
name-based profiles picked on a start screen.
```

**Family leaderboard (shared across devices — decide before building):**
```
I'd like a family leaderboard shared across different devices. First explain the options
and tradeoffs: localStorage is per-device only; a shared leaderboard needs a small
backend (e.g., Supabase or a serverless function). Recommend the simplest reliable option
for a non-developer, then implement it only if I approve.
```

**Sound effects:**
```
Add subtle, freely-licensed sound effects (camera shutter, plane, arrival chime,
success/fail) with a mute toggle, using a small audio library. Keep the files small.
```

**Themed assignment packs (curriculum alignment):**
```
Add selectable assignment packs (e.g., "World Capitals", "African Wildlife", "Rivers and
Mountains") that a parent chooses on the start screen, driven by tags in the data file.
```

**Accessibility fixes (do these — cheap, and I flagged them as real weaknesses):**
```
Fix accessibility: make the gold vs. coral map pins distinguishable without relying on
color (add shape or label differences), add full keyboard navigation with visible focus
states, and make sure the game works well on a phone screen.
```

---

## 9. Working habits that prevent pain

- **Plan mode before big changes.** Let Claude map the approach without editing files; review it; then build. Use it for Phases 2 and 5.
- **Review every diff.** The app shows exactly what will change with Accept/Reject. Read it. Reject and re-steer if it's wrong.
- **One change at a time.** Get it working, test in Preview, commit to Git, then move on. Small steps are easy to undo; big ones aren't.
- **Give Claude a way to verify.** Ask it to run the app, check the preview, or write a quick test. It self-corrects far better when it can see the result.
- **Feed CLAUDE.md its own mistakes.** Each time you correct Claude, ask it to add a rule to CLAUDE.md.
- **Be specific and include success criteria** in prompts ("...and the pins should still line up with real coordinates"). Vague prompts get vague results.
- **Interrupt freely.** You can stop or redirect Claude mid-task without starting over.

---

## 10. Deploy so your kids can play (no Claude Code needed)

**Option A — play on your machine:** just run the dev server and use the app's **Preview**. Zero setup, but only on that computer while Claude Code is open.

**Option B — a real link they can open anytime:** paste:

```
I want my kids to play this without running Claude Code. Build the app as a static site
and help me deploy it for free. Walk me through the simplest option (Netlify, Vercel,
GitHub Pages, or Cloudflare Pages) step by step, assuming I've never deployed anything.
Give me the final URL when it's live.
```

Any of those hosts is free for a static game and gives you a shareable link.

---

## What can go wrong (know these)

- **Usage limits** interrupt long builds — resume later or use Max.
- **Windows/Git friction** is the most common setup snag — install Git first (Section 1).
- **Never use `--dangerously-skip-permissions`** as a beginner. It lets Claude change anything without asking. Keep the default approval mode.
- **AI can loop or introduce regressions.** Commit after every working step so you can revert one change instead of losing everything.
- **Accuracy is on you.** Geography facts and greetings must be correct — verify them; a wrong fact in a teaching tool is worse than none.
- **Photo licensing is your responsibility** — confirm before sharing.

---

## Context: what "agentic coding" actually is

Traditional coding tools autocomplete lines while you drive. Claude Code is an *agent*: you describe an outcome in plain English, and it reads your files, writes and edits code across the project, runs commands, and works through multi-step tasks — pausing for your approval. The desktop app removes the historical barrier (a terminal) and adds a preview, visual diff review, and Git integration in one window. Three habits make it reliable for a non-developer: a **CLAUDE.md** file so your rules persist across sessions, **Git commits** after each working step so nothing is unrecoverable, and **verification** (letting Claude run and see the app) so it catches its own errors. Master those three and the rest is just describing what you want, one clear step at a time.
