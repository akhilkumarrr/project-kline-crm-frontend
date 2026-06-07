import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import {
  FormTemplateEditor,
  createDefaultFormField,
  createEmptyFormTemplateForm,
  type FormTemplateFormState,
} from '../components/forms/FormTemplateEditor'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import { api, type FormFieldConfig, type FormTemplatePayload, type FormTemplateRecord } from '../lib/api'
import { readHashParam, readHashRouteState, replaceHashRoute } from '../lib/navigation'

const toFormState = (form: FormTemplateRecord): FormTemplateFormState => ({
  name: form.name || '',
  slug: form.slug || '',
  description: form.description || '',
  category: form.category || 'general',
  visibility: form.visibility || 'public',
  status: form.status || 'draft',
  title: form.title || '',
  introText: form.introText || '',
  submitButtonLabel: form.submitButtonLabel || 'Submit form',
  successMessage: form.successMessage || 'Thanks, your response has been received.',
  fields: form.fields || [],
  settings: form.settings || {},
})

const trimPayload = (form: FormTemplatePayload): FormTemplatePayload =>
  ({
    ...form,
    name: form.name.trim(),
    slug: form.slug?.trim(),
    description: form.description?.trim(),
    title: form.title.trim(),
    introText: form.introText?.trim(),
    submitButtonLabel: form.submitButtonLabel?.trim(),
    successMessage: form.successMessage?.trim(),
    fields: form.fields.map((field) => ({
      ...field,
      key: field.key.trim(),
      label: field.label.trim(),
      placeholder: field.placeholder?.trim(),
      helpText: field.helpText?.trim(),
    })),
  })

const formatVisibility = (value?: string) => value?.replace(/_/g, ' ') || 'public'
const formatCategory = (value?: string) => value?.replace(/_/g, ' ') || 'general'

