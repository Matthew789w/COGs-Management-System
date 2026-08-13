import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

function DeleteUnitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/units/${id}`)
      .then((response) => setUnit(response.data.data))
      .catch(() => setError('Unable to load unit details.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await axios.delete(`/api/units/${id}`)
      navigate('/units')
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete unit. It may be referenced by other records.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>
        <p className="page-header__description">Loading unit...</p>
      </div>
    )
  }

  if (!unit) {
    return (
      <div>
        <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>
        <p className="form-error">{error || 'Unit not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/units/${id}`} className="page-back-link"><ArrowLeft size={16} /> Back to unit</Link>
      <PageHeader title="Delete unit" description="Permanently remove this measurement unit." />

      <Card className="delete-card">
        <div className="delete-card__icon"><AlertTriangle size={24} /></div>
        <PanelHeader title="Confirm deletion" />
        <p className="form-section__description">
          You are about to delete <strong>{unit.name}</strong> ({unit.symbol}). Units referenced by materials, products, or utilities cannot be deleted.
        </p>
        <div className="detail-grid detail-grid--2">
          <div className="detail-item"><span className="detail-item__label">Code</span><span className="detail-item__value">{unit.code}</span></div>
          <div className="detail-item"><span className="detail-item__label">Category</span><span className="detail-item__value">{unit.category}</span></div>
        </div>
        {error && <p className="form-error form-error--banner">{error}</p>}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/units/${id}`)}>Cancel</Button>
          <Button variant="destructive" type="button" icon={Trash2} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete unit'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DeleteUnitPage
