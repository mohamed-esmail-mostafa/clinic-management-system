<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClinicPhoneRequest;
use App\Http\Requests\UpdateClinicPhoneRequest;
use App\Models\ClinicPhone;
use App\Services\ClinicPhoneService;
use App\Services\ClinicService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClinicPhoneController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected ClinicPhoneService $clinic_phone_service
    ) {}

    /**
     * Render the clinic phones management page.
     */
    public function clinic_phones_page(string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $phones = $this->clinic_phone_service->getClinicPhones($clinic);

        return Inertia::render('clinic-phones/index', [
            'clinic' => $clinic,
            'phones' => $phones,
        ]);
    }

    /**
     * Store a new clinic phone number.
     */
    public function store(StoreClinicPhoneRequest $request, string $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->clinic_phone_service->createClinicPhone($clinic, $request->validated());

        return redirect()->back()->with('success', 'Phone number added successfully.');
    }

    /**
     * Update an existing clinic phone number.
     */
    public function update(UpdateClinicPhoneRequest $request, string $slug, ClinicPhone $clinicPhone): RedirectResponse
    {
        $this->clinic_phone_service->updateClinicPhone($clinicPhone, $request->validated());

        return redirect()->back()->with('success', 'Phone number updated successfully.');
    }

    /**
     * Delete a clinic phone number.
     */
    public function destroy(string $slug, ClinicPhone $clinicPhone): RedirectResponse
    {
        $this->clinic_phone_service->deleteClinicPhone($clinicPhone);

        return redirect()->back()->with('success', 'Phone number deleted successfully.');
    }

    /**
     * Toggle the active status of a clinic phone.
     */
    public function toggleStatus(string $slug, ClinicPhone $clinicPhone): RedirectResponse
    {
        $this->clinic_phone_service->toggleStatus($clinicPhone);

        return redirect()->back()->with('success', 'Phone status updated successfully.');
    }

    /**
     * Set the clinic phone as primary.
     */
    public function togglePrimary(string $slug, ClinicPhone $clinicPhone): RedirectResponse
    {
        $this->clinic_phone_service->togglePrimary($clinicPhone);

        return redirect()->back()->with('success', 'Primary phone updated successfully.');
    }
}
