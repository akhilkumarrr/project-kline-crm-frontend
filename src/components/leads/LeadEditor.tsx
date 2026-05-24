import { type FormEvent } from 'react'
import type { CompanyRecord, ContactRecord, LeadPayload } from '../../lib/api'

export type LeadFormState = LeadPayload

type LeadEditorProps = {
  contactLabelSingular?: string
  companies?: CompanyRecord[]
  contacts: ContactRecord[]
  form: LeadFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof LeadFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
  sourceOptions?: Array<{ label: string; value: string }>
  stageOptions?: Array<{ label: string; value: string }>
}

const defaultStageOptions = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Closed won', value: 'closed_won' },
  { label: 'Closed lost', value: 'closed_lost' },
]

const defaultSourceOptions = [
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Cold call', value: 'cold_call' },
  { label: 'Email', value: 'email' },
  { label: 'Trade show', value: 'trade_show' },
  { label: 'Other', value: 'other' },
]

export function createEmptyLeadForm(contactId?: string): LeadFormState {
  return {
    title: '',
    description: '',
    contactId: contactId || '',
    companyId: '',
    stage: 'new',
    source: 'other',
    value: 0,
    probability: '15',
    expectedCloseDate: '',
    notes: '',
  }
}

export function LeadEditor({
  contactLabelSingular = 'Contact',
  companies = [],
  contacts,
  form,
  isOpen,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
  sourceOptions = defaultSourceOptions,
  stageOptions = defaultStageOptions,
}: LeadEditorProps) {
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
        aria-label={mode === 'create' ? 'Create lead' : 'Edit lead'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New opportunity' : 'Update opportunity'}</p>
            <h3>{mode === 'create' ? 'Create lead' : 'Edit lead'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-span-2">
              <span>Lead title</span>
              <input
                required
                value={form.title}
                onChange={(event) => onChange('title', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Contact</span>
              <select
                required
                value={form.contactId}
                onChange={(event) => onChange('contactId', event.target.value)}
              >
                <option value="">{`Select a ${contactLabelSingular.toLowerCase()}`}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {`${contact.firstName} ${contact.lastName}`.trim()} {contact.company ? `- ${contact.company}` : ''}
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

            <label className="field">
              <span>Stage</span>
              <select value={form.stage || 'new'} onChange={(event) => onChange('stage', event.target.value)}>
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Source</span>
              <select value={form.source || 'other'} onChange={(event) => onChange('source', event.target.value)}>
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Expected close date</span>
              <input
                type="date"
                value={form.expectedCloseDate || ''}
                onChange={(event) => onChange('expectedCloseDate', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Deal value</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value ?? 0}
                onChange={(event) => onChange('value', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Probability %</span>
              <input
                value={form.probability || ''}
                onChange={(event) => onChange('probability', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.description || ''}
                onChange={(event) => onChange('description', event.target.value)}
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
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create lead' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
