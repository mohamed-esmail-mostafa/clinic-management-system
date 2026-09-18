<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\ClinicPhone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClinicPhone>
 */
class ClinicPhoneFactory extends Factory
{
    protected $model = ClinicPhone::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'type' => fake()->randomElement(['phone', 'mobile', 'landline', 'emergency', 'whatsapp']),
            'label' => fake()->randomElement(['Reception', 'Doctor', 'Emergency', 'Inquiries']),
            'phone' => fake()->numerify('010########'),
            'country_code' => '+20',
            'is_whatsapp' => fake()->boolean(),
            'is_primary' => false,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
