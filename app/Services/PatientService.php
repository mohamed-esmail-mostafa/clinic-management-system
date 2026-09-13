<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\PatientFieldValue;
use Illuminate\Database\Eloquent\Collection;

class PatientService
{
    public function getClinicPatients(Clinic $clinic): Collection
    {
        return $clinic->patients()
            ->with(['fieldValues.field'])
            ->orderBy('id', 'desc')
            ->get();
    }

    public function generatePatientNumber(Clinic $clinic): string
    {
        $count = Patient::where('clinic_id', $clinic->id)->count() + 1;

        return 'PAT-'.str_pad((string) $count, 5, '0', STR_PAD_LEFT);
    }

    public function createPatient(Clinic $clinic, array $data): Patient
    {
        $patient = new Patient;

        $patient->clinic_id = $clinic->id;
        $patient->patient_number = ! empty($data['patient_number']) ? $data['patient_number'] : $this->generatePatientNumber($clinic);
        $patient->first_name = $data['first_name'];
        $patient->last_name = $data['last_name'];
        $patient->gender = $data['gender'] ?? null;
        $patient->date_of_birth = $data['date_of_birth'] ?? null;
        $patient->phone = $data['phone'] ?? null;
        $patient->secondary_phone = $data['secondary_phone'] ?? null;
        $patient->address = $data['address'] ?? null;
        $patient->emergency_contact_name = $data['emergency_contact_name'] ?? null;
        $patient->emergency_contact_phone = $data['emergency_contact_phone'] ?? null;
        $patient->emergency_contact_relation = $data['emergency_contact_relation'] ?? null;
        $patient->blood_type = $data['blood_type'] ?? null;
        $patient->notes = $data['notes'] ?? null;
        $patient->marital_status = $data['marital_status'] ?? null;
        $patient->is_active = isset($data['is_active']) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : true;

        $patient->save();

        if (! empty($data['custom_fields']) && is_array($data['custom_fields'])) {
            $this->saveCustomFieldValues($patient, $data['custom_fields']);
        }

        return $patient;
    }

    public function updatePatient(Patient $patient, array $data): Patient
    {
        if (! empty($data['patient_number'])) {
            $patient->patient_number = $data['patient_number'];
        }

        $patient->first_name = $data['first_name'];
        $patient->last_name = $data['last_name'];
        $patient->gender = $data['gender'] ?? null;
        $patient->date_of_birth = $data['date_of_birth'] ?? null;
        $patient->phone = $data['phone'] ?? null;
        $patient->secondary_phone = $data['secondary_phone'] ?? null;
        $patient->address = $data['address'] ?? null;
        $patient->emergency_contact_name = $data['emergency_contact_name'] ?? null;
        $patient->emergency_contact_phone = $data['emergency_contact_phone'] ?? null;
        $patient->emergency_contact_relation = $data['emergency_contact_relation'] ?? null;
        $patient->blood_type = $data['blood_type'] ?? null;
        $patient->notes = $data['notes'] ?? null;
        $patient->marital_status = $data['marital_status'] ?? null;

        if (isset($data['is_active'])) {
            $patient->is_active = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $patient->save();

        if (isset($data['custom_fields']) && is_array($data['custom_fields'])) {
            $this->saveCustomFieldValues($patient, $data['custom_fields']);
        }

        return $patient;
    }

    public function deletePatient(Patient $patient): ?bool
    {
        return $patient->delete();
    }

    public function togglePatientStatus(Patient $patient): Patient
    {
        $patient->is_active = ! $patient->is_active;
        $patient->save();

        return $patient;
    }

    protected function saveCustomFieldValues(Patient $patient, array $customFields): void
    {
        foreach ($customFields as $fieldId => $value) {
            if (is_array($value)) {
                $value = json_encode(array_values($value));
            } elseif ($value !== null) {
                $value = (string) $value;
            }

            if ($value === null || $value === '') {
                PatientFieldValue::where('patient_id', $patient->id)
                    ->where('patient_field_id', $fieldId)
                    ->delete();
            } else {
                PatientFieldValue::updateOrCreate(
                    [
                        'patient_id' => $patient->id,
                        'patient_field_id' => $fieldId,
                    ],
                    [
                        'value' => $value,
                    ]
                );
            }
        }
    }
}
