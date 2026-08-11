export const OVERHEAD_CATEGORIES = [
  { value: 'depreciation', label: 'Equipment depreciation' },
  { value: 'rent', label: 'Factory rent' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'machine_usage', label: 'Machine usage' },
  { value: 'other', label: 'Other manufacturing expenses' },
]

export function formatOverheadCategory(category) {
  return OVERHEAD_CATEGORIES.find((item) => item.value === category)?.label || category
}
