<?php

namespace App\Services\Costing\Data;

readonly class ProductCostBreakdown
{
    public function __construct(
        public int $productId,
        public string $productName,
        public float $productionQuantity,
        public CostSection $materials,
        public CostSection $utilities,
        public CostSection $labor,
        public CostSection $overhead,
        public float $totalMaterialCost,
        public float $totalUtilityCost,
        public float $totalDirectManufacturingCost,
        public float $totalLaborCost,
        public float $totalOverheadCost,
        public float $totalManufacturingCost,
        public float $cogsPerUnit,
    ) {}
}
