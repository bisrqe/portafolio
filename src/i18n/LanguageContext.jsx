import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'fr', label: 'FR', name: 'Français' },
]

const SUPPORTED = LANGUAGES.map(l => l.code)
const STORAGE_KEY = 'portfolio_lang'

function detectInitialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (SUPPORTED.includes(fromUrl)) return fromUrl
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED.includes(saved)) return saved
  } catch { /* storage unavailable */ }
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return SUPPORTED.includes(browser) ? browser : 'en'
}

// Resolves a dotted key ("home.hero.cta") inside a nested dictionary
function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict)
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* storage unavailable */ }
  }, [lang])

  const setLang = useCallback(code => {
    if (SUPPORTED.includes(code)) setLangState(code)
  }, [])

  // t('nav.home') → string in the active language, falling back to English, then to the key
  const t = useCallback((key, vars) => {
    let value = lookup(translations[lang], key) ?? lookup(translations.en, key) ?? key
    if (vars && typeof value === 'string') {
      Object.entries(vars).forEach(([k, v]) => { value = value.replaceAll(`{${k}}`, v) })
    }
    return value
  }, [lang])

  // pick(item, 'title') → item.translations[lang].title when present, otherwise item.title
  const pick = useCallback((item, field) => {
    if (!item) return ''
    const translated = item.translations?.[lang]?.[field]
    return (typeof translated === 'string' && translated.trim()) ? translated : (item[field] ?? '')
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t, pick }), [lang, setLang, t, pick])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
