import { type FormEvent } from 'react'
import type { ContactRecord, ContractPayload } from '../../lib/api'

export type ContractFormState = ContractPayload
type ContractFormDefaults = {
  description?: string
  notes?: string
  paymentTerms?: string
}

type ContractEditorProps = {
  contactLabelSingular?: string
  contacts: ContactRecord[]
  form: ContractFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof ContractFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

export function createEmptyContractForm(
  contactId?: string,
  defaults: ContractFormDefaults = {},
): ContractFormState {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 12)

  return {
    title: '',
    contractNumber: '',
    contactId: contactId || '',
    description: defaults.description || '',
    startDate: today.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    value: 0,
    paymentTerms: defaults.paymentTerms || '',
    notes: defaults.notes || '',
  }
}

export function ContractEditor({
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
}: ContractEditorProps) {
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
        aria-label={mode === 'create' ? 'Create contract' : 'Edit contract'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New agreement' : 'Contract update'}</p>
            <h3>{mode === 'create' ? 'Create contract' : 'Edit contract'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Contract title</span>
              <input required value={form.title} onChange={(event) => onChange('title', event.target.value)} />
            </label>

            <label className="field">
              <span>Contract number</span>
              <input
                required
                value={form.contractNumber}
                onChange={(event) => onChange('contractNumber', event.target.value)}
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
              <span>Value</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(event) => onChange('value', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Start date</span>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(event) => onChange('startDate', event.target.value)}
              />
            </label>

            <label className="field">
              <span>End date</span>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(event) => onChange('endDate', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Payment terms</span>
              <input
                value={form.paymentTerms || ''}
                onChange={(event) => onChange('paymentTerms', event.target.value)}
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
                rows={4}
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
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create contract' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
