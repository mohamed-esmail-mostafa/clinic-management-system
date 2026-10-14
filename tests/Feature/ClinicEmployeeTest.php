<?php

use App\Models\Clinic;
use App\Models\ClinicUser;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('authenticated user can view clinic employees page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $role = Role::factory()->create(['type' => 'clinic']);

    ClinicUser::create([
        'clinic_id' => $clinic->id,
        'user_id' => $user->id,
        'role_id' => $role->id,
    ]);

    $response = $this->actingAs($user)->get(route('employees.page', $clinic->slug));

    $response->assertOk();
});

test('authenticated user can add a new employee to clinic', function () {
    $admin = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $doctorRole = Role::factory()->create(['name' => 'Doctor', 'slug' => 'doctor', 'type' => 'clinic']);

    $response = $this->actingAs($admin)->post(route('employees.store', $clinic->slug), [
        'mode' => 'new',
        'name' => 'Dr. Robert Smith',
        'email' => 'dr.robert@clinic.test',
        'password' => 'secret123456',
        'phone' => '+1234567890',
        'role_id' => $doctorRole->id,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $newEmployee = User::where('email', 'dr.robert@clinic.test')->first();
    expect($newEmployee)->not->toBeNull();
    expect($newEmployee->name)->toBe('Dr. Robert Smith');
    expect(Hash::check('secret123456', $newEmployee->password))->toBeTrue();

    $this->assertDatabaseHas('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $newEmployee->id,
        'role_id' => $doctorRole->id,
    ]);
});

test('authenticated user can assign an existing user as clinic employee', function () {
    $admin = User::factory()->create();
    $existingUser = User::factory()->create(['email' => 'nurse.sarah@clinic.test']);
    $clinic = Clinic::factory()->create();
    $nurseRole = Role::factory()->create(['name' => 'Nurse', 'slug' => 'nurse', 'type' => 'clinic']);

    $response = $this->actingAs($admin)->post(route('employees.store', $clinic->slug), [
        'mode' => 'existing',
        'user_id' => $existingUser->id,
        'role_id' => $nurseRole->id,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $existingUser->id,
        'role_id' => $nurseRole->id,
    ]);
});

test('authenticated user can update an employee details and role', function () {
    $admin = User::factory()->create();
    $employeeUser = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old.email@clinic.test',
        'phone' => '1111111111',
    ]);
    $clinic = Clinic::factory()->create();
    $oldRole = Role::factory()->create(['name' => 'Receptionist', 'slug' => 'receptionist']);
    $newRole = Role::factory()->create(['name' => 'Admin', 'slug' => 'admin']);

    ClinicUser::create([
        'clinic_id' => $clinic->id,
        'user_id' => $employeeUser->id,
        'role_id' => $oldRole->id,
    ]);

    $response = $this->actingAs($admin)->put(route('employees.update', ['slug' => $clinic->slug, 'user' => $employeeUser->id]), [
        'name' => 'Updated Staff Name',
        'email' => 'updated.email@clinic.test',
        'phone' => '9999999999',
        'role_id' => $newRole->id,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $employeeUser->refresh();
    expect($employeeUser->name)->toBe('Updated Staff Name');
    expect($employeeUser->email)->toBe('updated.email@clinic.test');
    expect($employeeUser->phone)->toBe('9999999999');

    $this->assertDatabaseHas('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $employeeUser->id,
        'role_id' => $newRole->id,
    ]);
});

test('authenticated user can remove an employee from clinic', function () {
    $admin = User::factory()->create();
    $employeeUser = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $role = Role::factory()->create();

    ClinicUser::create([
        'clinic_id' => $clinic->id,
        'user_id' => $employeeUser->id,
        'role_id' => $role->id,
    ]);

    $response = $this->actingAs($admin)->delete(route('employees.destroy', ['slug' => $clinic->slug, 'user' => $employeeUser->id]));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseMissing('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $employeeUser->id,
    ]);
    // The user record itself remains intact
    expect(User::find($employeeUser->id))->not->toBeNull();
});

test('authenticated user cannot remove themselves from clinic', function () {
    $admin = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $role = Role::factory()->create();

    ClinicUser::create([
        'clinic_id' => $clinic->id,
        'user_id' => $admin->id,
        'role_id' => $role->id,
    ]);

    $response = $this->actingAs($admin)->delete(route('employees.destroy', ['slug' => $clinic->slug, 'user' => $admin->id]));

    $response->assertRedirect();
    $response->assertSessionHas('error');

    $this->assertDatabaseHas('clinic_users', [
        'clinic_id' => $clinic->id,
        'user_id' => $admin->id,
    ]);
});
