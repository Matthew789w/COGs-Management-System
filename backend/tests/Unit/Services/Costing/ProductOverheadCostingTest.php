<?php

namespace Tests\Unit\Services\Costing;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductLabor;
use App\Models\ProductMaterial;
use App\Models\ProductOverhead;
use App\Models\ProductUtility;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use App\Services\Costing\ProductCostingService;
use App\Services\Pricing\ProductPricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductOverheadCostingTest extends TestCase
{
    use RefreshDatabase;

    private ProductCostingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ProductCostingService::class);
    }

    public function test_it_allocates_fixed_batch_overhead_to_product(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'name' => 'Oven Depreciation',
            'category' => ProductOverhead::CATEGORY_DEPRECIATION,
            'amount' => 45,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(45.0, $breakdown->totalOverheadCost);
        $this->assertSame('depreciation', $breakdown->overhead->items[0]->category);
        $this->assertSame('fixed_batch', $breakdown->overhead->items[0]->allocationMethod);
    }

    public function test_it_includes_overhead_in_total_manufacturing_cost_without_affecting_other_components(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 30.0000,
        ]);
        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 1,
        ]);

        $utility = Utility::factory()->create([
            'unit_id' => $unit->id,
            'rate' => 5.0000,
        ]);
        ProductUtility::factory()->create([
            'product_id' => $product->id,
            'utility_id' => $utility->id,
            'quantity' => 2,
        ]);

        ProductLabor::factory()->create([
            'product_id' => $product->id,
            'role' => 'Baker',
            'workers' => 1,
            'hours' => 1,
            'hourly_rate' => 20,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'name' => 'Factory Rent',
            'category' => ProductOverhead::CATEGORY_RENT,
            'amount' => 25,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(30.0, $breakdown->totalMaterialCost);
        $this->assertSame(10.0, $breakdown->totalUtilityCost);
        $this->assertSame(20.0, $breakdown->totalLaborCost);
        $this->assertSame(25.0, $breakdown->totalOverheadCost);
        $this->assertSame(85.0, $breakdown->totalManufacturingCost);
        $this->assertSame(85.0, $breakdown->cogsPerUnit);
    }

    public function test_it_sums_multiple_overhead_entries(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'name' => 'Depreciation',
            'category' => ProductOverhead::CATEGORY_DEPRECIATION,
            'amount' => 40,
        ]);
        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'name' => 'Maintenance',
            'category' => ProductOverhead::CATEGORY_MAINTENANCE,
            'amount' => 15,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertCount(2, $breakdown->overhead->items);
        $this->assertSame(55.0, $breakdown->totalOverheadCost);
    }

    public function test_it_divides_total_manufacturing_cost_by_production_quantity_for_cogs(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 2,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'name' => 'Rent',
            'category' => ProductOverhead::CATEGORY_RENT,
            'amount' => 100,
        ]);

        $breakdown = $this->service->calculate($product->fresh());

        $this->assertSame(100.0, $breakdown->totalManufacturingCost);
        $this->assertSame(50.0, $breakdown->cogsPerUnit);
    }

    public function test_pricing_uses_cogs_including_overhead(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);

        ProductOverhead::factory()->create([
            'product_id' => $product->id,
            'name' => 'Machine Usage',
            'category' => ProductOverhead::CATEGORY_MACHINE_USAGE,
            'amount' => 70,
        ]);

        $pricing = app(ProductPricingService::class)->calculate($product->fresh(), 30);

        $this->assertSame(70.0, $pricing->cogsPerUnit);
        $this->assertSame(100.0, $pricing->recommendedSellingPrice);
    }
}
