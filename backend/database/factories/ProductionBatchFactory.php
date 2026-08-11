<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductionBatch;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductionBatchFactory extends Factory
{
    protected $model = ProductionBatch::class;

    public function definition(): array
    {
        return [
            'batch_number' => 'PB-'.$this->faker->unique()->numerify('######'),
            'product_id' => Product::factory(),
            'production_quantity' => $this->faker->randomFloat(4, 1, 100),
            'production_date' => now()->toDateString(),
            'status' => ProductionBatch::STATUS_DRAFT,
            'notes' => null,
        ];
    }
}
