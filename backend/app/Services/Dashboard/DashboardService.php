<?php

namespace App\Services\Dashboard;

use App\Models\InventoryBalance;
use App\Models\InventoryTransaction;
use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductionBatch;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Costing\ProductCostingService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    public function __construct(
        private readonly ProductCostingService $costingService,
    ) {}

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
                'cancelled_batches' => ProductionBatch::query()
                    ->where('status', ProductionBatch::STATUS_CANCELLED)
                    ->count(),
                'products_with_bom' => $productIdsWithBom->count(),
            ],
            'recent_activity' => $this->recentActivity(),
            'analytics' => $this->analytics(),
        ];
    }

    public function analytics(): array
    {
        return [
            'production_trend' => $this->productionTrend(),
            'batch_status' => $this->batchStatusBreakdown(),
            'top_cogs_products' => $this->topCogsProducts(),
            'cost_mix' => $this->aggregateCostMix(),
            'product_margins' => $this->productMargins(),
            'inventory_materials' => $this->topInventoryMaterials(),
        ];
    }

    public function recentActivity(): array
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
                        ProductionBatch::STATUS_CANCELLED => 'error',
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

    private function productionTrend(): array
    {
        $startDate = Carbon::now()->subMonths(5)->startOfMonth();
        $months = collect();

        for ($index = 5; $index >= 0; $index--) {
            $date = Carbon::now()->subMonths($index)->startOfMonth();

            $months->put($date->format('Y-m'), [
                'month' => $date->format('Y-m'),
                'label' => $date->format('M'),
                'batches' => 0,
                'quantity' => 0.0,
            ]);
        }

        ProductionBatch::query()
            ->select(['production_date', 'production_quantity', 'status'])
            ->whereIn('status', ProductionBatch::statuses())
            ->whereDate('production_date', '>=', $startDate)
            ->get()
            ->each(function (ProductionBatch $batch) use ($months): void {
                $key = Carbon::parse($batch->production_date)->format('Y-m');

                if (! $months->has($key)) {
                    return;
                }

                $current = $months->get($key);
                $current['batches']++;
                $current['quantity'] = round($current['quantity'] + (float) $batch->production_quantity, 4);
                $months->put($key, $current);
            });

        return $months->values()->all();
    }

    private function batchStatusBreakdown(): array
    {
        $counts = ProductionBatch::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return collect(ProductionBatch::statuses())
            ->map(fn (string $status) => [
                'status' => $status,
                'label' => ucfirst($status),
                'count' => (int) ($counts[$status] ?? 0),
            ])
            ->filter(fn (array $item) => $item['count'] > 0)
            ->values()
            ->all();
    }

    private function topCogsProducts(): array
    {
        return $this->configuredProductBreakdowns()
            ->filter(fn (array $row) => $row['has_bom'] && $row['cogs_per_unit'] > 0)
            ->sortByDesc('cogs_per_unit')
            ->take(6)
            ->values()
            ->map(fn (array $row) => [
                'product_id' => $row['product_id'],
                'product_name' => $row['product_name'],
                'cogs_per_unit' => $row['cogs_per_unit'],
            ])
            ->all();
    }

    private function aggregateCostMix(): array
    {
        $totals = [
            'materials' => 0.0,
            'utilities' => 0.0,
            'labor' => 0.0,
            'overhead' => 0.0,
        ];

        foreach ($this->configuredProductBreakdowns() as $row) {
            $totals['materials'] += $row['total_material_cost'];
            $totals['utilities'] += $row['total_utility_cost'];
            $totals['labor'] += $row['total_labor_cost'];
            $totals['overhead'] += $row['total_overhead_cost'];
        }

        return collect([
            ['category' => 'materials', 'label' => 'Materials'],
            ['category' => 'utilities', 'label' => 'Utilities'],
            ['category' => 'labor', 'label' => 'Labor'],
            ['category' => 'overhead', 'label' => 'Overhead'],
        ])
            ->map(fn (array $item) => [
                'category' => $item['category'],
                'label' => $item['label'],
                'amount' => round($totals[$item['category']], 4),
            ])
            ->filter(fn (array $item) => $item['amount'] > 0)
            ->values()
            ->all();
    }

    private function productMargins(): array
    {
        return $this->configuredProductBreakdowns()
            ->filter(fn (array $row) => $row['list_price'] > 0 && $row['cogs_per_unit'] > 0 && $row['has_bom'])
            ->map(function (array $row): array {
                $margin = round($row['list_price'] - $row['cogs_per_unit'], 4);
                $marginPercent = round(($margin / $row['list_price']) * 100, 2);
                $marginPercent = max(-100, min(100, $marginPercent));

                return [
                    'product_id' => $row['product_id'],
                    'product_name' => $row['product_name'],
                    'list_price' => $row['list_price'],
                    'cogs_per_unit' => $row['cogs_per_unit'],
                    'margin_per_unit' => $margin,
                    'margin_percent' => $marginPercent,
                ];
            })
            ->sortByDesc('margin_percent')
            ->take(6)
            ->values()
            ->all();
    }

    private function topInventoryMaterials(): array
    {
        return InventoryBalance::query()
            ->select(['material_id', 'quantity_on_hand', 'unit_id'])
            ->whereNotNull('material_id')
            ->where('quantity_on_hand', '>', 0)
            ->with([
                'material:id,name',
                'unit:id,symbol',
            ])
            ->orderByDesc('quantity_on_hand')
            ->limit(6)
            ->get()
            ->map(fn (InventoryBalance $balance) => [
                'material_id' => $balance->material_id,
                'material_name' => $balance->material?->name ?? 'Material',
                'quantity' => (float) $balance->quantity_on_hand,
                'unit' => $balance->unit?->symbol,
            ])
            ->all();
    }

    private function configuredProductBreakdowns(): Collection
    {
        $productIdsWithBom = ProductMaterial::query()
            ->distinct()
            ->pluck('product_id')
            ->flip();

        return Product::query()
            ->select(['id', 'name', 'sku', 'list_price', 'production_quantity', 'is_active'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function (Product $product) use ($productIdsWithBom): ?array {
                try {
                    $breakdown = $this->costingService->calculate($product);
                } catch (InvalidProductionQuantityException) {
                    return null;
                }

                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'list_price' => (float) $product->list_price,
                    'cogs_per_unit' => $breakdown->cogsPerUnit,
                    'total_material_cost' => $breakdown->totalMaterialCost,
                    'total_utility_cost' => $breakdown->totalUtilityCost,
                    'total_labor_cost' => $breakdown->totalLaborCost,
                    'total_overhead_cost' => $breakdown->totalOverheadCost,
                    'has_bom' => $productIdsWithBom->has($product->id),
                ];
            })
            ->filter()
            ->values();
    }
}
