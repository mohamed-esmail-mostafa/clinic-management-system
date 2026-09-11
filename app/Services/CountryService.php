<?php

namespace App\Services;

use App\Models\Country;
use Illuminate\Database\Eloquent\Collection;

class CountryService
{
    public function getAllCountries(): Collection
    {
        return Country::withCount('governorates')
            ->orderBy('id', 'desc')
            ->get();
    }

    public function createCountry(array $data): Country
    {
        return Country::create([
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'code' => isset($data['code']) && $data['code'] !== '' ? strtoupper($data['code']) : null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateCountry(Country $country, array $data): bool
    {
        return $country->update([
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'code' => isset($data['code']) && $data['code'] !== '' ? strtoupper($data['code']) : null,
            'is_active' => $data['is_active'] ?? $country->is_active,
        ]);
    }

    public function deleteCountry(Country $country): ?bool
    {
        return $country->delete();
    }

    public function toggleCountryStatus(Country $country): Country
    {
        $country->update([
            'is_active' => ! $country->is_active,
        ]);

        return $country;
    }
}
