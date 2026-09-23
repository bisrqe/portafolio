// Translation model for the admin dashboard.
// English is the base language: it lives in the plain field (item.title).
// Spanish and French live in item.translations[lang][field], and item.i18nMeta[lang][field]
// records whether each translation is automatic or edited by hand, plus a hash of the English
// text it was made from (to detect when the English changed).
import { textHash } from '../../content/hash'

export const EDIT_LANGS = [
  { code: 'base', label: 'EN · base' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
]
export const TARGET_LANGS = ['es', 'fr']

const baseOf = (obj, field) => (typeof obj?.[field] === 'string' ? obj[field] : '')

export function getText(obj, field, lang) {
  if (lang === 'base') return baseOf(obj, field)
  return obj?.translations?.[lang]?.[field] ?? ''
}

function withTranslation(obj, field, lang, value, meta) {
  const translations = obj.translations || {}
  const i18nMeta = obj.i18nMeta || {}
  return {
    ...obj,
    translations: { ...translations, [lang]: { ...(translations[lang] || {}), [field]: value } },
    i18nMeta: { ...i18nMeta, [lang]: { ...(i18nMeta[lang] || {}), [field]: meta } },
  }
}

/** Text typed by the admin. Editing ES/FR marks that translation as manual. */
export function setText(obj, field, lang, value) {
  if (lang === 'base') return { ...obj, [field]: value }
  return withTranslation(obj, field, lang, value, { source: 'manual', hash: textHash(baseOf(obj, field)) })
}

/** Stores a machine translation of the current English text. */
export function setAutoText(obj, field, lang, value) {
  return withTranslation(obj, field, lang, value, { source: 'auto', hash: textHash(baseOf(obj, field)) })
}

/**
 * none     – no English text, nothing to translate
 * pending  – missing, or automatic but made from an older English text (will be translated)
 * auto     – machine translation, up to date
 * manual   – edited by hand, up to date (never overwritten automatically)
 * outdated – edited by hand, but the English text changed afterwards (review it)
 */
export function fieldStatus(obj, field, lang) {
  const base = baseOf(obj, field).trim()
  if (!base) return 'none'
  const current = (obj.translations?.[lang]?.[field] || '').trim()
  if (!current) return 'pending'
  const meta = obj.i18nMeta?.[lang]?.[field]
  if (!meta) return 'manual'
  if (meta.hash !== textHash(baseOf(obj, field))) return meta.source === 'auto' ? 'pending' : 'outdated'
  return meta.source === 'auto' ? 'auto' : 'manual'
}

/**
 * Earlier versions had an "Original" field plus EN/ES/FR tabs. English is now the base,
 * so a stored English translation becomes the base text.
 */
export function migrateLegacy(obj, fields) {
  const en = obj?.translations?.en
  if (!en) return obj
  const next = { ...obj }
  fields.forEach(field => { if (typeof en[field] === 'string' && en[field].trim()) next[field] = en[field] })
  const translations = { ...(obj.translations || {}) }
  delete translations.en
  const i18nMeta = { ...(obj.i18nMeta || {}) }
  delete i18nMeta.en
  return { ...next, translations, i18nMeta }
}

// Removes empty strings / empty language maps so Firestore stays tidy
export function cleanTranslations(translations) {
  const out = {}
  Object.entries(translations || {}).forEach(([lang, fields]) => {
    if (!TARGET_LANGS.includes(lang)) return
    const kept = Object.fromEntries(Object.entries(fields || {}).filter(([, v]) => typeof v === 'string' && v.trim()))
    if (Object.keys(kept).length) out[lang] = kept
  })
  return out
}

function cleanMeta(meta, translations) {
  const out = {}
  Object.entries(meta || {}).forEach(([lang, fields]) => {
    const kept = Object.fromEntries(Object.entries(fields || {}).filter(([field]) => translations[lang]?.[field]))
    if (Object.keys(kept).length) out[lang] = kept
  })
  return out
}

/** Translation-related fields of one object, cleaned for saving. */
export function cleanI18n(obj) {
  const translations = cleanTranslations(obj.translations)
  return { ...obj, translations, i18nMeta: cleanMeta(obj.i18nMeta, translations) }
}

// Strips fields managed by Firestore / the UI before saving
export function toPayload(item) {
  const rest = cleanI18n(item)
  delete rest.id
  delete rest.createdAt
  delete rest.updatedAt
  return rest
}

export const splitList = value => value.split(',').map(s => s.trim()).filter(Boolean)
