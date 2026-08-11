import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { CheckCircle2, Factory, Plus, XCircle } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import QuantityWithUnit from '../components/ui/QuantityWithUnit'
import { formatQuantity } from '../utils/quantity'

const STATUS_VARIANTS = {
  draft: 'warning',
  confirmed: 'success',
  cancelled: 'error',
}

const initialForm = {
  batch_number: '',
  product_id: '',
  production_quantity: '',
  production_date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function ProductionPage() {
  const [products, setProducts] = useState([])
  const [batches, setBatches] = useState([])
  const [formValues, setFormValues] = useState(initialForm)
  const [requirements, setRequirements] = useState(null)
  const [loadingRequirements, setLoadingRequirements] = useState(false)
  const [requirementsError, setRequirementsError] = useState('')
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadBatches = useCallback(() => {
    axios.get('/api/production-batches').then((response) => {
      setBatches(response.data.data || [])
    })
  }, [])

  useEffect(() => {
    axios.get('/api/products').then((response) => setProducts(response.data.data || []))
    loadBatches()
  }, [loadBatches])

  useEffect(() => {
    const productId = formValues.product_id
    const quantity = Number(formValues.production_quantity)

    if (!productId || !quantity || quantity <= 0) {
      setRequirements(null)
      setRequirementsError('')
      return
    }

    setLoadingRequirements(true)
    setRequirementsError('')
    const timer = setTimeout(() => {
      axios
        .get(`/api/products/${productId}/production-requirements`, {
          params: { production_quantity: quantity },
        })
        .then((response) => setRequirements(response.data.data))
        .catch((error) => {
          setRequirements(null)
          setRequirementsError(
            error.response?.data?.message || 'Unable to load material requirements.',
          )
        })
        .finally(() => setLoadingRequirements(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [formValues.product_id, formValues.production_quantity])

  const selectedProductName = useMemo(() => {
    return products.find((product) => product.id === Number(formValues.product_id))?.name || ''
  }, [products, formValues.product_id])

  const handleFormChange = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }))
    setFormError('')
  }

  const handleCreateDraft = async () => {
    if (!formValues.product_id) {
      setFormError('Please select a product.')
      return
    }
    if (!formValues.production_quantity || Number(formValues.production_quantity) <= 0) {
      setFormError('Production quantity must be greater than zero.')
      return
    }
    if (!formValues.production_date) {
      setFormError('Please select a production date.')
      return
    }

    setSubmitting(true)
    setFormError('')

    const payload = {
      product_id: Number(formValues.product_id),
      production_quantity: Number(formValues.production_quantity),
      production_date: formValues.production_date,
      notes: formValues.notes || null,
    }

    if (formValues.batch_number.trim()) {
      payload.batch_number = formValues.batch_number.trim()
    }

    try {
      await axios.post('/api/production-batches', payload)
      setFormValues(initialForm)
      setRequirements(null)
      loadBatches()
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to create production batch.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = async (batch) => {
    setActionError('')
    try {
      await axios.post(`/api/production-batches/${batch.id}/confirm`)
      loadBatches()
    } catch (error) {
      const shortfalls = error.response?.data?.errors?.shortfalls
      if (shortfalls?.length) {
        const details = shortfalls
          .map((item) => `${item.material_name}: need ${item.required}, have ${item.available}`)
          .join('; ')
        setActionError(`Insufficient inventory — ${details}`)
      } else {
        setActionError(error.response?.data?.message || 'Unable to confirm production batch.')
      }
    }
  }

  const handleCancel = async (batch) => {
    setActionError('')
    try {
      await axios.post(`/api/production-batches/${batch.id}/cancel`)
      loadBatches()
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to cancel production batch.')
    }
  }

  const handleDelete = async (batch) => {
    setActionError('')
    try {
      await axios.delete(`/api/production-batches/${batch.id}`)
      loadBatches()
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to delete production batch.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Production"
        description="Create production batches, preview BOM material requirements, and confirm production to deduct inventory."
      />

      <Card>
        <PanelHeader title="Create production batch" />
        <p className="page-header__description" style={{ margin: '0 0 20px' }}>
          Save as draft first. Inventory is only deducted when you confirm the batch.
        </p>

        <div className="form-grid form-grid--2">
          <div className="form-field">
            <label htmlFor="batch-product">Product</label>
            <select
              id="batch-product"
              value={formValues.product_id}
              onChange={(event) => handleFormChange('product_id', event.target.value)}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="batch-number">Batch / reference number</label>
            <input
              id="batch-number"
              type="text"
              value={formValues.batch_number}
              onChange={(event) => handleFormChange('batch_number', event.target.value)}
              placeholder="Auto-generated if left blank"
            />
          </div>

          <div className="form-field">
            <label htmlFor="batch-quantity">Production quantity</label>
            <input
              id="batch-quantity"
              type="number"
              min="0.0001"
              step="0.0001"
              value={formValues.production_quantity}
              onChange={(event) => handleFormChange('production_quantity', event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="batch-date">Production date</label>
            <input
              id="batch-date"
              type="date"
              value={formValues.production_date}
              onChange={(event) => handleFormChange('production_date', event.target.value)}
            />
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="batch-notes">Notes</label>
            <textarea
              id="batch-notes"
              value={formValues.notes}
              onChange={(event) => handleFormChange('notes', event.target.value)}
              rows={2}
            />
          </div>
        </div>

        {selectedProductName && formValues.production_quantity && (
          <div style={{ marginTop: 24 }}>
            <h3 className="costing-section__title">
              Material requirements for {selectedProductName} × {formValues.production_quantity}
            </h3>
            {requirements?.recipe_batch_size && (
              <p className="page-header__description" style={{ margin: '0 0 12px' }}>
                BOM quantities are defined per batch of {formatQuantity(requirements.recipe_batch_size)} units.
              </p>
            )}
            {loadingRequirements ? (
              <p className="page-header__description">Calculating requirements…</p>
            ) : requirementsError ? (
              <p className="form-error">{requirementsError}</p>
            ) : requirements?.materials?.length ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead className="table__head">
                    <tr>
                      <th>Material</th>
                      <th className="table__col-num">
                        BOM qty
                        {requirements.recipe_batch_size ? ` / ${formatQuantity(requirements.recipe_batch_size)}` : ''}
                      </th>
                      <th className="table__col-num">Required qty</th>
                      <th className="table__col-num">On hand</th>
                      <th className="table__col-status">Status</th>
                    </tr>
                  </thead>
                  <tbody className="table__body">
                    {requirements.materials.map((item) => (
                      <tr key={item.material_id} className="table__row">
                        <td>{item.material_name}</td>
                        <td className="table__col-num">
                          <QuantityWithUnit value={item.bom_quantity_per_unit} unit={item.unit_symbol} />
                        </td>
                        <td className="table__col-num">
                          <QuantityWithUnit value={item.required_quantity} unit={item.unit_symbol} />
                        </td>
                        <td className="table__col-num">
                          <QuantityWithUnit value={item.quantity_on_hand} unit={item.unit_symbol} />
                        </td>
                        <td className="table__col-status">
                          <Badge variant={item.is_sufficient ? 'success' : 'error'}>
                            {item.is_sufficient ? 'Sufficient' : 'Short'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Factory}
                title="No BOM materials found"
                description="Configure a bill of materials for this product before creating a batch."
              />
            )}
          </div>
        )}

        {formError && <p className="form-error">{formError}</p>}

        <div className="bom-actions">
          <Button variant="primary" icon={Plus} onClick={handleCreateDraft} disabled={submitting}>
            Save as draft
          </Button>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Production batches" />
        {actionError && <p className="form-error">{actionError}</p>}

        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Batch #</th>
                <th>Product</th>
                <th className="table__col-num">Quantity</th>
                <th>Date</th>
                <th className="table__col-status">Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Factory}
                      title="No production batches yet"
                      description="Create a draft batch above to start production planning."
                    />
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="table__row">
                    <td className="table__cell-mono">{batch.batch_number}</td>
                    <td>{batch.product?.name || '—'}</td>
                    <td className="table__col-num table__cell-mono">
                      {formatQuantity(batch.production_quantity)}
                    </td>
                    <td>{batch.production_date}</td>
                    <td className="table__col-status">
                      <Badge variant={STATUS_VARIANTS[batch.status] || 'default'}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="table__actions">
                        {batch.status === 'draft' && (
                          <>
                            <button
                              type="button"
                              className="table-action table-action--view"
                              title="Confirm production"
                              aria-label="Confirm production"
                              onClick={() => handleConfirm(batch)}
                            >
                              <CheckCircle2 size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              className="table-action table-action--delete"
                              title="Cancel batch"
                              aria-label="Cancel batch"
                              onClick={() => handleCancel(batch)}
                            >
                              <XCircle size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              className="table-action table-action--delete"
                              title="Delete draft"
                              aria-label="Delete draft"
                              onClick={() => handleDelete(batch)}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default ProductionPage
