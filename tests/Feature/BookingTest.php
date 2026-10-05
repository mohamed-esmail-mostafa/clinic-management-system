<?php

use App\Models\Booking;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

test('authenticated user can view clinic bookings page with pagination and stats', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id, 'first_name' => 'John', 'last_name' => 'Doe']);

    Booking::factory()->count(15)->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'appointment_date' => now()->toDateString(),
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($user)->get(route('clinics.booking', $clinic->slug));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('booking/index')
        ->has('bookings.data', 10)
        ->where('bookings.total', 15)
        ->where('bookings.current_page', 1)
        ->where('stats.total', 15)
        ->where('stats.confirmed', 15)
        ->has('filters')
    );
});

test('clinic bookings can be filtered by search, status, type, and date', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patientA = Patient::factory()->create(['clinic_id' => $clinic->id, 'first_name' => 'Alice']);
    $patientB = Patient::factory()->create(['clinic_id' => $clinic->id, 'first_name' => 'Bob']);

    $targetDate = now()->addDays(2)->toDateString();

    $match = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patientA->id,
        'appointment_date' => $targetDate,
        'status' => 'confirmed',
        'type' => 'new',
    ]);

    $other = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patientB->id,
        'appointment_date' => now()->toDateString(),
        'status' => 'pending',
        'type' => 'follow_up',
    ]);

    $response = $this->actingAs($user)->get(route('clinics.booking', [
        'slug' => $clinic->slug,
        'search' => 'Alice',
        'status' => 'confirmed',
        'type' => 'new',
        'date' => $targetDate,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('booking/index')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.id', $match->id)
        ->where('bookings.total', 1)
    );
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

test('authenticated user can view clinic today bookings page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->get(route('clinics.today.booking', $clinic->slug));

    $response->assertStatus(200);
});

test('today bookings returns only bookings scheduled for today including pending and completed', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $today = now()->toDateString();
    $tomorrow = now()->addDay()->toDateString();

    // Today pending
    $todayPending = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'appointment_date' => $today,
        'appointment_time' => '09:00',
        'status' => 'pending',
    ]);

    // Today completed
    $todayCompleted = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'appointment_date' => $today,
        'appointment_time' => '11:00',
        'status' => 'completed',
    ]);

    // Tomorrow booking
    $tomorrowBooking = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'appointment_date' => $tomorrow,
        'appointment_time' => '10:00',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->get(route('clinics.today.booking', $clinic->slug));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('booking/today-bookings')
        ->has('bookings.data', 2)
        ->where('bookings.total', 2)
        ->where('bookings.data.0.id', $todayPending->id)
        ->where('bookings.data.1.id', $todayCompleted->id)
        ->where('stats.total', 2)
        ->where('stats.pending', 1)
        ->where('stats.completed', 1)
        ->has('filters')
    );
});

test('today bookings can be filtered by status and search', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $today = now()->toDateString();

    $bookingA = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'name' => 'Special Patient Alpha',
        'appointment_date' => $today,
        'status' => 'pending',
    ]);

    $bookingB = Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'name' => 'Other Patient Beta',
        'appointment_date' => $today,
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($user)->get(route('clinics.today.booking', [
        'slug' => $clinic->slug,
        'search' => 'Alpha',
        'status' => 'pending',
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('booking/today-bookings')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.id', $bookingA->id)
        ->where('stats.total', 2)
        ->where('filters.search', 'Alpha')
        ->where('filters.status', 'pending')
    );
});
