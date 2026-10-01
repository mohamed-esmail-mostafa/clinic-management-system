<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Visit;
use App\Models\VisitFieldValue;
use App\Models\VisitMedication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VisitService
{
    public function __construct(
        protected CloudinaryService $cloudinary_service
    ) {}

    public function getPatientVisits(Clinic $clinic, Patient $patient): Collection
    {
        return Visit::where('clinic_id', $clinic->id)
            ->where('patient_id', $patient->id)
            ->with(['visitMedications.medication', 'fieldValues.field.options'])
            ->orderBy('visited_at', 'desc')
            ->get();
    }

    public function createVisit(Clinic $clinic, Patient $patient, array $data): Visit
    {
        return DB::transaction(function () use ($clinic, $patient, $data) {
            $visit = new Visit;
            $visit->clinic_id = $clinic->id;
            $visit->patient_id = $patient->id;
            $visit->visited_at = $data['visited_at'];
            $visit->type = $data['type'];
            $visit->save();

            if (! empty($data['medications']) && is_array($data['medications'])) {
                foreach ($data['medications'] as $medData) {
                    if (empty($medData['medication_name'])) {
                        continue;
                    }
                    $vm = new VisitMedication;
                    $vm->visit_id = $visit->id;
                    $vm->medication_id = ! empty($medData['medication_id']) ? $medData['medication_id'] : null;
                    $vm->medication_name = $medData['medication_name'];
                    $vm->save();
                }
            }

            if (isset($data['custom_fields']) && is_array($data['custom_fields'])) {
                $this->saveCustomFieldValues($visit, $data['custom_fields']);
            }

            return $visit->load(['visitMedications.medication', 'fieldValues.field.options']);
        });
    }

    public function updateVisit(Visit $visit, array $data): Visit
    {
        return DB::transaction(function () use ($visit, $data) {
            $visit->visited_at = $data['visited_at'];
            $visit->type = $data['type'];
            $visit->save();

            // Re-sync medications
            $visit->visitMedications()->delete();

            if (! empty($data['medications']) && is_array($data['medications'])) {
                foreach ($data['medications'] as $medData) {
                    if (empty($medData['medication_name'])) {
                        continue;
                    }
                    $vm = new VisitMedication;
                    $vm->visit_id = $visit->id;
                    $vm->medication_id = ! empty($medData['medication_id']) ? $medData['medication_id'] : null;
                    $vm->medication_name = $medData['medication_name'];
                    $vm->save();
                }
            }

            if (isset($data['custom_fields']) && is_array($data['custom_fields'])) {
                $this->saveCustomFieldValues($visit, $data['custom_fields']);
            }

            return $visit->load(['visitMedications.medication', 'fieldValues.field.options']);
        });
    }

    public function deleteVisit(Visit $visit): ?bool
    {
        return $visit->delete();
    }

    public function savePrescriptionImage(Visit $visit, string $imageData): ?string
    {
        $uploadResult = $this->cloudinary_service->uploadToCloudinary($imageData, 'prescriptions');

        if (! $uploadResult || empty($uploadResult['url'])) {
            return null;
        }

        $visit->update([
            'image_url' => $uploadResult['url'],
        ]);

        return $uploadResult['url'];
    }

    protected function saveCustomFieldValues(Visit $visit, array $customFields): void
    {
        foreach ($customFields as $fieldId => $value) {
            if (is_array($value)) {
                $value = json_encode(array_values($value));
            } elseif ($value !== null) {
                $value = (string) $value;
            }

            if ($value === null || $value === '') {
                VisitFieldValue::where('visit_id', $visit->id)
                    ->where('visit_field_id', $fieldId)
                    ->delete();
            } else {
                VisitFieldValue::updateOrCreate(
                    [
                        'visit_id' => $visit->id,
                        'visit_field_id' => $fieldId,
                    ],
                    [
                        'value' => $value,
                    ]
                );
            }
        }
    }
}
