<?php

namespace Tests\Feature;

use App\Models\InventoryBalance;
use App\Models\InventoryTransaction;
use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductionBatch;
use App\Models\UnitOfMeasurement;
use App\Services\Inventory\InventoryService;
use Tests\FeatureTestCase;

class ProductionBatchTest extends FeatureTestCase
{
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
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.batch_materials.0.issued_quantity', '20.0000');

        $this->assertSame(480.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
        $this->assertSame(10.0, (float) InventoryBalance::where('product_id', $product->id)->value('quantity_on_hand'));

        $this->assertDatabaseHas('inventory_transactions', [
            'transaction_type' => InventoryTransaction::TYPE_PRODUCTION_ISSUE,
            'material_id' => $material->id,
            'reference_type' => ProductionBatch::class,
            'quantity' => -20,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'transaction_type' => InventoryTransaction::TYPE_PRODUCTION_RECEIPT,
            'product_id' => $product->id,
            'reference_type' => ProductionBatch::class,
            'quantity' => 10,
        ]);
    }

    public function test_it_recalculates_requirements_on_confirm_using_recipe_batch_size(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 15,
        ]);
        $material = Material::factory()->create(['unit_id' => $unit->id, 'cost_per_unit' => 10]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 0.5,
        ]);

        app(InventoryService::class)->receiveMaterial($material, 10);

        $batch = ProductionBatch::factory()->create([
            'product_id' => $product->id,
            'production_quantity' => 100,
            'production_date' => '2026-08-11',
            'status' => ProductionBatch::STATUS_DRAFT,
        ]);

        $response = $this->postJson("/api/production-batches/{$batch->id}/confirm");

        $response->assertOk()
            ->assertJsonPath('data.batch_materials.0.required_quantity', '3.3333')
            ->assertJsonPath('data.batch_materials.0.issued_quantity', '3.3333');

        $this->assertSame(6.6667, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
        $this->assertSame(100.0, (float) InventoryBalance::where('product_id', $product->id)->value('quantity_on_hand'));
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
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.shortfalls.0.material_id', $material->id);

        $this->assertSame(10.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
        $this->assertSame('draft', $batch->fresh()->status);
        $this->assertDatabaseMissing('inventory_transactions', [
            'transaction_type' => InventoryTransaction::TYPE_PRODUCTION_ISSUE,
            'material_id' => $material->id,
        ]);
    }

    public function test_draft_batch_index_includes_inventory_shortfalls(): void
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

        app(InventoryService::class)->receiveMaterial($material, 1);

        $batch = ProductionBatch::factory()->create([
            'product_id' => $product->id,
            'production_quantity' => 10,
            'production_date' => '2026-08-11',
        ]);

        app(\App\Services\Production\ProductionBatchService::class)->snapshotRequirements($batch);

        $response = $this->getJson('/api/production-batches');

        $response->assertOk()
            ->assertJsonPath('data.0.all_materials_sufficient', false)
            ->assertJsonPath('data.0.shortfalls.0.material_name', $material->name);
    }
}
