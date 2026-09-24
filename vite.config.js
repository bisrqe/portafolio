import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves the /api/* functions during `npm run dev` (in production they are Vercel functions)
const API_HANDLERS = {
  '/api/translate': () => import('./api/_lib/translate.js').then(m => m.handleTranslate),
  '/api/rebuild': () => import('./api/_lib/rebuild.js').then(m => m.handleRebuild),
}

function apiDev(env) {
  return {
    name: 'api-dev',
    configureServer(server) {
      Object.entries(API_HANDLERS).forEach(([route, load]) => {
        server.middlewares.use(route, async (req, res) => {
          const handler = await load()
          let raw = ''
          for await (const chunk of req) raw += chunk
          let body = {}
          try { body = JSON.parse(raw || '{}') } catch { /* invalid JSON → handled as bad request */ }
          const result = req.method === 'POST'
            ? await handler({ headers: req.headers, body, env })
            : { status: 405, body: { error: 'Method not allowed' } }
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.body))
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react(), apiDev(env)],
    define: {
      // Same value in the browser bundle and the prerender bundle, so the footer hydrates cleanly
      __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
    },
    server: { port: 3000 },
    build: {
      // Firestore alone is ~450 kB; the admin area is split into its own chunk
      chunkSizeWarningLimit: 700,
    },
  }
})
