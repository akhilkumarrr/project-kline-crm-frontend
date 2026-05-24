import { type FormEvent } from 'react'
import type {
  ContactRecord,
  CurrentUser,
  LeadRecord,
  OnboardingWorkflowPayload,
} from '../../lib/api'

export type OnboardingFormState = OnboardingWorkflowPayload

type OnboardingEditorProps = {
  contactLabelSingular?: string
  onboardingLabelSingular?: string
  contacts: ContactRecord[]
  form: OnboardingFormState
  isOpen: boolean
  isSaving: boolean
  leads: LeadRecord[]
  mode: 'create' | 'edit'
  onChange: (field: keyof OnboardingFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
  users: CurrentUser[]
}

const statusOptions = [
  { label: 'Planned', value: 'planned' },
  { label: 'Active', value: 'active' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function createEmptyOnboardingForm(
  contactId?: string,
  leadId?: string,
): OnboardingFormState {
  return {
    name: '',
    description: '',
    contactId: contactId || '',
    leadId: leadId || '',
    assignedTo: '',
    status: 'planned',
    startDate: '',
    dueDate: '',
  }
}

export function OnboardingEditor({
  contactLabelSingular = 'Contact',
  contacts,
  form,
  isOpen,
  isSaving,
  leads,
  mode,
  onboardingLabelSingular = 'Onboarding workflow',
  onChange,
  onClose,
  onSubmit,
  saveError,
  users,
}: OnboardingEditorProps) {
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
            ? `Create ${onboardingLabelSingular.toLowerCase()}`
            : `Edit ${onboardingLabelSingular.toLowerCase()}`
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New launch plan' : 'Update workflow'}</p>
            <h3>
              {mode === 'create'
                ? `Create ${onboardingLabelSingular.toLowerCase()}`
                : `Edit ${onboardingLabelSingular.toLowerCase()}`}
            </h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-span-2">
              <span>{`${onboardingLabelSingular} name`}</span>
              <input
                required
                value={form.name}
                onChange={(event) => onChange('name', event.target.value)}
              />
            </label>

            <label className="field">
              <span>{contactLabelSingular}</span>
              <select
                value={form.contactId || ''}
                onChange={(event) => onChange('contactId', event.target.value)}
              >
                <option value="">{`No ${contactLabelSingular.toLowerCase()}`}</option>
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

            <label className="field">
              <span>Status</span>
              <select
                value={form.status || 'planned'}
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
              <span>Start date</span>
              <input
                type="date"
                value={form.startDate || ''}
                onChange={(event) => onChange('startDate', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={(event) => onChange('dueDate', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea
                rows={6}
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
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create workflow' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
