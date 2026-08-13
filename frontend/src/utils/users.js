import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'

export const USER_ROLES = [
  'Administrator',
  'Plant Manager',
  'Supervisor',
  'Operator',
  'Accountant',
]

export function isAdministrator(role) {
  return role === 'Administrator'
}

export function useAdministratorAccess() {
  const { user: authUser, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUser()

  const role = profile?.role ?? authUser?.role
  const loading = authLoading || profileLoading

  return {
    loading,
    isAdmin: isAdministrator(role),
    role,
  }
}
