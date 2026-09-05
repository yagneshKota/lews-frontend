import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode intentionally removed: it double-fires useEffects in development,
// causing duplicate /api/risk/live calls → Open-Meteo HTTP 429 rate limiting.
createRoot(document.getElementById('root')!).render(
  <App />
)
