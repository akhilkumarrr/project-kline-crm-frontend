import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../EmptyState'
import { EntityEmailPanel } from '../email/EntityEmailPanel'
import { RelatedFilesPanel } from '../files/RelatedFilesPanel'
import { LoadState } from '../LoadState'
import { QuoteEditor, createEmptyQuoteForm, type QuoteFormState } from './QuoteEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { useWorkspaceTemplate } from '../../hooks/useWorkspaceTemplate'
import {
  navigateToRoute,
  readHashParam,
  readHashRouteState,
  replaceHashRoute,
} from '../../lib/navigation'
import {
  api,
  type CompanyRecord,
  type QuoteLineItem,
  type QuotePayload,
  type QuoteRecord,
} from '../../lib/api'

type QuoteViewModel = {
  contactEmail?: string | null
  contactId: string
  contactLabel: string
  createdBy: string
  id: string
  lineItems: QuoteLineItem[]
  notes?: string | null
  quoteNumber: string
  sentAt?: string | null
  status: string
  subtotal: number
  taxAmount: number
  taxPercent: number
  tone: string
  total: number
  validUntil?: string | null
}

const statusOrder = ['draft', 'sent', 'accepted', 'rejected', 'expired']

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

const buildTone = (status?: string) => {
  switch (status) {
    case 'accepted':
      return 'healthy'
    case 'sent':
      return 'cool'
    case 'rejected':
    case 'expired':
      return 'risk'
    default:
      return 'watching'
  }
}

const mapQuote = (quote: QuoteRecord): QuoteViewModel => ({
  contactEmail: quote.contact?.email || null,
  contactId: quote.contactId,
  contactLabel:
    `${quote.contact?.firstName || ''} ${quote.contact?.lastName || ''}`.trim() ||
    quote.contact?.company ||
    quote.contact?.email ||
    'Unknown contact',
  createdBy:
    `${quote.createdBy?.firstName || ''} ${quote.createdBy?.lastName || ''}`.trim() ||
    quote.createdBy?.email ||
    'Owner',
  id: quote.id,
  lineItems: quote.lineItems || [],
  notes: quote.notes,
  quoteNumber: quote.quoteNumber,
  sentAt: quote.sentAt,
  status: quote.status || 'draft',
  subtotal: Number(quote.subtotal || 0),
  taxAmount: Number(quote.taxAmount || 0),
  taxPercent: Number(quote.taxPercent || 0),
  tone: buildTone(quote.status),
  total: Number(quote.total || 0),
  validUntil: quote.validUntil,
})

const toFormState = (quote: QuoteRecord): QuoteFormState => ({
  quoteNumber: quote.quoteNumber || '',
  contactId: quote.contactId,
  companyId: quote.companyId || '',
  description: quote.description || '',
  lineItems:
    quote.lineItems?.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unitPrice || 0),
      total: Number(item.total || 0),
    })) || [],
  subtotal: Number(quote.subtotal || 0),
  taxPercent: Number(quote.taxPercent || 0),
  taxAmount: Number(quote.taxAmount || 0),
  total: Number(quote.total || 0),
  validUntil: quote.validUntil ? String(quote.validUntil).slice(0, 10) : '',
  notes: quote.notes || '',
})

const sanitizeQuotePayload = (form: QuoteFormState): QuotePayload => {
  const cleanedLineItems = form.lineItems
    .map((item) => {
      const quantity = Number(item.quantity || 0)
      const unitPrice = Number(item.unitPrice || 0)
      return {
        id: item.id,
        description: item.description.trim(),
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      }
    })
    .filter((item) => item.description && item.quantity > 0)

  if (!cleanedLineItems.length) {
    throw new Error('Add at least one line item before saving the quote.')
  }

  const subtotal = cleanedLineItems.reduce((sum, item) => sum + item.total, 0)
  const taxPercent = Number(form.taxPercent || 0)
  const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2))
  const total = Number((subtotal + taxAmount).toFixed(2))

  return {
    quoteNumber: form.quoteNumber.trim(),
    contactId: form.contactId,
    companyId: form.companyId?.trim() || undefined,
    description: form.description?.trim() || undefined,
    lineItems: cleanedLineItems,
    subtotal,
    taxPercent,
    taxAmount,
    total,
    validUntil: form.validUntil || undefined,
    notes: form.notes?.trim() || undefined,
  }
}

