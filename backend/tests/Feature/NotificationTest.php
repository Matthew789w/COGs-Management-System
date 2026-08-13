<?php

namespace Tests\Feature;

use App\Models\InventoryBalance;
use App\Models\Material;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Models\UnitOfMeasurement;
use Tests\FeatureTestCase;

class NotificationTest extends FeatureTestCase
{
    public function test_it_returns_notifications_with_alerts_and_activity(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $productWithoutBom = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'is_active' => true,
        ]);
        $material = Material::factory()->create(['unit_id' => $unit->id]);

        ProductionBatch::factory()->create([
            'product_id' => $productWithoutBom->id,
            'status' => ProductionBatch::STATUS_DRAFT,
        ]);

        InventoryBalance::create([
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity_on_hand' => 0,
        ]);

        $response = $this->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'notifications' => [
                        '*' => [
                            'id',
                            'type',
                            'category',
                            'priority',
                            'title',
                            'description',
                            'occurred_at',
                            'link',
                            'badge' => ['label', 'variant'],
                        ],
                    ],
                    'summary' => ['total', 'alerts', 'activity'],
                ],
            ])
            ->assertJsonPath('data.summary.alerts', 3);

        $ids = collect($response->json('data.notifications'))->pluck('id');

        $this->assertTrue($ids->contains(fn ($id) => str_starts_with($id, 'draft-batch-')));
        $this->assertTrue($ids->contains("missing-bom-{$productWithoutBom->id}"));
        $this->assertTrue($ids->contains("low-stock-{$material->id}"));
    }
}
