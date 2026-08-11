<?php

namespace App\Services\Costing\Calculators;

use App\Models\Product;
use App\Models\ProductOverhead;
use App\Services\Costing\Allocators\OverheadBatchAllocator;
use App\Services\Costing\Data\CostLineItem;
use App\Services\Costing\Data\CostSection;

class OverheadCostCalculator
{
    public function __construct(
        private OverheadBatchAllocator $batchAllocator,
    ) {}

    public function calculate(Product $product): CostSection
    {
        $items = [];
        $total = 0.0;

        foreach ($product->productOverhead as $productOverhead) {
            $lineTotal = $this->resolveAllocation($productOverhead, $product);

            $items[] = new CostLineItem(
                type: 'overhead',
                referenceId: $productOverhead->id,
                name: $productOverhead->name,
                quantity: 1,
                unitSymbol: 'batch',
                unitCost: $lineTotal,
                totalCost: $lineTotal,
                category: $productOverhead->category,
                allocationMethod: $productOverhead->allocation_method,
            );

            $total += $lineTotal;
        }

        return new CostSection($items, round($total, 4));
    }

    private function resolveAllocation(ProductOverhead $overhead, Product $product): float
    {
        if ($this->batchAllocator->supports($overhead->allocation_method)) {
            return $this->batchAllocator->allocate($overhead, $product);
        }

        return 0.0;
    }
}
