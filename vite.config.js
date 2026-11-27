import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable app + offline copy of the app shell. API responses are personal
    // data on another origin and are deliberately never cached.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'SIU One',
        short_name: 'SIU One',
        description: 'The academic portal of Seven International University.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#091b13',
        background_color: '#091b13',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpeg}'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  // The API allows this origin (CORS_ORIGIN), so don't drift to another port.
  preview: { port: 4173, strictPort: true },
})
