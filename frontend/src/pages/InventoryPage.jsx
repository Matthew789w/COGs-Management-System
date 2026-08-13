import { useCallback, useEffect, useState } from 'react'
import axios from '../lib/api'
import { Package, Plus, Warehouse } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import QuantityWithUnit from '../components/ui/QuantityWithUnit'
import TableLoadingState from '../components/ui/TableLoadingState'
import { formatPeso } from '../utils/currency'
import { formatQuantity } from '../utils/quantity'

const TRANSACTION_LABELS = {
  receipt: 'Material receipt',
  adjustment: 'Adjustment',
  production_issue: 'Production issue',
  production_receipt: 'Production receipt',
}

function InventoryPage() {
  const [materials, setMaterials] = useState([])
  const [materialBalances, setMaterialBalances] = useState([])
  const [productBalances, setProductBalances] = useState([])
  const [transactions, setTransactions] = useState([])
  const [receiptValues, setReceiptValues] = useState({
    material_id: '',
    quantity: '',
    unit_cost: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadInventory = useCallback(async () => {
    setLoading(true)
    try {
      const [materialsResponse, balancesResponse, transactionsResponse] = await Promise.all([
        axios.get('/api/materials'),
        axios.get('/api/inventory/balances'),
        axios.get('/api/inventory/transactions', { params: { limit: 25 } }),
      ])

      setMaterials(materialsResponse.data.data || [])
      setMaterialBalances(balancesResponse.data.data?.materials || [])
      setProductBalances(balancesResponse.data.data?.products || [])
      setTransactions(transactionsResponse.data.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const handleReceiptChange = (field, value) => {
    setReceiptValues((current) => ({ ...current, [field]: value }))
    setFormError('')
  }

  const handleReceiveMaterial = async () => {
    if (!receiptValues.material_id) {
      setFormError('Please select a material.')
      return
    }
    if (!receiptValues.quantity || Number(receiptValues.quantity) <= 0) {
      setFormError('Quantity must be greater than zero.')
      return
    }

    setSubmitting(true)
    setFormError('')

    const payload = {
      material_id: Number(receiptValues.material_id),
      quantity: Number(receiptValues.quantity),
      notes: receiptValues.notes || null,
    }

    if (receiptValues.unit_cost !== '') {
      payload.unit_cost = Number(receiptValues.unit_cost)
    }

    try {
      await axios.post('/api/inventory/material-receipts', payload)
      setReceiptValues({ material_id: '', quantity: '', unit_cost: '', notes: '' })
      await loadInventory()
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to record material receipt.')
    } finally {
      setSubmitting(false)
    }
  }

  const getMaterialBalance = (materialId) =>
    materialBalances.find((balance) => balance.material_id === materialId)

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="View stock levels and record material receipts. All inventory changes are processed by the backend — quantities cannot be edited directly."
      />

      <Card>
        <PanelHeader title="Record material receipt" />
        <p className="page-header__description" style={{ margin: '0 0 20px' }}>
          Receive materials into inventory before confirming production batches.
        </p>

        <div className="form-grid form-grid--2">
          <div className="form-field">
            <label htmlFor="receipt-material">Material</label>
            <select
              id="receipt-material"
              value={receiptValues.material_id}
              onChange={(event) => handleReceiptChange('material_id', event.target.value)}
            >
              <option value="">Select material</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="receipt-quantity">Quantity received</label>
            <input
              id="receipt-quantity"
              type="number"
              min="0.0001"
              step="0.0001"
              value={receiptValues.quantity}
              onChange={(event) => handleReceiptChange('quantity', event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="receipt-unit-cost">Unit cost (optional)</label>
            <input
              id="receipt-unit-cost"
              type="number"
              min="0"
              step="0.0001"
              value={receiptValues.unit_cost}
              onChange={(event) => handleReceiptChange('unit_cost', event.target.value)}
              placeholder="Uses material master cost if blank"
            />
          </div>

          <div className="form-field">
            <label htmlFor="receipt-notes">Notes</label>
            <input
              id="receipt-notes"
              type="text"
              value={receiptValues.notes}
              onChange={(event) => handleReceiptChange('notes', event.target.value)}
              placeholder="Optional reference or note"
            />
          </div>
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <div className="bom-actions">
          <Button variant="primary" icon={Plus} onClick={handleReceiveMaterial} disabled={submitting}>
            Record receipt
          </Button>
        </div>
      </Card>

      <Card>
        <PanelHeader title="Material inventory" />
        {loading ? (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Material</th>
                  <th>Unit</th>
                  <th className="table__col-num">On hand</th>
                  <th className="table__col-num">Master cost / unit</th>
                </tr>
              </thead>
              <tbody className="table__body">
                <TableLoadingState colSpan={4} message="Loading material inventory…" />
              </tbody>
            </table>
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon={Warehouse}
            title="No materials configured"
            description="Create materials first, then record receipts to build inventory."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Material</th>
                  <th>Unit</th>
                  <th className="table__col-num">On hand</th>
                  <th className="table__col-num">Master cost / unit</th>
                </tr>
              </thead>
              <tbody className="table__body">
                {materials.map((material) => {
                  const balance = getMaterialBalance(material.id)
                  const onHand = balance?.quantity_on_hand ?? 0
                  const unitSymbol = balance?.unit?.symbol || material.unit?.symbol || '—'

                  return (
                    <tr key={material.id} className="table__row">
                      <td>{material.name}</td>
                      <td>{unitSymbol}</td>
                      <td className="table__col-num">
                        <QuantityWithUnit value={onHand} unit={unitSymbol} />
                      </td>
                      <td className="table__col-num table__cell-mono">
                        {formatPeso(material.cost_per_unit, 4)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <PanelHeader title="Finished goods inventory" />
        {loading ? (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Product</th>
                  <th>Unit</th>
                  <th className="table__col-num">On hand</th>
                </tr>
              </thead>
              <tbody className="table__body">
                <TableLoadingState colSpan={3} message="Loading finished goods…" />
              </tbody>
            </table>
          </div>
        ) : productBalances.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No finished goods in stock"
            description="Confirm a production batch to receive finished products into inventory."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Product</th>
                  <th>Unit</th>
                  <th className="table__col-num">On hand</th>
                </tr>
              </thead>
              <tbody className="table__body">
                {productBalances.map((balance) => (
                  <tr key={balance.id} className="table__row">
                    <td>{balance.product?.name || 'Unknown product'}</td>
                    <td>{balance.unit?.symbol || balance.product?.default_unit?.symbol || '—'}</td>
                    <td className="table__col-num table__cell-mono">
                      {formatQuantity(balance.quantity_on_hand)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <PanelHeader title="Recent inventory transactions" />
        {loading ? (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th className="table__col-num">Quantity</th>
                  <th className="table__col-num">Unit cost</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody className="table__body">
                <TableLoadingState colSpan={6} message="Loading transactions…" />
              </tbody>
            </table>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Warehouse}
            title="No transactions yet"
            description="Material receipts and production confirmations will appear here."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th className="table__col-num">Quantity</th>
                  <th className="table__col-num">Unit cost</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody className="table__body">
                {transactions.map((transaction) => {
                  const itemName =
                    transaction.material?.name || transaction.product?.name || '—'
                  const unitSymbol = transaction.unit?.symbol || '—'

                  return (
                    <tr key={transaction.id} className="table__row">
                      <td className="table__cell-muted">{transaction.created_at}</td>
                      <td>{TRANSACTION_LABELS[transaction.transaction_type] || transaction.transaction_type}</td>
                      <td>{itemName}</td>
                      <td className="table__col-num">
                        <QuantityWithUnit value={transaction.quantity} unit={unitSymbol} />
                      </td>
                      <td className="table__col-num table__cell-mono">
                        {transaction.unit_cost != null ? formatPeso(transaction.unit_cost, 4) : '—'}
                      </td>
                      <td className="table__cell-muted">
                        {transaction.reference_id ? `#${transaction.reference_id}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default InventoryPage
