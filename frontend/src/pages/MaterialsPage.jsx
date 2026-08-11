import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TablePagination from '../components/ui/TablePagination'

const materialsData = [
  {
    id: 1,
    name: 'Steel tubing',
    code: 'MAT-5401',
    unit: 'kg',
    costPerUnit: '$3.72',
    category: 'Raw material',
  },
  {
    id: 2,
    name: 'Polymer resin',
    code: 'MAT-5402',
    unit: 'kg',
    costPerUnit: '$6.10',
    category: 'Processed material',
  },
]

function MaterialsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return materialsData
    return materialsData.filter(
      (material) =>
        material.name.toLowerCase().includes(query) ||
        material.code.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query),
    )
  }, [search])

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Define raw material details, cost rates, and purchasing information."
        action={
          <Button variant="secondary" icon={Plus}>
            Add material
          </Button>
        }
      />

      <Card>
        <PanelHeader title="Material master inventory" />
        <DataTableToolbar
          searchPlaceholder="Search materials..."
          searchValue={search}
          onSearchChange={setSearch}
        />
        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr>
                <th>Material</th>
                <th>Code</th>
                <th>Unit</th>
                <th>Cost per unit</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No materials found. Try changing your search or filter.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="table__row">
                    <td>{material.name}</td>
                    <td className="table__cell-muted">{material.code}</td>
                    <td>{material.unit}</td>
                    <td className="table__cell-mono">{material.costPerUnit}</td>
                    <td className="table__cell-muted">{material.category}</td>
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
          total={filteredMaterials.length}
          page={page}
          pageSize={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}

export default MaterialsPage