export function QuotesWorkspace() {
  const { token } = useAuth()
  const { labels, settings } = useWorkspaceTemplate()
  const [refreshKey, setRefreshKey] = useState(0)
  const quotesQuery = useApiQuery(
    Boolean(token),
    () => api.getQuotes(token!, 1, 100),
    [token, refreshKey],
  )
  const contactsQuery = useApiQuery(Boolean(token), () => api.getContacts(token!, 1, 200), [
    token,
    refreshKey,
  ])
  const companiesQuery = useApiQuery(Boolean(token), () => api.getCompanies(token!, 1, 200), [
    token,
    refreshKey,
  ])

  const quotes = quotesQuery.data?.data ?? []
  const contacts = contactsQuery.data?.data ?? []
  const companies = companiesQuery.data?.data ?? []

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [form, setForm] = useState<QuoteFormState>(createEmptyQuoteForm())
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'quotes') {
        return
      }

      const nextSelected = readHashParam('selected')
      if (nextSelected) {
        setSelectedQuoteId(nextSelected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)

    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  useEffect(() => {
    if (!selectedQuoteId && quotes.length) {
      setSelectedQuoteId(quotes[0].id)
    }
  }, [quotes, selectedQuoteId])

  const quoteViews = quotes.map(mapQuote)
  const selectedQuote =
    quoteViews.find((quote) => quote.id === selectedQuoteId) || quoteViews[0] || null

  useEffect(() => {
    if (!selectedQuoteId || readHashRouteState().route !== 'quotes') {
      return
    }

    replaceHashRoute('quotes', { selected: selectedQuoteId })
  }, [selectedQuoteId])

  const groupedQuotes = useMemo(
    () =>
      statusOrder.map((status) => ({
        quotes: quoteViews.filter((quote) => quote.status === status),
        status,
      })),
    [quoteViews],
  )

  const totalPipeline = quoteViews.reduce((sum, quote) => sum + quote.total, 0)
  const quoteDefaults = settings.runtime.starterPack.documents

  const refreshQuotes = async () => {
    setRefreshKey((current) => current + 1)
  }

  const openCreate = () => {
    setEditorMode('create')
    setForm(
      createEmptyQuoteForm(contacts[0]?.id, {
        description: quoteDefaults.quoteIntro,
      }),
    )
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (quoteId: string) => {
    const target = quotes.find((quote) => quote.id === quoteId)
    if (!target) {
      return
    }

    setEditorMode('edit')
    setForm(toFormState(target))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const handleFieldChange = (field: keyof QuoteFormState, value: string) => {
    setForm((current) => {
      const linkedCompanyId =
        field === 'contactId'
          ? contacts.find((contact) => contact.id === value)?.companyId || current.companyId || ''
          : current.companyId || ''
      const next = {
        ...current,
        ...(field === 'contactId' ? { companyId: linkedCompanyId } : {}),
        [field]: field === 'taxPercent' ? Number(value || 0) : value,
      }

      const subtotal = next.lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
      const taxPercent = Number(next.taxPercent || 0)
      const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2))
      const total = Number((subtotal + taxAmount).toFixed(2))

      return {
        ...next,
        subtotal,
        taxAmount,
        total,
      }
    })
  }

  const handleLineItemChange = (itemId: string, field: keyof QuoteLineItem, value: string) => {
    setForm((current) => {
      const lineItems = current.lineItems.map((item) => {
        if (item.id !== itemId) {
          return item
        }

        const nextItem = {
          ...item,
          [field]:
            field === 'quantity' || field === 'unitPrice'
              ? Number(value || 0)
              : value,
        }

        const total = Number(nextItem.quantity || 0) * Number(nextItem.unitPrice || 0)
        return {
          ...nextItem,
          total,
        }
      })

      const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
      const taxPercent = Number(current.taxPercent || 0)
      const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2))

      return {
        ...current,
        lineItems,
        subtotal,
        taxAmount,
        total: Number((subtotal + taxAmount).toFixed(2)),
      }
    })
  }

  const handleAddLineItem = () => {
    setForm((current) => ({
      ...current,
      lineItems: [
        ...current.lineItems,
        {
          id:
            globalThis.crypto?.randomUUID?.() ||
            `line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    }))
  }

  const handleRemoveLineItem = (itemId: string) => {
    setForm((current) => {
      const lineItems = current.lineItems.filter((item) => item.id !== itemId)
      const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
      const taxPercent = Number(current.taxPercent || 0)
      const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2))
      return {
        ...current,
        lineItems,
        subtotal,
        taxAmount,
        total: Number((subtotal + taxAmount).toFixed(2)),
      }
    })
  }

  const handleSubmit = async () => {
    if (!token) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const payload = sanitizeQuotePayload(form)

      if (editorMode === 'create') {
        const created = await api.createQuote(token, payload)
        setSelectedQuoteId(created.id)
      } else if (selectedQuoteId) {
        const updated = await api.updateQuote(token, selectedQuoteId, payload)
        setSelectedQuoteId(updated.id)
      }

      setIsEditorOpen(false)
      await refreshQuotes()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save quote.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!token || !selectedQuoteId) {
      return
    }

    try {
      await api.updateQuoteStatus(token, selectedQuoteId, status)
      await refreshQuotes()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to update quote status.')
    }
  }

  return (
    <>
      <section className="page-grid page-grid-wide">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Revenue</p>
                <h3>Quotes and proposals</h3>
              </div>
              <div className="inline-actions">
                <span className="pill warm">
                  {quoteViews.length ? `${formatCurrency(totalPipeline)} in play` : 'No quotes yet'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New quote
                </button>
              </div>
            </div>

            <LoadState
              loading={quotesQuery.loading || contactsQuery.loading}
              error={quotesQuery.error || contactsQuery.error}
              title="Loading quotes"
            />

            {quoteViews.length ? (
              <div className="revenue-board">
                {groupedQuotes.map((group) => (
                  <section className="revenue-column" key={group.status}>
                    <header className="revenue-column-header">
                      <strong>{formatTitleCase(group.status)}</strong>
                      <span>{group.quotes.length} quotes</span>
                    </header>
                    <div className="revenue-stack">
                      {group.quotes.length ? (
                        group.quotes.map((quote) => (
                          <article
                            className={
                              quote.id === selectedQuote?.id
                                ? 'revenue-card selected-revenue-card'
                                : 'revenue-card'
                            }
                            key={quote.id}
                          >
                            <button
                              type="button"
                              className="schedule-button"
                              onClick={() => setSelectedQuoteId(quote.id)}
                            >
                              <div className="schedule-topline">
                                <span className={`schedule-tag ${quote.tone}`}>
                                  {formatTitleCase(quote.status)}
                                </span>
                                <b>{formatCurrency(quote.total)}</b>
                              </div>
                              <strong>{quote.quoteNumber}</strong>
                              <p>{quote.contactLabel}</p>
                            </button>

                            <button
                              type="button"
                              className="ghost-button compact-button"
                              onClick={() => openEdit(quote.id)}
                            >
                              Edit
                            </button>
                          </article>
                        ))
                      ) : (
                        <div className="empty-card">No quotes in this stage.</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                actionLabel="Create quote"
                description="Start a proposal to track line items, stage movement, customer delivery, and revenue at risk."
                onAction={openCreate}
                title="No quotes yet"
              />
            )}
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected quote</p>
                <h3>{selectedQuote?.quoteNumber || 'Quote detail'}</h3>
              </div>
              {selectedQuote ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedQuote.id)}
                >
                  Edit quote
                </button>
              ) : null}
            </div>

            {selectedQuote ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">{labels.contactSingular}</span>
                    <strong>{selectedQuote.contactLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Owner</span>
                    <strong>{selectedQuote.createdBy}</strong>
                  </div>
                  <div>
                    <span className="data-label">Valid until</span>
                    <strong>{formatDate(selectedQuote.validUntil)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Last sent</span>
                    <strong>{formatDate(selectedQuote.sentAt)}</strong>
                  </div>
                </div>

                <div className="mini-stat-grid">
                  <div className="mini-stat-card">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(selectedQuote.subtotal)}</strong>
                  </div>
                  <div className="mini-stat-card">
                    <span>Tax</span>
                    <strong>{formatCurrency(selectedQuote.taxAmount)}</strong>
                  </div>
                  <div className="mini-stat-card accent-card">
                    <span>Total</span>
                    <strong>{formatCurrency(selectedQuote.total)}</strong>
                  </div>
                </div>

                <div className="status-action-row">
                  {statusOrder.map((status) => (
                    <button
                      type="button"
                      className={selectedQuote.status === status ? 'status-action active' : 'status-action'}
                      key={status}
                      onClick={() => handleStatusChange(status)}
                    >
                      {formatTitleCase(status)}
                    </button>
                  ))}
                </div>

                <div className="line-items-preview">
                  <span className="data-label">Line items</span>
                  {selectedQuote.lineItems.map((item) => (
                    <div className="line-preview-row" key={item.id}>
                      <div>
                        <strong>{item.description}</strong>
                        <p>
                          {item.quantity} x {formatCurrency(Number(item.unitPrice || 0))}
                        </p>
                      </div>
                      <b>{formatCurrency(Number(item.total || 0))}</b>
                    </div>
                  ))}
                </div>

                <div className="detail-note">
                  <span className="data-label">Proposal framing</span>
                  <p>{quoteDefaults.quoteIntro}</p>
                </div>

                <div className="detail-note">
                  <span className="data-label">Notes</span>
                  <p>{selectedQuote.notes || 'No notes added to this quote yet.'}</p>
                </div>

                <div className="context-link-row">
                  <button
                    type="button"
                    className="ghost-button compact-button context-link-button"
                    onClick={() => navigateToRoute('contacts', { selected: selectedQuote.contactId })}
                  >
                    Open contact
                  </button>
                </div>

                <EntityEmailPanel
                  defaultToEmail={selectedQuote.contactEmail}
                  entityId={selectedQuote.id}
                  entityKind="quote"
                  entityLogType="QUOTE"
                  heading="Send quote by email"
                />

                <RelatedFilesPanel
                  title="Quote files"
                  relatedType="quote"
                  relatedId={selectedQuote.id}
                  refreshKey={refreshKey}
                  emptyMessage="No files or generated PDFs are linked to this quote yet."
                  onGenerate={() => api.generateQuotePdf(token!, selectedQuote.id)}
                />
              </div>
            ) : (
              <EmptyState
                description="Select a quote to inspect proposal totals, line items, customer context, and email history."
                title="No quote selected"
              />
            )}
          </article>
        </div>
      </section>

      <QuoteEditor
        companies={companies as CompanyRecord[]}
        contactLabelSingular={labels.contactSingular}
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        mode={editorMode}
        onAddLineItem={handleAddLineItem}
        onChange={handleFieldChange}
        onClose={() => setIsEditorOpen(false)}
        onLineItemChange={handleLineItemChange}
        onRemoveLineItem={handleRemoveLineItem}
        onSubmit={handleSubmit}
        saveError={saveError}
      />
    </>
  )
}
