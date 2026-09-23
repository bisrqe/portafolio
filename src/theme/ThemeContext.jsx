import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio_theme'
const ThemeContext = createContext(null)

function initialTheme() {
  // index.html sets data-theme before React loads to avoid a flash of the wrong theme
  const preset = document.documentElement.dataset.theme
  if (preset === 'light' || preset === 'dark') return preset
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* storage unavailable */ }
  }, [theme])

  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
