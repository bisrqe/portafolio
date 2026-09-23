// Vercel serverless function: POST /api/translate  { texts: string[], target: 'es' | 'fr' }
import { handleTranslate } from './_lib/translate.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { status, body } = await handleTranslate({ headers: req.headers, body: req.body, env: process.env })
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).json(body)
}
