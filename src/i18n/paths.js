// Language-prefixed URLs: English lives at the root, Spanish under /es and French under /fr.
export const LANG_CODES = ['en', 'es', 'fr']
export const DEFAULT_LANG = 'en'
export const LANG_STORAGE_KEY = 'portfolio_lang'

/** '/es/leadership' → { lang: 'es', path: '/leadership' } */
export function splitLang(pathname = '/') {
  const match = pathname.match(/^\/(es|fr)(?=\/|$)/)
  const lang = match ? match[1] : DEFAULT_LANG
  let path = match ? pathname.slice(match[0].length) : pathname
  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1) path = path.replace(/\/+$/, '')
  return { lang, path }
}

/** ('/leadership', 'fr') → '/fr/leadership' */
export function localizePath(path = '/', lang = DEFAULT_LANG) {
  if (path.startsWith('/admin') || lang === DEFAULT_LANG) return path
  return path === '/' ? `/${lang}` : `/${lang}${path}`
}
