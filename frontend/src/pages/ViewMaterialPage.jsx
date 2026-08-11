import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'

function ViewMaterialPage() {
  const { id } = useParams()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get(`/api/materials/${id}`)
      .then((response) => setMaterial(response.data.data))
      .catch(() => setError('Unable to load material details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div>
        <Link to="/materials" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to materials
        </Link>
        <p className="page-header__description">Loading material...</p>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div>
        <Link to="/materials" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to materials
        </Link>
        <p className="form-error">{error || 'Material not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to="/materials" className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to materials
      </Link>

      <PageHeader
        title={material.name}
        description="View material master data and cost details."
        action={
          <div className="page-header__actions">
            <Link to={`/materials/${material.id}/edit`}>
              <Button variant="secondary" icon={Pencil}>
                Edit
              </Button>
            </Link>
            <Link to={`/materials/${material.id}/delete`}>
              <Button variant="destructive" icon={Trash2}>
                Delete
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <PanelHeader title="Basic information" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Material name</span>
            <span className="detail-item__value">{material.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">SKU / Code</span>
            <span className="detail-item__value">{material.sku}</span>
          </div>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Cost & unit" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Cost per unit</span>
            <span className="detail-item__value detail-item__value--mono">
              {formatPeso(material.cost_per_unit, 4)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Unit</span>
            <span className="detail-item__value">
              {material.unit
                ? `${material.unit.name} (${material.unit.symbol})`
                : '—'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Unit category</span>
            <span className="detail-item__value">{material.unit?.category || '—'}</span>
          </div>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Status & metadata" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">Status</span>
            <span className="detail-item__value">
              <span
                className={`status-badge status-badge--${material.is_active ? 'active' : 'inactive'}`}
              >
                {material.is_active ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Last updated</span>
            <span className="detail-item__value">{material.updated_at || '—'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewMaterialPage
