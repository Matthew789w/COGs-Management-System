import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from '../lib/api'
import { useAuth } from './AuthContext'
import {
  DEFAULT_ACCENT_PRESET,
  DEFAULT_ACCENT_STYLE,
  applyAccentColors,
  cacheAppearanceLocally,
  getStoredAccent,
  getStoredTheme,
  isValidHex,
  normalizeAccentState,
  normalizeHex,
  preferencesFromServer,
  preferencesToPayload,
} from '../utils/themeColors'

const CUSTOM_ACCENT_PERSIST_DELAY_MS = 400

const ThemeContext = createContext(null)

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const { isAuthenticated, preferences, setPreferences } = useAuth()
  const [theme, setThemeState] = useState(getStoredTheme)
  const [accent, setAccentState] = useState(() => normalizeAccentState(getStoredAccent()))
  const [syncing, setSyncing] = useState(false)
  const hydratingRef = useRef(false)
  const appearanceRef = useRef({ theme, accent })
  const persistSeqRef = useRef(0)
  const customAccentPersistTimerRef = useRef(null)

  appearanceRef.current = { theme, accent }

  const cancelPendingAccentPersist = useCallback(() => {
    if (customAccentPersistTimerRef.current) {
      clearTimeout(customAccentPersistTimerRef.current)
      customAccentPersistTimerRef.current = null
    }
  }, [])

  useEffect(() => () => cancelPendingAccentPersist(), [cancelPendingAccentPersist])

  const applyAppearance = useCallback((nextTheme, nextAccent) => {
    applyTheme(nextTheme)
    applyAccentColors(nextAccent, nextTheme === 'dark')
    cacheAppearanceLocally(nextTheme, nextAccent)
  }, [])

  useEffect(() => {
    applyAppearance(theme, accent)
  }, [theme, accent, applyAppearance])

  useEffect(() => {
    if (!isAuthenticated || !preferences) {
      return
    }

    const appearance = preferencesFromServer(preferences)
    if (!appearance) {
      return
    }

    const current = appearanceRef.current
    const currentPayload = preferencesToPayload(current.theme, current.accent)
    const serverPayload = preferencesToPayload(appearance.theme, appearance.accent)

    if (
      currentPayload.theme_mode === serverPayload.theme_mode &&
      currentPayload.accent_preset === serverPayload.accent_preset &&
      currentPayload.accent_custom === serverPayload.accent_custom &&
      currentPayload.accent_style === serverPayload.accent_style
    ) {
      return
    }

    hydratingRef.current = true
    setThemeState(appearance.theme)
    setAccentState(appearance.accent)
    applyAppearance(appearance.theme, appearance.accent)
    hydratingRef.current = false
  }, [isAuthenticated, preferences, applyAppearance])

  const persistPreferences = useCallback(
    async (nextTheme, nextAccent) => {
      if (!isAuthenticated || hydratingRef.current) {
        return
      }

      const seq = ++persistSeqRef.current
      const payload = preferencesToPayload(nextTheme, nextAccent)
      setSyncing(true)

      try {
        const response = await axios.put('/api/user/preferences', payload)
        if (seq !== persistSeqRef.current) {
          return
        }

        setPreferences(response.data.data || payload)
      } catch {
        // keep local appearance even if sync fails
      } finally {
        if (seq === persistSeqRef.current) {
          setSyncing(false)
        }
      }
    },
    [isAuthenticated, setPreferences],
  )

  const setTheme = useCallback(
    (nextTheme) => {
      const value = nextTheme === 'dark' ? 'dark' : 'light'
      setThemeState(value)
      persistPreferences(value, appearanceRef.current.accent)
    },
    [persistPreferences],
  )

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const value = current === 'dark' ? 'light' : 'dark'
      persistPreferences(value, appearanceRef.current.accent)
      return value
    })
  }, [persistPreferences])

  const setAccentPreset = useCallback(
    (presetId) => {
      cancelPendingAccentPersist()
      const nextAccent = normalizeAccentState({
        ...appearanceRef.current.accent,
        presetId,
        customPrimary: null,
      })
      setAccentState(nextAccent)
      persistPreferences(appearanceRef.current.theme, nextAccent)
    },
    [cancelPendingAccentPersist, persistPreferences],
  )

  const setCustomAccent = useCallback(
    (customPrimary) => {
      const normalized = normalizeHex(customPrimary)
      if (!isValidHex(normalized)) {
        return
      }

      const nextAccent = normalizeAccentState({
        ...appearanceRef.current.accent,
        presetId: 'custom',
        customPrimary: normalized,
      })
      setAccentState(nextAccent)

      cancelPendingAccentPersist()
      customAccentPersistTimerRef.current = setTimeout(() => {
        customAccentPersistTimerRef.current = null
        persistPreferences(appearanceRef.current.theme, nextAccent)
      }, CUSTOM_ACCENT_PERSIST_DELAY_MS)
    },
    [cancelPendingAccentPersist, persistPreferences],
  )

  const setAccentStyle = useCallback(
    (style) => {
      const nextAccent = normalizeAccentState({
        ...appearanceRef.current.accent,
        style: style === 'solid' ? 'solid' : 'gradient',
      })
      setAccentState(nextAccent)
      persistPreferences(appearanceRef.current.theme, nextAccent)
    },
    [persistPreferences],
  )

  const resetAppearance = useCallback(async () => {
    cancelPendingAccentPersist()
    if (isAuthenticated) {
      setSyncing(true)

      try {
        const response = await axios.post('/api/user/preferences/reset')
        const appearance = preferencesFromServer(response.data.data)

        if (appearance) {
          hydratingRef.current = true
          setThemeState(appearance.theme)
          setAccentState(appearance.accent)
          setPreferences(response.data.data)
          applyAppearance(appearance.theme, appearance.accent)
          hydratingRef.current = false
          return
        }
      } catch {
        // fall through to local defaults
      } finally {
        setSyncing(false)
      }
    }

    const nextTheme = 'light'
    const nextAccent = normalizeAccentState({
      presetId: DEFAULT_ACCENT_PRESET,
      customPrimary: null,
      style: DEFAULT_ACCENT_STYLE,
    })
    setThemeState(nextTheme)
    setAccentState(nextAccent)
    persistPreferences(nextTheme, nextAccent)
  }, [applyAppearance, cancelPendingAccentPersist, isAuthenticated, persistPreferences, setPreferences])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      accent,
      accentStyle: accent.style,
      syncing,
      setTheme,
      toggleTheme,
      setAccentPreset,
      setCustomAccent,
      setAccentStyle,
      resetAppearance,
    }),
    [theme, accent, syncing, setTheme, toggleTheme, setAccentPreset, setCustomAccent, setAccentStyle, resetAppearance],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
