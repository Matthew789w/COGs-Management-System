<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductUtilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'utility_id' => [
                'required',
                'integer',
                'exists:utilities,id',
                Rule::unique('product_utilities')->where(function ($query) {
                    return $query->where('product_id', $this->input('product_id'));
                }),
            ],
            'quantity' => 'required|numeric|min:0.0001',
        ];
    }
}
