<?php

namespace Database\Factories;

use App\Models\UnitOfMeasurement;
use Illuminate\Database\Eloquent\Factories\Factory;

class UnitOfMeasurementFactory extends Factory
{
    protected $model = UnitOfMeasurement::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'name' => $this->faker->word(),
            'symbol' => strtoupper($this->faker->randomElement(['kg', 'g', 'pcs', 'l', 'kWh'])),
            'category' => $this->faker->randomElement(['Weight', 'Quantity', 'Volume', 'Energy']),
            'is_active' => true,
        ];
    }
}
