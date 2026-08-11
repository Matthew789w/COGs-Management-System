<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductOverhead;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductOverheadFactory extends Factory
{
    protected $model = ProductOverhead::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => $this->faker->words(2, true),
            'category' => $this->faker->randomElement(ProductOverhead::categories()),
            'allocation_method' => ProductOverhead::ALLOCATION_FIXED_BATCH,
            'amount' => $this->faker->randomFloat(4, 50, 500),
        ];
    }
}
