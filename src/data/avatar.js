// ===========================================================================
// TRAVELER AVATAR PARTS — which plate is which, and how they stack.
//
// GENERATED FILE — do not edit by hand.
//   Regenerate with:  node scripts/build-avatar-layers.mjs
//   The art it reads lives in "Images/Avatar designs/" (outside the repo build).
//
// `ORDER` is the z-order, bottom first. `DERIVED` names the parts the player
// never picks — the brow follows the hair colour. `FOCUS` is the rectangle each
// part's ink occupies, as fractions of the plate, measured at build time: the
// editor thumbnails and the small round crops frame themselves from it.
// `swatch` is a representative colour, used only to carry pre-existing saved
// avatars onto the nearest new plate.
// ===========================================================================

export const AVATAR_BASE = "assets/shutterbug-ui/avatar-v2/";
export const AVATAR_CANVAS = 600;
export const ORDER = ["outfit","head","brow","eyes","hair"];
export const DERIVED = {"brow":"hair"};
export const FOCUS = {
  "outfit": {
    "x": 0.1733,
    "y": 0.55,
    "w": 0.7017,
    "h": 0.4417
  },
  "head": {
    "x": 0.2667,
    "y": 0.145,
    "w": 0.49,
    "h": 0.54
  },
  "brow": {
    "x": 0.3467,
    "y": 0.3033,
    "w": 0.2933,
    "h": 0.0983
  },
  "eyes": {
    "x": 0.3517,
    "y": 0.3367,
    "w": 0.29,
    "h": 0.125
  },
  "hair": {
    "x": 0.205,
    "y": 0.0717,
    "w": 0.5633,
    "h": 0.52
  }
};

