<?php

use App\Models\Clinic;
use App\Models\ClinicWorkingHour;
use App\Models\User;

test('authenticated user can view clinic working hours page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->get(route('clinic.working.hours.page', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can add a clinic working hour shift', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinic.working.hours.store', $clinic->slug), [
        'day_of_week' => 6, // Saturday
        'start_time' => '09:00',
        'end_time' => '17:00',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_working_hours', [
        'clinic_id' => $clinic->id,
        'day_of_week' => 6,
        'start_time' => '09:00:00',
        'end_time' => '17:00:00',
        'is_active' => true,
        'sort_order' => 1,
    ]);
});

test('authenticated user can update a clinic working hour shift', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $shift = ClinicWorkingHour::factory()->create([
        'clinic_id' => $clinic->id,
        'day_of_week' => 1,
        'start_time' => '09:00:00',
        'end_time' => '14:00:00',
    ]);

    $response = $this->actingAs($user)->put(route('clinic.working.hours.update', [$clinic->slug, $shift->id]), [
        'day_of_week' => 1,
        'start_time' => '10:00',
        'end_time' => '18:00',
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_working_hours', [
        'id' => $shift->id,
        'day_of_week' => 1,
        'start_time' => '10:00:00',
        'end_time' => '18:00:00',
        'sort_order' => 2,
    ]);
});

test('authenticated user can toggle clinic working hour active status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $shift = ClinicWorkingHour::factory()->create([
        'clinic_id' => $clinic->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->patch(route('clinic.working.hours.toggle-status', [$clinic->slug, $shift->id]));

    $response->assertRedirect();
    expect($shift->fresh()->is_active)->toBeFalse();
});

test('authenticated user can delete a clinic working hour shift', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $shift = ClinicWorkingHour::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->delete(route('clinic.working.hours.destroy', [$clinic->slug, $shift->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('clinic_working_hours', [
        'id' => $shift->id,
    ]);
});

test('authenticated user can sync weekly schedule in bulk', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    // Pre-existing shift to be replaced
    ClinicWorkingHour::factory()->create(['clinic_id' => $clinic->id, 'day_of_week' => 0]);

    $response = $this->actingAs($user)->post(route('clinic.working.hours.sync', $clinic->slug), [
        'schedule' => [
            [
                'day_of_week' => 6,
                'start_time' => '09:00',
                'end_time' => '17:00',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'day_of_week' => 0,
                'start_time' => '10:00',
                'end_time' => '18:00',
                'is_active' => true,
                'sort_order' => 2,
            ],
        ],
    ]);

    $response->assertRedirect();
    expect($clinic->workingHours()->count())->toBe(2);
    $this->assertDatabaseHas('clinic_working_hours', [
        'clinic_id' => $clinic->id,
        'day_of_week' => 6,
        'start_time' => '09:00:00',
        'end_time' => '17:00:00',
    ]);
    $this->assertDatabaseHas('clinic_working_hours', [
        'clinic_id' => $clinic->id,
        'day_of_week' => 0,
        'start_time' => '10:00:00',
        'end_time' => '18:00:00',
    ]);
});
