import { LOCATIONS } from "./src/data/locations.js";
console.log(Object.keys(LOCATIONS[0]).join(", "));
console.log("\nVietnam:");
for (const l of LOCATIONS.filter((l) => l.country === "Vietnam"))
  console.log(`  ${l.id.padEnd(14)} ${(l.city||"").padEnd(14)} x=${l.x} y=${l.y}`);
