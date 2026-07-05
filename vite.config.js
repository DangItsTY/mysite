import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync } from 'fs'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Serve public/<path>/index.html for directory requests, matching prod host behavior.
function publicDirIndex() {
  return {
    name: 'public-dir-index',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0]
        if (url.endsWith('/')) {
          const candidate = resolve(__dirname, 'public', url.slice(1), 'index.html')
          if (existsSync(candidate)) {
            res.setHeader('Content-Type', 'text/html')
            res.end(readFileSync(candidate))
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [publicDirIndex()],
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        games: resolve(__dirname, 'games/index.html'),
        apps:  resolve(__dirname, 'apps/index.html'),
      },
    },
  },
})
