<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productMaterialId = $this->route('product_material')->id ?? null;

        return [
            'product_id' => 'required|integer|exists:products,id',
            'material_id' => [
                'required',
                'integer',
                'exists:materials,id',
                Rule::unique('product_materials')->where(function ($query) {
                    return $query->where('product_id', $this->input('product_id'));
                })->ignore($productMaterialId),
            ],
            'unit_id' => 'required|integer|exists:units_of_measurement,id',
            'quantity' => 'required|numeric|min:0.0001',
            'position' => 'nullable|integer|min:0',
        ];
    }
}
