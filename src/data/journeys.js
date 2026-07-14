// ===========================================================================
// JOURNEYS — themed, ORDERED routes. You retrace a real expedition stop by stop,
// in the order it actually happened, and each stop teaches what happened there.
//
// Different from a Grand Tour (where the whole game is choosing the order) and
// from Assignments (where the game is deducing the place). Here the order is the
// story, and you can't skip ahead: the point is the shape of the journey.
//
// SOURCING (project rule 2). Every stop's coordinates come from that place's
// Wikipedia article via the MediaWiki API — not eyeballed off a map — and each
// stop carries the article it came from so it can be re-checked. Facts are kept
// to the plainly documented spine of the expedition (where they wintered, what
// they crossed, when), not the contested details.
//
// ⚠ A NOTE FOR FUTURE ROUTES: this one is safe because it is exhaustively
// documented and nobody disputes where Fort Mandan was. Other routes on the wish
// list are NOT like that — the Exodus route and the location of Mount Sinai are
// genuinely contested, and Paul's journeys have some uncertain stops. When those
// are added, each stop needs a `certainty` of "documented" or "traditional", and
// the card must SAY which. Do not quietly present a traditional site as a fact.
//
// Coordinates are stored as real lat/lon AND as the game's map space
// (x = lon + 180, y = 90 − lat), the same space the relief plate uses.
// ===========================================================================

const at = (lat, lon) => ({ lat, lon, x: lon + 180, y: 90 - lat });

export const JOURNEYS = [
  {
    id: "lewis-clark",
    title: "Lewis & Clark",
    emoji: "🛶",
    era: "1804–1806",
    region: "North America",
    // The lesson shown before the first stop.
    intro: "In 1804 the United States had just bought a vast territory it had never seen. "
      + "Meriwether Lewis and William Clark were sent to walk and paddle across it — up the "
      + "Missouri River, over the Rocky Mountains, and on to the Pacific — and to write down "
      + "everything. They were looking for a river route across the continent. There isn't one. "
      + "Follow their trail west, stop by stop.",
    source: "https://en.wikipedia.org/wiki/Lewis_and_Clark_Expedition",
    stops: [
      {
        id: "camp-dubois", name: "Camp Dubois", place: "Wood River, Illinois", when: "Winter 1803–04",
        ...at(38.80272, -90.10125),
        prompt: "Where the journey began: the camp where the expedition spent the winter training, waiting for the river ice to break.",
        fact: "Camp Dubois, on the Illinois bank opposite the mouth of the Missouri, was the expedition's winter camp and its launch point. They spent the winter drilling, gathering supplies, and waiting for spring.",
        source: "https://en.wikipedia.org/wiki/Camp_Dubois",
      },
      {
        id: "fort-mandan", name: "Fort Mandan", place: "North Dakota", when: "Winter 1804–05",
        ...at(47.29806, -101.08722),
        prompt: "A winter fort beside Mandan and Hidatsa villages, where the expedition sat out months of deep cold — and where a young Shoshone woman joined them.",
        fact: "The expedition built Fort Mandan to winter over in 1804–05, beside the Mandan and Hidatsa villages. Here they hired the interpreter Toussaint Charbonneau, and with him came his wife Sacagawea, a Shoshone woman whose knowledge and presence would prove vital.",
        source: "https://en.wikipedia.org/wiki/Fort_Mandan",
      },
      {
        id: "great-falls", name: "The Great Falls", place: "Montana", when: "Summer 1805",
        ...at(47.57, -111.12306),
        prompt: "A staircase of waterfalls on the Missouri. They expected a half-day carry around it. It took a month.",
        fact: "At the Great Falls of the Missouri the river drops over a series of waterfalls. The expedition had to carry its boats and cargo roughly 18 miles (29 km) overland around them — a portage they thought would take a day, and which took nearly a month.",
        source: "https://en.wikipedia.org/wiki/Great_Falls_(Missouri_River)",
      },
      {
        id: "lemhi-pass", name: "Lemhi Pass", place: "Idaho / Montana", when: "August 1805",
        ...at(44.97417, -113.445),
        prompt: "The crest of the continent. They climbed it hoping to look down on a river running west to the sea.",
        fact: "At Lemhi Pass, about 7,373 feet (2,247 m) up in the Bitterroot Range, the expedition crossed the Continental Divide. They had hoped to find an easy water route to the Pacific on the far side. Instead they saw more mountains — proof that no such river crossing exists.",
        source: "https://en.wikipedia.org/wiki/Lemhi_Pass",
      },
      {
        id: "lolo-pass", name: "Lolo Pass", place: "Idaho / Montana", when: "September 1805",
        ...at(46.635, -114.58),
        prompt: "The hardest miles of the whole journey: a snowbound crossing of the Bitterroots, on the edge of starvation.",
        fact: "Crossing the Bitterroot Mountains by the Lolo Pass route in September 1805 nearly destroyed the expedition. Caught in early snow with almost nothing to eat, they came down the far side starving, and were fed by the Nez Perce.",
        source: "https://en.wikipedia.org/wiki/Lolo_Pass_(Idaho%E2%80%93Montana)",
      },
      {
        id: "cape-disappointment", name: "Cape Disappointment", place: "Washington", when: "November 1805",
        ...at(46.28972, -124.06056),
        prompt: "The end of the westward road — a headland where the great river finally meets the open ocean.",
        fact: "In November 1805 the expedition reached the Pacific at the mouth of the Columbia River, near Cape Disappointment — the goal of the whole journey, and roughly 4,000 miles (6,400 km) from where they set out. They wintered nearby at Fort Clatsop and turned for home in the spring, having proved there is no river route across the continent.",
        source: "https://en.wikipedia.org/wiki/Cape_Disappointment_(Washington)",
      },
    ],
  },
];

export const JOURNEY_BY_ID = Object.fromEntries(JOURNEYS.map((j) => [j.id, j]));

// The map window for a journey: the box holding every stop, with a margin so no
// pin sits on the frame's edge. Sized to the FRAME's aspect ratio, because an SVG
// clips to its viewport and not to its viewBox — a box whose shape doesn't match
// the frame gets letterboxed, and the relief plate then spills into the letterbox,
// showing a chunk of map that isn't part of the journey at all.
export function journeyBox(journey, aspect = 1.7, pad = 0.12) {
  const xs = journey.stops.map((s) => s.x), ys = journey.stops.map((s) => s.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const w = Math.max(x1 - x0, (y1 - y0) * aspect) * (1 + 2 * pad);
  const h = w / aspect;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

// The closest two stops on a route, in degrees. A route whose stops sit on top of
// one another is unplayable — you cannot click the pin you mean — so this is
// asserted in the tests rather than left to be discovered on the map.
export function closestStops(journey) {
  let min = Infinity;
  for (let i = 0; i < journey.stops.length; i++)
    for (let k = i + 1; k < journey.stops.length; k++) {
      const a = journey.stops[i], b = journey.stops[k];
      min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y));
    }
  return min;
}
