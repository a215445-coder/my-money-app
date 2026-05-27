import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import { executeSilentShortcutImport } from './utils/shortcutImport'

void executeSilentShortcutImport().then((handled) => {
  if (handled) return
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
