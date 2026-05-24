import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../EmptyState'
import { LoadState } from '../LoadState'
import { TicketEditor, createEmptyTicketForm } from './TicketEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import {
  navigateToRoute,
  readHashParam,
  readHashRouteState,
  replaceHashRoute,
} from '../../lib/navigation'
import {
  api,
  type ContactRecord,
  type CurrentUser,
  type TicketPayload,
  type TicketRecord,
} from '../../lib/api'

type TicketViewModel = {
  assignee: string
  contactId: string
  contactLabel: string
  createdAt?: string
  description: string
  id: string
  priority: string
  source: string
  status: string
  subject: string
  ticketNumber: string
  tone: string
}

const statusOrder = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']

const formatTitleCase = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const buildTicketTone = (status?: string, priority?: string) => {
  if (status === 'resolved' || status === 'closed') {
    return 'healthy'
  }
  if (priority === 'urgent' || priority === 'high') {
    return 'risk'
  }
  if (status === 'in_progress') {
    return 'cool'
  }
  return 'watching'
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Recently created'
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

const mapTicket = (ticket: TicketRecord): TicketViewModel => ({
  assignee:
    `${ticket.assignedUser?.firstName || ''} ${ticket.assignedUser?.lastName || ''}`.trim() ||
    ticket.assignedUser?.email ||
    'Unassigned',
  contactId: ticket.contactId,
  contactLabel:
    `${ticket.contact?.firstName || ''} ${ticket.contact?.lastName || ''}`.trim() ||
    ticket.contact?.company ||
    ticket.contact?.email ||
    'Unknown contact',
  createdAt: ticket.createdAt,
  description: ticket.description,
  id: ticket.id,
  priority: ticket.priority || 'medium',
  source: ticket.source || 'internal',
  status: ticket.status || 'open',
  subject: ticket.subject,
  ticketNumber: ticket.ticketNumber,
  tone: buildTicketTone(ticket.status, ticket.priority),
})

const toFormState = (ticket: TicketRecord): TicketPayload => ({
  assignedTo: ticket.assignedTo || '',
  contactId: ticket.contactId,
  description: ticket.description || '',
  priority: ticket.priority || 'medium',
  source: ticket.source || 'internal',
  status: ticket.status || 'open',
  subject: ticket.subject || '',
  ticketNumber: ticket.ticketNumber || '',
})

const trimTicketPayload = (form: TicketPayload): TicketPayload => ({
  assignedTo: form.assignedTo?.trim() || undefined,
  contactId: form.contactId.trim(),
  description: form.description.trim(),
  priority: form.priority?.trim() || undefined,
  source: form.source?.trim() || undefined,
  status: form.status?.trim() || undefined,
  subject: form.subject.trim(),
  ticketNumber: form.ticketNumber.trim(),
})

export function TicketsWorkspace() {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null)
  const [form, setForm] = useState<TicketPayload>(createEmptyTicketForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'tickets') {
        return
      }

      const nextSelected = readHashParam('selected')
      if (nextSelected) {
        setSelectedTicketId(nextSelected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)

    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  const ticketsQuery = useApiQuery(
    Boolean(token),
    () => api.getTickets(token!),
    [token, refreshKey],
  )
  const contactsQuery = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!, 1, 100),
    [token],
  )
  const usersQuery = useApiQuery(
    Boolean(token),
    () => api.getUsers(token!, 1, 100),
    [token],
  )

  const contacts = contactsQuery.data?.data ?? []
  const users = (usersQuery.data?.data ?? []) as CurrentUser[]
  const tickets = (ticketsQuery.data ?? []).map(mapTicket)

  const groupedTickets = useMemo(
    () =>
      statusOrder.map((status) => ({
        items: tickets.filter((ticket) => ticket.status === status),
        status,
      })),
    [tickets],
  )

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) || tickets[0] || null

  useEffect(() => {
    if (!selectedTicketId && tickets[0]) {
      setSelectedTicketId(tickets[0].id)
      return
    }

    if (
      selectedTicketId &&
      !tickets.some((ticket) => ticket.id === selectedTicketId) &&
      tickets[0]
    ) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [selectedTicketId, tickets])

  useEffect(() => {
    if (!selectedTicketId || readHashRouteState().route !== 'tickets') {
      return
    }

    replaceHashRoute('tickets', { selected: selectedTicketId })
  }, [selectedTicketId])

  const handleFormChange = (field: keyof TicketPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingTicketId(null)
    setForm(createEmptyTicketForm((contacts[0] as ContactRecord | undefined)?.id))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (ticketId: string) => {
    const source = ticketsQuery.data?.find((ticket) => ticket.id === ticketId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingTicketId(ticketId)
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
      const payload = trimTicketPayload(form)

      if (editorMode === 'create') {
        const created = await api.createTicket(token, payload)
        setSelectedTicketId(created.id)
      } else if (editingTicketId) {
        const updated = await api.updateTicket(token, editingTicketId, payload)
        setSelectedTicketId(updated.id)
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save ticket')
    } finally {
      setIsSaving(false)
    }
  }

  const urgentCount = tickets.filter((ticket) => ticket.priority === 'urgent').length

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Support</p>
                <h3>Service tickets and escalations</h3>
              </div>
              <div className="inline-actions">
                <span className="pill warm">
                  {tickets.length ? `${urgentCount} urgent` : 'Ticket queue'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New ticket
                </button>
              </div>
            </div>

            <LoadState
              loading={ticketsQuery.loading || contactsQuery.loading || usersQuery.loading}
              error={ticketsQuery.error || contactsQuery.error || usersQuery.error}
              title="Loading tickets"
            />

            {tickets.length ? (
              <div className="support-board">
                {groupedTickets.map((group) => (
                  <section className="support-column" key={group.status}>
                    <header className="support-day">
                      <strong>{formatTitleCase(group.status)}</strong>
                      <span>{group.items.length} tickets</span>
                    </header>

                    <div className="support-stack">
                      {group.items.length ? (
                        group.items.map((ticket) => (
                          <article
                            className={
                              ticket.id === selectedTicket?.id
                                ? 'support-card selected-support-card'
                                : 'support-card'
                            }
                            key={ticket.id}
                          >
                            <button
                              type="button"
                              className="schedule-button"
                              onClick={() => setSelectedTicketId(ticket.id)}
                            >
                              <div className="schedule-topline">
                                <span className={`schedule-tag ${ticket.tone}`}>
                                  {formatTitleCase(ticket.priority)}
                                </span>
                                <b>{ticket.ticketNumber}</b>
                              </div>
                              <strong>{ticket.subject}</strong>
                              <p>{ticket.contactLabel}</p>
                            </button>

                            <button
                              type="button"
                              className="ghost-button compact-button"
                              onClick={() => openEdit(ticket.id)}
                            >
                              Edit
                            </button>
                          </article>
                        ))
                      ) : (
                        <div className="empty-card">No tickets in this status.</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                actionLabel="Create ticket"
                description="Capture customer issues, assign owners, and keep support work visible alongside the rest of the CRM."
                onAction={openCreate}
                title="No tickets yet"
              />
            )}
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected ticket</p>
                <h3>{selectedTicket?.subject || 'Ticket detail'}</h3>
              </div>
              {selectedTicket ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedTicket.id)}
                >
                  Edit ticket
                </button>
              ) : null}
            </div>

            {selectedTicket ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">Ticket number</span>
                    <strong>{selectedTicket.ticketNumber}</strong>
                  </div>
                  <div>
                    <span className="data-label">Status</span>
                    <strong>{formatTitleCase(selectedTicket.status)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Priority</span>
                    <strong>{formatTitleCase(selectedTicket.priority)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Source</span>
                    <strong>{formatTitleCase(selectedTicket.source)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Customer</span>
                    <strong>{selectedTicket.contactLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Assigned to</span>
                    <strong>{selectedTicket.assignee}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Issue summary</span>
                  <p>{selectedTicket.description}</p>
                </div>

                <div className="detail-note">
                  <span className="data-label">Created</span>
                  <p>{formatDate(selectedTicket.createdAt)}</p>
                </div>

                <div className="context-link-row">
                  <button
                    type="button"
                    className="ghost-button compact-button context-link-button"
                    onClick={() => navigateToRoute('contacts', { selected: selectedTicket.contactId })}
                  >
                    Open contact
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                description="Select a ticket to review the issue, assignee, and linked customer record."
                title="No ticket selected"
              />
            )}
          </article>
        </div>
      </section>

      <TicketEditor
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        mode={editorMode}
        onChange={handleFormChange}
        onClose={closeEditor}
        onSubmit={handleSave}
        saveError={saveError}
        users={users}
      />
    </>
  )
}
