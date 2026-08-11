import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Eye, Pencil, Plus, Trash2, Zap } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TablePagination from '../components/ui/TablePagination'
import { formatPeso } from '../utils/currency'

const PAGE_SIZE = 10

function UtilitiesPage() {
  const [utilities, setUtilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    axios.get('/api/utilities')
      .then((response) => setUtilities(response.data.data || []))
      .catch(() => setError('Unable to load utilities. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredUtilities = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return utilities
    return utilities.filter(
      (utility) =>
        utility.name.toLowerCase().includes(query) ||
        utility.code.toLowerCase().includes(query) ||
        utility.unit?.symbol?.toLowerCase().includes(query),
    )
  }, [utilities, search])

  const paginatedUtilities = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredUtilities.slice(start, start + PAGE_SIZE)
  }, [filteredUtilities, page])

  useEffect(() => { setPage(1) }, [search])

  return (
    <div>
      <PageHeader
        title="Utilities"
        description="Manage utility rates, consumption units, and cost drivers for product costing."
        action={
          <Link to="/utilities/create">
            <Button variant="secondary" icon={Plus}>Add utility</Button>
          </Link>
        }
      />

      <Card>
        <PanelHeader title="Utility rate table" />
        <DataTableToolbar searchPlaceholder="Search utilities..." searchValue={search} onSearchChange={setSearch} />
        {error && <p className="form-error">{error}</p>}

        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Utility</th>
                <th>Code</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {loading ? (
                <tr><td colSpan={6} className="empty-state">Loading utilities...</td></tr>
              ) : paginatedUtilities.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Zap}
                      title={search ? 'No utilities found' : 'No utilities yet'}
                      description={search ? 'Try changing your search or filter.' : 'Create a utility to get started.'}
                    />
                  </td>
                </tr>
              ) : (
                paginatedUtilities.map((utility) => (
                  <tr key={utility.id} className="table__row">
                    <td>{utility.name}</td>
                    <td className="table__cell-muted">{utility.code}</td>
                    <td>{utility.unit?.symbol || '—'}</td>
                    <td className="table__cell-mono">{formatPeso(utility.rate, 4)}</td>
                    <td>
                      <span className={`status-badge status-badge--${utility.is_active ? 'active' : 'inactive'}`}>
                        {utility.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <Link to={`/utilities/${utility.id}`} className="table-action table-action--view" title="View" aria-label={`View ${utility.name}`}>
                          <Eye size={16} strokeWidth={2.25} />
                        </Link>
                        <Link to={`/utilities/${utility.id}/edit`} className="table-action table-action--edit" title="Edit" aria-label={`Edit ${utility.name}`}>
                          <Pencil size={16} strokeWidth={2.25} />
                        </Link>
                        <Link to={`/utilities/${utility.id}/delete`} className="table-action table-action--delete" title="Delete" aria-label={`Delete ${utility.name}`}>
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
          <TablePagination total={filteredUtilities.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </Card>
    </div>
  )
}

export default UtilitiesPage
