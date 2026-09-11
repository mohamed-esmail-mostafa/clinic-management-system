<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCountryRequest;
use App\Http\Requests\UpdateCountryRequest;
use App\Models\Country;
use App\Services\CountryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CountryController extends Controller
{
    public function __construct(
        protected CountryService $countryService
    ) {}

    public function countries_page(): Response
    {
        $countries = $this->countryService->getAllCountries();

        return Inertia::render('countries/index', [
            'countries' => $countries,
        ]);
    }

    public function store(StoreCountryRequest $request): RedirectResponse
    {
        $this->countryService->createCountry($request->validated());

        return redirect()->back()->with('success', 'Country created successfully');
    }

    public function update(UpdateCountryRequest $request, Country $country): RedirectResponse
    {
        $this->countryService->updateCountry($country, $request->validated());

        return redirect()->back()->with('success', 'Country updated successfully');
    }

    public function destroy(Country $country): RedirectResponse
    {
        $this->countryService->deleteCountry($country);

        return redirect()->back()->with('success', 'Country deleted successfully');
    }

    public function toggleStatus(Country $country): RedirectResponse
    {
        $this->countryService->toggleCountryStatus($country);

        return redirect()->back()->with('success', 'Country status updated successfully');
    }
}
