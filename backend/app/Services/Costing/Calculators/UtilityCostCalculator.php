<?php

namespace App\Services\Costing\Calculators;

use App\Models\Product;
use App\Services\Costing\Data\CostLineItem;
use App\Services\Costing\Data\CostSection;

class UtilityCostCalculator
{
    public function calculate(Product $product): CostSection
    {
        $items = [];
        $total = 0.0;

        foreach ($product->productUtilities as $productUtility) {
            $utility = $productUtility->utility;
            $rate = (float) $utility->rate;
            $quantity = (float) $productUtility->quantity;
            $lineTotal = round($quantity * $rate, 4);

            $items[] = new CostLineItem(
                type: 'utility',
                referenceId: $utility->id,
                name: $utility->name,
                quantity: $quantity,
                unitSymbol: $utility->unit?->symbol,
                unitCost: $rate,
                totalCost: $lineTotal,
            );

            $total += $lineTotal;
        }

        return new CostSection($items, round($total, 4));
    }
}
