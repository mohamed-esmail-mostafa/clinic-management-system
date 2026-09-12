<?php

use App\Http\Controllers\MedicationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(MedicationController::class)->group(function () {
        Route::get('/clinic/{slug}/medications', 'index')->name('clinics.medications');
        Route::post('/clinic/{slug}/medications', 'store')->name('clinics.medications.store');
        Route::put('/clinic/{slug}/medications/{medication}', 'update')->name('clinics.medications.update');
        Route::delete('/clinic/{slug}/medications/{medication}', 'destroy')->name('clinics.medications.destroy');
        Route::patch('/clinic/{slug}/medications/{medication}/toggle-status', 'toggleStatus')->name('clinics.medications.toggle-status');
    });
});
