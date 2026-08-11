import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

function ViewUnitPage() {
  const { id } = useParams()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/units/${id}`)
      .then((response) => setUnit(response.data.data))
      .catch(() => setError('Unable to load unit details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div>
        <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>
        <p className="page-header__description">Loading unit...</p>
      </div>
    )
  }

  if (error || !unit) {
    return (
      <div>
        <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>
        <p className="form-error">{error || 'Unit not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>

      <PageHeader
        title={unit.name}
        description="View measurement unit details."
        action={
          <div className="page-header__actions">
            <Link to={`/units/${unit.id}/edit`}><Button variant="secondary" icon={Pencil}>Edit</Button></Link>
            <Link to={`/units/${unit.id}/delete`}><Button variant="destructive" icon={Trash2}>Delete</Button></Link>
          </div>
        }
      />

      <Card>
        <PanelHeader title="Unit details" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item"><span className="detail-item__label">Name</span><span className="detail-item__value">{unit.name}</span></div>
          <div className="detail-item"><span className="detail-item__label">Code</span><span className="detail-item__value">{unit.code}</span></div>
          <div className="detail-item"><span className="detail-item__label">Symbol</span><span className="detail-item__value">{unit.symbol}</span></div>
          <div className="detail-item"><span className="detail-item__label">Category</span><span className="detail-item__value">{unit.category}</span></div>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Status & metadata" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Status</span>
            <span className="detail-item__value">
              <span className={`status-badge status-badge--${unit.is_active ? 'active' : 'inactive'}`}>
                {unit.is_active ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Last updated</span>
            <span className="detail-item__value">{unit.updated_at || '—'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewUnitPage
