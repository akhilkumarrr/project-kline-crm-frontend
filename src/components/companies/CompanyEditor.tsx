import { type FormEvent } from 'react'
import type { CompanyPayload } from '../../lib/api'

export type CompanyFormState = CompanyPayload

type CompanyEditorProps = {
  form: CompanyFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof CompanyFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Prospect', value: 'prospect' },
  { label: 'Inactive', value: 'inactive' },
]

export function createEmptyCompanyForm(): CompanyFormState {
  return {
    name: '',
    website: '',
    industry: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    status: 'active',
    notes: '',
  }
}

export function CompanyEditor({
  form,
  isOpen,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
}: CompanyEditorProps) {
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
        aria-label={mode === 'create' ? 'Create company' : 'Edit company'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New account' : 'Account update'}</p>
            <h3>{mode === 'create' ? 'Create company' : 'Edit company'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-span-2">
              <span>Company name</span>
              <input required value={form.name} onChange={(event) => onChange('name', event.target.value)} />
            </label>

            <label className="field">
              <span>Industry</span>
              <input value={form.industry || ''} onChange={(event) => onChange('industry', event.target.value)} />
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

            <label className="field">
              <span>Website</span>
              <input value={form.website || ''} onChange={(event) => onChange('website', event.target.value)} />
            </label>

            <label className="field">
              <span>Email</span>
              <input type="email" value={form.email || ''} onChange={(event) => onChange('email', event.target.value)} />
            </label>

            <label className="field">
              <span>Phone</span>
              <input value={form.phone || ''} onChange={(event) => onChange('phone', event.target.value)} />
            </label>

            <label className="field field-span-2">
              <span>Address line 1</span>
              <input value={form.addressLine1 || ''} onChange={(event) => onChange('addressLine1', event.target.value)} />
            </label>

            <label className="field field-span-2">
              <span>Address line 2</span>
              <input value={form.addressLine2 || ''} onChange={(event) => onChange('addressLine2', event.target.value)} />
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
              <input value={form.zipCode || ''} onChange={(event) => onChange('zipCode', event.target.value)} />
            </label>

            <label className="field">
              <span>Country</span>
              <input value={form.country || ''} onChange={(event) => onChange('country', event.target.value)} />
            </label>

            <label className="field field-span-2">
              <span>Notes</span>
              <textarea rows={5} value={form.notes || ''} onChange={(event) => onChange('notes', event.target.value)} />
            </label>
          </div>

          {saveError ? <p className="auth-error">{saveError}</p> : null}

          <div className="drawer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create company' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
