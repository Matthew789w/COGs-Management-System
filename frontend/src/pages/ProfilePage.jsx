import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImageUp, KeyRound, LogOut, Save, Trash2, UserRound } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import UserAvatar from '../components/ui/UserAvatar'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { AVATAR_OPTIONS } from '../utils/avatars'

const roleOptions = ['Administrator', 'Plant Manager', 'Supervisor', 'Operator', 'Accountant']

function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    profile,
    avatars,
    loading,
    error,
    updateProfile,
    updatePassword,
    uploadProfilePhoto,
    removeProfilePhoto,
  } = useUser()
  const photoInputRef = useRef(null)
  const [profileForm, setProfileForm] = useState(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [photoMessage, setPhotoMessage] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const avatarOptions = avatars.length > 0 ? avatars : AVATAR_OPTIONS

  useEffect(() => {
    if (!profile) return

    setProfileForm({
      name: profile.name || '',
      username: profile.username || '',
      email: profile.email || '',
      role: profile.role || 'Administrator',
      avatar: profile.avatar || 'indigo',
    })
  }, [profile])

  useEffect(() => {
    return () => {
      if (photoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrl)
      }
    }
  }, [photoPreviewUrl])

  const previewProfile = {
    ...profileForm,
    profile_photo_url: photoPreviewUrl || profile?.profile_photo_url || null,
  }

  const handleProfileChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => ({ ...current, [field]: undefined }))
    setProfileError('')
    setProfileMessage('')
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
    setPasswordErrors((current) => ({ ...current, [field]: undefined }))
    setPasswordError('')
    setPasswordMessage('')
  }

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file (JPG, PNG, or WebP).')
      setPhotoMessage('')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image must be 2 MB or smaller.')
      setPhotoMessage('')
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    setPhotoPreviewUrl((current) => {
      if (current.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return nextPreviewUrl
    })

    setUploadingPhoto(true)
    setPhotoError('')
    setPhotoMessage('')

    try {
      const response = await uploadProfilePhoto(file)
      setPhotoMessage(response.message || 'Profile photo uploaded successfully.')
      setPhotoPreviewUrl('')
    } catch (submitError) {
      const response = submitError.response

      if (response?.status === 422 && response.data?.errors?.photo) {
        setPhotoError(response.data.errors.photo[0])
      } else {
        setPhotoError(response?.data?.message || 'Unable to upload profile photo.')
      }

      setPhotoPreviewUrl('')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    setRemovingPhoto(true)
    setPhotoError('')
    setPhotoMessage('')

    try {
      const response = await removeProfilePhoto()
      setPhotoMessage(response.message || 'Profile photo removed successfully.')
      setPhotoPreviewUrl('')
    } catch (submitError) {
      setPhotoError(
        submitError.response?.data?.message || 'Unable to remove profile photo.',
      )
    } finally {
      setRemovingPhoto(false)
    }
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    if (!profileForm) return

    setSavingProfile(true)
    setProfileError('')
    setProfileMessage('')
    setProfileErrors({})

    try {
      const response = await updateProfile({
        name: profileForm.name.trim(),
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
        role: profileForm.role,
        avatar: profileForm.avatar,
      })
      setProfileMessage(response.message || 'Profile updated successfully.')
    } catch (submitError) {
      const response = submitError.response

      if (response?.status === 422 && response.data?.errors) {
        const errors = {}
        Object.entries(response.data.errors).forEach(([key, messages]) => {
          errors[key] = messages[0]
        })
        setProfileErrors(errors)
        setProfileError(response.data.message || 'Please fix the errors below.')
      } else {
        setProfileError(response?.data?.message || 'Unable to update profile. Please try again.')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    setSavingPassword(true)
    setPasswordError('')
    setPasswordMessage('')
    setPasswordErrors({})

    try {
      const response = await updatePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })
      setPasswordMessage(response.message || 'Password updated successfully.')
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (submitError) {
      const response = submitError.response

      if (response?.status === 422) {
        if (response.data?.errors) {
          const errors = {}
          Object.entries(response.data.errors).forEach(([key, messages]) => {
            errors[key] = messages[0]
          })
          setPasswordErrors(errors)
        }
        setPasswordError(response.data.message || 'Please fix the errors below.')
      } else {
        setPasswordError(response?.data?.message || 'Unable to update password. Please try again.')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  const renderFieldError = (errors, field) => {
    if (!errors[field]) return null
    return <p className="form-error">{errors[field]}</p>
  }

  if (loading) {
    return (
      <div>
        <Link to="/dashboard" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>
        <p className="page-header__description">Loading profile...</p>
      </div>
    )
  }

  if (!profileForm) {
    return (
      <div>
        <Link to="/dashboard" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>
        <p className="form-error">{error || 'Profile not available.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to="/dashboard" className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to dashboard
      </Link>

      <PageHeader
        title="Profile settings"
        description="Update your display name, username, profile photo, avatar, and account password."
      />

      <div className="profile-layout">
        <form className="profile-layout__main" onSubmit={handleProfileSubmit} noValidate>
          <Card>
            <PanelHeader title="Profile" />
            <p className="form-section__description">
              Choose how your name and avatar appear across the system.
            </p>

            {profileError && <p className="form-error">{profileError}</p>}
            {profileMessage && <p className="form-success">{profileMessage}</p>}

            <div className="profile-preview">
              <UserAvatar profile={previewProfile} size="xl" />
              <div>
                <strong>{profileForm.name}</strong>
                <span>@{profileForm.username}</span>
                <span>{profileForm.role}</span>
              </div>
            </div>

            <div className="profile-photo-upload">
              <div className="profile-photo-upload__header">
                <ImageUp size={16} aria-hidden="true" />
                <span>Profile picture</span>
              </div>
              <p className="profile-photo-upload__hint">
                Upload a photo from your device. JPG, PNG, or WebP up to 2 MB.
              </p>

              {photoError && <p className="form-error">{photoError}</p>}
              {photoMessage && <p className="form-success">{photoMessage}</p>}

              <div className="profile-photo-upload__actions">
                <input
                  ref={photoInputRef}
                  id="profile-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="profile-photo-upload__input"
                  onChange={handlePhotoSelect}
                  disabled={uploadingPhoto || removingPhoto}
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={ImageUp}
                  disabled={uploadingPhoto || removingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                >
                  {uploadingPhoto ? 'Uploading photo…' : 'Upload from device'}
                </Button>

                {(profile?.has_profile_photo || photoPreviewUrl) && (
                  <Button
                    type="button"
                    variant="ghost"
                    icon={Trash2}
                    disabled={uploadingPhoto || removingPhoto}
                    onClick={handleRemovePhoto}
                  >
                    {removingPhoto ? 'Removing…' : 'Remove photo'}
                  </Button>
                )}
              </div>
            </div>

            <div className="form-grid form-grid--2">
              <div className="form-field">
                <label htmlFor="profile-name">Display name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileForm.name}
                  onChange={(event) => handleProfileChange('name', event.target.value)}
                  autoComplete="name"
                />
                {renderFieldError(profileErrors, 'name')}
              </div>

              <div className="form-field">
                <label htmlFor="profile-username">Username</label>
                <input
                  id="profile-username"
                  type="text"
                  value={profileForm.username}
                  onChange={(event) => handleProfileChange('username', event.target.value)}
                  autoComplete="username"
                />
                {renderFieldError(profileErrors, 'username')}
              </div>

              <div className="form-field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => handleProfileChange('email', event.target.value)}
                  autoComplete="email"
                />
                {renderFieldError(profileErrors, 'email')}
              </div>

              <div className="form-field">
                <label htmlFor="profile-role">Role</label>
                <select
                  id="profile-role"
                  value={profileForm.role}
                  onChange={(event) => handleProfileChange('role', event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {renderFieldError(profileErrors, 'role')}
              </div>
            </div>

            <div className="profile-avatars">
              <div className="profile-avatars__header">
                <UserRound size={16} aria-hidden="true" />
                <span>Or choose a preset avatar</span>
              </div>
              <div className="profile-avatars__grid">
                {avatarOptions.map((avatar) => {
                  const selected = profileForm.avatar === avatar.id

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      className={`profile-avatars__option ${selected ? 'profile-avatars__option--selected' : ''}`.trim()}
                      onClick={() => handleProfileChange('avatar', avatar.id)}
                      aria-pressed={selected}
                      aria-label={`${avatar.label} avatar`}
                    >
                      <UserAvatar
                        profile={{ ...profileForm, avatar: avatar.id, profile_photo_url: null }}
                        size="lg"
                      />
                      <span>{avatar.label}</span>
                    </button>
                  )
                })}
              </div>
              {renderFieldError(profileErrors, 'avatar')}
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary" icon={Save} disabled={savingProfile}>
                {savingProfile ? 'Saving profile…' : 'Save profile'}
              </Button>
            </div>
          </Card>
        </form>

        <form className="profile-layout__aside" onSubmit={handlePasswordSubmit} noValidate>
          <Card>
            <PanelHeader title="Password" />
            <p className="form-section__description">
              Change your account password. You will need your current password to confirm.
            </p>

            {passwordError && <p className="form-error">{passwordError}</p>}
            {passwordMessage && <p className="form-success">{passwordMessage}</p>}

            <div className="form-grid form-grid--single">
              <div className="form-field">
                <label htmlFor="current-password">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(event) => handlePasswordChange('current_password', event.target.value)}
                  autoComplete="current-password"
                />
                {renderFieldError(passwordErrors, 'current_password')}
              </div>

              <div className="form-field">
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => handlePasswordChange('password', event.target.value)}
                  autoComplete="new-password"
                />
                {renderFieldError(passwordErrors, 'password')}
              </div>

              <div className="form-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.password_confirmation}
                  onChange={(event) =>
                    handlePasswordChange('password_confirmation', event.target.value)
                  }
                  autoComplete="new-password"
                />
                {renderFieldError(passwordErrors, 'password_confirmation')}
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" variant="secondary" icon={KeyRound} disabled={savingPassword}>
                {savingPassword ? 'Updating password…' : 'Update password'}
              </Button>
            </div>

            <div className="profile-signout">
              <Button
                type="button"
                variant="ghost"
                icon={LogOut}
                onClick={async () => {
                  await logout()
                  navigate('/login', { replace: true })
                }}
              >
                Sign out
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
