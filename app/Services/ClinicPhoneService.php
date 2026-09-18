<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\ClinicPhone;
use Illuminate\Database\Eloquent\Collection;

class ClinicPhoneService
{
    /**
     * Retrieve all phone records for a clinic ordered by primary status and sort order.
     */
    public function getClinicPhones(Clinic $clinic): Collection
    {
        return $clinic->phones()
            ->orderBy('is_primary', 'desc')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Create a new clinic phone using Eloquent ORM.
     */
    public function createClinicPhone(Clinic $clinic, array $data): ClinicPhone
    {
        $isPrimary = isset($data['is_primary']) ? filter_var($data['is_primary'], FILTER_VALIDATE_BOOLEAN) : false;

        // If newly created phone is set as primary, ensure other phones in this clinic are un-set
        if ($isPrimary) {
            $clinic->phones()->update(['is_primary' => false]);
        }

        $phone = new ClinicPhone;
        $phone->clinic_id = $clinic->id;
        $phone->type = $data['type'] ?? 'phone';
        $phone->label = $data['label'] ?? null;
        $phone->phone = $data['phone'];
        $phone->country_code = $data['country_code'] ?? null;
        $phone->is_whatsapp = isset($data['is_whatsapp']) ? filter_var($data['is_whatsapp'], FILTER_VALIDATE_BOOLEAN) : false;
        $phone->is_primary = $isPrimary;
        $phone->is_active = isset($data['is_active']) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : true;
        $phone->sort_order = isset($data['sort_order']) ? (int) $data['sort_order'] : 0;

        $phone->save();

        return $phone;
    }

    /**
     * Update an existing clinic phone using Eloquent ORM.
     */
    public function updateClinicPhone(ClinicPhone $clinicPhone, array $data): ClinicPhone
    {
        $isPrimary = isset($data['is_primary']) ? filter_var($data['is_primary'], FILTER_VALIDATE_BOOLEAN) : $clinicPhone->is_primary;

        // If phone is marked as primary, reset other phones for this clinic
        if ($isPrimary) {
            ClinicPhone::where('clinic_id', $clinicPhone->clinic_id)
                ->where('id', '!=', $clinicPhone->id)
                ->update(['is_primary' => false]);
        }

        $clinicPhone->type = $data['type'] ?? $clinicPhone->type;
        $clinicPhone->label = $data['label'] ?? null;
        $clinicPhone->phone = $data['phone'] ?? $clinicPhone->phone;
        $clinicPhone->country_code = $data['country_code'] ?? null;

        if (isset($data['is_whatsapp'])) {
            $clinicPhone->is_whatsapp = filter_var($data['is_whatsapp'], FILTER_VALIDATE_BOOLEAN);
        }

        $clinicPhone->is_primary = $isPrimary;

        if (isset($data['is_active'])) {
            $clinicPhone->is_active = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        if (isset($data['sort_order'])) {
            $clinicPhone->sort_order = (int) $data['sort_order'];
        }

        $clinicPhone->save();

        return $clinicPhone;
    }

    /**
     * Delete a clinic phone record using Eloquent ORM.
     */
    public function deleteClinicPhone(ClinicPhone $clinicPhone): ?bool
    {
        return $clinicPhone->delete();
    }

    /**
     * Toggle active status of a clinic phone.
     */
    public function toggleStatus(ClinicPhone $clinicPhone): ClinicPhone
    {
        $clinicPhone->is_active = ! $clinicPhone->is_active;
        $clinicPhone->save();

        return $clinicPhone;
    }

    /**
     * Set a phone as primary and clear other primary flags for the clinic.
     */
    public function togglePrimary(ClinicPhone $clinicPhone): ClinicPhone
    {
        ClinicPhone::where('clinic_id', $clinicPhone->clinic_id)
            ->where('id', '!=', $clinicPhone->id)
            ->update(['is_primary' => false]);

        $clinicPhone->is_primary = true;
        $clinicPhone->save();

        return $clinicPhone;
    }
}
