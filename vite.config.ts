/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_NAME } from './src/config/app.ts';

const THEME_COLOR = '#ffffff';

/**
 * @brief Replaces the `%APP_NAME%` placeholder in index.html with the central app name.
 * @returns Vite plugin.
 */
function appNameHtml(): Plugin {
  return {
    name: 'app-name-html',
    transformIndexHtml: (html) => html.replaceAll('%APP_NAME%', APP_NAME),
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    appNameHtml(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell only. Supabase (cross-origin API/Realtime) is never cached:
        // there is deliberately no runtimeCaching entry.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
  },
});
