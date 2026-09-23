// Helpers for editing translatable fields.
// "orig" edits the base field; en/es/fr edit item.translations[lang][field].
export const EDIT_LANGS = [
  { code: 'orig', label: 'Original' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
]

export function getText(obj, field, lang) {
  if (lang === 'orig') return obj?.[field] ?? ''
  return obj?.translations?.[lang]?.[field] ?? ''
}

export function setText(obj, field, lang, value) {
  if (lang === 'orig') return { ...obj, [field]: value }
  const translations = obj.translations || {}
  return {
    ...obj,
    translations: { ...translations, [lang]: { ...(translations[lang] || {}), [field]: value } },
  }
}

// Removes empty strings / empty language maps so Firestore stays tidy
export function cleanTranslations(translations) {
  if (!translations) return {}
  const out = {}
  Object.entries(translations).forEach(([lang, fields]) => {
    const kept = Object.fromEntries(Object.entries(fields || {}).filter(([, v]) => typeof v === 'string' && v.trim()))
    if (Object.keys(kept).length) out[lang] = kept
  })
  return out
}

// Strips fields managed by Firestore / the UI before saving
export function toPayload(item) {
  const rest = { ...item }
  delete rest.id
  delete rest.createdAt
  delete rest.updatedAt
  return { ...rest, translations: cleanTranslations(rest.translations) }
}

export const splitList = value => value.split(',').map(s => s.trim()).filter(Boolean)
