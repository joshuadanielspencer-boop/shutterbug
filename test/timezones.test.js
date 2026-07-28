// ===========================================================================
// Time zones and seasons on the arrival card.
//
// Rule 2 applies to a clock reading exactly as it applies to a fact: "it's 3 in
// the morning in Tokyo" is a claim about the world, and a child will believe it.
// So the zone data is checked for real, and the two things the code must REFUSE
// to say — a season inside the tropics, a clock time in Antarctica — are pinned,
// because both are easy to "simplify" back in later and both would be false.
// ===========================================================================
import { describe, it, expect } from "vitest";
import { LOCATIONS } from "../src/data/locations.js";
import { COUNTRY_TZ, LOCATION_TZ, zoneFor } from "../src/data/timezones.js";
import { localParts, partOfDay, hoursApart, seasonFor, arrivalLines,
  latOf, TROPIC } from "../src/localtime.js";

const BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
const at = (iso) => new Date(iso);

describe("every place has a zone the runtime accepts", () => {
  it("covers every country in the game", () => {
    for (const c of new Set(LOCATIONS.map((l) => l.country)))
      expect(c in COUNTRY_TZ, `${c} has no time zone`).toBe(true);
  });

  it("every zone name is a real IANA zone", () => {
    // A typo like "America/Los Angeles" would silently throw at runtime and the
    // card would just go quiet — the failure mode is invisible in play.
    const names = [...Object.values(COUNTRY_TZ), ...Object.values(LOCATION_TZ)].filter(Boolean);
    for (const z of new Set(names)) {
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: z }).format(new Date()),
        `"${z}" is not a zone this runtime knows`).not.toThrow();
    }
  });

  it("every override points at a location that exists", () => {
    for (const id of Object.keys(LOCATION_TZ))
      expect(BY_ID[id], `LOCATION_TZ has "${id}", which is not a location`).toBeTruthy();
  });

  it("no override just repeats its country's zone", () => {
    // A redundant override is a lie about the data: it says "this place is special"
    // when it isn't, and it hides the real exceptions in the noise.
    for (const [id, z] of Object.entries(LOCATION_TZ))
      expect(z, `${id}'s override is the same as ${BY_ID[id].country}'s default`).not.toBe(COUNTRY_TZ[BY_ID[id].country]);
  });

  it("every location resolves to a zone, except Antarctica which honestly has none", () => {
    for (const l of LOCATIONS) {
      if (l.country === "Antarctica") expect(zoneFor(l), `${l.id}`).toBe(null);
      else expect(zoneFor(l), `${l.id} has no zone`).toBeTruthy();
    }
  });
});

describe("the zones are RIGHT, not just well-formed", () => {
  // Every one of these is a case the divide-longitude-by-fifteen shortcut gets
  // wrong. Checked at a fixed instant in January (northern winter, no northern DST)
  // so the expected offsets are stable.
  const jan = at("2026-01-15T12:00:00Z");
  const off = (id) => hoursApart(zoneFor(BY_ID[id]), "UTC", jan);

  it("China runs one clock across five geographic zones", () => {
    // Kashgar and Shanghai are 40 degrees apart and on the same clock.
    expect(off("beijing")).toBe(8);
  });

  it("India is on the half hour", () => {
    expect(off("agra")).toBe(5.5);
  });

  it("Nepal is on the three-quarter hour", () => {
    expect(off("everest")).toBe(5.75);
  });

  it("Spain is west of Greenwich and keeps Berlin's time", () => {
    expect(off("granada")).toBe(1);   // longitude says UTC+0
  });

  it("Arizona sits out daylight saving but the Navajo Nation inside it does not", () => {
    // In January they agree; in July they don't, and that is the whole point of
    // Monument Valley having its own entry.
    const jul = at("2026-07-15T12:00:00Z");
    expect(hoursApart(zoneFor(BY_ID.grandcanyon), "UTC", jan)).toBe(-7);
    expect(hoursApart(zoneFor(BY_ID.monumentvalley), "UTC", jan)).toBe(-7);
    expect(hoursApart(zoneFor(BY_ID.grandcanyon), "UTC", jul)).toBe(-7);
    expect(hoursApart(zoneFor(BY_ID.monumentvalley), "UTC", jul)).toBe(-6);
  });

  it("Hawaiʻi and Alaska are not on New York's clock", () => {
    expect(off("kilauea")).toBe(-10);
    expect(off("denali")).toBe(-9);
  });

  it("central Australia is on the half hour, and the west is two behind Sydney", () => {
    expect(off("uluru")).toBe(9.5);
    expect(off("purnululu")).toBe(8);
    expect(off("sydney")).toBe(11);   // January: southern summer time
  });

  it("Russia is not one country-wide clock", () => {
    expect(off("moscow")).toBe(3);
    expect(off("kamchatka")).toBe(12);
  });

  it("Easter Island keeps its own clock, two hours off the Chilean mainland", () => {
    expect(off("valparaiso") - off("easterisland")).toBe(2);
  });
});

