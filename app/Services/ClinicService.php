<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\ClinicUser;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ClinicService
{
    public function __construct(protected CloudinaryService $cloudinary_service) {}

    public function getAllClinics(): Collection
    {
        return Clinic::with(['country', 'governorate', 'city', 'clinicType', 'specialties', 'clinicUsers.user', 'clinicUsers.role'])
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

        $imageUrl = null;
        $publicId = null;

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $uploadResult = $this->cloudinary_service->uploadToCloudinary($data['image'], 'clinics');
            if ($uploadResult) {
                $imageUrl = $uploadResult['url'];
                $publicId = $uploadResult['public_id'];
            }
        } elseif (isset($data['image']) && is_string($data['image'])) {
            $imageUrl = $data['image'];
        }

        $clinic = new Clinic;
        $clinic->country_id = $data['country_id'] ?? null;
        $clinic->governorate_id = $data['governorate_id'] ?? null;
        $clinic->city_id = $data['city_id'] ?? null;
        $clinic->clinic_type_id = $data['clinic_type_id'] ?? null;
        $clinic->name = $name;
        $clinic->slug = $slug;
        $clinic->image = $imageUrl;
        $clinic->public_id = $publicId;
        $clinic->phone = $data['phone'] ?? null;
        $clinic->address = $data['address'] ?? null;
        $clinic->description = $data['description'] ?? null;
        $clinic->latitude = $data['latitude'] ?? null;
        $clinic->longitude = $data['longitude'] ?? null;
        $clinic->is_active = $data['is_active'] ?? true;
        $clinic->save();

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
                        'type' => 'clinic',
                    ]);
                }

                ClinicUser::create([
                    'clinic_id' => $clinic->id,
                    'user_id' => $user->id,
                    'role_id' => $ownerRole->id,
                ]);

                User::where('id', $user->id)->update([
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

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            if ($clinic->public_id) {
                $this->cloudinary_service->deleteFromCloudinary($clinic->public_id);
            }
            $uploadResult = $this->cloudinary_service->uploadToCloudinary($data['image'], 'clinics');
            if ($uploadResult) {
                $clinic->image = $uploadResult['url'];
                $clinic->public_id = $uploadResult['public_id'];
            }
        }

        $clinic->country_id = $data['country_id'] ?? $clinic->country_id;
        $clinic->governorate_id = $data['governorate_id'] ?? $clinic->governorate_id;
        $clinic->city_id = $data['city_id'] ?? $clinic->city_id;
        if (array_key_exists('clinic_type_id', $data)) {
            $clinic->clinic_type_id = $data['clinic_type_id'];
        }
        $clinic->name = $name;
        $clinic->slug = $slug;
        $clinic->phone = $data['phone'] ?? $clinic->phone;
        $clinic->address = $data['address'] ?? $clinic->address;
        $clinic->description = $data['description'] ?? $clinic->description;
        $clinic->latitude = $data['latitude'] ?? $clinic->latitude;
        $clinic->longitude = $data['longitude'] ?? $clinic->longitude;
        if (isset($data['is_active'])) {
            $clinic->is_active = $data['is_active'];
        }

        $updated = $clinic->save();

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

    public function addUserToClinic(Clinic $clinic, int $userId, int $roleId): ClinicUser
    {
        User::where('id', $userId)->update([
            'role_id' => $roleId,
        ]);

        return ClinicUser::updateOrCreate(
            [
                'clinic_id' => $clinic->id,
                'user_id' => $userId,
            ],
            [
                'role_id' => $roleId,
            ]
        );
    }

    public function removeUserFromClinic(Clinic $clinic, int $userId): bool
    {
        return (bool) ClinicUser::where('clinic_id', $clinic->id)
            ->where('user_id', $userId)
            ->delete();
    }

    public function getClinic(string $slug)
    {
        return Clinic::where('slug', $slug)->firstOrFail();
    }
}
