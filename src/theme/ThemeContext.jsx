import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'portfolio_theme'
const ThemeContext = createContext(null)

// index.html sets <html data-theme> before first paint; React only reads and updates it.
// Nothing rendered depends on the theme (icons switch via CSS), so prerendered HTML hydrates cleanly.
function readTheme() {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme)
  const userChanged = useRef(false)

  useEffect(() => {
    if (!userChanged.current) return
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* storage unavailable */ }
  }, [theme])

  const toggleTheme = useCallback(() => {
    userChanged.current = true
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
