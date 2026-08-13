import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'

function DeleteMaterialPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await axios.delete(`/api/materials/${id}`)
      navigate('/materials')
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          'Unable to delete material. It may be referenced by product bill of materials.',
      )
    } finally {
      setDeleting(false)
    }
  }

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

  if (!material) {
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
      <Link to={`/materials/${id}`} className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to material
      </Link>

      <PageHeader
        title="Delete material"
        description="Permanently remove this material from your COGs master data."
      />

      <Card className="delete-card">
        <div className="delete-card__icon">
          <AlertTriangle size={24} aria-hidden="true" />
        </div>
        <PanelHeader title="Confirm deletion" />
        <p className="form-section__description">
          You are about to delete <strong>{material.name}</strong>. This action cannot be undone.
          Materials referenced by bill of materials cannot be deleted.
        </p>

        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">SKU / Code</span>
            <span className="detail-item__value">{material.sku}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Cost per unit</span>
            <span className="detail-item__value detail-item__value--mono">
              {formatPeso(material.cost_per_unit, 4)}
            </span>
          </div>
        </div>

        {error && <p className="form-error form-error--banner">{error}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/materials/${id}`)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            icon={Trash2}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete material'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DeleteMaterialPage
