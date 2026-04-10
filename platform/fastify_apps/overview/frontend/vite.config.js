import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5180,
    proxy: {
      "/~/api/overview": {
        target: "http://localhost:51000",
        changeOrigin: true,
      },
    },
  },
});
