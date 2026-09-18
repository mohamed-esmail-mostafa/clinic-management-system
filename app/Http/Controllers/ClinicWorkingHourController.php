<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClinicWorkingHourRequest;
use App\Http\Requests\UpdateClinicWorkingHourRequest;
use App\Models\ClinicWorkingHour;
use App\Services\ClinicService;
use App\Services\ClinicWorkingHourService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicWorkingHourController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected ClinicWorkingHourService $clinic_working_hour
    ) {}

    /**
     * Render the clinic working hours management page.
     */
    public function clinic_working_hours_page(string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $workingHours = $this->clinic_working_hour->getClinicWorkingHours($clinic);

        return Inertia::render('clinic-working/index', [
            'clinic' => $clinic,
            'workingHours' => $workingHours,
        ]);
    }

    /**
     * Store a new working hour shift.
     */
    public function store(StoreClinicWorkingHourRequest $request, string $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->clinic_working_hour->createWorkingHour($clinic, $request->validated());

        return redirect()->back()->with('success', 'Working hour shift added successfully.');
    }

    /**
     * Update an existing working hour shift.
     */
    public function update(UpdateClinicWorkingHourRequest $request, string $slug, ClinicWorkingHour $clinicWorkingHour): RedirectResponse
    {
        $this->clinic_working_hour->updateWorkingHour($clinicWorkingHour, $request->validated());

        return redirect()->back()->with('success', 'Working hour shift updated successfully.');
    }

    /**
     * Delete a working hour shift.
     */
    public function destroy(string $slug, ClinicWorkingHour $clinicWorkingHour): RedirectResponse
    {
        $this->clinic_working_hour->deleteWorkingHour($clinicWorkingHour);

        return redirect()->back()->with('success', 'Working hour shift deleted successfully.');
    }

    /**
     * Toggle active status of a working hour shift.
     */
    public function toggleStatus(string $slug, ClinicWorkingHour $clinicWorkingHour): RedirectResponse
    {
        $this->clinic_working_hour->toggleStatus($clinicWorkingHour);

        return redirect()->back()->with('success', 'Working hour status updated successfully.');
    }

    /**
     * Bulk sync weekly schedule for the clinic.
     */
    public function syncSchedule(Request $request, string $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);

        $request->validate([
            'schedule' => ['required', 'array'],
            'schedule.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'schedule.*.start_time' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/'],
            'schedule.*.end_time' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/'],
            'schedule.*.is_active' => ['nullable', 'boolean'],
            'schedule.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->clinic_working_hour->syncWeeklySchedule($clinic, $request->input('schedule'));

        return redirect()->back()->with('success', 'Weekly schedule synced successfully.');
    }
}
