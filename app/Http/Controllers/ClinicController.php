<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClinicRequest;
use App\Models\Clinic;
use App\Services\ClinicService;
use App\Services\CountryService;
use Inertia\Inertia;

class ClinicController extends Controller
{
    public function __construct(protected ClinicService $clinicService, protected CountryService $country_service) {}
    public function create_clinic_page()
    {
        return Inertia::render(
            'clinics/create',
            [
                'countries' => $this->country_service->getAllCountries()
            ]
        );
    }


    public function store_clinic(StoreClinicRequest $request)
    {
        $clinic = new Clinic();
        $clinic->name = $request->name;
        $clinic->description = $request->description;
        $clinic->address = $request->address;
        $clinic->phone = $request->phone;
        $clinic->type = $request->type;
        $clinic->save();
        return redirect()->back();
    }

    public function clinic_dashboard()
    {
        return Inertia::render('clinics/overview');
    }


    public function index()
    {
        return Inertia::render('clinics/index', [
            'clinics' => $this->clinicService->getAllClinics(),
            'countries' => $this->country_service->getAllCountries()
        ]);
    }
}
