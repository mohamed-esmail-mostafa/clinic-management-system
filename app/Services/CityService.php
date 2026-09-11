<?php

namespace App\Services;

use App\Models\City;
use Illuminate\Database\Eloquent\Collection;

class CityService
{
    public function getAllCities(): Collection
    {
        return City::with('governorate.country')
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getCitiesByGovernorate(int $governorateId): Collection
    {
        return City::where('governorate_id', $governorateId)
            ->where('is_active', true)
            ->get();
    }

    public function createCity(array $data): City
    {
        return City::create([
            'governorate_id' => $data['governorate_id'],
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateCity(City $city, array $data): bool
    {
        return $city->update([
            'governorate_id' => $data['governorate_id'],
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'is_active' => $data['is_active'] ?? $city->is_active,
        ]);
    }

    public function deleteCity(City $city): ?bool
    {
        return $city->delete();
    }

    public function toggleCityStatus(City $city): City
    {
        $city->update([
            'is_active' => ! $city->is_active,
        ]);

        return $city;
    }
}
