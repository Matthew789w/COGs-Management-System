import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  BarChart3,
  Box,
  ClipboardList,
  Factory,
  Layers,
  Package,
  Plus,
  Ruler,
  TrendingUp,
  Warehouse,
  Zap,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/ui/KpiCard'
import ListItem from '../components/ui/ListItem'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import Badge from '../components/ui/Badge'
import TableLoadingState from '../components/ui/TableLoadingState'

const activityIcons = {
  product: Package,
  material: Layers,
  production_batch: Factory,
  inventory: Warehouse,
}

const quickActions = [
  {
    icon: Box,
    title: 'Create material',
    description: 'Add a raw material to master data',
    link: '/materials/create',
  },
  {
    icon: ClipboardList,
    title: 'Configure manufacturing',
    description: 'Set up BOM, labor, and overhead',
    link: '/bom',
  },
  {
    icon: Factory,
    title: 'Run production',
    description: 'Create and confirm production batches',
    link: '/production',
  },
  {
    icon: BarChart3,
    title: 'View COGS reports',
    description: 'Analyze costing and profitability',
    link: '/bom/reports',
  },
  {
    icon: Warehouse,
    title: 'Manage inventory',
    description: 'Review balances and transactions',
    link: '/inventory',
  },
  {
    icon: TrendingUp,
    title: 'Review utility rates',
    description: 'Audit manufacturing utility costs',
    link: '/utilities',
  },
]

function formatRelativeTime(value) {
  if (!value) return 'Recently'

  const timestamp = new Date(value).getTime()
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return new Date(value).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function DashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get('/api/dashboard')
      .then((response) => {
        setSummary(response.data.data || null)
        setError('')
      })
      .catch(() => {
        setSummary(null)
        setError('Unable to load dashboard data. Please refresh the page.')
      })
      .finally(() => setLoading(false))
  }, [])

  const counts = summary?.counts || {}

  const kpiCards = [
    {
      label: 'Products',
      value: counts.products ?? '—',
      meta: `${counts.active_products ?? 0} active · ${counts.products_with_bom ?? 0} with BOM`,
      icon: Package,
      iconColor: 'blue',
      link: '/products',
    },
    {
      label: 'Materials',
      value: counts.materials ?? '—',
      meta: 'Raw materials in master data',
      icon: Box,
      iconColor: 'green',
      link: '/materials',
    },
    {
      label: 'Production batches',
      value: counts.production_batches ?? '—',
      meta: `${counts.confirmed_batches ?? 0} confirmed · ${counts.draft_batches ?? 0} draft`,
      icon: Factory,
      iconColor: 'orange',
      link: '/production',
    },
    {
      label: 'Utilities & units',
      value: counts.utilities ?? '—',
      meta: `${counts.units ?? 0} measurement units configured`,
      icon: Zap,
      iconColor: 'purple',
      link: '/utilities',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of master data, production activity, and costing readiness."
        action={
          <Link to="/products/create">
            <Button variant="primary" icon={Plus}>
              Add product
            </Button>
          </Link>
        }
      />

      {error && <p className="form-error">{error}</p>}

      <div className="kpi-grid">
        {kpiCards.map((card) => (
          <button
            key={card.label}
            type="button"
            className="dashboard-kpi-link"
            onClick={() => navigate(card.link)}
          >
            <KpiCard
              label={card.label}
              value={loading ? '…' : card.value}
              meta={loading ? 'Loading live counts…' : card.meta}
              icon={card.icon}
              iconColor={card.iconColor}
            />
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card>
          <PanelHeader
            title="Recent activity"
            action={
              <Link to="/inventory" className="btn btn--link">
                View inventory
              </Link>
            }
          />

          {loading ? (
            <div className="table-wrapper">
              <table className="table">
                <tbody className="table__body">
                  <TableLoadingState colSpan={1} message="Loading recent activity…" rows={4} />
                </tbody>
              </table>
            </div>
          ) : summary?.recent_activity?.length ? (
            <div className="dashboard-panel__list">
              {summary.recent_activity.map((item) => {
                const Icon = activityIcons[item.type] || Package

                return (
                  <ListItem
                    key={`${item.type}-${item.title}-${item.occurred_at}`}
                    icon={Icon}
                    title={item.title}
                    description={item.description}
                    trailing={
                      <>
                        <Badge variant={item.badge?.variant || 'default'}>
                          {item.badge?.label}
                        </Badge>
                        <span className="list-item__time">
                          {formatRelativeTime(item.occurred_at)}
                        </span>
                      </>
                    }
                    onClick={() => navigate(item.link)}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No recent activity yet"
              description="Create products, materials, or production batches to see updates here."
            />
          )}
        </Card>

        <Card>
          <PanelHeader title="Quick actions" />
          <div className="dashboard-panel__list">
            {quickActions.map((item) => (
              <ListItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onClick={() => navigate(item.link)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
