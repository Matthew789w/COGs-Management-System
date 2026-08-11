<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUtilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $utilityId = $this->route('utility')->id ?? null;

        return [
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('utilities', 'code')->ignore($utilityId),
            ],
            'name' => 'required|string|max:255',
            'unit_id' => 'required|integer|exists:units_of_measurement,id',
            'rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
