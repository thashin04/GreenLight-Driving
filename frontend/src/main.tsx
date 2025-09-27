import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { BackgroundWaves } from "@/components/ui/background"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BackgroundWaves />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
