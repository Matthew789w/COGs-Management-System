import { NavLink } from 'react-router-dom'
import { ClipboardList, FileText } from 'lucide-react'

const tabs = [
  { label: 'Configuration', path: '/bom', icon: ClipboardList },
  { label: 'Reports', path: '/bom/reports', icon: FileText },
]

function ManufacturingNav() {
  return (
    <nav className="manufacturing-nav" aria-label="Manufacturing sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/bom'}
          className={({ isActive }) =>
            isActive ? 'manufacturing-nav__link manufacturing-nav__link--active' : 'manufacturing-nav__link'
          }
        >
          <tab.icon size={16} aria-hidden="true" />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default ManufacturingNav
