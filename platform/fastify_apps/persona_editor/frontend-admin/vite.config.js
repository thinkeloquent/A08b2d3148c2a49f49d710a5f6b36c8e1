import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/admin/apps/persona-editor/',
    server: {
        port: 5174,
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
