<?php

namespace Database\Factories;

use App\Models\Material;
use App\Models\UnitOfMeasurement;
use Illuminate\Database\Eloquent\Factories\Factory;

class MaterialFactory extends Factory
{
    protected $model = Material::class;

    public function definition(): array
    {
        return [
            'sku' => strtoupper($this->faker->unique()->bothify('MAT-###')),
            'name' => $this->faker->word(),
            'unit_id' => UnitOfMeasurement::factory(),
            'cost_per_unit' => $this->faker->randomFloat(4, 5, 200),
            'is_active' => true,
        ];
    }
}
