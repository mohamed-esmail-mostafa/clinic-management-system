<?php

namespace App\Services;

use App\Models\Governorate;
use Illuminate\Database\Eloquent\Collection;

class GovernorateService
{
    public function getAllGovernorates(): Collection
    {
        return Governorate::with('country')
            ->withCount('cities')
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getGovernoratesByCountry(int $countryId): Collection
    {
        return Governorate::where('country_id', $countryId)
            ->where('is_active', true)
            ->get();
    }

    public function createGovernorate(array $data): Governorate
    {
        return Governorate::create([
            'country_id' => $data['country_id'],
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateGovernorate(Governorate $governorate, array $data): bool
    {
        return $governorate->update([
            'country_id' => $data['country_id'],
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'is_active' => $data['is_active'] ?? $governorate->is_active,
        ]);
    }

    public function deleteGovernorate(Governorate $governorate): ?bool
    {
        return $governorate->delete();
    }

    public function toggleGovernorateStatus(Governorate $governorate): Governorate
    {
        $governorate->update([
            'is_active' => ! $governorate->is_active,
        ]);

        return $governorate;
    }
}
