import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Served from the domain root by default (Netlify, a user.github.io site, a
// custom domain). For a GitHub Pages PROJECT site served under /<repo>/, the
// deploy workflow sets BASE_PATH=/<repo>/ so all asset URLs — and the PWA scope
// and icon paths — get that prefix.
const base = process.env.BASE_PATH || "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  build: {
    // Split the bundle so React, the (large) map-outline data, the location
    // catalogue, and the rest of the content each land in their own chunk. This
    // improves browser caching (editing a fact no longer re-downloads React) and,
    // together with the lazy map load, keeps the country-outline data out of the
    // first paint. The data chunks are legitimately large text (path strings,
    // facts), so the warning limit is raised to reflect that — it isn't bloat.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.includes("react") ? "react-vendor" : "vendor";
          }
          // worldmap-robinson is dynamically imported for the world map — leave it
          // unassigned so Rollup emits it as its own async chunk (kept out of first
          // paint). Must come BEFORE the worldmap.js / catch-all rules below.
          if (id.includes("/src/data/worldmap-robinson")) return;
          if (id.includes("/src/data/worldmap.js")) return "mapdata";
          if (id.includes("/src/data/locations")) return "locations";
          if (id.includes("/src/data/")) return "content";
        },
      },
    },
  },
  plugins: [
    react(),
    // Turn the built app into an installable, offline-capable PWA so it can run
    // on an iPad or desktop without a dev server. The app shell, the relief map
    // plates, and the icons are precached; landmark photos from Wikimedia are
    // cached on first view so places you've visited work offline afterwards.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto", // injects the service-worker registration for us
      includeAssets: ["favicon-32x32.png", "apple-touch-icon.png", "relief-world.jpg", "relief-antarctica.jpg"],
      manifest: {
        name: "Shutterbug — A World Photo Safari",
        short_name: "Shutterbug",
        description: "A geography photo safari: read the clue, fly to the right place, and photograph the right subject before your travel days run out.",
        lang: "en",
        theme_color: "#0E4A56",
        background_color: "#b09669",
        display: "standalone",
        orientation: "any",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the app shell + local assets. The world relief plate is the
        // biggest single file — ~4.4 MB at 12288px wide (regenerated from Natural
        // Earth so small countries like Jordan aren't a pixel mush at high zoom).
        // The per-file cap must stay above it or it silently drops from the offline
        // precache and those maps go blank on an installed iPad with no network.
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // Activate a new service worker as soon as it's installed instead of
        // waiting for every tab to close. Without this, a returning player kept
        // seeing precached OLD art (the recast is what surfaced it) until they
        // fully quit the app. With clientsClaim above, the fresh SW then takes
        // over the open page and its updated precache serves the new assets.
        skipWaiting: true,
        runtimeCaching: [
          {
            // Landmark photos come from Wikimedia (commons → upload.wikimedia.org).
            // Cache-first so a place you've photographed once is available offline.
            urlPattern: ({ url }) =>
              url.hostname === "upload.wikimedia.org" || url.hostname === "commons.wikimedia.org",
            handler: "CacheFirst",
            options: {
              cacheName: "landmark-photos",
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
