<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\UnitOfMeasurement;
use Tests\FeatureTestCase;

class ProductPricingTest extends FeatureTestCase
{
    public function test_it_returns_pricing_breakdown_from_api(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 70.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        $response = $this->getJson("/api/products/{$product->id}/pricing?profit_margin=30");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.cogs_per_unit', 70)
            ->assertJsonPath('data.target_profit_margin_percent', 30)
            ->assertJsonPath('data.recommended_selling_price', 100)
            ->assertJsonPath('data.expected_profit_per_unit', 30)
            ->assertJsonPath('data.expected_profit_percentage', 30)
            ->assertJsonStructure([
                'data' => [
                    'cogs_per_unit',
                    'target_profit_margin_percent',
                    'recommended_selling_price',
                    'expected_profit_per_unit',
                    'expected_profit_percentage',
                    'production_quantity',
                ],
            ]);
    }

    public function test_it_validates_profit_margin_range(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        $this->getJson("/api/products/{$product->id}/pricing?profit_margin=0")
            ->assertStatus(422);

        $this->getJson("/api/products/{$product->id}/pricing?profit_margin=100")
            ->assertStatus(422);

        $this->getJson("/api/products/{$product->id}/pricing")
            ->assertStatus(422);
    }

    public function test_it_supports_low_margin_scenario(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 90.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        $response = $this->getJson("/api/products/{$product->id}/pricing?profit_margin=10");

        $response->assertOk()
            ->assertJsonPath('data.recommended_selling_price', 100)
            ->assertJsonPath('data.expected_profit_per_unit', 10)
            ->assertJsonPath('data.expected_profit_percentage', 10);
    }
}
