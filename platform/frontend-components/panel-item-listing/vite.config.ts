import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'dev',
  plugins: [react()],
  server: { port: 5228 },
  resolve: {
    alias: {
      '@internal/dev-env-url-switcher': path.resolve(
        __dirname,
        '../dev-env-url-switcher/src',
      ),
      '@internal/dev-env-url-switcher-nav': path.resolve(
        __dirname,
        '../dev-env-url-switcher-nav/src',
      ),
    },
  },
});
