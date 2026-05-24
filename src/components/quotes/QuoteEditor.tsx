import { type FormEvent } from 'react'
import type { ContactRecord, QuoteLineItem, QuotePayload } from '../../lib/api'

export type QuoteFormState = QuotePayload

type QuoteEditorProps = {
  contacts: ContactRecord[]
  form: QuoteFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onAddLineItem: () => void
  onChange: (field: keyof QuoteFormState, value: string) => void
  onClose: () => void
  onLineItemChange: (itemId: string, field: keyof QuoteLineItem, value: string) => void
  onRemoveLineItem: (itemId: string) => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

const makeLineItemId = () =>
  globalThis.crypto?.randomUUID?.() || `line-${Date.now()}-${Math.random().toString(16).slice(2)}`

export function createEmptyQuoteForm(contactId?: string): QuoteFormState {
  return {
    quoteNumber: '',
    contactId: contactId || '',
    description: '',
    lineItems: [
      {
        id: makeLineItemId(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    taxPercent: 8,
    taxAmount: 0,
    total: 0,
    validUntil: '',
    notes: '',
  }
}

export function QuoteEditor({
  contacts,
  form,
  isOpen,
  isSaving,
  mode,
  onAddLineItem,
  onChange,
  onClose,
  onLineItemChange,
  onRemoveLineItem,
  onSubmit,
  saveError,
}: QuoteEditorProps) {
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
        aria-label={mode === 'create' ? 'Create quote' : 'Edit quote'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New proposal' : 'Quote update'}</p>
            <h3>{mode === 'create' ? 'Create quote' : 'Edit quote'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Quote number</span>
              <input
                required
                value={form.quoteNumber}
                onChange={(event) => onChange('quoteNumber', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Contact</span>
              <select
                required
                value={form.contactId}
                onChange={(event) => onChange('contactId', event.target.value)}
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {`${contact.firstName} ${contact.lastName}`.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Valid until</span>
              <input
                type="date"
                value={form.validUntil || ''}
                onChange={(event) => onChange('validUntil', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Tax percent</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.taxPercent}
                onChange={(event) => onChange('taxPercent', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </label>

            <div className="field field-span-2">
              <div className="line-items-header">
                <span>Line items</span>
                <button type="button" className="ghost-button compact-button" onClick={onAddLineItem}>
                  + Add line
                </button>
              </div>
              <div className="line-items-stack">
                {form.lineItems.map((item, index) => (
                  <div className="line-item-row" key={item.id}>
                    <label className="field field-span-2">
                      <span>Item {index + 1}</span>
                      <input
                        required
                        value={item.description}
                        onChange={(event) =>
                          onLineItemChange(item.id, 'description', event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Qty</span>
                      <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          onLineItemChange(item.id, 'quantity', event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Unit price</span>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          onLineItemChange(item.id, 'unitPrice', event.target.value)
                        }
                      />
                    </label>

                    <div className="line-item-total">
                      <span>Total</span>
                      <strong>${Number(item.total || 0).toLocaleString()}</strong>
                    </div>

                    <button
                      type="button"
                      className="ghost-button compact-button"
                      onClick={() => onRemoveLineItem(item.id)}
                      disabled={form.lineItems.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mini-stat-grid field-span-2">
              <div className="mini-stat-card">
                <span>Subtotal</span>
                <strong>${Number(form.subtotal || 0).toLocaleString()}</strong>
              </div>
              <div className="mini-stat-card">
                <span>Tax</span>
                <strong>${Number(form.taxAmount || 0).toLocaleString()}</strong>
              </div>
              <div className="mini-stat-card accent-card">
                <span>Total</span>
                <strong>${Number(form.total || 0).toLocaleString()}</strong>
              </div>
            </div>

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
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create quote' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
