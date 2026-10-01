<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitField;
use App\Models\VisitFieldValue;
use App\Services\CloudinaryService;

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

test('authenticated user can upload prescription image for a visit', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $visit = Visit::factory()->create(['clinic_id' => $clinic->id, 'patient_id' => $patient->id]);

    $mockCloudinary = Mockery::mock(CloudinaryService::class);
    $mockCloudinary->shouldReceive('uploadToCloudinary')
        ->once()
        ->with('data:image/png;base64,dummybase64data', 'prescriptions')
        ->andReturn([
            'url' => 'https://res.cloudinary.com/test-clinic/image/upload/sample_prescription.webp',
            'public_id' => 'prescriptions/sample_prescription',
        ]);
    $this->app->instance(CloudinaryService::class, $mockCloudinary);

    $response = $this->actingAs($user)->postJson(
        route('visits.prescription-image', [
            'clinic' => $clinic->slug,
            'patient' => $patient->id,
            'visit' => $visit->id,
        ]),
        [
            'image' => 'data:image/png;base64,dummybase64data',
        ]
    );

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'url' => 'https://res.cloudinary.com/test-clinic/image/upload/sample_prescription.webp',
        ]);

    $this->assertDatabaseHas('visits', [
        'id' => $visit->id,
        'image_url' => 'https://res.cloudinary.com/test-clinic/image/upload/sample_prescription.webp',
    ]);
});

test('upload prescription image validates image is required', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $visit = Visit::factory()->create(['clinic_id' => $clinic->id, 'patient_id' => $patient->id]);

    $response = $this->actingAs($user)->postJson(
        route('visits.prescription-image', [
            'clinic' => $clinic->slug,
            'patient' => $patient->id,
            'visit' => $visit->id,
        ]),
        []
    );

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['image']);
});

test('upload prescription image rejects visit belonging to different patient', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient1 = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $patient2 = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $visit = Visit::factory()->create(['clinic_id' => $clinic->id, 'patient_id' => $patient1->id]);

    $response = $this->actingAs($user)->postJson(
        route('visits.prescription-image', [
            'clinic' => $clinic->slug,
            'patient' => $patient2->id,
            'visit' => $visit->id,
        ]),
        [
            'image' => 'data:image/png;base64,dummybase64data',
        ]
    );

    $response->assertNotFound();
});

test('authenticated user can record a visit with custom field values', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $field1 = VisitField::create([
        'clinic_id' => $clinic->id,
        'label' => 'Blood Pressure',
        'type' => 'text',
        'unit' => 'mmHg',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $field2 = VisitField::create([
        'clinic_id' => $clinic->id,
        'label' => 'Symptoms',
        'type' => 'checkbox',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $response = $this->actingAs($user)->post(route('clinics.patients.visits.store', [$clinic->slug, $patient->id]), [
        'visited_at' => now()->toDateTimeString(),
        'type' => 'examination',
        'medications' => [],
        'custom_fields' => [
            $field1->id => '120/80',
            $field2->id => ['Fever', 'Cough'],
        ],
    ]);

    $response->assertRedirect();

    $visit = Visit::where('clinic_id', $clinic->id)->where('patient_id', $patient->id)->first();
    expect($visit)->not->toBeNull();

    $this->assertDatabaseHas('visit_field_values', [
        'visit_id' => $visit->id,
        'visit_field_id' => $field1->id,
        'value' => '120/80',
    ]);

    $this->assertDatabaseHas('visit_field_values', [
        'visit_id' => $visit->id,
        'visit_field_id' => $field2->id,
        'value' => json_encode(['Fever', 'Cough']),
    ]);
});

test('authenticated user can update a visit with custom field values', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $visit = Visit::factory()->create(['clinic_id' => $clinic->id, 'patient_id' => $patient->id]);

    $field = VisitField::create([
        'clinic_id' => $clinic->id,
        'label' => 'Temperature',
        'type' => 'number',
        'unit' => 'C',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    VisitFieldValue::create([
        'visit_id' => $visit->id,
        'visit_field_id' => $field->id,
        'value' => '37.5',
    ]);

    $response = $this->actingAs($user)->put(route('clinics.patients.visits.update', [$clinic->slug, $patient->id, $visit->id]), [
        'visited_at' => now()->toDateTimeString(),
        'type' => 'follow_up',
        'medications' => [],
        'custom_fields' => [
            $field->id => '38.2',
        ],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('visit_field_values', [
        'visit_id' => $visit->id,
        'visit_field_id' => $field->id,
        'value' => '38.2',
    ]);
});
