import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../lib/api'
import {
  BarChart3,
  Box,
  ClipboardList,
  Factory,
  Layers,
  Package,
  Plus,
  TrendingUp,
  Warehouse,
  Zap,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DonutChart, { BATCH_STATUS_COLORS, COST_MIX_COLORS } from '../components/dashboard/DonutChart'
import EmptyState from '../components/ui/EmptyState'
import HorizontalBarChart from '../components/dashboard/HorizontalBarChart'
import KpiCard from '../components/ui/KpiCard'
import ListItem from '../components/ui/ListItem'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import Badge from '../components/ui/Badge'
import TableLoadingState from '../components/ui/TableLoadingState'
import VerticalBarChart from '../components/dashboard/VerticalBarChart'
import { formatPeso } from '../utils/currency'
import { formatRelativeTime } from '../utils/formatRelativeTime'

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

function formatQuantity(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString('en-PH', { maximumFractionDigits: 0 })
}

function formatPercent(value) {
  if (value === null || value === undefined) return '—'
  const capped = Math.max(-100, Math.min(100, Number(value)))
  return `${capped.toFixed(1)}%`
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
  const analytics = summary?.analytics || {}

  const productionTrendData = useMemo(
    () =>
      (analytics.production_trend || []).map((item) => ({
        label: item.label,
        value: item.batches,
        quantity: item.quantity,
      })),
    [analytics.production_trend],
  )

  const batchStatusData = useMemo(
    () =>
      (analytics.batch_status || []).map((item) => ({
        label: item.label,
        value: item.count,
      })),
    [analytics.batch_status],
  )

  const topCogsData = useMemo(
    () =>
      (analytics.top_cogs_products || []).map((item) => ({
        label: item.product_name,
        value: item.cogs_per_unit,
      })),
    [analytics.top_cogs_products],
  )

  const costMixData = useMemo(
    () =>
      (analytics.cost_mix || []).map((item) => ({
        label: item.label,
        value: item.amount,
      })),
    [analytics.cost_mix],
  )

  const marginData = useMemo(
    () =>
      (analytics.product_margins || []).map((item) => ({
        label: item.product_name,
        value: item.margin_percent,
        margin: item.margin_per_unit,
      })),
    [analytics.product_margins],
  )

  const inventoryData = useMemo(
    () =>
      (analytics.inventory_materials || []).map((item) => ({
        label: item.material_name,
        value: item.quantity,
        unit: item.unit,
      })),
    [analytics.inventory_materials],
  )

  const totalProductionBatches = productionTrendData.reduce((sum, item) => sum + item.value, 0)

  const batchMetaParts = [
    `${counts.confirmed_batches ?? 0} confirmed`,
    `${counts.draft_batches ?? 0} draft`,
  ]
  if ((counts.cancelled_batches ?? 0) > 0) {
    batchMetaParts.push(`${counts.cancelled_batches} cancelled`)
  }

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
      meta: batchMetaParts.join(' · '),
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
        description="Live overview of master data, production activity, costing analytics, and inventory."
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

      <div className="dashboard-analytics-grid">
        <Card className="dashboard-analytics-card">
          <PanelHeader
            title="Production output"
            action={
              <Link to="/production" className="btn btn--link">
                View batches
              </Link>
            }
          />
          <div className="dashboard-analytics-card__body">
            <p className="dashboard-chart__description">
              All batches (draft, confirmed, cancelled) over the last 6 months.
            </p>
            {loading ? (
              <div className="dashboard-chart__loading">Loading chart…</div>
            ) : productionTrendData.length ? (
              <VerticalBarChart
                data={productionTrendData}
                valueKey="value"
                labelKey="label"
                formatAxis={(value) => String(Math.round(value))}
                formatValue={(value) => `${value} batch${value === 1 ? '' : 'es'}`}
                emptyHint="No batches recorded in this period yet. Create production batches to populate this chart."
              />
            ) : (
              <VerticalBarChart data={[]} emptyLabel="Production trend will appear once batches are recorded." />
            )}
          </div>
        </Card>

        <Card className="dashboard-analytics-card">
          <PanelHeader title="Batch status" />
          <div className="dashboard-analytics-card__body">
            <p className="dashboard-chart__description">
              Current mix of draft, confirmed, and cancelled batches.
            </p>
            {loading ? (
              <div className="dashboard-chart__loading">Loading chart…</div>
            ) : batchStatusData.length ? (
              <DonutChart
                data={batchStatusData}
                valueKey="value"
                labelKey="label"
                formatValue={formatQuantity}
                centerLabel={String(counts.production_batches ?? 0)}
                centerCaption="Total batches"
                colorMap={BATCH_STATUS_COLORS}
              />
            ) : (
              <EmptyState
                icon={Factory}
                title="No batches recorded"
                description="Create a production batch to see status distribution."
              />
            )}
          </div>
        </Card>

        <Card className="dashboard-analytics-card dashboard-analytics-card--wide">
          <PanelHeader
            title="Top COGS per unit"
            action={
              <Link to="/bom/reports" className="btn btn--link">
                Full COGS report
              </Link>
            }
          />
          <div className="dashboard-analytics-card__body">
            <p className="dashboard-chart__description">
              Highest unit manufacturing costs across configured products.
            </p>
            {loading ? (
              <div className="dashboard-chart__loading">Loading chart…</div>
            ) : topCogsData.length ? (
              <HorizontalBarChart
                data={topCogsData}
                valueKey="value"
                labelKey="label"
                formatValue={(value) => formatPeso(value, 2)}
              />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No costing data yet"
                description="Configure BOM, labor, and overhead on products to compare COGS."
              />
            )}
          </div>
        </Card>

        <Card className="dashboard-analytics-card">
          <PanelHeader title="Manufacturing cost mix" />
          <div className="dashboard-analytics-card__body">
            <p className="dashboard-chart__description">
              How total recipe costs split across cost categories.
            </p>
            {loading ? (
              <div className="dashboard-chart__loading">Loading chart…</div>
            ) : costMixData.length ? (
              <DonutChart
                data={costMixData}
                valueKey="value"
                labelKey="label"
                formatValue={(value) => formatPeso(value, 0)}
                colorMap={COST_MIX_COLORS}
              />
            ) : (
              <EmptyState
                icon={Layers}
                title="No cost breakdown yet"
                description="Add materials, utilities, labor, or overhead to products."
              />
            )}
          </div>
        </Card>

        <Card className="dashboard-analytics-card">
          <PanelHeader
            title="Best product margins"
            action={
              <Link to="/bom/reports" className="btn btn--link">
                Pricing report
              </Link>
            }
          />
          <div className="dashboard-analytics-card__body">
            <p className="dashboard-chart__description">
              Gross margin based on list price minus COGS per unit.
            </p>
            {loading ? (
              <div className="dashboard-chart__loading">Loading chart…</div>
            ) : marginData.length ? (
              <HorizontalBarChart
                data={marginData}
                valueKey="value"
                labelKey="label"
                formatValue={formatPercent}
                secondaryKey="margin"
                formatSecondary={(value) => formatPeso(value, 2)}
              />
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No margin data yet"
                description="Set list prices and product costing to compare profitability."
              />
            )}
          </div>
        </Card>

        <Card className="dashboard-analytics-card">
          <PanelHeader
            title="Top material stock"
            action={
              <Link to="/inventory" className="btn btn--link">
                Inventory
              </Link>
            }
          />
          <div className="dashboard-analytics-card__body">
            <p className="dashboard-chart__description">
              Materials with the highest quantity on hand.
            </p>
            {loading ? (
              <div className="dashboard-chart__loading">Loading chart…</div>
            ) : inventoryData.length ? (
              <HorizontalBarChart
                data={inventoryData}
                valueKey="value"
                labelKey="label"
                formatValue={(value) => formatQuantity(value)}
                secondaryKey="unit"
                formatSecondary={(value) => (value ? String(value) : '')}
              />
            ) : (
              <EmptyState
                icon={Warehouse}
                title="No inventory balances"
                description="Receive materials or adjust inventory to track stock levels."
              />
            )}
          </div>
        </Card>
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

      {!loading && totalProductionBatches > 0 && (
        <p className="dashboard-analytics-footnote">
          Analytics reflect live product costing, confirmed production batches, and current inventory
          balances.
        </p>
      )}
    </div>
  )
}

export default DashboardPage
