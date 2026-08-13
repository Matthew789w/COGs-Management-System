import { useMemo, useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { countActiveFilters } from '../../utils/tableFilters'

function DataTableToolbar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filterLabel = 'Filters',
  filterFields = [],
  filters = {},
  onFiltersChange,
}) {
  const [open, setOpen] = useState(false)
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters])
  const hasFilters = filterFields.length > 0

  const handleFilterChange = (key, value) => {
    onFiltersChange?.({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    const cleared = filterFields.reduce((accumulator, field) => {
      accumulator[field.key] = ''
      return accumulator
    }, {})
    onFiltersChange?.(cleared)
  }

  const handleToggleFilters = () => {
    if (!hasFilters) return
    setOpen((current) => !current)
  }

  return (
    <div className="table-toolbar-wrap">
      <div className="table-toolbar">
        <div className="table-toolbar__search">
          <Search size={16} className="table-toolbar__search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            aria-label="Search table"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            className={`btn btn--secondary btn--sm table-toolbar__filter-btn ${open ? 'table-toolbar__filter-btn--active' : ''}`.trim()}
            onClick={handleToggleFilters}
            aria-expanded={open}
          >
            <Filter size={15} aria-hidden="true" />
            <span>{filterLabel}</span>
            {activeFilterCount > 0 && (
              <span className="table-toolbar__filter-count">{activeFilterCount}</span>
            )}
          </button>
        )}
      </div>

      {open && hasFilters && (
        <div className="table-filters" role="region" aria-label="Table filters">
          <div className="table-filters__grid">
            {filterFields.map((field) => (
              <div key={field.key} className="table-filters__field">
                <label htmlFor={`table-filter-${field.key}`}>{field.label}</label>
                <select
                  id={`table-filter-${field.key}`}
                  value={filters[field.key] || ''}
                  onChange={(event) => handleFilterChange(field.key, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={`${field.key}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="table-filters__clear" onClick={handleClearFilters}>
              <X size={14} aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DataTableToolbar
