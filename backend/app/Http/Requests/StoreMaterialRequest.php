<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:64|unique:materials,sku',
            'name' => 'required|string|max:255',
            'unit_id' => 'required|integer|exists:units_of_measurement,id',
            'cost_per_unit' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
