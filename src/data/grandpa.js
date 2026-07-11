// ===========================================================================
// GRANDPA NIGEL — the story voice
//
// Every word Grandpa Nigel says lives here (CLAUDE.md rule 1): the opening
// story, his framing labels, and his reactions. Components render these
// strings; they hold no dialogue of their own, so his voice can be tuned in
// one place.
//
// TONE: warm, old-school, gently funny — never morbid. He is frail but
// delighted, never fading or sad. The lessons woven through his story —
// respect for your elders, making the most of your time while you have it,
// the pull of family, and doing things the real way instead of through a
// screen — stay IMPLICIT. Never state them outright; let the story carry them.
//
// FACT RULE (rule 2): any anecdote that teaches a real detail about a place
// must be verified like every other fact. Grandpa's humour is in the delivery,
// never in invented facts. (Per-location anecdotes are added alongside the
// content research; this file holds only his voice-level, non-factual lines.)
// ===========================================================================

export const GRANDPA = {
  name: "Grandpa Nigel",
  short: "Grandpa",
  emoji: "👴",
};

// Shown once, the first time a traveller sets out. Each entry is one beat,
// revealed at reading speed; keep each short enough to read in one breath.
export const INTRO_BEATS = [
  "Come in, come in — pull up a chair beside me a moment.",
  "All my life I dreamed of seeing the world. I saved every spare coin for it… and somehow the years slipped by, and I never did go. These old legs won't carry me far now.",
  "But you — you've got young legs and a sharp pair of eyes. So here's my plan, if you'll hear an old man out.",
  "Take my camera. It's older than your mother and it uses real film, so you'll want to make every shot count. No telephones, no glowing screens — just you, the wide world, and this.",
  "Go and photograph the great places I only ever read about. Then hurry home and show me every single picture, and tell me all about it.",
  "Off you go, then. Bring me back the world.",
];

// A shorter send-off shown before later expeditions (once he already knows you).
export const SENDOFF_BEATS = [
  "Back for more, are you? Good. Grab the camera.",
  "I've been thinking about the next place I'd love to see…",
];

// Replaces the old newspaper 'telegram from the editor' header.
export const NOTE_HEADER = "✎ A NOTE FROM GRANDPA NIGEL";

// His name for the ½-day hint (was 'the newsroom').
export const GUIDEBOOK = {
  button: "Check Grandpa's guidebook",
  tipFree: "Thumb through Grandpa's old guidebook — free on Easy",
  tipCost: "Thumb through Grandpa's old guidebook for a strong hint (½ travel day)",
  notesLabel: "From Grandpa's guidebook:",
};

// The homecoming visit — when you return and he asks about your trip.
// (Wired into the end-of-expedition quiz in a later pass.)
export const HOMECOMING_INTRO =
  "Well, look who's home! Sit, sit. Now — tell me what you saw out there. I've a few questions for you…";

// Gentle reactions when a homecoming answer is wrong (pick one at random).
// Kind, a little rueful, never harsh — and never rewarding.
export const WRONG_REACTIONS = [
  "Hah — my memory's gone fuzzy on that one too. No matter.",
  "Close! These old eyes have muddled those up before now.",
  "Ah well. We'll call that one a practice shot, eh?",
  "No, not quite — but don't you fret. Even I had to learn it twice.",
];

// Lead-in when he notices you've earned a keepsake (achievement).
export const ACHIEVEMENT_INTRO = "Would you look at that —";

// The triumphant close, shown once the Dream is fulfilled (wired in a later
// pass). Warm and proud; the game keeps playing afterward.
export const DREAM_FULFILLED = [
  "You've done it. You truly have.",
  "Every place I ever dreamed of — and I've seen them all now, through your eyes and this old camera.",
  "Thank you, my dear. You gave an old man the whole wide world.",
  "Now… don't stop on my account. There's always another horizon.",
];
