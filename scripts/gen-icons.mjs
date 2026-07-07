// Rasterize the app icon (assets-src/icon.svg) into the PNG sizes the PWA
// manifest and iOS need. Re-run with `node scripts/gen-icons.mjs` after editing
// the SVG. Requires the dev dependency `sharp`.
import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync(new URL("../assets-src/icon.svg", import.meta.url));
const outDir = new URL("../public/", import.meta.url);

const jobs = [
  ["pwa-192x192.png", 192],
  ["pwa-512x512.png", 512],
  ["pwa-maskable-512x512.png", 512],
  ["apple-touch-icon.png", 180],
  ["favicon-32x32.png", 32],
];

for (const [name, size] of jobs) {
  await sharp(svg, { density: 512 })
    .resize(size, size)
    .png()
    .toFile(new URL(name, outDir).pathname);
  console.log("wrote", name, `${size}x${size}`);
}
