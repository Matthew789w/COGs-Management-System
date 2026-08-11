import { Link } from 'react-router-dom'
import { Plus, Box, DollarSign, Package, Ruler, TrendingUp, Zap } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import KpiCard from '../components/ui/KpiCard'
import ListItem from '../components/ui/ListItem'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import Badge from '../components/ui/Badge'

const recentUpdates = [
  {
    icon: Package,
    title: 'New product example',
    time: '1 hour ago',
    badge: { label: 'Updated', variant: 'success' },
  },
  {
    icon: DollarSign,
    title: 'Material price refresh',
    time: 'Yesterday',
    badge: { label: 'Updated', variant: 'success' },
  },
  {
    icon: Zap,
    title: 'Utility rate schedule',
    time: 'Pending approval',
    badge: { label: 'Pending', variant: 'warning' },
  },
]

const quickActions = [
  {
    icon: Box,
    title: 'Create new material',
    description: 'Open master data entry',
  },
  {
    icon: Ruler,
    title: 'Review unit definitions',
    description: 'Validate conversions',
  },
  {
    icon: TrendingUp,
    title: 'Audit utility costs',
    description: 'Compare latest rates',
  },
]

function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Monitor products, materials, units, and utilities across your COGs master data."
        action={
          <Link to="/products/create">
            <Button variant="primary" icon={Plus}>
              Add product
            </Button>
          </Link>
        }
      />

      <div className="kpi-grid">
        <KpiCard
          label="Products"
          value="128"
          meta="Active costed SKUs in the catalog"
          icon={Package}
          iconColor="blue"
        />
        <KpiCard
          label="Materials"
          value="54"
          meta="Raw materials and purchased components"
          icon={Box}
          iconColor="green"
        />
        <KpiCard
          label="Utilities"
          value="8"
          meta="Utility rate schedules and unit costs"
          icon={Zap}
          iconColor="orange"
        />
        <KpiCard
          label="Units"
          value="12"
          meta="Measurement units used in cost calculations"
          icon={Ruler}
          iconColor="blue"
        />
      </div>

      <div className="dashboard-grid">
        <Card>
          <PanelHeader
            title="Recent master data updates"
            action={
              <button type="button" className="btn btn--link">
                View all
              </button>
            }
          />
          <div className="dashboard-panel__list">
            {recentUpdates.map((item) => (
              <ListItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                trailing={
                  <>
                    <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
                    <span className="list-item__time">{item.time}</span>
                  </>
                }
                onClick={() => {}}
              />
            ))}
          </div>
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
                onClick={() => {}}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
