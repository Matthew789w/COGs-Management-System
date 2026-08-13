import { Navigate } from 'react-router-dom'
import { useAdministratorAccess } from '../../utils/users'

function AdminRoute({ children }) {
  const { loading, isAdmin } = useAdministratorAccess()

  if (loading) {
    return (
      <div className="auth-loading">
        <span className="table-loading__spinner" aria-hidden="true" />
        <span>Loading…</span>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
