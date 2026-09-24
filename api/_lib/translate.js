// Server-side machine translation used by the admin dashboard (/api/translate).
// Runs as a Vercel serverless function in production and as Vite middleware in development.
//
// Provider, in order of preference (configure in Vercel → Environment Variables):
//   DEEPL_API_KEY             → DeepL (best quality; the free plan covers 500,000 characters/month)
//   GOOGLE_TRANSLATE_API_KEY  → Google Cloud Translation v2 (API key, not a service-account key)
//   (none)                    → MyMemory public API (no key, lower quality, daily quota)
import { authorize } from './auth.js'

const TARGETS = ['es', 'fr']
const MAX_TEXTS = 60
const MAX_CHARS = 30000
async function deepl(texts, target, key) {
  const host = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'
  const res = await fetch(`${host}/v2/translate`, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: texts,
      source_lang: 'EN',
      target_lang: target.toUpperCase(),
      formality: 'prefer_more',
      preserve_formatting: true,
    }),
  })
  if (!res.ok) throw new Error(`DeepL ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.translations.map(t => t.text)
}

async function google(texts, target, key) {
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, source: 'en', target, format: 'text' }),
  })
  if (!res.ok) throw new Error(`Google Translate ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.data.translations.map(t => t.translatedText)
}

// MyMemory accepts ≤500 bytes per request, so long texts are split by paragraph and sentence
function splitSentences(block, limit = 450) {
  const groups = []
  let current = ''
  block.split(/(?<=[.!?;:])\s+/).forEach(sentence => {
    if (current && (current + ' ' + sentence).length > limit) {
      groups.push(current)
      current = sentence
    } else {
      current = current ? `${current} ${sentence}` : sentence
    }
  })
  if (current) groups.push(current)
  return groups
}

async function mymemory(texts, target, email) {
  const translateOne = async piece => {
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.set('q', piece)
    url.searchParams.set('langpair', `en|${target}`)
    if (email) url.searchParams.set('de', email)
    const res = await fetch(url)
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.responseStatus !== 200) throw new Error(`MyMemory: ${data.responseDetails || res.status}`)
    return data.responseData.translatedText
  }
  const out = []
  for (const text of texts) {
    // Keep line breaks exactly; translate each paragraph in sentence groups
    const parts = text.split(/(\n+)/)
    const translated = []
    for (const part of parts) {
      if (!part.trim() || /^\n+$/.test(part)) { translated.push(part); continue }
      const groups = []
      for (const group of splitSentences(part)) groups.push(await translateOne(group))
      translated.push(groups.join(' '))
    }
    out.push(translated.join(''))
  }
  return out
}

export async function translateTexts(texts, target, env) {
  if (env.DEEPL_API_KEY) return { provider: 'deepl', translations: await deepl(texts, target, env.DEEPL_API_KEY) }
  if (env.GOOGLE_TRANSLATE_API_KEY) return { provider: 'google', translations: await google(texts, target, env.GOOGLE_TRANSLATE_API_KEY) }
  return { provider: 'mymemory', translations: await mymemory(texts, target, env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL) }
}

/** Framework-agnostic request handler → { status, body } */
export async function handleTranslate({ headers = {}, body = {}, env = process.env }) {
  const auth = await authorize(headers, env)
  if (!auth.ok) return { status: auth.status, body: { error: auth.error } }

  const { texts, target } = body || {}
  if (!TARGETS.includes(target)) return { status: 400, body: { error: `target must be one of ${TARGETS.join(', ')}` } }
  if (!Array.isArray(texts) || texts.some(t => typeof t !== 'string')) return { status: 400, body: { error: 'texts must be an array of strings' } }
  if (texts.length > MAX_TEXTS || texts.join('').length > MAX_CHARS) return { status: 413, body: { error: 'Too much text in one request.' } }
  if (texts.length === 0) return { status: 200, body: { translations: [], provider: null } }

  try {
    const { provider, translations } = await translateTexts(texts, target, env)
    return { status: 200, body: { translations, provider } }
  } catch (err) {
    return { status: 502, body: { error: err.message } }
  }
}
