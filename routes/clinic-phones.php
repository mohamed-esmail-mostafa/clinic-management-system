<?php

use App\Http\Controllers\ClinicPhoneController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(ClinicPhoneController::class)->group(function () {
        Route::get('/clinic/{slug}/phones/page', 'clinic_phones_page')->name('clinic.phones.page');
        Route::post('/clinic/{slug}/phones', 'store')->name('clinic.phones.store');
        Route::put('/clinic/{slug}/phones/{clinicPhone}', 'update')->name('clinic.phones.update');
        Route::delete('/clinic/{slug}/phones/{clinicPhone}', 'destroy')->name('clinic.phones.destroy');
        Route::patch('/clinic/{slug}/phones/{clinicPhone}/toggle-status', 'toggleStatus')->name('clinic.phones.toggle-status');
        Route::patch('/clinic/{slug}/phones/{clinicPhone}/toggle-primary', 'togglePrimary')->name('clinic.phones.toggle-primary');
    });
});
