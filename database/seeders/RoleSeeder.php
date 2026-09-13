<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'type' => 'system',
            ],
            [
                'name' => 'Doctor',
                'slug' => 'doctor',
                'type' => 'clinic',
            ],
            [
                'name' => 'Nurse',
                'slug' => 'nurse',
                'type' => 'clinic',
            ],
            [
                'name' => 'Receptionist',
                'slug' => 'receptionist',
                'type' => 'clinic',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}
