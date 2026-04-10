//@ts-nocheck
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { loadViteEnvDefaults } from '../../common/config/vite-env-defaults.mjs';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Base path for serving from /apps/test-integration/gemini-openai-sdk/
    base: '/apps/test-integration/gemini-openai-sdk/',
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
                // Clean filenames without hashes for predictable paths
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
});
