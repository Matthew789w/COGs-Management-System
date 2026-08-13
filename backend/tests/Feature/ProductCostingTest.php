<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\UnitOfMeasurement;
use Tests\FeatureTestCase;

class ProductCostingTest extends FeatureTestCase
{
    public function test_it_returns_product_costing_breakdown_from_api(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 40.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 0.5,
        ]);

        $response = $this->getJson("/api/products/{$product->id}/costing");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product_id', $product->id)
            ->assertJsonPath('data.total_material_cost', 20)
            ->assertJsonPath('data.total_utility_cost', 0)
            ->assertJsonPath('data.total_manufacturing_cost', 20)
            ->assertJsonPath('data.cogs_per_unit', 20)
            ->assertJsonStructure([
                'data' => [
                    'material_costs' => ['items', 'total'],
                    'utility_costs' => ['items', 'total'],
                    'labor_costs' => ['items', 'total'],
                    'overhead_costs' => ['items', 'total'],
                    'total_material_cost',
                    'total_utility_cost',
                    'total_direct_manufacturing_cost',
                    'total_manufacturing_cost',
                    'production_quantity',
                    'cogs_per_unit',
                ],
            ]);
    }

    public function test_it_accepts_production_quantity_query_override(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 10.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        $response = $this->getJson("/api/products/{$product->id}/costing?production_quantity=2");

        $response->assertOk()
            ->assertJsonPath('data.production_quantity', 2)
            ->assertJsonPath('data.total_manufacturing_cost', 10)
            ->assertJsonPath('data.cogs_per_unit', 5);
    }

    public function test_it_returns_validation_error_for_invalid_production_quantity(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        $response = $this->getJson("/api/products/{$product->id}/costing?production_quantity=0");

        $response->assertStatus(422);
    }
}
