<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
                "name" => "Admin",
                "slug" => "admin"
            ],
            [
                "name" => "Doctor",
                "slug" => "doctor"
            ],
            [
                "name" => "Nurse",
                "slug" => "nurse"
            ],
            [
                "name" => "Receptionist",
                "slug" => "receptionist"
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
