<?php

use App\Http\Controllers\SpecialtyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(SpecialtyController::class)->group(function () {
        Route::get('/admin/specialties/page', 'specialties_page')->name('admin.specialties.index');
        Route::post('/admin/specialties', 'store')->name('admin.specialties.store');
        Route::put('/admin/specialties/{specialty}', 'update')->name('admin.specialties.update');
        Route::delete('/admin/specialties/{specialty}', 'destroy')->name('admin.specialties.destroy');
        Route::patch('/admin/specialties/{specialty}/toggle-status', 'toggleStatus')->name('admin.specialties.toggle-status');
    });
});
