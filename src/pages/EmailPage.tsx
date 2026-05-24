import { useEffect, useMemo, useState } from 'react'
import {
  EmailTemplateEditor,
  createEmptyEmailTemplateForm,
  parseTemplateVariables,
  type EmailTemplateFormState,
} from '../components/email/EmailTemplateEditor'
import { LoadState } from '../components/LoadState'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import {
  api,
  type EmailLogRecord,
  type EmailTemplatePayload,
  type EmailTemplateRecord,
  type SendEmailPayload,
} from '../lib/api'

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not sent yet'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
}

const buildLogTone = (status?: string) => {
  switch (status) {
    case 'FAILED':
    case 'BOUNCED':
      return 'risk'
    case 'OPENED':
    case 'CLICKED':
      return 'cool'
    default:
      return 'healthy'
  }
}

const toTemplateForm = (template: EmailTemplateRecord): EmailTemplateFormState => ({
  body: template.body || '',
  name: template.name || '',
  subject: template.subject || '',
  templateType: template.templateType || 'CUSTOM',
  variables: template.variables || [],
  variablesText:
    template.variables
      ?.map((item) => [item.name, item.example, item.description || ''].filter(Boolean).join(' | '))
      .join('\n') || '',
})

export function EmailPage() {
  const { token } = useAuth()
  const { confirm, notifyError, notifySuccess } = useFeedback()
  const [refreshKey, setRefreshKey] = useState(0)
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([])
  const [logs, setLogs] = useState<EmailLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [templateForm, setTemplateForm] = useState<EmailTemplateFormState>(createEmptyEmailTemplateForm())
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [composeError, setComposeError] = useState<string | null>(null)
  const [composeState, setComposeState] = useState<SendEmailPayload>({
    body: '',
    subject: '',
    to: '',
  })

  useEffect(() => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([api.getEmailTemplates(token), api.getEmailLogs(token)])
      .then(([templatesPayload, logsPayload]) => {
        setTemplates(templatesPayload.data)
        setLogs(logsPayload.data)
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false))
  }, [refreshKey, token])

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) || templates[0] || null

  useEffect(() => {
    if (!selectedTemplateId && templates.length) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [selectedTemplateId, templates])

  const recentStatusCounts = useMemo(
    () =>
      logs.reduce<Record<string, number>>((accumulator, log) => {
        const key = log.status || 'SENT'
        accumulator[key] = (accumulator[key] || 0) + 1
        return accumulator
      }, {}),
    [logs],
  )

  const openCreate = () => {
    setEditorMode('create')
    setTemplateForm(createEmptyEmailTemplateForm())
    setTemplateError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId)
    if (!template) {
      return
    }

    setEditorMode('edit')
    setSelectedTemplateId(templateId)
    setTemplateForm(toTemplateForm(template))
    setTemplateError(null)
    setIsEditorOpen(true)
  }

  const saveTemplate = async () => {
    if (!token) {
      return
    }

    setIsSavingTemplate(true)
    setTemplateError(null)

    const payload: EmailTemplatePayload = {
      body: templateForm.body.trim(),
      name: templateForm.name.trim(),
      subject: templateForm.subject.trim(),
      templateType: templateForm.templateType,
      variables: parseTemplateVariables(templateForm.variablesText),
    }

    try {
      if (editorMode === 'create') {
        const created = await api.createEmailTemplate(token, payload)
        setSelectedTemplateId(created.id)
        notifySuccess(`"${payload.name}" is ready to use.`, 'Template created')
      } else if (selectedTemplateId) {
        await api.updateEmailTemplate(token, selectedTemplateId, payload)
        notifySuccess(`"${payload.name}" was updated.`, 'Template saved')
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to save template.'
      setTemplateError(message)
      notifyError(message, 'Template save failed')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const removeTemplate = async (templateId: string) => {
    if (!token) {
      return
    }

    const template = templates.find((item) => item.id === templateId)
    const confirmed = await confirm({
      confirmLabel: 'Delete template',
      description: `Delete ${template?.name || 'this template'} from the library?`,
      title: 'Remove template?',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await api.deleteEmailTemplate(token, templateId)
      setRefreshKey((current) => current + 1)
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null)
      }
      notifySuccess('The template was removed from the library.', 'Template deleted')
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to delete template.'
      setTemplateError(message)
      notifyError(message, 'Delete failed')
    }
  }

  const sendCustomEmail = async () => {
    if (!token) {
      return
    }

    setIsSending(true)
    setComposeError(null)

    try {
      await api.sendEmail(token, {
        body: composeState.body.trim(),
        bcc: composeState.bcc?.trim() || undefined,
        cc: composeState.cc?.trim() || undefined,
        metadata: { source: 'frontend-composer' },
        subject: composeState.subject.trim(),
        to: composeState.to.trim(),
      })

      setComposeState({ body: '', subject: '', to: '' })
      setRefreshKey((current) => current + 1)
      notifySuccess('Your message was sent and logged.', 'Email delivered')
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to send email.'
      setComposeError(message)
      notifyError(message, 'Send failed')
    } finally {
      setIsSending(false)
    }
  }

  const resend = async (emailLogId: string) => {
    if (!token) {
      return
    }

    const log = logs.find((item) => item.id === emailLogId)
    const confirmed = await confirm({
      confirmLabel: 'Resend email',
      description: `Resend "${log?.subject || 'this email'}" to ${log?.to || 'the original recipient'}?`,
      title: 'Resend email now?',
    })

    if (!confirmed) {
      return
    }

    try {
      await api.resendEmail(token, emailLogId)
      setRefreshKey((current) => current + 1)
      notifySuccess('The email was queued again for delivery.', 'Email resent')
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to resend email.'
      setComposeError(message)
      notifyError(message, 'Resend failed')
    }
  }

  return (
    <>
      <section className="page-grid page-grid-wide">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Email operations</p>
                <h3>Compose and deliver messages</h3>
              </div>
              <span className="pill neutral">
                {logs.length ? `${logs.length} tracked sends` : 'Templates, logs, and send control'}
              </span>
            </div>

            <LoadState loading={loading} error={error} title="Loading email workspace" />

            <div className="form-grid">
              <label className="field">
                <span>To</span>
                <input
                  type="email"
                  value={composeState.to}
                  onChange={(event) => setComposeState((current) => ({ ...current, to: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>CC</span>
                <input
                  type="email"
                  value={composeState.cc || ''}
                  onChange={(event) => setComposeState((current) => ({ ...current, cc: event.target.value }))}
                />
              </label>
              <label className="field field-span-2">
                <span>Subject</span>
                <input
                  value={composeState.subject}
                  onChange={(event) => setComposeState((current) => ({ ...current, subject: event.target.value }))}
                />
              </label>
              <label className="field field-span-2">
                <span>Message</span>
                <textarea
                  rows={7}
                  value={composeState.body}
                  onChange={(event) => setComposeState((current) => ({ ...current, body: event.target.value }))}
                />
              </label>
            </div>

            {composeError ? <p className="auth-error">{composeError}</p> : null}

            <div className="inline-actions">
              <button type="button" className="primary-button" onClick={sendCustomEmail} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send custom email'}
              </button>
              {selectedTemplate ? (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    setComposeState((current) => ({
                      ...current,
                      body: selectedTemplate.body,
                      subject: selectedTemplate.subject,
                    }))
                  }
                >
                  Use selected template
                </button>
              ) : null}
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Recent delivery log</p>
                <h3>Email history</h3>
              </div>
              <div className="inline-actions">
                {Object.entries(recentStatusCounts).map(([status, count]) => (
                  <span key={status} className="pill neutral">
                    {status}: {count}
                  </span>
                ))}
              </div>
            </div>

            <div className="table-list">
              {logs.length ? (
                logs.map((log) => (
                  <div className="table-row stacked-row" key={log.id}>
                    <div>
                      <strong>{log.subject}</strong>
                      <p>
                        {log.to} • {formatDate(log.sentAt)}
                      </p>
                    </div>
                    <div className="inline-actions">
                      <span className={`status-chip ${buildLogTone(log.status)}`}>{log.status || 'SENT'}</span>
                      <button type="button" className="ghost-button compact-button" onClick={() => resend(log.id)}>
                        Resend
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-card">Sent email activity will appear here.</div>
              )}
            </div>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Template library</p>
                <h3>Reusable messaging</h3>
              </div>
              <button type="button" className="primary-button" onClick={openCreate}>
                + New template
              </button>
            </div>

            <div className="table-list">
              {templates.length ? (
                templates.map((template) => (
                  <div className="table-row stacked-row" key={template.id}>
                    <div>
                      <strong>{template.name}</strong>
                      <p>{template.templateType || 'CUSTOM'}</p>
                    </div>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="ghost-button compact-button"
                        onClick={() => {
                          setSelectedTemplateId(template.id)
                          openEdit(template.id)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-button compact-button"
                        onClick={() => removeTemplate(template.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-card">Create a template for quotes, contracts, or custom notes.</div>
              )}
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected template</p>
                <h3>{selectedTemplate?.name || 'Template preview'}</h3>
              </div>
            </div>

            {selectedTemplate ? (
              <div className="detail-stack">
                <div className="detail-note">
                  <span className="data-label">Subject</span>
                  <p>{selectedTemplate.subject}</p>
                </div>
                <div className="detail-note">
                  <span className="data-label">Body preview</span>
                  <p>{selectedTemplate.body}</p>
                </div>
                <div className="detail-note">
                  <span className="data-label">Variables</span>
                  <p>
                    {selectedTemplate.variables?.length
                      ? selectedTemplate.variables.map((item) => item.name).join(', ')
                      : 'No template variables defined.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-card">Select a template to preview the message body.</div>
            )}
          </article>
        </div>
      </section>

      <EmailTemplateEditor
        form={templateForm}
        isOpen={isEditorOpen}
        isSaving={isSavingTemplate}
        mode={editorMode}
        onChange={(field, value) => setTemplateForm((current) => ({ ...current, [field]: value }))}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={saveTemplate}
        saveError={templateError}
      />
    </>
  )
}
