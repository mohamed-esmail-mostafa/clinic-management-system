<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClinicRequest;
use App\Http\Requests\UpdateClinicRequest;
use App\Models\Clinic;
use App\Services\CityService;
use App\Services\ClinicService;
use App\Services\CountryService;
use App\Services\GovernorateService;
use App\Services\SpecialtyService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function __construct(
        protected ClinicService $clinicService,
        protected CountryService $countryService,
        protected GovernorateService $governorateService,
        protected CityService $cityService,
        protected SpecialtyService $specialtyService
    ) {}

    public function index(): Response
    {
        return Inertia::render('clinics/index', [
            'clinics' => $this->clinicService->getAllClinics(),
            'countries' => $this->countryService->getAllCountries(),
            'governorates' => $this->governorateService->getAllGovernorates(),
            'cities' => $this->cityService->getAllCities(),
            'specialties' => $this->specialtyService->getAllSpecialties(),
        ]);
    }

    public function create_clinic_page(): Response
    {
        return Inertia::render('clinics/create', [
            'countries' => $this->countryService->getAllCountries(),
            'governorates' => $this->governorateService->getAllGovernorates(),
            'cities' => $this->cityService->getAllCities(),
            'specialties' => $this->specialtyService->getAllSpecialties(),
        ]);
    }

    public function store_clinic(StoreClinicRequest $request): RedirectResponse
    {
        $this->clinicService->createClinic($request->validated(), $request->user());

        return redirect()->route('admin.clinics.index')->with('success', 'Clinic created successfully');
    }

    public function update(UpdateClinicRequest $request, Clinic $clinic): RedirectResponse
    {
        $this->clinicService->updateClinic($clinic, $request->validated());

        return redirect()->back()->with('success', 'Clinic updated successfully');
    }

    public function destroy(Clinic $clinic): RedirectResponse
    {
        $this->clinicService->deleteClinic($clinic);

        return redirect()->back()->with('success', 'Clinic deleted successfully');
    }

    public function toggleStatus(Clinic $clinic): RedirectResponse
    {
        $this->clinicService->toggleClinicStatus($clinic);

        return redirect()->back()->with('success', 'Clinic status updated successfully');
    }

    public function clinic_dashboard(): Response
    {
        return Inertia::render('clinics/overview');
    }
}