export const PARTS = {
  "outfit": [
    {
      "file": "outfit_1_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a42f27",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_1_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5622b",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_1_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c19a31",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_1_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d754b",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_1_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295c98",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_1_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723e83",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_1_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#af4472",
      "style": "outfit",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "outfit_2_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53129",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_2_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5632d",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_2_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39937",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_2_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2f754c",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_2_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2b5c98",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_2_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#714184",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_2_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14973",
      "style": "outfit",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "outfit_3_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a52f27",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_3_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5622b",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_3_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29a32",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_3_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d764b",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_3_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295c99",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_3_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723e83",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_3_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b04472",
      "style": "outfit",
      "sex": "any",
      "variant": "3"
    },
    {
      "file": "outfit_4_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a52f27",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_4_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b6622b",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_4_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c49a31",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_4_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d764b",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_4_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295c99",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_4_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723e84",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_4_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b24472",
      "style": "outfit",
      "sex": "any",
      "variant": "4"
    },
    {
      "file": "outfit_5_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a52f27",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_5_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5622b",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_5_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39a31",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_5_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d764b",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_5_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295b99",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_5_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723e83",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_5_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14371",
      "style": "outfit",
      "sex": "any",
      "variant": "5"
    },
    {
      "file": "outfit_female_6_red_boleroblouse.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43028",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_red_varsity.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a03229",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_6_orange_boleroblouse.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5632c",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_orange_varsity.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#ae662d",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_6_yellow_boleroblouse.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39932",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_yellow_varsity.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#bb9836",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_6_green_boleroblouse.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764b",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_green_varsity.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#30744e",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_6_blue_boleroblouse.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5c98",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_blue_varsity.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2c5f90",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_6_purple_boleroblouse.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#733f83",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_purple_varsity.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#75427f",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_6_pink_boleroblouse.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14571",
      "style": "boleroblouse",
      "sex": "female",
      "variant": "6"
    },
    {
      "file": "outfit_male_6_pink_varsity.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#ab4875",
      "style": "varsity",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "outfit_female_7_red_varsity.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53027",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_red_parka.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53028",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_7_orange_varsity.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b6622b",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_orange_parka.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5632c",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_7_yellow_varsity.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39a32",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_yellow_parka.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39a32",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_7_green_varsity.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d764b",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_green_parka.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764c",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_7_blue_varsity.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5c98",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_blue_parka.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5c98",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_7_purple_varsity.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723f83",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_purple_parka.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723f83",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_7_pink_varsity.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14472",
      "style": "varsity",
      "sex": "female",
      "variant": "7"
    },
    {
      "file": "outfit_male_7_pink_parka.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14571",
      "style": "parka",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "outfit_female_8_red_quilted.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a33129",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_red_bomber.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43028",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_8_orange_quilted.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b3642d",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_orange_bomber.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5622c",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_8_yellow_quilted.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c09834",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_yellow_bomber.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39a33",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_8_green_quilted.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2f744c",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_green_bomber.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764b",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_8_blue_quilted.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2b5e95",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_blue_bomber.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5b98",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_8_purple_quilted.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#744181",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_purple_bomber.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723f83",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_8_pink_quilted.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#af4772",
      "style": "quilted",
      "sex": "female",
      "variant": "8"
    },
    {
      "file": "outfit_male_8_pink_bomber.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14571",
      "style": "bomber",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "outfit_female_9_red_bowjacket.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a33128",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_red_trackjacket.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43128",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_9_orange_bowjacket.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b3632c",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_orange_trackjacket.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b4642c",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_9_yellow_bowjacket.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c19933",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_yellow_trackjacket.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29a33",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_9_green_bowjacket.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e744b",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_green_trackjacket.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764d",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_9_blue_bowjacket.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5c96",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_blue_trackjacket.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5d98",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_9_purple_bowjacket.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#724081",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_purple_trackjacket.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#734083",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_9_pink_bowjacket.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#af4671",
      "style": "bowjacket",
      "sex": "female",
      "variant": "9"
    },
    {
      "file": "outfit_male_9_pink_trackjacket.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b04572",
      "style": "trackjacket",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "outfit_female_10_red_sailordress.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53028",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_red_jacket.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53128",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_10_orange_sailordress.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5642c",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_orange_jacket.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5652c",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_10_yellow_sailordress.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29b33",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_yellow_jacket.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29b33",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_10_green_sailordress.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e774d",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_green_jacket.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e774d",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_10_blue_sailordress.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5d97",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_blue_jacket.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5e97",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_10_purple_sailordress.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#744083",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_purple_jacket.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#754082",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_10_pink_sailordress.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14573",
      "style": "sailordress",
      "sex": "female",
      "variant": "10"
    },
    {
      "file": "outfit_male_10_pink_jacket.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14573",
      "style": "jacket",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "outfit_female_11_red_cardigan.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a62f27",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_red_letterman.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43028",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_11_orange_cardigan.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b6632b",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_orange_letterman.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b4642c",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_11_yellow_cardigan.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c49b31",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_yellow_letterman.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29932",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_11_green_cardigan.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d774c",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_green_letterman.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e754c",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_11_blue_cardigan.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295c99",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_blue_letterman.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5d97",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_11_purple_cardigan.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#733e84",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_purple_letterman.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#733f82",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_11_pink_cardigan.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b24471",
      "style": "cardigan",
      "sex": "female",
      "variant": "11"
    },
    {
      "file": "outfit_male_11_pink_letterman.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b04572",
      "style": "letterman",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "outfit_female_12_red_cowlsweater.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43129",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_red_fieldjacket.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53129",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_12_orange_cowlsweater.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b3652d",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_orange_fieldjacket.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b4652d",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_12_yellow_cowlsweater.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c09834",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_yellow_fieldjacket.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c19b34",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_12_green_cowlsweater.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2f754d",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_green_fieldjacket.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2f774e",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_12_blue_cowlsweater.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2b5e95",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_blue_fieldjacket.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2b5e96",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_12_purple_cowlsweater.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#734180",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_purple_fieldjacket.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#754182",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_12_pink_cowlsweater.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#af4772",
      "style": "cowlsweater",
      "sex": "female",
      "variant": "12"
    },
    {
      "file": "outfit_male_12_pink_fieldjacket.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b04773",
      "style": "fieldjacket",
      "sex": "male",
      "variant": "12"
    },
    {
      "file": "outfit_female_13_red_puffdress.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a33128",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_red_hoodedvest.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a52f27",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_13_orange_puffdress.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b4642c",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_orange_hoodedvest.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b6622b",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_13_yellow_puffdress.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c19833",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_yellow_hoodedvest.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39931",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_13_green_puffdress.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2f744c",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_green_hoodedvest.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764b",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_13_blue_puffdress.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5d95",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_blue_hoodedvest.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295c98",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_13_purple_puffdress.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#744080",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_purple_hoodedvest.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723f83",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_13_pink_puffdress.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b04670",
      "style": "puffdress",
      "sex": "female",
      "variant": "13"
    },
    {
      "file": "outfit_male_13_pink_hoodedvest.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14472",
      "style": "hoodedvest",
      "sex": "male",
      "variant": "13"
    },
    {
      "file": "outfit_female_14_red_sweatshirt.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a33127",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_red_hoodie.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43028",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_14_orange_sweatshirt.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b4632d",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_orange_hoodie.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5632c",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_14_yellow_sweatshirt.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29934",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_yellow_hoodie.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39932",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_14_green_sweatshirt.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e754c",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_green_hoodie.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764c",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_14_blue_sweatshirt.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295c97",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_blue_hoodie.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5c98",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_14_purple_sweatshirt.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#724082",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_purple_hoodie.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#733f83",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_14_pink_sweatshirt.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#af4672",
      "style": "sweatshirt",
      "sex": "female",
      "variant": "14"
    },
    {
      "file": "outfit_male_14_pink_hoodie.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14572",
      "style": "hoodie",
      "sex": "male",
      "variant": "14"
    },
    {
      "file": "outfit_female_15_red_cableknit.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43028",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_red_puffer.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53028",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_15_orange_cableknit.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5622b",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_orange_puffer.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5642c",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_15_yellow_cableknit.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39a32",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_yellow_puffer.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c29a32",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_15_green_cableknit.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764b",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_green_puffer.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764d",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_15_blue_cableknit.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295b98",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_blue_puffer.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5d96",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_15_purple_cableknit.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723f83",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_purple_puffer.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#744081",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_15_pink_cableknit.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14471",
      "style": "cableknit",
      "sex": "female",
      "variant": "15"
    },
    {
      "file": "outfit_male_15_pink_puffer.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14572",
      "style": "puffer",
      "sex": "male",
      "variant": "15"
    },
    {
      "file": "outfit_female_16_red_romper.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a53028",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_red_anorak.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a52f27",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_female_16_orange_romper.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5632c",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_orange_anorak.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5622b",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_female_16_yellow_romper.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39932",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_yellow_anorak.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39a31",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_female_16_green_romper.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e764c",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_green_anorak.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d764b",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_female_16_blue_romper.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5d98",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_blue_anorak.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295b98",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_female_16_purple_romper.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#734083",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_purple_anorak.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723e83",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_female_16_pink_romper.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14572",
      "style": "romper",
      "sex": "female",
      "variant": "16"
    },
    {
      "file": "outfit_male_16_pink_anorak.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14471",
      "style": "anorak",
      "sex": "male",
      "variant": "16"
    },
    {
      "file": "outfit_male_17_red_windbreaker.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a43027",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    },
    {
      "file": "outfit_male_17_orange_windbreaker.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b5632b",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    },
    {
      "file": "outfit_male_17_yellow_windbreaker.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#c39932",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    },
    {
      "file": "outfit_male_17_green_windbreaker.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2d764b",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    },
    {
      "file": "outfit_male_17_blue_windbreaker.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#295b98",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    },
    {
      "file": "outfit_male_17_purple_windbreaker.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#733e83",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    },
    {
      "file": "outfit_male_17_pink_windbreaker.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#b14470",
      "style": "windbreaker",
      "sex": "male",
      "variant": "17"
    }
  ],
  "head": [
    {
      "file": "head_2_deep.webp",
      "colour": "deep",
      "label": "Deep",
      "swatch": "#593621",
      "style": "head",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "head_2_dark.webp",
      "colour": "dark",
      "label": "Dark",
      "swatch": "#804f2d",
      "style": "head",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "head_2_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#af6a38",
      "style": "head",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "head_2_medium.webp",
      "colour": "medium",
      "label": "Medium",
      "swatch": "#d38a51",
      "style": "head",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "head_2_tan.webp",
      "colour": "tan",
      "label": "Tan",
      "swatch": "#fcad6e",
      "style": "head",
      "sex": "any",
      "variant": "2"
    },
    {
      "file": "head_2_light.webp",
      "colour": "light",
      "label": "Light",
      "swatch": "#f8d0ab",
      "style": "head",
      "sex": "any",
      "variant": "2"
    }
  ],
  "brow": [
    {
      "file": "brow_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1916",
      "style": "brow",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "brow_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412b1d",
      "style": "brow",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "brow_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#654224",
      "style": "brow",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "brow_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#986835",
      "style": "brow",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "brow_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d07e2c",
      "style": "brow",
      "sex": "any",
      "variant": "1"
    },
    {
      "file": "brow_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8c3918",
      "style": "brow",
      "sex": "any",
      "variant": "1"
    }
  ],
  "eyes": [
    {
      "file": "eyes_female_1_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#d09875",
      "style": "eyes",
      "sex": "female",
      "variant": "1"
    },
    {
      "file": "eyes_male_1_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#753d1b",
      "style": "eyes",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "eyes_female_1_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2776af",
      "style": "eyes",
      "sex": "female",
      "variant": "1"
    },
    {
      "file": "eyes_male_1_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#216494",
      "style": "eyes",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "eyes_female_1_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#29823f",
      "style": "eyes",
      "sex": "female",
      "variant": "1"
    },
    {
      "file": "eyes_male_1_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#226a34",
      "style": "eyes",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "eyes_female_1_hazel.webp",
      "colour": "hazel",
      "label": "Hazel",
      "swatch": "#828233",
      "style": "eyes",
      "sex": "female",
      "variant": "1"
    },
    {
      "file": "eyes_male_1_hazel.webp",
      "colour": "hazel",
      "label": "Hazel",
      "swatch": "#6c6b2b",
      "style": "eyes",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "eyes_female_1_amber.webp",
      "colour": "amber",
      "label": "Amber",
      "swatch": "#e99f0e",
      "style": "eyes",
      "sex": "female",
      "variant": "1"
    },
    {
      "file": "eyes_male_1_amber.webp",
      "colour": "amber",
      "label": "Amber",
      "swatch": "#c8880c",
      "style": "eyes",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "eyes_female_1_grey.webp",
      "colour": "grey",
      "label": "Grey",
      "swatch": "#5f7380",
      "style": "eyes",
      "sex": "female",
      "variant": "1"
    },
    {
      "file": "eyes_male_1_grey.webp",
      "colour": "grey",
      "label": "Grey",
      "swatch": "#52626d",
      "style": "eyes",
      "sex": "male",
      "variant": "1"
    }
  ],
  "hair": [
    {
      "file": "hair_male_1_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201d1b",
      "style": "hair",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "hair_male_1_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#46301f",
      "style": "hair",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "hair_male_1_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6a4625",
      "style": "hair",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "hair_male_1_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9d6d3a",
      "style": "hair",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "hair_male_1_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d77b30",
      "style": "hair",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "hair_male_1_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#923d19",
      "style": "hair",
      "sex": "male",
      "variant": "1"
    },
    {
      "file": "hair_male_2_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1d1a17",
      "style": "hair",
      "sex": "male",
      "variant": "2"
    },
    {
      "file": "hair_male_2_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#442c1c",
      "style": "hair",
      "sex": "male",
      "variant": "2"
    },
    {
      "file": "hair_male_2_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#684322",
      "style": "hair",
      "sex": "male",
      "variant": "2"
    },
    {
      "file": "hair_male_2_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9c6933",
      "style": "hair",
      "sex": "male",
      "variant": "2"
    },
    {
      "file": "hair_male_2_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d68a37",
      "style": "hair",
      "sex": "male",
      "variant": "2"
    },
    {
      "file": "hair_male_2_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#903916",
      "style": "hair",
      "sex": "male",
      "variant": "2"
    },
    {
      "file": "hair_male_3_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1e1916",
      "style": "hair",
      "sex": "male",
      "variant": "3"
    },
    {
      "file": "hair_male_3_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#442c1b",
      "style": "hair",
      "sex": "male",
      "variant": "3"
    },
    {
      "file": "hair_male_3_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#694221",
      "style": "hair",
      "sex": "male",
      "variant": "3"
    },
    {
      "file": "hair_male_3_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9d6930",
      "style": "hair",
      "sex": "male",
      "variant": "3"
    },
    {
      "file": "hair_male_3_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d98d39",
      "style": "hair",
      "sex": "male",
      "variant": "3"
    },
    {
      "file": "hair_male_3_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#913816",
      "style": "hair",
      "sex": "male",
      "variant": "3"
    },
    {
      "file": "hair_male_4_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201a15",
      "style": "hair",
      "sex": "male",
      "variant": "4"
    },
    {
      "file": "hair_male_4_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#482b1a",
      "style": "hair",
      "sex": "male",
      "variant": "4"
    },
    {
      "file": "hair_male_4_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6e4220",
      "style": "hair",
      "sex": "male",
      "variant": "4"
    },
    {
      "file": "hair_male_4_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a4692d",
      "style": "hair",
      "sex": "male",
      "variant": "4"
    },
    {
      "file": "hair_male_4_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#e19541",
      "style": "hair",
      "sex": "male",
      "variant": "4"
    },
    {
      "file": "hair_male_4_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#973616",
      "style": "hair",
      "sex": "male",
      "variant": "4"
    },
    {
      "file": "hair_male_5_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1e1a16",
      "style": "hair",
      "sex": "male",
      "variant": "5"
    },
    {
      "file": "hair_male_5_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#452d1c",
      "style": "hair",
      "sex": "male",
      "variant": "5"
    },
    {
      "file": "hair_male_5_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6a4424",
      "style": "hair",
      "sex": "male",
      "variant": "5"
    },
    {
      "file": "hair_male_5_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9e6b35",
      "style": "hair",
      "sex": "male",
      "variant": "5"
    },
    {
      "file": "hair_male_5_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#b17c29",
      "style": "hair",
      "sex": "male",
      "variant": "5"
    },
    {
      "file": "hair_male_5_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#923b1c",
      "style": "hair",
      "sex": "male",
      "variant": "5"
    },
    {
      "file": "hair_male_6_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211c18",
      "style": "hair",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "hair_male_6_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#482f1b",
      "style": "hair",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "hair_male_6_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6e4723",
      "style": "hair",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "hair_male_6_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a36f36",
      "style": "hair",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "hair_male_6_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#b68631",
      "style": "hair",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "hair_male_6_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#973d1a",
      "style": "hair",
      "sex": "male",
      "variant": "6"
    },
    {
      "file": "hair_male_7_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211c18",
      "style": "hair",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "hair_male_7_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#482f1a",
      "style": "hair",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "hair_male_7_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6e4623",
      "style": "hair",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "hair_male_7_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a36e34",
      "style": "hair",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "hair_male_7_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#b07c2f",
      "style": "hair",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "hair_male_7_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#973c1b",
      "style": "hair",
      "sex": "male",
      "variant": "7"
    },
    {
      "file": "hair_male_8_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#221c18",
      "style": "hair",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "hair_male_8_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#4a2f1e",
      "style": "hair",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "hair_male_8_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#704727",
      "style": "hair",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "hair_male_8_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a66f35",
      "style": "hair",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "hair_male_8_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#b07722",
      "style": "hair",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "hair_male_8_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#9a3c1d",
      "style": "hair",
      "sex": "male",
      "variant": "8"
    },
    {
      "file": "hair_male_9_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201c19",
      "style": "hair",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "hair_male_9_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#46301a",
      "style": "hair",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "hair_male_9_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6b471e",
      "style": "hair",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "hair_male_9_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9f6f36",
      "style": "hair",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "hair_male_9_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#c49037",
      "style": "hair",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "hair_male_9_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#943e15",
      "style": "hair",
      "sex": "male",
      "variant": "9"
    },
    {
      "file": "hair_male_10_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211d1a",
      "style": "hair",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "hair_male_10_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#48301d",
      "style": "hair",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "hair_male_10_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6e4821",
      "style": "hair",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "hair_male_10_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a27038",
      "style": "hair",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "hair_male_10_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#cf953a",
      "style": "hair",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "hair_male_10_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#973f16",
      "style": "hair",
      "sex": "male",
      "variant": "10"
    },
    {
      "file": "hair_male_11_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201c19",
      "style": "hair",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "hair_male_11_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#472f1b",
      "style": "hair",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "hair_male_11_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6c4723",
      "style": "hair",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "hair_male_11_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a06f39",
      "style": "hair",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "hair_male_11_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#b98733",
      "style": "hair",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "hair_male_11_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#953e1b",
      "style": "hair",
      "sex": "male",
      "variant": "11"
    },
    {
      "file": "hair_female_a_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1916",
      "style": "hair",
      "sex": "female",
      "variant": "a"
    },
    {
      "file": "hair_female_a_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412b1d",
      "style": "hair",
      "sex": "female",
      "variant": "a"
    },
    {
      "file": "hair_female_a_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#654224",
      "style": "hair",
      "sex": "female",
      "variant": "a"
    },
    {
      "file": "hair_female_a_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#986835",
      "style": "hair",
      "sex": "female",
      "variant": "a"
    },
    {
      "file": "hair_female_a_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d07e2c",
      "style": "hair",
      "sex": "female",
      "variant": "a"
    },
    {
      "file": "hair_female_a_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8c3918",
      "style": "hair",
      "sex": "female",
      "variant": "a"
    },
    {
      "file": "hair_female_b_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1916",
      "style": "hair",
      "sex": "female",
      "variant": "b"
    },
    {
      "file": "hair_female_b_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#422b1e",
      "style": "hair",
      "sex": "female",
      "variant": "b"
    },
    {
      "file": "hair_female_b_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#664225",
      "style": "hair",
      "sex": "female",
      "variant": "b"
    },
    {
      "file": "hair_female_b_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#996836",
      "style": "hair",
      "sex": "female",
      "variant": "b"
    },
    {
      "file": "hair_female_b_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#cb7928",
      "style": "hair",
      "sex": "female",
      "variant": "b"
    },
    {
      "file": "hair_female_b_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8d3919",
      "style": "hair",
      "sex": "female",
      "variant": "b"
    },
    {
      "file": "hair_female_c_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1815",
      "style": "hair",
      "sex": "female",
      "variant": "c"
    },
    {
      "file": "hair_female_c_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412b1d",
      "style": "hair",
      "sex": "female",
      "variant": "c"
    },
    {
      "file": "hair_female_c_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#664125",
      "style": "hair",
      "sex": "female",
      "variant": "c"
    },
    {
      "file": "hair_female_c_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9a6835",
      "style": "hair",
      "sex": "female",
      "variant": "c"
    },
    {
      "file": "hair_female_c_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#c27122",
      "style": "hair",
      "sex": "female",
      "variant": "c"
    },
    {
      "file": "hair_female_c_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8d381a",
      "style": "hair",
      "sex": "female",
      "variant": "c"
    },
    {
      "file": "hair_female_d_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1917",
      "style": "hair",
      "sex": "female",
      "variant": "d"
    },
    {
      "file": "hair_female_d_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412c1d",
      "style": "hair",
      "sex": "female",
      "variant": "d"
    },
    {
      "file": "hair_female_d_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#654224",
      "style": "hair",
      "sex": "female",
      "variant": "d"
    },
    {
      "file": "hair_female_d_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#976935",
      "style": "hair",
      "sex": "female",
      "variant": "d"
    },
    {
      "file": "hair_female_d_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d4822e",
      "style": "hair",
      "sex": "female",
      "variant": "d"
    },
    {
      "file": "hair_female_d_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8c3a18",
      "style": "hair",
      "sex": "female",
      "variant": "d"
    },
    {
      "file": "hair_female_e_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211c19",
      "style": "hair",
      "sex": "female",
      "variant": "e"
    },
    {
      "file": "hair_female_e_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#482f1e",
      "style": "hair",
      "sex": "female",
      "variant": "e"
    },
    {
      "file": "hair_female_e_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6d4625",
      "style": "hair",
      "sex": "female",
      "variant": "e"
    },
    {
      "file": "hair_female_e_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a16e34",
      "style": "hair",
      "sex": "female",
      "variant": "e"
    },
    {
      "file": "hair_female_e_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#e6a429",
      "style": "hair",
      "sex": "female",
      "variant": "e"
    },
    {
      "file": "hair_female_e_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#953c18",
      "style": "hair",
      "sex": "female",
      "variant": "e"
    },
    {
      "file": "hair_female_f_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211d1a",
      "style": "hair",
      "sex": "female",
      "variant": "f"
    },
    {
      "file": "hair_female_f_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#48301e",
      "style": "hair",
      "sex": "female",
      "variant": "f"
    },
    {
      "file": "hair_female_f_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6d4725",
      "style": "hair",
      "sex": "female",
      "variant": "f"
    },
    {
      "file": "hair_female_f_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a16f35",
      "style": "hair",
      "sex": "female",
      "variant": "f"
    },
    {
      "file": "hair_female_f_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#e8bc43",
      "style": "hair",
      "sex": "female",
      "variant": "f"
    },
    {
      "file": "hair_female_f_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#963d18",
      "style": "hair",
      "sex": "female",
      "variant": "f"
    },
    {
      "file": "hair_female_g_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211c19",
      "style": "hair",
      "sex": "female",
      "variant": "g"
    },
    {
      "file": "hair_female_g_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#472f1e",
      "style": "hair",
      "sex": "female",
      "variant": "g"
    },
    {
      "file": "hair_female_g_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6c4624",
      "style": "hair",
      "sex": "female",
      "variant": "g"
    },
    {
      "file": "hair_female_g_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a06e35",
      "style": "hair",
      "sex": "female",
      "variant": "g"
    },
    {
      "file": "hair_female_g_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#df992c",
      "style": "hair",
      "sex": "female",
      "variant": "g"
    },
    {
      "file": "hair_female_g_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#953c16",
      "style": "hair",
      "sex": "female",
      "variant": "g"
    },
    {
      "file": "hair_female_h_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201d1a",
      "style": "hair",
      "sex": "female",
      "variant": "h"
    },
    {
      "file": "hair_female_h_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#47301f",
      "style": "hair",
      "sex": "female",
      "variant": "h"
    },
    {
      "file": "hair_female_h_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6c4727",
      "style": "hair",
      "sex": "female",
      "variant": "h"
    },
    {
      "file": "hair_female_h_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9f6f36",
      "style": "hair",
      "sex": "female",
      "variant": "h"
    },
    {
      "file": "hair_female_h_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#e8a71a",
      "style": "hair",
      "sex": "female",
      "variant": "h"
    },
    {
      "file": "hair_female_h_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#943e1b",
      "style": "hair",
      "sex": "female",
      "variant": "h"
    },
    {
      "file": "hair_female_i_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201d1b",
      "style": "hair",
      "sex": "female",
      "variant": "i"
    },
    {
      "file": "hair_female_i_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#463020",
      "style": "hair",
      "sex": "female",
      "variant": "i"
    },
    {
      "file": "hair_female_i_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6a4727",
      "style": "hair",
      "sex": "female",
      "variant": "i"
    },
    {
      "file": "hair_female_i_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9d6f3a",
      "style": "hair",
      "sex": "female",
      "variant": "i"
    },
    {
      "file": "hair_female_i_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#de9e27",
      "style": "hair",
      "sex": "female",
      "variant": "i"
    },
    {
      "file": "hair_female_i_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#933f1a",
      "style": "hair",
      "sex": "female",
      "variant": "i"
    },
    {
      "file": "hair_female_j_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#221c18",
      "style": "hair",
      "sex": "female",
      "variant": "j"
    },
    {
      "file": "hair_female_j_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#492f1e",
      "style": "hair",
      "sex": "female",
      "variant": "j"
    },
    {
      "file": "hair_female_j_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6f4725",
      "style": "hair",
      "sex": "female",
      "variant": "j"
    },
    {
      "file": "hair_female_j_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a46f34",
      "style": "hair",
      "sex": "female",
      "variant": "j"
    },
    {
      "file": "hair_female_j_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#f3c339",
      "style": "hair",
      "sex": "female",
      "variant": "j"
    },
    {
      "file": "hair_female_j_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#983c1a",
      "style": "hair",
      "sex": "female",
      "variant": "j"
    },
    {
      "file": "hair_female_k_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#211d19",
      "style": "hair",
      "sex": "female",
      "variant": "k"
    },
    {
      "file": "hair_female_k_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#48301f",
      "style": "hair",
      "sex": "female",
      "variant": "k"
    },
    {
      "file": "hair_female_k_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6d4726",
      "style": "hair",
      "sex": "female",
      "variant": "k"
    },
    {
      "file": "hair_female_k_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a16f36",
      "style": "hair",
      "sex": "female",
      "variant": "k"
    },
    {
      "file": "hair_female_k_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#e5aa32",
      "style": "hair",
      "sex": "female",
      "variant": "k"
    },
    {
      "file": "hair_female_k_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#963d19",
      "style": "hair",
      "sex": "female",
      "variant": "k"
    },
    {
      "file": "hair_female_l_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#201d1b",
      "style": "hair",
      "sex": "female",
      "variant": "l"
    },
    {
      "file": "hair_female_l_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#473121",
      "style": "hair",
      "sex": "female",
      "variant": "l"
    },
    {
      "file": "hair_female_l_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6b4828",
      "style": "hair",
      "sex": "female",
      "variant": "l"
    },
    {
      "file": "hair_female_l_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9f703b",
      "style": "hair",
      "sex": "female",
      "variant": "l"
    },
    {
      "file": "hair_female_l_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#dda328",
      "style": "hair",
      "sex": "female",
      "variant": "l"
    },
    {
      "file": "hair_female_l_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#94401a",
      "style": "hair",
      "sex": "female",
      "variant": "l"
    }
  ]
};
