<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('patients')
            ->where('clinic_id', 1)
            ->delete();
        $patients = [];

        for ($i = 1; $i <= 10000; $i++) {
            $patients[] = [
                'clinic_id' => 1,
                'user_id' => null,

                'patient_number' => 'PAT-'.str_pad($i, 5, '0', STR_PAD_LEFT),

                'first_name' => 'Patient',
                'last_name' => 'Test '.$i,

                'gender' => fake()->randomElement([
                    'male',
                    'female',
                ]),

                'date_of_birth' => fake()->dateTimeBetween(
                    '-80 years',
                    '-1 years'
                )->format('Y-m-d'),

                'phone' => '01'.fake()->numerify('#########'),
                'secondary_phone' => fake()->optional(0.3)->numerify('01#########'),

                'address' => fake()->address(),

                'emergency_contact_name' => fake()->name(),
                'emergency_contact_phone' => '01'.fake()->numerify('#########'),
                'emergency_contact_relation' => fake()->randomElement([
                    'Father',
                    'Mother',
                    'Brother',
                    'Sister',
                    'Spouse',
                    'Friend',
                ]),

                'blood_type' => fake()->randomElement([
                    'A+',
                    'A-',
                    'B+',
                    'B-',
                    'AB+',
                    'AB-',
                    'O+',
                    'O-',
                ]),

                'notes' => fake()->optional(0.2)->sentence(),

                'marital_status' => fake()->randomElement([
                    'single',
                    'married',
                    'divorced',
                    'widowed',
                ]),

                'is_active' => true,

                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Insert every 1,000 records
            if (count($patients) === 1000) {
                DB::table('patients')->insert($patients);

                $patients = [];
            }
        }

        // Insert remaining records
        if (! empty($patients)) {
            DB::table('patients')->insert($patients);
        }
    }
}
