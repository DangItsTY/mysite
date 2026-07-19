import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync } from "fs";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// "Vanity" URLs that mask a project's real path under public/, e.g. so
// /roulette works instead of /games/roulette. Keep this in sync with
// public/_redirects, which does the equivalent rewrite in production.
const VANITY_ROUTES = {
  "/roulette": "/games/roulette",
  "/mahjong": "/games/mahjong",
  "/one": "/games/one",
};

// Serve public/<path>/index.html for directory requests, matching prod host behavior.
function publicDirIndex() {
  return {
    name: "public-dir-index",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname, query = ""] = req.url.split("?");

        for (const [from, to] of Object.entries(VANITY_ROUTES)) {
          if (pathname === from) {
            // Force the trailing slash so the served HTML's relative
            // asset URLs (style.css, app.js, ...) resolve correctly.
            res.statusCode = 302;
            res.setHeader("Location", `${from}/${query ? `?${query}` : ""}`);
            res.end();
            return;
          }
          if (pathname.startsWith(`${from}/`)) {
            req.url = `${to}${pathname.slice(from.length)}${query ? `?${query}` : ""}`;
            break;
          }
        }

        const url = req.url.split("?")[0];
        if (url.endsWith("/")) {
          const candidate = resolve(
            __dirname,
            "public",
            url.slice(1),
            "index.html",
          );
          if (existsSync(candidate)) {
            res.setHeader("Content-Type", "text/html");
            res.end(readFileSync(candidate));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [publicDirIndex()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        games: resolve(__dirname, "games/index.html"),
        apps: resolve(__dirname, "apps/index.html"),
      },
    },
  },
});
