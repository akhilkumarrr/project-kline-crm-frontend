import { type FormEvent } from 'react'
import type { CompanyRecord, ContactRecord, CurrentUser, TicketPayload } from '../../lib/api'

export type TicketFormState = TicketPayload

type TicketEditorProps = {
  companies?: CompanyRecord[]
  contactLabelSingular?: string
  contacts: ContactRecord[]
  form: TicketFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof TicketFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
  ticketLabelSingular?: string
  users: CurrentUser[]
}

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Waiting customer', value: 'waiting_customer' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const sourceOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Web', value: 'web' },
  { label: 'Internal', value: 'internal' },
]

export function createEmptyTicketForm(contactId?: string): TicketFormState {
  return {
    ticketNumber: '',
    subject: '',
    description: '',
    contactId: contactId || '',
    companyId: '',
    assignedTo: '',
    status: 'open',
    priority: 'medium',
    source: 'internal',
  }
}

export function TicketEditor({
  companies = [],
  contactLabelSingular = 'Contact',
  contacts,
  form,
  isOpen,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
  ticketLabelSingular = 'Ticket',
  users,
}: TicketEditorProps) {
  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <section
        className="drawer-panel"
        aria-label={
          mode === 'create'
            ? `Create ${ticketLabelSingular.toLowerCase()}`
            : `Edit ${ticketLabelSingular.toLowerCase()}`
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New support issue' : 'Update service issue'}</p>
            <h3>
              {mode === 'create'
                ? `Create ${ticketLabelSingular.toLowerCase()}`
                : `Edit ${ticketLabelSingular.toLowerCase()}`}
            </h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>{`${ticketLabelSingular} number`}</span>
              <input
                required
                value={form.ticketNumber}
                onChange={(event) => onChange('ticketNumber', event.target.value)}
              />
            </label>

            <label className="field">
              <span>{contactLabelSingular}</span>
              <select
                required
                value={form.contactId}
                onChange={(event) => onChange('contactId', event.target.value)}
              >
                <option value="">{`Select a ${contactLabelSingular.toLowerCase()}`}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {`${contact.firstName} ${contact.lastName}`.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Linked account</span>
              <select value={form.companyId || ''} onChange={(event) => onChange('companyId', event.target.value)}>
                <option value="">No linked account</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Subject</span>
              <input
                required
                value={form.subject}
                onChange={(event) => onChange('subject', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select value={form.status || 'open'} onChange={(event) => onChange('status', event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={form.priority || 'medium'}
                onChange={(event) => onChange('priority', event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Source</span>
              <select value={form.source || 'internal'} onChange={(event) => onChange('source', event.target.value)}>
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Assign to</span>
              <select
                value={form.assignedTo || ''}
                onChange={(event) => onChange('assignedTo', event.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </label>
          </div>

          {saveError ? <p className="auth-error">{saveError}</p> : null}

          <div className="drawer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create ticket' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
