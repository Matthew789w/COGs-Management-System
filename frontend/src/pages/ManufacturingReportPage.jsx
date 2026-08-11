import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FileText, Printer } from 'lucide-react'
import ManufacturingNav from '../components/manufacturing/ManufacturingNav'
import ReportsNav from '../components/reports/ReportsNav'
import Button from '../components/ui/Button'
import CollapsibleSection from '../components/ui/CollapsibleSection'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import SelectField from '../components/ui/SelectField'
import TableLoadingState from '../components/ui/TableLoadingState'
import { formatPeso } from '../utils/currency'
import { formatOverheadCategory } from '../utils/manufacturing'
import { formatQuantity } from '../utils/quantity'

function ReportSection({ title, children, defaultOpen = true }) {
  return (
    <CollapsibleSection title={title} variant="plain" defaultOpen={defaultOpen}>
      {children}
    </CollapsibleSection>
  )
}

function ReportKpi({ label, value, highlight = false }) {
  return (
    <div className={`report-kpi${highlight ? ' report-kpi--highlight' : ''}`}>
      <span className="report-kpi__label">{label}</span>
      <strong className="report-kpi__value">{value}</strong>
    </div>
  )
}

function ManufacturingReportPage() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [profitMargin, setProfitMargin] = useState('30')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)
  const [summaryRows, setSummaryRows] = useState([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)

  const selectedProductRecord = useMemo(
    () => products.find((product) => product.id === Number(selectedProduct)) || null,
    [products, selectedProduct],
  )

  useEffect(() => {
    axios
      .get('/api/products')
      .then((response) => {
        setProducts(response.data.data || [])
      })
      .finally(() => setLoadingProducts(false))
  }, [])

  const loadProductSummary = useCallback(async (productList) => {
    setSummaryLoading(true)

    const rows = await Promise.all(
      productList.map(async (product) => {
        try {
          const response = await axios.get(`/api/products/${product.id}/costing`)
          const costing = response.data.data

          return {
            id: product.id,
            name: product.name,
            productionQuantity: costing.production_quantity,
            totalManufacturingCost: costing.total_manufacturing_cost,
            cogsPerUnit: costing.cogs_per_unit,
            configured: true,
          }
        } catch {
          return {
            id: product.id,
            name: product.name,
            productionQuantity: product.production_quantity,
            totalManufacturingCost: null,
            cogsPerUnit: null,
            configured: false,
          }
        }
      }),
    )

    setSummaryRows(rows)
    setSummaryLoading(false)
  }, [])

  useEffect(() => {
    if (products.length) {
      loadProductSummary(products)
    } else {
      setSummaryRows([])
      setSummaryLoading(false)
    }
  }, [products, loadProductSummary])

  const loadReport = useCallback(async (productId, margin) => {
    if (!productId) {
      setReport(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      const [materialsResponse, utilitiesResponse, laborResponse, overheadResponse, costingResponse] =
        await Promise.all([
          axios.get('/api/product-materials', { params: { product_id: productId } }),
          axios.get('/api/product-utilities', { params: { product_id: productId } }),
          axios.get('/api/product-labor', { params: { product_id: productId } }),
          axios.get('/api/product-overhead', { params: { product_id: productId } }),
          axios.get(`/api/products/${productId}/costing`),
        ])

      let pricing = null
      const numericMargin = Number(margin)

      if (numericMargin > 0 && numericMargin < 100) {
        try {
          const pricingResponse = await axios.get(`/api/products/${productId}/pricing`, {
            params: { profit_margin: numericMargin },
          })
          pricing = pricingResponse.data.data
        } catch {
          pricing = null
        }
      }

      setReport({
        bomItems: materialsResponse.data.data || [],
        utilityItems: utilitiesResponse.data.data || [],
        laborItems: laborResponse.data.data || [],
        overheadItems: overheadResponse.data.data || [],
        costing: costingResponse.data.data || null,
        pricing,
      })
    } catch (loadError) {
      setReport(null)
      setError(loadError.response?.data?.message || 'Unable to load manufacturing report.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport(selectedProduct, profitMargin)
  }, [selectedProduct, profitMargin, loadReport])

  const handlePrint = () => {
    window.print()
  }

  const generatedAt = useMemo(
    () =>
      new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  )

  return (
    <div className="manufacturing-report">
      <PageHeader
        title="Manufacturing Reports"
        description="Consolidated bill of materials, utilities, labor, overhead, costing, and pricing for each product."
        action={
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={16} />
            Print report
          </Button>
        }
      />

      <ManufacturingNav />

      <div className="reports-layout">
        <ReportsNav />

        <div className="reports-layout__content">
      <CollapsibleSection
        title="Product selection"
        description="Choose a product and profit margin for the detailed report."
        defaultOpen
        className="no-print"
      >
        <div className="form-grid form-grid--2">
          <SelectField
            id="report-product"
            label="Product"
            value={selectedProduct}
            onChange={(event) => setSelectedProduct(event.target.value)}
            loading={loadingProducts}
            loadingMessage="Loading products…"
            placeholder="Select a product for detailed report"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </SelectField>
          <div className="form-field">
            <label htmlFor="report-margin">Target profit margin (%)</label>
            <input
              id="report-margin"
              type="number"
              min="0.01"
              max="99.99"
              step="0.01"
              value={profitMargin}
              onChange={(event) => setProfitMargin(event.target.value)}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="All products — manufacturing summary"
        description="COGS overview across all products using each product's configured recipe batch size."
        defaultOpen
      >
        {summaryLoading ? (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Product</th>
                  <th className="table__col-num">Recipe batch</th>
                  <th className="table__col-num">Total mfg. cost</th>
                  <th className="table__col-num">COGS / unit</th>
                  <th className="table__col-status">Status</th>
                </tr>
              </thead>
              <tbody className="table__body">
                <TableLoadingState colSpan={5} message="Loading summary…" />
              </tbody>
            </table>
          </div>
        ) : summaryRows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No products found"
            description="Create products and configure manufacturing data to generate reports."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table__head">
                <tr>
                  <th>Product</th>
                  <th className="table__col-num">Recipe batch</th>
                  <th className="table__col-num">Total mfg. cost</th>
                  <th className="table__col-num">COGS / unit</th>
                  <th className="table__col-status">Status</th>
                </tr>
              </thead>
              <tbody className="table__body">
                {summaryRows.map((row) => (
                  <tr key={row.id} className="table__row">
                    <td>{row.name}</td>
                    <td className="table__col-num table__cell-mono">
                      {formatQuantity(row.productionQuantity)}
                    </td>
                    <td className="table__col-num table__cell-mono">
                      {row.configured ? formatPeso(row.totalManufacturingCost, 4) : '—'}
                    </td>
                    <td className="table__col-num table__cell-mono">
                      {row.configured ? formatPeso(row.cogsPerUnit, 4) : '—'}
                    </td>
                    <td className="table__col-status">
                      <span className={`report-status report-status--${row.configured ? 'ready' : 'pending'}`}>
                        {row.configured ? 'Configured' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleSection>

      {selectedProduct && (
        <CollapsibleSection
          title={`Detailed report — ${selectedProductRecord?.name}`}
          description={generatedAt ? `Generated ${generatedAt}` : 'Product manufacturing breakdown'}
          defaultOpen
          className="report-document"
          action={
            report?.costing ? (
              <div className="report-document__badge">
                COGS / unit: {formatPeso(report.costing.cogs_per_unit, 4)}
              </div>
            ) : null
          }
        >
          {loading ? (
            <div className="table-wrapper">
              <table className="table">
                <thead className="table__head">
                  <tr>
                    <th>Section</th>
                    <th>Item</th>
                    <th className="table__col-num">Quantity</th>
                    <th className="table__col-num">Unit cost</th>
                    <th className="table__col-num">Total</th>
                  </tr>
                </thead>
                <tbody className="table__body">
                  <TableLoadingState colSpan={5} message="Loading report…" rows={6} />
                </tbody>
              </table>
            </div>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : !report ? (
            <EmptyState
              icon={FileText}
              title="Report unavailable"
              description="Select a product with manufacturing configuration to view the detailed report."
            />
          ) : (
            <>
              <div className="report-kpi-grid">
                <ReportKpi
                  label="Recipe batch size"
                  value={formatQuantity(report.costing?.production_quantity || selectedProductRecord?.production_quantity)}
                />
                <ReportKpi
                  label="Total manufacturing cost"
                  value={formatPeso(report.costing?.total_manufacturing_cost, 4)}
                />
                <ReportKpi
                  label="COGS per unit"
                  value={formatPeso(report.costing?.cogs_per_unit, 4)}
                  highlight
                />
                <ReportKpi
                  label="Recommended selling price"
                  value={
                    report.pricing
                      ? formatPeso(report.pricing.recommended_selling_price, 4)
                      : '—'
                  }
                  highlight
                />
              </div>

              <ReportSection title="1. Bill of materials">
                {report.bomItems.length === 0 ? (
                  <p className="report-section__empty">No BOM items configured.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead className="table__head">
                        <tr>
                          <th>#</th>
                          <th>Material</th>
                          <th className="table__col-num">Quantity</th>
                          <th>Unit</th>
                          <th className="table__col-num">Cost / unit</th>
                          <th className="table__col-num">Total cost</th>
                        </tr>
                      </thead>
                      <tbody className="table__body">
                        {report.bomItems.map((item, index) => (
                          <tr key={item.id} className="table__row">
                            <td className="table__cell-muted">{index + 1}</td>
                            <td>{item.material?.name || 'Unknown'}</td>
                            <td className="table__col-num table__cell-mono">{formatQuantity(item.quantity)}</td>
                            <td>{item.unit?.symbol || '—'}</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.cost_per_unit, 4)}</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                          </tr>
                        ))}
                        <tr className="table__row report-table__total-row">
                          <td colSpan={5}>Total material cost</td>
                          <td className="table__col-num table__cell-mono">
                            {formatPeso(report.costing?.total_material_cost, 4)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </ReportSection>

              <ReportSection title="2. Utility usage">
                {report.utilityItems.length === 0 ? (
                  <p className="report-section__empty">No utility usage configured.</p>
                ) : (
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
                        </tr>
                      </thead>
                      <tbody className="table__body">
                        {report.utilityItems.map((item, index) => (
                          <tr key={item.id} className="table__row">
                            <td className="table__cell-muted">{index + 1}</td>
                            <td>{item.utility?.name || 'Unknown'}</td>
                            <td className="table__col-num table__cell-mono">{formatQuantity(item.quantity)}</td>
                            <td>{item.unit?.symbol || item.utility?.unit?.symbol || '—'}</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.rate, 4)}</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                          </tr>
                        ))}
                        <tr className="table__row report-table__total-row">
                          <td colSpan={5}>Total utility cost</td>
                          <td className="table__col-num table__cell-mono">
                            {formatPeso(report.costing?.total_utility_cost, 4)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </ReportSection>

              <ReportSection title="3. Direct labor">
                {report.laborItems.length === 0 ? (
                  <p className="report-section__empty">No direct labor configured.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead className="table__head">
                        <tr>
                          <th>#</th>
                          <th>Role</th>
                          <th className="table__col-num">Workers</th>
                          <th className="table__col-num">Hours</th>
                          <th className="table__col-num">Hourly rate</th>
                          <th className="table__col-num">Total cost</th>
                        </tr>
                      </thead>
                      <tbody className="table__body">
                        {report.laborItems.map((item, index) => (
                          <tr key={item.id} className="table__row">
                            <td className="table__cell-muted">{index + 1}</td>
                            <td>{item.role}</td>
                            <td className="table__col-num table__cell-mono">{formatQuantity(item.workers, 0)}</td>
                            <td className="table__col-num table__cell-mono">{formatQuantity(item.hours)}</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.hourly_rate, 4)}</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                          </tr>
                        ))}
                        <tr className="table__row report-table__total-row">
                          <td colSpan={5}>Total labor cost</td>
                          <td className="table__col-num table__cell-mono">
                            {formatPeso(report.costing?.total_labor_cost, 4)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </ReportSection>

              <ReportSection title="4. Manufacturing overhead">
                {report.overheadItems.length === 0 ? (
                  <p className="report-section__empty">No manufacturing overhead configured.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead className="table__head">
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Allocation</th>
                          <th className="table__col-num">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="table__body">
                        {report.overheadItems.map((item, index) => (
                          <tr key={item.id} className="table__row">
                            <td className="table__cell-muted">{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{formatOverheadCategory(item.category)}</td>
                            <td>Per batch</td>
                            <td className="table__col-num table__cell-mono">{formatPeso(item.total_cost, 4)}</td>
                          </tr>
                        ))}
                        <tr className="table__row report-table__total-row">
                          <td colSpan={4}>Total overhead cost</td>
                          <td className="table__col-num table__cell-mono">
                            {formatPeso(report.costing?.total_overhead_cost, 4)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </ReportSection>

              <ReportSection title="5. Cost breakdown summary">
                <div className="costing-summary report-costing-summary">
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total material cost</span>
                    <span className="costing-summary__value">{formatPeso(report.costing?.total_material_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total utility cost</span>
                    <span className="costing-summary__value">{formatPeso(report.costing?.total_utility_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total direct manufacturing cost</span>
                    <span className="costing-summary__value">
                      {formatPeso(report.costing?.total_direct_manufacturing_cost, 4)}
                    </span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total labor cost</span>
                    <span className="costing-summary__value">{formatPeso(report.costing?.total_labor_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Total manufacturing overhead</span>
                    <span className="costing-summary__value">{formatPeso(report.costing?.total_overhead_cost, 4)}</span>
                  </div>
                  <div className="costing-summary__row costing-summary__row--divider">
                    <span className="costing-summary__label">Total manufacturing cost</span>
                    <span className="costing-summary__value">
                      {formatPeso(report.costing?.total_manufacturing_cost, 4)}
                    </span>
                  </div>
                  <div className="costing-summary__row">
                    <span className="costing-summary__label">Production quantity (recipe batch)</span>
                    <span className="costing-summary__value">{formatQuantity(report.costing?.production_quantity)}</span>
                  </div>
                  <div className="costing-summary__row costing-summary__row--highlight">
                    <span className="costing-summary__label">COGS per unit</span>
                    <span className="costing-summary__value costing-summary__value--primary">
                      {formatPeso(report.costing?.cogs_per_unit, 4)}
                    </span>
                  </div>
                </div>
              </ReportSection>

              <ReportSection title="6. Pricing analysis">
                {report.pricing ? (
                  <div className="costing-summary report-costing-summary">
                    <div className="costing-summary__row">
                      <span className="costing-summary__label">COGS per unit</span>
                      <span className="costing-summary__value">{formatPeso(report.pricing.cogs_per_unit, 4)}</span>
                    </div>
                    <div className="costing-summary__row">
                      <span className="costing-summary__label">Target profit margin</span>
                      <span className="costing-summary__value">{report.pricing.target_profit_margin_percent}%</span>
                    </div>
                    <div className="costing-summary__row costing-summary__row--divider">
                      <span className="costing-summary__label">Recommended selling price</span>
                      <span className="costing-summary__value costing-summary__value--primary">
                        {formatPeso(report.pricing.recommended_selling_price, 4)}
                      </span>
                    </div>
                    <div className="costing-summary__row">
                      <span className="costing-summary__label">Expected profit per unit</span>
                      <span className="costing-summary__value">
                        {formatPeso(report.pricing.expected_profit_per_unit, 4)}
                      </span>
                    </div>
                    <div className="costing-summary__row costing-summary__row--highlight">
                      <span className="costing-summary__label">Expected profit percentage</span>
                      <span className="costing-summary__value costing-summary__value--primary">
                        {report.pricing.expected_profit_percentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="report-section__empty">
                    Enter a valid profit margin between 0.01% and 99.99% to include pricing analysis.
                  </p>
                )}
              </ReportSection>
            </>
          )}
        </CollapsibleSection>
      )}
        </div>
      </div>
    </div>
  )
}

export default ManufacturingReportPage
