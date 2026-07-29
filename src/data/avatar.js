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
    "x": 0.1583,
    "y": 0.5,
    "w": 0.7267,
    "h": 0.4917
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
    "x": 0.35,
    "y": 0.3233,
    "w": 0.2917,
    "h": 0.1383
  },
  "hair": {
    "x": 0.0783,
    "y": 0.005,
    "w": 0.8433,
    "h": 0.775
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
    }
  ]
};
