//@ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/apps/csv-datasource-hub/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5183,
    proxy: {
      '/~/api/csv-datasource': {
        target: 'http://127.0.0.1:51000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
