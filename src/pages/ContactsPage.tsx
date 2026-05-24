import { useEffect, useState } from 'react'
import { ActivityTimeline } from '../components/activities/ActivityTimeline'
import { EmptyState } from '../components/EmptyState'
import { RelatedFilesPanel } from '../components/files/RelatedFilesPanel'
import { NoteComposer } from '../components/activities/NoteComposer'
import { ContactEditor, createEmptyContactForm } from '../components/contacts/ContactEditor'
import { LoadState } from '../components/LoadState'
import { contactRecords } from '../data/crm-data'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import { useWorkspaceTemplate } from '../hooks/useWorkspaceTemplate'
import { readHashParam, readHashRouteState, replaceHashRoute } from '../lib/navigation'
import { api, type ContactPayload, type ContactRecord } from '../lib/api'

type ContactViewModel = {
  company: string
  createdAt?: string
  email: string
  health: string
  healthTone: string
  id: string
  name: string
  notes?: string | null
  owner: string
  phone?: string | null
  stage: string
  type?: string
  value: string
}

const mapContactRecord = (contact: ContactRecord): ContactViewModel => ({
  company: contact.company || contact.email,
  createdAt: contact.createdAt,
  email: contact.email,
  health: contact.type || 'individual',
  healthTone: contact.status === 'active' ? 'healthy' : contact.status === 'prospect' ? 'watching' : 'risk',
  id: contact.id,
  name: `${contact.firstName} ${contact.lastName}`.trim(),
  notes: contact.notes,
  owner:
    `${contact.owner?.firstName || ''} ${contact.owner?.lastName || ''}`.trim() ||
    contact.owner?.email ||
    'Owner',
  phone: contact.phone,
  stage: contact.status || 'active',
  type: contact.type,
  value: contact.jobTitle || 'Contact',
})

