import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { localizePath, splitLang } from './i18n/paths'

// Minimal client-side router with language prefixes (/es, /fr).
// `path` is always the language-independent path (e.g. '/leadership').
const RouterContext = createContext(null)

const currentPathname = () => (typeof window === 'undefined' ? '/' : window.location.pathname)

export function RouterProvider({ initialPath, children }) {
  const [pathname, setPathname] = useState(() => initialPath ?? currentPathname())

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const { lang, path } = splitLang(pathname)

  const go = useCallback((url, { scroll = true } = {}) => {
    if (url !== window.location.pathname) window.history.pushState({}, '', url)
    setPathname(url)
    if (scroll) window.scrollTo({ top: 0 })
  }, [])

  // navigate('/leadership') keeps the current language
  const navigate = useCallback(to => go(localizePath(to, splitLang(window.location.pathname).lang)), [go])
  // Same page in another language
  const switchLanguage = useCallback(code => go(localizePath(splitLang(window.location.pathname).path, code), { scroll: false }), [go])

  const value = useMemo(() => ({ path, lang, pathname, navigate, switchLanguage }), [path, lang, pathname, navigate, switchLanguage])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export const useRouter = () => useContext(RouterContext)

/** Localized href for a language-independent path */
export function useHref() {
  const { lang } = useRouter()
  return path => localizePath(path, lang)
}

export function Link({ to, onClick, children, ...rest }) {
  const { navigate, lang } = useRouter()
  const handleClick = e => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={localizePath(to, lang)} onClick={handleClick} {...rest}>{children}</a>
}
