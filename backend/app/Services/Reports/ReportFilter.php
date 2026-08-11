<?php

namespace App\Services\Reports;

readonly class ReportFilter
{
    public function __construct(
        public ?int $productId = null,
        public ?int $productionBatchId = null,
        public ?string $dateFrom = null,
        public ?string $dateTo = null,
        public ?string $category = null,
        public ?float $profitMarginPercent = null,
    ) {}

    public function hasDateRange(): bool
    {
        return $this->dateFrom !== null || $this->dateTo !== null;
    }

    public function toArray(): array
    {
        return array_filter([
            'product_id' => $this->productId,
            'production_batch_id' => $this->productionBatchId,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
            'category' => $this->category,
            'profit_margin' => $this->profitMarginPercent,
        ], fn ($value) => $value !== null);
    }
}
