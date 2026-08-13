<?php

namespace App\Support;

class ThemePreferences
{
    public const DEFAULT_THEME = 'light';

    public const DEFAULT_PRESET = 'indigo';

    public const DEFAULT_ACCENT_STYLE = 'gradient';

    /**
     * @return array<int, string>
     */
    public static function accentStyles(): array
    {
        return ['gradient', 'solid'];
    }

    /**
     * @return array<int, string>
     */
    public static function themes(): array
    {
        return ['light', 'dark'];
    }

    /**
     * @return array<int, string>
     */
    public static function presets(): array
    {
        return [
            'indigo',
            'blue',
            'emerald',
            'rose',
            'amber',
            'violet',
            'cyan',
            'slate',
            'custom',
        ];
    }

    public static function isValidTheme(?string $theme): bool
    {
        return $theme !== null && in_array($theme, self::themes(), true);
    }

    public static function isValidPreset(?string $preset): bool
    {
        return $preset !== null && in_array($preset, self::presets(), true);
    }

    public static function isValidCustomColor(?string $color): bool
    {
        return is_string($color) && preg_match('/^#[0-9a-fA-F]{6}$/', $color) === 1;
    }

    public static function isValidAccentStyle(?string $style): bool
    {
        return $style !== null && in_array($style, self::accentStyles(), true);
    }

    /**
     * @return array{theme_mode: string, accent_preset: string, accent_custom: ?string, accent_style: string}
     */
    public static function defaults(): array
    {
        return [
            'theme_mode' => self::DEFAULT_THEME,
            'accent_preset' => self::DEFAULT_PRESET,
            'accent_custom' => null,
            'accent_style' => self::DEFAULT_ACCENT_STYLE,
        ];
    }
}
