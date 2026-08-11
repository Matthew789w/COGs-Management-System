import { Filter, Search } from 'lucide-react'

function DataTableToolbar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filterLabel = 'Filters',
  onFilterClick,
}) {
  return (
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
      <button type="button" className="btn btn--secondary btn--sm" onClick={onFilterClick}>
        <Filter size={15} aria-hidden="true" />
        <span>{filterLabel}</span>
      </button>
    </div>
  )
}

export default DataTableToolbar
