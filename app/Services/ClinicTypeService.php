<?php

namespace App\Services;

use App\Models\ClinicType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ClinicTypeService
{
    public function getAllClinicTypes(): Collection
    {
        return ClinicType::withCount('clinics')->orderBy('id', 'desc')->get();
    }

    public function createClinicType(array $data): ClinicType
    {
        $slug = ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($data['title_en'] ?? $data['title_ar']);

        $clinicType = new ClinicType;
        $clinicType->title_ar = $data['title_ar'];
        $clinicType->title_en = $data['title_en'];
        $clinicType->slug = $slug;
        $clinicType->is_active = $data['is_active'] ?? true;
        $clinicType->save();

        return $clinicType;
    }

    public function updateClinicType(ClinicType $clinicType, array $data): bool
    {
        $slug = ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($data['title_en'] ?? $data['title_ar']);

        $clinicType->title_ar = $data['title_ar'];
        $clinicType->title_en = $data['title_en'];
        $clinicType->slug = $slug;
        if (isset($data['is_active'])) {
            $clinicType->is_active = (bool) $data['is_active'];
        }

        return $clinicType->save();
    }

    public function deleteClinicType(ClinicType $clinicType): ?bool
    {
        return $clinicType->delete();
    }

    public function toggleClinicTypeStatus(ClinicType $clinicType): ClinicType
    {
        $clinicType->is_active = ! $clinicType->is_active;
        $clinicType->save();

        return $clinicType;
    }
}
