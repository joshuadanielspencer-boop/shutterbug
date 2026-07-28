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
    "x": 0.1533,
    "y": 0.5667,
    "w": 0.6817,
    "h": 0.4017
  },
  "head": {
    "x": 0.2667,
    "y": 0.145,
    "w": 0.49,
    "h": 0.5767
  },
  "brow": {
    "x": 0.3467,
    "y": 0.305,
    "w": 0.2917,
    "h": 0.0967
  },
  "eyes": {
    "x": 0.3517,
    "y": 0.3367,
    "w": 0.29,
    "h": 0.125
  },
  "hair": {
    "x": 0.1767,
    "y": 0.0283,
    "w": 0.5917,
    "h": 0.4133
  }
};

export const PARTS = {
  "outfit": [
    {
      "file": "outfit_1_red_jacket.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#9b1919",
      "style": "jacket",
      "sex": "any"
    },
    {
      "file": "outfit_2_orange_jacket.webp",
      "colour": "orange",
      "label": "Orange",
      "swatch": "#b64e0f",
      "style": "jacket",
      "sex": "any"
    },
    {
      "file": "outfit_3_yellow_jacket.webp",
      "colour": "yellow",
      "label": "Yellow",
      "swatch": "#b68e17",
      "style": "jacket",
      "sex": "any"
    },
    {
      "file": "outfit_4_green_jacket.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#6b6d2a",
      "style": "jacket",
      "sex": "any"
    },
    {
      "file": "outfit_5_blue_jacket.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#1f3f9f",
      "style": "jacket",
      "sex": "any"
    },
    {
      "file": "outfit_6_purple_jacket.webp",
      "colour": "purple",
      "label": "Purple",
      "swatch": "#592979",
      "style": "jacket",
      "sex": "any"
    },
    {
      "file": "outfit_7_pink_jacket.webp",
      "colour": "pink",
      "label": "Pink",
      "swatch": "#d56494",
      "style": "jacket",
      "sex": "any"
    }
  ],
  "head": [
    {
      "file": "head_1_light_skin.webp",
      "colour": "light",
      "label": "Light",
      "swatch": "#f3d0b9",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_2_tan_skin.webp",
      "colour": "tan",
      "label": "Tan",
      "swatch": "#fbad6e",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_3_medium_skin.webp",
      "colour": "medium",
      "label": "Medium",
      "swatch": "#b58762",
      "style": "head",
      "sex": "any"
    },
    {
      "file": "head_4_dark_skin.webp",
      "colour": "dark",
      "label": "Dark",
      "swatch": "#8b6145",
      "style": "head",
      "sex": "any"
    }
  ],
  "brow": [
    {
      "file": "brow_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d19036",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#805428",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_light_chestnut.webp",
      "colour": "light chestnut",
      "label": "Light Chestnut",
      "swatch": "#89522e",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#2f2f36",
      "style": "brow",
      "sex": "any"
    },
    {
      "file": "brow_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#bd4223",
      "style": "brow",
      "sex": "any"
    }
  ],
  "eyes": [
    {
      "file": "eyes_male_blue.webp",
      "colour": "blue",
      "label": "Blue",
      "swatch": "#1d61bd",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_male_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#945326",
      "style": "eyes",
      "sex": "male"
    },
    {
      "file": "eyes_male_green.webp",
      "colour": "green",
      "label": "Green",
      "swatch": "#338630",
      "style": "eyes",
      "sex": "male"
    }
  ],
  "hair": [
    {
      "file": "hair_1_blonde.webp",
      "colour": "blonde",
      "label": "Blonde",
      "swatch": "#d19036",
      "style": "hair",
      "sex": "any"
    },
    {
      "file": "hair_2_brown.webp",
      "colour": "brown",
      "label": "Brown",
      "swatch": "#805428",
      "style": "hair",
      "sex": "any"
    },
    {
      "file": "hair_3_light_chestnut.webp",
      "colour": "light chestnut",
      "label": "Light Chestnut",
      "swatch": "#89522e",
      "style": "hair",
      "sex": "any"
    },
    {
      "file": "hair_4_black.webp",
      "colour": "black",
      "label": "Black",
      "swatch": "#2f2f36",
      "style": "hair",
      "sex": "any"
    },
    {
      "file": "hair_5_red.webp",
      "colour": "red",
      "label": "Red",
      "swatch": "#bd4223",
      "style": "hair",
      "sex": "any"
    }
  ]
};
