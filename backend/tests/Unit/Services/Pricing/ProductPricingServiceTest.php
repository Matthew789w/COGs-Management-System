<?php

namespace Tests\Unit\Services\Pricing;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\UnitOfMeasurement;
use App\Services\Pricing\Exceptions\InvalidProfitMarginException;
use App\Services\Pricing\ProductPricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductPricingServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProductPricingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ProductPricingService::class);
    }

    public function test_it_calculates_recommended_selling_price_from_target_margin(): void
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

        $result = $this->service->calculate($product->fresh(), 30);

        $this->assertSame(70.0, $result->cogsPerUnit);
        $this->assertSame(30.0, $result->targetProfitMarginPercent);
        $this->assertSame(100.0, $result->recommendedSellingPrice);
        $this->assertSame(30.0, $result->expectedProfitPerUnit);
        $this->assertSame(30.0, $result->expectedProfitPercentage);
    }

    public function test_it_calculates_pricing_for_fifty_percent_margin(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
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
            'quantity' => 1,
        ]);

        $result = $this->service->calculate($product->fresh(), 50);

        $this->assertSame(100.0, $result->recommendedSellingPrice);
        $this->assertSame(50.0, $result->expectedProfitPerUnit);
        $this->assertSame(50.0, $result->expectedProfitPercentage);
    }

    public function test_it_uses_cogs_per_unit_from_costing_engine_with_batch_quantity(): void
    {
        $unit = UnitOfMeasurement::factory()->create();
        $product = Product::factory()->create([
            'default_unit_id' => $unit->id,
            'production_quantity' => 2,
        ]);
        $material = Material::factory()->create([
            'unit_id' => $unit->id,
            'cost_per_unit' => 20.0000,
        ]);

        ProductMaterial::factory()->create([
            'product_id' => $product->id,
            'material_id' => $material->id,
            'unit_id' => $unit->id,
            'quantity' => 2,
        ]);

        $result = $this->service->calculate($product->fresh(), 25);

        $this->assertSame(20.0, $result->cogsPerUnit);
        $this->assertSame(26.6667, $result->recommendedSellingPrice);
        $this->assertSame(6.6667, $result->expectedProfitPerUnit);
    }

    public function test_it_rejects_zero_profit_margin(): void
    {
        $this->expectException(InvalidProfitMarginException::class);

        $this->service->assertValidProfitMargin(0);
    }

    public function test_it_rejects_negative_profit_margin(): void
    {
        $this->expectException(InvalidProfitMarginException::class);

        $this->service->assertValidProfitMargin(-5);
    }

    public function test_it_rejects_hundred_percent_profit_margin(): void
    {
        $this->expectException(InvalidProfitMarginException::class);

        $this->service->assertValidProfitMargin(100);
    }

    public function test_it_rejects_profit_margin_at_or_above_maximum(): void
    {
        $this->expectException(InvalidProfitMarginException::class);

        $this->service->assertValidProfitMargin(ProductPricingService::MAX_PROFIT_MARGIN_PERCENT);
    }
}
