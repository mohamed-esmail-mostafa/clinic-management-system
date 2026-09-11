<?php

use App\Http\Controllers\ClinicController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(ClinicController::class)->group(function () {
        Route::get('/admin/clinics', 'index')->name('admin.clinics.index');
        Route::get('/create/clinic/page', 'create_clinic_page')->name('admin.clinics.create');
        Route::post('/store/clinic', 'store_clinic')->name('admin.clinics.store');
        Route::put('/admin/clinics/{clinic}', 'update')->name('admin.clinics.update');
        Route::delete('/admin/clinics/{clinic}', 'destroy')->name('admin.clinics.destroy');
        Route::patch('/admin/clinics/{clinic}/toggle-status', 'toggleStatus')->name('admin.clinics.toggle-status');
        Route::post('/admin/clinics/{clinic}/users', 'addUser')->name('admin.clinics.users.store');
        Route::delete('/admin/clinics/{clinic}/users/{user}', 'removeUser')->name('admin.clinics.users.destroy');
        Route::get('/clinic/overview', 'clinic_dashboard')->name('admin.clinics.overview');
    });
});
