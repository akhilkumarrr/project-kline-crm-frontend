import type { ActivityRecord } from '../../lib/api'

type ActivityTimelineProps = {
  emptyMessage: string
  items: ActivityRecord[]
}

const toneMap: Record<string, string> = {
  call_made: 'cool',
  call_received: 'cool',
  contract_created: 'warm',
  contract_signed: 'healthy',
  email_received: 'cool',
  email_sent: 'warm',
  meeting_completed: 'healthy',
  meeting_scheduled: 'cool',
  note_added: 'neutral',
  quote_accepted: 'healthy',
  quote_created: 'warm',
  quote_sent: 'cool',
  status_changed: 'warm',
  task_assigned: 'cool',
  task_completed: 'healthy',
  task_created: 'warm',
  task_deleted: 'danger',
  task_updated: 'neutral',
}

const labelMap: Record<string, string> = {
  call_made: 'Call made',
  call_received: 'Call received',
  contract_created: 'Contract created',
  contract_signed: 'Contract signed',
  email_received: 'Email received',
  email_sent: 'Email sent',
  meeting_completed: 'Meeting completed',
  meeting_scheduled: 'Meeting scheduled',
  note_added: 'Note added',
  quote_accepted: 'Quote accepted',
  quote_created: 'Quote created',
  quote_sent: 'Quote sent',
  status_changed: 'Status changed',
  task_assigned: 'Task assigned',
  task_completed: 'Task completed',
  task_created: 'Task created',
  task_deleted: 'Task deleted',
  task_updated: 'Task updated',
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Just now'
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

const getActivityTitle = (activity: ActivityRecord) =>
  labelMap[activity.type] ||
  activity.type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const getActivityDetail = (activity: ActivityRecord) => {
  if (activity.description?.trim()) {
    return activity.description
  }

  const metadata = activity.metadata || {}
  if (typeof metadata.taskTitle === 'string') {
    return metadata.taskTitle
  }
  if (typeof metadata.entityId === 'string') {
    return metadata.entityId
  }

  return 'Activity recorded in the CRM.'
}

export function ActivityTimeline({ emptyMessage, items }: ActivityTimelineProps) {
  if (!items.length) {
    return <div className="empty-card">{emptyMessage}</div>
  }

  return (
    <div className="timeline">
      {items.map((activity) => (
        <div className="timeline-row" key={activity.id}>
          <span
            className={`timeline-dot ${toneMap[activity.type] || 'neutral'}`}
            aria-hidden="true"
          />
          <div>
            <strong>{getActivityTitle(activity)}</strong>
            <p>{getActivityDetail(activity)}</p>
          </div>
          <span>{formatDate(activity.createdAt)}</span>
        </div>
      ))}
    </div>
  )
}
