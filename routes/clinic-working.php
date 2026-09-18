<?php

use App\Http\Controllers\ClinicWorkingHourController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(ClinicWorkingHourController::class)->group(function () {
        Route::get('/clinic/{slug}/working/hours', 'clinic_working_hours_page')->name('clinic.working.hours.page');
        Route::post('/clinic/{slug}/working/hours', 'store')->name('clinic.working.hours.store');
        Route::put('/clinic/{slug}/working/hours/{clinicWorkingHour}', 'update')->name('clinic.working.hours.update');
        Route::delete('/clinic/{slug}/working/hours/{clinicWorkingHour}', 'destroy')->name('clinic.working.hours.destroy');
        Route::patch('/clinic/{slug}/working/hours/{clinicWorkingHour}/toggle-status', 'toggleStatus')->name('clinic.working.hours.toggle-status');
        Route::post('/clinic/{slug}/working/hours/sync', 'syncSchedule')->name('clinic.working.hours.sync');
    });
});
