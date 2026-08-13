import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import axios from '../lib/api'
import { Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TableLoadingState from '../components/ui/TableLoadingState'
import TablePagination from '../components/ui/TablePagination'
import { formatPeso } from '../utils/currency'
import {
  applyTableFilters,
  countActiveFilters,
  createSelectFilter,
  emptyFilters,
  resolveFilterFields,
  statusFilterDef,
} from '../utils/tableFilters'

const PAGE_SIZE = 10

const PRODUCT_FILTER_DEFS = [
  statusFilterDef,
  createSelectFilter({
    key: 'default_unit',
    label: 'Default unit',
    allLabel: 'All units',
    getValue: (product) => product.default_unit?.symbol,
  }),
]

const PRODUCT_SEARCH_GETTERS = [
  (product) => product.name,
  (product) => product.sku,
]

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(() => emptyFilters(PRODUCT_FILTER_DEFS))
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get('/api/products')
      .then((response) => setProducts(response.data.data || []))
      .catch(() => setError('Unable to load products. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filterFields = useMemo(
    () => resolveFilterFields(products, PRODUCT_FILTER_DEFS),
    [products],
  )

  const filteredProducts = useMemo(
    () =>
      applyTableFilters(products, {
        search,
        searchGetters: PRODUCT_SEARCH_GETTERS,
        filters,
        defs: PRODUCT_FILTER_DEFS,
      }),
    [products, search, filters],
  )

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredProducts.slice(start, start + PAGE_SIZE)
  }, [filteredProducts, page])

  useEffect(() => {
    setPage(1)
  }, [search, filters])

  const hasActiveQuery = search.trim() !== '' || countActiveFilters(filters) > 0

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage product master data, bill of material costs, and product-level units."
        action={
          <Link to="/products/create">
            <Button variant="primary" icon={Plus}>
              Create product
            </Button>
          </Link>
        }
      />

      <Card>
        <PanelHeader title="Product list" />
        <DataTableToolbar
          searchPlaceholder="Search products..."
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
                <th>Name</th>
                <th>SKU</th>
                <th>List price</th>
                <th>Default unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {loading ? (
                <TableLoadingState colSpan={6} message="Loading products…" />
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Package}
                      title={hasActiveQuery ? 'No products found' : 'No products yet'}
                      description={
                        hasActiveQuery
                          ? 'Try changing your search or filter.'
                          : 'Create a product to get started.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="table__row">
                    <td>{product.name}</td>
                    <td className="table__cell-muted">{product.sku}</td>
                    <td className="table__cell-mono">{formatPeso(product.list_price)}</td>
                    <td className="table__cell-muted">
                      {product.default_unit?.symbol || '—'}
                    </td>
                    <td>
                      <span
                        className={`status-badge status-badge--${product.is_active ? 'active' : 'inactive'}`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <Link
                          to={`/products/${product.id}`}
                          className="table-action table-action--view"
                          aria-label={`View ${product.name}`}
                          title="View"
                        >
                          <Eye size={16} strokeWidth={2.25} />
                        </Link>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="table-action table-action--edit"
                          aria-label={`Edit ${product.name}`}
                          title="Edit"
                        >
                          <Pencil size={16} strokeWidth={2.25} />
                        </Link>
                        <Link
                          to={`/products/${product.id}/delete`}
                          className="table-action table-action--delete"
                          aria-label={`Delete ${product.name}`}
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
            total={filteredProducts.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  )
}

export default ProductsPage
