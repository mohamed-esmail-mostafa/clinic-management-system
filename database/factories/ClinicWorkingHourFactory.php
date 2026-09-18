<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\ClinicWorkingHour;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClinicWorkingHour>
 */
class ClinicWorkingHourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'day_of_week' => fake()->numberBetween(0, 6),
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
