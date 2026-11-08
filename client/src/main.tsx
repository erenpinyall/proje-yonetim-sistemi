import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DEMO_MODE } from './demo/bus'

async function bootstrap() {
  if (DEMO_MODE) {
    const { installDemoApi } = await import('./demo/mockApi')
    installDemoApi()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
