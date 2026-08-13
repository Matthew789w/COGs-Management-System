import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { ArrowLeft, Save, UserRound } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import UserAvatar from '../components/ui/UserAvatar'
import { AVATAR_OPTIONS } from '../utils/avatars'
import { USER_ROLES } from '../utils/users'

function EditUserPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setFormError('')

    axios
      .get(`/api/users/${id}`)
      .then((response) => {
        const user = response.data.data
        setForm({
          name: user.name || '',
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'Operator',
          avatar: user.avatar || 'indigo',
          profile_photo_url: user.profile_photo_url || null,
          password: '',
          password_confirmation: '',
        })
      })
      .catch(() => setFormError('Unable to load user. Please try again.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)

    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
      avatar: form.avatar,
    }

    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      await axios.put(`/api/users/${id}`, payload)
      navigate(`/users/${id}`)
    } catch (error) {
      const response = error.response

      if (response?.status === 422 && response.data?.errors) {
        const errors = {}
        Object.entries(response.data.errors).forEach(([key, messages]) => {
          errors[key] = messages[0]
        })
        setFieldErrors(errors)
        setFormError(response.data.message || 'Please fix the errors below.')
      } else {
        setFormError(response?.data?.message || 'Unable to update user. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldError = (field) => {
    if (!fieldErrors[field]) return null
    return <p className="form-error">{fieldErrors[field]}</p>
  }

  if (loading) {
    return (
      <div>
        <Link to="/users" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to users
        </Link>
        <p className="page-header__description">Loading user...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div>
        <Link to="/users" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to users
        </Link>
        <p className="form-error">{formError || 'User not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/users/${id}`} className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to user
      </Link>

      <PageHeader
        title="Edit user"
        description="Update account details, role, or reset the user's password."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Account details" />

          {formError && <p className="form-error">{formError}</p>}

          <div className="profile-preview">
            <UserAvatar profile={form} size="xl" />
            <div>
              <strong>{form.name}</strong>
              <span>@{form.username}</span>
              <span>{form.role}</span>
            </div>
          </div>

          <div className="form-grid form-grid--2">
            <div className="form-field">
              <label htmlFor="user-name">Display name</label>
              <input
                id="user-name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                autoComplete="name"
                required
              />
              {renderFieldError('name')}
            </div>

            <div className="form-field">
              <label htmlFor="user-username">Username</label>
              <input
                id="user-username"
                type="text"
                value={form.username}
                onChange={(event) => handleChange('username', event.target.value)}
                autoComplete="username"
                required
              />
              {renderFieldError('username')}
            </div>

            <div className="form-field">
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                autoComplete="email"
                required
              />
              {renderFieldError('email')}
            </div>

            <div className="form-field">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {renderFieldError('role')}
            </div>

            <div className="form-field">
              <label htmlFor="user-password">New password</label>
              <input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
              />
              {renderFieldError('password')}
            </div>

            <div className="form-field">
              <label htmlFor="user-password-confirmation">Confirm new password</label>
              <input
                id="user-password-confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={(event) => handleChange('password_confirmation', event.target.value)}
                autoComplete="new-password"
                placeholder="Required only when setting a new password"
              />
              {renderFieldError('password_confirmation')}
            </div>
          </div>

          <div className="profile-avatars">
            <div className="profile-avatars__header">
              <UserRound size={16} aria-hidden="true" />
              <span>Preset avatar</span>
            </div>
            <div className="profile-avatars__grid">
              {AVATAR_OPTIONS.map((avatar) => {
                const selected = form.avatar === avatar.id

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`profile-avatars__option ${selected ? 'profile-avatars__option--selected' : ''}`.trim()}
                    onClick={() => handleChange('avatar', avatar.id)}
                    aria-pressed={selected}
                    aria-label={`${avatar.label} avatar`}
                  >
                    <UserAvatar
                      profile={{
                        ...form,
                        avatar: avatar.id,
                        profile_photo_url: form.profile_photo_url && selected ? form.profile_photo_url : null,
                      }}
                      size="lg"
                    />
                    <span>{avatar.label}</span>
                  </button>
                )
              })}
            </div>
            {renderFieldError('avatar')}
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" icon={Save} disabled={submitting}>
              {submitting ? 'Saving user…' : 'Save changes'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

export default EditUserPage
