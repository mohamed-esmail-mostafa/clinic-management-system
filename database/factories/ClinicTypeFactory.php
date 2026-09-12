<?php

namespace Database\Factories;

use App\Models\ClinicType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ClinicType>
 */
class ClinicTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->words(2, true);

        return [
            'title_ar' => 'عيادة '.$title,
            'title_en' => Str::title($title).' Clinic',
            'slug' => Str::slug($title),
            'is_active' => true,
        ];
    }
}
