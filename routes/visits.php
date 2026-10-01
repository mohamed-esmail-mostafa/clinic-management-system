<?php

use App\Http\Controllers\VisitController;
use App\Http\Controllers\VisitFieldController;
use App\Http\Controllers\VisitFieldOptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(VisitController::class)->group(function () {
        Route::get('/clinic/{slug}/patients/{patient}/visits', 'patientVisits')->name('clinics.patients.visits');
        Route::post('/clinic/{slug}/patients/{patient}/visits', 'store')->name('clinics.patients.visits.store');
        Route::put('/clinic/{slug}/patients/{patient}/visits/{visit}', 'update')->name('clinics.patients.visits.update');
        Route::delete('/clinic/{slug}/patients/{patient}/visits/{visit}', 'destroy')->name('clinics.patients.visits.destroy');
        Route::post('/clinic/{clinic}/patients/{patient}/visits/{visit}/prescription-image', 'uploadPrescriptionImage')->name('visits.prescription-image');
    });

    Route::controller(VisitFieldController::class)->group(function () {
        Route::get('/clinic/settings/{slug}/visits', 'visit_setting_page')->name('visit.setting.page');
        Route::post('/clinic/settings/{slug}/visits/fields', 'store')->name('clinics.settings.visits.fields.store');
        Route::put('/clinic/settings/{slug}/visits/fields/{field}', 'update')->name('clinics.settings.visits.fields.update');
        Route::delete('/clinic/settings/{slug}/visits/fields/{field}', 'destroy')->name('clinics.settings.visits.fields.destroy');
        Route::patch('/clinic/settings/{slug}/visits/fields/{field}/toggle-status', 'toggleStatus')->name('clinics.settings.visits.fields.toggle-status');
    });

    Route::controller(VisitFieldOptionController::class)->group(function () {
        Route::post('/clinic/settings/{slug}/visits/fields/{field}/options', 'store')->name('clinics.settings.visits.options.store');
        Route::put('/clinic/settings/{slug}/visits/options/{option}', 'update')->name('clinics.settings.visits.options.update');
        Route::delete('/clinic/settings/{slug}/visits/options/{option}', 'destroy')->name('clinics.settings.visits.options.destroy');
    });
});
