<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\User;

test('authenticated user can view clinic medications page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->get(route('clinics.medications', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can create a medication', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.medications.store', $clinic->slug), [
        'name' => 'Amoxicillin 500mg',
        'generic_name' => 'Amoxicillin Trihydrate',
        'form' => 'Capsule',
        'strength' => '500',
        'unit' => 'mg',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('medications', [
        'clinic_id' => $clinic->id,
        'name' => 'Amoxicillin 500mg',
        'generic_name' => 'Amoxicillin Trihydrate',
        'form' => 'Capsule',
        'strength' => '500',
        'unit' => 'mg',
    ]);
});

test('authenticated user can update a medication', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $medication = Medication::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->put(route('clinics.medications.update', [$clinic->slug, $medication->id]), [
        'name' => 'Panadol Extra',
        'generic_name' => 'Paracetamol',
        'form' => 'Tablet',
        'strength' => '1000',
        'unit' => 'mg',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('medications', [
        'id' => $medication->id,
        'name' => 'Panadol Extra',
        'generic_name' => 'Paracetamol',
    ]);
});

test('authenticated user can toggle medication status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $medication = Medication::factory()->create([
        'clinic_id' => $clinic->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->patch(route('clinics.medications.toggle-status', [$clinic->slug, $medication->id]));

    $response->assertRedirect();
    $this->assertDatabaseHas('medications', [
        'id' => $medication->id,
        'is_active' => false,
    ]);
});

test('authenticated user can delete a medication', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $medication = Medication::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->delete(route('clinics.medications.destroy', [$clinic->slug, $medication->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('medications', [
        'id' => $medication->id,
    ]);
});
