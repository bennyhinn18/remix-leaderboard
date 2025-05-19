import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import fs from 'fs';
import path from 'path';

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

// Custom plugin to add gcm_sender_id to the manifest.json after it's generated
const addGcmSenderIdPlugin = () => {
  return {
    name: 'add-gcm-sender-id',
    closeBundle: {
      sequential: true,
      handler: async () => {
        try {
          const manifestPath = path.resolve(__dirname, 'dist/manifest.webmanifest');
          
          if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Add the gcm_sender_id
            manifest.gcm_sender_id = "103953800507";
            
            // Write the modified manifest back
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            console.log('Added gcm_sender_id to manifest.webmanifest');
          }
        } catch (error) {
          console.error('Error modifying manifest.webmanifest:', error);
        }
      }
    }
  };
};

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      strategies: "generateSW",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico}"],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Enable push notifications in the service worker
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        id: "/",
        name: "Basher Terminal",
        short_name: "Basher Terminal",
        description: "Track coding journey, earn points, and climb the leaderboard with Byte Bash Blitz",
        theme_color: "#111827", // Dark blue/gray to match app's background
        background_color: "#111827", // Dark blue/gray background
        display: "standalone",
        display_override: ["window-controls-overlay"],
        orientation: "any", // Support both portrait and landscape
        start_url: "/",
        categories: ["productivity", "education", "social"],
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        screenshots: [
          {
            src: "/screenshots/desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "/screenshots/mobile.png",
            sizes: "720x1280",
            type: "image/png",
            form_factor: "narrow"
          }
        ],
        related_applications: []
      }
    }),
    addGcmSenderIdPlugin()
  ],
});
   