<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicationRequest;
use App\Http\Requests\UpdateMedicationRequest;
use App\Models\Medication;
use App\Services\ClinicService;
use App\Services\MedicationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MedicationController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected MedicationService $medication_service
    ) {}

    public function index($slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $medications = $this->medication_service->getClinicMedications($clinic);

        return Inertia::render('medications/index', [
            'clinic' => $clinic,
            'medications' => $medications,
        ]);
    }

    public function store(StoreMedicationRequest $request, $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->medication_service->createMedication($clinic, $request->validated());

        return redirect()->back()->with('success', 'Medication created successfully');
    }

    public function update(UpdateMedicationRequest $request, $slug, Medication $medication): RedirectResponse
    {
        $this->medication_service->updateMedication($medication, $request->validated());

        return redirect()->back()->with('success', 'Medication updated successfully');
    }

    public function destroy($slug, Medication $medication): RedirectResponse
    {
        $this->medication_service->deleteMedication($medication);

        return redirect()->back()->with('success', 'Medication deleted successfully');
    }

    public function toggleStatus($slug, Medication $medication): RedirectResponse
    {
        $this->medication_service->toggleMedicationStatus($medication);

        return redirect()->back()->with('success', 'Medication status updated successfully');
    }
}
