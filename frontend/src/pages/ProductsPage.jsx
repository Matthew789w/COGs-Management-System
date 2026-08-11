import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TablePagination from '../components/ui/TablePagination'

const PAGE_SIZE = 10

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query),
    )
  }, [products, search])

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredProducts.slice(start, start + PAGE_SIZE)
  }, [filteredProducts, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—'
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

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
                <tr>
                  <td colSpan={6} className="empty-state">
                    Loading products...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Package}
                      title={search ? 'No products found' : 'No products yet'}
                      description={
                        search
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
                    <td className="table__cell-mono">{formatCurrency(product.list_price)}</td>
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
                        <button type="button" className="button button--ghost button--icon" aria-label="View">
                          <Eye size={16} />
                        </button>
                        <button type="button" className="button button--ghost button--icon" aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="button button--ghost button--icon" aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
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
