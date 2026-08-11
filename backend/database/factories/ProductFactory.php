<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\UnitOfMeasurement;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'sku' => strtoupper($this->faker->unique()->bothify('PROD-###')),
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'default_unit_id' => UnitOfMeasurement::factory(),
            'list_price' => $this->faker->randomFloat(4, 10, 500),
            'production_quantity' => 1.0000,
            'is_active' => true,
        ];
    }
}
