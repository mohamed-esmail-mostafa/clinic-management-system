<?php

use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(VisitController::class)->group(function () {
        Route::get('/clinic/{slug}/patients/{patient}/visits', 'patientVisits')->name('clinics.patients.visits');
        Route::post('/clinic/{slug}/patients/{patient}/visits', 'store')->name('clinics.patients.visits.store');
        Route::put('/clinic/{slug}/patients/{patient}/visits/{visit}', 'update')->name('clinics.patients.visits.update');
        Route::delete('/clinic/{slug}/patients/{patient}/visits/{visit}', 'destroy')->name('clinics.patients.visits.destroy');
        Route::post('/clinic/{clinic}/patients/{patient}/visits/{visit}/prescription-image', 'uploadPrescriptionImage')->name('visits.prescription-image');
    });
});
