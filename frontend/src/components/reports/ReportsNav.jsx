import { NavLink } from 'react-router-dom'
import { REPORT_DEFINITIONS } from '../../utils/reports'

function ReportsNav() {
  const groups = [...new Set(REPORT_DEFINITIONS.map((report) => report.group))]

  return (
    <nav className="reports-nav no-print" aria-label="COGS report types">
      {groups.map((group) => (
        <div key={group} className="reports-nav__group">
          <p className="reports-nav__group-title">{group}</p>
          <div className="reports-nav__links">
            {REPORT_DEFINITIONS.filter((report) => report.group === group).map((report) => (
              <NavLink
                key={report.slug}
                to={`/bom/reports/cogs/${report.slug}`}
                className={({ isActive }) =>
                  isActive ? 'reports-nav__link reports-nav__link--active' : 'reports-nav__link'
                }
              >
                {report.title}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      <div className="reports-nav__group">
        <p className="reports-nav__group-title">Legacy</p>
        <div className="reports-nav__links">
          <NavLink
            to="/bom/reports/manufacturing-summary"
            className={({ isActive }) =>
              isActive ? 'reports-nav__link reports-nav__link--active' : 'reports-nav__link'
            }
          >
            Manufacturing Summary
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default ReportsNav