const mockContacts: ContactViewModel[] = contactRecords.map((contact, index) => ({
  company: contact.company,
  email: `${contact.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
  health: contact.health,
  healthTone: contact.healthTone,
  id: `mock-${index}`,
  name: contact.name,
  owner: contact.owner,
  stage: contact.stage,
  value: contact.value,
}))

const trimPayload = (form: ContactPayload): ContactPayload =>
  Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  ) as ContactPayload

const toFormState = (contact: ContactRecord): ContactPayload => ({
  firstName: contact.firstName || '',
  lastName: contact.lastName || '',
  email: contact.email || '',
  phone: contact.phone || '',
  company: contact.company || '',
  companyId: contact.companyId || '',
  jobTitle: contact.jobTitle || '',
  type: contact.type || 'individual',
  status: contact.status || 'active',
  address: contact.address || '',
  city: contact.city || '',
  state: contact.state || '',
  zipCode: contact.zipCode || '',
  country: contact.country || '',
  notes: contact.notes || '',
})

export function ContactsPage() {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const { settings } = useWorkspaceTemplate()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [form, setForm] = useState<ContactPayload>(createEmptyContactForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [noteRefreshKey, setNoteRefreshKey] = useState(0)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [isSavingNote, setIsSavingNote] = useState(false)

  const { data, error, loading } = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!),
    [token, refreshKey],
  )

  const companiesQuery = useApiQuery(Boolean(token), () => api.getCompanies(token!, 1, 200), [
    token,
    refreshKey,
  ])

  const liveContacts = data?.data ?? []
  const companies = companiesQuery.data?.data ?? []
  const contacts = liveContacts.length
    ? liveContacts.map(mapContactRecord)
    : mockContacts

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || contacts[0] || null

  const isLiveSelectedContact = Boolean(selectedContact && !selectedContact.id.startsWith('mock-'))

  const timelineQuery = useApiQuery(
    Boolean(token) && isLiveSelectedContact,
    () => api.getContactTimeline(token!, selectedContactId!),
    [token, selectedContactId, noteRefreshKey, isLiveSelectedContact],
  )

  const communicationsQuery = useApiQuery(
    Boolean(token) && isLiveSelectedContact,
    () => api.getContactCommunications(token!, selectedContactId!),
    [token, selectedContactId, noteRefreshKey, isLiveSelectedContact],
  )

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'contacts') {
        return
      }

      const nextSelected = readHashParam('selected')
      if (nextSelected) {
        setSelectedContactId(nextSelected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)

    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  useEffect(() => {
    if (!selectedContactId && contacts[0]) {
      setSelectedContactId(contacts[0].id)
      return
    }

    if (selectedContactId && !contacts.some((contact) => contact.id === selectedContactId) && contacts[0]) {
      setSelectedContactId(contacts[0].id)
    }
  }, [contacts, selectedContactId])

  useEffect(() => {
    if (!isLiveSelectedContact || !selectedContactId || readHashRouteState().route !== 'contacts') {
      return
    }

    replaceHashRoute('contacts', { selected: selectedContactId })
  }, [isLiveSelectedContact, selectedContactId])

  const handleFormChange = (field: keyof ContactPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingContactId(null)
    setForm(createEmptyContactForm())
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (contactId: string) => {
    const source = liveContacts.find((contact) => contact.id === contactId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingContactId(contactId)
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
      const payload = trimPayload(form)

      if (editorMode === 'create') {
        const created = await api.createContact(token, payload)
        setSelectedContactId(created.id)
        notifySuccess(`${payload.firstName} ${payload.lastName}`.trim() || 'New contact created.', 'Contact created')
      } else if (editingContactId) {
        const updated = await api.updateContact(token, editingContactId, payload)
        setSelectedContactId(updated.id)
        notifySuccess(`${payload.firstName} ${payload.lastName}`.trim() || 'Contact updated.', 'Contact saved')
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (saveFailure) {
      const message = saveFailure instanceof Error ? saveFailure.message : 'Could not save contact'
      setSaveError(message)
      notifyError(message, 'Contact save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNote = async () => {
    if (!token || !selectedContactId || !note.trim()) {
      setNoteError('Add a note before saving it to the contact timeline.')
      return
    }

    setIsSavingNote(true)
    setNoteError(null)

    try {
      await api.addContactNote(token, selectedContactId, {
        note: note.trim(),
      })
      setNote('')
      setNoteRefreshKey((current) => current + 1)
      notifySuccess('The note was added to the customer timeline.', 'Note saved')
    } catch (noteFailure) {
      const message = noteFailure instanceof Error ? noteFailure.message : 'Could not save note'
      setNoteError(message)
      notifyError(message, 'Note save failed')
    } finally {
      setIsSavingNote(false)
    }
  }

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Customer relationships</p>
                <h3>{settings.runtime.labels.contactPlural} and account health</h3>
              </div>
              <div className="inline-actions">
                <span className="pill cool">
                  {data?.total ? `${data.total} live records` : 'CRM records'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New {settings.runtime.labels.contactSingular.toLowerCase()}
                </button>
              </div>
            </div>

            <LoadState loading={loading} error={error} title={`Loading ${settings.runtime.labels.contactPlural.toLowerCase()}`} />

            {contacts.length ? (
              <div className="table-list">
                {contacts.map((contact) => (
                  <div
                    className={
                      contact.id === selectedContact?.id
                        ? 'table-row contact-row selected'
                        : 'table-row contact-row'
                    }
                    key={contact.id}
                  >
                    <button
                      type="button"
                      className="row-hitbox"
                      onClick={() => setSelectedContactId(contact.id)}
                    >
                      <div>
                        <strong>{contact.name}</strong>
                        <p>{contact.company}</p>
                      </div>
                      <div>
                        <span className="data-label">Stage</span>
                        <b>{contact.stage}</b>
                      </div>
                      <div>
                        <span className="data-label">Owner</span>
                        <b>{contact.owner}</b>
                      </div>
                      <div>
                        <span className="data-label">Title</span>
                        <b>{contact.value}</b>
                      </div>
                      <div>
                        <span className={`status-chip ${contact.healthTone}`}>{contact.health}</span>
                      </div>
                    </button>

                    {contact.id.startsWith('mock-') ? null : (
                      <button
                        type="button"
                        className="ghost-button compact-button"
                        onClick={() => openEdit(contact.id)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                actionLabel={`Create ${settings.runtime.labels.contactSingular.toLowerCase()}`}
                description="Create your first customer record to start tracking relationships, revenue, and timeline activity."
                onAction={openCreate}
                title={`No ${settings.runtime.labels.contactPlural.toLowerCase()} yet`}
              />
            )}
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected contact</p>
                <h3>{selectedContact?.name || 'Customer detail'}</h3>
              </div>
              {selectedContact && !selectedContact.id.startsWith('mock-') ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedContact.id)}
                >
                  Edit record
                </button>
              ) : null}
            </div>

            {selectedContact ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">Company</span>
                    <strong>{selectedContact.company}</strong>
                  </div>
                  <div>
                    <span className="data-label">Status</span>
                    <strong>{selectedContact.stage}</strong>
                  </div>
                  <div>
                    <span className="data-label">Email</span>
                    <strong>{selectedContact.email}</strong>
                  </div>
                  <div>
                    <span className="data-label">Phone</span>
                    <strong>{selectedContact.phone || 'Not added'}</strong>
                  </div>
                  <div>
                    <span className="data-label">Owner</span>
                    <strong>{selectedContact.owner}</strong>
                  </div>
                  <div>
                    <span className="data-label">Type</span>
                    <strong>{selectedContact.type || selectedContact.health}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Notes</span>
                  <p>{selectedContact.notes || 'No notes yet for this contact.'}</p>
                </div>
              </div>
            ) : (
              <EmptyState
                description="Pick a customer from the list to inspect their profile, notes, and communication history."
                title="No contact selected"
              />
            )}
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Timeline</p>
                <h3>{selectedContact?.company || 'Customer timeline'}</h3>
              </div>
            </div>
            {isLiveSelectedContact ? (
              <>
                <NoteComposer
                  buttonLabel="Add note to timeline"
                  isSaving={isSavingNote}
                  onChange={setNote}
                  onSubmit={handleSaveNote}
                  placeholder="Capture the latest call summary, follow-up, or context for this customer."
                  saveError={noteError}
                  value={note}
                />

                <LoadState
                  loading={timelineQuery.loading}
                  error={timelineQuery.error}
                  title="Loading contact timeline"
                />

                <ActivityTimeline
                  emptyMessage="No timeline activity has been recorded for this contact yet."
                  items={timelineQuery.data || []}
                />
              </>
            ) : (
              <div className="empty-card">Create or select a live contact to unlock the activity timeline.</div>
            )}
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Communications</p>
                <h3>{selectedContact?.name || 'Messages and meetings'}</h3>
              </div>
            </div>

            {isLiveSelectedContact ? (
              <>
                <LoadState
                  loading={communicationsQuery.loading}
                  error={communicationsQuery.error}
                  title="Loading communications"
                />
                <ActivityTimeline
                  emptyMessage="No communication history has been logged for this contact yet."
                  items={communicationsQuery.data || []}
                />
              </>
            ) : (
              <div className="empty-card">Live communications appear here once this contact has tracked activity.</div>
            )}
          </article>

          {isLiveSelectedContact ? (
            <RelatedFilesPanel
              title="Contact files"
              relatedType="contact"
              relatedId={selectedContactId!}
              refreshKey={refreshKey}
              emptyMessage="No files have been attached to this contact yet."
            />
          ) : null}
        </div>
      </section>

      <ContactEditor
        companies={companies}
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
