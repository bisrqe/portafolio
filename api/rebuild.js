// Vercel serverless function: POST /api/rebuild → regenerates the static pages after content edits
import { handleRebuild } from './_lib/rebuild.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // navigator.sendBeacon posts the body as text; parse it if needed
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const { status, body: out } = await handleRebuild({ headers: req.headers, body, env: process.env })
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).json(out)
}
