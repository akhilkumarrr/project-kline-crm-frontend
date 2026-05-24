import {
  appointmentRows,
  invoiceRows,
  onboardingRows,
  taskRows,
  ticketRows,
} from '../data/crm-data'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

type OperationsPageProps = {
  activeView: string
}

const operationsMap = {
  tasks: {
    eyebrow: 'Execution',
    title: 'Task command center',
    pill: '14 due today',
    rows: taskRows,
  },
  calendar: {
    eyebrow: 'Scheduling',
    title: 'Appointments and calendar',
    pill: '11 booked',
    rows: appointmentRows,
  },
  invoices: {
    eyebrow: 'Cash flow',
    title: 'Invoices and payment tracking',
    pill: '$41K open',
    rows: invoiceRows,
  },
  onboarding: {
    eyebrow: 'Delivery',
    title: 'Customer onboarding workflows',
    pill: '5 active launches',
    rows: onboardingRows,
  },
  tickets: {
    eyebrow: 'Support',
    title: 'Service tickets and escalations',
    pill: '9 open tickets',
    rows: ticketRows,
  },
} as const

export function OperationsPage({ activeView }: OperationsPageProps) {
  const config = operationsMap[activeView as keyof typeof operationsMap] ?? operationsMap.tasks
  const { token } = useAuth()

  const loader = () => {
    switch (activeView) {
      case 'calendar':
        return api.getAppointments(token!)
      case 'invoices':
        return api.getInvoices(token!)
      case 'onboarding':
        return api.getOnboardingWorkflows(token!)
      case 'tickets':
        return api.getTickets(token!)
      case 'tasks':
      default:
        return api.getTasks(token!).then((response) => response.data)
    }
  }

  const { data, error, loading } = useApiQuery(
    Boolean(token),
    loader,
    [token, activeView],
  )

  const liveRows =
    activeView === 'calendar'
      ? (data as any[] | null)?.map((row) => ({
          title: row.title,
          detail: row.description || row.location || 'Appointment scheduled',
          meta: new Date(row.startAt).toLocaleString(),
          status: row.status,
          tone: row.status === 'confirmed' ? 'healthy' : 'watching',
        }))
      : activeView === 'invoices'
        ? (data as any[] | null)?.map((row) => ({
            title: row.invoiceNumber,
            detail: row.contact?.company || row.contact?.email || 'Invoice',
            meta: `$${Number(row.balanceDue || row.totalAmount || 0).toLocaleString()}`,
            status: row.status,
            tone:
              row.status === 'paid'
                ? 'healthy'
                : row.status === 'overdue'
                  ? 'risk'
                  : 'watching',
          }))
        : activeView === 'onboarding'
          ? (data as any[] | null)?.map((row) => ({
              title: row.name,
              detail: row.description || row.contact?.company || 'Onboarding workflow',
              meta: row.dueDate || row.startDate || 'No due date',
              status: row.status,
              tone:
                row.status === 'completed'
                  ? 'healthy'
                  : row.status === 'blocked'
                    ? 'risk'
                    : 'watching',
            }))
          : activeView === 'tickets'
            ? (data as any[] | null)?.map((row) => ({
                title: row.subject,
                detail: row.description || row.contact?.company || 'Support ticket',
                meta: row.ticketNumber || row.priority,
                status: row.status,
                tone:
                  row.priority === 'urgent' || row.priority === 'high'
                    ? 'risk'
                    : 'watching',
              }))
            : (data as any[] | null)?.map((row) => ({
                title: row.title,
                detail: row.description || row.category || 'Task in queue',
                meta: row.dueDate || row.priority,
                status: row.status,
                tone:
                  row.status === 'done'
                    ? 'healthy'
                    : row.priority === 'high'
                      ? 'risk'
                      : 'watching',
              }))

  const rows = liveRows?.length ? liveRows : config.rows

  return (
    <section className="page-grid page-grid-wide">
      <div className="main-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{config.eyebrow}</p>
              <h3>{config.title}</h3>
            </div>
            <span className="pill neutral">{config.pill}</span>
          </div>

          <LoadState loading={loading} error={error} title={`Loading ${config.title}`} />

          <div className="table-list">
            {rows.map((row) => (
              <div className="table-row stacked-row" key={row.title}>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.detail}</p>
                </div>
                <div className="row-meta">
                  <b>{row.meta}</b>
                  <span className={`status-chip ${row.tone}`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
