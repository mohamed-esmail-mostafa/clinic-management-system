<?php

use App\Http\Controllers\CountryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(CountryController::class)->group(function () {
        Route::get('/admin/countries/page', 'countries_page')->name('admin.countries.index');
        Route::post('/admin/countries', 'store')->name('admin.countries.store');
        Route::put('/admin/countries/{country}', 'update')->name('admin.countries.update');
        Route::delete('/admin/countries/{country}', 'destroy')->name('admin.countries.destroy');
        Route::patch('/admin/countries/{country}/toggle-status', 'toggleStatus')->name('admin.countries.toggle-status');
    });
});