describe("what the hour means", () => {
  it("calls the small hours the middle of the night, and says so", () => {
    expect(partOfDay(3).asleep).toBe(true);
    expect(partOfDay(23).asleep).toBe(true);
    expect(partOfDay(13).asleep).toBe(false);
  });

  it("covers all 24 hours with a phrase", () => {
    for (let h = 0; h < 24; h++) expect(partOfDay(h).word.length).toBeGreaterThan(3);
  });
});

describe("seasons", () => {
  const jul = at("2026-07-15T12:00:00Z"), jan = at("2026-01-15T12:00:00Z");

  it("July is summer in the north and winter in the south", () => {
    expect(seasonFor(BY_ID.paris, jul).season).toBe("summer");
    expect(seasonFor(BY_ID.sydney, jul).season).toBe("winter");
    expect(seasonFor(BY_ID.paris, jan).season).toBe("winter");
    expect(seasonFor(BY_ID.sydney, jan).season).toBe("summer");
  });

  it("refuses to name a season inside the tropics", () => {
    // Telling a child it is winter in Singapore teaches them something false: the
    // year there divides into wet and dry, not into four temperatures.
    const tropical = LOCATIONS.filter((l) => Math.abs(latOf(l)) < TROPIC);
    expect(tropical.length).toBeGreaterThan(30);
    for (const l of tropical) {
      expect(seasonFor(l, jul).tropical, `${l.id} at ${latOf(l).toFixed(1)}°`).toBe(true);
      expect(seasonFor(l, jul).season).toBe(null);
    }
  });
});

describe("the arrival lines", () => {
  const jul = at("2026-07-15T12:00:00Z");

  it("always gives a time line and a season line", () => {
    for (const l of [BY_ID.paris, BY_ID.sydney, BY_ID.singapore, BY_ID.southpole]) {
      const kinds = arrivalLines(l, null, jul).map((x) => x.kind);
      expect(kinds, `${l.id}`).toContain("time");
      expect(kinds, `${l.id}`).toContain("season");
    }
  });

  it("never states a clock time in Antarctica", () => {
    for (const l of LOCATIONS.filter((x) => x.country === "Antarctica")) {
      const t = arrivalLines(l, BY_ID.paris, jul).find((x) => x.kind === "time").text;
      expect(t, `${l.id}`).not.toMatch(/\d{1,2}:\d{2}/);
      expect(t).toMatch(/no time zone/i);
    }
  });

  it("compares with where you just came from", () => {
    const t = arrivalLines(BY_ID.tokyo, BY_ID.nyc, jul).find((x) => x.kind === "time").text;
    expect(t).toMatch(/Back in New York/);
    expect(t).toMatch(/cross/i);
  });

  it("says nothing about the difference when there is nowhere to compare with", () => {
    const t = arrivalLines(BY_ID.paris, null, jul).find((x) => x.kind === "time").text;
    expect(t).not.toMatch(/Back in/);
  });

  it("does not compare a place with itself", () => {
    const t = arrivalLines(BY_ID.paris, BY_ID.paris, jul).find((x) => x.kind === "time").text;
    expect(t).not.toMatch(/Back in/);
  });

  it("makes the point when the seasons swap over the equator", () => {
    const t = arrivalLines(BY_ID.sydney, BY_ID.paris, jul).find((x) => x.kind === "season").text;
    expect(t).toMatch(/winter here/);
    expect(t).toMatch(/summer in Paris/);
    expect(t).toMatch(/tilt/);
  });

  it("says the sun barely sets inside the polar circles in summer", () => {
    const t = arrivalLines(BY_ID.ilulissat, null, jul).find((x) => x.kind === "season").text;
    expect(t).toMatch(/barely sets/);
  });

  it("never claims four seasons for a tropical place", () => {
    const t = arrivalLines(BY_ID.borobudur, BY_ID.paris, jul).find((x) => x.kind === "season").text;
    expect(t).toMatch(/wet season and a dry one/);
    expect(t).not.toMatch(/It's (winter|summer|spring|autumn) here/);
  });

  it("holds up for every location, from everywhere, without throwing", () => {
    for (const l of LOCATIONS) {
      const lines = arrivalLines(l, BY_ID.nyc, jul);
      expect(lines.length, `${l.id}`).toBeGreaterThanOrEqual(2);
      for (const x of lines) expect(typeof x.text === "string" && x.text.length > 12, `${l.id}/${x.kind}`).toBe(true);
    }
  });
});
