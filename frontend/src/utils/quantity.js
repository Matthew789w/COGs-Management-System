export function formatQuantity(value, maxDecimals = 4) {
  if (value === null || value === undefined || value === '') return '—'

  const num = Number(value)
  if (Number.isNaN(num)) return '—'

  return num.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  })
}

/** Strip trailing zeros for form inputs (e.g. 15.0000 → "15"). */
export function normalizeQuantityInput(value) {
  if (value === null || value === undefined || value === '') return ''

  const num = Number(value)
  if (Number.isNaN(num)) return ''

  return String(num)
}
