import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

const initialForm = {
  code: '',
  name: '',
  symbol: '',
  category: '',
  is_active: true,
}

function CreateUnitPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      symbol: form.symbol.trim(),
      category: form.category.trim(),
      is_active: form.is_active,
    }

    try {
      await axios.post('/api/units', payload)
      navigate('/units')
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
        setFormError(response?.data?.message || 'Unable to create unit. Please try again.')
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
      <Link to="/units" className="page-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to units
      </Link>

      <PageHeader
        title="Create unit"
        description="Add a new measurement unit for costing calculations."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Unit details" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-name">Unit name <span className="form-required">*</span></label>
              <input id="unit-name" type="text" placeholder="e.g. Kilogram" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
              {renderFieldError('name')}
            </div>
            <div className={`form-field ${fieldErrors.code ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-code">Code <span className="form-required">*</span></label>
              <input id="unit-code" type="text" placeholder="e.g. KG" value={form.code} onChange={(e) => handleChange('code', e.target.value)} required />
              {renderFieldError('code')}
            </div>
            <div className={`form-field ${fieldErrors.symbol ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-symbol">Symbol <span className="form-required">*</span></label>
              <input id="unit-symbol" type="text" placeholder="e.g. kg" value={form.symbol} onChange={(e) => handleChange('symbol', e.target.value)} required />
              {renderFieldError('symbol')}
            </div>
            <div className={`form-field ${fieldErrors.category ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-category">Category <span className="form-required">*</span></label>
              <input id="unit-category" type="text" placeholder="e.g. Weight" value={form.category} onChange={(e) => handleChange('category', e.target.value)} required />
              {renderFieldError('category')}
            </div>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Status" />
          <label className="form-checkbox">
            <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
            <span className="form-checkbox__content">
              <strong>Active unit</strong>
              <span>Inactive units remain in the system but are hidden from active costing workflows.</span>
            </span>
          </label>
        </Card>

        {formError && <p className="form-error form-error--banner">{formError}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate('/units')}>Cancel</Button>
          <Button variant="primary" type="submit" icon={Save} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create unit'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateUnitPage
