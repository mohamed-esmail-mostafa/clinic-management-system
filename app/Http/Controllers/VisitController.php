<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVisitRequest;
use App\Http\Requests\UpdateVisitRequest;
use App\Models\Patient;
use App\Models\Visit;
use App\Services\ClinicService;
use App\Services\MedicationService;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected VisitService $visit_service,
        protected MedicationService $medication_service
    ) {}

    public function patientVisits($slug, Patient $patient): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $visits = $this->visit_service->getPatientVisits($clinic, $patient);
        $medications = $this->medication_service->getClinicMedications($clinic);

        return Inertia::render('visits/index', [
            'clinic' => $clinic,
            'patient' => $patient,
            'visits' => $visits,
            'medications' => $medications,
        ]);
    }

    public function store(StoreVisitRequest $request, $slug, Patient $patient): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->visit_service->createVisit($clinic, $patient, $request->validated());

        return redirect()->back()->with('success', 'Visit recorded successfully');
    }

    public function update(UpdateVisitRequest $request, $slug, Patient $patient, Visit $visit): RedirectResponse
    {
        $this->visit_service->updateVisit($visit, $request->validated());

        return redirect()->back()->with('success', 'Visit updated successfully');
    }

    public function destroy($slug, Patient $patient, Visit $visit): RedirectResponse
    {
        $this->visit_service->deleteVisit($visit);

        return redirect()->back()->with('success', 'Visit deleted successfully');
    }

    public function uploadPrescriptionImage(Request $request, $clinic, Patient $patient, Visit $visit): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'string'],
        ]);

        if ($visit->patient_id !== $patient->id) {
            return response()->json([
                'success' => false,
                'message' => 'Visit does not belong to this patient.',
            ], 404);
        }

        $url = $this->visit_service->savePrescriptionImage($visit, $request->input('image'));

        if (! $url) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload prescription image to Cloudinary.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'url' => $url,
            'message' => 'Prescription image generated and uploaded successfully.',
        ]);
    }
}
