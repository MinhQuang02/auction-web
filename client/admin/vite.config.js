import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@components",
        replacement: fileURLToPath(
          new URL("./src/components", import.meta.url)
        ),
      },
      {
        find: "@pages",
        replacement: fileURLToPath(new URL("./src/pages", import.meta.url)),
      },
      {
        find: "@assets",
        replacement: fileURLToPath(new URL("./src/assets", import.meta.url)),
      },
      {
        find: "@context",
        replacement: fileURLToPath(new URL("./src/context", import.meta.url)),
      },
      {
        find: "@routes",
        replacement: fileURLToPath(new URL("./src/routes", import.meta.url)),
      },
    ],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});