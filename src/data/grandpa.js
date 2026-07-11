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
  button: "Research Grandpa's assignment",
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

// Grandpa's word on the results screen. WIN = the trip's shots all came home;
// pick one at random, warm and proud. LOSE/short = the days ran out; pick one at
// random, always encouraging, never scolding — the door's open, try again.
export const END_WIN = [
  "Look at these! Every one a treasure. I'm proud of you — truly, deeply proud.",
  "Would you believe it — you brought them ALL home. Come here, let me shake your hand.",
  "Now THAT is a photographer's eye. I always knew you had it in you.",
  "My dear, you've outdone yourself. I'll be showing these off to everyone who visits.",
  "Perfect, just perfect. You've made an old man's whole week.",
  "Every shot landed. I couldn't have done better myself in my dreams — and I dreamed plenty.",
  "Splendid work out there! These pictures will hang on my wall for years.",
  "You did it, and you did it beautifully. That's my traveller.",
  "Oh, wonderful! It's like I went there myself, sitting right here in this chair.",
  "Bravo! A full roll and not a shot wasted. You've a real gift, you have.",
];
export const END_LOSE = [
  "Ran out of days, did you? No matter at all — look at what you DID bring back. Let's get back out there soon.",
  "Chin up, now. Every great photographer misses a few. Rest a moment, then off you go again — you can do it!",
  "That's the way of travel, my dear — it doesn't always fit the calendar. Dust off the camera and we'll try again.",
  "You gave it a good go, and that's what counts. Next time we'll plan the route a little tighter, eh?",
  "Not to worry! The world isn't going anywhere. Have a cup of tea and set off fresh — I believe in you.",
  "So the days ran short. Big deal! You learned the map a little better today. Back into the field with you!",
  "Every wrong turn teaches you something. You're getting sharper each trip — I can see it. Let's go again.",
  "Don't you dare be discouraged. I couldn't have got even THIS far. Take a breath and let's have another crack.",
];

// ---- The pre-game "meet Grandpa" screen ----------------------------------
// Before every expedition, Grandpa says one of these at random — a warm, funny,
// or gently wise one-liner. Rule 2: these carry NO factual claims about places
// (they're voice/wisdom, not geography), so they need no source-checking. Keep
// each to a breath or two.
export const MEET_LINES = [
  "A photograph is a way of holding on to a moment after it's gone. So go and catch me some good ones.",
  "You know what they say — the best camera is the one you've got with you. And you've got mine!",
  "Travel light, but never travel without your curiosity. That's the one thing you can't pack too much of.",
  "The map is not the world, laddie. You have to go and stand in it.",
  "I've read about a thousand places. You get to smell the air in them. Don't take that for granted.",
  "Getting lost is just the map's way of showing you something you didn't plan to see.",
  "A good traveller has no fixed plans and is not intent on arriving. Mind you, do watch the calendar.",
  "The whole world is a book, and those who don't travel read only a page. You're on chapter two hundred!",
  "When you meet folk who don't look like you or talk like you — that's not a wrong turn. That's the whole point.",
  "Wherever you go becomes a part of you somehow. So choose your places well.",
  "Pack a little patience next to the film. You'll need both.",
  "The wonders of the world won't come to your doorstep. Rude of them, I know. Off you pop.",
  "Photograph the thing that makes you gasp, not the thing you think you're supposed to. Your gasp is never wrong.",
  "Every great photographer took a hundred bad pictures first. Get started on yours!",
  "Between every two pine trees there's a doorway to a new world. Between every two flights, too.",
  "Don't just see the place — say its people's hello. It opens more doors than any key.",
  "The journey of a thousand miles begins with picking the right continent. No pressure.",
  "I'm too old to climb the mountain, but I can still climb it through your eyes. Show me the top.",
  "Take the picture, then put the camera down for a minute. Some things you keep in here.",
  "There are no foreign lands. It's the traveller who's foreign. Go be a delightful stranger.",
  "A ship in harbour is safe — but that's not what ships are for. Nor cameras. Nor grandchildren!",
  "Some journeys take you far away so you can appreciate coming home. But we'll do the far-away part first.",
  "If it were easy, everyone would've photographed it. The tricky ones are the trophies.",
  "Adventure is worthwhile in itself, they say. And it pairs beautifully with a good photograph.",
  "Never be so busy making a living that you forget to make a life. Or, in your case, a scrapbook.",
  "The Earth has music for those who listen — and a grand view for those who bother to fly there.",
  "You can't cross the sea merely by standing and staring at the water. Or the world map, come to that.",
  "Collect moments, not things. Though a few good photographs of things are also very welcome.",
  "Not all who wander are lost. But do glance at your travel days now and again, eh?",
  "Once a year, go somewhere you've never been before. And since you're already up — why not now?",
];
// After a saved traveller's first trip, Grandpa nods to how it went. The
// component picks a pool from the last result; each entry is a whole line.
export const MEET_RUN = {
  great: [
    "That last trip of yours? Flawless. I've told everyone at the club, whether they asked or not.",
    "You came home with every shot last time. I keep looking at them. Can you top it?",
    "After a run like your last one, I half expect you've nothing left to prove. Prove me wrong anyway.",
  ],
  good: [
    "Good work on your last trip — most of the shots came home. Let's get the rest this time.",
    "That last expedition went well! A few got away, but that's what next time is for.",
    "You're getting the hang of this. Last trip was a solid one. Onward!",
  ],
  rough: [
    "Last trip was a bit of a scramble, eh? No shame in it — the world's a big place. Fresh start.",
    "The days ran out on you last time. Happens to the best of us. Let's plan this one a touch tighter.",
    "Don't fret about last time. Every traveller has a trip that fights back. Dust off and off we go.",
  ],
  firstTime: [
    "First trip, is it? Oh, I do envy you. Nothing quite like the first time the world opens up.",
    "Your very first expedition! Take your time, read the clues, and don't forget to look up now and then.",
    "A brand-new traveller! Here — take the camera, and I'll wait right here for every story.",
  ],
};
// Grandpa's lead-in to choosing a mode + difficulty on the meet screen.
export const MEET_ASK = "Now then — what sort of adventure are we after today?";

// When the traveller has newly unlocked something, Grandpa announces it on the
// meet screen. Keyed by the unlock id (see profiles.js → unlocks()).
export const UNLOCK_LINES = {
  medium: "You've got a trip under your belt now — I reckon you're ready for a tougher clue. Medium's open to you!",
  quiz: "And here's a treat: fancy a quick Quiz between expeditions? It's yours to play now.",
  tour: "Fifteen places in the album! That's a proper photographer. The Grand Tour is open — a whole itinerary in one trip.",
  hard: "Stamps on three continents — you know your way around the globe now. If you're brave, Hard mode is unlocked. No hints, mind!",
  expeditions: "Twenty-five places! Extraordinary. I've unlocked the Themed Expeditions — curated grand tours, each with a little lesson.",
};
// When the traveller's press rank goes up, Grandpa tips his hat. Filled with the
// new rank title.
export const RANKUP_LINE = (title) => `And would you look — the paper's promoted you to ${title}! Wear it proudly.`;

// The triumphant close, shown once the Dream is fulfilled (wired in a later
// pass). Warm and proud; the game keeps playing afterward.
export const DREAM_FULFILLED = [
  "You've done it. You truly have.",
  "Every place I ever dreamed of — and I've seen them all now, through your eyes and this old camera.",
  "Thank you, my dear. You gave an old man the whole wide world.",
  "Now… don't stop on my account. There's always another horizon.",
];
