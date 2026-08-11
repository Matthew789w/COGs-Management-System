<?php

namespace App\Http\Resources;

use App\Services\Pricing\Data\ProductPricingResult;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductPricingResult */
class ProductPricingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'product_id' => $this->productId,
            'product_name' => $this->productName,
            'production_quantity' => $this->productionQuantity,
            'cogs_per_unit' => $this->cogsPerUnit,
            'target_profit_margin_percent' => $this->targetProfitMarginPercent,
            'recommended_selling_price' => $this->recommendedSellingPrice,
            'expected_profit_per_unit' => $this->expectedProfitPerUnit,
            'expected_profit_percentage' => $this->expectedProfitPercentage,
        ];
    }
}
