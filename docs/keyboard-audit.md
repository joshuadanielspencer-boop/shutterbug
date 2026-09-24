# Keyboard & focus audit — 2026-07-21

Rule 4 requires full keyboard operation with visible focus states. This is the
first time that has actually been *tested* rather than assumed.

> ## ✅ ALL FIVE FINDINGS ARE FIXED (re-verified 2026-09-23)
>
> **This file used to say "nothing here has been fixed yet", and it said it for
> two months after the work was done.** Anyone reading it cold would have set out
> to redo a day's work. Verified against the shipped source and in the running
> game:
>
> | | finding | where it landed |
> |---|---|---|
> | 1 | Focus ring fails 3:1 on light surfaces | **Fixed.** Two-tone ring — ink outline + gold `box-shadow` band — at the `:where(...)` floor in `shutterbug-world.jsx`, with the bands swapped on the dark chrome so neither reads as muddy. |
> | 2 | No modal traps or restores focus | **Fixed.** `useModalFocus` in `src/components/modal.jsx`: remembers the opener, moves focus in, cycles Tab/Shift-Tab, restores on unmount. All **15** dialogs in `shutterbug-world.jsx` call it, plus `avatar.jsx`, `ModalShell` and `OpenBook`. |
> | 3 | Six modals ignore Escape | **Fixed.** Escape lives in the same hook, with an `{ escape: false }` opt-out for the ones that are gates rather than dismissals (the result card, the riddle, the route board, the gamble). |
> | 4 | Bag screen has no live region | **Fixed.** `role="status"` on the "2 of 2 packed" line. |
> | 5 | Splash tab order | **Fixed 2026-09-23.** "How to play" had already moved first, but "Begin your adventure" was still *fifth*, behind the three greeting bubbles. It is second now. Everything on the splash is absolutely positioned, so DOM order and paint order are independent and this cost nothing. The mode picker's "← Back to travelers" being last is left alone, as this file recommended. |
>
> Two things worth keeping from finding 2's fix, because both were bugs found
> while writing it and both are recorded in the hook's own comments: the
> focusable-element selector must carry `:not([tabindex="-1"])` on **every**
> branch (without it the passport's untabbable file input counted as the last
> focusable thing and focus escaped on every lap), and the escape/close callbacks
> go through refs so a popup that changes its mind mid-life — the arrival card
> refuses Escape until its dwell timer is up — doesn't tear the effect down and
> yank the player out of a dialog that is still on screen.
>
> **What is NOT covered here:** this was a keyboard and focus audit. Screen-reader
> narration beyond the live regions named above, and colour-contrast of ordinary
> text (as opposed to the focus ring), have still never been measured.

The findings list below is kept as written, for the reasoning and the
measurements. **Read the table above first for what is still true.**

**How it was tested.** The running dev build was driven with real `Tab` / `Enter`
keystrokes (not synthetic events, which don't move focus), with a capture-phase
`focusin` listener recording every element focus reached, its computed outline,
and whether it sat inside the open dialog. Contrast ratios were computed from the
live page's own resolved colours. Findings marked **measured** were observed in
the running game; findings marked **read** come from the source and have not been
reproduced live yet.

## The good news first

These were genuinely surprising, and they mean the job is smaller than feared:

- **Every focusable control has a focus ring.** The `:where(...)` zero-specificity
  floor at `src/shutterbug-world.jsx:5572` really does reach everything — all 17
  controls on the map screen, all 5 on the bag screen, all 17 on the mode picker
  came back with `outline: 3px solid rgb(240,165,0)`. (measured)
- **The core loop is fully keyboard-operable.** On the country map the four city
  pins are real tab stops in a sensible order — checklist, then pins, then the
  right rail — each with `Enter`/`Space` handlers and their own focus treatment
  (`.sbw-pin:focus-visible`, coral stroke + scale at `:5601`). Focusing a pin also
  reveals its name via `onFocus`, so the "names hide until hover" behaviour has a
  keyboard equivalent. (measured)
- **No keyboard-unreachable controls.** Every `onClick` on a `div`/`span`/`g` in
  the file is either a backdrop dismiss or a `stopPropagation` shim — there is no
  case of a real action hidden on a non-focusable element. (read)
- **Tab order follows the DOM and the DOM follows the layout**, with two small
  exceptions noted below. No positive `tabindex` anywhere.

## Findings

### 1. The focus ring fails contrast on every light surface — **measured**

WCAG 2.2 SC 1.4.11 requires **3:1** for a focus indicator. Measured against the
game's own backgrounds:

| Background | Gold `#F0A500` ring |
|---|---|
| Cream paper `#F4ECD8` | **1.77:1** ✗ |
| White card `#FFFFFF` | **2.08:1** ✗ |
| Selected pink `#FBEAE6` | **1.79:1** ✗ |
| Coral button `#E15C42` | **1.74:1** ✗ |
| Header teal `#1F4E5A` | 4.39:1 ✓ |
| Dark wood `#4A3214` | 5.74:1 ✓ |

The ring was chosen for the dark chrome, where it's excellent — but most of the
game's buttons sit on paper. Ink `#10262E` is the mirror image (13–15:1 on paper,
1.3–2.2:1 on the dark chrome), so **no single colour works everywhere**.

