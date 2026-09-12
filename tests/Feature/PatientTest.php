<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

test('authenticated user can view clinic patients page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->get(route('clinics.patients', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can create a patient using service and controller', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.patients.store', $clinic->slug), [
        'first_name' => 'John',
        'middle_name' => 'Michael',
        'last_name' => 'Doe',
        'gender' => 'male',
        'phone' => '1234567890',
        'email' => 'john.doe@example.com',
        'has_insurance' => true,
        'insurance_company' => 'Health Care Inc',
        'blood_type' => 'O+',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('patients', [
        'clinic_id' => $clinic->id,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@example.com',
        'blood_type' => 'O+',
    ]);
});

test('authenticated user can update a patient', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->put(route('clinics.patients.update', [$clinic->slug, $patient->id]), [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'phone' => '0987654321',
        'gender' => 'female',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('patients', [
        'id' => $patient->id,
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'phone' => '0987654321',
    ]);
});

test('authenticated user can toggle patient status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create([
        'clinic_id' => $clinic->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->patch(route('clinics.patients.toggle-status', [$clinic->slug, $patient->id]));

    $response->assertRedirect();
    $this->assertDatabaseHas('patients', [
        'id' => $patient->id,
        'is_active' => false,
    ]);
});

test('authenticated user can delete a patient', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->delete(route('clinics.patients.destroy', [$clinic->slug, $patient->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('patients', [
        'id' => $patient->id,
    ]);
});
