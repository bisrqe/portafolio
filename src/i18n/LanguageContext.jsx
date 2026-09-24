import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { pickField, translate } from './t'
import { LANG_STORAGE_KEY } from './paths'
import { useRouter } from '../router'

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'fr', label: 'FR', name: 'Français' },
]

const SUPPORTED = LANGUAGES.map(l => l.code)

const LanguageContext = createContext(null)

// The active language comes from the URL (/, /es, /fr); see src/i18n/paths.js
export function LanguageProvider({ children }) {
  const { lang, switchLanguage } = useRouter()

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  // Explicit choice: remembered so the next visit opens in this language (see index.html)
  const setLang = useCallback(code => {
    if (!SUPPORTED.includes(code)) return
    try { localStorage.setItem(LANG_STORAGE_KEY, code) } catch { /* storage unavailable */ }
    switchLanguage(code)
  }, [switchLanguage])

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang])
  const pick = useCallback((item, field) => pickField(item, field, lang), [lang])

  const value = useMemo(() => ({ lang, setLang, t, pick }), [lang, setLang, t, pick])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
