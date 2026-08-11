<?php

namespace Tests\Feature;

use App\Models\InventoryBalance;
use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductionBatch;
use App\Models\UnitOfMeasurement;
use App\Services\Inventory\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionBatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_previews_production_requirements_without_deducting_inventory(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create(['unit_id' => $unit->id]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 0.25,
        ]);

        app(InventoryService::class)->receiveMaterial($material, 100);

        $response = $this->getJson("/api/products/{$product->id}/production-requirements?production_quantity=100");

        $response->assertOk()
            ->assertJsonPath('data.production_quantity', 100)
            ->assertJsonPath('data.recipe_batch_size', 1)
            ->assertJsonPath('data.materials.0.required_quantity', 25)
            ->assertJsonPath('data.materials.0.quantity_on_hand', 100)
            ->assertJsonPath('data.all_materials_sufficient', true);

        $this->assertSame(100.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
    }

    public function test_it_creates_draft_batch_without_deducting_inventory(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create(['default_unit_id' => $unit->id]);
        $material = Material::factory()->create(['unit_id' => $unit->id]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 2,
        ]);

        app(InventoryService::class)->receiveMaterial($material, 500);

        $response = $this->postJson('/api/production-batches', [
            'batch_number' => 'PB-TEST-001',
            'product_id' => $product->id,
            'production_quantity' => 10,
            'production_date' => '2026-08-11',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.batch_materials.0.required_quantity', '20.0000');

        $this->assertSame(500.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
    }

    public function test_it_confirms_batch_and_deducts_material_inventory_atomically(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create(['default_unit_id' => $unit->id]);
        $material = Material::factory()->create(['unit_id' => $unit->id, 'cost_per_unit' => 10]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 2,
        ]);

        app(InventoryService::class)->receiveMaterial($material, 500);

        $batch = ProductionBatch::factory()->create([
            'product_id' => $product->id,
            'production_quantity' => 10,
            'production_date' => '2026-08-11',
            'status' => ProductionBatch::STATUS_DRAFT,
        ]);

        app(\App\Services\Production\ProductionBatchService::class)->snapshotRequirements($batch);

        $response = $this->postJson("/api/production-batches/{$batch->id}/confirm");

        $response->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertSame(480.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
        $this->assertSame(10.0, (float) InventoryBalance::where('product_id', $product->id)->value('quantity_on_hand'));
    }

    public function test_it_rejects_confirm_when_inventory_is_insufficient(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create(['default_unit_id' => $unit->id]);
        $material = Material::factory()->create(['unit_id' => $unit->id]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 5,
        ]);

        app(InventoryService::class)->receiveMaterial($material, 10);

        $batch = ProductionBatch::factory()->create([
            'product_id' => $product->id,
            'production_quantity' => 10,
            'production_date' => '2026-08-11',
        ]);

        app(\App\Services\Production\ProductionBatchService::class)->snapshotRequirements($batch);

        $response = $this->postJson("/api/production-batches/{$batch->id}/confirm");

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertSame(10.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
        $this->assertSame('draft', $batch->fresh()->status);
    }
}
