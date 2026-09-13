<?php

use App\Models\Role;
use App\Models\User;
use App\Models\WebsiteSetting;

test('authenticated user can view roles index page', function () {
    $user = User::factory()->create();
    WebsiteSetting::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.roles.index'));

    $response->assertOk();
});

test('authenticated user can create a system role', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.roles.store'), [
        'name' => 'System Manager',
        'type' => 'system',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('roles', [
        'name' => 'System Manager',
        'slug' => 'system-manager',
        'type' => 'system',
    ]);
});

test('authenticated user can create a clinic role', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.roles.store'), [
        'name' => 'Clinic Pharmacist',
        'type' => 'clinic',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('roles', [
        'name' => 'Clinic Pharmacist',
        'slug' => 'clinic-pharmacist',
        'type' => 'clinic',
    ]);
});

test('role creation validation requires valid type', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.roles.store'), [
        'name' => 'Invalid Role',
        'type' => 'invalid_type',
    ]);

    $response->assertSessionHasErrors(['type']);
});

test('authenticated user can update a role', function () {
    $user = User::factory()->create();
    $role = Role::factory()->create([
        'name' => 'Old Role Name',
        'slug' => 'old-role-name',
        'type' => 'system',
    ]);

    $response = $this->actingAs($user)->put(route('admin.roles.update', $role->slug), [
        'name' => 'Updated Role Name',
        'type' => 'clinic',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('roles', [
        'id' => $role->id,
        'name' => 'Updated Role Name',
        'slug' => 'updated-role-name',
        'type' => 'clinic',
    ]);
});

test('authenticated user can delete a role', function () {
    $user = User::factory()->create();
    $role = Role::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.roles.destroy', $role->slug));

    $response->assertRedirect();
    $this->assertDatabaseMissing('roles', [
        'id' => $role->id,
    ]);
});
