import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from '../lib/api'

const READ_STORAGE_KEY = 'cogs-notifications-read'
const DELETED_STORAGE_KEY = 'cogs-notifications-deleted'
const NotificationsContext = createContext(null)

function loadStoredIds(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return new Set()

    const parsed = JSON.parse(stored)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function persistStoredIds(storageKey, ids) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...ids]))
  } catch {
    // ignore storage errors
  }
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [readIds, setReadIds] = useState(() => loadStoredIds(READ_STORAGE_KEY))
  const [deletedIds, setDeletedIds] = useState(() => loadStoredIds(DELETED_STORAGE_KEY))

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get('/api/notifications')
      setNotifications(response.data.data?.notifications || [])
      setError('')
    } catch {
      setError('Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    const intervalId = window.setInterval(fetchNotifications, 60000)
    return () => window.clearInterval(intervalId)
  }, [fetchNotifications])

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => !deletedIds.has(notification.id)),
    [notifications, deletedIds],
  )

  const visibleSummary = useMemo(
    () => ({
      total: visibleNotifications.length,
      alerts: visibleNotifications.filter((notification) => notification.category === 'alert').length,
      activity: visibleNotifications.filter((notification) => notification.category === 'activity')
        .length,
    }),
    [visibleNotifications],
  )

  const unreadCount = useMemo(
    () => visibleNotifications.filter((notification) => !readIds.has(notification.id)).length,
    [visibleNotifications, readIds],
  )

  const markAsRead = useCallback((id) => {
    setReadIds((current) => {
      if (current.has(id)) return current

      const next = new Set(current)
      next.add(id)
      persistStoredIds(READ_STORAGE_KEY, next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current)
      visibleNotifications.forEach((notification) => next.add(notification.id))
      persistStoredIds(READ_STORAGE_KEY, next)
      return next
    })
  }, [visibleNotifications])

  const deleteNotification = useCallback((id) => {
    setDeletedIds((current) => {
      if (current.has(id)) return current

      const next = new Set(current)
      next.add(id)
      persistStoredIds(DELETED_STORAGE_KEY, next)
      return next
    })

    setReadIds((current) => {
      if (!current.has(id)) return current

      const next = new Set(current)
      next.delete(id)
      persistStoredIds(READ_STORAGE_KEY, next)
      return next
    })
  }, [])

  const clearAllNotifications = useCallback(() => {
    setDeletedIds((current) => {
      const next = new Set(current)
      visibleNotifications.forEach((notification) => next.add(notification.id))
      persistStoredIds(DELETED_STORAGE_KEY, next)
      return next
    })
  }, [visibleNotifications])

  const isRead = useCallback((id) => readIds.has(id), [readIds])

  const value = useMemo(
    () => ({
      notifications: visibleNotifications,
      summary: visibleSummary,
      loading,
      error,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      isRead,
      refresh: fetchNotifications,
    }),
    [
      visibleNotifications,
      visibleSummary,
      loading,
      error,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      isRead,
      fetchNotifications,
    ],
  )

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }

  return context
}
