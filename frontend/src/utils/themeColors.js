export const DEFAULT_ACCENT_PRESET = 'indigo'
export const DEFAULT_ACCENT_STYLE = 'gradient'

export const ACCENT_STYLE_OPTIONS = [
  {
    id: 'gradient',
    label: 'Gradient',
    description: 'Multi-tone blends for sidebar, buttons, and page highlights',
  },
  {
    id: 'solid',
    label: 'Solid',
    description: 'Flat accent color without gradients across the app',
  },
]

export const ACCENT_PRESETS = [
  {
    id: 'indigo',
    label: 'Indigo',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
  },
  {
    id: 'blue',
    label: 'Blue',
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#22d3ee',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
  },
  {
    id: 'rose',
    label: 'Rose',
    primary: '#f43f5e',
    secondary: '#ec4899',
    accent: '#fb7185',
  },
  {
    id: 'amber',
    label: 'Amber',
    primary: '#f59e0b',
    secondary: '#f97316',
    accent: '#fbbf24',
  },
  {
    id: 'violet',
    label: 'Violet',
    primary: '#8b5cf6',
    secondary: '#a855f7',
    accent: '#c084fc',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
  },
  {
    id: 'slate',
    label: 'Slate',
    primary: '#64748b',
    secondary: '#475569',
    accent: '#94a3b8',
  },
]

const ACCENT_STORAGE_KEY = 'cogs-accent'
export const THEME_STORAGE_KEY = 'cogs-theme'

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // ignore storage errors
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function saveThemeLocal(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore storage errors
  }
}

export function cacheAppearanceLocally(theme, accent) {
  saveThemeLocal(theme)
  saveAccent(accent)
}

export function normalizeAccentState(accent) {
  const style = accent?.style === 'solid' ? 'solid' : 'gradient'

  if (accent?.presetId === 'custom' && isValidHex(accent?.customPrimary)) {
    return { presetId: 'custom', customPrimary: normalizeHex(accent.customPrimary), style }
  }

  if (ACCENT_PRESETS.some((preset) => preset.id === accent?.presetId)) {
    return { presetId: accent.presetId, customPrimary: null, style }
  }

  return { presetId: DEFAULT_ACCENT_PRESET, customPrimary: null, style: DEFAULT_ACCENT_STYLE }
}

export function preferencesFromServer(preferences) {
  if (!preferences) {
    return null
  }

  const presetId = preferences.accent_preset || DEFAULT_ACCENT_PRESET
  const customPrimary =
    presetId === 'custom' && isValidHex(preferences.accent_custom)
      ? normalizeHex(preferences.accent_custom)
      : null
  const style = preferences.accent_style === 'solid' ? 'solid' : 'gradient'

  return {
    theme: preferences.theme_mode === 'dark' ? 'dark' : 'light',
    accent: normalizeAccentState({
      presetId: customPrimary ? 'custom' : presetId,
      customPrimary,
      style,
    }),
  }
}

export function preferencesToPayload(theme, accent) {
  const normalized = normalizeAccentState(accent)

  return {
    theme_mode: theme === 'dark' ? 'dark' : 'light',
    accent_preset: normalized.presetId,
    accent_custom: normalized.presetId === 'custom' ? normalized.customPrimary : null,
    accent_style: normalized.style,
  }
}

export function getPresetById(presetId) {
  return ACCENT_PRESETS.find((preset) => preset.id === presetId) || ACCENT_PRESETS[0]
}

export function getStoredAccent() {
  try {
    const raw = localStorage.getItem(ACCENT_STORAGE_KEY)
    if (!raw) {
      return normalizeAccentState(null)
    }

    return normalizeAccentState(JSON.parse(raw))
  } catch {
    // ignore storage errors
  }

  return normalizeAccentState(null)
}

export function saveAccent(accent) {
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, JSON.stringify(normalizeAccentState(accent)))
  } catch {
    // ignore storage errors
  }
}

export function isValidHex(value) {
  return /^#([0-9a-fA-F]{6})$/.test(normalizeHex(value))
}

