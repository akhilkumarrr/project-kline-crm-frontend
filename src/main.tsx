import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import { AppearanceProvider } from './hooks/useAppearance.tsx'
import { FeedbackProvider } from './hooks/useFeedback.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <FeedbackProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FeedbackProvider>
    </AppearanceProvider>
  </StrictMode>,
)
