<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductLabor;
use App\Models\ProductMaterial;
use App\Models\ProductOverhead;
use App\Models\ProductUtility;
use App\Models\ProductionBatch;
use App\Models\ProductionBatchMaterial;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use App\Services\Inventory\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CogsReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_report_meta(): void
    {
        Product::factory()->count(2)->create();

        $response = $this->getJson('/api/reports/meta');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'products',
                    'production_batches',
                    'overhead_categories',
                    'default_profit_margin',
                ],
            ]);
    }

    public function test_it_returns_cogs_per_product_report(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 10,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 5,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 2,
        ]);

        $response = $this->getJson('/api/reports/cogs-per-product?product_id='.$product->id);

        $response->assertOk()
            ->assertJsonPath('data.report_type', 'cogs_per_product')
            ->assertJsonPath('data.rows.0.product_id', $product->id)
            ->assertJsonPath('data.rows.0.total_manufacturing_cost', 10)
            ->assertJsonPath('data.rows.0.cogs_per_unit', 1);
    }

    public function test_it_returns_material_and_overhead_reports_with_category_filter(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 12,
            'name' => 'Flour',
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'category' => 'rent',
            'amount' => 50,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'category' => 'maintenance',
            'amount' => 20,
        ]);

        $materialResponse = $this->getJson('/api/reports/material-cost?product_id='.$product->id);
        $materialResponse->assertOk()
            ->assertJsonPath('data.summary.total_material_cost', 12)
            ->assertJsonPath('data.rows.0.name', 'Flour');

        $overheadResponse = $this->getJson('/api/reports/manufacturing-overhead?product_id='.$product->id.'&category=rent');
        $overheadResponse->assertOk()
            ->assertJsonCount(1, 'data.rows')
            ->assertJsonPath('data.summary.total_overhead_cost', 50);
    }

    public function test_it_returns_pricing_and_profit_reports(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 70,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        $priceResponse = $this->getJson('/api/reports/recommended-selling-price?product_id='.$product->id.'&profit_margin=30');
        $priceResponse->assertOk()
            ->assertJsonPath('data.rows.0.cogs_per_unit', 70)
            ->assertJsonPath('data.rows.0.recommended_selling_price', 100);

        $profitResponse = $this->getJson('/api/reports/expected-profit?product_id='.$product->id.'&profit_margin=30');
        $profitResponse->assertOk()
            ->assertJsonPath('data.rows.0.expected_profit_per_unit', 30);
    }

    public function test_it_returns_batch_cost_and_variance_reports(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 10,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 5,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        app(InventoryService::class)->receiveMaterial($material, 100);

        $batch = ProductionBatch::factory()->create([
            'product_id' => $product->id,
            'production_quantity' => 10,
            'production_date' => '2026-08-01',
            'status' => ProductionBatch::STATUS_DRAFT,
        ]);

        $this->postJson("/api/production-batches/{$batch->id}/confirm")->assertOk();

        $batchCostResponse = $this->getJson('/api/reports/production-cost-by-batch?product_id='.$product->id);
        $batchCostResponse->assertOk()
            ->assertJsonPath('data.report_type', 'production_cost_by_batch')
            ->assertJsonPath('data.rows.0.standard_total_cost', 5)
            ->assertJsonPath('data.rows.0.actual_material_cost', 5);

        $material->update(['cost_per_unit' => 6]);

        $varianceResponse = $this->getJson('/api/reports/cost-variance?production_batch_id='.$batch->id);
        $varianceResponse->assertOk()
            ->assertJsonPath('data.report_type', 'cost_variance')
            ->assertJsonPath('data.rows.0.standard_material_cost', 6)
            ->assertJsonPath('data.rows.0.actual_material_cost', 5)
            ->assertJsonPath('data.rows.0.material_variance', -1);
    }
}
