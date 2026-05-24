import { type FormEvent } from 'react'
import type { EmailTemplatePayload, EmailTemplateVariable } from '../../lib/api'

export type EmailTemplateFormState = EmailTemplatePayload & {
  variablesText: string
}

type EmailTemplateEditorProps = {
  form: EmailTemplateFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onChange: (field: keyof EmailTemplateFormState, value: string) => void
  onClose: () => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

const templateTypes = [
  'CUSTOM',
  'QUOTE_SENT',
  'CONTRACT_SENT',
  'LEAD_ASSIGNED',
  'TASK_CREATED',
]

export function createEmptyEmailTemplateForm(): EmailTemplateFormState {
  return {
    name: '',
    subject: '',
    body: '',
    templateType: 'CUSTOM',
    variablesText: '',
  }
}

export function parseTemplateVariables(variablesText: string): EmailTemplateVariable[] {
  return variablesText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', example = '', description = ''] = line.split('|').map((item) => item.trim())
      return {
        description: description || undefined,
        example,
        name,
      }
    })
    .filter((item) => item.name && item.example)
}

export function EmailTemplateEditor({
  form,
  isOpen,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
  saveError,
}: EmailTemplateEditorProps) {
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
        aria-label={mode === 'create' ? 'Create email template' : 'Edit email template'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New template' : 'Template update'}</p>
            <h3>{mode === 'create' ? 'Create email template' : 'Edit email template'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Template name</span>
              <input required value={form.name} onChange={(event) => onChange('name', event.target.value)} />
            </label>

            <label className="field">
              <span>Type</span>
              <select
                value={form.templateType || 'CUSTOM'}
                onChange={(event) => onChange('templateType', event.target.value)}
              >
                {templateTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Subject</span>
              <input
                required
                value={form.subject}
                onChange={(event) => onChange('subject', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Body</span>
              <textarea
                required
                rows={8}
                value={form.body}
                onChange={(event) => onChange('body', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Variables</span>
              <textarea
                rows={5}
                placeholder="contactName | Elena Park | Customer full name"
                value={form.variablesText}
                onChange={(event) => onChange('variablesText', event.target.value)}
              />
            </label>
          </div>

          {saveError ? <p className="auth-error">{saveError}</p> : null}

          <div className="drawer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create template' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
