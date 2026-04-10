//@ts-nocheck
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/~/api/process_checklist': {
                target: 'http://localhost:51000',
                changeOrigin: true,
            },
        },
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
