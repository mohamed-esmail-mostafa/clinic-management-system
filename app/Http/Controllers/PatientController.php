<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Models\PatientFields;
use App\Services\ClinicService;
use App\Services\PatientService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected PatientService $patient_service
    ) {}

    public function clinics_patients($slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $patients = $this->patient_service->getClinicPatients($clinic);
        $customFields = PatientFields::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->with('options')
            ->orderBy('sort_order', 'asc')
            ->get();

        return Inertia::render('patients/patients-clinic', [
            'clinic' => $clinic,
            'patients' => $patients,
            'custom_fields' => $customFields,
        ]);
    }

    public function store(StorePatientRequest $request, $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->patient_service->createPatient($clinic, $request->validated());

        return redirect()->back()->with('success', 'Patient created successfully');
    }

    public function update(UpdatePatientRequest $request, $slug, Patient $patient): RedirectResponse
    {
        $this->patient_service->updatePatient($patient, $request->validated());

        return redirect()->back()->with('success', 'Patient updated successfully');
    }

    public function destroy($slug, Patient $patient): RedirectResponse
    {
        $this->patient_service->deletePatient($patient);

        return redirect()->back()->with('success', 'Patient deleted successfully');
    }

    public function toggleStatus($slug, Patient $patient): RedirectResponse
    {
        $this->patient_service->togglePatientStatus($patient);

        return redirect()->back()->with('success', 'Patient status updated successfully');
    }
}
