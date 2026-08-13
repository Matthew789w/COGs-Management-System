<?php

namespace App\Services\Notifications;

use App\Models\InventoryBalance;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductionBatch;
use App\Services\Dashboard\DashboardService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class NotificationService
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {
    }

    public function list(): array
    {
        $notifications = collect()
            ->merge($this->draftBatchAlerts())
            ->merge($this->productsWithoutBomAlerts())
            ->merge($this->lowStockAlerts())
            ->merge($this->activityNotifications())
            ->sortBy([
                fn (array $notification) => $notification['category'] === 'alert' ? 0 : 1,
                fn (array $notification) => match ($notification['priority']) {
                    'high' => 0,
                    'normal' => 1,
                    default => 2,
                },
                fn (array $notification) => -Carbon::parse($notification['occurred_at'])->timestamp,
            ])
            ->take(25)
            ->values()
            ->map(fn (array $notification) => [
                'id' => $notification['id'],
                'type' => $notification['type'],
                'category' => $notification['category'],
                'priority' => $notification['priority'],
                'title' => $notification['title'],
                'description' => $notification['description'],
                'occurred_at' => $notification['occurred_at']->toIso8601String(),
                'link' => $notification['link'],
                'badge' => $notification['badge'],
            ])
            ->all();

        return [
            'notifications' => $notifications,
            'summary' => [
                'total' => count($notifications),
                'alerts' => collect($notifications)->where('category', 'alert')->count(),
                'activity' => collect($notifications)->where('category', 'activity')->count(),
            ],
        ];
    }

    private function draftBatchAlerts(): Collection
    {
        return ProductionBatch::query()
            ->select(['id', 'batch_number', 'product_id', 'status', 'updated_at'])
            ->where('status', ProductionBatch::STATUS_DRAFT)
            ->with('product:id,name')
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (ProductionBatch $batch) => $this->notification(
                id: "draft-batch-{$batch->id}",
                type: 'production_batch',
                category: 'alert',
                priority: 'high',
                title: "{$batch->batch_number} awaiting confirmation",
                description: $batch->product
                    ? "Draft production batch for {$batch->product->name}"
                    : 'Draft production batch needs review',
                occurredAt: Carbon::parse($batch->updated_at),
                link: '/production',
                badgeLabel: 'Draft',
                badgeVariant: 'warning',
            ));
    }

    private function productsWithoutBomAlerts(): Collection
    {
        $productIdsWithBom = ProductMaterial::query()
            ->distinct()
            ->pluck('product_id');

        return Product::query()
            ->select(['id', 'name', 'sku', 'updated_at'])
            ->where('is_active', true)
            ->when(
                $productIdsWithBom->isNotEmpty(),
                fn ($query) => $query->whereNotIn('id', $productIdsWithBom),
            )
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (Product $product) => $this->notification(
                id: "missing-bom-{$product->id}",
                type: 'product',
                category: 'alert',
                priority: 'high',
                title: "{$product->name} has no BOM",
                description: $product->sku
                    ? "Active product SKU {$product->sku} needs bill of materials"
                    : 'Active product needs bill of materials configured',
                occurredAt: Carbon::parse($product->updated_at),
                link: '/bom',
                badgeLabel: 'Missing BOM',
                badgeVariant: 'warning',
            ));
    }

    private function lowStockAlerts(): Collection
    {
        return InventoryBalance::query()
            ->select(['id', 'material_id', 'quantity_on_hand', 'updated_at'])
            ->whereNotNull('material_id')
            ->where('quantity_on_hand', '<=', 0)
            ->with('material:id,name')
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(function (InventoryBalance $balance) {
                $materialName = $balance->material?->name ?? 'Material';

                return $this->notification(
                    id: "low-stock-{$balance->material_id}",
                    type: 'inventory',
                    category: 'alert',
                    priority: 'high',
                    title: "{$materialName} is out of stock",
                    description: 'Material inventory is at zero — receive stock or adjust balances',
                    occurredAt: Carbon::parse($balance->updated_at ?? now()),
                    link: '/inventory',
                    badgeLabel: 'Out of stock',
                    badgeVariant: 'error',
                );
            });
    }

    private function activityNotifications(): Collection
    {
        return collect($this->dashboardService->recentActivity())
            ->take(10)
            ->map(fn (array $item) => $this->notification(
                id: 'activity-' . md5($item['type'] . $item['title'] . $item['occurred_at']),
                type: $item['type'],
                category: 'activity',
                priority: 'normal',
                title: $item['title'],
                description: $item['description'],
                occurredAt: Carbon::parse($item['occurred_at']),
                link: $item['link'],
                badgeLabel: $item['badge']['label'] ?? 'Update',
                badgeVariant: $item['badge']['variant'] ?? 'info',
            ));
    }

    private function notification(
        string $id,
        string $type,
        string $category,
        string $priority,
        string $title,
        string $description,
        Carbon $occurredAt,
        string $link,
        string $badgeLabel,
        string $badgeVariant,
    ): array {
        return [
            'id' => $id,
            'type' => $type,
            'category' => $category,
            'priority' => $priority,
            'title' => $title,
            'description' => $description,
            'occurred_at' => $occurredAt,
            'link' => $link,
            'badge' => [
                'label' => $badgeLabel,
                'variant' => $badgeVariant,
            ],
        ];
    }
}
