import { NavLink, useLocation } from 'react-router-dom'
import { ClipboardList, FileText } from 'lucide-react'

const tabs = [
  { label: 'Configuration', path: '/bom', icon: ClipboardList, exact: true },
  { label: 'Reports', path: '/bom/reports', icon: FileText, exact: false },
]

function ManufacturingNav() {
  const location = useLocation()

  return (
    <nav className="manufacturing-nav" aria-label="Manufacturing sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.exact}
          className={() => {
            const isActive = tab.exact
              ? location.pathname === tab.path
              : location.pathname.startsWith(tab.path)

            return isActive
              ? 'manufacturing-nav__link manufacturing-nav__link--active'
              : 'manufacturing-nav__link'
          }}
        >
          <tab.icon size={16} aria-hidden="true" />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default ManufacturingNav
