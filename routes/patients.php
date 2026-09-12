<?php

use App\Http\Controllers\PatientController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(PatientController::class)->group(function () {
        Route::get('/clinic/{slug}/patients', 'clinics_patients')->name('clinics.patients');
        Route::post('/clinic/{slug}/patients', 'store')->name('clinics.patients.store');
        Route::put('/clinic/{slug}/patients/{patient}', 'update')->name('clinics.patients.update');
        Route::delete('/clinic/{slug}/patients/{patient}', 'destroy')->name('clinics.patients.destroy');
        Route::patch('/clinic/{slug}/patients/{patient}/toggle-status', 'toggleStatus')->name('clinics.patients.toggle-status');
    });
});
