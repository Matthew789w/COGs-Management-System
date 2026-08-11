<?php

namespace Tests\Unit\Services\Costing;

use App\Models\Product;
use App\Models\ProductLabor;
use App\Models\ProductMaterial;
use App\Models\ProductUtility;
use App\Models\Material;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use App\Services\Costing\ProductCostingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductLaborCostingTest extends TestCase
{
    use RefreshDatabase;

    private ProductCostingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ProductCostingService::class);
    }

    public function test_it_calculates_labor_cost_as_workers_times_hours_times_hourly_rate(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        ProductLabor::factory()->create([
            'product_id' => $product->id,
            'role' => 'Baker',
            'workers' => 2,
            'hours' => 3,
            'hourly_rate' => 50,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(300.0, $breakdown->totalLaborCost);
        $this->assertSame(300.0, $breakdown->labor->items[0]->totalCost);
        $this->assertSame(2.0, $breakdown->labor->items[0]->workers);
        $this->assertSame(3.0, $breakdown->labor->items[0]->hours);
        $this->assertSame(50.0, $breakdown->labor->items[0]->hourlyRate);
    }

    public function test_it_includes_labor_in_total_manufacturing_cost_without_affecting_materials_or_utilities(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
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
            'quantity' => 1,
        ]);

        $utility = Utility::factory()->create([
            'unit_id' => $unit->id,
            'rate' => 10.0000,
        ]);
        ProductUtility::factory()->create([
            'product_id' => $product->id,
            'utility_id' => $utility->id,
            'quantity' => 2,
        ]);

        ProductLabor::factory()->create([
            'product_id' => $product->id,
            'role' => 'Mixer',
            'workers' => 1,
            'hours' => 2,
            'hourly_rate' => 25,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(40.0, $breakdown->totalMaterialCost);
        $this->assertSame(20.0, $breakdown->totalUtilityCost);
        $this->assertSame(60.0, $breakdown->totalDirectManufacturingCost);
        $this->assertSame(50.0, $breakdown->totalLaborCost);
        $this->assertSame(110.0, $breakdown->totalManufacturingCost);
        $this->assertSame(110.0, $breakdown->cogsPerUnit);
    }

    public function test_it_sums_multiple_labor_entries(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        ProductLabor::factory()->create([
            'product_id' => $product->id,
            'role' => 'Baker',
            'workers' => 1,
            'hours' => 2,
            'hourly_rate' => 75,
        ]);
        ProductLabor::factory()->create([
            'product_id' => $product->id,
            'role' => 'Assistant',
            'workers' => 1,
            'hours' => 1.5,
            'hourly_rate' => 60,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertCount(2, $breakdown->labor->items);
        $this->assertSame(240.0, $breakdown->totalLaborCost);
    }

    public function test_pricing_uses_cogs_including_labor_cost(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        ProductLabor::factory()->create([
            'product_id' => $product->id,
            'role' => 'Baker',
            'workers' => 1,
            'hours' => 1,
            'hourly_rate' => 70,
        ]);

        $pricing = app(\App\Services\Pricing\ProductPricingService::class)
            ->calculate($product->fresh(), 30);

        $this->assertSame(70.0, $pricing->cogsPerUnit);
        $this->assertSame(100.0, $pricing->recommendedSellingPrice);
    }
}
