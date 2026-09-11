<?php

use App\Http\Controllers\CityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(CityController::class)->group(function () {
        Route::get('/admin/cities/page', 'cities_page')->name('admin.cities.index');
        Route::post('/admin/cities', 'store')->name('admin.cities.store');
        Route::put('/admin/cities/{city}', 'update')->name('admin.cities.update');
        Route::delete('/admin/cities/{city}', 'destroy')->name('admin.cities.destroy');
        Route::patch('/admin/cities/{city}/toggle-status', 'toggleStatus')->name('admin.cities.toggle-status');
    });
});
