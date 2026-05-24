import { useEffect, useMemo, useState } from 'react'
import { LoadState } from '../LoadState'
import { OnboardingEditor, createEmptyOnboardingForm } from './OnboardingEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { useWorkspaceTemplate } from '../../hooks/useWorkspaceTemplate'
import {
  api,
  type ContactRecord,
  type CurrentUser,
  type LeadRecord,
  type OnboardingWorkflowPayload,
  type OnboardingWorkflowRecord,
} from '../../lib/api'

type WorkflowViewModel = {
  assignee: string
  contactLabel: string
  description?: string | null
  dueDate?: string | null
  id: string
  leadLabel: string
  name: string
  startDate?: string | null
  status: string
  stepCount: number
  tone: string
}

const statusOrder = ['planned', 'active', 'blocked', 'completed', 'cancelled']

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

const buildWorkflowTone = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'healthy'
    case 'active':
      return 'cool'
    case 'blocked':
      return 'risk'
    default:
      return 'watching'
  }
}

const buildDefaultSteps = (workflow: OnboardingWorkflowRecord, starterSteps: string[]) =>
  starterSteps.map((title, index) => ({
    completed:
      workflow.status === 'completed'
        ? true
        : workflow.status === 'active' && index < 2,
    title,
  }))

const mapWorkflow = (workflow: OnboardingWorkflowRecord, starterSteps: string[]): WorkflowViewModel => ({
  assignee:
    `${workflow.assignedUser?.firstName || ''} ${workflow.assignedUser?.lastName || ''}`.trim() ||
    workflow.assignedUser?.email ||
    'Unassigned',
  contactLabel:
    `${workflow.contact?.firstName || ''} ${workflow.contact?.lastName || ''}`.trim() ||
    workflow.contact?.company ||
    workflow.contact?.email ||
    'No contact',
  description: workflow.description,
  dueDate: workflow.dueDate,
  id: workflow.id,
  leadLabel: workflow.lead?.title || 'No linked lead',
  name: workflow.name,
  startDate: workflow.startDate,
  status: workflow.status || 'planned',
  stepCount: workflow.steps?.length || buildDefaultSteps(workflow, starterSteps).length,
  tone: buildWorkflowTone(workflow.status),
})

const toFormState = (workflow: OnboardingWorkflowRecord): OnboardingWorkflowPayload => ({
  assignedTo: workflow.assignedTo || '',
  contactId: workflow.contactId || '',
  description: workflow.description || '',
  dueDate: workflow.dueDate ? String(workflow.dueDate).slice(0, 10) : '',
  leadId: workflow.leadId || '',
  name: workflow.name || '',
  startDate: workflow.startDate ? String(workflow.startDate).slice(0, 10) : '',
  status: workflow.status || 'planned',
})

const trimWorkflowPayload = (
  form: OnboardingWorkflowPayload,
): OnboardingWorkflowPayload => ({
  assignedTo: form.assignedTo?.trim() || undefined,
  contactId: form.contactId?.trim() || undefined,
  description: form.description?.trim() || undefined,
  dueDate: form.dueDate?.trim() || undefined,
  leadId: form.leadId?.trim() || undefined,
  name: form.name.trim(),
  startDate: form.startDate?.trim() || undefined,
  status: form.status?.trim() || undefined,
})

