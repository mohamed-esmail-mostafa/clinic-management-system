<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'patient_id' => Patient::factory(),
            'name' => null,
            'phone' => null,
            'doctor_id' => User::factory(),
            'appointment_date' => fake()->date(),
            'appointment_time' => fake()->time('H:i'),
            'type' => fake()->randomElement(['new', 'follow_up']),
            'status' => fake()->randomElement(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
            'booking_source' => fake()->randomElement(['patient', 'reception']),
            'booked_by' => fake()->name(),
            'notes' => fake()->sentence(),
        ];
    }
}
