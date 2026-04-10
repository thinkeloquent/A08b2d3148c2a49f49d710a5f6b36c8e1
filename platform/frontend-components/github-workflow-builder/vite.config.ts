import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'dev',
  plugins: [react()],
  resolve: {
    alias: {
      '@internal/dev-env-url-switcher': path.resolve(__dirname, '../dev-env-url-switcher/src'),
      '@internal/github-workflow-builder': path.resolve(__dirname, './src'),
    },
  },
  server: { port: 5239 },
});
