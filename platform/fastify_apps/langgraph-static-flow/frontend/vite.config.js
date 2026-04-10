import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/apps/langgraph-static-flow/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'node:async_hooks': new URL('./src/polyfills/async_hooks.js', import.meta.url).pathname,
    },
  },
})
