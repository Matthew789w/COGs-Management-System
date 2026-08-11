import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

function EditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [form, setForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setFormError('')

    Promise.all([axios.get(`/api/products/${id}`), axios.get('/api/units')])
      .then(([productResponse, unitsResponse]) => {
        const product = productResponse.data.data
        setUnits(unitsResponse.data.data || [])
        setForm({
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          default_unit_id: product.default_unit?.id ?? '',
          list_price: product.list_price,
          is_active: product.is_active,
        })
      })
      .catch(() => setFormError('Unable to load product. Please try again.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      default_unit_id: Number(form.default_unit_id),
      list_price: Number(form.list_price),
      is_active: form.is_active,
    }

    try {
      await axios.put(`/api/products/${id}`, payload)
      navigate(`/products/${id}`)
    } catch (error) {
      const response = error.response

      if (response?.status === 422 && response.data?.errors) {
        const errors = {}
        Object.entries(response.data.errors).forEach(([key, messages]) => {
          errors[key] = messages[0]
        })
        setFieldErrors(errors)
        setFormError(response.data.message || 'Please fix the errors below.')
      } else {
        setFormError(response?.data?.message || 'Unable to update product. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldError = (field) => {
    if (!fieldErrors[field]) return null
    return <p className="form-error">{fieldErrors[field]}</p>
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

  if (!form) {
    return (
      <div>
        <Link to="/products" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to products
        </Link>
        <p className="form-error">{formError || 'Product not found.'}</p>
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
        title="Edit product"
        description="Update product master data and catalog settings."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Basic information" />
          <p className="form-section__description">
            Update the product identifiers and description.
          </p>

          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="product-name">
                Product name <span className="form-required">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                required
              />
              {renderFieldError('name')}
            </div>

            <div className={`form-field ${fieldErrors.sku ? 'form-field--error' : ''}`}>
              <label htmlFor="product-sku">
                SKU <span className="form-required">*</span>
              </label>
              <input
                id="product-sku"
                type="text"
                value={form.sku}
                onChange={(event) => handleChange('sku', event.target.value)}
                required
              />
              {renderFieldError('sku')}
            </div>
          </div>

          <div className={`form-field ${fieldErrors.description ? 'form-field--error' : ''}`}>
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              rows={3}
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
            />
            {renderFieldError('description')}
          </div>
        </Card>

        <Card>
          <PanelHeader title="Pricing & units" />
          <p className="form-section__description">
            Update the default unit of measure and list price.
          </p>

          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.default_unit_id ? 'form-field--error' : ''}`}>
              <label htmlFor="product-unit">
                Default unit <span className="form-required">*</span>
              </label>
              <select
                id="product-unit"
                value={form.default_unit_id}
                onChange={(event) => handleChange('default_unit_id', event.target.value)}
                required
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
              {renderFieldError('default_unit_id')}
            </div>

            <div className={`form-field ${fieldErrors.list_price ? 'form-field--error' : ''}`}>
              <label htmlFor="product-price">
                List price <span className="form-required">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={form.list_price}
                onChange={(event) => handleChange('list_price', event.target.value)}
                required
              />
              {renderFieldError('list_price')}
            </div>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Status" />
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => handleChange('is_active', event.target.checked)}
            />
            <span className="form-checkbox__content">
              <strong>Active product</strong>
              <span>Inactive products remain in the system but are hidden from active costing workflows.</span>
            </span>
          </label>
          {renderFieldError('is_active')}
        </Card>

        {formError && <p className="form-error form-error--banner">{formError}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/products/${id}`)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={Save} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditProductPage
