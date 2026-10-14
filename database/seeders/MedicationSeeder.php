<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medications = [
            [
                'name' => 'Panadol',
                'generic_name' => 'Paracetamol',
                'form' => 'Tablet',
                'strength' => '500',
                'unit' => 'mg',
            ],
            [
                'name' => 'Brufen',
                'generic_name' => 'Ibuprofen',
                'form' => 'Tablet',
                'strength' => '400',
                'unit' => 'mg',
            ],
            [
                'name' => 'Augmentin',
                'generic_name' => 'Amoxicillin + Clavulanic Acid',
                'form' => 'Tablet',
                'strength' => '625',
                'unit' => 'mg',
            ],
            [
                'name' => 'Zyrtec',
                'generic_name' => 'Cetirizine',
                'form' => 'Tablet',
                'strength' => '10',
                'unit' => 'mg',
            ],
            [
                'name' => 'Nexium',
                'generic_name' => 'Esomeprazole',
                'form' => 'Capsule',
                'strength' => '20',
                'unit' => 'mg',
            ],
            [
                'name' => 'Voltaren',
                'generic_name' => 'Diclofenac',
                'form' => 'Tablet',
                'strength' => '50',
                'unit' => 'mg',
            ],
            [
                'name' => 'Amoxil',
                'generic_name' => 'Amoxicillin',
                'form' => 'Capsule',
                'strength' => '500',
                'unit' => 'mg',
            ],
            [
                'name' => 'Cataflam',
                'generic_name' => 'Diclofenac Potassium',
                'form' => 'Tablet',
                'strength' => '50',
                'unit' => 'mg',
            ],
            [
                'name' => 'Flagyl',
                'generic_name' => 'Metronidazole',
                'form' => 'Tablet',
                'strength' => '500',
                'unit' => 'mg',
            ],
            [
                'name' => 'Vitamin C',
                'generic_name' => 'Ascorbic Acid',
                'form' => 'Tablet',
                'strength' => '500',
                'unit' => 'mg',
            ],
        ];


        foreach ($medications as $medication) {
            DB::table('medications')->insert([
                'clinic_id' => 1,
                'name' => $medication['name'],
                'generic_name' => $medication['generic_name'],
                'form' => $medication['form'],
                'strength' => $medication['strength'],
                'unit' => $medication['unit'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
