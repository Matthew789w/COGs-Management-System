export const REPORT_SLUGS = {
  PRODUCT_COST_BREAKDOWN: 'product-cost-breakdown',
  COGS_PER_PRODUCT: 'cogs-per-product',
  MATERIAL_COST: 'material-cost',
  UTILITY_COST: 'utility-cost',
  LABOR_COST: 'labor-cost',
  MANUFACTURING_OVERHEAD: 'manufacturing-overhead',
  RECOMMENDED_SELLING_PRICE: 'recommended-selling-price',
  EXPECTED_PROFIT: 'expected-profit',
  PRODUCTION_COST_BY_BATCH: 'production-cost-by-batch',
  COST_VARIANCE: 'cost-variance',
}

export const REPORT_DEFINITIONS = [
  {
    slug: REPORT_SLUGS.PRODUCT_COST_BREAKDOWN,
    title: 'Product Cost Breakdown',
    description: 'Full manufacturing cost composition by product.',
    endpoint: '/api/reports/product-cost-breakdown',
    group: 'Product Costing',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.COGS_PER_PRODUCT,
    title: 'COGS per Product',
    description: 'Standard cost of goods sold for each configured product.',
    endpoint: '/api/reports/cogs-per-product',
    group: 'Product Costing',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.MATERIAL_COST,
    title: 'Material Cost',
    description: 'Bill of materials cost lines across products.',
    endpoint: '/api/reports/material-cost',
    group: 'Cost Components',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.UTILITY_COST,
    title: 'Utility Cost',
    description: 'Manufacturing utility consumption and costs.',
    endpoint: '/api/reports/utility-cost',
    group: 'Cost Components',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.LABOR_COST,
    title: 'Labor Cost',
    description: 'Direct labor assignments and total labor cost.',
    endpoint: '/api/reports/labor-cost',
    group: 'Cost Components',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.MANUFACTURING_OVERHEAD,
    title: 'Manufacturing Overhead',
    description: 'Batch overhead allocations by category.',
    endpoint: '/api/reports/manufacturing-overhead',
    group: 'Cost Components',
    supportsCategory: true,
    supportsProfitMargin: false,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.RECOMMENDED_SELLING_PRICE,
    title: 'Recommended Selling Price',
    description: 'Margin-based selling price recommendations from COGS.',
    endpoint: '/api/reports/recommended-selling-price',
    group: 'Profitability',
    supportsCategory: false,
    supportsProfitMargin: true,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.EXPECTED_PROFIT,
    title: 'Expected Profit',
    description: 'Expected profit per unit and profit percentage.',
    endpoint: '/api/reports/expected-profit',
    group: 'Profitability',
    supportsCategory: false,
    supportsProfitMargin: true,
    batchReport: false,
  },
  {
    slug: REPORT_SLUGS.PRODUCTION_COST_BY_BATCH,
    title: 'Production Cost by Batch',
    description: 'Standard and actual production costs for confirmed batches.',
    endpoint: '/api/reports/production-cost-by-batch',
    group: 'Production Analysis',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: true,
  },
  {
    slug: REPORT_SLUGS.COST_VARIANCE,
    title: 'Cost Variance',
    description: 'Standard vs actual cost variance by production batch.',
    endpoint: '/api/reports/cost-variance',
    group: 'Production Analysis',
    supportsCategory: false,
    supportsProfitMargin: false,
    batchReport: true,
  },
]

export function getReportDefinition(slug) {
  return REPORT_DEFINITIONS.find((report) => report.slug === slug) || null
}

export function buildReportParams(filters) {
  const params = {}

  if (filters.productId) params.product_id = filters.productId
  if (filters.productionBatchId) params.production_batch_id = filters.productionBatchId
  if (filters.dateFrom) params.date_from = filters.dateFrom
  if (filters.dateTo) params.date_to = filters.dateTo
  if (filters.category) params.category = filters.category
  if (filters.profitMargin) params.profit_margin = filters.profitMargin

  return params
}

export function formatReportValue(key, value) {
  if (value === null || value === undefined || value === '') return '—'

  const moneyKeys = [
    'total_cost',
    'unit_cost',
    'cogs_per_unit',
    'total_manufacturing_cost',
    'total_material_cost',
    'total_utility_cost',
    'total_labor_cost',
    'total_overhead_cost',
    'recommended_selling_price',
    'expected_profit_per_unit',
    'standard_total_cost',
    'actual_total_cost',
    'standard_material_cost',
    'actual_material_cost',
    'standard_utility_cost',
    'actual_utility_cost',
    'standard_labor_cost',
    'actual_labor_cost',
    'standard_overhead_cost',
    'actual_overhead_cost',
    'standard_cogs_per_unit',
    'actual_cogs_per_unit',
    'variance_amount',
    'material_variance',
    'hourly_rate',
  ]

  if (moneyKeys.some((suffix) => key.endsWith(suffix) || key === suffix)) {
    return Number(value).toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }

  if (key.endsWith('_percent') || key === 'expected_profit_percentage' || key === 'target_profit_margin_percent') {
    return `${Number(value).toFixed(2)}%`
  }

  if (key === 'configured') {
    return value ? 'Configured' : 'Incomplete'
  }

  if (key === 'status') {
    if (value === 'on_target') return 'On target'
    if (value === 'over_standard') return 'Over standard'
    if (value === 'under_standard') return 'Under standard'
    return value
  }

  if (typeof value === 'number') {
    return Number(value).toLocaleString('en-PH', { maximumFractionDigits: 4 })
  }

  return String(value)
}

export const REPORT_COLUMN_LABELS = {
  product_name: 'Product',
  sku: 'SKU',
  recipe_batch_size: 'Recipe batch',
  total_material_cost: 'Material cost',
  total_utility_cost: 'Utility cost',
  total_labor_cost: 'Labor cost',
  total_overhead_cost: 'Overhead cost',
  total_manufacturing_cost: 'Total mfg. cost',
  cogs_per_unit: 'COGS / unit',
  name: 'Item',
  quantity: 'Quantity',
  unit_symbol: 'Unit',
  unit_cost: 'Unit cost',
  total_cost: 'Total cost',
  workers: 'Workers',
  hours: 'Hours',
  hourly_rate: 'Hourly rate',
  category: 'Category',
  target_profit_margin_percent: 'Target margin',
  recommended_selling_price: 'Recommended price',
  expected_profit_per_unit: 'Expected profit / unit',
  expected_profit_percentage: 'Expected profit %',
  batch_number: 'Batch #',
  production_date: 'Production date',
  production_quantity: 'Batch qty',
  standard_total_cost: 'Standard total',
  actual_total_cost: 'Actual total',
  standard_cogs_per_unit: 'Standard COGS / unit',
  actual_cogs_per_unit: 'Actual COGS / unit',
  standard_material_cost: 'Standard material',
  actual_material_cost: 'Actual material',
  material_variance: 'Material variance',
  variance_amount: 'Variance',
  variance_percent: 'Variance %',
  status: 'Status',
  configured: 'Status',
}

export function getColumnLabel(key) {
  return REPORT_COLUMN_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getReportColumns(rows, slug) {
  if (!rows?.length) return []

  const hiddenKeys = new Set(['product_id', 'batch_id', 'reference_id', 'cost_type'])
  const preferredOrder = {
    [REPORT_SLUGS.PRODUCT_COST_BREAKDOWN]: [
      'product_name', 'recipe_batch_size', 'total_material_cost', 'total_utility_cost',
      'total_labor_cost', 'total_overhead_cost', 'total_manufacturing_cost', 'cogs_per_unit',
    ],
    [REPORT_SLUGS.COGS_PER_PRODUCT]: [
      'product_name', 'sku', 'recipe_batch_size', 'total_manufacturing_cost', 'cogs_per_unit', 'configured',
    ],
    [REPORT_SLUGS.PRODUCTION_COST_BY_BATCH]: [
      'batch_number', 'product_name', 'production_date', 'production_quantity',
      'standard_total_cost', 'actual_total_cost', 'standard_cogs_per_unit', 'actual_cogs_per_unit',
    ],
    [REPORT_SLUGS.COST_VARIANCE]: [
      'batch_number', 'product_name', 'production_date', 'standard_total_cost', 'actual_total_cost',
      'variance_amount', 'variance_percent', 'material_variance', 'status',
    ],
  }

  const keys = Object.keys(rows[0]).filter((key) => !hiddenKeys.has(key))
  const order = preferredOrder[slug]

  if (order) {
    return order.filter((key) => keys.includes(key)).concat(keys.filter((key) => !order.includes(key)))
  }

  return keys
}
