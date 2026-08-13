import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Layers, Moon, Palette, RotateCcw, Square, Sun } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { useTheme } from '../context/ThemeContext'
import {
  ACCENT_PRESETS,
  ACCENT_STYLE_OPTIONS,
  buildPaletteFromPrimary,
  isValidHex,
  normalizeHex,
  resolveAccentColors,
} from '../utils/themeColors'

function SettingsPage() {
  const {
    theme,
    accent,
    syncing,
    setTheme,
    setAccentPreset,
    setCustomAccent,
    setAccentStyle,
    resetAppearance,
  } = useTheme()

  const activePalette = resolveAccentColors(accent)
  const isSolidStyle = accent.style === 'solid'

  const syncedCustomColor = useMemo(() => {
    if (accent.presetId === 'custom' && accent.customPrimary) {
      return accent.customPrimary
    }

    return activePalette.primary
  }, [accent.customPrimary, accent.presetId, activePalette.primary])

  const [customColorDraft, setCustomColorDraft] = useState(syncedCustomColor)

  useEffect(() => {
    setCustomColorDraft(syncedCustomColor)
  }, [syncedCustomColor])

  const pickerColor = isValidHex(normalizeHex(customColorDraft))
    ? normalizeHex(customColorDraft)
    : syncedCustomColor

  const handleCustomColorChange = (value) => {
    setCustomColorDraft(value)

    const normalized = normalizeHex(value)
    if (isValidHex(normalized)) {
      setCustomAccent(normalized)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Personalize how the app looks with theme mode and accent colors."
      />

      <div className="settings-layout">
        <Card>
          <PanelHeader title="Theme mode" />
          <p className="form-section__description">
            Switch between light and dark appearance. Your choice is saved to your account.
          </p>

          <div className="settings-theme-options">
            <button
              type="button"
              className={`settings-theme-option ${theme === 'light' ? 'settings-theme-option--selected' : ''}`.trim()}
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
            >
              <span className="settings-theme-option__icon">
                <Sun size={18} aria-hidden="true" />
              </span>
              <strong>Light mode</strong>
              <span>Bright backgrounds for daytime use</span>
            </button>

            <button
              type="button"
              className={`settings-theme-option ${theme === 'dark' ? 'settings-theme-option--selected' : ''}`.trim()}
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
            >
              <span className="settings-theme-option__icon">
                <Moon size={18} aria-hidden="true" />
              </span>
              <strong>Dark mode</strong>
              <span>Reduced glare for low-light environments</span>
            </button>
          </div>
        </Card>

        <Card>
          <PanelHeader title="Website color" />
          <p className="form-section__description">
            Choose an accent color for the sidebar tint, buttons, links, and highlights across the
            app.
          </p>

          <div className="settings-accent-style">
            <p className="settings-accent-style__label">Color style</p>
            <div className="settings-theme-options">
              {ACCENT_STYLE_OPTIONS.map((option) => {
                const selected = accent.style === option.id
                const Icon = option.id === 'solid' ? Square : Layers

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`settings-theme-option ${selected ? 'settings-theme-option--selected' : ''}`.trim()}
                    onClick={() => setAccentStyle(option.id)}
                    aria-pressed={selected}
                  >
                    <span className="settings-theme-option__icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="settings-color-preview" aria-hidden="true">
            <span
              className="settings-color-preview__swatch"
              style={{ background: activePalette.primary }}
            />
            {!isSolidStyle && (
              <>
                <span
                  className="settings-color-preview__swatch"
                  style={{ background: activePalette.secondary }}
                />
                <span
                  className="settings-color-preview__swatch"
                  style={{ background: activePalette.accent }}
                />
              </>
            )}
            <span
              className="settings-color-preview__bar"
              style={{
                background: isSolidStyle
                  ? activePalette.primary
                  : `linear-gradient(135deg, ${activePalette.primary}, ${activePalette.secondary}, ${activePalette.accent})`,
              }}
            />
          </div>

          <div className="settings-color-presets">
            {ACCENT_PRESETS.map((preset) => {
              const selected = accent.presetId === preset.id

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`settings-color-preset ${selected ? 'settings-color-preset--selected' : ''}`.trim()}
                  onClick={() => setAccentPreset(preset.id)}
                  aria-pressed={selected}
                  aria-label={`${preset.label} color theme`}
                  title={preset.label}
                >
                  <span
                    className="settings-color-preset__dot"
                    style={{
                      background: isSolidStyle
                        ? preset.primary
                        : `linear-gradient(135deg, ${preset.primary}, ${preset.accent})`,
                    }}
                  />
                  <span>{preset.label}</span>
                </button>
              )
            })}
          </div>

          <div className="settings-custom-color">
            <div className="settings-custom-color__header">
              <Palette size={16} aria-hidden="true" />
              <span>Custom color</span>
            </div>
            <p className="settings-custom-color__hint">
              {isSolidStyle
                ? 'Pick a flat accent color used consistently across the interface.'
                : 'Pick any color you like. Supporting shades are generated automatically.'}
            </p>

            <div className="settings-custom-color__controls">
              <label className="settings-custom-color__picker" htmlFor="custom-accent-color">
                <input
                  id="custom-accent-color"
                  type="color"
                  value={pickerColor}
                  onChange={(event) => handleCustomColorChange(event.target.value)}
                />
                <span>Color picker</span>
              </label>

              <div className="form-field settings-custom-color__hex">
                <label htmlFor="custom-accent-hex">Hex code</label>
                <input
                  id="custom-accent-hex"
                  type="text"
                  value={customColorDraft}
                  placeholder="#6366f1"
                  onChange={(event) => handleCustomColorChange(event.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            {accent.presetId === 'custom' && isValidHex(normalizeHex(customColorDraft)) && (
              <p className="settings-custom-color__preview">
                Preview palette:{' '}
                <span style={{ color: buildPaletteFromPrimary(pickerColor).primary }}>
                  {pickerColor}
                </span>
              </p>
            )}
          </div>

          <div className="form-actions">
            <Button type="button" variant="ghost" icon={RotateCcw} onClick={resetAppearance}>
              Reset appearance
            </Button>
          </div>
        </Card>

        <Card className="settings-layout__hint-card">
          <PanelHeader title="Your preferences" />
          <p className="form-section__description">
            Appearance settings are saved to your user account and follow you across browsers and
            devices when you sign in.{syncing ? ' Saving changes…' : ''}
          </p>
          <Link to="/profile" className="settings-layout__profile-link">
            Back to profile settings
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
