<?php

namespace App\Services\Inventory;

use App\Models\InventoryBalance;
use App\Models\InventoryTransaction;
use App\Models\Material;
use App\Models\Product;
use App\Services\Inventory\Exceptions\InsufficientMaterialInventoryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function getMaterialBalance(int $materialId): float
    {
        return (float) InventoryBalance::query()
            ->where('material_id', $materialId)
            ->value('quantity_on_hand') ?? 0;
    }

    public function getProductBalance(int $productId): float
    {
        return (float) InventoryBalance::query()
            ->where('product_id', $productId)
            ->value('quantity_on_hand') ?? 0;
    }

    /**
     * @param  iterable<int, object{material_id: int, required_quantity: float, material?: Material}>  $lines
     * @return array<int, array{material_id: int, material_name: string, required: float, available: float}>
     */
    public function getMaterialShortfalls(iterable $lines, bool $lockForUpdate = false): array
    {
        $lineItems = collect($lines);
        $materialIds = $lineItems->pluck('material_id')->unique()->values();

        if ($materialIds->isEmpty()) {
            return [];
        }

        $query = InventoryBalance::query()->whereIn('material_id', $materialIds);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $balances = $query->get()->keyBy('material_id');
        $shortfalls = [];

        foreach ($lineItems as $line) {
            $required = (float) $line->required_quantity;
            $available = (float) optional($balances->get($line->material_id))->quantity_on_hand ?? 0;

            if ($available < $required) {
                $shortfalls[] = [
                    'material_id' => (int) $line->material_id,
                    'material_name' => $line->material->name ?? "Material #{$line->material_id}",
                    'required' => $required,
                    'available' => $available,
                ];
            }
        }

        return $shortfalls;
    }

    public function receiveMaterial(
        Material $material,
        float $quantity,
        ?float $unitCost = null,
        ?string $notes = null,
    ): InventoryBalance {
        return DB::transaction(function () use ($material, $quantity, $unitCost, $notes) {
            $balance = InventoryBalance::query()
                ->where('material_id', $material->id)
                ->lockForUpdate()
                ->first();

            if (! $balance) {
                $balance = InventoryBalance::create([
                    'material_id' => $material->id,
                    'unit_id' => $material->unit_id,
                    'quantity_on_hand' => 0,
                ]);
            }

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

            return $balance->fresh();
        });
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

        $available = (float) optional($balance)->quantity_on_hand ?? 0;

        if (! $balance || $available < $quantity) {
            throw new InsufficientMaterialInventoryException($material->id, $quantity, $available);
        }

        $balance->quantity_on_hand = round($available - $quantity, 4);
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
        $balance = InventoryBalance::query()
            ->where('product_id', $product->id)
            ->lockForUpdate()
            ->first();

        if (! $balance) {
            $balance = InventoryBalance::create([
                'product_id' => $product->id,
                'unit_id' => $product->default_unit_id,
                'quantity_on_hand' => 0,
            ]);
        }

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

    public function listMaterialBalances(): Collection
    {
        return InventoryBalance::query()
            ->whereNotNull('material_id')
            ->with(['material.unit', 'unit'])
            ->orderBy('material_id')
            ->get();
    }

    public function listProductBalances(): Collection
    {
        return InventoryBalance::query()
            ->whereNotNull('product_id')
            ->with(['product.defaultUnit', 'unit'])
            ->orderBy('product_id')
            ->get();
    }
}
