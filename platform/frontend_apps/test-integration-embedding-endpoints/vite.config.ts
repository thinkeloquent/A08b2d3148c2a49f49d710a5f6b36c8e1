//@ts-nocheck
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Base path for serving from /apps/test-integration/embedding-endpoints/
  base: '/apps/test-integration/embedding-endpoints/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5174,
  },

  build: {
    rollupOptions: {
      output: {
        // Clean filenames without hashes for predictable paths
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
