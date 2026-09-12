<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;

test('authenticated user can view patient visits page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->get(route('clinics.patients.visits', [$clinic->slug, $patient->id]));

    $response->assertStatus(200);
});

test('authenticated user can record a visit with prescribed medications', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $medication = Medication::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->post(route('clinics.patients.visits.store', [$clinic->slug, $patient->id]), [
        'visited_at' => now()->toDateTimeString(),
        'type' => 'examination',
        'medications' => [
            [
                'medication_id' => $medication->id,
                'medication_name' => 'Amoxicillin 500mg',
            ],
            [
                'medication_id' => null,
                'medication_name' => 'Panadol Extra',
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('visits', [
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'type' => 'examination',
    ]);
    $this->assertDatabaseHas('visit_medications', [
        'medication_name' => 'Amoxicillin 500mg',
    ]);
    $this->assertDatabaseHas('visit_medications', [
        'medication_name' => 'Panadol Extra',
    ]);
});

test('authenticated user can update a visit', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $visit = Visit::factory()->create(['clinic_id' => $clinic->id, 'patient_id' => $patient->id]);

    $response = $this->actingAs($user)->put(route('clinics.patients.visits.update', [$clinic->slug, $patient->id, $visit->id]), [
        'visited_at' => now()->toDateTimeString(),
        'type' => 'follow_up',
        'medications' => [
            [
                'medication_id' => null,
                'medication_name' => 'Ibuprofen 400mg',
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('visits', [
        'id' => $visit->id,
        'type' => 'follow_up',
    ]);
    $this->assertDatabaseHas('visit_medications', [
        'visit_id' => $visit->id,
        'medication_name' => 'Ibuprofen 400mg',
    ]);
});

test('authenticated user can delete a visit', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $visit = Visit::factory()->create(['clinic_id' => $clinic->id, 'patient_id' => $patient->id]);

    $response = $this->actingAs($user)->delete(route('clinics.patients.visits.destroy', [$clinic->slug, $patient->id, $visit->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('visits', [
        'id' => $visit->id,
    ]);
});
