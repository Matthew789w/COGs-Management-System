<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductUtility;
use App\Models\Utility;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductUtilityFactory extends Factory
{
    protected $model = ProductUtility::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'utility_id' => Utility::factory(),
            'quantity' => $this->faker->randomFloat(4, 0.01, 5),
        ];
    }
}
