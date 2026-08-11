<?php

namespace Database\Factories;

use App\Models\ProductMaterial;
use App\Models\Product;
use App\Models\Material;
use App\Models\UnitOfMeasurement;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductMaterialFactory extends Factory
{
    protected $model = ProductMaterial::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'material_id' => Material::factory(),
            'unit_id' => UnitOfMeasurement::factory(),
            'quantity' => $this->faker->randomFloat(4, 0.01, 10),
        ];
    }
}
