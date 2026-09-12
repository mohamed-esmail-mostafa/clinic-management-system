<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WebsiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('website_settings')->updateOrInsert(
            ['id' => 1],
            [
                'title_en' => 'Clinic Management System',
                'title_ar' => 'نظام إدارة العيادات',

                'description_en' => 'A complete clinic management system for managing patients, appointments, visits, prescriptions, and clinic operations.',
                'description_ar' => 'نظام متكامل لإدارة العيادات والمرضى والحجوزات والزيارات والروشتات وإدارة العمليات.',

                'keywords_en' => 'clinic management, clinic system, medical clinic, patients, appointments',
                'keywords_ar' => 'إدارة العيادات, نظام عيادات, عيادة, مرضى, حجوزات, روشتات',

                'logo' => null,
                'dark_logo' => null,
                'public_logo_id' => null,
                'public_dark_logo_id' => null,

                'favicon' => null,
                'public_favicon_id' => null,

                'email' => null,
                'phone' => null,
                'address' => null,

                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}