export function FormsPage() {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingFormId, setEditingFormId] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormTemplateFormState>(createEmptyFormTemplateForm())
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const formsQuery = useApiQuery(Boolean(token), () => api.getForms(token!, 1, 100), [token, refreshKey])

  const forms = formsQuery.data?.data ?? []
  const selectedForm = forms.find((form) => form.id === selectedFormId) || forms[0] || null

  const detailQuery = useApiQuery(
    Boolean(token) && Boolean(selectedForm?.id),
    () => api.getForm(token!, selectedForm!.id),
    [token, selectedForm?.id, refreshKey],
  )

  const submissionsQuery = useApiQuery(
    Boolean(token) && Boolean(selectedForm?.id),
    () => api.getFormSubmissions(token!, selectedForm!.id),
    [token, selectedForm?.id, refreshKey],
  )

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'forms') {
        return
      }

      const nextSelected = readHashParam('selected')
      if (nextSelected) {
        setSelectedFormId(nextSelected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)
    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  useEffect(() => {
    if (!selectedFormId && forms[0]) {
      setSelectedFormId(forms[0].id)
      return
    }

    if (selectedFormId && !forms.some((form) => form.id === selectedFormId) && forms[0]) {
      setSelectedFormId(forms[0].id)
    }
  }, [forms, selectedFormId])

  useEffect(() => {
    if (!selectedFormId || readHashRouteState().route !== 'forms') {
      return
    }

    replaceHashRoute('forms', { selected: selectedFormId })
  }, [selectedFormId])

  const submissionStats = useMemo(
    () => [
      {
        label: 'Submissions',
        value: submissionsQuery.data?.total || 0,
      },
      {
        label: 'Fields',
        value: detailQuery.data?.fields?.length || 0,
      },
      {
        label: 'Visibility',
        value: formatVisibility(detailQuery.data?.visibility),
      },
      {
        label: 'Category',
        value: formatCategory(detailQuery.data?.category),
      },
    ],
    [detailQuery.data, submissionsQuery.data],
  )

  const handleChange = (field: keyof FormTemplateFormState, value: string | FormFieldConfig[]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleFieldChange = (fieldId: string, key: keyof FormFieldConfig, value: unknown) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === fieldId ? { ...field, [key]: value } : field)),
    }))
  }

  const handleAddField = () => {
    setFormState((current) => ({
      ...current,
      fields: [...current.fields, createDefaultFormField(current.fields.length + 1)],
    }))
  }

  const handleRemoveField = (fieldId: string) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== fieldId),
    }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingFormId(null)
    setFormState(createEmptyFormTemplateForm())
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (formId: string) => {
    const source = forms.find((form) => form.id === formId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingFormId(formId)
    setFormState(toFormState(source))
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
      const payload = trimPayload(formState)
      const result =
        editorMode === 'create'
          ? await api.createForm(token, payload)
          : await api.updateForm(token, editingFormId!, payload)
      setSelectedFormId(result.id)
      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
      notifySuccess(result.name, editorMode === 'create' ? 'Form created' : 'Form updated')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save form'
      setSaveError(message)
      notifyError(message, 'Form save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const previewPublicForm = () => {
    if (!selectedForm?.slug) {
      return
    }

    if (selectedForm.visibility === 'portal') {
      window.location.hash = `/portal?tab=forms`
      return
    }

    window.location.hash = `/intake?slug=${encodeURIComponent(selectedForm.slug)}`
  }

  if (formsQuery.loading) {
    return <LoadState loading title="Loading forms" />
  }

  if (formsQuery.error) {
    return <LoadState loading={false} error={formsQuery.error} title="Could not load forms" />
  }

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="panel-card">
            <div className="panel-card-header">
              <div>
                <p className="eyebrow">Forms and intake</p>
                <h3>Capture leads, support requests, and onboarding answers</h3>
              </div>
              <button type="button" className="primary-button" onClick={openCreate}>
                + New form
              </button>
            </div>

            {forms.length ? (
              <div className="list-shell">
                {forms.map((form) => (
                  <button
                    key={form.id}
                    type="button"
                    className={form.id === selectedForm?.id ? 'list-row active' : 'list-row'}
                    onClick={() => setSelectedFormId(form.id)}
                  >
                    <div>
                      <strong>{form.name}</strong>
                      <p>{form.title}</p>
                    </div>
                    <div className="list-row-actions">
                      <span className="status-pill neutral">{formatVisibility(form.visibility)}</span>
                      <span className="status-pill neutral">{form.status || 'draft'}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No forms yet"
                description="Create intake flows for new leads, support requests, and onboarding questionnaires."
                actionLabel="Create form"
                onAction={openCreate}
              />
            )}
          </article>
        </div>

        <aside className="detail-column">
          {selectedForm ? (
            <>
              <article className="panel-card detail-card">
                <div className="detail-card-header">
                  <div>
                    <p className="eyebrow">Form detail</p>
                    <h3>{selectedForm.name}</h3>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => openEdit(selectedForm.id)}>
                    Edit
                  </button>
                </div>

                <p className="detail-copy">{detailQuery.data?.introText || detailQuery.data?.description || 'No intro copy added yet.'}</p>

                <div className="mini-stat-grid">
                  {submissionStats.map((item) => (
                    <div className="mini-stat-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="detail-stack">
                  <div className="detail-row">
                    <span>Slug</span>
                    <strong>{detailQuery.data?.slug || 'Pending'}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Public route</span>
                    <strong>#/intake?slug={detailQuery.data?.slug || '...'}</strong>
                  </div>
                </div>

                <div className="inline-actions">
                  {(detailQuery.data?.visibility === 'public' || detailQuery.data?.visibility === 'portal') ? (
                    <button type="button" className="ghost-button" onClick={previewPublicForm}>
                      Preview intake page
                    </button>
                  ) : null}
                </div>
              </article>

              <article className="panel-card">
                <div className="panel-card-header">
                  <div>
                    <p className="eyebrow">Form fields</p>
                    <h3>What clients will fill out</h3>
                  </div>
                </div>

                <div className="compact-list list-shell">
                  {(detailQuery.data?.fields || []).map((field) => (
                    <div className="list-row static" key={field.id}>
                      <div>
                        <strong>{field.label}</strong>
                        <p>{field.key} · {field.type.replace(/_/g, ' ')}</p>
                      </div>
                      <span className="status-pill neutral">{field.required ? 'Required' : 'Optional'}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel-card">
                <div className="panel-card-header">
                  <div>
                    <p className="eyebrow">Recent submissions</p>
                    <h3>Incoming intake records</h3>
                  </div>
                </div>

                <LoadState loading={submissionsQuery.loading} error={submissionsQuery.error} title="Loading submissions" />

                <div className="compact-list list-shell">
                  {(submissionsQuery.data?.data || []).map((submission) => (
                    <div className="list-row static" key={submission.id}>
                      <div>
                        <strong>{submission.submitterName || submission.submitterEmail || 'Unknown submitter'}</strong>
                        <p>{submission.summary || 'Intake submission captured'}</p>
                      </div>
                      <div className="list-row-actions">
                        <span>{submission.source || 'public'}</span>
                        <span>{submission.status || 'new'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          ) : (
            <EmptyState
              title="No form selected"
              description="Choose a form to inspect its fields, submissions, and public intake route."
            />
          )}
        </aside>
      </section>

      <FormTemplateEditor
        form={formState}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        mode={editorMode}
        onAddField={handleAddField}
        onChange={handleChange}
        onClose={closeEditor}
        onFieldChange={handleFieldChange}
        onRemoveField={handleRemoveField}
        onSubmit={handleSave}
        saveError={saveError}
      />
    </>
  )
}
