<?php

namespace App\Services\Production;

use App\Models\InventoryBalance;
use App\Models\Product;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Production\Data\ProductionMaterialRequirement;

class ProductionRequirementsService
{
    /**
     * Scale BOM quantities from the product recipe batch size to the requested output.
     */
    public static function scaleBomQuantity(
        float $bomQuantity,
        float $recipeBatchSize,
        float $requestedOutputQuantity,
    ): float {
        if ($recipeBatchSize <= 0) {
            throw new InvalidProductionQuantityException();
        }

        return round($bomQuantity * ($requestedOutputQuantity / $recipeBatchSize), 4);
    }

    /**
     * @return ProductionMaterialRequirement[]
     */
    public function calculate(Product $product, float $productionQuantity): array
    {
        $product->loadMissing(['productMaterials.material', 'productMaterials.unit']);

        $recipeBatchSize = (float) $product->production_quantity;
        if ($recipeBatchSize <= 0) {
            throw new InvalidProductionQuantityException();
        }

        $balances = InventoryBalance::query()
            ->whereIn(
                'material_id',
                $product->productMaterials->pluck('material_id')
            )
            ->get()
            ->keyBy('material_id');

        $requirements = [];

        foreach ($product->productMaterials as $bomLine) {
            $bomQuantity = (float) $bomLine->quantity;
            $requiredQuantity = self::scaleBomQuantity(
                $bomQuantity,
                $recipeBatchSize,
                $productionQuantity,
            );
            $onHand = (float) optional($balances->get($bomLine->material_id))->quantity_on_hand ?? 0;

            $requirements[] = new ProductionMaterialRequirement(
                materialId: $bomLine->material_id,
                materialName: $bomLine->material->name,
                unitId: $bomLine->unit_id,
                unitSymbol: $bomLine->unit->symbol,
                bomQuantityPerUnit: $bomQuantity,
                requiredQuantity: $requiredQuantity,
                quantityOnHand: $onHand,
                isSufficient: $onHand >= $requiredQuantity,
            );
        }

        return $requirements;
    }
}
