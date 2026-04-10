import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api/chroma-explorer': {
        target: 'http://localhost:51000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
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
