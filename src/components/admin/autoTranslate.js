// Fills Spanish/French translations from the English base using /api/translate.
import { auth } from '../../firebaseAdmin'
import { TARGET_LANGS, fieldStatus, setAutoText } from './translate'

const BATCH = 25

async function callApi(texts, target) {
  const user = auth?.currentUser
  if (!user) throw new Error('Inicia sesión de nuevo para traducir.')
  const token = await user.getIdToken()
  const out = []
  for (let i = 0; i < texts.length; i += BATCH) {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ texts: texts.slice(i, i + BATCH), target }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    out.push(...data.translations)
  }
  return out
}

// schema = { fields: ['title', …], lists: { highlights: ['label', …], … } }
function units(obj, schema, filter) {
  const list = []
  const visit = (target, path, fields) => {
    fields.forEach(field => TARGET_LANGS.forEach(lang => {
      if (filter(target, field, lang)) list.push({ path, field, lang, text: target[field] })
    }))
  }
  visit(obj, null, schema.fields || [])
  Object.entries(schema.lists || {}).forEach(([key, fields]) => {
    const items = obj[key] || []
    items.forEach((item, index) => visit(item, [key, index], fields))
  })
  return list
}

function updateAt(obj, path, fn) {
  if (!path) return fn(obj)
  const [key, index] = path
  return { ...obj, [key]: obj[key].map((item, i) => (i === index ? fn(item) : item)) }
}

const isPending = (target, field, lang) => fieldStatus(target, field, lang) === 'pending'

export function countPending(obj, schema) {
  return units(obj, schema, isPending).length
}

async function run(obj, list) {
  let result = obj
  let count = 0
  const errors = []
  for (const lang of TARGET_LANGS) {
    const forLang = list.filter(u => u.lang === lang)
    if (forLang.length === 0) continue
    const unique = [...new Set(forLang.map(u => u.text))]
    try {
      const translated = await callApi(unique, lang)
      const byText = new Map(unique.map((text, i) => [text, translated[i]]))
      forLang.forEach(u => {
        result = updateAt(result, u.path, target => setAutoText(target, u.field, lang, byText.get(u.text) ?? ''))
        count++
      })
    } catch (err) {
      errors.push(`${lang.toUpperCase()}: ${err.message}`)
    }
  }
  return { result, count, error: errors.join(' · ') || null }
}

/** Translates every missing or outdated automatic field. Manual edits are never touched. */
export function autoTranslate(obj, schema) {
  return run(obj, units(obj, schema, isPending))
}

/** Re-translates one field of one object (overwriting a manual edit). */
export async function retranslateField(obj, field, lang) {
  if (!obj?.[field]?.trim()) return obj
  const { result, error } = await run(obj, [{ path: null, field, lang, text: obj[field] }])
  if (error) throw new Error(error)
  return result
}

/** Translates plain strings (used for tag names). */
export async function translateStrings(texts, lang) {
  return texts.length ? callApi(texts, lang) : []
}
