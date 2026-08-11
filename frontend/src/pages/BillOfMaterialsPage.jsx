import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { ClipboardList, Pencil, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'

const initialBomItem = {
  material_id: '',
  unit_id: '',
  quantity: 0,
}

const formatMoney = (value, decimals = 4) => {
  if (value === null || value === undefined || value === '') return '—'
  return `$${Number(value).toFixed(decimals)}`
}

function BillOfMaterialsPage() {
  const [products, setProducts] = useState([])
  const [materials, setMaterials] = useState([])
  const [units, setUnits] = useState([])
  const [bomItems, setBomItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editorValues, setEditorValues] = useState(initialBomItem)
  const [formError, setFormError] = useState('')

  const selectedProductName = useMemo(() => {
    return products.find((product) => product.id === Number(selectedProduct))?.name || ''
  }, [products, selectedProduct])

  useEffect(() => {
    axios.get('/api/products').then((response) => setProducts(response.data.data))
    axios.get('/api/materials').then((response) => setMaterials(response.data.data))
    axios.get('/api/units').then((response) => setUnits(response.data.data))
  }, [])

  useEffect(() => {
    if (!selectedProduct) {
      setBomItems([])
      return
    }

    axios
      .get('/api/product-materials', { params: { product_id: selectedProduct } })
      .then((response) => setBomItems(response.data.data || []))
  }, [selectedProduct])

  const selectedMaterials = materials.filter((material) => {
    return !bomItems.some((item) => item.material_id === Number(material.id))
  })

  const validateItem = (item) => {
    if (!item.material_id) {
      return 'Please select a material.'
    }
    if (!item.unit_id) {
      return 'Please select a unit.'
    }
    if (!item.quantity || Number(item.quantity) <= 0) {
      return 'Quantity must be greater than zero.'
    }
    return ''
  }

  const handleEditorChange = (field, value) => {
    if (field === 'material_id') {
      const material = materials.find((item) => item.id === Number(value))
      setEditorValues((current) => ({
        ...current,
        material_id: value,
        unit_id: material?.unit?.id ?? '',
      }))
      return
    }

    setEditorValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAddOrUpdate = async () => {
    const error = validateItem(editorValues)
    if (error) {
      setFormError(error)
      return
    }

    setFormError('')

    const payload = {
      product_id: Number(selectedProduct),
      material_id: Number(editorValues.material_id),
      unit_id: Number(editorValues.unit_id),
      quantity: Number(editorValues.quantity),
      position: editingId !== null ? bomItems.findIndex((item) => item.id === editingId) : bomItems.length,
    }

    try {
      if (editingId !== null) {
        await axios.put(`/api/product-materials/${editingId}`, payload)
      } else {
        await axios.post('/api/product-materials', payload)
      }

      setEditorValues(initialBomItem)
      setEditingId(null)
      axios
        .get('/api/product-materials', { params: { product_id: selectedProduct } })
        .then((response) => setBomItems(response.data.data || []))
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to save BOM item.')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditorValues({
      material_id: item.material_id,
      unit_id: item.unit_id,
      quantity: item.quantity,
    })
  }

  const handleRemove = async (item) => {
    await axios.delete(`/api/product-materials/${item.id}`)
    setBomItems((current) => current.filter((bom) => bom.id !== item.id))
  }

  const totalCost = bomItems.reduce((sum, item) => sum + Number(item.total_cost || 0), 0)

  return (
    <div>
      <PageHeader
        title="Bill of Materials"
        description="Define the materials and quantities required to build a product without calculating final COGS yet."
      />

      <Card>
        <PanelHeader title="Product selection" />
        <p className="page-header__description" style={{ margin: '0 0 16px' }}>
          Choose the product you want to build a BOM for.
        </p>
        <div className="form-field">
          <label htmlFor="product-select">Product</label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(event) => setSelectedProduct(event.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedProduct && (
        <>
          <Card>
            <PanelHeader title={`BOM editor for ${selectedProductName}`} />
            <p className="page-header__description" style={{ margin: '0 0 20px' }}>
              Add materials, specify the required quantity, and assign the correct unit.
            </p>

            <div className="bom-editor">
              <div className="form-grid form-grid--2">
                <div className="bom-field-row">
                  <label htmlFor="bom-material">Material</label>
                  <select
                    id="bom-material"
                    value={editorValues.material_id}
                    onChange={(event) => handleEditorChange('material_id', event.target.value)}
                  >
                    <option value="">Select material</option>
                    {selectedMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bom-field-row">
                  <label htmlFor="bom-unit">Unit</label>
                  <select
                    id="bom-unit"
                    value={editorValues.unit_id}
                    onChange={(event) => handleEditorChange('unit_id', event.target.value)}
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field" style={{ maxWidth: 240 }}>
                <label htmlFor="bom-quantity">Quantity</label>
                <input
                  id="bom-quantity"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={editorValues.quantity}
                  onChange={(event) => handleEditorChange('quantity', event.target.value)}
                />
              </div>

              <div className="bom-actions">
                {editingId !== null && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingId(null)
                      setEditorValues(initialBomItem)
                      setFormError('')
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button variant="primary" onClick={handleAddOrUpdate}>
                  {editingId !== null ? 'Update BOM item' : 'Add BOM item'}
                </Button>
              </div>

              {formError && <p className="form-error">{formError}</p>}
            </div>
          </Card>

          <Card>
            <PanelHeader
              title="BOM items"
              action={
                <div className="bom-summary">
                  <strong>Total material cost:</strong>
                  <span className="bom-summary__value">${totalCost.toFixed(2)}</span>
                </div>
              }
            />
            <p className="page-header__description" style={{ margin: '0 0 16px' }}>
              Review and manage the material list for this product.
            </p>

            <div className="table-wrapper">
              <table className="table">
                <thead className="table__head">
                  <tr>
                    <th>#</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Cost per unit</th>
                    <th>Total cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table__body">
                  {bomItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={ClipboardList}
                          title="No BOM items added yet"
                          description="Add materials above to build the bill of materials for this product."
                        />
                      </td>
                    </tr>
                  ) : (
                    bomItems.map((item, index) => (
                      <tr key={item.id} className="table__row">
                        <td className="table__cell-muted">{index + 1}</td>
                        <td>{item.material?.name || 'Unknown'}</td>
                        <td className="table__cell-mono">{item.quantity}</td>
                        <td>{item.unit?.symbol || '—'}</td>
                        <td className="table__cell-mono">
                          {formatMoney(item.cost_per_unit)}
                        </td>
                        <td className="table__cell-mono">
                          {formatMoney(item.total_cost)}
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className="button button--ghost button--icon"
                              aria-label="Edit"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="button button--ghost button--icon"
                              aria-label="Remove"
                              onClick={() => handleRemove(item)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default BillOfMaterialsPage
