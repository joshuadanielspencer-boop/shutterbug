# People-photo audit — 2026-07-27

Joshua's brief: *"I want every photo of people for all countries to be one where you
can clearly see the faces of people, relatively close."*

All **118** culture photos in `src/data/culture.js` were downloaded and reviewed on
contact sheets. **Roughly 40 fail that bar.** New Zealand (Māori) has been fixed;
the rest are listed here.

## How to work through this list

1. `node scripts/commons.mjs search "<query>"` — find candidates.
2. `node scripts/commons.mjs verify "File:…"` — **required**. Copy the `src` and
   `source` it prints verbatim; never hand-type a Commons filename.
3. **Look at the photo** before committing it. Half the failures below are files
   whose title and description sound perfect.
4. Prefer **landscape**. The card is 16:9 with `object-fit: cover`; a portrait photo
   gets cropped to a band across the middle unless the entry sets `portrait: true`
   (which letterboxes it instead). Both Nicaragua and Malta were cropped across the
   eyes for exactly this reason.
5. Keep `people:` accurate — several countries carry 2–3 cards naming distinct
   communities, and the caption must match the community shown.
6. `npm test` enforces licence freedom, ≤3 cards per country, and a named `people`
   on each.

## Category A — no identifiable person at all

These are the worst: the card is meant to show the people of a country and shows
something else entirely.

| # | Country | What the photo actually is |
|---|---|---|
| 5 | Peru | a skirt on a line — no people in frame |
| 38 | Saudi Arabia | a fort at night, figures the size of pixels |
| 58 | Croatia | a long brick wall, three tiny figures at the base |
| 73 | Brazil (Kayapó) | a **conference banner** with text on it |
| 105 | Papua New Guinea | two masked figures walking away down a beach |
| 32 | Myanmar | a stadium mass-display, thousands of tiny dancers |
| 115 | Bangladesh | an aerial crowd shot |
| 109 | Malaysia (Indian Malaysian) | a night crowd, no face readable |
| 47 | France | a very large distant crowd on stadium steps |
| 52 | Portugal | night, a square full of tiny figures |
| 104 | New Caledonia | a distant field in front of a stage |

## Category B — backs of heads

The people are close enough; they are facing away.

| # | Country | |
|---|---|---|
| 46 | United Kingdom | pipe band, all from behind |
| 51 | Spain | women in flamenco dresses, all from behind |
| 42 | Sri Lanka | dancers from behind |
| 67 | United States (Native American) | jingle dancers from behind |
| 16 | Tanzania | one person, from behind |

## Category C — too far, too dark, or too blurred

| # | Country | |
|---|---|---|
| 7 | New Zealand (Māori) | ✅ **FIXED** — was a 1943 B&W group shot |
| 8 | New Zealand (Samoan) | distant stage |
| 19 | Mali | very distant crowd |
| 23 | Madagascar | distant crowd |
| 29 | Nepal | distant line-up |
| 63 | Cuba | distant street scene |
| 50 | Germany | distant procession |
| 113 | Denmark | shot from above, small figures |
| 55 | Switzerland | mid-distance group |
| 68 | United States (African American) | marching band, distant |
| 69 | United States (Scottish American) | crowd |
| 65 | Canada (First Nations) | heavy motion blur |
| 66 | Canada (Inuit) | dark and blurred |
| 78 | Guyana | dark and blurred |
| 22 | Zimbabwe | mid-action, face hidden |
| 94 | Nigeria (Nupe & Hausa-Fulani) | out of focus |
| 91 | Cameroon | distant crowd |
| 90 | Benin | masked, no face |
| 85 | Haiti | masks |
| 87 | Jamaica | masks |
| 40 | United Arab Emirates | mid-distance |
| 37 | Russia | stage group, faces small |
| 33 | Iran | mid-distance |
| 49 | Greece | guards, faces small and in profile |
| 45 | Mongolia | mid-distance |
| 35 | Pakistan | schoolgirls walking, faces small |
| 25 | China | crowd, faces small |
| 28 | Vietnam | a line of women, faces small |
| 31 | Cambodia | one dancer, small and dark |
| 39 | Turkey | distant dancers |
| 1 | Micronesia | dancers mid-distance, faces turned |
| 15 | South Africa (Zulu) | distant group |
| 72 | Brazil (Afro-Brazilian) | mid-distance |
| 77 | Venezuela | mid-distance |
| 60 | Norway | mid-distance |
| 74 | Chile | mid-distance |
| 54 | Belgium | faces mostly under enormous hats |

Masks (Benin, Haiti, Jamaica) are a judgement call — the mask **is** the tradition in
each case, so those may be worth keeping and are listed for completeness rather than
as certain replacements.

## The ones that already pass

For reference on what "good" looks like here: Malta, Japan, India, Morocco, Ethiopia,
Ghana, South Africa (Ndebele and Xhosa), Namibia, Rwanda, Botswana, Algeria, South
Korea, Thailand, Indonesia, Jordan, Uzbekistan, Taiwan, Singapore, Italy, Czechia,
Iceland, Guatemala, Panama, Greenland, Bolivia, Colombia, Ecuador, Australia (Torres
Strait), Nicaragua, Tunisia, Kazakhstan, Senegal, Fiji, Romania.
