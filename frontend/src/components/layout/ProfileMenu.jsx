import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings, UserRound, Users } from 'lucide-react'
import UserAvatar from '../ui/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { useAdministratorAccess } from '../../utils/users'

function ProfileMenu({ open, onClose, profile }) {
  const panelRef = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isAdmin } = useAdministratorAccess()

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

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="profile-menu" ref={panelRef}>
      <div className="profile-menu__header">
        <UserAvatar profile={profile} size="md" />
        <div>
          <strong>{profile?.name || 'User'}</strong>
          <span>{profile?.role || 'Administrator'}</span>
        </div>
      </div>

      <div className="profile-menu__actions">
        <Link to="/profile" className="profile-menu__item" onClick={onClose}>
          <UserRound size={16} aria-hidden="true" />
          Profile
        </Link>

        <Link to="/settings" className="profile-menu__item" onClick={onClose}>
          <Settings size={16} aria-hidden="true" />
          Settings
        </Link>

        {isAdmin && (
          <Link to="/users" className="profile-menu__item" onClick={onClose}>
            <Users size={16} aria-hidden="true" />
            Manage users
          </Link>
        )}

        <button
          type="button"
          className="profile-menu__item profile-menu__item--danger"
          onClick={handleLogout}
        >
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  )
}

export default ProfileMenu
