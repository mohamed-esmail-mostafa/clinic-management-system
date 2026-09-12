<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Collection;

class PatientService
{
    public function getClinicPatients(Clinic $clinic): Collection
    {
        return $clinic->patients()
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
        $patient->middle_name = $data['middle_name'] ?? null;
        $patient->last_name = $data['last_name'];
        $patient->gender = $data['gender'] ?? null;
        $patient->date_of_birth = $data['date_of_birth'] ?? null;
        $patient->phone = $data['phone'] ?? null;
        $patient->secondary_phone = $data['secondary_phone'] ?? null;
        $patient->email = $data['email'] ?? null;
        $patient->address = $data['address'] ?? null;
        $patient->city = $data['city'] ?? null;
        $patient->country = $data['country'] ?? null;
        $patient->national_id = $data['national_id'] ?? null;
        $patient->passport_number = $data['passport_number'] ?? null;
        $patient->emergency_contact_name = $data['emergency_contact_name'] ?? null;
        $patient->emergency_contact_phone = $data['emergency_contact_phone'] ?? null;
        $patient->emergency_contact_relation = $data['emergency_contact_relation'] ?? null;
        $patient->blood_type = $data['blood_type'] ?? null;
        $patient->allergies = $data['allergies'] ?? null;
        $patient->chronic_diseases = $data['chronic_diseases'] ?? null;
        $patient->medical_history = $data['medical_history'] ?? null;
        $patient->surgical_history = $data['surgical_history'] ?? null;
        $patient->family_medical_history = $data['family_medical_history'] ?? null;
        $patient->has_insurance = filter_var($data['has_insurance'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $patient->insurance_company = $data['insurance_company'] ?? null;
        $patient->insurance_number = $data['insurance_number'] ?? null;
        $patient->insurance_expiry_date = $data['insurance_expiry_date'] ?? null;
        $patient->notes = $data['notes'] ?? null;
        $patient->occupation = $data['occupation'] ?? null;
        $patient->marital_status = $data['marital_status'] ?? null;
        $patient->is_active = isset($data['is_active']) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : true;

        $patient->save();

        return $patient;
    }

    public function updatePatient(Patient $patient, array $data): Patient
    {
        if (! empty($data['patient_number'])) {
            $patient->patient_number = $data['patient_number'];
        }

        $patient->first_name = $data['first_name'];
        $patient->middle_name = $data['middle_name'] ?? null;
        $patient->last_name = $data['last_name'];
        $patient->gender = $data['gender'] ?? null;
        $patient->date_of_birth = $data['date_of_birth'] ?? null;
        $patient->phone = $data['phone'] ?? null;
        $patient->secondary_phone = $data['secondary_phone'] ?? null;
        $patient->email = $data['email'] ?? null;
        $patient->address = $data['address'] ?? null;
        $patient->city = $data['city'] ?? null;
        $patient->country = $data['country'] ?? null;
        $patient->national_id = $data['national_id'] ?? null;
        $patient->passport_number = $data['passport_number'] ?? null;
        $patient->emergency_contact_name = $data['emergency_contact_name'] ?? null;
        $patient->emergency_contact_phone = $data['emergency_contact_phone'] ?? null;
        $patient->emergency_contact_relation = $data['emergency_contact_relation'] ?? null;
        $patient->blood_type = $data['blood_type'] ?? null;
        $patient->allergies = $data['allergies'] ?? null;
        $patient->chronic_diseases = $data['chronic_diseases'] ?? null;
        $patient->medical_history = $data['medical_history'] ?? null;
        $patient->surgical_history = $data['surgical_history'] ?? null;
        $patient->family_medical_history = $data['family_medical_history'] ?? null;
        $patient->has_insurance = filter_var($data['has_insurance'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $patient->insurance_company = $data['insurance_company'] ?? null;
        $patient->insurance_number = $data['insurance_number'] ?? null;
        $patient->insurance_expiry_date = $data['insurance_expiry_date'] ?? null;
        $patient->notes = $data['notes'] ?? null;
        $patient->occupation = $data['occupation'] ?? null;
        $patient->marital_status = $data['marital_status'] ?? null;

        if (isset($data['is_active'])) {
            $patient->is_active = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $patient->save();

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
}
