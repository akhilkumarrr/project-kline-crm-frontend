import { type FormEvent } from 'react'
import type { ContactRecord, InvoicePayload } from '../../lib/api'

export type InvoiceFormState = InvoicePayload
type InvoiceFormDefaults = {
  notes?: string
  paymentMethod?: string
}

type InvoiceEditorProps = {
  contactLabelSingular?: string
  contacts: ContactRecord[]
  form: InvoiceFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof InvoiceFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function createEmptyInvoiceForm(
  contactId?: string,
  defaults: InvoiceFormDefaults = {},
): InvoiceFormState {
  const today = new Date().toISOString().slice(0, 10)
  return {
    invoiceNumber: '',
    contactId: contactId || '',
    status: 'draft',
    totalAmount: 0,
    paidAmount: 0,
    issuedDate: today,
    dueDate: '',
    paidAt: '',
    paymentMethod: defaults.paymentMethod || '',
    notes: defaults.notes || '',
  }
}

export function InvoiceEditor({
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
}: InvoiceEditorProps) {
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
        aria-label={mode === 'create' ? 'Create invoice' : 'Edit invoice'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New invoice' : 'Update invoice'}</p>
            <h3>{mode === 'create' ? 'Create invoice' : 'Edit invoice'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Invoice number</span>
              <input
                required
                value={form.invoiceNumber}
                onChange={(event) => onChange('invoiceNumber', event.target.value)}
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
              <span>Status</span>
              <select value={form.status || 'draft'} onChange={(event) => onChange('status', event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Payment method</span>
              <input
                value={form.paymentMethod || ''}
                onChange={(event) => onChange('paymentMethod', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Total amount</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.totalAmount}
                onChange={(event) => onChange('totalAmount', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Paid amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.paidAmount || 0}
                onChange={(event) => onChange('paidAmount', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Issued date</span>
              <input
                required
                type="date"
                value={form.issuedDate}
                onChange={(event) => onChange('issuedDate', event.target.value)}
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
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create invoice' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
