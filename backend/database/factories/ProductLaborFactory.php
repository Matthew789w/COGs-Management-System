<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductLabor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductLaborFactory extends Factory
{
    protected $model = ProductLabor::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'role' => $this->faker->jobTitle(),
            'workers' => $this->faker->randomFloat(4, 1, 5),
            'hours' => $this->faker->randomFloat(4, 0.5, 8),
            'hourly_rate' => $this->faker->randomFloat(4, 50, 200),
        ];
    }
}
