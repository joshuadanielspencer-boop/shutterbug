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
const LON0 = 11;

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
