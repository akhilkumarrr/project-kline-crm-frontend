import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { usePortalAuth } from '../hooks/usePortalAuth'
import { api } from '../lib/api'
import { buildHashRoute, readHashParam } from '../lib/navigation'

type PortalTab = 'overview' | 'tasks' | 'files' | 'contracts' | 'invoices' | 'onboarding' | 'tickets'

const portalTabs: Array<{ id: PortalTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'files', label: 'Files' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'tickets', label: 'Support' },
]

const readPortalTab = (): PortalTab => {
  const value = readHashParam('tab')
  return portalTabs.some((tab) => tab.id === value) ? (value as PortalTab) : 'overview'
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not scheduled'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function PortalPage() {
  const auth = usePortalAuth()
  const [tab, setTab] = useState<PortalTab>(() => readPortalTab())
  const [form, setForm] = useState({
    email: 'contact@example.com',
    password: '',
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)

  useEffect(() => {
    const syncTab = () => setTab(readPortalTab())
    syncTab()
    window.addEventListener('hashchange', syncTab)
    return () => window.removeEventListener('hashchange', syncTab)
  }, [])

  const dashboardQuery = useApiQuery(
    Boolean(auth.token),
    () => api.getPortalDashboard(auth.token!),
    [auth.token],
  )
  const tasksQuery = useApiQuery(tab === 'tasks' && Boolean(auth.token), () => api.getPortalTasks(auth.token!), [
    auth.token,
    tab,
  ])
  const filesQuery = useApiQuery(tab === 'files' && Boolean(auth.token), () => api.getPortalFiles(auth.token!), [
    auth.token,
    tab,
  ])
  const contractsQuery = useApiQuery(
    tab === 'contracts' && Boolean(auth.token),
    () => api.getPortalContracts(auth.token!),
    [auth.token, tab],
  )
  const invoicesQuery = useApiQuery(
    tab === 'invoices' && Boolean(auth.token),
    () => api.getPortalInvoices(auth.token!),
    [auth.token, tab],
  )
  const onboardingQuery = useApiQuery(
    tab === 'onboarding' && Boolean(auth.token),
    () => api.getPortalOnboarding(auth.token!),
    [auth.token, tab],
  )
  const ticketsQuery = useApiQuery(
    tab === 'tickets' && Boolean(auth.token),
    () => api.getPortalTickets(auth.token!),
    [auth.token, tab],
  )

  const greetingName = useMemo(() => {
    if (!auth.user) {
      return 'your workspace'
    }

    return `${auth.user.firstName} ${auth.user.lastName}`.trim() || auth.user.email
  }, [auth.user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    try {
      await auth.login(form.email.trim(), form.password)
      window.location.hash = buildHashRoute('portal', { tab: 'overview' })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Portal login failed')
    }
  }

  const handleTabChange = (nextTab: PortalTab) => {
    window.location.hash = buildHashRoute('portal', { tab: nextTab })
  }

  const handleDownload = async (fileId: string) => {
    if (!auth.token) {
      return
    }

    setDownloadingFileId(fileId)

    try {
      const result = await api.downloadPortalFile(auth.token, fileId)
      downloadBlob(result.blob, result.fileName)
    } finally {
      setDownloadingFileId(null)
    }
  }

  if (!auth.isAuthenticated) {
    if (auth.isLoading) {
      return <LoadState loading title="Restoring your client portal" />
    }

    return (
      <section className="portal-shell">
        <div className="portal-auth-card">
          <p className="eyebrow">Client portal</p>
          <h1>Track onboarding, billing, and support in one place.</h1>
          <p className="portal-copy">
            Use the portal access details from your service team to review tasks, download files,
            and keep delivery moving.
          </p>

          <form className="portal-auth-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Temporary password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {(submitError || auth.error) ? <p className="form-error">{submitError || auth.error}</p> : null}
            <button type="submit" className="primary-button" disabled={auth.isLoading}>
              {auth.isLoading ? 'Signing in…' : 'Open portal'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  const renderCurrentTab = () => {
    switch (tab) {
      case 'tasks':
        return (
          <article className="surface-card">
            <div className="card-heading"><h3>Tasks</h3></div>
            <LoadState loading={tasksQuery.loading} error={tasksQuery.error} title="Loading portal tasks" />
            <div className="list-shell">
              {(tasksQuery.data || []).map((task) => (
                <div className="list-row static" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.description || 'No extra detail provided.'}</p>
                  </div>
                  <div className="list-row-actions">
                    <span>{task.status || 'todo'}</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )
      case 'files':
        return (
          <article className="surface-card">
            <div className="card-heading"><h3>Files</h3></div>
            <LoadState loading={filesQuery.loading} error={filesQuery.error} title="Loading portal files" />
            <div className="list-shell">
              {(filesQuery.data || []).map((file) => (
                <div className="list-row static" key={file.id}>
                  <div>
                    <strong>{file.originalName}</strong>
                    <p>{file.mimeType} · {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="list-row-actions">
                    <button
                      type="button"
                      className="ghost-button compact-button"
                      disabled={downloadingFileId === file.id}
                      onClick={() => handleDownload(file.id)}
                    >
                      {downloadingFileId === file.id ? 'Preparing…' : 'Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )
      case 'contracts':
        return (
          <article className="surface-card">
            <div className="card-heading"><h3>Contracts</h3></div>
            <LoadState loading={contractsQuery.loading} error={contractsQuery.error} title="Loading portal contracts" />
            <div className="list-shell">
              {(contractsQuery.data || []).map((contract) => (
                <div className="list-row static" key={contract.id}>
                  <div>
                    <strong>{contract.title}</strong>
                    <p>{contract.contractNumber}</p>
                  </div>
                  <div className="list-row-actions">
                    <span>{contract.status || 'draft'}</span>
                    <span>{contract.value ? `$${contract.value}` : 'Value pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )
      case 'invoices':
        return (
          <article className="surface-card">
            <div className="card-heading"><h3>Invoices</h3></div>
            <LoadState loading={invoicesQuery.loading} error={invoicesQuery.error} title="Loading portal invoices" />
            <div className="list-shell">
              {(invoicesQuery.data || []).map((invoice) => (
                <div className="list-row static" key={invoice.id}>
                  <div>
                    <strong>{invoice.invoiceNumber}</strong>
                    <p>Due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="list-row-actions">
                    <span>{invoice.status || 'draft'}</span>
                    <span>{invoice.balanceDue ? `$${invoice.balanceDue}` : '$0'}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )
      case 'onboarding':
        return (
          <article className="surface-card">
            <div className="card-heading"><h3>Onboarding</h3></div>
            <LoadState loading={onboardingQuery.loading} error={onboardingQuery.error} title="Loading onboarding" />
            <div className="list-shell">
              {(onboardingQuery.data || []).map((workflow) => (
                <div className="list-row static" key={workflow.id}>
                  <div>
                    <strong>{workflow.name}</strong>
                    <p>{workflow.description || 'Structured onboarding workflow'}</p>
                  </div>
                  <div className="list-row-actions">
                    <span>{workflow.status || 'active'}</span>
                    <span>{formatDate(workflow.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )
      case 'tickets':
        return (
          <article className="surface-card">
            <div className="card-heading"><h3>Support</h3></div>
            <LoadState loading={ticketsQuery.loading} error={ticketsQuery.error} title="Loading support requests" />
            <div className="list-shell">
              {(ticketsQuery.data || []).map((ticket) => (
                <div className="list-row static" key={ticket.id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <p>{ticket.ticketNumber} · {ticket.description}</p>
                  </div>
                  <div className="list-row-actions">
                    <span>{ticket.priority || 'normal'}</span>
                    <span>{ticket.status || 'open'}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )
      case 'overview':
      default:
        return (
          <>
            <article className="surface-card portal-hero-card">
              <div>
                <p className="eyebrow">Welcome back</p>
                <h1>{greetingName}</h1>
                <p className="portal-copy">
                  {auth.user?.companyRecord
                    ? `You are viewing the client workspace for ${auth.user.companyRecord.name}.`
                    : 'Everything you need for your service relationship is in one place.'}
                </p>
              </div>
              <button type="button" className="ghost-button" onClick={auth.logout}>
                Sign out
              </button>
            </article>

            <LoadState loading={dashboardQuery.loading} error={dashboardQuery.error} title="Loading portal overview" />

            <section className="portal-summary-grid">
              <article className="surface-card"><span className="data-label">Open tasks</span><strong>{dashboardQuery.data?.summary.tasks || 0}</strong></article>
              <article className="surface-card"><span className="data-label">Shared files</span><strong>{dashboardQuery.data?.summary.files || 0}</strong></article>
              <article className="surface-card"><span className="data-label">Invoices</span><strong>{dashboardQuery.data?.summary.invoices || 0}</strong></article>
              <article className="surface-card"><span className="data-label">Support requests</span><strong>{dashboardQuery.data?.summary.tickets || 0}</strong></article>
            </section>

            <section className="page-grid">
              <div className="main-column">
                <article className="surface-card">
                  <div className="card-heading"><h3>Recent tasks</h3></div>
                  <div className="list-shell">
                    {(dashboardQuery.data?.recent.tasks || []).map((task) => (
                      <div className="list-row static" key={task.id}>
                        <div>
                          <strong>{task.title}</strong>
                          <p>{task.description || 'No extra detail provided.'}</p>
                        </div>
                        <div className="list-row-actions">
                          <span>{task.status || 'todo'}</span>
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
              <div className="side-column">
                <article className="surface-card">
                  <div className="card-heading"><h3>Latest invoices</h3></div>
                  <div className="list-shell">
                    {(dashboardQuery.data?.recent.invoices || []).map((invoice) => (
                      <div className="list-row static" key={invoice.id}>
                        <div>
                          <strong>{invoice.invoiceNumber}</strong>
                          <p>Due {formatDate(invoice.dueDate)}</p>
                        </div>
                        <div className="list-row-actions">
                          <span>{invoice.status || 'draft'}</span>
                          <span>{invoice.balanceDue ? `$${invoice.balanceDue}` : '$0'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <section className="portal-shell portal-shell-authenticated">
      <div className="portal-header">
        <div>
          <p className="eyebrow">Client portal</p>
          <h2>{auth.user?.companyRecord?.name || greetingName}</h2>
        </div>
        <nav className="portal-tabbar">
          {portalTabs.map((portalTab) => (
            <button
              type="button"
              key={portalTab.id}
              className={portalTab.id === tab ? 'status-chip info' : 'ghost-button compact-button'}
              onClick={() => handleTabChange(portalTab.id)}
            >
              {portalTab.label}
            </button>
          ))}
        </nav>
      </div>
      {renderCurrentTab()}
    </section>
  )
}
