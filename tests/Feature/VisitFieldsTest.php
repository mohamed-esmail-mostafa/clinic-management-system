<?php

use App\Models\Clinic;
use App\Models\User;
use App\Models\VisitField;
use App\Models\VisitFieldOption;
use App\Models\WebsiteSetting;

test('authenticated user can view visit fields settings page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    WebsiteSetting::factory()->create();

    $response = $this->actingAs($user)->get(route('visit.setting.page', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can create a custom visit field', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.settings.visits.fields.store', $clinic->slug), [
        'label' => 'Blood Pressure',
        'type' => 'text',
        'unit' => 'mmHg',
        'is_required' => true,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('visit_fields', [
        'clinic_id' => $clinic->id,
        'label' => 'Blood Pressure',
        'type' => 'text',
        'unit' => 'mmHg',
        'is_required' => true,
        'is_active' => true,
    ]);
});

test('authenticated user can create custom visit field with options', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinics.settings.visits.fields.store', $clinic->slug), [
        'label' => 'Consciousness Level',
        'type' => 'select',
        'is_required' => false,
        'is_active' => true,
        'options' => [
            ['label' => 'Alert', 'value' => 'alert'],
            ['label' => 'Drowsy', 'value' => 'drowsy'],
        ],
    ]);

    $response->assertRedirect();
    $field = VisitField::where('clinic_id', $clinic->id)->where('label', 'Consciousness Level')->first();
    expect($field)->not->toBeNull();

    $this->assertDatabaseHas('visit_field_options', [
        'visit_field_id' => $field->id,
        'label' => 'Alert',
        'value' => 'alert',
    ]);
});

test('authenticated user can update custom visit field', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = VisitField::create([
        'clinic_id' => $clinic->id,
        'name' => 'temp',
        'label' => 'Body Temperature',
        'type' => 'number',
        'unit' => 'C',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->put(route('clinics.settings.visits.fields.update', [$clinic->slug, $field->id]), [
        'label' => 'Core Temperature',
        'type' => 'number',
        'unit' => '°C',
        'is_required' => true,
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('visit_fields', [
        'id' => $field->id,
        'label' => 'Core Temperature',
        'type' => 'number',
        'unit' => '°C',
        'is_required' => true,
        'sort_order' => 2,
    ]);
});

test('authenticated user can toggle custom visit field status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = VisitField::create([
        'clinic_id' => $clinic->id,
        'name' => 'oxygen_saturation',
        'label' => 'SpO2',
        'type' => 'number',
        'unit' => '%',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->patch(route('clinics.settings.visits.fields.toggle-status', [$clinic->slug, $field->id]));

    $response->assertRedirect();
    $this->assertDatabaseHas('visit_fields', [
        'id' => $field->id,
        'is_active' => false,
    ]);
});

test('authenticated user can delete custom visit field', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = VisitField::create([
        'clinic_id' => $clinic->id,
        'name' => 'temp_field',
        'label' => 'Temp Field',
        'type' => 'text',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->delete(route('clinics.settings.visits.fields.destroy', [$clinic->slug, $field->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('visit_fields', [
        'id' => $field->id,
    ]);
});

test('authenticated user can manage visit field options directly', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $field = VisitField::create([
        'clinic_id' => $clinic->id,
        'name' => 'pupil_reaction',
        'label' => 'Pupil Reaction',
        'type' => 'select',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    // Store option
    $response = $this->actingAs($user)->post(route('clinics.settings.visits.options.store', [$clinic->slug, $field->id]), [
        'label' => 'Brisk',
        'value' => 'brisk',
    ]);
    $response->assertRedirect();
    $this->assertDatabaseHas('visit_field_options', [
        'visit_field_id' => $field->id,
        'label' => 'Brisk',
        'value' => 'brisk',
    ]);

    $option = VisitFieldOption::where('visit_field_id', $field->id)->first();

    // Update option
    $response = $this->actingAs($user)->put(route('clinics.settings.visits.options.update', [$clinic->slug, $option->id]), [
        'label' => 'Sluggish',
        'value' => 'sluggish',
    ]);
    $response->assertRedirect();
    $this->assertDatabaseHas('visit_field_options', [
        'id' => $option->id,
        'label' => 'Sluggish',
        'value' => 'sluggish',
    ]);

    // Delete option
    $response = $this->actingAs($user)->delete(route('clinics.settings.visits.options.destroy', [$clinic->slug, $option->id]));
    $response->assertRedirect();
    $this->assertDatabaseMissing('visit_field_options', [
        'id' => $option->id,
    ]);
});
