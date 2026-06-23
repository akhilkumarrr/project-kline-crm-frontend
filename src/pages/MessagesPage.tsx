import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import {
  api,
  type CompanyRecord,
  type ContactRecord,
  type ConversationPayload,
} from '../lib/api'
import { readHashParam, readHashRouteState, replaceHashRoute } from '../lib/navigation'

const statusOptions = ['open', 'waiting_internal', 'waiting_client', 'closed'] as const
const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'No activity yet'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
      })
}

const formatLabel = (value?: string | null) => value?.replace(/_/g, ' ') || 'unknown'

const contactLabel = (contact?: ContactRecord | null) =>
  contact ? `${contact.firstName} ${contact.lastName}`.trim() || contact.email : 'No contact linked'

const companyLabel = (company?: CompanyRecord | null) => company?.name || 'No company linked'

const buildConversationPayload = (form: {
  companyId: string
  contactId: string
  initialMessage: string
  priority: string
  subject: string
}): ConversationPayload => ({
  subject: form.subject.trim(),
  channel: 'internal',
  priority: form.priority as ConversationPayload['priority'],
  contactId: form.contactId || undefined,
  companyId: form.companyId || undefined,
  initialMessage: form.initialMessage.trim() || undefined,
})

export function MessagesPage() {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replyVisibility, setReplyVisibility] = useState<'public' | 'internal'>('public')
  const [isReplying, setIsReplying] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    subject: '',
    contactId: '',
    companyId: '',
    priority: 'medium',
    initialMessage: '',
  })

  const conversationsQuery = useApiQuery(
    Boolean(token),
    () => api.getConversations(token!, { status: statusFilter }),
    [token, refreshKey, statusFilter],
  )
  const contactsQuery = useApiQuery(Boolean(token), () => api.getContacts(token!, 1, 100), [token])
  const companiesQuery = useApiQuery(Boolean(token), () => api.getCompanies(token!, 1, 100), [token])

  const conversations = conversationsQuery.data || []
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) || conversations[0] || null

  const detailQuery = useApiQuery(
    Boolean(token) && Boolean(selectedConversation?.id),
    () => api.getConversation(token!, selectedConversation!.id),
    [token, selectedConversation?.id, refreshKey],
  )

  const detail = detailQuery.data || selectedConversation
  const contacts = contactsQuery.data?.data || []
  const companies = companiesQuery.data?.data || []

  const inboxStats = useMemo(() => {
    const waitingInternal = conversations.filter((conversation) => conversation.status === 'waiting_internal').length
    const waitingClient = conversations.filter((conversation) => conversation.status === 'waiting_client').length
    const urgent = conversations.filter((conversation) => conversation.priority === 'urgent').length

    return [
      { label: 'Open threads', value: conversations.filter((conversation) => conversation.status !== 'closed').length },
      { label: 'Needs team', value: waitingInternal },
      { label: 'Waiting client', value: waitingClient },
      { label: 'Urgent', value: urgent },
    ]
  }, [conversations])

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'messages') {
        return
      }

      const selected = readHashParam('selected')
      if (selected) {
        setSelectedConversationId(selected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)
    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  useEffect(() => {
    if (!selectedConversationId && conversations[0]) {
      setSelectedConversationId(conversations[0].id)
      return
    }

    if (selectedConversationId && !conversations.some((conversation) => conversation.id === selectedConversationId)) {
      setSelectedConversationId(conversations[0]?.id || null)
    }
  }, [conversations, selectedConversationId])

  useEffect(() => {
    if (!selectedConversationId || readHashRouteState().route !== 'messages') {
      return
    }

    replaceHashRoute('messages', { selected: selectedConversationId })
  }, [selectedConversationId])

  const resetCreateForm = () => {
    setCreateForm({
      subject: '',
      contactId: '',
      companyId: '',
      priority: 'medium',
      initialMessage: '',
    })
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !createForm.subject.trim()) {
      return
    }

    setIsCreating(true)

    try {
      const result = await api.createConversation(token, buildConversationPayload(createForm))
      setSelectedConversationId(result.id)
      setRefreshKey((current) => current + 1)
      resetCreateForm()
      notifySuccess(result.subject, 'Conversation created')
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not create conversation')
    } finally {
      setIsCreating(false)
    }
  }

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !detail?.id || !replyBody.trim()) {
      return
    }

    setIsReplying(true)

    try {
      await api.sendConversationMessage(token, detail.id, {
        body: replyBody.trim(),
        visibility: replyVisibility,
      })
      setReplyBody('')
      setRefreshKey((current) => current + 1)
      notifySuccess(replyVisibility === 'internal' ? 'Internal note saved' : 'Reply sent')
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not send message')
    } finally {
      setIsReplying(false)
    }
  }

  const handleUpdate = async (payload: Partial<ConversationPayload>) => {
    if (!token || !detail?.id) {
      return
    }

    try {
      await api.updateConversation(token, detail.id, payload)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not update conversation')
    }
  }

  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Shared inbox</p>
          <h1>One conversation layer across clients, support, and delivery.</h1>
          <p>
            Start internal threads, handle portal replies, and keep client context connected to
            contacts and companies before the full UI redesign.
          </p>
        </div>
        <div className="hero-actions">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="metric-grid compact-metrics">
        {inboxStats.map((stat) => (
          <article className="metric-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Inbox</p>
                <h3>Conversations</h3>
              </div>
            </div>
            <LoadState loading={conversationsQuery.loading} error={conversationsQuery.error} title="Loading conversations" />
            {conversations.length ? (
              <div className="list-shell">
                {conversations.map((conversation) => (
                  <button
                    className={conversation.id === detail?.id ? 'list-row active' : 'list-row'}
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div>
                      <strong>{conversation.subject}</strong>
                      <p>
                        {contactLabel(conversation.contact)} · {companyLabel(conversation.company)} ·{' '}
                        {formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}
                      </p>
                    </div>
                    <div className="list-row-actions">
                      <span className={`status-pill ${conversation.priority === 'urgent' ? 'danger' : 'neutral'}`}>
                        {formatLabel(conversation.priority)}
                      </span>
                      <span>{formatLabel(conversation.status)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : !conversationsQuery.loading ? (
              <EmptyState
                title="No conversations yet"
                description="Create the first shared inbox thread or wait for a client portal message."
              />
            ) : null}
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">New thread</p>
                <h3>Create conversation</h3>
              </div>
            </div>
            <form className="drawer-form" onSubmit={handleCreate}>
              <label>
                Subject
                <input
                  value={createForm.subject}
                  onChange={(event) => setCreateForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Client kickoff question"
                  required
                />
              </label>
              <label>
                Contact
                <select
                  value={createForm.contactId}
                  onChange={(event) => {
                    const contact = contacts.find((record) => record.id === event.target.value)
                    setCreateForm((current) => ({
                      ...current,
                      contactId: event.target.value,
                      companyId: contact?.companyId || current.companyId,
                    }))
                  }}
                >
                  <option value="">No contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contactLabel(contact)} · {contact.email}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Company
                <select
                  value={createForm.companyId}
                  onChange={(event) => setCreateForm((current) => ({ ...current, companyId: event.target.value }))}
                >
                  <option value="">No company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={createForm.priority}
                  onChange={(event) => setCreateForm((current) => ({ ...current, priority: event.target.value }))}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                Initial message
                <textarea
                  rows={4}
                  value={createForm.initialMessage}
                  onChange={(event) => setCreateForm((current) => ({ ...current, initialMessage: event.target.value }))}
                  placeholder="Add the first message or internal context."
                />
              </label>
              <div className="form-actions full-span">
                <button type="button" className="ghost-button" onClick={resetCreateForm}>
                  Clear
                </button>
                <button type="submit" className="primary-button" disabled={isCreating}>
                  {isCreating ? 'Creating…' : 'Create thread'}
                </button>
              </div>
            </form>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card sticky-panel">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Thread</p>
                <h3>{detail?.subject || 'Select a conversation'}</h3>
              </div>
            </div>
            <LoadState loading={detailQuery.loading} error={detailQuery.error} title="Loading conversation" />
            {detail ? (
              <>
                <div className="detail-grid">
                  <label>
                    Status
                    <select
                      value={detail.status || 'open'}
                      onChange={(event) => handleUpdate({ status: event.target.value as ConversationPayload['status'] })}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      value={detail.priority || 'medium'}
                      onChange={(event) =>
                        handleUpdate({ priority: event.target.value as ConversationPayload['priority'] })
                      }
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {formatLabel(priority)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="conversation-meta">
                  <span>{contactLabel(detail.contact)}</span>
                  <span>{companyLabel(detail.company)}</span>
                  <span>{formatLabel(detail.channel)}</span>
                </div>

                <div className="message-thread">
                  {(detail.messages || []).map((message) => {
                    const isClient = message.authorType === 'contact'
                    return (
                      <article
                        className={`message-bubble ${isClient ? 'client' : 'team'} ${
                          message.visibility === 'internal' ? 'internal' : ''
                        }`}
                        key={message.id}
                      >
                        <span>
                          {isClient
                            ? contactLabel(message.authorContact)
                            : message.authorUser
                              ? `${message.authorUser.firstName} ${message.authorUser.lastName}`.trim()
                              : 'Team'}
                          {' · '}
                          {message.visibility === 'internal' ? 'internal note' : 'public'}
                        </span>
                        <p>{message.body}</p>
                        <small>{formatDateTime(message.createdAt)}</small>
                      </article>
                    )
                  })}
                </div>

                <form className="message-composer" onSubmit={handleReply}>
                  <label>
                    Reply mode
                    <select
                      value={replyVisibility}
                      onChange={(event) => setReplyVisibility(event.target.value as 'public' | 'internal')}
                    >
                      <option value="public">Public client reply</option>
                      <option value="internal">Internal team note</option>
                    </select>
                  </label>
                  <textarea
                    rows={5}
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder={
                      replyVisibility === 'internal'
                        ? 'Write an internal note for the team.'
                        : 'Write a reply the client can see in the portal.'
                    }
                  />
                  <button type="submit" className="primary-button" disabled={isReplying || !replyBody.trim()}>
                    {isReplying ? 'Sending…' : replyVisibility === 'internal' ? 'Save note' : 'Send reply'}
                  </button>
                </form>
              </>
            ) : (
              <EmptyState title="Pick a thread" description="Select a conversation to view its timeline and reply." />
            )}
          </article>
        </div>
      </section>
    </>
  )
}
