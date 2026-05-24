import { useState } from 'react'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import { api } from '../lib/api'

const formatDate = (value?: string) => {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
      })
}

export function NotificationsPage() {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const [refreshKey, setRefreshKey] = useState(0)
  const notificationsQuery = useApiQuery(Boolean(token), () => api.getNotifications(token!), [token, refreshKey])

  const handleMarkRead = async (notificationId: string) => {
    if (!token) {
      return
    }

    try {
      await api.markNotificationRead(token, notificationId)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not update notification', 'Notification update failed')
    }
  }

  const handleMarkAllRead = async () => {
    if (!token) {
      return
    }

    try {
      const result = await api.markAllNotificationsRead(token)
      setRefreshKey((current) => current + 1)
      notifySuccess(`${result.updated} notifications marked as read.`, 'Notifications updated')
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not update notifications', 'Notification update failed')
    }
  }

  if (notificationsQuery.loading) {
    return <LoadState loading title="Loading notifications" />
  }

  if (notificationsQuery.error) {
    return <LoadState loading={false} error={notificationsQuery.error} title="Could not load notifications" />
  }

  const notifications = notificationsQuery.data?.data || []

  return (
    <section className="page-grid">
      <div className="main-column">
        <article className="panel-card">
          <div className="panel-card-header">
            <div>
              <p className="eyebrow">Follow-up center</p>
              <h3>Notifications</h3>
            </div>
            <button type="button" className="ghost-button" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          </div>

          <div className="list-shell">
            {notifications.map((notification) => (
              <div className={notification.isRead ? 'list-row static' : 'list-row active'} key={notification.id}>
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </div>
                <div className="list-row-actions">
                  <span>{formatDate(notification.createdAt)}</span>
                  {!notification.isRead ? (
                    <button type="button" className="ghost-button compact-button" onClick={() => handleMarkRead(notification.id)}>
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
