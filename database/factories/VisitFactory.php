<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Visit>
 */
class VisitFactory extends Factory
{
    protected $model = Visit::class;

    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'patient_id' => Patient::factory(),
            'visited_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'type' => fake()->randomElement(['examination', 'follow_up']),
        ];
    }
}
