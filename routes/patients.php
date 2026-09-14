<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientFieldOptionController;
use App\Http\Controllers\PatientFieldsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(PatientController::class)->group(function () {
        Route::get('/clinic/{slug}/patients', 'clinics_patients')->name('clinics.patients');
        Route::get('/clinic/{slug}/patients/create', 'create')->name('clinics.patients.create');
        Route::get('/clinic/{slug}/patients/{patient}/edit', 'edit')->name('clinics.patients.edit');
        Route::post('/clinic/{slug}/patients', 'store')->name('clinics.patients.store');
        Route::put('/clinic/{slug}/patients/{patient}', 'update')->name('clinics.patients.update');
        Route::delete('/clinic/{slug}/patients/{patient}', 'destroy')->name('clinics.patients.destroy');
        Route::patch('/clinic/{slug}/patients/{patient}/toggle-status', 'toggleStatus')->name('clinics.patients.toggle-status');
    });

    Route::controller(PatientFieldsController::class)->group(function () {
        Route::get('/clinic/settings/{slug}/patients', 'index')->name('clinics.settings.patients.index');
        Route::post('/clinic/settings/{slug}/patients/fields', 'store')->name('clinics.settings.patients.fields.store');
        Route::put('/clinic/settings/{slug}/patients/fields/{field}', 'update')->name('clinics.settings.patients.fields.update');
        Route::delete('/clinic/settings/{slug}/patients/fields/{field}', 'destroy')->name('clinics.settings.patients.fields.destroy');
        Route::patch('/clinic/settings/{slug}/patients/fields/{field}/toggle-status', 'toggleStatus')->name('clinics.settings.patients.fields.toggle-status');
    });

    Route::controller(PatientFieldOptionController::class)->group(function () {
        Route::post('/clinic/settings/{slug}/patients/fields/{field}/options', 'store')->name('clinics.settings.patients.options.store');
        Route::put('/clinic/settings/{slug}/patients/options/{option}', 'update')->name('clinics.settings.patients.options.update');
        Route::delete('/clinic/settings/{slug}/patients/options/{option}', 'destroy')->name('clinics.settings.patients.options.destroy');
    });
});
