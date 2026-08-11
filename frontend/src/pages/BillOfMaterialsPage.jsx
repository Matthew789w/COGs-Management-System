import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Building2, Calculator, ClipboardList, Pencil, Trash2, TrendingUp, Users, Zap } from 'lucide-react'
import ManufacturingNav from '../components/manufacturing/ManufacturingNav'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'
import { formatOverheadCategory, OVERHEAD_CATEGORIES } from '../utils/manufacturing'
import { formatQuantity, normalizeQuantityInput } from '../utils/quantity'

const initialBomItem = {
  material_id: '',
  unit_id: '',
  quantity: 0,
}

const initialUtilityItem = {
  utility_id: '',
  quantity: 0,
}

const initialLaborItem = {
  role: '',
  workers: 1,
  hours: 0,
  hourly_rate: 0,
}

const initialOverheadItem = {
  name: '',
  category: 'depreciation',
  amount: 0,
}

function BillOfMaterialsPage() {
  const [products, setProducts] = useState([])
  const [materials, setMaterials] = useState([])
  const [units, setUnits] = useState([])
  const [utilities, setUtilities] = useState([])
  const [bomItems, setBomItems] = useState([])
  const [utilityItems, setUtilityItems] = useState([])
  const [laborItems, setLaborItems] = useState([])
  const [overheadItems, setOverheadItems] = useState([])
  const [costing, setCosting] = useState(null)
  const [pricing, setPricing] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productionQuantity, setProductionQuantity] = useState('1')
  const [profitMargin, setProfitMargin] = useState('30')
  const [productionQuantityError, setProductionQuantityError] = useState('')
  const [pricingError, setPricingError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [utilityEditingId, setUtilityEditingId] = useState(null)
  const [laborEditingId, setLaborEditingId] = useState(null)
  const [overheadEditingId, setOverheadEditingId] = useState(null)
  const [editorValues, setEditorValues] = useState(initialBomItem)
  const [utilityEditorValues, setUtilityEditorValues] = useState(initialUtilityItem)
  const [laborEditorValues, setLaborEditorValues] = useState(initialLaborItem)
  const [overheadEditorValues, setOverheadEditorValues] = useState(initialOverheadItem)
  const [formError, setFormError] = useState('')
  const [utilityFormError, setUtilityFormError] = useState('')
  const [laborFormError, setLaborFormError] = useState('')
  const [overheadFormError, setOverheadFormError] = useState('')

  const selectedProductRecord = useMemo(() => {
    return products.find((product) => product.id === Number(selectedProduct)) || null
  }, [products, selectedProduct])

  const selectedProductName = selectedProductRecord?.name || ''

  const fetchCosting = useCallback(async (productId) => {
    const response = await axios.get(`/api/products/${productId}/costing`)
    setCosting(response.data.data || null)
  }, [])

  const fetchPricing = useCallback(async (productId, margin) => {
    const response = await axios.get(`/api/products/${productId}/pricing`, {
      params: { profit_margin: margin },
    })
    setPricing(response.data.data || null)
    setPricingError('')
  }, [])

  const refreshManufacturingData = useCallback(async (productId, options = {}) => {
    const [materialsResponse, utilitiesResponse, laborResponse, overheadResponse] = await Promise.all([
      axios.get('/api/product-materials', { params: { product_id: productId } }),
      axios.get('/api/product-utilities', { params: { product_id: productId } }),
      axios.get('/api/product-labor', { params: { product_id: productId } }),
      axios.get('/api/product-overhead', { params: { product_id: productId } }),
    ])

    setBomItems(materialsResponse.data.data || [])
    setUtilityItems(utilitiesResponse.data.data || [])
    setLaborItems(laborResponse.data.data || [])
    setOverheadItems(overheadResponse.data.data || [])
    await fetchCosting(productId)

    if (options.recalculatePricing && options.profitMargin) {
      try {
        await fetchPricing(productId, options.profitMargin)
      } catch (error) {
        setPricing(null)
        setPricingError(
          error.response?.data?.errors?.profit_margin?.[0]
            || error.response?.data?.message
            || 'Unable to calculate pricing.',
        )
      }
    }
  }, [fetchCosting, fetchPricing])

  useEffect(() => {
    axios.get('/api/products').then((response) => setProducts(response.data.data))
    axios.get('/api/materials').then((response) => setMaterials(response.data.data))
    axios.get('/api/units').then((response) => setUnits(response.data.data))
    axios.get('/api/utilities').then((response) => setUtilities(response.data.data))
  }, [])

  useEffect(() => {
    if (!selectedProduct) {
      setBomItems([])
      setUtilityItems([])
      setLaborItems([])
      setOverheadItems([])
      setCosting(null)
      setPricing(null)
      setPricingError('')
      return
    }

    setEditingId(null)
    setUtilityEditingId(null)
    setLaborEditingId(null)
    setOverheadEditingId(null)
    setEditorValues(initialBomItem)
    setUtilityEditorValues(initialUtilityItem)
    setLaborEditorValues(initialLaborItem)
    setOverheadEditorValues(initialOverheadItem)
    setFormError('')
    setUtilityFormError('')
    setLaborFormError('')
    setOverheadFormError('')
    setProductionQuantityError('')
    setPricing(null)
    setPricingError('')

    refreshManufacturingData(selectedProduct)
  }, [selectedProduct, refreshManufacturingData])

  useEffect(() => {
    if (selectedProductRecord) {
      setProductionQuantity(normalizeQuantityInput(selectedProductRecord.production_quantity ?? 1))
    }
  }, [selectedProduct, selectedProductRecord?.id, selectedProductRecord?.production_quantity])

  const editorMaterialOptions = useMemo(() => {
    return materials.filter((material) => {
      const isUsedByAnotherItem = bomItems.some(
        (item) => item.material_id === Number(material.id) && item.id !== editingId,
      )
      if (isUsedByAnotherItem) return false

      if (editorValues.unit_id && !editorValues.material_id) {
        return material.unit?.id === Number(editorValues.unit_id)
      }

      return true
    })
  }, [materials, bomItems, editingId, editorValues.unit_id, editorValues.material_id])

  const editorUtilityOptions = useMemo(() => {
    return utilities.filter((utility) => {
      return !utilityItems.some(
        (item) => item.utility_id === Number(utility.id) && item.id !== utilityEditingId,
      )
    })
  }, [utilities, utilityItems, utilityEditingId])

  const selectedUtility = useMemo(() => {
    if (!utilityEditorValues.utility_id) return null
    return utilities.find((utility) => utility.id === Number(utilityEditorValues.utility_id)) || null
  }, [utilities, utilityEditorValues.utility_id])

  const isUnitLocked = Boolean(editorValues.material_id)

  const selectedUnitLabel = useMemo(() => {
    if (!editorValues.unit_id) return ''
    const unit = units.find((item) => item.id === Number(editorValues.unit_id))
    return unit ? `${unit.name} (${unit.symbol})` : ''
  }, [units, editorValues.unit_id])

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

  const validateUtilityItem = (item) => {
    if (!item.utility_id) {
      return 'Please select a utility.'
    }
    if (!item.quantity || Number(item.quantity) <= 0) {
      return 'Quantity must be greater than zero.'
    }
    return ''
  }

  const validateLaborItem = (item) => {
    if (!item.role?.trim()) {
      return 'Please enter a labor role.'
    }
    if (!item.workers || Number(item.workers) <= 0) {
      return 'Number of workers must be greater than zero.'
    }
    if (!item.hours || Number(item.hours) <= 0) {
      return 'Hours worked must be greater than zero.'
    }
    if (!item.hourly_rate || Number(item.hourly_rate) <= 0) {
      return 'Hourly rate must be greater than zero.'
    }
    return ''
  }

  const validateOverheadItem = (item) => {
    if (!item.name?.trim()) {
      return 'Please enter an overhead name.'
    }
    if (!item.category) {
      return 'Please select an overhead category.'
    }
    if (!item.amount || Number(item.amount) <= 0) {
      return 'Allocated amount must be greater than zero.'
    }
    return ''
  }

  const handleEditorChange = (field, value) => {
    if (field === 'material_id') {
      if (!value) {
        setEditorValues((current) => ({
          ...current,
          material_id: '',
        }))
        setFormError('')
        return
      }

      const material = materials.find((item) => item.id === Number(value))
      setEditorValues((current) => ({
        material_id: value,
        unit_id: material?.unit?.id ? String(material.unit.id) : '',
        quantity: current.quantity,
      }))
      setFormError('')
      return
    }

    if (field === 'unit_id') {
      if (isUnitLocked) return

      setEditorValues((current) => ({
        ...current,
        unit_id: value,
        material_id: '',
      }))
      setFormError('')
      return
    }

    setEditorValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleUtilityEditorChange = (field, value) => {
    setUtilityEditorValues((current) => ({
      ...current,
      [field]: value,
    }))
    setUtilityFormError('')
  }

  const handleLaborEditorChange = (field, value) => {
    setLaborEditorValues((current) => ({
      ...current,
      [field]: value,
    }))
    setLaborFormError('')
  }

  const handleOverheadEditorChange = (field, value) => {
    setOverheadEditorValues((current) => ({
      ...current,
      [field]: value,
    }))
    setOverheadFormError('')
  }

  const handleSaveProductionQuantity = async () => {
    if (!selectedProductRecord) return

    const quantity = Number(productionQuantity)
    if (!quantity || quantity <= 0) {
      setProductionQuantityError('Production quantity must be greater than zero.')
      return
    }

    setProductionQuantityError('')

    try {
      const response = await axios.put(`/api/products/${selectedProduct}`, {
        sku: selectedProductRecord.sku,
        name: selectedProductRecord.name,
        description: selectedProductRecord.description,
        default_unit_id: selectedProductRecord.default_unit?.id,
        list_price: selectedProductRecord.list_price,
        production_quantity: quantity,
        is_active: selectedProductRecord.is_active,
      })

      const updatedProduct = response.data.data
      setProducts((current) =>
        current.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
      )
      await fetchCosting(selectedProduct)
      if (pricing !== null) {
        await fetchPricing(selectedProduct, Number(profitMargin))
      }
    } catch (error) {
      setProductionQuantityError(error.response?.data?.message || 'Unable to update production quantity.')
    }
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
      await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to save BOM item.')
    }
  }

  const handleUtilityAddOrUpdate = async () => {
    const error = validateUtilityItem(utilityEditorValues)
    if (error) {
      setUtilityFormError(error)
      return
    }

    setUtilityFormError('')

    const payload = {
      product_id: Number(selectedProduct),
      utility_id: Number(utilityEditorValues.utility_id),
      quantity: Number(utilityEditorValues.quantity),
    }

    try {
      if (utilityEditingId !== null) {
        await axios.put(`/api/product-utilities/${utilityEditingId}`, payload)
      } else {
        await axios.post('/api/product-utilities', payload)
      }

      setUtilityEditorValues(initialUtilityItem)
      setUtilityEditingId(null)
      await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
    } catch (error) {
      setUtilityFormError(error.response?.data?.message || 'Unable to save utility usage.')
    }
  }

  const handleLaborAddOrUpdate = async () => {
    const error = validateLaborItem(laborEditorValues)
    if (error) {
      setLaborFormError(error)
      return
    }

    setLaborFormError('')

    const payload = {
      product_id: Number(selectedProduct),
      role: laborEditorValues.role.trim(),
      workers: Number(laborEditorValues.workers),
      hours: Number(laborEditorValues.hours),
      hourly_rate: Number(laborEditorValues.hourly_rate),
    }

    try {
      if (laborEditingId !== null) {
        await axios.put(`/api/product-labor/${laborEditingId}`, payload)
      } else {
        await axios.post('/api/product-labor', payload)
      }

      setLaborEditorValues(initialLaborItem)
      setLaborEditingId(null)
      await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
    } catch (error) {
      setLaborFormError(error.response?.data?.message || 'Unable to save labor entry.')
    }
  }

  const handleOverheadAddOrUpdate = async () => {
    const error = validateOverheadItem(overheadEditorValues)
    if (error) {
      setOverheadFormError(error)
      return
    }

    setOverheadFormError('')

    const payload = {
      product_id: Number(selectedProduct),
      name: overheadEditorValues.name.trim(),
      category: overheadEditorValues.category,
      amount: Number(overheadEditorValues.amount),
    }

    try {
      if (overheadEditingId !== null) {
        await axios.put(`/api/product-overhead/${overheadEditingId}`, payload)
      } else {
        await axios.post('/api/product-overhead', payload)
      }

      setOverheadEditorValues(initialOverheadItem)
      setOverheadEditingId(null)
      await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
    } catch (error) {
      setOverheadFormError(error.response?.data?.message || 'Unable to save overhead entry.')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditorValues({
      material_id: String(item.material_id),
      unit_id: String(item.unit_id),
      quantity: item.quantity,
    })
    setFormError('')
  }

  const handleUtilityEdit = (item) => {
    setUtilityEditingId(item.id)
    setUtilityEditorValues({
      utility_id: String(item.utility_id),
      quantity: item.quantity,
    })
    setUtilityFormError('')
  }

  const handleLaborEdit = (item) => {
    setLaborEditingId(item.id)
    setLaborEditorValues({
      role: item.role,
      workers: item.workers,
      hours: item.hours,
      hourly_rate: item.hourly_rate,
    })
    setLaborFormError('')
  }

  const handleOverheadEdit = (item) => {
    setOverheadEditingId(item.id)
    setOverheadEditorValues({
      name: item.name,
      category: item.category,
      amount: item.amount,
    })
    setOverheadFormError('')
  }

  const getPricingRefreshOptions = () => ({
    recalculatePricing: pricing !== null,
    profitMargin: Number(profitMargin),
  })

  const handleCalculatePricing = async () => {
    if (!selectedProduct) return

    const margin = Number(profitMargin)
    if (!margin || margin <= 0 || margin >= 100) {
      setPricing(null)
      setPricingError('Enter a profit margin between 0.01% and 99.99%.')
      return
    }

    try {
      await fetchPricing(selectedProduct, margin)
    } catch (error) {
      setPricing(null)
      setPricingError(
        error.response?.data?.errors?.profit_margin?.[0]
          || error.response?.data?.message
          || 'Unable to calculate pricing.',
      )
    }
  }

  const handleRemove = async (item) => {
    await axios.delete(`/api/product-materials/${item.id}`)
    await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
  }

  const handleUtilityRemove = async (item) => {
    await axios.delete(`/api/product-utilities/${item.id}`)
    await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
  }

  const handleLaborRemove = async (item) => {
    await axios.delete(`/api/product-labor/${item.id}`)
    await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
  }

  const handleOverheadRemove = async (item) => {
    await axios.delete(`/api/product-overhead/${item.id}`)
    await refreshManufacturingData(selectedProduct, getPricingRefreshOptions())
  }

  const renderCostingLineTable = (title, section) => (
    <div>
      <h3 className="costing-section__title">{title}</h3>
      <div className="table-wrapper">
        <table className="table">
          <thead className="table__head">
            <tr>
              <th>Name</th>
              <th className="table__col-num">Quantity</th>
              <th>Unit</th>
              <th className="table__col-num">Unit cost</th>
              <th className="table__col-num">Total cost</th>
            </tr>
          </thead>
          <tbody className="table__body">
            {section?.items?.length ? (
              section.items.map((item) => (
                <tr key={`${item.type}-${item.reference_id}`} className="table__row">
                  <td>{item.name}</td>
                  <td className="table__col-num table__cell-mono">{formatQuantity(item.quantity)}</td>
                  <td>{item.unit_symbol || '—'}</td>
                  <td className="table__col-num table__cell-mono">{formatPeso(item.unit_cost, 4)}</td>
                  <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table__cell-muted">
                  No {title.toLowerCase()} configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderLaborCostingTable = (section) => (
    <div>
      <h3 className="costing-section__title">Labor costs</h3>
      <div className="table-wrapper">
        <table className="table">
          <thead className="table__head">
            <tr>
              <th>Role</th>
              <th className="table__col-num">Workers</th>
              <th className="table__col-num">Hours</th>
              <th className="table__col-num">Hourly rate</th>
              <th className="table__col-num">Total cost</th>
            </tr>
          </thead>
          <tbody className="table__body">
            {section?.items?.length ? (
              section.items.map((item) => (
                <tr key={`${item.type}-${item.reference_id}`} className="table__row">
                  <td>{item.name}</td>
                  <td className="table__col-num table__cell-mono">{formatQuantity(item.workers, 0)}</td>
                  <td className="table__col-num table__cell-mono">{formatQuantity(item.hours)}</td>
                  <td className="table__col-num table__cell-mono">{formatPeso(item.hourly_rate, 4)}</td>
                  <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table__cell-muted">
                  No labor costs configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderOverheadCostingTable = (section) => (
    <div>
      <h3 className="costing-section__title">Manufacturing overhead</h3>
      <div className="table-wrapper">
        <table className="table">
          <thead className="table__head">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Allocation</th>
              <th className="table__col-num">Amount</th>
            </tr>
          </thead>
          <tbody className="table__body">
            {section?.items?.length ? (
              section.items.map((item) => (
                <tr key={`${item.type}-${item.reference_id}`} className="table__row">
                  <td>{item.name}</td>
                  <td>{formatOverheadCategory(item.category)}</td>
                  <td>Per batch</td>
                  <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="table__cell-muted">
                  No manufacturing overhead configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Manufacturing Configuration"
        description="Configure materials and utility usage for each product. All manufacturing costs and COGS per unit are calculated by the backend costing engine."
      />

      <ManufacturingNav />

      <Card>
        <PanelHeader title="Product selection" />
        <p className="page-header__description" style={{ margin: '0 0 16px' }}>
          Choose the product you want to configure.
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
              Select a unit to filter materials, or pick a material to auto-assign its unit.
            </p>

            <div className="bom-editor">
              <div className="form-grid form-grid--bom">
                <div className="form-field">
                  <label htmlFor="bom-material">Material</label>
                  <select
                    id="bom-material"
                    value={editorValues.material_id}
                    onChange={(event) => handleEditorChange('material_id', event.target.value)}
                  >
                    <option value="">Select material</option>
                    {editorMaterialOptions.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="bom-unit">Unit</label>
                  <select
                    id="bom-unit"
                    value={editorValues.unit_id}
                    onChange={(event) => handleEditorChange('unit_id', event.target.value)}
                    disabled={isUnitLocked}
                    title={isUnitLocked ? 'Unit is set automatically from the selected material' : undefined}
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
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
              </div>

              {isUnitLocked && selectedUnitLabel && (
                <p className="bom-editor__unit-hint">Unit locked to material: {selectedUnitLabel}</p>
              )}

              {formError && <p className="form-error">{formError}</p>}

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
            </div>
          </Card>

          <Card>
            <PanelHeader
              title="BOM items"
              action={
                costing && (
                  <div className="bom-summary">
                    <strong>Total material cost:</strong>
                    <span className="bom-summary__value">{formatPeso(costing.total_material_cost)}</span>
                  </div>
                )
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
                    <th className="table__col-num">Quantity</th>
                    <th>Unit</th>
                    <th className="table__col-num">Cost per unit</th>
                    <th className="table__col-num">Total cost</th>
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
                        <td className="table__col-num table__cell-mono">{formatQuantity(item.quantity)}</td>
                        <td>{item.unit?.symbol || '—'}</td>
                        <td className="table__col-num table__cell-mono">
                          {formatPeso(item.cost_per_unit, 4)}
                        </td>
                        <td className="table__col-num table__cell-mono">
                          {formatPeso(item.total_cost, 4)}
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className="table-action table-action--edit"
                              aria-label="Edit"
                              title="Edit"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              className="table-action table-action--delete"
                              aria-label="Remove"
                              title="Remove"
                              onClick={() => handleRemove(item)}
                            >
                              <Trash2 size={16} strokeWidth={2.25} />
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

          <Card>
            <PanelHeader title={`Utility usage for ${selectedProductName}`} />
            <p className="page-header__description" style={{ margin: '0 0 20px' }}>
              Assign manufacturing utilities such as electricity, water, LPG, or fuel. Unit and rate come from the utility master record.
            </p>

            <div className="bom-editor">
              <div className="form-grid form-grid--utility">
                <div className="form-field">
                  <label htmlFor="utility-select">Utility</label>
                  <select
                    id="utility-select"
                    value={utilityEditorValues.utility_id}
                    onChange={(event) => handleUtilityEditorChange('utility_id', event.target.value)}
                  >
                    <option value="">Select utility</option>
                    {editorUtilityOptions.map((utility) => (
                      <option key={utility.id} value={utility.id}>
                        {utility.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Unit</label>
                  <div className="form-field__readonly">
                    {selectedUtility?.unit?.symbol || '—'}
                  </div>
                </div>

                <div className="form-field">
                  <label>Rate</label>
                  <div className="form-field__readonly">
                    {selectedUtility ? formatPeso(selectedUtility.rate, 4) : '—'}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="utility-quantity">Quantity consumed</label>
                  <input
                    id="utility-quantity"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={utilityEditorValues.quantity}
                    onChange={(event) => handleUtilityEditorChange('quantity', event.target.value)}
                  />
                </div>
              </div>

              {utilityFormError && <p className="form-error">{utilityFormError}</p>}

              <div className="bom-actions">
                {utilityEditingId !== null && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setUtilityEditingId(null)
                      setUtilityEditorValues(initialUtilityItem)
                      setUtilityFormError('')
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button variant="primary" onClick={handleUtilityAddOrUpdate}>
                  {utilityEditingId !== null ? 'Update utility usage' : 'Add utility usage'}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <PanelHeader
              title="Utility usage"
              action={
                costing && (
                  <div className="bom-summary">
                    <strong>Total utility cost:</strong>
                    <span className="bom-summary__value">{formatPeso(costing.total_utility_cost)}</span>
                  </div>
                )
              }
            />
            <p className="page-header__description" style={{ margin: '0 0 16px' }}>
              Review utility consumption and costs for this product.
            </p>

            <div className="table-wrapper">
              <table className="table">
                <thead className="table__head">
                  <tr>
                    <th>#</th>
                    <th>Utility</th>
                    <th className="table__col-num">Quantity</th>
                    <th>Unit</th>
                    <th className="table__col-num">Rate</th>
                    <th className="table__col-num">Total cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table__body">
                  {utilityItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={Zap}
                          title="No utility usage added yet"
                          description="Add electricity, water, LPG, or other utilities above."
                        />
                      </td>
                    </tr>
                  ) : (
                    utilityItems.map((item, index) => (
                      <tr key={item.id} className="table__row">
                        <td className="table__cell-muted">{index + 1}</td>
                        <td>{item.utility?.name || 'Unknown'}</td>
                        <td className="table__col-num table__cell-mono">{formatQuantity(item.quantity)}</td>
                        <td>{item.unit?.symbol || item.utility?.unit?.symbol || '—'}</td>
                        <td className="table__col-num table__cell-mono">{formatPeso(item.rate, 4)}</td>
                        <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className="table-action table-action--edit"
                              aria-label="Edit"
                              title="Edit"
                              onClick={() => handleUtilityEdit(item)}
                            >
                              <Pencil size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              className="table-action table-action--delete"
                              aria-label="Remove"
                              title="Remove"
                              onClick={() => handleUtilityRemove(item)}
                            >
                              <Trash2 size={16} strokeWidth={2.25} />
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

          <Card>
            <PanelHeader title={`Direct labor for ${selectedProductName}`} />
            <p className="page-header__description" style={{ margin: '0 0 20px' }}>
              Define labor roles, worker count, hours worked, and hourly rates for this product batch.
            </p>

            <div className="bom-editor">
              <div className="form-grid form-grid--labor">
                <div className="form-field">
                  <label htmlFor="labor-role">Labor role</label>
                  <input
                    id="labor-role"
                    type="text"
                    value={laborEditorValues.role}
                    onChange={(event) => handleLaborEditorChange('role', event.target.value)}
                    placeholder="e.g. Baker"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="labor-workers">Workers</label>
                  <input
                    id="labor-workers"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={laborEditorValues.workers}
                    onChange={(event) => handleLaborEditorChange('workers', event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="labor-hours">Hours worked</label>
                  <input
                    id="labor-hours"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={laborEditorValues.hours}
                    onChange={(event) => handleLaborEditorChange('hours', event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="labor-rate">Hourly rate</label>
                  <input
                    id="labor-rate"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={laborEditorValues.hourly_rate}
                    onChange={(event) => handleLaborEditorChange('hourly_rate', event.target.value)}
                  />
                </div>
              </div>

              {laborFormError && <p className="form-error">{laborFormError}</p>}

              <div className="bom-actions">
                {laborEditingId !== null && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setLaborEditingId(null)
                      setLaborEditorValues(initialLaborItem)
                      setLaborFormError('')
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button variant="primary" onClick={handleLaborAddOrUpdate}>
                  {laborEditingId !== null ? 'Update labor entry' : 'Add labor entry'}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <PanelHeader
              title="Direct labor"
              action={
                costing && (
                  <div className="bom-summary">
                    <strong>Total labor cost:</strong>
                    <span className="bom-summary__value">{formatPeso(costing.total_labor_cost)}</span>
                  </div>
                )
              }
            />
            <p className="page-header__description" style={{ margin: '0 0 16px' }}>
              Review direct labor assignments and costs for this product.
            </p>

            <div className="table-wrapper">
              <table className="table">
                <thead className="table__head">
                  <tr>
                    <th>#</th>
                    <th>Role</th>
                    <th>Workers</th>
                    <th>Hours</th>
                    <th>Hourly rate</th>
                    <th>Total cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table__body">
                  {laborItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={Users}
                          title="No labor entries added yet"
                          description="Add direct labor roles such as baker, mixer, or assistant."
                        />
                      </td>
                    </tr>
                  ) : (
                    laborItems.map((item, index) => (
                      <tr key={item.id} className="table__row">
                        <td className="table__cell-muted">{index + 1}</td>
                        <td>{item.role}</td>
                        <td className="table__cell-mono">{item.workers}</td>
                        <td className="table__cell-mono">{item.hours}</td>
                        <td className="table__cell-mono">{formatPeso(item.hourly_rate, 4)}</td>
                        <td className="table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className="table-action table-action--edit"
                              aria-label="Edit"
                              title="Edit"
                              onClick={() => handleLaborEdit(item)}
                            >
                              <Pencil size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              className="table-action table-action--delete"
                              aria-label="Remove"
                              title="Remove"
                              onClick={() => handleLaborRemove(item)}
                            >
                              <Trash2 size={16} strokeWidth={2.25} />
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

          <Card>
            <PanelHeader title={`Manufacturing overhead for ${selectedProductName}`} />
            <p className="page-header__description" style={{ margin: '0 0 20px' }}>
              Allocate batch overhead such as depreciation, rent, maintenance, or machine usage to this product.
            </p>

            <div className="bom-editor">
              <div className="form-grid form-grid--overhead">
                <div className="form-field">
                  <label htmlFor="overhead-name">Overhead name</label>
                  <input
                    id="overhead-name"
                    type="text"
                    value={overheadEditorValues.name}
                    onChange={(event) => handleOverheadEditorChange('name', event.target.value)}
                    placeholder="e.g. Oven Depreciation"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="overhead-category">Category</label>
                  <select
                    id="overhead-category"
                    value={overheadEditorValues.category}
                    onChange={(event) => handleOverheadEditorChange('category', event.target.value)}
                  >
                    {OVERHEAD_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="overhead-amount">Allocated amount (per batch)</label>
                  <input
                    id="overhead-amount"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={overheadEditorValues.amount}
                    onChange={(event) => handleOverheadEditorChange('amount', event.target.value)}
                  />
                </div>
              </div>

              {overheadFormError && <p className="form-error">{overheadFormError}</p>}

              <div className="bom-actions">
                {overheadEditingId !== null && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setOverheadEditingId(null)
                      setOverheadEditorValues(initialOverheadItem)
                      setOverheadFormError('')
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button variant="primary" onClick={handleOverheadAddOrUpdate}>
                  {overheadEditingId !== null ? 'Update overhead entry' : 'Add overhead entry'}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <PanelHeader
              title="Manufacturing overhead"
              action={
                costing && (
                  <div className="bom-summary">
                    <strong>Total overhead cost:</strong>
                    <span className="bom-summary__value">{formatPeso(costing.total_overhead_cost)}</span>
                  </div>
                )
              }
            />
            <p className="page-header__description" style={{ margin: '0 0 16px' }}>
              Review overhead allocations assigned to this production batch.
            </p>

            <div className="table-wrapper">
              <table className="table">
                <thead className="table__head">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Allocation</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table__body">
                  {overheadItems.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={Building2}
                          title="No overhead entries added yet"
                          description="Add depreciation, rent, maintenance, or other batch overhead above."
                        />
                      </td>
                    </tr>
                  ) : (
                    overheadItems.map((item, index) => (
                      <tr key={item.id} className="table__row">
                        <td className="table__cell-muted">{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{formatOverheadCategory(item.category)}</td>
                        <td>Per batch</td>
                        <td className="table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className="table-action table-action--edit"
                              aria-label="Edit"
                              title="Edit"
                              onClick={() => handleOverheadEdit(item)}
                            >
                              <Pencil size={16} strokeWidth={2.25} />
                            </button>
                            <button
                              type="button"
                              className="table-action table-action--delete"
                              aria-label="Remove"
                              title="Remove"
                              onClick={() => handleOverheadRemove(item)}
                            >
                              <Trash2 size={16} strokeWidth={2.25} />
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

          <Card>
            <PanelHeader
              title={`Product costing for ${selectedProductName}`}
              action={
                costing && (
                  <div className="bom-summary">
                    <strong>COGS per unit:</strong>
                    <span className="bom-summary__value">{formatPeso(costing.cogs_per_unit, 4)}</span>
                  </div>
                )
              }
            />
            <p className="page-header__description" style={{ margin: '0 0 20px' }}>
              Authoritative manufacturing cost breakdown calculated by the backend costing engine.
            </p>

            <div className="production-quantity-row">
              <div className="form-field">
                <label htmlFor="production-quantity">Production quantity</label>
                <input
                  id="production-quantity"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={productionQuantity}
                  onChange={(event) => {
                    setProductionQuantity(event.target.value)
                    setProductionQuantityError('')
                  }}
                />
              </div>
              <Button variant="secondary" onClick={handleSaveProductionQuantity}>
                Update quantity
              </Button>
            </div>
            {productionQuantityError && <p className="form-error">{productionQuantityError}</p>}

            {costing ? (
              <div className="costing-grid">
                {renderCostingLineTable('Material costs', costing.material_costs)}
                {renderCostingLineTable('Utility costs', costing.utility_costs)}
                {renderLaborCostingTable(costing.labor_costs)}
                {renderOverheadCostingTable(costing.overhead_costs)}

                <div className="costing-summary">
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total material cost</span>
                    <span className="costing-summary__value">{formatPeso(costing.total_material_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total utility cost</span>
                    <span className="costing-summary__value">{formatPeso(costing.total_utility_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total labor cost</span>
                    <span className="costing-summary__value">{formatPeso(costing.total_labor_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total manufacturing overhead</span>
                    <span className="costing-summary__value">{formatPeso(costing.total_overhead_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row costing-summary__row--divider">
                    <span className="costing-summary__label">Total manufacturing cost</span>
                    <span className="costing-summary__value">
                      {formatPeso(costing.total_manufacturing_cost, 4)}
                    </span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Production quantity</span>
                    <span className="costing-summary__value">{formatQuantity(costing.production_quantity)}</span>
                  </div>
                  <div className="costing-summary__row costing-summary__row--highlight">
                    <span className="costing-summary__label">COGS per unit</span>
                    <span className="costing-summary__value costing-summary__value--primary">
                      {formatPeso(costing.cogs_per_unit, 4)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Calculator}
                title="Costing unavailable"
                description="Configure materials and utilities to generate the product cost breakdown."
              />
            )}
          </Card>

          <Card>
            <PanelHeader
              title={`Pricing for ${selectedProductName}`}
              action={
                pricing && (
                  <div className="bom-summary">
                    <strong>Recommended price:</strong>
                    <span className="bom-summary__value">{formatPeso(pricing.recommended_selling_price, 4)}</span>
                  </div>
                )
              }
            />
            <p className="page-header__description" style={{ margin: '0 0 20px' }}>
              Set a target profit margin to calculate the recommended selling price from backend COGS.
            </p>

            <div className="production-quantity-row">
              <div className="form-field">
                <label htmlFor="profit-margin">Target profit margin (%)</label>
                <input
                  id="profit-margin"
                  type="number"
                  min="0.01"
                  max="99.99"
                  step="0.01"
                  value={profitMargin}
                  onChange={(event) => {
                    setProfitMargin(event.target.value)
                    setPricingError('')
                  }}
                />
              </div>
              <Button variant="primary" onClick={handleCalculatePricing}>
                Calculate pricing
              </Button>
            </div>
            {pricingError && <p className="form-error">{pricingError}</p>}

            {pricing ? (
              <div className="costing-summary">
                <div className="costing-summary__row">
                  <span className="costing-summary__label">COGS per unit</span>
                  <span className="costing-summary__value">{formatPeso(pricing.cogs_per_unit, 4)}</span>
                </div>
                <div className="costing-summary__row">
                  <span className="costing-summary__label">Target profit margin</span>
                  <span className="costing-summary__value">{pricing.target_profit_margin_percent}%</span>
                </div>
                <div className="costing-summary__row costing-summary__row--divider">
                  <span className="costing-summary__label">Recommended selling price</span>
                  <span className="costing-summary__value costing-summary__value--primary">
                    {formatPeso(pricing.recommended_selling_price, 4)}
                  </span>
                </div>
                <div className="costing-summary__row">
                  <span className="costing-summary__label">Expected profit per unit</span>
                  <span className="costing-summary__value">{formatPeso(pricing.expected_profit_per_unit, 4)}</span>
                </div>
                <div className="costing-summary__row costing-summary__row--highlight">
                  <span className="costing-summary__label">Expected profit percentage</span>
                  <span className="costing-summary__value costing-summary__value--primary">
                    {pricing.expected_profit_percentage}%
                  </span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Pricing not calculated yet"
                description="Enter a target profit margin and calculate the recommended selling price."
              />
            )}
          </Card>
        </>
      )}
    </div>
  )
}

export default BillOfMaterialsPage
