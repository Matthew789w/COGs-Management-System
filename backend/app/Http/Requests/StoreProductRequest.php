<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:64|unique:products,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'default_unit_id' => 'required|integer|exists:units_of_measurement,id',
            'list_price' => 'required|numeric|min:0',
            'production_quantity' => 'nullable|numeric|min:0.0001',
            'is_active' => 'boolean',
        ];
    }
}
