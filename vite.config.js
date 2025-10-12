import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/interactive_floorplan/",
  build: {
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          return `assets/${assetInfo.name}`
        }
      }
    }
  }
});
