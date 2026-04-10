import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'dev',
  plugins: [react()],
  server: {
    port: 5202,
    proxy: {
      '/~/api/fqdp_management_system': {
        target: 'http://localhost:51000',
        changeOrigin: true,
      },
    },
  },
});
