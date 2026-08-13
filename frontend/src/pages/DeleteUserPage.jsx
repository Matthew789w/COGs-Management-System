import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import UserAvatar from '../components/ui/UserAvatar'

function DeleteUserPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get(`/api/users/${id}`)
      .then((response) => setUser(response.data.data))
      .catch(() => setError('Unable to load user details.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await axios.delete(`/api/users/${id}`)
      navigate('/users')
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          'Unable to delete user. You cannot delete your own account or the last administrator.',
      )
    } finally {
      setDeleting(false)
    }
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

  if (!user) {
    return (
      <div>
        <Link to="/users" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to users
        </Link>
        <p className="form-error">{error || 'User not found.'}</p>
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
        title="Delete user"
        description="Permanently remove this account from the system."
      />

      <Card className="delete-card">
        <div className="delete-card__icon">
          <AlertTriangle size={24} aria-hidden="true" />
        </div>
        <PanelHeader title="Confirm deletion" />
        <p className="form-section__description">
          You are about to delete <strong>{user.name}</strong>. This action cannot be undone.
        </p>

        <div className="profile-preview">
          <UserAvatar profile={user} size="lg" />
          <div>
            <strong>{user.name}</strong>
            <span>@{user.username}</span>
            <span>{user.role}</span>
          </div>
        </div>

        {error && <p className="form-error form-error--banner">{error}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/users/${id}`)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            icon={Trash2}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete user'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DeleteUserPage
