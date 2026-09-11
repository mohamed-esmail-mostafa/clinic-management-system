<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Models\City;
use App\Services\CityService;
use App\Services\GovernorateService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
{
    public function __construct(
        protected CityService $cityService,
        protected GovernorateService $governorateService
    ) {}

    public function cities_page(): Response
    {
        $cities = $this->cityService->getAllCities();
        $governorates = $this->governorateService->getAllGovernorates();

        return Inertia::render('cities/index', [
            'cities' => $cities,
            'governorates' => $governorates,
        ]);
    }

    public function store(StoreCityRequest $request): RedirectResponse
    {
        $this->cityService->createCity($request->validated());

        return redirect()->back()->with('success', 'City created successfully');
    }

    public function update(UpdateCityRequest $request, City $city): RedirectResponse
    {
        $this->cityService->updateCity($city, $request->validated());

        return redirect()->back()->with('success', 'City updated successfully');
    }

    public function destroy(City $city): RedirectResponse
    {
        $this->cityService->deleteCity($city);

        return redirect()->back()->with('success', 'City deleted successfully');
    }

    public function toggleStatus(City $city): RedirectResponse
    {
        $this->cityService->toggleCityStatus($city);

        return redirect()->back()->with('success', 'City status updated successfully');
    }
}
