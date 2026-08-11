<?php

namespace App\Services\Costing\Calculators;

use App\Models\Product;
use App\Services\Costing\Data\CostLineItem;
use App\Services\Costing\Data\CostSection;

class MaterialCostCalculator
{
    public function calculate(Product $product): CostSection
    {
        $items = [];
        $total = 0.0;

        foreach ($product->productMaterials as $productMaterial) {
            $material = $productMaterial->material;
            $unitCost = (float) $material->cost_per_unit;
            $quantity = (float) $productMaterial->quantity;
            $lineTotal = round($quantity * $unitCost, 4);

            $items[] = new CostLineItem(
                type: 'material',
                referenceId: $material->id,
                name: $material->name,
                quantity: $quantity,
                unitSymbol: $productMaterial->unit?->symbol ?? $material->unit?->symbol,
                unitCost: $unitCost,
                totalCost: $lineTotal,
            );

            $total += $lineTotal;
        }

        return new CostSection($items, round($total, 4));
    }
}
