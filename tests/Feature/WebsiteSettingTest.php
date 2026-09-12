<?php

use App\Models\User;

test('authenticated user can view website settings page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.website-settings.index'));

    $response->assertStatus(200);
});

test('authenticated user can update website settings', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.website-settings.update'), [
        'title_en' => 'Clinic Management System',
        'title_ar' => 'نظام إدارة العيادات الطبية',
        'description_en' => 'Comprehensive medical clinic software.',
        'description_ar' => 'برنامج شامل لإدارة العيادات الطبية.',
        'keywords_en' => 'clinic, doctors, health',
        'keywords_ar' => 'عيادات، أطباء، صحة',
        'email' => 'contact@clinic.com',
        'phone' => '+201000000000',
        'address' => 'Cairo, Egypt',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('website_settings', [
        'title_en' => 'Clinic Management System',
        'title_ar' => 'نظام إدارة العيادات الطبية',
        'email' => 'contact@clinic.com',
    ]);
});
