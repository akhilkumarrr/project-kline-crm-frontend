import { type FormEvent } from 'react'
import type { FormFieldConfig, FormTemplatePayload } from '../../lib/api'

export type FormTemplateFormState = FormTemplatePayload

type FormTemplateEditorProps = {
  form: FormTemplateFormState
  isOpen: boolean
  isSaving: boolean
  mode: 'create' | 'edit'
  onAddField: () => void
  onChange: (field: keyof FormTemplateFormState, value: string | FormFieldConfig[]) => void
  onClose: () => void
  onFieldChange: (fieldId: string, key: keyof FormFieldConfig, value: unknown) => void
  onRemoveField: (fieldId: string) => void
  onSubmit: () => Promise<void>
  saveError: string | null
}

const categoryOptions = [
  { label: 'Lead intake', value: 'lead_intake' },
  { label: 'Support request', value: 'support_request' },
  { label: 'Onboarding questionnaire', value: 'onboarding' },
  { label: 'General form', value: 'general' },
]

const visibilityOptions = [
  { label: 'Public link', value: 'public' },
  { label: 'Portal only', value: 'portal' },
  { label: 'Internal', value: 'internal' },
]

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const fieldTypeOptions = [
  { label: 'Short text', value: 'short_text' },
  { label: 'Long text', value: 'long_text' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Select', value: 'select' },
  { label: 'Multi-select', value: 'multi_select' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Date', value: 'date' },
  { label: 'Number', value: 'number' },
]

export function createDefaultFormField(index: number): FormFieldConfig {
  return {
    id: `field-${Date.now()}-${index}`,
    key: `field_${index}`,
    label: `Field ${index}`,
    type: 'short_text',
    required: false,
    placeholder: '',
    helpText: '',
    options: [],
  }
}

export function createEmptyFormTemplateForm(): FormTemplateFormState {
  return {
    name: '',
    slug: '',
    description: '',
    category: 'lead_intake',
    visibility: 'public',
    status: 'draft',
    title: '',
    introText: '',
    submitButtonLabel: 'Submit form',
    successMessage: 'Thanks, your response has been received.',
    fields: [
      {
        id: 'full-name',
        key: 'full_name',
        label: 'Full name',
        type: 'short_text',
        required: true,
        placeholder: 'Jane Doe',
      },
      {
        id: 'email',
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'jane@example.com',
      },
      {
        id: 'company',
        key: 'company',
        label: 'Company',
        type: 'short_text',
        required: false,
        placeholder: 'North Ridge Consulting',
      },
      {
        id: 'request',
        key: 'request',
        label: 'How can we help?',
        type: 'long_text',
        required: true,
        placeholder: 'Tell us about the engagement, issue, or workflow you want help with.',
      },
    ],
    settings: {},
  }
}

export function FormTemplateEditor({
  form,
  isOpen,
  isSaving,
  mode,
  onAddField,
  onChange,
  onClose,
  onFieldChange,
  onRemoveField,
  onSubmit,
  saveError,
}: FormTemplateEditorProps) {
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
        className="drawer-panel drawer-panel-wide"
        aria-label={mode === 'create' ? 'Create form' : 'Edit form'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{mode === 'create' ? 'New intake flow' : 'Form update'}</p>
            <h3>{mode === 'create' ? 'Create form' : 'Edit form'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-span-2">
              <span>Form name</span>
              <input required value={form.name} onChange={(event) => onChange('name', event.target.value)} />
            </label>

            <label className="field">
              <span>Slug</span>
              <input value={form.slug || ''} onChange={(event) => onChange('slug', event.target.value)} />
            </label>

            <label className="field">
              <span>Category</span>
              <select value={form.category || 'lead_intake'} onChange={(event) => onChange('category', event.target.value)}>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Visibility</span>
              <select value={form.visibility || 'public'} onChange={(event) => onChange('visibility', event.target.value)}>
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select value={form.status || 'draft'} onChange={(event) => onChange('status', event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Hero title</span>
              <input required value={form.title} onChange={(event) => onChange('title', event.target.value)} />
            </label>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea rows={3} value={form.description || ''} onChange={(event) => onChange('description', event.target.value)} />
            </label>

            <label className="field field-span-2">
              <span>Intro copy</span>
              <textarea rows={4} value={form.introText || ''} onChange={(event) => onChange('introText', event.target.value)} />
            </label>

            <label className="field">
              <span>Submit button</span>
              <input value={form.submitButtonLabel || ''} onChange={(event) => onChange('submitButtonLabel', event.target.value)} />
            </label>

            <label className="field">
              <span>Success message</span>
              <input value={form.successMessage || ''} onChange={(event) => onChange('successMessage', event.target.value)} />
            </label>
          </div>

          <div className="builder-section">
            <div className="stacked-row">
              <div>
                <p className="eyebrow">Field builder</p>
                <h4>Design the intake experience</h4>
              </div>
              <button type="button" className="ghost-button" onClick={onAddField}>
                + Add field
              </button>
            </div>

            <div className="builder-field-list">
              {form.fields.map((field) => (
                <article className="builder-field-card" key={field.id}>
                  <div className="form-grid">
                    <label className="field">
                      <span>Label</span>
                      <input value={field.label} onChange={(event) => onFieldChange(field.id, 'label', event.target.value)} />
                    </label>

                    <label className="field">
                      <span>Key</span>
                      <input value={field.key} onChange={(event) => onFieldChange(field.id, 'key', event.target.value)} />
                    </label>

                    <label className="field">
                      <span>Type</span>
                      <select value={field.type} onChange={(event) => onFieldChange(field.id, 'type', event.target.value)}>
                        {fieldTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Placeholder</span>
                      <input value={field.placeholder || ''} onChange={(event) => onFieldChange(field.id, 'placeholder', event.target.value)} />
                    </label>

                    <label className="field field-span-2">
                      <span>Help text</span>
                      <input value={field.helpText || ''} onChange={(event) => onFieldChange(field.id, 'helpText', event.target.value)} />
                    </label>

                    <label className="field checkbox-field">
                      <span>Required</span>
                      <input type="checkbox" checked={field.required} onChange={(event) => onFieldChange(field.id, 'required', event.target.checked)} />
                    </label>

                    {(field.type === 'select' || field.type === 'multi_select') ? (
                      <label className="field field-span-2">
                        <span>Options</span>
                        <input
                          value={(field.options || []).map((option) => option.label).join(', ')}
                          onChange={(event) =>
                            onFieldChange(
                              field.id,
                              'options',
                              event.target.value
                                .split(',')
                                .map((option) => option.trim())
                                .filter(Boolean)
                                .map((option) => ({ label: option, value: option.toLowerCase().replace(/\s+/g, '_') })),
                            )
                          }
                        />
                      </label>
                    ) : null}
                  </div>

                  <div className="inline-actions">
                    <button type="button" className="ghost-button compact-button" onClick={() => onRemoveField(field.id)}>
                      Remove field
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {saveError ? <p className="form-error">{saveError}</p> : null}

          <div className="drawer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving…' : mode === 'create' ? 'Create form' : 'Save form'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
