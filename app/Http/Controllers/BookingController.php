<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\ClinicService;
use App\Services\PatientService;
use Carbon\Carbon;
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

    public function index(Request $request, string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $bookings = $this->booking_service->getClinicBookings(
            clinic: $clinic,
            search: $request->input('search'),
            status: $request->input('status'),
            type: $request->input('type'),
            date: $request->input('date'),
            perPage: (int) $request->input('per_page', 10),
        );
        $patients = $this->patient_service->getClinicPatients($clinic);
        $doctors = $clinic->users;

        $today = Carbon::today()->toDateString();
        $stats = [
            'total' => $clinic->bookings()->count(),
            'todays' => $clinic->bookings()->whereDate('appointment_date', $today)->count(),
            'confirmed' => $clinic->bookings()->where('status', 'confirmed')->count(),
            'pending' => $clinic->bookings()->where('status', 'pending')->count(),
        ];

        return Inertia::render('booking/index', [
            'clinic' => $clinic,
            'bookings' => $bookings,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'type' => $request->input('type', 'all'),
                'date' => $request->input('date', ''),
            ],
            'stats' => $stats,
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

    public function today_bookings(Request $request, string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $bookings = $this->booking_service->getClinicTodayBookings(
            clinic: $clinic,
            search: $request->input('search'),
            status: $request->input('status'),
            type: $request->input('type'),
            doctorId: $request->input('doctor_id'),
            perPage: (int) $request->input('per_page', 10),
        );
        $patients = $this->patient_service->getClinicPatients($clinic);
        $doctors = $clinic->users;

        $today = Carbon::today()->toDateString();
        $todayBookingsQuery = $clinic->bookings()->whereDate('appointment_date', $today);
        $total = (clone $todayBookingsQuery)->count();
        $pending = (clone $todayBookingsQuery)->where('status', 'pending')->count();
        $confirmed = (clone $todayBookingsQuery)->where('status', 'confirmed')->count();
        $completed = (clone $todayBookingsQuery)->where('status', 'completed')->count();
        $cancelled = (clone $todayBookingsQuery)->whereIn('status', ['cancelled', 'no_show'])->count();
        $completionRate = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        $stats = [
            'total' => $total,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'completionRate' => $completionRate,
        ];

        return Inertia::render('booking/today-bookings', [
            'clinic' => $clinic,
            'bookings' => $bookings,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'type' => $request->input('type', 'all'),
                'doctor_id' => $request->input('doctor_id', 'all'),
            ],
            'stats' => $stats,
        ]);
    }
}
