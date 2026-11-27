import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'

// Installs the service worker and reloads when a new version is deployed.
// (No-op under the dev server; it applies to the built app.)
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
