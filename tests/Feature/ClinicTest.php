<?php

use App\Models\City;
use App\Models\Clinic;
use App\Models\Country;
use App\Models\Governorate;
use App\Models\Role;
use App\Models\Specialty;
use App\Models\User;

test('authenticated user can view clinics page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.clinics.index'));

    $response->assertStatus(200);
});

test('authenticated user can create a clinic', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create();
    $governorate = Governorate::factory()->create(['country_id' => $country->id]);
    $city = City::factory()->create(['governorate_id' => $governorate->id]);
    $specialty = Specialty::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.clinics.store'), [
        'name' => 'Sunrise Health Clinic',
        'description' => 'A premier health center.',
        'phone' => '123456789',
        'address' => '123 Main Street',
        'country_id' => $country->id,
        'governorate_id' => $governorate->id,
        'city_id' => $city->id,
        'type' => 'personal',
        'is_active' => true,
        'specialty_ids' => [$specialty->id],
    ]);

    $response->assertRedirect(route('admin.clinics.index'));
    $this->assertDatabaseHas('clinics', [
        'name' => 'Sunrise Health Clinic',
        'country_id' => $country->id,
        'governorate_id' => $governorate->id,
        'city_id' => $city->id,
    ]);
});

test('authenticated user can update a clinic', function () {
    $user = User::factory()->create();
    $country = Country::factory()->create();
    $governorate = Governorate::factory()->create(['country_id' => $country->id]);
    $city = City::factory()->create(['governorate_id' => $governorate->id]);
    $clinic = Clinic::factory()->create([
        'country_id' => $country->id,
        'governorate_id' => $governorate->id,
        'city_id' => $city->id,
    ]);

    $response = $this->actingAs($user)->put(route('admin.clinics.update', $clinic->id), [
        'name' => 'Updated Clinic Name',
        'description' => 'Updated description',
        'phone' => '987654321',
        'address' => '456 New Street',
        'country_id' => $country->id,
        'governorate_id' => $governorate->id,
        'city_id' => $city->id,
        'type' => 'medical_center',
        'is_active' => true,
        'specialty_ids' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinics', [
        'id' => $clinic->id,
        'name' => 'Updated Clinic Name',
        'type' => 'medical_center',
    ]);
});

test('authenticated user can toggle clinic status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create(['is_active' => true]);

    $response = $this->actingAs($user)->patch(route('admin.clinics.toggle-status', $clinic->id));

    $response->assertRedirect();
    $this->assertDatabaseHas('clinics', [
        'id' => $clinic->id,
        'is_active' => false,
    ]);
});

test('authenticated user can delete a clinic', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.clinics.destroy', $clinic->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('clinics', [
        'id' => $clinic->id,
    ]);
});

test('authenticated user can add existing user to clinic', function () {
    $user = User::factory()->create();
    $targetUser = User::factory()->create();
    $role = Role::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.clinics.users.store', $clinic->id), [
        'mode' => 'existing',
        'user_id' => $targetUser->id,
        'role_id' => $role->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $targetUser->id,
        'role_id' => $role->id,
    ]);
});

test('authenticated user can create new user and attach to clinic', function () {
    $user = User::factory()->create();
    $role = Role::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.clinics.users.store', $clinic->id), [
        'mode' => 'new',
        'name' => 'Dr. Jane Smith',
        'email' => 'janesmith@example.com',
        'password' => 'password123',
        'phone' => '123456789',
        'role_id' => $role->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'janesmith@example.com',
    ]);
    $createdUser = User::where('email', 'janesmith@example.com')->first();
    $this->assertDatabaseHas('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $createdUser->id,
        'role_id' => $role->id,
    ]);
});

test('authenticated user can remove user from clinic', function () {
    $user = User::factory()->create();
    $targetUser = User::factory()->create();
    $role = Role::factory()->create();
    $clinic = Clinic::factory()->create();

    // Attach first
    $clinic->users()->attach($targetUser->id, ['role_id' => $role->id]);

    $response = $this->actingAs($user)->delete(route('admin.clinics.users.destroy', [$clinic->id, $targetUser->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $targetUser->id,
    ]);
});
