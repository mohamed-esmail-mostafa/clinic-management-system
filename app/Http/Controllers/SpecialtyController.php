<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpecialtyRequest;
use App\Http\Requests\UpdateSpecialtyRequest;
use App\Models\Specialty;
use App\Services\SpecialtyService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SpecialtyController extends Controller
{
    public function __construct(
        protected SpecialtyService $specialtyService
    ) {}

    public function specialties_page(): Response
    {
        $specialties = $this->specialtyService->getAllSpecialties();

        return Inertia::render('specialties/index', [
            'specialties' => $specialties,
        ]);
    }

    public function store(StoreSpecialtyRequest $request): RedirectResponse
    {
        $this->specialtyService->createSpecialty($request->validated());

        return redirect()->back()->with('success', 'Specialty created successfully');
    }

    public function update(UpdateSpecialtyRequest $request, Specialty $specialty): RedirectResponse
    {
        $this->specialtyService->updateSpecialty($specialty, $request->validated());

        return redirect()->back()->with('success', 'Specialty updated successfully');
    }

    public function destroy(Specialty $specialty): RedirectResponse
    {
        $this->specialtyService->deleteSpecialty($specialty);

        return redirect()->back()->with('success', 'Specialty deleted successfully');
    }

    public function toggleStatus(Specialty $specialty): RedirectResponse
    {
        $this->specialtyService->toggleSpecialtyStatus($specialty);

        return redirect()->back()->with('success', 'Specialty status updated successfully');
    }
}
