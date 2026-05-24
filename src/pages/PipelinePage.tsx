import { useEffect, useState } from 'react'
import { ActivityTimeline } from '../components/activities/ActivityTimeline'
import { EmptyState } from '../components/EmptyState'
import { NoteComposer } from '../components/activities/NoteComposer'
import { LeadEditor, createEmptyLeadForm } from '../components/leads/LeadEditor'
import { LoadState } from '../components/LoadState'
import { dealForecast, pipelineColumns } from '../data/crm-data'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import {
  navigateToRoute,
  readHashParam,
  readHashRouteState,
  replaceHashRoute,
} from '../lib/navigation'
import { api, type ContactRecord, type LeadPayload, type LeadRecord } from '../lib/api'

type PipelineDealView = {
  amount: string
  company: string
  contactId: string
  contactName: string
  expectedCloseDate?: string | null
  id: string
  name: string
  nextStep: string
  notes?: string | null
  owner: string
  probability?: string | null
  source?: string
  stage: string
  summary: string
  valueNumber: number
}

type PipelineColumnView = {
  count: number
  deals: PipelineDealView[]
  stage: string
  value: string
}

const stageOrder = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]

const stageLabels: Record<string, string> = {
  closed_lost: 'Closed lost',
  closed_won: 'Closed won',
  contacted: 'Contacted',
  negotiation: 'Negotiation',
  new: 'New',
  proposal: 'Proposal',
  qualified: 'Qualified',
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`

const formatStage = (stage: string) =>
  stageLabels[stage] || stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const mapLeadRecord = (lead: LeadRecord): PipelineDealView => {
  const numericValue = Number(lead.value || 0)
  return {
    amount: formatCurrency(numericValue),
    company: lead.contact?.company || lead.contact?.email || 'Account',
    contactId: lead.contactId,
    contactName:
      `${lead.contact?.firstName || ''} ${lead.contact?.lastName || ''}`.trim() || 'Unknown contact',
    expectedCloseDate: lead.expectedCloseDate,
    id: lead.id,
    name: lead.title,
    nextStep: lead.source || 'Follow up',
    notes: lead.notes,
    owner:
      `${lead.owner?.firstName || ''} ${lead.owner?.lastName || ''}`.trim() ||
      lead.owner?.email ||
      'Owner',
    probability: lead.probability,
    source: lead.source,
    stage: lead.stage || 'new',
    summary: lead.description || 'Lead in progress',
    valueNumber: numericValue,
  }
}

const toFormState = (lead: LeadRecord): LeadPayload => ({
  title: lead.title || '',
  description: lead.description || '',
  contactId: lead.contactId || '',
  stage: lead.stage || 'new',
  source: lead.source || 'other',
  value: Number(lead.value || 0),
  probability: lead.probability || '',
  expectedCloseDate: lead.expectedCloseDate ? String(lead.expectedCloseDate).slice(0, 10) : '',
  notes: lead.notes || '',
})

const trimLeadPayload = (form: LeadPayload): LeadPayload => ({
  ...form,
  description: form.description?.trim() || undefined,
  expectedCloseDate: form.expectedCloseDate?.trim() || undefined,
  notes: form.notes?.trim() || undefined,
  probability: form.probability?.trim() || undefined,
  source: form.source?.trim() || undefined,
  stage: form.stage?.trim() || undefined,
  title: form.title.trim(),
  value: Number(form.value || 0),
})

export function PipelinePage() {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [form, setForm] = useState<LeadPayload>(createEmptyLeadForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [noteRefreshKey, setNoteRefreshKey] = useState(0)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [isSavingNote, setIsSavingNote] = useState(false)

  const leadsQuery = useApiQuery(
    Boolean(token),
    () => api.getLeads(token!, 1, 100),
    [token, refreshKey],
  )

  const contactsQuery = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!, 1, 100),
    [token],
  )

  const liveLeads = leadsQuery.data?.data ?? []
  const contacts = contactsQuery.data?.data ?? []
  const liveDeals = liveLeads.map(mapLeadRecord)

  const groupedColumns: PipelineColumnView[] = liveDeals.length
    ? stageOrder.map((stage) => {
        const deals = liveDeals.filter((lead) => lead.stage === stage)
        return {
          count: deals.length,
          deals,
          stage,
          value: formatCurrency(deals.reduce((sum, lead) => sum + lead.valueNumber, 0)),
        }
      })
    : pipelineColumns.map((column) => ({
        count: column.count,
        deals: column.deals.map((deal, index) => ({
          amount: deal.amount,
          company: deal.name,
          contactId: `mock-contact-${index}`,
          contactName: deal.name,
          id: `mock-lead-${column.stage}-${index}`,
          name: deal.name,
          nextStep: deal.nextStep,
          owner: deal.owner,
          stage: column.stage.toLowerCase().replace(/\s+/g, '_'),
          summary: deal.summary,
          valueNumber: Number(deal.amount.replace(/[^0-9.-]+/g, '')),
        })),
        stage: column.stage.toLowerCase().replace(/\s+/g, '_'),
        value: column.value,
      }))

  const selectedLead =
    liveDeals.find((lead) => lead.id === selectedLeadId) ||
    groupedColumns.flatMap((column) => column.deals).find((lead) => lead.id === selectedLeadId) ||
    groupedColumns.flatMap((column) => column.deals)[0] ||
    null

  const isLiveSelectedLead = Boolean(selectedLead && !selectedLead.id.startsWith('mock-'))

  const timelineQuery = useApiQuery(
    Boolean(token) && isLiveSelectedLead,
    () => api.getLeadTimeline(token!, selectedLeadId!),
    [token, selectedLeadId, noteRefreshKey, isLiveSelectedLead],
  )

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'pipeline') {
        return
      }

      const nextSelected = readHashParam('selected')
      if (nextSelected) {
        setSelectedLeadId(nextSelected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)

    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  useEffect(() => {
    const firstDeal = groupedColumns.flatMap((column) => column.deals)[0]
    if (!selectedLeadId && firstDeal) {
      setSelectedLeadId(firstDeal.id)
      return
    }

    if (
      selectedLeadId &&
      !groupedColumns.flatMap((column) => column.deals).some((lead) => lead.id === selectedLeadId) &&
      firstDeal
    ) {
      setSelectedLeadId(firstDeal.id)
    }
  }, [groupedColumns, selectedLeadId])

  useEffect(() => {
    if (!isLiveSelectedLead || !selectedLeadId || readHashRouteState().route !== 'pipeline') {
      return
    }

    replaceHashRoute('pipeline', { selected: selectedLeadId })
  }, [isLiveSelectedLead, selectedLeadId])

  const handleFormChange = (field: keyof LeadPayload, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'value' ? Number(value) : value,
    }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingLeadId(null)
    setForm(createEmptyLeadForm((contacts[0] as ContactRecord | undefined)?.id))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (leadId: string) => {
    const source = liveLeads.find((lead) => lead.id === leadId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingLeadId(leadId)
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
      const payload = trimLeadPayload(form)

      if (editorMode === 'create') {
        const created = await api.createLead(token, payload)
        setSelectedLeadId(created.id)
        notifySuccess(payload.title, 'Lead created')
      } else if (editingLeadId) {
        const updated = await api.updateLead(token, editingLeadId, payload)
        setSelectedLeadId(updated.id)
        notifySuccess(payload.title, 'Lead saved')
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (saveFailure) {
      const message = saveFailure instanceof Error ? saveFailure.message : 'Could not save lead'
      setSaveError(message)
      notifyError(message, 'Lead save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNote = async () => {
    if (!token || !selectedLeadId || !note.trim()) {
      setNoteError('Add a note before saving it to the lead timeline.')
      return
    }

    setIsSavingNote(true)
    setNoteError(null)

    try {
      await api.createActivity(token, {
        relatedType: 'lead',
        relatedId: selectedLeadId,
        type: 'note_added',
        description: note.trim(),
      })
      setNote('')
      setNoteRefreshKey((current) => current + 1)
      notifySuccess('The note was added to this opportunity timeline.', 'Note saved')
    } catch (noteFailure) {
      const message = noteFailure instanceof Error ? noteFailure.message : 'Could not save lead note'
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
                <p className="eyebrow">Sales workflow</p>
                <h3>Pipeline board</h3>
              </div>
              <div className="inline-actions">
                <span className="pill warm">
                  {leadsQuery.data?.total
                    ? `${leadsQuery.data.total} live opportunities`
                    : 'Live opportunities'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New lead
                </button>
              </div>
            </div>

            <LoadState
              loading={leadsQuery.loading || contactsQuery.loading}
              error={leadsQuery.error || contactsQuery.error}
              title="Loading pipeline"
            />

            {groupedColumns.flatMap((column) => column.deals).length ? (
              <div className="pipeline-board">
                {groupedColumns.map((column) => (
                  <section className="pipeline-column" key={column.stage}>
                    <header>
                      <div>
                        <strong>{formatStage(column.stage)}</strong>
                        <span>{column.count} deals</span>
                      </div>
                      <b>{column.value}</b>
                    </header>
                    <div className="deal-stack">
                      {column.deals.length ? (
                        column.deals.map((deal) => (
                          <article
                            className={
                              deal.id === selectedLead?.id ? 'deal-card selected-deal' : 'deal-card'
                            }
                            key={deal.id}
                          >
                            <button
                              type="button"
                              className="deal-button"
                              onClick={() => setSelectedLeadId(deal.id)}
                            >
                              <div className="deal-row">
                                <strong>{deal.name}</strong>
                                <span>{deal.owner}</span>
                              </div>
                              <p>{deal.summary}</p>
                              <div className="deal-row">
                                <b>{deal.amount}</b>
                                <span>{deal.nextStep}</span>
                              </div>
                            </button>
                            {deal.id.startsWith('mock-') ? null : (
                              <button
                                type="button"
                                className="ghost-button compact-button"
                                onClick={() => openEdit(deal.id)}
                              >
                                Edit
                              </button>
                            )}
                          </article>
                        ))
                      ) : (
                        <div className="empty-card">No leads in this stage yet.</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                actionLabel="Create lead"
                description="Create your first opportunity to start tracking pipeline movement, forecast value, and buyer notes."
                onAction={openCreate}
                title="No live opportunities yet"
              />
            )}
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected opportunity</p>
                <h3>{selectedLead?.name || 'Lead detail'}</h3>
              </div>
              {selectedLead && !selectedLead.id.startsWith('mock-') ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedLead.id)}
                >
                  Edit lead
                </button>
              ) : null}
            </div>

            {selectedLead ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">Account</span>
                    <strong>{selectedLead.company}</strong>
                  </div>
                  <div>
                    <span className="data-label">Contact</span>
                    <strong>{selectedLead.contactName}</strong>
                  </div>
                  <div>
                    <span className="data-label">Stage</span>
                    <strong>{formatStage(selectedLead.stage)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Source</span>
                    <strong>{selectedLead.source || 'Other'}</strong>
                  </div>
                  <div>
                    <span className="data-label">Value</span>
                    <strong>{selectedLead.amount}</strong>
                  </div>
                  <div>
                    <span className="data-label">Probability</span>
                    <strong>{selectedLead.probability || 'Not set'}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Notes</span>
                  <p>{selectedLead.notes || selectedLead.summary || 'No notes yet for this lead.'}</p>
                </div>

                {!selectedLead.id.startsWith('mock-') ? (
                  <div className="context-link-row">
                    <button
                      type="button"
                      className="ghost-button compact-button context-link-button"
                      onClick={() => navigateToRoute('contacts', { selected: selectedLead.contactId })}
                    >
                      Open contact
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                description="Select an opportunity to inspect deal context, buyer notes, and the linked account."
                title="No opportunity selected"
              />
            )}
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Activity</p>
                <h3>Lead timeline</h3>
              </div>
            </div>
            {isLiveSelectedLead ? (
              <>
                <NoteComposer
                  buttonLabel="Add note to lead"
                  isSaving={isSavingNote}
                  onChange={setNote}
                  onSubmit={handleSaveNote}
                  placeholder="Log buyer feedback, next steps, or objections for this opportunity."
                  saveError={noteError}
                  value={note}
                />
                <LoadState
                  loading={timelineQuery.loading}
                  error={timelineQuery.error}
                  title="Loading lead activity"
                />
                <ActivityTimeline
                  emptyMessage="No lead activity has been captured yet."
                  items={timelineQuery.data || []}
                />
              </>
            ) : (
              <div className="empty-card">Live lead activity appears here once this opportunity exists in the CRM.</div>
            )}
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Forecast</p>
                <h3>Close plan</h3>
              </div>
            </div>
            <div className="table-list compact-list">
              {(leadsQuery.data?.data?.length ? groupedColumns : dealForecast).map((item: any) => (
                <div className="table-row stacked-row" key={item.label || item.stage}>
                  <div>
                    <strong>{item.label || formatStage(item.stage)}</strong>
                    <p>{item.detail || `${item.count} deals in this stage`}</p>
                  </div>
                  <b>{item.value}</b>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <LeadEditor
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
