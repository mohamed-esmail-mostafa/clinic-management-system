<?php

namespace Database\Factories;

use App\Models\Country;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Country>
 */
class CountryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name_ar' => fake()->country(),
            'name_en' => fake()->country(),
            'code' => strtoupper(fake()->unique()->lexify('??')),
            'is_active' => true,
        ];
    }
}
