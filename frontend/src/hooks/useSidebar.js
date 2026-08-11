import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'cogs-sidebar-collapsed'

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        return stored === 'true'
      }
      return window.innerWidth <= 1024
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore storage errors
    }
  }, [collapsed])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => !current)
  }, [])

  const toggleMobile = useCallback(() => {
    setMobileOpen((current) => !current)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return {
    collapsed,
    mobileOpen,
    toggleCollapsed,
    toggleMobile,
    closeMobile,
  }
}
