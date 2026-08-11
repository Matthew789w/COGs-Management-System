import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import SelectField from '../ui/SelectField'
import Button from '../ui/Button'

const initialFilters = {
  productId: '',
  productionBatchId: '',
  dateFrom: '',
  dateTo: '',
  category: '',
  profitMargin: '30',
}

function ReportFilters({
  definition,
  meta,
  loadingMeta,
  filters,
  onChange,
  onApply,
  applying = false,
}) {
  const [localFilters, setLocalFilters] = useState(initialFilters)

  useEffect(() => {
    if (meta?.default_profit_margin && !filters.profitMargin) {
      setLocalFilters((current) => ({
        ...current,
        profitMargin: String(meta.default_profit_margin),
      }))
    }
  }, [meta, filters.profitMargin])

  useEffect(() => {
    setLocalFilters((current) => ({ ...current, ...filters }))
  }, [filters])

  const batchOptions = useMemo(() => {
    if (!meta?.production_batches) return []

    return meta.production_batches.filter((batch) => {
      if (!localFilters.productId) return true
      return String(batch.product_id) === String(localFilters.productId)
    })
  }, [meta, localFilters.productId])

  const handleChange = (field, value) => {
    setLocalFilters((current) => {
      const next = { ...current, [field]: value }

      if (field === 'productId') {
        next.productionBatchId = ''
      }

      return next
    })
  }

  const handleApply = () => {
    onChange(localFilters)
    onApply(localFilters)
  }

  const handleReset = () => {
    const reset = {
      ...initialFilters,
      profitMargin: String(meta?.default_profit_margin || 30),
    }
    setLocalFilters(reset)
    onChange(reset)
    onApply(reset)
  }

  return (
    <div className="report-filters no-print">
      <div className="report-filters__grid">
        <SelectField
          id="report-filter-product"
          label="Product"
          value={localFilters.productId}
          onChange={(event) => handleChange('productId', event.target.value)}
          loading={loadingMeta}
          loadingMessage="Loading products…"
          placeholder="All products"
        >
          {meta?.products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </SelectField>

        {definition?.batchReport && (
          <SelectField
            id="report-filter-batch"
            label="Production batch"
            value={localFilters.productionBatchId}
            onChange={(event) => handleChange('productionBatchId', event.target.value)}
            loading={loadingMeta}
            loadingMessage="Loading batches…"
            placeholder="All confirmed batches"
            disabled={!batchOptions.length && !loadingMeta}
          >
            {batchOptions.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.batch_number} — {batch.product_name} ({batch.production_date})
              </option>
            ))}
          </SelectField>
        )}

        <div className="form-field">
          <label htmlFor="report-filter-date-from">Date from</label>
          <input
            id="report-filter-date-from"
            type="date"
            value={localFilters.dateFrom}
            onChange={(event) => handleChange('dateFrom', event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="report-filter-date-to">Date to</label>
          <input
            id="report-filter-date-to"
            type="date"
            value={localFilters.dateTo}
            onChange={(event) => handleChange('dateTo', event.target.value)}
          />
        </div>

        {definition?.supportsCategory && (
          <SelectField
            id="report-filter-category"
            label="Overhead category"
            value={localFilters.category}
            onChange={(event) => handleChange('category', event.target.value)}
            loading={loadingMeta}
            placeholder="All categories"
          >
            {meta?.overhead_categories?.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </SelectField>
        )}

        {definition?.supportsProfitMargin && (
          <div className="form-field">
            <label htmlFor="report-filter-margin">Target profit margin (%)</label>
            <input
              id="report-filter-margin"
              type="number"
              min="0.01"
              max="99.99"
              step="0.01"
              value={localFilters.profitMargin}
              onChange={(event) => handleChange('profitMargin', event.target.value)}
            />
          </div>
        )}
      </div>

      <div className="report-filters__actions">
        <Button variant="secondary" onClick={handleReset}>
          Reset filters
        </Button>
        <Button variant="primary" onClick={handleApply} disabled={applying}>
          {applying ? 'Generating…' : 'Generate report'}
        </Button>
      </div>
    </div>
  )
}

export default ReportFilters
