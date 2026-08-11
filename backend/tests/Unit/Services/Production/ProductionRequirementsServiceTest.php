<?php

namespace Tests\Unit\Services\Production;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\UnitOfMeasurement;
use App\Services\Production\ProductionRequirementsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionRequirementsServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProductionRequirementsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ProductionRequirementsService::class);
    }

    public function test_it_calculates_required_materials_from_bom_and_production_quantity(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 1,
        ]);
        $material = Material::factory()->create([
            'name' => 'Flour',
            'unit_id' => $unit->id,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 0.25,
        ]);

        $requirements = $this->service->calculate($product->fresh(), 100);

        $this->assertCount(1, $requirements);
        $this->assertSame('Flour', $requirements[0]->materialName);
        $this->assertSame(0.25, $requirements[0]->bomQuantityPerUnit);
        $this->assertSame(25.0, $requirements[0]->requiredQuantity);
    }

    public function test_it_scales_bom_quantities_by_recipe_batch_size(): void
    {
        $unit = UnitOfMeasurement::factory()->create(['symbol' => 'kg']);
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 15,
        ]);
        $material = Material::factory()->create([
            'name' => 'Chicken',
            'unit_id' => $unit->id,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 0.5,
        ]);

        $requirements = $this->service->calculate($product->fresh(), 100);

        $this->assertCount(1, $requirements);
        $this->assertSame(3.3333, $requirements[0]->requiredQuantity);
    }
}
