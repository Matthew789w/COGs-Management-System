import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '../lib/api'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import UserAvatar from '../components/ui/UserAvatar'
import { getAvatarLabel } from '../utils/avatars'

function ViewUserPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get(`/api/users/${id}`)
      .then((response) => setUser(response.data.data))
      .catch((loadError) => {
        setError(loadError.response?.data?.message || 'Unable to load user details.')
      })
      .finally(() => setLoading(false))
  }, [id])

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

  if (error || !user) {
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
      <Link to="/users" className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to users
      </Link>

      <PageHeader
        title={user.name}
        description="View account details and role assignment."
        action={
          <div className="page-header__actions">
            <Link to={`/users/${user.id}/edit`}>
              <Button variant="secondary" icon={Pencil}>
                Edit
              </Button>
            </Link>
            <Link to={`/users/${user.id}/delete`}>
              <Button variant="destructive" icon={Trash2}>
                Delete
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <PanelHeader title="Account information" />

        <div className="profile-preview">
          <UserAvatar profile={user} size="xl" />
          <div>
            <strong>{user.name}</strong>
            <span>@{user.username}</span>
            <span>{user.role}</span>
          </div>
        </div>

        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Username</span>
            <span className="detail-item__value">{user.username}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Email</span>
            <span className="detail-item__value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Role</span>
            <span className="detail-item__value">{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Avatar</span>
            <span className="detail-item__value">{getAvatarLabel(user.avatar)}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewUserPage
