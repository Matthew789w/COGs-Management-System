import { NavLink } from 'react-router-dom'
import {
  Bell,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Layers,
  Menu,
  Package,
  Ruler,
  Search,
  Warehouse,
  Zap,
} from 'lucide-react'
import { useSidebar } from '../../hooks/useSidebar'
import BrandLogo from './BrandLogo'

const navItems = [
  { label: 'Dashboard', shortLabel: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', shortLabel: 'Products', path: '/products', icon: Package },
  { label: 'Materials', shortLabel: 'Materials', path: '/materials', icon: Layers },
  { label: 'Manufacturing', shortLabel: 'Mfg', path: '/bom', icon: ClipboardList, matchPrefix: '/bom' },
  { label: 'Production', shortLabel: 'Prod', path: '/production', icon: Factory },
  { label: 'Inventory', shortLabel: 'Inv', path: '/inventory', icon: Warehouse },
  { label: 'Units', shortLabel: 'Units', path: '/units', icon: Ruler },
  { label: 'Utilities', shortLabel: 'Utilities', path: '/utilities', icon: Zap },
]

function AppShell({ children }) {
  const { collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebar()

  const shellClasses = [
    'app-shell',
    collapsed ? 'app-shell--sidebar-collapsed' : '',
    mobileOpen ? 'app-shell--mobile-nav-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClasses}>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar__top">
          <div className="sidebar__brand">
            <div className="sidebar__brand-logo" aria-hidden="true">
              <BrandLogo className="sidebar__brand-logo-icon" />
            </div>
            <div className="sidebar__brand-text">
              <strong>COGs System</strong>
              <span>Manufacturing &amp; Costing</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar__toggle"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__group-title">Navigation</p>
          <div className="sidebar__links">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard' || item.path === '/inventory'}
                className={({ isActive }) =>
                  isActive ? 'sidebar__link active' : 'sidebar__link'
                }
                {...(item.matchPrefix
                  ? {
                      isActive: (_match, location) =>
                        location.pathname.startsWith(item.matchPrefix),
                    }
                  : {})}
                title={collapsed ? item.label : undefined}
                onClick={closeMobile}
              >
                <span className="sidebar__link-icon">
                  <item.icon size={18} aria-hidden="true" />
                </span>
                <span className="sidebar__link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-text">
            COGs master data for product costing, sourcing and planning.
          </p>
          <div className="sidebar__footer-status">
            <span className="sidebar__status-dot" aria-hidden="true" />
            <span>System operational</span>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close navigation"
        onClick={closeMobile}
        tabIndex={mobileOpen ? 0 : -1}
      />

      <div className="main-layout">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="topbar__menu-btn"
              onClick={toggleMobile}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="topbar__search">
              <Search size={16} className="topbar__search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search products, materials, units, utilities..."
                aria-label="Search"
              />
              <kbd className="topbar__search-kbd">Ctrl K</kbd>
            </div>
          </div>

          <div className="topbar__actions">
            <button type="button" className="topbar__icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="topbar__notification-dot" aria-hidden="true" />
            </button>

            <div className="topbar__profile">
              <div className="topbar__profile-info">
                <strong>Plant Manager</strong>
                <span>Administrator</span>
              </div>
              <div className="profile__avatar" aria-hidden="true">
                PM
              </div>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
