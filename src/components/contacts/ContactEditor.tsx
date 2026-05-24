import { type FormEvent } from 'react'
import type { CompanyRecord, ContactPayload } from '../../lib/api'

export type ContactFormState = ContactPayload

type ContactEditorProps = {
  companies?: CompanyRecord[]
  form: ContactFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof ContactFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

const typeOptions = [
  { label: 'Individual', value: 'individual' },
  { label: 'Company', value: 'company' },
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Prospect', value: 'prospect' },
]

export function createEmptyContactForm(): ContactFormState {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    companyId: '',
    jobTitle: '',
    type: 'individual',
    status: 'active',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  }
}

export function ContactEditor({
  companies = [],
  form,
  isOpen,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
}: ContactEditorProps) {
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
        aria-label={mode === 'create' ? 'Create contact' : 'Edit contact'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New relationship' : 'Update record'}</p>
            <h3>{mode === 'create' ? 'Create contact' : 'Edit contact'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>First name</span>
              <input
                required
                value={form.firstName}
                onChange={(event) => onChange('firstName', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Last name</span>
              <input
                required
                value={form.lastName}
                onChange={(event) => onChange('lastName', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Phone</span>
              <input value={form.phone || ''} onChange={(event) => onChange('phone', event.target.value)} />
            </label>

            <label className="field">
              <span>Company</span>
              <input
                value={form.company || ''}
                onChange={(event) => onChange('company', event.target.value)}
              />
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

            <label className="field">
              <span>Job title</span>
              <input
                value={form.jobTitle || ''}
                onChange={(event) => onChange('jobTitle', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Type</span>
              <select value={form.type || 'individual'} onChange={(event) => onChange('type', event.target.value)}>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select value={form.status || 'active'} onChange={(event) => onChange('status', event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Address</span>
              <input
                value={form.address || ''}
                onChange={(event) => onChange('address', event.target.value)}
              />
            </label>

            <label className="field">
              <span>City</span>
              <input value={form.city || ''} onChange={(event) => onChange('city', event.target.value)} />
            </label>

            <label className="field">
              <span>State</span>
              <input value={form.state || ''} onChange={(event) => onChange('state', event.target.value)} />
            </label>

            <label className="field">
              <span>Zip code</span>
              <input
                value={form.zipCode || ''}
                onChange={(event) => onChange('zipCode', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Country</span>
              <input
                value={form.country || ''}
                onChange={(event) => onChange('country', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Notes</span>
              <textarea
                rows={5}
                value={form.notes || ''}
                onChange={(event) => onChange('notes', event.target.value)}
              />
            </label>
          </div>

          {saveError ? <p className="auth-error">{saveError}</p> : null}

          <div className="drawer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create contact' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
