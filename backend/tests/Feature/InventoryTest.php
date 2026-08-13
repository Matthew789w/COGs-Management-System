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

class InventoryTest extends FeatureTestCase
{
    public function test_it_records_material_receipt_and_updates_balance(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $material = Material::factory()->create(['unit_id' => $unit->id, 'cost_per_unit' => 12.5]);

        $response = $this->postJson('/api/inventory/material-receipts', [
            'material_id' => $material->id,
            'quantity' => 25,
            'notes' => 'Initial stock',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.quantity_on_hand', '25.0000');

        $this->assertSame(25.0, (float) InventoryBalance::where('material_id', $material->id)->value('quantity_on_hand'));
        $this->assertDatabaseHas('inventory_transactions', [
            'transaction_type' => InventoryTransaction::TYPE_RECEIPT,
            'material_id' => $material->id,
            'quantity' => 25,
        ]);
    }

    public function test_it_lists_inventory_balances_and_transactions(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $material = Material::factory()->create(['unit_id' => $unit->id]);
        $product = Product::factory()->create(['default_unit_id' => $unit->id]);

        app(InventoryService::class)->receiveMaterial($material, 10);
        app(InventoryService::class)->receiveProductFromProduction($product, 5, ProductionBatch::class, 1);

        $balances = $this->getJson('/api/inventory/balances');
        $balances->assertOk()
            ->assertJsonPath('data.materials.0.quantity_on_hand', '10.0000')
            ->assertJsonPath('data.products.0.quantity_on_hand', '5.0000');

        $transactions = $this->getJson('/api/inventory/transactions');
        $transactions->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