export function OnboardingWorkspace() {
  const { token } = useAuth()
  const { labels, settings } = useWorkspaceTemplate()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null)
  const [form, setForm] = useState<OnboardingWorkflowPayload>(createEmptyOnboardingForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const workflowsQuery = useApiQuery(
    Boolean(token),
    () => api.getOnboardingWorkflows(token!),
    [token, refreshKey],
  )
  const contactsQuery = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!, 1, 100),
    [token],
  )
  const leadsQuery = useApiQuery(
    Boolean(token),
    () => api.getLeads(token!, 1, 100),
    [token],
  )
  const usersQuery = useApiQuery(
    Boolean(token),
    () => api.getUsers(token!, 1, 100),
    [token],
  )

  const contacts = contactsQuery.data?.data ?? []
  const leads = leadsQuery.data?.data ?? []
  const users = (usersQuery.data?.data ?? []) as CurrentUser[]
  const starterSteps = settings.runtime.starterPack.onboardingSteps
  const workflows = (workflowsQuery.data ?? []).map((workflow) => mapWorkflow(workflow, starterSteps))

  const groupedWorkflows = useMemo(
    () =>
      statusOrder.map((status) => ({
        items: workflows.filter((workflow) => workflow.status === status),
        status,
      })),
    [workflows],
  )

  const selectedWorkflow =
    workflows.find((workflow) => workflow.id === selectedWorkflowId) || workflows[0] || null

  useEffect(() => {
    if (!selectedWorkflowId && workflows[0]) {
      setSelectedWorkflowId(workflows[0].id)
      return
    }

    if (
      selectedWorkflowId &&
      !workflows.some((workflow) => workflow.id === selectedWorkflowId) &&
      workflows[0]
    ) {
      setSelectedWorkflowId(workflows[0].id)
    }
  }, [selectedWorkflowId, workflows])

  const handleFormChange = (
    field: keyof OnboardingWorkflowPayload,
    value: string,
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingWorkflowId(null)
    setForm(
      createEmptyOnboardingForm(
        (contacts[0] as ContactRecord | undefined)?.id,
        (leads[0] as LeadRecord | undefined)?.id,
      ),
    )
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (workflowId: string) => {
    const source = workflowsQuery.data?.find((workflow) => workflow.id === workflowId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingWorkflowId(workflowId)
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
      const payload = trimWorkflowPayload(form)

      if (editorMode === 'create') {
        const created = await api.createOnboardingWorkflow(token, payload)
        setSelectedWorkflowId(created.id)
      } else if (editingWorkflowId) {
        const updated = await api.updateOnboardingWorkflow(token, editingWorkflowId, payload)
        setSelectedWorkflowId(updated.id)
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save onboarding workflow')
    } finally {
      setIsSaving(false)
    }
  }

  const activeCount = workflows.filter((workflow) => workflow.status === 'active').length

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Delivery</p>
                <h3>{labels.onboardingPlural}</h3>
              </div>
              <div className="inline-actions">
                <span className="pill success">
                  {workflows.length ? `${activeCount} active launches` : 'Launch queue'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New {labels.onboardingSingular.toLowerCase()}
                </button>
              </div>
            </div>

            <LoadState
              loading={
                workflowsQuery.loading ||
                contactsQuery.loading ||
                leadsQuery.loading ||
                usersQuery.loading
              }
              error={
                workflowsQuery.error ||
                contactsQuery.error ||
                leadsQuery.error ||
                usersQuery.error
              }
              title={`Loading ${labels.onboardingPlural.toLowerCase()}`}
            />

            <div className="launch-board">
              {groupedWorkflows.map((group) => (
                <section className="launch-column" key={group.status}>
                  <header className="launch-day">
                    <strong>{formatTitleCase(group.status)}</strong>
                    <span>{group.items.length} workflows</span>
                  </header>

                  <div className="launch-stack">
                    {group.items.length ? (
                      group.items.map((workflow) => (
                        <article
                          className={
                            workflow.id === selectedWorkflow?.id
                              ? 'launch-card selected-launch-card'
                              : 'launch-card'
                          }
                          key={workflow.id}
                        >
                          <button
                            type="button"
                            className="schedule-button"
                            onClick={() => setSelectedWorkflowId(workflow.id)}
                          >
                            <div className="schedule-topline">
                              <span className={`schedule-tag ${workflow.tone}`}>
                                {workflow.stepCount} steps
                              </span>
                              <b>{formatDate(workflow.dueDate)}</b>
                            </div>
                            <strong>{workflow.name}</strong>
                            <p>{workflow.contactLabel}</p>
                          </button>

                          <button
                            type="button"
                            className="ghost-button compact-button"
                            onClick={() => openEdit(workflow.id)}
                          >
                            Edit
                          </button>
                        </article>
                      ))
                    ) : (
                      <div className="empty-card">No {labels.onboardingPlural.toLowerCase()} in this status.</div>
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
                <p className="eyebrow">Selected {labels.onboardingSingular.toLowerCase()}</p>
                <h3>{selectedWorkflow?.name || `${labels.onboardingSingular} detail`}</h3>
              </div>
              {selectedWorkflow ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedWorkflow.id)}
                >
                  Edit {labels.onboardingSingular.toLowerCase()}
                </button>
              ) : null}
            </div>

            {selectedWorkflow ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">Status</span>
                    <strong>{formatTitleCase(selectedWorkflow.status)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Assigned to</span>
                    <strong>{selectedWorkflow.assignee}</strong>
                  </div>
                  <div>
                    <span className="data-label">{labels.contactSingular}</span>
                    <strong>{selectedWorkflow.contactLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Lead</span>
                    <strong>{selectedWorkflow.leadLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Start date</span>
                    <strong>{formatDate(selectedWorkflow.startDate)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Due date</span>
                    <strong>{formatDate(selectedWorkflow.dueDate)}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Description</span>
                  <p>
                    {selectedWorkflow.description ||
                      `No launch notes have been added to this ${labels.onboardingSingular.toLowerCase()} yet.`}
                  </p>
                </div>

                <div className="detail-note">
                  <span className="data-label">Milestone shape</span>
                  <p>{`${selectedWorkflow.stepCount} tracked milestones in the current plan.`}</p>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <OnboardingEditor
        contactLabelSingular={labels.contactSingular}
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        leads={leads}
        mode={editorMode}
        onboardingLabelSingular={labels.onboardingSingular}
        onChange={handleFormChange}
        onClose={closeEditor}
        onSubmit={handleSave}
        saveError={saveError}
        users={users}
      />
    </>
  )
}
