import { Link } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  Calculator,
  Factory,
  Layers,
  LineChart,
  Package,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import ManufacturingNav from '../../components/manufacturing/ManufacturingNav'
import ReportsNav from '../../components/reports/ReportsNav'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import { REPORT_DEFINITIONS } from '../../utils/reports'

const reportIcons = {
  'product-cost-breakdown': Calculator,
  'cogs-per-product': Package,
  'material-cost': Layers,
  'utility-cost': Zap,
  'labor-cost': Users,
  'manufacturing-overhead': Factory,
  'recommended-selling-price': TrendingUp,
  'expected-profit': LineChart,
  'production-cost-by-batch': Boxes,
  'cost-variance': BarChart3,
}

function ReportsHubPage() {
  const groups = [...new Set(REPORT_DEFINITIONS.map((report) => report.group))]

  return (
    <div className="manufacturing-report">
      <PageHeader
        title="COGS & Profitability Reports"
        description="Analyze product costing, profitability, production batch costs, and standard vs actual variance."
      />

      <ManufacturingNav />

      <div className="reports-layout">
        <ReportsNav />

        <div className="reports-layout__content">
          {groups.map((group) => (
            <section key={group} className="reports-hub__section">
              <h2 className="reports-hub__section-title">{group}</h2>
              <div className="reports-hub__grid">
                {REPORT_DEFINITIONS.filter((report) => report.group === group).map((report) => {
                  const Icon = reportIcons[report.slug] || BarChart3

                  return (
                    <Link key={report.slug} to={`/bom/reports/cogs/${report.slug}`} className="reports-hub__card">
                      <Card>
                        <div className="reports-hub__card-icon">
                          <Icon size={20} aria-hidden="true" />
                        </div>
                        <h3 className="reports-hub__card-title">{report.title}</h3>
                        <p className="reports-hub__card-description">{report.description}</p>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsHubPage
