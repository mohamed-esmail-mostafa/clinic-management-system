<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('authenticated user can view profile page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('auth.profile'));

    $response->assertOk();
});

test('unauthenticated user cannot view profile page', function () {
    $response = $this->get(route('auth.profile'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can update profile details', function () {
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
        'phone' => '1111111111',
    ]);

    $response = $this->actingAs($user)->post(route('auth.profile.update'), [
        'name' => 'New Name',
        'email' => 'new@example.com',
        'phone' => '2222222222',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $user->refresh();
    expect($user->name)->toBe('New Name');
    expect($user->email)->toBe('new@example.com');
    expect($user->phone)->toBe('2222222222');
});

test('authenticated user can update password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password-123'),
    ]);

    $response = $this->actingAs($user)->post(route('auth.profile.update'), [
        'name' => $user->name,
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $user->refresh();
    expect(Hash::check('new-secure-password', $user->password))->toBeTrue();
});

test('email must be unique among other users', function () {
    $otherUser = User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['email' => 'mine@example.com']);

    $response = $this->actingAs($user)->post(route('auth.profile.update'), [
        'name' => $user->name,
        'email' => 'taken@example.com',
    ]);

    $response->assertSessionHasErrors('email');
});
