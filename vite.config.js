import { join } from 'path'
import { defineConfig } from 'vite'

function publicDirIndex() {
  return {
    name: 'public-dir-index',
    async configureServer(server) {
      const { existsSync, readFileSync } = await import('fs')
      const root = process.cwd()
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0]
        if (url.endsWith('/')) {
          const candidate = join(root, 'public', url.slice(1), 'index.html')
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
  appType: 'mpa',
  plugins: [publicDirIndex()],
  build: {
    rollupOptions: {
      input: {
        main:  'index.html',
        games: 'games/index.html',
        apps:  'apps/index.html',
      },
    },
  },
})
