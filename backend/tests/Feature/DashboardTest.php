<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Models\UnitOfMeasurement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_dashboard_summary_with_live_counts(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        Product::factory()->count(2)->create(['default_unit_id' => $unit->id, 'is_active' => true]);
        Material::factory()->count(3)->create(['unit_id' => $unit->id]);
        ProductionBatch::factory()->create([
            'product_id' => Product::factory()->create(['default_unit_id' => $unit->id])->id,
            'status' => ProductionBatch::STATUS_DRAFT,
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.counts.products', 3)
            ->assertJsonPath('data.counts.active_products', 3)
            ->assertJsonPath('data.counts.materials', 3)
            ->assertJsonPath('data.counts.production_batches', 1)
            ->assertJsonStructure([
                'data' => [
                    'counts' => [
                        'products',
                        'active_products',
                        'materials',
                        'utilities',
                        'units',
                        'production_batches',
                        'confirmed_batches',
                        'draft_batches',
                        'products_with_bom',
                    ],
                    'recent_activity',
                ],
            ]);
    }
}
