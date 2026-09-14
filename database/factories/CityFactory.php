<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Governorate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'governorate_id' => Governorate::factory(),
            'name_ar' => fake()->city(),
            'name_en' => fake()->city(),
            'is_active' => true,
        ];
    }
}
