export function formatPeso(value, decimals = 2) {
  if (value === null || value === undefined || value === '') return '—'

  return `₱${Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}
