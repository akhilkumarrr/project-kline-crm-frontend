import './App.css'
import { sidebarSections } from './data/crm-data'
import { AppShell } from './components/AppShell'
import { LoadState } from './components/LoadState'
import { useAuth } from './hooks/useAuth'
import { useCrmRoute } from './hooks/useCrmRoute'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ContactsPage } from './pages/ContactsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OperationsPage } from './pages/OperationsPage'
import { PipelinePage } from './pages/PipelinePage'
import { RevenuePage } from './pages/RevenuePage'
import { TeamPage } from './pages/TeamPage'

const pageTitleMap: Record<string, string> = Object.fromEntries(
  sidebarSections.flatMap((section) =>
    section.items.map((item) => [item.id, item.label]),
  ),
)

function App() {
  const auth = useAuth()
  const { route, navigate } = useCrmRoute('dashboard')

  const activeView = pageTitleMap[route] ? route : 'dashboard'
  const activeLabel = pageTitleMap[activeView] ?? 'Dashboard'

  const renderPage = () => {
    switch (activeView) {
      case 'contacts':
        return <ContactsPage />
      case 'pipeline':
        return <PipelinePage />
      case 'quotes':
      case 'contracts':
        return <RevenuePage activeView={activeView} />
      case 'tasks':
      case 'calendar':
      case 'invoices':
      case 'onboarding':
      case 'tickets':
        return <OperationsPage activeView={activeView} />
      case 'analytics':
        return <AnalyticsPage />
      case 'team':
      case 'settings':
        return <TeamPage activeView={activeView} />
      case 'dashboard':
      default:
        return <DashboardPage />
    }
  }

  if (!auth.isAuthenticated) {
    if (auth.isLoading) {
      return <LoadState loading title="Restoring your workspace" />
    }

    return (
      <LoginPage
        error={auth.error}
        isLoading={auth.isLoading}
        onSubmit={auth.login}
      />
    )
  }

  return (
    <AppShell
      activeView={activeView}
      activeLabel={activeLabel}
      onNavigate={navigate}
      onLogout={auth.logout}
      user={auth.user}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
