<?php

namespace App\Http\Requests;

use App\Services\Pricing\ProductPricingService;
use App\Services\Reports\ReportFilter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'production_batch_id' => ['nullable', 'integer', 'exists:production_batches,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'category' => ['nullable', 'string', Rule::in([
                'depreciation',
                'rent',
                'maintenance',
                'utilities_overhead',
                'insurance',
                'other',
            ])],
            'profit_margin' => ['nullable', 'numeric', 'min:'.ProductPricingService::MIN_PROFIT_MARGIN_PERCENT, 'max:'.ProductPricingService::MAX_PROFIT_MARGIN_PERCENT],
        ];
    }

    public function toFilter(): ReportFilter
    {
        $validated = $this->validated();

        return new ReportFilter(
            productId: isset($validated['product_id']) ? (int) $validated['product_id'] : null,
            productionBatchId: isset($validated['production_batch_id']) ? (int) $validated['production_batch_id'] : null,
            dateFrom: $validated['date_from'] ?? null,
            dateTo: $validated['date_to'] ?? null,
            category: $validated['category'] ?? null,
            profitMarginPercent: isset($validated['profit_margin']) ? (float) $validated['profit_margin'] : null,
        );
    }
}
