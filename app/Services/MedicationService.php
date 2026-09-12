<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\Medication;
use Illuminate\Database\Eloquent\Collection;

class MedicationService
{
    public function getClinicMedications(Clinic $clinic): Collection
    {
        return $clinic->medications()
            ->orderBy('id', 'desc')
            ->get();
    }

    public function createMedication(Clinic $clinic, array $data): Medication
    {
        $medication = new Medication;

        $medication->clinic_id = $clinic->id;
        $medication->name = $data['name'];
        $medication->generic_name = $data['generic_name'] ?? null;
        $medication->form = $data['form'] ?? null;
        $medication->strength = $data['strength'] ?? null;
        $medication->unit = $data['unit'] ?? null;
        $medication->is_active = isset($data['is_active']) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : true;

        $medication->save();

        return $medication;
    }

    public function updateMedication(Medication $medication, array $data): Medication
    {
        $medication->name = $data['name'];
        $medication->generic_name = $data['generic_name'] ?? null;
        $medication->form = $data['form'] ?? null;
        $medication->strength = $data['strength'] ?? null;
        $medication->unit = $data['unit'] ?? null;

        if (isset($data['is_active'])) {
            $medication->is_active = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $medication->save();

        return $medication;
    }

    public function deleteMedication(Medication $medication): ?bool
    {
        return $medication->delete();
    }

    public function toggleMedicationStatus(Medication $medication): Medication
    {
        $medication->is_active = ! $medication->is_active;
        $medication->save();

        return $medication;
    }
}
