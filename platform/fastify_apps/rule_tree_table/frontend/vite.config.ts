//@ts-nocheck
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../frontend-components/src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/~/api/rule_tree_table': {
        target: 'http://localhost:51000',
        changeOrigin: true,
      },
    },
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

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
