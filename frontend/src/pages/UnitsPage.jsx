import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TablePagination from '../components/ui/TablePagination'

const unitsData = [
  { id: 1, name: 'Kilogram', symbol: 'kg', category: 'Weight', conversionFactor: '1.000' },
  { id: 2, name: 'Gram', symbol: 'g', category: 'Weight', conversionFactor: '0.001' },
]

function UnitsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return unitsData
    return unitsData.filter(
      (unit) =>
        unit.name.toLowerCase().includes(query) ||
        unit.symbol.toLowerCase().includes(query) ||
        unit.category.toLowerCase().includes(query),
    )
  }, [search])

  return (
    <div>
      <PageHeader
        title="Units"
        description="Review measurement units and conversion settings used in costing calculations."
        action={
          <Button variant="secondary" icon={Plus}>
            Add unit
          </Button>
        }
      />

      <Card>
        <PanelHeader title="Available units" />
        <DataTableToolbar
          searchPlaceholder="Search units..."
          searchValue={search}
          onSearchChange={setSearch}
        />
        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Unit</th>
                <th>Symbol</th>
                <th>Category</th>
                <th>Conversion factor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No units found. Try changing your search or filter.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className="table__row">
                    <td>{unit.name}</td>
                    <td className="table__cell-muted">{unit.symbol}</td>
                    <td>{unit.category}</td>
                    <td className="table__cell-mono">{unit.conversionFactor}</td>
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
        <TablePagination
          total={filteredUnits.length}
          page={page}
          pageSize={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}

export default UnitsPage
