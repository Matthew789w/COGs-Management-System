<?php

namespace App\Services\Costing\Allocators;

use App\Models\Product;
use App\Models\ProductOverhead;

class OverheadBatchAllocator
{
    public function supports(string $allocationMethod): bool
    {
        return $allocationMethod === ProductOverhead::ALLOCATION_FIXED_BATCH;
    }

    public function allocate(ProductOverhead $overhead, Product $product): float
    {
        return round((float) $overhead->amount, 4);
    }
}
