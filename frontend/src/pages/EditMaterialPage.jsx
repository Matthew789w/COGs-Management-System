import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

function EditMaterialPage() {
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

    Promise.all([axios.get(`/api/materials/${id}`), axios.get('/api/units')])
      .then(([materialResponse, unitsResponse]) => {
        const material = materialResponse.data.data
        setUnits(unitsResponse.data.data || [])
        setForm({
          sku: material.sku,
          name: material.name,
          unit_id: material.unit?.id ?? '',
          cost_per_unit: material.cost_per_unit,
          is_active: material.is_active,
        })
      })
      .catch(() => setFormError('Unable to load material. Please try again.'))
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
      unit_id: Number(form.unit_id),
      cost_per_unit: Number(form.cost_per_unit),
      is_active: form.is_active,
    }

    try {
      await axios.put(`/api/materials/${id}`, payload)
      navigate(`/materials/${id}`)
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
        setFormError(response?.data?.message || 'Unable to update material. Please try again.')
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
        <Link to="/materials" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to materials
        </Link>
        <p className="page-header__description">Loading material...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div>
        <Link to="/materials" className="page-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to materials
        </Link>
        <p className="form-error">{formError || 'Material not found.'}</p>
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
        title="Edit material"
        description="Update material master data and cost settings."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Basic information" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="material-name">
                Material name <span className="form-required">*</span>
              </label>
              <input
                id="material-name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                required
              />
              {renderFieldError('name')}
            </div>

            <div className={`form-field ${fieldErrors.sku ? 'form-field--error' : ''}`}>
              <label htmlFor="material-sku">
                SKU / Code <span className="form-required">*</span>
              </label>
              <input
                id="material-sku"
                type="text"
                value={form.sku}
                onChange={(event) => handleChange('sku', event.target.value)}
                required
              />
              {renderFieldError('sku')}
            </div>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Cost & unit" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.unit_id ? 'form-field--error' : ''}`}>
              <label htmlFor="material-unit">
                Unit <span className="form-required">*</span>
              </label>
              <select
                id="material-unit"
                value={form.unit_id}
                onChange={(event) => handleChange('unit_id', event.target.value)}
                required
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
              {renderFieldError('unit_id')}
            </div>

            <div className={`form-field ${fieldErrors.cost_per_unit ? 'form-field--error' : ''}`}>
              <label htmlFor="material-cost">
                Cost per unit <span className="form-required">*</span>
              </label>
              <input
                id="material-cost"
                type="number"
                min="0"
                step="0.0001"
                value={form.cost_per_unit}
                onChange={(event) => handleChange('cost_per_unit', event.target.value)}
                required
              />
              {renderFieldError('cost_per_unit')}
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
              <strong>Active material</strong>
              <span>Inactive materials remain in the system but are hidden from active costing workflows.</span>
            </span>
          </label>
          {renderFieldError('is_active')}
        </Card>

        {formError && <p className="form-error form-error--banner">{formError}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/materials/${id}`)}>
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

export default EditMaterialPage
