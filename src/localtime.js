// ===========================================================================
// LOCAL TIME AND SEASON — what the clock and the calendar are doing where you
// have just landed, and how that differs from where you left.
//
// The comparison is the whole point. "It's 7 in the evening in Tokyo" is a fact;
// "it's 7 in the evening here, and 4 in the morning back in Cairo — you have flown
// most of a day into the future" is geography. Same with the season: July being
// winter is not surprising until it is winter HERE and summer where you just were.
//
// Everything is derived, nothing is stored: the zone comes from data/timezones.js
// and the conversion from the runtime's own tz database, so there is no offset
// table here to go stale when a country changes its clocks.
//
// Three things this deliberately refuses to say:
//   • A clock time in Antarctica. Stations there keep whatever clock their supply
//     base keeps and the sun doesn't rise or set for months; there is no local
//     answer, so it says the true interesting thing instead of a number.
//   • "Winter" inside the tropics. Between the tropics the year doesn't divide
//     into four temperature seasons at all — it divides into wet and dry — and
//     telling a child it is winter in Singapore teaches them something false.
//   • Anything at all when the runtime can't do the conversion. An old engine that
//     throws on a zone gets silence rather than a guess.
// ===========================================================================
import { zoneFor, COUNTRY_TZ } from "./data/timezones.js";

// The countries whose own landmarks in this game sit in more than one zone. Derived
// rather than listed, so it can't drift from LOCATION_TZ. Used for a true statement
// that dodges an untrue one: the arrival popup fires when you reach a COUNTRY, before
// you've picked a city, so for Russia or the USA there is no single "the time here".
// Saying "wide enough to keep more than one clock — in Moscow it's…" is both honest
// and the more interesting fact.
export function spansZones(country, locations) {
  const zones = new Set();
  for (const l of locations) if (l.country === country) { const z = zoneFor(l); if (z) zones.add(z); }
  return zones.size > 1;
}

export const TROPIC = 23.44;   // degrees: the tropics of Cancer and Capricorn
export const POLAR = 66.56;    // degrees: the Arctic and Antarctic circles

// Latitude in degrees from a location's map coords (y = 90 − lat).
export const latOf = (loc) => 90 - loc.y;

// The parts of the local clock, or null if the place has no local clock or the
// runtime can't work it out.
export function localParts(loc, now = new Date()) {
  const zone = zoneFor(loc);
  if (!zone) return null;
  try {
    const f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true,
      weekday: "long", month: "long", day: "numeric", hourCycle: "h12",
    });
    const parts = Object.fromEntries(f.formatToParts(now).map((p) => [p.type, p.value]));
    // A separate 24-hour read, because "is everyone asleep" is a question about the
    // hour of the day and 11 PM vs 11 AM is one character apart in the 12-hour one.
    const h24 = Number(new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", hourCycle: "h23" }).format(now));
    if (!parts.hour || Number.isNaN(h24)) return null;
    return { zone, h24, weekday: parts.weekday, month: parts.month, day: parts.day,
      clock: `${parts.hour}:${parts.minute} ${parts.dayPeriod || ""}`.trim() };
  } catch {
    return null;   // an engine without this zone: say nothing rather than guess
  }
}

// What the hour FEELS like, in words a child can picture. This is the half that
// makes a time zone mean something: "4:12 AM" is a number, "everyone is asleep" is
// a fact about the other side of the world.
export function partOfDay(h24) {
  if (h24 < 5) return { word: "the middle of the night", asleep: true };
  if (h24 < 8) return { word: "early morning", asleep: false };
  if (h24 < 12) return { word: "morning", asleep: false };
  if (h24 < 14) return { word: "the middle of the day", asleep: false };
  if (h24 < 18) return { word: "afternoon", asleep: false };
  if (h24 < 21) return { word: "evening", asleep: false };
  if (h24 < 23) return { word: "late evening", asleep: false };
  return { word: "the middle of the night", asleep: true };
}

// Whole hours between two zones at this instant, from the same instant formatted
// in both — which is the only way that survives half-hour zones (India, Nepal,
// central Australia) and daylight saving.
export function hoursApart(zoneA, zoneB, now = new Date()) {
  const offset = (zone) => {
    // Format the instant as if it were local, read it back as UTC, and the
    // difference IS the offset. No offset table, no DST rules of our own.
    const s = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(now);
    const p = Object.fromEntries(s.map((x) => [x.type, x.value]));
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return (asUTC - Math.floor(now.getTime() / 1000) * 1000) / 3600000;
  };
  try { return offset(zoneA) - offset(zoneB); } catch { return null; }
}

// The season, by hemisphere and date — but only outside the tropics, where four
// seasons is a true description of the year.
const SEASON_N = ["winter", "winter", "spring", "spring", "spring", "summer",
  "summer", "summer", "autumn", "autumn", "autumn", "winter"];
