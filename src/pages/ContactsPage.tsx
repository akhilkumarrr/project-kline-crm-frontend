import { LoadState } from '../components/LoadState'
import { contactRecords, contactTimeline } from '../data/crm-data'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

export function ContactsPage() {
  const { token } = useAuth()
  const { data, error, loading } = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!),
    [token],
  )

  const contacts = data?.data?.length
    ? data.data.map((contact) => ({
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        company: contact.company || contact.email,
        stage: contact.status,
        owner: contact.owner?.firstName || 'Owner',
        value: contact.jobTitle || 'Contact',
        health: contact.type,
        healthTone: contact.status === 'active' ? 'healthy' : 'watching',
      }))
    : contactRecords

  return (
    <section className="page-grid">
      <div className="main-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Customer relationships</p>
              <h3>Contacts and account health</h3>
            </div>
            <span className="pill cool">
              {data?.total ? `${data.total} live records` : 'CRM records'}
            </span>
          </div>

          <LoadState loading={loading} error={error} title="Loading contacts" />

          <div className="table-list">
            {contacts.map((contact) => (
              <div className="table-row contact-row" key={contact.name}>
                <div>
                  <strong>{contact.name}</strong>
                  <p>{contact.company}</p>
                </div>
                <div>
                  <span className="data-label">Stage</span>
                  <b>{contact.stage}</b>
                </div>
                <div>
                  <span className="data-label">Owner</span>
                  <b>{contact.owner}</b>
                </div>
                <div>
                  <span className="data-label">MRR</span>
                  <b>{contact.value}</b>
                </div>
                <div>
                  <span className={`status-chip ${contact.healthTone}`}>{contact.health}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="side-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h3>{contacts[0]?.company || 'Customer timeline'}</h3>
            </div>
          </div>
          <div className="timeline">
            {contactTimeline.map((item) => (
              <div className="timeline-row" key={`${item.time}-${item.title}`}>
                <span className={`timeline-dot ${item.tone}`} aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
