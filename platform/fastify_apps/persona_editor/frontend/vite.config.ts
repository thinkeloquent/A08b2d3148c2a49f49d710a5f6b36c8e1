//@ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@internal/panel-left-sidebar-menu-002': path.resolve(__dirname, '../../../frontend-components/panel-left-sidebar-menu-002/src'),
    },
  },
  server: {
    port: 3031,
    proxy: {
      '/~/api/persona_editor': {
        target: 'http://127.0.0.1:3030',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
