import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import AppRoot from './AppRoot'
import './styles/global.css'

const container = document.getElementById('root')
// Prerendered pages embed the data they were built with, so the first render matches the HTML
const initialData = window.__PORTFOLIO_DATA__ || null
const app = (
  <StrictMode>
    <AppRoot initialData={initialData} />
  </StrictMode>
)

if (initialData && container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
