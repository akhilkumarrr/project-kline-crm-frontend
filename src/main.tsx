import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import { AppearanceProvider } from './hooks/useAppearance.tsx'
import { FeedbackProvider } from './hooks/useFeedback.tsx'
import { WorkspaceTemplateProvider } from './hooks/useWorkspaceTemplate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <FeedbackProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <WorkspaceTemplateProvider>
              <App />
            </WorkspaceTemplateProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </FeedbackProvider>
    </AppearanceProvider>
  </StrictMode>,
)
