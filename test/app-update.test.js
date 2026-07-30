// ===========================================================================
// A deploy must never restart a game that is being played.
//
// This is a real bug that shipped and was reproduced: the service worker's
// `controllerchange` reloaded the page the instant a new build claimed it, and
// an in-progress run lives entirely in React state — localStorage holds the
// profile, its bests and its passport, and nothing about the trip you are on. A
// child two stops into Lewis & Clark was returned to the splash with the run
// gone, every time anything was pushed.
//
// Nothing errors when this regresses. The build is correct, the tests pass, the
// deploy is green, and the only symptom is a player saying "it restarted again".
// ===========================================================================
import { describe, it, expect } from "vitest";
import { createUpdateGate, isSafeScreen, SAFE_SCREENS } from "../src/app-update.js";

// Every screen the game can be on (grep: `setScreen("…")` in shutterbug-world.jsx).
const ALL_SCREENS = ["start", "travelers", "meet", "kit", "intro", "dream", "unlock",
  "play", "journey", "mystery", "route", "quiz", "homecoming", "end"];
const RUN_SCREENS = ["play", "journey", "mystery", "route", "quiz", "homecoming", "end", "kit"];

describe("which screens a new build may interrupt", () => {
  it("never counts a screen with a trip in flight as safe", () => {
    for (const s of RUN_SCREENS)
      expect(isSafeScreen(s), `${s}: reloading here throws away the player's run`).toBe(false);
  });

  it("counts the splash, the traveler picker and the meet screen as safe", () => {
    for (const s of ["start", "travelers", "meet"]) expect(isSafeScreen(s)).toBe(true);
  });

  // The asymmetry that makes this list safe to extend: a screen nobody has
  // classified must WAIT, not reload. Delay costs a player nothing; a wrong
  // reload costs them the trip.
  it("treats an unknown screen as unsafe, so a new screen is never interrupted by default", () => {
    expect(isSafeScreen("some-screen-added-next-year")).toBe(false);
    expect(isSafeScreen(undefined)).toBe(false);
    for (const s of SAFE_SCREENS) expect(ALL_SCREENS).toContain(s);
  });
});

describe("the update gate", () => {
  const gate = (screen) => {
    let reloads = 0;
    const g = createUpdateGate(() => reloads++);
    if (screen) g.noteScreen(screen);
    return { g, count: () => reloads };
  };

  it("reloads straight away when the player is on the splash", () => {
    const { g, count } = gate("start");
    g.requestUpdate();
    expect(count()).toBe(1);
  });

  it("does NOT reload while a journey is being played", () => {
    const { g, count } = gate("journey");
    g.requestUpdate();
    expect(count()).toBe(0);
    expect(g.waiting).toBe(true);
  });

  it("waits out a whole run and lands the moment the player reaches the splash", () => {
    const { g, count } = gate("meet");
    g.noteScreen("kit"); g.noteScreen("play");
    g.requestUpdate();                       // the deploy arrives mid-trip
    for (const s of ["play", "play", "end", "homecoming", "quiz"]) {
      g.noteScreen(s);
      expect(count(), `reloaded on "${s}" — the player was still finishing`).toBe(0);
    }
    g.noteScreen("start");
    expect(count()).toBe(1);
  });

  it("reloads once and only once, however many workers claim the page", () => {
    const { g, count } = gate("start");
    g.requestUpdate(); g.requestUpdate(); g.requestUpdate();
    expect(count()).toBe(1);
  });

  it("does not reload again when the player moves between safe screens", () => {
    const { g, count } = gate("play");
    g.requestUpdate();
    g.noteScreen("start");
    expect(count()).toBe(1);
    g.noteScreen("travelers"); g.noteScreen("meet"); g.noteScreen("start");
    expect(count()).toBe(1);
  });

  it("never reloads at all if no new build ever arrives", () => {
    const { g, count } = gate("start");
    for (const s of ALL_SCREENS) g.noteScreen(s);
    expect(count()).toBe(0);
  });
});
