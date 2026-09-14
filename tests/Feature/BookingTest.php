<?php

use App\Models\Booking;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

test('authenticated user can view clinic bookings page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->get(route('clinics.booking', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can create a booking', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->post(route('clinics.booking.store', $clinic->slug), [
        'patient_id' => $patient->id,
        'doctor_id' => $user->id,
        'appointment_date' => '2026-09-15',
        'appointment_time' => '10:30',
        'type' => 'new',
        'status' => 'pending',
        'booking_source' => 'reception',
        'notes' => 'First time visit',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('bookings', [
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $user->id,
        'appointment_date' => '2026-09-15',
        'appointment_time' => '10:30',
        'type' => 'new',
        'status' => 'pending',
    ]);
});

test('authenticated user can create a booking for an unregistered patient', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.booking.store', $clinic->slug), [
        'name' => 'John Doe Walk-in',
        'phone' => '0123456789',
        'appointment_date' => '2026-09-16',
        'appointment_time' => '11:00',
        'type' => 'new',
        'status' => 'pending',
        'booking_source' => 'reception',
        'notes' => 'Walk-in without prior file',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('bookings', [
        'clinic_id' => $clinic->id,
        'patient_id' => null,
        'name' => 'John Doe Walk-in',
        'phone' => '0123456789',
        'doctor_id' => null,
        'appointment_date' => '2026-09-16',
        'appointment_time' => '11:00',
    ]);
});

test('authenticated user can update a booking', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $booking = Booking::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->put(route('clinics.booking.update', [$clinic->slug, $booking->id]), [
        'patient_id' => $booking->patient_id,
        'doctor_id' => $user->id,
        'appointment_date' => '2026-09-20',
        'appointment_time' => '14:00',
        'type' => 'follow_up',
        'status' => 'confirmed',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'appointment_date' => '2026-09-20',
        'type' => 'follow_up',
        'status' => 'confirmed',
    ]);
});

test('authenticated user can update booking status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $booking = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->patch(route('clinics.booking.update-status', [$clinic->slug, $booking->id]), [
        'status' => 'completed',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => 'completed',
    ]);
});

test('authenticated user can delete a booking', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $booking = Booking::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->delete(route('clinics.booking.destroy', [$clinic->slug, $booking->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('bookings', [
        'id' => $booking->id,
    ]);
});