**Fix:** a two-tone ring — ink inner band, gold outer band. Whichever surface a
control sits on, one band always clears 3:1, and gold stays the colour of the
thing so it still reads as Shutterbug. One rule change at `:5572`, plus the three
map-specific treatments (`.sbw-pin`, `.sbw-cont`, `.sbw-country`) which set
`outline: none` and would need the same two-tone logic in their own idiom.

### 2. No modal traps focus, and none restores it on close — **measured**

Thirteen elements declare `role="dialog" aria-modal="true"`. None of them behaves
like a modal to the keyboard.

With the passport open, `Tab` walked through **all seven background controls**
first — Back, Ana, Guest, New traveler, passport, Customize, Continue — before
reaching the passport's own Close button on the eighth press. `aria-modal="true"`
is a promise to assistive tech that the rest of the page is inert; right now that
promise is false, which is worse than not making it.

Two related gaps, same cause:
- **Focus doesn't move into the dialog when it opens.** Opening the passport left
  `document.activeElement` on `<body>`. (measured)
- **Focus doesn't return to the trigger when it closes.** After closing the
  passport, `activeElement` was `<body>` again — a keyboard user is dumped back to
  the top of the page and has to re-tab to where they were. (measured)

**Fix:** one small `useFocusTrap(ref, onClose)` hook — remember the trigger, move
focus to the first control (or the dialog itself), cycle Tab/Shift-Tab within,
restore on unmount. Applied at 13 call sites. Six of them already have `autoFocus`
on their primary button, which covers the "move in" half but not the trap or the
restore.

### 3. Six modals can't be dismissed with Escape — **read**

Escape is handled in five places (`:5883`, `:5903`, `:6022`, `:6423`, `:7008`).
Missing from:

| Component | Line | Should Escape close it? |
|---|---|---|
| `TravelChooser` | 6271 | **Yes** — it's a choice with a Cancel |
| `AvatarEditor` | 6669 | **Yes** |
| `CreateTravelerModal` | 6758 | **Yes** |
| `CountryPopup` (arrival) | 6962 | **Yes** |
| tool-note popup | 5466 | **Yes** |
| `ResultModal` | 6363 | **No — deliberate.** Escaping past a result skips a fact the child hasn't read. Leave it. |
| `RiddleModal` | 7119 | **Probably not** — same reasoning; it's a question to answer, not a thing to dismiss. Your call. |

The focus-trap hook from finding 2 is the natural home for the Escape handler, so
these land together.

### 4. The bag screen has no live region — **measured**

`document.querySelectorAll('[aria-live],[role="status"],[role="alert"]')` returns
**empty** on the pack-the-bag screen. Picking the second item silently: enables
"Set off", and turns the third item `disabled` (removing it from the tab order
with no announcement). A sighted mouse user sees all this; a screen-reader user
gets nothing.

The item buttons themselves are good — `aria-pressed` is correct and the ✓ is in
the accessible name, so re-focusing an item does announce its state.

**Fix:** a `role="status"` line reading "2 of 2 packed — Jonah's other offer stays
behind", which doubles as a visible affordance the screen currently lacks.

### 5. Two small tab-order oddities — **measured**

- On the splash, the three greeting bubbles come *before* "Begin your adventure",
  and "How to play" comes *after* it. A first-time player pressing Tab hits three
  decorative sound buttons before the button they want. (`Enter` fixes this — the
  global handler presses `[data-primary]` — but Enter isn't advertised, on purpose.)
- On the mode picker, "← Back to travelers" is the **last** tab stop but sits
  visually top-left.

Neither is a blocker. The splash one is worth a re-order; the Back one is
conventional enough to leave.

### 6. Not a keyboard bug, but found while measuring — **measured**

Three screens overflow a 1280×720 window and scroll: play `780px`, mode picker
`822px`, pack-the-bag `855px`. On the bag screen the primary action ("Set off")
starts below the fold. Keyboard users are fine — the browser scrolls focus into
view — but mouse users must scroll to reach the button that starts the run. This
overlaps Joshua's own Long Trip feedback about scrolling and is filed there too.

## Also worth recording

`CLAUDE.md` says "144 places". `src/data/locations.js` now holds **447** across
**106 countries**. Worth a one-line correction next time that file is touched.

## Suggested order

1. Two-tone focus ring (finding 1) — one CSS rule + three map treatments, fixes
   the most-used surface in the game.
2. `useFocusTrap` hook + Escape (findings 2 and 3) — one hook, 13 call sites.
3. Bag-screen live region (finding 4).
4. Splash tab order (finding 5).

Findings 1 and 2 are the ones that matter. 3 and 4 are cheap once 2 is in.
