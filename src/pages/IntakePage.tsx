import { useMemo, useState } from 'react'
import { DynamicIntakeForm, extractSubmitterPayload } from '../components/forms/DynamicIntakeForm'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { api } from '../lib/api'
import { readHashParam } from '../lib/navigation'

export function IntakePage() {
  const slug = useMemo(() => readHashParam('slug') || '', [])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formQuery = useApiQuery(Boolean(slug), () => api.getPublicForm(slug), [slug])

  const handleSubmit = async () => {
    if (!formQuery.data || !slug) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await api.submitPublicForm(slug, extractSubmitterPayload(formQuery.data.fields, answers))
      setSuccessMessage(result.successMessage)
      setAnswers({})
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!slug) {
    return <LoadState loading={false} error="Missing form slug." title="Could not load intake form" />
  }

  if (formQuery.loading) {
    return <LoadState loading title="Loading intake form" />
  }

  if (formQuery.error || !formQuery.data) {
    return <LoadState loading={false} error={formQuery.error || 'Form not found'} title="Could not load intake form" />
  }

  return (
    <section className="portal-shell intake-shell">
      <article className="portal-auth-card intake-card">
        <p className="eyebrow">Project Kline intake</p>
        <h1>{formQuery.data.title}</h1>
        <p className="portal-copy">{formQuery.data.introText || formQuery.data.description || 'Please complete this intake form so our team can move forward quickly.'}</p>

        {successMessage ? (
          <div className="portal-password-card">
            <span className="data-label">Submission received</span>
            <strong>{successMessage}</strong>
          </div>
        ) : (
          <DynamicIntakeForm
            answers={answers}
            form={formQuery.data}
            isSubmitting={isSubmitting}
            onChange={(key, value) => setAnswers((current) => ({ ...current, [key]: value }))}
            onSubmit={handleSubmit}
            submitError={submitError}
          />
        )}
      </article>
    </section>
  )
}
