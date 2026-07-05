import { resolve, dirname } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        games: resolve(import.meta.dirname, "games/index.html"),
        apps: resolve(import.meta.dirname, "apps/index.html"),
      },
    },
  },
});
