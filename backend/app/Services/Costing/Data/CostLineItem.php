<?php

namespace App\Services\Costing\Data;

readonly class CostLineItem
{
    public function __construct(
        public string $type,
        public int $referenceId,
        public string $name,
        public float $quantity,
        public ?string $unitSymbol,
        public float $unitCost,
        public float $totalCost,
        public ?float $workers = null,
        public ?float $hours = null,
        public ?float $hourlyRate = null,
        public ?string $category = null,
        public ?string $allocationMethod = null,
    ) {}
}
