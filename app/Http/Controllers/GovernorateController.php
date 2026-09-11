<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGovernorateRequest;
use App\Http\Requests\UpdateGovernorateRequest;
use App\Models\Governorate;
use App\Services\CountryService;
use App\Services\GovernorateService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GovernorateController extends Controller
{
    public function __construct(
        protected GovernorateService $governorateService,
        protected CountryService $countryService
    ) {}

    public function governorates_page(): Response
    {
        $governorates = $this->governorateService->getAllGovernorates();
        $countries = $this->countryService->getAllCountries();

        return Inertia::render('governorates/index', [
            'governorates' => $governorates,
            'countries' => $countries,
        ]);
    }

    public function store(StoreGovernorateRequest $request): RedirectResponse
    {
        $this->governorateService->createGovernorate($request->validated());

        return redirect()->back()->with('success', 'Governorate created successfully');
    }

    public function update(UpdateGovernorateRequest $request, Governorate $governorate): RedirectResponse
    {
        $this->governorateService->updateGovernorate($governorate, $request->validated());

        return redirect()->back()->with('success', 'Governorate updated successfully');
    }

    public function destroy(Governorate $governorate): RedirectResponse
    {
        $this->governorateService->deleteGovernorate($governorate);

        return redirect()->back()->with('success', 'Governorate deleted successfully');
    }

    public function toggleStatus(Governorate $governorate): RedirectResponse
    {
        $this->governorateService->toggleGovernorateStatus($governorate);

        return redirect()->back()->with('success', 'Governorate status updated successfully');
    }
}
