//@ts-nocheck
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { loadViteEnvDefaults } from '../../common/config/vite-env-defaults.mjs';

export default defineConfig({
  plugins: [react()],
  base: '/apps/github-file-metadata-retrieval/',
  define: loadViteEnvDefaults(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
