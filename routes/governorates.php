<?php

use App\Http\Controllers\GovernorateController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(GovernorateController::class)->group(function () {
        Route::get('/admin/governorates/page', 'governorates_page')->name('admin.governorates.index');
        Route::post('/admin/governorates', 'store')->name('admin.governorates.store');
        Route::put('/admin/governorates/{governorate}', 'update')->name('admin.governorates.update');
        Route::delete('/admin/governorates/{governorate}', 'destroy')->name('admin.governorates.destroy');
        Route::patch('/admin/governorates/{governorate}/toggle-status', 'toggleStatus')->name('admin.governorates.toggle-status');
    });
});
