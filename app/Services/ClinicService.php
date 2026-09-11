<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\ClinicUser;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ClinicService
{
    public function getAllClinics(): Collection
    {
        return Clinic::with(['country', 'governorate', 'city', 'specialties', 'users'])
            ->orderBy('id', 'desc')
            ->get();
    }

    public function createClinic(array $data, ?User $user = null): Clinic
    {
        $name = $data['name'];
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (Clinic::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $clinic = Clinic::create([
            'country_id' => $data['country_id'] ?? null,
            'governorate_id' => $data['governorate_id'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'name' => $name,
            'slug' => $slug,
            'type' => $data['type'] ?? 'personal',
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'description' => $data['description'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        // Sync specialties if provided
        if (! empty($data['specialty_ids']) && is_array($data['specialty_ids'])) {
            $clinic->specialties()->sync($data['specialty_ids']);
        }

        // Attach user to clinic_users if user provided and user has no clinic yet
        if ($user) {
            $existingAssociation = ClinicUser::where('user_id', $user->id)->first();
            if (! $existingAssociation) {
                // Get owner or first role
                $ownerRole = Role::where('slug', 'owner')->orWhere('slug', 'admin')->first()
                    ?? Role::first();

                if (! $ownerRole) {
                    $ownerRole = Role::create([
                        'name' => 'Owner',
                        'slug' => 'owner',
                    ]);
                }

                ClinicUser::create([
                    'clinic_id' => $clinic->id,
                    'user_id' => $user->id,
                    'role_id' => $ownerRole->id,
                ]);
            }
        }

        return $clinic;
    }

    public function updateClinic(Clinic $clinic, array $data): bool
    {
        $name = $data['name'];
        $slug = $clinic->slug;

        if ($name !== $clinic->name) {
            $baseSlug = Str::slug($name);
            $slug = $baseSlug;
            $counter = 1;

            while (Clinic::where('slug', $slug)->where('id', '!=', $clinic->id)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }
        }

        $updated = $clinic->update([
            'country_id' => $data['country_id'] ?? $clinic->country_id,
            'governorate_id' => $data['governorate_id'] ?? $clinic->governorate_id,
            'city_id' => $data['city_id'] ?? $clinic->city_id,
            'name' => $name,
            'slug' => $slug,
            'type' => $data['type'] ?? $clinic->type,
            'phone' => $data['phone'] ?? $clinic->phone,
            'address' => $data['address'] ?? $clinic->address,
            'description' => $data['description'] ?? $clinic->description,
            'latitude' => $data['latitude'] ?? $clinic->latitude,
            'longitude' => $data['longitude'] ?? $clinic->longitude,
            'is_active' => $data['is_active'] ?? $clinic->is_active,
        ]);

        if (isset($data['specialty_ids']) && is_array($data['specialty_ids'])) {
            $clinic->specialties()->sync($data['specialty_ids']);
        }

        return $updated;
    }

    public function deleteClinic(Clinic $clinic): ?bool
    {
        return $clinic->delete();
    }

    public function toggleClinicStatus(Clinic $clinic): Clinic
    {
        $clinic->update([
            'is_active' => ! $clinic->is_active,
        ]);

        return $clinic;
    }
}
