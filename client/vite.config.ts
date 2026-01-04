import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
      "@data": path.resolve(__dirname, "src/data"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@components": path.resolve(__dirname, "src/components"),
      "@stores": path.resolve(__dirname, "src/stores"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@types": path.resolve(__dirname, "src/types"),
      "@router": path.resolve(__dirname, "src/router"),
      "@state": path.resolve(__dirname, "src/state"),
      "@socket": path.resolve(__dirname, "src/socket.ts"),
      "@shared": path.resolve(__dirname, "../shared/src")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@styles/tokens" as *;
          @use "@styles/colors" as *;
          @use "@styles/variables" as *;
          @use "@styles/breakpoints" as *;
          @use "@styles/fonts" as *;
        `
      }
    }
  }
});
