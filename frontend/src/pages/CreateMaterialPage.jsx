import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

const initialForm = {
  sku: '',
  name: '',
  unit_id: '',
  cost_per_unit: '',
  is_active: true,
}

function CreateMaterialPage() {
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios
      .get('/api/units')
      .then((response) => setUnits(response.data.data || []))
      .catch(() => setFormError('Unable to load units. Please refresh and try again.'))
      .finally(() => setLoadingUnits(false))
  }, [])

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
      await axios.post('/api/materials', payload)
      navigate('/materials')
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
        setFormError(response?.data?.message || 'Unable to create material. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldError = (field) => {
    if (!fieldErrors[field]) return null
    return <p className="form-error">{fieldErrors[field]}</p>
  }

  return (
    <div>
      <Link to="/materials" className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to materials
      </Link>

      <PageHeader
        title="Create material"
        description="Add a new raw material or purchased component to your master data."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Basic information" />
          <p className="form-section__description">
            Enter the material name and unique SKU code.
          </p>

          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="material-name">
                Material name <span className="form-required">*</span>
              </label>
              <input
                id="material-name"
                type="text"
                placeholder="e.g. Flour"
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
                placeholder="e.g. MAT-FLOUR"
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
          <p className="form-section__description">
            Set the unit of measure and cost per unit for this material.
          </p>

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
                disabled={loadingUnits}
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
                placeholder="0.00"
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
          <Button variant="secondary" type="button" onClick={() => navigate('/materials')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={Save} disabled={submitting || loadingUnits}>
            {submitting ? 'Creating...' : 'Create material'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateMaterialPage
