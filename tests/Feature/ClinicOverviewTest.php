<?php

use App\Models\Booking;
use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Role;
use App\Models\User;
use App\Models\Visit;
use App\Models\WebsiteSetting;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('unauthenticated user cannot view clinic overview page', function () {
    $response = $this->get(route('clinics.overview'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can view clinic overview page when no clinic exists', function () {
    $user = User::factory()->create();
    WebsiteSetting::factory()->create();

    $response = $this->actingAs($user)->get(route('clinics.overview'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('clinics/overview')
        ->where('clinic', null)
        ->where('stats.total_patients', 0)
        ->where('stats.todays_bookings', 0)
    );
});

test('authenticated user can view clinic overview with accurate metrics, chart and appointments', function () {
    WebsiteSetting::factory()->create();
    $user = User::factory()->create();
    $role = Role::factory()->create();
    $clinic = Clinic::factory()->create(['slug' => 'test-clinic']);
    $clinic->users()->attach($user->id, ['role_id' => $role->id]);

    // Create patients
    $patient1 = Patient::factory()->create(['clinic_id' => $clinic->id, 'created_at' => Carbon::now()]);
    $patient2 = Patient::factory()->create(['clinic_id' => $clinic->id, 'created_at' => Carbon::now()->subMonths(2)]);

    // Create bookings for today
    Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient1->id,
        'appointment_date' => Carbon::today()->toDateString(),
        'status' => 'confirmed',
    ]);
    Booking::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient2->id,
        'appointment_date' => Carbon::today()->toDateString(),
        'status' => 'pending',
    ]);

    // Create visits
    Visit::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient1->id,
        'visited_at' => Carbon::today()->toDateTimeString(),
        'type' => 'examination',
    ]);
    Visit::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient2->id,
        'visited_at' => Carbon::yesterday()->toDateTimeString(),
        'type' => 'follow_up',
    ]);

    // Create medications
    Medication::factory()->create([
        'clinic_id' => $clinic->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->get(route('clinics.overview', ['clinic' => $clinic->slug]));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('clinics/overview')
        ->where('clinic.id', $clinic->id)
        ->where('stats.total_patients', 2)
        ->where('stats.new_patients_this_month', 1)
        ->where('stats.todays_bookings', 2)
        ->where('stats.todays_confirmed_bookings', 1)
        ->where('stats.total_visits', 2)
        ->where('stats.active_medications', 1)
        ->has('visits_chart', 14)
        ->has('todays_appointments', 2)
        ->has('recent_visits', 2)
    );
});
