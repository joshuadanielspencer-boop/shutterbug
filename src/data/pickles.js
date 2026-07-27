// ===========================================================================
// PICKLES — what the dog does when you get one right.
//
// Content, so it lives here rather than in the component (rule 1).
//
// She only ever reacts to a PERFECT shot — right first time, no wrong guess — and
// she gets louder as the streak runs: one is a wag, two is a paw up, three is the
// full bouncing play-bow. Each tier used to have exactly ONE line, and since
// `perfect` is far and away the most common of the three, "Tail going like
// anything" was effectively her whole vocabulary.
//
// A NOTE ON VOICE, for whoever adds more. These are DESCRIPTIONS of a dog, not
// speech — Pickles never talks, which is why her line isn't typed out letter by
// letter like Jonah's and Mr O's. Write what a West Highland terrier actually
// does: ears, tail, paws, the whole-body wriggle, the ridiculous stiff-legged
// bounce. Keep them short enough to read in the second before the eye goes back
// to the photograph, and keep them affectionate rather than congratulatory —
// the score already says "well done", and she is meant to be a dog being pleased,
// not a second scoreboard.
// ===========================================================================

export const DOG_LINES = {
  // ONE perfect shot. The quietest of the three: a good dog noticing.
  perfect: {
    pose: "spin",
    lines: [
      "Pickles saw that one. Tail going like anything.",
      "Pickles gives a single, decisive wag. Approved.",
      "Pickles has gone stiff-legged with delight.",
      "A small woof. Pickles thinks that was well done.",
      "Pickles spins once on the spot and looks pleased with herself.",
      "Pickles's ears have gone right up. She saw exactly what you did.",
      "Pickles bumps your knee with her nose. Good shot.",
      "Pickles is doing that fast little tail-blur she does.",
      "Pickles sneezes with excitement. Coming from her, that's a compliment.",
      "Pickles trots a tight circle and sits back down, satisfied.",
      "Pickles looks from the camera to you and back, and approves of both.",
      "Pickles wriggles all over — not just the tail, the whole dog.",
    ],
  },
  // TWO in a row. She sits up and makes sure you've noticed her noticing.
  two: {
    pose: "sit",
    lines: [
      "Two in a row! Pickles is sat bolt upright, one paw up.",
      "Two! Pickles offers a paw, very formally.",
      "Two in a row — Pickles has started watching you instead of the scenery.",
      "Pickles sits up straight, paw raised, waiting to be told she's clever.",
      "Two! Pickles gives one short bark and holds the pose.",
      "Pickles plants herself in front of you, paw up, thoroughly in the way.",
      "Two in a row. Pickles's whole back end is wagging now.",
      "Pickles sits, lifts a paw, and stares at you until you look.",
      "Two! Pickles is vibrating very slightly.",
      "Pickles puts one paw on your boot. Steady on, she means. Keep going.",
    ],
  },
  // THREE perfect shots. All composure gone.
  streak: {
    pose: "bow",
    lines: [
      "Three perfect shots! Pickles is bowing and bouncing and can hardly stand it.",
      "Three! Pickles drops into a play bow and springs straight back up.",
      "Pickles has lost all composure. Three in a row will do that.",
      "Three perfect shots — Pickles is doing laps around the tripod.",
      "Pickles bows, barks, and bounces. Three! Three!",
      "Three in a row, and Pickles has gone completely daft.",
      "Pickles is bowing so low her chin is on the ground, tail up and going.",
      "Three! Pickles finds her lead and shakes it about in triumph.",
      "Pickles bounces off your leg and bows again. Three perfect shots.",
      "Three. Pickles has decided you are the finest photographer alive.",
    ],
  },
};

// Every line, for the test that keeps them short and distinct.
export const ALL_DOG_LINES = Object.values(DOG_LINES).flatMap((d) => d.lines);
