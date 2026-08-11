<?php

namespace Database\Factories;

use App\Models\Utility;
use App\Models\UnitOfMeasurement;
use Illuminate\Database\Eloquent\Factories\Factory;

class UtilityFactory extends Factory
{
    protected $model = Utility::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('UTIL-###')),
            'name' => $this->faker->word(),
            'unit_id' => UnitOfMeasurement::factory(),
            'rate' => $this->faker->randomFloat(4, 1, 50),
            'is_active' => true,
        ];
    }
}
