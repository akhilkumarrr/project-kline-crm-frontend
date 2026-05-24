import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import { AppearanceProvider } from './hooks/useAppearance.tsx'
import { FeedbackProvider } from './hooks/useFeedback.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <FeedbackProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppErrorBoundary>
      </FeedbackProvider>
    </AppearanceProvider>
  </StrictMode>,
)
