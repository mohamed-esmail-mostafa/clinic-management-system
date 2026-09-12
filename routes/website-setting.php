<?php

use App\Http\Controllers\WebsiteSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(WebsiteSettingController::class)->group(function () {
        Route::get('/admin/website-settings', 'website_settings_page')->name('admin.website-settings.index');
        Route::post('/admin/website-settings', 'update')->name('admin.website-settings.update');
    });
});
