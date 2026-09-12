<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    protected $model = Patient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_number' => 'PAT-'.fake()->unique()->numberBetween(10000, 99999),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'phone' => fake()->phoneNumber(),
            'secondary_phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'national_id' => fake()->unique()->numerify('##############'),
            'passport_number' => fake()->bothify('??######'),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->phoneNumber(),
            'emergency_contact_relation' => fake()->randomElement(['Spouse', 'Parent', 'Sibling', 'Child']),
            'blood_type' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'allergies' => fake()->sentence(),
            'chronic_diseases' => fake()->sentence(),
            'medical_history' => fake()->paragraph(),
            'surgical_history' => fake()->sentence(),
            'family_medical_history' => fake()->sentence(),
            'has_insurance' => fake()->boolean(),
            'insurance_company' => fake()->company(),
            'insurance_number' => fake()->bothify('INS-#####'),
            'insurance_expiry_date' => fake()->date('Y-m-d', '+2 years'),
            'clinic_id' => Clinic::factory(),
            'notes' => fake()->sentence(),
            'occupation' => fake()->jobTitle(),
            'marital_status' => fake()->randomElement(['single', 'married', 'divorced', 'widowed']),
            'is_active' => true,
        ];
    }
}
