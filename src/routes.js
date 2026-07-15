// ===========================================================================
// ROUTE MATHS — flight costs, and the Grand Tour's PAR.
//
// Pulled out of the game component so `npm test` can exercise the real routing
// rules rather than a copy of them (the same reason src/missions.js exists).
//
// This matters more than it looks. The Grand Tour scores you against par, and a
// par that isn't actually optimal is worse than no par at all: the player beats
// it by simply thinking, the "perfect route" badge means nothing, and the day
// budget — which is derived FROM par — is quietly too generous. So par is solved
// exactly, and a test proves it against brute force.
// ===========================================================================

// Great-circle distance (km) between two MAP points. Coords are x = lon + 180
// (0..360) and y = 90 − lat (0..180); the haversine below is inherently
// longitude-wrap-safe, so Pacific hops measure the short way round.
export const kmBetween = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = toRad(90 - a.y), lat2 = toRad(90 - b.y);
  const h = Math.sin(toRad(a.y - b.y) / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(toRad(b.x - a.x) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
};

// A flight's cost in travel DAYS: the great-circle distance scaled and rounded to
// the nearest HALF day, with a floor (even a short hop costs half a day) and a cap
// so no single leg is ruinous. Long hauls really do cost more than short ones.
export const FLIGHT_KM_PER_DAY = 6000;
export const flightDays = (from, to) =>
  Math.max(0.5, Math.min(3, Math.round((kmBetween(from, to) / FLIGHT_KM_PER_DAY) * 2) / 2));

const round1 = (n) => Math.round(n * 10) / 10;

// What one ORDER of continents costs to fly: hub → first → … → last.
export const routeCost = (order, pins, hub) => round1(order.reduce(
  (sum, c, i) => sum + flightDays(i ? pins[order[i - 1]] : hub, pins[c]), 0));

// PAR — the cheapest flight cost for a SET of continents, in any order, starting
// from the home airport. An open path, not a loop: the traveler doesn't fly home.
//
// This is a traveling-salesman path, and it's solved EXACTLY (branch-and-bound
// over every order) rather than greedily. A nearest-neighbor route is frequently
// beatable — which would mean the player could beat "par" by accident. At most six
// continents, so the worst case is 720 orders: instant, and correct.
export function tourPar(conts, pins, hub) {
  const best = { cost: Infinity, order: conts.slice() };
  const walk = (left, order, cost) => {
    if (cost >= best.cost) return;                      // prune: can't beat the best
    if (!left.length) { best.cost = cost; best.order = order; return; }
    const from = order.length ? pins[order[order.length - 1]] : hub;
    for (const c of left)
      walk(left.filter((x) => x !== c), [...order, c], cost + flightDays(from, pins[c]));
  };
  if (conts.length) walk(conts, [], 0);
  else best.cost = 0;
  return { cost: round1(best.cost), order: best.order };
}