export function normalizeHex(value) {
  if (!value) return ''
  const hex = value.startsWith('#') ? value : `#${value}`
  return hex.length === 7 ? hex.toLowerCase() : ''
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).slice(1)
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`
}

function mixHex(baseHex, targetHex, amount) {
  const base = hexToRgb(baseHex)
  const target = hexToRgb(targetHex)

  return rgbToHex(
    base.r + (target.r - base.r) * amount,
    base.g + (target.g - base.g) * amount,
    base.b + (target.b - base.b) * amount,
  )
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function buildPaletteFromPrimary(primaryHex) {
  const primary = normalizeHex(primaryHex)

  return {
    primary,
    secondary: mixHex(primary, '#8b5cf6', 0.35),
    accent: mixHex(primary, '#06b6d4', 0.45),
  }
}

export function resolveAccentColors(accentState) {
  if (accentState.presetId === 'custom' && accentState.customPrimary) {
    return buildPaletteFromPrimary(accentState.customPrimary)
  }

  const preset = getPresetById(accentState.presetId)

  return {
    primary: preset.primary,
    secondary: preset.secondary,
    accent: preset.accent,
  }
}

export function applyAccentColors(accentState, isDark = false) {
  const accent = normalizeAccentState(accentState)
  const { primary, secondary, accent: accentColor } = resolveAccentColors(accent)
  const isSolid = accent.style === 'solid'
  const root = document.documentElement
  const { r, g, b } = hexToRgb(primary)
  const { r: sr, g: sg, b: sb } = hexToRgb(secondary)
  const hover = mixHex(primary, '#000000', 0.12)
  const softAlpha = isDark ? 0.16 : 0.1
  const glowAlpha = isDark ? 0.35 : 0.25
  const pageGlowAlpha = isDark ? 0.18 : 0.12
  const accentGlowAlpha = isDark ? 0.1 : 0.08
  const rowHoverAlpha = isDark ? 0.08 : 0.04
  const selectionAlpha = isDark ? 0.28 : 0.22
  const sidebarBase = '#0f172a'
  const sidebarTint = mixHex(sidebarBase, primary, isDark ? 0.42 : 0.38)

  root.dataset.accentStyle = isSolid ? 'solid' : 'gradient'

  root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`)
  root.style.setProperty('--secondary-rgb', `${sr}, ${sg}, ${sb}`)
  root.style.setProperty('--primary', primary)
  root.style.setProperty('--primary-hover', hover)
  root.style.setProperty('--primary-blue', primary)
  root.style.setProperty('--primary-blue-hover', hover)
  root.style.setProperty('--primary-blue-soft', rgba(primary, softAlpha))
  root.style.setProperty('--accent', isSolid ? primary : accentColor)
  root.style.setProperty('--accent-soft', rgba(isSolid ? primary : accentColor, isDark ? 0.14 : 0.12))
  root.style.setProperty('--accent-violet', isSolid ? primary : secondary)
  root.style.setProperty('--accent-emerald', mixHex(primary, '#10b981', isSolid ? 0 : 0.25))
  root.style.setProperty('--info', primary)
  root.style.setProperty('--info-soft', rgba(primary, isDark ? 0.18 : 0.12))

  if (isSolid) {
    root.style.setProperty('--gradient-brand', primary)
    root.style.setProperty('--gradient-sidebar', sidebarTint)
    root.style.setProperty('--sidebar-link-active-bg', rgba(primary, isDark ? 0.28 : 0.22))
    root.style.setProperty(
      '--gradient-page',
      'linear-gradient(180deg, var(--bg-main) 0%, var(--bg-main) 100%)',
    )
    root.style.setProperty('--page-title-gradient', isDark ? '#f8fafc' : 'var(--text-primary)')
    root.style.setProperty('--costing-summary-bg', 'var(--bg-muted)')
  } else {
    root.style.setProperty(
      '--gradient-brand',
      `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${accentColor} 100%)`,
    )
    root.style.setProperty(
      '--gradient-sidebar',
      `linear-gradient(180deg, ${sidebarBase} 0%, ${sidebarTint} 55%, ${sidebarBase} 100%)`,
    )
    root.style.setProperty(
      '--sidebar-link-active-bg',
      `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.35) 0%, rgba(${sr}, ${sg}, ${sb}, 0.25) 100%)`,
    )
    root.style.setProperty(
      '--gradient-page',
      `radial-gradient(ellipse 80% 50% at 50% -20%, ${rgba(primary, pageGlowAlpha)}, transparent),
    radial-gradient(ellipse 60% 40% at 100% 0%, ${rgba(accentColor, accentGlowAlpha)}, transparent),
    linear-gradient(180deg, var(--bg-main) 0%, var(--bg-main) 40%, var(--bg-main) 100%)`,
    )
    root.style.setProperty(
      '--page-title-gradient',
      isDark
        ? `linear-gradient(135deg, #f8fafc 0%, ${mixHex(primary, '#ffffff', 0.45)} 100%)`
        : `linear-gradient(135deg, var(--text-primary) 0%, ${mixHex(primary, '#312e81', 0.35)} 100%)`,
    )
    root.style.setProperty(
      '--costing-summary-bg',
      `linear-gradient(145deg, var(--bg-muted) 0%, ${rgba(primary, isDark ? 0.12 : 0.06)} 100%)`,
    )
  }

  root.style.setProperty('--sidebar-shadow', `4px 0 24px ${rgba(primary, isDark ? 0.22 : 0.15)}`)
  root.style.setProperty('--shadow-glow-hover', `0 6px 24px ${rgba(primary, isDark ? 0.38 : 0.35)}`)
  root.style.setProperty('--shadow-glow', `0 4px 20px ${rgba(primary, glowAlpha)}`)
  root.style.setProperty('--table-row-hover', rgba(primary, rowHoverAlpha))
  root.style.setProperty('--selection-bg', rgba(primary, selectionAlpha))
}

export function applyStoredAccentEarly() {
  const accent = getStoredAccent()
  const isDark =
    document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  applyAccentColors(accent, isDark)
}
