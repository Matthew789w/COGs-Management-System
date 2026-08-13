import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import axios from '../lib/api'
import { Eye, Pencil, Plus, Trash2, Users } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTableToolbar from '../components/ui/DataTableToolbar'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import TableLoadingState from '../components/ui/TableLoadingState'
import TablePagination from '../components/ui/TablePagination'
import UserAvatar from '../components/ui/UserAvatar'
import {
  applyTableFilters,
  countActiveFilters,
  createSelectFilter,
  emptyFilters,
  resolveFilterFields,
} from '../utils/tableFilters'

const PAGE_SIZE = 10

const USER_FILTER_DEFS = [
  createSelectFilter({
    key: 'role',
    label: 'Role',
    allLabel: 'All roles',
    getValue: (user) => user.role,
  }),
]

const USER_SEARCH_GETTERS = [
  (user) => user.name,
  (user) => user.username,
  (user) => user.email,
  (user) => user.role,
]

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(() => emptyFilters(USER_FILTER_DEFS))
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')

    axios
      .get('/api/users')
      .then((response) => setUsers(response.data.data || []))
      .catch((loadError) => {
        setError(
          loadError.response?.data?.message || 'Unable to load users. Please try again.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const filterFields = useMemo(() => resolveFilterFields(users, USER_FILTER_DEFS), [users])

  const filteredUsers = useMemo(
    () =>
      applyTableFilters(users, {
        search,
        searchGetters: USER_SEARCH_GETTERS,
        filters,
        defs: USER_FILTER_DEFS,
      }),
    [users, search, filters],
  )

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, page])

  useEffect(() => {
    setPage(1)
  }, [search, filters])

  const hasActiveQuery = search.trim() !== '' || countActiveFilters(filters) > 0

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system accounts, roles, and access for your team."
        action={
          <Link to="/users/create">
            <Button variant="primary" icon={Plus}>
              Add user
            </Button>
          </Link>
        }
      />

      <Card>
        <PanelHeader title="User accounts" />
        <DataTableToolbar
          searchPlaceholder="Search users..."
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
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {loading ? (
                <TableLoadingState colSpan={5} message="Loading users…" />
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title={hasActiveQuery ? 'No users found' : 'No users yet'}
                      description={
                        hasActiveQuery
                          ? 'Try changing your search or filter.'
                          : 'Create a user account to get started.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="table__row">
                    <td>
                      <div className="users-table__identity">
                        <UserAvatar profile={user} size="sm" />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="table__cell-muted">@{user.username}</td>
                    <td className="table__cell-muted">{user.email}</td>
                    <td>
                      <span className="status-badge status-badge--active">{user.role}</span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <Link
                          to={`/users/${user.id}`}
                          className="table-action table-action--view"
                          aria-label={`View ${user.name}`}
                          title="View"
                        >
                          <Eye size={16} strokeWidth={2.25} />
                        </Link>
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="table-action table-action--edit"
                          aria-label={`Edit ${user.name}`}
                          title="Edit"
                        >
                          <Pencil size={16} strokeWidth={2.25} />
                        </Link>
                        <Link
                          to={`/users/${user.id}/delete`}
                          className="table-action table-action--delete"
                          aria-label={`Delete ${user.name}`}
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
            total={filteredUsers.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  )
}

export default UsersPage
