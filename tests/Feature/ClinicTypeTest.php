<?php

use App\Models\ClinicType;
use App\Models\User;

test('authenticated user can view clinic types page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.clinic-types.index'));

    $response->assertStatus(200);
});

test('authenticated user can create a clinic type', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.clinic-types.store'), [
        'title_ar' => 'عيادة دمج',
        'title_en' => 'Integrated Clinic',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_types', [
        'title_ar' => 'عيادة دمج',
        'title_en' => 'Integrated Clinic',
        'slug' => 'integrated-clinic',
        'is_active' => true,
    ]);
});

test('authenticated user can update a clinic type', function () {
    $user = User::factory()->create();
    $clinicType = ClinicType::factory()->create();

    $response = $this->actingAs($user)->put(route('admin.clinic-types.update', $clinicType->id), [
        'title_ar' => 'عيادة متخصصة جديدة',
        'title_en' => 'New Specialized Clinic',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_types', [
        'id' => $clinicType->id,
        'title_ar' => 'عيادة متخصصة جديدة',
        'title_en' => 'New Specialized Clinic',
        'slug' => 'new-specialized-clinic',
    ]);
});

test('authenticated user can toggle clinic type status', function () {
    $user = User::factory()->create();
    $clinicType = ClinicType::factory()->create([
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->patch(route('admin.clinic-types.toggle-status', $clinicType->id));

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_types', [
        'id' => $clinicType->id,
        'is_active' => false,
    ]);
});

test('authenticated user can delete a clinic type', function () {
    $user = User::factory()->create();
    $clinicType = ClinicType::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.clinic-types.destroy', $clinicType->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('clinic_types', [
        'id' => $clinicType->id,
    ]);
});
