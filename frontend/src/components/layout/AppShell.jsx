import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bell,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Layers,
  Menu,
  Moon,
  Package,
  Ruler,
  Search,
  Sun,
  Users,
  Warehouse,
  Zap,
} from 'lucide-react'
import { useSidebar } from '../../hooks/useSidebar'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationsContext'
import { useUser } from '../../context/UserContext'
import { useAdministratorAccess } from '../../utils/users'
import BrandLogo from './BrandLogo'
import NotificationsPanel from './NotificationsPanel'
import ProfileMenu from './ProfileMenu'
import UserAvatar from '../ui/UserAvatar'

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
  const { isDark, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const { profile } = useUser()
  const { isAdmin } = useAdministratorAccess()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const navItemsWithUsers = isAdmin
    ? [
        ...navItems,
        { label: 'Users', shortLabel: 'Users', path: '/users', icon: Users },
      ]
    : navItems

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
            {navItemsWithUsers.map((item) => (
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
            <button
              type="button"
              className="topbar__icon-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="topbar__notifications">
              <button
                type="button"
                className="topbar__icon-btn"
                onClick={() => {
                  setProfileMenuOpen(false)
                  setNotificationsOpen((current) => !current)
                }}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-haspopup="true"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="topbar__notification-badge" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationsPanel
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            <div className="topbar__profile-menu">
              <button
                type="button"
                className="topbar__profile"
                onClick={() => {
                  setNotificationsOpen(false)
                  setProfileMenuOpen((current) => !current)
                }}
                aria-label="Account menu"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                <div className="topbar__profile-info">
                  <strong>{profile?.name || 'Plant Manager'}</strong>
                  <span>{profile?.role || 'Administrator'}</span>
                </div>
                <UserAvatar profile={profile} size="sm" />
              </button>

              <ProfileMenu
                open={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}
                profile={profile}
              />
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
