# People-photo audit — 2026-07-27

Joshua's brief: *"I want every photo of people for all countries to be one where you
can clearly see the faces of people, relatively close."*

All **118** culture photos in `src/data/culture.js` were downloaded and reviewed on
contact sheets. **51 failed that bar** — the first version of this doc said "roughly
40", which was an undercount of its own Category C table. **40 have now been
replaced.** The remaining 11 are listed at the bottom, each with what was searched
and why nothing beat what is already there.

The last nine came after Joshua relaxed the brief: *"if you can't find ones you're
happy with, then don't worry about getting traditional garb. Just a photo of typical
demographics is good."* That is what unlocked Mali, which is now four boys in Bamako
in ordinary clothes — after two rounds of searching turned up no close, free photo of
Malian traditional dress that was actually taken in Mali.

## How to work through this list

1. `node scripts/commons.mjs cat "Category:…"` beats free-text search almost every
   time — a Commons category is a human-curated answer to "photos of X people".
   Find the real category name first; a guessed one silently returns nothing.
2. `node scripts/commons.mjs verify "File:…"` — **required**. Copy the `src` and
   `source` it prints verbatim; never hand-type a Commons filename.
3. **Look at the photo, and look at it CROPPED THE WAY THE CARD CROPS IT.** This is
   the step that decides. The card is a fixed 16:9 frame with `object-fit: cover`
   and `object-position: 50% 30%` (`PeoplePhoto` in `src/shutterbug-world.jsx`), so
   what you must judge is that band, not the whole picture. Two consequences that
   are not obvious:
   - A **portrait** source whose faces sit in the upper third crops *closer* than a
     landscape one. Croatia, Greece, New Caledonia and Canada (Inuit) are all tall
     photos that deliberately do **not** set `portrait: true`, because the crop is
     the close-up. Only set `portrait: true` when cropping would cut away the thing
     the card exists to teach (Malta's hooded għonnella, the Baiana dress).
   - A photo whose subjects sit low in the frame gets **beheaded** by the 30% bias.
     A promising Ilorin durbar shot was rejected for exactly this.
4. **Source resolution is almost never the reason to reject one.** The culture card
   lives in `CountryPopup`, which is `maxWidth: 420` with 18px of popup padding and
   12px of card padding, so the photo frame is at most **360 CSS px wide** (~203 tall)
   — about 720px on a retina panel. Every `src` already asks Commons for `?width=800`.
   So a 604px source is fine and a 4480px one buys nothing; judge the crop, not the
   megapixels. Below roughly 500px it does start to soften.
5. Keep `people:` accurate — several countries carry 2–3 cards naming distinct
   communities, and the caption must match the community shown. When the only
   good photo shows a *different* community, change the caption too (Pakistan
   became Kalash; the US Native American card became Lakota shawl dancers).
6. `npm test` enforces licence freedom, ≤3 cards per country, and a named `people`
   on each. It cannot tell you whether the photo is any good.

### Two traps this audit actually fell into

- **The title and the category lie.** The best-scoring hit for German Trachten was a
  Beatles-themed Halloween party at the LBJ Library in Austin; the runner-up was in
  Poland. A "Mali" bogolan portrait was taken at the Smithsonian Folklife Festival in
  Washington DC. Nothing but looking catches these.
- **Wikimedia rate-limits a vague User-Agent.** With the old UA string,
  `upload.wikimedia.org` returned HTTP 429 after about four thumbnail fetches, which
  makes reviewing a batch nearly impossible. `scripts/commons.mjs` now sends a
  policy-compliant UA with a contact in it; 20 sequential fetches then take 11
  seconds with no 429 at all.

## Replaced (31)

**Category A — no identifiable person at all (11 of 11 done).**
Peru (was a skirt on a washing line), Saudi Arabia (a fort at night), Croatia (a
brick wall), Brazil–Kayapó (a conference banner), Papua New Guinea, Myanmar,
Bangladesh, Malaysia–Indian Malaysian, France, Portugal, New Caledonia.

**Category B — backs of heads (5 of 5 done).**
United Kingdom, Spain, Sri Lanka, United States–Native American, Tanzania.

**Category C — too far, dark or blurred (15 done).**
New Zealand–Samoan, Madagascar, Nepal, Vietnam, Cambodia, Greece,
South Africa–Zulu, Canada–Inuit, United States–African American,
United Arab Emirates, Belgium, Iran, Pakistan, Turkey, Cameroon.

Where a replacement changed what the card teaches, the loss is recorded in a comment
above the entry in `src/data/culture.js`. The notable ones: Tanzania lost the kanga
and its Swahili sayings, Madagascar lost the hira gasy, the UAE lost Al Ayyala, and
Greece lost the Evzones.

## Fixed in the second pass (9 countries)

Cuba (the Havana performer Joshua approved, cigar and all), Russia, Switzerland,
Mongolia, Mali, Brazil (Afro-Brazilian), Guyana, Venezuela, Canada (First Nations).

Where to look, since it worked: **festival-by-year categories, not costume
categories.** Commons files folk costume under 19th-century studio plates and files
the living tradition under the event — `Category:Maslenitsa in Russia, 2024`,
`Category:Alpabzug in Urnäsch`, `Category:Mashramani`, `Category:Naadam`. Every one
of the nine came from an event category.

One rejection worth keeping: the closest joropo photo found is filed by its own
uploader under `Category:Folk dance of Colombia`, and its description
("los Llanos en Colombia y Venezuela") settles nothing. Venezuela got the Diablos
Danzantes de Yare instead.

## Still failing — searched, nothing better found (8 countries)

Each of these got at least two rounds of category and free-text searching. The
existing photo is still the best freely-licensed option found.

| Country | Why nothing better | Where to look next |
|---|---|---|
| Germany | Commons' Trachten categories are historic postcards and dress-shop mannequins | `Category:Oktoberfest` by year; Munich Trachtenumzug photos |
| Denmark | same — 19th-century studio plates only | `Category:Folk dance of Denmark` by year |
| Switzerland | Appenzell material is museum vitrines and mid-distance parades | Alpabzug / Marché-Concours by year |
| Russia | every folk-costume category is pre-1917 black and white | `Category:Maslenitsa`; named modern ensembles |
| Norway | bunad categories are Hardanger postcards | `Category:Syttende mai` by year and city |
| Chile | the cueca category is almost empty | Fiestas Patrias by year |
| Zimbabwe | the Shona category is museum objects; `Category:Harare` is signage and street furniture | Jerusarema/Mbende by year |
| Micronesia | `Category:Yap` and the FSM people categories are almost entirely aid-flight and shipwreck photos | Yap Day / Pohnpei by year |

## Still failing — deliberate, and settled (3 countries)

| Country | The situation |
|---|---|
| Benin, Haiti, Jamaica | The face is behind a **mask** — Egungun, Kanaval, Jonkonnu. In each case the mask *is* the tradition, so replacing it would teach less, not more. Flagged to Joshua and **kept on purpose**. Do not "fix" these. |

Two other calls Joshua has now made, recorded so they aren't re-litigated:
- **Cuba** — the Havana performer with the lit cigar is approved and shipped.
- **Saudi Arabia** — the Ardha frame is a 2014 Saudi Press Agency photo, so King
  Salman is in the row. Approved; the caption describes the dress and the dance.

## Still open — one relabelling decision

**Nigeria (Nupe & Hausa-Fulani).** The current photo is out of focus. The two close
durbar photos found are from **Ilorin** and **Kanem-Borno** — different communities
from the card's label, so taking either means relabelling the card. The Ilorin one
also crops badly: its subjects sit low in the frame and the 16:9 crop at 50%/30%
takes their heads off.

## Tooling

The contact-sheet, card-crop and before/after scripts used for this pass live in the
session scratchpad, not the repo — they are throwaway. If another batch is needed,
the three worth rebuilding are: a grid builder that pulls a Commons category and
labels each tile by index; a renderer that applies the card's exact 16:9 / 50%-30%
crop to a candidate; and a before/after strip. The second is the one that matters.

## The ones that already pass

For reference on what "good" looks like here: Malta, Japan, India, Morocco, Ethiopia,
Ghana, South Africa (Ndebele and Xhosa), Namibia, Rwanda, Botswana, Algeria, South
Korea, Thailand, Indonesia, Jordan, Uzbekistan, Taiwan, Singapore, Italy, Czechia,
Iceland, Guatemala, Panama, Greenland, Bolivia, Colombia, Ecuador, Australia (Torres
Strait), Nicaragua, Tunisia, Kazakhstan, Senegal, Fiji, Romania, New Zealand (Māori).
