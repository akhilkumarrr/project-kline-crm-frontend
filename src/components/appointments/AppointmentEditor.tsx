import { type FormEvent } from 'react'
import type {
  AppointmentPayload,
  ContactRecord,
  CurrentUser,
  LeadRecord,
} from '../../lib/api'

export type AppointmentFormState = AppointmentPayload

type AppointmentEditorProps = {
  contacts: ContactRecord[]
  form: AppointmentFormState
  isOpen: boolean
  isSaving: boolean
  leads: LeadRecord[]
  mode: 'create' | 'edit'
  onChange: (field: keyof AppointmentFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
  users: CurrentUser[]
}

const typeOptions = [
  { label: 'Call', value: 'call' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Demo', value: 'demo' },
  { label: 'Follow up', value: 'follow_up' },
  { label: 'Other', value: 'other' },
]

const statusOptions = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No show', value: 'no_show' },
]

const toDateTimeLocalValue = (value?: string) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const pad = (part: number) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

export function createEmptyAppointmentForm(): AppointmentFormState {
  return {
    title: '',
    description: '',
    type: 'meeting',
    status: 'scheduled',
    startAt: '',
    endAt: '',
    location: '',
    contactId: '',
    leadId: '',
    assignedTo: '',
  }
}

export function normalizeAppointmentForm(
  form: AppointmentFormState,
): AppointmentFormState {
  return {
    ...form,
    endAt: toDateTimeLocalValue(form.endAt),
    startAt: toDateTimeLocalValue(form.startAt),
  }
}

export function AppointmentEditor({
  contacts,
  form,
  isOpen,
  isSaving,
  leads,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
  users,
}: AppointmentEditorProps) {
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
        aria-label={mode === 'create' ? 'Create appointment' : 'Edit appointment'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New meeting' : 'Update appointment'}</p>
            <h3>{mode === 'create' ? 'Create appointment' : 'Edit appointment'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-span-2">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => onChange('title', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Type</span>
              <select value={form.type || 'meeting'} onChange={(event) => onChange('type', event.target.value)}>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={form.status || 'scheduled'}
                onChange={(event) => onChange('status', event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Start</span>
              <input
                required
                type="datetime-local"
                value={toDateTimeLocalValue(form.startAt)}
                onChange={(event) => onChange('startAt', event.target.value)}
              />
            </label>

            <label className="field">
              <span>End</span>
              <input
                required
                type="datetime-local"
                value={toDateTimeLocalValue(form.endAt)}
                onChange={(event) => onChange('endAt', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Location</span>
              <input
                value={form.location || ''}
                onChange={(event) => onChange('location', event.target.value)}
              />
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

            <label className="field">
              <span>Contact</span>
              <select
                value={form.contactId || ''}
                onChange={(event) => onChange('contactId', event.target.value)}
              >
                <option value="">No contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {`${contact.firstName} ${contact.lastName}`.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Lead</span>
              <select value={form.leadId || ''} onChange={(event) => onChange('leadId', event.target.value)}>
                <option value="">No lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea
                rows={5}
                value={form.description || ''}
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
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create appointment' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
