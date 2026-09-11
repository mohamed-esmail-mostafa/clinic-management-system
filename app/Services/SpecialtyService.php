<?php

namespace App\Services;

use App\Models\Specialty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class SpecialtyService
{
    public function getAllSpecialties(): Collection
    {
        return Specialty::orderBy('id', 'desc')->get();
    }

    public function createSpecialty(array $data): Specialty
    {
        $slug = isset($data['slug']) && ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($data['name_en'] ?? $data['name_ar']);

        return Specialty::create([
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'slug' => $slug,
            'description_ar' => $data['description_ar'] ?? '',
            'description_en' => $data['description_en'] ?? '',
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateSpecialty(Specialty $specialty, array $data): bool
    {
        $slug = isset($data['slug']) && ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($data['name_en'] ?? $data['name_ar']);

        return $specialty->update([
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'slug' => $slug,
            'description_ar' => $data['description_ar'] ?? '',
            'description_en' => $data['description_en'] ?? '',
            'is_active' => $data['is_active'] ?? $specialty->is_active,
        ]);
    }

    public function deleteSpecialty(Specialty $specialty): ?bool
    {
        return $specialty->delete();
    }

    public function toggleSpecialtyStatus(Specialty $specialty): Specialty
    {
        $specialty->update([
            'is_active' => ! $specialty->is_active,
        ]);

        return $specialty;
    }
}
