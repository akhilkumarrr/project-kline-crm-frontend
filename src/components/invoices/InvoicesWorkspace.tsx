import { useEffect, useMemo, useState } from 'react'
import { LoadState } from '../LoadState'
import { InvoiceEditor, createEmptyInvoiceForm } from './InvoiceEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import {
  api,
  type ContactRecord,
  type InvoicePayload,
  type InvoiceRecord,
} from '../../lib/api'

type InvoiceViewModel = {
  balanceDue: number
  contactLabel: string
  dueDate?: string | null
  id: string
  invoiceNumber: string
  issuedDate?: string | null
  notes?: string | null
  paidAmount: number
  paymentMethod?: string | null
  status: string
  tone: string
  totalAmount: number
}

const statusOrder = ['draft', 'sent', 'partial', 'overdue', 'paid', 'cancelled']

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`

const formatTitleCase = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not set'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const buildInvoiceTone = (status?: string) => {
  switch (status) {
    case 'paid':
      return 'healthy'
    case 'overdue':
      return 'risk'
    case 'partial':
      return 'cool'
    default:
      return 'watching'
  }
}

const mapInvoice = (invoice: InvoiceRecord): InvoiceViewModel => {
  const totalAmount = Number(invoice.totalAmount || 0)
  const paidAmount = Number(invoice.paidAmount || 0)
  const balanceDue = Number(invoice.balanceDue ?? totalAmount - paidAmount)

  return {
    balanceDue,
    contactLabel:
      `${invoice.contact?.firstName || ''} ${invoice.contact?.lastName || ''}`.trim() ||
      invoice.contact?.company ||
      invoice.contact?.email ||
      'Unknown contact',
    dueDate: invoice.dueDate,
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issuedDate: invoice.issuedDate,
    notes: invoice.notes,
    paidAmount,
    paymentMethod: invoice.paymentMethod,
    status: invoice.status || 'draft',
    tone: buildInvoiceTone(invoice.status),
    totalAmount,
  }
}

const toFormState = (invoice: InvoiceRecord): InvoicePayload => ({
  invoiceNumber: invoice.invoiceNumber || '',
  contactId: invoice.contactId,
  status: invoice.status || 'draft',
  totalAmount: Number(invoice.totalAmount || 0),
  paidAmount: Number(invoice.paidAmount || 0),
  issuedDate: invoice.issuedDate ? String(invoice.issuedDate).slice(0, 10) : '',
  dueDate: invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : '',
  paidAt: invoice.paidAt ? String(invoice.paidAt).slice(0, 10) : '',
  paymentMethod: invoice.paymentMethod || '',
  notes: invoice.notes || '',
})

const trimInvoicePayload = (form: InvoicePayload): InvoicePayload => ({
  contactId: form.contactId.trim(),
  dueDate: form.dueDate?.trim() || undefined,
  invoiceNumber: form.invoiceNumber.trim(),
  issuedDate: form.issuedDate,
  notes: form.notes?.trim() || undefined,
  paidAmount: Number(form.paidAmount || 0),
  paidAt: form.paidAt?.trim() || undefined,
  paymentMethod: form.paymentMethod?.trim() || undefined,
  status: form.status?.trim() || undefined,
  totalAmount: Number(form.totalAmount || 0),
})

export function InvoicesWorkspace() {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [form, setForm] = useState<InvoicePayload>(createEmptyInvoiceForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const invoicesQuery = useApiQuery(
    Boolean(token),
    () => api.getInvoices(token!),
    [token, refreshKey],
  )
  const contactsQuery = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!, 1, 100),
    [token],
  )

  const contacts = contactsQuery.data?.data ?? []
  const invoices = (invoicesQuery.data ?? []).map(mapInvoice)

  const groupedInvoices = useMemo(
    () =>
      statusOrder.map((status) => ({
        invoices: invoices.filter((invoice) => invoice.status === status),
        status,
      })),
    [invoices],
  )

  const selectedInvoice =
    invoices.find((invoice) => invoice.id === selectedInvoiceId) || invoices[0] || null

  useEffect(() => {
    if (!selectedInvoiceId && invoices[0]) {
      setSelectedInvoiceId(invoices[0].id)
      return
    }

    if (
      selectedInvoiceId &&
      !invoices.some((invoice) => invoice.id === selectedInvoiceId) &&
      invoices[0]
    ) {
      setSelectedInvoiceId(invoices[0].id)
    }
  }, [invoices, selectedInvoiceId])

  const handleFormChange = (field: keyof InvoicePayload, value: string) => {
    setForm((current) => ({
      ...current,
      [field]:
        field === 'totalAmount' || field === 'paidAmount' ? Number(value) : value,
    }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingInvoiceId(null)
    setForm(createEmptyInvoiceForm((contacts[0] as ContactRecord | undefined)?.id))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (invoiceId: string) => {
    const source = invoicesQuery.data?.find((invoice) => invoice.id === invoiceId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingInvoiceId(invoiceId)
    setForm(toFormState(source))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const closeEditor = () => {
    if (isSaving) {
      return
    }

    setIsEditorOpen(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!token) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const payload = trimInvoicePayload(form)

      if (editorMode === 'create') {
        const created = await api.createInvoice(token, payload)
        setSelectedInvoiceId(created.id)
      } else if (editingInvoiceId) {
        const updated = await api.updateInvoice(token, editingInvoiceId, payload)
        setSelectedInvoiceId(updated.id)
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save invoice')
    } finally {
      setIsSaving(false)
    }
  }

  const totalOpen = invoices
    .filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'cancelled')
    .reduce((sum, invoice) => sum + invoice.balanceDue, 0)

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Cash flow</p>
                <h3>Invoices and payment tracking</h3>
              </div>
              <div className="inline-actions">
                <span className="pill warm">
                  {invoices.length ? `${formatCurrency(totalOpen)} open` : 'Invoice queue'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New invoice
                </button>
              </div>
            </div>

            <LoadState
              loading={invoicesQuery.loading || contactsQuery.loading}
              error={invoicesQuery.error || contactsQuery.error}
              title="Loading invoices"
            />

            <div className="finance-board">
              {groupedInvoices.map((group) => (
                <section className="finance-column" key={group.status}>
                  <header className="finance-day">
                    <strong>{formatTitleCase(group.status)}</strong>
                    <span>{group.invoices.length} invoices</span>
                  </header>

                  <div className="finance-stack">
                    {group.invoices.length ? (
                      group.invoices.map((invoice) => (
                        <article
                          className={
                            invoice.id === selectedInvoice?.id
                              ? 'finance-card selected-finance-card'
                              : 'finance-card'
                          }
                          key={invoice.id}
                        >
                          <button
                            type="button"
                            className="schedule-button"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                          >
                            <div className="schedule-topline">
                              <span className={`schedule-tag ${invoice.tone}`}>
                                {formatTitleCase(invoice.status)}
                              </span>
                              <b>{formatCurrency(invoice.balanceDue)}</b>
                            </div>
                            <strong>{invoice.invoiceNumber}</strong>
                            <p>{invoice.contactLabel}</p>
                          </button>

                          <button
                            type="button"
                            className="ghost-button compact-button"
                            onClick={() => openEdit(invoice.id)}
                          >
                            Edit
                          </button>
                        </article>
                      ))
                    ) : (
                      <div className="empty-card">No invoices in this status.</div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected invoice</p>
                <h3>{selectedInvoice?.invoiceNumber || 'Invoice detail'}</h3>
              </div>
              {selectedInvoice ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedInvoice.id)}
                >
                  Edit invoice
                </button>
              ) : null}
            </div>

            {selectedInvoice ? (
              <div className="detail-stack">
                <div className="finance-summary">
                  <div>
                    <span className="data-label">Total amount</span>
                    <strong>{formatCurrency(selectedInvoice.totalAmount)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Balance due</span>
                    <strong>{formatCurrency(selectedInvoice.balanceDue)}</strong>
                  </div>
                </div>

                <div className="detail-grid">
                  <div>
                    <span className="data-label">Status</span>
                    <strong>{formatTitleCase(selectedInvoice.status)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Customer</span>
                    <strong>{selectedInvoice.contactLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Issued</span>
                    <strong>{formatDate(selectedInvoice.issuedDate)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Due date</span>
                    <strong>{formatDate(selectedInvoice.dueDate)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Paid amount</span>
                    <strong>{formatCurrency(selectedInvoice.paidAmount)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Payment method</span>
                    <strong>{selectedInvoice.paymentMethod || 'Not recorded'}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Notes</span>
                  <p>{selectedInvoice.notes || 'No notes have been added to this invoice yet.'}</p>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <InvoiceEditor
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        mode={editorMode}
        onChange={handleFormChange}
        onClose={closeEditor}
        onSubmit={handleSave}
        saveError={saveError}
      />
    </>
  )
}
