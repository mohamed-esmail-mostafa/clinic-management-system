<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Medication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medication>
 */
class MedicationFactory extends Factory
{
    protected $model = Medication::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'name' => fake()->randomElement(['Amoxicillin', 'Panadol Extra', 'Augmentin 1g', 'Ibuprofen', 'Ciprofloxacin', 'Omeprazole', 'Metformin', 'Atorvastatin']),
            'generic_name' => fake()->randomElement(['Paracetamol', 'Amoxicillin Trihydrate', 'Ibuprofen Sodium', 'Omeprazole Magnesium']),
            'form' => fake()->randomElement(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler']),
            'strength' => (string) fake()->randomElement([100, 250, 500, 1000, 5, 10, 20]),
            'unit' => fake()->randomElement(['mg', 'ml', 'g', 'mcg', 'IU', '%']),
            'is_active' => true,
        ];
    }
}
