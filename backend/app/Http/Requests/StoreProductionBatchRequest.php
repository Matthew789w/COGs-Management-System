<?php

namespace App\Http\Requests;

use App\Models\ProductionBatch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductionBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_number' => 'nullable|string|max:64|unique:production_batches,batch_number',
            'product_id' => 'required|integer|exists:products,id',
            'production_quantity' => 'required|numeric|min:0.0001',
            'production_date' => 'required|date',
            'status' => ['nullable', 'string', Rule::in([ProductionBatch::STATUS_DRAFT])],
            'notes' => 'nullable|string',
        ];
    }
}
