<?php

namespace Database\Factories;

use App\Models\Medication;
use App\Models\Visit;
use App\Models\VisitMedication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VisitMedication>
 */
class VisitMedicationFactory extends Factory
{
    protected $model = VisitMedication::class;

    public function definition(): array
    {
        return [
            'visit_id' => Visit::factory(),
            'medication_id' => Medication::factory(),
            'medication_name' => fake()->randomElement(['Amoxicillin 500mg', 'Panadol Extra', 'Augmentin 1g', 'Ibuprofen 400mg']),
        ];
    }
}
