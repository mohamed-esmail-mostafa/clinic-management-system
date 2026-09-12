<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\ClinicService;
use App\Services\PatientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        protected ClinicService $clinic_service,
        protected BookingService $booking_service,
        protected PatientService $patient_service
    ) {}

    public function index($slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $bookings = $this->booking_service->getClinicBookings($clinic);
        $patients = $this->patient_service->getClinicPatients($clinic);
        $doctors = $clinic->users;

        return Inertia::render('booking/index', [
            'clinic' => $clinic,
            'bookings' => $bookings,
            'patients' => $patients,
            'doctors' => $doctors,
        ]);
    }

    public function store(StoreBookingRequest $request, $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $this->booking_service->createBooking($clinic, $request->validated());

        return redirect()->back()->with('success', 'Appointment booked successfully');
    }

    public function update(UpdateBookingRequest $request, $slug, Booking $booking): RedirectResponse
    {
        $this->booking_service->updateBooking($booking, $request->validated());

        return redirect()->back()->with('success', 'Appointment updated successfully');
    }

    public function updateStatus(Request $request, $slug, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,completed,cancelled,no_show'],
        ]);

        $this->booking_service->updateBookingStatus($booking, $validated['status']);

        return redirect()->back()->with('success', 'Appointment status updated successfully');
    }

    public function destroy($slug, Booking $booking): RedirectResponse
    {
        $this->booking_service->deleteBooking($booking);

        return redirect()->back()->with('success', 'Appointment deleted successfully');
    }
}
