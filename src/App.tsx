import './App.css'
import { getSidebarSections } from './data/crm-data'
import { AppShell } from './components/AppShell'
import { LoadState } from './components/LoadState'
import { useAuth } from './hooks/useAuth'
import { useCrmRoute } from './hooks/useCrmRoute'
import { useWorkspaceTemplate } from './hooks/useWorkspaceTemplate'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ContactsPage } from './pages/ContactsPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OperationsPage } from './pages/OperationsPage'
import { PipelinePage } from './pages/PipelinePage'
import { RevenuePage } from './pages/RevenuePage'
import { SearchPage } from './pages/SearchPage'
import { TeamPage } from './pages/TeamPage'
import { EmailPage } from './pages/EmailPage'
import { SetupPage } from './pages/SetupPage'
import { PortalPage } from './pages/PortalPage'
import { FormsPage } from './pages/FormsPage'
import { IntakePage } from './pages/IntakePage'
import { useApiQuery } from './hooks/useApiQuery'
import { api } from './lib/api'

function App() {
  const auth = useAuth()
  const { settings, viewLabels } = useWorkspaceTemplate()
  const { route, navigate } = useCrmRoute('dashboard')
  const notificationsQuery = useApiQuery(
    Boolean(auth.token),
    () => api.getNotifications(auth.token!),
    [auth.token],
  )
  const sidebarSections = getSidebarSections(viewLabels)
  const pageTitleMap: Record<string, string> = Object.fromEntries(
    sidebarSections.flatMap((section) => section.items.map((item) => [item.id, item.label])),
  )

  const activeView = pageTitleMap[route] ? route : 'dashboard'
  const activeLabel = pageTitleMap[activeView] ?? 'Dashboard'

  if (route === 'portal') {
    return <PortalPage />
  }

  if (route === 'intake') {
    return <IntakePage />
  }

  const renderPage = () => {
    switch (activeView) {
      case 'contacts':
        return <ContactsPage />
      case 'companies':
        return <CompaniesPage />
      case 'forms':
        return <FormsPage />
      case 'pipeline':
        return <PipelinePage />
      case 'quotes':
      case 'contracts':
        return <RevenuePage activeView={activeView} />
      case 'search':
        return <SearchPage />
      case 'setup':
        return <SetupPage />
      case 'notifications':
        return <NotificationsPage />
      case 'tasks':
      case 'calendar':
      case 'onboarding':
      case 'tickets':
      case 'invoices':
        return <OperationsPage activeView={activeView} />
      case 'analytics':
        return <AnalyticsPage />
      case 'email':
        return <EmailPage />
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
      onSearch={(query) => {
        const next = query.trim()
        window.location.hash = next ? `/search?q=${encodeURIComponent(next)}` : '/search'
      }}
      notificationCount={notificationsQuery.data?.unread || 0}
      searchPlaceholder={`${settings.runtime.labels.contactPlural}, leads, invoices, ${settings.runtime.labels.ticketPlural.toLowerCase()}`}
      sidebarSections={sidebarSections}
      user={auth.user}
      workspaceName={settings.workspaceName}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
