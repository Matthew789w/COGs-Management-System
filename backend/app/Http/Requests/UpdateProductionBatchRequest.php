<?php

namespace App\Http\Requests;

use App\Models\ProductionBatch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductionBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $batchId = $this->route('production_batch')->id ?? null;

        return [
            'batch_number' => [
                'required',
                'string',
                'max:64',
                Rule::unique('production_batches', 'batch_number')->ignore($batchId),
            ],
            'product_id' => 'required|integer|exists:products,id',
            'production_quantity' => 'required|numeric|min:0.0001',
            'production_date' => 'required|date',
            'notes' => 'nullable|string',
        ];
    }
}
