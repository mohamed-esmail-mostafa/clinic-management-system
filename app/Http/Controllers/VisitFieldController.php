<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVisitFieldRequest;
use App\Http\Requests\UpdateVisitFieldRequest;
use App\Models\Clinic;
use App\Models\VisitField;
use App\Services\VisitFieldService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VisitFieldController extends Controller
{
    public function __construct(protected VisitFieldService $visit_field_service) {}

    public function visit_setting_page(string $slug): Response
    {
        $clinic = Clinic::where('slug', $slug)->firstOrFail();
        $fields = $this->visit_field_service->getFieldsForClinic($clinic);

        return Inertia::render('visits/settings', [
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

    public function store(StoreVisitFieldRequest $request, string $slug): RedirectResponse
    {
        $clinic = Clinic::where('slug', $slug)->firstOrFail();
        $this->visit_field_service->createField($clinic, $request->validated());

        return redirect()->back()->with('success', 'Visit field created successfully');
    }

    public function update(UpdateVisitFieldRequest $request, string $slug, VisitField $field): RedirectResponse
    {
        $this->visit_field_service->updateField($field, $request->validated());

        return redirect()->back()->with('success', 'Visit field updated successfully');
    }

    public function destroy(string $slug, VisitField $field): RedirectResponse
    {
        $this->visit_field_service->deleteField($field);

        return redirect()->back()->with('success', 'Visit field deleted successfully');
    }

    public function toggleStatus(string $slug, VisitField $field): RedirectResponse
    {
        $this->visit_field_service->toggleFieldStatus($field);

        return redirect()->back()->with('success', 'Visit field status updated successfully');
    }
}
