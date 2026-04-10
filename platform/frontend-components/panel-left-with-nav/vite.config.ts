import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'dev',
  plugins: [react()],
  resolve: {
    alias: {
      '@internal/dev-env-url-switcher': path.resolve(__dirname, '../dev-env-url-switcher/src'),
    },
  },
  server: { port: 5231 },
});
