<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Models\PatientFields;
use App\Services\ClinicService;
use App\Services\PatientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected PatientService $patient_service
    ) {}

    public function clinics_patients(Request $request, string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        // $patients = $this->patient_service->getClinicPatients($clinic);
        $patients = $this->patient_service->getClinicPatients(
            clinic: $clinic,
            search: $request->input('search'),
            gender: $request->input('gender'),
            status: $request->input('status'),
            perPage: (int) $request->input('per_page', 10),
        );
        $customFields = PatientFields::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->with('options')
            ->orderBy('sort_order', 'asc')
            ->get();

        $stats = [
            'total' => $clinic->patients()->count(),
            'active' => $clinic->patients()->where('is_active', true)->count(),
            'inactive' => $clinic->patients()->where('is_active', false)->count(),
            'customFieldsCount' => $customFields->count(),
        ];

        return Inertia::render('patients/patients-clinic', [
            'clinic' => $clinic,
            'patients' => $patients,
            'custom_fields' => $customFields,
            'filters' => [
                'search' => $request->input('search', ''),
                'gender' => $request->input('gender', 'all'),
                'status' => $request->input('status', 'all'),
            ],
            'stats' => $stats,
        ]);
    }

    public function create(string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $customFields = PatientFields::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->with('options')
            ->orderBy('sort_order', 'asc')
            ->get();

        return Inertia::render('patients/create', [
            'clinic' => $clinic,
            'custom_fields' => $customFields,
        ]);
    }

    public function edit(string $slug, Patient $patient): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $patient->load(['fieldValues']);
        $customFields = PatientFields::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->with('options')
            ->orderBy('sort_order', 'asc')
            ->get();

        return Inertia::render('patients/update', [
            'clinic' => $clinic,
            'patient' => $patient,
            'custom_fields' => $customFields,
        ]);
    }

    public function store(StorePatientRequest $request, string $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->patient_service->createPatient($clinic, $request->validated());

        return redirect()->route('clinics.patients', ['slug' => $slug])->with('success', 'Patient created successfully');
    }

    public function update(UpdatePatientRequest $request, string $slug, Patient $patient): RedirectResponse
    {
        $this->patient_service->updatePatient($patient, $request->validated());

        return redirect()->route('clinics.patients', ['slug' => $slug])->with('success', 'Patient updated successfully');
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
