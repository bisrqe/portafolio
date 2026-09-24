import App from './App'
import { RouterProvider } from './router'
import { LanguageProvider } from './i18n/LanguageContext'
import { ThemeProvider } from './theme/ThemeContext'
import { InitialDataProvider } from './hooks/useFirestore'

// Providers shared by the browser entry (main.jsx) and the prerender entry (entry-server.jsx)
export default function AppRoot({ url, initialData }) {
  return (
    <ThemeProvider>
      <InitialDataProvider value={initialData}>
        <RouterProvider initialPath={url}>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </RouterProvider>
      </InitialDataProvider>
    </ThemeProvider>
  )
}
