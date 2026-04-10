import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@internal/panel-left-sidebar-menu-002": path.resolve(__dirname, "../../../frontend-components/panel-left-sidebar-menu-002/src"),
    },
  },
});