export function seasonFor(loc, now = new Date()) {
  const lat = latOf(loc);
  if (Math.abs(lat) < TROPIC) return { tropical: true, season: null };
  const m = now.getUTCMonth();
  const north = SEASON_N[m];
  const flip = { winter: "summer", summer: "winter", spring: "autumn", autumn: "spring" };
  return { tropical: false, season: lat >= 0 ? north : flip[north],
    hemisphere: lat >= 0 ? "northern" : "southern" };
}

// ---------------------------------------------------------------------------
// The lines the card shows. Each is { icon, text } or absent.
// `from` is where the player just came from, and may be null on the first hop.
// ---------------------------------------------------------------------------
export function arrivalLines(loc, from = null, now = new Date()) {
  const out = [];
  const here = localParts(loc, now);
  const there = from && from.id !== loc.id ? localParts(from, now) : null;

  // ---- The clock ----
  if (!here && zoneFor(loc) === null) {
    out.push({ kind: "time", icon: "🕰️", text:
      "Nobody here can tell you the time. Antarctica has no time zone of its own — "
      + "each research station just keeps the clock of the country that flies its supplies in, "
      + "and at the Pole the sun doesn't rise or set for months anyway." });
  } else if (here) {
    const part = partOfDay(here.h24);
    let text = `It's ${here.clock} here — ${part.word}.`;
    if (there) {
      const diff = hoursApart(here.zone, there.zone, now);
      if (diff !== null && Math.abs(diff) >= 0.5) {
        const n = Math.abs(diff);
        const hrs = Number.isInteger(n) ? `${n} hour${n === 1 ? "" : "s"}`
          : `${Math.floor(n)}½ hours`;
        text += ` Back in ${from.city} it's ${there.clock} — you've crossed ${hrs} `
          + `${diff > 0 ? "east, into tomorrow's side of the world" : "west, back the way the sun goes"}.`;
      } else if (diff !== null) {
        text += ` Same clock as ${from.city} — you flew a long way without changing the time.`;
      }
      if (part.asleep && there.h24 >= 7 && there.h24 < 22) {
        text += " Everyone here is asleep while you were having your day.";
      }
    }
    out.push({ kind: "time", icon: "🕰️", text });
  }

  // ---- The season ----
  const s = seasonFor(loc, now);
  const sFrom = from && from.id !== loc.id ? seasonFor(from, now) : null;
  if (s.tropical) {
    out.push({ kind: "season", icon: "🌦️", text:
      "This close to the equator there aren't four seasons — the year is a wet season and a dry one, "
      + "and the days stay about twelve hours long all year round."
      + (sFrom && !sFrom.tropical ? ` It's ${sFrom.season} back in ${from.city}.` : "") });
  } else {
    let text = `It's ${s.season} here.`;
    if (sFrom && !sFrom.tropical && sFrom.season !== s.season) {
      text += ` You've flown from ${sFrom.season} in ${from.city} straight into ${s.season} — `
        + `crossing the equator swaps the seasons over, because it's the tilt of the Earth that makes them.`;
    } else if (sFrom && sFrom.tropical) {
      text += ` ${from.city} was too near the equator to have one.`;
    }
    if (Math.abs(latOf(loc)) > POLAR) {
      text += s.season === "summer"
        ? " And this far north or south, the sun barely sets at all in summer."
        : " And this far north or south, the sun barely rises at all in winter.";
    }
    out.push({ kind: "season", icon: "🌦️", text });
  }
  return out;
}

// ---------------------------------------------------------------------------
// The COUNTRY version, for the arrival popup — which fires when you land in a
// country, before you have chosen a city. For most countries that's the same
// thing. For the eleven that span zones it isn't, so it says so rather than
// picking one of their clocks and presenting it as "the time here".
// ---------------------------------------------------------------------------
export function countryArrivalLines(country, locations, from = null, now = new Date(), label = country) {
  const here = locations.filter((l) => l.country === country);
  if (!here.length) return [];
  // A stand-in place carrying the country's DEFAULT zone, and the mean latitude of
  // its landmarks for the season.
  const lat = here.reduce((a, l) => a + latOf(l), 0) / here.length;
  const stand = { id: `__${country}`, country, city: here[0].city, y: 90 - lat };
  const lines = arrivalLines(stand, from, now);
  if (spansZones(country, locations)) {
    const t = lines.find((l) => l.kind === "time");
    if (t) {
      // Name the city whose clock this actually is, so the number is attributable,
      // and drop the "here" that the place-level sentence opens with — "in Moscow,
      // it's 3 PM here" is not a sentence.
      const capitalish = here.find((l) => zoneFor(l) === COUNTRY_TZ[country]) || here[0];
      t.text = `${withArticle(label)} is wide enough to keep more than one clock. `
        + `In ${capitalish.city} it's ${t.text.replace(/^It's\s+/, "").replace(/\s+here\s+—/, " —")}`;
    }
  }
  return lines;
}

// Country names that take a definite article in a sentence. Without this the line
// reads "United States is wide enough…".
const THE = /^(United States|United Kingdom|United Arab Emirates|Netherlands|Philippines|Democratic Republic|Gambia|Bahamas|Solomon Islands|Czech)/;
export const withArticle = (name) => (THE.test(name) ? `The ${name}` : name);
