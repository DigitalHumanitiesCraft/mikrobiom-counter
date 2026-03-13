import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '/mikrobiom-counter/',
  plugins: [
    svelte(),
    basicSsl(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Mikrobiom Counter',
        short_name: 'Mikrobiom',
        description: '30 Pflanzen pro Woche für dein Mikrobiom',
        lang: 'de',
        theme_color: '#2d6a4f',
        background_color: '#f8f9fa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/mikrobiom-counter/',
        start_url: '/mikrobiom-counter/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
