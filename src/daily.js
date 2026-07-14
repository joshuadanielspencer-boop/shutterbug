// ===========================================================================
// THE DAILY EXPEDITION — one fixed run per day, the same for everybody.
//
// No server. The day number IS the seed, so two players who open the game on the
// same day get byte-for-byte the same assignments, the same decoys, the same
// order — and can compare scores honestly. Finish it and you get a little result
// string to paste to somebody.
//
// The seed folds in the DIFFICULTY as well as the day. A seven-year-old on Scout
// and an adult on Expert can't meaningfully share one run (different clue tiers,
// different day budgets, different number of shots), so each tier gets its own
// fixed run of the day — everyone on Explorer plays the identical Explorer run —
// and the share string always names the tier, so a score can't be misread.
// ===========================================================================

// Day 1 is 1 January 2025, in LOCAL time — a family playing "today's expedition"
// at breakfast means their today, not UTC's. Local also means the day flips at
// local midnight, which is the only boundary a child will ever notice.
const EPOCH = new Date(2025, 0, 1);

const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const DAY_MS = 86400000;

// Which expedition day it is. `now` is injectable so the tests aren't time bombs.
export function dayNumber(now = new Date()) {
  // Round, don't floor: daylight-saving shifts make some "days" 23 or 25 hours
  // long, and flooring those turns into an off-by-one twice a year.
  return Math.round((midnight(now) - EPOCH) / DAY_MS) + 1;
}

// The seed for a given day and tier. Everything about the run derives from this.
export const dailySeed = (day, difficulty) => `shutterbug-daily|${day}|${difficulty}`;

// A stable key for storing the result of one day's run at one tier.
export const dailyKey = (day, difficulty) => `${day}|${difficulty}`;

// How many places a daily run asks for — matched to the tier, but capped so the
// daily is always a short sitting rather than Expert's full 14-shot expedition.
export const DAILY_ASSIGNMENTS = 5;

// ---------------------------------------------------------------------------
// The share string. Deliberately spoiler-free: it says how you did, never WHERE
// you went, so posting it can't ruin the day for whoever reads it.
//
//   Shutterbug — Day 214 · Explorer
//   📸📸🟡📸⬜ — 12 pts
//   4/5 shots · 3 first-try · 2 days to spare
// ---------------------------------------------------------------------------
const MARK = { first: "📸", second: "🟡", missed: "⬜" };

export function shareText({ day, difficulty, label, score, marks, daysLeft }) {
  const filed = marks.filter((m) => m !== "missed").length;
  const perfect = marks.filter((m) => m === "first").length;
  const bits = [
    `${filed}/${marks.length} shots`,
    perfect ? `${perfect} first-try` : null,
    daysLeft > 0 ? `${tidy(daysLeft)} ${daysLeft === 1 ? "day" : "days"} to spare` : null,
  ].filter(Boolean);
  return [
    `Shutterbug — Day ${day} · ${label}`,
    `${marks.map((m) => MARK[m]).join("")} — ${tidy(score)} pts`,
    bits.join(" · "),
  ].join("\n");
}

const tidy = (n) => String(Math.round(n * 10) / 10);
