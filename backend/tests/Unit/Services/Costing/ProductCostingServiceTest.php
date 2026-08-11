<?php

namespace Tests\Unit\Services\Costing;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductUtility;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Costing\ProductCostingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCostingServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProductCostingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ProductCostingService::class);
    }

    public function test_it_returns_zero_costs_for_product_without_bom_or_utilities(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        $breakdown = $this->service->calculate($product);

        $this->assertSame(0.0, $breakdown->totalMaterialCost);
        $this->assertSame(0.0, $breakdown->totalUtilityCost);
        $this->assertSame(0.0, $breakdown->totalManufacturingCost);
        $this->assertSame(0.0, $breakdown->cogsPerUnit);
        $this->assertCount(0, $breakdown->materials->items);
        $this->assertCount(0, $breakdown->utilities->items);
    }

    public function test_it_calculates_material_cost_as_quantity_times_unit_cost(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 50.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 0.25,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(12.5, $breakdown->totalMaterialCost);
        $this->assertSame(12.5, $breakdown->materials->items[0]->totalCost);
        $this->assertSame(50.0, $breakdown->materials->items[0]->unitCost);
    }

    public function test_it_calculates_utility_cost_as_usage_times_rate(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kWh']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $utility = Utility::factory()->create([
            'unit_id' => $unit->id,
            'rate' => 12.0000,
        ]);

        ProductUtility::factory()->create([
            'product_id' => $product->id,
            'utility_id' => $utility->id,
            'quantity' => 0.50,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(6.0, $breakdown->totalUtilityCost);
        $this->assertSame(6.0, $breakdown->utilities->items[0]->totalCost);
    }

    public function test_it_calculates_full_manufacturing_cost_for_configured_product(): void
    {
        $kg = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $pcs = UnitOfMeasurement::factory()->create(['symbol' => 'pcs']);
        $kwh = UnitOfMeasurement::factory()->create(['symbol' => 'kWh']);
        $liter = UnitOfMeasurement::factory()->create(['symbol' => 'L']);

        $product = Product::factory()->create([
            'name' => 'Chocolate Cake',
            'default_unit_id' => $pcs->id,
            'production_quantity' => 1,
        ]);

        $materials = [
            ['qty' => 0.25, 'cost' => 50.0],
            ['qty' => 0.10, 'cost' => 60.0],
            ['qty' => 3.00, 'cost' => 8.0, 'unit' => $pcs],
            ['qty' => 0.05, 'cost' => 450.0],
            ['qty' => 1.00, 'cost' => 20.0, 'unit' => $pcs],
        ];

        foreach ($materials as $entry) {
            $materialUnit = $entry['unit'] ?? $kg;
            $material = Material::factory()->create([
                'unit_id' => $materialUnit->id,
                'cost_per_unit' => $entry['cost'],
            ]);

            ProductMaterial::factory()->create([
                'product_id' => $product->id,
                'material_id' => $material->id,
                'unit_id' => $materialUnit->id,
                'quantity' => $entry['qty'],
            ]);
        }

        $electricity = Utility::factory()->create([
            'unit_id' => $kwh->id,
            'rate' => 12.0000,
        ]);
        $water = Utility::factory()->create([
            'unit_id' => $liter->id,
            'rate' => 1.5000,
        ]);

        ProductUtility::factory()->create([
            'product_id' => $product->id,
            'utility_id' => $electricity->id,
            'quantity' => 0.50,
        ]);
        ProductUtility::factory()->create([
            'product_id' => $product->id,
            'utility_id' => $water->id,
            'quantity' => 0.20,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(85.0, $breakdown->totalMaterialCost);
        $this->assertSame(6.3, $breakdown->totalUtilityCost);
        $this->assertSame(91.3, $breakdown->totalDirectManufacturingCost);
        $this->assertSame(91.3, $breakdown->totalManufacturingCost);
        $this->assertSame(91.3, $breakdown->cogsPerUnit);
    }

    public function test_it_divides_total_manufacturing_cost_by_production_quantity(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 2,
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

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(10.0, $breakdown->totalManufacturingCost);
        $this->assertSame(5.0, $breakdown->cogsPerUnit);
    }

    public function test_it_allows_production_quantity_override(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 20.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        $breakdown = $this->service->calculate($product->fresh(), 4);

        $this->assertSame(4.0, $breakdown->productionQuantity);
        $this->assertSame(5.0, $breakdown->cogsPerUnit);
    }

    public function test_it_rejects_non_positive_production_quantity(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 0,
        ]);

        $this->expectException(InvalidProductionQuantityException::class);

        $this->service->calculate($product);
    }
}
