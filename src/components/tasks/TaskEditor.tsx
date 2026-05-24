import { type FormEvent } from 'react'
import type { ContactRecord, CurrentUser, LeadRecord, TaskPayload } from '../../lib/api'

export type TaskFormState = TaskPayload

type TaskEditorProps = {
  categorySuggestions?: string[]
  contactLabelSingular?: string
  contacts: ContactRecord[]
  form: TaskFormState
  isOpen: boolean
  isSaving: boolean
  leads: LeadRecord[]
  mode: 'create' | 'edit'
  onChange: (field: keyof TaskFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
  users: CurrentUser[]
}

const statusOptions = [
  { label: 'Todo', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const relatedEntityOptions = [
  { label: 'None', value: '' },
  { label: 'Contact', value: 'contact' },
  { label: 'Lead', value: 'lead' },
  { label: 'Quote', value: 'quote' },
]

export function createEmptyTaskForm(): TaskFormState {
  return {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    category: '',
    assignedTo: '',
    relatedEntityType: '',
    relatedEntityId: '',
  }
}

export function TaskEditor({
  categorySuggestions = [],
  contactLabelSingular = 'Contact',
  contacts,
  form,
  isOpen,
  isSaving,
  leads,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
  users,
}: TaskEditorProps) {
  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  const relatedOptions =
    form.relatedEntityType === 'contact'
      ? contacts.map((contact) => ({
          label: `${contact.firstName} ${contact.lastName}`.trim(),
          value: contact.id,
        }))
      : form.relatedEntityType === 'lead'
        ? leads.map((lead) => ({
            label: lead.title,
            value: lead.id,
          }))
        : []

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <section
        className="drawer-panel"
        aria-label={mode === 'create' ? 'Create task' : 'Edit task'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New follow-up' : 'Update task'}</p>
            <h3>{mode === 'create' ? 'Create task' : 'Edit task'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-span-2">
              <span>Task title</span>
              <input
                required
                value={form.title}
                onChange={(event) => onChange('title', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select value={form.status || 'todo'} onChange={(event) => onChange('status', event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={form.priority || 'medium'}
                onChange={(event) => onChange('priority', event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={(event) => onChange('dueDate', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Category</span>
              <input
                list="task-category-suggestions"
                value={form.category || ''}
                onChange={(event) => onChange('category', event.target.value)}
              />
              {categorySuggestions.length ? (
                <datalist id="task-category-suggestions">
                  {categorySuggestions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              ) : null}
            </label>

            <label className="field">
              <span>Assign to</span>
              <select
                value={form.assignedTo || ''}
                onChange={(event) => onChange('assignedTo', event.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Related entity</span>
              <select
                value={form.relatedEntityType || ''}
                onChange={(event) => onChange('relatedEntityType', event.target.value)}
              >
                {relatedEntityOptions.map((option) => (
                  <option key={option.value || 'none'} value={option.value}>
                    {option.value === 'contact' ? contactLabelSingular : option.label}
                  </option>
                ))}
              </select>
            </label>

            {form.relatedEntityType ? (
              <label className="field field-span-2">
                <span>Linked record</span>
                <select
                  value={form.relatedEntityId || ''}
                  onChange={(event) => onChange('relatedEntityId', event.target.value)}
                >
                  <option value="">Select a record</option>
                  {relatedOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="field field-span-2">
              <span>Description</span>
              <textarea
                rows={5}
                value={form.description || ''}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </label>
          </div>

          {saveError ? <p className="auth-error">{saveError}</p> : null}

          <div className="drawer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create task' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
