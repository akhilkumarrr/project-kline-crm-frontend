import { useEffect, useMemo, useState } from 'react'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { api, type EmailLogRecord } from '../../lib/api'
import { LoadState } from '../LoadState'

type EntityEmailPanelProps = {
  defaultToEmail?: string | null
  entityId: string
  entityKind: 'quote' | 'contract'
  entityLogType: 'QUOTE' | 'CONTRACT'
  heading: string
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Pending'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  })
}

const buildTone = (status?: string) => {
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

export function EntityEmailPanel({
  defaultToEmail,
  entityId,
  entityKind,
  entityLogType,
  heading,
}: EntityEmailPanelProps) {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [toEmail, setToEmail] = useState(defaultToEmail || '')
  const [templateId, setTemplateId] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    setToEmail(defaultToEmail || '')
  }, [defaultToEmail, entityId])

  const templatesQuery = useApiQuery(
    Boolean(token),
    () => api.getEmailTemplates(token!, 1, 100),
    [token],
  )

  const logsQuery = useApiQuery(
    Boolean(token),
    () => api.getEntityEmailLogs(token!, entityLogType, entityId),
    [token, entityId, entityLogType, refreshKey],
  )

  const templates = templatesQuery.data?.data ?? []
  const logs = logsQuery.data ?? []

  const templateOptions = useMemo(
    () =>
      templates.filter((template) => {
        if (!template.templateType) {
          return true
        }

        if (entityKind === 'quote') {
          return template.templateType === 'QUOTE_SENT' || template.templateType === 'CUSTOM'
        }

        return template.templateType === 'CONTRACT_SENT' || template.templateType === 'CUSTOM'
      }),
    [entityKind, templates],
  )

  const handleSend = async () => {
    if (!token) {
      return
    }

    if (!toEmail.trim()) {
      setSendError('Add a recipient email before sending.')
      return
    }

    setIsSending(true)
    setSendError(null)
    setSendSuccess(null)

    try {
      if (entityKind === 'quote') {
        await api.sendQuoteViaEmail(token, entityId, {
          toEmail: toEmail.trim(),
          templateId: templateId || undefined,
        })
      } else {
        await api.sendContractViaEmail(token, entityId, {
          toEmail: toEmail.trim(),
          templateId: templateId || undefined,
        })
      }

      setSendSuccess(`${heading} sent successfully.`)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSendError(error instanceof Error ? error.message : `Unable to send ${entityKind}.`)
    } finally {
      setIsSending(false)
    }
  }

  const handleResend = async (emailLogId: string) => {
    if (!token) {
      return
    }

    setSendError(null)
    setSendSuccess(null)

    try {
      await api.resendEmail(token, emailLogId)
      setSendSuccess('Email resent successfully.')
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Unable to resend email.')
    }
  }

  return (
    <div className="detail-stack">
      <div className="detail-note">
        <span className="data-label">{heading}</span>
        <div className="form-grid">
          <label className="field field-span-2">
            <span>Recipient</span>
            <input
              type="email"
              placeholder="customer@company.com"
              value={toEmail}
              onChange={(event) => setToEmail(event.target.value)}
            />
          </label>

          <label className="field field-span-2">
            <span>Template</span>
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              <option value="">Default {entityKind} template</option>
              {templateOptions.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <LoadState
          loading={templatesQuery.loading}
          error={templatesQuery.error}
          title="Loading email templates"
        />

        {sendError ? <p className="auth-error">{sendError}</p> : null}
        {sendSuccess ? <p className="success-copy">{sendSuccess}</p> : null}

        <div className="inline-actions">
          <button type="button" className="primary-button compact-button" onClick={handleSend} disabled={isSending}>
            {isSending ? `Sending ${entityKind}...` : `Send ${entityKind}`}
          </button>
        </div>
      </div>

      <div className="detail-note">
        <span className="data-label">Related email history</span>
        <LoadState
          loading={logsQuery.loading}
          error={logsQuery.error}
          title="Loading related email history"
        />

        {logs.length ? (
          <div className="table-list compact-list">
            {logs.map((log: EmailLogRecord) => (
              <div className="table-row stacked-row" key={log.id}>
                <div>
                  <strong>{log.subject}</strong>
                  <p>
                    {log.to} • {formatDate(log.sentAt)}
                  </p>
                </div>
                <div className="inline-actions">
                  <span className={`status-chip ${buildTone(log.status)}`}>{log.status || 'SENT'}</span>
                  <button
                    type="button"
                    className="ghost-button compact-button"
                    onClick={() => handleResend(log.id)}
                  >
                    Resend
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-card">No emails have been sent for this {entityKind} yet.</div>
        )}
      </div>
    </div>
  )
}
