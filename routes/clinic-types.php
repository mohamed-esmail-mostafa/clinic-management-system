<?php

use App\Http\Controllers\ClinicTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(ClinicTypeController::class)->group(function () {
        Route::get('/admin/clinic-types', 'clinic_types_page')->name('admin.clinic-types.index');
        Route::post('/admin/clinic-types', 'store')->name('admin.clinic-types.store');
        Route::put('/admin/clinic-types/{clinicType}', 'update')->name('admin.clinic-types.update');
        Route::delete('/admin/clinic-types/{clinicType}', 'destroy')->name('admin.clinic-types.destroy');
        Route::patch('/admin/clinic-types/{clinicType}/toggle-status', 'toggleStatus')->name('admin.clinic-types.toggle-status');
    });
});
