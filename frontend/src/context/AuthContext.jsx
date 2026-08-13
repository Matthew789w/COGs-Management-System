import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import axios, { ensureCsrfCookie, setUnauthorizedHandler } from '../lib/api'

const AuthContext = createContext(null)

function formatLockoutDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lockout, setLockout] = useState(null)

  const clearSession = useCallback(() => {
    setUser(null)
    setPreferences(null)
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data.data?.user || null)
      setPreferences(response.data.data?.preferences || null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clearSession)
    checkSession()
  }, [checkSession, clearSession])

  const login = useCallback(async ({ username, password, remember = false }) => {
    await ensureCsrfCookie()

    try {
      const response = await axios.post('/api/auth/login', {
        username: username.trim(),
        password,
        remember,
      })

      setUser(response.data.data?.user || null)
      setPreferences(response.data.data?.preferences || null)
      setLockout(null)

      return response.data
    } catch (error) {
      const response = error.response

      if (response?.status === 423) {
        setLockout({
          locked: true,
          retryAfterSeconds: response.data?.errors?.retry_after_seconds || 0,
          lockedUntil: response.data?.errors?.locked_until || null,
        })
      } else if (response?.data?.errors?.remaining_attempts !== undefined) {
        setLockout({
          locked: false,
          remainingAttempts: response.data.errors.remaining_attempts,
        })
      }

      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await ensureCsrfCookie()
      await axios.post('/api/auth/logout')
    } catch {
      // ignore logout errors and clear local session anyway
    } finally {
      clearSession()
      setLockout(null)
    }
  }, [clearSession])

  const refreshLockoutStatus = useCallback(async (username) => {
    if (!username.trim()) {
      setLockout(null)
      return null
    }

    const response = await axios.get('/api/auth/lockout-status', {
      params: { username: username.trim().toLowerCase() },
    })

    const status = response.data.data

    if (status?.locked) {
      setLockout({
        locked: true,
        retryAfterSeconds: status.retry_after_seconds,
        lockedUntil: status.locked_until,
      })
    } else {
      setLockout({
        locked: false,
        remainingAttempts: status?.remaining_attempts,
      })
    }

    return status
  }, [])

  const value = useMemo(
    () => ({
      user,
      preferences,
      setPreferences,
      isAuthenticated: Boolean(user),
      loading,
      lockout,
      login,
      logout,
      checkSession,
      refreshLockoutStatus,
      formatLockoutDuration,
    }),
    [user, preferences, loading, lockout, login, logout, checkSession, refreshLockoutStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
