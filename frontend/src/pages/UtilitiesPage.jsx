import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TablePagination from '../components/ui/TablePagination'

const utilitiesData = [
  {
    id: 1,
    name: 'Electricity',
    unit: 'kWh',
    cost: '$0.14',
    billingPeriod: 'Monthly',
  },
  {
    id: 2,
    name: 'Compressed air',
    unit: 'm³',
    cost: '$0.09',
    billingPeriod: 'Monthly',
  },
]

function UtilitiesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredUtilities = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return utilitiesData
    return utilitiesData.filter(
      (utility) =>
        utility.name.toLowerCase().includes(query) ||
        utility.unit.toLowerCase().includes(query),
    )
  }, [search])

  return (
    <div>
      <PageHeader
        title="Utilities"
        description="Manage utility rates, consumption units, and cost drivers for product costing."
        action={
          <Button variant="secondary" icon={Plus}>
            Add utility
          </Button>
        }
      />

      <Card>
        <PanelHeader title="Utility rate table" />
        <DataTableToolbar
          searchPlaceholder="Search utilities..."
          searchValue={search}
          onSearchChange={setSearch}
        />
        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Utility</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Billing period</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {filteredUtilities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No utilities found. Try changing your search or filter.
                  </td>
                </tr>
              ) : (
                filteredUtilities.map((utility) => (
                  <tr key={utility.id} className="table__row">
                    <td>{utility.name}</td>
                    <td className="table__cell-muted">{utility.unit}</td>
                    <td className="table__cell-mono">{utility.cost}</td>
                    <td>{utility.billingPeriod}</td>
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
          total={filteredUtilities.length}
          page={page}
          pageSize={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}

export default UtilitiesPage
