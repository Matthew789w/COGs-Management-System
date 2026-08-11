import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'

function ViewProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get(`/api/products/${id}`)
      .then((response) => setProduct(response.data.data))
      .catch(() => setError('Unable to load product details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div>
        <Link to="/products" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to products
        </Link>
        <p className="page-header__description">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div>
        <Link to="/products" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to products
        </Link>
        <p className="form-error">{error || 'Product not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to="/products" className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to products
      </Link>

      <PageHeader
        title={product.name}
        description="View product master data and catalog details."
        action={
          <div className="page-header__actions">
            <Link to={`/products/${product.id}/edit`}>
              <Button variant="secondary" icon={Pencil}>
                Edit
              </Button>
            </Link>
            <Link to={`/products/${product.id}/delete`}>
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
            <span className="detail-item__label">Product name</span>
            <span className="detail-item__value">{product.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">SKU</span>
            <span className="detail-item__value">{product.sku}</span>
          </div>
        </div>
        <div className="detail-item detail-item--full">
          <span className="detail-item__label">Description</span>
          <span className="detail-item__value">{product.description || '—'}</span>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Pricing & units" />
        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">List price</span>
            <span className="detail-item__value detail-item__value--mono">
              {formatPeso(product.list_price)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Default unit</span>
            <span className="detail-item__value">
              {product.default_unit
                ? `${product.default_unit.name} (${product.default_unit.symbol})`
                : '—'}
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
              <span
                className={`status-badge status-badge--${product.is_active ? 'active' : 'inactive'}`}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Last updated</span>
            <span className="detail-item__value">{product.updated_at || '—'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewProductPage
