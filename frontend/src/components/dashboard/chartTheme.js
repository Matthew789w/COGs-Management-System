/** Fixed chart colors — stay readable regardless of accent theme or solid mode */
export const CHART_PALETTE = [
  '#4f46e5',
  '#0891b2',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#e11d48',
]

export const BATCH_STATUS_COLORS = {
  Draft: '#f59e0b',
  Confirmed: '#10b981',
  Cancelled: '#ef4444',
}

export const COST_MIX_COLORS = {
  Materials: '#4f46e5',
  Utilities: '#0891b2',
  Labor: '#7c3aed',
  Overhead: '#059669',
}

export function getChartColor(index) {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}
