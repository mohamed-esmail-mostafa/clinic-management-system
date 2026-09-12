<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClinicTypeRequest;
use App\Http\Requests\UpdateClinicTypeRequest;
use App\Models\ClinicType;
use App\Services\ClinicTypeService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClinicTypeController extends Controller
{
    public function __construct(
        protected ClinicTypeService $clinicTypeService
    ) {}

    public function clinic_types_page(): Response
    {
        $clinicTypes = $this->clinicTypeService->getAllClinicTypes();

        return Inertia::render('clinic-types/index', [
            'clinicTypes' => $clinicTypes,
        ]);
    }

    public function store(StoreClinicTypeRequest $request): RedirectResponse
    {
        $this->clinicTypeService->createClinicType($request->validated());

        return redirect()->back()->with('success', 'Clinic type created successfully');
    }

    public function update(UpdateClinicTypeRequest $request, ClinicType $clinicType): RedirectResponse
    {
        $this->clinicTypeService->updateClinicType($clinicType, $request->validated());

        return redirect()->back()->with('success', 'Clinic type updated successfully');
    }

    public function destroy(ClinicType $clinicType): RedirectResponse
    {
        $this->clinicTypeService->deleteClinicType($clinicType);

        return redirect()->back()->with('success', 'Clinic type deleted successfully');
    }

    public function toggleStatus(ClinicType $clinicType): RedirectResponse
    {
        $this->clinicTypeService->toggleClinicTypeStatus($clinicType);

        return redirect()->back()->with('success', 'Clinic type status updated successfully');
    }
}
