<?php

namespace App\Services\User;

use App\Models\User;
use App\Support\ThemePreferences;

class UserPreferenceService
{
    /**
     * @return array{theme_mode: string, accent_preset: string, accent_custom: ?string, accent_style: string}
     */
    public function forUser(User $user): array
    {
        return [
            'theme_mode' => ThemePreferences::isValidTheme($user->theme_mode)
                ? $user->theme_mode
                : ThemePreferences::DEFAULT_THEME,
            'accent_preset' => ThemePreferences::isValidPreset($user->accent_preset)
                ? $user->accent_preset
                : ThemePreferences::DEFAULT_PRESET,
            'accent_custom' => $this->normalizedCustomColor($user),
            'accent_style' => ThemePreferences::isValidAccentStyle($user->accent_style)
                ? $user->accent_style
                : ThemePreferences::DEFAULT_ACCENT_STYLE,
        ];
    }

    /**
     * @param  array{theme_mode: string, accent_preset: string, accent_custom?: ?string, accent_style: string}  $data
     * @return array{theme_mode: string, accent_preset: string, accent_custom: ?string, accent_style: string}
     */
    public function update(User $user, array $data): array
    {
        $accentPreset = $data['accent_preset'];
        $accentCustom = $accentPreset === 'custom'
            ? strtolower((string) ($data['accent_custom'] ?? ''))
            : null;

        $user->fill([
            'theme_mode' => $data['theme_mode'],
            'accent_preset' => $accentPreset,
            'accent_custom' => $accentCustom,
            'accent_style' => ThemePreferences::isValidAccentStyle($data['accent_style'] ?? null)
                ? $data['accent_style']
                : ThemePreferences::DEFAULT_ACCENT_STYLE,
        ]);
        $user->save();

        return $this->forUser($user->fresh());
    }

    /**
     * @return array{theme_mode: string, accent_preset: string, accent_custom: ?string, accent_style: string}
     */
    public function reset(User $user): array
    {
        return $this->update($user, ThemePreferences::defaults());
    }

    private function normalizedCustomColor(User $user): ?string
    {
        if ($user->accent_preset !== 'custom') {
            return null;
        }

        $color = strtolower((string) $user->accent_custom);

        return ThemePreferences::isValidCustomColor($color) ? $color : null;
    }
}
