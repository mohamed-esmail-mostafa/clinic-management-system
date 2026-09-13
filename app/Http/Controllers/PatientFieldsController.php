<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientFieldsRequest;
use App\Http\Requests\UpdatePatientFieldsRequest;
use App\Models\Clinic;
use App\Models\PatientFields;
use App\Services\PatientFieldsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PatientFieldsController extends Controller
{
    public function __construct(protected PatientFieldsService $patientFieldsService) {}

    public function index(string $slug): Response
    {
        $clinic = Clinic::where('slug', $slug)->firstOrFail();
        $fields = $this->patientFieldsService->getFieldsForClinic($clinic);

        return Inertia::render('patients-settings/index', [
            'clinic' => $clinic,
            'fields' => $fields,
            'field_types' => [
                ['value' => 'text', 'label' => 'Text Input'],
                ['value' => 'number', 'label' => 'Number Input'],
                ['value' => 'textarea', 'label' => 'Text Area'],
                ['value' => 'select', 'label' => 'Dropdown Select'],
                ['value' => 'radio', 'label' => 'Radio Choice'],
                ['value' => 'checkbox', 'label' => 'Checkbox Group'],
                ['value' => 'date', 'label' => 'Date Picker'],
            ],
        ]);
    }

    public function store(StorePatientFieldsRequest $request, string $slug): RedirectResponse
    {
        $clinic = Clinic::where('slug', $slug)->firstOrFail();
        $this->patientFieldsService->createField($clinic, $request->validated());

        return redirect()->back()->with('success', 'Patient field created successfully');
    }

    public function update(UpdatePatientFieldsRequest $request, string $slug, PatientFields $field): RedirectResponse
    {
        $this->patientFieldsService->updateField($field, $request->validated());

        return redirect()->back()->with('success', 'Patient field updated successfully');
    }

    public function destroy(string $slug, PatientFields $field): RedirectResponse
    {
        $this->patientFieldsService->deleteField($field);

        return redirect()->back()->with('success', 'Patient field deleted successfully');
    }

    public function toggleStatus(string $slug, PatientFields $field): RedirectResponse
    {
        $this->patientFieldsService->toggleFieldStatus($field);

        return redirect()->back()->with('success', 'Patient field status updated successfully');
    }
}
