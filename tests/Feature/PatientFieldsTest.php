<?php

use App\Models\Clinic;
use App\Models\PatientFields;
use App\Models\User;
use App\Models\WebsiteSetting;

test('authenticated user can view patient fields settings page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    WebsiteSetting::factory()->create();

    $response = $this->actingAs($user)->get(route('clinics.settings.patients.index', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can create a custom patient field', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.settings.patients.fields.store', $clinic->slug), [
        'label' => 'Blood Type',
        'type' => 'text',
        'is_required' => true,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('patient_fields', [
        'clinic_id' => $clinic->id,
        'label' => 'Blood Type',
        'type' => 'text',
        'is_required' => true,
        'is_active' => true,
    ]);
});

test('authenticated user can create custom patient field with options', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.settings.patients.fields.store', $clinic->slug), [
        'label' => 'Blood Group',
        'type' => 'select',
        'is_required' => false,
        'is_active' => true,
        'options' => [
            ['label' => 'O Positive', 'value' => 'o_positive'],
            ['label' => 'A Positive', 'value' => 'a_positive'],
        ],
    ]);

    $response->assertRedirect();
    $field = PatientFields::where('clinic_id', $clinic->id)->where('label', 'Blood Group')->first();
    expect($field)->not->toBeNull();

    $this->assertDatabaseHas('patient_field_options', [
        'patient_field_id' => $field->id,
        'label' => 'O Positive',
        'value' => 'o_positive',
    ]);
});

test('authenticated user can update custom patient field', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = PatientFields::create([
        'clinic_id' => $clinic->id,
        'name' => 'allergy_info',
        'label' => 'Allergy Info',
        'type' => 'text',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->put(route('clinics.settings.patients.fields.update', [$clinic->slug, $field->id]), [
        'label' => 'Updated Allergy Details',
        'type' => 'textarea',
        'is_required' => true,
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('patient_fields', [
        'id' => $field->id,
        'label' => 'Updated Allergy Details',
        'type' => 'textarea',
        'is_required' => true,
        'sort_order' => 2,
    ]);
});

test('authenticated user can toggle custom patient field status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = PatientFields::create([
        'clinic_id' => $clinic->id,
        'name' => 'notes',
        'label' => 'Notes',
        'type' => 'text',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->patch(route('clinics.settings.patients.fields.toggle-status', [$clinic->slug, $field->id]));

    $response->assertRedirect();
    $this->assertDatabaseHas('patient_fields', [
        'id' => $field->id,
        'is_active' => false,
    ]);
});

test('authenticated user can delete custom patient field', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = PatientFields::create([
        'clinic_id' => $clinic->id,
        'name' => 'temp_field',
        'label' => 'Temp Field',
        'type' => 'text',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->delete(route('clinics.settings.patients.fields.destroy', [$clinic->slug, $field->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('patient_fields', [
        'id' => $field->id,
    ]);
});
