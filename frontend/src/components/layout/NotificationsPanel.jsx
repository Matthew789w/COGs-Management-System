import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Factory,
  Layers,
  Package,
  Trash2,
  Warehouse,
} from 'lucide-react'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { useNotifications } from '../../context/NotificationsContext'
import { formatRelativeTime } from '../../utils/formatRelativeTime'

const notificationIcons = {
  production_batch: Factory,
  product: Package,
  material: Layers,
  inventory: Warehouse,
}

function NotificationsPanel({ open, onClose }) {
  const panelRef = useRef(null)
  const navigate = useNavigate()
  const {
    notifications,
    summary,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isRead,
  } = useNotifications()

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    onClose()
    navigate(notification.link)
  }

  return (
    <div className="notifications-panel" ref={panelRef}>
      <div className="notifications-panel__header">
        <div>
          <strong>Notifications</strong>
          <p>
            {summary.alerts > 0
              ? `${summary.alerts} alert${summary.alerts === 1 ? '' : 's'} · ${summary.activity} recent`
              : `${summary.total} update${summary.total === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="notifications-panel__header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-panel__mark-all"
              onClick={markAllAsRead}
            >
              <CheckCheck size={14} aria-hidden="true" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="notifications-panel__clear-all"
              onClick={clearAllNotifications}
            >
              <Trash2 size={14} aria-hidden="true" />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notifications-panel__body">
        {loading ? (
          <div className="notifications-panel__loading" role="status" aria-live="polite">
            <span className="table-loading__spinner" aria-hidden="true" />
            Loading notifications…
          </div>
        ) : error ? (
          <p className="notifications-panel__error">{error}</p>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Alerts and recent activity will appear here."
          />
        ) : (
          <ul className="notifications-panel__list">
            {notifications.map((notification) => {
              const Icon =
                notification.category === 'alert'
                  ? AlertTriangle
                  : notificationIcons[notification.type] || Bell
              const read = isRead(notification.id)

              return (
                <li key={notification.id} className="notifications-panel__row">
                  <button
                    type="button"
                    className={`notifications-panel__item ${read ? 'notifications-panel__item--read' : ''}`.trim()}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span
                      className={`notifications-panel__icon notifications-panel__icon--${notification.category}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </span>
                    <span className="notifications-panel__content">
                      <span className="notifications-panel__title-row">
                        <span className="notifications-panel__title">{notification.title}</span>
                        {!read && <span className="notifications-panel__unread-dot" aria-hidden="true" />}
                      </span>
                      <span className="notifications-panel__description">
                        {notification.description}
                      </span>
                      <span className="notifications-panel__meta">
                        <Badge variant={notification.badge?.variant || 'default'}>
                          {notification.badge?.label}
                        </Badge>
                        <span>{formatRelativeTime(notification.occurred_at)}</span>
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="notifications-panel__delete"
                    aria-label={`Delete notification: ${notification.title}`}
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default NotificationsPanel
