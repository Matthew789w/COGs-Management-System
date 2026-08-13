<?php

namespace App\Http\Requests;

use App\Support\ThemePreferences;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'theme_mode' => ['required', 'string', Rule::in(ThemePreferences::themes())],
            'accent_preset' => ['required', 'string', Rule::in(ThemePreferences::presets())],
            'accent_custom' => [
                'nullable',
                'string',
                'regex:/^#[0-9a-fA-F]{6}$/',
                Rule::requiredIf(fn () => $this->input('accent_preset') === 'custom'),
            ],
            'accent_style' => ['required', 'string', Rule::in(ThemePreferences::accentStyles())],
        ];
    }
}
