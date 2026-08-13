import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import axios from '../lib/api'
import { Eye, Pencil, Plus, Ruler, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TableLoadingState from '../components/ui/TableLoadingState'
import TablePagination from '../components/ui/TablePagination'

import {
  applyTableFilters,
  countActiveFilters,
  createSelectFilter,
  emptyFilters,
  resolveFilterFields,
  statusFilterDef,
} from '../utils/tableFilters'

const PAGE_SIZE = 10

const UNIT_FILTER_DEFS = [
  statusFilterDef,
  createSelectFilter({
    key: 'category',
    label: 'Category',
    allLabel: 'All categories',
    getValue: (unit) => unit.category,
  }),
]

const UNIT_SEARCH_GETTERS = [
  (unit) => unit.name,
  (unit) => unit.symbol,
  (unit) => unit.code,
  (unit) => unit.category,
]

function UnitsPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(() => emptyFilters(UNIT_FILTER_DEFS))
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    axios.get('/api/units')
      .then((response) => setUnits(response.data.data || []))
      .catch(() => setError('Unable to load units. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filterFields = useMemo(() => resolveFilterFields(units, UNIT_FILTER_DEFS), [units])

  const filteredUnits = useMemo(
    () =>
      applyTableFilters(units, {
        search,
        searchGetters: UNIT_SEARCH_GETTERS,
        filters,
        defs: UNIT_FILTER_DEFS,
      }),
    [units, search, filters],
  )

  const paginatedUnits = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredUnits.slice(start, start + PAGE_SIZE)
  }, [filteredUnits, page])

  useEffect(() => {
    setPage(1)
  }, [search, filters])

  const hasActiveQuery = search.trim() !== '' || countActiveFilters(filters) > 0

  return (
    <div>
      <PageHeader
        title="Units"
        description="Review measurement units and conversion settings used in costing calculations."
        action={
          <Link to="/units/create">
            <Button variant="primary" icon={Plus}>Add unit</Button>
          </Link>
        }
      />

      <Card>
        <PanelHeader title="Available units" />
        <DataTableToolbar
          searchPlaceholder="Search units..."
          searchValue={search}
          onSearchChange={setSearch}
          filterFields={filterFields}
          filters={filters}
          onFiltersChange={setFilters}
        />
        {error && <p className="form-error">{error}</p>}

        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Unit</th>
                <th>Code</th>
                <th>Symbol</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {loading ? (
                <TableLoadingState colSpan={6} message="Loading units…" />
              ) : paginatedUnits.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Ruler}
                      title={hasActiveQuery ? 'No units found' : 'No units yet'}
                      description={hasActiveQuery ? 'Try changing your search or filter.' : 'Create a unit to get started.'}
                    />
                  </td>
                </tr>
              ) : (
                paginatedUnits.map((unit) => (
                  <tr key={unit.id} className="table__row">
                    <td>{unit.name}</td>
                    <td className="table__cell-muted">{unit.code}</td>
                    <td>{unit.symbol}</td>
                    <td className="table__cell-muted">{unit.category}</td>
                    <td>
                      <span className={`status-badge status-badge--${unit.is_active ? 'active' : 'inactive'}`}>
                        {unit.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <Link to={`/units/${unit.id}`} className="table-action table-action--view" title="View" aria-label={`View ${unit.name}`}>
                          <Eye size={16} strokeWidth={2.25} />
                        </Link>
                        <Link to={`/units/${unit.id}/edit`} className="table-action table-action--edit" title="Edit" aria-label={`Edit ${unit.name}`}>
                          <Pencil size={16} strokeWidth={2.25} />
                        </Link>
                        <Link to={`/units/${unit.id}/delete`} className="table-action table-action--delete" title="Delete" aria-label={`Delete ${unit.name}`}>
                          <Trash2 size={16} strokeWidth={2.25} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && (
          <TablePagination total={filteredUnits.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </Card>
    </div>
  )
}

export default UnitsPage
