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
  unit_id: '',
  rate: '',
  is_active: true,
}

function CreateUtilityPage() {
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get('/api/units')
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

    try {
      await axios.post('/api/utilities', {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        unit_id: Number(form.unit_id),
        rate: Number(form.rate),
        is_active: form.is_active,
      })
      navigate('/utilities')
    } catch (error) {
      const response = error.response
      if (response?.status === 422 && response.data?.errors) {
        const errors = {}
        Object.entries(response.data.errors).forEach(([key, messages]) => { errors[key] = messages[0] })
        setFieldErrors(errors)
        setFormError(response.data.message || 'Please fix the errors below.')
      } else {
        setFormError(response?.data?.message || 'Unable to create utility. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldError = (field) => fieldErrors[field] ? <p className="form-error">{fieldErrors[field]}</p> : null

  return (
    <div>
      <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
      <PageHeader title="Create utility" description="Add a new utility rate for product costing." />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Utility details" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-name">Utility name <span className="form-required">*</span></label>
              <input id="utility-name" type="text" placeholder="e.g. Electricity" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
              {renderFieldError('name')}
            </div>
            <div className={`form-field ${fieldErrors.code ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-code">Code <span className="form-required">*</span></label>
              <input id="utility-code" type="text" placeholder="e.g. ELEC" value={form.code} onChange={(e) => handleChange('code', e.target.value)} required />
              {renderFieldError('code')}
            </div>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Rate & unit" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.unit_id ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-unit">Unit <span className="form-required">*</span></label>
              <select id="utility-unit" value={form.unit_id} onChange={(e) => handleChange('unit_id', e.target.value)} required disabled={loadingUnits}>
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                ))}
              </select>
              {renderFieldError('unit_id')}
            </div>
            <div className={`form-field ${fieldErrors.rate ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-rate">Rate per unit <span className="form-required">*</span></label>
              <input id="utility-rate" type="number" min="0" step="0.0001" placeholder="0.00" value={form.rate} onChange={(e) => handleChange('rate', e.target.value)} required />
              {renderFieldError('rate')}
            </div>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Status" />
          <label className="form-checkbox">
            <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
            <span className="form-checkbox__content">
              <strong>Active utility</strong>
              <span>Inactive utilities remain in the system but are hidden from active costing workflows.</span>
            </span>
          </label>
        </Card>

        {formError && <p className="form-error form-error--banner">{formError}</p>}

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate('/utilities')}>Cancel</Button>
          <Button variant="primary" type="submit" icon={Save} disabled={submitting || loadingUnits}>
            {submitting ? 'Creating...' : 'Create utility'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateUtilityPage
