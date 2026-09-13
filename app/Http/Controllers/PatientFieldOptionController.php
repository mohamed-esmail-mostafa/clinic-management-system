<?php

namespace App\Http\Controllers;

use App\Models\PatientFieldOption;
use App\Models\PatientFields;
use App\Services\PatientFieldsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PatientFieldOptionController extends Controller
{
    public function __construct(protected PatientFieldsService $patientFieldsService) {}

    public function store(Request $request, string $slug, PatientFields $field): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->patientFieldsService->addOptionToField($field, $validated);

        return redirect()->back()->with('success', 'Option added successfully');
    }

    public function update(Request $request, string $slug, PatientFieldOption $option): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->patientFieldsService->updateOption($option, $validated);

        return redirect()->back()->with('success', 'Option updated successfully');
    }

    public function destroy(string $slug, PatientFieldOption $option): RedirectResponse
    {
        $this->patientFieldsService->deleteOption($option);

        return redirect()->back()->with('success', 'Option deleted successfully');
    }
}
