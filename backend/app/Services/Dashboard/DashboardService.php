<?php

namespace App\Services\Dashboard;

use App\Models\InventoryTransaction;
use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductionBatch;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    public function summary(): array
    {
        $productIdsWithBom = ProductMaterial::query()
            ->distinct()
            ->pluck('product_id');

        return [
            'counts' => [
                'products' => Product::query()->count(),
                'active_products' => Product::query()->where('is_active', true)->count(),
                'materials' => Material::query()->count(),
                'utilities' => Utility::query()->count(),
                'units' => UnitOfMeasurement::query()->count(),
                'production_batches' => ProductionBatch::query()->count(),
                'confirmed_batches' => ProductionBatch::query()
                    ->where('status', ProductionBatch::STATUS_CONFIRMED)
                    ->count(),
                'draft_batches' => ProductionBatch::query()
                    ->where('status', ProductionBatch::STATUS_DRAFT)
                    ->count(),
                'products_with_bom' => $productIdsWithBom->count(),
            ],
            'recent_activity' => $this->recentActivity(),
        ];
    }

    private function recentActivity(): array
    {
        $items = collect()
            ->merge($this->mapRecentProducts())
            ->merge($this->mapRecentMaterials())
            ->merge($this->mapRecentProductionBatches())
            ->merge($this->mapRecentInventoryTransactions())
            ->sortByDesc('occurred_at')
            ->take(8)
            ->values()
            ->map(fn (array $item) => [
                'type' => $item['type'],
                'title' => $item['title'],
                'description' => $item['description'],
                'occurred_at' => $item['occurred_at']->toIso8601String(),
                'link' => $item['link'],
                'badge' => $item['badge'],
            ])
            ->all();

        return $items;
    }

    private function mapRecentProducts(): Collection
    {
        return Product::query()
            ->select(['id', 'name', 'sku', 'is_active', 'updated_at'])
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(fn (Product $product) => [
                'type' => 'product',
                'title' => $product->name,
                'description' => $product->sku ? "SKU {$product->sku}" : 'Product master record',
                'occurred_at' => Carbon::parse($product->updated_at),
                'link' => "/products/{$product->id}",
                'badge' => [
                    'label' => $product->is_active ? 'Active' : 'Inactive',
                    'variant' => $product->is_active ? 'success' : 'warning',
                ],
            ]);
    }

    private function mapRecentMaterials(): Collection
    {
        return Material::query()
            ->select(['id', 'name', 'sku', 'cost_per_unit', 'updated_at'])
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(fn (Material $material) => [
                'type' => 'material',
                'title' => $material->name,
                'description' => 'Material cost updated',
                'occurred_at' => Carbon::parse($material->updated_at),
                'link' => "/materials/{$material->id}",
                'badge' => [
                    'label' => 'Material',
                    'variant' => 'info',
                ],
            ]);
    }

    private function mapRecentProductionBatches(): Collection
    {
        return ProductionBatch::query()
            ->select(['id', 'batch_number', 'product_id', 'status', 'production_date', 'updated_at'])
            ->with('product:id,name')
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(fn (ProductionBatch $batch) => [
                'type' => 'production_batch',
                'title' => $batch->batch_number,
                'description' => $batch->product?->name
                    ? "Production batch for {$batch->product->name}"
                    : 'Production batch updated',
                'occurred_at' => Carbon::parse($batch->updated_at),
                'link' => '/production',
                'badge' => [
                    'label' => ucfirst($batch->status),
                    'variant' => match ($batch->status) {
                        ProductionBatch::STATUS_CONFIRMED => 'success',
                        ProductionBatch::STATUS_DRAFT => 'warning',
                        default => 'default',
                    },
                ],
            ]);
    }

    private function mapRecentInventoryTransactions(): Collection
    {
        return InventoryTransaction::query()
            ->select([
                'id',
                'transaction_type',
                'material_id',
                'product_id',
                'quantity',
                'created_at',
            ])
            ->with([
                'material:id,name',
                'product:id,name',
            ])
            ->latest('created_at')
            ->limit(4)
            ->get()
            ->map(fn (InventoryTransaction $transaction) => [
                'type' => 'inventory',
                'title' => $this->inventoryTransactionTitle($transaction),
                'description' => $this->inventoryTransactionDescription($transaction),
                'occurred_at' => Carbon::parse($transaction->created_at),
                'link' => '/inventory',
                'badge' => [
                    'label' => $this->inventoryTransactionLabel($transaction->transaction_type),
                    'variant' => 'info',
                ],
            ]);
    }

    private function inventoryTransactionTitle(InventoryTransaction $transaction): string
    {
        if ($transaction->material) {
            return $transaction->material->name;
        }

        if ($transaction->product) {
            return $transaction->product->name;
        }

        return 'Inventory movement';
    }

    private function inventoryTransactionDescription(InventoryTransaction $transaction): string
    {
        $quantity = rtrim(rtrim(number_format((float) $transaction->quantity, 4, '.', ''), '0'), '.');

        return match ($transaction->transaction_type) {
            InventoryTransaction::TYPE_RECEIPT => "Received {$quantity} units",
            InventoryTransaction::TYPE_PRODUCTION_ISSUE => "Issued {$quantity} units to production",
            InventoryTransaction::TYPE_PRODUCTION_RECEIPT => "Received {$quantity} finished goods",
            InventoryTransaction::TYPE_ADJUSTMENT => "Adjusted by {$quantity} units",
            default => "Quantity {$quantity}",
        };
    }

    private function inventoryTransactionLabel(string $transactionType): string
    {
        return match ($transactionType) {
            InventoryTransaction::TYPE_RECEIPT => 'Receipt',
            InventoryTransaction::TYPE_PRODUCTION_ISSUE => 'Issue',
            InventoryTransaction::TYPE_PRODUCTION_RECEIPT => 'Finished goods',
            InventoryTransaction::TYPE_ADJUSTMENT => 'Adjustment',
            default => 'Inventory',
        };
    }
}
