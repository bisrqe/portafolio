// Local preview of the production build that behaves like Vercel:
// static file → clean URL (.html) → rewrites from vercel.json → 404.html.   Usage: npm run preview
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('dist')
const port = Number(process.env.PORT) || 4173
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))

// Converts Vercel's ":name(a|b)" / ":name*" / ":name" patterns into regular expressions
const toRegex = source => new RegExp(`^${source
  .replace(/:(\w+)\(([^)]+)\)/g, '($2)')
  .replace(/\/:(\w+)\*/g, '(?:/.*)?')
  .replace(/:(\w+)/g, '[^/]+')}$`)
const rewrites = (vercel.rewrites || []).map(r => ({ test: toRegex(r.source), to: r.destination }))

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' }
const send = (res, file, status = 200) => {
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}
const isFile = file => fs.existsSync(file) && fs.statSync(file).isFile()

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  if (url.startsWith('/api/')) {
    res.writeHead(501, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'API functions are not available in this preview; use `npm run dev`.' }))
  }
  const direct = path.join(root, url)
  if (url !== '/' && isFile(direct)) return send(res, direct)
  const page = url === '/' ? path.join(root, 'index.html') : path.join(root, `${url.replace(/\/$/, '')}.html`)
  if (isFile(page)) return send(res, page)
  const rewrite = rewrites.find(r => r.test.test(url))
  if (rewrite) return send(res, path.join(root, rewrite.to))
  return send(res, path.join(root, '404.html'), 404)
}).listen(port, () => console.log(`Preview: http://localhost:${port}`))
