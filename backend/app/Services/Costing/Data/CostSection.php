<?php

namespace App\Services\Costing\Data;

readonly class CostSection
{
    /**
     * @param  CostLineItem[]  $items
     */
    public function __construct(
        public array $items,
        public float $total,
    ) {}
}
