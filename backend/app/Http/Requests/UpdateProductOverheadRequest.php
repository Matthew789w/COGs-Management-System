<?php

namespace App\Http\Requests;

use App\Models\ProductOverhead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductOverheadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productOverheadId = $this->route('product_overhead')->id ?? null;

        return [
            'product_id' => 'required|integer|exists:products,id',
            'name' => [
                'required',
                'string',
                'max:191',
                Rule::unique('product_overhead')->where(function ($query) {
                    return $query->where('product_id', $this->input('product_id'));
                })->ignore($productOverheadId),
            ],
            'category' => ['required', 'string', Rule::in(ProductOverhead::categories())],
            'allocation_method' => ['nullable', 'string', Rule::in(ProductOverhead::allocationMethods())],
            'amount' => 'required|numeric|min:0.0001',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('allocation_method')) {
            $this->merge([
                'allocation_method' => ProductOverhead::ALLOCATION_FIXED_BATCH,
            ]);
        }
    }
}
