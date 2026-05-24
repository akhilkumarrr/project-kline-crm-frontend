import { useMemo, useState, type ChangeEvent } from 'react'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { useFeedback } from '../../hooks/useFeedback'
import { api } from '../../lib/api'

type RelatedFilesPanelProps = {
  allowUpload?: boolean
  emptyMessage: string
  onGenerate?: () => Promise<unknown>
  refreshKey?: number
  relatedId: string
  relatedType: string
  title: string
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

export function RelatedFilesPanel({
  allowUpload = true,
  emptyMessage,
  onGenerate,
  refreshKey = 0,
  relatedId,
  relatedType,
  title,
}: RelatedFilesPanelProps) {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const [localRefreshKey, setLocalRefreshKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const filesQuery = useApiQuery(
    Boolean(token && relatedId),
    () => api.getRelatedFiles(token!, relatedType, relatedId),
    [token, relatedType, relatedId, refreshKey, localRefreshKey],
  )

  const files = useMemo(() => filesQuery.data || [], [filesQuery.data])

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!token || !event.target.files?.[0]) {
      return
    }

    setIsUploading(true)

    try {
      await api.uploadFile(token, {
        file: event.target.files[0],
        relatedId,
        relatedType,
      })
      setLocalRefreshKey((current) => current + 1)
      notifySuccess(event.target.files[0].name, 'File uploaded')
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not upload file', 'Upload failed')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleDownload = async (fileId: string) => {
    if (!token) {
      return
    }

    try {
      const result = await api.downloadFile(token, fileId)
      const url = URL.createObjectURL(result.blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = result.fileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not download file', 'Download failed')
    }
  }

  const handleGenerate = async () => {
    if (!onGenerate) {
      return
    }

    setIsGenerating(true)

    try {
      await onGenerate()
      setLocalRefreshKey((current) => current + 1)
      notifySuccess('A PDF document was generated and saved to this record.', 'PDF ready')
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not generate PDF', 'PDF generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <article className="panel-card">
      <div className="panel-card-header">
        <div>
          <p className="eyebrow">Documents</p>
          <h3>{title}</h3>
        </div>
        <div className="inline-actions">
          {onGenerate ? (
            <button type="button" className="ghost-button compact-button" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating…' : 'Generate PDF'}
            </button>
          ) : null}
          {allowUpload ? (
            <label className="ghost-button compact-button">
              {isUploading ? 'Uploading…' : 'Upload file'}
              <input type="file" hidden onChange={handleUpload} disabled={isUploading} />
            </label>
          ) : null}
        </div>
      </div>

      {filesQuery.loading ? <div className="empty-card">Loading linked files…</div> : null}
      {!filesQuery.loading && !files.length ? <div className="empty-card">{emptyMessage}</div> : null}

      {files.length ? (
        <div className="list-shell compact-list">
          {files.map((file) => (
            <div className="list-row static" key={file.id}>
              <div>
                <strong>{file.originalName}</strong>
                <p>{file.generated ? 'Generated document' : 'Uploaded file'} · {formatDate(file.createdAt)}</p>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={() => handleDownload(file.id)}>
                Download
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}
