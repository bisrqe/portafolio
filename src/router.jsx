import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Minimal client-side router: avoids full page reloads between sections.
const RouterContext = createContext({ path: '/', navigate: () => {} })

export function RouterProvider({ children }) {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback(to => {
    if (to !== window.location.pathname) window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo({ top: 0 })
  }, [])

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

export const useRouter = () => useContext(RouterContext)

export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter()
  const handleClick = e => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handleClick} {...rest}>{children}</a>
}
