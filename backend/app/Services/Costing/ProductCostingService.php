<?php

namespace App\Services\Costing;

use App\Models\Product;
use App\Services\Costing\Calculators\LaborCostCalculator;
use App\Services\Costing\Calculators\MaterialCostCalculator;
use App\Services\Costing\Calculators\OverheadCostCalculator;
use App\Services\Costing\Calculators\UtilityCostCalculator;
use App\Services\Costing\Data\ProductCostBreakdown;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;

class ProductCostingService
{
    public function __construct(
        private MaterialCostCalculator $materialCostCalculator,
        private UtilityCostCalculator $utilityCostCalculator,
        private LaborCostCalculator $laborCostCalculator,
        private OverheadCostCalculator $overheadCostCalculator,
    ) {}

    public function calculate(Product $product, ?float $productionQuantity = null): ProductCostBreakdown
    {
        $quantity = $productionQuantity ?? (float) $product->production_quantity;

        if ($quantity <= 0) {
            throw new InvalidProductionQuantityException();
        }

        $product->loadMissing([
            'productMaterials.material.unit',
            'productMaterials.unit',
            'productUtilities.utility.unit',
            'productLabor',
            'productOverhead',
        ]);

        $materials = $this->materialCostCalculator->calculate($product);
        $utilities = $this->utilityCostCalculator->calculate($product);
        $labor = $this->laborCostCalculator->calculate($product);
        $overhead = $this->overheadCostCalculator->calculate($product);

        $totalMaterialCost = $materials->total;
        $totalUtilityCost = $utilities->total;
        $totalLaborCost = $labor->total;
        $totalOverheadCost = $overhead->total;

        $totalDirectManufacturingCost = round($totalMaterialCost + $totalUtilityCost, 4);
        $totalManufacturingCost = round(
            $totalMaterialCost + $totalUtilityCost + $totalLaborCost + $totalOverheadCost,
            4
        );
        $cogsPerUnit = round($totalManufacturingCost / $quantity, 4);

        return new ProductCostBreakdown(
            productId: $product->id,
            productName: $product->name,
            productionQuantity: round($quantity, 4),
            materials: $materials,
            utilities: $utilities,
            labor: $labor,
            overhead: $overhead,
            totalMaterialCost: $totalMaterialCost,
            totalUtilityCost: $totalUtilityCost,
            totalDirectManufacturingCost: $totalDirectManufacturingCost,
            totalLaborCost: $totalLaborCost,
            totalOverheadCost: $totalOverheadCost,
            totalManufacturingCost: $totalManufacturingCost,
            cogsPerUnit: $cogsPerUnit,
        );
    }
}
