<?php

namespace App\Services\Pricing;

use App\Models\Product;
use App\Services\Costing\ProductCostingService;
use App\Services\Pricing\Data\ProductPricingResult;
use App\Services\Pricing\Exceptions\InvalidProfitMarginException;

class ProductPricingService
{
    public const MIN_PROFIT_MARGIN_PERCENT = 0.01;

    public const MAX_PROFIT_MARGIN_PERCENT = 99.99;

    public function __construct(
        private ProductCostingService $costingService,
    ) {}

    public function calculate(
        Product $product,
        float $profitMarginPercent,
        ?float $productionQuantity = null,
    ): ProductPricingResult {
        $this->assertValidProfitMargin($profitMarginPercent);

        $costBreakdown = $this->costingService->calculate($product, $productionQuantity);
        $cogsPerUnit = $costBreakdown->cogsPerUnit;
        $marginDecimal = $profitMarginPercent / 100;
        $divisor = 1 - $marginDecimal;

        if ($divisor <= 0) {
            throw new InvalidProfitMarginException();
        }

        $recommendedSellingPrice = round($cogsPerUnit / $divisor, 4);
        $expectedProfitPerUnit = round($recommendedSellingPrice - $cogsPerUnit, 4);
        $expectedProfitPercentage = $recommendedSellingPrice > 0
            ? round(($expectedProfitPerUnit / $recommendedSellingPrice) * 100, 4)
            : 0.0;

        return new ProductPricingResult(
            productId: $product->id,
            productName: $product->name,
            productionQuantity: $costBreakdown->productionQuantity,
            cogsPerUnit: $cogsPerUnit,
            targetProfitMarginPercent: round($profitMarginPercent, 4),
            recommendedSellingPrice: $recommendedSellingPrice,
            expectedProfitPerUnit: $expectedProfitPerUnit,
            expectedProfitPercentage: $expectedProfitPercentage,
        );
    }

    public function assertValidProfitMargin(float $profitMarginPercent): void
    {
        if ($profitMarginPercent < self::MIN_PROFIT_MARGIN_PERCENT) {
            throw new InvalidProfitMarginException(
                sprintf(
                    'Profit margin must be at least %.2f%%.',
                    self::MIN_PROFIT_MARGIN_PERCENT
                )
            );
        }

        if ($profitMarginPercent >= self::MAX_PROFIT_MARGIN_PERCENT) {
            throw new InvalidProfitMarginException(
                sprintf(
                    'Profit margin must be less than %.2f%% to avoid division by zero.',
                    self::MAX_PROFIT_MARGIN_PERCENT
                )
            );
        }
    }
}
