import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves /api/translate during `npm run dev` (in production it is a Vercel function)
function translateApiDev(env) {
  return {
    name: 'translate-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/translate', async (req, res) => {
        const { handleTranslate } = await import('./api/_lib/translate.js')
        let raw = ''
        for await (const chunk of req) raw += chunk
        let body = {}
        try { body = JSON.parse(raw || '{}') } catch { /* invalid JSON → handled as bad request */ }
        const result = req.method === 'POST'
          ? await handleTranslate({ headers: req.headers, body, env })
          : { status: 405, body: { error: 'Method not allowed' } }
        res.statusCode = result.status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.body))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react(), translateApiDev(env)],
    server: { port: 3000 },
    build: {
      // Firestore alone is ~450 kB; the admin area is split into its own chunk
      chunkSizeWarningLimit: 700,
    },
  }
})
