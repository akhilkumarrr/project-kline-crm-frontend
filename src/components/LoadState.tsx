type LoadStateProps = {
  error?: string | null
  loading: boolean
  title?: string
}

export function LoadState({ error, loading, title = 'Loading data' }: LoadStateProps) {
  if (loading) {
    return (
      <div className="load-state">
        <strong>{title}</strong>
        <p>Pulling live CRM data from the backend.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="load-state error">
        <strong>Couldn&apos;t load this section</strong>
        <p>{error}</p>
      </div>
    )
  }

  return null
}
