<?php

use App\Models\Clinic;
use App\Models\ClinicPhone;
use App\Models\User;

test('authenticated user can view clinic phones page', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->get(route('clinic.phones.page', $clinic->slug));

    $response->assertStatus(200);
});

test('authenticated user can add a clinic phone', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($user)->post(route('clinic.phones.store', $clinic->slug), [
        'phone' => '01012345678',
        'type' => 'mobile',
        'label' => 'Main Reception',
        'country_code' => '+20',
        'is_whatsapp' => true,
        'is_primary' => true,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_phones', [
        'clinic_id' => $clinic->id,
        'phone' => '01012345678',
        'label' => 'Main Reception',
        'is_whatsapp' => true,
        'is_primary' => true,
    ]);
});

test('setting a phone as primary resets previous primary phone', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();

    $oldPhone = ClinicPhone::factory()->create([
        'clinic_id' => $clinic->id,
        'phone' => '01100000000',
        'is_primary' => true,
    ]);

    $this->actingAs($user)->post(route('clinic.phones.store', $clinic->slug), [
        'phone' => '01200000000',
        'type' => 'mobile',
        'is_primary' => true,
    ]);

    expect($oldPhone->fresh()->is_primary)->toBeFalse();
    $this->assertDatabaseHas('clinic_phones', [
        'clinic_id' => $clinic->id,
        'phone' => '01200000000',
        'is_primary' => true,
    ]);
});

test('authenticated user can update a clinic phone', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $phone = ClinicPhone::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->put(route('clinic.phones.update', [$clinic->slug, $phone->id]), [
        'phone' => '01599999999',
        'type' => 'landline',
        'label' => 'Emergency Room',
        'is_whatsapp' => false,
        'is_primary' => false,
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('clinic_phones', [
        'id' => $phone->id,
        'phone' => '01599999999',
        'label' => 'Emergency Room',
    ]);
});

test('authenticated user can toggle clinic phone active status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $phone = ClinicPhone::factory()->create([
        'clinic_id' => $clinic->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->patch(route('clinic.phones.toggle-status', [$clinic->slug, $phone->id]));

    $response->assertRedirect();
    expect($phone->fresh()->is_active)->toBeFalse();
});

test('authenticated user can toggle clinic phone primary status', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $phone1 = ClinicPhone::factory()->create(['clinic_id' => $clinic->id, 'is_primary' => true]);
    $phone2 = ClinicPhone::factory()->create(['clinic_id' => $clinic->id, 'is_primary' => false]);

    $response = $this->actingAs($user)->patch(route('clinic.phones.toggle-primary', [$clinic->slug, $phone2->id]));

    $response->assertRedirect();
    expect($phone1->fresh()->is_primary)->toBeFalse();
    expect($phone2->fresh()->is_primary)->toBeTrue();
});

test('authenticated user can delete a clinic phone', function () {
    $user = User::factory()->create();
    $clinic = Clinic::factory()->create();
    $phone = ClinicPhone::factory()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->delete(route('clinic.phones.destroy', [$clinic->slug, $phone->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('clinic_phones', [
        'id' => $phone->id,
    ]);
});
