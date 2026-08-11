<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductLaborRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productLaborId = $this->route('product_labor')->id ?? null;

        return [
            'product_id' => 'required|integer|exists:products,id',
            'role' => [
                'required',
                'string',
                'max:191',
                Rule::unique('product_labor')->where(function ($query) {
                    return $query->where('product_id', $this->input('product_id'));
                })->ignore($productLaborId),
            ],
            'workers' => 'required|numeric|min:0.0001',
            'hours' => 'required|numeric|min:0.0001',
            'hourly_rate' => 'required|numeric|min:0.0001',
        ];
    }
}
