// Framework-free translation helpers (used by React and by the prerender/SEO code)
import { translations } from './translations'

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict)
}

/** translate('es', 'nav.home') → string, falling back to English, then to the key */
export function translate(lang, key, vars) {
  let value = lookup(translations[lang], key) ?? lookup(translations.en, key) ?? key
  if (vars && typeof value === 'string') {
    Object.entries(vars).forEach(([k, v]) => { value = value.replaceAll(`{${k}}`, v) })
  }
  return value
}

/** pickField(item, 'title', 'fr') → French translation when present, otherwise the English base */
export function pickField(item, field, lang) {
  if (!item) return ''
  const translated = item.translations?.[lang]?.[field]
  return (typeof translated === 'string' && translated.trim()) ? translated : (item[field] ?? '')
}
