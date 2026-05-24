import { type FormEvent } from 'react'

type NoteComposerProps = {
  buttonLabel: string
  isSaving: boolean
  onChange: (value: string) => void
  onSubmit: () => Promise<void>
  placeholder: string
  saveError: string | null
  value: string
}

export function NoteComposer({
  buttonLabel,
  isSaving,
  onChange,
  onSubmit,
  placeholder,
  saveError,
  value,
}: NoteComposerProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="note-composer" onSubmit={handleSubmit}>
      <label className="field field-span-2">
        <span>Quick note</span>
        <textarea
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>

      {saveError ? <p className="auth-error">{saveError}</p> : null}

      <div className="drawer-actions">
        <button type="submit" className="primary-button compact-button" disabled={isSaving}>
          {isSaving ? 'Saving...' : buttonLabel}
        </button>
      </div>
    </form>
  )
}
