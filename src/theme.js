// ===========================================================================
// THEME — the app's palette (airmail / vintage travel-poster) and base URL.
// Defined in one place and imported everywhere so the look stays consistent.
// ===========================================================================
// Base URL the app is served from ("/" at a domain root, "/<repo>/" on a GitHub
// Pages project site). Prefix runtime asset URLs with it so the relief map plates
// resolve wherever the build is hosted. Always ends with a slash.
export const BASE = import.meta.env.BASE_URL;

export const OCEAN = "#15606E";
export const OCEAN_DEEP = "#0E4A56";
// The MAP ocean is a deeper blue (the teal above stays the UI chrome color).
// SEA_LINE is a bright gray used for the graticule and little cartoon waves.
export const SEA = "#1E4E82";
export const SEA_DEEP = "#163C64";
export const SEA_LINE = "#C4D2DC";
export const LAND = "#E7D3A1";
export const LAND_EDGE = "#C9B074";
export const INK = "#10262E";
export const GOLD = "#F0A500";
export const CORAL = "#E15C42";
export const GREEN = "#3E9B6E";
export const PAPER = "#F4ECD8";
export const PAPER_LINE = "#D8C79E";
