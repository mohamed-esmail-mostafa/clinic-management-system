<?php

use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(RoleController::class)->group(function () {
        Route::get('/admin/roles/page', 'index')->name('admin.roles.index');
        Route::post('/admin/roles/store', 'store')->name('admin.roles.store');
        Route::put('/admin/roles/{slug}', 'update')->name('admin.roles.update');
        Route::delete('/admin/roles/{slug}', 'destroy')->name('admin.roles.destroy');
    });
});
