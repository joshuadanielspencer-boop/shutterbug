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
      "swatch": "#9f2b21",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_1_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#ab5a23",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_1_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#b68d28",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_1_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e794b",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_1_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#255890",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_1_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#723c74",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_1_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#a13a5f",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a4281f",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b05a20",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#be9326",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#308552",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#235993",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#74397b",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_2_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#aa3664",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#9f2a21",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#a65620",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#ac8522",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#318150",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#265a8f",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#733c75",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_3_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#9b3158",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#a22d24",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b25f27",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#be952d",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2b784a",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#265a93",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#6f3b7d",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_4_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#ac4068",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#3a4565",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_orange.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#3e5f60",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_yellow.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#716958",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#2e6675",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2a5c8f",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_purple.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#376490",
      "style": "outfit",
      "sex": "any"
    },
    {
      "file": "outfit_5_pink.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#394a76",
      "style": "outfit",
      "sex": "any"
    }
  ],
  "head": [
    {
      "file": "head_2_deep.webp",
      "colour": "deep",
      "label": "Deep",
      "swatch": "#583620",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_2_dark.webp",
      "colour": "dark",
      "label": "Dark",
      "swatch": "#7f4f2d",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_2_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#ae6a38",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_2_medium.webp",
      "colour": "medium",
      "label": "Medium",
      "swatch": "#d28a52",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_2_tan.webp",
      "colour": "tan",
      "label": "Tan",
      "swatch": "#fbad6e",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_2_light.webp",
      "colour": "light",
      "label": "Light",
      "swatch": "#f8cfab",
      "style": "head",
      "sex": "any"
    }
  ],
  "brow": [
    {
      "file": "brow_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1814",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412a1b",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#664122",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9a6832",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#cf7e2e",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8e3818",
      "style": "brow",
      "sex": "any"
    }
  ],
  "eyes": [
    {
      "file": "eyes_female_1_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#c59373",
      "style": "eyes",
      "sex": "female"
    },
    {
      "file": "eyes_male_1_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#945326",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_female_1_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#c49272",
      "style": "eyes",
      "sex": "female"
    },
    {
      "file": "eyes_male_1_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#2f7eba",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_female_1_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#c49272",
      "style": "eyes",
      "sex": "female"
    },
    {
      "file": "eyes_male_1_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#34974c",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_female_1_hazel.webp",
      "colour": "hazel",
      "label": "Hazel",
      "swatch": "#c39170",
      "style": "eyes",
      "sex": "female"
    },
    {
      "file": "eyes_male_1_hazel.webp",
      "colour": "hazel",
      "label": "Hazel",
      "swatch": "#8d8e3d",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_female_1_amber.webp",
      "colour": "amber",
      "label": "Amber",
      "swatch": "#c39270",
      "style": "eyes",
      "sex": "female"
    },
    {
      "file": "eyes_male_1_amber.webp",
      "colour": "amber",
      "label": "Amber",
      "swatch": "#ecad27",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_female_1_grey.webp",
      "colour": "grey",
      "label": "Grey",
      "swatch": "#c49172",
      "style": "eyes",
      "sex": "female"
    },
    {
      "file": "eyes_male_1_grey.webp",
      "colour": "grey",
      "label": "Grey",
      "swatch": "#a69289",
      "style": "eyes",
      "sex": "male"
    }
  ],
  "hair": [
    {
      "file": "hair_male_1_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1f1a16",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_1_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#442d1c",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_1_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6a4423",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_1_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9e6d3a",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_1_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d17c36",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_1_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#923b1a",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_2_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1d1814",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_2_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#432b1a",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_2_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#684221",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_2_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9d6931",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_2_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d48b3a",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_2_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#903816",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_3_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1d1814",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_3_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#432a1a",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_3_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#694120",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_3_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9e692f",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_3_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d88e3b",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_3_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#913715",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_4_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1f1914",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_4_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#472b19",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_4_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#6d4220",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_4_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#a4692d",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_4_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#e09642",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_male_4_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#973516",
      "style": "hair",
      "sex": "male"
    },
    {
      "file": "hair_female_a_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1814",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_a_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412a1b",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_a_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#664122",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_a_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9a6832",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_a_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#cf7e2e",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_a_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8e3818",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_b_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1814",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_b_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412a1c",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_b_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#674123",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_b_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9b6834",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_b_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#ca7a29",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_b_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8f3819",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_c_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1a1714",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_c_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412a1c",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_c_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#664124",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_c_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9a6834",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_c_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#c17124",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_c_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8e371a",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_d_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#1c1814",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_d_dark-brown.webp",
      "colour": "dark brown",
      "label": "Dark Brown",
      "swatch": "#412b1b",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_d_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#674122",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_d_light-brown.webp",
      "colour": "light brown",
      "label": "Light Brown",
      "swatch": "#9a6832",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_d_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d38330",
      "style": "hair",
      "sex": "female"
    },
    {
      "file": "hair_female_d_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#8f3818",
      "style": "hair",
      "sex": "female"
    }
  ]
};
