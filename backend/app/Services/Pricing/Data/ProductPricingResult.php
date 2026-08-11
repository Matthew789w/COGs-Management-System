<?php

namespace App\Services\Pricing\Data;

readonly class ProductPricingResult
{
    public function __construct(
        public int $productId,
        public string $productName,
        public float $productionQuantity,
        public float $cogsPerUnit,
        public float $targetProfitMarginPercent,
        public float $recommendedSellingPrice,
        public float $expectedProfitPerUnit,
        public float $expectedProfitPercentage,
    ) {}
}
