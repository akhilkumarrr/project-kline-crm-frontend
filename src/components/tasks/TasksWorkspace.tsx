import { useEffect, useState } from 'react'
import { LoadState } from '../LoadState'
import { TaskEditor, createEmptyTaskForm } from './TaskEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import {
  api,
  type ContactRecord,
  type CurrentUser,
  type LeadRecord,
  type TaskPayload,
  type TaskRecord,
} from '../../lib/api'

type TaskViewModel = {
  assignee: string
  category?: string | null
  description?: string | null
  dueDate?: string | null
  id: string
  priority: string
  relatedLabel: string
  relatedType?: string | null
  status: string
  title: string
  tone: string
}

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const formatPriority = (priority: string) =>
  priority.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const formatTaskDueDate = (dateValue?: string | null) => {
  if (!dateValue) {
    return 'No due date'
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return date.toLocaleDateString()
}

const buildRelatedLabel = (
  task: TaskRecord,
  contacts: ContactRecord[],
  leads: LeadRecord[],
) => {
  if (!task.relatedEntityType || !task.relatedEntityId) {
    return 'Not linked'
  }

  if (task.relatedEntityType === 'contact') {
    const contact = contacts.find((item) => item.id === task.relatedEntityId)
    return contact ? `${contact.firstName} ${contact.lastName}`.trim() : 'Linked contact'
  }

  if (task.relatedEntityType === 'lead') {
    const lead = leads.find((item) => item.id === task.relatedEntityId)
    return lead?.title || 'Linked lead'
  }

  return `${task.relatedEntityType} record`
}

const mapTask = (
  task: TaskRecord,
  contacts: ContactRecord[],
  leads: LeadRecord[],
): TaskViewModel => ({
  assignee:
    `${task.assignedUser?.firstName || ''} ${task.assignedUser?.lastName || ''}`.trim() ||
    task.assignedUser?.email ||
    'Unassigned',
  category: task.category,
  description: task.description,
  dueDate: task.dueDate,
  id: task.id,
  priority: task.priority || 'medium',
  relatedLabel: buildRelatedLabel(task, contacts, leads),
  relatedType: task.relatedEntityType,
  status: task.status || 'todo',
  title: task.title,
  tone:
    task.status === 'done'
      ? 'healthy'
      : task.priority === 'high'
        ? 'risk'
        : 'watching',
})

const toFormState = (task: TaskRecord): TaskPayload => ({
  assignedTo: task.assignedTo || '',
  category: task.category || '',
  description: task.description || '',
  dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
  priority: task.priority || 'medium',
  relatedEntityId: task.relatedEntityId || '',
  relatedEntityType: task.relatedEntityType || '',
  status: task.status || 'todo',
  title: task.title || '',
})

const trimTaskPayload = (form: TaskPayload): TaskPayload => ({
  assignedTo: form.assignedTo?.trim() || undefined,
  category: form.category?.trim() || undefined,
  description: form.description?.trim() || undefined,
  dueDate: form.dueDate?.trim() || undefined,
  priority: form.priority?.trim() || undefined,
  relatedEntityId: form.relatedEntityId?.trim() || undefined,
  relatedEntityType: form.relatedEntityType?.trim() || undefined,
  status: form.status?.trim() || undefined,
  title: form.title.trim(),
})

export function TasksWorkspace() {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [form, setForm] = useState<TaskPayload>(createEmptyTaskForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const tasksQuery = useApiQuery(
    Boolean(token),
    () => api.getTasks(token!, 1, 100),
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
  const tasks = (tasksQuery.data?.data ?? []).map((task) => mapTask(task, contacts, leads))

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || tasks[0] || null

  useEffect(() => {
    if (!selectedTaskId && tasks[0]) {
      setSelectedTaskId(tasks[0].id)
      return
    }

    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId) && tasks[0]) {
      setSelectedTaskId(tasks[0].id)
    }
  }, [selectedTaskId, tasks])

  const handleFormChange = (field: keyof TaskPayload, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value }

      if (field === 'relatedEntityType') {
        next.relatedEntityId = ''
      }

      return next
    })
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingTaskId(null)
    setForm(createEmptyTaskForm())
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (taskId: string) => {
    const source = tasksQuery.data?.data.find((task) => task.id === taskId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingTaskId(taskId)
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
      const payload = trimTaskPayload(form)

      if (editorMode === 'create') {
        const created = await api.createTask(token, payload)
        setSelectedTaskId(created.id)
      } else if (editingTaskId) {
        const updated = await api.updateTask(token, editingTaskId, payload)
        setSelectedTaskId(updated.id)
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save task')
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickStatus = async (status: string) => {
    if (!token || !selectedTaskId) {
      return
    }

    try {
      await api.updateTaskStatus(token, selectedTaskId, status)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not update task status')
    }
  }

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Execution</p>
                <h3>Task command center</h3>
              </div>
              <div className="inline-actions">
                <span className="pill neutral">
                  {tasksQuery.data?.total ? `${tasksQuery.data.total} active tasks` : 'Task queue'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New task
                </button>
              </div>
            </div>

            <LoadState
              loading={
                tasksQuery.loading ||
                contactsQuery.loading ||
                leadsQuery.loading ||
                usersQuery.loading
              }
              error={
                tasksQuery.error ||
                contactsQuery.error ||
                leadsQuery.error ||
                usersQuery.error
              }
              title="Loading tasks"
            />

            <div className="table-list">
              {tasks.map((task) => (
                <div
                  className={
                    task.id === selectedTask?.id
                      ? 'table-row contact-row selected'
                      : 'table-row contact-row'
                  }
                  key={task.id}
                >
                  <button
                    type="button"
                    className="row-hitbox"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.description || task.relatedLabel}</p>
                    </div>
                    <div>
                      <span className="data-label">Status</span>
                      <b>{formatStatus(task.status)}</b>
                    </div>
                    <div>
                      <span className="data-label">Priority</span>
                      <b>{formatPriority(task.priority)}</b>
                    </div>
                    <div>
                      <span className="data-label">Due</span>
                      <b>{formatTaskDueDate(task.dueDate)}</b>
                    </div>
                    <div>
                      <span className={`status-chip ${task.tone}`}>{task.assignee}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="ghost-button compact-button"
                    onClick={() => openEdit(task.id)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected task</p>
                <h3>{selectedTask?.title || 'Task detail'}</h3>
              </div>
              {selectedTask ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedTask.id)}
                >
                  Edit task
                </button>
              ) : null}
            </div>

            {selectedTask ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">Status</span>
                    <strong>{formatStatus(selectedTask.status)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Priority</span>
                    <strong>{formatPriority(selectedTask.priority)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Assignee</span>
                    <strong>{selectedTask.assignee}</strong>
                  </div>
                  <div>
                    <span className="data-label">Due date</span>
                    <strong>{formatTaskDueDate(selectedTask.dueDate)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Category</span>
                    <strong>{selectedTask.category || 'General'}</strong>
                  </div>
                  <div>
                    <span className="data-label">Linked record</span>
                    <strong>{selectedTask.relatedLabel}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Description</span>
                  <p>{selectedTask.description || 'No description yet for this task.'}</p>
                </div>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="ghost-button compact-button"
                    onClick={() => handleQuickStatus('todo')}
                  >
                    Mark todo
                  </button>
                  <button
                    type="button"
                    className="ghost-button compact-button"
                    onClick={() => handleQuickStatus('in_progress')}
                  >
                    Start task
                  </button>
                  <button
                    type="button"
                    className="primary-button compact-button"
                    onClick={() => handleQuickStatus('done')}
                  >
                    Complete
                  </button>
                </div>

                {saveError ? <p className="auth-error">{saveError}</p> : null}
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <TaskEditor
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        leads={leads}
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
