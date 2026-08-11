<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')->id ?? null;

        return [
            'sku' => [
                'required',
                'string',
                'max:64',
                Rule::unique('products', 'sku')->ignore($productId),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'default_unit_id' => 'required|integer|exists:units_of_measurement,id',
            'list_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
