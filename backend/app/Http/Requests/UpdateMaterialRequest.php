<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $materialId = $this->route('material')->id ?? null;

        return [
            'sku' => [
                'required',
                'string',
                'max:64',
                Rule::unique('materials', 'sku')->ignore($materialId),
            ],
            'name' => 'required|string|max:255',
            'unit_id' => 'required|integer|exists:units_of_measurement,id',
            'cost_per_unit' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
