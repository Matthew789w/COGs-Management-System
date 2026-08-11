<?php

namespace App\Services\Costing\Calculators;

use App\Models\Product;
use App\Services\Costing\Data\CostLineItem;
use App\Services\Costing\Data\CostSection;

class LaborCostCalculator
{
    public function calculate(Product $product): CostSection
    {
        $items = [];
        $total = 0.0;

        foreach ($product->productLabor as $productLabor) {
            $workers = (float) $productLabor->workers;
            $hours = (float) $productLabor->hours;
            $hourlyRate = (float) $productLabor->hourly_rate;
            $lineTotal = round($workers * $hours * $hourlyRate, 4);

            $items[] = new CostLineItem(
                type: 'labor',
                referenceId: $productLabor->id,
                name: $productLabor->role,
                quantity: $hours,
                unitSymbol: 'hr',
                unitCost: $hourlyRate,
                totalCost: $lineTotal,
                workers: $workers,
                hours: $hours,
                hourlyRate: $hourlyRate,
            );

            $total += $lineTotal;
        }

        return new CostSection($items, round($total, 4));
    }
}
