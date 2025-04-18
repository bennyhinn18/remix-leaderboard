import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

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
      manifest: {
        id: "/",
        name: "Basher Terminal",
        short_name: "Basher Terminal",
        description: "Manage points",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        start_url: "/",
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
          }
        ],
        // screenshots: [
        //   {
        //     src: "/screenshots/screenshot1.png",
        //     sizes: "1280x720", // Wide format for desktop
        //     type: "image/png",
        //     form_factor: "wide"
        //   },
        //   {
        //     src: "/screenshots/screenshot2.png",
        //     sizes: "720x1280", // Narrow format for mobile
        //     type: "image/png",
        //     form_factor: "narrow" // or simply remove this key for mobile
        //   }
        // ]
      }
    })    
  ],
});