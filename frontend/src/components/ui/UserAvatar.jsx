import { getProfileInitials } from '../../utils/avatars'
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto'

function UserAvatar({ profile, photoUrl, size = 'md', className = '' }) {
  const avatarId = profile?.avatar || 'indigo'
  const initials = profile?.initials || getProfileInitials(profile?.name, profile?.username)
  const resolvedPhotoUrl = resolveProfilePhotoUrl(photoUrl || profile?.profile_photo_url)

  const sizeClass = `user-avatar--${size}`
  const classes = ['user-avatar', sizeClass, className].filter(Boolean).join(' ')

  if (resolvedPhotoUrl) {
    return (
      <img
        src={resolvedPhotoUrl}
        alt=""
        className={`${classes} user-avatar--photo`}
        aria-hidden="true"
      />
    )
  }

  return (
    <div className={`${classes} user-avatar--${avatarId}`} aria-hidden="true">
      {initials}
    </div>
  )
}

export default UserAvatar
