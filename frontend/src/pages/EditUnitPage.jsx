import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

function EditUnitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get(`/api/units/${id}`)
      .then((response) => {
        const unit = response.data.data
        setForm({
          code: unit.code,
          name: unit.name,
          symbol: unit.symbol,
          category: unit.category,
          is_active: unit.is_active,
        })
      })
      .catch(() => setFormError('Unable to load unit. Please try again.'))
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
      await axios.put(`/api/units/${id}`, {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        symbol: form.symbol.trim(),
        category: form.category.trim(),
        is_active: form.is_active,
      })
      navigate(`/units/${id}`)
    } catch (error) {
      const response = error.response
      if (response?.status === 422 && response.data?.errors) {
        const errors = {}
        Object.entries(response.data.errors).forEach(([key, messages]) => { errors[key] = messages[0] })
        setFieldErrors(errors)
        setFormError(response.data.message || 'Please fix the errors below.')
      } else {
        setFormError(response?.data?.message || 'Unable to update unit. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldError = (field) => fieldErrors[field] ? <p className="form-error">{fieldErrors[field]}</p> : null

  if (loading) {
    return (
      <div>
        <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>
        <p className="page-header__description">Loading unit...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div>
        <Link to="/units" className="page-back-link"><ArrowLeft size={16} /> Back to units</Link>
        <p className="form-error">{formError || 'Unit not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/units/${id}`} className="page-back-link"><ArrowLeft size={16} /> Back to unit</Link>
      <PageHeader title="Edit unit" description="Update measurement unit details." />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <PanelHeader title="Unit details" />
          <div className="form-grid form-grid--2">
            <div className={`form-field ${fieldErrors.name ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-name">Unit name <span className="form-required">*</span></label>
              <input id="unit-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
              {renderFieldError('name')}
            </div>
            <div className={`form-field ${fieldErrors.code ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-code">Code <span className="form-required">*</span></label>
              <input id="unit-code" type="text" value={form.code} onChange={(e) => handleChange('code', e.target.value)} required />
              {renderFieldError('code')}
            </div>
            <div className={`form-field ${fieldErrors.symbol ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-symbol">Symbol <span className="form-required">*</span></label>
              <input id="unit-symbol" type="text" value={form.symbol} onChange={(e) => handleChange('symbol', e.target.value)} required />
              {renderFieldError('symbol')}
            </div>
            <div className={`form-field ${fieldErrors.category ? 'form-field--error' : ''}`}>
              <label htmlFor="unit-category">Category <span className="form-required">*</span></label>
              <input id="unit-category" type="text" value={form.category} onChange={(e) => handleChange('category', e.target.value)} required />
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
          <Button variant="secondary" type="button" onClick={() => navigate(`/units/${id}`)}>Cancel</Button>
          <Button variant="primary" type="submit" icon={Save} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditUnitPage
