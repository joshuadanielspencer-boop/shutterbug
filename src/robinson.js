// ===========================================================================
// Robinson projection — used for the world (continent-selection) map so it looks
// like a proper atlas world map (curved meridians, gently tapered poles) instead
// of a stretched rectangle. Only the WORLD map uses this; the zoomed continent
// maps stay equirectangular to line up with the Blue Marble relief imagery.
//
// The country paths in data/worldmap-robinson.js are pre-projected with the exact
// function below (see scripts note), and the same function places the city pin /
// flight markers at runtime, so map and markers share one coordinate space:
//   x ≈ 0..360 (lon 0 at 180), y ≈ 0..182.6 (lat 0 at 91.3, north up).
// ===========================================================================

// Robinson coefficients, tabulated every 5° of latitude from 0 to 90.
//   AA = relative length of the parallel, BB = relative distance from the equator.
const AA = [1, 0.9986, 0.9954, 0.99, 0.9822, 0.973, 0.96, 0.9427, 0.9216, 0.8962, 0.8679, 0.835, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322];
const BB = [0, 0.062, 0.124, 0.186, 0.248, 0.31, 0.372, 0.434, 0.4958, 0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1];

const RS = 67.5;   // scale (chosen so the map is ~360 wide at the equator)
const RX0 = 180;   // x of the prime meridian (lon 0)
const RY0 = 91.3;  // y of the equator (lat 0), north pole near y=0

// Central meridian. The world map is cropped from Hawaiʻi (~155°W) eastward all the
// way round to Russia's far east (~180°E) — a ~335° span. Centered on lon 0 that
// span wraps at the antimeridian and Russia's Chukotka appears twice (a red sliver
// on the far left). Centring on ~11°E instead puts the projection SEAM at ~169°W,
// in the empty Pacific just west of Hawaiʻi and off the left edge of the crop, so
// Russia stays a single contiguous shape on the right with nothing wrapping back.
export const LON0 = 11;

export const ROBINSON_W = 2 * 0.8487 * Math.PI * RS; // ≈ 360 (full width at equator)
export const ROBINSON_H = 2 * 1.3523 * RS;           // ≈ 182.6 (pole to pole)

// (lon°, lat°) → projected {x, y}. Linear interpolation between table rows.
export function robinson(lonRaw, lat) {
  // Shift to the central meridian, wrapped into [-180, 180].
  let lon = lonRaw - LON0;
  if (lon > 180) lon -= 360; else if (lon < -180) lon += 360;
  const a = Math.min(90, Math.abs(lat));
  const i = Math.min(17, Math.floor(a / 5));
  const f = (a - i * 5) / 5;
  const X = AA[i] + (AA[i + 1] - AA[i]) * f;
  const Y = BB[i] + (BB[i + 1] - BB[i]) * f;
  const px = 0.8487 * X * (lon * Math.PI / 180);
  const py = 1.3523 * Y * (lat < 0 ? -1 : 1);
  return { x: RX0 + px * RS, y: RY0 - py * RS };
}

// The game's equirectangular map coords (x = lon+180, y = 90−lat) → Robinson.
export const eqToRobinson = (x, y) => robinson(x - 180, 90 - y);

// Robinson {x, y} → (lon°, lat°). Needed so a click on the world map can be turned
// back into a place: the plane flies to where the player actually pointed, rather
// than snapping to the continent's canonical pin.
//
// Robinson has no closed-form inverse, but it doesn't need one. The forward map's y
// depends ONLY on latitude and decreases monotonically as latitude rises, so a
// bisection on latitude converges on it exactly; longitude is then linear in x for
// that latitude. 40 iterations puts latitude well inside floating-point noise.
export function robinsonInverse(px, py) {
  let lo = -90, hi = 90;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (robinson(LON0, mid).y > py) lo = mid; else hi = mid;
  }
  const lat = (lo + hi) / 2;
  const a = Math.min(90, Math.abs(lat));
  const i = Math.min(17, Math.floor(a / 5));
  const f = (a - i * 5) / 5;
  const X = AA[i] + (AA[i + 1] - AA[i]) * f;
  // X collapses towards the poles; guard so a click on the ice cap can't divide by
  // ~0 and hand back a longitude of several thousand degrees.
  let lon = X > 1e-6
    ? ((px - RX0) / (RS * 0.8487 * X)) * 180 / Math.PI + LON0
    : LON0;
  if (lon > 180) lon -= 360; else if (lon < -180) lon += 360;
  return { lon, lat: Math.max(-90, Math.min(90, lat)) };
}

// Robinson {x, y} → the game's equirectangular coords. The inverse of eqToRobinson.
export const robinsonToEq = (px, py) => {
  const { lon, lat } = robinsonInverse(px, py);
  return { x: lon + 180, y: 90 - lat };
};

// ---------------------------------------------------------------------------
// FLIGHT PATHS THAT GO THE SHORT WAY — including across the seam of the map.
// ---------------------------------------------------------------------------
// A flat map has an edge, and the edge is a lie: it cuts the Pacific in half.
// Drawn naively, Sydney to Los Angeles is a line straight across the screen, so
// the plane sets off WEST over Asia, Africa, Europe and the Atlantic — the long
// way round a planet it is pretending to be flat. Real aircraft cross the Pacific.
//
// So the route is worked out in longitude, where "short way" actually means
// something, and only then projected. If the short way crosses the map's seam, it
// comes back as TWO legs — one running off one edge, one arriving at the other —
// and the caller animates them back to back.
//
// The arc bows toward the nearer pole rather than being a straight screen line.
// That is not decoration: it is why a Tokyo–New York flight really does go over
// the Arctic, and on this map the bow makes that visible.
//
// Returns { legs: [[{x,y}…], …], split } where `split` is the fraction of the
// whole journey spent on the first leg (1 when there is only one).
export function flightLegs(fromX, fromY, toX, toY, { samples = 56, maxLift = 16 } = {}) {
  const lonA = fromX - 180, latA = 90 - fromY;
  const lonB = toX - 180, latB = 90 - toY;
  // The shortest way round the globe, signed: east is positive.
  const d = ((lonB - lonA + 540) % 360) - 180;
  // Where each end sits on THIS map, whose seam is half a world from LON0.
  const rel = (l) => ((l - LON0 + 540) % 360) - 180;
  const relA = rel(lonA), relB = rel(lonB);
  // The bow toward the pole, biggest on the longest hops, and toward whichever
  // pole the two ends are nearer to.
  const poleSign = (latA + latB) >= 0 ? 1 : -1;
  const liftDeg = Math.min(maxLift, Math.abs(d) * 0.11);
  const at = (t) => {
    const lat = latA + (latB - latA) * t + poleSign * liftDeg * Math.sin(Math.PI * t);
    return Math.max(-85, Math.min(85, lat));
  };
  // Does the short way run off the edge? Only if the seam falls strictly between.
  const f = d === 0 ? -1 : (180 * Math.sign(d) - relA) / d;
  const wraps = f > 1e-6 && f < 1 - 1e-6;
  const project = (relLon, lat) => robinson(relLon + LON0, lat);
  const sample = (t0, t1, r0, r1) => {
    const pts = [];
    const n = Math.max(2, Math.round(samples * Math.abs(t1 - t0)));
    for (let i = 0; i <= n; i++) {
      const u = i / n, t = t0 + (t1 - t0) * u;
      pts.push(project(r0 + (r1 - r0) * u, at(t)));
    }
    return pts;
  };
  if (!wraps) return { legs: [sample(0, 1, relA, relB)], split: 1 };
  // Stop a hair short of the seam on each side: exactly ±180 is ambiguous and
  // robinson() would wrap it to the wrong edge.
  const e = 180 * Math.sign(d) - 1e-9 * Math.sign(d);
  return { legs: [sample(0, f, relA, e), sample(f, 1, -e, relB)], split: f };
}

// A sampled leg as an SVG path.
export const legPath = (pts) =>
  pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("");
