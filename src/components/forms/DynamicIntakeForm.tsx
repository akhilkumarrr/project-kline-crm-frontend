import { useMemo, type FormEvent } from 'react'
import type { FormFieldConfig, SubmitFormPayload } from '../../lib/api'

type DynamicIntakeFormProps = {
  answers: Record<string, unknown>
  form: {
    fields: FormFieldConfig[]
    submitButtonLabel?: string
  }
  isSubmitting: boolean
  onChange: (key: string, value: unknown) => void
  onSubmit: () => Promise<void>
  submitError: string | null
}

const normalizeMultiSelectValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String)
  }

  return [] as string[]
}

export function extractSubmitterPayload(
  fields: FormFieldConfig[],
  answers: Record<string, unknown>,
): SubmitFormPayload {
  const payload: SubmitFormPayload = {
    payload: answers,
  }

  fields.forEach((field) => {
    const raw = answers[field.key]
    const value = typeof raw === 'string' ? raw.trim() : raw
    const normalizedKey = field.key.toLowerCase()

    if (!value) {
      return
    }

    if (!payload.submitterEmail && (field.type === 'email' || normalizedKey.includes('email'))) {
      payload.submitterEmail = String(value)
    }

    if (!payload.submitterName && normalizedKey.includes('name')) {
      payload.submitterName = String(value)
    }

    if (!payload.submitterCompany && normalizedKey.includes('company')) {
      payload.submitterCompany = String(value)
    }

    if (!payload.submitterPhone && (field.type === 'phone' || normalizedKey.includes('phone'))) {
      payload.submitterPhone = String(value)
    }
  })

  return payload
}

export function DynamicIntakeForm({
  answers,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  submitError,
}: DynamicIntakeFormProps) {
  const orderedFields = useMemo(() => form.fields || [], [form.fields])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="drawer-form intake-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {orderedFields.map((field) => {
          const value = answers[field.key]
          const commonLabel = (
            <>
              <span>
                {field.label}
                {field.required ? ' *' : ''}
              </span>
              {field.helpText ? <small>{field.helpText}</small> : null}
            </>
          )

          if (field.type === 'long_text') {
            return (
              <label className="field field-span-2" key={field.id}>
                {commonLabel}
                <textarea
                  required={field.required}
                  rows={5}
                  placeholder={field.placeholder}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              </label>
            )
          }

          if (field.type === 'select') {
            return (
              <label className="field" key={field.id}>
                {commonLabel}
                <select
                  required={field.required}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => onChange(field.key, event.target.value)}
                >
                  <option value="">{field.placeholder || 'Select an option'}</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          if (field.type === 'multi_select') {
            const selected = normalizeMultiSelectValue(value)
            return (
              <label className="field" key={field.id}>
                {commonLabel}
                <select
                  multiple
                  value={selected}
                  onChange={(event) =>
                    onChange(
                      field.key,
                      Array.from(event.target.selectedOptions).map((option) => option.value),
                    )
                  }
                >
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          if (field.type === 'checkbox') {
            return (
              <label className="field checkbox-field" key={field.id}>
                <span>{field.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => onChange(field.key, event.target.checked)}
                />
              </label>
            )
          }

          return (
            <label className="field" key={field.id}>
              {commonLabel}
              <input
                type={
                  field.type === 'email'
                    ? 'email'
                    : field.type === 'phone'
                      ? 'tel'
                      : field.type === 'date'
                        ? 'date'
                        : field.type === 'number'
                          ? 'number'
                          : 'text'
                }
                required={field.required}
                placeholder={field.placeholder}
                value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
                onChange={(event) =>
                  onChange(
                    field.key,
                    field.type === 'number' ? Number(event.target.value) : event.target.value,
                  )
                }
              />
            </label>
          )
        })}
      </div>

      {submitError ? <p className="form-error">{submitError}</p> : null}

      <div className="drawer-actions">
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : form.submitButtonLabel || 'Submit'}
        </button>
      </div>
    </form>
  )
}
