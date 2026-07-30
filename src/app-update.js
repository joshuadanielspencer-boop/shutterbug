// ===========================================================================
// When it is safe to swap the build out from under the player.
//
// The game is a PWA. `vite.config.js` ships `skipWaiting` + `clientsClaim`, so a
// newly deployed service worker activates and claims the open page immediately
// instead of waiting for every tab to close. That is deliberate: without it a
// returning player kept being served the PREVIOUS build's precached assets until
// they fully quit the app.
//
// But claiming the page does not change the HTML and JS already running — those
// came from the old precache — so `main.jsx` reloaded the page the moment the
// claim landed. That reload had no idea whether anyone was playing, and an
// in-progress run is not saved anywhere: `journey`, `expedition`, `tourPlan` and
// the rest are React state, and localStorage holds only the profile, its bests
// and its passport. So every deploy dropped whoever was mid-run back onto the
// splash with their trip gone. Reproduced: "STOP 1 OF 6" → reload → "Begin your
// adventure", run lost.
//
// So the reload WAITS. A new build claims the page whenever it likes; the page
// only reloads once the player is standing somewhere the reload costs nothing.
//
// The safe list is deliberately short, and anything not on it counts as UNSAFE.
// The two mistakes are not equal: delaying an update costs a player nothing (it
// lands the next time they pass the splash, which every run ends at), while
// reloading a screen that turns out to matter costs them the trip. A screen
// added later therefore has to be named here on purpose before it will ever be
// interrupted, rather than being interrupted by default.
// ===========================================================================

// start     — the splash. Nothing in flight.
// travelers — the traveler picker. Nothing in flight.
// meet      — choosing a mode. Only a selection is lost, and the difficulty is
//             in localStorage anyway.
//
// Everything else is a run, a wrap-up, or one of Uncle Jonah's story beats:
// play, journey, mystery, route, quiz, homecoming, end, kit, intro, dream, unlock.
// `kit` is on the unsafe side on purpose — by then the mode, the difficulty and
// the route are all chosen and the player is packing to leave.
export const SAFE_SCREENS = ["start", "travelers", "meet"];

export function isSafeScreen(screen) {
  return SAFE_SCREENS.includes(screen);
}

// A gate, rather than module-level mutable state, so a test can drive one with a
// fake reload and no browser. `reload` is called at most once per gate.
export function createUpdateGate(reload) {
  let safe = true;        // the app boots on "start", which is safe
  let pending = false;    // a new build has claimed the page and is waiting
  let fired = false;      // a reload is already under way; never call twice

  const fire = () => {
    if (fired) return;
    fired = true;
    pending = false;
    reload();
  };

  return {
    // Called on every screen change. If a build has been waiting, this is where
    // it finally lands.
    noteScreen(screen) {
      safe = isSafeScreen(screen);
      if (safe && pending) fire();
    },
    // Called when a new service worker takes over the page.
    requestUpdate() {
      if (safe) fire();
      else pending = true;
    },
    get waiting() { return pending; },
  };
}

// The instance the app uses. Split out from createUpdateGate so the logic above
// can be tested without a window object.
export const updateGate = createUpdateGate(() => {
  if (typeof window !== "undefined") window.location.reload();
});
