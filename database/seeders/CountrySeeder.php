<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = [
            [
                'name_ar' => 'مصر',
                'name_en' => 'Egypt',
                'code' => 'EG',
                'is_active' => true,
            ],
            [
                'name_ar' => 'السعودية',
                'name_en' => 'Saudi Arabia',
                'code' => 'SA',
                'is_active' => true,
            ],
            [
                'name_ar' => 'الإمارات العربية المتحدة',
                'name_en' => 'United Arab Emirates',
                'code' => 'AE',
                'is_active' => true,
            ],
            [
                'name_ar' => 'الكويت',
                'name_en' => 'Kuwait',
                'code' => 'KW',
                'is_active' => true,
            ],
            [
                'name_ar' => 'قطر',
                'name_en' => 'Qatar',
                'code' => 'QA',
                'is_active' => true,
            ],
            [
                'name_ar' => 'البحرين',
                'name_en' => 'Bahrain',
                'code' => 'BH',
                'is_active' => true,
            ],
            [
                'name_ar' => 'عمان',
                'name_en' => 'Oman',
                'code' => 'OM',
                'is_active' => true,
            ],
            [
                'name_ar' => 'الأردن',
                'name_en' => 'Jordan',
                'code' => 'JO',
                'is_active' => true,
            ],
        ];

        DB::table('countries')->upsert(
            $countries,
            ['code'],
            ['name_ar', 'name_en', 'is_active']
        );
    }
}
