<?php

namespace App\Services\Inventory;

use App\Models\InventoryBalance;
use App\Models\InventoryTransaction;
use App\Models\Material;
use App\Models\Product;

class InventoryService
{
    public function getMaterialBalance(int $materialId): float
    {
        return (float) InventoryBalance::query()
            ->where('material_id', $materialId)
            ->value('quantity_on_hand') ?? 0;
    }

    public function receiveMaterial(
        Material $material,
        float $quantity,
        ?float $unitCost = null,
        ?string $notes = null,
    ): InventoryBalance {
        $balance = InventoryBalance::query()->firstOrCreate(
            ['material_id' => $material->id],
            [
                'unit_id' => $material->unit_id,
                'quantity_on_hand' => 0,
            ]
        );

        $balance->quantity_on_hand = round((float) $balance->quantity_on_hand + $quantity, 4);
        $balance->save();

        InventoryTransaction::create([
            'transaction_type' => InventoryTransaction::TYPE_RECEIPT,
            'material_id' => $material->id,
            'unit_id' => $material->unit_id,
            'quantity' => $quantity,
            'unit_cost' => $unitCost ?? $material->cost_per_unit,
            'notes' => $notes,
        ]);

        return $balance;
    }

    public function issueMaterialForProduction(
        Material $material,
        float $quantity,
        float $unitCost,
        string $referenceType,
        int $referenceId,
    ): InventoryBalance {
        $balance = InventoryBalance::query()
            ->where('material_id', $material->id)
            ->lockForUpdate()
            ->first();

        if (! $balance || (float) $balance->quantity_on_hand < $quantity) {
            throw new \RuntimeException("Insufficient inventory for material {$material->id}.");
        }

        $balance->quantity_on_hand = round((float) $balance->quantity_on_hand - $quantity, 4);
        $balance->save();

        InventoryTransaction::create([
            'transaction_type' => InventoryTransaction::TYPE_PRODUCTION_ISSUE,
            'material_id' => $material->id,
            'unit_id' => $material->unit_id,
            'quantity' => -abs($quantity),
            'unit_cost' => $unitCost,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'notes' => 'Material issued for production batch',
        ]);

        return $balance;
    }

    public function receiveProductFromProduction(
        Product $product,
        float $quantity,
        string $referenceType,
        int $referenceId,
    ): InventoryBalance {
        $balance = InventoryBalance::query()->firstOrCreate(
            ['product_id' => $product->id],
            [
                'unit_id' => $product->default_unit_id,
                'quantity_on_hand' => 0,
            ]
        );

        $balance->quantity_on_hand = round((float) $balance->quantity_on_hand + $quantity, 4);
        $balance->save();

        InventoryTransaction::create([
            'transaction_type' => InventoryTransaction::TYPE_PRODUCTION_RECEIPT,
            'product_id' => $product->id,
            'unit_id' => $product->default_unit_id,
            'quantity' => $quantity,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'notes' => 'Finished goods received from production batch',
        ]);

        return $balance;
    }
}
