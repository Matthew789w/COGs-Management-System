export const statusFilterDef = {
  key: 'status',
  label: 'Status',
  allLabel: 'All statuses',
  staticOptions: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
  match: (item, value) => {
    if (!value) return true
    return value === 'active' ? Boolean(item.is_active) : !item.is_active
  },
}

export function createSelectFilter({ key, label, allLabel, getValue }) {
  return {
    key,
    label,
    allLabel,
    getOptions: (items) => {
      const values = [
        ...new Set(items.map((item) => getValue(item)).filter((value) => value != null && value !== '')),
      ].sort((a, b) => String(a).localeCompare(String(b)))

      return values.map((value) => ({ value: String(value), label: String(value) }))
    },
    match: (item, value) => !value || String(getValue(item)) === value,
  }
}

export function createRoleFilter(roles) {
  return {
    key: 'role',
    label: 'Role',
    allLabel: 'All roles',
    staticOptions: roles.map((role) => ({ value: role, label: role })),
    match: (item, value) => !value || item.role === value,
  }
}

export function resolveFilterFields(items, defs) {
  return defs.map((def) => ({
    key: def.key,
    label: def.label,
    options: [
      { value: '', label: def.allLabel || `All ${def.label.toLowerCase()}s` },
      ...(def.staticOptions || []),
      ...(def.getOptions ? def.getOptions(items) : []),
    ],
  }))
}

export function emptyFilters(defs) {
  return defs.reduce((accumulator, def) => {
    accumulator[def.key] = ''
    return accumulator
  }, {})
}

export function countActiveFilters(filters) {
  return Object.values(filters).filter(Boolean).length
}

export function applyTableFilters(items, { search, searchGetters, filters, defs }) {
  let result = items

  const query = search.trim().toLowerCase()
  if (query) {
    result = result.filter((item) =>
      searchGetters.some((getter) => getter(item).toLowerCase().includes(query)),
    )
  }

  for (const def of defs) {
    const value = filters[def.key]
    if (value) {
      result = result.filter((item) => def.match(item, value))
    }
  }

  return result
}
