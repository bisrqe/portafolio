import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { RouterProvider } from './router'
import { LanguageProvider } from './i18n/LanguageContext'
import { ThemeProvider } from './theme/ThemeContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
