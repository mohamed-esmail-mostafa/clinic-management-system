<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Visit;
use App\Models\VisitMedication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VisitService
{
    public function getPatientVisits(Clinic $clinic, Patient $patient): Collection
    {
        return Visit::where('clinic_id', $clinic->id)
            ->where('patient_id', $patient->id)
            ->with(['visitMedications.medication'])
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

            return $visit->load('visitMedications.medication');
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

            return $visit->load('visitMedications.medication');
        });
    }

    public function deleteVisit(Visit $visit): ?bool
    {
        return $visit->delete();
    }
}
