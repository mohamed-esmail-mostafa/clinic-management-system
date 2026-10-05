<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $totalBookings = 10_000;
        $clinicId = 1;

        $today = Carbon::today();

        $statuses = [
            'pending',
            'confirmed',
            'completed',
            'cancelled',
            'no_show',
        ];

        $types = [
            'new',
            'follow_up',
        ];

        $bookingSources = [
            'patient',
            'reception',
        ];

        $paymentMethods = [
            'cash',
            'card',
            'wallet',
        ];

        /*
        |--------------------------------------------------------------------------
        | Get real patient IDs
        |--------------------------------------------------------------------------
        */

        $patientIds = DB::table('patients')
            ->where('clinic_id', $clinicId)
            ->pluck('id')
            ->toArray();

        if (empty($patientIds)) {
            $this->command->error(
                "No patients found for clinic_id = {$clinicId}."
            );

            return;
        }

        $this->command->info(
            count($patientIds) . " patients found for clinic {$clinicId}."
        );

        $bookings = [];

        for ($i = 1; $i <= $totalBookings; $i++) {

            /*
            |--------------------------------------------------------------------------
            | First 1,000 bookings are for today
            |--------------------------------------------------------------------------
            */

            if ($i <= 1_000) {
                $appointmentDate = $today->copy();
            } else {
                /*
                | Random date between 90 days ago and 60 days from now
                */
                $appointmentDate = $today->copy()->addDays(
                    rand(-90, 60)
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Appointment time
            |--------------------------------------------------------------------------
            */

            $hour = rand(9, 17);
            $minute = rand(0, 3) * 15;

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            if ($appointmentDate->isBefore($today)) {
                // Past appointments
                $status = $statuses[
                    array_rand([
                        2, // completed
                        2, // completed
                        3, // cancelled
                        4, // no_show
                    ])
                ];
            } else {
                // Today / future appointments
                $status = $statuses[
                    array_rand([
                        0, // pending
                        1, // confirmed
                        1, // confirmed
                    ])
                ];
            }

            $bookings[] = [
                'clinic_id' => $clinicId,

                /*
                |--------------------------------------------------------------------------
                | Use a REAL patient ID from patients table
                |--------------------------------------------------------------------------
                */
                'patient_id' => $patientIds[array_rand($patientIds)],

                'name' => null,
                'phone' => null,

                // No doctor assigned
                'doctor_id' => null,

                'appointment_date' => $appointmentDate->toDateString(),

                'appointment_time' => sprintf(
                    '%02d:%02d:00',
                    $hour,
                    $minute
                ),

                'type' => $types[array_rand($types)],

                'status' => $status,

                'booking_source' => $bookingSources[
                    array_rand($bookingSources)
                ],

                'booked_by' => null,

                'payment_method' => $paymentMethods[
                    array_rand($paymentMethods)
                ],

                'amount' => rand(100, 500),

                'notes' => null,

                'created_at' => now(),
                'updated_at' => now(),
            ];

            /*
            |--------------------------------------------------------------------------
            | Insert every 500 records
            |--------------------------------------------------------------------------
            */

            if (count($bookings) === 500) {
                DB::table('bookings')->insert($bookings);

                $bookings = [];

                $this->command->info(
                    "Inserted {$i} / {$totalBookings} bookings..."
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Insert remaining records
        |--------------------------------------------------------------------------
        */

        if (! empty($bookings)) {
            DB::table('bookings')->insert($bookings);
        }

        $this->command->info(
            "Successfully inserted {$totalBookings} bookings."
        );
    }
}