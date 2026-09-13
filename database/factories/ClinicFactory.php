<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Clinic;
use App\Models\Country;
use App\Models\Governorate;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Clinic>
 */
class ClinicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company().' Clinic';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->paragraph(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'country_id' => Country::factory(),
            'governorate_id' => Governorate::factory(),
            'city_id' => City::factory(),
            'is_active' => true,
        ];
    }
}
