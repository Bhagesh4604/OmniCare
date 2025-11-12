import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('.', './src'),
      },
    },
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify("http://localhost:8080")
    },
    build: {
      rollupOptions: {
        external: []
      }
    }
  }
});

