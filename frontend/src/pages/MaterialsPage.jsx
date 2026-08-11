import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Eye, Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TableLoadingState from '../components/ui/TableLoadingState'
import TablePagination from '../components/ui/TablePagination'
import { formatPeso } from '../utils/currency'

const PAGE_SIZE = 10

function MaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get('/api/materials')
      .then((response) => setMaterials(response.data.data || []))
      .catch(() => setError('Unable to load materials. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return materials
    return materials.filter(
      (material) =>
        material.name.toLowerCase().includes(query) ||
        material.sku.toLowerCase().includes(query) ||
        material.unit?.symbol?.toLowerCase().includes(query) ||
        material.unit?.category?.toLowerCase().includes(query),
    )
  }, [materials, search])

  const paginatedMaterials = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredMaterials.slice(start, start + PAGE_SIZE)
  }, [filteredMaterials, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Define raw material details, cost rates, and purchasing information."
        action={
          <Link to="/materials/create">
            <Button variant="secondary" icon={Plus}>
              Add material
            </Button>
          </Link>
        }
      />

      <Card>
        <PanelHeader title="Material master inventory" />
        <DataTableToolbar
          searchPlaceholder="Search materials..."
          searchValue={search}
          onSearchChange={setSearch}
        />

        {error && <p className="form-error">{error}</p>}

        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Material</th>
                <th>Code</th>
                <th>Unit</th>
                <th>Cost per unit</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {loading ? (
                <TableLoadingState colSpan={7} message="Loading materials…" />
              ) : paginatedMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Layers}
                      title={search ? 'No materials found' : 'No materials yet'}
                      description={
                        search
                          ? 'Try changing your search or filter.'
                          : 'Create a material to get started.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedMaterials.map((material) => (
                  <tr key={material.id} className="table__row">
                    <td>{material.name}</td>
                    <td className="table__cell-muted">{material.sku}</td>
                    <td>{material.unit?.symbol || '—'}</td>
                    <td className="table__cell-mono">{formatPeso(material.cost_per_unit, 4)}</td>
                    <td className="table__cell-muted">{material.unit?.category || '—'}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${material.is_active ? 'active' : 'inactive'}`}
                      >
                        {material.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <Link
                          to={`/materials/${material.id}`}
                          className="table-action table-action--view"
                          aria-label={`View ${material.name}`}
                          title="View"
                        >
                          <Eye size={16} strokeWidth={2.25} />
                        </Link>
                        <Link
                          to={`/materials/${material.id}/edit`}
                          className="table-action table-action--edit"
                          aria-label={`Edit ${material.name}`}
                          title="Edit"
                        >
                          <Pencil size={16} strokeWidth={2.25} />
                        </Link>
                        <Link
                          to={`/materials/${material.id}/delete`}
                          className="table-action table-action--delete"
                          aria-label={`Delete ${material.name}`}
                          title="Delete"
                        >
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
          <TablePagination
            total={filteredMaterials.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  )
}

export default MaterialsPage
