import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '../lib/api'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'

function ViewUtilityPage() {
  const { id } = useParams()
  const [utility, setUtility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/utilities/${id}`)
      .then((response) => setUtility(response.data.data))
      .catch(() => setError('Unable to load utility details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div>
        <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
        <p className="page-header__description">Loading utility...</p>
      </div>
    )
  }

  if (error || !utility) {
    return (
      <div>
        <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
        <p className="form-error">{error || 'Utility not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>

      <PageHeader
        title={utility.name}
        description="View utility rate and billing unit details."
        action={
          <div className="page-header__actions">
            <Link to={`/utilities/${utility.id}/edit`}><Button variant="secondary" icon={Pencil}>Edit</Button></Link>
            <Link to={`/utilities/${utility.id}/delete`}><Button variant="destructive" icon={Trash2}>Delete</Button></Link>
          </div>
        }
      />

      <Card>
        <PanelHeader title="Utility details" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item"><span className="detail-item__label">Name</span><span className="detail-item__value">{utility.name}</span></div>
          <div className="detail-item"><span className="detail-item__label">Code</span><span className="detail-item__value">{utility.code}</span></div>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Rate & unit" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Rate per unit</span>
            <span className="detail-item__value detail-item__value--mono">{formatPeso(utility.rate, 4)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Unit</span>
            <span className="detail-item__value">
              {utility.unit ? `${utility.unit.name} (${utility.unit.symbol})` : '—'}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Status & metadata" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Status</span>
            <span className="detail-item__value">
              <span className={`status-badge status-badge--${utility.is_active ? 'active' : 'inactive'}`}>
                {utility.is_active ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Last updated</span>
            <span className="detail-item__value">{utility.updated_at || '—'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewUtilityPage
