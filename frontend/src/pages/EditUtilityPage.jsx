import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

function EditUtilityPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [form, setForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([axios.get(`/api/utilities/${id}`), axios.get('/api/units')])
      .then(([utilityResponse, unitsResponse]) => {
        const utility = utilityResponse.data.data
        setUnits(unitsResponse.data.data || [])
        setForm({
          code: utility.code,
          name: utility.name,
          unit_id: utility.unit?.id ?? '',
          rate: utility.rate,
          is_active: utility.is_active,
        })
      })
      .catch(() => setFormError('Unable to load utility. Please try again.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    setFieldErrors({})

    try {
      await axios.put(`/api/utilities/${id}`, {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        unit_id: Number(form.unit_id),
        rate: Number(form.rate),
        is_active: form.is_active,
      })
      navigate(`/utilities/${id}`)
    } catch (error) {
      const response = error.response
      if (response?.status === 422 && response.data?.errors) {
        const errors = {}
        Object.entries(response.data.errors).forEach(([key, messages]) => { errors[key] = messages[0] })
        setFieldErrors(errors)
        setFormError(response.data.message || 'Please fix the errors below.')
      } else {
        setFormError(response?.data?.message || 'Unable to update utility. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldError = (field) => fieldErrors[field] ? <p className="form-error">{fieldErrors[field]}</p> : null

  if (loading) {
    return (
      <div>
        <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
        <p className="page-header__description">Loading utility...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div>
        <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
        <p className="form-error">{formError || 'Utility not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/utilities/${id}`} className="page-back-link"><ArrowLeft size={16} /> Back to utility</Link>
      <PageHeader title="Edit utility" description="Update utility rate and billing settings." />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Utility details" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-name">Utility name <span className="form-required">*</span></label>
              <input id="utility-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
              {renderFieldError('name')}
            </div>
            <div className={`form-field ${fieldErrors.code ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-code">Code <span className="form-required">*</span></label>
              <input id="utility-code" type="text" value={form.code} onChange={(e) => handleChange('code', e.target.value)} required />
              {renderFieldError('code')}
            </div>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Rate & unit" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.unit_id ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-unit">Unit <span className="form-required">*</span></label>
              <select id="utility-unit" value={form.unit_id} onChange={(e) => handleChange('unit_id', e.target.value)} required>
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                ))}
              </select>
              {renderFieldError('unit_id')}
            </div>
            <div className={`form-field ${fieldErrors.rate ? 'form-field--error' : ''}`}>
              <label htmlFor="utility-rate">Rate per unit <span className="form-required">*</span></label>
              <input id="utility-rate" type="number" min="0" step="0.0001" value={form.rate} onChange={(e) => handleChange('rate', e.target.value)} required />
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
          <Button variant="secondary" type="button" onClick={() => navigate(`/utilities/${id}`)}>Cancel</Button>
          <Button variant="primary" type="submit" icon={Save} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditUtilityPage
