<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Clinic;
use Illuminate\Database\Eloquent\Collection;

class BookingService
{
    public function getClinicBookings(Clinic $clinic): Collection
    {
        return $clinic->bookings()
            ->with(['patient', 'doctor'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'asc')
            ->get();
    }

    public function createBooking(Clinic $clinic, array $data): Booking
    {
        $booking = new Booking;

        $booking->clinic_id = $clinic->id;
        $booking->patient_id = ! empty($data['patient_id']) ? $data['patient_id'] : null;
        $booking->doctor_id = ! empty($data['doctor_id']) ? $data['doctor_id'] : null;
        $booking->appointment_date = $data['appointment_date'];
        $booking->appointment_time = $data['appointment_time'];
        $booking->type = $data['type'] ?? 'new';
        $booking->status = $data['status'] ?? 'pending';
        $booking->booking_source = $data['booking_source'] ?? 'reception';
        $booking->booked_by = $data['booked_by'] ?? auth()->user()?->name ?? 'Reception';
        $booking->notes = $data['notes'] ?? null;

        $booking->save();

        return $booking->load(['patient', 'doctor']);
    }

    public function updateBooking(Booking $booking, array $data): Booking
    {
        $booking->patient_id = ! empty($data['patient_id']) ? $data['patient_id'] : null;
        $booking->doctor_id = ! empty($data['doctor_id']) ? $data['doctor_id'] : null;
        $booking->appointment_date = $data['appointment_date'];
        $booking->appointment_time = $data['appointment_time'];
        $booking->type = $data['type'] ?? 'new';
        if (isset($data['status'])) {
            $booking->status = $data['status'];
        }
        if (isset($data['booking_source'])) {
            $booking->booking_source = $data['booking_source'];
        }
        if (isset($data['booked_by'])) {
            $booking->booked_by = $data['booked_by'];
        }
        $booking->notes = $data['notes'] ?? null;

        $booking->save();

        return $booking->load(['patient', 'doctor']);
    }

    public function updateBookingStatus(Booking $booking, string $status): Booking
    {
        $booking->status = $status;
        $booking->save();

        return $booking->load(['patient', 'doctor']);
    }

    public function deleteBooking(Booking $booking): ?bool
    {
        return $booking->delete();
    }
}
