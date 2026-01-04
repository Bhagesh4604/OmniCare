
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'logo.svg'],
        manifest: {
          name: 'Omni Care',
          short_name: 'OmniCare',
          description: 'Advanced Healthcare Management System',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB to handle 3D models
          globPatterns: ['**/*.{js,css,html,ico,png,svg,glb}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-data-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24
                },
                networkTimeoutSeconds: 5
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve('.', './src'),
      },
    },
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE)
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8086',
          changeOrigin: true,
          secure: false, // Allow self-signed certs if needed
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 3000, // 3MB to silence warnings
      rollupOptions: {
        external: []
      }
    }
  }
});
