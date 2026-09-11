<?php

namespace Database\Factories;

use App\Models\Specialty;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Specialty>
 */
class SpecialtyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->jobTitle();
        return [
            'name_ar' => $name,
            'name_en' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'description_ar' => fake()->sentence(),
            'description_en' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
