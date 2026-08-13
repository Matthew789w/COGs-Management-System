export const AVATAR_OPTIONS = [
  { id: 'indigo', label: 'Indigo' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'violet', label: 'Violet' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'amber', label: 'Amber' },
  { id: 'rose', label: 'Rose' },
  { id: 'slate', label: 'Slate' },
  { id: 'brand', label: 'Brand' },
]

export function getAvatarLabel(avatarId) {
  return AVATAR_OPTIONS.find((option) => option.id === avatarId)?.label || 'Indigo'
}

export function getProfileInitials(name, username) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
  }

  const source = username || name || 'U'
  return source.slice(0, 2).toUpperCase()
}
