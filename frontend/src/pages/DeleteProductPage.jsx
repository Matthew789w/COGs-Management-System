import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'

function DeleteProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await axios.delete(`/api/products/${id}`)
      navigate('/products')
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          'Unable to delete product. It may be referenced by materials or utilities.',
      )
    } finally {
      setDeleting(false)
    }
  }

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

  if (!product) {
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
      <Link to={`/products/${id}`} className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to product
      </Link>

      <PageHeader
        title="Delete product"
        description="Permanently remove this product from your COGs master data catalog."
      />

      <Card className="delete-card">
        <div className="delete-card__icon">
          <AlertTriangle size={24} aria-hidden="true" />
        </div>
        <PanelHeader title="Confirm deletion" />
        <p className="form-section__description">
          You are about to delete <strong>{product.name}</strong>. This action cannot be undone.
          Products referenced by bill of materials or utilities cannot be deleted.
        </p>

        <div className="detail-grid detail-grid--2">
          <div className="detail-item">
            <span className="detail-item__label">SKU</span>
            <span className="detail-item__value">{product.sku}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">List price</span>
            <span className="detail-item__value detail-item__value--mono">
              {formatPeso(product.list_price)}
            </span>
          </div>
        </div>

        {error && <p className="form-error form-error--banner">{error}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/products/${id}`)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            icon={Trash2}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete product'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DeleteProductPage
