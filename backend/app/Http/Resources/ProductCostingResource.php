<?php

namespace App\Http\Resources;

use App\Services\Costing\Data\CostLineItem;
use App\Services\Costing\Data\CostSection;
use App\Services\Costing\Data\ProductCostBreakdown;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductCostBreakdown */
class ProductCostingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'product_id' => $this->productId,
            'product_name' => $this->productName,
            'production_quantity' => $this->productionQuantity,
            'material_costs' => $this->mapSection($this->materials),
            'utility_costs' => $this->mapSection($this->utilities),
            'labor_costs' => $this->mapSection($this->labor),
            'overhead_costs' => $this->mapSection($this->overhead),
            'total_material_cost' => $this->totalMaterialCost,
            'total_utility_cost' => $this->totalUtilityCost,
            'total_direct_manufacturing_cost' => $this->totalDirectManufacturingCost,
            'total_labor_cost' => $this->totalLaborCost,
            'total_overhead_cost' => $this->totalOverheadCost,
            'total_manufacturing_cost' => $this->totalManufacturingCost,
            'cogs_per_unit' => $this->cogsPerUnit,
        ];
    }

    private function mapSection(CostSection $section): array
    {
        return [
            'items' => array_map(
                fn (CostLineItem $item) => array_filter([
                    'type' => $item->type,
                    'reference_id' => $item->referenceId,
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'unit_symbol' => $item->unitSymbol,
                    'unit_cost' => $item->unitCost,
                    'total_cost' => $item->totalCost,
                    'workers' => $item->workers,
                    'hours' => $item->hours,
                    'hourly_rate' => $item->hourlyRate,
                    'category' => $item->category,
                    'allocation_method' => $item->allocationMethod,
                ], fn ($value) => $value !== null),
                $section->items
            ),
            'total' => $section->total,
        ];
    }
}
