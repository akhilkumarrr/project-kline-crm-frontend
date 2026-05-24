type EmptyStateProps = {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
}

export function EmptyState({ actionLabel, description, onAction, title }: EmptyStateProps) {
  return (
    <div className="empty-card empty-card-rich">
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="ghost-button compact-button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

