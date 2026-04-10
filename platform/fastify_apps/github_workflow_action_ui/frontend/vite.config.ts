//@ts-nocheck
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/apps/github-workflow-action-ui/",
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5175,
    proxy: {
      "/~/api/": {
        target: process.env.VITE_API_URL || "http://localhost:51000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
