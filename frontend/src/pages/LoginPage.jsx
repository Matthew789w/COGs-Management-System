import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, LogIn } from 'lucide-react'
import BrandLogo from '../components/layout/BrandLogo'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading, login, lockout, refreshLockoutStatus, formatLockoutDuration } =
    useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [form, setForm] = useState({ username: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [retrySeconds, setRetrySeconds] = useState(0)

  const redirectTo = location.state?.from || '/dashboard'

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, redirectTo])

  useEffect(() => {
    if (!lockout?.locked) {
      setRetrySeconds(0)
      return undefined
    }

    setRetrySeconds(lockout.retryAfterSeconds || 0)

    const intervalId = window.setInterval(() => {
      setRetrySeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [lockout])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')

    if (field === 'username') {
      refreshLockoutStatus(value).catch(() => {})
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (lockout?.locked || retrySeconds > 0) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await login({
        username: form.username,
        password: form.password,
        remember,
      })
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      const response = submitError.response

      if (response?.status === 423) {
        setError('Too many failed login attempts. The system is temporarily locked.')
      } else if (response?.status === 419) {
        setError('Session security check failed. Refresh the page and try again.')
      } else if (response?.status === 422) {
        const remaining = response.data?.errors?.remaining_attempts
        setError(
          remaining !== undefined
            ? `Invalid username or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : response.data?.message || 'Invalid username or password.',
        )
      } else if (!response) {
        setError(
          'Cannot reach the server. Make sure Laravel is running on port 8000 and restart the Vite dev server.',
        )
      } else if (response.status >= 500) {
        setError(
          response.data?.message ||
            'The server encountered an error while signing in. Restart the Vite dev server on port 5173.',
        )
      } else {
        setError(response?.data?.message || 'Unable to sign in. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <span className="table-loading__spinner" aria-hidden="true" />
        <span>Loading sign-in…</span>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const isLocked = lockout?.locked || retrySeconds > 0

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden="true" />

      <div className="login-page__panel">
        <div className="login-page__header">
          <div className="login-page__brand">
            <div className="login-page__brand-logo" aria-hidden="true">
              <BrandLogo className="login-page__brand-logo-icon" />
            </div>
            <div>
              <strong>COGs System</strong>
              <span>Manufacturing &amp; Costing</span>
            </div>
          </div>

          <button
            type="button"
            className="login-page__theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <div className="login-page__intro">
          <h1>Sign in</h1>
          <p>Access production, inventory, costing, and reporting modules.</p>
        </div>

        {isLocked && (
          <div className="login-page__lockout" role="alert">
            <Lock size={18} aria-hidden="true" />
            <div>
              <strong>System temporarily locked</strong>
              <p>
                Too many failed login attempts. Try again in{' '}
                {formatLockoutDuration(retrySeconds || lockout?.retryAfterSeconds || 0)}.
              </p>
            </div>
          </div>
        )}

        {error && !isLocked && <p className="form-error login-page__error">{error}</p>}

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              value={form.username}
              onChange={(event) => handleChange('username', event.target.value)}
              autoComplete="username"
              disabled={submitting || isLocked}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              autoComplete="current-password"
              disabled={submitting || isLocked}
              required
            />
          </div>

          <label className="login-page__remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={submitting || isLocked}
            />
            <span>Keep me signed in</span>
          </label>

          <Button
            type="submit"
            variant="primary"
            icon={LogIn}
            disabled={submitting || isLocked}
            className="login-page__submit"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="login-page__hint">
          Default account after seeding: <strong>plantmanager</strong> / <strong>password</strong>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
